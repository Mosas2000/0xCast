import { describe, it, expect } from 'vitest';
import { PriceDataValidator } from '../PriceDataValidator';

describe('PriceDataValidator', () => {
  const validator = new PriceDataValidator();

  const validPrice = {
    value: 100,
    timestamp: Date.now(),
    source: 'test-source',
    confidence: 0.95,
  };

  describe('isValid', () => {
    it('should validate correct price data', () => {
      expect(validator.isValid(validPrice)).toBe(true);
    });

    it('should reject invalid price value', () => {
      expect(validator.isValid({ ...validPrice, value: -10 })).toBe(false);
      expect(validator.isValid({ ...validPrice, value: 'invalid' })).toBe(false);
    });

    it('should reject invalid timestamp', () => {
      expect(validator.isValid({ ...validPrice, timestamp: 0 })).toBe(false);
      expect(validator.isValid({ ...validPrice, timestamp: Date.now() + 2000 })).toBe(false);
    });

    it('should reject invalid source', () => {
      expect(validator.isValid({ ...validPrice, source: '' })).toBe(false);
      expect(validator.isValid({ ...validPrice, source: 123 })).toBe(false);
    });

    it('should reject invalid confidence', () => {
      expect(validator.isValid({ ...validPrice, confidence: -0.1 })).toBe(false);
      expect(validator.isValid({ ...validPrice, confidence: 1.5 })).toBe(false);
    });
  });

  describe('validate', () => {
    it('should return no errors for valid data', () => {
      const result = validator.validate(validPrice);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid data', () => {
      const result = validator.validate({ value: -10 });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('sanitize', () => {
    it('should sanitize valid data', () => {
      const sanitized = validator.sanitize(validPrice);
      expect(sanitized).not.toBeNull();
      expect(sanitized?.value).toBe(validPrice.value);
    });

    it('should return null for invalid data', () => {
      expect(validator.sanitize(null)).toBeNull();
      expect(validator.sanitize('invalid')).toBeNull();
    });

    it('should clamp values to valid ranges', () => {
      const sanitized = validator.sanitize({
        value: -10,
        timestamp: Date.now(),
        source: 'test',
        confidence: 1.5,
      });
      expect(sanitized?.value).toBe(0);
      expect(sanitized?.confidence).toBe(1);
    });
  });

  describe('validateArray', () => {
    it('should validate array of prices', () => {
      const result = validator.validateArray([validPrice, validPrice]);
      expect(result.valid).toHaveLength(2);
      expect(result.invalid).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should separate valid and invalid prices', () => {
      const result = validator.validateArray([validPrice, { invalid: true }]);
      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
    });
  });
});
