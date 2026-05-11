import { OraclePrice } from '@/types/oracle';

export interface AggregationResult {
  value: number;
  confidence: number;
  method: string;
  metadata: Record<string, unknown>;
}

export class PriceAggregationAlgorithms {
  static median(prices: OraclePrice[]): AggregationResult {
    if (prices.length === 0) {
      return { value: 0, confidence: 0, method: 'median', metadata: {} };
    }

    const sorted = [...prices].sort((a, b) => a.value - b.value);
    const mid = Math.floor(sorted.length / 2);
    const value = sorted.length % 2 === 0
      ? (sorted[mid - 1].value + sorted[mid].value) / 2
      : sorted[mid].value;

    const avgConfidence = prices.reduce((sum, p) => sum + p.confidence, 0) / prices.length;

    return {
      value,
      confidence: avgConfidence,
      method: 'median',
      metadata: {
        priceCount: prices.length,
        min: sorted[0].value,
        max: sorted[sorted.length - 1].value,
      },
    };
  }

  static weightedAverage(prices: OraclePrice[]): AggregationResult {
    if (prices.length === 0) {
      return { value: 0, confidence: 0, method: 'weighted_average', metadata: {} };
    }

    const totalWeight = prices.reduce((sum, p) => sum + p.confidence, 0);
    if (totalWeight === 0) {
      return this.median(prices);
    }

    const value = prices.reduce((sum, p) => sum + p.value * p.confidence, 0) / totalWeight;
    const avgConfidence = totalWeight / prices.length;

    return {
      value,
      confidence: avgConfidence,
      method: 'weighted_average',
      metadata: {
        priceCount: prices.length,
        totalWeight,
      },
    };
  }

  static trimmedMean(prices: OraclePrice[], trimPercentage: number = 10): AggregationResult {
    if (prices.length === 0) {
      return { value: 0, confidence: 0, method: 'trimmed_mean', metadata: {} };
    }

    const sorted = [...prices].sort((a, b) => a.value - b.value);
    const trimCount = Math.floor((sorted.length * trimPercentage) / 100 / 2);
    const trimmed = sorted.slice(trimCount, sorted.length - trimCount);

    if (trimmed.length === 0) {
      return this.median(prices);
    }

    const value = trimmed.reduce((sum, p) => sum + p.value, 0) / trimmed.length;
    const avgConfidence = trimmed.reduce((sum, p) => sum + p.confidence, 0) / trimmed.length;

    return {
      value,
      confidence: avgConfidence,
      method: 'trimmed_mean',
      metadata: {
        originalCount: prices.length,
        trimmedCount: trimmed.length,
        trimPercentage,
      },
    };
  }

  static volumeWeighted(
    prices: OraclePrice[],
    volumes: number[]
  ): AggregationResult {
    if (prices.length === 0 || prices.length !== volumes.length) {
      return { value: 0, confidence: 0, method: 'volume_weighted', metadata: {} };
    }

    const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
    if (totalVolume === 0) {
      return this.median(prices);
    }

    const value = prices.reduce((sum, p, i) => sum + p.value * volumes[i], 0) / totalVolume;
    const avgConfidence = prices.reduce((sum, p) => sum + p.confidence, 0) / prices.length;

    return {
      value,
      confidence: avgConfidence,
      method: 'volume_weighted',
      metadata: {
        priceCount: prices.length,
        totalVolume,
      },
    };
  }

  static exponentialMovingAverage(
    prices: OraclePrice[],
    alpha: number = 0.3
  ): AggregationResult {
    if (prices.length === 0) {
      return { value: 0, confidence: 0, method: 'ema', metadata: {} };
    }

    const sorted = [...prices].sort((a, b) => a.timestamp - b.timestamp);
    let ema = sorted[0].value;

    for (let i = 1; i < sorted.length; i++) {
      ema = alpha * sorted[i].value + (1 - alpha) * ema;
    }

    const avgConfidence = prices.reduce((sum, p) => sum + p.confidence, 0) / prices.length;

    return {
      value: ema,
      confidence: avgConfidence,
      method: 'ema',
      metadata: {
        priceCount: prices.length,
        alpha,
      },
    };
  }

