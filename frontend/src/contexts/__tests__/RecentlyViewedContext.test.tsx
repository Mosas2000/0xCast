import type { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { RecentlyViewedProvider, useRecentlyViewed } from '../RecentlyViewedContext';
import { loadRecentlyViewedEntries, saveRecentlyViewedEntries } from '../../utils/recentlyViewed';

function wrapper({ children }: { children: ReactNode }) {
  return <RecentlyViewedProvider>{children}</RecentlyViewedProvider>;
}

describe('RecentlyViewedContext', () => {
  beforeEach(() => {
    saveRecentlyViewedEntries([]);
  });

  it('records, reorders, and clears recently viewed markets', () => {
    saveRecentlyViewedEntries([
      { marketId: 2, viewedAt: 100 },
      { marketId: 5, viewedAt: 50 },
    ]);

    const { result } = renderHook(() => useRecentlyViewed(), { wrapper });

    expect(result.current.marketIds).toEqual([2, 5]);
    expect(result.current.count).toBe(2);

    act(() => {
      result.current.recordMarket(8);
    });

    expect(result.current.marketIds[0]).toBe(8);
    expect(loadRecentlyViewedEntries()[0]).toMatchObject({ marketId: 8 });

    act(() => {
      result.current.recordMarket(2);
    });

    expect(result.current.marketIds[0]).toBe(2);
    expect(result.current.count).toBe(3);

    act(() => {
      result.current.removeMarket(5);
    });

    expect(result.current.marketIds).toEqual([2, 8]);

    act(() => {
      result.current.clearRecentlyViewed();
    });

    expect(result.current.marketIds).toEqual([]);
    expect(loadRecentlyViewedEntries()).toEqual([]);
  });
});
