export const ORACLE_NETWORK_CONFIG = {
  CONSENSUS_THRESHOLD: 0.66,
  MINIMUM_ACTIVE_PROVIDERS: 2,
  AGGREGATION_METHOD: 'median' as const,
  UPDATE_INTERVAL: 60000,
  TIMEOUT: 5000,
  MAX_RETRIES: 3,
};

export const FALLBACK_STRATEGY_CONFIG = {
  ENABLED: true,
  TYPE: 'median_history' as const,
  MAX_AGE: 3600000,
  MINIMUM_CONFIDENCE: 0.5,
};

export const HEALTH_CHECK_CONFIG = {
  MIN_SUCCESS_RATE: 50,
  MAX_LATENCY_MULTIPLIER: 2,
  MIN_UPTIME: 70,
  MAX_ERROR_RATE: 30,
  CHECK_INTERVAL: 10000,
};

export const PRICE_VALIDATION_CONFIG = {
  MAX_DEVIATION: 0.05,
  MIN_CONFIDENCE: 0.5,
  MAX_AGE: 3600000,
  OUTLIER_THRESHOLD: 2,
};

export const ALERT_THRESHOLDS = {
  SUCCESS_RATE: 50,
  LATENCY: 5000,
  UPTIME: 70,
  ERROR_RATE: 30,
} as const;

export const ALERT_SEVERITY = {
  INFO: 'info' as const,
  WARNING: 'warning' as const,
  CRITICAL: 'critical' as const,
};

export const CONSENSUS_LEVELS = {
  STRONG: 'strong' as const,
  MODERATE: 'moderate' as const,
  WEAK: 'weak' as const,
  NONE: 'none' as const,
};

export const PROVIDER_STATUS = {
  HEALTHY: 'healthy' as const,
  DEGRADED: 'degraded' as const,
  OFFLINE: 'offline' as const,
};

export const FALLBACK_TYPES = {
  LAST_KNOWN: 'last_known' as const,
  MEDIAN_HISTORY: 'median_history' as const,
  WEIGHTED_HISTORY: 'weighted_history' as const,
  EMERGENCY: 'emergency' as const,
};

export const AGGREGATION_METHODS = {
  MEDIAN: 'median' as const,
  WEIGHTED_AVERAGE: 'weighted_average' as const,
};

export const DEFAULT_ORACLE_PROVIDERS = {
  PROVIDER_A: {
    id: 'provider-a',
    name: 'Oracle Provider A',
    url: 'https://oracle-a.example.com/api',
    healthScore: 100,
    enabled: true,
    updateFrequency: 60000,
    timeout: 5000,
    weight: 1,
    lastUpdate: 0,
    errorCount: 0,
    successCount: 0,
  },
  PROVIDER_B: {
    id: 'provider-b',
    name: 'Oracle Provider B',
    url: 'https://oracle-b.example.com/api',
    healthScore: 100,
    enabled: true,
    updateFrequency: 60000,
    timeout: 5000,
    weight: 1,
    lastUpdate: 0,
    errorCount: 0,
    successCount: 0,
  },
  PROVIDER_C: {
    id: 'provider-c',
    name: 'Oracle Provider C',
    url: 'https://oracle-c.example.com/api',
    healthScore: 100,
    enabled: true,
    updateFrequency: 60000,
    timeout: 5000,
    weight: 1,
    lastUpdate: 0,
    errorCount: 0,
    successCount: 0,
  },
};

export const MONITORING_CONFIG = {
  ALERT_CHECK_INTERVAL: 10000,
  METRICS_RETENTION_TIME: 86400000,
  ALERT_RETENTION_TIME: 604800000,
  MAX_ALERTS: 1000,
  MAX_METRICS: 10000,
};

export const NETWORK_HEALTH_THRESHOLDS = {
  EXCELLENT: 0.9,
  GOOD: 0.75,
  FAIR: 0.6,
  POOR: 0.4,
  CRITICAL: 0,
};

export const CONFIDENCE_LEVELS = {
  VERY_HIGH: 0.95,
  HIGH: 0.85,
  MODERATE: 0.7,
  LOW: 0.5,
  VERY_LOW: 0.3,
};

export const UPTIME_THRESHOLDS = {
  EXCELLENT: 99,
  GOOD: 95,
  FAIR: 90,
  POOR: 80,
  CRITICAL: 0,
};

export const LATENCY_THRESHOLDS = {
  EXCELLENT: 100,
  GOOD: 500,
  FAIR: 1000,
  POOR: 2000,
  CRITICAL: 5000,
};

export default {
  ORACLE_NETWORK_CONFIG,
  FALLBACK_STRATEGY_CONFIG,
  HEALTH_CHECK_CONFIG,
  PRICE_VALIDATION_CONFIG,
  ALERT_THRESHOLDS,
  ALERT_SEVERITY,
  CONSENSUS_LEVELS,
  PROVIDER_STATUS,
  FALLBACK_TYPES,
  AGGREGATION_METHODS,
  DEFAULT_ORACLE_PROVIDERS,
  MONITORING_CONFIG,
  NETWORK_HEALTH_THRESHOLDS,
  CONFIDENCE_LEVELS,
  UPTIME_THRESHOLDS,
  LATENCY_THRESHOLDS,
};
