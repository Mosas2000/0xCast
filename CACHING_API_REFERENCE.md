# Caching API Reference

## Cache Manager

### `cacheManager.set(key, data, options)`
Stores data in cache.

**Parameters:**
- `key` (string): Unique cache key
- `data` (any): Data to cache
- `options` (object):
  - `ttl` (number): Time to live in milliseconds
  - `storage` ('memory' | 'session' | 'local'): Storage tier

**Example:**
```typescript
cacheManager.set('market_1', marketData, {
  ttl: 30000,
  storage: 'memory'
});
```

### `cacheManager.get(key, storage)`
Retrieves data from cache.

**Parameters:**
- `key` (string): Cache key
- `storage` ('memory' | 'session' | 'local'): Storage tier

**Returns:** Cached data or null if expired/not found

**Example:**
```typescript
const data = cacheManager.get('market_1', 'memory');
```

### `cacheManager.delete(key, storage)`
Removes data from cache.

**Parameters:**
- `key` (string): Cache key
- `storage` ('memory' | 'session' | 'local'): Storage tier

**Example:**
```typescript
cacheManager.delete('market_1', 'memory');
```

### `cacheManager.clear(storage)`
Clears all cache data.

**Parameters:**
- `storage` ('memory' | 'session' | 'local' | undefined): Storage tier to clear

**Example:**
```typescript
cacheManager.clear('memory');
cacheManager.clear(); // Clears all tiers
```

### `cacheManager.has(key, storage)`
Checks if key exists in cache.

**Parameters:**
- `key` (string): Cache key
- `storage` ('memory' | 'session' | 'local'): Storage tier

**Returns:** boolean

**Example:**
```typescript
if (cacheManager.has('market_1', 'memory')) {
  // Data exists
}
```

## Market Cache Service

### `marketCacheService.setMarket(marketId, market)`
Caches market data.

**Parameters:**
- `marketId` (number): Market ID
- `market` (Market): Market object

**Example:**
```typescript
marketCacheService.setMarket(1, marketData);
```

### `marketCacheService.getMarket(marketId)`
Retrieves cached market data.

**Parameters:**
- `marketId` (number): Market ID

**Returns:** Market object or null

**Example:**
```typescript
const market = marketCacheService.getMarket(1);
```

### `marketCacheService.setMarketList(markets)`
Caches market list.

**Parameters:**
- `markets` (Market[]): Array of markets

**Example:**
```typescript
marketCacheService.setMarketList(markets);
```

### `marketCacheService.getMarketList()`
Retrieves cached market list.

**Returns:** Market array or null

**Example:**
```typescript
const markets = marketCacheService.getMarketList();
```

### `marketCacheService.invalidateMarket(marketId)`
Invalidates specific market cache.

**Parameters:**
- `marketId` (number): Market ID

**Example:**
```typescript
marketCacheService.invalidateMarket(1);
```

### `marketCacheService.invalidateAll()`
Clears all market cache.

**Example:**
```typescript
marketCacheService.invalidateAll();
```

## Cache Invalidation Service

### `cacheInvalidationService.invalidateOnTransaction(txType, marketId)`
Invalidates cache based on transaction type.

**Parameters:**
- `txType` (string): Transaction type
- `marketId` (number, optional): Market ID

**Example:**
```typescript
cacheInvalidationService.invalidateOnTransaction('stake', 1);
```

### `cacheInvalidationService.invalidateMarket(marketId, strategy)`
Invalidates market with strategy.

**Parameters:**
- `marketId` (number): Market ID
- `strategy` ('immediate' | 'delayed' | 'smart'): Invalidation strategy

**Example:**
```typescript
cacheInvalidationService.invalidateMarket(1, 'smart');
```

### `cacheInvalidationService.invalidateMarketList(strategy)`
Invalidates market list.

**Parameters:**
- `strategy` ('immediate' | 'delayed' | 'smart'): Invalidation strategy

**Example:**
```typescript
cacheInvalidationService.invalidateMarketList('immediate');
```

