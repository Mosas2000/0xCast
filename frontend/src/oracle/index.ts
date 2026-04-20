export * from '@/types/oracle';

export { OracleNetworkService } from '@/services/OracleNetworkService';
export { ConsensusMechanismService } from '@/services/ConsensusMechanismService';
export { FallbackResolutionService } from '@/services/FallbackResolutionService';
export { OracleMonitoringService } from '@/services/OracleMonitoringService';

export {
  useOracleNetwork,
  useOraclePriceAggregation,
  useConsensus,
  useFallbackResolution,
  useOracleMonitoring,
} from '@/hooks/useOracleNetwork';

export {
  formatPrice,
  formatPriceWithCurrency,
  calculatePriceDifference,
  calculatePriceRange,
  getProviderStatus,
  getConsensusColor,
  getConsensusLabel,
  calculateConfidenceScore,
  formatConfidencePercentage,
  isRecentPrice,
  formatTimestamp,
  formatRelativeTime,
  getHealthColor,
  getUptimeColor,
  formatLatency,
  calculateAverageLatency,
  formatPercentage,
  calculateWeightedAverage,
  calculateMedian,
  calculateStandardDeviation,
  isOutlier,
  filterOutliers,
  sortPricesByValue,
  sortProvidersByHealth,
  groupPricesBySource,
  validatePriceData,
  validateAggregation,
} from '@/utils/oracleHelpers';

export {
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
} from '@/utils/oracleConstants';
