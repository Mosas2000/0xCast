import { BaseValidator, ValidationResult } from './BaseValidator';
import { CommonValidators } from './commonValidators';

export class ConfigurationValidator extends BaseValidator<any> {
  private static readonly MARKET_ID_PATTERN = /^[a-zA-Z0-9\/-]+$/;
  private static readonly MAX_TIMEFRAME = 86400000;

  static isValidMarketId(marketId: any): boolean {
    return (
      CommonValidators.isValidString(marketId, 1, 256) &&
      this.MARKET_ID_PATTERN.test(marketId)
    );
  }

  static isValidProviderId(providerId: any): boolean {
    return CommonValidators.isValidString(providerId, 1, 128);
  }

  static isValidThreshold(threshold: any): boolean {
    return CommonValidators.isValidRatio(threshold);
  }

  static isValidTimeframe(timeframe: any): boolean {
    return (
      CommonValidators.isValidPositiveNumber(timeframe) &&
      timeframe > 0 &&
      timeframe < this.MAX_TIMEFRAME
    );
  }

  isValid(config: any): boolean {
    if (!CommonValidators.isValidObject(config)) return false;
    return this.validate(config).valid;
  }

  validate(config: any): ValidationResult {
    const errors: string[] = [];

    if (!CommonValidators.isValidObject(config)) {
      errors.push('Config is not an object');
      return { valid: false, errors };
    }

    if (config.consensus && config.consensus.threshold !== undefined) {
      if (!ConfigurationValidator.isValidThreshold(config.consensus.threshold)) {
        errors.push('Invalid consensus threshold');
      }
    }

    if (config.providers && Array.isArray(config.providers)) {
      config.providers.forEach((provider: any, index: number) => {
        if (!ConfigurationValidator.isValidProviderId(provider.id)) {
          errors.push(`Invalid provider ID at index ${index}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  sanitize(config: any): any | null {
    if (!CommonValidators.isValidObject(config)) return null;
    return config;
  }
}
