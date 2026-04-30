import { describe, it, expect, beforeEach, vi } from 'vitest';
import { errorRecoveryService } from '../ErrorRecoveryService';
import { ApiError, ErrorCode, ContractError } from '../../utils/apiErrors';

describe('ErrorRecoveryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Network Error Recovery', () => {
    it('should recover from network errors with retry', async () => {
      const error = new ApiError(
        'Network error',
        ErrorCode.NETWORK_ERROR,
        undefined,
        undefined,
        true
      );

      const result = await errorRecoveryService.recover(error, {
        operation: 'test',
        component: 'test',
        retryCount: 0,
        maxRetries: 3,
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('retry');
    });

    it('should fail after max retries', async () => {
      const error = new ApiError(
        'Network error',
        ErrorCode.NETWORK_ERROR,
        undefined,
        undefined,
        true
      );

      const result = await errorRecoveryService.recover(error, {
        operation: 'test',
        component: 'test',
        retryCount: 3,
        maxRetries: 3,
      });

      expect(result.success).toBe(false);
      expect(result.action).toBe('manual');
    });

    it('should provide user guidance for network errors', () => {
      const error = new ApiError(
        'Network error',
        ErrorCode.NETWORK_ERROR
      );

      const guidance = errorRecoveryService.getUserGuidance(error);
      expect(guidance).toContain('internet connection');
    });
  });

  describe('Timeout Error Recovery', () => {
    it('should recover from timeout errors', async () => {
      const error = new ApiError(
        'Timeout',
        ErrorCode.TIMEOUT_ERROR,
        undefined,
        undefined,
        true
      );

      const result = await errorRecoveryService.recover(error, {
        operation: 'test',
        component: 'test',
        retryCount: 0,
        maxRetries: 2,
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('retry');
    });

    it('should provide user guidance for timeout errors', () => {
      const error = new ApiError(
        'Timeout',
        ErrorCode.TIMEOUT_ERROR
      );

      const guidance = errorRecoveryService.getUserGuidance(error);
      expect(guidance).toContain('too long');
    });
  });

  describe('Rate Limit Error Recovery', () => {
    it('should recover from rate limit errors with retry after', async () => {
      const error = new ApiError(
        'Rate limit',
        ErrorCode.RATE_LIMIT_ERROR,
        429,
        undefined,
        true,
        60
      );

      const result = await errorRecoveryService.recover(error, {
        operation: 'test',
        component: 'test',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('retry');
      expect(result.data).toEqual({ retryAfter: 60 });
    });

    it('should provide user guidance with retry time', () => {
      const error = new ApiError(
        'Rate limit',
        ErrorCode.RATE_LIMIT_ERROR,
        429,
        undefined,
        true,
        60
      );

      const guidance = errorRecoveryService.getUserGuidance(error);
      expect(guidance).toContain('60 seconds');
    });
  });

  describe('Wallet Not Connected Recovery', () => {
    it('should not auto-recover from wallet not connected', async () => {
      const error = new ApiError(
        'Wallet not connected',
        ErrorCode.WALLET_NOT_CONNECTED
      );

      const result = await errorRecoveryService.recover(error, {
        operation: 'test',
        component: 'test',
      });

      expect(result.success).toBe(false);
      expect(result.action).toBe('manual');
    });

    it('should provide user guidance for wallet connection', () => {
      const error = new ApiError(
        'Wallet not connected',
        ErrorCode.WALLET_NOT_CONNECTED
      );

      const guidance = errorRecoveryService.getUserGuidance(error);
      expect(guidance).toContain('connect your wallet');
    });
  });

  describe('Insufficient Funds Recovery', () => {
    it('should not auto-recover from insufficient funds', async () => {
      const error = new ApiError(
        'Insufficient funds',
        ErrorCode.INSUFFICIENT_FUNDS
      );

      const result = await errorRecoveryService.recover(error, {
        operation: 'test',
        component: 'test',
      });

      expect(result.success).toBe(false);
      expect(result.action).toBe('manual');
    });

    it('should provide user guidance for insufficient funds', () => {
      const error = new ApiError(
        'Insufficient funds',
        ErrorCode.INSUFFICIENT_FUNDS
      );

      const guidance = errorRecoveryService.getUserGuidance(error);
      expect(guidance).toContain('enough funds');
    });
  });

  describe('Transaction Rejected Recovery', () => {
    it('should abort on transaction rejection', async () => {
      const error = new ApiError(
        'Transaction rejected',
        ErrorCode.TRANSACTION_REJECTED
      );

      const result = await errorRecoveryService.recover(error, {
        operation: 'test',
        component: 'test',
      });

      expect(result.success).toBe(false);
      expect(result.action).toBe('abort');
    });

    it('should provide user guidance for transaction rejection', () => {
      const error = new ApiError(
        'Transaction rejected',
        ErrorCode.TRANSACTION_REJECTED
      );

      const guidance = errorRecoveryService.getUserGuidance(error);
      expect(guidance).toContain('cancelled');
    });
  });

  describe('RPC Error Recovery', () => {
    it('should recover from RPC errors', async () => {
      const error = new ApiError(
        'RPC error',
        ErrorCode.RPC_ERROR,
        undefined,
        undefined,
        true
      );

      const result = await errorRecoveryService.recover(error, {
        operation: 'test',
        component: 'test',
        retryCount: 0,
        maxRetries: 3,
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('retry');
    });

    it('should provide user guidance for RPC errors', () => {
      const error = new ApiError(
        'RPC error',
        ErrorCode.RPC_ERROR
      );

      const guidance = errorRecoveryService.getUserGuidance(error);
      expect(guidance).toContain('blockchain');
    });
  });

  describe('Contract Error Recovery', () => {
    it('should recover from market not found errors', async () => {
      const error = new ContractError(
        'Market not found',
        'market-core',
        'get-market',
        undefined,
        101
      );

      const result = await errorRecoveryService.recover(error, {
        operation: 'test',
        component: 'test',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('retry');
    });

    it('should not recover from other contract errors', async () => {
      const error = new ContractError(
        'Unauthorized',
        'market-core',
        'resolve-market',
        undefined,
        100
      );

      const result = await errorRecoveryService.recover(error, {
        operation: 'test',
        component: 'test',
      });

      expect(result.success).toBe(false);
      expect(result.action).toBe('manual');
    });

    it('should provide user guidance for contract errors', () => {
      const error = new ContractError(
        'Unauthorized',
        'market-core',
        'resolve-market',
        undefined,
        100
      );

      const guidance = errorRecoveryService.getUserGuidance(error);
      expect(guidance).toBe('Unauthorized');
    });
  });

  describe('executeWithRecovery', () => {
    it('should execute operation successfully', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await errorRecoveryService.executeWithRecovery(
        operation,
        { operation: 'test', component: 'test' }
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on recoverable errors', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new ApiError('Network error', ErrorCode.NETWORK_ERROR, undefined, undefined, true))
        .mockResolvedValueOnce('success');

      const result = await errorRecoveryService.executeWithRecovery(
        operation,
        { operation: 'test', component: 'test', maxRetries: 3 }
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should throw on non-recoverable errors', async () => {
      const error = new ApiError('Wallet not connected', ErrorCode.WALLET_NOT_CONNECTED);
      const operation = vi.fn().mockRejectedValue(error);

      await expect(
        errorRecoveryService.executeWithRecovery(
          operation,
          { operation: 'test', component: 'test' }
        )
      ).rejects.toThrow(error);
    });

    it('should throw after max retries', async () => {
      const error = new ApiError('Network error', ErrorCode.NETWORK_ERROR, undefined, undefined, true);
      const operation = vi.fn().mockRejectedValue(error);

      await expect(
        errorRecoveryService.executeWithRecovery(
          operation,
          { operation: 'test', component: 'test', maxRetries: 2 }
        )
      ).rejects.toThrow(error);

      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Custom Strategy Registration', () => {
    it('should allow registering custom strategies', async () => {
      const customStrategy = {
        canRecover: (error: unknown) => error instanceof Error && error.message === 'custom',
        recover: async () => ({ success: true, message: 'custom recovery', action: 'retry' as const }),
        getUserGuidance: () => 'custom guidance',
      };

      errorRecoveryService.registerStrategy(ErrorCode.UNKNOWN_ERROR, customStrategy);

      const error = new Error('custom');
      const result = await errorRecoveryService.recover(error, {
        operation: 'test',
        component: 'test',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('custom recovery');
    });
  });
});
