import { describe, it, expect } from 'vitest';
import {
  isNetworkError,
  isTimeoutError,
  isValidationError,
  isRetryableError,
  calculateBackoff,
  extractErrorMessage,
  createError,
  wrapError,
  ensureError,
} from '../helpers';

describe('Error Handling Helpers', () => {
  describe('isNetworkError', () => {
    it('should detect network errors', () => {
      const error = new TypeError('Failed to fetch');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for non-network errors', () => {
      const error = new Error('Something else');
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isTimeoutError', () => {
    it('should detect timeout errors', () => {
      const error = new Error('Request timed out');
      expect(isTimeoutError(error)).toBe(true);
    });

    it('should detect TimeoutError by name', () => {
      const error = new Error('test');
      error.name = 'TimeoutError';
      expect(isTimeoutError(error)).toBe(true);
    });
  });

  describe('isValidationError', () => {
    it('should detect validation errors', () => {
      const error = new Error('Validation failed');
      expect(isValidationError(error)).toBe(true);
    });

    it('should detect ValidationError by name', () => {
      const error = new Error('test');
      error.name = 'ValidationError';
      expect(isValidationError(error)).toBe(true);
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      const networkError = new TypeError('Failed to fetch');
      expect(isRetryableError(networkError)).toBe(true);

      const timeoutError = new Error('timeout');
      expect(isRetryableError(timeoutError)).toBe(true);

      const validationError = new Error('validation');
      expect(isRetryableError(validationError)).toBe(false);
    });
  });

  describe('calculateBackoff', () => {
    it('should calculate exponential backoff', () => {
      expect(calculateBackoff(0, 1000)).toBe(1000);
      expect(calculateBackoff(1, 1000)).toBe(2000);
      expect(calculateBackoff(2, 1000)).toBe(4000);
      expect(calculateBackoff(3, 1000)).toBe(8000);
    });

    it('should cap at maximum delay', () => {
      expect(calculateBackoff(10, 1000)).toBe(32000);
    });
  });

  describe('extractErrorMessage', () => {
    it('should extract message from Error', () => {
      const error = new Error('test message');
      expect(extractErrorMessage(error)).toBe('test message');
    });

    it('should handle string errors', () => {
      expect(extractErrorMessage('string error')).toBe('string error');
    });

    it('should handle unknown errors', () => {
      expect(extractErrorMessage(null)).toBe('Unknown error');
    });
  });

  describe('createError', () => {
    it('should create error with message', () => {
      const error = createError('test message');
      expect(error.message).toBe('test message');
      expect(error.name).toBe('Error');
    });

    it('should create error with custom name', () => {
      const error = createError('test', 'CustomError');
      expect(error.name).toBe('CustomError');
    });
  });

  describe('wrapError', () => {
    it('should wrap error with context', () => {
      const original = new Error('original');
      const wrapped = wrapError(original, 'Context');
      expect(wrapped.message).toBe('Context: original');
    });
  });

  describe('ensureError', () => {
    it('should return Error as is', () => {
      const error = new Error('test');
      expect(ensureError(error)).toBe(error);
    });

    it('should convert non-Error to Error', () => {
      const result = ensureError('string error');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('string error');
    });
  });
});
