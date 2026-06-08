export const cacheConfig = {
  enabled: true,
  
  ttl: {
    marketData: 30 * 1000,
    marketList: 60 * 1000,
    userData: 15 * 1000,
    contractRead: 45 * 1000,
    staticData: 5 * 60 * 1000,
  },
  
  storage: {
    default: 'memory' as const,
    persistent: 'local' as const,
    session: 'session' as const,
  },
  
  invalidation: {
    immediate: 0,
    delayed: 2000,
    smart: 5000,
  },
  
  performance: {
    trackMetrics: true,
    maxMetrics: 100,
    metricsUpdateInterval: 3000,
  },
  
  serviceWorker: {
    enabled: true,
    cacheName: 'oxcast-v1',
    runtimeCache: 'oxcast-runtime',
  },
};

export function updateCacheConfig(updates: Partial<typeof cacheConfig>): void {
  Object.assign(cacheConfig, updates);
}
