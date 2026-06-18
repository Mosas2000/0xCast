import { describe, it, expect } from 'vitest';
import {
  convertToCSV,
  convertToJSON,
  formatDate,
  formatCurrency,
  getFileNameWithTimestamp,
  getMimeType,
} from './exportHelpers';

describe('exportHelpers', () => {
  describe('convertToCSV', () => {
    it('should convert headers and rows to CSV format', () => {
      const headers = ['Name', 'Age', 'Email'];
      const rows = [['John', '30', 'john@example.com'], ['Jane', '25', 'jane@example.com']];
      const csv = convertToCSV(headers, rows);

      expect(csv).toContain('Name,Age,Email');
      expect(csv).toContain('John,30,john@example.com');
      expect(csv).toContain('Jane,25,jane@example.com');
    });

    it('should escape special characters in CSV', () => {
      const headers = ['Name', 'Comment'];
      const rows = [['John "Doe"', 'Has, comma'], ['Jane Doe', 'Has "quotes"']];
      const csv = convertToCSV(headers, rows);

      expect(csv).toContain('"John ""Doe"""');
      expect(csv).toContain('"Has, comma"');
    });

    it('should handle empty cells', () => {
      const headers = ['A', 'B', 'C'];
      const rows = [['1', '', '3'], ['', '2', '']];
      const csv = convertToCSV(headers, rows);

      expect(csv).toContain('1,,3');
      expect(csv).toContain(',2,');
    });

    it('should handle newlines in data', () => {
      const headers = ['Text'];
      const rows = [['Line1\nLine2']];
      const csv = convertToCSV(headers, rows);

      expect(csv).toContain('"Line1\nLine2"');
    });
  });

  describe('convertToJSON', () => {
    it('should convert object to JSON string', () => {
      const data = { name: 'John', age: 30 };
      const json = convertToJSON(data);

      expect(JSON.parse(json)).toEqual(data);
    });

    it('should format JSON with proper indentation', () => {
      const data = { name: 'John' };
      const json = convertToJSON(data);

      expect(json).toContain('\n');
    });

    it('should handle nested objects', () => {
      const data = {
        user: { name: 'John', address: { city: 'NYC' } },
        transactions: [{ id: 1, amount: 100 }],
      };
      const json = convertToJSON(data);

      expect(JSON.parse(json)).toEqual(data);
    });

    it('should handle arrays', () => {
      const data = [1, 2, 3, { name: 'John' }];
      const json = convertToJSON(data);

      expect(JSON.parse(json)).toEqual(data);
    });
  });

  describe('formatDate', () => {
    it('should format date as ISO string', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);

      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should handle string dates', () => {
      const dateString = '2024-01-15';
      const formatted = formatDate(dateString);

      expect(formatted).toBe('2024-01-15');
    });
  });

  describe('formatCurrency', () => {
    it('should format positive numbers as currency', () => {
      const amount = 1234.56;
      const formatted = formatCurrency(amount);

      expect(formatted).toContain('1234');
      expect(formatted).toContain('56');
    });

    it('should format negative numbers', () => {
      const amount = -1234.56;
      const formatted = formatCurrency(amount);

      expect(formatted).toContain('-');
    });

    it('should handle zero', () => {
      const formatted = formatCurrency(0);

      expect(formatted).toBe('0.00');
    });

    it('should handle very large numbers', () => {
      const amount = 1000000000;
      const formatted = formatCurrency(amount);

      expect(formatted).toContain('1000000000');
    });

    it('should handle small decimals', () => {
      const amount = 0.01;
      const formatted = formatCurrency(amount);

      expect(formatted).toContain('0.01');
    });
  });

  describe('getFileNameWithTimestamp', () => {
    it('should create filename with timestamp for CSV', () => {
      const fileName = getFileNameWithTimestamp('transactions', 'csv');

      expect(fileName).toContain('transactions');
      expect(fileName).toContain('.csv');
      expect(fileName).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should create filename with timestamp for JSON', () => {
      const fileName = getFileNameWithTimestamp('portfolio', 'json');

      expect(fileName).toContain('portfolio');
      expect(fileName).toContain('.json');
    });

    it('should include current date', () => {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const fileName = getFileNameWithTimestamp('test', 'csv');

      expect(fileName).toContain(dateStr);
    });
  });

  describe('getMimeType', () => {
    it('should return correct mime type for CSV', () => {
      const mimeType = getMimeType('csv');

      expect(mimeType).toBe('text/csv');
    });

    it('should return correct mime type for JSON', () => {
      const mimeType = getMimeType('json');

      expect(mimeType).toBe('application/json');
    });
  });
});
