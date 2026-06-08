import { useState, useEffect, useCallback } from 'react';
import { cacheManager } from '@/utils/cache';

interface UseCacheOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  storage?: 'memory' | 'session' | 'local';
  enabled?: boolean;
}

interface UseCacheResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
  isCached: boolean;
}

export function useCache<T>({
  key,
  fetcher,
  ttl = 5 * 60 * 1000,
  storage = 'memory',
  enabled = true,
}: UseCacheOptions<T>): UseCacheResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    const cached = cacheManager.get<T>(key, storage);
    if (cached) {
      setData(cached);
      setIsCached(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsCached(false);

    try {
      const result = await fetcher();
      cacheManager.set(key, result, { ttl, storage });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttl, storage, enabled]);

  const invalidate = useCallback(() => {
    cacheManager.delete(key, storage);
    setIsCached(false);
  }, [key, storage]);

  const refetch = useCallback(async () => {
    invalidate();
    await fetchData();
  }, [invalidate, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate,
    isCached,
  };
}
