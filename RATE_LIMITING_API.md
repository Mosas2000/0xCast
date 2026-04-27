# Rate Limiting API Reference

## Table of Contents

1. [RateLimitService](#ratelimitservice)
2. [RateLimitMiddleware](#ratelimitmiddleware)
3. [useRateLimit Hook](#useratelimit-hook)
4. [Contract Functions](#contract-functions)
5. [RateLimitFraudIntegrationService](#ratelimitfraudintegrationservice)

---

## RateLimitService

Core service for managing rate limits.

### Constructor

```typescript
new RateLimitService()
```

Creates a new instance with default configurations.

### Methods

#### setConfig

```typescript
setConfig(action: string, config: RateLimitConfig): void
```

Set or update rate limit configuration for an action.

**Parameters:**
- `action` - Action identifier (e.g., 'stake', 'create-market')
- `config` - Configuration object
  - `maxRequests: number` - Maximum requests allowed
  - `windowMs: number` - Time window in milliseconds
  - `cooldownMs?: number` - Optional cooldown between requests

**Example:**
```typescript
rateLimitService.setConfig('stake', {
  maxRequests: 10,
  windowMs: 60000,
  cooldownMs: 5000
});
```

#### getConfig

```typescript
getConfig(action: string): RateLimitConfig | undefined
```

Get current configuration for an action.

**Returns:** Configuration object or undefined if not configured

#### checkRateLimit

```typescript
checkRateLimit(userId: string, action: string): RateLimitResult
```

Check if a request is allowed under current rate limits.

**Returns:**
```typescript
{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  reason?: string;
}
```

**Example:**
```typescript
const result = rateLimitService.checkRateLimit('user123', 'stake');
if (!result.allowed) {
  console.log(`Rate limited: ${result.reason}`);
  console.log(`Retry after ${result.retryAfter} seconds`);
}
```

#### recordRequest

```typescript
recordRequest(userId: string, action: string): void
```

Record a successful request. Should be called after `checkRateLimit` returns `allowed: true`.

#### getRateLimitStatus

```typescript
getRateLimitStatus(userId: string, action: string): RateLimitStatus
```

Get detailed status for a user's rate limit on an action.

**Returns:**
```typescript
{
  count: number;
  limit: number;
  remaining: number;
  resetTime: number;
  blocked: boolean;
}
```

#### getAllUserLimits

```typescript
getAllUserLimits(userId: string): Map<string, RateLimitStatus>
```

Get all rate limit statuses for a user across all configured actions.

**Returns:** Map of action names to status objects

#### resetUserLimits

```typescript
resetUserLimits(userId: string, action?: string): void
```

Reset rate limits for a user.

**Parameters:**
- `userId` - User identifier
- `action` - Optional specific action to reset. If omitted, resets all actions.

#### cleanup

```typescript
cleanup(): void
```

Remove expired rate limit entries from memory.

#### getStats

```typescript
getStats(): RateLimitStats
```

Get global rate limiting statistics.

**Returns:**
```typescript
{
  totalEntries: number;
  blockedUsers: number;
  activeWindows: number;
}
```

---

## RateLimitMiddleware

Middleware for intercepting and checking rate limits on transactions.

### Constructor

```typescript
new RateLimitMiddleware()
```

### Methods

#### checkAndRecord

```typescript
async checkAndRecord(context: RateLimitContext): Promise<RateLimitResult>
```

Check rate limit and record if allowed.

**Parameters:**
```typescript
{
  userId: string;
  action: string;
}
```

**Returns:** Same as `RateLimitService.checkRateLimit`

**Example:**
```typescript
const result = await rateLimitMiddleware.checkAndRecord({
  userId: 'user123',
  action: 'stake'
});
```

#### check

```typescript
async check(context: RateLimitContext): Promise<RateLimitResult>
```

Check rate limit without recording. Useful for preview/validation.

#### getStatus

```typescript
getStatus(userId: string, action: string): RateLimitStatus
```

Get current rate limit status.

#### getAllStatus

```typescript
getAllStatus(userId: string): Map<string, RateLimitStatus>
```

Get all rate limit statuses for a user.

---

## useRateLimit Hook

React hook for rate limiting in components.

### Usage

```typescript
const {
  checkRateLimit,
  getRateLimitStatus,
  getAllRateLimits,
  isLoading,
  error
} = useRateLimit();
```

### Returns

#### checkRateLimit

```typescript
async checkRateLimit(action: string): Promise<RateLimitResult>
```

Check and record rate limit for the connected wallet.

**Example:**
```typescript
const handleStake = async () => {
  const result = await checkRateLimit('stake');
  if (!result.allowed) {
    alert(result.reason);
    return;
  }
  // Proceed with transaction
};
```

#### getRateLimitStatus

```typescript
getRateLimitStatus(action: string): RateLimitStatus
```

Get current status for an action.

#### getAllRateLimits

```typescript
getAllRateLimits(): Map<string, RateLimitStatus>
```

Get all rate limits for the connected wallet.

#### isLoading

```typescript
isLoading: boolean
```

Loading state during rate limit checks.

#### error

```typescript
error: string | null
```

Error message if rate limit check fails.

---

## Contract Functions

### oxcast.clar

#### get-rate-limit-status

```clarity
(get-rate-limit-status (user principal) (action (string-ascii 20)))
```

Get rate limit status for a user and action.

**Returns:**
```clarity
(ok { count: uint, window-start: uint })
```

**Actions:**
- `"predict"` - Prediction transactions
- `"market"` - Market creation
- `"stake"` - Staking operations

#### Rate Limit Constants

```clarity
RATE-LIMIT-WINDOW u144  ;; ~24 hours in blocks
MAX-PREDICTIONS-PER-WINDOW u20
MAX-MARKETS-PER-WINDOW u5
MAX-STAKES-PER-WINDOW u10
```

### market-core.clar

#### get-user-rate-limit-status

```clarity
(get-user-rate-limit-status (user principal) (action (string-ascii 20)))
```

Get rate limit status for a user and action.

**Actions:**
- `"stake"` - Stake transactions
- `"market"` - Market creation
- `"resolve"` - Market resolution

#### get-rate-limit-config

```clarity
(get-rate-limit-config)
```

Get current rate limit configuration.

**Returns:**
```clarity
{
  window: uint,
  max-stakes: uint,
  max-markets: uint,
  max-resolutions: uint
}
```

---

## RateLimitFraudIntegrationService

Service integrating rate limiting with fraud detection.

### Methods

#### monitorRateLimitViolations

```typescript
monitorRateLimitViolations(userId: string, action: string): void
```

Monitor and record rate limit violations for fraud detection.

#### detectAnomalousPatterns

```typescript
detectAnomalousPatterns(userId: string): AnomalyResult
```

Detect anomalous behavior patterns based on rate limit usage.

**Returns:**
```typescript
{
  isAnomalous: boolean;
  patterns: string[];
  riskScore: number;
}
```

**Example:**
```typescript
const result = rateLimitFraudIntegrationService.detectAnomalousPatterns('user123');
if (result.isAnomalous) {
  console.log(`Risk score: ${result.riskScore}`);
  console.log(`Patterns: ${result.patterns.join(', ')}`);
}
```

#### getRecentSuspiciousActivities

```typescript
getRecentSuspiciousActivities(userId: string, windowMs?: number): SuspiciousActivity[]
```

Get recent suspicious activities for a user.

**Returns:**
```typescript
Array<{
  userId: string;
  action: string;
  timestamp: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}>
```

#### getSuspiciousActivitySummary

```typescript
getSuspiciousActivitySummary(userId: string): ActivitySummary
```

Get summary of suspicious activities.

**Returns:**
```typescript
{
  totalActivities: number;
  bySeverity: Record<string, number>;
  byAction: Record<string, number>;
  recentActivities: SuspiciousActivity[];
}
```

#### shouldBlockUser

```typescript
shouldBlockUser(userId: string): BlockRecommendation
```

Get recommendation on whether to block a user.

**Returns:**
```typescript
{
  shouldBlock: boolean;
  reason: string;
  recommendedAction: string;
}
```

**Example:**
```typescript
const recommendation = rateLimitFraudIntegrationService.shouldBlockUser('user123');
if (recommendation.shouldBlock) {
  console.log(`Block reason: ${recommendation.reason}`);
  console.log(`Action: ${recommendation.recommendedAction}`);
}
```

#### adjustRateLimitsBasedOnBehavior

```typescript
adjustRateLimitsBasedOnBehavior(userId: string): void
```

Dynamically adjust rate limits based on user behavior.

#### clearUserHistory

```typescript
clearUserHistory(userId: string): void
```

Clear suspicious activity history for a user.

#### getGlobalStats

```typescript
getGlobalStats(): GlobalStats
```

Get global statistics on rate limit violations.

**Returns:**
```typescript
{
  totalSuspiciousActivities: number;
  uniqueUsers: number;
  topViolators: Array<{ userId: string; count: number }>;
}
```

---

## Error Codes

### Frontend Errors

- `"Wallet not connected"` - User wallet not connected
- `"Rate limit exceeded"` - Maximum requests reached
- `"Cooldown period active"` - Cooldown not expired

### Contract Errors

- `ERR-RATE-LIMIT-EXCEEDED (u123)` - Rate limit exceeded on-chain

---

## Response Headers

When rate limiting is active, responses include:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1714176000
X-RateLimit-RetryAfter: 45
```

---

## Best Practices

1. **Always check before recording**
   ```typescript
   const result = await checkRateLimit(action);
   if (result.allowed) {
     // Proceed with transaction
   }
   ```

2. **Handle rate limit errors gracefully**
   ```typescript
   if (!result.allowed) {
     showNotification({
       type: 'warning',
       message: result.reason,
       retryAfter: result.retryAfter
     });
   }
   ```

3. **Display status to users**
   ```typescript
   <RateLimitStatus action="stake" showDetails={true} />
   ```

4. **Monitor for fraud**
   ```typescript
   rateLimitFraudIntegrationService.monitorRateLimitViolations(userId, action);
   ```

---

## Examples

### Complete Transaction Flow

```typescript
import { useRateLimit } from './hooks/useRateLimit';
import { useStake } from './hooks/useStake';

function StakeComponent() {
  const { checkRateLimit, getRateLimitStatus } = useRateLimit();
  const { placeYesStake, isLoading } = useStake();

  const handleStake = async (marketId: number, amount: number) => {
    // Check rate limit
    const rateLimitResult = await checkRateLimit('stake');
    if (!rateLimitResult.allowed) {
      alert(`Rate limited: ${rateLimitResult.reason}`);
      return;
    }

    // Proceed with stake
    await placeYesStake(marketId, amount);
  };

  const status = getRateLimitStatus('stake');

  return (
    <div>
      <RateLimitStatus action="stake" showDetails />
      <button 
        onClick={() => handleStake(1, 100)}
        disabled={isLoading || status.blocked}
      >
        Place Stake
      </button>
    </div>
  );
}
```

---

**Version**: 1.0.0
**Last Updated**: 2026-04-27
