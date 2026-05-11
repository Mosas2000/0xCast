import { describe, it, expect, beforeEach } from 'vitest';
import {
  ReputationLogger,
  ReputationCache,
  ReputationValidator,
  ReputationStatistics,
  ReputationAggregator,
} from '../utils/reputationHelpers';
import { UserReputation, FraudAlert, ReputationLevel } from '../types/reputation';

describe('ReputationLogger', () => {
  beforeEach(() => {
    ReputationLogger.clear();
  });

  it('should log messages at different levels', () => {
    ReputationLogger.log('info', 'Test info message');
    ReputationLogger.log('warn', 'Test warning message');
    ReputationLogger.log('error', 'Test error message');

    const logs = ReputationLogger.getLogs();
    expect(logs.length).toBe(3);
  });

  it('should filter logs by level', () => {
    ReputationLogger.log('info', 'Info 1');
    ReputationLogger.log('warn', 'Warn 1');
    ReputationLogger.log('error', 'Error 1');

    const errors = ReputationLogger.getLogs('error');
    expect(errors.length).toBe(1);
    expect(errors[0].level).toBe('error');
  });

  it('should limit log retention', () => {
    for (let i = 0; i < 1100; i++) {
      ReputationLogger.log('info', `Message ${i}`);
    }

    const logs = ReputationLogger.getLogs(undefined, 2000);
    expect(logs.length).toBeLessThanOrEqual(500);
  });

  it('should export logs as JSON', () => {
    ReputationLogger.log('info', 'Test message');
    const exported = ReputationLogger.export();
    const parsed = JSON.parse(exported);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });
});

describe('ReputationCache', () => {
  let cache: ReputationCache;

  beforeEach(() => {
    cache = new ReputationCache();
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return null for missing keys', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('should expire values after TTL', () => {
    cache.set('key1', 'value1', 10);
    expect(cache.get('key1')).toBe('value1');

    setTimeout(() => {
      expect(cache.get('key1')).toBeNull();
    }, 50);
  });

  it('should check key existence', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('nonexistent')).toBe(false);
  });

  it('should delete values', () => {
    cache.set('key1', 'value1');
    cache.delete('key1');
    expect(cache.get('key1')).toBeNull();
  });

  it('should clear all values', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();

    expect(cache.size()).toBe(0);
  });

  it('should report cache size', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    expect(cache.size()).toBe(2);
  });

  it('should cleanup expired entries', () => {
    cache.set('key1', 'value1', 10);
    cache.set('key2', 'value2', 100000);

    setTimeout(() => {
      cache.cleanup();
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true);
    }, 50);
  });
});

describe('ReputationValidator', () => {
  it('should validate correct reputation object', () => {
    const rep: UserReputation = {
      userId: 'user1',
      score: { score: 75, level: 'verified', timestamp: Date.now() },
      level: 'verified',
      badges: [],
      kycStatus: { status: 'approved', level: 'level2' },
      amlStatus: { riskScore: 20, flags: { pep: false, sanctions: false, adverseMedia: false } },
      isSuspicious: false,
      linkedAccounts: [],
    };

    const result = ReputationValidator.validateReputation(rep);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should detect missing userId', () => {
    const rep: Partial<UserReputation> = {
      score: { score: 75, level: 'verified', timestamp: Date.now() },
      level: 'verified',
      badges: [],
      kycStatus: { status: 'approved', level: 'level2' },
      isSuspicious: false,
      linkedAccounts: [],
    };

    const result = ReputationValidator.validateReputation(rep as UserReputation);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('userId'))).toBe(true);
  });

  it('should validate fraud alert', () => {
    const alert: FraudAlert = {
      id: 'alert1',
      userId: 'user1',
      type: 'wash_trading',
      severity: 'high',
      description: 'Suspected wash trading',
      timestamp: Date.now(),
      resolved: false,
      resolutionNotes: '',
    };

    const result = ReputationValidator.validateFraudAlert(alert);
    expect(result.valid).toBe(true);
  });

  it('should detect invalid fraud alert type', () => {
    const alert: Partial<FraudAlert> = {
      id: 'alert1',
      userId: 'user1',
      type: 'invalid_type' as FraudAlert['type'],
      severity: 'high',
      description: 'Test',
      timestamp: Date.now(),
      resolved: false,
    };

    const result = ReputationValidator.validateFraudAlert(alert);
    expect(result.valid).toBe(false);
  });
});

