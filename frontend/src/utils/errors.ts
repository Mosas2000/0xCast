/**
 * Error handling and recovery for sync system
 */

export class SyncError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'SyncError';
  }
}

export class ConflictError extends SyncError {
  constructor(
    message: string,
    public readonly conflictId: string,
    public readonly entityId: string
  ) {
    super(message, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class QueueError extends SyncError {
  constructor(
    message: string,
    public readonly actionId: string
  ) {
    super(message, 'QUEUE_ERROR');
    this.name = 'QueueError';
  }
}

export class StorageError extends SyncError {
  constructor(message: string) {
    super(message, 'STORAGE_ERROR');
    this.name = 'StorageError';
  }
}

export class RetryExhaustedError extends SyncError {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(message, 'RETRY_EXHAUSTED');
    this.name = 'RetryExhaustedError';
  }
}

export class NetworkError extends SyncError {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class ValidationError extends SyncError {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: any
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * Error recovery strategies
 */
export interface ErrorRecoveryStrategy {
  name: string;
  shouldRecover(error: Error): boolean;
  recover(error: Error): Promise<any>;
}

export class DefaultErrorRecovery implements ErrorRecoveryStrategy {
  name = 'default';

  shouldRecover(error: Error): boolean {
    return error instanceof SyncError;
  }

  async recover(error: Error): Promise<any> {
    console.warn('Recovering from error:', error.message);

    if (error instanceof RetryExhaustedError) {
      return { action: 'skip', reason: 'max_retries_exceeded' };
    }

    if (error instanceof StorageError) {
      return { action: 'cleanup', reason: 'storage_issue' };
    }

    if (error instanceof NetworkError) {
      return { action: 'queue', reason: 'network_unavailable' };
    }

    return { action: 'manual_review', reason: 'unknown_error' };
  }
}

export class NetworkErrorRecovery implements ErrorRecoveryStrategy {
  name = 'network';

  private attempts: number = 0;
  private readonly maxAttempts: number = 3;

  shouldRecover(error: Error): boolean {
    return error instanceof NetworkError && this.attempts < this.maxAttempts;
  }

  async recover(error: Error): Promise<any> {
    this.attempts++;

    const delay = 1000 * Math.pow(2, this.attempts - 1);

    return {
      action: 'retry',
      delay,
      attempt: this.attempts,
      maxAttempts: this.maxAttempts,
    };
  }
}

export class StorageErrorRecovery implements ErrorRecoveryStrategy {
  name = 'storage';

  shouldRecover(error: Error): boolean {
    return error instanceof StorageError;
  }

  async recover(error: Error): Promise<any> {
    if (error instanceof StorageError) {
      if (error.message.includes('quota')) {
        return {
          action: 'cleanup',
          target: 'old_entries',
          reason: 'storage_quota_exceeded',
        };
      }

      if (error.message.includes('unavailable')) {
        return {
          action: 'queue',
          reason: 'storage_unavailable',
          fallback: 'memory',
        };
      }
    }

    return { action: 'skip', reason: 'storage_error' };
  }
}

export class ConflictErrorRecovery implements ErrorRecoveryStrategy {
  name = 'conflict';

  private defaultStrategy: 'merge' | 'local' | 'remote' | 'manual' = 'merge';

  constructor(defaultStrategy?: string) {
    if (defaultStrategy) {
      this.defaultStrategy = defaultStrategy as any;
    }
  }

  shouldRecover(error: Error): boolean {
    return error instanceof ConflictError;
  }

  async recover(error: Error): Promise<any> {
    if (error instanceof ConflictError) {
      return {
        action: 'resolve_conflict',
        strategy: this.defaultStrategy,
        conflictId: error.conflictId,
        entityId: error.entityId,
      };
    }

    return { action: 'manual_review', reason: 'conflict_error' };
  }
}

/**
 * Error handler with recovery strategies
 */
export class SyncErrorHandler {
  private strategies: Map<string, ErrorRecoveryStrategy> = new Map();
  private errorLog: Array<{ error: Error; timestamp: number; recovered: boolean }> = [];
  private maxLogSize: number = 1000;

  constructor() {
    this.registerStrategy(new DefaultErrorRecovery());
    this.registerStrategy(new NetworkErrorRecovery());
    this.registerStrategy(new StorageErrorRecovery());
    this.registerStrategy(new ConflictErrorRecovery());
  }

  registerStrategy(strategy: ErrorRecoveryStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  async handleError(error: Error): Promise<any> {
    let recovered = false;
    let recovery: any = null;

    for (const [, strategy] of this.strategies) {
      if (strategy.shouldRecover(error)) {
        try {
          recovery = await strategy.recover(error);
          recovered = true;
          break;
        } catch (recoveryError) {
          console.warn('Recovery failed:', recoveryError);
        }
      }
    }

    this.logError(error, recovered);

    return {
      error,
      recovery,
      recovered,
    };
  }

  private logError(error: Error, recovered: boolean): void {
    const entry = {
      error,
      timestamp: Date.now(),
      recovered,
    };

    this.errorLog.push(entry);

    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
  }

  getErrorLog(): Array<{ error: string; timestamp: number; recovered: boolean }> {
    return this.errorLog.map((entry) => ({
      error: entry.error.message,
      timestamp: entry.timestamp,
      recovered: entry.recovered,
    }));
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  getStats(): {
    total: number;
    recovered: number;
    failed: number;
    recoveryRate: number;
  } {
    const total = this.errorLog.length;
    const recovered = this.errorLog.filter((e) => e.recovered).length;
    const failed = total - recovered;
    const recoveryRate = total > 0 ? recovered / total : 0;

    return {
      total,
      recovered,
      failed,
      recoveryRate,
    };
  }
}

/**
 * Validation utilities for error prevention
 */
export class SyncValidator {
  static validateEntity(entity: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!entity.id || typeof entity.id !== 'string') {
      errors.push('Entity must have a string id');
    }

    if (!entity.type || typeof entity.type !== 'string') {
      errors.push('Entity must have a string type');
    }

    if (!entity.data || typeof entity.data !== 'object') {
      errors.push('Entity must have data object');
    }

    if (
      typeof entity.localVersion !== 'number' ||
      entity.localVersion < 0
    ) {
      errors.push('Entity must have non-negative localVersion');
    }

    if (
      typeof entity.remoteVersion !== 'number' ||
      entity.remoteVersion < 0
    ) {
      errors.push('Entity must have non-negative remoteVersion');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateAction(action: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!action.entityId || typeof action.entityId !== 'string') {
      errors.push('Action must have entityId');
    }

    if (!action.entityType || typeof action.entityType !== 'string') {
      errors.push('Action must have entityType');
    }

    const validActions = ['create', 'update', 'delete'];
    if (!validActions.includes(action.action)) {
      errors.push(`Action must be one of: ${validActions.join(', ')}`);
    }

    if (!action.payload || typeof action.payload !== 'object') {
      errors.push('Action must have payload object');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateConflict(conflict: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!conflict.entityId) {
      errors.push('Conflict must have entityId');
    }

    if (!conflict.fieldName) {
      errors.push('Conflict must have fieldName');
    }

    if (
      !['data_mismatch', 'version_mismatch', 'both'].includes(
        conflict.type
      )
    ) {
      errors.push('Conflict must have valid type');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Circuit breaker for preventing cascading failures
 */
export class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;

  constructor(
    private failureThreshold: number = 5,
    private successThreshold: number = 2,
    private resetTimeout: number = 60000
  ) {}

  getState(): string {
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
        this.successCount = 0;
      } else {
        throw new SyncError(
          'Circuit breaker is open',
          'CIRCUIT_OPEN'
        );
      }
    }

    try {
      const result = await fn();

      if (this.state === 'half-open') {
        this.successCount++;
        if (this.successCount >= this.successThreshold) {
          this.state = 'closed';
          this.failureCount = 0;
          this.successCount = 0;
        }
      } else if (this.state === 'closed') {
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = 'open';
      } else if (this.state === 'half-open') {
        this.state = 'open';
      }

      throw error;
    }
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
  }
}
