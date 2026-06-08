import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApiCall } from '../useApiCall';
import { ApiError, ErrorCode } from '../../utils/apiErrors';

describe('useApiCall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute API call successfully', async () => {
    const apiFunction = vi.fn().mockResolvedValue({ data: 'success' });

    const { result } = renderHook(() => useApiCall(apiFunction));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();

    result.current.execute();

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ data: 'success' });
    expect(result.current.error).toBeNull();
    expect(apiFunction).toHaveBeenCalledTimes(1);
  });

  it('should handle API call failure', async () => {
    const error = new ApiError('API failed', ErrorCode.SERVER_ERROR);
    const apiFunction = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useApiCall(apiFunction));

    result.current.execute();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.data).toBeNull();
  });

  it('should retry on retryable errors', async () => {
    const apiFunction = vi
      .fn()
      .mockRejectedValueOnce(new ApiError('Network error', ErrorCode.NETWORK_ERROR))
      .mockResolvedValue({ data: 'success' });

    const { result } = renderHook(() =>
      useApiCall(apiFunction, { maxRetries: 2, retryDelay: 100 })
    );

    result.current.execute();

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    expect(result.current.data).toEqual({ data: 'success' });
    expect(apiFunction).toHaveBeenCalledTimes(2);
  });

  it('should not retry on non-retryable errors', async () => {
    const error = new ApiError('Validation error', ErrorCode.VALIDATION_ERROR);
    const apiFunction = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() =>
      useApiCall(apiFunction, { maxRetries: 2 })
    );

    result.current.execute();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(error);
    expect(apiFunction).toHaveBeenCalledTimes(1);
  });

  it('should reset state', async () => {
    const apiFunction = vi.fn().mockResolvedValue({ data: 'success' });

    const { result } = renderHook(() => useApiCall(apiFunction));

    result.current.execute();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ data: 'success' });

    result.current.reset();

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should pass arguments to API function', async () => {
    const apiFunction = vi.fn().mockResolvedValue({ data: 'success' });

    const { result } = renderHook(() => useApiCall(apiFunction));

    result.current.execute('arg1', 'arg2', 123);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiFunction).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });

  it('should handle multiple concurrent calls', async () => {
    let callCount = 0;
    const apiFunction = vi.fn().mockImplementation(async () => {
      callCount++;
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { data: `call-${callCount}` };
    });

    const { result } = renderHook(() => useApiCall(apiFunction));

    result.current.execute();
    result.current.execute();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiFunction).toHaveBeenCalledTimes(2);
  });

  it('should call onSuccess callback', async () => {
    const apiFunction = vi.fn().mockResolvedValue({ data: 'success' });
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useApiCall(apiFunction, { onSuccess })
    );

    result.current.execute();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(onSuccess).toHaveBeenCalledWith({ data: 'success' });
  });

  it('should call onError callback', async () => {
    const error = new ApiError('API failed', ErrorCode.SERVER_ERROR);
    const apiFunction = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    const { result } = renderHook(() => useApiCall(apiFunction, { onError }));

    result.current.execute();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should handle immediate execution', async () => {
    const apiFunction = vi.fn().mockResolvedValue({ data: 'success' });

    const { result } = renderHook(() =>
      useApiCall(apiFunction, { immediate: true })
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ data: 'success' });
    expect(apiFunction).toHaveBeenCalledTimes(1);
  });
});
