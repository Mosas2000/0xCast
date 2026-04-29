import { cacheManager } from './cache';

export function isCacheAvailable(): boolean {
  try {
    const test = '__cache_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function getCacheSize(storage: 'session' | 'local'): number {
  try {
    const storageObj = storage === 'session' ? sessionStorage : localStorage;
    let size = 0;
    for (const key in storageObj) {
      if (key.startsWith('oxcast_cache_')) {
        size += storageObj[key].length;
      }
    }
    return size;
  } catch {
    return 0;
  }
}

export function clearExpiredCache(): void {
  const keys = Object.keys(sessionStorage).filter(k => k.startsWith('oxcast_cache_'));
  keys.forEach(key => {
    try {
      const item = sessionStorage.getItem(key);
      if (item) {
        const entry = JSON.parse(item);
        if (Date.now() - entry.timestamp > entry.ttl) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      sessionStorage.removeItem(key);
    }
  });
}

export function exportCache(): string {
  const data = {
    session: {} as Record<string, any>,
    local: {} as Record<string, any>,
  };

  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('oxcast_cache_')) {
      data.session[key] = sessionStorage.getItem(key);
    }
  });

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('oxcast_cache_')) {
      data.local[key] = localStorage.getItem(key);
    }
  });

  return JSON.stringify(data, null, 2);
}

export function importCache(jsonData: string): void {
  try {
    const data = JSON.parse(jsonData);
    
    Object.entries(data.session || {}).forEach(([key, value]) => {
      sessionStorage.setItem(key, value as string);
    });

    Object.entries(data.local || {}).forEach(([key, value]) => {
      localStorage.setItem(key, value as string);
    });
  } catch (error) {
    console.error('Failed to import cache:', error);
  }
}
