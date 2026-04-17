/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  loadRecentlyViewedEntries,
  recordRecentlyViewedMarket,
  removeRecentlyViewedMarket,
  saveRecentlyViewedEntries,
  type RecentlyViewedMarketEntry,
} from '../utils/recentlyViewed';

interface RecentlyViewedContextValue {
  entries: RecentlyViewedMarketEntry[];
  marketIds: number[];
  count: number;
  isRecentlyViewed: (marketId: number) => boolean;
  recordMarket: (marketId: number) => void;
  removeMarket: (marketId: number) => void;
  clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);

interface RecentlyViewedProviderProps {
  children: ReactNode;
}

export function RecentlyViewedProvider({ children }: RecentlyViewedProviderProps) {
  const [entries, setEntries] = useState<RecentlyViewedMarketEntry[]>(() => loadRecentlyViewedEntries());

  useEffect(() => {
    saveRecentlyViewedEntries(entries);
  }, [entries]);

  const isRecentlyViewed = useCallback(
    (marketId: number) => entries.some((entry) => entry.marketId === marketId),
    [entries]
  );

  const recordMarket = useCallback((marketId: number) => {
    setEntries((current) => recordRecentlyViewedMarket(current, marketId));
  }, []);

  const removeMarket = useCallback((marketId: number) => {
    setEntries((current) => removeRecentlyViewedMarket(current, marketId));
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setEntries([]);
  }, []);

  const value = useMemo<RecentlyViewedContextValue>(() => ({
    entries,
    marketIds: entries.map((entry) => entry.marketId),
    count: entries.length,
    isRecentlyViewed,
    recordMarket,
    removeMarket,
    clearRecentlyViewed,
  }), [entries, isRecentlyViewed, recordMarket, removeMarket, clearRecentlyViewed]);

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed(): RecentlyViewedContextValue {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  }
  return context;
}
