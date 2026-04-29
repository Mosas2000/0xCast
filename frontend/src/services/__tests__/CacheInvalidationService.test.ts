import { cacheInvalidationService } from '../CacheInvalidationService';
import { marketCacheService } from '../MarketCacheService';

jest.mock('../MarketCacheService');

describe('CacheInvalidationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('invalidateOnTransaction', () => {
    it('invalidates market on stake transaction', () => {
      const invalidateMarketSpy = jest.spyOn(cacheInvalidationService, 'invalidateMarket');
      
      cacheInvalidationService.invalidateOnTransaction('stake', 1);
      
      expect(invalidateMarketSpy).toHaveBeenCalledWith(1, 'smart');
    });

    it('invalidates market on predict transaction', () => {
      const invalidateMarketSpy = jest.spyOn(cacheInvalidationService, 'invalidateMarket');
      
      cacheInvalidationService.invalidateOnTransaction('predict', 1);
      
      expect(invalidateMarketSpy).toHaveBeenCalledWith(1, 'smart');
    });

    it('invalidates market list on create_market transaction', () => {
      const invalidateMarketListSpy = jest.spyOn(cacheInvalidationService, 'invalidateMarketList');
      
      cacheInvalidationService.invalidateOnTransaction('create_market');
      
      expect(invalidateMarketListSpy).toHaveBeenCalledWith('immediate');
    });

    it('invalidates market immediately on resolve transaction', () => {
      const invalidateMarketSpy = jest.spyOn(cacheInvalidationService, 'invalidateMarket');
      
      cacheInvalidationService.invalidateOnTransaction('resolve', 1);
      
      expect(invalidateMarketSpy).toHaveBeenCalledWith(1, 'immediate');
    });
  });

  describe('invalidateMarket', () => {
    it('invalidates market immediately', () => {
      cacheInvalidationService.invalidateMarket(1, 'immediate');
      
      expect(marketCacheService.invalidateMarket).toHaveBeenCalledWith(1);
    });

    it('schedules delayed invalidation', async () => {
      jest.useFakeTimers();
      
      cacheInvalidationService.invalidateMarket(1, 'delayed');
      
      expect(marketCacheService.invalidateMarket).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(2000);
      
      expect(marketCacheService.invalidateMarket).toHaveBeenCalledWith(1);
      
      jest.useRealTimers();
    });

    it('schedules smart invalidation', async () => {
      jest.useFakeTimers();
      
      cacheInvalidationService.invalidateMarket(1, 'smart');
      
      expect(marketCacheService.invalidateMarket).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(5000);
      
      expect(marketCacheService.invalidateMarket).toHaveBeenCalledWith(1);
      
      jest.useRealTimers();
    });
  });

  describe('invalidateMarketList', () => {
    it('invalidates market list immediately', () => {
      cacheInvalidationService.invalidateMarketList('immediate');
      
      expect(marketCacheService.invalidateMarketList).toHaveBeenCalled();
    });
  });

  describe('invalidateUserData', () => {
    it('invalidates user data', () => {
      cacheInvalidationService.invalidateUserData(1, 'SP123');
      
      expect(marketCacheService.invalidateUserData).toHaveBeenCalledWith(1, 'SP123');
    });
  });

  describe('invalidateAll', () => {
    it('clears all caches', () => {
      cacheInvalidationService.invalidateAll();
      
      expect(marketCacheService.invalidateAll).toHaveBeenCalled();
    });
  });
});
