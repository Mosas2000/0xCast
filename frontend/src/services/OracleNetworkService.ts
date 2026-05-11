import {
  OracleProvider,
  OraclePrice,
  AggregatedPrice,
  OracleConsensus,
  OracleNetworkState,
  OracleConfig,
  ConsensusResult,
  FallbackStrategy,
  PriceHistory,
} from '@/types/oracle';

export class OracleNetworkService {
  private static providers: Map<string, OracleProvider> = new Map();
  private static priceHistory: Map<string, PriceHistory[]> = new Map();
  private static config: OracleConfig = {
    consensusThreshold: 0.66,
    minimumActiveProviders: 2,
    aggregationMethod: 'median',
    updateInterval: 60000,
    fallbackStrategy: {
      enabled: true,
      type: 'last_known',
      maxAge: 3600000,
      minimumConfidence: 0.5,
    },
    timeout: 5000,
    maxRetries: 3,
  };

  static initializeProviders(providers: OracleProvider[]): void {
    providers.forEach((provider) => {
      this.providers.set(provider.id, {
        ...provider,
        healthScore: 100,
        errorCount: 0,
        successCount: 0,
        lastUpdate: Date.now(),
      });
      this.priceHistory.set(provider.id, []);
    });
  }

  static async fetchPricesFromAllProviders(marketId: string): Promise<OraclePrice[]> {
    const activeProviders = Array.from(this.providers.values()).filter(
      (p) => p.enabled && p.healthScore > 30
    );

    const pricePromises = activeProviders.map((provider) =>
      this.fetchPrice(provider.id, marketId)
    );

    const results = await Promise.allSettled(pricePromises);
    const prices: OraclePrice[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value !== null) {
        prices.push(result.value);
      }
    });

    return prices;
  }

  static async fetchPrice(providerId: string, marketId: string): Promise<OraclePrice | null> {
    const provider = this.providers.get(providerId);
    if (!provider || !provider.enabled) return null;

    try {
      const startTime = Date.now();
      const price = await this.callProviderAPI(provider, marketId);
      const latency = Date.now() - startTime;

      provider.successCount++;
      provider.lastUpdate = Date.now();
      this.updateProviderHealth(providerId, true, latency);

      return {
        value: price.value,
        timestamp: price.timestamp,
        source: providerId,
        confidence: this.calculateConfidence(provider),
      };
    } catch (error) {
      provider.errorCount++;
      provider.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.updateProviderHealth(providerId, false, 0);
      return null;
    }
  }

  static async aggregatePrices(
    marketId: string,
    prices: OraclePrice[]
  ): Promise<AggregatedPrice> {
    if (prices.length === 0) {
      return this.getFallbackPrice(marketId);
    }

    const consensus = this.calculateConsensus(prices);

    if (consensus.consensusLevel === 'none' && this.config.fallbackStrategy.enabled) {
      return this.getFallbackPrice(marketId);
    }

    const aggregated: AggregatedPrice = {
      value: this.aggregateValues(prices),
      timestamp: Math.max(...prices.map((p) => p.timestamp)),
      sources: prices,
      confidence: this.calculateAggregateConfidence(prices),
      consensusReached: consensus.consensusLevel !== 'none',
      method: this.config.aggregationMethod,
    };

    return aggregated;
  }

  static calculateConsensus(prices: OraclePrice[]): ConsensusResult {
    if (prices.length === 0) {
      return {
        price: 0,
        confidence: 0,
        agreeingProviders: [],
        dissagreeingProviders: [],
        consensusLevel: 'none',
      };
    }

    const priceValue = this.aggregateValues(prices);
    const tolerance = priceValue * 0.05;

    const agreeing = prices.filter((p) => Math.abs(p.value - priceValue) <= tolerance);
    const disagreeing = prices.filter((p) => Math.abs(p.value - priceValue) > tolerance);

    const consensusPercentage = (agreeing.length / prices.length);
    let consensusLevel: 'strong' | 'moderate' | 'weak' | 'none' = 'none';

    if (consensusPercentage >= this.config.consensusThreshold) {
      consensusLevel = 'strong';
    } else if (consensusPercentage >= 0.5) {
      consensusLevel = 'moderate';
    } else if (agreeing.length > 0) {
      consensusLevel = 'weak';
    }

    return {
      price: priceValue,
      confidence: consensusPercentage,
      agreeingProviders: agreeing.map((p) => p.source),
      dissagreeingProviders: disagreeing.map((p) => p.source),
      consensusLevel,
    };
  }

  static getNetworkState(): OracleNetworkState {
    const providers = Array.from(this.providers.values());
    const activeProviders = providers.filter((p) => p.enabled && p.healthScore > 50);
    const totalHealthScore = activeProviders.reduce((sum, p) => sum + p.healthScore, 0);
    const averageHealthScore = activeProviders.length > 0 ? totalHealthScore / activeProviders.length : 0;

    return {
      activeProviders: activeProviders.length,
      totalProviders: providers.length,
      averageHealthScore: Math.round(averageHealthScore),
      lastUpdate: Math.max(...providers.map((p) => p.lastUpdate || 0)),
      consensusStrength: this.calculateConsensusStrength(),
      fallbackActive: this.config.fallbackStrategy.enabled,
    };
  }

  static updateProviderConfig(config: Partial<OracleConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static addProvider(provider: OracleProvider): void {
    this.providers.set(provider.id, {
      ...provider,
      healthScore: 100,
      errorCount: 0,
      successCount: 0,
    });
    this.priceHistory.set(provider.id, []);
  }

  static removeProvider(providerId: string): void {
    this.providers.delete(providerId);
    this.priceHistory.delete(providerId);
  }

  static enableProvider(providerId: string): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.enabled = true;
    }
  }

  static disableProvider(providerId: string): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.enabled = false;
    }
  }

  static getProviderMetrics(providerId: string) {
    const provider = this.providers.get(providerId);
    if (!provider) return null;

    const total = provider.successCount + provider.errorCount;
    return {
      providerId,
      uptime: (provider.healthScore / 100) * 100,
      successRate: total > 0 ? (provider.successCount / total) * 100 : 0,
      errorRate: total > 0 ? (provider.errorCount / total) * 100 : 0,
      responseCount: provider.successCount,
      failureCount: provider.errorCount,
      lastUpdate: provider.lastUpdate,
    };
  }

  static getHealthyProviders(): OracleProvider[] {
    return Array.from(this.providers.values()).filter(
      (p) => p.enabled && p.healthScore > 50
    );
  }

  static selectBestProvider(): OracleProvider | null {
    const healthy = this.getHealthyProviders();
    if (healthy.length === 0) return null;

    return healthy.reduce((best, current) => {
      const bestScore = best.healthScore * (1 + best.priority / 100);
      const currentScore = current.healthScore * (1 + current.priority / 100);
      return currentScore > bestScore ? current : best;
    });
  }

  static rotateProviders(): void {
    const providers = Array.from(this.providers.values());
    providers.forEach((provider) => {
      if (provider.healthScore < 30 && provider.enabled) {
        provider.enabled = false;
        console.warn(`Provider ${provider.id} disabled due to low health score`);
      } else if (provider.healthScore > 70 && !provider.enabled) {
        provider.enabled = true;
        console.info(`Provider ${provider.id} re-enabled after health recovery`);
      }
    });
  }

  static getPriceHistory(providerId: string, limit: number = 100): PriceHistory[] {
    const history = this.priceHistory.get(providerId) || [];
    return history.slice(-limit);
  }

  static recordPrice(providerId: string, price: PriceHistory): void {
    const history = this.priceHistory.get(providerId) || [];
    history.push(price);
    if (history.length > 1000) {
      history.shift();
    }
    this.priceHistory.set(providerId, history);
  }

  private static aggregateValues(prices: OraclePrice[]): number {
    if (prices.length === 0) return 0;

    if (this.config.aggregationMethod === 'weighted_average') {
      const totalWeight = prices.reduce((sum, p) => sum + p.confidence, 0);
      if (totalWeight === 0) return this.getMedian(prices.map((p) => p.value));
      return prices.reduce((sum, p) => sum + p.value * p.confidence, 0) / totalWeight;
    }

    return this.getMedian(prices.map((p) => p.value));
  }

  private static getMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  private static calculateConfidence(provider: OracleProvider): number {
    const total = provider.successCount + provider.errorCount;
    if (total === 0) return provider.healthScore / 100;
    const successRate = provider.successCount / total;
    return (successRate + provider.healthScore / 100) / 2;
  }

  private static calculateAggregateConfidence(prices: OraclePrice[]): number {
    if (prices.length === 0) return 0;
    const average = prices.reduce((sum, p) => sum + p.confidence, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p.confidence - average, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0, average - stdDev * 0.5);
  }

  private static updateProviderHealth(providerId: string, success: boolean, latency: number): void {
    const provider = this.providers.get(providerId);
    if (!provider) return;

    const healthDelta = success ? 2 : -5;
    provider.healthScore = Math.max(0, Math.min(100, provider.healthScore + healthDelta));

    if (latency > this.config.timeout) {
      provider.healthScore -= 3;
    }
  }

  private static calculateConsensusStrength(): number {
    const providers = Array.from(this.providers.values()).filter((p) => p.enabled);
    if (providers.length === 0) return 0;

    const activeCount = providers.filter((p) => p.healthScore > 50).length;
    return (activeCount / providers.length) * 100;
  }

  private static async callProviderAPI(
    provider: OracleProvider,
    marketId: string
  ): Promise<{ value: number; timestamp: number }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${provider.url}?market=${marketId}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        value: parseFloat(data.price),
        timestamp: data.timestamp || Date.now(),
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private static async getFallbackPrice(marketId: string): Promise<AggregatedPrice> {
    const strategy = this.config.fallbackStrategy;
    const now = Date.now();

    for (const [providerId, history] of this.priceHistory.entries()) {
      if (history.length === 0) continue;

      const recentHistory = history.filter((p) => now - p.timestamp <= strategy.maxAge);
      if (recentHistory.length === 0) continue;

      if (strategy.type === 'last_known') {
        const latest = recentHistory[recentHistory.length - 1];
        if (latest.confidence >= strategy.minimumConfidence) {
          return {
            value: latest.price,
            timestamp: latest.timestamp,
            sources: [],
            confidence: latest.confidence,
            consensusReached: false,
            method: 'fallback',
          };
        }
      }

      if (strategy.type === 'median_history' || strategy.type === 'weighted_history') {
        const prices = recentHistory.map((p) => p.price);
        const avgConfidence = recentHistory.reduce((sum, p) => sum + p.confidence, 0) / recentHistory.length;
        if (avgConfidence >= strategy.minimumConfidence) {
          return {
            value: this.getMedian(prices),
            timestamp: Math.max(...recentHistory.map((p) => p.timestamp)),
            sources: [],
            confidence: avgConfidence,
            consensusReached: false,
            method: 'fallback',
          };
        }
      }
    }

    return {
      value: 0,
      timestamp: Date.now(),
      sources: [],
      confidence: 0,
      consensusReached: false,
      method: 'fallback',
    };
  }
}
