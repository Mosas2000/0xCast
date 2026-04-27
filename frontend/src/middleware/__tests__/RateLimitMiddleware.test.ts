import { RateLimitMiddleware } from '../RateLimitMiddleware';
import { rateLimitService } from '../../services/RateLimitService';

jest.mock('../../services/RateLimitService');

describe('RateLimitMiddleware', () => {
  let middleware: RateLimitMiddleware;

  beforeEach(() => {
    middleware = new RateLimitMiddleware();
    jest.clearAllMocks();
  });

  describe('checkAndRecord', () => {
    it('should check rate limit and record if allowed', async () => {
      const mockCheckResult = {
        allowed: true,
        remaining: 9,
        resetTime: Date.now() + 60000,
      };

      (rateLimitService.checkRateLimit as jest.Mock).mockReturnValue(mockCheckResult);
      (rateLimitService.recordRequest as jest.Mock).mockReturnValue(undefined);

      const result = await middleware.checkAndRecord({
        userId: 'user1',
        action: 'stake',
      });

      expect(result.allowed).toBe(true);
      expect(rateLimitService.checkRateLimit).toHaveBeenCalledWith('user1', 'stake');
      expect(rateLimitService.recordRequest).toHaveBeenCalledWith('user1', 'stake');
    });

    it('should not record if rate limit exceeded', async () => {
      const mockCheckResult = {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        reason: 'Rate limit exceeded',
      };

      (rateLimitService.checkRateLimit as jest.Mock).mockReturnValue(mockCheckResult);

      const result = await middleware.checkAndRecord({
        userId: 'user1',
        action: 'stake',
      });

      expect(result.allowed).toBe(false);
      expect(rateLimitService.recordRequest).not.toHaveBeenCalled();
    });
  });

  describe('check', () => {
    it('should only check rate limit without recording', async () => {
      const mockCheckResult = {
        allowed: true,
        remaining: 9,
        resetTime: Date.now() + 60000,
      };

      (rateLimitService.checkRateLimit as jest.Mock).mockReturnValue(mockCheckResult);

      const result = await middleware.check({
        userId: 'user1',
        action: 'stake',
      });

      expect(result.allowed).toBe(true);
      expect(rateLimitService.checkRateLimit).toHaveBeenCalledWith('user1', 'stake');
      expect(rateLimitService.recordRequest).not.toHaveBeenCalled();
    });
  });

  describe('getStatus', () => {
    it('should return rate limit status for user and action', () => {
      const mockStatus = {
        count: 5,
        limit: 10,
        remaining: 5,
        resetTime: Date.now() + 60000,
        blocked: false,
      };

      (rateLimitService.getRateLimitStatus as jest.Mock).mockReturnValue(mockStatus);

      const result = middleware.getStatus('user1', 'stake');

      expect(result).toEqual(mockStatus);
      expect(rateLimitService.getRateLimitStatus).toHaveBeenCalledWith('user1', 'stake');
    });
  });

  describe('getAllStatus', () => {
    it('should return all rate limits for user', () => {
      const mockLimits = new Map([
        ['stake', { count: 5, limit: 10, remaining: 5, resetTime: Date.now(), blocked: false }],
        ['create-market', { count: 2, limit: 5, remaining: 3, resetTime: Date.now(), blocked: false }],
      ]);

      (rateLimitService.getAllUserLimits as jest.Mock).mockReturnValue(mockLimits);

      const result = middleware.getAllStatus('user1');

      expect(result).toEqual(mockLimits);
      expect(rateLimitService.getAllUserLimits).toHaveBeenCalledWith('user1');
    });
  });
});
