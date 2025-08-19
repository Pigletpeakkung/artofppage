// Service Worker Version - Update this to force refresh cache
const CACHE_VERSION = 'v4';
const CACHE_NAME = `pegearts-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = 'runtime-cache';

// Precached assets - Updated with correct paths
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/404.html',
  '/privacy-policy.html',  // Fixed typo
  '/terms-of-service.html', // Fixed typo  
  '/cookie-policy.html',
  '/assets/css/main.css',  // Corrected path
  '/assets/js/app.js',
  '/assets/js/main.js',// Corrected path
  '/assets/images/og-image-1200x630.jpg',     // Updated path
  '/assets/images/twitter-card-1200x600.jpg', // Updated path
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/favicon-32x32.png',
  '/assets/icons/apple-touch-icon.png',
  '/manifest.json'
];

// External resources to cache
const EXTERNAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Cache strategies
const STRATEGIES = {
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Enhanced route configuration
const ROUTE_CONFIG = [
  {
    route: '/',
    strategy: STRATEGIES.NETWORK_FIRST,
    options: {
      networkTimeout: 3000,
      cacheName: 'pages-cache'
    }
  },
  {
    route: /\.(html)$/,
    strategy: STRATEGIES.NETWORK_FIRST,
    options: {
      cacheName: 'html-cache',
      expiration: {
        maxEntries: 25,
        maxAgeSeconds: 24 * 60 * 60 // 1 day
      },
      networkTimeout: 3000
    }
  },
  {
    route: /\/assets\/css\/.*\.css$/,
    strategy: STRATEGIES.STALE_WHILE_REVALIDATE,
    options: {
      cacheName: 'css-cache',
      expiration: {
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
      }
    }
  },
  {
    route: /\/assets\/js\/.*\.js$/,
    strategy: STRATEGIES.STALE_WHILE_REVALIDATE,
    options: {
      cacheName: 'js-cache',
      expiration: {
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
      }
    }
  },
  {
    route: /\/assets\/images\/.*\.(jpg|jpeg|png|gif|svg|webp|avif)$/,
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
    route: /\/assets\/icons\/.*\.(png|svg|ico)$/,
    strategy: STRATEGIES.CACHE_FIRST,
    options: {
      cacheName: 'icons-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
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
      cacheName: 'jsdelivr-cache',
      expiration: {
        maxEntries: 30,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
      }
    }
  },
  {
    route: /^https:\/\/cdnjs\.cloudflare\.com/,
    strategy: STRATEGIES.STALE_WHILE_REVALIDATE,
    options: {
      cacheName: 'cdnjs-cache',
      expiration: {
        maxEntries: 30,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
      }
    }
  },
  {
    route: /\/api\//,
    strategy: STRATEGIES.NETWORK_FIRST,
    options: {
      cacheName: 'api-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5 minutes
      },
      networkTimeout: 5000
    }
  }
];

// Install Event - Enhanced precaching
self.addEventListener('install', (event) => {
  console.log(`[Service Worker] Installing version ${CACHE_VERSION}`);
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // Cache internal assets
        const internalResults = await Promise.allSettled(
          PRECACHE_ASSETS.map(async (asset) => {
            try {
              const response = await fetch(asset, {
                cache: 'no-cache',
                credentials: 'same-origin'
              });
              
              if (response.ok) {
                await cache.put(asset, response);
                return { asset, status: 'cached' };
              } else {
                console.warn(`[Service Worker] Failed to cache ${asset}: ${response.status}`);
                return { asset, status: 'failed', reason: response.status };
              }
            } catch (error) {
              console.warn(`[Service Worker] Error caching ${asset}:`, error.message);
              return { asset, status: 'error', error: error.message };
            }
          })
        );
        
        // Cache external assets with CORS handling
        const externalResults = await Promise.allSettled(
          EXTERNAL_ASSETS.map(async (asset) => {
            try {
              const response = await fetch(asset, {
                mode: 'cors',
                cache: 'no-cache'
              });
              
              if (response.ok) {
                await cache.put(asset, response);
                return { asset, status: 'cached' };
              } else {
                return { asset, status: 'failed', reason: response.status };
              }
            } catch (error) {
              console.warn(`[Service Worker] Error caching external asset ${asset}:`, error.message);
              return { asset, status: 'error', error: error.message };
            }
          })
        );
        
        const successful = [...internalResults, ...externalResults]
          .filter(result => result.value?.status === 'cached').length;
        
        const total = PRECACHE_ASSETS.length + EXTERNAL_ASSETS.length;
        
        console.log(`[Service Worker] Precached ${successful}/${total} assets`);
        
        // Force activation
        await self.skipWaiting();
        
      } catch (error) {
        console.error('[Service Worker] Install failed:', error);
        throw error;
      }
    })()
  );
});

// Activate Event - Enhanced cleanup
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] Activating version ${CACHE_VERSION}`);
  
  event.waitUntil(
    (async () => {
      try {
        // Enable navigation preload if supported
        if ('navigationPreload' in self.registration) {
          await self.registration.navigationPreload.enable();
          console.log('[Service Worker] Navigation preload enabled');
        }

        // Clean old caches
        const cacheNames = await caches.keys();
        const cacheCleanupPromises = cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              (cacheName.startsWith('pegearts-cache') || 
               cacheName.includes('v1') || 
               cacheName.includes('v2') || 
               cacheName.includes('v3'))) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        });
        
        await Promise.all(cacheCleanupPromises);

        // Clean up expired cache entries
        await cleanupExpiredEntries();

        // Take control of all clients
        await self.clients.claim();
        
        console.log('[Service Worker] Activated successfully');

        // Notify all clients about the update
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION
          });
        });
        
      } catch (error) {
        console.error('[Service Worker] Activation failed:', error);
      }
    })()
  );
});

