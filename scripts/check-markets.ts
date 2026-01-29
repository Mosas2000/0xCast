#!/usr/bin/env tsx

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Contract details
const CONTRACT_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
const CONTRACT_NAME = 'market-core';

// API endpoint
const API_BASE = 'https://api.mainnet.hiro.so';

/**
 * Simple fetch with better error handling
 */
async function simpleReadOnlyCall(functionName: string): Promise<any> {
    const url = `${API_BASE}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/${functionName}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sender: CONTRACT_ADDRESS,
                arguments: [],
            }),
        });

        if (!response.ok) {
            return { error: `HTTP ${response.status}: ${response.statusText}` };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Parse uint value from Clarity response
 */
function parseUint(value: any): number {
    if (!value || !value.value) return -1;

    const val = value.value;
    if (typeof val === 'string') {
        return val.startsWith('0x') ? parseInt(val, 16) : parseInt(val, 10);
    }
    return parseInt(val);
}

/**
 * Main execution
 */
async function main() {
    console.log('🔍 Quick Market Counter Check');
    console.log('==============================\n');
    console.log(`Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}\n`);

    // Get market counter
    console.log('Fetching market counter...');
    const result = await simpleReadOnlyCall('get-market-counter');

    if (result.error) {
        console.log(`❌ Error: ${result.error}`);
        console.log('\n💡 This might be due to API rate limiting.');
        console.log('   Try again in a few minutes.\n');
        process.exit(1);
    }

    const counter = parseUint(result.result);

    console.log(`\n✅ Market Counter: ${counter}`);
    console.log(`\n📊 Market Status:`);

    if (counter === 0) {
        console.log('   ⚠️  NO MARKETS EXIST YET!');
        console.log('   You need to create a market first.\n');
        console.log('   Run: npm run bulk-markets');
        console.log('   Then wait 10-30 minutes for confirmation.\n');
    } else {
        console.log(`   ✅ ${counter} market(s) created`);
        console.log(`   Valid market IDs: 0 to ${counter - 1}\n`);
        console.log('   You can trade on these markets using:');
        console.log('   npm run auto-trade\n');
        console.log(`   Example: Enter market IDs: ${Array.from({ length: Math.min(counter, 3) }, (_, i) => i).join(',')}\n`);
    }

    console.log('🔗 View on Explorer:');
    console.log(`   https://explorer.hiro.so/address/${CONTRACT_ADDRESS}.${CONTRACT_NAME}?chain=mainnet\n`);
}

main();
