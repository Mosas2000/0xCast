/**
 * Simple client-side rate limiter to prevent spamming transactions or API calls.
 */
export class RateLimiter {
    private requests: Map<string, number[]> = new Map();

    /**
     * Checks if a request for a specific key is within the rate limit.
     * @param key Unique identifier for the action (e.g., 'submit-trade', 'create-market')
     * @param limit Maximum number of requests allowed in the window
     * @param windowMs Time window in milliseconds
     * @returns boolean True if allowed, false if rate limited
     */
    isAllowed(key: string, limit: number, windowMs: number): boolean {
        const now = Date.now();
        const timestamps = this.requests.get(key) || [];

        // Remove expired timestamps
        const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

        if (validTimestamps.length >= limit) {
            return false;
        }

        validTimestamps.push(now);
        this.requests.set(key, validTimestamps);
        return true;
    }

    /**
     * Gets the remaining time until the next request is allowed.
     */
    getWaitTime(key: string, windowMs: number): number {
        const timestamps = this.requests.get(key) || [];
        if (timestamps.length === 0) return 0;

        const oldest = timestamps[0];
        const wait = windowMs - (Date.now() - oldest);
        return Math.max(0, wait);
    }
}

export const rateLimiter = new RateLimiter();
