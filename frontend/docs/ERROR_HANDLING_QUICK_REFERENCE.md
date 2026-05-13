# Error Handling Quick Reference

Quick reference for common error handling scenarios.

## Import

```typescript
import {
  ErrorHandler,
  StorageErrorHandler,
  ApiErrorHandler,
  ValidationErrorHandler,
  AsyncOperationHandler,
  errorLogger,
  errorRecovery,
  ErrorFormatter,
} from '@/utils/errorHandling';
```

## Common Scenarios

### API Call

```typescript
const data = await ApiErrorHandler.fetchWithRetry(url, options, 3);
```

### localStorage

```typescript
const data = StorageErrorHandler.safeGetItem('key', defaultValue);
StorageErrorHandler.safeSetItem('key', data);
```

### Async with Retry

```typescript
const handler = new ErrorHandler({ retryAttempts: 3 });
const result = await handler.execute(() => operation());
```

### Async with Timeout

```typescript
const result = await AsyncOperationHandler.withTimeout(operation(), 5000);
```

### Form Validation

```typescript
const validator = new ValidationErrorHandler();
const error = ValidationErrorHandler.email(email, 'email');
if (error) validator.addError(error.field, error.message);
```

### Parallel Operations

```typescript
const results = await AsyncOperationHandler.parallel([
  () => fetchUsers(),
  () => fetchPosts(),
]);
```

### Error Logging

```typescript
errorLogger.error('Operation failed', error, { userId, action });
```

### Error Recovery

```typescript
const recovered = await errorRecovery.attemptRecovery(error);
```

### User-Friendly Message

```typescript
const message = ErrorFormatter.formatUserFriendly(error);
```

## Cheat Sheet

| Task | Utility | Method |
|------|---------|--------|
| API call | ApiErrorHandler | fetchWithRetry() |
| Get from storage | StorageErrorHandler | safeGetItem() |
| Set to storage | StorageErrorHandler | safeSetItem() |
| Retry operation | ErrorHandler | execute() |
| Timeout operation | AsyncOperationHandler | withTimeout() |
| Validate email | ValidationErrorHandler | email() |
| Validate required | ValidationErrorHandler | required() |
| Log error | errorLogger | error() |
| Format error | ErrorFormatter | formatUserFriendly() |
| Recover from error | errorRecovery | attemptRecovery() |

## Error Types

- **NetworkError**: Connection issues
- **TimeoutError**: Operation took too long
- **ValidationError**: Invalid input
- **ApiError**: API response error
- **AuthenticationError**: Auth required
- **AuthorizationError**: Permission denied

## Status Codes

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 408: Timeout
- 429: Rate Limit
- 500: Server Error
- 503: Unavailable

## Configuration

### ErrorHandler

```typescript
new ErrorHandler({
  retryAttempts: 3,
  retryDelay: 1000,
  logErrors: true,
  throwErrors: false,
  onError: (error, context) => {},
});
```

### AsyncOperationHandler

```typescript
AsyncOperationHandler.withRetry(fn, {
  retries: 3,
  retryDelay: 1000,
  timeout: 5000,
  onRetry: (attempt, error) => {},
});
```

## Best Practices

1. Always provide context
2. Use appropriate utility
3. Log errors consistently
4. Handle errors gracefully
5. Test error scenarios
6. Monitor error patterns

## Examples

### Complete Service

```typescript
class MyService {
  private handler = new ErrorHandler({ retryAttempts: 3 });

  async fetchData(id: string) {
    return await this.handler.execute(
      async () => {
        const response = await fetch(`/api/data/${id}`);
        return await ApiErrorHandler.handleResponse(response);
      },
      { component: 'MyService', action: 'fetchData', additionalData: { id } }
    );
  }

  saveData(key: string, data: any) {
    return StorageErrorHandler.safeSetItem(key, data);
  }

  validateForm(data: FormData) {
    const validator = new ValidationErrorHandler();
    
    const emailError = ValidationErrorHandler.email(data.email, 'email');
    if (emailError) validator.addError(emailError.field, emailError.message);
    
    return {
      valid: !validator.hasErrors(),
      errors: validator.getErrors(),
    };
  }
}
```
