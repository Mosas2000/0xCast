export const WATCHLIST_STORAGE_KEY = '0xcast_watchlist';
let watchlistMemoryIds: number[] = [];

function getStorage(): Storage | undefined {
  return typeof globalThis.localStorage !== 'undefined' ? globalThis.localStorage : undefined;
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
  const storage = getStorage();
  let persistedIds: number[] | null = null;

  if (storage) {
    try {
      const stored = storage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        persistedIds = Array.isArray(parsed) ? normalizeWatchlistIds(parsed) : [];
      }
    } catch (error) {
      console.warn('Failed to load watchlist:', error);
    }
  }

  if (persistedIds !== null) {
    watchlistMemoryIds = persistedIds;
    return persistedIds;
  }

  return [...watchlistMemoryIds];
}

export function saveWatchlistIds(ids: number[]): void {
  const normalized = normalizeWatchlistIds(ids);
  watchlistMemoryIds = [...normalized];

  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(normalized));
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
