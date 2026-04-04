import { useState, useCallback, useEffect } from 'react';
import { cvToJSON, fetchCallReadOnlyFunction, uintCV, principalCV } from '@stacks/transactions';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import type { Position } from '../types/market';
import { parsePosition } from '../utils/helpers';
import { MARKET_CONTRACT, CURRENT_NETWORK } from '../config/contracts';

// Get the appropriate network based on configuration
const getNetwork = () => CURRENT_NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

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
      const network = getNetwork();
      const result = await fetchCallReadOnlyFunction({
        network,
        contractAddress: MARKET_CONTRACT.address,
        contractName: MARKET_CONTRACT.name,
        functionName: 'get-user-position',
        functionArgs: [uintCV(marketId), principalCV(userAddress)],
        senderAddress: MARKET_CONTRACT.address,
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

  // Auto-fetch position when marketId or userAddress changes
  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  return { position, isLoading, error, refetch: fetchPosition };
}
