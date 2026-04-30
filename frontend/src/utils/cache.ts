interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number;
  storage?: 'memory' | 'session' | 'local';
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000;

  constructor() {
    this.memoryCache = new Map();
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = this.DEFAULT_TTL, storage = 'memory' } = options;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    if (storage === 'memory') {
      this.memoryCache.set(key, entry);
    } else if (storage === 'session') {
      this.setStorageCache('session', key, entry);
    } else if (storage === 'local') {
      this.setStorageCache('local', key, entry);
    }
  }

  get<T>(key: string, storage: 'memory' | 'session' | 'local' = 'memory'): T | null {
    let entry: CacheEntry<T> | null = null;

    if (storage === 'memory') {
      entry = this.memoryCache.get(key) || null;
    } else {
      entry = this.getStorageCache<T>(storage, key);
    }

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.delete(key, storage);
      return null;
    }

    return entry.data;
  }

  delete(key: string, storage: 'memory' | 'session' | 'local' = 'memory'): void {
    if (storage === 'memory') {
      this.memoryCache.delete(key);
    } else if (storage === 'session') {
      sessionStorage.removeItem(this.getCacheKey(key));
    } else if (storage === 'local') {
      localStorage.removeItem(this.getCacheKey(key));
    }
  }

  clear(storage?: 'memory' | 'session' | 'local'): void {
    if (!storage || storage === 'memory') {
      this.memoryCache.clear();
    }
    if (!storage || storage === 'session') {
      this.clearStorageCache('session');
    }
    if (!storage || storage === 'local') {
      this.clearStorageCache('local');
    }
  }

  has(key: string, storage: 'memory' | 'session' | 'local' = 'memory'): boolean {
    return this.get(key, storage) !== null;
  }

  private getCacheKey(key: string): string {
    return `oxcast_cache_${key}`;
  }

  private setStorageCache<T>(
    type: 'session' | 'local',
    key: string,
    entry: CacheEntry<T>
  ): void {
    try {
      const storage = type === 'session' ? sessionStorage : localStorage;
      storage.setItem(this.getCacheKey(key), JSON.stringify(entry));
    } catch (error) {
      console.warn(`Failed to set ${type} storage cache:`, error);
    }
  }

  private getStorageCache<T>(
    type: 'session' | 'local',
    key: string
  ): CacheEntry<T> | null {
    try {
      const storage = type === 'session' ? sessionStorage : localStorage;
      const item = storage.getItem(this.getCacheKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Failed to get ${type} storage cache:`, error);
      return null;
    }
  }

  private clearStorageCache(type: 'session' | 'local'): void {
    try {
      const storage = type === 'session' ? sessionStorage : localStorage;
      const keys = Object.keys(storage);
      keys.forEach(key => {
        if (key.startsWith('oxcast_cache_')) {
          storage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn(`Failed to clear ${type} storage cache:`, error);
    }
  }
}

export const cacheManager = new CacheManager();
