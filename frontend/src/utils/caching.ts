interface CacheEntry<T> {
    value: T;
    expiry: number;
}

class Cache {
    private cache: Map<string, CacheEntry<any>> = new Map();

    /**
     * Get cached value
     * @param key - Cache key
     * @returns Cached value or null if expired/not found
     */
    getCached<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    /**
     * Set cache with expiry
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttl - Time to live in milliseconds (default: 5 minutes)
     */
    setCache<T>(key: string, value: T, ttl: number = 300000): void {
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });
    }

    /**
     * Clear all cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Clear specific cache entry
     * @param key - Cache key to clear
     */
    clearEntry(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear expired entries
     */
    clearExpired(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
            }
        }
    }
}

// Export singleton instance
export const cache = new Cache();

// Export individual functions for convenience
export const getCached = <T,>(key: string) => cache.getCached<T>(key);
export const setCache = <T,>(key: string, value: T, ttl?: number) => cache.setCache(key, value, ttl);
export const clearCache = () => cache.clearCache();
export const clearEntry = (key: string) => cache.clearEntry(key);
export const clearExpired = () => cache.clearExpired();
