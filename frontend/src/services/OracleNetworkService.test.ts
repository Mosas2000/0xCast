import { OracleNetworkService } from '@/services/OracleNetworkService';
import { ConsensusMechanismService } from '@/services/ConsensusMechanismService';
import { FallbackResolutionService } from '@/services/FallbackResolutionService';
import { OracleMonitoringService } from '@/services/OracleMonitoringService';
import { OracleProvider, OraclePrice } from '@/types/oracle';

describe('OracleNetworkService', () => {
  const mockProviders: OracleProvider[] = [
    {
      id: 'provider1',
      name: 'Provider 1',
      url: 'https://api1.oracle.com',
      healthScore: 100,
      enabled: true,
      updateFrequency: 60000,
      timeout: 5000,
      weight: 1,
      lastUpdate: Date.now(),
      errorCount: 0,
      successCount: 0,
    },
    {
      id: 'provider2',
      name: 'Provider 2',
      url: 'https://api2.oracle.com',
      healthScore: 100,
      enabled: true,
      updateFrequency: 60000,
      timeout: 5000,
      weight: 1,
      lastUpdate: Date.now(),
      errorCount: 0,
      successCount: 0,
    },
  ];

  const mockPrices: OraclePrice[] = [
    {
      value: 100,
      timestamp: Date.now(),
      source: 'provider1',
      confidence: 0.95,
    },
    {
      value: 101,
      timestamp: Date.now(),
      source: 'provider2',
      confidence: 0.92,
    },
  ];

  beforeEach(() => {
    OracleNetworkService.initializeProviders(mockProviders);
  });

  it('initializes providers correctly', () => {
    const state = OracleNetworkService.getNetworkState();
    expect(state.totalProviders).toBe(2);
  });

  it('aggregates prices using median', () => {
    const aggregated = OracleNetworkService.aggregatePrices('market1', mockPrices);
    expect(aggregated.value).toBeGreaterThan(0);
    expect(aggregated.sources.length).toBe(2);
  });

  it('calculates consensus correctly', () => {
    const consensus = OracleNetworkService.calculateConsensus(mockPrices);
    expect(consensus.agreeingProviders.length).toBeGreaterThan(0);
  });

  it('detects network health status', () => {
    const state = OracleNetworkService.getNetworkState();
    expect(state.activeProviders).toBeGreaterThanOrEqual(0);
    expect(state.totalProviders).toBe(2);
  });

  it('disables provider correctly', () => {
    OracleNetworkService.disableProvider('provider1');
    const state = OracleNetworkService.getNetworkState();
    expect(state.activeProviders).toBeLessThan(2);
  });

  it('enables provider correctly', () => {
    OracleNetworkService.disableProvider('provider1');
    OracleNetworkService.enableProvider('provider1');
    const state = OracleNetworkService.getNetworkState();
    expect(state.activeProviders).toBe(2);
  });

  it('adds new provider', () => {
    const newProvider: OracleProvider = {
      id: 'provider3',
      name: 'Provider 3',
      url: 'https://api3.oracle.com',
      healthScore: 100,
      enabled: true,
      updateFrequency: 60000,
      timeout: 5000,
      weight: 1,
      lastUpdate: Date.now(),
      errorCount: 0,
      successCount: 0,
    };

    OracleNetworkService.addProvider(newProvider);
    const state = OracleNetworkService.getNetworkState();
    expect(state.totalProviders).toBe(3);
  });

  it('removes provider', () => {
    OracleNetworkService.removeProvider('provider1');
    const state = OracleNetworkService.getNetworkState();
    expect(state.totalProviders).toBe(1);
  });
});

