import { useState, useEffect, useCallback, useRef } from 'react';
import { cvToJSON, fetchCallReadOnlyFunction, uintCV } from '@stacks/transactions';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import type { Market } from '../types/market';
import { parseMarketData } from '../utils/helpers';
import { MARKET_CONTRACT, CURRENT_NETWORK } from '../config/contracts';

// Get the appropriate network based on configuration
const getNetwork = () => CURRENT_NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMarkets = useCallback(async () => {
    try {
      const network = getNetwork();
      const counterResult = await fetchCallReadOnlyFunction({
        network,
        contractAddress: MARKET_CONTRACT.address,
        contractName: MARKET_CONTRACT.name,
        functionName: 'get-market-counter',
        functionArgs: [],
        senderAddress: MARKET_CONTRACT.address,
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
            network,
            contractAddress: MARKET_CONTRACT.address,
            contractName: MARKET_CONTRACT.name,
            functionName: 'get-market',
            functionArgs: [uintCV(i)],
            senderAddress: MARKET_CONTRACT.address,
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
