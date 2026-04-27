# Rate Limiting Implementation

## Overview

This document describes the comprehensive rate limiting system implemented for the 0xCast prediction market platform. The system prevents abuse, protects against DoS attacks, and integrates with fraud detection mechanisms.

## Architecture

### Components

1. **RateLimitService** - Core rate limiting logic
2. **RateLimitMiddleware** - Transaction interception layer
3. **useRateLimit Hook** - React integration
4. **Contract-Level Rate Limiting** - Clarity smart contract enforcement
5. **RateLimitFraudIntegrationService** - Fraud detection integration
6. **UI Components** - User-facing rate limit displays

## Features

### Frontend Rate Limiting

#### Service Layer (`RateLimitService`)

- Per-user, per-action rate limiting
- Configurable limits and time windows
- Cooldown periods between requests
- Automatic window reset
- Status tracking and reporting
- Cleanup of expired entries

**Default Configurations:**

| Action | Max Requests | Window | Cooldown |
|--------|-------------|--------|----------|
| stake | 10 | 60s | 5s |
| create-market | 5 | 5min | 10s |
| resolve-market | 3 | 60s | 15s |
| add-liquidity | 10 | 60s | 5s |
| remove-liquidity | 10 | 60s | 5s |
| vote | 20 | 5min | 3s |
| claim-rewards | 5 | 60s | 10s |

#### Middleware Layer

The `RateLimitMiddleware` intercepts all contract transactions and:
- Checks rate limits before execution
- Records successful requests
- Returns detailed status information
- Provides retry-after timing

#### React Integration

The `useRateLimit` hook provides:
- Easy rate limit checking
- Status queries
- Loading states
- Error handling
- Wallet integration

### Contract-Level Rate Limiting

#### oxcast.clar

Implements on-chain rate limiting for:
- **Predictions**: Max 20 per 24-hour window
- **Market Creation**: Max 5 per 24-hour window
- **Staking**: Max 10 per 24-hour window

#### market-core.clar

Implements on-chain rate limiting for:
- **Stakes**: Max 10 per 24-hour window
- **Market Creation**: Max 5 per 24-hour window
- **Resolutions**: Max 3 per 24-hour window

**Key Features:**
- Window-based tracking (144 blocks ≈ 24 hours)
- Automatic window reset
- Per-user enforcement
- Error code: `ERR-RATE-LIMIT-EXCEEDED (u123)`

### UI Components

#### RateLimitStatus

Displays rate limit status for a specific action:
- Current usage vs limit
- Visual progress bar
- Time until reset
- Color-coded warnings

#### RateLimitDashboard

Comprehensive monitoring interface:
- Overview statistics
- All action limits
- Blocked actions warning
- Real-time updates (5s interval)

### Fraud Detection Integration

The `RateLimitFraudIntegrationService` provides:

1. **Violation Monitoring**
   - Tracks rate limit violations
   - Records suspicious activities
   - Assigns severity levels

2. **Anomaly Detection**
   - Detects unusual patterns
   - Calculates risk scores
   - Identifies multiple violations

3. **User Blocking Recommendations**
   - Analyzes violation history
   - Suggests appropriate actions
   - Provides blocking criteria

4. **Dynamic Rate Limit Adjustment**
   - Reduces limits for suspicious users
   - Increases cooldown periods
   - Adapts to behavior patterns

## Usage

### Frontend Integration

```typescript
import { useRateLimit } from './hooks/useRateLimit';

function MyComponent() {
  const { checkRateLimit, getRateLimitStatus } = useRateLimit();

  const handleStake = async () => {
    const result = await checkRateLimit('stake');
    
    if (!result.allowed) {
      alert(result.reason);
      return;
    }

    // Proceed with stake transaction
  };

  const status = getRateLimitStatus('stake');
  // status: { count, limit, remaining, resetTime, blocked }
}
```

### Contract Integration

The contracts automatically enforce rate limits. No additional integration needed - violations return `ERR-RATE-LIMIT-EXCEEDED`.

### Monitoring

