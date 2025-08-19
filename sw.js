// Service Worker Version - Update this to force refresh cache
const CACHE_VERSION = 'v4';
const CACHE_NAME = `pegearts-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = 'runtime-cache';

// Precached assets - Auto-generated during build (see note below)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/404.html',
  '/term-of-service.html',
  '/cookie-policy.html',
  '/portfolio.json',
  '/css/main.css',
  '/assets/css/main.css',
  '/js/main.js',
  '/assets/projects/ai-creative-suite.jpg',
  '/assets/og-image.jpg',
  '/assets/twitter-card.jpg',
  '/fallback.html',
  '/offline.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Cache strategies
const STRATEGIES = {
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Routes with caching strategies
const ROUTE_CONFIG = [
  {
    route: '/',
    strategy: STRATEGIES.NETWORK_FIRST,
    options: {
      networkTimeout: 3000 // Fallback to cache after 3 seconds
    }
  },
  {
    route: /\.(html)$/,
    strategy: STRATEGIES.NETWORK_FIRST,
    options: {
      cacheName: 'html-cache',
      expiration: {
        maxEntries: 20,
        maxAgeSeconds: 24 * 60 * 60 // 1 day
      }
    }
  },
  {
    route: /\.(css|js)$/,
    strategy: STRATEGIES.STALE_WHILE_REVALIDATE,
    options: {
      cacheName: 'assets-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
      }
    }
  },
  {
    route: /\.(jpg|jpeg|png|gif|svg|webp|avif)$/,
    strategy: STRATEGIES.CACHE_FIRST,
    options: {
      cacheName: 'images-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      }
    }
  },
  {
    route: /\.(woff2?|ttf|eot)$/,
    strategy: STRATEGIES.CACHE_FIRST,
    options: {
      cacheName: 'fonts-cache',
      expiration: {
        maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
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
  },
  {
    route: /^https:\/\/cdn\.jsdelivr\.net/,
    strategy: STRATEGIES.STALE_WHILE_REVALIDATE,
    options: {
      cacheName: 'cdn-cache'
    }
  },
  {
    route: /\/api\//,
    strategy: STRATEGIES.NETWORK_FIRST,
    options: {
      cacheName: 'api-cache',
      expiration: {
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 // 1 hour
      }
    }
  }
];

// Install Event - Precaching with cache versioning
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Only cache successful responses
      const requests = PRECACHE_ASSETS.map(async (asset) => {
        try {
          const response = await fetch(asset);
          if (response.ok) {
            await cache.put(asset, response);
          }
        } catch (err) {
          console.warn(`[Service Worker] Failed to cache ${asset}:`, err);
        }
      });
      await Promise.all(requests);
      console.log(`[Service Worker] Precached ${PRECACHE_ASSETS.length} assets`);
      await self.skipWaiting();
    })()
  );
});

// Activate Event - Clean old caches and enable navigation preload
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if supported
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }

      // Clean old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName.startsWith('pegearts-cache')) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );

      // Claim clients immediately
      await self.clients.claim();
      console.log('[Service Worker] Activated and ready');
    })()
  );
});

// Enhanced Fetch Event with Navigation Preload
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and unsupported protocols
  if (request.method !== 'GET' || 
      url.protocol === 'chrome-extension:' || 
      url.protocol === 'chrome:' || 
      url.hostname === 'localhost') {
    return;
  }

  // Handle different strategies
  event.respondWith(
    (async () => {
      try {
        // Find matching strategy
        const strategyConfig = getMatchingStrategy(url);
        
        // Use navigation preload for HTML pages if available
        if (request.mode === 'navigate' && self.registration.navigationPreload) {
          try {
            const preloadResponse = await event.preloadResponse;
            if (preloadResponse) {
              return preloadResponse;
            }
          } catch (preloadError) {
            console.warn('[Service Worker] Navigation preload failed:', preloadError);
          }
        }

        return handleFetch(request, strategyConfig);
      } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        return handleFallback(request);
      }
    })()
  );
});

function getMatchingStrategy(url) {
  // Check for exact matches first
  const exactMatch = ROUTE_CONFIG.find(config => 
    typeof config.route === 'string' && url.pathname === config.route
  );
  if (exactMatch) return exactMatch;

  // Check for pattern matches
  const patternMatch = ROUTE_CONFIG.find(config => 
    typeof config.route !== 'string' && url.href.match(config.route)
  );
  if (patternMatch) return patternMatch;

  // Default strategy for same-origin requests
  if (url.origin === self.location.origin) {
    return { strategy: STRATEGIES.NETWORK_FIRST };
  }

  // Skip caching for other third-party requests
  return { strategy: STRATEGIES.NETWORK_ONLY };
}

async function handleFallback(request) {
  // Special handling for navigation requests
  if (request.mode === 'navigate') {
    const cachedFallback = await caches.match('/fallback.html');
    if (cachedFallback) return cachedFallback;
    
    // Return a minimal offline page if fallback.html isn't cached
    return new Response(
      '<h1>Offline</h1><p>You appear to be offline. Please check your connection.</p>',
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }

  // Image fallback
  if (request.destination === 'image') {
    const cachedOfflineImage = await caches.match('/offline.svg');
    if (cachedOfflineImage) return cachedOfflineImage;
  }

  // Return a generic offline response
  return new Response('Offline', { 
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Enhanced Cache Strategies with Timeouts
async function handleFetch(request, { strategy, options = {} }) {
  const cacheName = options.cacheName || CACHE_NAME;
  
  switch (strategy) {
    case STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName, options);
    case STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName, options);
    case STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName, options);
    case STRATEGIES.CACHE_ONLY:
      return caches.match(request);
    case STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    default:
      return networkFirst(request, cacheName, options);
  }
}

async function cacheFirst(request, cacheName, options) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background if response is stale
    if (options.expiration?.maxAgeSeconds) {
      const cachedDate = new Date(cachedResponse.headers.get('date'));
      const age = (Date.now() - cachedDate.getTime()) / 1000;
      if (age > options.expiration.maxAgeSeconds / 2) {
        fetchAndCache(request, cache);
      }
    }
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    await cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

async function networkFirst(request, cacheName, options) {
  try {
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), options.networkTimeout || 5000)
    );

    const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not OK');
  } catch (error) {
    console.warn(`[Service Worker] Network failed (${request.url}), falling back to cache`);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName, options) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  const fetchPromise = fetchAndCache(request, cache);

  if (cachedResponse) {
    // Return cached response immediately, then update
    fetchPromise.catch(err => 
      console.warn(`[Service Worker] Background update failed for ${request.url}:`, err)
    );
    return cachedResponse;
  }
  
  // Wait for network if no cache available
  return fetchPromise;
}

async function fetchAndCache(request, cache) {
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
}

// Background Sync with IndexedDB
const DB_NAME = 'failedRequestsDB';
const STORE_NAME = 'requests';

async function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveFailedRequest(requestData) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      id: Date.now(),
      ...requestData,
      timestamp: new Date().toISOString()
    });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-requests') {
    event.waitUntil(retryFailedRequests());
  }
});

async function retryFailedRequests() {
  const db = await getDB();
  const requests = await new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve([]);
  });

  const results = await Promise.allSettled(
    requests.map(async (request) => {
      try {
        const response = await fetch(request.url, request.options);
        if (response.ok) {
          await removeFailedRequest(request.id);
          return { success: true, id: request.id };
        }
        return { success: false, id: request.id };
      } catch (error) {
        return { success: false, id: request.id, error };
      }
    })
  );

  console.log('[Service Worker] Background sync completed:', results);
  return results;
}

async function removeFailedRequest(id) {
  const db = await getDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => resolve(false);
  });
}

// Push Notifications with Analytics
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {
    title: 'New Update',
    body: 'There are new updates available!',
    url: '/'
  };

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
      });
      
      // Don't show notification if window is already open
      if (clients.length > 0) return;

      const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        image: data.image,
        data: { url: data.url },
        actions: data.actions || []
      };

      await self.registration.showNotification(data.title, options);
      logNotificationEvent('received', data);
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data.url || '/';
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: 'window'
      });
      
      if (clients.length > 0) {
        await clients[0].focus();
        await clients[0].navigate(url);
      } else {
        await self.clients.openWindow(url);
      }
      
      logNotificationEvent('click', event.notification.data);
    })()
  );
});

function logNotificationEvent(type, data) {
  // In a real app, you would send this to your analytics
  console.log(`[Service Worker] Notification ${type}:`, data);
}

// Periodic Background Sync for content updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-update') {
    event.waitUntil(updateContentCache());
  }
});

async function updateContentCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const updatedAssets = await checkForUpdates();
    
    const results = await Promise.allSettled(
      updatedAssets.map(async (asset) => {
        const response = await fetch(asset);
        if (response.ok) {
          await cache.put(asset, response.clone());
          return { asset, status: 'updated' };
        }
        return { asset, status: 'failed' };
      })
    );
    
    console.log('[Service Worker] Periodic update results:', results);
    return results;
  } catch (error) {
    console.error('[Service Worker] Periodic sync failed:', error);
    throw error;
  }
}

async function checkForUpdates() {
  // In a real app, you would:
  // 1. Check a version manifest file
  // 2. Compare with cached versions
  // 3. Return changed assets
  
  // For simplicity, we'll just check the main assets
  const assetsToCheck = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/main.js',
    '/portfolio.json'
  ];
  
  const cache = await caches.open(CACHE_NAME);
  const results = await Promise.all(
    assetsToCheck.map(async (asset) => {
      const cachedResponse = await cache.match(asset);
      if (!cachedResponse) return asset;
      
      try {
        const networkResponse = await fetch(asset, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (networkResponse.ok) {
          const cachedETag = cachedResponse.headers.get('etag');
          const networkETag = networkResponse.headers.get('etag');
          
          if (cachedETag !== networkETag) {
            return asset;
          }
        }
      } catch (error) {
        console.warn(`[Service Worker] Update check failed for ${asset}:`, error);
      }
      
      return null;
    })
  );
  
  return results.filter(asset => asset !== null);
}

// Web App Manifest Updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_ASSETS') {
    self.skipWaiting().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});
