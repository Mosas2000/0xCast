export interface ErrorInfo {
  componentStack: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundaryHandler {
  static createInitialState(): ErrorBoundaryState {
    return {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static handleError(
    error: Error,
    errorInfo: ErrorInfo
  ): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo,
    };
  }

  static reset(): ErrorBoundaryState {
    return this.createInitialState();
  }

  static logError(error: Error, errorInfo: ErrorInfo, componentName?: string): void {
    console.error(
      `Error in ${componentName || 'component'}:`,
      error,
      errorInfo.componentStack
    );
  }

  static getErrorMessage(error: Error): string {
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  static getErrorStack(error: Error): string {
    return error.stack || 'No stack trace available';
  }

  static shouldRecover(error: Error): boolean {
    const recoverableErrors = [
      'ChunkLoadError',
      'NetworkError',
      'TimeoutError',
    ];

    return recoverableErrors.some((type) => error.name.includes(type));
  }

  static getRecoveryAction(error: Error): string {
    if (error.name.includes('ChunkLoadError')) {
      return 'reload';
    }
    if (error.name.includes('NetworkError')) {
      return 'retry';
    }
    return 'none';
  }
}
