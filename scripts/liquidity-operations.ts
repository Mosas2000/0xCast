#!/usr/bin/env tsx

import {
    makeContractCall,
    AnchorMode,
    PostConditionMode,
    uintCV,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import prompts from 'prompts';
import * as dotenv from 'dotenv';
import {
    getPrivateKey,
    broadcastWithRetry,
    sleep,
    formatSTX,
    toMicroSTX,
    logTransaction,
    displayProgress,
    TransactionTracker,
} from './utils/transaction-helpers.js';

// Load environment variables
dotenv.config();

// Contract details
const CONTRACT_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
const LIQUIDITY_CONTRACT = 'liquidity-pool';
const MARKET_CONTRACT = 'market-core';

// Network configuration
const network = STACKS_MAINNET;

/**
 * Fetch pool information from contract
 */
async function getPoolInfo(marketId: number): Promise<any> {
    try {
        const url = `https://api.mainnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS}/${LIQUIDITY_CONTRACT}/get-pool`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender: CONTRACT_ADDRESS,
                arguments: [`0x${uintCV(marketId).serialize().toString('hex')}`],
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.warn(`Could not fetch pool info for market ${marketId}`);
        return null;
    }
}

/**
 * Create a new liquidity pool
 */
async function createPool(
    privateKey: string,
    marketId: number,
    initialStx: number
): Promise<string> {
    console.log(`\n💧 Creating liquidity pool for market ${marketId}...`);
    console.log(`   Initial liquidity: ${formatSTX(initialStx)} STX`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: LIQUIDITY_CONTRACT,
        functionName: 'create-pool',
        functionArgs: [
            uintCV(marketId),
            uintCV(initialStx),
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastWithRetry(transaction, network);

    return result.txid;
}

/**
 * Add liquidity to existing pool
 */
async function addLiquidity(
    privateKey: string,
    marketId: number,
    stxAmount: number
): Promise<string> {
    console.log(`\n➕ Adding liquidity to pool ${marketId}...`);
    console.log(`   Amount: ${formatSTX(stxAmount)} STX`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: LIQUIDITY_CONTRACT,
        functionName: 'add-liquidity',
        functionArgs: [
            uintCV(marketId),
            uintCV(stxAmount),
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastWithRetry(transaction, network);

    return result.txid;
}

/**
 * Remove liquidity from pool
 */
async function removeLiquidity(
    privateKey: string,
    marketId: number,
    shares: number
): Promise<string> {
    console.log(`\n➖ Removing liquidity from pool ${marketId}...`);
    console.log(`   Shares: ${shares}`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: LIQUIDITY_CONTRACT,
        functionName: 'remove-liquidity',
        functionArgs: [
            uintCV(marketId),
            uintCV(shares),
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastWithRetry(transaction, network);

    return result.txid;
}

/**
 * Display pool analytics
 */
async function displayPoolAnalytics(marketIds: number[]) {
    console.log('\n📊 Pool Analytics');
    console.log('='.repeat(60));

    let totalTVL = 0;
    const poolData = [];

    for (const marketId of marketIds) {
        const poolInfo = await getPoolInfo(marketId);

        if (poolInfo && poolInfo.result) {
            // Parse pool data from contract response
            console.log(`\n🏊 Pool ${marketId}:`);
            console.log(`   Status: Active`);
            // Add more detailed parsing based on actual contract response structure

            poolData.push({ marketId, poolInfo });
        } else {
            console.log(`\n🏊 Pool ${marketId}: Not found or inactive`);
        }

        await sleep(500); // Rate limiting
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Total Pools Analyzed: ${poolData.length}`);
    console.log(`Total Value Locked: ${formatSTX(totalTVL)} STX`);
}

/**
 * Batch create pools
 */
async function batchCreatePools(
    privateKey: string,
    marketIds: number[],
    initialStx: number,
    delaySeconds: number
) {
    const tracker = new TransactionTracker();
    const total = marketIds.length;

    console.log(`\n💧 Creating ${total} liquidity pools...`);
    console.log(`   Initial liquidity per pool: ${formatSTX(initialStx)} STX`);
    console.log(`   Total STX required: ${formatSTX(initialStx * total)} STX\n`);

    for (let i = 0; i < total; i++) {
        const marketId = marketIds[i];

        try {
            console.log(`\n[${i + 1}/${total}] Creating pool for market ${marketId}...`);

            const txid = await createPool(privateKey, marketId, initialStx);

            tracker.add('Create Pool', txid, {
                marketId,
                initialLiquidity: formatSTX(initialStx),
            });

            logTransaction(
                'Create Pool',
                txid,
                'mainnet',
                `Market: ${marketId}, Initial: ${formatSTX(initialStx)} STX`
            );

            displayProgress(i + 1, total, 'Pool Creation Progress');

            if (i < total - 1) {
                await sleep(delaySeconds * 1000);
            }

        } catch (error) {
            console.error(`❌ Failed to create pool for market ${marketId}:`,
                error instanceof Error ? error.message : error);
            console.log('Continuing with next pool...\n');
        }
    }

    return tracker;
}

/**
 * Batch add liquidity
 */
async function batchAddLiquidity(
    privateKey: string,
    marketIds: number[],
    stxAmount: number,
    delaySeconds: number
) {
    const tracker = new TransactionTracker();
    const total = marketIds.length;

    console.log(`\n➕ Adding liquidity to ${total} pools...`);
    console.log(`   Amount per pool: ${formatSTX(stxAmount)} STX`);
    console.log(`   Total STX required: ${formatSTX(stxAmount * total)} STX\n`);

    for (let i = 0; i < total; i++) {
        const marketId = marketIds[i];

        try {
            console.log(`\n[${i + 1}/${total}] Adding liquidity to pool ${marketId}...`);

            const txid = await addLiquidity(privateKey, marketId, stxAmount);

            tracker.add('Add Liquidity', txid, {
                marketId,
                amount: formatSTX(stxAmount),
            });

            logTransaction(
                'Add Liquidity',
                txid,
                'mainnet',
                `Market: ${marketId}, Amount: ${formatSTX(stxAmount)} STX`
            );

            displayProgress(i + 1, total, 'Add Liquidity Progress');

            if (i < total - 1) {
                await sleep(delaySeconds * 1000);
            }

        } catch (error) {
            console.error(`❌ Failed to add liquidity to pool ${marketId}:`,
                error instanceof Error ? error.message : error);
            console.log('Continuing with next pool...\n');
        }
    }

    return tracker;
}

/**
 * Main execution function
 */
async function main() {
    console.log('🚀 0xCast Liquidity Pool Operations');
    console.log('===================================\n');
    console.log(`Contract: ${CONTRACT_ADDRESS}.${LIQUIDITY_CONTRACT}`);
    console.log(`Network: Stacks Mainnet\n`);

    try {
        // Select operation mode
        const modeResponse = await prompts({
            type: 'select',
            name: 'mode',
            message: 'Select operation mode:',
            choices: [
                { title: 'Create Pool', value: 'create' },
                { title: 'Add Liquidity', value: 'add' },
                { title: 'Remove Liquidity', value: 'remove' },
                { title: 'Batch Create Pools', value: 'batch-create' },
                { title: 'Batch Add Liquidity', value: 'batch-add' },
                { title: 'Pool Analytics', value: 'analytics' },
            ],
            initial: 0,
        });

        const { mode } = modeResponse;

        if (mode === 'analytics') {
            // Analytics mode - no private key needed
            const analyticsResponse = await prompts({
                type: 'text',
                name: 'marketIds',
                message: 'Enter market IDs to analyze (comma-separated):',
                validate: value => {
                    const ids = value.split(',').map((id: string) => id.trim());
                    return ids.every((id: string) => !isNaN(parseInt(id))) || 'Please enter valid market IDs';
                }
            });

            const marketIds = analyticsResponse.marketIds
                .split(',')
                .map((id: string) => parseInt(id.trim()));

            await displayPoolAnalytics(marketIds);
            return;
        }

        // Get private key for transaction modes
        const privateKey = await getPrivateKey();

        if (mode === 'create') {
            // Single pool creation
            const createResponse = await prompts([
                {
                    type: 'number',
                    name: 'marketId',
                    message: 'Enter market ID:',
                    min: 0,
                },
                {
                    type: 'number',
                    name: 'initialStx',
                    message: 'Initial liquidity (STX):',
                    initial: 10,
                    min: 1,
                },
            ]);

            const { marketId, initialStx } = createResponse;
            const initialStxMicro = toMicroSTX(initialStx);

            const txid = await createPool(privateKey, marketId, initialStxMicro);

            console.log(`\n✅ Pool creation transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);

        } else if (mode === 'add') {
            // Add liquidity to existing pool
            const addResponse = await prompts([
                {
                    type: 'number',
                    name: 'marketId',
                    message: 'Enter market ID:',
                    min: 0,
                },
                {
                    type: 'number',
                    name: 'stxAmount',
                    message: 'Amount to add (STX):',
                    initial: 5,
                    min: 0.1,
                },
            ]);

            const { marketId, stxAmount } = addResponse;
            const stxAmountMicro = toMicroSTX(stxAmount);

            const txid = await addLiquidity(privateKey, marketId, stxAmountMicro);

            console.log(`\n✅ Add liquidity transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);

        } else if (mode === 'remove') {
            // Remove liquidity from pool
            const removeResponse = await prompts([
                {
                    type: 'number',
                    name: 'marketId',
                    message: 'Enter market ID:',
                    min: 0,
                },
                {
                    type: 'number',
                    name: 'shares',
                    message: 'Number of shares to remove:',
                    initial: 1000000,
                    min: 1,
                },
            ]);

            const { marketId, shares } = removeResponse;

            const txid = await removeLiquidity(privateKey, marketId, shares);

            console.log(`\n✅ Remove liquidity transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);

        } else if (mode === 'batch-create') {
            // Batch create pools
            const batchCreateResponse = await prompts([
                {
                    type: 'text',
                    name: 'marketIds',
                    message: 'Enter market IDs (comma-separated):',
                    validate: value => {
                        const ids = value.split(',').map((id: string) => id.trim());
                        return ids.every((id: string) => !isNaN(parseInt(id))) || 'Please enter valid market IDs';
                    }
                },
                {
                    type: 'number',
                    name: 'initialStx',
                    message: 'Initial liquidity per pool (STX):',
                    initial: 10,
                    min: 1,
                },
                {
                    type: 'number',
                    name: 'delaySeconds',
                    message: 'Delay between transactions (seconds):',
                    initial: 3,
                    min: 1,
                    max: 30,
                },
            ]);

            const marketIds = batchCreateResponse.marketIds
                .split(',')
                .map((id: string) => parseInt(id.trim()));
            const initialStxMicro = toMicroSTX(batchCreateResponse.initialStx);

            const tracker = await batchCreatePools(
                privateKey,
                marketIds,
                initialStxMicro,
                batchCreateResponse.delaySeconds
            );

            tracker.printSummary('mainnet');

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `liquidity-pools-${timestamp}.json`;
            tracker.exportToJSON(filename);

        } else if (mode === 'batch-add') {
            // Batch add liquidity
            const batchAddResponse = await prompts([
                {
                    type: 'text',
                    name: 'marketIds',
                    message: 'Enter market IDs (comma-separated):',
                    validate: value => {
                        const ids = value.split(',').map((id: string) => id.trim());
                        return ids.every((id: string) => !isNaN(parseInt(id))) || 'Please enter valid market IDs';
                    }
                },
                {
                    type: 'number',
                    name: 'stxAmount',
                    message: 'Amount per pool (STX):',
                    initial: 5,
                    min: 0.1,
                },
                {
                    type: 'number',
                    name: 'delaySeconds',
                    message: 'Delay between transactions (seconds):',
                    initial: 3,
                    min: 1,
                    max: 30,
                },
            ]);

            const marketIds = batchAddResponse.marketIds
                .split(',')
                .map((id: string) => parseInt(id.trim()));
            const stxAmountMicro = toMicroSTX(batchAddResponse.stxAmount);

            const tracker = await batchAddLiquidity(
                privateKey,
                marketIds,
                stxAmountMicro,
                batchAddResponse.delaySeconds
            );

            tracker.printSummary('mainnet');

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `add-liquidity-${timestamp}.json`;
            tracker.exportToJSON(filename);
        }

        console.log('\n✅ Liquidity operations completed!');
        console.log(`\n📊 View contract activity:`);
        console.log(`https://explorer.hiro.so/address/${CONTRACT_ADDRESS}.${LIQUIDITY_CONTRACT}?chain=mainnet`);

    } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run the script
main();
