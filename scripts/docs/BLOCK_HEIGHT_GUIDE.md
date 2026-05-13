# Block Height Management Guide

## Overview

This guide explains how block heights are managed in the 0xCast scripts to ensure markets are created with valid future timestamps.

## Dynamic Block Height Calculation

All scripts now use dynamic block height calculation instead of hardcoded values. This ensures:
- Markets are always created with future end dates
- Scripts remain functional regardless of when they're run
- No manual updates needed for block heights

## Block Height Configuration

The `block-height-config.ts` utility provides:

### Constants
- `BLOCKS_PER_DAY`: 144 blocks (10 minutes per block)
- `BLOCKS_PER_HOUR`: 6 blocks
- `BLOCKS_PER_WEEK`: 1,008 blocks

### Default Values
- `DEFAULT_MARKET_DURATION_DAYS`: 35 days
- `DEFAULT_RESOLUTION_BUFFER_DAYS`: 3 days

### Validation Limits
- `MIN_MARKET_DURATION_BLOCKS`: 144 blocks (1 day)
- `MAX_MARKET_DURATION_BLOCKS`: 43,200 blocks (300 days)
- `MIN_RESOLUTION_BUFFER_BLOCKS`: 72 blocks (12 hours)
- `MAX_RESOLUTION_BUFFER_BLOCKS`: 1,440 blocks (10 days)

## Usage Examples

### Basic Market Creation

```typescript
import { fetchCurrentBlockHeight } from './utils/block-height.js';
import { calculateMarketBlocks, validateMarketBlocks } from './utils/block-height-config.js';

const currentBlock = await fetchCurrentBlockHeight('mainnet');

const { endBlock, resolutionBlock } = calculateMarketBlocks(
    currentBlock,
    35,  // 35 days duration
    3    // 3 days resolution buffer
);

const validation = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
    process.exit(1);
}
```

### Custom Duration

```typescript
import { blocksFromDays, blocksFromHours } from './utils/block-height-config.js';

const durationBlocks = blocksFromDays(7);
const bufferBlocks = blocksFromHours(12);

const endBlock = currentBlock + durationBlocks;
const resolutionBlock = endBlock + bufferBlocks;
```

### Converting Blocks to Time

```typescript
import { daysFromBlocks, hoursFromBlocks } from './utils/block-height-config.js';

const duration = endBlock - currentBlock;
console.log(`Market duration: ${daysFromBlocks(duration).toFixed(1)} days`);
console.log(`Or: ${hoursFromBlocks(duration).toFixed(1)} hours`);
```

## Validation Rules

The system validates:

1. **End block is in the future**: `endBlock > currentBlock`
2. **Resolution block is after end block**: `resolutionBlock > endBlock`
3. **Minimum duration**: At least 1 day (144 blocks)
4. **Maximum duration**: No more than 300 days (43,200 blocks)
5. **Minimum resolution buffer**: At least 12 hours (72 blocks)
6. **Maximum resolution buffer**: No more than 10 days (1,440 blocks)

## Error Handling

If block height fetching fails:
1. The system retries up to 3 times with exponential backoff
2. If all retries fail and running interactively, prompts for manual input
3. Otherwise, throws an error

## Best Practices

1. **Always validate block heights** before creating markets
2. **Use configuration constants** instead of magic numbers
3. **Provide clear error messages** when validation fails
4. **Log block height calculations** for debugging
5. **Test with different durations** to ensure flexibility

## Troubleshooting

### "End block is in the past" Error

This error occurs when:
- The Hiro API is slow to respond
- System clock is incorrect
- Network latency causes stale data

**Solution**: The script automatically fetches fresh block heights. If the error persists, check your system clock and network connection.

### "Market duration too short" Error

**Solution**: Increase the `MARKET_DURATION_DAYS` constant or pass a larger value to `calculateMarketBlocks()`.

### "Resolution buffer too short" Error

**Solution**: Increase the `RESOLUTION_BUFFER_DAYS` constant or pass a larger value to `calculateMarketBlocks()`.

## Migration from Hardcoded Values

Old approach (deprecated):
```typescript
const END_BLOCK_HEIGHT = 6043000;
const RESOLUTION_BLOCK_HEIGHT = 6043500;
```

New approach:
```typescript
const currentBlock = await fetchCurrentBlockHeight('mainnet');
const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock);
```

## API Reference

### `fetchCurrentBlockHeight(network, maxRetries, retryDelayMs, timeoutMs)`

Fetches the current Stacks block height from the Hiro API.

**Parameters:**
- `network`: 'mainnet' | 'testnet' | 'devnet'
- `maxRetries`: Number of retry attempts (default: 3)
- `retryDelayMs`: Delay between retries in milliseconds (default: 2000)
- `timeoutMs`: Request timeout in milliseconds (default: 5000)

**Returns:** `Promise<number>` - Current block height

### `calculateMarketBlocks(currentBlock, durationDays, resolutionBufferDays)`

Calculates end and resolution block heights.

**Parameters:**
- `currentBlock`: Current block height
- `durationDays`: Market duration in days (default: 35)
- `resolutionBufferDays`: Resolution buffer in days (default: 3)

**Returns:** `{ endBlock: number; resolutionBlock: number }`

### `validateMarketBlocks(currentBlock, endBlock, resolutionBlock)`

Validates block heights against rules.

**Parameters:**
- `currentBlock`: Current block height
- `endBlock`: Market end block
- `resolutionBlock`: Market resolution block

**Returns:** `{ valid: boolean; errors: string[] }`

### `blocksFromDays(days)` / `blocksFromHours(hours)`

Converts time to blocks.

**Returns:** `number` - Number of blocks

### `daysFromBlocks(blocks)` / `hoursFromBlocks(blocks)`

Converts blocks to time.

**Returns:** `number` - Time in days/hours

## Future Improvements

- Add support for custom block time configurations
- Implement block height caching for performance
- Add WebSocket support for real-time block updates
- Create a block height monitoring service
