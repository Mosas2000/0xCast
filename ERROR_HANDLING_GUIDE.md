# Error Handling Guide

## Overview

This guide provides comprehensive documentation for the error handling system implemented in the 0xCast frontend application. The system provides robust error handling, user-friendly error messages, automatic retry logic, and comprehensive error logging.

## Table of Contents

1. [Architecture](#architecture)
2. [Error Types](#error-types)
3. [Core Components](#core-components)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)
6. [Testing](#testing)
7. [Monitoring](#monitoring)

## Architecture

The error handling system consists of several layers:

```
┌─────────────────────────────────────────┐
│         UI Components                    │
│  (ErrorBoundary, ErrorDisplay)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Hooks Layer                      │
│  (useApiCall, useStake, etc.)           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Error Handling Utilities            │
│  (contractErrorHandler, retry)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Error Logging Service               │
│  (ErrorLoggingService)                  │
└──────────────────────────────────────────┘
```

## Error Types

### ApiError

Base error class for all API-related errors.

```typescript
class ApiError extends Error {
  constructor(
    message: string,
    code: ErrorCode,
    details?: Record<string, any>
  )
}
```

### ContractError

Specialized error for smart contract interactions.

```typescript
class ContractError extends ApiError {
  constructor(
    message: string,
    contractName: string,
    functionName: string,
    txId?: string,
    errorCode?: number
  )
}
```

### ValidationError

Error for input validation failures.

```typescript
class ValidationError extends ApiError {
  constructor(
    message: string,
    field: string,
    value: any
  )
}
```

### Error Codes

```typescript
enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

## Core Components

### 1. Contract Error Handler

Handles errors from smart contract interactions with user-friendly messages.

```typescript
import { handleContractCall, parseContractError } from './utils/contractErrorHandler';

// Wrap contract calls
const result = await handleContractCall(
  'market-core',
  'create-market',
  async () => {
    // Your contract call
    return await createMarket(question, duration);
  },
  {
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
  }
);
```

### 2. Retry Utility

Automatically retries failed operations with exponential backoff.

```typescript
import { retryWithBackoff } from './utils/retry';

const result = await retryWithBackoff(
  async () => {
    return await fetchMarketData(marketId);
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt}:`, error);
    },
  }
);
```

### 3. Error Logging Service

Centralized error logging with persistence and statistics.

```typescript
import { errorLoggingService } from './services/ErrorLoggingService';

// Log an error
errorLoggingService.logError(error, {
  component: 'MarketCreation',
  action: 'create-market',
  additionalData: { marketId: 123 },
});

// Get error statistics
const stats = errorLoggingService.getStatistics();
console.log('Total errors:', stats.totalErrors);

// Get recent errors
const recentErrors = errorLoggingService.getErrorLogs();
```

### 4. useApiCall Hook

React hook for API calls with automatic error handling and retry.

```typescript
import { useApiCall } from './hooks/useApiCall';

function MyComponent() {
  const { execute, loading, error, data, reset } = useApiCall(
    async (marketId: number) => {
      return await fetchMarket(marketId);
    },
    {
      maxRetries: 3,
      retryDelay: 1000,
      onSuccess: (data) => console.log('Success:', data),
      onError: (error) => console.error('Error:', error),
    }
  );

  return (
    <div>
      <button onClick={() => execute(123)} disabled={loading}>
        Fetch Market
      </button>
      {error && <ErrorDisplay error={error} />}
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
}
```

### 5. Error Boundary

React error boundary for catching component errors.

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### 6. Error Display Component

User-friendly error display with severity colors.

```typescript
import { ErrorDisplay } from './components/ErrorDisplay';

function MyComponent() {
  const [error, setError] = useState<Error | null>(null);

  return (
    <div>
      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={() => setError(null)}
          onRetry={() => retryOperation()}
        />
      )}
    </div>
  );
}
```

### 7. Error Monitoring Dashboard

Real-time error monitoring dashboard.

```typescript
import { ErrorMonitoringDashboard } from './components/ErrorMonitoringDashboard';

function AdminPanel() {
  return (
    <div>
      <ErrorMonitoringDashboard />
    </div>
  );
}
```

## Usage Examples

### Example 1: Contract Interaction with Error Handling

```typescript
import { useStake } from './hooks/useStake';

function StakeComponent() {
  const { placeYesStake, isLoading, error, reset } = useStake();

  const handleStake = async () => {
    try {
      await placeYesStake(marketId, amount);
      // Success handling
    } catch (err) {
      // Error is already logged and displayed
      console.error('Stake failed:', err);
    }
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

### Example 2: API Call with Retry

```typescript
import { ApiClient } from './services/ApiClient';

const apiClient = new ApiClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  retryConfig: {
    maxRetries: 3,
    initialDelay: 1000,
  },
});

async function fetchMarkets() {
  try {
    const response = await apiClient.get('/markets');
    return response.data;
  } catch (error) {
    // Error is automatically logged and retried
    console.error('Failed to fetch markets:', error);
    throw error;
  }
}
```

### Example 3: Custom Error Handling

```typescript
import { parseContractError, getUserFriendlyContractError } from './utils/contractErrorHandler';

async function customContractCall() {
  try {
    await someContractFunction();
  } catch (error) {
    const contractError = parseContractError(error, 'market-core', 'create-market');
    const friendlyMessage = getUserFriendlyContractError(contractError);
    
    // Display to user
    toast.error(friendlyMessage);
    
    // Log for monitoring
    errorLoggingService.logError(contractError, {
      component: 'CustomComponent',
      action: 'customContractCall',
    });
  }
}
```

## Best Practices

### 1. Always Use Error Boundaries

Wrap your application with error boundaries to catch unexpected errors:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 2. Log All Errors

Always log errors for monitoring and debugging:

```typescript
errorLoggingService.logError(error, {
  component: 'ComponentName',
  action: 'actionName',
  additionalData: { /* relevant context */ },
});
```

### 3. Provide User-Friendly Messages

Convert technical errors to user-friendly messages:

```typescript
const friendlyMessage = getUserFriendlyContractError(contractError);
```

### 4. Use Appropriate Retry Logic

Only retry transient errors (network, timeout):

```typescript
const result = await retryWithBackoff(operation, {
  maxRetries: 3,
  shouldRetry: (error) => {
    return error.code === ErrorCode.NETWORK_ERROR || 
           error.code === ErrorCode.TIMEOUT;
  },
});
```

### 5. Handle Errors at the Right Level

- Component-level: Display errors to users
- Hook-level: Transform and log errors
- Service-level: Retry and recover from errors

### 6. Test Error Scenarios

Always test error handling:

```typescript
it('should handle contract error', async () => {
  const error = new ContractError('Test error', 'market-core', 'create-market');
  mockContractCall.mockRejectedValue(error);
  
  await expect(createMarket()).rejects.toThrow();
  expect(errorLoggingService.logError).toHaveBeenCalled();
});
```

## Testing

### Running Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { parseContractError } from '../contractErrorHandler';

describe('parseContractError', () => {
  it('should parse Clarity error codes', () => {
    const error = new Error('Contract error: (err u100)');
    const result = parseContractError(error, 'market-core', 'create-market');
    
    expect(result.errorCode).toBe(100);
    expect(result.message).toContain('unauthorized');
  });
});
```

## Monitoring

### Error Statistics

Access error statistics through the ErrorLoggingService:

```typescript
const stats = errorLoggingService.getStatistics();

console.log('Total errors:', stats.totalErrors);
console.log('Errors by code:', stats.errorsByCode);
console.log('Errors by severity:', stats.errorsBySeverity);
console.log('Errors by component:', stats.errorsByComponent);
```

### Error Monitoring Dashboard

The ErrorMonitoringDashboard component provides real-time monitoring:

- Total error count
- Errors by severity
- Errors by component
- Recent error list
- Clear logs functionality

### Filtering Errors

```typescript
// Get errors by time range
const recentErrors = errorLoggingService.getErrorsByTimeRange(
  Date.now() - 3600000, // Last hour
  Date.now()
);

// Get errors by component
const componentErrors = errorLoggingService.getErrorsByComponent('MarketCreation');

// Get errors by severity
const criticalErrors = errorLoggingService.getErrorsBySeverity('critical');
```

## Clarity Error Codes

The system automatically maps Clarity error codes to user-friendly messages:

| Code | Meaning | User Message |
|------|---------|--------------|
| 100 | Unauthorized | You are not authorized to perform this action |
| 101 | Not Found | Market not found |
| 102 | Already Resolved | Market has already been resolved |
| 103 | Min Stake Required | Stake amount is below minimum requirement |
| 104 | No Stake Found | No stake found for this market |
| 105 | Not Resolved | Market has not been resolved yet |
| 106 | Wrong Side | You staked on the losing side |
| 107 | Insufficient Balance | Insufficient balance for this transaction |
| 108 | Contract Paused | Contract is currently paused |
| 109 | Rate Limit | Rate limit exceeded, please try again later |

## Support

For issues or questions about error handling:

1. Check the error logs in the ErrorMonitoringDashboard
2. Review error statistics for patterns
3. Check the test suite for examples
4. Consult this guide for best practices

## Future Enhancements

- Integration with external error monitoring services (Sentry, Rollbar)
- Advanced error analytics and reporting
- Automated error recovery strategies
- Error notification system
- Error trend analysis
