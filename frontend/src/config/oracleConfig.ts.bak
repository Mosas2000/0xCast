export interface OracleConfig {
  providers: ProviderConfig[];
  consensus: ConsensusConfig;
  fallback: FallbackConfig;
  monitoring: MonitoringConfig;
  cache: CacheConfig;
  network: NetworkConfig;
}

export interface ProviderConfig {
  id: string;
  name: string;
  endpoint: string;
  weight: number;
  timeout: number;
  retries: number;
  enabled: boolean;
}

export interface ConsensusConfig {
  threshold: number;
  tolerance: number;
  minProviders: number;
  weightingMethod: 'median' | 'weighted_median' | 'mean' | 'weighted_mean';
  outlierDetection: {
    enabled: boolean;
    method: 'iqr' | 'zscore' | 'mad';
    aggressiveness: number;
  };
}

export interface FallbackConfig {
  enabled: boolean;
  maxAge: number;
  minConfidence: number;
  strategies: Array<'last_known' | 'median_history' | 'weighted_history' | 'emergency'>;
  historyLimit: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  refreshInterval: number;
  healthCheckInterval: number;
  alertingEnabled: boolean;
  maxAlerts: number;
  metricsRetention: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
}

export interface NetworkConfig {
  rateLimit: {
    enabled: boolean;
    maxRequests: number;
    window: number;
  };
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    resetTimeout: number;
  };
  retryStrategy: {
    maxRetries: number;
    baseDelay: number;
    backoffMultiplier: number;
  };
}

export const DEFAULT_ORACLE_CONFIG: OracleConfig = {
  providers: [
    {
      id: 'crypto_compare',
      name: 'CryptoCompare',
      endpoint: 'https://min-api.cryptocompare.com/data/price',
      weight: 1.0,
      timeout: 5000,
      retries: 2,
      enabled: true,
    },
    {
      id: 'coinbase',
      name: 'Coinbase',
      endpoint: 'https://api.coinbase.com/v2/prices',
      weight: 1.0,
      timeout: 5000,
      retries: 2,
      enabled: true,
    },
    {
      id: 'kraken',
      name: 'Kraken',
      endpoint: 'https://api.kraken.com/0/public/Ticker',
      weight: 1.0,
      timeout: 5000,
      retries: 2,
      enabled: true,
    },
    {
      id: 'binance',
      name: 'Binance',
      endpoint: 'https://api.binance.com/api/v3/ticker/price',
      weight: 1.0,
      timeout: 5000,
      retries: 2,
      enabled: true,
    },
  ],

  consensus: {
    threshold: 0.66,
    tolerance: 0.03,
    minProviders: 3,
    weightingMethod: 'weighted_median',
    outlierDetection: {
      enabled: true,
      method: 'iqr',
      aggressiveness: 1.5,
    },
  },

  fallback: {
    enabled: true,
    maxAge: 3600000,
    minConfidence: 0.5,
    strategies: ['last_known', 'median_history', 'weighted_history', 'emergency'],
    historyLimit: 10000,
  },

  monitoring: {
    enabled: true,
    refreshInterval: 5000,
    healthCheckInterval: 60000,
    alertingEnabled: true,
    maxAlerts: 1000,
    metricsRetention: 86400000,
  },

  cache: {
    enabled: true,
    ttl: 60000,
    maxSize: 1000,
  },

  network: {
    rateLimit: {
      enabled: true,
      maxRequests: 100,
      window: 60000,
    },
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      resetTimeout: 60000,
    },
    retryStrategy: {
      maxRetries: 3,
      baseDelay: 1000,
      backoffMultiplier: 2,
    },
  },
};

export class OracleConfigBuilder {
  private config: OracleConfig;

  constructor(baseConfig: OracleConfig = DEFAULT_ORACLE_CONFIG) {
    this.config = JSON.parse(JSON.stringify(baseConfig));
  }

  setConsensusThreshold(threshold: number): this {
    this.config.consensus.threshold = Math.max(0, Math.min(1, threshold));
    return this;
  }

  setConsensusMinProviders(minProviders: number): this {
    this.config.consensus.minProviders = Math.max(1, minProviders);
    return this;
  }

  disableProvider(id: string): this {
    const provider = this.config.providers.find((p) => p.id === id);
    if (provider) {
      provider.enabled = false;
    }
    return this;
  }

  enableProvider(id: string): this {
    const provider = this.config.providers.find((p) => p.id === id);
    if (provider) {
      provider.enabled = true;
    }
    return this;
  }

  setProviderWeight(id: string, weight: number): this {
    const provider = this.config.providers.find((p) => p.id === id);
    if (provider) {
      provider.weight = Math.max(0, weight);
    }
    return this;
  }

  enableFallback(): this {
    this.config.fallback.enabled = true;
    return this;
  }

  disableFallback(): this {
    this.config.fallback.enabled = false;
    return this;
  }

  setFallbackMaxAge(maxAge: number): this {
    this.config.fallback.maxAge = Math.max(0, maxAge);
    return this;
  }

  enableMonitoring(): this {
    this.config.monitoring.enabled = true;
    return this;
  }

  disableMonitoring(): this {
    this.config.monitoring.enabled = false;
    return this;
  }

  setMonitoringRefreshInterval(interval: number): this {
    this.config.monitoring.refreshInterval = Math.max(1000, interval);
    return this;
  }

  enableCache(): this {
    this.config.cache.enabled = true;
    return this;
  }

  disableCache(): this {
    this.config.cache.enabled = false;
    return this;
  }

  setCacheTTL(ttl: number): this {
    this.config.cache.ttl = Math.max(1000, ttl);
    return this;
  }

  setRateLimit(maxRequests: number, window: number): this {
    this.config.network.rateLimit.maxRequests = Math.max(1, maxRequests);
    this.config.network.rateLimit.window = Math.max(1000, window);
    return this;
  }

  setCircuitBreakerThreshold(threshold: number): this {
    this.config.network.circuitBreaker.failureThreshold = Math.max(1, threshold);
    return this;
  }

  setRetryConfig(maxRetries: number, baseDelay: number, multiplier: number): this {
    this.config.network.retryStrategy.maxRetries = Math.max(0, maxRetries);
    this.config.network.retryStrategy.baseDelay = Math.max(1, baseDelay);
    this.config.network.retryStrategy.backoffMultiplier = Math.max(1, multiplier);
    return this;
  }

  build(): OracleConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  getConfig(): OracleConfig {
    return JSON.parse(JSON.stringify(this.config));
  }
}
