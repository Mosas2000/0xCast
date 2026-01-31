#!/usr/bin/env tsx

import {
    makeContractCall,
    AnchorMode,
    PostConditionMode,
    uintCV,
    stringAsciiCV,
    listCV,
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
const MULTI_MARKET_CONTRACT = 'market-multi';

// Network configuration
const network = STACKS_MAINNET;

/**
 * Get current block height
 */
async function getCurrentBlockHeight(): Promise<number> {
    try {
        const response = await fetch('https://api.mainnet.hiro.so/v2/info');
        const data = await response.json();
        return data.stacks_tip_height;
    } catch (error) {
        console.warn('Could not fetch current block height');
        return 6040000; // Fallback
    }
}

/**
 * Create a multi-outcome market
 */
async function createMultiMarket(
    privateKey: string,
    question: string,
    outcomes: string[],
    endBlock: number,
    resolutionBlock: number
): Promise<string> {
    console.log(`\n📊 Creating multi-outcome market...`);
    console.log(`   Question: "${question}"`);
    console.log(`   Outcomes: ${outcomes.join(', ')}`);
    console.log(`   End block: ${endBlock}`);
    console.log(`   Resolution block: ${resolutionBlock}`);

    // Convert outcomes to Clarity list
    const outcomeCVs = outcomes.map(o => stringAsciiCV(o));

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: MULTI_MARKET_CONTRACT,
        functionName: 'create-market',
        functionArgs: [
            stringAsciiCV(question),
            listCV(outcomeCVs),
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
 * Place stake on specific outcome
 */
async function placeStake(
    privateKey: string,
    marketId: number,
    outcomeIndex: number,
    amount: number
): Promise<string> {
    console.log(`\n💰 Placing stake on outcome ${outcomeIndex}...`);
    console.log(`   Market: ${marketId}`);
    console.log(`   Amount: ${formatSTX(amount)} STX`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: MULTI_MARKET_CONTRACT,
        functionName: 'place-stake',
        functionArgs: [
            uintCV(marketId),
            uintCV(outcomeIndex),
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
 * Automated trading across all outcomes
 */
async function automatedTrading(
    privateKey: string,
    marketId: number,
    numOutcomes: number,
    tradesPerOutcome: number,
    strategy: 'uniform' | 'weighted' | 'favorites' | 'random',
    minStake: number,
    maxStake: number,
    delaySeconds: number
) {
    const tracker = new TransactionTracker();
    const totalTrades = numOutcomes * tradesPerOutcome;

    console.log(`\n🎲 Starting automated trading...`);
    console.log(`   Market: ${marketId}`);
    console.log(`   Outcomes: ${numOutcomes}`);
    console.log(`   Trades per outcome: ${tradesPerOutcome}`);
    console.log(`   Strategy: ${strategy}`);
    console.log(`   Total trades: ${totalTrades}\n`);

    let tradeCount = 0;

    for (let outcomeIndex = 0; outcomeIndex < numOutcomes; outcomeIndex++) {
        console.log(`\n📈 Trading on Outcome ${outcomeIndex}:`);

        for (let i = 0; i < tradesPerOutcome; i++) {
            try {
                let stakeAmount: number;

                if (strategy === 'uniform') {
                    // Equal stakes
                    stakeAmount = toMicroSTX((minStake + maxStake) / 2);
                } else if (strategy === 'weighted') {
                    // Higher stakes on lower outcome indices
                    const weight = 1 - (outcomeIndex / numOutcomes);
                    stakeAmount = toMicroSTX(minStake + (maxStake - minStake) * weight);
                } else if (strategy === 'favorites') {
                    // Higher stakes on first 2 outcomes
                    stakeAmount = outcomeIndex < 2
                        ? toMicroSTX(maxStake)
                        : toMicroSTX(minStake);
                } else { // random
                    stakeAmount = randomStakeAmount(minStake, maxStake);
                }

                console.log(`\n   [${tradeCount + 1}/${totalTrades}] Placing stake: ${formatSTX(stakeAmount)} STX`);

                const txid = await placeStake(privateKey, marketId, outcomeIndex, stakeAmount);

                tracker.add(`Stake on Outcome ${outcomeIndex}`, txid, {
                    marketId,
                    outcomeIndex,
                    amount: formatSTX(stakeAmount),
                });

                logTransaction(
                    `Stake on Outcome ${outcomeIndex}`,
                    txid,
                    'mainnet',
                    `Market: ${marketId}, Amount: ${formatSTX(stakeAmount)} STX`
                );

                tradeCount++;
                displayProgress(tradeCount, totalTrades, 'Overall Progress');

                if (tradeCount < totalTrades) {
                    await sleep(delaySeconds * 1000);
                }

            } catch (error) {
                console.error(`❌ Failed to place stake:`, error instanceof Error ? error.message : error);
                console.log('Continuing with next trade...\n');
            }
        }
    }

    return tracker;
}

/**
 * Market templates for common multi-outcome scenarios
 */
const MARKET_TEMPLATES = {
    'sports-4team': {
        question: 'Which team will win the championship?',
        outcomes: ['Team A', 'Team B', 'Team C', 'Team D'],
    },
    'price-ranges': {
        question: 'What price range will BTC be at end of month?',
        outcomes: ['< $50k', '$50k-$75k', '$75k-$100k', '> $100k'],
    },
    'ranking-top3': {
        question: 'Which project will rank #1 by TVL?',
        outcomes: ['Project A', 'Project B', 'Project C', 'Other'],
    },
    'election-5way': {
        question: 'Who will win the election?',
        outcomes: ['Candidate A', 'Candidate B', 'Candidate C', 'Candidate D', 'Candidate E'],
    },
    'quarter-results': {
        question: 'What will be the quarterly revenue range?',
        outcomes: ['< $1M', '$1M-$5M', '$5M-$10M', '$10M-$20M', '> $20M'],
    },
};

/**
 * Main execution function
 */
async function main() {
    console.log('🚀 0xCast Multi-Outcome Market Trading');
    console.log('======================================\n');
    console.log(`Contract: ${CONTRACT_ADDRESS}.${MULTI_MARKET_CONTRACT}`);
    console.log(`Network: Stacks Mainnet\n`);

    try {
        // Select operation mode
        const modeResponse = await prompts({
            type: 'select',
            name: 'mode',
            message: 'Select operation mode:',
            choices: [
                { title: 'Create Multi-Outcome Market', value: 'create' },
                { title: 'Place Single Stake', value: 'stake' },
                { title: 'Automated Trading', value: 'auto-trade' },
                { title: 'Create from Template', value: 'template' },
            ],
            initial: 0,
        });

        const { mode } = modeResponse;

        // Get private key
        const privateKey = await getPrivateKey();

        if (mode === 'create') {
            // Create custom multi-outcome market
            const createResponse = await prompts([
                {
                    type: 'text',
                    name: 'question',
                    message: 'Market question (max 256 chars):',
                    validate: value => value.length > 0 && value.length <= 256 || 'Question must be 1-256 characters',
                },
                {
                    type: 'number',
                    name: 'numOutcomes',
                    message: 'Number of outcomes:',
                    initial: 3,
                    min: 3,
                    max: 10,
                },
            ]);

            const { question, numOutcomes } = createResponse;

            // Get outcome names
            const outcomes: string[] = [];
            for (let i = 0; i < numOutcomes; i++) {
                const outcomeResponse = await prompts({
                    type: 'text',
                    name: 'outcome',
                    message: `Outcome ${i + 1} name (max 50 chars):`,
                    validate: value => value.length > 0 && value.length <= 50 || 'Outcome must be 1-50 characters',
                });
                outcomes.push(outcomeResponse.outcome);
            }

            const timingResponse = await prompts([
                {
                    type: 'number',
                    name: 'daysUntilEnd',
                    message: 'Days until market closes:',
                    initial: 30,
                    min: 1,
                },
                {
                    type: 'number',
                    name: 'daysUntilResolution',
                    message: 'Days until resolution:',
                    initial: 35,
                    min: 2,
                },
            ]);

            const currentBlock = await getCurrentBlockHeight();
            const endBlock = currentBlock + (timingResponse.daysUntilEnd * 144);
            const resolutionBlock = currentBlock + (timingResponse.daysUntilResolution * 144);

            const txid = await createMultiMarket(privateKey, question, outcomes, endBlock, resolutionBlock);

            console.log(`\n✅ Multi-outcome market creation transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);

        } else if (mode === 'template') {
            // Create from template
            const templateResponse = await prompts([
                {
                    type: 'select',
                    name: 'template',
                    message: 'Select market template:',
                    choices: [
                        { title: 'Sports - 4 Teams', value: 'sports-4team' },
                        { title: 'BTC Price Ranges', value: 'price-ranges' },
                        { title: 'Project Rankings', value: 'ranking-top3' },
                        { title: 'Election - 5 Candidates', value: 'election-5way' },
                        { title: 'Quarterly Revenue', value: 'quarter-results' },
                    ],
                },
                {
                    type: 'number',
                    name: 'daysUntilEnd',
                    message: 'Days until market closes:',
                    initial: 30,
                    min: 1,
                },
                {
                    type: 'number',
                    name: 'daysUntilResolution',
                    message: 'Days until resolution:',
                    initial: 35,
                    min: 2,
                },
            ]);

            const template = MARKET_TEMPLATES[templateResponse.template as keyof typeof MARKET_TEMPLATES];
            const currentBlock = await getCurrentBlockHeight();
            const endBlock = currentBlock + (templateResponse.daysUntilEnd * 144);
            const resolutionBlock = currentBlock + (templateResponse.daysUntilResolution * 144);

            const txid = await createMultiMarket(
                privateKey,
                template.question,
                template.outcomes,
                endBlock,
                resolutionBlock
            );

            console.log(`\n✅ Multi-outcome market creation transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);

        } else if (mode === 'stake') {
            // Place single stake
            const stakeResponse = await prompts([
                {
                    type: 'number',
                    name: 'marketId',
                    message: 'Enter market ID:',
                    min: 0,
                },
                {
                    type: 'number',
                    name: 'outcomeIndex',
                    message: 'Enter outcome index (0-based):',
                    min: 0,
                    max: 9,
                },
                {
                    type: 'number',
                    name: 'stxAmount',
                    message: 'Stake amount (STX):',
                    initial: 1,
                    min: 0.1,
                },
            ]);

            const { marketId, outcomeIndex, stxAmount } = stakeResponse;
            const stxAmountMicro = toMicroSTX(stxAmount);

            const txid = await placeStake(privateKey, marketId, outcomeIndex, stxAmountMicro);

            console.log(`\n✅ Stake transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);

        } else if (mode === 'auto-trade') {
            // Automated trading
            const autoResponse = await prompts([
                {
                    type: 'number',
                    name: 'marketId',
                    message: 'Enter market ID:',
                    min: 0,
                },
                {
                    type: 'number',
                    name: 'numOutcomes',
                    message: 'Number of outcomes in market:',
                    initial: 3,
                    min: 3,
                    max: 10,
                },
                {
                    type: 'number',
                    name: 'tradesPerOutcome',
                    message: 'Trades per outcome:',
                    initial: 3,
                    min: 1,
                    max: 10,
                },
                {
                    type: 'select',
                    name: 'strategy',
                    message: 'Trading strategy:',
                    choices: [
                        { title: 'Uniform (equal stakes)', value: 'uniform' },
                        { title: 'Weighted (higher on lower indices)', value: 'weighted' },
                        { title: 'Favorites (higher on first 2)', value: 'favorites' },
                        { title: 'Random', value: 'random' },
                    ],
                },
                {
                    type: 'number',
                    name: 'minStake',
                    message: 'Minimum stake (STX):',
                    initial: 0.5,
                    min: 0.1,
                },
                {
                    type: 'number',
                    name: 'maxStake',
                    message: 'Maximum stake (STX):',
                    initial: 2,
                    min: 0.1,
                },
                {
                    type: 'number',
                    name: 'delaySeconds',
                    message: 'Delay between trades (seconds):',
                    initial: 3,
                    min: 1,
                    max: 30,
                },
            ]);

            const tracker = await automatedTrading(
                privateKey,
                autoResponse.marketId,
                autoResponse.numOutcomes,
                autoResponse.tradesPerOutcome,
                autoResponse.strategy,
                autoResponse.minStake,
                autoResponse.maxStake,
                autoResponse.delaySeconds
            );

            tracker.printSummary('mainnet');

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `multi-outcome-trades-${timestamp}.json`;
            tracker.exportToJSON(filename);
        }

        console.log('\n✅ Multi-outcome market operations completed!');
        console.log(`\n📊 View contract activity:`);
        console.log(`https://explorer.hiro.so/address/${CONTRACT_ADDRESS}.${MULTI_MARKET_CONTRACT}?chain=mainnet`);

    } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run the script
main();
