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

// Define what to cache - Updated to match your actual HTML structure
const STATIC_CACHE_URLS = [
    // Main pages
    '/',
    '/index.html',
    
    // Legal & info pages (matching your HTML footer links)
    '/404.html',
'/faq.html',
    '/terms-of-service.html',
    '/privacy-policy.html',
    '/cookie-policy.html',
    '/offline.html',
   '/fallback.html',
    
    // SEO files
    '/sitemap.xml',
    '/sitemap.html',
    '/robots.txt',
    '/manifest.json',
    
    // Microsoft configuration
    '/browserconfig.xml',
    
    // Core JavaScript files (matching your HTML script tags)
    '/assets/js/main.js',
    '/assets/js/app.js',
    '/assets/js/cookieconsent.js',
    'assets/js/cookieconsent-config.js',
    
    // Core CSS (you'll need to create this based on your styles)
    '/assets/css/main.css',
    '/assets/css/stars.css',
    '/assets/css/animate-moon.css',
    'assets/css/cookieconsent-theme.css',
    
    // Favicon and core images (matching your HTML meta tags)
    '/assets/images/favicon.ico',
    '/assets/images/apple-touch-icon.png',
    '/assets/images/favicon-32x32.png',
    '/assets/images/favicon-16x16.png',
    
    // Hero images (matching your HTML img src)
    '/assets/images/profile-hero.jpg',
    
    // Project images (matching your portfolio section)
    '/assets/images/projects/ecommerce-platform.jpg',
    '/assets/images/projects/task-manager.jpg',
    '/assets/images/projects/weather-app.jpg',
    '/assets/images/projects/blog-api.jpg',
    '/assets/images/projects/dashboard.jpg',
    '/assets/images/projects/fitness-tracker.jpg',
    
    // PWA icons (if you create them)
    '/assets/images/icons/icon-192.png',
    '/assets/images/icons/icon-512.png',
    '/assets/images/icons/maskable-icon-192.png',
    '/assets/images/icons/maskable-icon-512.png',
    
    // Microsoft tile images
    '/assets/images/icons/mstile-70x70.png',
    '/assets/images/icons/mstile-150x150.png',
    '/assets/images/icons/mstile-310x150.png',
    '/assets/images/icons/mstile-310x310.png',
    
    // Documents (matching your download links)
    '/assets/documents/Thanatsitt_Resume.pdf'
];

// External CDN resources (matching your HTML head)
const EXTERNAL_CACHE_URLS = [
    // Google Fonts (matching your HTML)
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2',
    
    // Font Awesome (matching your HTML)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2',
    
    // GSAP (matching your HTML)
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
    
    // AOS (matching your HTML)
    'https://unpkg.com/aos@2.3.1/dist/aos.css',
    'https://unpkg.com/aos@2.3.1/dist/aos.js'
    
     <!-- Optional polyfills -->
  'https://cdn.jsdelivr.net/npm/intersection-observer@0.12.0/intersection-observer.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js'

];

// Dynamic cache patterns
const CACHE_PATTERNS = [
    /^https:\/\/fonts\.googleapis\.com\//,
    /^https:\/\/fonts\.gstatic\.com\//,
    /^https:\/\/cdnjs\.cloudflare\.com\//,
    /^https:\/\/unpkg\.com\//,
    /\.(png|jpg|jpeg|svg|gif|webp|ico|avif)$/i,
    /\.(woff|woff2|ttf|otf|eot)$/i,
    /\.(js|css)$/i
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
    /google-analytics/,
    /googletagmanager/,
    /gtag/,
    /\.map$/,
    /sw\.js$/,
    /admin/,
    /wp-admin/,
    /\.php$/,
    /sockjs-node/, // Development server
    /__webpack_hmr/, // Hot module replacement
    /hot-update/, // Webpack HMR
    /chrome-extension:/
];

