import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useMarkets } from '@/hooks/useMarkets';
import { MarketCard } from '@/components/MarketCard';
import { useWatchlist } from '@/contexts/WatchlistContext';
import type { Market } from '@/types/market';

export function WatchlistPage() {
  const { markets, isLoading, error, refetch } = useMarkets();
  const { marketIds, count, clearWatchlist } = useWatchlist();

  const watchlistedMarkets = useMemo(() => {
    const marketById = new Map(markets.map((market) => [market.id, market]));
    return marketIds
      .map((marketId) => marketById.get(marketId))
      .filter((market): market is Market => market !== undefined);
  }, [markets, marketIds]);

  const hasSavedMarkets = count > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-[88px]">
      <div className="container py-16">
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500 mb-2">Watchlist</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white">Saved Markets</h1>
              <p className="mt-3 text-neutral-600 dark:text-neutral-400 max-w-2xl">
                Keep track of the markets you care about and return to them quickly from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={refetch}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-700 disabled:opacity-50"
              >
                Refresh
              </button>
              {hasSavedMarkets && (
                <button
                  type="button"
                  onClick={clearWatchlist}
                  className="inline-flex items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/20"
                >
                  Clear watchlist
                </button>
              )}
              <Link
                to="/markets"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Browse markets
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-500">
            <span className="inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-800 px-3 py-1">
              {count} saved
            </span>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
            <p className="font-semibold mb-1">Failed to load watchlist markets</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-6 text-neutral-600 dark:text-neutral-400">
            Loading saved markets...
          </div>
        ) : watchlistedMarkets.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {watchlistedMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-10 text-center">
            <h2 className="text-xl font-semibold text-black dark:text-white">Your watchlist is empty</h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Tap the heart button on any market card to save it here.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/markets"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Explore markets
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
