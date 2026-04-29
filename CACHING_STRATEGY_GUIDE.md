# Caching Strategy Implementation Guide

## Overview
This document describes the comprehensive caching strategy implemented to improve application performance, reduce API calls, and provide offline support.

## Architecture

### Core Components

1. **Cache Manager** (`frontend/src/utils/cache.ts`)
   - Multi-tier caching system (memory, session, local storage)
   - TTL-based expiration
   - Automatic cleanup

2. **Market Cache Service** (`frontend/src/services/MarketCacheService.ts`)
   - Specialized caching for market data
   - Configurable TTL per data type
   - Smart invalidation

3. **Cache Invalidation Service** (`frontend/src/services/CacheInvalidationService.ts`)
   - Multiple invalidation strategies (immediate, delayed, smart)
   - Transaction-based invalidation
   - Scheduled invalidation

4. **Performance Monitor** (`frontend/src/utils/performanceMonitor.ts`)
   - Tracks cache performance
   - Measures cache hit rates
   - Calculates performance improvements

## Cache Tiers

### Memory Cache
- Fastest access
- Cleared on page reload
- Best for frequently accessed data
- Default TTL: 30 seconds

### Session Storage
- Persists during browser session
- Survives page reloads
- Cleared when tab closes
- Best for user session data

### Local Storage
- Persists across sessions
- Survives browser restarts
- Manual cleanup required
- Best for static data

## TTL Configuration

```typescript
CACHE_TTL = {
  MARKET_DATA: 30 * 1000,      // 30 seconds
  MARKET_LIST: 60 * 1000,      // 1 minute
  USER_DATA: 15 * 1000,        // 15 seconds
  CONTRACT_READ: 45 * 1000,    // 45 seconds
  STATIC_DATA: 5 * 60 * 1000,  // 5 minutes
}
```

## Usage Examples

### Basic Caching

```typescript
import { useCache } from '../hooks/useCache';

function MyComponent() {
  const { data, isLoading, isCached } = useCache({
    key: 'my-data',
    fetcher: async () => {
      return await fetchData();
    },
    ttl: 60000,
    storage: 'memory',
  });

  return <div>{data}</div>;
}
```

### Market Data Caching

```typescript
import { useCachedMarket } from '../hooks/useCachedMarket';

function MarketView({ marketId }: { marketId: number }) {
  const { data: market, isLoading, isCached } = useCachedMarket({
    marketId,
    enabled: true,
  });

  return (
    <div>
      {isCached && <CacheStatus isCached={true} />}
      {market && <MarketCard market={market} />}
    </div>
  );
}
```

### Manual Cache Control

```typescript
import { cacheManager } from '../utils/cache';

// Set data
cacheManager.set('key', data, { ttl: 60000, storage: 'memory' });

// Get data
const data = cacheManager.get('key', 'memory');

// Delete data
cacheManager.delete('key', 'memory');

// Clear all
cacheManager.clear();
```

## Invalidation Strategies

### Immediate
Invalidates cache instantly. Use for critical updates.

```typescript
cacheInvalidationService.invalidateMarket(marketId, 'immediate');
```

### Delayed
Invalidates after 2 seconds. Use for non-critical updates.

```typescript
cacheInvalidationService.invalidateMarket(marketId, 'delayed');
```

### Smart
Invalidates after 5 seconds. Use for background updates.

```typescript
cacheInvalidationService.invalidateMarket(marketId, 'smart');
```

## Performance Monitoring

### Track Operations

```typescript
import { performanceMonitor } from '../utils/performanceMonitor';

const endMeasure = performanceMonitor.startMeasure('fetch-market');
const data = await fetchMarket();
endMeasure(false); // false = not cached
```

### View Metrics

```typescript
const summary = performanceMonitor.getSummary();
console.log(summary);
// {
//   'fetch-market': {
//     count: 10,
//     averageDuration: 150,
//     cacheHitRate: 70,
//     improvement: 85
//   }
// }
```

## Offline Support

### Service Worker
Automatically caches static assets and API responses for offline access.

### Registration

```typescript
import { register } from './utils/serviceWorkerRegistration';

register({
  onSuccess: () => console.log('Content cached for offline use'),
  onUpdate: () => console.log('New content available'),
});
```

## Best Practices

1. **Choose Appropriate TTL**
   - Short TTL for frequently changing data
   - Long TTL for static data
   - Consider user experience vs data freshness

2. **Use Correct Storage Tier**
   - Memory for hot data
   - Session for user-specific data
   - Local for persistent data

3. **Invalidate Strategically**
   - Immediate for user actions
   - Delayed for background updates
   - Smart for non-critical updates

4. **Monitor Performance**
   - Track cache hit rates
   - Measure performance improvements
   - Adjust TTL based on metrics

5. **Handle Cache Misses**
   - Always provide fallback
   - Show loading states
   - Handle errors gracefully

## Testing

### Cache Manager Tests
```bash
npm test cache.test.ts
```

### Market Cache Service Tests
```bash
npm test MarketCacheService.test.ts
```

### Performance Monitor Tests
```bash
npm test performanceMonitor.test.ts
```

## Troubleshooting

### Cache Not Working
1. Check TTL configuration
2. Verify storage availability
3. Check browser console for errors

### Stale Data
1. Reduce TTL
2. Implement manual refresh
3. Use invalidation on updates

### Performance Issues
1. Check cache hit rate
2. Adjust TTL values
3. Review storage tier usage

## Future Enhancements

1. Implement cache warming
2. Add cache preloading
3. Implement cache compression
4. Add cache analytics
5. Implement distributed caching
