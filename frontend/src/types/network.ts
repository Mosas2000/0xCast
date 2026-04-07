/**
 * Network Types and Constants
 * 
 * Defines network configurations for Stacks blockchain
 */

export const NetworkType = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
} as const;

export type NetworkType = typeof NetworkType[keyof typeof NetworkType];

export interface NetworkConfig {
  name: string;
  label: string;
  chainId: number;
  apiUrl: string;
  explorerUrl: string;
  color: string;
  icon: string;
}

export const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
  [NetworkType.MAINNET]: {
    name: 'mainnet',
    label: 'Mainnet',
    chainId: 1,
    apiUrl: 'https://api.mainnet.hiro.so',
    explorerUrl: 'https://explorer.hiro.so',
    color: '#10B981', // green
    icon: '🟢',
  },
  [NetworkType.TESTNET]: {
    name: 'testnet',
    label: 'Testnet',
    chainId: 2147483648,
    apiUrl: 'https://api.testnet.hiro.so',
    explorerUrl: 'https://explorer.hiro.so/?chain=testnet',
    color: '#F59E0B', // amber
    icon: '🟡',
  },
};

// Default network
export const DEFAULT_NETWORK: NetworkType = NetworkType.MAINNET;

// LocalStorage key for persisting network selection
export const NETWORK_STORAGE_KEY = '0xcast_network';
