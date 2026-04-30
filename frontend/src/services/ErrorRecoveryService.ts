/**
 * Error Recovery Service
 * 
 * Provides automatic error recovery strategies for common error scenarios.
 * Implements retry logic, fallback mechanisms, and user guidance for error resolution.
 */

import { ApiError, ErrorCode, ContractError } from '../utils/apiErrors';
import { withRetry } from '../utils/retry';
import { errorLoggingService } from './ErrorLoggingService';

export interface RecoveryStrategy {
  canRecover: (error: unknown) => boolean;
  recover: (error: unknown, context?: RecoveryContext) => Promise<RecoveryResult>;
  getUserGuidance: (error: unknown) => string;
}

export interface RecoveryContext {
  operation: string;
  component: string;
  retryCount?: number;
  maxRetries?: number;
  additionalData?: Record<string, unknown>;
}

export interface RecoveryResult {
  success: boolean;
  message: string;
  action?: 'retry' | 'fallback' | 'manual' | 'abort';
  data?: unknown;
}

class ErrorRecoveryService {
  private strategies: Map<ErrorCode, RecoveryStrategy> = new Map();

  constructor() {
    this.registerDefaultStrategies();
  }

  /**
   * Register default recovery strategies for common error types
   */
  private registerDefaultStrategies(): void {
    // Network error recovery
    this.registerStrategy(ErrorCode.NETWORK_ERROR, {
      canRecover: (error) => error instanceof ApiError && error.code === ErrorCode.NETWORK_ERROR,
      recover: async (error, context) => {
        if (!context) {
          return {
            success: false,
            message: 'No recovery context provided',
            action: 'manual',
          };
        }

        const retryCount = context.retryCount || 0;
        const maxRetries = context.maxRetries || 3;

        if (retryCount >= maxRetries) {
          return {
            success: false,
            message: 'Maximum retry attempts reached. Please check your internet connection.',
            action: 'manual',
          };
        }

        return {
          success: true,
          message: 'Retrying operation...',
          action: 'retry',
        };
      },
      getUserGuidance: () => 
        'Network connection failed. Please check your internet connection and try again.',
    });

    // Timeout error recovery
    this.registerStrategy(ErrorCode.TIMEOUT_ERROR, {
      canRecover: (error) => error instanceof ApiError && error.code === ErrorCode.TIMEOUT_ERROR,
      recover: async (error, context) => {
        const retryCount = context?.retryCount || 0;
        const maxRetries = context?.maxRetries || 2;

        if (retryCount >= maxRetries) {
          return {
            success: false,
            message: 'Request timed out multiple times. The service may be experiencing issues.',
            action: 'manual',
          };
        }

        return {
          success: true,
          message: 'Request timed out. Retrying with longer timeout...',
          action: 'retry',
        };
      },
      getUserGuidance: () => 
        'The request took too long to complete. This may be due to network congestion or high server load.',
    });

    // Rate limit error recovery
    this.registerStrategy(ErrorCode.RATE_LIMIT_ERROR, {
      canRecover: (error) => error instanceof ApiError && error.code === ErrorCode.RATE_LIMIT_ERROR,
      recover: async (error) => {
        const apiError = error as ApiError;
        const retryAfter = apiError.retryAfter || 60;

        return {
          success: true,
          message: `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`,
          action: 'retry',
          data: { retryAfter },
        };
      },
      getUserGuidance: (error) => {
        const apiError = error as ApiError;
        const retryAfter = apiError.retryAfter || 60;
        return `You've made too many requests. Please wait ${retryAfter} seconds before trying again.`;
      },
    });

    // Wallet not connected recovery
    this.registerStrategy(ErrorCode.WALLET_NOT_CONNECTED, {
      canRecover: (error) => 
        error instanceof ApiError && error.code === ErrorCode.WALLET_NOT_CONNECTED,
      recover: async () => {
        return {
          success: false,
          message: 'Please connect your wallet to continue.',
          action: 'manual',
        };
      },
      getUserGuidance: () => 
        'Your wallet is not connected. Please connect your wallet using the button in the top right corner.',
    });

    // Insufficient funds recovery
    this.registerStrategy(ErrorCode.INSUFFICIENT_FUNDS, {
      canRecover: (error) => 
        error instanceof ApiError && error.code === ErrorCode.INSUFFICIENT_FUNDS,
      recover: async () => {
        return {
          success: false,
          message: 'Insufficient funds to complete this transaction.',
          action: 'manual',
        };
      },
      getUserGuidance: () => 
        'You don\'t have enough funds to complete this transaction. Please add funds to your wallet or reduce the transaction amount.',
    });

    // Transaction rejected recovery
    this.registerStrategy(ErrorCode.TRANSACTION_REJECTED, {
      canRecover: (error) => 
        error instanceof ApiError && error.code === ErrorCode.TRANSACTION_REJECTED,
      recover: async () => {
        return {
          success: false,
          message: 'Transaction was cancelled by user.',
          action: 'abort',
        };
      },
      getUserGuidance: () => 
        'You cancelled the transaction. You can try again when you\'re ready.',
    });

    // RPC error recovery
    this.registerStrategy(ErrorCode.RPC_ERROR, {
      canRecover: (error) => error instanceof ApiError && error.code === ErrorCode.RPC_ERROR,
      recover: async (error, context) => {
        const retryCount = context?.retryCount || 0;
        const maxRetries = context?.maxRetries || 3;

        if (retryCount >= maxRetries) {
          return {
            success: false,
            message: 'Blockchain node error persists. Please try again later.',
            action: 'manual',
          };
        }

        return {
          success: true,
          message: 'Blockchain node error. Retrying...',
          action: 'retry',
        };
      },
      getUserGuidance: () => 
        'There was an error communicating with the blockchain. This is usually temporary. Please try again in a few moments.',
    });

    // Contract error recovery
    this.registerStrategy(ErrorCode.CONTRACT_ERROR, {
      canRecover: (error) => error instanceof ContractError,
      recover: async (error) => {
        const contractError = error as ContractError;
        
        // Some contract errors are recoverable (e.g., market not found might be due to timing)
        if (contractError.errorCode === 101) { // Market not found
          return {
            success: true,
            message: 'Market not found. It may not have been created yet. Retrying...',
            action: 'retry',
          };
        }

        // Most contract errors require manual intervention
        return {
          success: false,
          message: contractError.message,
          action: 'manual',
        };
      },
      getUserGuidance: (error) => {
        const contractError = error as ContractError;
        return contractError.message;
      },
    });
  }

