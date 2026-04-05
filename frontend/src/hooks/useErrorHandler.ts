import { useState, useCallback } from 'react';

interface UseErrorHandlerResult {
  error: Error | null;
  isError: boolean;
  handleError: (error: unknown) => void;
  clearError: () => void;
  withErrorHandling: <T>(promise: Promise<T>) => Promise<T | undefined>;
}

/**
 * useErrorHandler Hook
 * 
 * Provides error state management for functional components.
 * Use with async operations to capture and display errors.
 * 
 * Usage:
 * const { error, handleError, clearError, withErrorHandling } = useErrorHandler();
 * 
 * // Method 1: Direct error handling
 * try {
 *   await someAsyncOperation();
 * } catch (err) {
 *   handleError(err);
 * }
 * 
 * // Method 2: Wrapped promise
 * const result = await withErrorHandling(someAsyncOperation());
 */
export function useErrorHandler(): UseErrorHandlerResult {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err);
      console.error('Error caught by useErrorHandler:', err);
    } else if (typeof err === 'string') {
      setError(new Error(err));
      console.error('Error caught by useErrorHandler:', err);
    } else {
      setError(new Error('An unknown error occurred'));
      console.error('Unknown error caught by useErrorHandler:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(
    async <T,>(promise: Promise<T>): Promise<T | undefined> => {
      try {
        return await promise;
      } catch (err) {
        handleError(err);
        return undefined;
      }
    },
    [handleError]
  );

  return {
    error,
    isError: error !== null,
    handleError,
    clearError,
    withErrorHandling,
  };
}

export default useErrorHandler;
