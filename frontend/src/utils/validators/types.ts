export interface ValidatorConfig {
  strict?: boolean;
  throwOnError?: boolean;
  sanitizeOnValidate?: boolean;
}

export interface ValidationContext {
  path?: string;
  parent?: any;
  root?: any;
}

export interface FieldValidationRule<T = any> {
  field: keyof T;
  validator: (value: any) => boolean;
  errorMessage?: string;
  required?: boolean;
}

export interface SanitizationRule<T = any> {
  field: keyof T;
  sanitizer: (value: any) => any;
  defaultValue?: any;
}

export type ValidatorFunction<T> = (value: T) => boolean;

export type SanitizerFunction<T, R = T> = (value: T) => R;

export interface ValidationSchema<T> {
  fields: FieldValidationRule<T>[];
  sanitization?: SanitizationRule<T>[];
  custom?: ValidatorFunction<T>[];
}
