import { renderHook, act } from '@testing-library/react';
import { useRateLimit } from '../useRateLimit';
import { rateLimitMiddleware } from '../../middleware/RateLimitMiddleware';
import { useWallet } from '../../components/WalletProvider';

jest.mock('../../middleware/RateLimitMiddleware');
jest.mock('../../components/WalletProvider');

describe('useRateLimit', () => {
  const mockAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';

  beforeEach(() => {
    jest.clearAllMocks();
    (useWallet as jest.Mock).mockReturnValue({ address: mockAddress });
  });

  describe('checkRateLimit', () => {
    it('should check and record rate limit', async () => {
      const mockResult = {
        allowed: true,
        remaining: 9,
        resetTime: Date.now() + 60000,
      };

      (rateLimitMiddleware.checkAndRecord as jest.Mock).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useRateLimit());

      let checkResult;
      await act(async () => {
        checkResult = await result.current.checkRateLimit('stake');
      });

      expect(checkResult).toEqual(mockResult);
      expect(rateLimitMiddleware.checkAndRecord).toHaveBeenCalledWith({
        userId: mockAddress,
        action: 'stake',
      });
    });

    it('should return not allowed when wallet not connected', async () => {
      (useWallet as jest.Mock).mockReturnValue({ address: null });

      const { result } = renderHook(() => useRateLimit());

      let checkResult;
      await act(async () => {
        checkResult = await result.current.checkRateLimit('stake');
      });

      expect(checkResult.allowed).toBe(false);
      expect(checkResult.reason).toBe('Wallet not connected');
    });

    it('should handle errors gracefully', async () => {
      (rateLimitMiddleware.checkAndRecord as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useRateLimit());

      let checkResult;
      await act(async () => {
        checkResult = await result.current.checkRateLimit('stake');
      });

      expect(checkResult.allowed).toBe(false);
      expect(checkResult.reason).toBe('Network error');
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return rate limit status', () => {
      const mockStatus = {
        count: 5,
        limit: 10,
        remaining: 5,
        resetTime: Date.now() + 60000,
        blocked: false,
      };

      (rateLimitMiddleware.getStatus as jest.Mock).mockReturnValue(mockStatus);

      const { result } = renderHook(() => useRateLimit());

      const status = result.current.getRateLimitStatus('stake');

      expect(status).toEqual(mockStatus);
      expect(rateLimitMiddleware.getStatus).toHaveBeenCalledWith(mockAddress, 'stake');
    });

    it('should return empty status when wallet not connected', () => {
      (useWallet as jest.Mock).mockReturnValue({ address: null });

      const { result } = renderHook(() => useRateLimit());

      const status = result.current.getRateLimitStatus('stake');

      expect(status.count).toBe(0);
      expect(status.limit).toBe(0);
      expect(status.blocked).toBe(false);
    });
  });

  describe('getAllRateLimits', () => {
    it('should return all rate limits', () => {
      const mockLimits = new Map([
        ['stake', { count: 5, limit: 10, remaining: 5, resetTime: Date.now(), blocked: false }],
        ['create-market', { count: 2, limit: 5, remaining: 3, resetTime: Date.now(), blocked: false }],
      ]);

      (rateLimitMiddleware.getAllStatus as jest.Mock).mockReturnValue(mockLimits);

      const { result } = renderHook(() => useRateLimit());

      const limits = result.current.getAllRateLimits();

      expect(limits).toEqual(mockLimits);
      expect(rateLimitMiddleware.getAllStatus).toHaveBeenCalledWith(mockAddress);
    });

    it('should return empty map when wallet not connected', () => {
      (useWallet as jest.Mock).mockReturnValue({ address: null });

      const { result } = renderHook(() => useRateLimit());

      const limits = result.current.getAllRateLimits();

      expect(limits.size).toBe(0);
    });
  });

  describe('loading state', () => {
    it('should set loading state during check', async () => {
      (rateLimitMiddleware.checkAndRecord as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ allowed: true, remaining: 9, resetTime: Date.now() }), 100))
      );

      const { result } = renderHook(() => useRateLimit());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.checkRateLimit('stake');
      });

      expect(result.current.isLoading).toBe(true);
    });
  });
});