  static outlierResistant(prices: OraclePrice[], threshold: number = 2.5): AggregationResult {
    if (prices.length === 0) {
      return { value: 0, confidence: 0, method: 'outlier_resistant', metadata: {} };
    }

    const values = prices.map((p) => p.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const filtered = prices.filter((p) => {
      const zScore = Math.abs((p.value - mean) / stdDev);
      return zScore <= threshold;
    });

    if (filtered.length === 0) {
      return this.median(prices);
    }

    const value = filtered.reduce((sum, p) => sum + p.value, 0) / filtered.length;
    const avgConfidence = filtered.reduce((sum, p) => sum + p.confidence, 0) / filtered.length;

    return {
      value,
      confidence: avgConfidence,
      method: 'outlier_resistant',
      metadata: {
        originalCount: prices.length,
        filteredCount: filtered.length,
        outliersRemoved: prices.length - filtered.length,
      },
    };
  }

  static timeWeighted(prices: OraclePrice[], decayFactor: number = 0.9): AggregationResult {
    if (prices.length === 0) {
      return { value: 0, confidence: 0, method: 'time_weighted', metadata: {} };
    }

    const sorted = [...prices].sort((a, b) => b.timestamp - a.timestamp);
    const now = Date.now();

    let totalWeight = 0;
    let weightedSum = 0;

    sorted.forEach((price) => {
      const age = (now - price.timestamp) / 60000;
      const weight = Math.pow(decayFactor, age);
      totalWeight += weight;
      weightedSum += price.value * weight;
    });

    const value = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const avgConfidence = prices.reduce((sum, p) => sum + p.confidence, 0) / prices.length;

    return {
      value,
      confidence: avgConfidence,
      method: 'time_weighted',
      metadata: {
        priceCount: prices.length,
        decayFactor,
      },
    };
  }

  static adaptive(prices: OraclePrice[]): AggregationResult {
    if (prices.length === 0) {
      return { value: 0, confidence: 0, method: 'adaptive', metadata: {} };
    }

    const values = prices.map((p) => p.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean !== 0 ? stdDev / mean : 0;

    let result: AggregationResult;

    if (cv < 0.05) {
      result = this.weightedAverage(prices);
      result.metadata.reason = 'Low variance, using weighted average';
    } else if (cv > 0.15) {
      result = this.outlierResistant(prices);
      result.metadata.reason = 'High variance, using outlier resistant';
    } else {
      result = this.median(prices);
      result.metadata.reason = 'Moderate variance, using median';
    }

    result.method = 'adaptive';
    result.metadata.coefficientOfVariation = cv;

    return result;
  }

  static consensus(prices: OraclePrice[], tolerance: number = 0.05): AggregationResult {
    if (prices.length === 0) {
      return { value: 0, confidence: 0, method: 'consensus', metadata: {} };
    }

    const medianResult = this.median(prices);
    const medianValue = medianResult.value;

    const agreeing = prices.filter((p) => {
      const deviation = Math.abs((p.value - medianValue) / medianValue);
      return deviation <= tolerance;
    });

    if (agreeing.length === 0) {
      return { ...medianResult, method: 'consensus', metadata: { consensusReached: false } };
    }

    const value = agreeing.reduce((sum, p) => sum + p.value, 0) / agreeing.length;
    const avgConfidence = agreeing.reduce((sum, p) => sum + p.confidence, 0) / agreeing.length;
    const consensusPercentage = agreeing.length / prices.length;

    return {
      value,
      confidence: avgConfidence * consensusPercentage,
      method: 'consensus',
      metadata: {
        consensusReached: consensusPercentage >= 0.66,
        consensusPercentage,
        agreeingCount: agreeing.length,
        totalCount: prices.length,
      },
    };
  }

  static selectBestMethod(prices: OraclePrice[]): AggregationResult {
    if (prices.length === 0) {
      return { value: 0, confidence: 0, method: 'none', metadata: {} };
    }

    if (prices.length === 1) {
      return {
        value: prices[0].value,
        confidence: prices[0].confidence,
        method: 'single',
        metadata: {},
      };
    }

    const values = prices.map((p) => p.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean !== 0 ? stdDev / mean : 0;

    const hasOutliers = prices.some((p) => {
      const zScore = Math.abs((p.value - mean) / stdDev);
      return zScore > 2.5;
    });

    const confidenceVariance = prices.reduce((sum, p) => {
      const avgConf = prices.reduce((s, pr) => s + pr.confidence, 0) / prices.length;
      return sum + Math.pow(p.confidence - avgConf, 2);
    }, 0) / prices.length;

    if (hasOutliers) {
      return this.outlierResistant(prices);
    }

    if (confidenceVariance > 0.1) {
      return this.weightedAverage(prices);
    }

    if (cv < 0.03) {
      return this.weightedAverage(prices);
    }

    return this.median(prices);
  }
}
