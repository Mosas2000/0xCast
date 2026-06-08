import { useCallback, useEffect, useState } from 'react';
import { cvToJSON, fetchCallReadOnlyFunction } from '@stacks/transactions';
import { MARKET_CONTRACT } from '@/config/contracts';
import { useNetwork } from '@/contexts/NetworkContext';

export function useContractPause() {
  const { stacksNetwork } = useNetwork();
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchCallReadOnlyFunction({
        network: stacksNetwork,
        contractAddress: MARKET_CONTRACT.address,
        contractName: MARKET_CONTRACT.name,
        functionName: 'is-contract-paused',
        functionArgs: [],
        senderAddress: MARKET_CONTRACT.address,
      });

      const parsed = cvToJSON(response);
      if (parsed.type !== 'bool') {
        throw new Error('Unexpected pause status response');
      }

      setIsPaused(parsed.value);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pause state');
    } finally {
      setIsLoading(false);
    }
  }, [stacksNetwork]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { isPaused, isLoading, error, refetch };
}
