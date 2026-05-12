# Block Height Edge Cases and Handling

## Overview

This document describes edge cases in block height management and how the system handles them.

## Network Edge Cases

### 1. Network Downtime

**Scenario:** Hiro API is temporarily unavailable.

**Handling:**
- Automatic retry with exponential backoff (3 attempts)
- Clear error messages indicating network issues
- Suggestion to use manual fallback
- Cache serves stale data if available

**Example:**
```typescript
try {
  const height = await fetchCurrentBlockHeight('mainnet');
} catch (error) {
  console.error('Network unavailable. Use manual fallback.');
}
```

### 2. API Rate Limiting

**Scenario:** Too many requests to Hiro API.

**Handling:**
- 60-second cache reduces API calls
- Retry logic respects rate limits
- Exponential backoff prevents hammering
- Batch operations share cache

**Prevention:**
```typescript
// Cache prevents excessive API calls
const height1 = await fetchCurrentBlockHeight('mainnet', true);
const height2 = await fetchCurrentBlockHeight('mainnet', true); // Uses cache
```

### 3. Slow Network Response

**Scenario:** API response takes longer than expected.

**Handling:**
- 5-second timeout per request
- Retry on timeout
- Progress indication for users
- Fallback to manual input

**Configuration:**
```typescript
const height = await fetchCurrentBlockHeight(
  'mainnet',
  3,        // retries
  2000,     // delay
  5000      // timeout
);
```

## Block Height Edge Cases

### 4. Block Reorganization

**Scenario:** Blockchain reorganization causes block height to decrease temporarily.

**Handling:**
- Validation checks for decreasing heights
- Warning messages for unusual patterns
- Cache invalidation on suspicious changes
- Manual verification option

**Detection:**
```typescript
if (newHeight < cachedHeight) {
  console.warn('Block height decreased. Possible reorg.');
  invalidateCache();
}
```

### 5. Extremely Long Market Duration

**Scenario:** User requests market duration exceeding limits.

**Handling:**
- Validation rejects durations > 300 days
- Clear error message with limits
- Suggestion for reasonable duration
- Override option for special cases

**Validation:**
```typescript
const validation = validateMarketBlocks(current, end, resolution);
if (!validation.valid) {
  console.error(validation.errors);
  // Errors include specific limit violations
}
```

### 6. Very Short Market Duration

**Scenario:** User requests market duration below minimum.

**Handling:**
- Validation rejects durations < 1 day
- Clear error message with minimum
- Explanation of why minimum exists
- Suggestion for reasonable duration

**Example Error:**
```
Market duration (50 blocks) is too short.
Minimum: 144 blocks (1.0 days)
```

### 7. Past Block Heights

**Scenario:** Calculated end block is in the past.

**Handling:**
- Validation catches past blocks
- Clear error with current block
- Automatic recalculation suggestion
- Prevents transaction submission

**Check:**
```typescript
if (endBlock <= currentBlock) {
  throw new Error(`End block must be in future`);
}
```

### 8. Resolution Before End

**Scenario:** Resolution block is before or equal to end block.

**Handling:**
- Validation enforces resolution > end
- Clear error message
- Explanation of buffer requirement
- Automatic correction suggestion

**Validation:**
```typescript
if (resolutionBlock <= endBlock) {
  throw new Error('Resolution must be after end block');
}
```

## Time Conversion Edge Cases

### 9. Fractional Days

**Scenario:** Duration specified as fractional days (e.g., 1.5 days).

**Handling:**
- Conversion rounds down to whole blocks
- Clear indication of actual block count
- Display shows both days and blocks
- No precision loss in calculations

**Example:**
```typescript
const blocks = blocksFromDays(1.5); // 216 blocks
const days = daysFromBlocks(216);   // 1.5 days
```

### 10. Very Large Numbers

**Scenario:** Block heights exceed JavaScript safe integer limit.

**Handling:**
- All calculations use standard numbers
- Validation prevents unrealistic values
- Display formatting handles large numbers
- No overflow in reasonable ranges

**Safe Range:**
```typescript
// Current mainnet: ~7.9M blocks
// Max duration: 43,200 blocks (300 days)
// Total: ~8M blocks (well within safe range)
```

## Cache Edge Cases

### 11. Stale Cache

**Scenario:** Cached value is older than TTL but still returned.

