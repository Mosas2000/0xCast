export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  cooldownMs?: number;
}

export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  stake: {
    maxRequests: 10,
    windowMs: 60000,
    cooldownMs: 5000,
  },
  'create-market': {
    maxRequests: 5,
    windowMs: 300000,
    cooldownMs: 10000,
  },
  'resolve-market': {
    maxRequests: 3,
    windowMs: 60000,
    cooldownMs: 15000,
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
  vote: {
    maxRequests: 20,
    windowMs: 300000,
    cooldownMs: 3000,
  },
  'claim-rewards': {
    maxRequests: 5,
    windowMs: 60000,
    cooldownMs: 10000,
  },
};

export const RATE_LIMIT_HEADERS = {
  LIMIT: 'X-RateLimit-Limit',
  REMAINING: 'X-RateLimit-Remaining',
  RESET: 'X-RateLimit-Reset',
  RETRY_AFTER: 'X-RateLimit-RetryAfter',
};

export const RATE_LIMIT_MESSAGES = {
  EXCEEDED: 'Rate limit exceeded. Please wait before trying again.',
  COOLDOWN: 'Cooldown period active. Please wait before trying again.',
  WALLET_NOT_CONNECTED: 'Wallet not connected',
  UNKNOWN_ERROR: 'Rate limit check failed',
};

export const FRAUD_DETECTION_THRESHOLDS = {
  SUSPICIOUS_UTILIZATION: 0.8,
  HIGH_RISK_SCORE: 70,
  BLOCK_THRESHOLD_HIGH: 3,
  BLOCK_THRESHOLD_MEDIUM: 5,
  MONITORING_WINDOW: 3600000,
};
