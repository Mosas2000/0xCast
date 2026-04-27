# Error Handling System

## Quick Start

The 0xCast frontend includes a comprehensive error handling system that provides robust error handling, user-friendly messages, automatic retry logic, and error monitoring.

## Installation

The error handling system is already integrated into the application. No additional installation required.

## Basic Usage

### 1. Using Hooks with Automatic Error Handling

```typescript
import { useStake } from './hooks/useStake';

function StakeComponent() {
  const { placeYesStake, isLoading, error, reset } = useStake();

  const handleStake = async () => {
    await placeYesStake(marketId, amount);
  };

  return (
    <div>
      <button onClick={handleStake} disabled={isLoading}>
        Place Stake
      </button>
      {error && <ErrorDisplay error={error} onDismiss={reset} />}
    </div>
  );
}
```

### 2. Using useApiCall Hook

```typescript
import { useApiCall } from './hooks/useApiCall';

function MarketList() {
  const { execute, loading, error, data } = useApiCall(
    async (page: number) => await fetchMarkets(page),
    { maxRetries: 3 }
  );

  return (
    <div>
      <button onClick={() => execute(1)} disabled={loading}>
        Load Markets
      </button>
      {error && <ErrorDisplay error={error} />}
      {data && <MarketGrid markets={data} />}
    </div>
  );
}
```

### 3. Manual Error Handling

```typescript
import { parseContractError, getUserFriendlyContractError } from './utils/contractErrorHandler';
import { errorLoggingService } from './services/ErrorLoggingService';

async function customContractCall() {
  try {
    await someContractFunction();
  } catch (error) {
    const contractError = parseContractError(error, 'market-core', 'create-market');
    const friendlyMessage = getUserFriendlyContractError(contractError);
    
    errorLoggingService.logError(contractError, {
      component: 'CustomComponent',
      action: 'customContractCall',
    });
    
    toast.error(friendlyMessage);
  }
}
```

## Features

### ✅ Automatic Error Handling
- All contract interactions automatically handle errors
- User-friendly error messages for all error types
- Automatic error logging for monitoring

### ✅ Retry Logic
- Exponential backoff for transient errors
- Configurable retry attempts and delays
- Automatic retry for network and timeout errors

### ✅ Error Logging
- Persistent error logs in localStorage
- Error statistics and analytics
- Real-time error monitoring dashboard

### ✅ User Experience
- User-friendly error messages
- Severity-based error styling
- Dismiss and retry functionality

### ✅ Developer Experience
- Comprehensive TypeScript types
- Extensive test coverage (449+ tests)
- Detailed documentation

## Components

### ErrorBoundary
Catches React component errors.

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### ErrorDisplay
Displays user-friendly error messages.

```typescript
<ErrorDisplay
  error={error}
  onDismiss={() => setError(null)}
  onRetry={() => retryOperation()}
/>
```

### ErrorMonitoringDashboard
Real-time error monitoring for admins.

```typescript
<ErrorMonitoringDashboard />
```

## Error Types

### ApiError
Base error class for API-related errors.

### ContractError
Specialized error for smart contract interactions with Clarity error code mapping.

### ValidationError
Error for input validation failures.

## Clarity Error Codes

| Code | Message |
|------|---------|
| 100 | You are not authorized to perform this action |
| 101 | Market not found |
| 102 | Market has already been resolved |
| 103 | Stake amount is below minimum requirement |
| 104 | No stake found for this market |
| 105 | Market has not been resolved yet |
| 106 | You staked on the losing side |
| 107 | Insufficient balance for this transaction |
| 108 | Contract is currently paused |
| 109 | Rate limit exceeded, please try again later |

## Documentation

- **[ERROR_HANDLING_GUIDE.md](./ERROR_HANDLING_GUIDE.md)** - Comprehensive usage guide
- **[ERROR_HANDLING_API.md](./ERROR_HANDLING_API.md)** - Complete API reference
- **[ERROR_HANDLING_CHANGELOG.md](./ERROR_HANDLING_CHANGELOG.md)** - Detailed changelog
- **[ERROR_HANDLING_SUMMARY.md](./ERROR_HANDLING_SUMMARY.md)** - Implementation summary

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Configuration

### Retry Configuration

```typescript
const config: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
};
```

### Error Logging Configuration

```typescript
const errorLoggingService = new ErrorLoggingService(1000); // Max 1000 logs
```

## Best Practices

1. **Always use error boundaries** - Wrap your app with ErrorBoundary
2. **Log all errors** - Use errorLoggingService for monitoring
3. **Provide user-friendly messages** - Use getUserFriendlyContractError
4. **Use appropriate retry logic** - Only retry transient errors
5. **Test error scenarios** - Write tests for error handling

## Support

For issues or questions:
1. Check the error logs in ErrorMonitoringDashboard
2. Review error statistics for patterns
3. Consult the documentation
4. Check the test suite for examples

## License

Part of the 0xCast project.

## Statistics

- **Files**: 19 created, 3 modified
- **Lines of code**: 3000+
- **Test cases**: 449+
- **Documentation pages**: 4
- **Error codes**: 12
- **Clarity error codes**: 10

## Version

1.0.0 - Initial release (2026-04-27)
