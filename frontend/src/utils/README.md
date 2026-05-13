# Utility Modules

This directory contains utility functions and classes used throughout the 0xCast application.

## Error Handling

### apiErrors.ts

Provides structured error classes and utilities for handling API and blockchain errors.

**Key Exports:**
- `ErrorCode` - Enum of all error types
- `ApiError` - Base error class with retry support
- `ContractError` - Smart contract specific errors with Clarity code mapping
- `ValidationError` - Input validation errors
- `isRetryableError()` - Check if an error can be retried
- `getRetryDelay()` - Get recommended retry delay
- `getUserFriendlyMessage()` - Extract user-facing error message

**Example:**
```typescript
import { ApiError, ErrorCode } from '@/utils/apiErrors';

try {
  await fetchData();
} catch (error) {
  const apiError = ApiError.fromError(error);
  if (apiError.retryable) {
    await delay(getRetryDelay(apiError));
    await fetchData(); // Retry
  }
}
```

### contractErrorHandler.ts

Utilities for handling smart contract errors with automatic parsing and logging.

**Key Exports:**
- `handleContractCall()` - Wrap contract calls with error handling
- `parseContractError()` - Parse errors into ContractError objects
- `getUserFriendlyContractError()` - Get user-facing error message
- `isTransactionRejection()` - Check if user cancelled transaction
- `isInsufficientFunds()` - Check for insufficient balance
- `extractTxId()` - Extract transaction ID from error

**Example:**
```typescript
import { handleContractCall } from '@/utils/contractErrorHandler';

const result = await handleContractCall(
  'market-core',
  'create-market',
  async () => openContractCall({...}),
  {
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => toast.error(error.message)
  }
);

if (result.success) {
  console.log('Transaction:', result.txId);
}
```

## Contract Utilities

### contractUtils.ts

Helper functions for working with smart contracts.

**Key Features:**
- Contract address formatting
- Function argument encoding
- Post-condition builders

## Formatting Utilities

### formatters.ts

Functions for formatting data for display.

**Key Features:**
- Number formatting (currency, percentages)
- Date/time formatting
- Address truncation
- Token amount formatting

## Validation Utilities

### validators.ts

Input validation functions.

**Key Features:**
- Address validation
- Amount validation
- String sanitization
- Form field validation

### marketValidation.ts

Comprehensive validation utilities for market-related data.

**Key Exports:**
- `validateMarketTitle()` - Validate market title length and characters
- `validateMarketDescription()` - Validate market description
- `validateMarketDuration()` - Validate duration in blocks
- `validatePredictionAmount()` - Validate prediction amounts
- `validateMarketOutcome()` - Validate outcome enum values
- `validateMarketStatus()` - Validate status enum values
- `validateStacksAddress()` - Validate Stacks address format
- `validateMarketEndTime()` - Validate end time is in future
- `validateMarketCreation()` - Validate complete market creation data
- `validatePrediction()` - Validate complete prediction data

**Constants:**
- `MIN_TITLE_LENGTH` / `MAX_TITLE_LENGTH` - Title length limits
- `MIN_DESCRIPTION_LENGTH` / `MAX_DESCRIPTION_LENGTH` - Description limits
- `MIN_PREDICTION_AMOUNT` / `MAX_PREDICTION_AMOUNT` - Amount limits
- `MIN_MARKET_DURATION_BLOCKS` / `MAX_MARKET_DURATION_BLOCKS` - Duration limits

**Example:**
```typescript
import { validateMarketCreation } from '@/utils/marketValidation';

const data = {
  title: 'Will BTC reach $100k?',
  description: 'Market resolves YES if Bitcoin reaches $100,000',
  durationBlocks: 144
};

const result = validateMarketCreation(data);
if (!result.isValid) {
  toast.error(result.error);
  return;
}

// Proceed with market creation
await createMarket(data);
```

## WebSocket Utilities

### websocketUtils.ts

WebSocket connection management and message handling.

**Key Features:**
- Auto-reconnection
- Message queuing
- Connection state management
- Event subscriptions

## Best Practices

### Error Handling

1. **Always use structured errors:**
   ```typescript
   // Good
   throw new ValidationError('Invalid amount', 'amount', value);
   
   // Bad
   throw new Error('Invalid amount');
   ```

2. **Parse contract errors:**
   ```typescript
   // Good
   const error = parseContractError(rawError, 'market-core', 'predict');
   
   // Bad
   console.error(rawError);
   ```

3. **Check error types before retrying:**
   ```typescript
   if (isRetryableError(error) && !isTransactionRejection(error)) {
     // Retry logic
   }
   ```

### Type Safety

1. **Use TypeScript types:**
   ```typescript
   // Good
   const result: ContractCallResult<MarketData> = await handleContractCall(...);
   
   // Bad
   const result: any = await handleContractCall(...);
   ```

2. **Validate inputs:**
   ```typescript
   if (!isValidAddress(address)) {
     throw new ValidationError('Invalid address', 'address', address);
   }
   ```

### Performance

1. **Memoize expensive operations:**
   ```typescript
   const formatted = useMemo(() => formatLargeNumber(value), [value]);
   ```

2. **Debounce user input:**
   ```typescript
   const debouncedSearch = useMemo(
     () => debounce(handleSearch, 300),
     []
   );
   ```

## Testing

All utility functions should have corresponding unit tests in the `__tests__` directory.

**Example test structure:**
```typescript
describe('parseContractError', () => {
  it('should parse Clarity error codes', () => {
    const error = new Error('(err u101)');
    const result = parseContractError(error, 'market-core', 'predict');
    expect(result.errorCode).toBe(101);
    expect(result.message).toBe('Market not found.');
  });
});
```

## Contributing

When adding new utilities:

1. Add comprehensive JSDoc documentation
2. Include usage examples in comments
3. Write unit tests
4. Update this README
5. Follow existing naming conventions
6. Export from index.ts if appropriate

## Related Documentation

- [Error Handling Guide](../../docs/error-handling.md)
- [Contract Integration](../../docs/integration-guide.md)
- [API Reference](../../docs/api-reference.md)
