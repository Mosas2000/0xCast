import { useCallback } from 'react';
import { cvToJSON, fetchCallReadOnlyFunction, uintCV } from '@stacks/transactions';
import { useNetwork } from '@/contexts/NetworkContext';
import { parseMarketData } from '@/utils/helpers';
import { marketCacheService } from '@/services/MarketCacheService';
import { useCache } from './useCache';
import type { Market } from '@/types/market';

interface UseCachedMarketOptions {
  marketId: number;
  enabled?: boolean;
}

export function useCachedMarket({ marketId, enabled = true }: UseCachedMarketOptions) {
  const { stacksNetwork, contractAddress, contractName } = useNetwork();

  const fetcher = useCallback(async (): Promise<Market> => {
    const result = await fetchCallReadOnlyFunction({
      network: stacksNetwork,
      contractAddress,
      contractName,
      functionName: 'get-market',
      functionArgs: [uintCV(marketId)],
      senderAddress: contractAddress,
    });

    const jsonResult = cvToJSON(result);
    if (jsonResult.type === 'some' && jsonResult.value) {
      const market = parseMarketData(marketId, jsonResult.value);
      marketCacheService.setMarket(marketId, market);
      return market;
    }

    throw new Error('Market not found');
  }, [marketId, stacksNetwork, contractAddress, contractName]);

  const cacheResult = useCache<Market>({
    key: `market_${marketId}`,
    fetcher,
    ttl: 30 * 1000,
    storage: 'memory',
    enabled,
  });

  const invalidate = useCallback(() => {
    marketCacheService.invalidateMarket(marketId);
    cacheResult.invalidate();
  }, [marketId, cacheResult]);

  return {
    ...cacheResult,
    invalidate,
  };
}
