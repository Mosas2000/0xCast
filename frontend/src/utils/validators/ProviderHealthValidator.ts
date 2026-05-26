import { ProviderHealth } from '@/types/oracle';
import { BaseValidator, ExtendedValidationResult } from './BaseValidator';
import { CommonValidators } from './commonValidators';

export class ProviderHealthValidator extends BaseValidator<ProviderHealth> {
  isValid(health: unknown): boolean {
    if (!CommonValidators.isValidObject(health)) return false;

    const h = health as Record<string, unknown>;
    return (
      CommonValidators.isValidString(h.id) &&
      CommonValidators.isValidRatio(h.successRate) &&
      CommonValidators.isValidRatio(h.uptime) &&
      CommonValidators.isValidPositiveNumber(h.averageLatency) &&
      CommonValidators.isValidPositiveNumber(h.responseCount) &&
      CommonValidators.isValidPositiveNumber(h.errorCount) &&
      CommonValidators.isValidRatio(h.healthScore)
    );
  }

  validate(health: unknown): ExtendedValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!CommonValidators.isValidObject(health)) {
      errors.push('Provider health data must be an object');
      return { valid: false, errors, warnings };
    }

    const h = health as Record<string, unknown>;
    errors.push(
      ...this.collectErrors([
        this.validateField(h.id, 'provider ID', (v) => CommonValidators.isValidString(v)),
        this.validateField(h.successRate, 'success rate', CommonValidators.isValidRatio),
        this.validateField(h.uptime, 'uptime', CommonValidators.isValidRatio),
        this.validateField(h.averageLatency, 'average latency', CommonValidators.isValidPositiveNumber),
        this.validateField(h.responseCount, 'response count', CommonValidators.isValidPositiveNumber),
        this.validateField(h.errorCount, 'error count', CommonValidators.isValidPositiveNumber),
        this.validateField(h.healthScore, 'health score', CommonValidators.isValidRatio),
      ])
    );

    if (errors.length === 0) {
      if ((h.successRate as number) < 0.5) {
        warnings.push('Low success rate (<50%)');
      }
      if ((h.uptime as number) < 0.9) {
        warnings.push('Low uptime (<90%)');
      }
      if ((h.averageLatency as number) > 5000) {
        warnings.push('High latency (>5s)');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  sanitize(health: unknown): ProviderHealth | null {
    if (!CommonValidators.isValidObject(health)) return null;

    const h = health as Record<string, unknown>;
    const sanitized: ProviderHealth = {
      id: CommonValidators.sanitizeString(h.id, 'unknown', 256),
      successRate: CommonValidators.sanitizeNumber(h.successRate, 0, 0, 1),
      uptime: CommonValidators.sanitizeNumber(h.uptime, 0, 0, 1),
      averageLatency: CommonValidators.sanitizeNumber(h.averageLatency, 0, 0),
      responseCount: Math.floor(CommonValidators.sanitizeNumber(h.responseCount, 0, 0)),
      errorCount: Math.floor(CommonValidators.sanitizeNumber(h.errorCount, 0, 0)),
      lastResponseTime: CommonValidators.sanitizeTimestamp(h.lastResponseTime),
      healthScore: CommonValidators.sanitizeNumber(h.healthScore, 0, 0, 1),
    };

    if (!this.isValid(sanitized)) {
      return null;
    }

    return sanitized;
  }
}
