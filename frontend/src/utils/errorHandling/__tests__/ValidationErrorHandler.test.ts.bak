import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationErrorHandler } from '../ValidationErrorHandler';

describe('ValidationErrorHandler', () => {
  let handler: ValidationErrorHandler;

  beforeEach(() => {
    handler = new ValidationErrorHandler();
  });

  describe('addError', () => {
    it('should add error', () => {
      handler.addError('email', 'Invalid email');
      expect(handler.hasErrors()).toBe(true);
      expect(handler.getErrors()).toHaveLength(1);
    });
  });

  describe('getErrorsForField', () => {
    it('should get errors for specific field', () => {
      handler.addError('email', 'Invalid email');
      handler.addError('password', 'Too short');
      const errors = handler.getErrorsForField('email');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Invalid email');
    });
  });

  describe('clear', () => {
    it('should clear all errors', () => {
      handler.addError('email', 'Invalid email');
      handler.clear();
      expect(handler.hasErrors()).toBe(false);
    });
  });

  describe('static validators', () => {
    it('should validate required fields', () => {
      const error = ValidationErrorHandler.required('', 'email');
      expect(error).not.toBeNull();
      expect(error?.code).toBe('REQUIRED');
    });

    it('should validate min length', () => {
      const error = ValidationErrorHandler.minLength('ab', 3, 'password');
      expect(error).not.toBeNull();
      expect(error?.code).toBe('MIN_LENGTH');
    });

    it('should validate max length', () => {
      const error = ValidationErrorHandler.maxLength('toolong', 5, 'code');
      expect(error).not.toBeNull();
      expect(error?.code).toBe('MAX_LENGTH');
    });

    it('should validate email format', () => {
      const error = ValidationErrorHandler.email('invalid', 'email');
      expect(error).not.toBeNull();

      const valid = ValidationErrorHandler.email('test@example.com', 'email');
      expect(valid).toBeNull();
    });

    it('should validate number range', () => {
      const error = ValidationErrorHandler.range(15, 1, 10, 'age');
      expect(error).not.toBeNull();
      expect(error?.code).toBe('RANGE');
    });
  });
});
