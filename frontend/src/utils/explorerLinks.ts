/**
 * Explorer Links Utility
 * 
 * Provides network-aware functions for generating Hiro explorer URLs.
 * All functions accept an optional network parameter and default to the active network.
 * 
 * @module explorerLinks
 */

import { getExplorerUrls, type NetworkType } from '../config/network';

// Re-export NetworkType for convenience
export type { NetworkType };

/**
 * Type guard to check if a string is a valid NetworkType
 * 
 * @param value - Value to check
 * @returns True if value is a valid NetworkType
 */
export function isValidNetworkType(value: string): value is NetworkType {
  return value === 'mainnet' || value === 'testnet';
}

/**
 * Get transaction explorer URL for the specified network
 * 
 * @param txId - Transaction ID to view
 * @param network - Network type (mainnet or testnet). If not provided, uses active network
 * @returns Full URL to view the transaction on Hiro explorer
 * 
 * @example
 * ```typescript
 * const url = getTransactionExplorerUrl('0x123...', 'mainnet');
 * // Returns: https://explorer.hiro.so/txid/0x123...?chain=mainnet
 * ```
 */
export function getTransactionExplorerUrl(txId: string, network?: NetworkType): string {
  return getExplorerUrls(network).tx(txId);
}

/**
 * Get address explorer URL for the specified network
 * 
 * @param address - Stacks address to view
 * @param network - Network type (mainnet or testnet). If not provided, uses active network
 * @returns Full URL to view the address on Hiro explorer
 * 
 * @example
 * ```typescript
 * const url = getAddressExplorerUrl('SP2J6ZY...', 'mainnet');
 * // Returns: https://explorer.hiro.so/address/SP2J6ZY...?chain=mainnet
 * ```
 */
export function getAddressExplorerUrl(address: string, network?: NetworkType): string {
  return getExplorerUrls(network).address(address);
}

/**
 * Get contract explorer URL for the specified network
 * 
 * @param identifier - Contract identifier (address.contract-name)
 * @param network - Network type (mainnet or testnet). If not provided, uses active network
 * @returns Full URL to view the contract on Hiro explorer
 * 
 * @example
 * ```typescript
 * const url = getContractExplorerUrl('SP2J6ZY....my-contract', 'mainnet');
 * // Returns: https://explorer.hiro.so/txid/SP2J6ZY....my-contract?chain=mainnet
 * ```
 */
export function getContractExplorerUrl(identifier: string, network?: NetworkType): string {
  return getExplorerUrls(network).contract(identifier);
}
