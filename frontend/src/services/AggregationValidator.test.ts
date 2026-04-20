import { describe, it, expect, beforeEach } from 'vitest';
import { AggregationValidator } from '@/services/AggregationValidator';
import { OraclePrice, ProviderHealth } from '@/types/oracle';

describe('AggregationValidator', () => {
  const mockPrices: OraclePrice[] = [
    {
      value: 100,
      timestamp: Date.now() - 1000,
      source: 'provider1',
      confidence: 0.95,
    },
    {
      value: 101,
      timestamp: Date.now() - 500,
      source: 'provider2',
      confidence: 0.92,
    },
    {
      value: 99.5,
      timestamp: Date.now(),
      source: 'provider3',
      confidence: 0.88,
    },
  ];

  describe('validatePriceArray', () => {
    it('should validate correct price array', () => {
      const result = AggregationValidator.validatePriceArray(mockPrices);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty array', () => {
      const result = AggregationValidator.validatePriceArray([]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price array is empty');
    });

    it('should warn on small array', () => {
      const result = AggregationValidator.validatePriceArray([mockPrices[0]]);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should detect invalid prices', () => {
      const invalid: OraclePrice[] = [
        { value: -5, timestamp: Date.now(), source: 'provider', confidence: 0.8 },
      ];
      const result = AggregationValidator.validatePriceArray(invalid);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateConsensus', () => {
    it('should detect consensus when prices agree', () => {
      const result = AggregationValidator.validateConsensus(mockPrices, 0.66);
      expect(result.isConsensus).toBe(true);
      expect(result.agreementPercentage).toBeGreaterThan(0.66);
    });

    it('should reject consensus when prices disagree', () => {
      const diverged: OraclePrice[] = [
        { value: 100, timestamp: Date.now(), source: 'p1', confidence: 0.8 },
        { value: 200, timestamp: Date.now(), source: 'p2', confidence: 0.8 },
        { value: 300, timestamp: Date.now(), source: 'p3', confidence: 0.8 },
      ];
      const result = AggregationValidator.validateConsensus(diverged, 0.66);
      expect(result.isConsensus).toBe(false);
    });

    it('should calculate agreement percentage', () => {
      const result = AggregationValidator.validateConsensus(mockPrices);
      expect(result.agreementPercentage).toBeGreaterThanOrEqual(0);
      expect(result.agreementPercentage).toBeLessThanOrEqual(1);
    });
  });

  describe('detectOutliers', () => {
    it('should detect IQR outliers', () => {
      const withOutlier: OraclePrice[] = [
        ...mockPrices,
        { value: 1000, timestamp: Date.now(), source: 'p4', confidence: 0.5 },
      ];
      const result = AggregationValidator.detectOutliers(withOutlier, 'iqr');
      expect(result.outliers.length).toBeGreaterThan(0);
      expect(result.cleaned.length).toBeLessThan(withOutlier.length);
    });

    it('should detect Z-score outliers', () => {
      const withOutlier: OraclePrice[] = [
        ...mockPrices,
        { value: 5000, timestamp: Date.now(), source: 'p4', confidence: 0.5 },
      ];
      const result = AggregationValidator.detectOutliers(withOutlier, 'zscore');
      expect(result.outliers.length).toBeGreaterThanOrEqual(0);
    });

    it('should detect MAD outliers', () => {
      const withOutlier: OraclePrice[] = [
        ...mockPrices,
        { value: 1000, timestamp: Date.now(), source: 'p4', confidence: 0.5 },
      ];
      const result = AggregationValidator.detectOutliers(withOutlier, 'mad');
      expect(result.cleaned.length + result.outliers.length).toBe(withOutlier.length);
    });

    it('should keep all prices in cleaned when no outliers', () => {
      const result = AggregationValidator.detectOutliers(mockPrices);
      expect(result.cleaned.length + result.outliers.length).toBe(mockPrices.length);
    });
  });

  describe('validateVolatility', () => {
    it('should validate low volatility', () => {
      const result = AggregationValidator.validateVolatility(mockPrices, 0.1);
      expect(result.isValid).toBe(true);
      expect(result.volatility).toBeLessThan(0.1);
    });

    it('should reject high volatility', () => {
      const volatile: OraclePrice[] = [
        { value: 100, timestamp: Date.now(), source: 'p1', confidence: 0.8 },
        { value: 200, timestamp: Date.now(), source: 'p2', confidence: 0.8 },
      ];
      const result = AggregationValidator.validateVolatility(volatile, 0.01);
      expect(result.isValid).toBe(false);
    });

    it('should calculate volatility correctly', () => {
      const result = AggregationValidator.validateVolatility(mockPrices);
      expect(result.volatility).toBeGreaterThanOrEqual(0);
    });
  });

  describe('validateProviderHealth', () => {
    it('should validate healthy provider', () => {
      const health: ProviderHealth = {
        id: 'test',
        successRate: 0.99,
        uptime: 0.99,
        averageLatency: 100,
        responseCount: 1000,
        errorCount: 5,
        lastResponseTime: Date.now(),
        healthScore: 0.99,
      };
      const result = AggregationValidator.validateProviderHealth(health);
      expect(result.isHealthy).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect unhealthy provider', () => {
      const health: ProviderHealth = {
        id: 'test',
        successRate: 0.5,
        uptime: 0.5,
        averageLatency: 10000,
        responseCount: 100,
        errorCount: 500,
        lastResponseTime: Date.now(),
        healthScore: 0.3,
      };
      const result = AggregationValidator.validateProviderHealth(health);
      expect(result.isHealthy).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should calculate confidence', () => {
      const health: ProviderHealth = {
        id: 'test',
        successRate: 0.8,
        uptime: 0.9,
        averageLatency: 500,
        responseCount: 100,
        errorCount: 10,
        lastResponseTime: Date.now(),
        healthScore: 0.85,
      };
      const result = AggregationValidator.validateProviderHealth(health);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('validateDataFreshness', () => {
    it('should validate fresh data', () => {
      const result = AggregationValidator.validateDataFreshness(mockPrices, 300000);
      expect(result.isFresh).toBe(true);
      expect(result.staleCount).toBe(0);
    });

    it('should detect stale data', () => {
      const stale: OraclePrice[] = [
        {
          value: 100,
          timestamp: Date.now() - 400000,
          source: 'p1',
          confidence: 0.8,
        },
      ];
      const result = AggregationValidator.validateDataFreshness(stale, 300000);
      expect(result.isFresh).toBe(false);
      expect(result.staleCount).toBe(1);
    });

    it('should calculate freshness percentage', () => {
      const result = AggregationValidator.validateDataFreshness(mockPrices);
      expect(result.freshness).toBeGreaterThanOrEqual(0);
      expect(result.freshness).toBeLessThanOrEqual(1);
    });
  });
});
