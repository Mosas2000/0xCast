# Block Height Best Practices

## General Guidelines

### 1. Always Use Dynamic Block Heights

❌ **Don't:**
```typescript
const END_BLOCK_HEIGHT = 6043000;
const RESOLUTION_BLOCK_HEIGHT = 6043500;
```

✅ **Do:**
```typescript
const currentBlock = await fetchCurrentBlockHeight('mainnet');
const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock, 30, 3);
```

### 2. Validate Before Creating Markets

❌ **Don't:**
```typescript
const endBlock = currentBlock + 5000;
await createMarket(endBlock, endBlock + 500);
```

✅ **Do:**
```typescript
const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock, 30, 3);
const validation = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
}
await createMarket(endBlock, resolutionBlock);
```

### 3. Handle Errors Gracefully

❌ **Don't:**
```typescript
const currentBlock = await fetchCurrentBlockHeight('mainnet');
```

✅ **Do:**
```typescript
try {
    const currentBlock = await fetchCurrentBlockHeight('mainnet');
} catch (error) {
    console.error('Failed to fetch block height:', error);
    // Provide fallback or exit gracefully
}
```

### 4. Use Configuration Constants

❌ **Don't:**
```typescript
const blocks = days * 144;
```

✅ **Do:**
```typescript
import { blocksFromDays } from './utils/block-height-config.js';
const blocks = blocksFromDays(days);
```

### 5. Log Important Values

❌ **Don't:**
```typescript
const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock, 30, 3);
await createMarket(endBlock, resolutionBlock);
```

✅ **Do:**
```typescript
const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock, 30, 3);
console.log(`Creating market:`);
console.log(`  End block: ${endBlock.toLocaleString()}`);
console.log(`  Resolution block: ${resolutionBlock.toLocaleString()}`);
await createMarket(endBlock, resolutionBlock);
```

## Performance Optimization

### 1. Use Caching Wisely

```typescript
// First call fetches from API
const block1 = await fetchCurrentBlockHeight('mainnet');

// Subsequent calls within 60s use cache
const block2 = await fetchCurrentBlockHeight('mainnet');

// Force fresh fetch if needed
clearBlockHeightCache();
const block3 = await fetchCurrentBlockHeight('mainnet');
```

### 2. Batch Operations

```typescript
// Fetch once, use multiple times
const currentBlock = await fetchCurrentBlockHeight('mainnet');

const market1 = calculateMarketBlocks(currentBlock, 30, 3);
const market2 = calculateMarketBlocks(currentBlock, 60, 5);
const market3 = calculateMarketBlocks(currentBlock, 90, 7);
```

### 3. Avoid Unnecessary Fetches

```typescript
// Bad: Fetching in a loop
for (let i = 0; i < 10; i++) {
    const currentBlock = await fetchCurrentBlockHeight('mainnet');
    await createMarket(currentBlock);
}

// Good: Fetch once
const currentBlock = await fetchCurrentBlockHeight('mainnet');
for (let i = 0; i < 10; i++) {
    await createMarket(currentBlock);
}
```

## Error Handling

### 1. Use Recovery Functions

```typescript
import { safeGetBlockHeights } from './utils/block-height-recovery.js';

try {
    const { currentBlock, endBlock, resolutionBlock } = 
        await safeGetBlockHeights('mainnet', 30, 3);
} catch (error) {
    console.error('All recovery attempts failed:', error);
    process.exit(1);
}
```

### 2. Provide User Feedback

```typescript
console.log('⏱️  Fetching current block height...');
const currentBlock = await fetchCurrentBlockHeight('mainnet');
console.log(`✅ Current block: ${currentBlock.toLocaleString()}`);
```

### 3. Handle Network Issues

```typescript
const options = {
    maxRetries: 5,
    retryDelayMs: 3000,
    timeoutMs: 10000
};

const currentBlock = await fetchCurrentBlockHeight(
    'mainnet',
    options.maxRetries,
    options.retryDelayMs,
    options.timeoutMs
);
```

## Testing

### 1. Mock Network Calls

```typescript
import { vi } from 'vitest';

vi.mock('./utils/block-height.js', () => ({
    fetchCurrentBlockHeight: vi.fn().mockResolvedValue(1000000)
}));
```

### 2. Test Edge Cases

