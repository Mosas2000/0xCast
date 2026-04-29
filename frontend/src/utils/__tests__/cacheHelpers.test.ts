import { isCacheAvailable, getCacheSize, clearExpiredCache, exportCache, importCache } from '../cacheHelpers';

describe('cacheHelpers', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('isCacheAvailable', () => {
    it('returns true when storage is available', () => {
      expect(isCacheAvailable()).toBe(true);
    });
  });

  describe('getCacheSize', () => {
    it('returns 0 for empty cache', () => {
      expect(getCacheSize('session')).toBe(0);
      expect(getCacheSize('local')).toBe(0);
    });

    it('calculates cache size correctly', () => {
      sessionStorage.setItem('oxcast_cache_test', 'data');
      expect(getCacheSize('session')).toBeGreaterThan(0);
    });
  });

  describe('clearExpiredCache', () => {
    it('removes expired cache entries', () => {
      const expiredEntry = {
        data: 'test',
        timestamp: Date.now() - 100000,
        ttl: 1000,
      };
      
      sessionStorage.setItem('oxcast_cache_expired', JSON.stringify(expiredEntry));
      
      clearExpiredCache();
      
      expect(sessionStorage.getItem('oxcast_cache_expired')).toBeNull();
    });

    it('keeps valid cache entries', () => {
      const validEntry = {
        data: 'test',
        timestamp: Date.now(),
        ttl: 100000,
      };
      
      sessionStorage.setItem('oxcast_cache_valid', JSON.stringify(validEntry));
      
      clearExpiredCache();
      
      expect(sessionStorage.getItem('oxcast_cache_valid')).not.toBeNull();
    });
  });

  describe('exportCache', () => {
    it('exports cache data as JSON', () => {
      sessionStorage.setItem('oxcast_cache_test', 'data');
      localStorage.setItem('oxcast_cache_test2', 'data2');
      
      const exported = exportCache();
      const data = JSON.parse(exported);
      
      expect(data).toHaveProperty('session');
      expect(data).toHaveProperty('local');
    });
  });

  describe('importCache', () => {
    it('imports cache data from JSON', () => {
      const data = {
        session: { 'oxcast_cache_test': 'data' },
        local: { 'oxcast_cache_test2': 'data2' },
      };
      
      importCache(JSON.stringify(data));
      
      expect(sessionStorage.getItem('oxcast_cache_test')).toBe('data');
      expect(localStorage.getItem('oxcast_cache_test2')).toBe('data2');
    });

    it('handles invalid JSON gracefully', () => {
      expect(() => importCache('invalid json')).not.toThrow();
    });
  });
});
