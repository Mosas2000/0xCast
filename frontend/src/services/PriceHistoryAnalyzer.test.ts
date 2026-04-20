import { describe, it, expect } from 'vitest';
import { PriceHistoryAnalyzer } from '@/services/PriceHistoryAnalyzer';
import { OraclePrice } from '@/types/oracle';

describe('PriceHistoryAnalyzer', () => {
  const mockPriceHistory: OraclePrice[] = [
    { value: 100, timestamp: Date.now() - 10000, source: 'test', confidence: 0.9 },
    { value: 102, timestamp: Date.now() - 8000, source: 'test', confidence: 0.9 },
    { value: 101, timestamp: Date.now() - 6000, source: 'test', confidence: 0.9 },
    { value: 103, timestamp: Date.now() - 4000, source: 'test', confidence: 0.9 },
    { value: 105, timestamp: Date.now() - 2000, source: 'test', confidence: 0.9 },
  ];

  describe('calculateMovingAverage', () => {
    it('should calculate moving average', () => {
      const result = PriceHistoryAnalyzer.calculateMovingAverage(mockPriceHistory, 3);
      expect(result).toBeGreaterThan(100);
      expect(result).toBeLessThan(105);
    });

    it('should use full array if period larger', () => {
      const result = PriceHistoryAnalyzer.calculateMovingAverage(mockPriceHistory, 100);
      const expected = mockPriceHistory.reduce((sum, p) => sum + p.value, 0) / mockPriceHistory.length;
      expect(result).toBeCloseTo(expected);
    });

    it('should handle empty array', () => {
      const result = PriceHistoryAnalyzer.calculateMovingAverage([], 3);
      expect(isNaN(result)).toBe(true);
    });
  });

  describe('calculateExponentialMovingAverage', () => {
    it('should calculate EMA', () => {
      const result = PriceHistoryAnalyzer.calculateExponentialMovingAverage(mockPriceHistory, 3);
      expect(result).toBeGreaterThan(100);
      expect(result).toBeLessThan(110);
    });

    it('should handle single value', () => {
      const result = PriceHistoryAnalyzer.calculateExponentialMovingAverage(
        [mockPriceHistory[0]],
        3
      );
      expect(result).toBe(100);
    });
  });

  describe('calculateStandardDeviation', () => {
    it('should calculate standard deviation', () => {
      const result = PriceHistoryAnalyzer.calculateStandardDeviation(mockPriceHistory);
      expect(result).toBeGreaterThan(0);
    });

    it('should return zero for identical values', () => {
      const identical: OraclePrice[] = Array(5).fill({
        value: 100,
        timestamp: Date.now(),
        source: 'test',
        confidence: 0.9,
      });
      const result = PriceHistoryAnalyzer.calculateStandardDeviation(identical);
      expect(result).toBe(0);
    });

    it('should handle empty array', () => {
      const result = PriceHistoryAnalyzer.calculateStandardDeviation([]);
      expect(result).toBe(0);
    });
  });

  describe('calculateBollingerBands', () => {
    it('should calculate bollinger bands', () => {
      const result = PriceHistoryAnalyzer.calculateBollingerBands(mockPriceHistory, 3, 2);
      expect(result.lower).toBeLessThan(result.middle);
      expect(result.middle).toBeLessThan(result.upper);
    });

    it('should have correct middle value', () => {
      const result = PriceHistoryAnalyzer.calculateBollingerBands(mockPriceHistory, 5, 2);
      expect(result.middle).toBeLessThan(105);
      expect(result.middle).toBeGreaterThan(100);
    });
  });

  describe('calculateRSI', () => {
    it('should calculate RSI between 0 and 100', () => {
      const result = PriceHistoryAnalyzer.calculateRSI(mockPriceHistory, 3);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('should return neutral RSI for insufficient data', () => {
      const result = PriceHistoryAnalyzer.calculateRSI([mockPriceHistory[0]], 5);
      expect(result).toBe(50);
    });

    it('should indicate overbought when values rise', () => {
      const rising: OraclePrice[] = [
        { value: 100, timestamp: Date.now() - 40000, source: 'test', confidence: 0.9 },
        { value: 102, timestamp: Date.now() - 30000, source: 'test', confidence: 0.9 },
        { value: 104, timestamp: Date.now() - 20000, source: 'test', confidence: 0.9 },
        { value: 106, timestamp: Date.now() - 10000, source: 'test', confidence: 0.9 },
        { value: 108, timestamp: Date.now(), source: 'test', confidence: 0.9 },
      ];
      const result = PriceHistoryAnalyzer.calculateRSI(rising, 3);
      expect(result).toBeGreaterThan(50);
    });
  });

  describe('calculateMACD', () => {
    it('should calculate MACD', () => {
      const result = PriceHistoryAnalyzer.calculateMACD(mockPriceHistory);
      expect(typeof result.macd).toBe('number');
      expect(typeof result.signal).toBe('number');
      expect(typeof result.histogram).toBe('number');
    });
  });

  describe('calculateVolatility', () => {
    it('should calculate volatility', () => {
      const result = PriceHistoryAnalyzer.calculateVolatility(mockPriceHistory, 3);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for zero values', () => {
      const zeroes: OraclePrice[] = Array(5).fill({
        value: 0,
        timestamp: Date.now(),
        source: 'test',
        confidence: 0.9,
      });
      const result = PriceHistoryAnalyzer.calculateVolatility(zeroes);
      expect(result).toBe(0);
    });
  });

  describe('calculatePriceChange', () => {
    it('should calculate price change', () => {
      const result = PriceHistoryAnalyzer.calculatePriceChange(mockPriceHistory);
      expect(result.absolute).toBe(5);
      expect(result.percentage).toBeCloseTo(5);
    });

    it('should return zero for single price', () => {
      const result = PriceHistoryAnalyzer.calculatePriceChange([mockPriceHistory[0]]);
      expect(result.absolute).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe('calculateTrendStrength', () => {
    it('should detect uptrend', () => {
      const result = PriceHistoryAnalyzer.calculateTrendStrength(mockPriceHistory);
      expect(result.direction).toBe('up');
      expect(result.strength).toBeGreaterThanOrEqual(0);
    });

    it('should detect downtrend', () => {
      const downtrend: OraclePrice[] = [
        { value: 100, timestamp: Date.now() - 2000, source: 'test', confidence: 0.9 },
        { value: 98, timestamp: Date.now(), source: 'test', confidence: 0.9 },
      ];
      const result = PriceHistoryAnalyzer.calculateTrendStrength(downtrend);
      expect(result.direction).toBe('down');
    });
  });

  describe('identifySupport', () => {
    it('should identify support level', () => {
      const result = PriceHistoryAnalyzer.identifySupport(mockPriceHistory);
      expect(result).toBe(100);
    });

    it('should handle empty array', () => {
      const result = PriceHistoryAnalyzer.identifySupport([]);
      expect(result).toBe(0);
    });
  });

  describe('identifyResistance', () => {
    it('should identify resistance level', () => {
      const result = PriceHistoryAnalyzer.identifyResistance(mockPriceHistory);
      expect(result).toBe(105);
    });

    it('should handle empty array', () => {
      const result = PriceHistoryAnalyzer.identifyResistance([]);
      expect(result).toBe(0);
    });
  });

  describe('calculatePriceDeviation', () => {
    it('should calculate deviation', () => {
      const result = PriceHistoryAnalyzer.calculatePriceDeviation(mockPriceHistory, 100);
      expect(result.deviation).toBe(5);
      expect(result.direction).toBe('above');
    });

    it('should handle zero target', () => {
      const result = PriceHistoryAnalyzer.calculatePriceDeviation(mockPriceHistory, 0);
      expect(result.percentage).toBe(0);
    });
  });

  describe('predictNextPrice', () => {
    it('should predict next price', () => {
      const result = PriceHistoryAnalyzer.predictNextPrice(mockPriceHistory);
      expect(typeof result.predicted).toBe('number');
      expect(result.predicted).toBeGreaterThanOrEqual(0);
      expect(typeof result.confidence).toBe('number');
    });

    it('should return current price for single value', () => {
      const result = PriceHistoryAnalyzer.predictNextPrice([mockPriceHistory[0]]);
      expect(result.confidence).toBe(0);
    });
  });

  describe('generateAnalysis', () => {
    it('should generate comprehensive analysis', () => {
      const result = PriceHistoryAnalyzer.generateAnalysis(mockPriceHistory);
      expect(result.current).toBe(105);
      expect(result.high).toBe(105);
      expect(result.low).toBe(100);
      expect(result.trend).toBe('up');
      expect(typeof result.rsi).toBe('number');
      expect(typeof result.macd).toBe('number');
    });

    it('should handle empty array', () => {
      const result = PriceHistoryAnalyzer.generateAnalysis([]);
      expect(result.current).toBe(0);
      expect(result.average).toBe(0);
      expect(result.rsi).toBe(50);
    });
  });
});
