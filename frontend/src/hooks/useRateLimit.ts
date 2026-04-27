import { useState, useCallback, useEffect } from 'react';
import { rateLimitMiddleware } from '../middleware/RateLimitMiddleware';
import { useWallet } from '../components/WalletProvider';

interface RateLimitStatus {
  count: number;
  limit: number;
  remaining: number;
  resetTime: number;
  blocked: boolean;
}

interface UseRateLimitReturn {
  checkRateLimit: (action: string) => Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
    reason?: string;
  }>;
  getRateLimitStatus: (action: string) => RateLimitStatus;
  getAllRateLimits: () => Map<string, RateLimitStatus>;
  isLoading: boolean;
  error: string | null;
}

export function useRateLimit(): UseRateLimitReturn {
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkRateLimit = useCallback(
    async (action: string) => {
      if (!address) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: 0,
          reason: 'Wallet not connected',
        };
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await rateLimitMiddleware.checkAndRecord({
          userId: address,
          action,
        });

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Rate limit check failed';
        setError(errorMessage);
        return {
          allowed: false,
          remaining: 0,
          resetTime: 0,
          reason: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [address]
  );

  const getRateLimitStatus = useCallback(
    (action: string): RateLimitStatus => {
      if (!address) {
        return {
          count: 0,
          limit: 0,
          remaining: 0,
          resetTime: 0,
          blocked: false,
        };
      }

      return rateLimitMiddleware.getStatus(address, action);
    },
    [address]
  );

  const getAllRateLimits = useCallback((): Map<string, RateLimitStatus> => {
    if (!address) {
      return new Map();
    }

    return rateLimitMiddleware.getAllStatus(address);
  }, [address]);

  return {
    checkRateLimit,
    getRateLimitStatus,
    getAllRateLimits,
    isLoading,
    error,
  };
}
