import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { WatchlistProvider, useWatchlist } from '../WatchlistContext';
import { loadWatchlistIds, saveWatchlistIds } from '../../utils/watchlist';

function wrapper({ children }: { children: React.ReactNode }) {
  return <WatchlistProvider>{children}</WatchlistProvider>;
}

describe('WatchlistContext', () => {
  beforeEach(() => {
    saveWatchlistIds([]);
  });

  it('loads watchlist ids from storage and persists updates', async () => {
    saveWatchlistIds([3, 1]);

    const { result } = renderHook(() => useWatchlist(), { wrapper });

    await waitFor(() => {
      expect(result.current.marketIds).toEqual([3, 1]);
    });
    expect(result.current.count).toBe(2);
    expect(result.current.isWatched(3)).toBe(true);

    act(() => {
      result.current.toggleMarket(2);
    });

    expect(result.current.marketIds).toEqual([3, 1, 2]);
    expect(loadWatchlistIds()).toEqual([3, 1, 2]);

    act(() => {
      result.current.removeMarket(1);
    });

    expect(result.current.marketIds).toEqual([3, 2]);
    expect(loadWatchlistIds()).toEqual([3, 2]);

    act(() => {
      result.current.clearWatchlist();
    });

    expect(result.current.marketIds).toEqual([]);
    expect(loadWatchlistIds()).toEqual([]);
  });
});
