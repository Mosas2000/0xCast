import { useState, useCallback } from 'react';
import { ApiError } from '@/utils/apiErrors';
import { withRetry, RetryConfig } from '@/utils/retry';
import { errorLoggingService } from '@/services/ErrorLoggingService';

interface UseApiCallOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  retry?: Partial<RetryConfig>;
  logErrors?: boolean;
  component?: string;
}

interface UseApiCallResult<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useApiCall<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiCallOptions<T> = {}
): UseApiCallResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = options.retry
          ? await withRetry(() => apiFunction(...args), options.retry)
          : await apiFunction(...args);

        setData(result);
        setIsLoading(false);

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        const apiError = ApiError.fromError(err);
        setError(apiError);
        setIsLoading(false);

        if (options.logErrors !== false) {
          errorLoggingService.logError(apiError, {
            component: options.component,
            action: apiFunction.name,
          });
        }

        if (options.onError) {
          options.onError(apiError);
        }

        return null;
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}

export function useApiCallWithAutoRetry<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiCallOptions<T> = {}
): UseApiCallResult<T> {
  return useApiCall(apiFunction, {
    ...options,
    retry: {
      maxAttempts: 3,
      initialDelayMs: 1000,
      backoffMultiplier: 2,
      ...options.retry,
    },
  });
}
