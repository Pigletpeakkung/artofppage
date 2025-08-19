/*!
 * Portfolio Service Worker
 * PWA & Offline Functionality
 * Author: Thanatsitt Santisamranwilai
 * Version: 2.0.0
 */

'use strict';

// Service Worker Configuration
const CACHE_NAME = 'portfolio-v2.0.0';
const OFFLINE_PAGE = '/offline.html';
const UPDATE_CHECK_INTERVAL = 1000 * 60 * 60 * 24; // 24 hours

// Define what to cache
const STATIC_CACHE_URLS = [
    // Main pages
    '/',
    '/index.html',
    
    // Your existing legal & info pages
    '/404.html',
    '/terms-of-service.html',
    '/privacy-policy.html',
    '/cookie-policy.html',
    '/offline.html',
    
    // New sitemap files
    '/sitemap.xml',
    '/sitemap.html',
    '/robots.txt',
    
    // Microsoft configuration
    '/browserconfig.xml',
    
    // Assets (update paths to match your structure)
    '/assets/css/main.css',
    '/assets/js/app.js',
    '/assets/images/favicon.ico',
    '/assets/images/logo.png',
    '/assets/images/hero-bg.jpg',
    '/assets/images/about-image.jpg',
    
    // Microsoft tile images (if you create them)
    '/assets/images/icons/mstile-70x70.png',
    '/assets/images/icons/mstile-150x150.png',
    '/assets/images/icons/mstile-310x150.png',
    '/assets/images/icons/mstile-310x310.png',
    
    // PWA manifest
    '/manifest.json',
    
    // External CDN resources
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];


// Dynamic cache patterns
const CACHE_PATTERNS = [
    /^https:\/\/fonts\.googleapis\.com\//,
    /^https:\/\/fonts\.gstatic\.com\//,
    /^https:\/\/cdnjs\.cloudflare\.com\//,
    /^https:\/\/cdn\.jsdelivr\.net\//,
    /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
    /\.(woff|woff2|ttf|otf)$/i
];

// Pages that should be cached dynamically
const DYNAMIC_CACHE_PATTERNS = [
    /\.html$/,
    /^https:\/\/.*\/[^\/]*$/
];

// Files to exclude from caching
const EXCLUDE_PATTERNS = [
    /\/api\//,
    /analytics/,
    /tracking/,
    /\.map$/,
    /sw\.js$/,
    /admin/,
    /wp-admin/,
    /\.php$/
];

/*
========================================
INSTALL EVENT
========================================
*/
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        (async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                
                // Filter out URLs that might not exist
                const urlsToCache = STATIC_CACHE_URLS.filter(url => {
                    return !EXCLUDE_PATTERNS.some(pattern => pattern.test(url));
                });
                
                console.log('📦 Caching static assets...');
                
                // Cache URLs one by one to avoid failing the entire operation
                const cachePromises = urlsToCache.map(async (url) => {
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            await cache.put(url, response);
                            console.log('✅ Cached:', url);
                        } else {
                            console.warn('❌ Failed to cache (bad response):', url);
                        }
                    } catch (error) {
                        console.warn('❌ Failed to cache (fetch error):', url, error.message);
                    }
                });
                
                await Promise.allSettled(cachePromises);
                console.log('📦 Static assets caching completed');
                
                // Skip waiting to activate immediately
                self.skipWaiting();
                
            } catch (error) {
                console.error('❌ Cache installation failed:', error);
                // Don't fail the install, just log the error
                self.skipWaiting();
            }
        })()
    );
});

/*
========================================
ACTIVATE EVENT
========================================
*/
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        (async () => {
            try {
                // Clean up old caches
                const cacheNames = await caches.keys();
                const deletePromises = cacheNames
                    .filter(name => name !== CACHE_NAME && name.startsWith('portfolio-'))
                    .map(name => {
                        console.log('🗑️ Deleting old cache:', name);
                        return caches.delete(name);
                    });
                
                await Promise.all(deletePromises);
                
                // Preload critical pages
                await preloadCriticalPages();
                
                // Take control of all clients
                await clients.claim();
                
                console.log('✅ Service Worker activated successfully');
                
                // Notify clients about activation
                await notifyClients({
                    type: 'SW_ACTIVATED',
                    cacheName: CACHE_NAME
                });
                
            } catch (error) {
                console.error('❌ Service Worker activation failed:', error);
            }
        })()
    );
});