## Performance Monitor

### `performanceMonitor.startMeasure(name)`
Starts performance measurement.

**Parameters:**
- `name` (string): Operation name

**Returns:** Function to end measurement

**Example:**
```typescript
const endMeasure = performanceMonitor.startMeasure('fetch-market');
await fetchMarket();
endMeasure(false); // false = not cached
```

### `performanceMonitor.getMetrics(name)`
Gets performance metrics.

**Parameters:**
- `name` (string, optional): Operation name

**Returns:** Array of metrics

**Example:**
```typescript
const metrics = performanceMonitor.getMetrics('fetch-market');
```

### `performanceMonitor.getAverageDuration(name)`
Gets average operation duration.

**Parameters:**
- `name` (string): Operation name

**Returns:** Average duration in milliseconds

**Example:**
```typescript
const avg = performanceMonitor.getAverageDuration('fetch-market');
```

### `performanceMonitor.getCacheHitRate(name)`
Gets cache hit rate percentage.

**Parameters:**
- `name` (string): Operation name

**Returns:** Hit rate percentage

**Example:**
```typescript
const hitRate = performanceMonitor.getCacheHitRate('fetch-market');
```

### `performanceMonitor.getPerformanceImprovement(name)`
Gets performance improvement percentage.

**Parameters:**
- `name` (string): Operation name

**Returns:** Improvement percentage

**Example:**
```typescript
const improvement = performanceMonitor.getPerformanceImprovement('fetch-market');
```

### `performanceMonitor.getSummary()`
Gets summary of all metrics.

**Returns:** Object with metrics summary

**Example:**
```typescript
const summary = performanceMonitor.getSummary();
```

## React Hooks

### `useCache(options)`
React hook for caching data.

**Parameters:**
- `options` (object):
  - `key` (string): Cache key
  - `fetcher` (function): Data fetcher function
  - `ttl` (number): Time to live
  - `storage` (string): Storage tier
  - `enabled` (boolean): Enable/disable caching

**Returns:** Object with data, loading state, and cache status

**Example:**
```typescript
const { data, isLoading, isCached, refetch } = useCache({
  key: 'market_1',
  fetcher: () => fetchMarket(1),
  ttl: 30000,
  storage: 'memory',
});
```

### `useCachedMarket(options)`
React hook for cached market data.

**Parameters:**
- `options` (object):
  - `marketId` (number): Market ID
  - `enabled` (boolean): Enable/disable

**Returns:** Object with market data and cache status

**Example:**
```typescript
const { data: market, isLoading, isCached } = useCachedMarket({
  marketId: 1,
  enabled: true,
});
```

### `useCachedData(options)`
React hook with performance tracking.

**Parameters:**
- `options` (object):
  - `key` (string): Cache key
  - `fetcher` (function): Data fetcher
  - `ttl` (number): Time to live
  - `storage` (string): Storage tier
  - `enabled` (boolean): Enable/disable
  - `onSuccess` (function): Success callback
  - `onError` (function): Error callback

**Returns:** Object with data, loading, and cache status

**Example:**
```typescript
const { data, isLoading, isCached } = useCachedData({
  key: 'market_1',
  fetcher: () => fetchMarket(1),
  onSuccess: (data, cached) => {
    console.log('Data loaded', cached ? 'from cache' : 'from API');
  },
});
```

## Constants

### `CACHE_TTL`
Default TTL values for different data types.

```typescript
CACHE_TTL = {
  MARKET_DATA: 30000,
  MARKET_LIST: 60000,
  USER_DATA: 15000,
  CONTRACT_READ: 45000,
  STATIC_DATA: 300000,
}
```

### `CACHE_KEYS`
Helper functions for generating cache keys.

```typescript
CACHE_KEYS = {
  MARKET: (id) => `market_${id}`,
  MARKET_LIST: 'market_list',
  USER_STAKE: (marketId, address) => `user_stake_${marketId}_${address}`,
}
```
