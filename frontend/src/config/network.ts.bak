// Network Configuration for 0xCast
// Centralized network settings and API endpoints

import { getActiveNetwork, type NetworkType } from './contracts';

// API URLs per network
export const API_URLS = {
  mainnet: {
    node: 'https://stacks-node-api.mainnet.stacks.co',
    hiro: 'https://api.mainnet.hiro.so',
  },
  testnet: {
    node: 'https://stacks-node-api.testnet.stacks.co',
    hiro: 'https://api.testnet.hiro.so',
  },
} as const;

/**
 * Get the chain parameter for explorer URLs
 * 
 * @param network - Network type (mainnet or testnet). If not provided, uses active network
 * @returns Chain parameter string ('mainnet' or 'testnet')
 */
export function getExplorerChain(network?: NetworkType): string {
  const activeNetwork = network ?? getActiveNetwork();
  return activeNetwork === 'mainnet' ? 'mainnet' : 'testnet';
}

export const EXPLORER_URLS = {
  mainnet: {
    base: 'https://explorer.hiro.so',
    // Transaction explorer URL builder for mainnet
    tx: (txId: string) => `https://explorer.hiro.so/txid/${txId}?chain=mainnet`,
    // Address explorer URL builder for mainnet
    address: (addr: string) => `https://explorer.hiro.so/address/${addr}?chain=mainnet`,
    // Contract explorer URL builder for mainnet
    contract: (identifier: string) => `https://explorer.hiro.so/txid/${identifier}?chain=mainnet`,
  },
  testnet: {
    base: 'https://explorer.hiro.so',
    // Transaction explorer URL builder for testnet
    tx: (txId: string) => `https://explorer.hiro.so/txid/${txId}?chain=testnet`,
    // Address explorer URL builder for testnet
    address: (addr: string) => `https://explorer.hiro.so/address/${addr}?chain=testnet`,
    // Contract explorer URL builder for testnet
    contract: (identifier: string) => `https://explorer.hiro.so/txid/${identifier}?chain=testnet`,
  },
} as const;

// Get API URL for current or specified network
export function getApiUrl(network?: NetworkType): string {
  const activeNetwork = network ?? getActiveNetwork();
  return API_URLS[activeNetwork].hiro;
}

// Get Node API URL for current or specified network
export function getNodeUrl(network?: NetworkType): string {
  const activeNetwork = network ?? getActiveNetwork();
  return API_URLS[activeNetwork].node;
}

/**
 * Get explorer URLs for the specified network
 * 
 * @param network - Network type (mainnet or testnet). If not provided, uses active network
 * @returns Object containing explorer URL builder functions for transactions, addresses, and contracts
 */
export function getExplorerUrls(network?: NetworkType) {
  const activeNetwork = network ?? getActiveNetwork();
  return EXPLORER_URLS[activeNetwork];
}

// Check if we're on mainnet (dynamic)
export function isMainnet(): boolean {
  return getActiveNetwork() === 'mainnet';
}

// Check if we're on testnet (dynamic)
export function isTestnet(): boolean {
  return getActiveNetwork() === 'testnet';
}
