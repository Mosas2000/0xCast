/**
 * Network utilities for 0xCast SDK
 */

import { STACKS_MAINNET, STACKS_TESTNET, type StacksNetwork } from '@stacks/network';
import type { NetworkType, NetworkConfig } from './types.js';

export type { NetworkType, NetworkConfig };

// ─── Constants ────────────────────────────────────────────────────────────────

export const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
  mainnet: {
    name: 'mainnet',
    label: 'Mainnet',
    chainId: 1,
    apiUrl: 'https://api.mainnet.hiro.so',
    nodeUrl: 'https://stacks-node-api.mainnet.stacks.co',
    explorerUrl: 'https://explorer.hiro.so?chain=mainnet',
  },
  testnet: {
    name: 'testnet',
    label: 'Testnet',
    chainId: 2147483648,
    apiUrl: 'https://api.testnet.hiro.so',
    nodeUrl: 'https://stacks-node-api.testnet.stacks.co',
    explorerUrl: 'https://explorer.hiro.so?chain=testnet',
  },
};

export const DEFAULT_NETWORK: NetworkType = 'mainnet';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the `@stacks/network` instance for the given network type.
 */
export function getStacksNetwork(network: NetworkType): StacksNetwork {
  return network === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
}

/**
 * Returns the NetworkConfig object for the given network type.
 */
export function getNetworkConfig(network: NetworkType): NetworkConfig {
  return NETWORK_CONFIGS[network];
}

/**
 * Returns the Hiro API base URL for the given network.
 */
export function getApiUrl(network: NetworkType): string {
  return NETWORK_CONFIGS[network].apiUrl;
}

/**
 * Returns the Stacks node API URL for the given network.
 */
export function getNodeUrl(network: NetworkType): string {
  return NETWORK_CONFIGS[network].nodeUrl;
}

/**
 * Returns true if the given string is a valid NetworkType.
 */
export function isValidNetwork(value: string): value is NetworkType {
  return value === 'mainnet' || value === 'testnet';
}

// ─── Explorer URLs ────────────────────────────────────────────────────────────

/**
 * Returns the Hiro explorer URL for a transaction.
 *
 * @example
 * getTransactionUrl('0xabc123', 'mainnet')
 * // => 'https://explorer.hiro.so/txid/0xabc123?chain=mainnet'
 */
export function getTransactionUrl(txId: string, network: NetworkType = DEFAULT_NETWORK): string {
  return `https://explorer.hiro.so/txid/${txId}?chain=${network}`;
}

/**
 * Returns the Hiro explorer URL for a Stacks address.
 *
 * @example
 * getAddressUrl('SP31PKQ...', 'mainnet')
 * // => 'https://explorer.hiro.so/address/SP31PKQ...?chain=mainnet'
 */
export function getAddressUrl(address: string, network: NetworkType = DEFAULT_NETWORK): string {
  return `https://explorer.hiro.so/address/${address}?chain=${network}`;
}

/**
 * Returns the Hiro explorer URL for a contract.
 *
 * @example
 * getContractUrl('SP31PKQ....market-core', 'mainnet')
 */
export function getContractUrl(
  contractIdentifier: string,
  network: NetworkType = DEFAULT_NETWORK
): string {
  return `https://explorer.hiro.so/txid/${contractIdentifier}?chain=${network}`;
}
