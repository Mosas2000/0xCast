# Block Height Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Block height is in the past"

**Symptoms:**
- Script fails with error about past block heights
- Market creation rejected

**Causes:**
- Using hardcoded block heights
- Stale cached data
- System clock incorrect

**Solutions:**
1. Ensure script uses dynamic block heights:
   ```typescript
   const currentBlock = await fetchCurrentBlockHeight('mainnet');
   const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock);
   ```

2. Clear cache and retry:
   ```typescript
   clearBlockHeightCache();
   const currentBlock = await fetchCurrentBlockHeight('mainnet');
   ```

3. Check system clock:
   ```bash
   date
   ```

### Issue: "Hiro API unreachable"

**Symptoms:**
- Network errors when fetching block height
- Timeout errors
- Connection refused

**Causes:**
- No internet connection
- Hiro API down
- Firewall blocking requests
- Rate limiting

**Solutions:**
1. Check internet connection:
   ```bash
   ping api.mainnet.hiro.so
   ```

2. Try manual input (script will prompt automatically)

3. Use alternative network:
   ```typescript
   const currentBlock = await fetchCurrentBlockHeight('testnet');
   ```

4. Increase timeout:
   ```typescript
   const currentBlock = await fetchCurrentBlockHeight('mainnet', 5, 3000, 10000);
   ```

### Issue: "Validation failed"

**Symptoms:**
- Block heights calculated but validation fails
- Error messages about duration or buffer

**Causes:**
- Duration too short or too long
- Resolution buffer outside limits
- Invalid block height values

**Solutions:**
1. Check duration limits (1-300 days):
   ```typescript
   const { endBlock, resolutionBlock } = calculateMarketBlocks(
       currentBlock,
       30,  // Must be 1-300
       3    // Must be 0.5-10
   );
   ```

2. Use validation to see specific errors:
   ```typescript
   const validation = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
   console.log(validation.errors);
   ```

3. Use recovery function:
   ```typescript
   const result = await recoverBlockHeights('mainnet', 30, 3);
   if (!result.success) {
       console.error(result.error);
   }
   ```

### Issue: "Cache returning stale data"

**Symptoms:**
- Block height doesn't update
- Same value returned multiple times
- Outdated block heights

**Causes:**
- Cache TTL not expired (60 seconds)
- Multiple rapid calls

**Solutions:**
1. Clear cache manually:
   ```typescript
   clearBlockHeightCache();
   ```

2. Disable cache for specific call:
   ```typescript
   const currentBlock = await fetchCurrentBlockHeight('mainnet', 3, 2000, 5000, false);
   ```

3. Wait for cache to expire (60 seconds)

### Issue: "Script hangs or times out"

**Symptoms:**
- Script stops responding
- No error message
- Long wait times

**Causes:**
- Network issues
- API slow to respond
- Infinite retry loop

**Solutions:**
1. Reduce timeout:
   ```typescript
   const currentBlock = await fetchCurrentBlockHeight('mainnet', 2, 1000, 3000);
   ```

2. Check network:
   ```bash
   curl https://api.mainnet.hiro.so/v2/info
   ```

3. Use recovery with limits:
   ```typescript
   const result = await recoverBlockHeights('mainnet', 30, 3, {
       maxRetries: 3,
       retryDelayMs: 2000
   });
   ```

### Issue: "Incorrect block calculations"

**Symptoms:**
- Wrong number of blocks calculated
- Duration doesn't match expected
- Off-by-one errors

**Causes:**
- Using wrong conversion function
- Rounding errors
- Incorrect constants

**Solutions:**
1. Use provided conversion functions:
   ```typescript
   const blocks = blocksFromDays(30);  // Not 30 * 144
   ```

2. Check constants:
   ```typescript
   console.log(BLOCK_HEIGHT_CONFIG.BLOCKS_PER_DAY);  // Should be 144
   ```

3. Validate calculations:
   ```typescript
   const days = daysFromBlocks(blocks);
   console.log(`${blocks} blocks = ${days} days`);
   ```

### Issue: "Tests failing"

**Symptoms:**
- Unit tests fail
- Validation tests fail
- Integration tests fail

**Causes:**
- Hardcoded test values
- Network dependency in tests
- Time-dependent tests

**Solutions:**
1. Mock network calls in tests:
   ```typescript
   vi.mock('../block-height.js', () => ({
       fetchCurrentBlockHeight: vi.fn().mockResolvedValue(1000000)
   }));
   ```

2. Use fixed values for tests:
   ```typescript
   const currentBlock = 1000000;  // Fixed for testing
   ```

3. Run validation:
   ```bash
   npm run validate-blocks
   ```

## Debugging Tips

### Enable Verbose Logging

Add console logs to track execution:
```typescript
console.log('Fetching block height...');
const currentBlock = await fetchCurrentBlockHeight('mainnet');
console.log(`Got block: ${currentBlock}`);
```

### Check API Response

Test API directly:
```bash
curl https://api.mainnet.hiro.so/v2/info | jq '.stacks_tip_height'
```

### Verify Calculations

Use formatter to check values:
```typescript
import { formatBlockTimeline } from './utils/block-height-formatter.js';
console.log(formatBlockTimeline(currentBlock, endBlock, resolutionBlock));
```

### Monitor Block Heights

Use monitoring tool:
```typescript
import { BlockHeightMonitor } from './utils/block-height-monitor.js';
const monitor = new BlockHeightMonitor('mainnet');
await monitor.takeSnapshot();
monitor.printStatistics();
```

## Getting Help

1. Check documentation:
   - [Block Height Guide](./BLOCK_HEIGHT_GUIDE.md)
   - [Quick Reference](./QUICK_REFERENCE.md)
   - [Migration Guide](./MIGRATION_GUIDE.md)

2. Run validation:
   ```bash
   npm run validate-blocks
   ```

3. Check examples:
   ```bash
   tsx scripts/examples/block-height-usage.ts
   ```

4. Open an issue on GitHub with:
   - Error message
   - Script being run
   - Network (mainnet/testnet)
   - Current block height
   - Expected vs actual behavior

## Prevention

### Best Practices

1. Always use dynamic block heights
2. Validate before creating markets
3. Handle errors gracefully
4. Log important values
5. Test with different durations
6. Monitor API availability
7. Use recovery functions
8. Keep dependencies updated

### Code Review Checklist

- [ ] No hardcoded block heights
- [ ] Uses `fetchCurrentBlockHeight()`
- [ ] Validates block heights
- [ ] Handles API errors
- [ ] Logs important values
- [ ] Tests pass
- [ ] Documentation updated
