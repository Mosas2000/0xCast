import { rateLimitService } from '@/services/RateLimitService';
import type { RateLimitAction } from '@/types/rateLimit';

export interface RateLimitContext {
  userId: string;
  action: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  reason?: string;
}

export class RateLimitMiddleware {
  async checkAndRecord(context: RateLimitContext): Promise<RateLimitResult> {
    const { userId, action } = context;
    
    const result = rateLimitService.checkRateLimit(userId, action);
    
    if (result.allowed) {
      rateLimitService.recordRequest(userId, action);
    }
    
    return result;
  }

  async check(context: RateLimitContext): Promise<RateLimitResult> {
    const { userId, action } = context;
    return rateLimitService.checkRateLimit(userId, action);
  }

  getStatus(userId: string, action: string) {
    return rateLimitService.getRateLimitStatus(userId, action);
  }

  getAllStatus(userId: string) {
    return rateLimitService.getAllUserLimits(userId);
  }
}

export const rateLimitMiddleware = new RateLimitMiddleware();

/**
 * Rate limit error thrown when a user exceeds the allowed request count.
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public action: RateLimitAction,
    public cooldownUntil?: number,
    public resetAt?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Execute a function with rate limiting.
 * Checks the rate limit for the given user/action, and if allowed, runs `fn`.
 * If blocked, calls `onBlocked` (if provided) and throws a RateLimitError.
 */
export async function withRateLimit<T>(
  options: {
    userId: string;
    action: RateLimitAction;
    onBlocked?: (cooldownMs: number) => void;
    onWarning?: (remaining: number) => void;
  },
  fn: () => Promise<T>
): Promise<T> {
  const { userId, action, onBlocked, onWarning } = options;

  const status = rateLimitService.recordRequest(userId, action);

  if (status.blocked) {
    const cooldownMs = status.cooldownUntil
      ? status.cooldownUntil - Date.now()
      : 0;

    if (onBlocked) {
      onBlocked(cooldownMs);
    }

    throw new RateLimitError(
      `Rate limit exceeded for ${action}. Please wait ${Math.ceil(cooldownMs / 1000)} seconds.`,
      action,
      status.cooldownUntil,
      status.resetAt
    );
  }

  if (status.remaining <= 2 && onWarning) {
    onWarning(status.remaining);
  }

  return fn();
}

/**
 * Create a rate limit middleware bound to a specific user.
 * Returns an async function that wraps any operation with rate limiting.
 *
 * Usage:
 * ```ts
 * const rateLimitMiddleware = createRateLimitMiddleware(userAddress);
 * await rateLimitMiddleware('create-market', async () => { ... }, { onBlocked: ... });
 * ```
 */
export function createRateLimitMiddleware(userId: string) {
  return async <T>(
    action: RateLimitAction,
    fn: () => Promise<T>,
    options?: {
      onBlocked?: (cooldownMs: number) => void;
      onWarning?: (remaining: number) => void;
    }
  ): Promise<T> => {
    return withRateLimit(
      {
        userId,
        action,
        ...options,
      },
      fn
    );
  };
}
