import { OraclePrice, AggregatedPrice } from '@/types/oracle';
import type { CacheEntry, LogData } from '@/types/common';

export class CacheService {
  private static cache: Map<string, CacheEntry<unknown>> = new Map();
  private static readonly DEFAULT_TTL = 60000;

  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  static has(key: string): boolean {
    return this.get(key) !== null;
  }

  static clear(): void {
    this.cache.clear();
  }

  static delete(key: string): void {
    this.cache.delete(key);
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.timestamp) {
        this.cache.delete(key);
      }
    }
  }
}

export class RateLimitService {
  private static limits: Map<string, { count: number; resetTime: number }> = new Map();
  private static readonly DEFAULT_WINDOW = 60000;
  private static readonly DEFAULT_MAX_REQUESTS = 100;

  static checkLimit(key: string, maxRequests: number = this.DEFAULT_MAX_REQUESTS, window: number = this.DEFAULT_WINDOW): boolean {
    const now = Date.now();
    let limit = this.limits.get(key);

    if (!limit || now > limit.resetTime) {
      limit = {
        count: 0,
        resetTime: now + window,
      };
      this.limits.set(key, limit);
    }

    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }

  static reset(key: string): void {
    this.limits.delete(key);
  }

  static getRemaining(key: string, maxRequests: number = this.DEFAULT_MAX_REQUESTS): number {
    const limit = this.limits.get(key);
    if (!limit || Date.now() > limit.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - limit.count);
  }
}

export class RetryService {
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (i < maxRetries - 1) {
          await this.sleep(delay * Math.pow(2, i));
        }
      }
    }

    throw lastError;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export class CircuitBreakerService {
  private static state: Map<string, {
    status: 'closed' | 'open' | 'half-open';
    failures: number;
    lastFailureTime: number;
    nextRetry: number;
  }> = new Map();

  private static readonly FAILURE_THRESHOLD = 5;
  private static readonly RESET_TIMEOUT = 60000;

  static async execute<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    let breaker = this.state.get(key);

    if (!breaker) {
      breaker = {
        status: 'closed',
        failures: 0,
        lastFailureTime: 0,
        nextRetry: 0,
      };
      this.state.set(key, breaker);
    }

    if (breaker.status === 'open') {
      if (now < breaker.nextRetry) {
        throw new Error(`Circuit breaker open for ${key}`);
      }
      breaker.status = 'half-open';
    }

    try {
      const result = await fn();
      if (breaker.status === 'half-open') {
        breaker.status = 'closed';
        breaker.failures = 0;
      }
      return result;
    } catch (error) {
      breaker.failures++;
      breaker.lastFailureTime = now;

      if (breaker.failures >= this.FAILURE_THRESHOLD) {
        breaker.status = 'open';
        breaker.nextRetry = now + this.RESET_TIMEOUT;
      }

      throw error;
    }
  }

  static getStatus(key: string): string {
    const breaker = this.state.get(key);
    return breaker?.status || 'closed';
  }

  static reset(key: string): void {
    const breaker = this.state.get(key);
    if (breaker) {
      breaker.status = 'closed';
      breaker.failures = 0;
      breaker.lastFailureTime = 0;
    }
  }
}

export class DataValidationService {
  static validatePrice(price: number): boolean {
    return typeof price === 'number' && price >= 0 && isFinite(price);
  }

  static validateTimestamp(timestamp: number): boolean {
    return typeof timestamp === 'number' && timestamp > 0 && timestamp <= Date.now() + 1000;
  }

  static validateConfidence(confidence: number): boolean {
    return typeof confidence === 'number' && confidence >= 0 && confidence <= 1;
  }

  static validateMarketId(marketId: string): boolean {
    return typeof marketId === 'string' && marketId.length > 0 && marketId.length <= 256;
  }

  static validateProviderId(providerId: string): boolean {
    return typeof providerId === 'string' && providerId.length > 0 && providerId.length <= 128;
  }

  static validateOraclePrice(price: OraclePrice): boolean {
    return (
      this.validatePrice(price.value) &&
      this.validateTimestamp(price.timestamp) &&
      typeof price.source === 'string' &&
      this.validateConfidence(price.confidence)
    );
  }

  static validateAggregatedPrice(price: AggregatedPrice): boolean {
    return (
      this.validatePrice(price.value) &&
      this.validateTimestamp(price.timestamp) &&
      Array.isArray(price.sources) &&
      this.validateConfidence(price.confidence) &&
      typeof price.consensusReached === 'boolean' &&
      typeof price.method === 'string'
    );
  }
}

export interface LogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: LogData;
}

export class LoggingService {
  private static logs: LogEntry[] = [];

  static info(message: string, data?: LogData): void {
    this.log('info', message, data);
  }

  static warn(message: string, data?: LogData): void {
    this.log('warn', message, data);
  }

  static error(message: string, data?: LogData): void {
    this.log('error', message, data);
  }

  static getLogs(level?: string, limit: number = 100): LogEntry[] {
    let filtered = this.logs;
    if (level) {
      filtered = filtered.filter((l) => l.level === level);
    }
    return filtered.slice(-limit);
  }

  static clearLogs(): void {
    this.logs = [];
  }

  private static log(level: 'info' | 'warn' | 'error', message: string, data?: LogData): void {
    const log = {
      timestamp: Date.now(),
      level,
      message,
      data,
    };

    this.logs.push(log);
    if (this.logs.length > 10000) {
      this.logs.shift();
    }

    if (typeof console !== 'undefined') {
      const consoleMethod = console[level] || console.log;
      if (data) {
        consoleMethod(`[${level.toUpperCase()}] ${message}`, data);
      } else {
        consoleMethod(`[${level.toUpperCase()}] ${message}`);
      }
    }
  }
}
