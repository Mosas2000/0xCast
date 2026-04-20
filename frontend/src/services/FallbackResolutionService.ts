import { AggregatedPrice, FallbackStrategy, PriceHistory } from '@/types/oracle';

export class FallbackResolutionService {
  private static fallbackHistory: Map<string, PriceHistory[]> = new Map();
  private static lastKnownPrices: Map<string, { price: number; timestamp: number }> = new Map();

  static recordPrice(marketId: string, price: number, timestamp: number, source: string): void {
    if (!this.fallbackHistory.has(marketId)) {
      this.fallbackHistory.set(marketId, []);
    }

    const history = this.fallbackHistory.get(marketId)!;
    history.push({
      timestamp,
      price,
      source,
      confidence: 0.8,
    });

    if (history.length > 10000) {
      history.shift();
    }

    this.lastKnownPrices.set(marketId, { price, timestamp });
  }

  static resolveFallback(
    marketId: string,
    strategy: FallbackStrategy
  ): AggregatedPrice | null {
    const history = this.fallbackHistory.get(marketId);

    if (!history || history.length === 0) {
      return null;
    }

    switch (strategy.type) {
      case 'last_known':
        return this.lastKnownPallback(marketId, strategy);
      case 'median_history':
        return this.medianHistoryFallback(marketId, strategy);
      case 'weighted_history':
        return this.weightedHistoryFallback(marketId, strategy);
      case 'emergency':
        return this.emergencyFallback(marketId, strategy);
      default:
        return null;
    }
  }

  static isStalePrice(timestamp: number, maxAge: number): boolean {
    return Date.now() - timestamp > maxAge;
  }

  static hasValidFallbackData(marketId: string, strategy: FallbackStrategy): boolean {
    const history = this.fallbackHistory.get(marketId);
    if (!history || history.length === 0) {
      return false;
    }

    const recentData = history.filter(
      (p) => !this.isStalePrice(p.timestamp, strategy.maxAge)
    );

    return recentData.length > 0 && recentData.some((p) => p.confidence >= strategy.minimumConfidence);
  }

  static getRecentHistory(marketId: string, maxAge: number, limit: number = 100): PriceHistory[] {
    const history = this.fallbackHistory.get(marketId) || [];
    return history
      .filter((p) => !this.isStalePrice(p.timestamp, maxAge))
      .slice(-limit);
  }

  static clearHistory(marketId: string): void {
    this.fallbackHistory.delete(marketId);
    this.lastKnownPrices.delete(marketId);
  }

  static clearExpiredData(maxAge: number): void {
    const now = Date.now();

    for (const [marketId, history] of this.fallbackHistory.entries()) {
      const filtered = history.filter((p) => now - p.timestamp <= maxAge);

      if (filtered.length === 0) {
        this.fallbackHistory.delete(marketId);
      } else if (filtered.length < history.length) {
        this.fallbackHistory.set(marketId, filtered);
      }
    }
  }

  static getHealthCheckData(marketId: string) {
    const history = this.fallbackHistory.get(marketId) || [];
    const lastKnown = this.lastKnownPrices.get(marketId);

    return {
      hasHistory: history.length > 0,
      historySize: history.length,
      lastKnownPrice: lastKnown?.price || null,
      lastKnownTimestamp: lastKnown?.timestamp || null,
      recentPrices: history.slice(-10),
    };
  }

  private static lastKnownPallback(
    marketId: string,
    strategy: FallbackStrategy
  ): AggregatedPrice | null {
    const lastKnown = this.lastKnownPrices.get(marketId);

    if (!lastKnown || this.isStalePrice(lastKnown.timestamp, strategy.maxAge)) {
      return null;
    }

    return {
      value: lastKnown.price,
      timestamp: lastKnown.timestamp,
      sources: [],
      confidence: 0.7,
      consensusReached: false,
      method: 'fallback',
    };
  }

  private static medianHistoryFallback(
    marketId: string,
    strategy: FallbackStrategy
  ): AggregatedPrice | null {
    const recentHistory = this.getRecentHistory(marketId, strategy.maxAge);

    if (recentHistory.length === 0) {
      return null;
    }

    const validPrices = recentHistory.filter(
      (p) => p.confidence >= strategy.minimumConfidence
    );

    if (validPrices.length === 0) {
      return null;
    }

    const prices = validPrices.map((p) => p.price).sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];
    const avgConfidence = validPrices.reduce((sum, p) => sum + p.confidence, 0) / validPrices.length;

    return {
      value: median,
      timestamp: Math.max(...validPrices.map((p) => p.timestamp)),
      sources: [],
      confidence: avgConfidence,
      consensusReached: false,
      method: 'fallback',
    };
  }

  private static weightedHistoryFallback(
    marketId: string,
    strategy: FallbackStrategy
  ): AggregatedPrice | null {
    const recentHistory = this.getRecentHistory(marketId, strategy.maxAge);

    if (recentHistory.length === 0) {
      return null;
    }

    const validPrices = recentHistory.filter(
      (p) => p.confidence >= strategy.minimumConfidence
    );

    if (validPrices.length === 0) {
      return null;
    }

    let totalWeight = 0;
    let weightedPrice = 0;
    const now = Date.now();

    for (const price of validPrices) {
      const recencyWeight = Math.exp(-((now - price.timestamp) / 3600000));
      const weight = price.confidence * recencyWeight;

      totalWeight += weight;
      weightedPrice += price.price * weight;
    }

    const result = totalWeight > 0 ? weightedPrice / totalWeight : 0;
    const avgConfidence = validPrices.reduce((sum, p) => sum + p.confidence, 0) / validPrices.length;

    return {
      value: result,
      timestamp: Math.max(...validPrices.map((p) => p.timestamp)),
      sources: [],
      confidence: avgConfidence * 0.9,
      consensusReached: false,
      method: 'fallback',
    };
  }

  private static emergencyFallback(
    marketId: string,
    strategy: FallbackStrategy
  ): AggregatedPrice | null {
    const history = this.fallbackHistory.get(marketId);

    if (!history || history.length === 0) {
      return null;
    }

    const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
    const lastPrice = sorted[0];

    return {
      value: lastPrice.price,
      timestamp: lastPrice.timestamp,
      sources: [],
      confidence: 0.5,
      consensusReached: false,
      method: 'fallback',
    };
  }
}