/*
========================================
FETCH EVENT (Network Strategy)
========================================
*/
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip excluded URLs
    if (EXCLUDE_PATTERNS.some(pattern => pattern.test(event.request.url))) {
        return;
    }
    
    event.respondWith(handleFetch(event.request));
});

/*
========================================
FETCH HANDLING STRATEGIES
========================================
*/
async function handleFetch(request) {
    const url = new URL(request.url);
    
    try {
        // Strategy 1: Network First (for HTML and API calls)
        if (request.headers.get('accept')?.includes('text/html') || 
            DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
            return await networkFirstStrategy(request);
        }
        
        // Strategy 2: Cache First (for static assets)
        if (isStaticAsset(request)) {
            return await cacheFirstStrategy(request);
        }
        
        // Strategy 3: Stale While Revalidate (for dynamic content)
        return await staleWhileRevalidateStrategy(request);
        
    } catch (error) {
        console.error('Fetch handling error:', error);
        return await handleFetchError(request, error);
    }
}

// Network First Strategy
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            // Clone the response because it can only be consumed once
            cache.put(request, networkResponse.clone()).catch(err => {
                console.log('Cache put failed:', err.message);
            });
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache for:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return 404 page for navigation requests
        if (request.mode === 'navigate') {
            return await handleNavigationError(request);
        }
        
        throw error;
    }
}

// Cache First Strategy
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Background update for long-term cached items
        backgroundUpdate(request);
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone()).catch(err => {
                console.log('Cache put failed:', err.message);
            });
        }
        
        return networkResponse;
    } catch (error) {
        throw error;
    }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidateStrategy(request) {
    const cachedResponse = await caches.match(request);
    
    // Start the network request regardless of cache hit
    const networkPromise = fetch(request).then(async (networkResponse) => {
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone()).catch(err => {
                console.log('Cache put failed:', err.message);
            });
        }
        return networkResponse;
    }).catch(error => {
        console.log('Network failed for:', request.url);
        return cachedResponse;
    });
    
    // Return cached version immediately, or wait for network
    return cachedResponse || networkPromise;
}

// Handle navigation errors (404, etc.)
async function handleNavigationError(request) {
    // Try 404 page first
    const custom404 = await caches.match('/404.html');
    if (custom404) {
        return new Response(custom404.body, {
            status: 404,
            statusText: 'Not Found',
            headers: custom404.headers
        });
    }
    
    // Fallback to offline page
    const offlinePage = await caches.match(OFFLINE_PAGE);
    if (offlinePage) {
        return offlinePage;
    }
    
    // Last resort: basic 404 response
    return new Response('Page not found', {
        status: 404,
        statusText: 'Not Found',
        headers: { 'Content-Type': 'text/plain' }
    });
}

// Handle fetch errors
async function handleFetchError(request, error) {
    console.error('Fetch failed:', error);
    
    // Try to return cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // For navigation requests, show appropriate error page
    if (request.mode === 'navigate') {
        return await handleNavigationError(request);
    }
    
    // Return a basic offline response for other requests
    return new Response('Content not available offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
    });
}

/*
========================================
UTILITY FUNCTIONS
========================================
*/

// Check if request is for static asset
function isStaticAsset(request) {
    const url = request.url;
    
    // Check against cache patterns
    return CACHE_PATTERNS.some(pattern => pattern.test(url)) ||
           STATIC_CACHE_URLS.includes(url) ||
           url.includes('/assets/') ||
           url.includes('/images/') ||
           url.includes('/css/') ||
           url.includes('/js/') ||
           url.includes('/fonts/');
}

// Preload critical pages on first visit
async function preloadCriticalPages() {
    const criticalPages = [
        '/',
        '/404.html',
        '/terms-of-service.html',
        '/cookie-policy.html',
        '/privacy-policy.html'
    ];
    
    const cache = await caches.open(CACHE_NAME);
    
    for (const page of criticalPages) {
        try {
            if (!(await cache.match(page))) {
                const response = await fetch(page);
                if (response.ok) {
                    await cache.put(page, response);
                    console.log('📦 Preloaded:', page);
                } else {
                    console.warn('⚠️ Could not preload (bad response):', page);
                }
            }
        } catch (error) {
            console.warn('⚠️ Preload failed for:', page, error.message);
        }
    }
}

// Background update for cached resources
function backgroundUpdate(request) {
    // Don't block the main response
    setTimeout(async () => {
        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(request, networkResponse);
                console.log('🔄 Background updated:', request.url);
            }
        } catch (error) {
            // Silent fail for background updates
            console.log('Background update failed:', request.url);
        }
    }, 0);
}