```typescript
import { rateLimitFraudIntegrationService } from './services/RateLimitFraudIntegrationService';

// Monitor user activity
rateLimitFraudIntegrationService.monitorRateLimitViolations(userId, action);

// Check for anomalies
const anomalyCheck = rateLimitFraudIntegrationService.detectAnomalousPatterns(userId);

// Get blocking recommendation
const blockCheck = rateLimitFraudIntegrationService.shouldBlockUser(userId);
```

## Configuration

### Adjusting Rate Limits

```typescript
import { rateLimitService } from './services/RateLimitService';

rateLimitService.setConfig('custom-action', {
  maxRequests: 15,
  windowMs: 120000, // 2 minutes
  cooldownMs: 8000, // 8 seconds
});
```

### Contract Configuration

Rate limit parameters are defined as data variables in contracts and can be updated by authorized principals:

```clarity
(define-data-var rate-limit-window uint u144)
(define-data-var max-stakes-per-window uint u10)
```

## Testing

### Test Coverage

- **RateLimitService**: 272 test cases
- **RateLimitMiddleware**: 110 test cases
- **useRateLimit Hook**: 151 test cases

### Running Tests

```bash
npm test -- RateLimitService
npm test -- RateLimitMiddleware
npm test -- useRateLimit
```

## API Reference

### RateLimitService

#### Methods

- `checkRateLimit(userId, action)` - Check if request is allowed
- `recordRequest(userId, action)` - Record a successful request
- `getRateLimitStatus(userId, action)` - Get current status
- `getAllUserLimits(userId)` - Get all limits for user
- `resetUserLimits(userId, action?)` - Reset limits
- `cleanup()` - Remove expired entries
- `getStats()` - Get global statistics

### RateLimitMiddleware

#### Methods

- `checkAndRecord(context)` - Check and record if allowed
- `check(context)` - Check without recording
- `getStatus(userId, action)` - Get status
- `getAllStatus(userId)` - Get all statuses

### useRateLimit Hook

#### Returns

- `checkRateLimit(action)` - Async rate limit check
- `getRateLimitStatus(action)` - Get current status
- `getAllRateLimits()` - Get all limits
- `isLoading` - Loading state
- `error` - Error message

## Security Considerations

1. **Client-Side Enforcement**: Frontend rate limiting is advisory only. Contract-level enforcement is mandatory.

2. **Bypass Prevention**: All critical operations are rate-limited at the contract level.

3. **Fraud Detection**: Integration with fraud detection system provides additional protection.

4. **Dynamic Adjustment**: Rate limits can be tightened for suspicious users.

5. **Monitoring**: Comprehensive logging and monitoring of violations.

## Performance

- **Memory Usage**: O(users × actions) for tracking
- **Lookup Time**: O(1) for rate limit checks
- **Cleanup**: Automatic removal of expired entries
- **Contract Gas**: Minimal overhead (~100 gas per check)

## Future Enhancements

1. **Distributed Rate Limiting**: Redis-based coordination for multi-instance deployments
2. **Machine Learning**: Predictive anomaly detection
3. **Tiered Limits**: Different limits based on user reputation
4. **Geographic Rate Limiting**: Location-based restrictions
5. **API Rate Limiting**: Extend to REST API endpoints

## Troubleshooting

### Common Issues

**Issue**: Rate limit triggered unexpectedly
- **Solution**: Check `getRateLimitStatus()` to see current usage

**Issue**: Contract rejects transaction with ERR-RATE-LIMIT-EXCEEDED
- **Solution**: Wait for window to reset (check `resetTime`)

**Issue**: Rate limits not resetting
- **Solution**: Verify system time is correct, check window configuration

## Monitoring and Alerts

### Key Metrics

- Total rate limit violations
- Blocked users count
- High utilization warnings
- Anomalous pattern detections

### Dashboard Access

Navigate to `/rate-limits` to view the comprehensive monitoring dashboard.

## Compliance

This rate limiting implementation helps ensure:
- Fair usage of platform resources
- Protection against market manipulation
- Compliance with anti-abuse policies
- Audit trail for suspicious activities

## Support

For issues or questions about rate limiting:
1. Check this documentation
2. Review test cases for examples
3. Examine the RateLimitDashboard for real-time status
4. Contact the development team

---

**Last Updated**: 2026-04-27
**Version**: 1.0.0
