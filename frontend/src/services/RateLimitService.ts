interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  cooldownMs?: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequestTime: number;
  blocked: boolean;
  blockUntil?: number;
}

export class RateLimitService {
  private limits: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs(): void {
    this.configs.set('stake', {
      maxRequests: 10,
      windowMs: 60000,
      cooldownMs: 5000,
    });

    this.configs.set('create-market', {
      maxRequests: 5,
      windowMs: 300000,
      cooldownMs: 10000,
    });

    this.configs.set('resolve-market', {
      maxRequests: 3,
      windowMs: 60000,
      cooldownMs: 15000,
    });

    this.configs.set('add-liquidity', {
      maxRequests: 10,
      windowMs: 60000,
      cooldownMs: 5000,
    });

    this.configs.set('remove-liquidity', {
      maxRequests: 10,
      windowMs: 60000,
      cooldownMs: 5000,
    });

    this.configs.set('vote', {
      maxRequests: 20,
      windowMs: 300000,
      cooldownMs: 3000,
    });

    this.configs.set('claim-rewards', {
      maxRequests: 5,
      windowMs: 60000,
      cooldownMs: 10000,
    });
  }

  setConfig(action: string, config: RateLimitConfig): void {
    this.configs.set(action, config);
  }

  getConfig(action: string): RateLimitConfig | undefined {
    return this.configs.get(action);
  }

  checkRateLimit(userId: string, action: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
    reason?: string;
  } {
    const key = `${userId}:${action}`;
    const config = this.configs.get(action);

    if (!config) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: 0,
      };
    }

    const now = Date.now();
    let entry = this.limits.get(key);

    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        lastRequestTime: 0,
        blocked: false,
      };
      this.limits.set(key, entry);
    }

    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
        reason: 'Rate limit exceeded. Please wait before trying again.',
      };
    }

    if (now >= entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + config.windowMs;
      entry.blocked = false;
      entry.blockUntil = undefined;
    }

    if (config.cooldownMs && entry.lastRequestTime > 0) {
      const timeSinceLastRequest = now - entry.lastRequestTime;
      if (timeSinceLastRequest < config.cooldownMs) {
        return {
          allowed: false,
          remaining: config.maxRequests - entry.count,
          resetTime: entry.resetTime,
          retryAfter: Math.ceil((config.cooldownMs - timeSinceLastRequest) / 1000),
          reason: 'Cooldown period active. Please wait before trying again.',
        };
      }
    }

    if (entry.count >= config.maxRequests) {
      entry.blocked = true;
      entry.blockUntil = now + (config.cooldownMs || 5000);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        reason: 'Rate limit exceeded. Please wait for the window to reset.',
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count - 1,
      resetTime: entry.resetTime,
    };
  }

  recordRequest(userId: string, action: string): void {
    const key = `${userId}:${action}`;
    const entry = this.limits.get(key);

    if (entry) {
      entry.count++;
      entry.lastRequestTime = Date.now();
      this.limits.set(key, entry);
    }
  }

  getRateLimitStatus(userId: string, action: string): {
    count: number;
    limit: number;
    remaining: number;
    resetTime: number;
    blocked: boolean;
  } {
    const key = `${userId}:${action}`;
    const config = this.configs.get(action);
    const entry = this.limits.get(key);

    if (!config) {
      return {
        count: 0,
        limit: Infinity,
        remaining: Infinity,
        resetTime: 0,
        blocked: false,
      };
    }

    if (!entry) {
      return {
        count: 0,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
        blocked: false,
      };
    }

    const now = Date.now();
    if (now >= entry.resetTime) {
      return {
        count: 0,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        blocked: false,
      };
    }

    return {
      count: entry.count,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      blocked: entry.blocked,
    };
  }

  resetUserLimits(userId: string, action?: string): void {
    if (action) {
      const key = `${userId}:${action}`;
      this.limits.delete(key);
    } else {
      const keysToDelete: string[] = [];
      for (const key of this.limits.keys()) {
        if (key.startsWith(`${userId}:`)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.limits.delete(key));
    }
  }

  getAllUserLimits(userId: string): Map<string, {
    count: number;
    limit: number;
    remaining: number;
    resetTime: number;
    blocked: boolean;
  }> {
    const result = new Map();
    
    for (const [action] of this.configs) {
      const status = this.getRateLimitStatus(userId, action);
      result.set(action, status);
    }

    return result;
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime && entry.count === 0) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.limits.delete(key));
  }

  getStats(): {
    totalEntries: number;
    blockedUsers: number;
    activeWindows: number;
  } {
    const now = Date.now();
    let blockedUsers = 0;
    let activeWindows = 0;

    for (const entry of this.limits.values()) {
      if (entry.blocked) {
        blockedUsers++;
      }
      if (now < entry.resetTime) {
        activeWindows++;
      }
    }

    return {
      totalEntries: this.limits.size,
      blockedUsers,
      activeWindows,
    };
  }
}

export const rateLimitService = new RateLimitService();
