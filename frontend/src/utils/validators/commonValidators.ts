export class CommonValidators {
  static isValidNumber(value: unknown): boolean {
    return typeof value === 'number' && isFinite(value);
  }

  static isValidPositiveNumber(value: unknown): boolean {
    return CommonValidators.isValidNumber(value) && (value as number) >= 0;
  }

  static isValidRatio(value: unknown): boolean {
    return CommonValidators.isValidNumber(value) && (value as number) >= 0 && (value as number) <= 1;
  }

  static isValidTimestamp(timestamp: unknown): boolean {
    if (!CommonValidators.isValidNumber(timestamp)) return false;
    const now = Date.now();
    return (timestamp as number) > 0 && (timestamp as number) <= now + 1000;
  }

  static isValidString(value: unknown, minLength: number = 1, maxLength?: number): boolean {
    if (typeof value !== 'string') return false;
    if (value.length < minLength) return false;
    if (maxLength && value.length > maxLength) return false;
    return true;
  }

  static isValidArray(value: unknown, minLength: number = 0): boolean {
    return Array.isArray(value) && value.length >= minLength;
  }

  static isValidObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  static sanitizeNumber(value: unknown, defaultValue: number = 0, min?: number, max?: number): number {
    let num = Number(value) || defaultValue;
    if (min !== undefined) num = Math.max(min, num);
    if (max !== undefined) num = Math.min(max, num);
    return num;
  }

  static sanitizeString(value: unknown, defaultValue: string = '', maxLength?: number): string {
    let str = String(value || defaultValue);
    if (maxLength) str = str.slice(0, maxLength);
    return str;
  }

  static sanitizeTimestamp(value: unknown, defaultValue?: number): number {
    const timestamp = Number(value) || defaultValue || Date.now();
    return Math.min(Date.now(), timestamp);
  }

  static sanitizeArray<T>(value: unknown, filter?: (item: unknown) => boolean): T[] {
    if (!Array.isArray(value)) return [];
    return filter ? value.filter(filter) : value;
  }
}
