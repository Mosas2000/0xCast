import { useState, useEffect, useCallback } from 'react';
import { rateLimitService } from '@/services/RateLimitService';
import { RateLimitAction, RateLimitStatus } from '@/types/rateLimit';

export function useRateLimit(userId: string, action: RateLimitAction) {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkLimit = useCallback(() => {
    try {
      const currentStatus = rateLimitService.getStatus(userId, action);
      setStatus(currentStatus);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check rate limit');
    }
  }, [userId, action]);

  const recordRequest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const newStatus = rateLimitService.recordRequest(userId, action);
      setStatus(newStatus);

      if (newStatus.blocked) {
        throw new Error(
          `Rate limit exceeded for ${action}. Please wait ${
            newStatus.cooldownUntil
              ? Math.ceil((newStatus.cooldownUntil - Date.now()) / 1000)
              : 'a moment'
          } seconds.`
        );
      }

      return newStatus;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rate limit error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, action]);

  useEffect(() => {
    checkLimit();
    const interval = setInterval(checkLimit, 1000);
    return () => clearInterval(interval);
  }, [checkLimit]);

  return {
    status,
    loading,
    error,
    checkLimit,
    recordRequest,
    isBlocked: status?.blocked || false,
    remaining: status?.remaining || 0,
    resetAt: status?.resetAt,
    cooldownUntil: status?.cooldownUntil,
  };
}

export function useAllRateLimits(userId: string) {
  const [statuses, setStatuses] = useState<RateLimitStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStatuses = useCallback(() => {
    try {
      const allStatuses = rateLimitService.getAllStatus(userId);
      setStatuses(allStatuses);
    } catch (err) {
      console.error('Failed to fetch rate limit statuses:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshStatuses();
    const interval = setInterval(refreshStatuses, 5000);
    return () => clearInterval(interval);
  }, [refreshStatuses]);

  return {
    statuses,
    loading,
    refreshStatuses,
  };
}
