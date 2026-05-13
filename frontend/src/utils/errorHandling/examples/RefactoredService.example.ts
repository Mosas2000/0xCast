import {
  ErrorHandler,
  StorageErrorHandler,
  ApiErrorHandler,
  ValidationErrorHandler,
  AsyncOperationHandler,
  errorLogger,
} from '../index';

export class RefactoredServiceExample {
  private errorHandler: ErrorHandler;
  private static readonly STORAGE_KEY = 'service_data';

  constructor() {
    this.errorHandler = new ErrorHandler({
      retryAttempts: 3,
      retryDelay: 1000,
      logErrors: true,
      onError: (error, context) => {
        errorLogger.error('Service error', error, context);
      },
    });
  }

  async fetchData(id: string): Promise<any | null> {
    return await this.errorHandler.execute(
      async () => {
        const response = await fetch(`/api/data/${id}`);
        return await ApiErrorHandler.handleResponse(response);
      },
      {
        component: 'RefactoredService',
        action: 'fetchData',
        additionalData: { id },
      }
    );
  }

  async fetchWithTimeout(id: string, timeout: number = 5000): Promise<any | null> {
    return await AsyncOperationHandler.withTimeout(
      this.fetchData(id),
      timeout,
      () => errorLogger.warn('Fetch operation timed out', { id })
    );
  }

  async fetchMultiple(ids: string[]): Promise<any[]> {
    const operations = ids.map((id) => () => this.fetchData(id));
    const results = await AsyncOperationHandler.parallel(operations);
    return results.filter((r) => r.success).map((r) => r.data);
  }

  saveToStorage(key: string, data: any): boolean {
    return StorageErrorHandler.safeSetItem(`${RefactoredServiceExample.STORAGE_KEY}_${key}`, data);
  }

  loadFromStorage<T>(key: string, defaultValue: T): T {
    return StorageErrorHandler.safeGetItem<T>(
      `${RefactoredServiceExample.STORAGE_KEY}_${key}`,
      defaultValue
    );
  }

  validateInput(data: { email: string; age: number; name: string }): {
    valid: boolean;
    errors: any[];
  } {
    const validator = new ValidationErrorHandler();

    const emailError = ValidationErrorHandler.email(data.email, 'email');
    if (emailError) validator.addError(emailError.field, emailError.message);

    const ageError = ValidationErrorHandler.range(data.age, 18, 120, 'age');
    if (ageError) validator.addError(ageError.field, ageError.message);

    const nameError = ValidationErrorHandler.minLength(data.name, 2, 'name');
    if (nameError) validator.addError(nameError.field, nameError.message);

    return {
      valid: !validator.hasErrors(),
      errors: validator.getErrors(),
    };
  }

  async retryableOperation<T>(fn: () => Promise<T>): Promise<T | null> {
    return await AsyncOperationHandler.withRetry(fn, {
      retries: 3,
      retryDelay: 1000,
      timeout: 10000,
      onRetry: (attempt, error) => {
        errorLogger.warn(`Retry attempt ${attempt}`, { error: error.message });
      },
    });
  }

  cleanupOldData(maxAgeMs: number): number {
    return StorageErrorHandler.cleanupOldItems(maxAgeMs);
  }

  checkStorageHealth(): {
    available: boolean;
    full: boolean;
    size: number;
  } {
    return {
      available: StorageErrorHandler.isAvailable(),
      full: StorageErrorHandler.isStorageFull(),
      size: StorageErrorHandler.getStorageSize(),
    };
  }
}
