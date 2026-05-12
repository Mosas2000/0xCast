/**
 * Contract Error Handler Module
 * 
 * Provides utilities for handling smart contract errors, parsing Clarity
 * error codes, and wrapping contract calls with consistent error handling.
 * 
 * Key Features:
 * - Automatic error parsing and classification
 * - User-friendly error messages
 * - Transaction ID extraction
 * - Integrated error logging
 * - Type-safe result handling
 * 
 * @module contractErrorHandler
 */

import { ContractError, ApiError, ErrorCode } from './apiErrors';
import { errorLoggingService } from '../services/ErrorLoggingService';

/**
 * Result type for contract call operations
 * 
 * Provides a type-safe way to handle contract call results
 * with either success data or error information.
 * 
 * @template T - Type of the successful result data
 */
export interface ContractCallResult<T> {
  /** Whether the contract call succeeded */
  success: boolean;
  /** Result data (only present if success is true) */
  data?: T;
  /** Error information (only present if success is false) */
  error?: ContractError;
  /** Transaction ID (if available) */
  txId?: string;
}

/**
 * Handle contract call with automatic error handling
 * 
 * Wraps a contract operation with consistent error handling, logging,
 * and result formatting. Automatically catches and parses errors,
 * logs them to the error service, and returns a type-safe result.
 * 
 * @template T - Type of the successful result
 * @param contractName - Name of the contract being called
 * @param functionName - Name of the function being called
 * @param operation - Async function that performs the contract call
 * @param options - Optional configuration for callbacks and logging
 * @returns Promise resolving to ContractCallResult with success/error info
 * 
 * @example
 * ```typescript
 * const result = await handleContractCall(
 *   'market-core',
 *   'create-market',
 *   async () => {
 *     return await openContractCall({...});
 *   },
 *   {
 *     onSuccess: (data) => console.log('Market created:', data),
 *     onError: (error) => toast.error(error.message),
 *     logErrors: true
 *   }
 * );
 * 
 * if (result.success) {
 *   console.log('Transaction ID:', result.txId);
 * } else {
 *   console.error('Error:', result.error?.message);
 * }
 * ```
 */
export async function handleContractCall<T>(
  contractName: string,
  functionName: string,
  operation: () => Promise<T>,
  options: {
    /** Callback invoked on successful operation */
    onSuccess?: (data: T) => void;
    /** Callback invoked on error */
    onError?: (error: ContractError) => void;
    /** Whether to log errors to error service (default: true) */
    logErrors?: boolean;
  } = {}
): Promise<ContractCallResult<T>> {
  try {
    const data = await operation();

    if (options.onSuccess) {
      options.onSuccess(data);
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    const contractError = parseContractError(error, contractName, functionName);

    if (options.logErrors !== false) {
      errorLoggingService.logError(contractError, {
        component: 'ContractCall',
        action: `${contractName}.${functionName}`,
        additionalData: {
          contractName,
          functionName,
        },
      });
    }

    if (options.onError) {
      options.onError(contractError);
    }

    return {
      success: false,
      error: contractError,
    };
  }
}

/**
 * Parse any error into a structured ContractError
 * 
 * Analyzes error messages to extract:
 * - Clarity error codes (err u100, err u101, etc.)
 * - Transaction IDs (0x...)
 * - Common error patterns (user rejection, insufficient funds, etc.)
 * 
 * @param error - Any error object or value
 * @param contractName - Name of the contract that was called
 * @param functionName - Name of the function that was called
 * @returns Structured ContractError with parsed information
 * 
 * @example
 * ```typescript
 * try {
 *   await contractCall();
 * } catch (error) {
 *   const contractError = parseContractError(error, 'market-core', 'predict');
 *   console.log('Error code:', contractError.errorCode);
 *   console.log('Transaction:', contractError.txId);
 * }
 * ```
 */
export function parseContractError(
  error: unknown,
  contractName: string,
  functionName: string
): ContractError {
  if (error instanceof ContractError) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Parse Clarity error codes
    const errorCodeMatch = message.match(/\(err u(\d+)\)/);
    if (errorCodeMatch) {
      const errorCode = parseInt(errorCodeMatch[1], 10);
      return ContractError.fromClarityError(errorCode, contractName, functionName);
    }

    // Parse transaction ID
    const txIdMatch = message.match(/0x[a-fA-F0-9]{64}/);
    const txId = txIdMatch ? txIdMatch[0] : undefined;

    // User rejected transaction
    if (message.includes('user rejected') || message.includes('cancelled')) {
      return new ContractError(
        'Transaction was cancelled by user.',
        contractName,
        functionName,
        txId
      );
    }

    // Insufficient funds
    if (message.includes('insufficient') && message.includes('funds')) {
      return new ContractError(
        'Insufficient funds to complete this transaction.',
        contractName,
        functionName,
        txId
      );
    }

    // Contract not found
    if (message.includes('contract') && message.includes('not found')) {
      return new ContractError(
        'Contract not found. Please check the contract address.',
        contractName,
        functionName,
        txId
      );
    }

    // Function not found
    if (message.includes('function') && message.includes('not found')) {
      return new ContractError(
        `Function '${functionName}' not found in contract '${contractName}'.`,
        contractName,
        functionName,
        txId
      );
    }

    // Generic contract error
    return new ContractError(
      error.message || 'Contract call failed.',
      contractName,
      functionName,
      txId
    );
  }

  return new ContractError(
    'An unexpected error occurred during contract call.',
    contractName,
    functionName
  );
}

