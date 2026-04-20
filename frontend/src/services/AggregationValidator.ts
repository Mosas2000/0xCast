import { OraclePrice, ProviderHealth } from '@/types/oracle';

export class AggregationValidator {
  static validatePriceArray(prices: OraclePrice[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(prices)) {
      errors.push('Price array is not an array');
      return { isValid: false, errors, warnings };
    }

    if (prices.length === 0) {
      errors.push('Price array is empty');
    }

    if (prices.length < 3) {
      warnings.push('Less than 3 prices provided - consensus may be unreliable');
    }

    prices.forEach((price, index) => {
      if (typeof price.value !== 'number' || price.value < 0) {
        errors.push(`Price at index ${index} has invalid value`);
      }

      if (typeof price.timestamp !== 'number' || price.timestamp <= 0) {
        errors.push(`Price at index ${index} has invalid timestamp`);
      }

      if (typeof price.confidence !== 'number' || price.confidence < 0 || price.confidence > 1) {
        errors.push(`Price at index ${index} has invalid confidence`);
      }

      const age = Date.now() - price.timestamp;
      if (age > 3600000) {
        warnings.push(`Price at index ${index} is older than 1 hour`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateConsensus(
    prices: OraclePrice[],
    threshold: number = 0.66
  ): {
    isConsensus: boolean;
    agreementPercentage: number;
    agreedPrices: number;
  } {
    if (prices.length === 0) {
      return {
        isConsensus: false,
        agreementPercentage: 0,
        agreedPrices: 0,
      };
    }

    const median = this.calculateMedian(prices.map((p) => p.value));
    const tolerance = median * 0.03;

    const agreedPrices = prices.filter((p) => Math.abs(p.value - median) <= tolerance).length;
    const agreementPercentage = agreedPrices / prices.length;

    return {
      isConsensus: agreementPercentage >= threshold,
      agreementPercentage,
      agreedPrices,
    };
  }

  static detectOutliers(
    prices: OraclePrice[],
    method: 'iqr' | 'zscore' | 'mad' = 'iqr'
  ): {
    outliers: OraclePrice[];
    cleaned: OraclePrice[];
  } {
    const values = prices.map((p) => p.value);

    let outlierIndices: Set<number>;

    switch (method) {
      case 'zscore':
        outlierIndices = this.detectOutliersZScore(values);
        break;
      case 'mad':
        outlierIndices = this.detectOutliersMad(values);
        break;
      case 'iqr':
      default:
        outlierIndices = this.detectOutliersIQR(values);
        break;
    }

    return {
      outliers: prices.filter((_, i) => outlierIndices.has(i)),
      cleaned: prices.filter((_, i) => !outlierIndices.has(i)),
    };
  }

  private static detectOutliersIQR(values: number[]): Set<number> {
    if (values.length < 4) return new Set();

    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;

    const outliers = new Set<number>();
    values.forEach((value, i) => {
      if (value < q1 - 1.5 * iqr || value > q3 + 1.5 * iqr) {
        outliers.add(i);
      }
    });

    return outliers;
  }

  private static detectOutliersZScore(values: number[]): Set<number> {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const outliers = new Set<number>();
    values.forEach((value, i) => {
      const zScore = Math.abs((value - mean) / stdDev);
      if (zScore > 3) {
        outliers.add(i);
      }
    });

    return outliers;
  }

  private static detectOutliersMad(values: number[]): Set<number> {
    const median = this.calculateMedian(values);
    const deviations = values.map((v) => Math.abs(v - median));
    const mad = this.calculateMedian(deviations);

    const outliers = new Set<number>();
    const threshold = mad * 2.5;

    values.forEach((value, i) => {
      if (Math.abs(value - median) > threshold) {
        outliers.add(i);
      }
    });

    return outliers;
  }

  private static calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }

    return sorted[mid];
  }

  static validateVolatility(
    prices: OraclePrice[],
    maxDeviation: number = 0.1
  ): {
    isValid: boolean;
    volatility: number;
    recommendation: string;
  } {
    if (prices.length < 2) {
      return {
        isValid: true,
        volatility: 0,
        recommendation: 'Insufficient data for volatility check',
      };
    }

    const values = prices.map((p) => p.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const volatility = stdDev / mean;

    return {
      isValid: volatility <= maxDeviation,
      volatility,
      recommendation:
        volatility > maxDeviation
          ? 'High volatility detected - consider increasing tolerance or using fallback'
          : 'Volatility within acceptable range',
    };
  }

  static validateProviderHealth(health: ProviderHealth): {
    isHealthy: boolean;
    issues: string[];
    confidence: number;
  } {
    const issues: string[] = [];

    if (health.successRate < 0.7) {
      issues.push('Low success rate');
    }

    if (health.uptime < 0.95) {
      issues.push('Low uptime');
    }

    if (health.averageLatency > 5000) {
      issues.push('High latency');
    }

    if (health.errorCount > 100) {
      issues.push('High error count');
    }

    const confidence =
      health.successRate * 0.4 +
      health.uptime * 0.3 +
      Math.min(health.responseCount / 1000, 1) * 0.3;

    return {
      isHealthy: issues.length === 0,
      issues,
      confidence: Math.max(0, Math.min(1, confidence)),
    };
  }

  static validateDataFreshness(
    prices: OraclePrice[],
    maxAge: number = 300000
  ): {
    isFresh: boolean;
    staleCount: number;
    freshness: number;
  } {
    const now = Date.now();
    const staleCount = prices.filter((p) => now - p.timestamp > maxAge).length;
    const freshness = 1 - staleCount / Math.max(prices.length, 1);

    return {
      isFresh: staleCount === 0,
      staleCount,
      freshness,
    };
  }
}
