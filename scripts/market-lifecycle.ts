#!/usr/bin/env tsx

import {
    makeContractCall,
    AnchorMode,
    PostConditionMode,
    stringAsciiCV,
    uintCV,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import prompts from 'prompts';
import * as dotenv from 'dotenv';
import {
    getPrivateKey,
    getCurrentBlockHeight,
    broadcastWithRetry,
    sleep,
    calculateFutureBlock,
    formatBlockHeight,
    formatSTX,
    toMicroSTX,
    logTransaction,
    validateBlockHeights,
    TransactionTracker,
} from './utils/transaction-helpers.js';
import { getRandomQuestions } from './config/market-questions.js';

// Load environment variables
dotenv.config();

// Contract details
const CONTRACT_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
const CONTRACT_NAME = 'market-core';

// Network configuration
const network = STACKS_MAINNET;

/**
 * Create a market
 */
async function createMarket(
    privateKey: string,
    question: string,
    endBlock: number,
    resolutionBlock: number
): Promise<string> {
    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-market',
        functionArgs: [
            stringAsciiCV(question),
            uintCV(endBlock),
            uintCV(resolutionBlock),
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
 * Place a stake
 */
async function placeStake(
    privateKey: string,
    marketId: number,
    amount: number,
    outcome: 'yes' | 'no'
): Promise<string> {
    const functionName = outcome === 'yes' ? 'place-yes-stake' : 'place-no-stake';

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName,
        functionArgs: [
            uintCV(marketId),
            uintCV(amount),
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
 * Resolve a market
 */
async function resolveMarket(
    privateKey: string,
    marketId: number,
    outcome: 'yes' | 'no'
): Promise<string> {
    const outcomeValue = outcome === 'yes' ? 1 : 2; // OUTCOME-YES = 1, OUTCOME-NO = 2

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'resolve-market',
        functionArgs: [
            uintCV(marketId),
            uintCV(outcomeValue),
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
 * Claim winnings
 */
async function claimWinnings(
    privateKey: string,
    marketId: number
): Promise<string> {
    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'claim-winnings',
        functionArgs: [
            uintCV(marketId),
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
 * Main execution function
 */
async function main() {
    console.log('🚀 0xCast Market Lifecycle Script');
    console.log('==================================\n');
    console.log(`Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log(`Network: Stacks Mainnet\n`);

    try {
        // Get current block height
        console.log('⏱️  Fetching current block height...');
        const currentBlock = await getCurrentBlockHeight('mainnet');
        console.log(`Current Stacks block: ${formatBlockHeight(currentBlock)}\n`);

        // Get user input
        const response = await prompts([
            {
                type: 'select',
                name: 'mode',
                message: 'Select lifecycle mode:',
                choices: [
                    { title: 'Full Lifecycle (Create → Trade → Resolve → Claim)', value: 'full' },
                    { title: 'Trade on Existing Market', value: 'trade' },
                    { title: 'Resolve Existing Market', value: 'resolve' },
                    { title: 'Claim Winnings', value: 'claim' },
                ],
                initial: 0,
            },
        ]);

        const { mode } = response;

        // Get private key
        const privateKey = await getPrivateKey();

        // Create transaction tracker
        const tracker = new TransactionTracker();

        if (mode === 'full') {
            // Full lifecycle demonstration
            console.log('\n🔄 Starting full market lifecycle...\n');

            // Step 1: Create market
            const marketQuestion = getRandomQuestions(1)[0];
            const endBlock = calculateFutureBlock(currentBlock, 7); // 7 days
            const resolutionBlock = calculateFutureBlock(currentBlock, 10); // 10 days

            const validation = validateBlockHeights(currentBlock, endBlock, resolutionBlock);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            console.log('📊 Step 1: Creating Market');
            console.log(`   Question: "${marketQuestion.question}"`);
            console.log(`   End block: ${formatBlockHeight(endBlock)}`);
            console.log(`   Resolution block: ${formatBlockHeight(resolutionBlock)}\n`);

            const createTxid = await createMarket(privateKey, marketQuestion.question, endBlock, resolutionBlock);
            tracker.add('Market Creation', createTxid, { question: marketQuestion.question });
            logTransaction('Market creation', createTxid, 'mainnet');

            // Get market ID from user
            const marketIdResponse = await prompts({
                type: 'number',
                name: 'marketId',
                message: 'Enter the created market ID (check Explorer):',
                initial: 0,
            });

            const marketId = marketIdResponse.marketId;

            // Step 2: Place multiple stakes
            console.log('\n💰 Step 2: Placing Stakes');

            const stakes = [
                { outcome: 'yes' as const, amount: toMicroSTX(1) },
                { outcome: 'no' as const, amount: toMicroSTX(0.5) },
                { outcome: 'yes' as const, amount: toMicroSTX(0.75) },
                { outcome: 'no' as const, amount: toMicroSTX(0.3) },
            ];

            for (let i = 0; i < stakes.length; i++) {
                const stake = stakes[i];
                console.log(`\n   [${i + 1}/${stakes.length}] Placing ${stake.outcome.toUpperCase()} stake: ${formatSTX(stake.amount)} STX`);

                const stakeTxid = await placeStake(privateKey, marketId, stake.amount, stake.outcome);
                tracker.add(`${stake.outcome.toUpperCase()} Stake`, stakeTxid, {
                    marketId,
                    amount: formatSTX(stake.amount)
                });
                logTransaction(`${stake.outcome.toUpperCase()} stake`, stakeTxid, 'mainnet');

                if (i < stakes.length - 1) {
                    await sleep(3000);
                }
            }

            // Step 3: Resolve market (simulated - would normally wait for resolution date)
            console.log('\n⚖️  Step 3: Resolving Market');
            console.log('   ⚠️  Note: In production, you would wait until the resolution block height is reached.');

            const resolveConfirm = await prompts({
                type: 'confirm',
                name: 'proceed',
                message: 'Do you want to resolve the market now? (Only works if resolution date has passed)',
                initial: false,
            });

            if (resolveConfirm.proceed) {
                const outcomeResponse = await prompts({
                    type: 'select',
                    name: 'outcome',
                    message: 'Select the winning outcome:',
                    choices: [
                        { title: 'YES', value: 'yes' },
                        { title: 'NO', value: 'no' },
                    ],
                });

                const resolveTxid = await resolveMarket(privateKey, marketId, outcomeResponse.outcome);
                tracker.add('Market Resolution', resolveTxid, {
                    marketId,
                    outcome: outcomeResponse.outcome
                });
                logTransaction('Market resolution', resolveTxid, 'mainnet');

                // Step 4: Claim winnings
                console.log('\n🎉 Step 4: Claiming Winnings');
                await sleep(3000);

                const claimTxid = await claimWinnings(privateKey, marketId);
                tracker.add('Claim Winnings', claimTxid, { marketId });
                logTransaction('Claim winnings', claimTxid, 'mainnet');
            }

        } else if (mode === 'trade') {
            // Trade on existing market
            const tradeResponse = await prompts([
                {
                    type: 'number',
                    name: 'marketId',
                    message: 'Enter market ID to trade on:',
                },
                {
                    type: 'number',
                    name: 'tradeCount',
                    message: 'How many trades to place?',
                    initial: 3,
                    min: 1,
                },
            ]);

            console.log(`\n💰 Placing ${tradeResponse.tradeCount} trades on market ${tradeResponse.marketId}...\n`);

            for (let i = 0; i < tradeResponse.tradeCount; i++) {
                const outcome = Math.random() > 0.5 ? 'yes' : 'no';
                const amount = toMicroSTX(Math.random() * 2 + 0.1);

                console.log(`[${i + 1}/${tradeResponse.tradeCount}] Placing ${outcome.toUpperCase()} stake: ${formatSTX(amount)} STX`);

                const txid = await placeStake(privateKey, tradeResponse.marketId, amount, outcome);
                tracker.add(`${outcome.toUpperCase()} Stake`, txid, {
                    marketId: tradeResponse.marketId,
                    amount: formatSTX(amount)
                });
                logTransaction(`${outcome.toUpperCase()} stake`, txid, 'mainnet');

                if (i < tradeResponse.tradeCount - 1) {
                    await sleep(3000);
                }
            }

        } else if (mode === 'resolve') {
            // Resolve existing market
            const resolveResponse = await prompts([
                {
                    type: 'number',
                    name: 'marketId',
                    message: 'Enter market ID to resolve:',
                },
                {
                    type: 'select',
                    name: 'outcome',
                    message: 'Select the winning outcome:',
                    choices: [
                        { title: 'YES', value: 'yes' },
                        { title: 'NO', value: 'no' },
                    ],
                },
            ]);

            console.log(`\n⚖️  Resolving market ${resolveResponse.marketId} with outcome: ${resolveResponse.outcome.toUpperCase()}\n`);

            const txid = await resolveMarket(privateKey, resolveResponse.marketId, resolveResponse.outcome);
            tracker.add('Market Resolution', txid, {
                marketId: resolveResponse.marketId,
                outcome: resolveResponse.outcome
            });
            logTransaction('Market resolution', txid, 'mainnet');

        } else if (mode === 'claim') {
            // Claim winnings
            const claimResponse = await prompts({
                type: 'number',
                name: 'marketId',
                message: 'Enter market ID to claim winnings from:',
            });

            console.log(`\n🎉 Claiming winnings from market ${claimResponse.marketId}...\n`);

            const txid = await claimWinnings(privateKey, claimResponse.marketId);
            tracker.add('Claim Winnings', txid, { marketId: claimResponse.marketId });
            logTransaction('Claim winnings', txid, 'mainnet');
        }

        // Print summary
        tracker.printSummary('mainnet');

        // Export to JSON
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `lifecycle-${mode}-${timestamp}.json`;
        tracker.exportToJSON(filename);

        console.log('✅ Market lifecycle operations completed!');
        console.log(`\n📊 View contract activity:`);
        console.log(`https://explorer.hiro.so/address/${CONTRACT_ADDRESS}.${CONTRACT_NAME}?chain=mainnet`);

    } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run the script
main();