// Enhanced Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and unsupported protocols
  if (request.method !== 'GET' || 
      ['chrome-extension:', 'chrome:', 'moz-extension:'].includes(url.protocol) ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1') {
    return;
  }

  // Skip if request has no-cache header
  if (request.headers.get('cache-control') === 'no-cache') {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Handle navigation requests with preload
        if (request.mode === 'navigate') {
          try {
            const preloadResponse = await event.preloadResponse;
                        if (preloadResponse) {
              console.log('[Service Worker] Using preloaded response for:', url.pathname);
              // Cache the preloaded response
              const cache = await caches.open(CACHE_NAME);
              cache.put(request, preloadResponse.clone());
              return preloadResponse;
            }
          } catch (preloadError) {
            console.warn('[Service Worker] Navigation preload failed:', preloadError);
          }
        }

        // Find matching strategy
        const strategyConfig = getMatchingStrategy(url, request);
        
        // Handle request based on strategy
        return await handleFetch(request, strategyConfig);
        
      } catch (error) {
        console.error('[Service Worker] Fetch failed for:', url.href, error);
        return await handleFallback(request, error);
      }
    })()
  );
});

// Enhanced strategy matching
function getMatchingStrategy(url, request) {
  // Check for exact path matches first
  const exactMatch = ROUTE_CONFIG.find(config => 
    typeof config.route === 'string' && url.pathname === config.route
  );
  if (exactMatch) return exactMatch;

  // Check for regex pattern matches
  const patternMatch = ROUTE_CONFIG.find(config => 
    config.route instanceof RegExp && config.route.test(url.href)
  );
  if (patternMatch) return patternMatch;

  // Special handling for manifest.json
  if (url.pathname === '/manifest.json') {
    return {
      strategy: STRATEGIES.CACHE_FIRST,
      options: { cacheName: 'manifest-cache' }
    };
  }

  // Default strategies based on request type
  if (request.destination === 'document') {
    return {
      strategy: STRATEGIES.NETWORK_FIRST,
      options: {
        cacheName: 'pages-cache',
        networkTimeout: 3000
      }
    };
  }

  if (request.destination === 'image') {
    return {
      strategy: STRATEGIES.CACHE_FIRST,
      options: { cacheName: 'images-cache' }
    };
  }

  if (request.destination === 'script' || request.destination === 'style') {
    return {
      strategy: STRATEGIES.STALE_WHILE_REVALIDATE,
      options: { cacheName: 'assets-cache' }
    };
  }

  // Default for same-origin requests
  if (url.origin === self.location.origin) {
    return {
      strategy: STRATEGIES.NETWORK_FIRST,
      options: { networkTimeout: 3000 }
    };
  }

  // Skip caching for unknown third-party requests
  return { strategy: STRATEGIES.NETWORK_ONLY };
}

