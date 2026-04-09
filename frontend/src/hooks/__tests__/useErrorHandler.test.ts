import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';

describe('useErrorHandler', () => {
  // Suppress console.error during tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe('initial state', () => {
    it('starts with null error', () => {
      const { result } = renderHook(() => useErrorHandler());
      expect(result.current.error).toBeNull();
    });

    it('starts with isError false', () => {
      const { result } = renderHook(() => useErrorHandler());
      expect(result.current.isError).toBe(false);
    });
  });

  describe('handleError', () => {
    it('handles Error objects', () => {
      const { result } = renderHook(() => useErrorHandler());
      const testError = new Error('Test error message');

      act(() => {
        result.current.handleError(testError);
      });

      expect(result.current.error).toBe(testError);
      expect(result.current.error?.message).toBe('Test error message');
      expect(result.current.isError).toBe(true);
    });

    it('handles string errors', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError('String error message');
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('String error message');
      expect(result.current.isError).toBe(true);
    });

    it('handles unknown error types', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError({ unknownType: true });
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('An unknown error occurred');
      expect(result.current.isError).toBe(true);
    });

    it('handles null/undefined errors', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(null);
      });

      expect(result.current.error?.message).toBe('An unknown error occurred');
    });
  });

  describe('clearError', () => {
    it('clears the error state', () => {
      const { result } = renderHook(() => useErrorHandler());

      // Set an error first
      act(() => {
        result.current.handleError(new Error('Test error'));
      });
      expect(result.current.isError).toBe(true);

      // Clear it
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isError).toBe(false);
    });

    it('can be called multiple times safely', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.clearError();
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('withErrorHandling', () => {
    it('returns value on successful promise', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const successValue = { data: 'success' };

      let returnedValue: typeof successValue | undefined;
      await act(async () => {
        returnedValue = await result.current.withErrorHandling(
          Promise.resolve(successValue)
        );
      });

      expect(returnedValue).toEqual(successValue);
      expect(result.current.error).toBeNull();
      expect(result.current.isError).toBe(false);
    });

    it('catches errors and returns undefined', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const testError = new Error('Async error');

      let returnedValue: string | undefined;
      await act(async () => {
        returnedValue = await result.current.withErrorHandling(
          Promise.reject(testError)
        );
      });

      expect(returnedValue).toBeUndefined();
      expect(result.current.error).toBe(testError);
      expect(result.current.isError).toBe(true);
    });

    it('handles async functions', async () => {
      const { result } = renderHook(() => useErrorHandler());

      const asyncFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'delayed result';
      };

      let returnedValue: string | undefined;
      await act(async () => {
        returnedValue = await result.current.withErrorHandling(asyncFn());
      });

      expect(returnedValue).toBe('delayed result');
    });
  });

  describe('callback stability', () => {
    it('maintains stable references', () => {
      const { result, rerender } = renderHook(() => useErrorHandler());

      const initialHandleError = result.current.handleError;
      const initialClearError = result.current.clearError;
      const initialWithErrorHandling = result.current.withErrorHandling;

      rerender();

      expect(result.current.handleError).toBe(initialHandleError);
      expect(result.current.clearError).toBe(initialClearError);
      expect(result.current.withErrorHandling).toBe(initialWithErrorHandling);
    });
  });
});
