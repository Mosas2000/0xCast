import { FraudAlert, UserReputation } from '@/types/reputation';
import type { JsonValue } from '@/types/common';

export class ReputationEventBus {
  private listeners: Map<string, Set<(data: JsonValue) => void>> = new Map();

  on(event: string, callback: (data: JsonValue) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: (data: JsonValue) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, data: JsonValue): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const reputationEventBus = new ReputationEventBus();

export class ReputationLogger {
  private static logs: Array<{
    timestamp: number;
    level: string;
    message: string;
    data?: JsonValue;
  }> = [];

  static log(level: 'info' | 'warn' | 'error', message: string, data?: JsonValue): void {
    const entry = {
      timestamp: Date.now(),
      level,
      message,
      data,
    };

    this.logs.push(entry);

    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-500);
    }

    console.log(`[${level.toUpperCase()}] ${message}`, data || '');
  }

  static getLogs(level?: string, limit: number = 100): typeof this.logs {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter((log) => log.level === level);
    }

    return filtered.slice(-limit);
  }

  static clear(): void {
    this.logs = [];
  }

  static export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export class ReputationCache {
  private cache: Map<string, { value: JsonValue; expiresAt: number }> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000;

  set(key: string, value: JsonValue, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  get(key: string): JsonValue | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  size(): number {
    return this.cache.size;
  }
}

export class ReputationValidator {
  static validateReputation(rep: UserReputation): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!rep.userId || rep.userId.trim() === '') {
      errors.push('userId is required');
    }

    if (!rep.score || typeof rep.score.score !== 'number') {
      errors.push('score.score must be a number');
    }

    if (rep.score && (rep.score.score < 0 || rep.score.score > 100)) {
      errors.push('score.score must be between 0 and 100');
    }

    if (!['new', 'trusted', 'verified', 'elite'].includes(rep.level)) {
      errors.push('level must be one of: new, trusted, verified, elite');
    }

    if (!Array.isArray(rep.badges)) {
      errors.push('badges must be an array');
    }

    if (!rep.kycStatus) {
      errors.push('kycStatus is required');
    }

    if (
      rep.kycStatus &&
      !['none', 'in_progress', 'approved', 'rejected'].includes(rep.kycStatus.status)
    ) {
      errors.push('kycStatus.status is invalid');
    }

    if (typeof rep.isSuspicious !== 'boolean') {
      errors.push('isSuspicious must be a boolean');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateFraudAlert(alert: FraudAlert): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const validTypes = [
      'wash_trading',
      'sybil_attack',
      'pump_and_dump',
      'price_manipulation',
      'volume_spoofing',
      'unusual_pattern',
    ];
    if (!validTypes.includes(alert.type)) {
      errors.push(`type must be one of: ${validTypes.join(', ')}`);
    }

    const validSeverities = ['critical', 'high', 'medium', 'low'];
    if (!validSeverities.includes(alert.severity)) {
      errors.push(`severity must be one of: ${validSeverities.join(', ')}`);
    }

    if (!alert.userId || alert.userId.trim() === '') {
      errors.push('userId is required');
    }

    if (!alert.description || alert.description.trim() === '') {
      errors.push('description is required');
    }

    if (typeof alert.timestamp !== 'number') {
      errors.push('timestamp must be a number');
    }

    if (typeof alert.resolved !== 'boolean') {
      errors.push('resolved must be a boolean');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export class ReputationStatistics {
  static calculateStats(values: number[]): {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    quartiles: { q1: number; q2: number; q3: number };
  } {
    if (values.length === 0) {
      return {
        mean: 0,
        median: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        quartiles: { q1: 0, q2: 0, q3: 0 },
      };
    }

    const sorted = [...values].sort((a, b) => a - b);

    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    const median = sorted[Math.floor(sorted.length / 2)];

    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    const q1Index = Math.floor(sorted.length * 0.25);
    const q2Index = Math.floor(sorted.length * 0.5);
    const q3Index = Math.floor(sorted.length * 0.75);

    return {
      mean,
      median,
      stdDev,
      min,
      max,
      quartiles: {
        q1: sorted[q1Index],
        q2: sorted[q2Index],
        q3: sorted[q3Index],
      },
    };
  }

  static calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  static calculateDistribution(values: number[], buckets: number = 10): number[] {
    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const bucketSize = range / buckets;

    const distribution = new Array(buckets).fill(0);

    values.forEach((value) => {
      const bucketIndex = Math.floor((value - min) / bucketSize);
      const index = Math.min(bucketIndex, buckets - 1);
      distribution[index]++;
    });

    return distribution;
  }
}

export class ReputationAggregator {
  static aggregateByLevel(reputations: UserReputation[]): Record<string, number> {
    return {
      new: reputations.filter((r) => r.level === 'new').length,
      trusted: reputations.filter((r) => r.level === 'trusted').length,
      verified: reputations.filter((r) => r.level === 'verified').length,
      elite: reputations.filter((r) => r.level === 'elite').length,
    };
  }

  static aggregateByKYCStatus(reputations: UserReputation[]): Record<string, number> {
    return {
      none: reputations.filter((r) => r.kycStatus.status === 'none').length,
      in_progress: reputations.filter((r) => r.kycStatus.status === 'in_progress').length,
      approved: reputations.filter((r) => r.kycStatus.status === 'approved').length,
      rejected: reputations.filter((r) => r.kycStatus.status === 'rejected').length,
    };
  }

  static aggregateByBadge(reputations: UserReputation[]): Record<string, number> {
    const badgeCounts: Record<string, number> = {};

    reputations.forEach((rep) => {
      rep.badges.forEach((badge) => {
        badgeCounts[badge.type] = (badgeCounts[badge.type] || 0) + 1;
      });
    });

    return badgeCounts;
  }

  static findTopUsers(
    reputations: UserReputation[],
    limit: number = 10,
  ): { userId: string; score: number; level: string }[] {
    return reputations
      .map((rep) => ({
        userId: rep.userId,
        score: rep.score.score,
        level: rep.level,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  static findBottomUsers(
    reputations: UserReputation[],
    limit: number = 10,
  ): { userId: string; score: number; level: string }[] {
    return reputations
      .map((rep) => ({
        userId: rep.userId,
        score: rep.score.score,
        level: rep.level,
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);
  }
}
