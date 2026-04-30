export type RateLimitAction =
  | 'stake'
  | 'create-market'
  | 'resolve-market'
  | 'add-liquidity'
  | 'remove-liquidity'
  | 'vote'
  | 'claim-rewards'
  | 'dispute'
  | 'trade';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  cooldownMs?: number;
}

export interface RateLimitStatus {
  action: RateLimitAction;
  remaining: number;
  resetAt: number;
  blocked: boolean;
  cooldownUntil?: number;
}

export interface RateLimitRecord {
  userId: string;
  action: RateLimitAction;
  timestamp: number;
  count: number;
  blocked: boolean;
  cooldownUntil?: number;
}

export interface RateLimitViolation {
  userId: string;
  action: RateLimitAction;
  timestamp: number;
  attemptedCount: number;
  limit: number;
}

export interface RateLimitMetrics {
  totalRequests: number;
  blockedRequests: number;
  violationsByAction: Record<RateLimitAction, number>;
  topViolators: Array<{ userId: string; violations: number }>;
}

export const DEFAULT_RATE_LIMITS: Record<RateLimitAction, RateLimitConfig> = {
  'stake': {
    maxRequests: 10,
    windowMs: 60000,
    cooldownMs: 5000,
  },
  'create-market': {
    maxRequests: 5,
    windowMs: 300000,
    cooldownMs: 60000,
  },
  'resolve-market': {
    maxRequests: 3,
    windowMs: 60000,
    cooldownMs: 10000,
  },
  'add-liquidity': {
    maxRequests: 10,
    windowMs: 60000,
    cooldownMs: 5000,
  },
  'remove-liquidity': {
    maxRequests: 10,
    windowMs: 60000,
    cooldownMs: 5000,
  },
  'vote': {
    maxRequests: 20,
    windowMs: 60000,
    cooldownMs: 3000,
  },
  'claim-rewards': {
    maxRequests: 5,
    windowMs: 300000,
    cooldownMs: 30000,
  },
  'dispute': {
    maxRequests: 2,
    windowMs: 300000,
    cooldownMs: 60000,
  },
  'trade': {
    maxRequests: 20,
    windowMs: 60000,
    cooldownMs: 3000,
  },
};
