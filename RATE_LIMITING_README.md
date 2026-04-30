# Rate Limiting System

## Quick Start

### For Users

The rate limiting system protects the platform from abuse while ensuring fair usage for all users.

#### Viewing Your Rate Limits

```typescript
import { useAllRateLimits } from '@/hooks/useRateLimit';

function MyComponent() {
  const { statuses, loading } = useAllRateLimits(userAddress);
  
  return (
    <div>
      {statuses.map(status => (
        <div key={status.action}>
          {status.action}: {status.remaining} remaining
        </div>
      ))}
    </div>
  );
}
```

#### Using Rate-Limited Actions

```typescript
import { useRateLimit } from '@/hooks/useRateLimit';

function StakeButton() {
  const { recordRequest, isBlocked, remaining } = useRateLimit(userAddress, 'stake');
  
  const handleStake = async () => {
    try {
      await recordRequest();
      // Proceed with stake
    } catch (error) {
      // Handle rate limit error
    }
  };
  
  return (
    <button disabled={isBlocked} onClick={handleStake}>
      Stake ({remaining} remaining)
    </button>
  );
}
```

### For Developers

#### Integrating Rate Limiting

1. **Import the middleware**:
```typescript
import { createRateLimitMiddleware } from '@/middleware/rateLimitMiddleware';
```

2. **Wrap your transaction**:
```typescript
const rateLimitMiddleware = createRateLimitMiddleware(userAddress);

await rateLimitMiddleware(
  'action-name',
  async () => {
    // Your transaction code
  },
  {
    onBlocked: (cooldownMs) => {
      console.error(`Blocked for ${cooldownMs}ms`);
    },
    onWarning: (remaining) => {
      console.warn(`${remaining} requests remaining`);
    },
  }
);
```

#### Adding New Rate-Limited Actions

1. Add action to `RateLimitAction` type in `frontend/src/types/rateLimit.ts`
2. Add default config to `DEFAULT_RATE_LIMITS`
3. Add contract config in `contracts/rate-limiter.clar`
4. Update display names in helpers

### For Administrators

#### Monitoring

Access the monitoring dashboard:
```typescript
import { RateLimitMonitoringDashboard } from '@/components/RateLimitMonitoringDashboard';

<RateLimitMonitoringDashboard />
```

#### Updating Configurations

```typescript
import { rateLimitService } from '@/services/RateLimitService';

rateLimitService.updateConfig('stake', {
  maxRequests: 20,
  windowMs: 120000,
  cooldownMs: 10000,
});
```

#### Resetting User Limits

```typescript
// Reset specific action
rateLimitService.resetUserLimits(userId, 'stake');

// Reset all actions
rateLimitService.resetUserLimits(userId);
```

## Rate Limit Configurations

| Action | Max Requests | Window | Cooldown |
|--------|-------------|--------|----------|
| stake | 10 | 60s | 5s |
| create-market | 5 | 5min | 60s |
| resolve-market | 3 | 60s | 10s |
| add-liquidity | 10 | 60s | 5s |
| remove-liquidity | 10 | 60s | 5s |
| vote | 20 | 60s | 3s |
| claim-rewards | 5 | 5min | 30s |
| dispute | 2 | 5min | 60s |
| trade | 20 | 60s | 3s |

## Components

### RateLimitStatus
Displays current rate limit status with visual indicators.

```typescript
<RateLimitStatus status={status} showDetails={true} />
```

### RateLimitDashboard
Shows all rate limits for a user.

```typescript
<RateLimitDashboard userId={userAddress} />
```

### RateLimitBanner
Warning/error banner for rate limit issues.

```typescript
<RateLimitBanner status={status} onDismiss={() => {}} />
```

### RateLimitProgressBar
Visual progress bar for remaining requests.

```typescript
<RateLimitProgressBar status={status} maxRequests={10} />
```

### RateLimitMonitoringDashboard
Admin dashboard for monitoring violations.

```typescript
<RateLimitMonitoringDashboard />
```

## API Reference

### RateLimitService

```typescript
class RateLimitService {
  checkLimit(userId: string, action: RateLimitAction): RateLimitStatus
  recordRequest(userId: string, action: RateLimitAction): RateLimitStatus
  getStatus(userId: string, action: RateLimitAction): RateLimitStatus
  getAllStatus(userId: string): RateLimitStatus[]
  resetUserLimits(userId: string, action?: RateLimitAction): void
  getViolations(userId?: string): RateLimitViolation[]
  getMetrics(): RateLimitMetrics
  updateConfig(action: RateLimitAction, config: RateLimitConfig): void
  cleanup(olderThanMs?: number): void
}
```

### RateLimitMonitoringService

```typescript
class RateLimitMonitoringService {
  analyzeViolations(userId?: string): RateLimitAlert[]
  getMetrics(): RateLimitMetrics
  getTopViolators(limit?: number): Array<{ userId: string; violations: number }>
  getViolationsByAction(): Record<RateLimitAction, number>
  getActiveAlerts(severity?: string): RateLimitAlert[]
  dismissAlert(alertId: string): boolean
  generateReport(): Report
}
```

## Testing

Run rate limit tests:
```bash
npm test -- RateLimitService
npm test -- useRateLimit
npm test -- RateLimitComponents
npm test -- rateLimitHelpers
```

Run contract tests:
```bash
npm test -- rate-limiter
```

## Troubleshooting

### Rate Limit Exceeded
- Wait for the cooldown period to expire
- Check your current status with `getStatus()`
- Contact support if you believe it's an error

### Incorrect Remaining Count
- Refresh the status with `checkLimit()`
- Clear browser cache
- Check for multiple browser tabs

### Contract Rate Limit Mismatch
- Frontend and contract limits may differ
- Contract limits are authoritative
- Sync configurations if needed

## Best Practices

1. **Always check status before operations**
2. **Handle rate limit errors gracefully**
3. **Show users their remaining requests**
4. **Provide clear error messages**
5. **Monitor for abuse patterns**
6. **Adjust limits based on usage**
7. **Test rate limiting in development**

## Security Notes

- Frontend rate limiting is advisory
- Contract enforcement is authoritative
- Cannot be bypassed on-chain
- Admin functions require owner privileges
- Violations are tracked for analysis

## Support

For issues or questions:
- Check the implementation docs: `RATE_LIMITING_IMPLEMENTATION.md`
- Review test files for examples
- Contact the development team
