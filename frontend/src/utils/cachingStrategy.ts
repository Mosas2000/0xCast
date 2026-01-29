export class CachingStrategy {
    static async getWithCacheFirst(url: string): Promise<Response> {
        const cache = await caches.open('0xcast-dynamic');
        const cachedResponse = await cache.match(url);

        if (cachedResponse) {
            // Optional: background fetch to update cache (stale-while-revalidate)
            fetch(url).then(response => cache.put(url, response));
            return cachedResponse;
        }

        const networkResponse = await fetch(url);
        cache.put(url, networkResponse.clone());
        return networkResponse;
    }

    static async clearCache() {
        const keys = await caches.keys();
        return Promise.all(keys.map(key => caches.delete(key)));
    }
}

export const cachingStrategy = new CachingStrategy();