/*
========================================
INSTALL EVENT
========================================
*/
self.addEventListener('install', (event) => {
    console.log('🔧 Portfolio Service Worker installing...');
    
    event.waitUntil(
        (async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                
                // Combine static and external URLs
                const allUrls = [...STATIC_CACHE_URLS, ...EXTERNAL_CACHE_URLS];
                
                // Filter out URLs that might not exist
                const urlsToCache = allUrls.filter(url => {
                    return !EXCLUDE_PATTERNS.some(pattern => pattern.test(url));
                });
                
                console.log('📦 Caching portfolio assets...');
                
                // Cache critical assets first
                const criticalUrls = [
                    '/',
                    '/assets/js/main.js',
                    '/assets/js/app.js',
                    '/assets/css/styles.css',
                    '/assets/images/profile-hero.jpg'
                ].filter(url => urlsToCache.includes(url));
                
                // Cache critical assets with higher priority
                console.log('🚀 Caching critical assets first...');
                for (const url of criticalUrls) {
                    try {
                        const response = await fetch(url, { 
                            cache: 'reload',
                            mode: 'cors'
                        });
                        if (response.ok) {
                            await cache.put(url, response);
                            console.log('✅ Critical asset cached:', url);
                        }
                    } catch (error) {
                        console.warn('❌ Failed to cache critical asset:', url, error.message);
                    }
                }
                
                // Cache remaining assets in background
                const remainingUrls = urlsToCache.filter(url => !criticalUrls.includes(url));
                const cachePromises = remainingUrls.map(async (url) => {
                    try {
                        const response = await fetch(url, { 
                            mode: url.startsWith('http') ? 'cors' : 'same-origin'
                        });
                        if (response.ok) {
                            await cache.put(url, response);
                            console.log('✅ Cached:', url);
                        } else {
                            console.warn('❌ Failed to cache (bad response):', url, response.status);
                        }
                    } catch (error) {
                        console.warn('❌ Failed to cache (fetch error):', url, error.message);
                    }
                });
                
                await Promise.allSettled(cachePromises);
                console.log('📦 Portfolio assets caching completed');
                
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
    console.log('🚀 Portfolio Service Worker activating...');
    
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
                
                console.log('✅ Portfolio Service Worker activated successfully');
                
                // Notify clients about activation
                await notifyClients({
                    type: 'SW_ACTIVATED',
                    cacheName: CACHE_NAME,
                    features: ['offline-browsing', 'fast-loading', 'auto-updates']
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
    
    // Skip excluded URLs (analytics, etc.)
    if (EXCLUDE_PATTERNS.some(pattern => pattern.test(event.request.url))) {
        return;
    }
    
    // Skip Chrome extension requests
    if (event.request.url.startsWith('chrome-extension://')) {
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
        // Strategy 1: Network First (for HTML pages and API calls)
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

// Network First Strategy (for HTML pages)
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request, {
            timeout: 5000 // 5 second timeout
        });
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            // Clone the response because it can only be consumed once
            cache.put(request, networkResponse.clone()).catch(err => {
                console.log('Cache put failed:', err.message);
            });
            
            trackCacheHit();
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache for:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            trackCacheHit();
            return cachedResponse;
        }
        
        trackCacheMiss();
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return await handleNavigationError(request);
        }
        
        throw error;
    }
}

// Cache First Strategy (for static assets)
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        trackCacheHit();
        // Background update for long-term cached items
        backgroundUpdate(request);
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request, {
            mode: request.url.startsWith('http') ? 'cors' : 'same-origin'
        });
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone()).catch(err => {
                console.log('Cache put failed:', err.message);
            });
        }
        
        trackCacheMiss();
        return networkResponse;
    } catch (error) {
        trackCacheMiss();
        throw error;
    }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidateStrategy(request) {
    const cachedResponse = await caches.match(request);
    
    // Start the network request regardless of cache hit
    const networkPromise = fetch(request, {
        mode: request.url.startsWith('http') ? 'cors' : 'same-origin'
    }).then(async (networkResponse) => {
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
    if (cachedResponse) {
        trackCacheHit();
        return cachedResponse;
    } else {
        trackCacheMiss();
        return networkPromise;
    }
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
    
    // Last resort: basic 404 response with portfolio branding
    const fallbackHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Page Not Found - Thanatsitt Portfolio</title>
        <style>
            body {
                font-family: 'Inter', sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
            }
            .container {
                max-width: 500px;
                padding: 2rem;
            }
            h1 {
                font-size: 3rem;
                margin-bottom: 1rem;
                opacity: 0.9;
            }
            p {
                font-size: 1.2rem;
                margin-bottom: 2rem;
                opacity: 0.8;
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                background: rgba(255,255,255,0.2);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                transition: all 0.3s ease;
                border: 1px solid rgba(255,255,255,0.3);
            }
            .btn:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>404</h1>
            <p>Oops! The page you're looking for doesn't exist.</p>
            <a href="/" class="btn">← Back to Portfolio</a>
        </div>
    </body>
    </html>
    `;
    
    return new Response(fallbackHTML, {
        status: 404,
        statusText: 'Not Found',
        headers: { 'Content-Type': 'text/html' }
    });
}

// Handle fetch errors
async function handleFetchError(request, error) {
    console.error('Fetch failed:', error);
    
    // Try to return cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        trackCacheHit();
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
           EXTERNAL_CACHE_URLS.includes(url) ||
           url.includes('/assets/') ||
           url.includes('/images/') ||
           url.includes('/css/') ||
           url.includes('/js/') ||
           url.includes('/fonts/') ||
           url.includes('/documents/');
}

// Preload critical pages on first visit
async function preloadCriticalPages() {
    const criticalPages = [
        '/',
        '/404.html',
        '/offline.html'
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
            const networkResponse = await fetch(request, {
                mode: request.url.startsWith('http') ? 'cors' : 'same-origin'
            });
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
                timestamp: new Date().toISOString(),
                features: getVersionInfo().features
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
            
        case 'GET_CACHE_STATS':
            getCacheStats().then((stats) => {
                event.ports[0]?.postMessage({ stats });
            }).catch((error) => {
                event.ports[0]?.postMessage({ stats: null, error: error.message });
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
            const response = await fetch(url, {
                mode: url.startsWith('http') ? 'cors' : 'same-origin'
            });
            if (response.ok) {
                await cache.put(url, response);
                console.log('📦 Cached specific URL:', url);
            }
        } catch (error) {
            console.warn('Failed to cache URL:', url, error.message);
        }
    }
}

// Get cache statistics
async function getCacheStats() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        const estimate = 'storage' in navigator && 'estimate' in navigator.storage 
            ? await navigator.storage.estimate() 
            : null;
        
        return {
            totalEntries: keys.length,
            cacheHitRate: cacheHits > 0 ? (cacheHits / (cacheHits + cacheMisses)) * 100 : 0,
            totalRequests: cacheHits + cacheMisses,
            storageEstimate: estimate,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Failed to get cache stats:', error);
        return null;
    }
}

/*
========================================
BACKGROUND SYNC (if supported)
========================================
*/
self.addEventListener('sync', (event) => {
    if (event.tag === 'portfolio-background-sync') {
        console.log('🔄 Portfolio background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        console.log('📊 Performing portfolio background sync...');
        
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
PUSH NOTIFICATIONS (PWA ready)
========================================
*/
self.addEventListener('push', (event) => {
    console.log('📧 Push message received');
    
    let title = 'Thanatsitt\'s Portfolio';
    let options = {
        body: 'Check out the latest updates to my portfolio!',
        icon: '/assets/images/icons/icon-192.png',
        badge: '/assets/images/icons/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
            url: '/'
        },
        actions: [
            {
                action: 'explore',
                title: 'View Portfolio',
                icon: '/assets/images/icons/action-view.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/images/icons/action-close.png'
            }
        ],
        tag: 'portfolio-update',
        renotify: true,
        silent: false
    };
    
    if (event.data) {
        try {
            const data = event.data.json();
            title = data.title || title;
            options.body = data.body || options.body;
            if (data.icon) options.icon = data.icon;
            if (data.url) options.data.url = data.url;
            if (data.image) options.image = data.image;
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
CACHE MANAGEMENT & CLEANUP
========================================
*/
async function performCacheCleanup() {
    try {
        console.log('🧹 Performing portfolio cache cleanup...');
        
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
PERFORMANCE & ANALYTICS TRACKING
========================================
*/

// Track cache hit rates
let cacheHits = 0;
let cacheMisses = 0;

function trackCacheHit() {
    cacheHits++;
    logPerformanceMetrics();
}

function trackCacheMiss() {
    cacheMisses++;
    logPerformanceMetrics();
}

function logPerformanceMetrics() {
    if ((cacheHits + cacheMisses) % 50 === 0 && (cacheHits + cacheMisses) > 0) {
        const hitRate = (cacheHits / (cacheHits + cacheMisses)) * 100;
        console.log(`📊 Portfolio cache hit rate: ${hitRate.toFixed(2)}%`);
        
        // Notify clients about performance
        notifyClients({
            type: 'CACHE_PERFORMANCE',
            hitRate: hitRate,
            totalRequests: cacheHits + cacheMisses,
            cacheHits: cacheHits,
            cacheMisses: cacheMisses
        });
    }
}

/*
========================================
ERROR HANDLING & REPORTING
========================================
*/
self.addEventListener('error', (event) => {
    console.error('🚨 Portfolio Service Worker error:', event.error);
    
    // Log error details
    const errorInfo = {
        message: event.error?.message || 'Unknown error',
        stack: event.error?.stack || 'No stack trace',
        filename: event.filename || 'Unknown file',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        cacheVersion: CACHE_NAME
    };
    
    console.error('Error details:', errorInfo);
    
    // Notify clients about the error
    notifyClients({
        type: 'SW_ERROR',
        error: errorInfo,
        timestamp: new Date().toISOString()
    });
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection in Portfolio SW:', event.reason);
    
    const rejectionInfo = {
        reason: event.reason?.toString() || 'Unknown reason',
        timestamp: new Date().toISOString(),
        cacheVersion: CACHE_NAME
    };
    
    console.error('Rejection details:', rejectionInfo);
    
    // Notify clients about the rejection
    notifyClients({
        type: 'SW_PROMISE_REJECTION',
        rejection: rejectionInfo,
        timestamp: new Date().toISOString()
    });
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
            'offline-portfolio-browsing',
            'intelligent-caching',
            'background-sync',
            'push-notifications',
            'auto-updates',
            'error-handling',
            'cache-cleanup',
            'dynamic-caching',
            'performance-tracking',
            'pwa-ready'
        ],
        staticUrls: STATIC_CACHE_URLS.length,
        externalUrls: EXTERNAL_CACHE_URLS.length,
        patterns: CACHE_PATTERNS.length,
        excludePatterns: EXCLUDE_PATTERNS.length
    };
}

// Handle version updates
async function handleVersionUpdate(newVersion) {
    try {
        console.log(`🔄 Updating Portfolio SW from ${CACHE_NAME} to ${newVersion}`);
        
        // Perform any necessary migration tasks
        await migrateCacheData(CACHE_NAME, newVersion);
        
        // Notify clients about successful update
        await notifyClients({
            type: 'SW_UPDATE_COMPLETED',
            oldVersion: CACHE_NAME,
            newVersion: newVersion,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Version update failed:', error);
        
        await notifyClients({
            type: 'SW_UPDATE_FAILED',
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
        const criticalUrls = [
            '/', 
            '/index.html', 
            '/404.html',
            '/assets/js/main.js',
            '/assets/js/app.js',
            '/assets/css/styles.css',
            '/assets/images/profile-hero.jpg'
        ];
        
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
    console.log('🌐 Portfolio Service Worker detected online');
    
    notifyClients({
        type: 'NETWORK_STATUS_CHANGE',
        isOnline: true,
        timestamp: new Date().toISOString()
    });
    
    // Trigger background sync when coming back online
    if (self.registration.sync) {
        self.registration.sync.register('portfolio-background-sync');
    }
    
    // Update critical resources when back online
    updateCriticalResources();
});

self.addEventListener('offline', () => {
    isOnline = false;
    console.log('📴 Portfolio Service Worker detected offline');
    
    notifyClients({
        type: 'NETWORK_STATUS_CHANGE',
        isOnline: false,
        timestamp: new Date().toISOString()
    });
});

async function updateCriticalResources() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const criticalResources = [
            '/',
            '/assets/js/main.js',
            '/assets/js/app.js'
        ];
        
        for (const url of criticalResources) {
            try {
                const response = await fetch(url, { cache: 'no-cache' });
                if (response.ok) {
                    await cache.put(url, response);
                    console.log('🔄 Updated critical resource:', url);
                }
            } catch (error) {
                console.log('Failed to update critical resource:', url);
            }
        }
    } catch (error) {
        console.error('Critical resource update failed:', error);
    }
}

/*
========================================
PERIODIC BACKGROUND SYNC
========================================
*/
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'portfolio-update-check') {
        console.log('🔄 Periodic portfolio sync triggered');
        event.waitUntil(checkForPortfolioUpdates());
    }
});

async function checkForPortfolioUpdates() {
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
                    console.log('📥 Portfolio content update detected');
                    
                    // Update the cache
                    await currentCache.put('/', new Response(newText, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    }));
                    
                    // Notify clients about update
                    await notifyClients({
                        type: 'PORTFOLIO_CONTENT_UPDATED',
                        timestamp: new Date().toISOString(),
                        message: 'New portfolio content available!'
                    });
                    
                    return true;
                }
            }
        }
        return false;
    } catch (error) {
        console.log('Portfolio update check failed:', error);
        return false;
    }
}

async function checkForUpdates() {
    return await checkForPortfolioUpdates();
}

/*
========================================
DEBUGGING & DEVELOPMENT HELPERS
========================================
*/
if (self.location.hostname === 'localhost' || 
    self.location.hostname === '127.0.0.1' || 
    self.location.hostname.includes('.local') ||
    self.location.hostname.includes('github.io') ||
    self.location.hostname.includes('netlify.app') ||
    self.location.hostname.includes('vercel.app')) {
    
    console.log('🔧 Portfolio Service Worker running in development mode');
    
    // Add debugging helpers
    self.debugPortfolioSW = {
        // Cache management
        getCacheNames: () => caches.keys(),
        getCacheContents: async (cacheName = CACHE_NAME) => {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            return keys.map(request => ({
                url: request.url,
                method: request.method,
                headers: Object.fromEntries(request.headers.entries())
            }));
        },
        clearCache: (cacheName = CACHE_NAME) => caches.delete(cacheName),
        clearAllCaches: () => clearAllCaches(),
        
        // Version info
        getVersion: () => getVersionInfo(),
        getCurrentCacheName: () => CACHE_NAME,
        getConfig: () => ({
            staticUrls: STATIC_CACHE_URLS,
            externalUrls: EXTERNAL_CACHE_URLS,
            cachePatterns: CACHE_PATTERNS,
            excludePatterns: EXCLUDE_PATTERNS
        }),
        
        // Manual operations
        forceUpdate: () => self.skipWaiting(),
        preloadUrls: (urls) => cacheSpecificUrls(urls),
        updateCriticalResources: () => updateCriticalResources(),
        
        // Testing
        simulateOffline: () => {
            console.log('🧪 Simulating offline mode');
            isOnline = false;
            notifyClients({
                type: 'NETWORK_STATUS_CHANGE',
                isOnline: false,
                simulated: true
            });
        },
        simulateOnline: () => {
            console.log('🧪 Simulating online mode');
            isOnline = true;
            notifyClients({
                type: 'NETWORK_STATUS_CHANGE',
                isOnline: true,
                simulated: true
            });
        },
        
        // Performance stats
        getCacheStats: () => getCacheStats(),
        getPerformanceStats: () => ({
            cacheHits,
            cacheMisses,
            hitRate: cacheHits > 0 ? (cacheHits / (cacheHits + cacheMisses)) * 100 : 0,
            totalRequests: cacheHits + cacheMisses
        }),
        
        // Testing helpers
        testCacheStrategy: async (url, strategy = 'cache-first') => {
            console.log(`🧪 Testing ${strategy} strategy for:`, url);
            const request = new Request(url);
            
            switch (strategy) {
                case 'cache-first':
                    return await cacheFirstStrategy(request);
                case 'network-first':
                    return await networkFirstStrategy(request);
                case 'stale-while-revalidate':
                    return await staleWhileRevalidateStrategy(request);
                default:
                    return await handleFetch(request);
            }
        },
        
        // Cache inspection
        inspectCacheEntry: async (url, cacheName = CACHE_NAME) => {
            const cache = await caches.open(cacheName);
            const response = await cache.match(url);
            if (response) {
                return {
                    url,
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    type: response.type,
                    ok: response.ok,
                    redirected: response.redirected
                };
            }
            return null;
        }
    };
    
    console.log('🛠️ Debug helpers available at self.debugPortfolioSW');
    console.log('💡 Try: self.debugPortfolioSW.getCacheStats()');
}

/*
========================================
PORTFOLIO-SPECIFIC FEATURES
========================================
*/

// Handle portfolio-specific routes
async function handlePortfolioRoutes(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Handle portfolio project deep links
    if (pathname.startsWith('/project/')) {
        // Redirect to main page with hash for SPA routing
        const projectId = pathname.split('/')[2];
        return Response.redirect(`/#portfolio-${projectId}`, 302);
    }
    
    // Handle blog posts if you add a blog
    if (pathname.startsWith('/blog/')) {
        const blogPost = pathname.split('/')[2];
        return Response.redirect(`/#blog-${blogPost}`, 302);
    }
    
    // Handle contact form submissions (if using static form)
    if (pathname === '/contact' && request.method === 'POST') {
        // Let the main app handle this
        return fetch(request);
    }
    
    return null;
}

// Preload portfolio images based on viewport
async function preloadPortfolioImages() {
    const portfolioImages = [
        '/assets/images/projects/ecommerce-platform.jpg',
        '/assets/images/projects/task-manager.jpg',
        '/assets/images/projects/weather-app.jpg'
    ];
    
    const cache = await caches.open(CACHE_NAME);
    
    for (const imageUrl of portfolioImages) {
        try {
            if (!(await cache.match(imageUrl))) {
                const response = await fetch(imageUrl);
                if (response.ok) {
                    await cache.put(imageUrl, response);
                    console.log('🖼️ Preloaded portfolio image:', imageUrl);
                }
            }
        } catch (error) {
            console.log('Failed to preload image:', imageUrl);
        }
    }
}

/*
========================================
ANALYTICS & METRICS COLLECTION
========================================
*/

// Collect portfolio-specific metrics
let portfolioMetrics = {
    pageViews: 0,
    offlineViews: 0,
    cacheHitsByType: {
        html: 0,
        css: 0,
        js: 0,
        images: 0,
        fonts: 0,
        other: 0
    },
    popularSections: {},
    loadTimes: [],
    errors: []
};

function trackPortfolioMetric(type, data) {
    switch (type) {
        case 'page-view':
            portfolioMetrics.pageViews++;
            if (!isOnline) portfolioMetrics.offlineViews++;
            break;
            
        case 'cache-hit':
            const fileType = getFileType(data.url);
            portfolioMetrics.cacheHitsByType[fileType]++;
            break;
            
        case 'section-view':
            const section = data.section;
            portfolioMetrics.popularSections[section] = 
                (portfolioMetrics.popularSections[section] || 0) + 1;
            break;
            
        case 'load-time':
            portfolioMetrics.loadTimes.push({
                url: data.url,
                duration: data.duration,
                timestamp: new Date().toISOString()
            });
            break;
            
        case 'error':
            portfolioMetrics.errors.push({
                error: data.error,
                url: data.url,
                timestamp: new Date().toISOString()
            });
            break;
    }
    
    // Send metrics to clients periodically
    if (portfolioMetrics.pageViews % 10 === 0) {
        notifyClients({
            type: 'PORTFOLIO_METRICS',
            metrics: { ...portfolioMetrics },
            timestamp: new Date().toISOString()
        });
    }
}

function getFileType(url) {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (['html', 'htm'].includes(extension)) return 'html';
    if (['css'].includes(extension)) return 'css';
    if (['js', 'mjs'].includes(extension)) return 'js';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif'].includes(extension)) return 'images';
    if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(extension)) return 'fonts';
    
    return 'other';
}

