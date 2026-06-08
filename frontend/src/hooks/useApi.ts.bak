/**
 * Network-Aware API Hook
 * 
 * Provides API utilities that automatically use the current network
 */

import { useMemo } from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { API_URLS, EXPLORER_URLS } from '@/config/network';

export interface ApiConfig {
  baseUrl: string;
  nodeUrl: string;
  explorerTx: (txId: string) => string;
  explorerAddress: (address: string) => string;
  explorerContract: (identifier: string) => string;
}

export function useApi(): ApiConfig {
  const { network } = useNetwork();

  return useMemo(() => {
    const networkKey = network as 'mainnet' | 'testnet';
    const apiUrls = API_URLS[networkKey];
    const explorerUrls = EXPLORER_URLS[networkKey];

    return {
      baseUrl: apiUrls.hiro,
      nodeUrl: apiUrls.node,
      explorerTx: explorerUrls.tx,
      explorerAddress: explorerUrls.address,
      explorerContract: explorerUrls.contract,
    };
  }, [network]);
}

/**
 * Fetch wrapper that automatically uses correct network API
 */
export function useNetworkFetch() {
  const { baseUrl } = useApi();

  return useMemo(() => {
    return async function networkFetch<T>(
      endpoint: string,
      options?: RequestInit
    ): Promise<T> {
      const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    };
  }, [baseUrl]);
}

/**
 * Get explorer URL for a transaction
 */
export function useExplorerUrl() {
  const { explorerTx, explorerAddress, explorerContract } = useApi();

  return useMemo(() => ({
    transaction: explorerTx,
    address: explorerAddress,
    contract: explorerContract,
  }), [explorerTx, explorerAddress, explorerContract]);
}
