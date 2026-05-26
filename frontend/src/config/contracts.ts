// Unified Contract Configuration for 0xCast
// This file serves as the single source of truth for all contract addresses

import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { loadNetworkPreference } from '@/utils/networkUtils';

export type NetworkType = 'mainnet' | 'testnet';

// Helper to convert network enum to legacy type
function normalizeNetwork(network: string): NetworkType {
  if (network === 'mainnet') {
    return 'mainnet';
  }
  return 'testnet';
}

// Get the current network from storage (dynamic)
function getCurrentNetworkFromStorage(): NetworkType {
  return normalizeNetwork(loadNetworkPreference());
}

// Contract names
export const CONTRACT_NAMES = {
  MARKET_CORE: 'market-core',
  MARKET_STATS: 'market-stats',
  OXCAST: 'oxcast',
  GOVERNANCE_CORE: 'governance-core',
  GOVERNANCE_TOKEN: 'governance-token',
  LIQUIDITY_POOL: 'liquidity-pool',
  LIQUIDITY_REWARDS: 'liquidity-rewards',
  ORACLE_INTEGRATION: 'oracle-integration',
  ORACLE_REPUTATION: 'oracle-reputation',
  ACCESS_CONTROL: 'access-control',
  MARKET_FEES: 'market-fees',
  MARKET_MULTI: 'market-multi',
} as const;

export type ContractName = typeof CONTRACT_NAMES[keyof typeof CONTRACT_NAMES];

// Contract addresses per network
export const CONTRACT_ADDRESSES = {
  mainnet: {
    // Primary deployer address for market-core and related contracts
    primary: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T',
    // OXC token contract deployer
    token: 'SP1W6XQZ6XVYGTVW32SJW2ZG48ZJBW9BATRD19N60',
  },
  testnet: {
    primary: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    token: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  },
} as const;

// Current active network (reads from localStorage for persistence)
export const CURRENT_NETWORK: NetworkType = getCurrentNetworkFromStorage();

// Subscribe to network changes (for use outside React)
let networkOverride: NetworkType | null = null;

export function setNetworkOverride(network: NetworkType | null) {
  networkOverride = network;
}

export function getActiveNetwork(): NetworkType {
  return networkOverride ?? getCurrentNetworkFromStorage();
}

// Get network object for @stacks/network
export function getNetwork(network?: NetworkType) {
  const activeNetwork = network ?? getActiveNetwork();
  return activeNetwork === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
}

// Get contract address for a specific contract
export function getContractAddress(contractName: ContractName, network?: NetworkType): string {
  const activeNetwork = network ?? getActiveNetwork();
  const addresses = CONTRACT_ADDRESSES[activeNetwork];
  
  // Token and liquidity pools/rewards use the token deployer address
  if (
    contractName === CONTRACT_NAMES.OXCAST ||
    contractName === CONTRACT_NAMES.GOVERNANCE_TOKEN ||
    contractName === CONTRACT_NAMES.LIQUIDITY_POOL ||
    contractName === CONTRACT_NAMES.LIQUIDITY_REWARDS
  ) {
    return addresses.token;
  }
  
  // All other contracts use the primary deployer
  return addresses.primary;
}

// Get full contract identifier (address.name)
export function getContractIdentifier(contractName: ContractName, network?: NetworkType): string {
  const address = getContractAddress(contractName, network);
  return `${address}.${contractName}`;
}

// Get contract principal for a contract
export function getContractPrincipal(contractName: ContractName, network?: NetworkType): {
  address: string;
  name: string;
  identifier: string;
} {
  const address = getContractAddress(contractName, network);
  return {
    address,
    name: contractName,
    identifier: `${address}.${contractName}`,
  };
}

// Primary market contract configuration
export const MARKET_CONTRACT = {
  get address() {
    return getContractAddress(CONTRACT_NAMES.MARKET_CORE);
  },
  get name() {
    return CONTRACT_NAMES.MARKET_CORE;
  },
  get identifier() {
    return getContractIdentifier(CONTRACT_NAMES.MARKET_CORE);
  },
} as const;

// OXC Token contract configuration
export const TOKEN_CONTRACT = {
  get address() {
    return getContractAddress(CONTRACT_NAMES.OXCAST);
  },
  get name() {
    return CONTRACT_NAMES.OXCAST;
  },
  get identifier() {
    return getContractIdentifier(CONTRACT_NAMES.OXCAST);
  },
} as const;

// Multi-outcome market contract configuration
export const MARKET_MULTI_CONTRACT = {
  get address() {
    return getContractAddress(CONTRACT_NAMES.MARKET_MULTI);
  },
  get name() {
    return CONTRACT_NAMES.MARKET_MULTI;
  },
  get identifier() {
    return getContractIdentifier(CONTRACT_NAMES.MARKET_MULTI);
  },
} as const;
