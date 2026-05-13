# Error Handling Best Practices

Guidelines for using the error handling utilities effectively.

## General Principles

### 1. Always Handle Errors

Never let errors go unhandled:

```typescript
// Bad
async function fetchData() {
  return await fetch('/api/data');
}

// Good
import { ErrorHandler } from '@/utils/errorHandling';

async function fetchData() {
  const handler = new ErrorHandler();
  return await handler.execute(() => fetch('/api/data'));
}
```

### 2. Use Appropriate Utilities

Choose the right utility for the task:

- **ErrorHandler**: General async operations
- **ApiErrorHandler**: API calls
- **StorageErrorHandler**: localStorage operations
- **ValidationErrorHandler**: Form validation
- **AsyncOperationHandler**: Complex async flows

### 3. Provide Context

Always provide context for better debugging:

```typescript
await handler.execute(
  () => fetchUserData(userId),
  {
    component: 'UserProfile',
    action: 'fetchData',
    userId,
  }
);
```

### 4. Log Appropriately

Use the error logger for persistent tracking:

```typescript
import { errorLogger } from '@/utils/errorHandling';

errorLogger.error('Failed to save data', error, {
  userId: user.id,
  dataType: 'profile',
});
```

## Specific Guidelines

### API Calls

Always use ApiErrorHandler for API calls:

```typescript
import { ApiErrorHandler } from '@/utils/errorHandling';

// With automatic retry
const data = await ApiErrorHandler.fetchWithRetry(url, options, 3);

// Manual handling
try {
  const response = await fetch(url);
  const data = await ApiErrorHandler.handleResponse(response);
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API-specific error
  }
}
```

### Storage Operations

Always use StorageErrorHandler:

```typescript
import { StorageErrorHandler } from '@/utils/errorHandling';

// Check availability first
if (!StorageErrorHandler.isAvailable()) {
  // Handle storage unavailable
}

// Safe operations
const data = StorageErrorHandler.safeGetItem('key', defaultValue);
StorageErrorHandler.safeSetItem('key', data);

// Monitor storage health
if (StorageErrorHandler.isStorageFull()) {
  StorageErrorHandler.cleanupOldItems(7 * 24 * 60 * 60 * 1000);
}
```

### Form Validation

Use ValidationErrorHandler for consistent validation:

```typescript
import { ValidationErrorHandler } from '@/utils/errorHandling';

function validateForm(data: FormData) {
  const handler = new ValidationErrorHandler();

  // Use static validators
  const emailError = ValidationErrorHandler.email(data.email, 'email');
  if (emailError) handler.addError(emailError.field, emailError.message);

  // Custom validation
  const customError = ValidationErrorHandler.custom(
    data.age,
    (age) => age >= 18,
    'age',
    'Must be 18 or older'
  );
  if (customError) handler.addError(customError.field, customError.message);

  return {
    valid: !handler.hasErrors(),
    errors: handler.toObject(),
  };
}
```

### Async Operations

Use AsyncOperationHandler for complex async flows:

```typescript
import { AsyncOperationHandler } from '@/utils/errorHandling';

// With timeout
const result = await AsyncOperationHandler.withTimeout(
  longRunningOperation(),
  5000
);

// With retry
const result = await AsyncOperationHandler.withRetry(
  () => unreliableOperation(),
  { retries: 3, retryDelay: 1000 }
);

// Parallel execution
const results = await AsyncOperationHandler.parallel([
  () => fetchUsers(),
  () => fetchPosts(),
  () => fetchComments(),
]);
```

### Error Recovery

Implement recovery strategies:

```typescript
import { errorRecovery, ErrorRecovery } from '@/utils/errorHandling';

// Register custom strategy
errorRecovery.registerStrategy({
  name: 'refresh_token',
  canRecover: (error) => error.message.includes('token expired'),
  recover: async () => {
    await refreshAuthToken();
  },
});

// Attempt recovery
const recovered = await errorRecovery.attemptRecovery(error);
if (!recovered) {
  // Fallback handling
}
```

## Anti-Patterns

### Don't Swallow Errors

```typescript
// Bad
try {
  await operation();
} catch {
  // Silent failure
}

// Good
import { errorLogger } from '@/utils/errorHandling';

try {
  await operation();
} catch (error) {
  errorLogger.error('Operation failed', error);
  // Handle appropriately
}
```

### Don't Duplicate Error Handling

```typescript
// Bad
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed');
  return await response.json();
} catch (error) {
  console.error(error);
  return null;
}

// Good
import { ApiErrorHandler } from '@/utils/errorHandling';

return await ApiErrorHandler.fetchWithRetry(url);
```

### Don't Mix Patterns

```typescript
// Bad - mixing different error handling approaches
try {
  const data = localStorage.getItem('key');
  return data ? JSON.parse(data) : null;
} catch {
  return null;
}

// Good - consistent use of utilities
import { StorageErrorHandler } from '@/utils/errorHandling';

return StorageErrorHandler.safeGetItem('key', null);
```

## Testing

### Test Error Scenarios

```typescript
import { describe, it, expect } from 'vitest';
import { ErrorHandler } from '@/utils/errorHandling';

describe('MyService', () => {
  it('should handle errors gracefully', async () => {
    const handler = new ErrorHandler({ throwErrors: false });
    const result = await handler.execute(() => {
      throw new Error('test');
    });
    expect(result).toBeNull();
  });
});
```

### Mock Error Handlers

```typescript
import { vi } from 'vitest';

const mockHandler = {
  execute: vi.fn().mockResolvedValue(null),
};

const service = new MyService(mockHandler);
```

## Performance

### Avoid Excessive Retries

```typescript
// Bad - too many retries
const handler = new ErrorHandler({ retryAttempts: 10 });

// Good - reasonable retry count
const handler = new ErrorHandler({ retryAttempts: 3 });
```

### Use Appropriate Timeouts

```typescript
// Bad - no timeout
await operation();

// Good - reasonable timeout
await AsyncOperationHandler.withTimeout(operation(), 5000);
```

## Monitoring

### Track Error Patterns

```typescript
import { errorAggregator } from '@/utils/errorHandling';

// Add errors to aggregator
errorAggregator.add(error);

// Monitor patterns
const stats = errorAggregator.getStats();
const frequent = errorAggregator.getMostFrequent(10);
```

### Review Error Logs

```typescript
import { errorLogger } from '@/utils/errorHandling';

// Get error statistics
const stats = errorLogger.getStats();

// Review recent errors
const recent = errorLogger.getLogs({ level: 'error', limit: 50 });
```

## Checklist

- [ ] Use appropriate error handling utility
- [ ] Provide context for errors
- [ ] Log errors consistently
- [ ] Implement recovery strategies
- [ ] Test error scenarios
- [ ] Monitor error patterns
- [ ] Use reasonable retry counts
- [ ] Set appropriate timeouts
- [ ] Don't swallow errors
- [ ] Don't duplicate error handling
