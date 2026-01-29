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
    randomStakeAmount,
    toMicroSTX,
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
 * Performance metrics tracker
 */
class PerformanceMetrics {
    private startTime: number = 0;
    private successCount: number = 0;
    private failureCount: number = 0;
    private totalGasUsed: number = 0;
    private responseTimes: number[] = [];

    start(): void {
        this.startTime = Date.now();
    }

    recordSuccess(responseTime: number, gasUsed: number = 0): void {
        this.successCount++;
        this.responseTimes.push(responseTime);
        this.totalGasUsed += gasUsed;
    }

    recordFailure(): void {
        this.failureCount++;
    }

    getMetrics() {
        const duration = (Date.now() - this.startTime) / 1000;
        const avgResponseTime = this.responseTimes.length > 0
            ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
            : 0;
        const maxResponseTime = this.responseTimes.length > 0
            ? Math.max(...this.responseTimes)
            : 0;
        const minResponseTime = this.responseTimes.length > 0
            ? Math.min(...this.responseTimes)
            : 0;
        const throughput = this.successCount / duration;

        return {
            duration,
            successCount: this.successCount,
            failureCount: this.failureCount,
            totalTransactions: this.successCount + this.failureCount,
            successRate: ((this.successCount / (this.successCount + this.failureCount)) * 100).toFixed(2),
            avgResponseTime: avgResponseTime.toFixed(2),
            maxResponseTime: maxResponseTime.toFixed(2),
            minResponseTime: minResponseTime.toFixed(2),
            throughput: throughput.toFixed(2),
            totalGasUsed: this.totalGasUsed,
        };
    }

    printReport(): void {
        const metrics = this.getMetrics();

        console.log('\n' + '='.repeat(60));
        console.log('📊 STRESS TEST PERFORMANCE REPORT');
        console.log('='.repeat(60));
        console.log(`Test Duration: ${metrics.duration.toFixed(2)}s`);
        console.log(`Total Transactions: ${metrics.totalTransactions}`);
        console.log(`Successful: ${metrics.successCount} (${metrics.successRate}%)`);
        console.log(`Failed: ${metrics.failureCount}`);
        console.log(`\nResponse Times:`);
        console.log(`  Average: ${metrics.avgResponseTime}ms`);
        console.log(`  Min: ${metrics.minResponseTime}ms`);
        console.log(`  Max: ${metrics.maxResponseTime}ms`);
        console.log(`\nThroughput: ${metrics.throughput} tx/s`);
        console.log('='.repeat(60) + '\n');
    }
}

/**
 * Create a market
 */
async function createMarket(
    privateKey: string,
    question: string,
    endBlock: number,
    resolutionBlock: number
): Promise<{ txid: string; responseTime: number }> {
    const startTime = Date.now();

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
    const result = await broadcastWithRetry(transaction, network, 1, 1000); // Reduced retries for stress test

    const responseTime = Date.now() - startTime;
    return { txid: result.txid, responseTime };
}

/**
 * Place a stake
 */
async function placeStake(
    privateKey: string,
    marketId: number,
    amount: number,
    outcome: 'yes' | 'no'
): Promise<{ txid: string; responseTime: number }> {
    const startTime = Date.now();
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
    const result = await broadcastWithRetry(transaction, network, 1, 1000);

    const responseTime = Date.now() - startTime;
    return { txid: result.txid, responseTime };
}

/**
 * Main execution function
 */