// Enhanced fallback handling
async function handleFallback(request, error) {
  console.warn('[Service Worker] Handling fallback for:', request.url, error.message);

  // Navigation fallback (HTML pages)
  if (request.mode === 'navigate' || request.destination === 'document') {
    // Try to serve cached homepage
    const cachedHomepage = await caches.match('/');
    if (cachedHomepage) {
      console.log('[Service Worker] Serving cached homepage as fallback');
      return cachedHomepage;
    }

    // Try to serve 404 page
    const cached404 = await caches.match('/404.html');
    if (cached404) {
      return new Response(cached404.body, {
        status: 404,
        statusText: 'Not Found',
        headers: cached404.headers
      });
    }

    // Return minimal offline page
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Thanatsitt Portfolio</title>
        <style>
          body { 
            font-family: system-ui, sans-serif; 
            text-align: center; 
            padding: 2rem; 
            background: linear-gradient(135deg, #A78BFA, #F9A8D4);
            color: white;
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { max-width: 500px; }
          h1 { font-size: 2.5rem; margin-bottom: 1rem; }
          p { font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9; }
          button { 
            background: white; 
            color: #A78BFA; 
            border: none; 
            padding: 1rem 2rem; 
            border-radius: 0.5rem; 
            font-weight: bold;
            cursor: pointer;
            font-size: 1rem;
          }
          button:hover { opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚫 You're Offline</h1>
          <p>It looks like you've lost your internet connection. Please check your network and try again.</p>
          <button onclick="window.location.reload()">Try Again</button>
        </div>
      </body>
      </html>
    `, {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      }
    });
  }

  // Image fallback
  if (request.destination === 'image') {
    return new Response(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="#f0f0f0"/>
        <circle cx="200" cy="150" r="50" fill="#ddd"/>
        <text x="200" y="230" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" fill="#999">
          Image unavailable offline
        </text>
      </svg>
    `, {
      headers: { 
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache'
      }
    });
  }

  // Generic fallback
  return new Response('Content unavailable offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache'
    }
  });
}

// Enhanced Cache Strategies
async function handleFetch(request, { strategy, options = {} }) {
  const cacheName = options.cacheName || RUNTIME_CACHE;
  
  switch (strategy) {
    case STRATEGIES.CACHE_FIRST:
      return await cacheFirst(request, cacheName, options);
    case STRATEGIES.NETWORK_FIRST:
      return await networkFirst(request, cacheName, options);
    case STRATEGIES.STALE_WHILE_REVALIDATE:
      return await staleWhileRevalidate(request, cacheName, options);
    case STRATEGIES.CACHE_ONLY:
      return await caches.match(request);
    case STRATEGIES.NETWORK_ONLY:
      return await fetch(request);
    default:
      return await networkFirst(request, cacheName, options);
  }
}

async function cacheFirst(request, cacheName, options) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cached response is stale
    if (options.expiration?.maxAgeSeconds) {
      const cachedDate = new Date(cachedResponse.headers.get('date') || 0);
      const age = (Date.now() - cachedDate.getTime()) / 1000;
      
      if (age > options.expiration.maxAgeSeconds) {
        console.log(`[Service Worker] Cached response is stale for: ${request.url}`);
        // Update cache in background, but return stale content
        fetchAndCache(request, cache, options).catch(err => 
          console.warn(`[Service Worker] Background update failed: ${err.message}`)
        );
      }
    }
    
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    await putInCache(cache, request, networkResponse.clone(), options);
  }
  return networkResponse;
}

async function networkFirst(request, cacheName, options) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkTimeout = options.networkTimeout || 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), networkTimeout);
    
    const networkResponse = await fetch(request, {
      signal: controller.signal,
      ...options.fetchOptions
    });
    
    clearTimeout(timeoutId);
    
    if (networkResponse.ok) {
      await putInCache(cache, request, networkResponse.clone(), options);
      return networkResponse;
    }
    
    throw new Error(`Network response not OK: ${networkResponse.status}`);
    
  } catch (error) {
    console.warn(`[Service Worker] Network failed for ${request.url}: ${error.message}`);
    
    // Try to serve from cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log(`[Service Worker] Serving stale content for: ${request.url}`);
      return cachedResponse;
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName, options) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always try to update from network in background
  const fetchPromise = fetchAndCache(request, cache, options).catch(err => 
    console.warn(`[Service Worker] Background fetch failed for ${request.url}: ${err.message}`)
  );

  if (cachedResponse) {
    // Return cached response immediately
    return cachedResponse;
  }
  
  // No cached response, wait for network
  return await fetchPromise;
}

