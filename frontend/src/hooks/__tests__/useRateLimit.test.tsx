import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRateLimit, useAllRateLimits } from '../useRateLimit';
import { rateLimitService } from '@/services/RateLimitService';

vi.mock('@/services/RateLimitService', () => ({
  rateLimitService: {
    getStatus: vi.fn(),
    recordRequest: vi.fn(),
    getAllStatus: vi.fn(),
  },
}));

describe('useRateLimit', () => {
  const userId = 'test-user';
  const action = 'stake';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null status', () => {
    vi.mocked(rateLimitService.getStatus).mockReturnValue({
      action: 'stake',
      remaining: 10,
      resetAt: Date.now() + 60000,
      blocked: false,
    });

    const { result } = renderHook(() => useRateLimit(userId, action));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should check limit on mount', async () => {
    const mockStatus = {
      action: 'stake',
      remaining: 10,
      resetAt: Date.now() + 60000,
      blocked: false,
    };

    vi.mocked(rateLimitService.getStatus).mockReturnValue(mockStatus);

    const { result } = renderHook(() => useRateLimit(userId, action));

    await waitFor(() => {
      expect(result.current.status).toEqual(mockStatus);
    });

    expect(rateLimitService.getStatus).toHaveBeenCalledWith(userId, action);
  });

  it('should record request successfully', async () => {
    const mockStatus = {
      action: 'stake',
      remaining: 9,
      resetAt: Date.now() + 60000,
      blocked: false,
    };

    vi.mocked(rateLimitService.getStatus).mockReturnValue(mockStatus);
    vi.mocked(rateLimitService.recordRequest).mockReturnValue(mockStatus);

    const { result } = renderHook(() => useRateLimit(userId, action));

    await act(async () => {
      await result.current.recordRequest();
    });

    expect(rateLimitService.recordRequest).toHaveBeenCalledWith(userId, action);
    expect(result.current.status).toEqual(mockStatus);
  });

  it('should throw error when blocked', async () => {
    const blockedStatus = {
      action: 'stake',
      remaining: 0,
      resetAt: Date.now() + 60000,
      blocked: true,
      cooldownUntil: Date.now() + 5000,
    };

    vi.mocked(rateLimitService.getStatus).mockReturnValue(blockedStatus);
    vi.mocked(rateLimitService.recordRequest).mockReturnValue(blockedStatus);

    const { result } = renderHook(() => useRateLimit(userId, action));

    await expect(
      act(async () => {
        await result.current.recordRequest();
      })
    ).rejects.toThrow('Rate limit exceeded');
  });

  it('should expose blocked status', async () => {
    const blockedStatus = {
      action: 'stake',
      remaining: 0,
      resetAt: Date.now() + 60000,
      blocked: true,
      cooldownUntil: Date.now() + 5000,
    };

    vi.mocked(rateLimitService.getStatus).mockReturnValue(blockedStatus);

    const { result } = renderHook(() => useRateLimit(userId, action));

    await waitFor(() => {
      expect(result.current.isBlocked).toBe(true);
      expect(result.current.remaining).toBe(0);
    });
  });
});

describe('useAllRateLimits', () => {
  const userId = 'test-user';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all statuses on mount', async () => {
    const mockStatuses = [
      {
        action: 'stake',
        remaining: 10,
        resetAt: Date.now() + 60000,
        blocked: false,
      },
      {
        action: 'trade',
        remaining: 20,
        resetAt: Date.now() + 60000,
        blocked: false,
      },
    ];

    vi.mocked(rateLimitService.getAllStatus).mockReturnValue(mockStatuses as any);

    const { result } = renderHook(() => useAllRateLimits(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.statuses).toEqual(mockStatuses);
    });
  });

  it('should refresh statuses on demand', async () => {
    const mockStatuses = [
      {
        action: 'stake',
        remaining: 8,
        resetAt: Date.now() + 60000,
        blocked: false,
      },
    ];

    vi.mocked(rateLimitService.getAllStatus).mockReturnValue(mockStatuses as any);

    const { result } = renderHook(() => useAllRateLimits(userId));

    await act(async () => {
      result.current.refreshStatuses();
    });

    await waitFor(() => {
      expect(result.current.statuses).toEqual(mockStatuses);
    });
  });
});
