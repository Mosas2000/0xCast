export interface ValidatorConfig {
  strict?: boolean;
  throwOnError?: boolean;
  sanitizeOnValidate?: boolean;
}

export interface ValidationContext {
  path?: string;
  parent?: unknown;
  root?: unknown;
}

export interface FieldValidationRule<T = unknown> {
  field: keyof T;
  validator: (value: unknown) => boolean;
  errorMessage?: string;
  required?: boolean;
}

export interface SanitizationRule<T = unknown> {
  field: keyof T;
  sanitizer: (value: unknown) => unknown;
  defaultValue?: unknown;
}

export type ValidatorFunction<T> = (value: T) => boolean;

export type SanitizerFunction<T, R = T> = (value: T) => R;

export interface ValidationSchema<T> {
  fields: FieldValidationRule<T>[];
  sanitization?: SanitizationRule<T>[];
  custom?: ValidatorFunction<T>[];
}
