import { describe, expect, it, beforeEach } from 'vitest';
import {
  loadRecentlyViewedEntries,
  normalizeRecentlyViewedEntries,
  recordRecentlyViewedMarket,
  saveRecentlyViewedEntries,
} from '../recentlyViewed';

describe('recently viewed utilities', () => {
  beforeEach(() => {
    saveRecentlyViewedEntries([]);
  });

  it('normalizes entries and keeps the most recent item first', () => {
    const normalized = normalizeRecentlyViewedEntries([
      { marketId: 2, viewedAt: 200 },
      { marketId: 1, viewedAt: 100 },
      { marketId: 2, viewedAt: 300 },
      3,
      { marketId: '4', timestamp: 400 },
      { marketId: -1, viewedAt: 999 },
    ]);

    expect(normalized).toEqual([
      { marketId: 4, viewedAt: 400 },
      { marketId: 2, viewedAt: 300 },
      { marketId: 1, viewedAt: 100 },
      { marketId: 3, viewedAt: expect.any(Number) },
    ]);
  });

  it('records markets in recency order and truncates to the limit', () => {
    const entries = recordRecentlyViewedMarket([], 7, 100);
    const updated = recordRecentlyViewedMarket(entries, 3, 200);
    const reordered = recordRecentlyViewedMarket(updated, 7, 300);

    expect(reordered.map((entry) => entry.marketId)).toEqual([7, 3]);

    const seeded = Array.from({ length: 12 }, (_, index) => ({
      marketId: index + 1,
      viewedAt: index + 1,
    }));
    saveRecentlyViewedEntries(seeded);

    expect(loadRecentlyViewedEntries()).toHaveLength(10);
    expect(loadRecentlyViewedEntries()[0]).toMatchObject({ marketId: 12 });
    expect(loadRecentlyViewedEntries()[9]).toMatchObject({ marketId: 3 });
  });
});
