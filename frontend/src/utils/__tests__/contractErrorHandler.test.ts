import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  handleContractCall,
  parseContractError,
  getUserFriendlyContractError,
  isTransactionRejection,
  isInsufficientFunds,
  extractTxId,
} from '../contractErrorHandler';
import { ContractError } from '../apiErrors';
import { errorLoggingService } from '../../services/ErrorLoggingService';

vi.mock('../../services/ErrorLoggingService', () => ({
  errorLoggingService: {
    logError: vi.fn(),
  },
}));

describe('contractErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleContractCall', () => {
    it('should handle successful contract call', async () => {
      const operation = vi.fn().mockResolvedValue({ result: 'success' });
      const onSuccess = vi.fn();

      const result = await handleContractCall(
        'market-core',
        'create-market',
        operation,
        { onSuccess }
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ result: 'success' });
      expect(result.error).toBeUndefined();
      expect(onSuccess).toHaveBeenCalledWith({ result: 'success' });
    });

    it('should handle contract call failure', async () => {
      const error = new Error('Contract call failed');
      const operation = vi.fn().mockRejectedValue(error);
      const onError = vi.fn();

      const result = await handleContractCall(
        'market-core',
        'create-market',
        operation,
        { onError }
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ContractError);
      expect(result.data).toBeUndefined();
      expect(onError).toHaveBeenCalled();
      expect(errorLoggingService.logError).toHaveBeenCalled();
    });

    it('should not log errors when logErrors is false', async () => {
      const error = new Error('Contract call failed');
      const operation = vi.fn().mockRejectedValue(error);

      await handleContractCall('market-core', 'create-market', operation, {
        logErrors: false,
      });

      expect(errorLoggingService.logError).not.toHaveBeenCalled();
    });
  });

  describe('parseContractError', () => {
    it('should return ContractError as-is', () => {
      const contractError = new ContractError(
        'Test error',
        'market-core',
        'create-market'
      );

      const result = parseContractError(
        contractError,
        'market-core',
        'create-market'
      );

      expect(result).toBe(contractError);
    });

    it('should parse Clarity error codes', () => {
      const error = new Error('Contract error: (err u100)');

      const result = parseContractError(error, 'market-core', 'create-market');

      expect(result).toBeInstanceOf(ContractError);
      expect(result.errorCode).toBe(100);
      expect(result.message).toContain('unauthorized');
    });

    it('should parse user rejection', () => {
      const error = new Error('User rejected transaction');

      const result = parseContractError(error, 'market-core', 'create-market');

      expect(result.message).toBe('Transaction was cancelled by user.');
    });

    it('should parse insufficient funds error', () => {
      const error = new Error('Insufficient funds for transaction');

      const result = parseContractError(error, 'market-core', 'create-market');

      expect(result.message).toBe(
        'Insufficient funds to complete this transaction.'
      );
    });

    it('should parse contract not found error', () => {
      const error = new Error('Contract not found');

      const result = parseContractError(error, 'market-core', 'create-market');

      expect(result.message).toBe(
        'Contract not found. Please check the contract address.'
      );
    });

    it('should parse function not found error', () => {
      const error = new Error('Function not found');

      const result = parseContractError(error, 'market-core', 'create-market');

      expect(result.message).toContain('create-market');
      expect(result.message).toContain('market-core');
    });

    it('should extract transaction ID', () => {
      const txId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const error = new Error(`Transaction failed: ${txId}`);

      const result = parseContractError(error, 'market-core', 'create-market');

      expect(result.txId).toBe(txId);
    });

    it('should handle non-Error objects', () => {
      const result = parseContractError('string error', 'market-core', 'create-market');

      expect(result).toBeInstanceOf(ContractError);
      expect(result.message).toBe(
        'An unexpected error occurred during contract call.'
      );
    });
  });

  describe('getUserFriendlyContractError', () => {
    it('should return message for error with code', () => {
      const error = new ContractError(
        'User-friendly message',
        'market-core',
        'create-market',
        undefined,
        100
      );

      const result = getUserFriendlyContractError(error);

      expect(result).toBe('User-friendly message');
    });

    it('should return message for error without code', () => {
      const error = new ContractError(
        'Generic error message',
        'market-core',
        'create-market'
      );

      const result = getUserFriendlyContractError(error);

      expect(result).toBe('Generic error message');
    });
  });

  describe('isTransactionRejection', () => {
    it('should detect user rejection in Error', () => {
      const error = new Error('User rejected transaction');
      expect(isTransactionRejection(error)).toBe(true);
    });

    it('should detect cancellation in Error', () => {
      const error = new Error('Transaction cancelled');
      expect(isTransactionRejection(error)).toBe(true);
    });

    it('should return false for non-rejection errors', () => {
      const error = new Error('Network error');
      expect(isTransactionRejection(error)).toBe(false);
    });

    it('should return false for non-Error objects', () => {
      expect(isTransactionRejection('string error')).toBe(false);
    });
  });

  describe('isInsufficientFunds', () => {
    it('should detect insufficient funds in Error', () => {
      const error = new Error('Insufficient funds for transaction');
      expect(isInsufficientFunds(error)).toBe(true);
    });

    it('should return false for non-funds errors', () => {
      const error = new Error('Network error');
      expect(isInsufficientFunds(error)).toBe(false);
    });

    it('should return false for non-Error objects', () => {
      expect(isInsufficientFunds('string error')).toBe(false);
    });
  });

  describe('extractTxId', () => {
    it('should extract transaction ID from ContractError', () => {
      const txId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const error = new ContractError(
        'Error',
        'market-core',
        'create-market',
        txId
      );

      expect(extractTxId(error)).toBe(txId);
    });

    it('should extract transaction ID from Error message', () => {
      const txId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const error = new Error(`Transaction failed: ${txId}`);

      expect(extractTxId(error)).toBe(txId);
    });

    it('should return undefined when no transaction ID found', () => {
      const error = new Error('Generic error');
      expect(extractTxId(error)).toBeUndefined();
    });

    it('should return undefined for non-Error objects', () => {
      expect(extractTxId('string error')).toBeUndefined();
    });
  });
});
