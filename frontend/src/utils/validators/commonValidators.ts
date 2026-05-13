export class CommonValidators {
  static isValidNumber(value: any): boolean {
    return typeof value === 'number' && isFinite(value);
  }

  static isValidPositiveNumber(value: any): boolean {
    return this.isValidNumber(value) && value >= 0;
  }

  static isValidRatio(value: any): boolean {
    return this.isValidNumber(value) && value >= 0 && value <= 1;
  }

  static isValidTimestamp(timestamp: any): boolean {
    if (!this.isValidNumber(timestamp)) return false;
    const now = Date.now();
    return timestamp > 0 && timestamp <= now + 1000;
  }

  static isValidString(value: any, minLength: number = 1, maxLength?: number): boolean {
    if (typeof value !== 'string') return false;
    if (value.length < minLength) return false;
    if (maxLength && value.length > maxLength) return false;
    return true;
  }

  static isValidArray(value: any, minLength: number = 0): boolean {
    return Array.isArray(value) && value.length >= minLength;
  }

  static isValidObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  static sanitizeNumber(value: any, defaultValue: number = 0, min?: number, max?: number): number {
    let num = Number(value) || defaultValue;
    if (min !== undefined) num = Math.max(min, num);
    if (max !== undefined) num = Math.min(max, num);
    return num;
  }

  static sanitizeString(value: any, defaultValue: string = '', maxLength?: number): string {
    let str = String(value || defaultValue);
    if (maxLength) str = str.slice(0, maxLength);
    return str;
  }

  static sanitizeTimestamp(value: any, defaultValue?: number): number {
    const timestamp = Number(value) || defaultValue || Date.now();
    return Math.min(Date.now(), timestamp);
  }

  static sanitizeArray<T>(value: any, filter?: (item: any) => boolean): T[] {
    if (!Array.isArray(value)) return [];
    return filter ? value.filter(filter) : value;
  }
}
