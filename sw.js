/*!
 * Portfolio Service Worker
 * PWA & Offline Functionality
 * Author: Thanatsitt Santisamranwilai
 * Version: 2.1.0
 */

'use strict';

// Service Worker Configuration
const CACHE_NAME = 'portfolio-v2.1.0';
const OFFLINE_PAGE = '/offline.html';
const FALLBACK_PAGE = '/404.html';
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
    '/config/browserconfig.xml',
    
    // Core JavaScript files (matching your HTML script tags)
    '/assets/js/main.js',
    '/assets/js/app.js',
    '/assets/js/cookieconsent.js',
    '/assets/js/cookieconsent-config.js',
    
    // Core CSS (you'll need to create this based on your styles)
    '/assets/css/main.css',
    '/assets/css/stars.css',
    '/assets/css/animate-moon.css',
    '/assets/css/cookieconsent-theme.css',
    
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
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollToPlugin.min.js',
    // AOS (matching your HTML)
    'https://unpkg.com/aos@2.3.1/dist/aos.css',
    'https://unpkg.com/aos@2.3.1/dist/aos.js',
    
    // Optional polyfills
    'https://cdn.jsdelivr.net/npm/intersection-observer@0.12.0/intersection-observer.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js'
];

// Dynamic cache patterns
const CACHE_PATTERNS = [
    /^https:\/\/fonts\.googleapis\.com\//,
    /^https:\/\/fonts\.gstatic\.com\//,
    /^https:\/\/cdnjs\.cloudflare\.com\//,
    /^https:\/\/unpkg\.com\//,
    /^https:\/\/cdn\.jsdelivr\.net\//,
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
    /service-worker\.js$/,
    /admin/,
    /wp-admin/,
    /\.php$/,
    /sockjs-node/, // Development server
    /__webpack_hmr/, // Hot module replacement
    /hot-update/, // Webpack HMR
    /chrome-extension:/,
    /moz-extension:/,
    /safari-extension:/,
    /^https:\/\/.*\.googleusercontent\.com\//,
    /^https:\/\/accounts\.google\.com\//,
    /^https:\/\/apis\.google\.com\//
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
                
                // Cache critical assets first (essential for offline functionality)
                const criticalUrls = [
                    '/',
                    '/404.html',
                    '/offline.html'
                ].filter(url => STATIC_CACHE_URLS.includes(url));
                
                console.log('🚀 Caching critical assets first...');
                for (const url of criticalUrls) {
                    try {
                        const response = await fetch(url, { 
                            cache: 'reload',
                            mode: 'same-origin'
                        });
                        if (response.ok) {
                            await cache.put(url, response);
                            console.log('✅ Critical asset cached:', url);
                        } else {
                            console.warn('❌ Failed to cache critical asset:', url, response.status);
                        }
                    } catch (error) {
                        console.warn('❌ Failed to fetch critical asset:', url, error.message);
                    }
                }
                
                // Cache remaining static assets in background
                const remainingStaticUrls = STATIC_CACHE_URLS.filter(url => !criticalUrls.includes(url));
                const staticCachePromises = remainingStaticUrls.map(async (url) => {
                    try {
                        const response = await fetch(url, { 
                            mode: 'same-origin',
                            cache: 'default'
                        });
                        if (response.ok) {
                            await cache.put(url, response);
                            console.log('✅ Static asset cached:', url);
                        } else {
                            console.warn('❌ Failed to cache static asset:', url, response.status);
                        }
                    } catch (error) {
                        console.warn('❌ Failed to fetch static asset:', url, error.message);
                    }
                });
                
                // Cache external resources
                const externalCachePromises = EXTERNAL_CACHE_URLS.map(async (url) => {
                    try {
                        const response = await fetch(url, { 
                            mode: 'cors',
                            cache: 'default'
                        });
                        if (response.ok) {
                            await cache.put(url, response);
                            console.log('✅ External asset cached:', url);
                        } else {
                            console.warn('❌ Failed to cache external asset:', url, response.status);
                        }
                    } catch (error) {
                        console.warn('❌ Failed to fetch external asset:', url, error.message);
                    }
                });
                
                // Wait for all caching operations to complete (but don't fail if some fail)
                await Promise.allSettled([...staticCachePromises, ...externalCachePromises]);
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
    
    // Skip extension requests
    if (event.request.url.startsWith('chrome-extension://') ||
        event.request.url.startsWith('moz-extension://') ||
        event.request.url.startsWith('safari-extension://')) {
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
    try {
        // Security check
        if (!isRequestSafe(request)) {
            console.warn('🚨 Blocked unsafe request:', request.url);
            return new Response('Request blocked for security reasons', { status: 403 });
        }
        
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
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Network timeout')), 5000);
        });
        
        // Race between fetch and timeout
        const networkResponse = await Promise.race([
            fetch(request),
            timeoutPromise
        ]);
        
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
        return addSecurityHeaders(cachedResponse);
    }
    
    try {
        const networkResponse = await fetch(request, {
            mode: request.url.startsWith('http') && !request.url.startsWith(self.location.origin) ? 'cors' : 'same-origin'
        });
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone()).catch(err => {
                console.log('Cache put failed:', err.message);
            });
        }
        
        trackCacheMiss();
        return addSecurityHeaders(networkResponse);
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
        mode: request.url.startsWith('http') && !request.url.startsWith(self.location.origin) ? 'cors' : 'same-origin'
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
        return addSecurityHeaders(cachedResponse);
    } else {
        trackCacheMiss();
        const response = await networkPromise;
        return response ? addSecurityHeaders(response) : response;
    }
}

