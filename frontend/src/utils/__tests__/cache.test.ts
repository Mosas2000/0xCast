import { cacheManager } from '../cache';

describe('CacheManager', () => {
  beforeEach(() => {
    cacheManager.clear();
  });

  describe('memory cache', () => {
    it('sets and gets data from memory cache', () => {
      const data = { id: 1, name: 'Test' };
      cacheManager.set('test-key', data);
      
      const result = cacheManager.get('test-key');
      expect(result).toEqual(data);
    });

    it('returns null for non-existent keys', () => {
      const result = cacheManager.get('non-existent');
      expect(result).toBeNull();
    });

    it('respects TTL and expires data', async () => {
      const data = { id: 1 };
      cacheManager.set('test-key', data, { ttl: 100 });
      
      expect(cacheManager.get('test-key')).toEqual(data);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cacheManager.get('test-key')).toBeNull();
    });

    it('checks if key exists', () => {
      cacheManager.set('test-key', { id: 1 });
      
      expect(cacheManager.has('test-key')).toBe(true);
      expect(cacheManager.has('non-existent')).toBe(false);
    });

    it('deletes data', () => {
      cacheManager.set('test-key', { id: 1 });
      expect(cacheManager.has('test-key')).toBe(true);
      
      cacheManager.delete('test-key');
      expect(cacheManager.has('test-key')).toBe(false);
    });

    it('clears all memory cache', () => {
      cacheManager.set('key1', { id: 1 });
      cacheManager.set('key2', { id: 2 });
      
      cacheManager.clear('memory');
      
      expect(cacheManager.has('key1')).toBe(false);
      expect(cacheManager.has('key2')).toBe(false);
    });
  });

  describe('session storage cache', () => {
    it('sets and gets data from session storage', () => {
      const data = { id: 1, name: 'Test' };
      cacheManager.set('test-key', data, { storage: 'session' });
      
      const result = cacheManager.get('test-key', 'session');
      expect(result).toEqual(data);
    });

    it('respects TTL in session storage', async () => {
      const data = { id: 1 };
      cacheManager.set('test-key', data, { ttl: 100, storage: 'session' });
      
      expect(cacheManager.get('test-key', 'session')).toEqual(data);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cacheManager.get('test-key', 'session')).toBeNull();
    });

    it('deletes from session storage', () => {
      cacheManager.set('test-key', { id: 1 }, { storage: 'session' });
      expect(cacheManager.has('test-key', 'session')).toBe(true);
      
      cacheManager.delete('test-key', 'session');
      expect(cacheManager.has('test-key', 'session')).toBe(false);
    });
  });

  describe('local storage cache', () => {
    it('sets and gets data from local storage', () => {
      const data = { id: 1, name: 'Test' };
      cacheManager.set('test-key', data, { storage: 'local' });
      
      const result = cacheManager.get('test-key', 'local');
      expect(result).toEqual(data);
    });

    it('deletes from local storage', () => {
      cacheManager.set('test-key', { id: 1 }, { storage: 'local' });
      expect(cacheManager.has('test-key', 'local')).toBe(true);
      
      cacheManager.delete('test-key', 'local');
      expect(cacheManager.has('test-key', 'local')).toBe(false);
    });
  });
});
