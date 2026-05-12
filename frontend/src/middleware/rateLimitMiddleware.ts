import { rateLimitService } from '../services/RateLimitService';

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
 * Create a rate limit middleware instance
 * 
 * Factory function for creating rate limit middleware.
 * Returns the singleton instance.
 * 
 * @returns RateLimitMiddleware instance
 * 
 * @example
 * ```typescript
 * const middleware = createRateLimitMiddleware();
 * const result = await middleware.checkAndRecord({
 *   userId: 'user123',
 *   action: 'create-market'
 * });
 * ```
 */
export function createRateLimitMiddleware(): RateLimitMiddleware {
  return rateLimitMiddleware;
}
