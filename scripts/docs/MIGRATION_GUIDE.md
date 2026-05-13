# Migration Guide: Hardcoded to Dynamic Block Heights

## Overview

This guide helps you migrate from hardcoded block heights to the new dynamic block height system.

## Problem with Hardcoded Block Heights

The old approach used fixed block height values:

```typescript
const END_BLOCK_HEIGHT = 6043000;
const RESOLUTION_BLOCK_HEIGHT = 6043500;
```

**Issues:**
- Scripts fail when block heights are in the past
- Requires manual updates every time you run the script
- Not maintainable for production use
- Causes confusion for new developers

## New Dynamic Approach

The new system automatically fetches current block heights and calculates future blocks:

```typescript
import { fetchCurrentBlockHeight } from './utils/block-height.js';
import { calculateMarketBlocks } from './utils/block-height-config.js';

const currentBlock = await fetchCurrentBlockHeight('mainnet');
const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock, 35, 3);
```

## Migration Steps

### Step 1: Remove Hardcoded Constants

**Before:**
```typescript
const END_BLOCK_HEIGHT = 6043000;
const RESOLUTION_BLOCK_HEIGHT = 6043500;
```

**After:**
```typescript
const MARKET_DURATION_DAYS = 35;
const RESOLUTION_BUFFER_DAYS = 3;
```

### Step 2: Import Required Utilities

Add these imports at the top of your script:

```typescript
import { fetchCurrentBlockHeight } from './utils/block-height.js';
import {
    calculateMarketBlocks,
    validateMarketBlocks,
    BLOCK_HEIGHT_CONFIG
} from './utils/block-height-config.js';
```

### Step 3: Fetch Current Block Height

Add this code before creating markets:

```typescript
console.log('⏱️  Fetching current block height...');
const currentBlock = await fetchCurrentBlockHeight('mainnet');
console.log(`Current Stacks block: ${currentBlock.toLocaleString()}`);
```

### Step 4: Calculate Market Blocks

Replace hardcoded values with dynamic calculation:

**Before:**
```typescript
const endBlock = END_BLOCK_HEIGHT;
const resolutionBlock = RESOLUTION_BLOCK_HEIGHT;
```

**After:**
```typescript
const { endBlock, resolutionBlock } = calculateMarketBlocks(
    currentBlock,
    MARKET_DURATION_DAYS,
    RESOLUTION_BUFFER_DAYS
);
```

### Step 5: Add Validation

Add validation to catch errors early:

```typescript
const validation = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
if (!validation.valid) {
    console.error('❌ Block height validation failed:');
    validation.errors.forEach(error => console.error(`   - ${error}`));
    process.exit(1);
}
console.log('✅ Block heights validated successfully\n');
```

### Step 6: Update Error Messages

**Before:**
```typescript
if (endBlock <= currentBlock) {
    throw new Error('END_BLOCK_HEIGHT is in the past!');
}
```

**After:**
```typescript
// Validation is now handled by validateMarketBlocks()
// No need for manual checks
```

## Complete Example

### Before (Hardcoded)

```typescript
const END_BLOCK_HEIGHT = 6043000;
const RESOLUTION_BLOCK_HEIGHT = 6043500;

async function createMarket() {
    if (END_BLOCK_HEIGHT <= currentBlock) {
        throw new Error('Block height is in the past!');
    }
    
    await makeContractCall({
        functionArgs: [
            stringAsciiCV(question),
            uintCV(END_BLOCK_HEIGHT),
            uintCV(RESOLUTION_BLOCK_HEIGHT),
        ],
    });
}
```

### After (Dynamic)

```typescript
import { fetchCurrentBlockHeight } from './utils/block-height.js';
import { calculateMarketBlocks, validateMarketBlocks } from './utils/block-height-config.js';

const MARKET_DURATION_DAYS = 35;
const RESOLUTION_BUFFER_DAYS = 3;

async function createMarket() {
    const currentBlock = await fetchCurrentBlockHeight('mainnet');
    
    const { endBlock, resolutionBlock } = calculateMarketBlocks(
        currentBlock,
        MARKET_DURATION_DAYS,
        RESOLUTION_BUFFER_DAYS
    );
    
    const validation = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
    if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    await makeContractCall({
        functionArgs: [
            stringAsciiCV(question),
            uintCV(endBlock),
            uintCV(resolutionBlock),
        ],
    });
}
```

## Benefits of Migration

1. **Always Works**: Scripts never fail due to outdated block heights
2. **No Maintenance**: No need to update values manually
3. **Better UX**: Clear error messages and validation
4. **Flexible**: Easy to adjust durations without calculating blocks
5. **Testable**: Comprehensive test coverage for block height logic
6. **Cached**: Reduces API calls with intelligent caching

## Configuration Options

### Custom Durations

```typescript
// Short-term market (7 days)
const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock, 7, 1);

// Long-term market (90 days)
const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock, 90, 5);
```

### Custom Block Offsets

If you prefer working with blocks directly:

```typescript
import { blocksFromDays } from './utils/block-height-config.js';

const endBlock = currentBlock + blocksFromDays(30);
const resolutionBlock = endBlock + blocksFromDays(3);
```

### Network-Specific Configuration

```typescript
// Mainnet
const currentBlock = await fetchCurrentBlockHeight('mainnet');

// Testnet
const currentBlock = await fetchCurrentBlockHeight('testnet');

// Devnet
const currentBlock = await fetchCurrentBlockHeight('devnet');
```

## Troubleshooting

### API Unreachable

If the Hiro API is down, the script will:
1. Retry 3 times with exponential backoff
2. Prompt for manual input if running interactively
3. Provide clear error messages with explorer link

### Validation Failures

If validation fails, check:
- Market duration is between 1 and 300 days
- Resolution buffer is between 12 hours and 10 days
- Current block height is accurate

### Cache Issues

If you need fresh block heights:

```typescript
import { clearBlockHeightCache } from './utils/block-height.js';

clearBlockHeightCache();
const currentBlock = await fetchCurrentBlockHeight('mainnet', 3, 2000, 5000, false);
```

## Testing

Test your migrated script:

```bash
# Run the script
npm run your-script

# Verify block heights are dynamic
# Check console output for:
# - "Fetching current block height..."
# - "Current Stacks block: [number]"
# - "Block heights validated successfully"
```

## Rollback Plan

If you need to temporarily revert:

1. Keep a backup of your old script
2. The old approach still works if you calculate blocks manually
3. However, we strongly recommend using the new system

## Support

For issues or questions:
- Check the [Block Height Guide](./BLOCK_HEIGHT_GUIDE.md)
- Review the [Scripts README](../README.md)
- Open an issue on GitHub

## Checklist

- [ ] Removed hardcoded block height constants
- [ ] Added imports for block height utilities
- [ ] Implemented dynamic block height fetching
- [ ] Added validation before market creation
- [ ] Updated error handling
- [ ] Tested script with current blockchain state
- [ ] Verified validation catches invalid inputs
- [ ] Confirmed script works without manual updates
