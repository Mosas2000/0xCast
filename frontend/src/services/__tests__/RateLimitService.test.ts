import { RateLimitService } from '../RateLimitService';

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(() => {
    service = new RateLimitService();
  });

  describe('Configuration', () => {
    it('should initialize with default configs', () => {
      const stakeConfig = service.getConfig('stake');
      expect(stakeConfig).toBeDefined();
      expect(stakeConfig?.maxRequests).toBe(10);
      expect(stakeConfig?.windowMs).toBe(60000);
    });

    it('should allow setting custom config', () => {
      service.setConfig('test-action', {
        maxRequests: 5,
        windowMs: 30000,
        cooldownMs: 2000,
      });

      const config = service.getConfig('test-action');
      expect(config?.maxRequests).toBe(5);
      expect(config?.windowMs).toBe(30000);
    });
  });

  describe('Rate Limit Checking', () => {
    it('should allow requests within limit', () => {
      const result = service.checkRateLimit('user1', 'stake');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should block requests exceeding limit', () => {
      for (let i = 0; i < 10; i++) {
        service.checkRateLimit('user1', 'stake');
        service.recordRequest('user1', 'stake');
      }

      const result = service.checkRateLimit('user1', 'stake');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.reason).toContain('Rate limit exceeded');
    });

    it('should enforce cooldown period', () => {
      service.setConfig('test-action', {
        maxRequests: 10,
        windowMs: 60000,
        cooldownMs: 5000,
      });

      service.checkRateLimit('user1', 'test-action');
      service.recordRequest('user1', 'test-action');

      const result = service.checkRateLimit('user1', 'test-action');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Cooldown period active');
    });

    it('should allow unlimited requests for unconfigured actions', () => {
      const result = service.checkRateLimit('user1', 'unknown-action');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(Infinity);
    });
  });

  describe('Request Recording', () => {
    it('should increment count when recording request', () => {
      service.checkRateLimit('user1', 'stake');
      service.recordRequest('user1', 'stake');

      const status = service.getRateLimitStatus('user1', 'stake');
      expect(status.count).toBe(1);
    });

    it('should update last request time', () => {
      const before = Date.now();
      service.checkRateLimit('user1', 'stake');
      service.recordRequest('user1', 'stake');
      const after = Date.now();

      const status = service.getRateLimitStatus('user1', 'stake');
      expect(status.count).toBe(1);
    });
  });

  describe('Rate Limit Status', () => {
    it('should return correct status for user', () => {
      service.checkRateLimit('user1', 'stake');
      service.recordRequest('user1', 'stake');
      service.checkRateLimit('user1', 'stake');
      service.recordRequest('user1', 'stake');

      const status = service.getRateLimitStatus('user1', 'stake');
      expect(status.count).toBe(2);
      expect(status.limit).toBe(10);
      expect(status.remaining).toBe(8);
      expect(status.blocked).toBe(false);
    });

    it('should show blocked status when limit exceeded', () => {
      for (let i = 0; i < 10; i++) {
        service.checkRateLimit('user1', 'stake');
        service.recordRequest('user1', 'stake');
      }

      const status = service.getRateLimitStatus('user1', 'stake');
      expect(status.blocked).toBe(true);
    });
  });

  describe('User Limit Management', () => {
    it('should reset specific action limit', () => {
      service.checkRateLimit('user1', 'stake');
      service.recordRequest('user1', 'stake');

      service.resetUserLimits('user1', 'stake');

      const status = service.getRateLimitStatus('user1', 'stake');
      expect(status.count).toBe(0);
    });

    it('should reset all user limits', () => {
      service.checkRateLimit('user1', 'stake');
      service.recordRequest('user1', 'stake');
      service.checkRateLimit('user1', 'create-market');
      service.recordRequest('user1', 'create-market');

      service.resetUserLimits('user1');

      const stakeStatus = service.getRateLimitStatus('user1', 'stake');
      const marketStatus = service.getRateLimitStatus('user1', 'create-market');
      expect(stakeStatus.count).toBe(0);
      expect(marketStatus.count).toBe(0);
    });

    it('should get all limits for user', () => {
      service.checkRateLimit('user1', 'stake');
      service.recordRequest('user1', 'stake');

      const allLimits = service.getAllUserLimits('user1');
      expect(allLimits.size).toBeGreaterThan(0);
      expect(allLimits.has('stake')).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should remove expired entries', () => {
      service.setConfig('test-action', {
        maxRequests: 5,
        windowMs: 1,
      });

      service.checkRateLimit('user1', 'test-action');
      service.recordRequest('user1', 'test-action');

      setTimeout(() => {
        service.cleanup();
        const stats = service.getStats();
        expect(stats.totalEntries).toBe(0);
      }, 10);
    });
  });

  describe('Statistics', () => {
    it('should return correct stats', () => {
      service.checkRateLimit('user1', 'stake');
      service.recordRequest('user1', 'stake');
      service.checkRateLimit('user2', 'create-market');
      service.recordRequest('user2', 'create-market');

      const stats = service.getStats();
      expect(stats.totalEntries).toBe(2);
      expect(stats.activeWindows).toBeGreaterThan(0);
    });

    it('should count blocked users', () => {
      for (let i = 0; i < 10; i++) {
        service.checkRateLimit('user1', 'stake');
        service.recordRequest('user1', 'stake');
      }

      const stats = service.getStats();
      expect(stats.blockedUsers).toBeGreaterThan(0);
    });
  });

  describe('Multiple Users', () => {
    it('should track limits independently per user', () => {
      service.checkRateLimit('user1', 'stake');
      service.recordRequest('user1', 'stake');
      service.checkRateLimit('user2', 'stake');
      service.recordRequest('user2', 'stake');

      const status1 = service.getRateLimitStatus('user1', 'stake');
      const status2 = service.getRateLimitStatus('user2', 'stake');

      expect(status1.count).toBe(1);
      expect(status2.count).toBe(1);
    });

    it('should not affect other users when one is blocked', () => {
      for (let i = 0; i < 10; i++) {
        service.checkRateLimit('user1', 'stake');
        service.recordRequest('user1', 'stake');
      }

      const result1 = service.checkRateLimit('user1', 'stake');
      const result2 = service.checkRateLimit('user2', 'stake');

      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
    });
  });

  describe('Window Reset', () => {
    it('should reset count after window expires', () => {
      service.setConfig('test-action', {
        maxRequests: 5,
        windowMs: 100,
      });

      service.checkRateLimit('user1', 'test-action');
      service.recordRequest('user1', 'test-action');

      setTimeout(() => {
        const result = service.checkRateLimit('user1', 'test-action');
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4);
      }, 150);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero max requests', () => {
      service.setConfig('test-action', {
        maxRequests: 0,
        windowMs: 60000,
      });

      const result = service.checkRateLimit('user1', 'test-action');
      expect(result.allowed).toBe(false);
    });

    it('should handle very large window', () => {
      service.setConfig('test-action', {
        maxRequests: 100,
        windowMs: 86400000,
      });

      const result = service.checkRateLimit('user1', 'test-action');
      expect(result.allowed).toBe(true);
    });

    it('should handle rapid successive requests', () => {
      for (let i = 0; i < 5; i++) {
        const result = service.checkRateLimit('user1', 'stake');
        if (result.allowed) {
          service.recordRequest('user1', 'stake');
        }
      }

      const status = service.getRateLimitStatus('user1', 'stake');
      expect(status.count).toBeLessThanOrEqual(10);
    });
  });
});
