import { ApiError, isRetryableError, getRetryDelay } from './apiErrors';

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const shouldRetry = 
        attempt < finalConfig.maxAttempts &&
        isRetryableError(error) &&
        (!finalConfig.retryableErrors || 
         finalConfig.retryableErrors.includes((error as ApiError).code));

      if (!shouldRetry) {
        throw error;
      }

      const baseDelay = getRetryDelay(error);
      const exponentialDelay = finalConfig.initialDelayMs * 
        Math.pow(finalConfig.backoffMultiplier, attempt - 1);
      const delayMs = Math.min(
        Math.max(baseDelay, exponentialDelay),
        finalConfig.maxDelayMs
      );

      if (finalConfig.onRetry) {
        finalConfig.onRetry(attempt, lastError, delayMs);
      }

      await sleep(delayMs);
    }
  }

  throw lastError;
}

export function withRetrySync<T>(
  operation: () => T,
  config: Partial<RetryConfig> = {}
): T {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const shouldRetry = 
        attempt < finalConfig.maxAttempts &&
        isRetryableError(error);

      if (!shouldRetry) {
        throw error;
      }

      const delayMs = Math.min(
        finalConfig.initialDelayMs * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
        finalConfig.maxDelayMs
      );

      if (finalConfig.onRetry) {
        finalConfig.onRetry(attempt, lastError, delayMs);
      }

      sleepSync(delayMs);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sleepSync(ms: number): void {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // Busy wait (not recommended for production, but included for completeness)
  }
}

export class RetryManager {
  private attempts: Map<string, number> = new Map();
  private lastAttemptTime: Map<string, number> = new Map();
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async execute<T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const attempts = this.attempts.get(key) || 0;
    const lastTime = this.lastAttemptTime.get(key) || 0;

    if (attempts >= this.config.maxAttempts) {
      const timeSinceLastAttempt = Date.now() - lastTime;
      if (timeSinceLastAttempt < this.config.maxDelayMs) {
        throw new Error(`Max retry attempts reached for ${key}`);
      }
      this.attempts.set(key, 0);
    }

    try {
      const result = await operation();
      this.attempts.set(key, 0);
      return result;
    } catch (error) {
      this.attempts.set(key, attempts + 1);
      this.lastAttemptTime.set(key, Date.now());
      throw error;
    }
  }

  reset(key?: string): void {
    if (key) {
      this.attempts.delete(key);
      this.lastAttemptTime.delete(key);
    } else {
      this.attempts.clear();
      this.lastAttemptTime.clear();
    }
  }

  getAttempts(key: string): number {
    return this.attempts.get(key) || 0;
  }
}

export function createRetryDecorator(config: Partial<RetryConfig> = {}) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return withRetry(() => originalMethod.apply(this, args), config);
    };

    return descriptor;
  };
}
