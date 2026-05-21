import { useCachedMarket } from '@/hooks/useCachedMarket';
import { CacheStatus } from '@/components/CacheStatus';
import { cacheInvalidationService } from '@/services/CacheInvalidationService';

export function CachingExample() {
  const { data: market, isLoading, isCached, refetch } = useCachedMarket({
    marketId: 1,
    enabled: true,
  });

  const handleInvalidate = () => {
    cacheInvalidationService.invalidateMarket(1, 'immediate');
    refetch();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!market) {
    return <div>Market not found</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{market.question}</h2>
        <CacheStatus isCached={isCached} lastUpdated={Date.now()} />
      </div>

      <div className="space-y-2">
        <p>Total Yes Stake: {market.totalYesStake}</p>
        <p>Total No Stake: {market.totalNoStake}</p>
      </div>

      <button
        onClick={handleInvalidate}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Data
      </button>
    </div>
  );
}