async function fetchAndCache(request, cache, options = {}) {
  const response = await fetch(request, options.fetchOptions);
  if (response.ok) {
    await putInCache(cache, request, response.clone(), options);
  }
  return response;
}

async function putInCache(cache, request, response, options = {}) {
  // Don't cache non-OK responses
  if (!response.ok) return;
  
  // Don't cache responses with no-cache or no-store
  const cacheControl = response.headers.get('cache-control');
  if (cacheControl && (cacheControl.includes('no-cache') || cacheControl.includes('no-store'))) {
    return;
  }
  
  try {
    await cache.put(request, response);
    
    // Handle cache size limits
    if (options.expiration?.maxEntries) {
      await limitCacheSize(cache, options.expiration.maxEntries);
    }
  } catch (error) {
    console.warn(`[Service Worker] Failed to cache ${request.url}: ${error.message}`);
  }
}

async function limitCacheSize(cache, maxEntries) {
  try {
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
      const keysToDelete = keys.slice(0, keys.length - maxEntries);
      await Promise.all(keysToDelete.map(key => cache.delete(key)));
      console.log(`[Service Worker] Deleted ${keysToDelete.length} old cache entries`);
    }
  } catch (error) {
    console.warn('[Service Worker] Failed to limit cache size:', error);
  }
}

// Enhanced cleanup for expired entries
async function cleanupExpiredEntries() {
  const cacheNames = await caches.keys();
  const cleanupPromises = cacheNames.map(async (cacheName) => {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      let deletedCount = 0;
      
      await Promise.all(keys.map(async (key) => {
        const response = await cache.match(key);
        if (response) {
          const dateHeader = response.headers.get('date');
          if (dateHeader) {
            const responseDate = new Date(dateHeader);
            const age = (Date.now() - responseDate.getTime()) / 1000;
            
            // Remove entries older than 30 days
            if (age > 30 * 24 * 60 * 60) {
              await cache.delete(key);
              deletedCount++;
            }
          }
        }
      }));
      
      if (deletedCount > 0) {
        console.log(`[Service Worker] Cleaned up ${deletedCount} expired entries from ${cacheName}`);
      }
    } catch (error) {
      console.warn(`[Service Worker] Failed to cleanup cache ${cacheName}:`, error);
    }
  });
  
  await Promise.all(cleanupPromises);
}

// Background Sync with IndexedDB
const DB_NAME = 'portfolioSyncDB';
const DB_VERSION = 1;
const STORE_NAME = 'syncRequests';

async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id',
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('type', 'type');
      }
    };
  });
}

async function saveRequestForSync(requestData) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const data = {
      ...requestData,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    await new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Register for background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      await self.registration.sync.register('background-sync');
    }
    
  } catch (error) {
    console.error('[Service Worker] Failed to save request for sync:', error);
  }
}

// Background Sync Event
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(processSyncQueue());
  }
});

async function processSyncQueue() {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const requests = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    console.log(`[Service Worker] Processing ${requests.length} sync requests`);
    
    const results = await Promise.allSettled(
      requests.map(async (requestData) => {
        try {
          const { url, method, body, headers, id } = requestData;
          
          const response = await fetch(url, {
            method,
            body: body ? JSON.stringify(body) : undefined,
            headers: {
              'Content-Type': 'application/json',
              ...headers
            }
          });
          
          if (response.ok) {
            // Remove successful request from queue
            await new Promise((resolve, reject) => {
              const deleteRequest = store.delete(id);
              deleteRequest.onsuccess = () => resolve();
              deleteRequest.onerror = () => reject(deleteRequest.error);
            });
            
            return { success: true, id, status: response.status };
          } else {
            // Update retry count
            requestData.retryCount = (requestData.retryCount || 0) + 1;
            
            if (requestData.retryCount >= 3) {
              // Remove after 3 failed attempts
              await new Promise((resolve, reject) => {
                const deleteRequest = store.delete(id);
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => reject(deleteRequest.error);
              });
              return { success: false, id, reason: 'Max retries exceeded' };
            } else {
              // Update retry count in store
              await new Promise((resolve, reject) => {
                const putRequest = store.put(requestData);
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
              });
              return { success: false, id, reason: 'Will retry', retryCount: requestData.retryCount };
            }
          }
        } catch (error) {
          return { success: false, id: requestData.id, error: error.message };
        }
      })
    );
    
    const successful = results.filter(r => r.value?.success).length;
    const failed = results.length - successful;
    
    console.log(`[Service Worker] Sync completed: ${successful} successful, ${failed} failed`);
    
    // Notify clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        results: { successful, failed, total: results.length }
      });
    });
    
  } catch (error) {
    console.error('[Service Worker] Sync processing failed:', error);
  }
}

