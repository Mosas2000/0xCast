import { useState, useEffect, useCallback } from 'react';
import { cvToJSON, fetchCallReadOnlyFunction, uintCV } from '@stacks/transactions';
import { useNetwork } from '../contexts/NetworkContext';
import { MARKET_MULTI_CONTRACT } from '../config/contracts';
import type { MultiMarket } from '../types/market';
import { parseMultiMarketData } from '../utils/multiMarket';

export function useMultiMarkets() {
  const { stacksNetwork } = useNetwork();
  const [markets, setMarkets] = useState<MultiMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = useCallback(async () => {
    try {
      setIsLoading(true);
      const contractAddress = MARKET_MULTI_CONTRACT.address;
      const contractName = MARKET_MULTI_CONTRACT.name;

      const counter = await fetchCallReadOnlyFunction({
        network: stacksNetwork,
        contractAddress,
        contractName,
        functionName: 'get-multi-market-counter',
        functionArgs: [],
        senderAddress: contractAddress,
      });

      const counterJson = cvToJSON(counter);
      if (counterJson.type !== 'response' || counterJson.value?.type !== 'uint') {
        throw new Error('Unexpected multi-market counter response');
      }

      const totalMarkets = Number(counterJson.value.value);
      if (totalMarkets === 0) {
        setMarkets([]);
        setError(null);
        return;
      }

      const requests = Array.from({ length: totalMarkets }, (_, index) =>
        fetchCallReadOnlyFunction({
          network: stacksNetwork,
          contractAddress,
          contractName,
          functionName: 'get-multi-market',
          functionArgs: [uintCV(index + 1)],
          senderAddress: contractAddress,
        })
      );

      const responses = await Promise.all(requests);
      const parsed: MultiMarket[] = [];

      responses.forEach((response, idx) => {
        const json = cvToJSON(response);
        if (json.type === 'some' && json.value) {
          parsed.push(parseMultiMarketData(idx + 1, json.value));
        }
      });

      setMarkets(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch multi-outcome markets');
    } finally {
      setIsLoading(false);
    }
  }, [stacksNetwork]);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  return { markets, isLoading, error, refetch: fetchMarkets };
}
