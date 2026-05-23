import { BaseValidator, ValidationResult } from './BaseValidator';
import { CommonValidators } from './commonValidators';

export class ConfigurationValidator extends BaseValidator<Record<string, unknown>> {
  private static readonly MARKET_ID_PATTERN = /^[a-zA-Z0-9\/-]+$/;
  private static readonly MAX_TIMEFRAME = 86400000;

  static isValidMarketId(marketId: unknown): boolean {
    return (
      CommonValidators.isValidString(marketId, 1, 256) &&
      this.MARKET_ID_PATTERN.test(marketId as string)
    );
  }

  static isValidProviderId(providerId: unknown): boolean {
    return CommonValidators.isValidString(providerId, 1, 128);
  }

  static isValidThreshold(threshold: unknown): boolean {
    return CommonValidators.isValidRatio(threshold);
  }

  static isValidTimeframe(timeframe: unknown): boolean {
    return (
      CommonValidators.isValidPositiveNumber(timeframe) &&
      (timeframe as number) > 0 &&
      (timeframe as number) < this.MAX_TIMEFRAME
    );
  }

  isValid(config: unknown): boolean {
    if (!CommonValidators.isValidObject(config)) return false;
    return this.validate(config).valid;
  }

  validate(config: unknown): ValidationResult {
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
      config.providers.forEach((provider: unknown, index: number) => {
        if (typeof provider === 'object' && provider !== null && 'id' in provider) {
          if (!ConfigurationValidator.isValidProviderId((provider as { id: unknown }).id)) {
            errors.push(`Invalid provider ID at index ${index}`);
          }
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  sanitize(config: unknown): Record<string, unknown> | null {
    if (!CommonValidators.isValidObject(config)) return null;
    return config as Record<string, unknown>;
  }
}