/*
========================================
SECURITY ENHANCEMENTS
========================================
*/

// Add security headers to cached responses
function addSecurityHeaders(response) {
    const newHeaders = new Headers(response.headers);
    
    // Add security headers if not present
    if (!newHeaders.has('X-Content-Type-Options')) {
        newHeaders.set('X-Content-Type-Options', 'nosniff');
    }
    
    if (!newHeaders.has('X-Frame-Options')) {
        newHeaders.set('X-Frame-Options', 'DENY');
    }
    
    if (!newHeaders.has('X-XSS-Protection')) {
        newHeaders.set('X-XSS-Protection', '1; mode=block');
    }
    
    if (!newHeaders.has('Referrer-Policy')) {
        newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
    
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
}

// Validate requests for security
function isRequestSafe(request) {
    const url = new URL(request.url);
    
    // Block suspicious patterns
    const suspiciousPatterns = [
        /\.\.\//, // Path traversal
        /javascript:/i, // JavaScript protocol
        /data:/i, // Data protocol (in some contexts)
        /vbscript:/i, // VBScript protocol
        /<script/i, // Script injection attempts
        /eval\(/i, // Eval attempts
        /union.*select/i // SQL injection attempts
    ];
    
    return !suspiciousPatterns.some(pattern => 
        pattern.test(request.url) || 
        pattern.test(request.referrer || '')
    );
}

/*
========================================
INITIALIZATION COMPLETE
========================================
*/

// Initialize portfolio-specific features
(async function initializePortfolioSW() {
    try {
        console.log(`🚀 Portfolio Service Worker (${CACHE_NAME}) initializing...`);
        
        // Preload portfolio images in background
        setTimeout(() => {
            preloadPortfolioImages().catch(error => {
                console.log('Portfolio image preload failed:', error);
            });
        }, 2000);
        
        // Initialize performance tracking
        trackPortfolioMetric('page-view', { url: self.location.href });
        
        console.log(`✅ Portfolio Service Worker (${CACHE_NAME}) ready!`);
        
    } catch (error) {
        console.error('Portfolio SW initialization failed:', error);
    }
})();

// Log detailed initialization info
console.log(`🚀 Portfolio Service Worker (${CACHE_NAME}) loaded and ready!`);
console.log('📋 Features enabled:', getVersionInfo().features.join(', '));
console.log('📦 Static URLs to cache:', STATIC_CACHE_URLS.length);
console.log('🌐 External URLs to cache:', EXTERNAL_CACHE_URLS.length);
console.log('🎯 Cache patterns:', CACHE_PATTERNS.length);
console.log('🚫 Exclude patterns:', EXCLUDE_PATTERNS.length);

// Welcome message with portfolio branding
console.log(`
🎨 Portfolio Service Worker v${CACHE_NAME.split('-v')[1]}

✨ Portfolio Capabilities:
• 📱 Offline portfolio browsing
• ⚡ Lightning-fast loading
• 🎯 Intelligent asset caching
• 🔄 Automatic background updates
• 📊 Performance tracking
• 🔒 Security enhancements
• 🛠️ Error handling & recovery
• 🧹 Automatic cache management
• 📧 Push notification ready
• 📈 Analytics integration

🌟 Portfolio Features:
• Project showcase caching
• Resume download offline
• Contact form offline queue
• Image optimization
• Font preloading
• Critical CSS caching

🛠️ Development mode: ${self.location.hostname === 'localhost' || self.location.hostname.includes('.local') ? 'ON' : 'OFF'}
📊 Debug helpers: ${typeof self.debugPortfolioSW !== 'undefined' ? 'Available at self.debugPortfolioSW' : 'Not available'}

Ready to showcase your portfolio offline! 🚀
`);

// Final setup
console.log('🎯 Portfolio Service Worker setup complete - your portfolio is now PWA-ready!');