async function main() {
    console.log('🚀 0xCast Stress Test Script');
    console.log('============================\n');
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
                name: 'testType',
                message: 'Select stress test type:',
                choices: [
                    { title: 'Market Creation Stress Test', value: 'markets' },
                    { title: 'Trading Stress Test', value: 'trading' },
                    { title: 'Mixed Operations', value: 'mixed' },
                ],
                initial: 0,
            },
            {
                type: 'number',
                name: 'transactionCount',
                message: 'Number of transactions to execute:',
                initial: 20,
                min: 1,
                max: 100,
            },
            {
                type: 'number',
                name: 'delayMs',
                message: 'Delay between transactions (milliseconds):',
                initial: 1000,
                min: 100,
                max: 10000,
            },
        ]);

        const { testType, transactionCount, delayMs } = response;

        // Additional config for trading test
        let marketIds: number[] = [];
        if (testType === 'trading' || testType === 'mixed') {
            const marketResponse = await prompts({
                type: 'text',
                name: 'marketIds',
                message: 'Enter market IDs for trading (comma-separated):',
                validate: value => {
                    const ids = value.split(',').map((id: string) => id.trim());
                    return ids.every((id: string) => !isNaN(parseInt(id))) || 'Please enter valid market IDs';
                }
            });
            marketIds = marketResponse.marketIds.split(',').map((id: string) => parseInt(id.trim()));
        }

        console.log(`\n⚡ Stress Test Configuration:`);
        console.log(`   Type: ${testType}`);
        console.log(`   Transactions: ${transactionCount}`);
        console.log(`   Delay: ${delayMs}ms`);
        if (marketIds.length > 0) {
            console.log(`   Target Markets: ${marketIds.join(', ')}`);
        }
        console.log('');

        // Confirm before proceeding
        const confirm = await prompts({
            type: 'confirm',
            name: 'proceed',
            message: `⚠️  This will execute ${transactionCount} transactions rapidly. Continue?`,
            initial: true,
        });

        if (!confirm.proceed) {
            console.log('❌ Operation cancelled.');
            process.exit(0);
        }

        // Get private key
        const privateKey = await getPrivateKey();

        // Initialize trackers
        const tracker = new TransactionTracker();
        const metrics = new PerformanceMetrics();

        // Calculate block heights for market creation
        const endBlock = calculateFutureBlock(currentBlock, 30);
        const resolutionBlock = calculateFutureBlock(currentBlock, 35);

        console.log(`\n⚡ Starting stress test...\n`);
        metrics.start();

        // Execute stress test
        for (let i = 0; i < transactionCount; i++) {
            try {
                let result: { txid: string; responseTime: number };
                let txType: string;

                if (testType === 'markets') {
                    // Market creation stress test
                    const question = getRandomQuestions(1)[0];
                    result = await createMarket(privateKey, question.question, endBlock, resolutionBlock);
                    txType = 'Market Creation';
                    tracker.add(txType, result.txid, { question: question.question });

                } else if (testType === 'trading') {
                    // Trading stress test
                    const marketId = marketIds[Math.floor(Math.random() * marketIds.length)];
                    const outcome = Math.random() > 0.5 ? 'yes' : 'no';
                    const amount = randomStakeAmount(0.1, 1);

                    result = await placeStake(privateKey, marketId, amount, outcome);
                    txType = `${outcome.toUpperCase()} Stake`;
                    tracker.add(txType, result.txid, {
                        marketId,
                        amount: formatSTX(amount),
                        outcome
                    });

                } else {
                    // Mixed operations
                    if (Math.random() > 0.3 && marketIds.length > 0) {
                        // 70% trading
                        const marketId = marketIds[Math.floor(Math.random() * marketIds.length)];
                        const outcome = Math.random() > 0.5 ? 'yes' : 'no';
                        const amount = randomStakeAmount(0.1, 1);

                        result = await placeStake(privateKey, marketId, amount, outcome);
                        txType = `${outcome.toUpperCase()} Stake`;
                        tracker.add(txType, result.txid, {
                            marketId,
                            amount: formatSTX(amount),
                            outcome
                        });
                    } else {
                        // 30% market creation
                        const question = getRandomQuestions(1)[0];
                        result = await createMarket(privateKey, question.question, endBlock, resolutionBlock);
                        txType = 'Market Creation';
                        tracker.add(txType, result.txid, { question: question.question });
                    }
                }

                metrics.recordSuccess(result.responseTime);

                const progress = ((i + 1) / transactionCount * 100).toFixed(1);
                console.log(`[${i + 1}/${transactionCount}] ${txType} - ${result.txid.substring(0, 10)}... (${result.responseTime}ms) [${progress}%]`);

                // Delay before next transaction (except for last one)
                if (i < transactionCount - 1) {
                    await sleep(delayMs);
                }

            } catch (error) {
                metrics.recordFailure();
                console.error(`❌ Transaction ${i + 1} failed:`, error instanceof Error ? error.message : error);
            }
        }

        // Print reports
        console.log('\n✅ Stress test completed!\n');
        metrics.printReport();
        tracker.printSummary('mainnet');

        // Export results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const metricsFilename = `stress-test-metrics-${timestamp}.json`;
        const txFilename = `stress-test-transactions-${timestamp}.json`;

        // Export metrics
        const metricsData = JSON.stringify(metrics.getMetrics(), null, 2);
        const fs = await import('fs');
        fs.writeFileSync(metricsFilename, metricsData);
        console.log(`✅ Metrics exported to ${metricsFilename}`);

        // Export transactions
        tracker.exportToJSON(txFilename);

        console.log(`\n📊 View contract activity:`);
        console.log(`https://explorer.hiro.so/address/${CONTRACT_ADDRESS}.${CONTRACT_NAME}?chain=mainnet`);

    } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run the script
main();
