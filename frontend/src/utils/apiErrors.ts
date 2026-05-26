/**
 * Error codes for API and contract interactions
 * 
 * These codes categorize different types of errors that can occur
 * during blockchain interactions, API calls, and user operations.
 */
export enum ErrorCode {
  /** Network connectivity issues */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Request timeout errors */
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  /** Rate limiting errors (too many requests) */
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  /** Authentication required (401) */
  UNAUTHORIZED = 'UNAUTHORIZED',
  /** Permission denied (403) */
  FORBIDDEN = 'FORBIDDEN',
  /** Resource not found (404) */
  NOT_FOUND = 'NOT_FOUND',
  /** Input validation errors */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Smart contract execution errors */
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  /** User rejected transaction in wallet */
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  /** Insufficient balance for transaction */
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  /** Wallet not connected */
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  /** Blockchain RPC node errors */
  RPC_ERROR = 'RPC_ERROR',
  /** Unclassified errors */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Base error class for API and blockchain interactions
 * 
 * Provides structured error information including error codes,
 * HTTP status codes, retry information, and additional context data.
 * 
 * @example
 * ```typescript
 * throw new ApiError(
 *   'Network connection failed',
 *   ErrorCode.NETWORK_ERROR,
 *   undefined,
 *   undefined,
 *   true, // retryable
 *   5 // retry after 5 seconds
 * );
 * ```
 */
export class ApiError extends Error {
  /**
   * Create a new ApiError
   * 
   * @param message - Human-readable error message
   * @param code - Error code from ErrorCode enum
   * @param statusCode - HTTP status code (if applicable)
   * @param data - Additional error context data
   * @param retryable - Whether the operation can be retried
   * @param retryAfter - Suggested retry delay in seconds
   */
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly statusCode?: number,
    public readonly data?: Record<string, unknown>,
    public readonly retryable: boolean = false,
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * Convert any error to a structured ApiError
   * 
   * Analyzes error messages and types to determine the appropriate
   * error code, retry behavior, and user-friendly message.
   * 
   * @param error - Any error object or value
   * @returns Structured ApiError with appropriate classification
   * 
   * @example
   * ```typescript
   * try {
   *   await fetch('/api/data');
   * } catch (error) {
   *   const apiError = ApiError.fromError(error);
   *   if (apiError.retryable) {
   *     // Retry logic
   *   }
   * }
   * ```
   */
  static fromError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('network') || message.includes('fetch')) {
        return new ApiError(
          'Network connection failed. Please check your internet connection.',
          ErrorCode.NETWORK_ERROR,
          undefined,
          undefined,
          true
        );
      }

      if (message.includes('timeout')) {
        return new ApiError(
          'Request timed out. Please try again.',
          ErrorCode.TIMEOUT_ERROR,
          undefined,
          undefined,
          true
        );
      }

      if (message.includes('rate limit') || message.includes('429')) {
        return new ApiError(
          'Too many requests. Please wait before trying again.',
          ErrorCode.RATE_LIMIT_ERROR,
          429,
          undefined,
          true,
          60
        );
      }

      if (message.includes('unauthorized') || message.includes('401')) {
        return new ApiError(
          'Authentication required. Please connect your wallet.',
          ErrorCode.UNAUTHORIZED,
          401
        );
      }

      if (message.includes('forbidden') || message.includes('403')) {
        return new ApiError(
          'You do not have permission to perform this action.',
          ErrorCode.FORBIDDEN,
          403
        );
      }

      if (message.includes('not found') || message.includes('404')) {
        return new ApiError(
          'The requested resource was not found.',
          ErrorCode.NOT_FOUND,
          404
        );
      }

      if (message.includes('user rejected') || message.includes('cancelled')) {
        return new ApiError(
          'Transaction was cancelled by user.',
          ErrorCode.TRANSACTION_REJECTED
        );
      }

      if (message.includes('insufficient') && message.includes('funds')) {
        return new ApiError(
          'Insufficient funds to complete this transaction.',
          ErrorCode.INSUFFICIENT_FUNDS
        );
      }

      if (message.includes('wallet') && message.includes('not connected')) {
        return new ApiError(
          'Please connect your wallet to continue.',
          ErrorCode.WALLET_NOT_CONNECTED
        );
      }

      if (message.includes('rpc') || message.includes('node')) {
        return new ApiError(
          'Blockchain node error. Please try again.',
          ErrorCode.RPC_ERROR,
          undefined,
          undefined,
          true
        );
      }

      return new ApiError(
        error.message || 'An unexpected error occurred.',
        ErrorCode.UNKNOWN_ERROR,
        undefined,
        undefined,
        false
      );
    }

    return new ApiError(
      'An unexpected error occurred.',
      ErrorCode.UNKNOWN_ERROR
    );
  }
}

/**
 * Smart contract error class with Clarity error code support
 * 
 * Extends ApiError with contract-specific information including
 * contract name, function name, transaction ID, and Clarity error codes.
 * 
 * @example
 * ```typescript
 * // From Clarity error code
 * const error = ContractError.fromClarityError(101, 'market-core', 'create-market');
 * console.log(error.message); // "Market not found."
 * 
 * // Manual construction
 * throw new ContractError(
 *   'Transaction failed',
 *   'market-core',
 *   'predict',
 *   '0x1234...',
 *   105
 * );
 * ```
 */
