#!/usr/bin/env tsx

import { STACKS_MAINNET } from '@stacks/network';
import prompts from 'prompts';
import * as dotenv from 'dotenv';
import fs from 'fs';
import { formatSTX, formatBlockHeight } from './utils/transaction-helpers.js';

// Load environment variables
dotenv.config();

// Contract details
const CONTRACT_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
const CONTRACT_NAME = 'market-core';

// API endpoint
const API_BASE = 'https://api.mainnet.hiro.so';

/**
 * Market data interface
 */
interface Market {
    marketId: number;
    question: string;
    creator: string;
    endDate: number;
    resolutionDate: number;
    totalYesStake: number;
    totalNoStake: number;
    status: number;
    outcome: number;
    createdAt: number;
}

/**
 * Analytics data
 */
interface AnalyticsData {
    totalMarkets: number;
    activeMarkets: number;
    resolvedMarkets: number;
    totalVolume: number;
    totalYesVolume: number;
    totalNoVolume: number;
    averageMarketSize: number;
    largestMarket: { id: number; volume: number } | null;
    markets: Market[];
    generatedAt: string;
}

/**
 * Fetch contract data from read-only function
 */
async function callReadOnlyFunction(functionName: string, args: any[] = []): Promise<any> {
    const url = `${API_BASE}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/${functionName}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sender: CONTRACT_ADDRESS,
            arguments: args,
        }),
    });

    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

/**
 * Parse Clarity value
 */
function parseClarityValue(value: any): any {
    if (!value) return null;

    if (value.type === 'uint') {
        return parseInt(value.value);
    } else if (value.type === 'int') {
        return parseInt(value.value);
    } else if (value.type === 'bool') {
        return value.value;
    } else if (value.type === 'principal') {
        return value.value;
    } else if (value.type === 'string-ascii' || value.type === 'string-utf8') {
        return value.value;
    } else if (value.type === 'tuple') {
        const result: any = {};
        for (const [key, val] of Object.entries(value.value)) {
            result[key] = parseClarityValue(val);
        }
        return result;
    } else if (value.type === 'optional') {
        return value.value ? parseClarityValue(value.value) : null;
    }

    return value;
}

/**
 * Get market counter
 */
async function getMarketCounter(): Promise<number> {
    try {
        const result = await callReadOnlyFunction('get-market-counter');
        return parseClarityValue(result.result);
    } catch (error) {
        console.warn('Could not fetch market counter, assuming 0');
        return 0;
    }
}

/**
 * Get market details
 */
async function getMarket(marketId: number): Promise<Market | null> {
    try {
        const result = await callReadOnlyFunction('get-market', [
            { type: 'uint', value: marketId.toString() }
        ]);

        const marketData = parseClarityValue(result.result);

        if (!marketData) return null;

        return {
            marketId,
            question: marketData.question || '',
            creator: marketData.creator || '',
            endDate: marketData['end-date'] || 0,
            resolutionDate: marketData['resolution-date'] || 0,
            totalYesStake: marketData['total-yes-stake'] || 0,
            totalNoStake: marketData['total-no-stake'] || 0,
            status: marketData.status || 0,
            outcome: marketData.outcome || 0,
            createdAt: marketData['created-at'] || 0,
        };
    } catch (error) {
        return null;
    }
}

/**
 * Fetch all markets
 */
async function fetchAllMarkets(): Promise<Market[]> {
    console.log('📊 Fetching market data...\n');

    const marketCounter = await getMarketCounter();
    console.log(`Total markets created: ${marketCounter}\n`);

    const markets: Market[] = [];

    for (let i = 0; i < marketCounter; i++) {
        process.stdout.write(`\rFetching market ${i + 1}/${marketCounter}...`);

        const market = await getMarket(i);
        if (market) {
            markets.push(market);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    process.stdout.write('\n\n');
    return markets;
}

/**
 * Calculate analytics
 */
function calculateAnalytics(markets: Market[]): AnalyticsData {
    let totalVolume = 0;
    let totalYesVolume = 0;
    let totalNoVolume = 0;
    let activeMarkets = 0;
    let resolvedMarkets = 0;
    let largestMarket: { id: number; volume: number } | null = null;

    markets.forEach(market => {
        const marketVolume = market.totalYesStake + market.totalNoStake;
        totalVolume += marketVolume;
        totalYesVolume += market.totalYesStake;
        totalNoVolume += market.totalNoStake;

        if (market.status === 0) {
            activeMarkets++;
        } else if (market.status === 1) {
            resolvedMarkets++;
        }

        if (!largestMarket || marketVolume > largestMarket.volume) {
            largestMarket = { id: market.marketId, volume: marketVolume };
        }
    });

    const averageMarketSize = markets.length > 0 ? totalVolume / markets.length : 0;

    return {
        totalMarkets: markets.length,
        activeMarkets,
        resolvedMarkets,
        totalVolume,
        totalYesVolume,
        totalNoVolume,
        averageMarketSize,
        largestMarket,
        markets,
        generatedAt: new Date().toISOString(),
    };
}

/**
 * Print analytics report
 */
function printAnalyticsReport(analytics: AnalyticsData): void {
    console.log('='.repeat(70));
    console.log('📊 0xCAST ANALYTICS REPORT');
    console.log('='.repeat(70));
    console.log(`Generated: ${new Date(analytics.generatedAt).toLocaleString()}\n`);

    console.log('📈 MARKET STATISTICS');
    console.log('-'.repeat(70));
    console.log(`Total Markets: ${analytics.totalMarkets}`);
    console.log(`Active Markets: ${analytics.activeMarkets}`);
    console.log(`Resolved Markets: ${analytics.resolvedMarkets}`);
    console.log('');

    console.log('💰 VOLUME STATISTICS');
    console.log('-'.repeat(70));
    console.log(`Total Volume: ${formatSTX(analytics.totalVolume)} STX`);
    console.log(`YES Volume: ${formatSTX(analytics.totalYesVolume)} STX`);
    console.log(`NO Volume: ${formatSTX(analytics.totalNoVolume)} STX`);
    console.log(`Average Market Size: ${formatSTX(analytics.averageMarketSize)} STX`);

    if (analytics.largestMarket) {
        console.log(`Largest Market: #${analytics.largestMarket.id} (${formatSTX(analytics.largestMarket.volume)} STX)`);
    }
    console.log('');

    console.log('📋 TOP 10 MARKETS BY VOLUME');
    console.log('-'.repeat(70));

    const sortedMarkets = [...analytics.markets]
        .sort((a, b) => (b.totalYesStake + b.totalNoStake) - (a.totalYesStake + a.totalNoStake))
        .slice(0, 10);

    sortedMarkets.forEach((market, index) => {
        const volume = market.totalYesStake + market.totalNoStake;
        const status = market.status === 0 ? '🟢 Active' : '🔵 Resolved';
        console.log(`${index + 1}. Market #${market.marketId} - ${formatSTX(volume)} STX ${status}`);
        console.log(`   "${market.question.substring(0, 60)}${market.question.length > 60 ? '...' : ''}"`);
        console.log(`   YES: ${formatSTX(market.totalYesStake)} | NO: ${formatSTX(market.totalNoStake)}`);
        console.log('');
    });

    console.log('='.repeat(70) + '\n');
}

