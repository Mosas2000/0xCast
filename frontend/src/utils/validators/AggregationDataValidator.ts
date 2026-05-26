import { AggregatedPrice, OraclePrice } from '@/types/oracle';
import { BaseValidator, ValidationResult } from './BaseValidator';
import { CommonValidators } from './commonValidators';

export class AggregationDataValidator extends BaseValidator<AggregatedPrice> {
  isValid(price: unknown): boolean {
    if (!CommonValidators.isValidObject(price)) return false;

    return (
      CommonValidators.isValidPositiveNumber(price.value) &&
      CommonValidators.isValidTimestamp(price.timestamp) &&
      CommonValidators.isValidArray(price.sources, 1) &&
      CommonValidators.isValidRatio(price.confidence) &&
      typeof price.consensusReached === 'boolean' &&
      CommonValidators.isValidString(price.method)
    );
  }

  validate(price: unknown): ValidationResult {
    const errors: string[] = [];

    if (!CommonValidators.isValidObject(price)) {
      errors.push('Aggregated price data must be an object');
      return { valid: false, errors };
    }

    errors.push(
      ...this.collectErrors([
        this.validateField(price.value, 'price value', CommonValidators.isValidPositiveNumber),
        this.validateField(price.timestamp, 'timestamp', CommonValidators.isValidTimestamp),
        this.validateField(price.sources, 'sources', (v) => CommonValidators.isValidArray(v, 1)),
        this.validateField(price.confidence, 'confidence', CommonValidators.isValidRatio),
        this.validateField(price.consensusReached, 'consensus flag', (v) => typeof v === 'boolean'),
        this.validateField(price.method, 'aggregation method', (v) => CommonValidators.isValidString(v)),
      ])
    );

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  sanitize(price: unknown): AggregatedPrice | null {
    if (!CommonValidators.isValidObject(price)) return null;

    const p = price as Record<string, unknown>;
    const sanitized: AggregatedPrice = {
      value: CommonValidators.sanitizeNumber(p.value, 0, 0),
      timestamp: CommonValidators.sanitizeTimestamp(p.timestamp),
      sources: CommonValidators.sanitizeArray<OraclePrice>(
        p.sources,
        (s: unknown) => {
          if (!CommonValidators.isValidObject(s)) return false;
          const src = s as Record<string, unknown>;
          return (
            CommonValidators.isValidPositiveNumber(src.value) &&
            CommonValidators.isValidTimestamp(src.timestamp) &&
            CommonValidators.isValidString(src.source) &&
            CommonValidators.isValidRatio(src.confidence)
          );
        }
      ),
      confidence: CommonValidators.sanitizeNumber(p.confidence, 0.5, 0, 1),
      consensusReached: Boolean(p.consensusReached),
      method: CommonValidators.sanitizeString(p.method, 'unknown', 64),
    };

    if (sanitized.sources.length === 0) {
      return null;
    }

    if (!this.isValid(sanitized)) {
      return null;
    }

    return sanitized;
  }
}
