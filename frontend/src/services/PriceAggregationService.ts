import { OraclePrice, AggregatedPrice } from '@/types/oracle';

export class PriceAggregationService {
  static calculateMedianPrice(prices: OraclePrice[]): number {
    if (prices.length === 0) return 0;
    const sorted = [...prices]
      .map((p) => p.value)
      .sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  static calculateWeightedPrice(prices: OraclePrice[]): number {
    if (prices.length === 0) return 0;
    const totalConfidence = prices.reduce((sum, p) => sum + p.confidence, 0);
    if (totalConfidence === 0) return this.calculateMedianPrice(prices);
    return prices.reduce((sum, p) => sum + p.value * p.confidence, 0) / totalConfidence;
  }

  static calculateTrimmedPrice(prices: OraclePrice[], percentage: number = 10): number {
    if (prices.length === 0) return 0;
    const sorted = [...prices].sort((a, b) => a.value - b.value);
    const trimCount = Math.floor((sorted.length * percentage) / 100 / 2);
    const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
    return this.calculateMedianPrice(trimmed);
  }

  static validatePriceMovement(
    currentPrice: number,
    previousPrice: number,
    tolerance: number = 0.1
  ): boolean {
    if (previousPrice === 0) return true;
    const movement = Math.abs((currentPrice - previousPrice) / previousPrice);
    return movement <= tolerance;
  }

  static detectPriceSpike(
    prices: OraclePrice[],
    threshold: number = 3
  ): { hasspike: boolean; outlierIndices: number[] } {
    if (prices.length < 2) return { hasspike: false, outlierIndices: [] };

    const values = prices.map((p) => p.value);
    const median = this.calculateMedianPrice(prices);
    const deviations = values.map((v) => Math.abs(v - median));
    const avgDeviation = deviations.reduce((a, b) => a + b) / deviations.length;

    const outlierIndices = deviations
      .map((dev, i) => (dev > avgDeviation * threshold ? i : -1))
      .filter((i) => i !== -1);

    return {
      hasspike: outlierIndices.length > 0,
      outlierIndices,
    };
  }
}

export class ConsensusValidationService {
  static validateConsensusPrice(aggregated: AggregatedPrice, confidence: number = 0.65): boolean {
    return aggregated.confidence >= confidence && aggregated.consensusReached;
  }

  static calculateConsensusPercentage(agreeingCount: number, totalCount: number): number {
    if (totalCount === 0) return 0;
    return agreeingCount / totalCount;
  }

  static isStrongConsensus(percentage: number): boolean {
    return percentage >= 0.75;
  }

  static isModerateConsensus(percentage: number): boolean {
    return percentage >= 0.5;
  }

  static isWeakConsensus(percentage: number): boolean {
    return percentage > 0;
  }
}

export class PriceHistoryService {
  static calculatePriceChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  static calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(this.calculatePriceChange(prices[i], prices[i - 1]));
    }
    const mean = changes.reduce((a, b) => a + b) / changes.length;
    const variance = changes.reduce((a, b) => a + Math.pow(b - mean, 2)) / changes.length;
    return Math.sqrt(variance);
  }

  static calculateMovingAverage(prices: number[], period: number): number[] {
    if (prices.length < period) return prices;
    const moving = [];
    for (let i = period - 1; i < prices.length; i++) {
      const avg = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period;
      moving.push(avg);
    }
    return moving;
  }

  static identifyTrend(prices: number[]): 'up' | 'down' | 'stable' {
    if (prices.length < 2) return 'stable';
    const first = prices[0];
    const last = prices[prices.length - 1];
    const change = ((last - first) / first) * 100;

    if (change > 1) return 'up';
    if (change < -1) return 'down';
    return 'stable';
  }

  static calculateHighLow(prices: number[]): { high: number; low: number } {
    if (prices.length === 0) return { high: 0, low: 0 };
    return {
      high: Math.max(...prices),
      low: Math.min(...prices),
    };
  }
}

export class OracleResilience {
  static calculateNetworkResilience(
    activeProviders: number,
    totalProviders: number
  ): number {
    if (totalProviders === 0) return 0;
    const redundancy = activeProviders / totalProviders;
    return Math.min(redundancy * 100, 100);
  }

  static canOperateWithoutProvider(activeCount: number, requiredCount: number): boolean {
    return activeCount > requiredCount;
  }

  static estimateFallbackTime(maxAge: number): string {
    const minutes = Math.floor(maxAge / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day(s)`;
    if (hours > 0) return `${hours} hour(s)`;
    return `${minutes} minute(s)`;
  }

  static calculateProviderFailureImpact(
    removedProviderCount: number,
    totalProviderCount: number
  ): number {
    if (totalProviderCount === 0) return 100;
    return (removedProviderCount / totalProviderCount) * 100;
  }
}