/**
 * Export to CSV
 */
function exportToCSV(analytics: AnalyticsData, filename: string): void {
    const headers = [
        'Market ID',
        'Question',
        'Status',
        'Total Volume (microSTX)',
        'YES Stake (microSTX)',
        'NO Stake (microSTX)',
        'Created At Block',
        'End Block',
        'Resolution Block',
        'Outcome'
    ];

    const rows = analytics.markets.map(market => [
        market.marketId,
        `"${market.question.replace(/"/g, '""')}"`, // Escape quotes
        market.status === 0 ? 'Active' : 'Resolved',
        market.totalYesStake + market.totalNoStake,
        market.totalYesStake,
        market.totalNoStake,
        market.createdAt,
        market.endDate,
        market.resolutionDate,
        market.outcome === 0 ? 'None' : market.outcome === 1 ? 'YES' : 'NO'
    ]);

    const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    fs.writeFileSync(filename, csv);
    console.log(`✅ CSV exported to ${filename}`);
}

/**
 * Main execution function
 */
async function main() {
    console.log('🚀 0xCast Analytics Report Generator');
    console.log('=====================================\n');
    console.log(`Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log(`Network: Stacks Mainnet\n`);

    try {
        // Fetch all markets
        const markets = await fetchAllMarkets();

        if (markets.length === 0) {
            console.log('⚠️  No markets found on the contract.');
            process.exit(0);
        }

        // Calculate analytics
        const analytics = calculateAnalytics(markets);

        // Print report
        printAnalyticsReport(analytics);

        // Ask user what to export
        const response = await prompts({
            type: 'multiselect',
            name: 'exports',
            message: 'Select export formats:',
            choices: [
                { title: 'JSON (detailed)', value: 'json', selected: true },
                { title: 'CSV (spreadsheet)', value: 'csv', selected: true },
            ],
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        if (response.exports.includes('json')) {
            const jsonFilename = `analytics-report-${timestamp}.json`;
            const jsonData = JSON.stringify(analytics, null, 2);
            fs.writeFileSync(jsonFilename, jsonData);
            console.log(`✅ JSON exported to ${jsonFilename}`);
        }

        if (response.exports.includes('csv')) {
            const csvFilename = `analytics-report-${timestamp}.csv`;
            exportToCSV(analytics, csvFilename);
        }

        console.log(`\n📊 View contract on Explorer:`);
        console.log(`https://explorer.hiro.so/address/${CONTRACT_ADDRESS}.${CONTRACT_NAME}?chain=mainnet`);

    } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run the script
main();
