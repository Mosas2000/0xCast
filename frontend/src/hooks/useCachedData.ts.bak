import { useState, useEffect, useCallback } from 'react';
import { cacheManager } from '@/utils/cache';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface UseCachedDataOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  storage?: 'memory' | 'session' | 'local';
  enabled?: boolean;
  onSuccess?: (data: T, cached: boolean) => void;
  onError?: (error: Error) => void;
}

interface UseCachedDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isCached: boolean;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

export function useCachedData<T>({
  key,
  fetcher,
  ttl = 5 * 60 * 1000,
  storage = 'memory',
  enabled = true,
  onSuccess,
  onError,
}: UseCachedDataOptions<T>): UseCachedDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const endMeasure = performanceMonitor.startMeasure(key);

    const cached = cacheManager.get<T>(key, storage);
    if (cached) {
      setData(cached);
      setIsCached(true);
      setIsLoading(false);
      endMeasure(true);
      onSuccess?.(cached, true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsCached(false);

    try {
      const result = await fetcher();
      cacheManager.set(key, result, { ttl, storage });
      setData(result);
      endMeasure(false);
      onSuccess?.(result, false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttl, storage, enabled, onSuccess, onError]);

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
    isCached,
    refetch,
    invalidate,
  };
}
