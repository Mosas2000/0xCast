import { describe, it, expect } from 'vitest';
import { ProviderHealthValidator } from '../ProviderHealthValidator';

describe('ProviderHealthValidator', () => {
  const validator = new ProviderHealthValidator();

  const validHealth = {
    id: 'provider-1',
    successRate: 0.95,
    uptime: 0.99,
    averageLatency: 100,
    responseCount: 1000,
    errorCount: 10,
    lastResponseTime: Date.now(),
    healthScore: 0.9,
  };

  describe('isValid', () => {
    it('should validate correct health data', () => {
      expect(validator.isValid(validHealth)).toBe(true);
    });

    it('should reject invalid success rate', () => {
      expect(validator.isValid({ ...validHealth, successRate: -0.1 })).toBe(false);
      expect(validator.isValid({ ...validHealth, successRate: 1.5 })).toBe(false);
    });

    it('should reject invalid uptime', () => {
      expect(validator.isValid({ ...validHealth, uptime: -0.1 })).toBe(false);
      expect(validator.isValid({ ...validHealth, uptime: 1.5 })).toBe(false);
    });

    it('should reject negative latency', () => {
      expect(validator.isValid({ ...validHealth, averageLatency: -10 })).toBe(false);
    });
  });

  describe('validate', () => {
    it('should return no errors for valid data', () => {
      const result = validator.validate(validHealth);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should include warnings for low performance', () => {
      const lowPerformance = {
        ...validHealth,
        successRate: 0.4,
        uptime: 0.8,
        averageLatency: 6000,
      };
      const result = validator.validate(lowPerformance);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should return errors for invalid data', () => {
      const result = validator.validate({ id: '' });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('sanitize', () => {
    it('should sanitize valid data', () => {
      const sanitized = validator.sanitize(validHealth);
      expect(sanitized).not.toBeNull();
      expect(sanitized?.id).toBe(validHealth.id);
    });

    it('should return null for invalid data', () => {
      expect(validator.sanitize(null)).toBeNull();
      expect(validator.sanitize('invalid')).toBeNull();
    });

    it('should clamp values to valid ranges', () => {
      const sanitized = validator.sanitize({
        ...validHealth,
        successRate: 1.5,
        uptime: -0.1,
        averageLatency: -100,
      });
      expect(sanitized?.successRate).toBe(1);
      expect(sanitized?.uptime).toBe(0);
      expect(sanitized?.averageLatency).toBe(0);
    });

    it('should floor count values', () => {
      const sanitized = validator.sanitize({
        ...validHealth,
        responseCount: 100.7,
        errorCount: 5.9,
      });
      expect(sanitized?.responseCount).toBe(100);
      expect(sanitized?.errorCount).toBe(5);
    });
  });
});
