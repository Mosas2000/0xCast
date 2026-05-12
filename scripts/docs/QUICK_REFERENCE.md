# Block Height Quick Reference

## Common Tasks

### Get Current Block Height
```typescript
import { fetchCurrentBlockHeight } from './utils/block-height.js';

const currentBlock = await fetchCurrentBlockHeight('mainnet');
```

### Calculate Market Blocks
```typescript
import { calculateMarketBlocks } from './utils/block-height-config.js';

const { endBlock, resolutionBlock } = calculateMarketBlocks(
    currentBlock,
    30,  // 30 days duration
    3    // 3 days buffer
);
```

### Validate Block Heights
```typescript
import { validateMarketBlocks } from './utils/block-height-config.js';

const validation = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
if (!validation.valid) {
    console.error(validation.errors);
}
```

### Convert Time to Blocks
```typescript
import { blocksFromDays, blocksFromHours } from './utils/block-height-config.js';

const blocks = blocksFromDays(7);        // 1008 blocks
const blocks = blocksFromHours(12);      // 72 blocks
```

### Convert Blocks to Time
```typescript
import { daysFromBlocks, hoursFromBlocks } from './utils/block-height-config.js';

const days = daysFromBlocks(1008);       // 7 days
const hours = hoursFromBlocks(72);       // 12 hours
```

## Constants

```typescript
import { BLOCK_HEIGHT_CONFIG } from './utils/block-height-config.js';

BLOCK_HEIGHT_CONFIG.BLOCKS_PER_DAY              // 144
BLOCK_HEIGHT_CONFIG.BLOCKS_PER_HOUR             // 6
BLOCK_HEIGHT_CONFIG.BLOCKS_PER_WEEK             // 1008
BLOCK_HEIGHT_CONFIG.DEFAULT_MARKET_DURATION_DAYS // 35
BLOCK_HEIGHT_CONFIG.DEFAULT_RESOLUTION_BUFFER_DAYS // 3
```

## Validation Limits

```typescript
MIN_MARKET_DURATION_BLOCKS: 144        // 1 day
MAX_MARKET_DURATION_BLOCKS: 43200      // 300 days
MIN_RESOLUTION_BUFFER_BLOCKS: 72       // 12 hours
MAX_RESOLUTION_BUFFER_BLOCKS: 1440     // 10 days
```

## Error Handling

```typescript
import { safeGetBlockHeights } from './utils/block-height-recovery.js';

try {
    const { currentBlock, endBlock, resolutionBlock } = 
        await safeGetBlockHeights('mainnet', 30, 3);
} catch (error) {
    console.error('Failed to get block heights:', error);
}
```

## Formatting

```typescript
import {
    formatBlockHeight,
    formatBlockDuration,
    formatBlockTimeline
} from './utils/block-height-formatter.js';

console.log(formatBlockHeight(7936081));           // "7,936,081"
console.log(formatBlockDuration(5040));            // "35 days"
console.log(formatBlockTimeline(current, end, res)); // Multi-line timeline
```

## Monitoring

```typescript
import { BlockHeightMonitor } from './utils/block-height-monitor.js';

const monitor = new BlockHeightMonitor('mainnet');
monitor.startMonitoring(60000);  // Check every minute
// ... later ...
monitor.stopMonitoring();
monitor.printStatistics();
```

## Caching

```typescript
import { clearBlockHeightCache } from './utils/block-height.js';

// Force fresh fetch
clearBlockHeightCache();
const currentBlock = await fetchCurrentBlockHeight('mainnet');
```

## Complete Example

```typescript
import { fetchCurrentBlockHeight } from './utils/block-height.js';
import { calculateMarketBlocks, validateMarketBlocks } from './utils/block-height-config.js';
import { formatBlockTimeline } from './utils/block-height-formatter.js';

async function createMarket() {
    // Fetch current block
    const currentBlock = await fetchCurrentBlockHeight('mainnet');
    
    // Calculate future blocks
    const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock, 30, 3);
    
    // Validate
    const validation = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
    if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Display timeline
    console.log(formatBlockTimeline(currentBlock, endBlock, resolutionBlock));
    
    // Create market with validated blocks
    await makeContractCall({
        functionArgs: [
            stringAsciiCV(question),
            uintCV(endBlock),
            uintCV(resolutionBlock),
        ],
    });
}
```

## NPM Scripts

```bash
npm run validate-blocks    # Validate all scripts for hardcoded values
npm run interact           # Run interact-contract with dynamic blocks
```

## Troubleshooting

### API Unreachable
- Script will retry 3 times automatically
- Manual input prompt appears if interactive
- Check network connection

### Validation Fails
- Check duration is 1-300 days
- Check buffer is 12 hours - 10 days
- Verify current block is accurate

### Cache Issues
- Cache expires after 60 seconds
- Use `clearBlockHeightCache()` to force refresh
- Pass `useCache: false` to `fetchCurrentBlockHeight()`

## See Also

- [Block Height Guide](./BLOCK_HEIGHT_GUIDE.md) - Complete documentation
- [Migration Guide](./MIGRATION_GUIDE.md) - Upgrade from hardcoded values
- [Scripts README](../README.md) - General scripts documentation
