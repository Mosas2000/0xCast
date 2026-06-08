import {
  OraclePrice,
  AggregatedPrice,
  OracleProvider,
  ConsensusResult,
} from '@/types/oracle';

export function formatPrice(price: number, decimals: number = 2): string {
  return price.toFixed(decimals);
}

export function formatPriceWithCurrency(price: number, currency: string = 'USD'): string {
  return `${currency} ${price.toFixed(2)}`;
}

export function calculatePriceDifference(price1: number, price2: number): number {
  if (price2 === 0) return 0;
  return ((price1 - price2) / price2) * 100;
}

export function calculatePriceRange(prices: OraclePrice[]): {
  min: number;
  max: number;
  range: number;
  rangePercentage: number;
} {
  if (prices.length === 0) {
    return { min: 0, max: 0, range: 0, rangePercentage: 0 };
  }

  const values = prices.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = (min + max) / 2;

  return {
    min,
    max,
    range: max - min,
    rangePercentage: avg > 0 ? ((max - min) / avg) * 100 : 0,
  };
}

export function getProviderStatus(provider: OracleProvider): 'healthy' | 'degraded' | 'offline' {
  if (!provider.enabled) return 'offline';
  if (provider.healthScore >= 80) return 'healthy';
  if (provider.healthScore >= 50) return 'degraded';
  return 'offline';
}

export function getConsensusColor(consensus: ConsensusResult): string {
  switch (consensus.consensusLevel) {
    case 'strong':
      return '#10b981';
    case 'moderate':
      return '#f59e0b';
    case 'weak':
      return '#f97316';
    case 'none':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

export function getConsensusLabel(consensus: ConsensusResult): string {
  switch (consensus.consensusLevel) {
    case 'strong':
      return 'Strong Consensus';
    case 'moderate':
      return 'Moderate Consensus';
    case 'weak':
      return 'Weak Consensus';
    case 'none':
      return 'No Consensus';
    default:
      return 'Unknown';
  }
}

export function calculateConfidenceScore(aggregated: AggregatedPrice): number {
  const baseConfidence = aggregated.confidence;
  const sourceBonus = Math.min(aggregated.sources.length / 5, 0.2);
  return Math.min(baseConfidence + sourceBonus, 1);
}

export function formatConfidencePercentage(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`;
}

export function isRecentPrice(timestamp: number, maxAge: number = 3600000): boolean {
  return Date.now() - timestamp <= maxAge;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${Math.max(0, seconds)}s ago`;
}

export function getHealthColor(healthScore: number): string {
  if (healthScore >= 80) return '#10b981';
  if (healthScore >= 60) return '#f59e0b';
  if (healthScore >= 40) return '#f97316';
  return '#ef4444';
}

export function getUptimeColor(uptime: number): string {
  if (uptime >= 95) return '#10b981';
  if (uptime >= 90) return '#f59e0b';
  if (uptime >= 80) return '#f97316';
  return '#ef4444';
}

export function formatLatency(latency: number): string {
  if (latency < 1000) return `${latency.toFixed(0)}ms`;
  return `${(latency / 1000).toFixed(2)}s`;
}

export function calculateAverageLatency(latencies: number[]): number {
  if (latencies.length === 0) return 0;
  return latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function calculateWeightedAverage(
  values: number[],
  weights: number[]
): number {
  if (values.length === 0 || values.length !== weights.length) return 0;

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;

  const weighted = values.reduce((sum, v, i) => sum + v * weights[i], 0);
  return weighted / totalWeight;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function isOutlier(value: number, values: number[], threshold: number = 2): boolean {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const stdDev = calculateStandardDeviation(values);
  const zScore = Math.abs((value - mean) / stdDev);
  return zScore > threshold;
}

export function filterOutliers(values: number[], threshold: number = 2): number[] {
  return values.filter((v) => !isOutlier(v, values, threshold));
}

export function sortPricesByValue(prices: OraclePrice[]): OraclePrice[] {
  return [...prices].sort((a, b) => a.value - b.value);
}

export function sortProvidersByHealth(providers: OracleProvider[]): OracleProvider[] {
  return [...providers].sort((a, b) => b.healthScore - a.healthScore);
}

export function groupPricesBySource(prices: OraclePrice[]): Map<string, OraclePrice[]> {
  const grouped = new Map<string, OraclePrice[]>();
  prices.forEach((price) => {
    if (!grouped.has(price.source)) {
      grouped.set(price.source, []);
    }
    grouped.get(price.source)!.push(price);
  });
  return grouped;
}

export function validatePriceData(price: OraclePrice): boolean {
  return (
    typeof price.value === 'number' &&
    typeof price.timestamp === 'number' &&
    typeof price.source === 'string' &&
    typeof price.confidence === 'number' &&
    price.confidence >= 0 &&
    price.confidence <= 1 &&
    price.value >= 0
  );
}

export function validateAggregation(aggregated: AggregatedPrice): boolean {
  return (
    typeof aggregated.value === 'number' &&
    typeof aggregated.timestamp === 'number' &&
    Array.isArray(aggregated.sources) &&
    typeof aggregated.confidence === 'number' &&
    typeof aggregated.consensusReached === 'boolean' &&
    aggregated.confidence >= 0 &&
    aggregated.confidence <= 1 &&
    aggregated.value >= 0
  );
}
