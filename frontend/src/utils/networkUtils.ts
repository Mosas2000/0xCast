/**
 * Network Utilities
 * 
 * Helper functions for network operations
 */

import { STACKS_MAINNET, STACKS_TESTNET, type StacksNetwork } from '@stacks/network';
import { 
  NetworkType, 
  NETWORK_CONFIGS, 
  DEFAULT_NETWORK, 
  NETWORK_STORAGE_KEY 
} from '@/types/network';
import { GDPRComplianceService } from '@/services/GDPRComplianceService';
import { SecureStorageV2Service } from '@/services/SecureStorageV2Service';

/**
 * Get Stacks network instance for the given network type
 */
export function getStacksNetwork(networkType: NetworkType): StacksNetwork {
  return networkType === NetworkType.MAINNET 
    ? STACKS_MAINNET
    : STACKS_TESTNET;
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
    const consentCheck = GDPRComplianceService.checkConsentForStorage(
      { networkType },
      'personalization'
    );

    if (!consentCheck.allowed) {
      console.warn('Network preference storage blocked:', consentCheck.reason);
      return;
    }

    localStorage.setItem(NETWORK_STORAGE_KEY, networkType);

    SecureStorageV2Service.setItem(NETWORK_STORAGE_KEY, networkType, {
      encrypt: true,
      category: 'personalization',
      expiresIn: 365 * 24 * 60 * 60 * 1000,
    }).catch(error => {
      console.warn('Failed to store network preference in secure storage:', error);
    });
  } catch (error) {
    console.warn('Failed to save network preference:', error);
  }
}

export async function loadNetworkPreferenceSecure(): Promise<NetworkType> {
  try {
    const saved = await SecureStorageV2Service.getItem<NetworkType>(NETWORK_STORAGE_KEY);
    if (saved === NetworkType.MAINNET || saved === NetworkType.TESTNET) {
      return saved;
    }
  } catch (error) {
    console.warn('Failed to load network preference from secure storage:', error);
  }
  return loadNetworkPreference();
}

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

export function clearNetworkPreference(): void {
  try {
    localStorage.removeItem(NETWORK_STORAGE_KEY);
    SecureStorageV2Service.removeItem(NETWORK_STORAGE_KEY).catch(error => {
      console.warn('Failed to clear network preference from secure storage:', error);
    });
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
  // Mainnet contract address - all contracts deployed to this address
  if (networkType === NetworkType.MAINNET) {
    return 'SP1W6XQZ6XVYGTVW32SJW2ZG48ZJBW9BATRD19N60';
  }
  
  // Testnet contract address (placeholder - update with actual testnet deployment)
  return 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
}

/**
 * Get contract name (same for all networks)
 */
export function getContractName(): string {
  return 'oxcast';
}

/**
 * Check if a string is a valid network type
 */
export function isValidNetwork(network: string): network is NetworkType {
  return network === NetworkType.MAINNET || network === NetworkType.TESTNET;
}

/**
 * Get network from URL query parameter
 */
export function getNetworkFromURL(): NetworkType | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const network = params.get('network');
    if (network && isValidNetwork(network)) {
      return network;
    }
  } catch (error) {
    console.warn('Failed to get network from URL:', error);
  }
  return null;
}
