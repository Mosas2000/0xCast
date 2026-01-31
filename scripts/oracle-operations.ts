#!/usr/bin/env tsx

import {
    makeContractCall,
    AnchorMode,
    PostConditionMode,
    uintCV,
    stringAsciiCV,
    bufferCV,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import prompts from 'prompts';
import * as dotenv from 'dotenv';
import {
    getPrivateKey,
    broadcastWithRetry,
    sleep,
    logTransaction,
    displayProgress,
    TransactionTracker,
} from './utils/transaction-helpers.js';

// Load environment variables
dotenv.config();

// Contract details
const CONTRACT_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
const ORACLE_CONTRACT = 'oracle-integration';
const MARKET_CONTRACT = 'market-core';

// Network configuration
const network = STACKS_MAINNET;

/**
 * Submit price feed to oracle
 */
async function submitPriceFeed(
    privateKey: string,
    symbol: string,
    price: number,
    timestamp: number
): Promise<string> {
    console.log(`\n📡 Submitting price feed...`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Price: $${price.toFixed(2)}`);
    console.log(`   Timestamp: ${new Date(timestamp * 1000).toISOString()}`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: ORACLE_CONTRACT,
        functionName: 'submit-price',
        functionArgs: [
            stringAsciiCV(symbol),
            uintCV(Math.floor(price * 100)), // Price in cents
            uintCV(timestamp),
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
 * Submit event outcome to oracle
 */
async function submitEventOutcome(
    privateKey: string,
    eventId: string,
    outcome: boolean,
    timestamp: number
): Promise<string> {
    console.log(`\n📡 Submitting event outcome...`);
    console.log(`   Event ID: ${eventId}`);
    console.log(`   Outcome: ${outcome ? 'TRUE' : 'FALSE'}`);
    console.log(`   Timestamp: ${new Date(timestamp * 1000).toISOString()}`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: ORACLE_CONTRACT,
        functionName: 'submit-event',
        functionArgs: [
            stringAsciiCV(eventId),
            uintCV(outcome ? 1 : 0),
            uintCV(timestamp),
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
 * Verify oracle data
 */
async function verifyOracleData(
    privateKey: string,
    dataId: string,
    isValid: boolean
): Promise<string> {
    console.log(`\n✅ Verifying oracle data...`);
    console.log(`   Data ID: ${dataId}`);
    console.log(`   Valid: ${isValid ? 'YES' : 'NO'}`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: ORACLE_CONTRACT,
        functionName: 'verify-data',
        functionArgs: [
            stringAsciiCV(dataId),
            uintCV(isValid ? 1 : 0),
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
 * Batch submit price feeds
 */
async function batchSubmitPrices(
    privateKey: string,
    symbols: string[],
    priceGenerator: (symbol: string) => number,
    delaySeconds: number
) {
    const tracker = new TransactionTracker();
    const total = symbols.length;
    const timestamp = Math.floor(Date.now() / 1000);

    console.log(`\n📡 Batch submitting ${total} price feeds...`);
    console.log(`   Symbols: ${symbols.join(', ')}\n`);

    for (let i = 0; i < total; i++) {
        const symbol = symbols[i];

        try {
            const price = priceGenerator(symbol);

            console.log(`\n[${i + 1}/${total}] Submitting ${symbol} price: $${price.toFixed(2)}...`);

            const txid = await submitPriceFeed(privateKey, symbol, price, timestamp);

            tracker.add(`Price Feed: ${symbol}`, txid, {
                symbol,
                price: `$${price.toFixed(2)}`,
                timestamp: new Date(timestamp * 1000).toISOString(),
            });

            logTransaction(
                `Oracle Price Feed`,
                txid,
                'mainnet',
                `Symbol: ${symbol}, Price: $${price.toFixed(2)}`
            );

            displayProgress(i + 1, total, 'Price Feed Progress');

            if (i < total - 1) {
                await sleep(delaySeconds * 1000);
            }

        } catch (error) {
            console.error(`❌ Failed to submit price for ${symbol}:`,
                error instanceof Error ? error.message : error);
            console.log('Continuing with next price feed...\n');
        }
    }

    return tracker;
}

/**
 * Mock price generators for testing
 */
const MOCK_PRICES: Record<string, () => number> = {
    'BTC': () => 50000 + Math.random() * 10000,
    'ETH': () => 2500 + Math.random() * 500,
    'STX': () => 1 + Math.random() * 2,
    'SOL': () => 100 + Math.random() * 50,
    'AVAX': () => 30 + Math.random() * 10,
    'MATIC': () => 0.8 + Math.random() * 0.4,
    'LINK': () => 15 + Math.random() * 5,
    'UNI': () => 8 + Math.random() * 3,
    'AAVE': () => 200 + Math.random() * 50,
    'CRV': () => 2 + Math.random() * 1,
};

/**
 * Event outcome templates
 */
const EVENT_TEMPLATES = {
    'btc-50k': {
        eventId: 'BTC-ABOVE-50K',
        description: 'Bitcoin price above $50,000',
        checkOutcome: () => MOCK_PRICES['BTC']() > 50000,
    },
    'eth-3k': {
        eventId: 'ETH-ABOVE-3K',
        description: 'Ethereum price above $3,000',
        checkOutcome: () => MOCK_PRICES['ETH']() > 3000,
    },
    'stx-2': {
        eventId: 'STX-ABOVE-2',
        description: 'STX price above $2',
        checkOutcome: () => MOCK_PRICES['STX']() > 2,
    },
    'market-up': {
        eventId: 'MARKET-UP-TODAY',
        description: 'Crypto market up today',
        checkOutcome: () => Math.random() > 0.5,
    },
    'volume-high': {
        eventId: 'VOLUME-HIGH',
        description: 'Trading volume above average',
        checkOutcome: () => Math.random() > 0.4,
    },
};

/**
 * Main execution function
 */
async function main() {
    console.log('🚀 0xCast Oracle Operations');
    console.log('============================\n');
    console.log(`Contract: ${CONTRACT_ADDRESS}.${ORACLE_CONTRACT}`);
    console.log(`Network: Stacks Mainnet\n`);

    try {
        // Select operation mode
        const modeResponse = await prompts({
            type: 'select',
            name: 'mode',
            message: 'Select operation mode:',
            choices: [
                { title: 'Submit Price Feed', value: 'price' },
                { title: 'Submit Event Outcome', value: 'event' },
                { title: 'Verify Oracle Data', value: 'verify' },
                { title: 'Batch Submit Prices', value: 'batch-price' },
                { title: 'Batch Submit Events', value: 'batch-event' },
                { title: 'Mock Data Generator', value: 'mock' },
            ],
            initial: 0,
        });

        const { mode } = modeResponse;

        // Get private key
        const privateKey = await getPrivateKey();

        if (mode === 'price') {
            // Submit single price feed
            const priceResponse = await prompts([
                {
                    type: 'text',
                    name: 'symbol',
                    message: 'Asset symbol (e.g., BTC, ETH, STX):',
                    validate: value => value.length > 0 && value.length <= 10 || 'Symbol must be 1-10 characters',
                },
                {
                    type: 'number',
                    name: 'price',
                    message: 'Price (USD):',
                    initial: 100,
                    min: 0.01,
                },
            ]);

            const { symbol, price } = priceResponse;
            const timestamp = Math.floor(Date.now() / 1000);

            const txid = await submitPriceFeed(privateKey, symbol.toUpperCase(), price, timestamp);

            console.log(`\n✅ Price feed submission transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);

        } else if (mode === 'event') {
            // Submit event outcome
            const eventResponse = await prompts([
                {
                    type: 'text',
                    name: 'eventId',
                    message: 'Event ID (max 50 chars):',
                    validate: value => value.length > 0 && value.length <= 50 || 'Event ID must be 1-50 characters',
                },
                {
                    type: 'select',
                    name: 'outcome',
                    message: 'Event outcome:',
                    choices: [
                        { title: 'TRUE', value: true },
                        { title: 'FALSE', value: false },
                    ],
                },
            ]);

            const { eventId, outcome } = eventResponse;
            const timestamp = Math.floor(Date.now() / 1000);

            const txid = await submitEventOutcome(privateKey, eventId, outcome, timestamp);

            console.log(`\n✅ Event outcome submission transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);

        } else if (mode === 'verify') {
            // Verify oracle data
            const verifyResponse = await prompts([
                {
                    type: 'text',
                    name: 'dataId',
                    message: 'Data ID to verify:',
                },
                {
                    type: 'select',
                    name: 'isValid',
                    message: 'Is data valid?',
                    choices: [
                        { title: 'YES', value: true },
                        { title: 'NO', value: false },
                    ],
                },
            ]);

            const { dataId, isValid } = verifyResponse;

            const txid = await verifyOracleData(privateKey, dataId, isValid);

            console.log(`\n✅ Data verification transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);

        } else if (mode === 'batch-price') {
            // Batch submit prices
            const batchResponse = await prompts([
                {
                    type: 'multiselect',
                    name: 'symbols',
                    message: 'Select symbols to submit (space to select):',
                    choices: Object.keys(MOCK_PRICES).map(s => ({ title: s, value: s })),
                    min: 1,
                },
                {
                    type: 'number',
                    name: 'delaySeconds',
                    message: 'Delay between submissions (seconds):',
                    initial: 3,
                    min: 1,
                    max: 30,
                },
            ]);

            const tracker = await batchSubmitPrices(
                privateKey,
                batchResponse.symbols,
                (symbol) => MOCK_PRICES[symbol](),
                batchResponse.delaySeconds
            );

            tracker.printSummary('mainnet');

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `oracle-prices-${timestamp}.json`;
            tracker.exportToJSON(filename);

        } else if (mode === 'batch-event') {
            // Batch submit events
            const eventBatchResponse = await prompts([
                {
                    type: 'multiselect',
                    name: 'events',
                    message: 'Select events to submit (space to select):',
                    choices: Object.entries(EVENT_TEMPLATES).map(([key, val]) => ({
                        title: val.description,
                        value: key,
                    })),
                    min: 1,
                },
                {
                    type: 'number',
                    name: 'delaySeconds',
                    message: 'Delay between submissions (seconds):',
                    initial: 3,
                    min: 1,
                    max: 30,
                },
            ]);

            const tracker = new TransactionTracker();
            const events = eventBatchResponse.events;
            const total = events.length;
            const timestamp = Math.floor(Date.now() / 1000);

            console.log(`\n📡 Batch submitting ${total} event outcomes...\n`);

            for (let i = 0; i < total; i++) {
                const eventKey = events[i];
                const template = EVENT_TEMPLATES[eventKey as keyof typeof EVENT_TEMPLATES];

                try {
                    const outcome = template.checkOutcome();

                    console.log(`\n[${i + 1}/${total}] ${template.description}: ${outcome ? 'TRUE' : 'FALSE'}...`);

                    const txid = await submitEventOutcome(privateKey, template.eventId, outcome, timestamp);

                    tracker.add(`Event: ${template.eventId}`, txid, {
                        eventId: template.eventId,
                        outcome: outcome ? 'TRUE' : 'FALSE',
                    });

                    logTransaction(
                        'Oracle Event',
                        txid,
                        'mainnet',
                        `Event: ${template.eventId}, Outcome: ${outcome}`
                    );

                    displayProgress(i + 1, total, 'Event Submission Progress');

                    if (i < total - 1) {
                        await sleep(eventBatchResponse.delaySeconds * 1000);
                    }

                } catch (error) {
                    console.error(`❌ Failed to submit event ${template.eventId}:`,
                        error instanceof Error ? error.message : error);
                    console.log('Continuing with next event...\n');
                }
            }

            tracker.printSummary('mainnet');

            const timestamp2 = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `oracle-events-${timestamp2}.json`;
            tracker.exportToJSON(filename);

        } else if (mode === 'mock') {
            // Mock data generator
            console.log('\n🎲 Mock Data Generator');
            console.log('======================\n');
            console.log('Current mock prices:');

            Object.entries(MOCK_PRICES).forEach(([symbol, generator]) => {
                const price = generator();
                console.log(`   ${symbol}: $${price.toFixed(2)}`);
            });

            console.log('\nEvent outcomes:');
            Object.entries(EVENT_TEMPLATES).forEach(([key, template]) => {
                const outcome = template.checkOutcome();
                console.log(`   ${template.description}: ${outcome ? 'TRUE' : 'FALSE'}`);
            });

            console.log('\n💡 Use "Batch Submit Prices" or "Batch Submit Events" to submit this data to the oracle.');
        }

        console.log('\n✅ Oracle operations completed!');
        console.log(`\n📊 View contract activity:`);
        console.log(`https://explorer.hiro.so/address/${CONTRACT_ADDRESS}.${ORACLE_CONTRACT}?chain=mainnet`);

    } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run the script
main();
