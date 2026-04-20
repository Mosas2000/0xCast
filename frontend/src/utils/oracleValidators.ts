import { OraclePrice, AggregatedPrice, ProviderHealth } from '@/types/oracle';

export class PriceDataValidator {
  static isValidPrice(value: any): boolean {
    return typeof value === 'number' && value >= 0 && isFinite(value);
  }

  static isValidTimestamp(timestamp: any): boolean {
    if (typeof timestamp !== 'number') return false;
    const now = Date.now();
    return timestamp > 0 && timestamp <= now + 1000;
  }

  static isValidConfidence(confidence: any): boolean {
    return typeof confidence === 'number' && confidence >= 0 && confidence <= 1;
  }

  static isValidOraclePrice(price: any): boolean {
    if (typeof price !== 'object' || !price) return false;

    return (
      this.isValidPrice(price.value) &&
      this.isValidTimestamp(price.timestamp) &&
      typeof price.source === 'string' &&
      price.source.length > 0 &&
      this.isValidConfidence(price.confidence)
    );
  }

  static validatePriceArray(prices: any[]): {
    valid: OraclePrice[];
    invalid: any[];
    errors: string[];
  } {
    const valid: OraclePrice[] = [];
    const invalid: any[] = [];
    const errors: string[] = [];

    if (!Array.isArray(prices)) {
      errors.push('Input is not an array');
      return { valid, invalid, errors };
    }

    prices.forEach((price, index) => {
      if (this.isValidOraclePrice(price)) {
        valid.push(price);
      } else {
        invalid.push(price);
        errors.push(`Invalid price at index ${index}`);
      }
    });

    return { valid, invalid, errors };
  }

  static sanitizeOraclePrice(price: any): OraclePrice | null {
    if (!price || typeof price !== 'object') return null;

    const sanitized: OraclePrice = {
      value: Math.max(0, Number(price.value) || 0),
      timestamp: Math.min(Date.now(), Number(price.timestamp) || Date.now()),
      source: String(price.source || 'unknown').slice(0, 256),
      confidence: Math.max(0, Math.min(1, Number(price.confidence) || 0.5)),
    };

    if (!this.isValidOraclePrice(sanitized)) {
      return null;
    }

    return sanitized;
  }
}

export class AggregationDataValidator {
  static isValidAggregatedPrice(price: any): boolean {
    if (typeof price !== 'object' || !price) return false;

    return (
      PriceDataValidator.isValidPrice(price.value) &&
      PriceDataValidator.isValidTimestamp(price.timestamp) &&
      Array.isArray(price.sources) &&
      price.sources.length > 0 &&
      PriceDataValidator.isValidConfidence(price.confidence) &&
      typeof price.consensusReached === 'boolean' &&
      typeof price.method === 'string'
    );
  }

  static validateAggregatedPrice(price: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!price.value) {
      errors.push('Missing price value');
    } else if (!PriceDataValidator.isValidPrice(price.value)) {
      errors.push('Invalid price value');
    }

    if (!price.timestamp) {
      errors.push('Missing timestamp');
    } else if (!PriceDataValidator.isValidTimestamp(price.timestamp)) {
      errors.push('Invalid timestamp');
    }

    if (!Array.isArray(price.sources) || price.sources.length === 0) {
      errors.push('Invalid or empty sources array');
    }

    if (!PriceDataValidator.isValidConfidence(price.confidence)) {
      errors.push('Invalid confidence value');
    }

    if (typeof price.consensusReached !== 'boolean') {
      errors.push('Missing or invalid consensus flag');
    }

