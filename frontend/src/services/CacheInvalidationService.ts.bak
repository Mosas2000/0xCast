import { marketCacheService } from './MarketCacheService';
import { cacheManager } from '@/utils/cache';

type InvalidationStrategy = 'immediate' | 'delayed' | 'smart';

interface InvalidationRule {
  pattern: string;
  strategy: InvalidationStrategy;
  delay?: number;
}

class CacheInvalidationService {
  private rules: InvalidationRule[] = [];
  private pendingInvalidations: Map<string, NodeJS.Timeout> = new Map();

  addRule(rule: InvalidationRule): void {
    this.rules.push(rule);
  }

  invalidateOnTransaction(txType: string, marketId?: number): void {
    switch (txType) {
      case 'stake':
      case 'predict':
        if (marketId !== undefined) {
          this.invalidateMarket(marketId, 'smart');
        }
        break;
      case 'create_market':
        this.invalidateMarketList('immediate');
        break;
      case 'resolve':
        if (marketId !== undefined) {
          this.invalidateMarket(marketId, 'immediate');
        }
        break;
      default:
        break;
    }
  }

  invalidateMarket(marketId: number, strategy: InvalidationStrategy = 'immediate'): void {
    const key = `market_${marketId}`;

    if (strategy === 'immediate') {
      marketCacheService.invalidateMarket(marketId);
    } else if (strategy === 'delayed') {
      this.scheduleInvalidation(key, () => {
        marketCacheService.invalidateMarket(marketId);
      }, 2000);
    } else if (strategy === 'smart') {
      this.scheduleInvalidation(key, () => {
        marketCacheService.invalidateMarket(marketId);
      }, 5000);
    }
  }

  invalidateMarketList(strategy: InvalidationStrategy = 'immediate'): void {
    const key = 'market_list';

    if (strategy === 'immediate') {
      marketCacheService.invalidateMarketList();
    } else if (strategy === 'delayed') {
      this.scheduleInvalidation(key, () => {
        marketCacheService.invalidateMarketList();
      }, 2000);
    } else if (strategy === 'smart') {
      this.scheduleInvalidation(key, () => {
        marketCacheService.invalidateMarketList();
      }, 5000);
    }
  }

  invalidateUserData(marketId: number, userAddress: string): void {
    marketCacheService.invalidateUserData(marketId, userAddress);
  }

  invalidateAll(): void {
    this.pendingInvalidations.forEach(timeout => clearTimeout(timeout));
    this.pendingInvalidations.clear();
    marketCacheService.invalidateAll();
    cacheManager.clear();
  }

  private scheduleInvalidation(key: string, callback: () => void, delay: number): void {
    const existing = this.pendingInvalidations.get(key);
    if (existing) {
      clearTimeout(existing);
    }

    const timeout = setTimeout(() => {
      callback();
      this.pendingInvalidations.delete(key);
    }, delay);

    this.pendingInvalidations.set(key, timeout);
  }
}

export const cacheInvalidationService = new CacheInvalidationService();
