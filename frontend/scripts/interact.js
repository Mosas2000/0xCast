#!/usr/bin/env node

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as readline from 'readline';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import packages
const toml = await import('toml');
const { generateWallet } = await import('@stacks/wallet-sdk');

// Import Stacks packages
const {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    stringAsciiCV,
    uintCV,
} = await import('@stacks/transactions');

const { STACKS_MAINNET } = await import('@stacks/network');

// Contract details
const CONTRACT_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
const CONTRACT_NAME = 'market-core';

// Network configuration
const network = STACKS_MAINNET;

// Stake amounts in microSTX (1 STX = 1,000,000 microSTX)
const YES_STAKE_AMOUNT = 500000; // 0.5 STX
const NO_STAKE_AMOUNT = 300000;  // 0.3 STX

// Market parameters
const MARKET_QUESTION = "Will STX reach $1 by February 1st, 2025?";
const END_BLOCK_HEIGHT = 176000;
const RESOLUTION_BLOCK_HEIGHT = 176200;

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Prompt user for input
 */
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

/**
 * Get private key from Mainnet.toml configuration
 */
async function getPrivateKey() {
    try {
        // Path to Mainnet.toml (relative to frontend directory)
        const tomlPath = join(__dirname, '../../settings/Mainnet.toml');

        console.log('📖 Reading configuration from settings/Mainnet.toml...');

        // Read and parse TOML file
        const tomlContent = fs.readFileSync(tomlPath, 'utf-8');
        const config = toml.parse(tomlContent);

        // Get mnemonic from deployer account
        const mnemonic = config.accounts.deployer.mnemonic;

        if (!mnemonic) {
            throw new Error('No mnemonic found in Mainnet.toml');
        }

        console.log('🔑 Deriving private key from mnemonic...');

        // Derive wallet keys from mnemonic
        const { deriveWalletKeys } = await import('@stacks/wallet-sdk');
        const walletKeys = await deriveWalletKeys(mnemonic);

        // Derive STX private key for account 0
        const { deriveStxPrivateKey } = await import('@stacks/wallet-sdk');
        const privateKey = deriveStxPrivateKey({
            rootNode: walletKeys.rootNode,
            index: 0
        });

        // Get the address for display
        const { getAddressFromPrivateKey, TransactionVersion } = await import('@stacks/transactions');
        const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Mainnet);

        console.log(`✅ Using address: ${address}\n`);

        return privateKey;
    } catch (error) {
        console.error('❌ Error reading private key from Mainnet.toml:', error.message);
        console.error('   Make sure settings/Mainnet.toml exists with a valid mnemonic.');
        process.exit(1);
    }
}

/**
 * Create a new prediction market
 */
async function createMarket(privateKey) {
    console.log('\n📊 Creating market...');
    console.log(`Question: "${MARKET_QUESTION}"`);
    console.log(`End block: ${END_BLOCK_HEIGHT}`);
    console.log(`Resolution block: ${RESOLUTION_BLOCK_HEIGHT}`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-market',
        functionArgs: [
            stringAsciiCV(MARKET_QUESTION),
            uintCV(END_BLOCK_HEIGHT),
            uintCV(RESOLUTION_BLOCK_HEIGHT),
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);

    if (broadcastResponse.error) {
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
async function placeYesStake(privateKey, marketId) {
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
    const broadcastResponse = await broadcastTransaction(transaction, network);

    if (broadcastResponse.error) {
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
async function placeNoStake(privateKey, marketId) {
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
    const broadcastResponse = await broadcastTransaction(transaction, network);

    if (broadcastResponse.error) {
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
async function waitForConfirmation(message) {
    const answer = await prompt(`${message} (y/n): `);
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
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
        // Get private key
        const privateKey = await getPrivateKey();

        // Step 1: Create market
        const createMarketTxId = await createMarket(privateKey);

        // Wait for user to confirm market creation before proceeding
        console.log('\n⏳ Please wait for the market creation transaction to confirm...');
        console.log('   You can check the status on Stacks Explorer.');

        const continueToStakes = await waitForConfirmation(
            '\nHas the market creation transaction confirmed? Continue to place stakes?'
        );

        if (!continueToStakes) {
            console.log('❌ Exiting. You can run this script again to place stakes later.');
            rl.close();
            process.exit(0);
        }

        // Get the market ID
        const marketIdInput = await prompt('Enter the market ID from the transaction (check Explorer, usually 0 for first market): ');
        const marketId = parseInt(marketIdInput);

        if (isNaN(marketId)) {
            console.error('❌ Invalid market ID.');
            rl.close();
            process.exit(1);
        }

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

        rl.close();
    } catch (error) {
        console.error('\n❌ Error:', error.message || error);
        rl.close();
        process.exit(1);
    }
}

// Run the script
main();
