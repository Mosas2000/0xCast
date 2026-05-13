export interface AsyncOperationResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

export interface AsyncOperationOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onTimeout?: () => void;
}

export class AsyncOperationHandler {
  static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    onTimeout?: () => void
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        if (onTimeout) onTimeout();
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  static async withRetry<T>(
    fn: () => Promise<T>,
    options: AsyncOperationOptions = {}
  ): Promise<T> {
    const {
      retries = 3,
      retryDelay = 1000,
      timeout,
      onRetry,
      onTimeout,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const operation = fn();
        const result = timeout
          ? await this.withTimeout(operation, timeout, onTimeout)
          : await operation;
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < retries) {
          if (onRetry) onRetry(attempt + 1, lastError);
          await this.delay(retryDelay * (attempt + 1));
        }
      }
    }

    throw lastError;
  }

  static async safe<T>(
    fn: () => Promise<T>
  ): Promise<AsyncOperationResult<T>> {
    try {
      const data = await fn();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  static async parallel<T>(
    operations: Array<() => Promise<T>>
  ): Promise<AsyncOperationResult<T>[]> {
    const promises = operations.map((op) => this.safe(op));
    return Promise.all(promises);
  }

  static async sequential<T>(
    operations: Array<() => Promise<T>>
  ): Promise<AsyncOperationResult<T>[]> {
    const results: AsyncOperationResult<T>[] = [];

    for (const operation of operations) {
      const result = await this.safe(operation);
      results.push(result);
    }

    return results;
  }

  static async race<T>(
    operations: Array<() => Promise<T>>
  ): Promise<AsyncOperationResult<T>> {
    try {
      const promises = operations.map((op) => op());
      const data = await Promise.race(promises);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  static async allSettled<T>(
    operations: Array<() => Promise<T>>
  ): Promise<AsyncOperationResult<T>[]> {
    const promises = operations.map((op) => op());
    const results = await Promise.allSettled(promises);

    return results.map((result) => {
      if (result.status === 'fulfilled') {
        return { success: true, data: result.value };
      } else {
        return {
          success: false,
          error:
            result.reason instanceof Error
              ? result.reason
              : new Error(String(result.reason)),
        };
      }
    });
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
