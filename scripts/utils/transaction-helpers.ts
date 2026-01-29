import { generateWallet } from '@stacks/wallet-sdk';
import {
    broadcastTransaction,
    StacksTransaction,
    TxBroadcastResult
} from '@stacks/transactions';
import { StacksNetwork } from '@stacks/network';
import fs from 'fs';
import toml from 'toml';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get private key from Mainnet.toml by deriving from mnemonic
 */
export async function getPrivateKey(): Promise<string> {
    try {
        // Read the Mainnet.toml file
        const tomlPath = path.join(__dirname, '../../settings/Mainnet.toml');
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
 * Get current Stacks block height from the network
 */
export async function getCurrentBlockHeight(network: 'mainnet' | 'testnet' | 'devnet' = 'mainnet'): Promise<number> {
    const apiUrl = network === 'mainnet'
        ? 'https://api.mainnet.hiro.so/v2/info'
        : network === 'testnet'
            ? 'https://api.testnet.hiro.so/v2/info'
            : 'http://localhost:3999/v2/info';

    // Try multiple times with delays to avoid rate limiting
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data.stacks_tip_height;
        } catch (error) {
            if (attempt < 3) {
                console.warn(`Attempt ${attempt} failed, retrying in 2s...`);
                await sleep(2000);
            } else {
                console.warn('⚠️  Could not fetch current block height after 3 attempts');
                console.warn('   Using estimated fallback value');
                // Updated fallback - approximate current mainnet height as of Jan 2026
                // Stacks mainnet is at ~6,188,000 blocks
                return 6188000;
            }
        }
    }

    // This should never be reached, but TypeScript needs it
    return 6188000;
}

/**
 * Broadcast transaction with retry logic
 */
export async function broadcastWithRetry(
    transaction: StacksTransaction,
    network: StacksNetwork,
    maxRetries: number = 3,
    delayMs: number = 2000
): Promise<TxBroadcastResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await broadcastTransaction({
                transaction,
                network
            });

            if ('error' in result) {
                throw new Error(`Transaction failed: ${result.error}`);
            }

            return result;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < maxRetries) {
                console.log(`⚠️  Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
                await sleep(delayMs);
            }
        }
    }

    throw new Error(`Transaction failed after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format microSTX to STX
 */
export function formatSTX(microSTX: number): string {
    return (microSTX / 1_000_000).toFixed(6);
}

/**
 * Convert STX to microSTX
 */
export function toMicroSTX(stx: number): number {
    return Math.floor(stx * 1_000_000);
}

/**
 * Calculate future block height
 */
export function calculateFutureBlock(currentBlock: number, daysInFuture: number): number {
    const blocksPerDay = 144; // ~10 min per block
    return currentBlock + (daysInFuture * blocksPerDay);
}

/**
 * Format block height with commas
 */
export function formatBlockHeight(blockHeight: number): string {
    return blockHeight.toLocaleString();
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerTxUrl(txid: string, network: 'mainnet' | 'testnet' = 'mainnet'): string {
    const chain = network === 'mainnet' ? 'mainnet' : 'testnet';
    return `https://explorer.hiro.so/txid/${txid}?chain=${chain}`;
}

/**
 * Get explorer URL for contract
 */
export function getExplorerContractUrl(
    contractAddress: string,
    contractName: string,
    network: 'mainnet' | 'testnet' = 'mainnet'
): string {
    const chain = network === 'mainnet' ? 'mainnet' : 'testnet';
    return `https://explorer.hiro.so/address/${contractAddress}.${contractName}?chain=${chain}`;
}

/**
 * Generate random stake amount within range
 */
export function randomStakeAmount(minSTX: number, maxSTX: number): number {
    const min = toMicroSTX(minSTX);
    const max = toMicroSTX(maxSTX);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Log transaction result
 */
export function logTransaction(
    type: string,
    txid: string,
    network: 'mainnet' | 'testnet' = 'mainnet',
    additionalInfo?: string
): void {
    console.log(`✅ ${type} transaction broadcast!`);
    console.log(`   Transaction ID: ${txid}`);
    console.log(`   Explorer: ${getExplorerTxUrl(txid, network)}`);
    if (additionalInfo) {
        console.log(`   ${additionalInfo}`);
    }
    console.log('');
}

/**
 * Display progress bar
 */
export function displayProgress(current: number, total: number, label: string = 'Progress'): void {
    const percentage = Math.floor((current / total) * 100);
    const barLength = 30;
    const filledLength = Math.floor((current / total) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

    process.stdout.write(`\r${label}: [${bar}] ${percentage}% (${current}/${total})`);

    if (current === total) {
        process.stdout.write('\n');
    }
}

/**
 * Validate block heights
 */
export function validateBlockHeights(
    currentBlock: number,
    endBlock: number,
    resolutionBlock: number
): { valid: boolean; error?: string } {
    if (endBlock <= currentBlock) {
        return {
            valid: false,
            error: `End block (${endBlock}) must be in the future. Current block is ${currentBlock}`
        };
    }

    if (resolutionBlock <= endBlock) {
        return {
            valid: false,
            error: `Resolution block (${resolutionBlock}) must be after end block (${endBlock})`
        };
    }

    return { valid: true };
}

/**
 * Create transaction summary
 */
export interface TransactionSummary {
    type: string;
    txid: string;
    timestamp: Date;
    details?: any;
}

export class TransactionTracker {
    private transactions: TransactionSummary[] = [];

    add(type: string, txid: string, details?: any): void {
        this.transactions.push({
            type,
            txid,
            timestamp: new Date(),
            details
        });
    }

    getAll(): TransactionSummary[] {
        return this.transactions;
    }

    printSummary(network: 'mainnet' | 'testnet' = 'mainnet'): void {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TRANSACTION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Transactions: ${this.transactions.length}\n`);

        this.transactions.forEach((tx, index) => {
            console.log(`${index + 1}. ${tx.type}`);
            console.log(`   TX ID: ${tx.txid}`);
            console.log(`   Time: ${tx.timestamp.toLocaleString()}`);
            console.log(`   Explorer: ${getExplorerTxUrl(tx.txid, network)}`);
            if (tx.details) {
                console.log(`   Details: ${JSON.stringify(tx.details)}`);
            }
            console.log('');
        });

        console.log('='.repeat(60) + '\n');
    }

    exportToJSON(filename: string): void {
        const data = JSON.stringify(this.transactions, null, 2);
        fs.writeFileSync(filename, data);
        console.log(`✅ Transactions exported to ${filename}`);
    }
}
