import { useState, useCallback, useEffect } from 'react';
import {
  OraclePrice,
  AggregatedPrice,
  OracleProvider,
  OracleNetworkState,
  OracleMetrics,
  MonitoringAlert,
} from '@/types/oracle';
import { OracleNetworkService } from '@/services/OracleNetworkService';
import { ConsensusMechanismService } from '@/services/ConsensusMechanismService';
import { FallbackResolutionService } from '@/services/FallbackResolutionService';
import { OracleMonitoringService } from '@/services/OracleMonitoringService';

export function useOracleNetwork(providers: OracleProvider[]) {
  const [networkState, setNetworkState] = useState<OracleNetworkState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initializeNetwork = useCallback(async () => {
    try {
      setLoading(true);
      OracleNetworkService.initializeProviders(providers);
      const state = OracleNetworkService.getNetworkState();
      setNetworkState(state);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize network'));
    } finally {
      setLoading(false);
    }
  }, [providers]);

  useEffect(() => {
    initializeNetwork();
  }, [initializeNetwork]);

  const updateNetworkState = useCallback(() => {
    const state = OracleNetworkService.getNetworkState();
    setNetworkState(state);
  }, []);

  const addProvider = useCallback((provider: OracleProvider) => {
    OracleNetworkService.addProvider(provider);
    updateNetworkState();
  }, [updateNetworkState]);

  const removeProvider = useCallback((providerId: string) => {
    OracleNetworkService.removeProvider(providerId);
    updateNetworkState();
  }, [updateNetworkState]);

  const enableProvider = useCallback((providerId: string) => {
    OracleNetworkService.enableProvider(providerId);
    updateNetworkState();
  }, [updateNetworkState]);

  const disableProvider = useCallback((providerId: string) => {
    OracleNetworkService.disableProvider(providerId);
    updateNetworkState();
  }, [updateNetworkState]);

  return {
    networkState,
    loading,
    error,
    initializeNetwork,
    updateNetworkState,
    addProvider,
    removeProvider,
    enableProvider,
    disableProvider,
  };
}

export function useOraclePriceAggregation(marketId: string, providers: OracleProvider[]) {
  const [aggregatedPrice, setAggregatedPrice] = useState<AggregatedPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const aggregatePrices = useCallback(async (prices: OraclePrice[]) => {
    try {
      setLoading(true);
      const aggregated = OracleNetworkService.aggregatePrices(marketId, prices);
      setAggregatedPrice(aggregated);
      setError(null);
      return aggregated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to aggregate prices');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [marketId]);

  const fetchAndAggregate = useCallback(async () => {
    try {
      setLoading(true);
      const prices: OraclePrice[] = [];

      for (const provider of providers) {
        const price = await OracleNetworkService.fetchPrice(provider.id, marketId);
        if (price) {
          prices.push(price);
        }
      }

      if (prices.length === 0) {
        throw new Error('No prices available from any provider');
      }

      const aggregated = await aggregatePrices(prices);
      return aggregated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch and aggregate');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [marketId, providers, aggregatePrices]);

  return {
    aggregatedPrice,
    loading,
    error,
    aggregatePrices,
    fetchAndAggregate,
  };
}

export function useConsensus(prices: OraclePrice[]) {
  const [consensus, setConsensus] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const calculateConsensus = useCallback(async () => {
    try {
      setLoading(true);
      const result = ConsensusMechanismService.calculateConsensusPrice(prices);
      const evaluation = ConsensusMechanismService.evaluateConsensus(result);
      setConsensus(evaluation);
      setError(null);
      return evaluation;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to calculate consensus');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [prices]);

  const detectOutliers = useCallback(() => {
    try {
      return ConsensusMechanismService.detectOutliers(prices);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to detect outliers');
      setError(error);
      throw error;
    }
  }, [prices]);

  return {
    consensus,
    loading,
    error,
    calculateConsensus,
    detectOutliers,
  };
}

export function useFallbackResolution(marketId: string) {
  const [fallbackPrice, setFallbackPrice] = useState<AggregatedPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const recordPrice = useCallback((price: number, source: string) => {
    try {
      FallbackResolutionService.recordPrice(marketId, price, Date.now(), source);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to record price');
      setError(error);
    }
  }, [marketId]);

  const resolveFallback = useCallback(async () => {
    try {
      setLoading(true);
      const fallback = FallbackResolutionService.resolveFallback(marketId, {
        enabled: true,
        type: 'median_history',
        maxAge: 3600000,
        minimumConfidence: 0.5,
      });
      setFallbackPrice(fallback);
      setError(null);
      return fallback;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to resolve fallback');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [marketId]);

  const hasValidFallback = useCallback(() => {
    return FallbackResolutionService.hasValidFallbackData(marketId, {
      enabled: true,
      type: 'median_history',
      maxAge: 3600000,
      minimumConfidence: 0.5,
    });
  }, [marketId]);

  return {
    fallbackPrice,
    loading,
    error,
    recordPrice,
    resolveFallback,
    hasValidFallback,
  };
}

export function useOracleMonitoring(providers: OracleProvider[]) {
  const [metrics, setMetrics] = useState<Map<string, OracleMetrics>>(new Map());
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [networkHealth, setNetworkHealth] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const recordUpdate = useCallback(
    (providerId: string, success: boolean, latency: number, errorMsg?: string) => {
      try {
        OracleMonitoringService.recordUpdate(providerId, success, latency, errorMsg);
        OracleMonitoringService.checkHealthThresholds(
          providers.find((p) => p.id === providerId)!
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to record update');
        setError(error);
      }
    },
    [providers]
  );

  const updateMetrics = useCallback(() => {
    try {
      setLoading(true);
      const allMetrics = OracleMonitoringService.getAllMetrics();
      const metricsMap = new Map(allMetrics.map((m) => [m.providerId, m]));
      setMetrics(metricsMap);

      const activeAlerts = OracleMonitoringService.getActiveAlerts();
      setAlerts(activeAlerts);

      const health = OracleMonitoringService.getNetworkHealth(providers);
      setNetworkHealth(health);

      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update metrics');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [providers]);

  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 10000);
    return () => clearInterval(interval);
  }, [updateMetrics]);

  const resolveAlert = useCallback((alertId: string) => {
    try {
      OracleMonitoringService.resolveAlert(alertId);
      updateMetrics();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to resolve alert');
      setError(error);
    }
  }, [updateMetrics]);

  const generateReport = useCallback(() => {
    try {
      return OracleMonitoringService.generateReport(providers);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate report');
      setError(error);
      throw error;
    }
  }, [providers]);

  return {
    metrics,
    alerts,
    networkHealth,
    loading,
    error,
    recordUpdate,
    updateMetrics,
    resolveAlert,
    generateReport,
  };
}