/**
 * Get user-friendly error message from ContractError
 * 
 * Extracts the most appropriate user-facing message from a ContractError.
 * If the error has a Clarity error code, returns the mapped message.
 * Otherwise, returns the error's message property.
 * 
 * @param error - ContractError to extract message from
 * @returns User-friendly error message
 * 
 * @example
 * ```typescript
 * const error = parseContractError(rawError, 'market-core', 'predict');
 * const message = getUserFriendlyContractError(error);
 * toast.error(message); // Display to user
 * ```
 */
export function getUserFriendlyContractError(error: ContractError): string {
  if (error.errorCode) {
    // Return the already user-friendly message from ContractError.fromClarityError
    return error.message;
  }

  // Fallback for other contract errors
  return error.message;
}

/**
 * Check if an error represents a user transaction rejection
 * 
 * Detects when a user cancels or rejects a transaction in their wallet.
 * Useful for distinguishing user cancellations from actual errors.
 * 
 * @param error - Any error object
 * @returns true if the error is a user rejection
 * 
 * @example
 * ```typescript
 * try {
 *   await openContractCall({...});
 * } catch (error) {
 *   if (isTransactionRejection(error)) {
 *     // Don't show error toast for user cancellations
 *     console.log('User cancelled transaction');
 *   } else {
 *     toast.error('Transaction failed');
 *   }
 * }
 * ```
 */
export function isTransactionRejection(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.code === ErrorCode.TRANSACTION_REJECTED;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('user rejected') || message.includes('cancelled');
  }

  return false;
}

/**
 * Check if an error is due to insufficient funds
 * 
 * Detects when a transaction fails because the user doesn't have
 * enough balance to complete the operation.
 * 
 * @param error - Any error object
 * @returns true if the error is due to insufficient funds
 * 
 * @example
 * ```typescript
 * try {
 *   await stakeTokens(amount);
 * } catch (error) {
 *   if (isInsufficientFunds(error)) {
 *     toast.error('Insufficient balance. Please add funds to your wallet.');
 *   }
 * }
 * ```
 */
export function isInsufficientFunds(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.code === ErrorCode.INSUFFICIENT_FUNDS;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('insufficient') && message.includes('funds');
  }

  return false;
}

/**
 * Extract transaction ID from any error
 * 
 * Searches error messages for Stacks transaction IDs (0x followed by 64 hex chars).
 * Useful for providing users with transaction links or debugging information.
 * 
 * @param error - Any error object
 * @returns Transaction ID if found, undefined otherwise
 * 
 * @example
 * ```typescript
 * try {
 *   await contractCall();
 * } catch (error) {
 *   const txId = extractTxId(error);
 *   if (txId) {
 *     console.log(`View transaction: https://explorer.stacks.co/txid/${txId}`);
 *   }
 * }
 * ```
 */
export function extractTxId(error: unknown): string | undefined {
  if (error instanceof ContractError) {
    return error.txId;
  }

  if (error instanceof Error) {
    const match = error.message.match(/0x[a-fA-F0-9]{64}/);
    return match ? match[0] : undefined;
  }

  return undefined;
}
