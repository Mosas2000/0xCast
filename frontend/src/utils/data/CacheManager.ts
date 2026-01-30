/**
 * Utility for managing local cache of analytic data to reduce Stacks API load and improve responsiveness.
 */
export class CacheManager {
    private static CACHE_PREFIX = '0xcast_cache_';
    private static DEFAULT_TTL = 3600000; // 1 hour in ms

    /**
     * Saves data to local storage with a timestamp.
     */
    static set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
        const entry = {
            timestamp: Date.now(),
            expiry: Date.now() + ttl,
            data
        };
        localStorage.setItem(`${this.CACHE_PREFIX}${key}`, JSON.stringify(entry));
    }

    /**
     * Retrieves data from cache, checking for expiry.
     */
    static get(key: string): any | null {
        const raw = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
        if (!raw) return null;

        try {
            const entry = JSON.parse(raw);
            if (Date.now() > entry.expiry) {
                this.remove(key);
                return null;
            }
            return entry.data;
        } catch (e) {
            return null;
        }
    }

    /**
     * Removes a specific key from cache.
     */
    static remove(key: string): void {
        localStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    }

    /**
     * Clears all 0xCast related cache entries.
     */
    static clearAll(): void {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    }
}
