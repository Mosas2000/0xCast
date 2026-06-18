export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export class ValidationErrorHandler {
  private errors: ValidationError[] = [];

  addError(field: string, message: string, code?: string): void {
    this.errors.push({ field, message, code });
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): ValidationError[] {
    return [...this.errors];
  }

  getErrorsForField(field: string): ValidationError[] {
    return this.errors.filter((e) => e.field === field);
  }

  getFirstError(): ValidationError | null {
    return this.errors[0] || null;
  }

  getFirstErrorForField(field: string): ValidationError | null {
    return this.errors.find((e) => e.field === field) || null;
  }

  clear(): void {
    this.errors = [];
  }

  clearField(field: string): void {
    this.errors = this.errors.filter((e) => e.field !== field);
  }

  toObject(): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    this.errors.forEach((error) => {
      if (!result[error.field]) {
        result[error.field] = [];
      }
      result[error.field].push(error.message);
    });

    return result;
  }

  static required(value: unknown, field: string): ValidationError | null {
    if (value === null || value === undefined || value === '') {
      return {
        field,
        message: `${field} is required`,
        code: 'REQUIRED',
      };
    }
    return null;
  }

  static minLength(
    value: string,
    minLength: number,
    field: string
  ): ValidationError | null {
    if (value.length < minLength) {
      return {
        field,
        message: `${field} must be at least ${minLength} characters`,
        code: 'MIN_LENGTH',
      };
    }
    return null;
  }

  static maxLength(
    value: string,
    maxLength: number,
    field: string
  ): ValidationError | null {
    if (value.length > maxLength) {
      return {
        field,
        message: `${field} must be at most ${maxLength} characters`,
        code: 'MAX_LENGTH',
      };
    }
    return null;
  }

  static pattern(
    value: string,
    pattern: RegExp,
    field: string,
    message?: string
  ): ValidationError | null {
    if (!pattern.test(value)) {
      return {
        field,
        message: message || `${field} format is invalid`,
        code: 'PATTERN',
      };
    }
    return null;
  }

  static email(value: string, field: string): ValidationError | null {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.pattern(value, emailPattern, field, `${field} must be a valid email`);
  }

  static min(
    value: number,
    min: number,
    field: string
  ): ValidationError | null {
    if (value < min) {
      return {
        field,
        message: `${field} must be at least ${min}`,
        code: 'MIN',
      };
    }
    return null;
  }

  static max(
    value: number,
    max: number,
    field: string
  ): ValidationError | null {
    if (value > max) {
      return {
        field,
        message: `${field} must be at most ${max}`,
        code: 'MAX',
      };
    }
    return null;
  }

  static range(
    value: number,
    min: number,
    max: number,
    field: string
  ): ValidationError | null {
    if (value < min || value > max) {
      return {
        field,
        message: `${field} must be between ${min} and ${max}`,
        code: 'RANGE',
      };
    }
    return null;
  }

  static custom(
    value: unknown,
    validator: (val: unknown) => boolean,
    field: string,
    message: string
  ): ValidationError | null {
    if (!validator(value)) {
      return {
        field,
        message,
        code: 'CUSTOM',
      };
    }
    return null;
  }
}
