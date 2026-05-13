export interface RecoveryStrategy {
  name: string;
  canRecover: (error: Error) => boolean;
  recover: () => Promise<void> | void;
}

export class ErrorRecovery {
  private strategies: RecoveryStrategy[] = [];

  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
  }

  async attemptRecovery(error: Error): Promise<boolean> {
    for (const strategy of this.strategies) {
      if (strategy.canRecover(error)) {
        try {
          await strategy.recover();
          return true;
        } catch (recoveryError) {
          console.error(
            `Recovery strategy "${strategy.name}" failed:`,
            recoveryError
          );
        }
      }
    }
    return false;
  }

  getApplicableStrategies(error: Error): RecoveryStrategy[] {
    return this.strategies.filter((strategy) => strategy.canRecover(error));
  }

  clearStrategies(): void {
    this.strategies = [];
  }

  static createReloadStrategy(): RecoveryStrategy {
    return {
      name: 'reload',
      canRecover: (error) => error.name.includes('ChunkLoadError'),
      recover: () => {
        window.location.reload();
      },
    };
  }

  static createRetryStrategy(
    retryFn: () => Promise<void>
  ): RecoveryStrategy {
    return {
      name: 'retry',
      canRecover: (error) =>
        error.name.includes('NetworkError') ||
        error.name.includes('TimeoutError'),
      recover: retryFn,
    };
  }

  static createClearCacheStrategy(): RecoveryStrategy {
    return {
      name: 'clear_cache',
      canRecover: (error) => error.message.includes('cache'),
      recover: async () => {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
        }
      },
    };
  }

  static createClearStorageStrategy(): RecoveryStrategy {
    return {
      name: 'clear_storage',
      canRecover: (error) => error.message.includes('storage'),
      recover: () => {
        localStorage.clear();
        sessionStorage.clear();
      },
    };
  }

  static createFallbackStrategy(
    fallbackFn: () => Promise<void> | void
  ): RecoveryStrategy {
    return {
      name: 'fallback',
      canRecover: () => true,
      recover: fallbackFn,
    };
  }
}

export const errorRecovery = new ErrorRecovery();

errorRecovery.registerStrategy(ErrorRecovery.createReloadStrategy());
errorRecovery.registerStrategy(ErrorRecovery.createClearCacheStrategy());
errorRecovery.registerStrategy(ErrorRecovery.createClearStorageStrategy());
