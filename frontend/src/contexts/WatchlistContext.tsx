/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  addWatchlistId,
  loadWatchlistIds,
  removeWatchlistId,
  saveWatchlistIds,
  toggleWatchlistId,
} from '@/utils/watchlist';

interface WatchlistContextValue {
  marketIds: number[];
  count: number;
  isWatched: (marketId: number) => boolean;
  addMarket: (marketId: number) => void;
  removeMarket: (marketId: number) => void;
  toggleMarket: (marketId: number) => void;
  clearWatchlist: () => void;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

interface WatchlistProviderProps {
  children: ReactNode;
}

export function WatchlistProvider({ children }: WatchlistProviderProps) {
  const [marketIds, setMarketIds] = useState<number[]>(() => loadWatchlistIds());

  useEffect(() => {
    saveWatchlistIds(marketIds);
  }, [marketIds]);

  const isWatched = useCallback(
    (marketId: number) => marketIds.includes(marketId),
    [marketIds]
  );

  const addMarket = useCallback((marketId: number) => {
    setMarketIds((current) => addWatchlistId(current, marketId));
  }, []);

  const removeMarket = useCallback((marketId: number) => {
    setMarketIds((current) => removeWatchlistId(current, marketId));
  }, []);

  const toggleMarket = useCallback((marketId: number) => {
    setMarketIds((current) => toggleWatchlistId(current, marketId));
  }, []);

  const clearWatchlist = useCallback(() => {
    setMarketIds([]);
  }, []);

  const value = useMemo<WatchlistContextValue>(() => ({
    marketIds,
    count: marketIds.length,
    isWatched,
    addMarket,
    removeMarket,
    toggleMarket,
    clearWatchlist,
  }), [marketIds, isWatched, addMarket, removeMarket, toggleMarket, clearWatchlist]);

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist(): WatchlistContextValue {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within WatchlistProvider');
  }
  return context;
}
