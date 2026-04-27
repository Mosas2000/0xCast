export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return 'now';

  const seconds = Math.ceil(milliseconds / 1000);
  
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}

export function formatResetTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  const diffMs = timestamp - now.getTime();
  
  if (diffMs <= 0) {
    return 'Reset now';
  }
  
  return `Resets in ${formatTimeRemaining(diffMs)}`;
}

export function calculateUtilizationPercentage(count: number, limit: number): number {
  if (limit === 0) return 100;
  return Math.round((count / limit) * 100);
}

export function getRateLimitSeverity(
  utilizationPercentage: number
): 'low' | 'medium' | 'high' | 'critical' {
  if (utilizationPercentage >= 100) return 'critical';
  if (utilizationPercentage >= 80) return 'high';
  if (utilizationPercentage >= 50) return 'medium';
  return 'low';
}

export function getRateLimitColor(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (severity) {
    case 'critical':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
      return 'yellow';
    case 'low':
    default:
      return 'green';
  }
}

export function shouldShowWarning(utilizationPercentage: number): boolean {
  return utilizationPercentage >= 80;
}

export function getRateLimitMessage(
  remaining: number,
  limit: number,
  resetTime: number
): string {
  const utilizationPercentage = calculateUtilizationPercentage(limit - remaining, limit);
  
  if (utilizationPercentage >= 100) {
    return `Rate limit reached. ${formatResetTime(resetTime)}.`;
  }
  
  if (utilizationPercentage >= 80) {
    return `Approaching rate limit (${remaining}/${limit} remaining). ${formatResetTime(resetTime)}.`;
  }
  
  return `${remaining}/${limit} requests remaining. ${formatResetTime(resetTime)}.`;
}

export function parseRateLimitHeaders(headers: Headers): {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
} | null {
  const limit = headers.get('X-RateLimit-Limit');
  const remaining = headers.get('X-RateLimit-Remaining');
  const reset = headers.get('X-RateLimit-Reset');
  const retryAfter = headers.get('X-RateLimit-RetryAfter');

  if (!limit || !remaining || !reset) {
    return null;
  }

  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset: parseInt(reset, 10),
    retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
  };
}

export function createRateLimitError(
  reason: string,
  retryAfter?: number
): Error {
  const error = new Error(reason);
  error.name = 'RateLimitError';
  if (retryAfter) {
    (error as any).retryAfter = retryAfter;
  }
  return error;
}

export function isRateLimitError(error: unknown): boolean {
  return error instanceof Error && error.name === 'RateLimitError';
}

export function getRetryAfterFromError(error: unknown): number | undefined {
  if (isRateLimitError(error)) {
    return (error as any).retryAfter;
  }
  return undefined;
}
