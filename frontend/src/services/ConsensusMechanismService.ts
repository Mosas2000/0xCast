import {
  OraclePrice,
  OracleConsensus,
  ConsensusResult,
  OracleProvider,
} from '@/types/oracle';

export class ConsensusMechanismService {
  private static readonly STRONG_CONSENSUS_THRESHOLD = 0.75;
  private static readonly MODERATE_CONSENSUS_THRESHOLD = 0.5;
  private static readonly PRICE_DEVIATION_TOLERANCE = 0.03;
  private static readonly MIN_PROVIDERS_FOR_CONSENSUS = 2;

  static calculateConsensusPrice(prices: OraclePrice[]): OracleConsensus {
    const timestamp = Date.now();

    if (prices.length < this.MIN_PROVIDERS_FOR_CONSENSUS) {
      return {
        priceValue: 0,
        totalSources: prices.length,
        agreeingSources: 0,
        consensusPercentage: 0,
        timestamp,
      };
    }

    const priceValue = this.calculateWeightedMedian(prices);
    const agreeingSources = this.countAgreingSources(prices, priceValue);
    const consensusPercentage = agreeingSources / prices.length;

    return {
      priceValue,
      totalSources: prices.length,
      agreeingSources,
      consensusPercentage,
      timestamp,
    };
  }

  static evaluateConsensus(consensus: OracleConsensus): ConsensusResult {
    const agreeingProviders: string[] = [];
    const dissagreeingProviders: string[] = [];
    let consensusLevel: 'strong' | 'moderate' | 'weak' | 'none' = 'none';

    if (consensus.consensusPercentage >= this.STRONG_CONSENSUS_THRESHOLD) {
      consensusLevel = 'strong';
    } else if (consensus.consensusPercentage >= this.MODERATE_CONSENSUS_THRESHOLD) {
      consensusLevel = 'moderate';
    } else if (consensus.agreeingSources > 0) {
      consensusLevel = 'weak';
    }

    return {
      price: consensus.priceValue,
      confidence: consensus.consensusPercentage,
      agreeingProviders,
      dissagreeingProviders,
      consensusLevel,
    };
  }

  static validatePrice(
    price: OraclePrice,
    referencePrices: OraclePrice[],
    tolerance: number = this.PRICE_DEVIATION_TOLERANCE
  ): boolean {
    if (referencePrices.length === 0) {
      return price.confidence >= 0.5;
    }

    const referencePrice = this.calculateWeightedMedian(referencePrices);
    const deviation = Math.abs(price.value - referencePrice) / referencePrice;

    return deviation <= tolerance && price.confidence >= 0.5;
  }

  static detectOutliers(prices: OraclePrice[]): {
    outliers: OraclePrice[];
    inliers: OraclePrice[];
  } {
    if (prices.length < 3) {
      return {
        outliers: [],
        inliers: prices,
      };
    }

    const median = this.calculateWeightedMedian(prices);
    const deviations = prices.map((p) => ({
      price: p,
      deviation: Math.abs(p.value - median),
    }));

    const avgDeviation = deviations.reduce((sum, d) => sum + d.deviation, 0) / deviations.length;
    const stdDev = Math.sqrt(
      deviations.reduce((sum, d) => sum + Math.pow(d.deviation - avgDeviation, 2), 0) /
        deviations.length
    );

    const outlierThreshold = median * 0.05 + stdDev * 1.5;

    return {
      outliers: deviations.filter((d) => d.deviation > outlierThreshold).map((d) => d.price),
      inliers: deviations.filter((d) => d.deviation <= outlierThreshold).map((d) => d.price),
    };
  }

  static calculateWeightedScore(
    prices: OraclePrice[],
    providers: Map<string, OracleProvider>
  ): number {
    if (prices.length === 0) return 0;

    let totalWeight = 0;
    let weightedScore = 0;

    for (const price of prices) {
      const provider = providers.get(price.source);
      if (!provider) continue;

      const weight = provider.weight * price.confidence;
      totalWeight += weight;
      weightedScore += weight * price.confidence;
    }

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  static calculateConsensusConfidence(consensus: OracleConsensus): number {
    const baseConfidence = consensus.consensusPercentage;
    const sourceQuality = Math.min(consensus.totalSources / 5, 1);
    const sourceBonus = sourceQuality * 0.2;

    return Math.min(baseConfidence + sourceBonus, 1.0);
  }

  static shouldAcceptConsensus(
    consensus: OracleConsensus,
    minConfidence: number = 0.65
  ): boolean {
    const requiredSources = Math.ceil(consensus.totalSources * 0.5);
    return consensus.agreeingSources >= requiredSources && this.calculateConsensusConfidence(consensus) >= minConfidence;
  }

  static calculateConsensusStability(
    currentConsensus: OracleConsensus,
    previousConsensus: OracleConsensus | null
  ): number {
    if (!previousConsensus) {
      return 1.0;
    }

    const priceDiff = Math.abs(currentConsensus.priceValue - previousConsensus.priceValue);
    const avgPrice = (currentConsensus.priceValue + previousConsensus.priceValue) / 2;
    const priceChange = avgPrice > 0 ? priceDiff / avgPrice : 0;

    const confidenceDiff = Math.abs(
      currentConsensus.consensusPercentage - previousConsensus.consensusPercentage
    );

    const stability = 1 - (priceChange * 0.5 + confidenceDiff * 0.5);
    return Math.max(0, Math.min(1, stability));
  }

  private static calculateWeightedMedian(prices: OraclePrice[]): number {
    if (prices.length === 0) return 0;

    const sorted = [...prices].sort((a, b) => a.value - b.value);
    const totalConfidence = sorted.reduce((sum, p) => sum + p.confidence, 0);

    let cumulativeConfidence = 0;
    const halfConfidence = totalConfidence / 2;

    for (const price of sorted) {
      cumulativeConfidence += price.confidence;
      if (cumulativeConfidence >= halfConfidence) {
        return price.value;
      }
    }

    return sorted[sorted.length - 1].value;
  }

  private static countAgreingSources(prices: OraclePrice[], referencePrice: number): number {
    return prices.filter((p) => {
      const deviation = Math.abs(p.value - referencePrice) / referencePrice;
      return deviation <= this.PRICE_DEVIATION_TOLERANCE;
    }).length;
  }
}