// Notify all clients
async function notifyClients(message) {
    const clientList = await clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
    });
    
    clientList.forEach(client => {
        try {
            client.postMessage(message);
        } catch (error) {
            console.log('Failed to notify client:', error);
        }
    });
}

/*
========================================
MESSAGE HANDLING
========================================
*/
self.addEventListener('message', (event) => {
    const { data } = event;
    
    switch (data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0]?.postMessage({
                version: CACHE_NAME,
                timestamp: new Date().toISOString()
            });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0]?.postMessage({ success: true });
            }).catch((error) => {
                event.ports[0]?.postMessage({ success: false, error: error.message });
            });
            break;
            
        case 'CACHE_URLS':
            cacheSpecificUrls(data.urls).then(() => {
                event.ports[0]?.postMessage({ success: true });
            }).catch((error) => {
                event.ports[0]?.postMessage({ success: false, error: error.message });
            });
            break;
            
        case 'CHECK_UPDATE':
            checkForUpdates().then((hasUpdate) => {
                event.ports[0]?.postMessage({ hasUpdate });
            }).catch((error) => {
                event.ports[0]?.postMessage({ hasUpdate: false, error: error.message });
            });
            break;
    }
});

// Clear all caches
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    const deletePromises = cacheNames.map(name => caches.delete(name));
    await Promise.all(deletePromises);
    console.log('🗑️ All caches cleared');
}

// Cache specific URLs
async function cacheSpecificUrls(urls) {
    const cache = await caches.open(CACHE_NAME);
    const validUrls = urls.filter(url => 
        !EXCLUDE_PATTERNS.some(pattern => pattern.test(url))
    );
    
    for (const url of validUrls) {
        try {
            await cache.add(url);
            console.log('📦 Cached specific URL:', url);
        } catch (error) {
            console.warn('Failed to cache URL:', url, error.message);
        }
    }
}

/*
========================================
BACKGROUND SYNC (if supported)
========================================
*/
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        console.log('📊 Performing background sync...');
        
        // Update critical cache
        const cache = await caches.open(CACHE_NAME);
        const criticalUrls = ['/', '/index.html'];
        
        for (const url of criticalUrls) {
            try {
                const response = await fetch(url, { cache: 'no-cache' });
                if (response.ok) {
                    await cache.put(url, response);
                    console.log('✅ Updated in background:', url);
                }
            } catch (error) {
                console.log('Background sync failed for:', url);
            }
        }
        
        // Notify clients about background update
        await notifyClients({
            type: 'BACKGROUND_SYNC_COMPLETE',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

/*
========================================
PUSH NOTIFICATIONS (if supported)
========================================
*/
self.addEventListener('push', (event) => {
    console.log('📧 Push message received');
    
    let title = 'Thanatsitt\'s Portfolio';
    let options = {
        body: 'Check out the latest updates!',
        icon: '/assets/images/icon-192.png',
        badge: '/assets/images/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Updates',
                icon: '/assets/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/images/xmark.png'
            }
        ]
    };
    
    if (event.data) {
        try {
            const data = event.data.json();
            title = data.title || title;
            options.body = data.body || options.body;
            if (data.icon) options.icon = data.icon;
            if (data.url) options.data.url = data.url;
        } catch (error) {
            console.error('Error parsing push data:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('📱 Notification clicked:', event.action);
    
    event.notification.close();
    
    let urlToOpen = '/';
    
    if (event.notification.data && event.notification.data.url) {
        urlToOpen = event.notification.data.url;
    }
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow(urlToOpen)
        );
    } else if (event.action === 'close') {
        // Just close the notification (already done above)
        console.log('Notification closed by user');
    } else {
        // Default action (clicking notification body)
        event.waitUntil(
            clients.openWindow(urlToOpen)
        );
    }
});

/*
========================================
PERIODIC BACKGROUND SYNC (if supported)
========================================
*/
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'portfolio-update-check') {
        console.log('🔄 Periodic sync triggered');
        event.waitUntil(checkForUpdates());
    }
});

