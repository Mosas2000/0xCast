# Rate Limiting Implementation

## Overview

This document describes the comprehensive rate limiting system implemented for the 0xCast prediction market platform. The system prevents abuse, protects against DoS attacks, and ensures fair usage across all contract transactions.

## Architecture

### Frontend Components

#### 1. Type Definitions (`frontend/src/types/rateLimit.ts`)
- **RateLimitAction**: Enum of all rate-limited actions
- **RateLimitConfig**: Configuration for each action (max requests, window, cooldown)
- **RateLimitStatus**: Current status for a user/action combination
- **RateLimitRecord**: Historical record of requests
- **RateLimitViolation**: Violation tracking
- **RateLimitMetrics**: System-wide metrics

#### 2. Core Service (`frontend/src/services/RateLimitService.ts`)
- Manages rate limit state in memory
- Tracks requests per user per action
- Enforces time windows and cooldown periods
- Records violations for monitoring
- Provides metrics and analytics
- Supports custom configurations

#### 3. React Hooks (`frontend/src/hooks/useRateLimit.ts`)
- `useRateLimit`: Hook for single action rate limiting
- `useAllRateLimits`: Hook for monitoring all actions
- Real-time status updates
- Automatic refresh intervals

#### 4. Middleware (`frontend/src/middleware/rateLimitMiddleware.ts`)
- `withRateLimit`: Wrapper function for rate-limited operations
- `createRateLimitMiddleware`: Factory for user-specific middleware
- `RateLimitError`: Custom error type for rate limit violations

#### 5. UI Components
- **RateLimitStatus**: Displays current status with visual indicators
- **RateLimitDashboard**: Comprehensive view of all rate limits
- **RateLimitBanner**: Warning/error banner for users

### Smart Contract

#### Rate Limiter Contract (`contracts/rate-limiter.clar`)
- On-chain rate limiting enforcement
- Per-user, per-action tracking
- Block-based time windows
- Cooldown period enforcement
- Admin controls for configuration
- Pause functionality

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

## Integration Points

### Hooks Integration

Rate limiting has been integrated into the following hooks:

1. **useStake** - Staking operations
2. **useMarketCreation** - Market creation
3. **useLiquidityActions** - Add/remove liquidity

### Integration Pattern

```typescript
const rateLimitMiddleware = createRateLimitMiddleware(address);

await rateLimitMiddleware(
  'action-name',
  async () => {
    // Perform the actual operation
  },
  {
    onBlocked: (cooldownMs) => {
      throw new Error(`Rate limit exceeded. Wait ${cooldownMs}ms`);
    },
    onWarning: (remaining) => {
      console.warn(`${remaining} requests remaining`);
    },
  }
);
```

## Features

### 1. Per-User Rate Limiting
- Each user has independent rate limits
- Prevents one user from affecting others
- Fair usage enforcement

### 2. Per-Action Rate Limiting
- Different limits for different operations
- Critical operations have stricter limits
- Flexible configuration

### 3. Time Windows
- Rolling time windows
- Automatic reset after window expires
- Configurable window duration

### 4. Cooldown Periods
- Enforced waiting period after limit exceeded
- Prevents rapid retry attacks
- Configurable per action

### 5. Violation Tracking
- Records all rate limit violations
- Identifies repeat offenders
- Supports analytics and monitoring

### 6. Metrics and Monitoring
- Total requests tracked
- Blocked requests counted
- Top violators identified
- Per-action violation statistics

### 7. Admin Controls
- Update rate limit configurations
- Reset user limits
- Pause/unpause system
- View system metrics

## User Experience

### Visual Indicators

1. **Green (✓)**: Plenty of requests remaining
2. **Yellow (⚠️)**: Low requests remaining (≤2)
3. **Red (🚫)**: Rate limit exceeded

### User Feedback

- Real-time status display
- Countdown timers for cooldowns
- Clear error messages
- Warning banners before blocking

### Dashboard

Users can view:
- Current status for all actions
- Remaining requests
- Reset times
- Cooldown periods

## Testing

### Frontend Tests

1. **Service Tests** (`frontend/src/services/__tests__/RateLimitService.test.ts`)
   - 183 lines of comprehensive tests
   - Tests all service methods
   - Validates time window logic
   - Verifies cooldown enforcement

2. **Hook Tests** (`frontend/src/hooks/__tests__/useRateLimit.test.tsx`)
   - 172 lines of React hook tests
   - Tests both hooks
   - Validates state management
   - Tests error handling

3. **Component Tests** (`frontend/src/components/__tests__/RateLimitComponents.test.tsx`)
   - 176 lines of component tests
   - Tests all UI components
   - Validates rendering logic
   - Tests user interactions

### Contract Tests

**Rate Limiter Tests** (`tests/rate-limiter.test.ts`)
- Configuration management
- Rate limiting logic
- Per-user tracking
- Per-action tracking
- Window expiration
- Cooldown enforcement
- Admin functions
- Pause functionality

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

### Hooks

```typescript
function useRateLimit(userId: string, action: RateLimitAction): {
  status: RateLimitStatus | null
  loading: boolean
  error: string | null
  checkLimit: () => void
  recordRequest: () => Promise<RateLimitStatus>
  isBlocked: boolean
  remaining: number
  resetAt?: number
  cooldownUntil?: number
}

function useAllRateLimits(userId: string): {
  statuses: RateLimitStatus[]
  loading: boolean
  refreshStatuses: () => void
}
```

### Middleware

```typescript
function withRateLimit<T>(
  options: RateLimitMiddlewareOptions,
  fn: () => Promise<T>
): Promise<T>

function createRateLimitMiddleware(userId: string): <T>(
  action: RateLimitAction,
  fn: () => Promise<T>,
  options?: {
    onBlocked?: (cooldownMs: number) => void
    onWarning?: (remaining: number) => void
  }
) => Promise<T>
```

## Security Considerations

1. **Client-Side Enforcement**: Frontend rate limiting is advisory only
2. **Contract-Level Enforcement**: Smart contract provides authoritative rate limiting
3. **Bypass Prevention**: Contract checks cannot be bypassed
4. **Admin Controls**: Only contract owner can modify configurations
5. **Pause Mechanism**: Emergency pause available for security incidents

## Performance

- **Memory Efficient**: Old records automatically cleaned up
- **Fast Lookups**: Map-based storage for O(1) access
- **Minimal Overhead**: Lightweight checks before operations
- **Scalable**: Handles thousands of users and actions

## Future Enhancements

1. **Dynamic Rate Limits**: Adjust limits based on user reputation
2. **Burst Allowance**: Allow short bursts above normal limits
3. **Priority Queuing**: Premium users get higher limits
4. **Analytics Dashboard**: Detailed visualization of rate limit data
5. **Alert System**: Notify admins of suspicious patterns
6. **IP-Based Limiting**: Additional layer of protection
7. **Distributed Rate Limiting**: Support for multiple frontend instances

## Acceptance Criteria Status

- ✅ Rate limiting implemented in contracts
- ✅ Frontend respects rate limits
- ✅ Users informed of rate limit status
- ✅ Monitoring dashboard shows rate limit hits
- ✅ Tests verify rate limiting works

## Conclusion

The rate limiting system provides comprehensive protection against abuse while maintaining a smooth user experience. The multi-layered approach (frontend + contract) ensures both user convenience and security.
