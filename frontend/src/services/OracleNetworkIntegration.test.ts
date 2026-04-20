import { describe, it, expect, beforeEach } from 'vitest';
import { OracleNetworkService } from '@/services/OracleNetworkService';
import { ConsensusMechanismService } from '@/services/ConsensusMechanismService';
import { FallbackResolutionService } from '@/services/FallbackResolutionService';
import { OracleMonitoringService } from '@/services/OracleMonitoringService';
import { PriceAggregationService } from '@/services/PriceAggregationService';
import { OraclePrice } from '@/types/oracle';

describe('Oracle Network Integration Tests', () => {
  let mockPrices: OraclePrice[];

  beforeEach(() => {
    mockPrices = [
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
  });

  describe('OracleNetworkService', () => {
    it('should initialize oracle network', async () => {
      await OracleNetworkService.initialize();
      const providers = await OracleNetworkService.getProviderStats();
      expect(providers.length).toBeGreaterThan(0);
    });

    it('should fetch prices from network', async () => {
      const price = await OracleNetworkService.fetchPrice('STX/USD');
      expect(price).toBeDefined();
      expect(price?.value).toBeGreaterThan(0);
    });

    it('should aggregate prices correctly', async () => {
      const aggregated = await OracleNetworkService.aggregatePrices(
        'STX/USD',
        mockPrices
      );
      expect(aggregated).toBeDefined();
      expect(aggregated?.value).toBeGreaterThan(0);
    });

    it('should calculate consensus', async () => {
      const consensus = await OracleNetworkService.calculateConsensus(mockPrices);
      expect(consensus).toBeDefined();
      expect(consensus?.percentage).toBeGreaterThanOrEqual(0);
      expect(consensus?.percentage).toBeLessThanOrEqual(1);
    });

    it('should get network statistics', async () => {
      const stats = await OracleNetworkService.getNetworkStats();
      expect(stats).toBeDefined();
      expect(stats?.networkHealth).toBeGreaterThanOrEqual(0);
      expect(stats?.networkHealth).toBeLessThanOrEqual(1);
    });
  });

  describe('ConsensusMechanismService', () => {
    it('should evaluate consensus strength', () => {
      const result = ConsensusMechanismService.evaluateConsensus(mockPrices);
      expect(result).toBeDefined();
      expect(result?.strength).toBeGreaterThanOrEqual(0);
    });

    it('should calculate weighted median', () => {
      const weights = [1, 1, 1];
      const median = ConsensusMechanismService.calculateWeightedMedian(
        mockPrices,
        weights
      );
      expect(median).toBeGreaterThan(0);
      expect(median).toBeLessThan(105);
    });

    it('should detect outliers', () => {
      const withOutlier: OraclePrice[] = [
        ...mockPrices,
        {
          value: 1000,
          timestamp: Date.now(),
          source: 'p4',
          confidence: 0.5,
        },
      ];
      const outliers = ConsensusMechanismService.detectOutliers(withOutlier);
      expect(outliers.length).toBeGreaterThan(0);
    });
  });

  describe('FallbackResolutionService', () => {
    it('should resolve with last known price', () => {
      const price = FallbackResolutionService.resolveFallback(
        'STX/USD',
        'last_known'
      );
      expect(price).toBeDefined();
    });

    it('should resolve with history median', () => {
      const price = FallbackResolutionService.resolveFallback(
        'STX/USD',
        'median_history'
      );
      expect(price).toBeDefined();
    });

    it('should add to price history', () => {
      FallbackResolutionService.addToHistory('STX/USD', 100, 0.9);
      const history = FallbackResolutionService.getHistory('STX/USD');
      expect(history.length).toBeGreaterThan(0);
    });

    it('should check price freshness', () => {
      const fresh = FallbackResolutionService.isPriceFresh(
        'STX/USD',
        3600000
      );
      expect(typeof fresh).toBe('boolean');
    });
  });

  describe('OracleMonitoringService', () => {
    it('should record provider success', () => {
      OracleMonitoringService.recordSuccess('provider1', 1000);
      const health = OracleMonitoringService.getProviderHealth('provider1');
      expect(health).toBeDefined();
      expect(health?.successRate).toBeGreaterThanOrEqual(0);
    });

    it('should record provider failure', () => {
      OracleMonitoringService.recordFailure('provider1', 'test error');
      const health = OracleMonitoringService.getProviderHealth('provider1');
      expect(health?.errorCount).toBeGreaterThan(0);
    });

    it('should calculate health score', () => {
      const score = OracleMonitoringService.calculateHealthScore('provider1');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should detect health issues', () => {
      for (let i = 0; i < 10; i++) {
        OracleMonitoringService.recordFailure('provider1', 'test error');
      }
      const alerts = OracleMonitoringService.getAlerts('provider1');
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe('PriceAggregationService', () => {
    it('should aggregate prices using median', () => {
      const result = PriceAggregationService.aggregatePrices(
        mockPrices,
        'median'
      );
      expect(result).toBeDefined();
      expect(result?.value).toBeGreaterThan(0);
    });

    it('should aggregate prices using mean', () => {
      const result = PriceAggregationService.aggregatePrices(
        mockPrices,
        'mean'
      );
      expect(result).toBeDefined();
      expect(result?.value).toBeGreaterThan(0);
    });

    it('should weight prices by confidence', () => {
      const weights = mockPrices.map((p) => p.confidence);
      const result = PriceAggregationService.aggregatePrices(
        mockPrices,
        'weighted_median',
        weights
      );
      expect(result).toBeDefined();
      expect(result?.value).toBeGreaterThan(0);
    });

    it('should calculate confidence from providers', () => {
      const confidence = PriceAggregationService.calculateConfidence(
        mockPrices,
        true
      );
      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('End-to-End Workflow', () => {
    it('should complete full oracle workflow', async () => {
      await OracleNetworkService.initialize();

      const aggregated = await OracleNetworkService.aggregatePrices(
        'STX/USD',
        mockPrices
      );

      expect(aggregated).toBeDefined();
      expect(aggregated?.consensusReached).toBeDefined();
      expect(aggregated?.sources).toHaveLength(3);
      expect(aggregated?.confidence).toBeGreaterThan(0);
    });

    it('should handle consensus failure gracefully', async () => {
      const divergent: OraclePrice[] = [
        {
          value: 100,
          timestamp: Date.now(),
          source: 'p1',
          confidence: 0.8,
        },
        {
          value: 200,
          timestamp: Date.now(),
          source: 'p2',
          confidence: 0.8,
        },
        {
          value: 300,
          timestamp: Date.now(),
          source: 'p3',
          confidence: 0.8,
        },
      ];

      const aggregated = await OracleNetworkService.aggregatePrices(
        'TEST/USD',
        divergent
      );

      expect(aggregated).toBeDefined();
      expect(aggregated?.consensusReached).toBe(false);
    });

    it('should provide fallback when consensus fails', async () => {
      FallbackResolutionService.addToHistory('TEST/USD', 50, 0.8);
      FallbackResolutionService.addToHistory('TEST/USD', 51, 0.85);
      FallbackResolutionService.addToHistory('TEST/USD', 49.5, 0.8);

      const fallback = FallbackResolutionService.resolveFallback(
        'TEST/USD',
        'median_history'
      );

      expect(fallback).toBeDefined();
    });

    it('should monitor network health', async () => {
      OracleMonitoringService.recordSuccess('provider1', 100);
      OracleMonitoringService.recordSuccess('provider2', 150);
      OracleMonitoringService.recordSuccess('provider3', 120);

      const health1 = OracleMonitoringService.getProviderHealth('provider1');
      const health2 = OracleMonitoringService.getProviderHealth('provider2');
      const health3 = OracleMonitoringService.getProviderHealth('provider3');

      expect(health1?.healthScore).toBeGreaterThan(0);
      expect(health2?.healthScore).toBeGreaterThan(0);
      expect(health3?.healthScore).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty price arrays', async () => {
      const aggregated = await OracleNetworkService.aggregatePrices(
        'EMPTY/USD',
        []
      );
      expect(aggregated?.value).toBeDefined();
    });

    it('should handle invalid prices', async () => {
      const invalid: OraclePrice[] = [
        {
          value: -100,
          timestamp: Date.now(),
          source: 'p1',
          confidence: -0.5,
        },
      ];

      const aggregated = await OracleNetworkService.aggregatePrices(
        'INVALID/USD',
        invalid
      );
      expect(aggregated).toBeDefined();
    });

    it('should handle stale prices', async () => {
      const stale: OraclePrice[] = [
        {
          value: 100,
          timestamp: Date.now() - 86400000,
          source: 'p1',
          confidence: 0.8,
        },
      ];

      const aggregated = await OracleNetworkService.aggregatePrices(
        'STALE/USD',
        stale
      );
      expect(aggregated).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should aggregate large price arrays efficiently', async () => {
      const largePrices: OraclePrice[] = Array.from({ length: 100 }, (_, i) => ({
        value: 100 + Math.random() * 10,
        timestamp: Date.now() - i * 1000,
        source: `provider${i}`,
        confidence: 0.8 + Math.random() * 0.2,
      }));

      const start = Date.now();
      const aggregated = await OracleNetworkService.aggregatePrices(
        'PERF/USD',
        largePrices
      );
      const elapsed = Date.now() - start;

      expect(aggregated).toBeDefined();
      expect(elapsed).toBeLessThan(1000);
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = [
        OracleNetworkService.aggregatePrices('STX/USD', mockPrices),
        OracleNetworkService.aggregatePrices('BTC/USD', mockPrices),
        OracleNetworkService.aggregatePrices('ETH/USD', mockPrices),
      ];

      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toBeDefined();
      });
    });
  });
});