```typescript
describe('Block Height Edge Cases', () => {
    it('should handle minimum duration', () => {
        const result = calculateMarketBlocks(1000000, 1, 0.5);
        expect(result.endBlock).toBeGreaterThan(1000000);
    });

    it('should handle maximum duration', () => {
        const result = calculateMarketBlocks(1000000, 300, 10);
        expect(result.resolutionBlock).toBeLessThan(1050000);
    });
});
```

### 3. Validate in CI/CD

```bash
# Add to CI pipeline
npm run validate-blocks
```

## Documentation

### 1. Document Block Height Usage

```typescript
/**
 * Creates a prediction market with dynamic block heights
 * @param question - Market question
 * @param durationDays - Market duration in days (1-300)
 * @param bufferDays - Resolution buffer in days (0.5-10)
 */
async function createMarket(
    question: string,
    durationDays: number = 30,
    bufferDays: number = 3
) {
    const currentBlock = await fetchCurrentBlockHeight('mainnet');
    const { endBlock, resolutionBlock } = calculateMarketBlocks(
        currentBlock,
        durationDays,
        bufferDays
    );
    // ...
}
```

### 2. Include Examples

```typescript
// Example: Create a 30-day market
const currentBlock = await fetchCurrentBlockHeight('mainnet');
const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock, 30, 3);
```

### 3. Link to Documentation

```typescript
// See: scripts/docs/BLOCK_HEIGHT_GUIDE.md for details
const currentBlock = await fetchCurrentBlockHeight('mainnet');
```

## Code Review Checklist

- [ ] No hardcoded block heights
- [ ] Uses `fetchCurrentBlockHeight()` or `getCurrentBlockHeight()`
- [ ] Validates block heights before use
- [ ] Handles API errors gracefully
- [ ] Logs important values
- [ ] Uses configuration constants
- [ ] Includes error messages
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Performance considered

## Common Patterns

### Pattern 1: Simple Market Creation

```typescript
async function createSimpleMarket(question: string) {
    const currentBlock = await fetchCurrentBlockHeight('mainnet');
    const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock);
    
    const validation = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
    if (!validation.valid) {
        throw new Error(`Invalid blocks: ${validation.errors.join(', ')}`);
    }
    
    return await makeContractCall({
        functionArgs: [
            stringAsciiCV(question),
            uintCV(endBlock),
            uintCV(resolutionBlock),
        ],
    });
}
```

### Pattern 2: Batch Market Creation

```typescript
async function createMultipleMarkets(questions: string[]) {
    const currentBlock = await fetchCurrentBlockHeight('mainnet');
    
    for (const question of questions) {
        const { endBlock, resolutionBlock } = calculateMarketBlocks(currentBlock, 30, 3);
        await createMarket(question, endBlock, resolutionBlock);
        await sleep(3000);
    }
}
```

### Pattern 3: Custom Duration Markets

```typescript
async function createCustomMarket(
    question: string,
    durationDays: number,
    bufferDays: number
) {
    const { currentBlock, endBlock, resolutionBlock } = 
        await safeGetBlockHeights('mainnet', durationDays, bufferDays);
    
    console.log(formatBlockTimeline(currentBlock, endBlock, resolutionBlock));
    
    return await createMarket(question, endBlock, resolutionBlock);
}
```

## Anti-Patterns to Avoid

### ❌ Hardcoding Block Heights

```typescript
const END_BLOCK = 6043000;  // Will become outdated
```

### ❌ Ignoring Validation

```typescript
const endBlock = currentBlock + 5000;
await createMarket(endBlock, endBlock + 500);  // No validation
```

### ❌ Silent Failures

```typescript
try {
    const currentBlock = await fetchCurrentBlockHeight('mainnet');
} catch (error) {
    // Silent failure - bad!
}
```

### ❌ Magic Numbers

```typescript
const endBlock = currentBlock + 5040;  // What is 5040?
```

### ❌ Excessive API Calls

```typescript
for (let i = 0; i < 100; i++) {
    const currentBlock = await fetchCurrentBlockHeight('mainnet');  // Wasteful
}
```

## Summary

1. Always use dynamic block heights
2. Validate before creating markets
3. Handle errors gracefully
4. Use configuration constants
5. Log important values
6. Optimize performance
7. Test thoroughly
8. Document clearly
9. Follow patterns
10. Avoid anti-patterns
