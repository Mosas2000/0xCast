import { OracleNetworkService } from './OracleNetworkService';
import { OracleProviderManager } from './OracleProviderManager';
import { OracleConsensusValidator } from './OracleConsensusValidator';
import { OracleMonitoringService } from './OracleMonitoringService';
import { PriceAggregationAlgorithms } from './PriceAggregationAlgorithms';
import {
  OracleProvider,
  OraclePrice,
  AggregatedPrice,
  OracleConfig,
} from '@/types/oracle';

export interface CoordinatorConfig {
  enableAutoFailover: boolean;
  enableHealthMonitoring: boolean;
  healthCheckInterval: number;
  providerRotationInterval: number;
  consensusValidation: boolean;
  fallbackEnabled: boolean;
}

export class OracleNetworkCoordinator {
  private providerManager: OracleProviderManager;
  private consensusValidator: OracleConsensusValidator;
  private config: CoordinatorConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private rotationTimer?: NodeJS.Timeout;

  constructor(config?: Partial<CoordinatorConfig>) {
    this.providerManager = new OracleProviderManager();
    this.consensusValidator = new OracleConsensusValidator();
    this.config = {
      enableAutoFailover: true,
      enableHealthMonitoring: true,
      healthCheckInterval: 60000,
      providerRotationInterval: 300000,
      consensusValidation: true,
      fallbackEnabled: true,
      ...config,
    };
  }

  async initialize(providers: OracleProvider[], oracleConfig: OracleConfig): Promise<void> {
    providers.forEach((provider) => {
      this.providerManager.registerProvider(provider);
    });

    OracleNetworkService.initializeProviders(providers);
    OracleNetworkService.updateProviderConfig(oracleConfig);

    if (this.config.enableHealthMonitoring) {
      this.startHealthMonitoring();
    }

    if (this.config.enableAutoFailover) {
      this.startProviderRotation();
    }
  }

  async fetchAggregatedPrice(marketId: string): Promise<AggregatedPrice> {
    const providers = this.providerManager.getHealthyProviders();

    if (providers.length === 0) {
      OracleMonitoringService.trackConsensusFailure(marketId, 'No healthy providers available');
      return this.handleFallback(marketId);
    }

    const prices: OraclePrice[] = [];
    const fetchPromises = providers.map(async (provider) => {
      const startTime = Date.now();
      try {
        const price = await OracleNetworkService.fetchPrice(provider.id, marketId);
        const latency = Date.now() - startTime;

        if (price) {
          prices.push(price);
          this.providerManager.recordSuccess(provider.id, latency);
          OracleMonitoringService.recordUpdate(provider.id, true, latency);
        } else {
          this.providerManager.recordFailure(provider.id, 'No price returned');
          OracleMonitoringService.recordUpdate(provider.id, false, latency, 'No price returned');
        }
      } catch (error) {
        const latency = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        this.providerManager.recordFailure(provider.id, errorMsg);
        OracleMonitoringService.recordUpdate(provider.id, false, latency, errorMsg);
      }
    });

    await Promise.allSettled(fetchPromises);

    if (prices.length === 0) {
      OracleMonitoringService.trackConsensusFailure(marketId, 'All providers failed');
      return this.handleFallback(marketId);
    }

    if (this.config.consensusValidation) {
      const validation = this.consensusValidator.validateConsensus(prices);
      if (!validation.isValid) {
        OracleMonitoringService.trackConsensusFailure(marketId, validation.reason);
        if (validation.recommendation === 'retry') {
          return this.handleFallback(marketId);
        }
      }
    }

    const aggregated = await OracleNetworkService.aggregatePrices(marketId, prices);

    prices.forEach((price) => {
      OracleNetworkService.recordPrice(price.source, {
        price: price.value,
        timestamp: price.timestamp,
        confidence: price.confidence,
      });
    });

    return aggregated;
  }

  async fetchWithStrategy(
    marketId: string,
    strategy: 'fast' | 'reliable' | 'consensus'
  ): Promise<AggregatedPrice> {
    switch (strategy) {
      case 'fast': {
        const bestProvider = this.providerManager.selectBestProviders(1)[0];
        if (!bestProvider) {
          return this.handleFallback(marketId);
        }

        const price = await OracleNetworkService.fetchPrice(bestProvider.id, marketId);
        if (!price) {
          return this.handleFallback(marketId);
        }

        return {
          value: price.value,
          timestamp: price.timestamp,
          sources: [price],
          confidence: price.confidence,
          consensusReached: false,
          method: 'fast',
        };
      }

      case 'reliable': {
        const topProviders = this.providerManager.selectBestProviders(3);
        const prices = await Promise.all(
          topProviders.map((p) => OracleNetworkService.fetchPrice(p.id, marketId))
        );

        const validPrices = prices.filter((p): p is OraclePrice => p !== null);
        if (validPrices.length === 0) {
          return this.handleFallback(marketId);
        }

        return await OracleNetworkService.aggregatePrices(marketId, validPrices);
      }

      case 'consensus':
      default:
        return this.fetchAggregatedPrice(marketId);
    }
  }

