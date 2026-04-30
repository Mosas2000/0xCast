import {
  RateLimitAction,
  RateLimitConfig,
  RateLimitStatus,
  RateLimitRecord,
  RateLimitViolation,
  RateLimitMetrics,
  DEFAULT_RATE_LIMITS,
} from '@/types/rateLimit';

export class RateLimitService {
  private records: Map<string, RateLimitRecord[]> = new Map();
  private violations: RateLimitViolation[] = [];
  private configs: Map<RateLimitAction, RateLimitConfig> = new Map();

  constructor(customConfigs?: Partial<Record<RateLimitAction, RateLimitConfig>>) {
    Object.entries(DEFAULT_RATE_LIMITS).forEach(([action, config]) => {
      this.configs.set(action as RateLimitAction, config);
    });

    if (customConfigs) {
      Object.entries(customConfigs).forEach(([action, config]) => {
        if (config) {
          this.configs.set(action as RateLimitAction, config);
        }
      });
    }
  }

  private getRecordKey(userId: string, action: RateLimitAction): string {
    return `${userId}:${action}`;
  }

  checkLimit(userId: string, action: RateLimitAction): RateLimitStatus {
    const config = this.configs.get(action);
    if (!config) {
      throw new Error(`No rate limit config found for action: ${action}`);
    }

    const key = this.getRecordKey(userId, action);
    const now = Date.now();
    const records = this.records.get(key) || [];

    const recentRecords = records.filter(
      (record) => now - record.timestamp < config.windowMs
    );

    const blockedRecord = recentRecords.find(
      (record) => record.blocked && record.cooldownUntil && record.cooldownUntil > now
    );

    if (blockedRecord) {
      return {
        action,
        remaining: 0,
        resetAt: blockedRecord.timestamp + config.windowMs,
        blocked: true,
        cooldownUntil: blockedRecord.cooldownUntil,
      };
    }

    const count = recentRecords.reduce((sum, record) => sum + record.count, 0);
    const remaining = Math.max(0, config.maxRequests - count);

    return {
      action,
      remaining,
      resetAt: recentRecords.length > 0 
        ? recentRecords[0].timestamp + config.windowMs 
        : now + config.windowMs,
      blocked: false,
    };
  }

  recordRequest(userId: string, action: RateLimitAction): RateLimitStatus {
    const status = this.checkLimit(userId, action);

    if (status.blocked) {
      return status;
    }

    const config = this.configs.get(action)!;
    const key = this.getRecordKey(userId, action);
    const now = Date.now();

    const records = this.records.get(key) || [];
    const recentRecords = records.filter(
      (record) => now - record.timestamp < config.windowMs
    );

    const count = recentRecords.reduce((sum, record) => sum + record.count, 0);

    if (count >= config.maxRequests) {
      const cooldownUntil = config.cooldownMs ? now + config.cooldownMs : undefined;

      const blockedRecord: RateLimitRecord = {
        userId,
        action,
        timestamp: now,
        count: 1,
        blocked: true,
        cooldownUntil,
      };

      recentRecords.push(blockedRecord);
      this.records.set(key, recentRecords);

      this.violations.push({
        userId,
        action,
        timestamp: now,
        attemptedCount: count + 1,
        limit: config.maxRequests,
      });

      return {
        action,
        remaining: 0,
        resetAt: recentRecords[0].timestamp + config.windowMs,
        blocked: true,
        cooldownUntil,
      };
    }

    const newRecord: RateLimitRecord = {
      userId,
      action,
      timestamp: now,
      count: 1,
      blocked: false,
    };

    recentRecords.push(newRecord);
    this.records.set(key, recentRecords);

    return {
      action,
      remaining: config.maxRequests - count - 1,
      resetAt: recentRecords[0].timestamp + config.windowMs,
      blocked: false,
    };
  }

  getStatus(userId: string, action: RateLimitAction): RateLimitStatus {
    return this.checkLimit(userId, action);
  }

  getAllStatus(userId: string): RateLimitStatus[] {
    const actions: RateLimitAction[] = [
      'stake',
      'create-market',
      'resolve-market',
      'add-liquidity',
      'remove-liquidity',
      'vote',
      'claim-rewards',
      'dispute',
      'trade',
    ];

    return actions.map((action) => this.getStatus(userId, action));
  }

  resetUserLimits(userId: string, action?: RateLimitAction): void {
    if (action) {
      const key = this.getRecordKey(userId, action);
      this.records.delete(key);
    } else {
      const keysToDelete: string[] = [];
      this.records.forEach((_, key) => {
        if (key.startsWith(`${userId}:`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => this.records.delete(key));
    }
  }

  getViolations(userId?: string): RateLimitViolation[] {
    if (userId) {
      return this.violations.filter((v) => v.userId === userId);
    }
    return [...this.violations];
  }

  getMetrics(): RateLimitMetrics {
    const totalRequests = Array.from(this.records.values()).reduce(
      (sum, records) => sum + records.reduce((s, r) => s + r.count, 0),
      0
    );

    const blockedRequests = Array.from(this.records.values()).reduce(
      (sum, records) => sum + records.filter((r) => r.blocked).length,
      0
    );

    const violationsByAction: Record<RateLimitAction, number> = {
      'stake': 0,
      'create-market': 0,
      'resolve-market': 0,
      'add-liquidity': 0,
      'remove-liquidity': 0,
      'vote': 0,
      'claim-rewards': 0,
      'dispute': 0,
      'trade': 0,
    };

    this.violations.forEach((v) => {
      violationsByAction[v.action]++;
    });

    const userViolationCounts = new Map<string, number>();
    this.violations.forEach((v) => {
      userViolationCounts.set(v.userId, (userViolationCounts.get(v.userId) || 0) + 1);
    });

    const topViolators = Array.from(userViolationCounts.entries())
      .map(([userId, violations]) => ({ userId, violations }))
      .sort((a, b) => b.violations - a.violations)
      .slice(0, 10);

    return {
      totalRequests,
      blockedRequests,
      violationsByAction,
      topViolators,
    };
  }

  updateConfig(action: RateLimitAction, config: RateLimitConfig): void {
    this.configs.set(action, config);
  }

  getConfig(action: RateLimitAction): RateLimitConfig | undefined {
    return this.configs.get(action);
  }

  cleanup(olderThanMs: number = 3600000): void {
    const now = Date.now();
    const cutoff = now - olderThanMs;

    this.records.forEach((records, key) => {
      const filtered = records.filter((record) => record.timestamp > cutoff);
      if (filtered.length === 0) {
        this.records.delete(key);
      } else {
        this.records.set(key, filtered);
      }
    });

    this.violations = this.violations.filter((v) => v.timestamp > cutoff);
  }
}

export const rateLimitService = new RateLimitService();
