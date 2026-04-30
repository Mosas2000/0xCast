import { rateLimitService } from '@/services/RateLimitService';
import { RateLimitAction } from '@/types/rateLimit';

export interface RateLimitMiddlewareOptions {
  userId: string;
  action: RateLimitAction;
  onBlocked?: (cooldownMs: number) => void;
  onWarning?: (remaining: number) => void;
}

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

export async function withRateLimit<T>(
  options: RateLimitMiddlewareOptions,
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
