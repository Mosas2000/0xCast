# Error Handling Migration Guide

This guide explains how to migrate existing error handling code to use the new consolidated error handling utilities.

## Overview

The error handling utilities consolidate common patterns found across services into reusable components.

## Common Patterns

### Pattern 1: Try-Catch with Logging

**Before:**
```typescript
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error('Failed to fetch data:', error);
  return null;
}
```

**After:**
```typescript
import { ErrorHandler } from '@/utils/errorHandling';

const handler = new ErrorHandler({ logErrors: true });
return await handler.execute(() => fetchData());
```

### Pattern 2: localStorage Operations

**Before:**
```typescript
try {
  const data = localStorage.getItem('key');
  return data ? JSON.parse(data) : defaultValue;
} catch {
  return defaultValue;
}
```

**After:**
```typescript
import { StorageErrorHandler } from '@/utils/errorHandling';

return StorageErrorHandler.safeGetItem('key', defaultValue);
```

### Pattern 3: API Calls with Retry

**Before:**
```typescript
let retries = 3;
while (retries > 0) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('API error');
    return await response.json();
  } catch (error) {
    retries--;
    if (retries === 0) throw error;
    await new Promise(r => setTimeout(r, 1000));
  }
}
```

**After:**
```typescript
import { ApiErrorHandler } from '@/utils/errorHandling';

return await ApiErrorHandler.fetchWithRetry(url, {}, 3);
```

### Pattern 4: Form Validation

**Before:**
```typescript
const errors: string[] = [];
if (!email) errors.push('Email is required');
if (email && !email.includes('@')) errors.push('Invalid email');
if (password.length < 8) errors.push('Password too short');
return errors;
```

**After:**
```typescript
import { ValidationErrorHandler } from '@/utils/errorHandling';

const handler = new ValidationErrorHandler();

const emailError = ValidationErrorHandler.required(email, 'email');
if (emailError) handler.addError(emailError.field, emailError.message);

const emailFormatError = ValidationErrorHandler.email(email, 'email');
if (emailFormatError) handler.addError(emailFormatError.field, emailFormatError.message);

const passwordError = ValidationErrorHandler.minLength(password, 8, 'password');
if (passwordError) handler.addError(passwordError.field, passwordError.message);

return handler.getErrors();
```

### Pattern 5: Async Operations with Timeout

**Before:**
```typescript
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Timeout')), 5000);
});

try {
  return await Promise.race([fetchData(), timeoutPromise]);
} catch (error) {
  console.error('Operation timed out');
  return null;
}
```

**After:**
```typescript
import { AsyncOperationHandler } from '@/utils/errorHandling';

return await AsyncOperationHandler.withTimeout(
  fetchData(),
  5000,
  () => console.log('Operation timed out')
);
```

## Migration Steps

### Step 1: Identify Patterns

Review your service files and identify common error handling patterns:

- Try-catch blocks
- localStorage operations
- API calls with retry logic
- Form validation
- Async operations with timeout

### Step 2: Choose Appropriate Utility

Match patterns to utilities:

- **ErrorHandler**: General error handling with retry
- **StorageErrorHandler**: localStorage operations
- **ApiErrorHandler**: API calls
- **ValidationErrorHandler**: Form validation
- **AsyncOperationHandler**: Async operations

### Step 3: Update Imports

```typescript
import {
  ErrorHandler,
  StorageErrorHandler,
  ApiErrorHandler,
  ValidationErrorHandler,
  AsyncOperationHandler,
} from '@/utils/errorHandling';
```

### Step 4: Replace Code

Replace existing error handling code with utility calls.

### Step 5: Test

Run tests to ensure functionality is preserved:

```bash
npm test
```

## Service-Specific Examples

### NotificationService

**Before:**
```typescript
private static getAllNotifications(): Notification[] {
  try {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
```

**After:**
```typescript
import { StorageErrorHandler } from '@/utils/errorHandling';

private static getAllNotifications(): Notification[] {
  return StorageErrorHandler.safeGetItem<Notification[]>(
    this.STORAGE_KEY,
    []
  );
}
```

### OracleNetworkService

**Before:**
```typescript
try {
  const response = await fetch(url, { signal: controller.signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
} catch (error) {
  provider.errorCount++;
  provider.lastError = error.message;
  return null;
}
```

**After:**
```typescript
import { ApiErrorHandler, ErrorHandler } from '@/utils/errorHandling';

const handler = new ErrorHandler({
  onError: (error) => {
    provider.errorCount++;
    provider.lastError = error.message;
  },
});

return await handler.execute(async () => {
  const response = await fetch(url, { signal: controller.signal });
  return await ApiErrorHandler.handleResponse(response);
});
```

## Benefits

- **Reduced Code**: Less boilerplate error handling
- **Consistency**: Uniform error handling across services
- **Maintainability**: Single source of truth
- **Type Safety**: Full TypeScript support
- **Testability**: Utilities are well-tested

## Checklist

- [ ] Identify error handling patterns in your code
- [ ] Choose appropriate utilities
- [ ] Update imports
- [ ] Replace error handling code
- [ ] Run tests
- [ ] Update documentation
- [ ] Review error logs

## Support

For questions or issues, refer to:
- [Error Handling README](../src/utils/errorHandling/README.md)
- Unit tests in `__tests__` directory
