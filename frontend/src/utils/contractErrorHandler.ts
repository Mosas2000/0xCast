import { ContractError, ApiError, ErrorCode } from './apiErrors';
import { errorLoggingService } from '../services/ErrorLoggingService';

export interface ContractCallResult<T> {
  success: boolean;
  data?: T;
  error?: ContractError;
  txId?: string;
}

export async function handleContractCall<T>(
  contractName: string,
  functionName: string,
  operation: () => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: ContractError) => void;
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

export function getUserFriendlyContractError(error: ContractError): string {
  if (error.errorCode) {
    // Return the already user-friendly message from ContractError.fromClarityError
    return error.message;
  }

  // Fallback for other contract errors
  return error.message;
}

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