// Enhanced Push Notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'PegeArts Portfolio',
    body: 'New update available!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    url: '/',
    actions: []
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (error) {
      console.warn('[Service Worker] Invalid push data:', error);
    }
  }

  event.waitUntil(
    (async () => {
      try {
        // Check if user is currently viewing the site
        const clients = await self.clients.matchAll({
          includeUncontrolled: true,
          type: 'window'
        });

        const isWindowFocused = clients.some(client => client.focused);
        
        // Don't show notification if window is focused
        if (isWindowFocused && !data.forceShow) {
          console.log('[Service Worker] Skipping notification - window is focused');
          return;
        }

        const options = {
          body: data.body,
          icon: data.icon,
          badge: data.badge,
          image: data.image,
          data: { url: data.url },
          actions: data.actions,
          tag: data.tag || 'portfolio-update',
          requireInteraction: data.requireInteraction || false,
          silent: data.silent || false
        };

        await self.registration.showNotification(data.title, options);
        
        // Track notification
        console.log('[Service Worker] Push notification shown:', data.title);
        
      } catch (error) {
        console.error('[Service Worker] Failed to show notification:', error);
      }
    })()
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    (async () => {
      try {
        const clients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        });

        // Check if portfolio is already open
        for (const client of clients) {
          const clientUrl = new URL(client.url);
          const targetUrl = new URL(urlToOpen, self.location.origin);
          
          if (clientUrl.origin === targetUrl.origin) {
            // Navigate to target URL and focus
            if ('navigate' in client) {
              await client.navigate(targetUrl.href);
            }
            await client.focus();
            return;
          }
        }

        // Open new window
        if (self.clients.openWindow) {
          await self.clients.openWindow(urlToOpen);
        }
        
        console.log('[Service Worker] Opened URL from notification:', urlToOpen);
        
      } catch (error) {
        console.error('[Service Worker] Failed to handle notification click:', error);
      }
    })()
  );
});

// Periodic Background Sync (experimental)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'portfolio-content-sync') {
    event.waitUntil(syncPortfolioContent());
  }
});

