import { PriceAggregationAlgorithms } from '../PriceAggregationAlgorithms';
import { OraclePrice } from '@/types/oracle';

describe('PriceAggregationAlgorithms', () => {
  const createMockPrices = (values: number[]): OraclePrice[] => {
    return values.map((value, index) => ({
      value,
      timestamp: Date.now() - index * 1000,
      source: `provider-${index}`,
      confidence: 0.9,
    }));
  };

  describe('median', () => {
    it('should calculate median for odd number of prices', () => {
      const prices = createMockPrices([100, 110, 90]);
      const result = PriceAggregationAlgorithms.median(prices);
      expect(result.value).toBe(100);
      expect(result.method).toBe('median');
    });

    it('should calculate median for even number of prices', () => {
      const prices = createMockPrices([100, 110, 90, 95]);
      const result = PriceAggregationAlgorithms.median(prices);
      expect(result.value).toBe(97.5);
    });

    it('should handle empty array', () => {
      const result = PriceAggregationAlgorithms.median([]);
      expect(result.value).toBe(0);
      expect(result.confidence).toBe(0);
    });
  });

  describe('weightedAverage', () => {
    it('should calculate weighted average', () => {
      const prices: OraclePrice[] = [
        { value: 100, timestamp: Date.now(), source: 'p1', confidence: 0.8 },
        { value: 110, timestamp: Date.now(), source: 'p2', confidence: 0.6 },
        { value: 90, timestamp: Date.now(), source: 'p3', confidence: 0.4 },
      ];

      const result = PriceAggregationAlgorithms.weightedAverage(prices);
      expect(result.value).toBeGreaterThan(90);
      expect(result.value).toBeLessThan(110);
      expect(result.method).toBe('weighted_average');
    });

    it('should fallback to median when total weight is zero', () => {
      const prices: OraclePrice[] = [
        { value: 100, timestamp: Date.now(), source: 'p1', confidence: 0 },
        { value: 110, timestamp: Date.now(), source: 'p2', confidence: 0 },
      ];

      const result = PriceAggregationAlgorithms.weightedAverage(prices);
      expect(result.value).toBe(105);
    });
  });

  describe('trimmedMean', () => {
    it('should calculate trimmed mean', () => {
      const prices = createMockPrices([100, 110, 90, 95, 105, 200, 50]);
      const result = PriceAggregationAlgorithms.trimmedMean(prices, 20);
      expect(result.method).toBe('trimmed_mean');
      expect(result.metadata.trimPercentage).toBe(20);
    });

    it('should handle small arrays', () => {
      const prices = createMockPrices([100, 110]);
      const result = PriceAggregationAlgorithms.trimmedMean(prices, 10);
      expect(result.value).toBeGreaterThan(0);
    });
  });

  describe('outlierResistant', () => {
    it('should filter outliers', () => {
      const prices = createMockPrices([100, 101, 99, 1000]);
      const result = PriceAggregationAlgorithms.outlierResistant(prices);
      expect(result.method).toBe('outlier_resistant');
      expect(result.metadata.outliersRemoved).toBeGreaterThan(0);
    });

    it('should handle all outliers', () => {
      const prices = createMockPrices([100]);
      const result = PriceAggregationAlgorithms.outlierResistant(prices, 0.1);
      expect(result.value).toBeGreaterThan(0);
    });
  });

  describe('timeWeighted', () => {
    it('should weight recent prices higher', () => {
      const now = Date.now();
      const prices: OraclePrice[] = [
        { value: 100, timestamp: now, source: 'p1', confidence: 0.9 },
        { value: 90, timestamp: now - 60000, source: 'p2', confidence: 0.9 },
        { value: 80, timestamp: now - 120000, source: 'p3', confidence: 0.9 },
      ];

      const result = PriceAggregationAlgorithms.timeWeighted(prices);
      expect(result.value).toBeGreaterThan(90);
      expect(result.method).toBe('time_weighted');
    });
  });

  describe('exponentialMovingAverage', () => {
    it('should calculate EMA', () => {
      const prices = createMockPrices([100, 105, 110, 108, 112]);
      const result = PriceAggregationAlgorithms.exponentialMovingAverage(prices, 0.3);
      expect(result.method).toBe('ema');
      expect(result.value).toBeGreaterThan(0);
    });

    it('should handle single price', () => {
      const prices = createMockPrices([100]);
      const result = PriceAggregationAlgorithms.exponentialMovingAverage(prices);
      expect(result.value).toBe(100);
    });
  });

  describe('adaptive', () => {
    it('should select appropriate method for low variance', () => {
      const prices = createMockPrices([100, 101, 99, 100]);
      const result = PriceAggregationAlgorithms.adaptive(prices);
      expect(result.method).toBe('adaptive');
      expect(result.metadata.reason).toContain('variance');
    });

    it('should select appropriate method for high variance', () => {
      const prices = createMockPrices([100, 150, 50, 200]);
      const result = PriceAggregationAlgorithms.adaptive(prices);
      expect(result.method).toBe('adaptive');
    });
  });

  describe('consensus', () => {
    it('should achieve consensus with similar prices', () => {
      const prices = createMockPrices([100, 101, 99, 100]);
      const result = PriceAggregationAlgorithms.consensus(prices, 0.05);
      expect(result.method).toBe('consensus');
      expect(result.metadata.consensusReached).toBe(true);
    });

    it('should fail consensus with divergent prices', () => {
      const prices = createMockPrices([100, 200, 50, 300]);
      const result = PriceAggregationAlgorithms.consensus(prices, 0.05);
      expect(result.metadata.consensusReached).toBe(false);
    });
  });

  describe('selectBestMethod', () => {
    it('should select single for one price', () => {
      const prices = createMockPrices([100]);
      const result = PriceAggregationAlgorithms.selectBestMethod(prices);
      expect(result.method).toBe('single');
      expect(result.value).toBe(100);
    });

    it('should select outlier resistant for outliers', () => {
      const prices = createMockPrices([100, 101, 99, 1000]);
      const result = PriceAggregationAlgorithms.selectBestMethod(prices);
      expect(result.method).toBe('outlier_resistant');
    });

    it('should select weighted average for varying confidence', () => {
      const prices: OraclePrice[] = [
        { value: 100, timestamp: Date.now(), source: 'p1', confidence: 0.9 },
        { value: 110, timestamp: Date.now(), source: 'p2', confidence: 0.5 },
        { value: 90, timestamp: Date.now(), source: 'p3', confidence: 0.3 },
      ];

      const result = PriceAggregationAlgorithms.selectBestMethod(prices);
      expect(result.method).toBe('weighted_average');
    });

    it('should select median for normal distribution', () => {
      const prices = createMockPrices([98, 99, 100, 101, 102]);
      const result = PriceAggregationAlgorithms.selectBestMethod(prices);
      expect(['median', 'weighted_average']).toContain(result.method);
    });
  });

  describe('volumeWeighted', () => {
    it('should calculate volume weighted price', () => {
      const prices = createMockPrices([100, 110, 90]);
      const volumes = [1000, 500, 300];
      const result = PriceAggregationAlgorithms.volumeWeighted(prices, volumes);
      expect(result.method).toBe('volume_weighted');
      expect(result.value).toBeGreaterThan(90);
      expect(result.value).toBeLessThan(110);
    });

    it('should handle mismatched lengths', () => {
      const prices = createMockPrices([100, 110]);
      const volumes = [1000];
      const result = PriceAggregationAlgorithms.volumeWeighted(prices, volumes);
      expect(result.value).toBe(0);
    });

    it('should fallback to median when volume is zero', () => {
      const prices = createMockPrices([100, 110]);
      const volumes = [0, 0];
      const result = PriceAggregationAlgorithms.volumeWeighted(prices, volumes);
      expect(result.value).toBe(105);
    });
  });
});
