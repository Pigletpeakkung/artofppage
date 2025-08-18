// Service Worker Version - Update this to force refresh cache
const CACHE_VERSION = 'v3';
const CACHE_NAME = `pegearts-cache-${CACHE_VERSION}`;

// Precached assets
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/404.html',
  '/term-of-service.html',
  '/cookie-policy.html',
  '/css/main.css',
  '/js/main.js',
  '/assets/projects/ai-creative-suite.jpg',
  '/assets/og-image.jpg',
  '/assets/twitter-card.jpg',
  '/fallback.html',
  '/offline.svg'
];

// Cache strategies
const STRATEGIES = {
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Routes with caching strategies
const ROUTE_CONFIG = [
  {
    route: '/',
    strategy: STRATEGIES.NETWORK_FIRST
  },
  {
    route: /\.(html|css|js)$/,
    strategy: STRATEGIES.STALE_WHILE_REVALIDATE
  },
  {
    route: /\.(jpg|jpeg|png|gif|svg|webp)$/,
    strategy: STRATEGIES.CACHE_FIRST,
    options: {
      cacheName: 'images-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      }
    }
  },
  {
    route: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
    strategy: STRATEGIES.CACHE_FIRST,
    options: {
      cacheName: 'google-fonts-cache',
      expiration: {
        maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
      }
    }
  }
];

// Install Event - Precaching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('pegearts-cache')) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Handle requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests and chrome-extension
  if (event.request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip third-party requests that don't match our route config
  if (url.origin !== self.location.origin && 
      !ROUTE_CONFIG.some(config => url.href.match(config.route))) {
    return;
  }

  // Find matching strategy
  const strategyConfig = ROUTE_CONFIG.find(config => 
    typeof config.route === 'string' 
      ? url.pathname === config.route 
      : url.href.match(config.route)
  ) || { strategy: STRATEGIES.NETWORK_FIRST };

  event.respondWith(
    handleFetch(event.request, strategyConfig)
      .catch(() => {
        // Fallback for failed requests
        if (event.request.mode === 'navigate') {
          return caches.match('/fallback.html');
        }
        if (event.request.destination === 'image') {
          return caches.match('/offline.svg');
        }
        return new Response('Offline', { 
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Handle fetch with different strategies
async function handleFetch(request, { strategy, options = {} }) {
  const cacheName = options.cacheName || CACHE_NAME;
  
  switch (strategy) {
    case STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName);
    case STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName);
    case STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName);
    default:
      return fetch(request);
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || Promise.reject('No cache available');
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  return cachedResponse || fetchPromise;
}

// Background Sync - For failed POST requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'submit-form') {
    event.waitUntil(handleFailedRequests());
  }
});

async function handleFailedRequests() {
  const requests = await getFailedRequests();
  return Promise.all(
    requests.map(async (requestData) => {
      try {
        const response = await fetch(requestData.url, requestData.options);
        if (response.ok) {
          await removeFailedRequest(requestData.id);
        }
        return response;
      } catch (error) {
        console.error('Background sync failed:', error);
        return Promise.reject(error);
      }
    })
  );
}

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Periodic Sync (for background updates)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContentCache());
  }
});

async function updateContentCache() {
  const cache = await caches.open(CACHE_NAME);
  const updatedAssets = await checkForUpdates();
  
  return Promise.all(
    updatedAssets.map(async (asset) => {
      const response = await fetch(asset);
      if (response.ok) {
        await cache.put(asset, response.clone());
      }
      return response;
    })
  );
}

async function checkForUpdates() {
  // Implementation would check for updated assets
  return [];
}

// Helper functions for background sync
async function getFailedRequests() {
  // Implementation would retrieve failed requests from IndexedDB
  return [];
}

async function removeFailedRequest(id) {
  // Implementation would remove request from IndexedDB
        }
