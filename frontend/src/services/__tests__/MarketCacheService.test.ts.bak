import { marketCacheService } from '../MarketCacheService';
import { MarketStatus, MarketOutcome } from '../../types/market';
import type { Market } from '../../types/market';

const mockMarket: Market = {
  id: 1,
  question: 'Test Market',
  creator: 'SP123',
  status: MarketStatus.ACTIVE,
  outcome: MarketOutcome.UNRESOLVED,
  totalYesStake: 100,
  totalNoStake: 50,
  createdAt: 1000,
  endDate: 2000,
};

describe('MarketCacheService', () => {
  beforeEach(() => {
    marketCacheService.invalidateAll();
  });

  describe('market caching', () => {
    it('sets and gets market data', () => {
      marketCacheService.setMarket(1, mockMarket);
      
      const result = marketCacheService.getMarket(1);
      expect(result).toEqual(mockMarket);
    });

    it('returns null for non-existent market', () => {
      const result = marketCacheService.getMarket(999);
      expect(result).toBeNull();
    });

    it('invalidates specific market', () => {
      marketCacheService.setMarket(1, mockMarket);
      expect(marketCacheService.getMarket(1)).toEqual(mockMarket);
      
      marketCacheService.invalidateMarket(1);
      expect(marketCacheService.getMarket(1)).toBeNull();
    });
  });

  describe('market list caching', () => {
    it('sets and gets market list', () => {
      const markets = [mockMarket];
      marketCacheService.setMarketList(markets);
      
      const result = marketCacheService.getMarketList();
      expect(result).toEqual(markets);
    });

    it('invalidates market list', () => {
      const markets = [mockMarket];
      marketCacheService.setMarketList(markets);
      expect(marketCacheService.getMarketList()).toEqual(markets);
      
      marketCacheService.invalidateMarketList();
      expect(marketCacheService.getMarketList()).toBeNull();
    });
  });

  describe('user stake caching', () => {
    it('sets and gets user stake', () => {
      const userAddress = 'SP123';
      const amount = 100;
      
      marketCacheService.setUserStake(1, userAddress, amount);
      
      const result = marketCacheService.getUserStake(1, userAddress);
      expect(result).toBe(amount);
    });

    it('returns null for non-existent user stake', () => {
      const result = marketCacheService.getUserStake(1, 'SP999');
      expect(result).toBeNull();
    });

    it('invalidates user data', () => {
      const userAddress = 'SP123';
      marketCacheService.setUserStake(1, userAddress, 100);
      expect(marketCacheService.getUserStake(1, userAddress)).toBe(100);
      
      marketCacheService.invalidateUserData(1, userAddress);
      expect(marketCacheService.getUserStake(1, userAddress)).toBeNull();
    });
  });

  describe('configuration', () => {
    it('updates cache configuration', () => {
      marketCacheService.updateConfig({
        marketTTL: 60000,
      });
      
      marketCacheService.setMarket(1, mockMarket);
      expect(marketCacheService.getMarket(1)).toEqual(mockMarket);
    });
  });

  describe('invalidate all', () => {
    it('clears all cached data', () => {
      marketCacheService.setMarket(1, mockMarket);
      marketCacheService.setMarketList([mockMarket]);
      marketCacheService.setUserStake(1, 'SP123', 100);
      
      marketCacheService.invalidateAll();
      
      expect(marketCacheService.getMarket(1)).toBeNull();
      expect(marketCacheService.getMarketList()).toBeNull();
      expect(marketCacheService.getUserStake(1, 'SP123')).toBeNull();
    });
  });
});