**Handling:**
- TTL strictly enforced (60 seconds)
- Automatic refresh on expiry
- Source tracking (api/cache/manual)
- Manual cache invalidation available

**Cache Management:**
```typescript
// Cache automatically expires after 60s
// Force refresh by disabling cache
const fresh = await fetchCurrentBlockHeight('mainnet', false);
```

### 12. Cache Corruption

**Scenario:** Cached data becomes invalid or corrupted.

**Handling:**
- Type validation on cache read
- Automatic invalidation on invalid data
- Fallback to fresh fetch
- Error logging for debugging

**Protection:**
```typescript
if (typeof cachedHeight !== 'number' || cachedHeight < 0) {
  invalidateCache();
  return fetchFresh();
}
```

## Concurrent Request Edge Cases

### 13. Race Conditions

**Scenario:** Multiple scripts fetch block height simultaneously.

**Handling:**
- Cache prevents duplicate API calls
- First request populates cache
- Subsequent requests use cached value
- Thread-safe cache operations

**Behavior:**
```typescript
// All requests within 60s use same cached value
Promise.all([
  fetchCurrentBlockHeight('mainnet'),
  fetchCurrentBlockHeight('mainnet'),
  fetchCurrentBlockHeight('mainnet')
]); // Only 1 API call made
```

### 14. Cache Invalidation During Fetch

**Scenario:** Cache invalidated while fetch in progress.

**Handling:**
- In-flight requests complete normally
- New requests trigger fresh fetch
- No duplicate fetches
- Consistent state maintained

## User Input Edge Cases

### 15. Invalid Network Name

**Scenario:** User provides invalid network identifier.

**Handling:**
- Validation rejects unknown networks
- Clear error with valid options
- Case-insensitive matching
- Helpful suggestions

**Validation:**
```typescript
const validNetworks = ['mainnet', 'testnet'];
if (!validNetworks.includes(network.toLowerCase())) {
  throw new Error(`Invalid network. Use: ${validNetworks.join(', ')}`);
}
```

### 16. Negative or Zero Values

**Scenario:** User provides negative or zero duration.

**Handling:**
- Validation rejects non-positive values
- Clear error message
- Minimum value suggestion
- Type checking prevents invalid input

**Check:**
```typescript
if (durationDays <= 0) {
  throw new Error('Duration must be positive');
}
```

### 17. Non-Numeric Input

**Scenario:** User provides non-numeric values.

**Handling:**
- Type validation at function entry
- Clear error with expected type
- Parsing attempt for string numbers
- Graceful error handling

**Validation:**
```typescript
if (typeof days !== 'number' || isNaN(days)) {
  throw new TypeError('Duration must be a number');
}
```

## Recovery Strategies

### Automatic Recovery

1. **Retry Logic:** 3 attempts with exponential backoff
2. **Cache Fallback:** Use stale cache if fresh fetch fails
3. **Manual Fallback:** Prompt user for manual input
4. **Graceful Degradation:** Continue with warnings

### Manual Recovery

1. **Cache Invalidation:** Clear cache and retry
2. **Manual Input:** Provide block height manually
3. **Configuration Override:** Adjust validation limits
4. **Network Switch:** Try different API endpoint

## Testing Edge Cases

All edge cases are covered in test suites:

```bash
npm test scripts/utils/__tests__/block-height-config.test.ts
npm test scripts/utils/__tests__/block-height-performance.test.ts
```

## Monitoring Edge Cases

Monitor for edge cases in production:

```typescript
import { BlockHeightMonitor } from './block-height-monitor';

const monitor = new BlockHeightMonitor();
monitor.on('anomaly', (event) => {
  console.warn('Block height anomaly detected:', event);
});
```

## Best Practices

1. **Always Validate:** Use validation before transactions
2. **Handle Errors:** Implement proper error handling
3. **Use Cache:** Enable caching to reduce API calls
4. **Monitor:** Track block height patterns
5. **Test:** Cover edge cases in tests
6. **Document:** Note any unusual behavior
7. **Fallback:** Always have manual fallback option

## Conclusion

The block height system is designed to handle all common edge cases gracefully. Proper error handling, validation, caching, and recovery mechanisms ensure robust operation even in adverse conditions.

For additional support, see:
- `TROUBLESHOOTING.md` - Common issues and solutions
- `BEST_PRACTICES.md` - Recommended usage patterns
- `BLOCK_HEIGHT_GUIDE.md` - Complete usage guide