async function checkForUpdates() {
    try {
        // Check main page for updates
        const response = await fetch('/', { 
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (response.ok) {
            const currentCache = await caches.open(CACHE_NAME);
            const cachedResponse = await currentCache.match('/');
            
            if (cachedResponse) {
                const cachedText = await cachedResponse.text();
                const newText = await response.text();
                
                // Simple content comparison
                if (cachedText !== newText) {
                    console.log('📥 Content update detected');
                    
                    // Update the cache
                    await currentCache.put('/', new Response(newText, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    }));
                    
                    // Notify clients about update
                    await notifyClients({
                        type: 'CONTENT_UPDATED',
                        timestamp: new Date().toISOString()
                    });
                    
                    return true;
                }
            }
        }
        return false;
    } catch (error) {
        console.log('Update check failed:', error);
        return false;
    }
}

/*
========================================
CACHE MANAGEMENT & CLEANUP
========================================
*/
self.addEventListener('storage', (event) => {
    if (event.key === 'cache-cleanup') {
        event.waitUntil(performCacheCleanup());
    }
});

async function performCacheCleanup() {
    try {
        console.log('🧹 Performing cache cleanup...');
        
        // Get cache usage if supported
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            const usagePercentage = (estimate.usage / estimate.quota) * 100;
            
            console.log(`📊 Storage usage: ${usagePercentage.toFixed(2)}%`);
            
            // If using more than 80% of quota, clean up
            if (usagePercentage > 80) {
                await cleanupOldCaches();
                await removeOldCacheEntries();
            }
        }
        
    } catch (error) {
        console.error('Cache cleanup failed:', error);
    }
}

async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('portfolio-') && name !== CACHE_NAME
    );
    
    if (oldCaches.length > 0) {
        const deletePromises = oldCaches.map(name => {
            console.log('🗑️ Deleting old cache:', name);
            return caches.delete(name);
        });
        
        await Promise.all(deletePromises);
    }
}

