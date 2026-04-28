import { getExplorerUrls, type NetworkType } from '../config/network';

/**
 * Get transaction explorer URL
 */
export function getTransactionExplorerUrl(txId: string, network?: NetworkType): string {
  return getExplorerUrls(network).tx(txId);
}

/**
 * Get address explorer URL
 */
export function getAddressExplorerUrl(address: string, network?: NetworkType): string {
  return getExplorerUrls(network).address(address);
}

/**
 * Get contract explorer URL
 */
export function getContractExplorerUrl(identifier: string, network?: NetworkType): string {
  return getExplorerUrls(network).contract(identifier);
}
