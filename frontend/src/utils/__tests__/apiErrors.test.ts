import { describe, it, expect } from 'vitest';
import { ApiError, ContractError, ValidationError, ErrorCode } from '../apiErrors';

describe('ApiError', () => {
  it('should create ApiError with message and code', () => {
    const error = new ApiError('Test error', ErrorCode.NETWORK_ERROR);

    expect(error.message).toBe('Test error');
    expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
    expect(error.name).toBe('ApiError');
    expect(error).toBeInstanceOf(Error);
  });

  it('should create ApiError with details', () => {
    const details = { statusCode: 500, endpoint: '/api/test' };
    const error = new ApiError('Test error', ErrorCode.SERVER_ERROR, details);

    expect(error.details).toEqual(details);
  });

  it('should have correct error name', () => {
    const error = new ApiError('Test error', ErrorCode.NETWORK_ERROR);
    expect(error.name).toBe('ApiError');
  });
});

describe('ContractError', () => {
  it('should create ContractError with basic info', () => {
    const error = new ContractError('Contract failed', 'market-core', 'create-market');

    expect(error.message).toBe('Contract failed');
    expect(error.contractName).toBe('market-core');
    expect(error.functionName).toBe('create-market');
    expect(error.name).toBe('ContractError');
    expect(error).toBeInstanceOf(ApiError);
  });

  it('should create ContractError with transaction ID', () => {
    const txId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const error = new ContractError(
      'Contract failed',
      'market-core',
      'create-market',
      txId
    );

    expect(error.txId).toBe(txId);
  });

  it('should create ContractError with error code', () => {
    const error = new ContractError(
      'Contract failed',
      'market-core',
      'create-market',
      undefined,
      100
    );

    expect(error.errorCode).toBe(100);
  });

  it('should create ContractError from Clarity error code 100', () => {
    const error = ContractError.fromClarityError(100, 'market-core', 'create-market');

    expect(error.errorCode).toBe(100);
    expect(error.message).toContain('unauthorized');
    expect(error.contractName).toBe('market-core');
    expect(error.functionName).toBe('create-market');
  });

  it('should create ContractError from Clarity error code 101', () => {
    const error = ContractError.fromClarityError(101, 'market-core', 'place-stake');

    expect(error.errorCode).toBe(101);
    expect(error.message).toContain('not found');
  });

  it('should create ContractError from Clarity error code 102', () => {
    const error = ContractError.fromClarityError(102, 'market-core', 'place-stake');

    expect(error.errorCode).toBe(102);
    expect(error.message).toContain('already resolved');
  });

  it('should create ContractError from Clarity error code 103', () => {
    const error = ContractError.fromClarityError(103, 'market-core', 'place-stake');

    expect(error.errorCode).toBe(103);
    expect(error.message).toContain('minimum stake');
  });

  it('should create ContractError from Clarity error code 104', () => {
    const error = ContractError.fromClarityError(104, 'market-core', 'claim-winnings');

    expect(error.errorCode).toBe(104);
    expect(error.message).toContain('No stake found');
  });

  it('should create ContractError from Clarity error code 105', () => {
    const error = ContractError.fromClarityError(105, 'market-core', 'claim-winnings');

    expect(error.errorCode).toBe(105);
    expect(error.message).toContain('not yet resolved');
  });

  it('should create ContractError from Clarity error code 106', () => {
    const error = ContractError.fromClarityError(106, 'market-core', 'claim-winnings');

    expect(error.errorCode).toBe(106);
    expect(error.message).toContain('losing side');
  });

  it('should create ContractError from Clarity error code 107', () => {
    const error = ContractError.fromClarityError(107, 'market-core', 'transfer');

    expect(error.errorCode).toBe(107);
    expect(error.message).toContain('Insufficient balance');
  });

  it('should create ContractError from Clarity error code 108', () => {
    const error = ContractError.fromClarityError(108, 'market-core', 'some-function');

    expect(error.errorCode).toBe(108);
    expect(error.message).toContain('paused');
  });

  it('should create ContractError from Clarity error code 109', () => {
    const error = ContractError.fromClarityError(109, 'market-core', 'some-function');

    expect(error.errorCode).toBe(109);
    expect(error.message).toContain('Rate limit exceeded');
  });

  it('should create ContractError from unknown Clarity error code', () => {
    const error = ContractError.fromClarityError(999, 'market-core', 'some-function');

    expect(error.errorCode).toBe(999);
    expect(error.message).toContain('Unknown contract error');
    expect(error.message).toContain('999');
  });
});

describe('ValidationError', () => {
  it('should create ValidationError with field and value', () => {
    const error = new ValidationError('Invalid amount', 'amount', -5);

    expect(error.message).toBe('Invalid amount');
    expect(error.field).toBe('amount');
    expect(error.value).toBe(-5);
    expect(error.name).toBe('ValidationError');
    expect(error).toBeInstanceOf(ApiError);
  });

  it('should create ValidationError with object value', () => {
    const value = { min: 0, max: 100 };
    const error = new ValidationError('Invalid range', 'range', value);

    expect(error.value).toEqual(value);
  });
});

describe('ErrorCode', () => {
  it('should have all expected error codes', () => {
    expect(ErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(ErrorCode.TIMEOUT).toBe('TIMEOUT');
    expect(ErrorCode.SERVER_ERROR).toBe('SERVER_ERROR');
    expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
    expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
    expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorCode.CONTRACT_ERROR).toBe('CONTRACT_ERROR');
    expect(ErrorCode.TRANSACTION_REJECTED).toBe('TRANSACTION_REJECTED');
    expect(ErrorCode.INSUFFICIENT_FUNDS).toBe('INSUFFICIENT_FUNDS');
    expect(ErrorCode.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
    expect(ErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
  });
});