async function removeOldCacheEntries() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    // Remove entries older than 30 days
    const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    for (const request of requests) {
        try {
            const response = await cache.match(request);
            if (response) {
                                const dateHeader = response.headers.get('date');
                if (dateHeader) {
                    const responseDate = new Date(dateHeader).getTime();
                    if (responseDate < cutoffTime) {
                        console.log('🗑️ Removing old cache entry:', request.url);
                        await cache.delete(request);
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to process cache entry:', request.url, error);
        }
    }
}

/*
========================================
ERROR HANDLING & REPORTING
========================================
*/
self.addEventListener('error', (event) => {
    console.error('🚨 Service Worker error:', event.error);
    
    // Log error details
    const errorInfo = {
        message: event.error?.message || 'Unknown error',
        stack: event.error?.stack || 'No stack trace',
        filename: event.filename || 'Unknown file',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        timestamp: new Date().toISOString()
    };
    
    console.error('Error details:', errorInfo);
    
    // You could send error reports to your analytics service here
    // Example: reportError('service-worker', errorInfo);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection in SW:', event.reason);
    
    const rejectionInfo = {
        reason: event.reason?.toString() || 'Unknown reason',
        timestamp: new Date().toISOString()
    };
    
    console.error('Rejection details:', rejectionInfo);
    
    // You could send error reports to your analytics service here
    // Example: reportError('promise-rejection', rejectionInfo);
});

/*
========================================
VERSIONING & UPDATE MANAGEMENT
========================================
*/

// Get service worker version info
function getVersionInfo() {
    return {
        version: CACHE_NAME,
        timestamp: new Date().toISOString(),
        features: [
            'offline-support',
            'cache-strategies',
            'background-sync',
            'push-notifications',
            'auto-updates',
            'error-handling',
            'cache-cleanup',
            'dynamic-caching'
        ],
        cachedUrls: STATIC_CACHE_URLS.length,
        patterns: CACHE_PATTERNS.length
    };
}

// Handle version updates
async function handleVersionUpdate(newVersion) {
    try {
        console.log(`🔄 Updating from ${CACHE_NAME} to ${newVersion}`);
        
        // Perform any necessary migration tasks
        await migrateCacheData(CACHE_NAME, newVersion);
        
        // Notify clients about successful update
        await notifyClients({
            type: 'UPDATE_COMPLETED',
            oldVersion: CACHE_NAME,
            newVersion: newVersion,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Version update failed:', error);
        
        await notifyClients({
            type: 'UPDATE_FAILED',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

async function migrateCacheData(oldVersion, newVersion) {
    try {
        const oldCache = await caches.open(oldVersion);
        const newCache = await caches.open(newVersion);
        
        // Copy important cached data
        const criticalUrls = ['/', '/index.html', '/404.html'];
        
        for (const url of criticalUrls) {
            try {
                const response = await oldCache.match(url);
                if (response) {
                    await newCache.put(url, response);
                    console.log('📦 Migrated cache entry:', url);
                }
            } catch (error) {
                console.warn('Failed to migrate:', url, error);
            }
        }
    } catch (error) {
        console.error('Cache migration failed:', error);
    }
}

/*
========================================
NETWORK MONITORING
========================================
*/

// Monitor network status
let isOnline = true;

self.addEventListener('online', () => {
    isOnline = true;
    console.log('🌐 Service Worker detected online');
    
    notifyClients({
        type: 'NETWORK_STATUS_CHANGE',
        isOnline: true,
        timestamp: new Date().toISOString()
    });
    
    // Trigger background sync when coming back online
    if (self.registration.sync) {
        self.registration.sync.register('background-sync');
    }
});

self.addEventListener('offline', () => {
    isOnline = false;
    console.log('📴 Service Worker detected offline');
    
    notifyClients({
        type: 'NETWORK_STATUS_CHANGE',
        isOnline: false,
        timestamp: new Date().toISOString()
    });
});

/*
========================================
DEBUGGING & DEVELOPMENT HELPERS
========================================
*/
if (self.location.hostname === 'localhost' || 
    self.location.hostname === '127.0.0.1' || 
    self.location.hostname.includes('.local')) {
    
    console.log('🔧 Service Worker running in development mode');
    
    // Add debugging helpers
    self.debugSW = {
        // Cache management
        getCacheNames: () => caches.keys(),
        getCacheContents: async (cacheName = CACHE_NAME) => {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            return keys.map(request => request.url);
        },
        clearCache: (cacheName = CACHE_NAME) => caches.delete(cacheName),
        clearAllCaches: () => clearAllCaches(),
        
        // Version info
        getVersion: () => getVersionInfo(),
        getCurrentCacheName: () => CACHE_NAME,
        
        // Manual operations
        forceUpdate: () => self.skipWaiting(),
        preloadUrls: (urls) => cacheSpecificUrls(urls),
        
        // Testing
        simulateOffline: () => {
            console.log('🧪 Simulating offline mode');
            isOnline = false;
        },
        simulateOnline: () => {
            console.log('🧪 Simulating online mode');
            isOnline = true;
        },
        
        // Stats
        getCacheStats: async () => {
            const cache = await caches.open(CACHE_NAME);
            const keys = await cache.keys();
            return {
                totalEntries: keys.length,
                urls: keys.map(req => req.url),
                estimate: 'storage' in navigator && 'estimate' in navigator.storage 
                    ? await navigator.storage.estimate() 
                    : null
            };
        }
    };
    
    console.log('🛠️ Debug helpers available at self.debugSW');
}

/*
========================================
ANALYTICS & PERFORMANCE TRACKING
========================================
*/

// Track cache hit rates
let cacheHits = 0;
let cacheMisses = 0;

function trackCacheHit() {
    cacheHits++;
    if ((cacheHits + cacheMisses) % 50 === 0) {
        const hitRate = (cacheHits / (cacheHits + cacheMisses)) * 100;
        console.log(`📊 Cache hit rate: ${hitRate.toFixed(2)}%`);
        
        // You could send this to analytics
        notifyClients({
            type: 'CACHE_PERFORMANCE',
            hitRate: hitRate,
            totalRequests: cacheHits + cacheMisses
        });
    }
}

function trackCacheMiss() {
    cacheMisses++;
}

/*
========================================
INITIALIZATION COMPLETE
========================================
*/

// Log initialization
console.log(`🚀 Service Worker (${CACHE_NAME}) loaded and ready!`);
console.log('📋 Features enabled:', getVersionInfo().features.join(', '));
console.log('📦 Static URLs to cache:', STATIC_CACHE_URLS.length);
console.log('🎯 Cache patterns:', CACHE_PATTERNS.length);

// Welcome message
console.log(`
🎨 Portfolio Service Worker v${CACHE_NAME.split('-v')[1]}

✨ Capabilities:
• Offline browsing support
• Intelligent caching strategies  
• Automatic background updates
• Push notifications ready
• Performance optimization
• Error handling & recovery
• Cache management & cleanup

🛠️ Development mode: ${self.location.hostname === 'localhost' ? 'ON' : 'OFF'}
📊 Debugging helpers: ${typeof self.debugSW !== 'undefined' ? 'Available' : 'Not available'}

Ready to serve your portfolio offline! 🚀
`);
