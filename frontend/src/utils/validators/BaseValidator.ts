export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ExtendedValidationResult extends ValidationResult {
  warnings: string[];
}

export abstract class BaseValidator<T> {
  protected validateField(
    value: any,
    fieldName: string,
    validator: (val: any) => boolean,
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

  abstract isValid(data: any): boolean;
  abstract validate(data: any): ValidationResult | ExtendedValidationResult;
  abstract sanitize(data: any): T | null;
}
