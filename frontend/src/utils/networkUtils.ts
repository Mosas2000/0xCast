/**
 * Network Utilities
 * 
 * Helper functions for network operations
 */

import { StacksMainnet, StacksTestnet, type StacksNetwork } from '@stacks/network';
import { 
  NetworkType, 
  NETWORK_CONFIGS, 
  DEFAULT_NETWORK, 
  NETWORK_STORAGE_KEY 
} from '../types/network';

/**
 * Get Stacks network instance for the given network type
 */
export function getStacksNetwork(networkType: NetworkType): StacksNetwork {
  return networkType === NetworkType.MAINNET 
    ? new StacksMainnet() 
    : new StacksTestnet();
}

/**
 * Get network configuration for the given network type
 */
export function getNetworkConfig(networkType: NetworkType) {
  return NETWORK_CONFIGS[networkType];
}

/**
 * Save network selection to localStorage
 */
export function saveNetworkPreference(networkType: NetworkType): void {
  try {
    localStorage.setItem(NETWORK_STORAGE_KEY, networkType);
  } catch (error) {
    console.warn('Failed to save network preference:', error);
  }
}

/**
 * Load network selection from localStorage
 */
export function loadNetworkPreference(): NetworkType {
  try {
    const saved = localStorage.getItem(NETWORK_STORAGE_KEY);
    if (saved === NetworkType.MAINNET || saved === NetworkType.TESTNET) {
      return saved;
    }
  } catch (error) {
    console.warn('Failed to load network preference:', error);
  }
  return DEFAULT_NETWORK;
}

/**
 * Clear network preference from localStorage
 */
export function clearNetworkPreference(): void {
  try {
    localStorage.removeItem(NETWORK_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear network preference:', error);
  }
}

/**
 * Check if current network is mainnet
 */
export function isMainnet(networkType: NetworkType): boolean {
  return networkType === NetworkType.MAINNET;
}

/**
 * Check if current network is testnet
 */
export function isTestnet(networkType: NetworkType): boolean {
  return networkType === NetworkType.TESTNET;
}

/**
 * Get contract address for the given network
 */
export function getContractAddress(networkType: NetworkType): string {
  // Mainnet contract address
  if (networkType === NetworkType.MAINNET) {
    return 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
  }
  
  // Testnet contract address (placeholder - update with actual testnet deployment)
  return 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
}

/**
 * Get contract name (same for all networks)
 */
export function getContractName(): string {
  return '0xcast-v1';
}
