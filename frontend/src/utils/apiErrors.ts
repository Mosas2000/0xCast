export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  RPC_ERROR = 'RPC_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class ApiError extends Error {
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

export class ContractError extends ApiError {
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

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value?: unknown
  ) {
    super(message, ErrorCode.VALIDATION_ERROR, undefined, { field, value });
    this.name = 'ValidationError';
  }
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.retryable;
  }
  return false;
}

export function getRetryDelay(error: unknown): number {
  if (error instanceof ApiError && error.retryAfter) {
    return error.retryAfter * 1000;
  }
  return 1000;
}

export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
