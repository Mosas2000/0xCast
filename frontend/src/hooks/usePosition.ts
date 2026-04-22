import { useState, useCallback, useEffect } from 'react';
import { cvToJSON, fetchCallReadOnlyFunction, uintCV, principalCV } from '@stacks/transactions';
import type { Position } from '../types/market';
import { parsePosition } from '../utils/helpers';
import { CONTRACT_NAMES, getContractAddress } from '../config/contracts';
import { useNetwork } from '../contexts/NetworkContext';

export function usePosition(marketId: number | null, userAddress: string | null) {
  const { stacksNetwork, network } = useNetwork();
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
      const contractAddress = getContractAddress(CONTRACT_NAMES.MARKET_CORE, network);
      const result = await fetchCallReadOnlyFunction({
        network: stacksNetwork,
        contractAddress,
        contractName: CONTRACT_NAMES.MARKET_CORE,
        functionName: 'get-user-position',
        functionArgs: [uintCV(marketId), principalCV(userAddress)],
        senderAddress: contractAddress,
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
  }, [marketId, userAddress, network, stacksNetwork]);

  // Auto-fetch position when marketId or userAddress changes
  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  return { position, isLoading, error, refetch: fetchPosition };
}