describe('ReputationStatistics', () => {
  it('should calculate mean', () => {
    const stats = ReputationStatistics.calculateStats([10, 20, 30, 40, 50]);
    expect(stats.mean).toBe(30);
  });

  it('should calculate median', () => {
    const stats = ReputationStatistics.calculateStats([10, 20, 30, 40, 50]);
    expect(stats.median).toBe(30);
  });

  it('should calculate min and max', () => {
    const stats = ReputationStatistics.calculateStats([10, 20, 30, 40, 50]);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(50);
  });

  it('should calculate standard deviation', () => {
    const stats = ReputationStatistics.calculateStats([1, 2, 3, 4, 5]);
    expect(stats.stdDev).toBeGreaterThan(0);
  });

  it('should calculate percentile', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1);
    const p50 = ReputationStatistics.calculatePercentile(values, 50);
    expect(p50).toBeGreaterThan(40);
    expect(p50).toBeLessThan(60);
  });

  it('should calculate distribution', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1);
    const dist = ReputationStatistics.calculateDistribution(values, 10);
    expect(dist.length).toBe(10);
    expect(dist.reduce((a, b) => a + b, 0)).toBe(100);
  });

  it('should handle empty arrays', () => {
    const stats = ReputationStatistics.calculateStats([]);
    expect(stats.mean).toBe(0);
    expect(stats.min).toBe(0);
  });
});

describe('ReputationAggregator', () => {
  const createRep = (level: ReputationLevel): UserReputation => ({
    userId: `user_${Math.random()}`,
    score: { score: 50, level, timestamp: Date.now() },
    level,
    badges: [],
    kycStatus: { status: 'approved', level: 'level2' },
    isSuspicious: false,
    linkedAccounts: [],
  });

  it('should aggregate by level', () => {
    const reps = [
      createRep('new'),
      createRep('new'),
      createRep('trusted'),
      createRep('verified'),
      createRep('elite'),
    ];

    const agg = ReputationAggregator.aggregateByLevel(reps);
    expect(agg.new).toBe(2);
    expect(agg.trusted).toBe(1);
    expect(agg.verified).toBe(1);
    expect(agg.elite).toBe(1);
  });

  it('should find top users', () => {
    const reps: UserReputation[] = Array.from({ length: 20 }, (_, i) => ({
      userId: `user${i}`,
      score: { score: 50 + i * 2, level: 'trusted', timestamp: Date.now() },
      level: 'trusted',
      badges: [],
      kycStatus: { status: 'approved', level: 'level2' },
      isSuspicious: false,
      linkedAccounts: [],
    }));

    const top = ReputationAggregator.findTopUsers(reps, 5);
    expect(top.length).toBe(5);
    expect(top[0].score).toBeGreaterThanOrEqual(top[1].score);
  });

  it('should find bottom users', () => {
    const reps: UserReputation[] = Array.from({ length: 20 }, (_, i) => ({
      userId: `user${i}`,
      score: { score: 50 + i * 2, level: 'trusted', timestamp: Date.now() },
      level: 'trusted',
      badges: [],
      kycStatus: { status: 'approved', level: 'level2' },
      isSuspicious: false,
      linkedAccounts: [],
    }));

    const bottom = ReputationAggregator.findBottomUsers(reps, 5);
    expect(bottom.length).toBe(5);
    expect(bottom[0].score).toBeLessThanOrEqual(bottom[1].score);
  });
});