async function syncPortfolioContent() {
  try {
    console.log('[Service Worker] Starting periodic content sync');
    
    const cache = await caches.open(CACHE_NAME);
    const criticalAssets = [
      '/',
      '/assets/css/main.css',
      '/assets/js/main.js'
    ];
    
    const updatePromises = criticalAssets.map(async (asset) => {
      try {
        const response = await fetch(asset, {
          cache: 'no-cache'
        });
        
        if (response.ok) {
          const cachedResponse = await cache.match(asset);
          if (cachedResponse) {
            const cachedETag = cachedResponse.headers.get('etag');
            const networkETag = response.headers.get('etag');
            
            if (cachedETag !== networkETag) {
              await cache.put(asset, response.clone());
              console.log(`[Service Worker] Updated cached asset: ${asset}`);
              return { asset, updated: true };
            }
          } else {
            await cache.put(asset, response.clone());
            return { asset, updated: true };
          }
        }
        return { asset, updated: false };
      } catch (error) {
        return { asset, updated: false, error: error.message };
      }
    });
    
    const results = await Promise.all(updatePromises);
    const updatedAssets = results.filter(result => result.updated);
    
    if (updatedAssets.length > 0) {
      console.log(`[Service Worker] Updated ${updatedAssets.length} assets during sync`);
      
      // Notify clients about updates
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'CONTENT_UPDATED',
          assets: updatedAssets.map(a => a.asset)
        });
      });
    }
    
  } catch (error) {
    console.error('[Service Worker] Periodic sync failed:', error);
  }
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  
  console.log('[Service Worker] Received message:', type, data);
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting().then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: CACHE_VERSION });
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(
        cacheAdditionalUrls(data?.urls || []).then(() => {
          event.ports[0]?.postMessage({ success: true });
        }).catch(error => {
          event.ports[0]?.postMessage({ success: false, error: error.message });
        })
      );
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        clearAllCaches().then(() => {
          event.ports[0]?.postMessage({ success: true });
        }).catch(error => {
          event.ports[0]?.postMessage({ success: false, error: error.message });
        })
      );
      break;
      
    case 'GET_CACHE_STATS':
      event.waitUntil(
        getCacheStats().then(stats => {
          event.ports[0]?.postMessage({ success: true, stats });
        }).catch(error => {
          event.ports[0]?.postMessage({ success: false, error: error.message });
        })
      );
      break;
      
    case 'SYNC_REQUEST':
      event.waitUntil(
        saveRequestForSync(data).then(() => {
          event.ports[0]?.postMessage({ success: true });
        }).catch(error => {
          event.ports[0]?.postMessage({ success: false, error: error.message });
        })
      );
      break;
      
    default:
      console.warn('[Service Worker] Unknown message type:', type);
  }
});

// Cache additional URLs
async function cacheAdditionalUrls(urls) {
  if (!Array.isArray(urls) || urls.length === 0) return;
  
  const cache = await caches.open(RUNTIME_CACHE);
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        return { url, cached: true };
      }
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    })
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  console.log(`[Service Worker] Cached ${successful}/${urls.length} additional URLs`);
  
  return results;
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log(`[Service Worker] Cleared ${cacheNames.length} caches`);
}

// Get cache statistics
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    let totalSize = 0;
    const entries = await Promise.all(
      keys.map(async (key) => {
        const response = await cache.match(key);
        const size = response ? await estimateResponseSize(response) : 0;
        totalSize += size;
        return {
          url: key.url,
          size,
          headers: Object.fromEntries(response?.headers.entries() || [])
        };
      })
    );
    
    stats[cacheName] = {
      entryCount: keys.length,
      totalSize,
      entries: entries.slice(0, 10) // Limit to first 10 entries
    };
  }
  
  return stats;
}

// Estimate response size
async function estimateResponseSize(response) {
  try {
    const clone = response.clone();
    const buffer = await clone.arrayBuffer();
    return buffer.byteLength;
  } catch (error) {
    return 0;
  }
}

// Error handling and reporting
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Error:', event.error);
  
  // Report error to analytics if available
  if (typeof reportError === 'function') {
    reportError('ServiceWorker', event.error);
  }
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[Service Worker] Unhandled rejection:', event.reason);
  
  // Report error to analytics if available
  if (typeof reportError === 'function') {
    reportError('ServiceWorker', event.reason);
  }
});

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach(entry => {
    if (entry.duration > 1000) { // Log slow operations
      console.warn(`[Service Worker] Slow operation detected:`, {
        name: entry.name,
        duration: entry.duration,
        type: entry.entryType
      });
    }
  });
});

// Observe performance if supported
if ('PerformanceObserver' in self) {
  try {
    performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
  } catch (error) {
    console.warn('[Service Worker] Performance observation not supported:', error);
  }
}

// Health check endpoint
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/sw-health') {
    event.respondWith(
      new Response(JSON.stringify({
        status: 'healthy',
        version: CACHE_VERSION,
        timestamp: new Date().toISOString(),
        caches: Object.keys(await caches.keys())
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })
    );
  }
});

// Cleanup on beforeunload (if supported)
if ('addEventListener' in self) {
  self.addEventListener('beforeunload', () => {
    console.log('[Service Worker] Cleaning up before unload');
    // Perform any necessary cleanup
  });
}

console.log(`[Service Worker] Loaded successfully - Version ${CACHE_VERSION}`);

// Export for testing purposes (if in development environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CACHE_VERSION,
    PRECACHE_ASSETS,
    EXTERNAL_ASSETS,
    getMatchingStrategy,
    handleFetch,
    getCacheStats
  };
}
