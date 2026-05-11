import { OraclePrice, ConsensusResult, AggregatedPrice } from '@/types/oracle';

export interface ConsensusValidationResult {
  isValid: boolean;
  confidence: number;
  reason: string;
  outliers: string[];
  recommendation: 'accept' | 'reject' | 'retry';
}

export interface PriceDeviationAnalysis {
  mean: number;
  median: number;
  standardDeviation: number;
  variance: number;
  coefficientOfVariation: number;
  outliers: OraclePrice[];
}

export class OracleConsensusValidator {
  private readonly defaultTolerance = 0.05;
  private readonly outlierThreshold = 2.5;
  private readonly minProvidersForConsensus = 2;

  validateConsensus(
    prices: OraclePrice[],
    threshold: number = 0.66
  ): ConsensusValidationResult {
    if (prices.length < this.minProvidersForConsensus) {
      return {
        isValid: false,
        confidence: 0,
        reason: 'Insufficient providers for consensus',
        outliers: [],
        recommendation: 'retry',
      };
    }

    const analysis = this.analyzePriceDeviation(prices);
    const outlierSources = analysis.outliers.map((p) => p.source);

    if (analysis.coefficientOfVariation > 0.15) {
      return {
        isValid: false,
        confidence: 0,
        reason: 'High price variance detected',
        outliers: outlierSources,
        recommendation: 'retry',
      };
    }

    const validPrices = prices.filter((p) => !outlierSources.includes(p.source));
    const consensusPercentage = validPrices.length / prices.length;

    if (consensusPercentage < threshold) {
      return {
        isValid: false,
        confidence: consensusPercentage,
        reason: 'Consensus threshold not met',
        outliers: outlierSources,
        recommendation: 'reject',
      };
    }

    return {
      isValid: true,
      confidence: consensusPercentage,
      reason: 'Consensus achieved',
      outliers: outlierSources,
      recommendation: 'accept',
    };
  }

  analyzePriceDeviation(prices: OraclePrice[]): PriceDeviationAnalysis {
    if (prices.length === 0) {
      return {
        mean: 0,
        median: 0,
        standardDeviation: 0,
        variance: 0,
        coefficientOfVariation: 0,
        outliers: [],
      };
    }

    const values = prices.map((p) => p.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = mean !== 0 ? standardDeviation / mean : 0;

    const outliers = prices.filter((p) => {
      const zScore = Math.abs((p.value - mean) / standardDeviation);
      return zScore > this.outlierThreshold;
    });

    return {
      mean,
      median,
      standardDeviation,
      variance,
      coefficientOfVariation,
      outliers,
    };
  }

  detectPriceManipulation(prices: OraclePrice[]): {
    detected: boolean;
    suspiciousSources: string[];
    reason: string;
  } {
    if (prices.length < 3) {
      return { detected: false, suspiciousSources: [], reason: 'Insufficient data' };
    }

    const analysis = this.analyzePriceDeviation(prices);
    const median = analysis.median;

    const extremePrices = prices.filter((p) => {
      const deviation = Math.abs((p.value - median) / median);
      return deviation > 0.2;
    });

    if (extremePrices.length > 0 && extremePrices.length < prices.length / 2) {
      return {
        detected: true,
        suspiciousSources: extremePrices.map((p) => p.source),
        reason: 'Extreme price deviation detected',
      };
    }

    const lowConfidencePrices = prices.filter((p) => p.confidence < 0.5);
    if (lowConfidencePrices.length > prices.length / 2) {
      return {
        detected: true,
        suspiciousSources: lowConfidencePrices.map((p) => p.source),
        reason: 'Multiple low confidence prices',
      };
    }

    return { detected: false, suspiciousSources: [], reason: 'No manipulation detected' };
  }

  validatePriceMovement(
    currentPrice: number,
    previousPrice: number,
    maxMovement: number = 0.1
  ): { valid: boolean; movement: number; reason: string } {
    if (previousPrice === 0) {
      return { valid: true, movement: 0, reason: 'No previous price for comparison' };
    }

    const movement = Math.abs((currentPrice - previousPrice) / previousPrice);

    if (movement > maxMovement) {
      return {
        valid: false,
        movement,
        reason: `Price movement ${(movement * 100).toFixed(2)}% exceeds threshold`,
      };
    }

    return { valid: true, movement, reason: 'Price movement within acceptable range' };
  }

  calculateConsensusStrength(consensus: ConsensusResult): number {
    const levelWeights = {
      strong: 1.0,
      moderate: 0.7,
      weak: 0.4,
      none: 0,
    };

    const levelWeight = levelWeights[consensus.consensusLevel];
    return consensus.confidence * levelWeight * 100;
  }

  shouldUseFallback(
    prices: OraclePrice[],
    minProviders: number = 2,
    minConfidence: number = 0.5
  ): boolean {
    if (prices.length < minProviders) return true;

    const avgConfidence = prices.reduce((sum, p) => sum + p.confidence, 0) / prices.length;
    if (avgConfidence < minConfidence) return true;

    const validation = this.validateConsensus(prices);
    return !validation.isValid;
  }

  filterReliablePrices(
    prices: OraclePrice[],
    minConfidence: number = 0.6
  ): OraclePrice[] {
    const analysis = this.analyzePriceDeviation(prices);
    const outlierSources = new Set(analysis.outliers.map((p) => p.source));

    return prices.filter(
      (p) => p.confidence >= minConfidence && !outlierSources.has(p.source)
    );
  }

  compareAggregationMethods(prices: OraclePrice[]): {
    median: number;
    mean: number;
    weightedMean: number;
    trimmedMean: number;
    recommendation: string;
  } {
    const values = prices.map((p) => p.value);
    const sorted = [...values].sort((a, b) => a - b);

    const median = sorted.length % 2 === 0
      ? (sorted[Math.floor(sorted.length / 2) - 1] + sorted[Math.floor(sorted.length / 2)]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    const totalWeight = prices.reduce((sum, p) => sum + p.confidence, 0);
    const weightedMean = totalWeight > 0
      ? prices.reduce((sum, p) => sum + p.value * p.confidence, 0) / totalWeight
      : mean;

    const trimCount = Math.floor(sorted.length * 0.1);
    const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
    const trimmedMean = trimmed.length > 0
      ? trimmed.reduce((a, b) => a + b, 0) / trimmed.length
      : mean;

    const analysis = this.analyzePriceDeviation(prices);
    let recommendation = 'median';

    if (analysis.coefficientOfVariation < 0.05) {
      recommendation = 'mean';
    } else if (analysis.outliers.length > 0) {
      recommendation = 'trimmedMean';
    } else if (prices.some((p) => p.confidence < 0.7)) {
      recommendation = 'weightedMean';
    }

    return {
      median,
      mean,
      weightedMean,
      trimmedMean,
      recommendation,
    };
  }

  validateAggregatedPrice(aggregated: AggregatedPrice): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (aggregated.value <= 0) {
      issues.push('Invalid price value');
    }

    if (aggregated.confidence < 0.5) {
      issues.push('Low confidence level');
    }

    if (!aggregated.consensusReached && aggregated.sources.length >= this.minProvidersForConsensus) {
      issues.push('Consensus not reached with sufficient providers');
    }

    if (aggregated.sources.length < this.minProvidersForConsensus) {
      issues.push('Insufficient price sources');
    }

    const now = Date.now();
    const age = now - aggregated.timestamp;
    if (age > 300000) {
      issues.push('Price data is stale');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
