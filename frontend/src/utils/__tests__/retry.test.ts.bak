import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retryWithBackoff, RetryConfig } from '../retry';
import { ApiError, ErrorCode } from '../apiErrors';

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, { maxRetries: 3, initialDelay: 100 });

    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(200);

    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent failure'));

    const promise = retryWithBackoff(fn, { maxRetries: 2, initialDelay: 100 });

    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(200);

    await expect(promise).rejects.toThrow('persistent failure');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, { maxRetries: 3, initialDelay: 100 });

    await vi.advanceTimersByTimeAsync(100);
    expect(fn).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(200);
    expect(fn).toHaveBeenCalledTimes(3);

    await promise;
  });

  it('should respect max delay', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 1500,
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(fn).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1500);
    expect(fn).toHaveBeenCalledTimes(3);

    await promise;
  });

  it('should not retry non-retryable errors', async () => {
    const nonRetryableError = new ApiError(
      'Validation failed',
      ErrorCode.VALIDATION_ERROR
    );
    const fn = vi.fn().mockRejectedValue(nonRetryableError);

    await expect(
      retryWithBackoff(fn, { maxRetries: 3, initialDelay: 100 })
    ).rejects.toThrow('Validation failed');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry network errors', async () => {
    const networkError = new ApiError('Network error', ErrorCode.NETWORK_ERROR);
    const fn = vi
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, { maxRetries: 2, initialDelay: 100 });

    await vi.advanceTimersByTimeAsync(100);

    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should retry timeout errors', async () => {
    const timeoutError = new ApiError('Timeout', ErrorCode.TIMEOUT);
    const fn = vi
      .fn()
      .mockRejectedValueOnce(timeoutError)
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, { maxRetries: 2, initialDelay: 100 });

    await vi.advanceTimersByTimeAsync(100);

    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should call onRetry callback', async () => {
    const onRetry = vi.fn();
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, {
      maxRetries: 2,
      initialDelay: 100,
      onRetry,
    });

    await vi.advanceTimersByTimeAsync(100);

    await promise;
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1);
  });

  it('should handle custom shouldRetry function', async () => {
    const shouldRetry = vi.fn().mockReturnValue(false);
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    await expect(
      retryWithBackoff(fn, { maxRetries: 3, initialDelay: 100, shouldRetry })
    ).rejects.toThrow('fail');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should add jitter to delay', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, {
      maxRetries: 2,
      initialDelay: 100,
      jitter: true,
    });

    await vi.advanceTimersByTimeAsync(150);

    await promise;
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
