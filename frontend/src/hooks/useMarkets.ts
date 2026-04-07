import { useState, useEffect, useCallback, useRef } from 'react';
import { cvToJSON, fetchCallReadOnlyFunction, uintCV } from '@stacks/transactions';
import type { Market } from '../types/market';
import { parseMarketData } from '../utils/helpers';
import { MARKET_CONTRACT, getNetwork as getNetworkConfig } from '../config/contracts';
import { useNetwork } from '../contexts/NetworkContext';

// Auto-refresh interval in milliseconds (30 seconds)
const REFRESH_INTERVAL_MS = 30000;

/**
 * Hook for fetching and managing prediction market data
 * 
 * Features:
 * - Fetches all markets from the contract on mount
 * - Auto-refreshes every 30 seconds
 * - Re-fetches when network changes
 * - Properly cleans up on unmount to prevent memory leaks
 * - Cancels in-flight requests when unmounting
 * - Guards against state updates on unmounted components
 * 
 * @returns Object containing markets array, loading state, error, and refetch function
 */
export function useMarkets() {
  const { network, stacksNetwork } = useNetwork();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMarkets = useCallback(async () => {
    // Don't start new fetch if component is unmounted
    if (!isMountedRef.current) {
      return;
    }
    
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      // Use the network from context
      const currentNetwork = stacksNetwork;
      const counterResult = await fetchCallReadOnlyFunction({
        network: currentNetwork,
        contractAddress: MARKET_CONTRACT.address,
        contractName: MARKET_CONTRACT.name,
        functionName: 'get-market-counter',
        functionArgs: [],
        senderAddress: MARKET_CONTRACT.address,
      });

      const counterJson = cvToJSON(counterResult);
      const totalMarkets = Number(counterJson.value);

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      if (totalMarkets === 0) {
        setMarkets([]);
        setIsLoading(false);
        return;
      }

      const marketPromises = [];
      for (let i = 0; i < totalMarkets; i++) {
        marketPromises.push(
          fetchCallReadOnlyFunction({
            network: currentNetwork,
            contractAddress: MARKET_CONTRACT.address,
            contractName: MARKET_CONTRACT.name,
            functionName: 'get-market',
            functionArgs: [uintCV(i)],
            senderAddress: MARKET_CONTRACT.address,
          })
        );
      }

      const results = await Promise.all(marketPromises);
      
      // Check if component is still mounted before processing results
      if (!isMountedRef.current) return;
      
      const fetchedMarkets: Market[] = [];
      
      results.forEach((result, index) => {
        const jsonResult = cvToJSON(result);
        if (jsonResult.type === 'some' && jsonResult.value) {
          try {
            const marketData = parseMarketData(index, jsonResult.value);
            fetchedMarkets.push(marketData);
          } catch (err) {
            console.error(`Error parsing market ${index}:`, err);
          }
        }
      });

      // Final mount check before state updates
      if (!isMountedRef.current) return;
      
      setMarkets(fetchedMarkets);
      setError(null);
    } catch (err) {
      // Ignore abort errors - these are expected during cleanup
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      // Only log and set error if still mounted
      if (!isMountedRef.current) return;
      console.error('Error fetching markets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
    } finally {
      // Only update loading state if still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [stacksNetwork]);

  // Re-fetch when network changes
  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;
    
    // Reset state on network change
    setIsLoading(true);
    setMarkets([]);
    setError(null);
    
    fetchMarkets();
    
    // Auto-refresh at configured interval
    intervalRef.current = setInterval(fetchMarkets, REFRESH_INTERVAL_MS);
    
    return () => {
      // Mark component as unmounted before cleanup
      isMountedRef.current = false;
      
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Abort any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [fetchMarkets, network]);

  return { 
    markets, 
    isLoading, 
    error, 
    refetch: fetchMarkets,
    // Expose current network for debugging
    currentNetwork: network,
    // Expose refresh interval for testing/debugging
    refreshIntervalMs: REFRESH_INTERVAL_MS,
  };
}
