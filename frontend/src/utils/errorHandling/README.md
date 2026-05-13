# Error Handling Utilities

Comprehensive error handling utilities extracted from common patterns across services.

## Overview

This package provides a set of utilities for handling errors consistently across the application:

- **ErrorHandler**: Base error handler with retry and logging
- **StorageErrorHandler**: Safe localStorage operations
- **ApiErrorHandler**: API error handling with retry logic
- **AsyncOperationHandler**: Async operation management
- **ValidationErrorHandler**: Form and data validation
- **ErrorBoundaryHandler**: React error boundary utilities
- **ErrorLogger**: Error logging with persistence
- **ErrorRecovery**: Error recovery strategies
- **ErrorFormatter**: User-friendly error messages
- **ErrorAggregator**: Error pattern tracking

## Usage

### ErrorHandler

Basic error handling with retry capabilities:

```typescript
import { ErrorHandler } from '@/utils/errorHandling';

const handler = new ErrorHandler({
  retryAttempts: 3,
  retryDelay: 1000,
  logErrors: true,
  onError: (error, context) => {
    console.error('Error occurred:', error, context);
  },
});

const result = await handler.execute(
  async () => fetchData(),
  { component: 'DataFetcher', action: 'fetch' }
);
```

### StorageErrorHandler

Safe localStorage operations:

```typescript
import { StorageErrorHandler } from '@/utils/errorHandling';

const data = StorageErrorHandler.safeGetItem('key', defaultValue);

const success = StorageErrorHandler.safeSetItem('key', value);

if (StorageErrorHandler.isStorageFull()) {
  StorageErrorHandler.cleanupOldItems(7 * 24 * 60 * 60 * 1000);
}
```

### ApiErrorHandler

API error handling with automatic retries:

```typescript
import { ApiErrorHandler } from '@/utils/errorHandling';

try {
  const data = await ApiErrorHandler.fetchWithRetry<DataType>(
    '/api/endpoint',
    { method: 'GET' },
    3
  );
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.statusText}`);
  }
}
```

### AsyncOperationHandler

Manage async operations with timeout and parallel execution:

```typescript
import { AsyncOperationHandler } from '@/utils/errorHandling';

const result = await AsyncOperationHandler.withRetry(
  () => fetchData(),
  {
    retries: 3,
    timeout: 5000,
    onRetry: (attempt) => console.log(`Retry attempt ${attempt}`),
  }
);

const results = await AsyncOperationHandler.parallel([
  () => fetchUsers(),
  () => fetchPosts(),
  () => fetchComments(),
]);
```

### ValidationErrorHandler

Form and data validation:

```typescript
import { ValidationErrorHandler } from '@/utils/errorHandling';

const handler = new ValidationErrorHandler();

const emailError = ValidationErrorHandler.email(email, 'email');
if (emailError) handler.addError(emailError.field, emailError.message);

const passwordError = ValidationErrorHandler.minLength(password, 8, 'password');
if (passwordError) handler.addError(passwordError.field, passwordError.message);

if (handler.hasErrors()) {
  console.error(handler.getErrors());
}
```

### ErrorLogger

Persistent error logging:

```typescript
import { errorLogger } from '@/utils/errorHandling';

errorLogger.error('Failed to fetch data', error, {
  userId: user.id,
  endpoint: '/api/data',
});

const recentErrors = errorLogger.getLogs({ level: 'error', limit: 10 });

const stats = errorLogger.getStats();
```

### ErrorRecovery

Automatic error recovery:

```typescript
import { errorRecovery, ErrorRecovery } from '@/utils/errorHandling';

errorRecovery.registerStrategy(
  ErrorRecovery.createRetryStrategy(async () => {
    await refetchData();
  })
);

const recovered = await errorRecovery.attemptRecovery(error);
```

### ErrorFormatter

User-friendly error messages:

```typescript
import { ErrorFormatter } from '@/utils/errorHandling';

const userMessage = ErrorFormatter.formatUserFriendly(error);

const displayData = ErrorFormatter.formatForDisplay(error);

const logMessage = ErrorFormatter.formatForLogging(error, context);
```

### ErrorAggregator

Track error patterns:

```typescript
import { errorAggregator } from '@/utils/errorHandling';

errorAggregator.add(error);

const mostFrequent = errorAggregator.getMostFrequent(5);

const stats = errorAggregator.getStats();
```

## Benefits

- **Consistency**: Uniform error handling across the application
- **Reusability**: Common patterns extracted to utilities
- **Maintainability**: Single source of truth for error handling
- **Type Safety**: Full TypeScript support
- **Testability**: Comprehensive unit tests included

## Testing

All utilities include comprehensive unit tests:

```bash
npm test errorHandling
```

## Migration

To migrate existing error handling code:

1. Identify duplicate error handling patterns
2. Replace with appropriate utility
3. Update imports
4. Run tests to ensure compatibility

## Best Practices

1. Use ErrorHandler for async operations with retry needs
2. Use StorageErrorHandler for all localStorage operations
3. Use ApiErrorHandler for API calls
4. Use ValidationErrorHandler for form validation
5. Use ErrorLogger for persistent error tracking
6. Use ErrorFormatter for user-facing error messages