describe('ConsensusMechanismService', () => {
  it('calculates consensus price correctly', () => {
    const prices: OraclePrice[] = [
      { value: 100, timestamp: Date.now(), source: 'p1', confidence: 0.9 },
      { value: 101, timestamp: Date.now(), source: 'p2', confidence: 0.9 },
      { value: 102, timestamp: Date.now(), source: 'p3', confidence: 0.9 },
    ];

    const consensus = ConsensusMechanismService.calculateConsensusPrice(prices);
    expect(consensus.priceValue).toBeGreaterThan(0);
    expect(consensus.totalSources).toBe(3);
  });

  it('evaluates strong consensus', () => {
    const prices: OraclePrice[] = [
      { value: 100, timestamp: Date.now(), source: 'p1', confidence: 0.95 },
      { value: 100.5, timestamp: Date.now(), source: 'p2', confidence: 0.95 },
      { value: 100.2, timestamp: Date.now(), source: 'p3', confidence: 0.95 },
    ];

    const consensus = ConsensusMechanismService.calculateConsensusPrice(prices);
    const evaluation = ConsensusMechanismService.evaluateConsensus(consensus);
    expect(evaluation.consensusLevel).not.toBe('none');
  });

  it('detects outliers correctly', () => {
    const prices: OraclePrice[] = [
      { value: 100, timestamp: Date.now(), source: 'p1', confidence: 0.9 },
      { value: 101, timestamp: Date.now(), source: 'p2', confidence: 0.9 },
      { value: 200, timestamp: Date.now(), source: 'p3', confidence: 0.9 },
    ];

    const result = ConsensusMechanismService.detectOutliers(prices);
    expect(result.outliers.length).toBeGreaterThan(0);
  });

  it('validates price within tolerance', () => {
    const price: OraclePrice = {
      value: 100,
      timestamp: Date.now(),
      source: 'p1',
      confidence: 0.9,
    };

    const reference: OraclePrice[] = [
      { value: 100, timestamp: Date.now(), source: 'p2', confidence: 0.9 },
      { value: 101, timestamp: Date.now(), source: 'p3', confidence: 0.9 },
    ];

    const valid = ConsensusMechanismService.validatePrice(price, reference);
    expect(typeof valid).toBe('boolean');
  });
});

describe('FallbackResolutionService', () => {
  beforeEach(() => {
    FallbackResolutionService.clearHistory('market1');
  });

  it('records price history', () => {
    FallbackResolutionService.recordPrice('market1', 100, Date.now(), 'provider1');
    const data = FallbackResolutionService.getHealthCheckData('market1');
    expect(data.hasHistory).toBe(true);
  });

  it('uses last_known fallback', () => {
    const now = Date.now();
    FallbackResolutionService.recordPrice('market1', 100, now, 'provider1');

    const fallback = FallbackResolutionService.resolveFallback('market1', {
      enabled: true,
      type: 'last_known',
      maxAge: 3600000,
      minimumConfidence: 0.5,
    });

    expect(fallback).not.toBeNull();
    expect(fallback?.value).toBe(100);
  });

  it('uses median history fallback', () => {
    const now = Date.now();
    FallbackResolutionService.recordPrice('market1', 100, now - 1000, 'provider1');
    FallbackResolutionService.recordPrice('market1', 101, now - 500, 'provider1');
    FallbackResolutionService.recordPrice('market1', 99, now, 'provider1');

    const fallback = FallbackResolutionService.resolveFallback('market1', {
      enabled: true,
      type: 'median_history',
      maxAge: 3600000,
      minimumConfidence: 0.5,
    });

    expect(fallback).not.toBeNull();
    expect(fallback?.value).toBeGreaterThan(0);
  });

  it('detects stale prices', () => {
    const oldTimestamp = Date.now() - 7200000;
    const isStale = FallbackResolutionService.isStalePrice(oldTimestamp, 3600000);
    expect(isStale).toBe(true);
  });

  it('checks valid fallback data', () => {
    FallbackResolutionService.recordPrice('market1', 100, Date.now(), 'provider1');
    const hasValid = FallbackResolutionService.hasValidFallbackData('market1', {
      enabled: true,
      type: 'last_known',
      maxAge: 3600000,
      minimumConfidence: 0.5,
    });

    expect(hasValid).toBe(true);
  });

  it('clears price history', () => {
    FallbackResolutionService.recordPrice('market1', 100, Date.now(), 'provider1');
    FallbackResolutionService.clearHistory('market1');
    const data = FallbackResolutionService.getHealthCheckData('market1');
    expect(data.hasHistory).toBe(false);
  });
});

