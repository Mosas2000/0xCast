// Network Configuration for 0xCast
// Centralized network settings and API endpoints

import { CURRENT_NETWORK, type NetworkType } from './contracts';

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

// Explorer URLs per network
export const EXPLORER_URLS = {
  mainnet: {
    base: 'https://explorer.hiro.so',
    tx: (txId: string) => `https://explorer.hiro.so/txid/${txId}?chain=mainnet`,
    address: (addr: string) => `https://explorer.hiro.so/address/${addr}?chain=mainnet`,
    contract: (identifier: string) => `https://explorer.hiro.so/txid/${identifier}?chain=mainnet`,
  },
  testnet: {
    base: 'https://explorer.hiro.so',
    tx: (txId: string) => `https://explorer.hiro.so/txid/${txId}?chain=testnet`,
    address: (addr: string) => `https://explorer.hiro.so/address/${addr}?chain=testnet`,
    contract: (identifier: string) => `https://explorer.hiro.so/txid/${identifier}?chain=testnet`,
  },
} as const;

// Get API URL for current network
export function getApiUrl(network: NetworkType = CURRENT_NETWORK): string {
  return API_URLS[network].hiro;
}

// Get Node API URL for current network
export function getNodeUrl(network: NetworkType = CURRENT_NETWORK): string {
  return API_URLS[network].node;
}

// Get explorer URLs for current network
export function getExplorerUrls(network: NetworkType = CURRENT_NETWORK) {
  return EXPLORER_URLS[network];
}

// Check if we're on mainnet
export function isMainnet(): boolean {
  return CURRENT_NETWORK === 'mainnet';
}

// Check if we're on testnet
export function isTestnet(): boolean {
  return CURRENT_NETWORK === 'testnet';
}
