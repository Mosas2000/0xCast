import { describe, expect, it } from 'vitest';
import {
  addWatchlistId,
  normalizeWatchlistIds,
  removeWatchlistId,
  toggleWatchlistId,
} from '../watchlist';

describe('watchlist utilities', () => {
  it('normalizes watchlist ids into unique positive integers', () => {
    expect(normalizeWatchlistIds([1, '2', 2, 0, -1, 'bad', 3.5, 3])).toEqual([1, 2, 3]);
  });

  it('adds, removes, and toggles ids predictably', () => {
    expect(addWatchlistId([1], 2)).toEqual([1, 2]);
    expect(removeWatchlistId([1, 2], 1)).toEqual([2]);
    expect(toggleWatchlistId([1], 1)).toEqual([]);
    expect(toggleWatchlistId([1], 2)).toEqual([1, 2]);
  });
});