    if (typeof price.method !== 'string' || price.method.length === 0) {
      errors.push('Missing or invalid aggregation method');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static sanitizeAggregatedPrice(price: any): AggregatedPrice | null {
    if (!price || typeof price !== 'object') return null;

    const sanitized: AggregatedPrice = {
      value: Math.max(0, Number(price.value) || 0),
      timestamp: Math.min(Date.now(), Number(price.timestamp) || Date.now()),
      sources: Array.isArray(price.sources) ? price.sources.filter((s: any) => typeof s === 'string') : [],
      confidence: Math.max(0, Math.min(1, Number(price.confidence) || 0.5)),
      consensusReached: Boolean(price.consensusReached),
      method: String(price.method || 'unknown').slice(0, 64),
    };

    if (sanitized.sources.length === 0) {
      return null;
    }

    if (!this.isValidAggregatedPrice(sanitized)) {
      return null;
    }

    return sanitized;
  }
}

export class ProviderHealthValidator {
  static isValidProviderHealth(health: any): boolean {
    if (typeof health !== 'object' || !health) return false;

    return (
      typeof health.id === 'string' &&
      health.id.length > 0 &&
      typeof health.successRate === 'number' &&
      health.successRate >= 0 &&
      health.successRate <= 1 &&
      typeof health.uptime === 'number' &&
      health.uptime >= 0 &&
      health.uptime <= 1 &&
      typeof health.averageLatency === 'number' &&
      health.averageLatency >= 0 &&
      typeof health.responseCount === 'number' &&
      health.responseCount >= 0 &&
      typeof health.errorCount === 'number' &&
      health.errorCount >= 0 &&
      typeof health.healthScore === 'number' &&
      health.healthScore >= 0 &&
      health.healthScore <= 1
    );
  }

  static validateProviderHealth(health: any): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof health.id !== 'string' || health.id.length === 0) {
      errors.push('Invalid provider ID');
    }

    if (typeof health.successRate !== 'number' || health.successRate < 0 || health.successRate > 1) {
      errors.push('Invalid success rate');
    } else if (health.successRate < 0.5) {
      warnings.push('Low success rate (<50%)');
    }

    if (typeof health.uptime !== 'number' || health.uptime < 0 || health.uptime > 1) {
      errors.push('Invalid uptime');
    } else if (health.uptime < 0.9) {
      warnings.push('Low uptime (<90%)');
    }

    if (typeof health.averageLatency !== 'number' || health.averageLatency < 0) {
      errors.push('Invalid average latency');
    } else if (health.averageLatency > 5000) {
      warnings.push('High latency (>5s)');
    }

    if (typeof health.responseCount !== 'number' || health.responseCount < 0) {
      errors.push('Invalid response count');
    }

    if (typeof health.errorCount !== 'number' || health.errorCount < 0) {
      errors.push('Invalid error count');
    }

    if (typeof health.healthScore !== 'number' || health.healthScore < 0 || health.healthScore > 1) {
      errors.push('Invalid health score');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static sanitizeProviderHealth(health: any): ProviderHealth | null {
    if (!health || typeof health !== 'object') return null;

    const sanitized: ProviderHealth = {
      id: String(health.id || 'unknown').slice(0, 256),
      successRate: Math.max(0, Math.min(1, Number(health.successRate) || 0)),
      uptime: Math.max(0, Math.min(1, Number(health.uptime) || 0)),
      averageLatency: Math.max(0, Number(health.averageLatency) || 0),
      responseCount: Math.max(0, Math.floor(Number(health.responseCount) || 0)),
      errorCount: Math.max(0, Math.floor(Number(health.errorCount) || 0)),
      lastResponseTime: Math.min(Date.now(), Number(health.lastResponseTime) || Date.now()),
      healthScore: Math.max(0, Math.min(1, Number(health.healthScore) || 0)),
    };

    if (!this.isValidProviderHealth(sanitized)) {
      return null;
    }

    return sanitized;
  }
}

export class ConfigurationValidator {
  static isValidMarketId(marketId: any): boolean {
    return (
      typeof marketId === 'string' &&
      marketId.length > 0 &&
      marketId.length <= 256 &&
      /^[a-zA-Z0-9\/-]+$/.test(marketId)
    );
  }

  static isValidProviderId(providerId: any): boolean {
    return (
      typeof providerId === 'string' &&
      providerId.length > 0 &&
      providerId.length <= 128
    );
  }

  static isValidThreshold(threshold: any): boolean {
    return typeof threshold === 'number' && threshold >= 0 && threshold <= 1;
  }

  static isValidTimeframe(timeframe: any): boolean {
    return typeof timeframe === 'number' && timeframe > 0 && timeframe < 86400000;
  }

  static validateConfig(config: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config || typeof config !== 'object') {
      errors.push('Config is not an object');
      return { valid: false, errors };
    }

    if (config.consensus && typeof config.consensus.threshold !== 'undefined') {
      if (!this.isValidThreshold(config.consensus.threshold)) {
        errors.push('Invalid consensus threshold');
      }
    }

    if (config.providers && Array.isArray(config.providers)) {
      config.providers.forEach((provider: any, index: number) => {
        if (!this.isValidProviderId(provider.id)) {
          errors.push(`Invalid provider ID at index ${index}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
