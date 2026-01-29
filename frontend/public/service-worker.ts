/// <reference lib="webworker" />

const CACHE_NAME = '0xcast-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.png',
    '/favicon.ico',
];

const self = (globalThis as unknown) as ServiceWorkerGlobalScope;

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    if (event.request.url.startsWith('http')) {
                        cache.put(event.request, fetchResponse.clone());
                    }
                    return fetchResponse;
                });
            });
        }).catch(() => {
            if (event.request.mode === 'navigate') {
                return caches.match('/index.html') as Promise<Response>;
            }
            return new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
});

self.addEventListener('sync', (event: any) => {
    if (event.tag === 'sync-transactions') {
        event.waitUntil(syncTransactions());
    }
});

async function syncTransactions() {
    console.log('Syncing offline transactions...');
    // Logic to read from IndexedDB and replay transactions
}
