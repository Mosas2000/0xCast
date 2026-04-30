export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  ttl?: number;
  storage?: 'memory' | 'session' | 'local';
}

export type CacheStorage = 'memory' | 'session' | 'local';

export type InvalidationStrategy = 'immediate' | 'delayed' | 'smart';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  cached: boolean;
}

export interface CacheStats {
  memoryCacheSize: number;
  sessionCacheSize: number;
  localCacheSize: number;
}

export interface PerformanceSummary {
  count: number;
  averageDuration: number;
  cacheHitRate: number;
  improvement: number;
}
