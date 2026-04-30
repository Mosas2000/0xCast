# Rate Limits

## Overview

Rate limits protect the API from abuse and ensure fair usage.

## Limits

### Read Operations
- 100 requests per minute per IP
- 1000 requests per hour per IP

### Write Operations
- 10 transactions per minute per address
- 100 transactions per hour per address

### Webhook Deliveries
- 1000 deliveries per hour

## Headers

Response headers include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

## Handling Rate Limits

```typescript
async function makeRequestWithRetry(fn) {
  try {
    return await fn();
  } catch (error) {
    if (error.status === 429) {
      const resetTime = error.headers['x-ratelimit-reset'];
      const waitTime = resetTime - Date.now();
      
      await new Promise(r => setTimeout(r, waitTime));
      return await fn();
    }
    throw error;
  }
}
```

## Best Practices

1. Cache responses when possible
2. Implement exponential backoff
3. Monitor rate limit headers
4. Use batch operations
5. Distribute requests over time