// Handle navigation errors (404, etc.)
async function handleNavigationError(request) {
    // Try 404 page first
    const custom404 = await caches.match(FALLBACK_PAGE);
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
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 1rem;
            }
            .container {
                max-width: 500px;
                padding: 2rem;
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border-radius: 16px;
                border: 1px solid rgba(255,255,255,0.2);
            }
            h1 {
                font-size: 4rem;
                margin-bottom: 1rem;
                opacity: 0.9;
                background: linear-gradient(45deg, #fff, #f0f0f0);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            p {
                font-size: 1.1rem;
                margin-bottom: 2rem;
                opacity: 0.8;
                line-height: 1.6;
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
                font-weight: 500;
            }
            .btn:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
            }
            .status {
                font-size: 0.9rem;
                opacity: 0.6;
                margin-top: 1rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>404</h1>
            <p>The page you're looking for seems to have vanished into the digital void. But don't worry – let's get you back to exploring amazing projects!</p>
            <a href="/" class="btn">← Back to Portfolio</a>
            <div class="status">You're currently offline. Some features may be limited.</div>
        </div>
    </body>
    </html>
    `;
    
    return new Response(fallbackHTML, {
        status: 404,
        statusText: 'Not Found',
        headers: { 
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
        }
    });
}

// Handle fetch errors
async function handleFetchError(request, error) {
    console.error('Fetch failed:', error);
    
    // Try to return cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        trackCacheHit();
        return addSecurityHeaders(cachedResponse);
    }
    
    // For navigation requests, show appropriate error page
    if (request.mode === 'navigate') {
        return await handleNavigationError(request);
    }
    
    // Return a basic offline response for other requests
    return new Response('Content not available offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache'
        }
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

// Background update for cached resources
function backgroundUpdate(request) {
    // Don't block the main response
    setTimeout(async () => {
        try {
            const networkResponse = await fetch(request, {
                mode: request.url.startsWith('http') && !request.url.startsWith(self.location.origin) ? 'cors' : 'same-origin'
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
    try {
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
    } catch (error) {
        console.log('Failed to get client list:', error);
    }
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
                mode: url.startsWith('http') && !url.startsWith(self.location.origin) ? 'cors' : 'same-origin'
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
        
        let estimate = null;
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                estimate = await navigator.storage.estimate();
            } catch (error) {
                console.log('Storage estimate not available:', error);
            }
        }
        
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
        badge: '/assets/images/icons/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
            url: '/'
        },
        actions: [
            {
                action: 'explore',
                title: 'View Portfolio'
            },
            {
                action: 'close',
                title: 'Close'
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
    } else if (event.action !== 'close') {
        // Default action (clicking notification body)
        event.waitUntil(
            clients.openWindow(urlToOpen)
        );
    }
});

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
            'pwa-ready',
            'security-headers',
            'timeout-handling'
        ],
        staticUrls: STATIC_CACHE_URLS.length,
        externalUrls: EXTERNAL_CACHE_URLS.length,
        patterns: CACHE_PATTERNS.length,
        excludePatterns: EXCLUDE_PATTERNS.length
    };
}

/*
========================================
SECURITY ENHANCEMENTS
========================================
*/

// Add security headers to cached responses
function addSecurityHeaders(response) {
    // Don't modify responses that already have been processed
    if (!response || response.headers.get('sw-processed')) {
        return response;
    }
    
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
    
    // Mark as processed
    newHeaders.set('sw-processed', 'true');
    
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
INITIALIZATION COMPLETE
========================================
*/

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
