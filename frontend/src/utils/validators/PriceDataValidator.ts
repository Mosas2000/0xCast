import { OraclePrice } from '@/types/oracle';
import { BaseValidator, ValidationResult } from './BaseValidator';
import { CommonValidators } from './commonValidators';

export class PriceDataValidator extends BaseValidator<OraclePrice> {
  isValid(price: any): boolean {
    if (!CommonValidators.isValidObject(price)) return false;

    return (
      CommonValidators.isValidPositiveNumber(price.value) &&
      CommonValidators.isValidTimestamp(price.timestamp) &&
      CommonValidators.isValidString(price.source) &&
      CommonValidators.isValidRatio(price.confidence)
    );
  }

  validate(price: any): ValidationResult {
    const errors: string[] = [];

    if (!CommonValidators.isValidObject(price)) {
      errors.push('Price data must be an object');
      return { valid: false, errors };
    }

    errors.push(
      ...this.collectErrors([
        this.validateField(price.value, 'price value', CommonValidators.isValidPositiveNumber),
        this.validateField(price.timestamp, 'timestamp', CommonValidators.isValidTimestamp),
        this.validateField(price.source, 'source', (v) => CommonValidators.isValidString(v)),
        this.validateField(price.confidence, 'confidence', CommonValidators.isValidRatio),
      ])
    );

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  sanitize(price: any): OraclePrice | null {
    if (!CommonValidators.isValidObject(price)) return null;

    const sanitized: OraclePrice = {
      value: CommonValidators.sanitizeNumber(price.value, 0, 0),
      timestamp: CommonValidators.sanitizeTimestamp(price.timestamp),
      source: CommonValidators.sanitizeString(price.source, 'unknown', 256),
      confidence: CommonValidators.sanitizeNumber(price.confidence, 0.5, 0, 1),
    };

    if (!this.isValid(sanitized)) {
      return null;
    }

    return sanitized;
  }

  validateArray(prices: any[]): {
    valid: OraclePrice[];
    invalid: any[];
    errors: string[];
  } {
    const valid: OraclePrice[] = [];
    const invalid: any[] = [];
    const errors: string[] = [];

    if (!Array.isArray(prices)) {
      errors.push('Input is not an array');
      return { valid, invalid, errors };
    }

    prices.forEach((price, index) => {
      if (this.isValid(price)) {
        valid.push(price);
      } else {
        invalid.push(price);
        errors.push(`Invalid price at index ${index}`);
      }
    });

    return { valid, invalid, errors };
  }
}
