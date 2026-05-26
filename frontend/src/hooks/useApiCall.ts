import { useState, useCallback, useEffect, useRef } from 'react';
import { ApiError } from '@/utils/apiErrors';
import { withRetry, RetryConfig } from '@/utils/retry';
import { errorLoggingService } from '@/services/ErrorLoggingService';

interface UseApiCallOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  retry?: Partial<RetryConfig>;
  logErrors?: boolean;
  component?: string;
  maxRetries?: number;
  retryDelay?: number;
  immediate?: boolean;
}

interface UseApiCallResult<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  loading: boolean;
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

  const apiFunctionRef = useRef(apiFunction);
  apiFunctionRef.current = apiFunction;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      const currentOptions = optionsRef.current;
      const currentApiFunction = apiFunctionRef.current;

      try {
        const retryConfig = currentOptions.retry || (currentOptions.maxRetries !== undefined ? {
          maxAttempts: currentOptions.maxRetries,
          initialDelayMs: currentOptions.retryDelay || 1000,
        } : undefined);

        const result = retryConfig
          ? await withRetry(() => currentApiFunction(...args), retryConfig)
          : await currentApiFunction(...args);

        setData(result);
        setIsLoading(false);

        if (currentOptions.onSuccess) {
          currentOptions.onSuccess(result);
        }

        return result;
      } catch (err) {
        const apiError = ApiError.fromError(err);
        setError(apiError);
        setIsLoading(false);

        if (currentOptions.logErrors !== false) {
          errorLoggingService.logError(apiError, {
            component: currentOptions.component,
            action: currentApiFunction.name,
          });
        }

        if (currentOptions.onError) {
          currentOptions.onError(apiError);
        }

        return null;
      }
    },
    []
  );

  useEffect(() => {
    if (optionsRef.current.immediate) {
      execute();
    }
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    loading: isLoading,
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