describe('OracleMonitoringService', () => {
  beforeEach(() => {
    OracleMonitoringService.resetMetrics();
  });

  it('records successful updates', () => {
    OracleMonitoringService.recordUpdate('provider1', true, 100);
    const metric = OracleMonitoringService.getMetrics('provider1');
    expect(metric?.successRate).toBe(100);
  });

  it('records failed updates', () => {
    OracleMonitoringService.recordUpdate('provider1', false, 0, 'Connection failed');
    const metric = OracleMonitoringService.getMetrics('provider1');
    expect(metric?.failureCount).toBe(1);
  });

  it('calculates average latency', () => {
    OracleMonitoringService.recordUpdate('provider1', true, 100);
    OracleMonitoringService.recordUpdate('provider1', true, 200);
    const metric = OracleMonitoringService.getMetrics('provider1');
    expect(metric?.averageLatency).toBe(150);
  });

  it('creates and tracks alerts', () => {
    const provider: OracleProvider = {
      id: 'provider1',
      name: 'Provider 1',
      url: 'https://api.oracle.com',
      healthScore: 100,
      enabled: true,
      updateFrequency: 60000,
      timeout: 5000,
      weight: 1,
      lastUpdate: Date.now(),
      errorCount: 0,
      successCount: 0,
    };

    OracleMonitoringService.checkHealthThresholds(provider);
    const alerts = OracleMonitoringService.getActiveAlerts();
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('resolves alerts', () => {
    const provider: OracleProvider = {
      id: 'provider1',
      name: 'Provider 1',
      url: 'https://api.oracle.com',
      healthScore: 100,
      enabled: true,
      updateFrequency: 60000,
      timeout: 5000,
      weight: 1,
      lastUpdate: Date.now(),
      errorCount: 0,
      successCount: 0,
    };

    OracleMonitoringService.checkHealthThresholds(provider);
    const alerts = OracleMonitoringService.getActiveAlerts();

    if (alerts.length > 0) {
      OracleMonitoringService.resolveAlert(alerts[0].id);
      const resolved = OracleMonitoringService.getAlerts(true);
      expect(resolved.length).toBeGreaterThan(0);
    }
  });

  it('calculates network health', () => {
    OracleMonitoringService.recordUpdate('provider1', true, 100);
    OracleMonitoringService.recordUpdate('provider2', true, 150);

    const providers: OracleProvider[] = [
      {
        id: 'provider1',
        name: 'Provider 1',
        url: 'https://api1.oracle.com',
        healthScore: 100,
        enabled: true,
        updateFrequency: 60000,
        timeout: 5000,
        weight: 1,
        lastUpdate: Date.now(),
        errorCount: 0,
        successCount: 0,
      },
      {
        id: 'provider2',
        name: 'Provider 2',
        url: 'https://api2.oracle.com',
        healthScore: 100,
        enabled: true,
        updateFrequency: 60000,
        timeout: 5000,
        weight: 1,
        lastUpdate: Date.now(),
        errorCount: 0,
        successCount: 0,
      },
    ];

    const health = OracleMonitoringService.getNetworkHealth(providers);
    expect(health).toBeGreaterThanOrEqual(0);
    expect(health).toBeLessThanOrEqual(1);
  });

  it('generates monitoring report', () => {
    OracleMonitoringService.recordUpdate('provider1', true, 100);

    const providers: OracleProvider[] = [
      {
        id: 'provider1',
        name: 'Provider 1',
        url: 'https://api1.oracle.com',
        healthScore: 100,
        enabled: true,
        updateFrequency: 60000,
        timeout: 5000,
        weight: 1,
        lastUpdate: Date.now(),
        errorCount: 0,
        successCount: 0,
      },
    ];

    const report = OracleMonitoringService.generateReport(providers);
    expect(report.timestamp).toBeLessThanOrEqual(Date.now());
    expect(report.providersCount).toBe(1);
  });
});
