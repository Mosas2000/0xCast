export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ExtendedValidationResult extends ValidationResult {
  warnings: string[];
}

export abstract class BaseValidator<T> {
  protected validateField(
    value: unknown,
    fieldName: string,
    validator: (val: unknown) => boolean,
    errorMessage?: string
  ): string | null {
    if (!validator(value)) {
      return errorMessage || `Invalid ${fieldName}`;
    }
    return null;
  }

  protected collectErrors(checks: Array<string | null>): string[] {
    return checks.filter((error): error is string => error !== null);
  }

  abstract isValid(data: unknown): boolean;
  abstract validate(data: unknown): ValidationResult | ExtendedValidationResult;
  abstract sanitize(data: unknown): T | null;
}
