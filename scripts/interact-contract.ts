#!/usr/bin/env tsx

import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    stringAsciiCV,
    uintCV,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import { generateWallet } from '@stacks/wallet-sdk';
import prompts from 'prompts';
import * as dotenv from 'dotenv';
import { categoryFromQuestion } from './utils/market-categories.js';
import { fetchCurrentBlockHeight } from './utils/block-height.js';
import fs from 'fs';
import toml from 'toml';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Contract details
const CONTRACT_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
const CONTRACT_NAME = 'market-core';

// Network configuration
const network = STACKS_MAINNET;


// Stake amounts in microSTX (1 STX = 1,000,000 microSTX)
const YES_STAKE_AMOUNT = 500000; // 0.5 STX
const NO_STAKE_AMOUNT = 300000;  // 0.3 STX

// Market parameters
const MARKET_QUESTION = "Will STX reach $5 by March 1st, 2026?";
// Stacks produces ~144 blocks per day (10 min per block)
// Adding 5,000 blocks (~35 days) for end date
// Adding 5,500 blocks (~38 days) for resolution date
const END_BLOCK_OFFSET = 5000;
const RESOLUTION_BLOCK_OFFSET = 5500;

/**
 * Get private key from Mainnet.toml by deriving from mnemonic
 */
async function getPrivateKey(): Promise<string> {
    try {
        // Read the Mainnet.toml file
        const tomlPath = path.join(__dirname, '../settings/Mainnet.toml');
        const tomlContent = fs.readFileSync(tomlPath, 'utf-8');
        const config = toml.parse(tomlContent);

        // Extract mnemonic from deployer account
        const mnemonic = config.accounts.deployer.mnemonic;

        if (!mnemonic) {
            throw new Error('No mnemonic found in Mainnet.toml');
        }

        console.log('🔑 Deriving private key from mnemonic in Mainnet.toml...');

        // Generate wallet from mnemonic
        const wallet = await generateWallet({
            secretKey: mnemonic,
            password: '',
        });

        // Get the private key from the first account
        const privateKey = wallet.accounts[0].stxPrivateKey;

        console.log(`✅ Private key loaded successfully\n`);

        return privateKey;
    } catch (error) {
        console.error('❌ Failed to read private key from Mainnet.toml');
        console.error('Error:', error instanceof Error ? error.message : error);
        
        // Fallback to environment variable
        if (process.env.PRIVATE_KEY) {
            console.log('Using PRIVATE_KEY from environment variable instead...');
            return process.env.PRIVATE_KEY;
        }

        throw new Error('Could not load private key from Mainnet.toml or environment');
    }
}

/**
 * Create a new prediction market
 */
