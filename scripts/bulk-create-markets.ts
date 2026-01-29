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
    logTransaction,
    displayProgress,
    validateBlockHeights,
    TransactionTracker,
} from './utils/transaction-helpers.js';
import { getRandomQuestions, getCategories } from './config/market-questions.js';

// Load environment variables
dotenv.config();

// Contract details
const CONTRACT_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
const CONTRACT_NAME = 'market-core';

// Network configuration
const network = STACKS_MAINNET;

/**
 * Create a single market
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
 * Main execution function
 */
async function main() {
    console.log('🚀 0xCast Bulk Market Creation Script');
    console.log('=====================================\n');
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
                type: 'number',
                name: 'marketCount',
                message: 'How many markets do you want to create?',
                initial: 5,
                min: 1,
                max: 50,
            },
            {
                type: 'select',
                name: 'category',
                message: 'Select market category:',
                choices: [
                    { title: 'All Categories (Random)', value: 'all' },
                    ...getCategories().map(cat => ({
                        title: cat.charAt(0).toUpperCase() + cat.slice(1),
                        value: cat
                    }))
                ],
                initial: 0,
            },
            {
                type: 'number',
                name: 'daysUntilEnd',
                message: '📅 Days until markets CLOSE for trading (e.g., 30):',
                initial: 30,
                min: 1,
            },
            {
                type: 'number',
                name: 'daysUntilResolution',
                message: '⚖️  Days until markets can be RESOLVED (must be AFTER close date, e.g., 35):',
                initial: 35,
                min: 1,
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

        const { marketCount, category, daysUntilEnd, daysUntilResolution, delayBetweenTx } = response;

        // Validate that resolution is after end date
        if (daysUntilResolution <= daysUntilEnd) {
            console.log(`\n❌ Error: Resolution date (${daysUntilResolution} days) must be AFTER end date (${daysUntilEnd} days).`);
            console.log(`   Try setting resolution to ${daysUntilEnd + 5} days or more.\n`);
            process.exit(1);
        }

        // Calculate block heights
        const endBlock = calculateFutureBlock(currentBlock, daysUntilEnd);
        const resolutionBlock = calculateFutureBlock(currentBlock, daysUntilResolution);

        // Validate block heights
        const validation = validateBlockHeights(currentBlock, endBlock, resolutionBlock);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        console.log(`\n📅 Market Timeline:`);
        console.log(`   End block: ${formatBlockHeight(endBlock)} (~${daysUntilEnd} days)`);
        console.log(`   Resolution block: ${formatBlockHeight(resolutionBlock)} (~${daysUntilResolution} days)\n`);

        // Get random questions
        const questions = getRandomQuestions(
            marketCount,
            category === 'all' ? undefined : category
        );

        if (questions.length < marketCount) {
            console.log(`⚠️  Only ${questions.length} questions available for category "${category}"`);
        }

        // Confirm before proceeding
        const confirm = await prompts({
            type: 'confirm',
            name: 'proceed',
            message: `Create ${questions.length} markets with ${delayBetweenTx}s delay between each?`,
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

        console.log(`\n🏗️  Creating ${questions.length} markets...\n`);

        // Create markets
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];

            try {
                console.log(`\n[${i + 1}/${questions.length}] Creating market:`);
                console.log(`   Question: "${question.question}"`);
                console.log(`   Category: ${question.category}`);

                const txid = await createMarket(
                    privateKey,
                    question.question,
                    endBlock,
                    resolutionBlock
                );

                tracker.add('Market Creation', txid, {
                    question: question.question,
                    category: question.category,
                    marketIndex: i
                });

                logTransaction('Market creation', txid, 'mainnet');
                displayProgress(i + 1, questions.length, 'Overall Progress');

                // Delay before next transaction (except for last one)
                if (i < questions.length - 1) {
                    console.log(`⏳ Waiting ${delayBetweenTx} seconds before next transaction...`);
                    await sleep(delayBetweenTx * 1000);
                }

            } catch (error) {
                console.error(`❌ Failed to create market ${i + 1}:`, error instanceof Error ? error.message : error);
                console.log('Continuing with next market...\n');
            }
        }

        // Print summary
        tracker.printSummary('mainnet');

        // Export to JSON
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `bulk-markets-${timestamp}.json`;
        tracker.exportToJSON(filename);

        console.log('✅ Bulk market creation completed!');
        console.log(`\n📊 View contract activity:`);
        console.log(`https://explorer.hiro.so/address/${CONTRACT_ADDRESS}.${CONTRACT_NAME}?chain=mainnet`);

    } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run the script
main();
