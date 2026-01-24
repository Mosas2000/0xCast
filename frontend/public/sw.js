// Service Worker for 0xCast PWA
const CACHE_VERSION = 'v1.0.0';
const CACHE_STATIC = `0xcast-static-${CACHE_VERSION}`;
const CACHE_DYNAMIC = `0xcast-dynamic-${CACHE_VERSION}`;
const CACHE_API = `0xcast-api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Install
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('0xcast-') && name !== CACHE_STATIC && name !== CACHE_DYNAMIC && name !== CACHE_API)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // API requests: Network first, cache fallback
  if (url.pathname.startsWith('/api/') || url.hostname.includes('hiro.so')) {
    event.respondWith(networkFirst(request, CACHE_API));
    return;
  }
  
  // Static assets: Cache first
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }
  
  // Dynamic content: Stale while revalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_DYNAMIC));
});

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      
      // Add timestamp to cache
      const clonedResponse = response.clone();
      const responseToCache = new Response(clonedResponse.body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: {
          ...Object.fromEntries(clonedResponse.headers.entries()),
          'sw-cache-time': Date.now().toString()
        }
      });
      
      cache.put(request, responseToCache);
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await caches.match(request);
    
    if (cached) {
      // Check if cache is stale
      const cacheTime = cached.headers.get('sw-cache-time');
      if (cacheTime && Date.now() - parseInt(cacheTime) < API_CACHE_DURATION) {
        return cached;
      }
    }
    
    return cached || new Response('Offline', { status: 503 });
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Stale while revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  });
  
  return cached || fetchPromise;
}

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-tx') {
    event.waitUntil(syncPendingTransactions());
  }
});

async function syncPendingTransactions() {
  console.log('[SW] Syncing pending transactions...');
  // Notify clients to sync
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_PENDING_TX' });
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/badge-72x72.svg',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || '0xCast',
      options
    )
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