  private async handleFallback(marketId: string): Promise<AggregatedPrice> {
    if (!this.config.fallbackEnabled) {
      return {
        value: 0,
        timestamp: Date.now(),
        sources: [],
        confidence: 0,
        consensusReached: false,
        method: 'none',
      };
    }

    const strategies: Array<'last_known' | 'median_history' | 'weighted_history' | 'cross_provider'> = [
      'cross_provider',
      'weighted_history',
      'median_history',
      'last_known',
    ];

    for (const strategy of strategies) {
      const fallback = await OracleNetworkService.getFallbackPriceWithStrategy(marketId, strategy);
      if (fallback && fallback.confidence > 0.5) {
        OracleMonitoringService.trackFallbackActivation(marketId, strategy);
        return fallback;
      }
    }

    OracleMonitoringService.trackConsensusFailure(marketId, 'All fallback strategies failed');
    return {
      value: 0,
      timestamp: Date.now(),
      sources: [],
      confidence: 0,
      consensusReached: false,
      method: 'fallback_failed',
    };
  }

  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(() => {
      const providers = this.providerManager.getAllProviders();
      providers.forEach((provider) => {
        OracleMonitoringService.checkHealthThresholds(provider);
      });
    }, this.config.healthCheckInterval);
  }

  private startProviderRotation(): void {
    this.rotationTimer = setInterval(() => {
      OracleNetworkService.rotateProviders();

      const providers = this.providerManager.getAllProviders();
      providers.forEach((provider) => {
        const metrics = this.providerManager.getHealthMetrics(provider.id);
        if (metrics && metrics.healthScore < 30 && provider.enabled) {
          this.providerManager.disableProvider(provider.id);
          OracleNetworkService.disableProvider(provider.id);
        } else if (metrics && metrics.healthScore > 70 && !provider.enabled) {
          this.providerManager.enableProvider(provider.id);
          OracleNetworkService.enableProvider(provider.id);
        }
      });
    }, this.config.providerRotationInterval);
  }

  addProvider(provider: OracleProvider): void {
    this.providerManager.registerProvider(provider);
    OracleNetworkService.addProvider(provider);
  }

  removeProvider(providerId: string): void {
    this.providerManager.unregisterProvider(providerId);
    OracleNetworkService.removeProvider(providerId);
  }

  getNetworkStatus() {
    const networkHealth = this.providerManager.getNetworkHealth();
    const networkState = OracleNetworkService.getNetworkState();
    const resilience = OracleMonitoringService.getNetworkResilience(
      this.providerManager.getAllProviders()
    );

    return {
      ...networkHealth,
      ...networkState,
      resilience,
      activeAlerts: OracleMonitoringService.getActiveAlerts().length,
    };
  }

  getProviderStatus(providerId: string) {
    const provider = this.providerManager.getProvider(providerId);
    const metrics = this.providerManager.getHealthMetrics(providerId);
    const performance = this.providerManager.getPerformanceStats(providerId);
    const oracleMetrics = OracleNetworkService.getProviderMetrics(providerId);

    return {
      provider,
      metrics,
      performance,
      oracleMetrics,
    };
  }

  async testProvider(providerId: string, marketId: string): Promise<{
    success: boolean;
    latency: number;
    price?: OraclePrice;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      const price = await OracleNetworkService.fetchPrice(providerId, marketId);
      const latency = Date.now() - startTime;

      if (price) {
        return { success: true, latency, price };
      } else {
        return { success: false, latency, error: 'No price returned' };
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  updateConfig(config: Partial<CoordinatorConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.enableHealthMonitoring && !this.healthCheckTimer) {
      this.startHealthMonitoring();
    } else if (!this.config.enableHealthMonitoring && this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    if (this.config.enableAutoFailover && !this.rotationTimer) {
      this.startProviderRotation();
    } else if (!this.config.enableAutoFailover && this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = undefined;
    }
  }

  shutdown(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }
  }
}
