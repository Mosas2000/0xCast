import { describe, it, expect } from 'vitest';
import { CommonValidators } from '../commonValidators';

describe('CommonValidators', () => {
  describe('isValidNumber', () => {
    it('should validate numbers correctly', () => {
      expect(CommonValidators.isValidNumber(42)).toBe(true);
      expect(CommonValidators.isValidNumber(0)).toBe(true);
      expect(CommonValidators.isValidNumber(-10)).toBe(true);
      expect(CommonValidators.isValidNumber(NaN)).toBe(false);
      expect(CommonValidators.isValidNumber(Infinity)).toBe(false);
      expect(CommonValidators.isValidNumber('42')).toBe(false);
    });
  });

  describe('isValidPositiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(CommonValidators.isValidPositiveNumber(42)).toBe(true);
      expect(CommonValidators.isValidPositiveNumber(0)).toBe(true);
      expect(CommonValidators.isValidPositiveNumber(-10)).toBe(false);
    });
  });

  describe('isValidRatio', () => {
    it('should validate ratios between 0 and 1', () => {
      expect(CommonValidators.isValidRatio(0)).toBe(true);
      expect(CommonValidators.isValidRatio(0.5)).toBe(true);
      expect(CommonValidators.isValidRatio(1)).toBe(true);
      expect(CommonValidators.isValidRatio(-0.1)).toBe(false);
      expect(CommonValidators.isValidRatio(1.1)).toBe(false);
    });
  });

  describe('isValidTimestamp', () => {
    it('should validate timestamps', () => {
      const now = Date.now();
      expect(CommonValidators.isValidTimestamp(now)).toBe(true);
      expect(CommonValidators.isValidTimestamp(now - 1000)).toBe(true);
      expect(CommonValidators.isValidTimestamp(0)).toBe(false);
      expect(CommonValidators.isValidTimestamp(now + 2000)).toBe(false);
    });
  });

  describe('isValidString', () => {
    it('should validate strings with length constraints', () => {
      expect(CommonValidators.isValidString('test')).toBe(true);
      expect(CommonValidators.isValidString('')).toBe(false);
      expect(CommonValidators.isValidString('test', 1, 10)).toBe(true);
      expect(CommonValidators.isValidString('test', 5)).toBe(false);
      expect(CommonValidators.isValidString('test', 1, 3)).toBe(false);
    });
  });

  describe('sanitizeNumber', () => {
    it('should sanitize numbers with constraints', () => {
      expect(CommonValidators.sanitizeNumber(42)).toBe(42);
      expect(CommonValidators.sanitizeNumber('42')).toBe(42);
      expect(CommonValidators.sanitizeNumber(null, 10)).toBe(10);
      expect(CommonValidators.sanitizeNumber(5, 0, 0, 10)).toBe(5);
      expect(CommonValidators.sanitizeNumber(-5, 0, 0, 10)).toBe(0);
      expect(CommonValidators.sanitizeNumber(15, 0, 0, 10)).toBe(10);
    });
  });

  describe('sanitizeString', () => {
    it('should sanitize strings', () => {
      expect(CommonValidators.sanitizeString('test')).toBe('test');
      expect(CommonValidators.sanitizeString(null, 'default')).toBe('default');
      expect(CommonValidators.sanitizeString('toolong', '', 5)).toBe('toolo');
    });
  });
});
