import { useState, useCallback } from 'react';
import { cvToJSON, fetchCallReadOnlyFunction, uintCV, principalCV } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import type { Position } from '../types/market';
import { parsePosition } from '../utils/helpers';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants';

export function usePosition(marketId: number | null, userAddress: string | null) {
  const [position, setPosition] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosition = useCallback(async () => {
    if (marketId === null || !userAddress) {
      setPosition(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchCallReadOnlyFunction({
        network: STACKS_MAINNET,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-user-position',
        functionArgs: [uintCV(marketId), principalCV(userAddress)],
        senderAddress: CONTRACT_ADDRESS,
      });

      const jsonResult = cvToJSON(result);
      if (jsonResult.type === 'some' && jsonResult.value) {
        setPosition(parsePosition(marketId, userAddress, jsonResult.value));
      } else {
        setPosition(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch position');
    } finally {
      setIsLoading(false);
    }
  }, [marketId, userAddress]);

  return { position, isLoading, error, refetch: fetchPosition };
}
