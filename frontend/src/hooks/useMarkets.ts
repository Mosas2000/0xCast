import { useState, useEffect, useCallback, useRef } from 'react';
import { cvToJSON, fetchCallReadOnlyFunction, uintCV } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import type { Market } from '../types/market';
import { parseMarketData } from '../utils/helpers';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants';

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMarkets = useCallback(async () => {
    try {
      const counterResult = await fetchCallReadOnlyFunction({
        network: STACKS_MAINNET,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-market-counter',
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
      });

      const counterJson = cvToJSON(counterResult);
      const totalMarkets = Number(counterJson.value);

      if (totalMarkets === 0) {
        setMarkets([]);
        setIsLoading(false);
        return;
      }

      const marketPromises = [];
      for (let i = 0; i < totalMarkets; i++) {
        marketPromises.push(
          fetchCallReadOnlyFunction({
            network: STACKS_MAINNET,
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-market',
            functionArgs: [uintCV(i)],
            senderAddress: CONTRACT_ADDRESS,
          })
        );
      }

      const results = await Promise.all(marketPromises);
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

      setMarkets(fetchedMarkets);
      setError(null);
    } catch (err) {
      console.error('Error fetching markets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
    
    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(fetchMarkets, 30000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchMarkets]);

  return { markets, isLoading, error, refetch: fetchMarkets };
}
