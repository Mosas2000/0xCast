export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, unknown>;
}

export interface ErrorHandlerConfig {
  logErrors?: boolean;
  throwErrors?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  onError?: (error: Error, context: ErrorContext) => void;
}

export class ErrorHandler {
  private config: Required<ErrorHandlerConfig>;

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      logErrors: config.logErrors ?? true,
      throwErrors: config.throwErrors ?? false,
      retryAttempts: config.retryAttempts ?? 0,
      retryDelay: config.retryDelay ?? 1000,
      onError: config.onError ?? (() => {}),
    };
  }

  async execute<T>(
    fn: () => Promise<T>,
    context: ErrorContext = {}
  ): Promise<T | null> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (this.config.logErrors) {
          this.logError(lastError, context, attempt);
        }

        this.config.onError(lastError, context);

        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * (attempt + 1));
        }
      }
    }

    if (this.config.throwErrors && lastError) {
      throw lastError;
    }

    return null;
  }

  executeSync<T>(fn: () => T, context: ErrorContext = {}): T | null {
    try {
      return fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (this.config.logErrors) {
        this.logError(err, context);
      }

      this.config.onError(err, context);

      if (this.config.throwErrors) {
        throw err;
      }

      return null;
    }
  }

  private logError(error: Error, context: ErrorContext, attempt?: number): void {
    const logData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      attempt,
      timestamp: new Date().toISOString(),
    };

    console.error('[ErrorHandler]', logData);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
