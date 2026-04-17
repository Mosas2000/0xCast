export const RECENTLY_VIEWED_STORAGE_KEY = '0xcast_recently_viewed';
export const RECENTLY_VIEWED_LIMIT = 10;

export interface RecentlyViewedMarketEntry {
  marketId: number;
  viewedAt: number;
}

let recentlyViewedMemoryEntries: RecentlyViewedMarketEntry[] = [];

function getStorage(): Storage | undefined {
  return typeof globalThis.localStorage !== 'undefined' ? globalThis.localStorage : undefined;
}

function normalizeMarketId(value: unknown): number | null {
  const numericId = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }
  return numericId;
}

function normalizeViewedAt(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  return fallback;
}

export function normalizeRecentlyViewedEntries(entries: unknown[]): RecentlyViewedMarketEntry[] {
  const byMarketId = new Map<number, RecentlyViewedMarketEntry>();

  for (const entry of entries) {
    let marketId: number | null = null;
    let viewedAt = 0;

    if (typeof entry === 'number' || typeof entry === 'string') {
      marketId = normalizeMarketId(entry);
    } else if (typeof entry === 'object' && entry !== null) {
      const record = entry as Record<string, unknown>;
      marketId = normalizeMarketId(record.marketId ?? record.id);
      viewedAt = normalizeViewedAt(record.viewedAt ?? record.timestamp, viewedAt);
    }

    if (marketId === null) {
      continue;
    }

    const normalizedEntry = { marketId, viewedAt };
    const existing = byMarketId.get(marketId);
    if (!existing || normalizedEntry.viewedAt > existing.viewedAt) {
      byMarketId.set(marketId, normalizedEntry);
    }
  }

  return [...byMarketId.values()]
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .slice(0, RECENTLY_VIEWED_LIMIT);
}

export function loadRecentlyViewedEntries(): RecentlyViewedMarketEntry[] {
  const storage = getStorage();
  let persistedEntries: RecentlyViewedMarketEntry[] | null = null;

  if (storage) {
    try {
      const stored = storage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        persistedEntries = Array.isArray(parsed) ? normalizeRecentlyViewedEntries(parsed) : [];
      }
    } catch (error) {
      console.warn('Failed to load recently viewed markets:', error);
    }
  }

  if (persistedEntries !== null) {
    recentlyViewedMemoryEntries = persistedEntries;
    return persistedEntries;
  }

  return [...recentlyViewedMemoryEntries];
}

export function saveRecentlyViewedEntries(entries: RecentlyViewedMarketEntry[]): void {
  const normalized = normalizeRecentlyViewedEntries(entries);
  recentlyViewedMemoryEntries = [...normalized];

  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.warn('Failed to save recently viewed markets:', error);
  }
}

export function recordRecentlyViewedMarket(
  entries: RecentlyViewedMarketEntry[],
  marketId: number,
  viewedAt = Date.now()
): RecentlyViewedMarketEntry[] {
  const normalizedMarketId = normalizeMarketId(marketId);
  if (normalizedMarketId === null) {
    return entries;
  }

  const filtered = entries.filter((entry) => entry.marketId !== normalizedMarketId);
  return normalizeRecentlyViewedEntries([
    { marketId: normalizedMarketId, viewedAt },
    ...filtered,
  ]);
}

export function removeRecentlyViewedMarket(
  entries: RecentlyViewedMarketEntry[],
  marketId: number
): RecentlyViewedMarketEntry[] {
  const normalizedMarketId = normalizeMarketId(marketId);
  if (normalizedMarketId === null) {
    return entries;
  }

  return entries.filter((entry) => entry.marketId !== normalizedMarketId);
}
