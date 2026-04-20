import { describe, it, expect } from 'vitest';
import { PriceFormatter, PriceParser } from '@/utils/oraclePriceFormatter';

describe('PriceFormatter', () => {
  describe('formatPrice', () => {
    it('should format price with default decimals', () => {
      const result = PriceFormatter.formatPrice(123.456789123, 8);
      expect(result).toBe('123.45678912');
    });

    it('should format price with custom decimals', () => {
      const result = PriceFormatter.formatPrice(123.456, 2);
      expect(result).toBe('123.46');
    });

    it('should handle zero', () => {
      const result = PriceFormatter.formatPrice(0, 4);
      expect(result).toBe('0.0000');
    });

    it('should handle large numbers', () => {
      const result = PriceFormatter.formatPrice(1000000.123, 2);
      expect(result).toBe('1000000.12');
    });
  });

  describe('formatPriceWithSymbol', () => {
    it('should format with symbol', () => {
      const result = PriceFormatter.formatPriceWithSymbol(100.5, 'STX', 2);
      expect(result).toBe('STX 100.50');
    });

    it('should use default symbol', () => {
      const result = PriceFormatter.formatPriceWithSymbol(50.123);
      expect(result.startsWith('STX')).toBe(true);
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage', () => {
      const result = PriceFormatter.formatPercentage(0.5, 1);
      expect(result).toBe('50.0%');
    });

    it('should format small percentages', () => {
      const result = PriceFormatter.formatPercentage(0.001, 3);
      expect(result).toBe('0.100%');
    });

    it('should handle zero', () => {
      const result = PriceFormatter.formatPercentage(0, 1);
      expect(result).toBe('0.0%');
    });
  });

  describe('formatChange', () => {
    it('should calculate positive change', () => {
      const result = PriceFormatter.formatChange(110, 100, 2);
      expect(result).toContain('+');
      expect(result).toContain('10.00%');
    });

    it('should calculate negative change', () => {
      const result = PriceFormatter.formatChange(90, 100, 2);
      expect(result).toContain('-');
      expect(result).toContain('10.00%');
    });
  });

  describe('formatConfidence', () => {
    it('should format very high confidence', () => {
      const result = PriceFormatter.formatConfidence(0.99);
      expect(result).toBe('Very High');
    });

    it('should format high confidence', () => {
      const result = PriceFormatter.formatConfidence(0.85);
      expect(result).toBe('High');
    });

    it('should format medium confidence', () => {
      const result = PriceFormatter.formatConfidence(0.7);
      expect(result).toBe('Medium');
    });

    it('should format low confidence', () => {
      const result = PriceFormatter.formatConfidence(0.5);
      expect(result).toBe('Low');
    });

    it('should format very low confidence', () => {
      const result = PriceFormatter.formatConfidence(0.2);
      expect(result).toBe('Very Low');
    });
  });

  describe('formatTimestamp', () => {
    it('should format ISO timestamp', () => {
      const now = Date.now();
      const result = PriceFormatter.formatTimestamp(now, 'iso');
      expect(result).toContain('T');
      expect(result).toContain('Z');
    });

    it('should format relative time', () => {
      const now = Date.now();
      const result = PriceFormatter.formatTimestamp(now - 5000, 'relative');
      expect(result).toContain('ago');
    });

    it('should format short timestamp', () => {
      const now = Date.now();
      const result = PriceFormatter.formatTimestamp(now, 'short');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatHealthScore', () => {
    it('should format excellent health', () => {
      const result = PriceFormatter.formatHealthScore(0.95);
      expect(result.status).toBe('excellent');
      expect(result.label).toBe('Excellent');
    });

    it('should format good health', () => {
      const result = PriceFormatter.formatHealthScore(0.75);
      expect(result.status).toBe('good');
    });

    it('should format fair health', () => {
      const result = PriceFormatter.formatHealthScore(0.6);
      expect(result.status).toBe('fair');
    });

    it('should format poor health', () => {
      const result = PriceFormatter.formatHealthScore(0.3);
      expect(result.status).toBe('poor');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes', () => {
      const result = PriceFormatter.formatBytes(1024);
      expect(result).toContain('KB');
    });

    it('should format megabytes', () => {
      const result = PriceFormatter.formatBytes(1024 * 1024);
      expect(result).toContain('MB');
    });

    it('should handle zero', () => {
      const result = PriceFormatter.formatBytes(0);
      expect(result).toBe('0 Bytes');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      const result = PriceFormatter.formatDuration(500);
      expect(result).toContain('ms');
    });

    it('should format seconds', () => {
      const result = PriceFormatter.formatDuration(5000);
      expect(result).toContain('s');
    });

    it('should format minutes', () => {
      const result = PriceFormatter.formatDuration(300000);
      expect(result).toContain('m');
    });

    it('should format hours', () => {
      const result = PriceFormatter.formatDuration(3600000);
      expect(result).toContain('h');
    });
  });
});

describe('PriceParser', () => {
  describe('parseOracleResponse', () => {
    it('should parse standard response', () => {
      const response = {
        price: 100.5,
        timestamp: Date.now(),
        source: 'provider1',
        confidence: 0.95,
      };
      const result = PriceParser.parseOracleResponse(response);
      expect(result.value).toBe(100.5);
      expect(result.source).toBe('provider1');
      expect(result.confidence).toBe(0.95);
    });

    it('should handle alternative field names', () => {
      const response = {
        value: 50,
        provider: 'provider2',
        weight: 0.8,
      };
      const result = PriceParser.parseOracleResponse(response);
      expect(result.value).toBe(50);
      expect(result.source).toBe('provider2');
      expect(result.confidence).toBe(0.8);
    });

    it('should use defaults for missing fields', () => {
      const response = {};
      const result = PriceParser.parseOracleResponse(response);
      expect(result.value).toBe(0);
      expect(result.source).toBe('unknown');
    });
  });

  describe('parseMultiplePrices', () => {
    it('should parse array of responses', () => {
      const responses = [
        { price: 100, source: 'p1', confidence: 0.9 },
        { price: 101, source: 'p2', confidence: 0.85 },
      ];
      const result = PriceParser.parseMultiplePrices(responses);
      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(100);
      expect(result[1].value).toBe(101);
    });

    it('should handle empty array', () => {
      const result = PriceParser.parseMultiplePrices([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('normalizePrice', () => {
    it('should normalize price', () => {
      const result = PriceParser.normalizePrice(123.456789123, 8);
      expect(result).toBe(123.45678912);
    });

    it('should use default decimals', () => {
      const result = PriceParser.normalizePrice(100.123456789);
      expect(result).toBeLessThan(100.13);
    });

    it('should handle zero', () => {
      const result = PriceParser.normalizePrice(0, 4);
      expect(result).toBe(0);
    });
  });
});