async function createMarket(privateKey: string, category: number, endBlockHeight: number, resolutionBlockHeight: number): Promise<string> {
    console.log('\n📊 Creating market...');
    console.log(`Question: "${MARKET_QUESTION}"`);
    console.log(`End block: ${endBlockHeight}`);
    console.log(`Resolution block: ${resolutionBlockHeight}`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-market',
        functionArgs: [
            stringAsciiCV(MARKET_QUESTION),
            uintCV(endBlockHeight),
            uintCV(resolutionBlockHeight),
            uintCV(category),
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    
    const broadcastResponse = await broadcastTransaction({
        transaction,
        network
    });

    if ('error' in broadcastResponse) {
        throw new Error(`Transaction failed: ${broadcastResponse.error}`);
    }

    console.log(`✅ Market creation transaction broadcast!`);
    console.log(`Transaction ID: ${broadcastResponse.txid}`);
    console.log(`View on Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=mainnet`);

    return broadcastResponse.txid;
}

/**
 * Place a YES stake on a market
 */
async function placeYesStake(privateKey: string, marketId: number): Promise<string> {
    console.log(`\n✅ Placing YES stake of 0.5 STX on market ${marketId}...`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'place-yes-stake',
        functionArgs: [
            uintCV(marketId),
            uintCV(YES_STAKE_AMOUNT),
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction({
        transaction,
        network
    });

    if ('error' in broadcastResponse) {
        throw new Error(`Transaction failed: ${broadcastResponse.error}`);
    }

    console.log(`✅ YES stake transaction broadcast!`);
    console.log(`Transaction ID: ${broadcastResponse.txid}`);
    console.log(`View on Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=mainnet`);

    return broadcastResponse.txid;
}

/**
 * Place a NO stake on a market
 */
async function placeNoStake(privateKey: string, marketId: number): Promise<string> {
    console.log(`\n❌ Placing NO stake of 0.3 STX on market ${marketId}...`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'place-no-stake',
        functionArgs: [
            uintCV(marketId),
            uintCV(NO_STAKE_AMOUNT),
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction({
        transaction,
        network
    });

    if ('error' in broadcastResponse) {
        throw new Error(`Transaction failed: ${broadcastResponse.error}`);
    }

    console.log(`✅ NO stake transaction broadcast!`);
    console.log(`Transaction ID: ${broadcastResponse.txid}`);
    console.log(`View on Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=mainnet`);

    return broadcastResponse.txid;
}

/**
 * Wait for user confirmation
 */
async function waitForConfirmation(message: string): Promise<boolean> {
    const response = await prompts({
        type: 'confirm',
        name: 'continue',
        message,
        initial: true,
    });

    return response.continue;
}

/**
 * Main execution function
 */
async function main() {
    console.log('🚀 0xCast Contract Interaction Script');
    console.log('=====================================\n');
    console.log(`Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log(`Network: Stacks Mainnet\n`);

    try {
        // Get current block height
        console.log('⏱️  Fetching current block height...');
        const currentBlock = await fetchCurrentBlockHeight('mainnet');
        console.log(`Current Stacks block: ${currentBlock.toLocaleString()}`);
        
        const endBlockHeight = currentBlock + END_BLOCK_OFFSET;
        const resolutionBlockHeight = currentBlock + RESOLUTION_BLOCK_OFFSET;
        
        console.log(`End block: ${endBlockHeight.toLocaleString()} (${END_BLOCK_OFFSET.toLocaleString()} blocks away)`);
        console.log(`Resolution block: ${resolutionBlockHeight.toLocaleString()}\n`);

        // Validate block heights are in the future
        if (endBlockHeight <= currentBlock) {
            throw new Error(`❌ END_BLOCK_HEIGHT (${endBlockHeight}) is in the past! Current block is ${currentBlock}.`);
        }
        if (resolutionBlockHeight <= endBlockHeight) {
            throw new Error(`❌ RESOLUTION_BLOCK_HEIGHT must be greater than END_BLOCK_HEIGHT`);
        }

        // Get private key
        const privateKey = await getPrivateKey();

        if (!privateKey) {
            console.log('❌ No private key provided. Exiting...');
            process.exit(1);
        }

        // Step 1: Create market
        const createMarketTxId = await createMarket(
            privateKey, 
            categoryFromQuestion(MARKET_QUESTION), 
            endBlockHeight, 
            resolutionBlockHeight
        );

        // Wait for user to confirm market creation before proceeding
        console.log('\n⏳ Please wait for the market creation transaction to confirm...');
        console.log('   You can check the status on Stacks Explorer.');

        const continueToStakes = await waitForConfirmation(
            'Has the market creation transaction confirmed? Continue to place stakes?'
        );

        if (!continueToStakes) {
            console.log('❌ Exiting. You can run this script again to place stakes later.');
            process.exit(0);
        }

        // Get the market ID (assuming it's the next market counter value)
        const marketIdResponse = await prompts({
            type: 'number',
            name: 'marketId',
            message: 'Enter the market ID from the transaction (check Explorer for the created market ID):',
            initial: 0,
        });

        const marketId = marketIdResponse.marketId;

        // Step 2: Place YES stake
        const yesStakeTxId = await placeYesStake(privateKey, marketId);

        // Wait a bit before placing NO stake
        console.log('\n⏳ Waiting 5 seconds before placing NO stake...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Step 3: Place NO stake
        const noStakeTxId = await placeNoStake(privateKey, marketId);

        // Summary
        console.log('\n\n🎉 All transactions completed!');
        console.log('================================');
        console.log(`Market Creation: ${createMarketTxId}`);
        console.log(`YES Stake (0.5 STX): ${yesStakeTxId}`);
        console.log(`NO Stake (0.3 STX): ${noStakeTxId}`);
        console.log('\n📊 View contract activity:');
        console.log(`https://explorer.hiro.so/address/${CONTRACT_ADDRESS}.${CONTRACT_NAME}?chain=mainnet`);
        console.log('\n✨ These transactions will be tracked by talent.app!');

    } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run the script
main();
