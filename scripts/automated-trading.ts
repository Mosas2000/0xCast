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
    randomStakeAmount,
    toMicroSTX,
    logTransaction,
    displayProgress,
    TransactionTracker,
} from './utils/transaction-helpers.js';

// Load environment variables
dotenv.config();

// Contract details
const CONTRACT_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
const CONTRACT_NAME = 'market-core';

// Network configuration
const network = STACKS_MAINNET;

/**
 * Place a stake on a market
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
 * Main execution function
 */
async function main() {
    console.log('🚀 0xCast Automated Trading Script');
    console.log('===================================\n');
    console.log(`Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log(`Network: Stacks Mainnet\n`);

    try {
        // Get user input
        const response = await prompts([
            {
                type: 'text',
                name: 'marketIds',
                message: 'Enter market IDs to trade on (comma-separated, e.g., 0,1,2):',
                validate: value => {
                    const ids = value.split(',').map((id: string) => id.trim());
                    return ids.every((id: string) => !isNaN(parseInt(id))) || 'Please enter valid market IDs';
                }
            },
            {
                type: 'number',
                name: 'tradesPerMarket',
                message: 'How many trades per market?',
                initial: 5,
                min: 1,
                max: 20,
            },
            {
                type: 'select',
                name: 'stakeSize',
                message: 'Select stake size:',
                choices: [
                    { title: 'Small (0.1 - 0.5 STX)', value: 'small' },
                    { title: 'Medium (0.5 - 2 STX)', value: 'medium' },
                    { title: 'Large (2 - 10 STX)', value: 'large' },
                    { title: 'Custom', value: 'custom' },
                ],
                initial: 0,
            },
        ]);

        let { marketIds, tradesPerMarket, stakeSize } = response;

        // Parse market IDs
        const markets = marketIds.split(',').map((id: string) => parseInt(id.trim()));

        // Get custom stake range if selected
        let minStake = 0.1;
        let maxStake = 0.5;

        if (stakeSize === 'medium') {
            minStake = 0.5;
            maxStake = 2;
        } else if (stakeSize === 'large') {
            minStake = 2;
            maxStake = 10;
        } else if (stakeSize === 'custom') {
            const customResponse = await prompts([
                {
                    type: 'number',
                    name: 'minStake',
                    message: 'Minimum stake amount (STX):',
                    initial: 0.1,
                    min: 0.01,
                },
                {
                    type: 'number',
                    name: 'maxStake',
                    message: 'Maximum stake amount (STX):',
                    initial: 1,
                    min: 0.01,
                },
            ]);
            minStake = customResponse.minStake;
            maxStake = customResponse.maxStake;
        }

        const tradingResponse = await prompts([
            {
                type: 'select',
                name: 'strategy',
                message: 'Select trading strategy:',
                choices: [
                    { title: 'Random (50/50 YES/NO)', value: 'random' },
                    { title: 'Bullish (70% YES, 30% NO)', value: 'bullish' },
                    { title: 'Bearish (30% YES, 70% NO)', value: 'bearish' },
                    { title: 'Alternating (YES, NO, YES, NO...)', value: 'alternating' },
                ],
                initial: 0,
            },
            {
                type: 'number',
                name: 'delayBetweenTx',
                message: 'Delay between transactions (seconds):',
                initial: 3,
                min: 1,
                max: 30,
            },
        ]);

        const { strategy, delayBetweenTx } = tradingResponse;

        // Calculate total trades
        const totalTrades = markets.length * tradesPerMarket;

        console.log(`\n📊 Trading Configuration:`);
        console.log(`   Markets: ${markets.join(', ')}`);
        console.log(`   Trades per market: ${tradesPerMarket}`);
        console.log(`   Total trades: ${totalTrades}`);
        console.log(`   Stake range: ${minStake} - ${maxStake} STX`);
        console.log(`   Strategy: ${strategy}`);
        console.log(`   Delay: ${delayBetweenTx}s\n`);

        // Confirm before proceeding
        const confirm = await prompts({
            type: 'confirm',
            name: 'proceed',
            message: `Execute ${totalTrades} trades?`,
            initial: true,
        });

        if (!confirm.proceed) {
            console.log('❌ Operation cancelled.');
            process.exit(0);
        }

        // Get private key
        const privateKey = await getPrivateKey();

        // Create transaction tracker
        const tracker = new TransactionTracker();

        console.log(`\n💰 Starting automated trading...\n`);

        let tradeCount = 0;

        // Execute trades
        for (const marketId of markets) {
            console.log(`\n📈 Trading on Market ${marketId}:`);

            for (let i = 0; i < tradesPerMarket; i++) {
                try {
                    // Determine outcome based on strategy
                    let outcome: 'yes' | 'no';

                    if (strategy === 'random') {
                        outcome = Math.random() > 0.5 ? 'yes' : 'no';
                    } else if (strategy === 'bullish') {
                        outcome = Math.random() > 0.3 ? 'yes' : 'no';
                    } else if (strategy === 'bearish') {
                        outcome = Math.random() > 0.7 ? 'yes' : 'no';
                    } else { // alternating
                        outcome = i % 2 === 0 ? 'yes' : 'no';
                    }

                    // Generate random stake amount
                    const stakeAmount = randomStakeAmount(minStake, maxStake);

                    console.log(`\n   [${tradeCount + 1}/${totalTrades}] Placing ${outcome.toUpperCase()} stake: ${formatSTX(stakeAmount)} STX`);

                    const txid = await placeStake(privateKey, marketId, stakeAmount, outcome);

                    tracker.add(`${outcome.toUpperCase()} Stake`, txid, {
                        marketId,
                        amount: formatSTX(stakeAmount),
                        outcome
                    });

                    logTransaction(`${outcome.toUpperCase()} stake`, txid, 'mainnet', `Market: ${marketId}, Amount: ${formatSTX(stakeAmount)} STX`);

                    tradeCount++;
                    displayProgress(tradeCount, totalTrades, 'Overall Progress');

                    // Delay before next transaction (except for last one)
                    if (tradeCount < totalTrades) {
                        await sleep(delayBetweenTx * 1000);
                    }

                } catch (error) {
                    console.error(`❌ Failed to place stake:`, error instanceof Error ? error.message : error);
                    console.log('Continuing with next trade...\n');
                }
            }
        }

        // Print summary
        tracker.printSummary('mainnet');

        // Export to JSON
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `automated-trades-${timestamp}.json`;
        tracker.exportToJSON(filename);

        console.log('✅ Automated trading completed!');
        console.log(`\n📊 View contract activity:`);
        console.log(`https://explorer.hiro.so/address/${CONTRACT_ADDRESS}.${CONTRACT_NAME}?chain=mainnet`);

    } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run the script
main();