  /**
   * Register a custom recovery strategy
   */
  registerStrategy(errorCode: ErrorCode, strategy: RecoveryStrategy): void {
    this.strategies.set(errorCode, strategy);
  }

  /**
   * Attempt to recover from an error
   */
  async recover(
    error: unknown,
    context?: RecoveryContext
  ): Promise<RecoveryResult> {
    try {
      const errorCode = this.getErrorCode(error);
      const strategy = this.strategies.get(errorCode);

      if (!strategy || !strategy.canRecover(error)) {
        return {
          success: false,
          message: 'No recovery strategy available for this error.',
          action: 'manual',
        };
      }

      const result = await strategy.recover(error, context);

      // Log recovery attempt
      errorLoggingService.logError(error as Error, {
        component: context?.component || 'ErrorRecoveryService',
        action: 'recovery-attempt',
        additionalData: {
          ...context?.additionalData,
          recoveryResult: result,
        },
      });

      return result;
    } catch (recoveryError) {
      errorLoggingService.logError(recoveryError as Error, {
        component: 'ErrorRecoveryService',
        action: 'recovery-failed',
        additionalData: {
          originalError: error,
          context,
        },
      });

      return {
        success: false,
        message: 'Error recovery failed.',
        action: 'manual',
      };
    }
  }

  /**
   * Get user-friendly guidance for error resolution
   */
  getUserGuidance(error: unknown): string {
    const errorCode = this.getErrorCode(error);
    const strategy = this.strategies.get(errorCode);

    if (strategy) {
      return strategy.getUserGuidance(error);
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }

  /**
   * Execute an operation with automatic error recovery
   */
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    context: RecoveryContext
  ): Promise<T> {
    let lastError: unknown;
    let retryCount = 0;
    const maxRetries = context.maxRetries || 3;

    while (retryCount <= maxRetries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        const recoveryResult = await this.recover(error, {
          ...context,
          retryCount,
          maxRetries,
        });

        if (!recoveryResult.success || recoveryResult.action === 'abort') {
          throw error;
        }

        if (recoveryResult.action === 'manual') {
          throw error;
        }

        if (recoveryResult.action === 'retry') {
          retryCount++;
          
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          continue;
        }

        // Fallback action
        if (recoveryResult.action === 'fallback' && recoveryResult.data) {
          return recoveryResult.data as T;
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Get error code from error object
   */
  private getErrorCode(error: unknown): ErrorCode {
    if (error instanceof ApiError) {
      return error.code;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('network')) return ErrorCode.NETWORK_ERROR;
      if (message.includes('timeout')) return ErrorCode.TIMEOUT_ERROR;
      if (message.includes('rate limit')) return ErrorCode.RATE_LIMIT_ERROR;
      if (message.includes('wallet')) return ErrorCode.WALLET_NOT_CONNECTED;
      if (message.includes('insufficient')) return ErrorCode.INSUFFICIENT_FUNDS;
      if (message.includes('rejected') || message.includes('cancelled')) {
        return ErrorCode.TRANSACTION_REJECTED;
      }
    }

    return ErrorCode.UNKNOWN_ERROR;
  }
}

export const errorRecoveryService = new ErrorRecoveryService();
