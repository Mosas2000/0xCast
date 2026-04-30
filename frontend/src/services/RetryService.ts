import type { LogData, EventCallback } from '@/types/common';

export interface RetryStrategy {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterFactor: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
}

export class RetryService {
  private defaultStrategy: RetryStrategy = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
  };

  private listeners: Map<string, EventCallback<LogData>[]> = new Map();

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    strategy?: Partial<RetryStrategy>
  ): Promise<RetryResult<T>> {
    const config = { ...this.defaultStrategy, ...strategy };
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const data = await fn();
        const totalDuration = Date.now() - startTime;

        this.emit('retry_success', { attempt, totalDuration });

        return {
          success: true,
          data,
          attempts: attempt,
          totalDuration,
        };
      } catch (error) {
        lastError = error as Error;

        if (attempt === config.maxAttempts) {
          break;
        }

        const delay = this.calculateDelay(
          attempt,
          config.initialDelay,
          config.maxDelay,
          config.backoffMultiplier,
          config.jitterFactor
        );

        this.emit('retry_attempt', {
          attempt,
          nextDelay: delay,
          error: lastError.message,
        });

        await this.sleep(delay);
      }
    }

    const totalDuration = Date.now() - startTime;

    this.emit('retry_failed', {
      attempts: config.maxAttempts,
      totalDuration,
      error: lastError?.message,
    });

    return {
      success: false,
      error: lastError,
      attempts: config.maxAttempts,
      totalDuration,
    };
  }

  private calculateDelay(
    attempt: number,
    initialDelay: number,
    maxDelay: number,
    multiplier: number,
    jitterFactor: number
  ): number {
    const exponentialDelay = initialDelay * Math.pow(multiplier, attempt - 1);
    const cappedDelay = Math.min(exponentialDelay, maxDelay);
    const jitter = cappedDelay * jitterFactor * Math.random();

    return Math.floor(cappedDelay + jitter);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  subscribe(event: string, callback: EventCallback<LogData>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  unsubscribe(event: string, callback: EventCallback<LogData>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: LogData): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  getExponentialBackoffDelay(
    attempt: number,
    baseDelay: number = 1000,
    maxDelay: number = 30000
  ): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    return Math.min(exponentialDelay, maxDelay);
  }

  getLinearBackoffDelay(
    attempt: number,
    baseDelay: number = 1000,
    maxDelay: number = 30000
  ): number {
    const linearDelay = baseDelay * attempt;
    return Math.min(linearDelay, maxDelay);
  }

  setDefaultStrategy(strategy: Partial<RetryStrategy>): void {
    this.defaultStrategy = { ...this.defaultStrategy, ...strategy };
  }

  getDefaultStrategy(): RetryStrategy {
    return { ...this.defaultStrategy };
  }
}

export class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private failureThreshold: number;
  private successThreshold: number;
  private resetTimeout: number;

  constructor(
    failureThreshold: number = 5,
    successThreshold: number = 2,
    resetTimeout: number = 60000
  ) {
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.resetTimeout = resetTimeout;
  }

  async execute<T>(
    fn: () => Promise<T>
  ): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();

      if (this.state === 'half-open') {
        this.successCount++;

        if (this.successCount >= this.successThreshold) {
          this.reset();
        }
      } else {
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = 'open';
      }

      throw error;
    }
  }

  private reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
  }

  getState(): string {
    return this.state;
  }

  getMetrics(): {
    state: string;
    failureCount: number;
    successCount: number;
    lastFailureTime: number;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}