export class ContractError extends ApiError {
  /**
   * Create a new ContractError
   * 
   * @param message - Human-readable error message
   * @param contractName - Name of the contract that failed
   * @param functionName - Name of the function that was called
   * @param txId - Transaction ID (if available)
   * @param errorCode - Clarity error code (if available)
   */
  constructor(
    message: string,
    public readonly contractName: string,
    public readonly functionName: string,
    public readonly txId?: string,
    public readonly errorCode?: number
  ) {
    super(message, ErrorCode.CONTRACT_ERROR, undefined, {
      contractName,
      functionName,
      txId,
      errorCode,
    });
    this.name = 'ContractError';
  }

  /**
   * Create ContractError from Clarity error code
   * 
   * Maps Clarity error codes (u100-u125) to user-friendly messages.
   * This provides consistent error messaging across the application.
   * 
   * @param errorCode - Clarity error code (100-125)
   * @param contractName - Name of the contract
   * @param functionName - Name of the function
   * @returns ContractError with appropriate message
   * 
   * @example
   * ```typescript
   * // Parse error from contract response
   * const match = errorMessage.match(/\(err u(\d+)\)/);
   * if (match) {
   *   const code = parseInt(match[1], 10);
   *   const error = ContractError.fromClarityError(code, 'market-core', 'predict');
   * }
   * ```
   */
  static fromClarityError(errorCode: number, contractName: string, functionName: string): ContractError {
    const errorMessages: Record<number, string> = {
      100: 'You are not authorized to perform this action.',
      101: 'Market not found.',
      102: 'Market has already been resolved.',
      103: 'Market has not ended yet.',
      104: 'Invalid outcome specified.',
      105: 'Market is still active.',
      106: 'Invalid dates provided.',
      107: 'Market has already ended.',
      108: 'Rewards already claimed.',
      109: 'No winnings to claim.',
      110: 'Market is not resolved yet.',
      111: 'Invalid category.',
      112: 'Market has been abandoned.',
      113: 'Already refunded.',
      114: 'Market is in dispute.',
      115: 'Refund not allowed.',
      116: 'Market not finalized.',
      117: 'Finalization not ready.',
      118: 'Market not disputed.',
      119: 'Contract is paused.',
      120: 'Invalid pause state.',
      121: 'Already approved.',
      122: 'Not authorized for pause.',
      123: 'Rate limit exceeded.',
      124: 'Invalid new owner.',
      125: 'Owner transfer cooldown not met.',
    };

    const message = errorMessages[errorCode] || `Contract error: ${errorCode}`;

    return new ContractError(message, contractName, functionName, undefined, errorCode);
  }
}

/**
 * Validation error class for input validation failures
 * 
 * Used when user input fails validation checks before
 * being sent to the blockchain or API.
 * 
 * @example
 * ```typescript
 * if (amount <= 0) {
 *   throw new ValidationError(
 *     'Amount must be greater than zero',
 *     'amount',
 *     amount
 *   );
 * }
 * ```
 */
export class ValidationError extends ApiError {
  /**
   * Create a new ValidationError
   * 
   * @param message - Human-readable error message
   * @param field - Name of the field that failed validation
   * @param value - The invalid value (optional)
   */
  constructor(
    message: string,
    public readonly field: string,
    public readonly value?: unknown
  ) {
    super(message, ErrorCode.VALIDATION_ERROR, undefined, { field, value });
    this.name = 'ValidationError';
  }
}

/**
 * Check if an error is retryable
 * 
 * Determines whether a failed operation should be retried based
 * on the error type and retry flag.
 * 
 * @param error - Any error object
 * @returns true if the error is retryable
 * 
 * @example
 * ```typescript
 * try {
 *   await fetchData();
 * } catch (error) {
 *   if (isRetryableError(error)) {
 *     await delay(getRetryDelay(error));
 *     await fetchData(); // Retry
 *   }
 * }
 * ```
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.retryable ||
      error.code === ErrorCode.NETWORK_ERROR ||
      error.code === ErrorCode.TIMEOUT_ERROR ||
      error.code === ErrorCode.RATE_LIMIT_ERROR ||
      error.code === ErrorCode.RPC_ERROR;
  }
  return false;
}

/**
 * Get recommended retry delay for an error
 * 
 * Returns the suggested delay in milliseconds before retrying
 * a failed operation. Uses the error's retryAfter value if available,
 * otherwise defaults to 1 second.
 * 
 * @param error - Any error object
 * @returns Delay in milliseconds
 * 
 * @example
 * ```typescript
 * const delay = getRetryDelay(error);
 * await new Promise(resolve => setTimeout(resolve, delay));
 * ```
 */
export function getRetryDelay(error: unknown): number {
  if (error instanceof ApiError && error.retryAfter) {
    return error.retryAfter * 1000;
  }
  return 1000;
}

/**
 * Extract user-friendly message from any error
 * 
 * Converts any error type to a human-readable message suitable
 * for display to end users.
 * 
 * @param error - Any error object or value
 * @returns User-friendly error message
 * 
 * @example
 * ```typescript
 * try {
 *   await operation();
 * } catch (error) {
 *   toast.error(getUserFriendlyMessage(error));
 * }
 * ```
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
