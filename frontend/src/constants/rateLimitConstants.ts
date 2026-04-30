export const RATE_LIMIT_REFRESH_INTERVAL = 1000;
export const RATE_LIMIT_CLEANUP_INTERVAL = 3600000;
export const RATE_LIMIT_STORAGE_TTL = 3600000;

export const RATE_LIMIT_MESSAGES = {
  BLOCKED: 'Rate limit exceeded. Please wait before trying again.',
  WARNING: 'You are approaching your rate limit.',
  RESET: 'Your rate limit has been reset.',
  ERROR: 'Failed to check rate limit status.',
} as const;

export const RATE_LIMIT_COLORS = {
  SAFE: 'green',
  WARNING: 'yellow',
  BLOCKED: 'red',
} as const;

export const RATE_LIMIT_ICONS = {
  SAFE: '✓',
  WARNING: '⚠️',
  BLOCKED: '🚫',
} as const;
