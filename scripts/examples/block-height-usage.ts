#!/usr/bin/env tsx

import { fetchCurrentBlockHeight, clearBlockHeightCache } from '../utils/block-height.js';
import {
    calculateMarketBlocks,
    validateMarketBlocks,
    blocksFromDays,
    blocksFromHours,
    daysFromBlocks,
    hoursFromBlocks,
    BLOCK_HEIGHT_CONFIG,
} from '../utils/block-height-config.js';

async function exampleBasicUsage() {
    console.log('=== Example 1: Basic Usage ===\n');
    
    const currentBlock = await fetchCurrentBlockHeight('mainnet');
    console.log(`Current block: ${currentBlock.toLocaleString()}`);
    
    const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock, 30, 3);
    console.log(`End block: ${endBlock.toLocaleString()}`);
    console.log(`Resolution block: ${resolutionBlock.toLocaleString()}\n`);
}

async function exampleWithValidation() {
    console.log('=== Example 2: With Validation ===\n');
    
    const currentBlock = await fetchCurrentBlockHeight('mainnet');
    const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock, 7, 1);
    
    const validation = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
    
    if (validation.valid) {
        console.log('✅ Block heights are valid!');
        console.log(`Market duration: ${daysFromBlocks(endBlock - currentBlock).toFixed(1)} days`);
        console.log(`Resolution buffer: ${daysFromBlocks(resolutionBlock - endBlock).toFixed(1)} days\n`);
    } else {
        console.log('❌ Validation failed:');
        validation.errors.forEach(error => console.log(`   - ${error}`));
    }
}

async function exampleCustomDuration() {
    console.log('=== Example 3: Custom Duration ===\n');
    
    const currentBlock = await fetchCurrentBlockHeight('mainnet');
    
    const shortTerm = blocksFromDays(7);
    const mediumTerm = blocksFromDays(30);
    const longTerm = blocksFromDays(90);
    
    console.log(`Short-term (7 days): ${shortTerm} blocks`);
    console.log(`Medium-term (30 days): ${mediumTerm} blocks`);
    console.log(`Long-term (90 days): ${longTerm} blocks\n`);
    
    const endBlock = currentBlock + mediumTerm;
    const resolutionBlock = endBlock + blocksFromHours(24);
    
    console.log(`End block: ${endBlock.toLocaleString()}`);
    console.log(`Resolution block: ${resolutionBlock.toLocaleString()}\n`);
}

async function exampleTimeConversions() {
    console.log('=== Example 4: Time Conversions ===\n');
    
    const blocks = 1000;
    
    console.log(`${blocks} blocks equals:`);
    console.log(`  ${daysFromBlocks(blocks).toFixed(2)} days`);
    console.log(`  ${hoursFromBlocks(blocks).toFixed(2)} hours`);
    console.log();
    
    const days = 30;
    const hours = 12;
    
    console.log(`${days} days equals: ${blocksFromDays(days)} blocks`);
    console.log(`${hours} hours equals: ${blocksFromHours(hours)} blocks\n`);
}

async function exampleCaching() {
    console.log('=== Example 5: Caching ===\n');
    
    console.log('First fetch (from API):');
    const start1 = Date.now();
    await fetchCurrentBlockHeight('mainnet');
    console.log(`Time: ${Date.now() - start1}ms\n`);
    
    console.log('Second fetch (from cache):');
    const start2 = Date.now();
    await fetchCurrentBlockHeight('mainnet');
    console.log(`Time: ${Date.now() - start2}ms\n`);
    
    console.log('Clearing cache...');
    clearBlockHeightCache();
    
    console.log('Third fetch (from API again):');
    const start3 = Date.now();
    await fetchCurrentBlockHeight('mainnet');
    console.log(`Time: ${Date.now() - start3}ms\n`);
}

async function exampleConfiguration() {
    console.log('=== Example 6: Configuration Constants ===\n');
    
    console.log('Block timing:');
    console.log(`  Blocks per hour: ${BLOCK_HEIGHT_CONFIG.BLOCKS_PER_HOUR}`);
    console.log(`  Blocks per day: ${BLOCK_HEIGHT_CONFIG.BLOCKS_PER_DAY}`);
    console.log(`  Blocks per week: ${BLOCK_HEIGHT_CONFIG.BLOCKS_PER_WEEK}`);
    console.log();
    
    console.log('Default durations:');
    console.log(`  Market duration: ${BLOCK_HEIGHT_CONFIG.DEFAULT_MARKET_DURATION_DAYS} days`);
    console.log(`  Resolution buffer: ${BLOCK_HEIGHT_CONFIG.DEFAULT_RESOLUTION_BUFFER_DAYS} days`);
    console.log();
    
    console.log('Validation limits:');
    console.log(`  Min market duration: ${daysFromBlocks(BLOCK_HEIGHT_CONFIG.MIN_MARKET_DURATION_BLOCKS).toFixed(1)} days`);
    console.log(`  Max market duration: ${daysFromBlocks(BLOCK_HEIGHT_CONFIG.MAX_MARKET_DURATION_BLOCKS).toFixed(1)} days`);
    console.log(`  Min resolution buffer: ${hoursFromBlocks(BLOCK_HEIGHT_CONFIG.MIN_RESOLUTION_BUFFER_BLOCKS).toFixed(1)} hours`);
    console.log(`  Max resolution buffer: ${daysFromBlocks(BLOCK_HEIGHT_CONFIG.MAX_RESOLUTION_BUFFER_BLOCKS).toFixed(1)} days\n`);
}

async function main() {
    console.log('🚀 Block Height Usage Examples\n');
    console.log('='.repeat(60));
    console.log();
    
    try {
        await exampleBasicUsage();
        await exampleWithValidation();
        await exampleCustomDuration();
        await exampleTimeConversions();
        await exampleCaching();
        await exampleConfiguration();
        
        console.log('='.repeat(60));
        console.log('\n✨ All examples completed successfully!\n');
    } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

main();
