export const WATCHLIST_STORAGE_KEY = '0xcast_watchlist';

function hasWindowStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function normalizeWatchlistIds(ids: unknown[]): number[] {
  const normalized: number[] = [];

  for (const id of ids) {
    const numericId = typeof id === 'number' ? id : Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      continue;
    }
    if (!normalized.includes(numericId)) {
      normalized.push(numericId);
    }
  }

  return normalized;
}

export function loadWatchlistIds(): number[] {
  if (!hasWindowStorage()) {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? normalizeWatchlistIds(parsed) : [];
  } catch (error) {
    console.warn('Failed to load watchlist:', error);
    return [];
  }
}

export function saveWatchlistIds(ids: number[]): void {
  if (!hasWindowStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(normalizeWatchlistIds(ids)));
  } catch (error) {
    console.warn('Failed to save watchlist:', error);
  }
}

export function addWatchlistId(ids: number[], marketId: number): number[] {
  if (ids.includes(marketId)) {
    return ids;
  }

  return [...ids, marketId];
}

export function removeWatchlistId(ids: number[], marketId: number): number[] {
  return ids.filter((id) => id !== marketId);
}

export function toggleWatchlistId(ids: number[], marketId: number): number[] {
  return ids.includes(marketId) ? removeWatchlistId(ids, marketId) : addWatchlistId(ids, marketId);
}
