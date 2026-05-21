import { cacheManager } from '@/utils/cache';
import type { Market } from '@/types/market';

interface MarketCacheConfig {
  marketTTL: number;
  marketListTTL: number;
  userDataTTL: number;
}

class MarketCacheService {
  private config: MarketCacheConfig = {
    marketTTL: 30 * 1000,
    marketListTTL: 60 * 1000,
    userDataTTL: 15 * 1000,
  };

  setMarket(marketId: number, market: Market): void {
    const key = this.getMarketKey(marketId);
    cacheManager.set(key, market, {
      ttl: this.config.marketTTL,
      storage: 'memory',
    });
  }

  getMarket(marketId: number): Market | null {
    const key = this.getMarketKey(marketId);
    return cacheManager.get<Market>(key, 'memory');
  }

  setMarketList(markets: Market[]): void {
    cacheManager.set('market_list', markets, {
      ttl: this.config.marketListTTL,
      storage: 'memory',
    });
  }

  getMarketList(): Market[] | null {
    return cacheManager.get<Market[]>('market_list', 'memory');
  }

  setUserStake(marketId: number, userAddress: string, amount: number): void {
    const key = this.getUserStakeKey(marketId, userAddress);
    cacheManager.set(key, amount, {
      ttl: this.config.userDataTTL,
      storage: 'memory',
    });
  }

  getUserStake(marketId: number, userAddress: string): number | null {
    const key = this.getUserStakeKey(marketId, userAddress);
    return cacheManager.get<number>(key, 'memory');
  }

  invalidateMarket(marketId: number): void {
    const key = this.getMarketKey(marketId);
    cacheManager.delete(key, 'memory');
  }

  invalidateMarketList(): void {
    cacheManager.delete('market_list', 'memory');
  }

  invalidateUserData(marketId: number, userAddress: string): void {
    const key = this.getUserStakeKey(marketId, userAddress);
    cacheManager.delete(key, 'memory');
  }

  invalidateAll(): void {
    cacheManager.clear('memory');
  }

  updateConfig(config: Partial<MarketCacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private getMarketKey(marketId: number): string {
    return `market_${marketId}`;
  }

  private getUserStakeKey(marketId: number, userAddress: string): string {
    return `user_stake_${marketId}_${userAddress}`;
  }
}

export const marketCacheService = new MarketCacheService();
