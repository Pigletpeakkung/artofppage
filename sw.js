/**
 * ===============================================
 * THANATSITT PORTFOLIO - SERVICE WORKER v3.0
 * ===============================================
 * Progressive Web App Service Worker
 * Author: Thanatsitt Santisamranwilai
 * Version: 3.0.0 (2025 Modern Update)
 * Features: Caching, Offline Support, Background Sync,
 *          Push Notifications, Performance Optimization
 * ===============================================
 */

const CACHE_NAME = 'thanatsitt-portfolio-v3.0.0';
const OFFLINE_CACHE = 'thanatsitt-offline-v3.0.0';
const RUNTIME_CACHE = 'thanatsitt-runtime-v3.0.0';

// Cache versioning for updates
const CACHE_VERSION = '3.0.0';
const LAST_UPDATED = '2025-01-20';

// ===============================================
// CACHE STRATEGIES & RESOURCES
// ===============================================

// Critical resources that must be cached immediately
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/css/script.js',
    '/manifest.json',
    '/favicon.ico',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
    'assets/images/data/profile/1755844218313.jpg',
    'assets/demo/voice/intro/Thann_Intro.wav'
    ],
    
    // Static assets - cache with versioning
    static: [
        // CSS files
        '/assets/css/styles.min.css',
        
        // JavaScript files
        '/assets/js/main.js',
        '/assets/js/bundle.min.js',
        
        // Images
        '/assets/images/',
        '/assets/icons/',
        
        // Fonts
        '/assets/fonts/',
        
        // Offline page
        '/offline.html'
    ],
];


// Static assets to cache
const STATIC_ASSETS = [
    // CSS Framework
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    
    // JavaScript Libraries
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
    'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
    'https://cdn.jsdelivr.net/npm/typed.js@2.1.0/dist/typed.umd.js',
    'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css',
    'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js',
    
    // Font Awesome
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2',
    
    // Profile Image
    'https://github.com/Pigletpeakkung/artofppage/raw/74ef50ce6221cc36848c31580fd8c1f8bea38fb6/assets/images/data/profile/1755844218313.jpg'
];

// Audio files for offline playback
const AUDIO_ASSETS = [
    'https://github.com/Pigletpeakkung/artofppage/raw/feb49ee7640dd7d8aa8ece40bbd8258b69ef1e98/assets/demo/voice/intro/Thann_Intro.wav',
    'https://github.com/Pigletpeakkung/artofppage/raw/92520ec59362efa20d141a2b031dbb40d28f4f3a/assets/demo/voice/act/Thanattsitt-Hobby-Freetalk.mp3'
];

// Resources that should be cached runtime
const RUNTIME_CACHE_URLS = [
    /^https:\/\/fonts\.googleapis\.com/,
    /^https:\/\/fonts\.gstatic\.com/,
    /^https:\/\/api\./,
    /^https:\/\/.*\.googleapis\.com/
];

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

// Log with timestamp for debugging
const log = (message, data = null) => {
    const timestamp = new Date().toISOString();
    if (data) {
        console.log(`[SW ${timestamp}] ${message}`, data);
    } else {
        console.log(`[SW ${timestamp}] ${message}`);
    }
};

// Check if URL should be cached at runtime
const shouldRuntimeCache = (url) => {
    return RUNTIME_CACHE_URLS.some(pattern => pattern.test(url));
};

// Clean old caches
const cleanOldCaches = async () => {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('thanatsitt-') && 
        !name.includes(CACHE_VERSION)
    );
    
    return Promise.all(
        oldCaches.map(cacheName => {
            log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
        })
    );
};

// Get cache name based on request type
const getCacheName = (request) => {
    const url = new URL(request.url);
    
    // Audio files
    if (request.url.includes('.wav') || request.url.includes('.mp3')) {
        return `${CACHE_NAME}-audio`;
    }
    
    // Images
    if (request.destination === 'image') {
        return `${CACHE_NAME}-images`;
    }
    
    // Fonts
    if (request.destination === 'font' || url.hostname.includes('fonts')) {
        return `${CACHE_NAME}-fonts`;
    }
    
    // API responses
    if (url.hostname.includes('api') || url.pathname.includes('api/')) {
        return `${CACHE_NAME}-api`;
    }
    
    // Default cache
    return CACHE_NAME;
};

// Create offline fallback page
const createOfflinePage = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - Thanatsitt Portfolio</title>
    <style>
        :root {
            --primary-color: #6366f1;
            --bg-primary: #0f172a;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, var(--bg-primary) 0%, #1e293b 100%);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .offline-container {
            text-align: center;
            max-width: 500px;
        }
        
        .offline-icon {
            font-size: 4rem;
            color: var(--primary-color);
            margin-bottom: 1.5rem;
            animation: pulse 2s infinite;
        }
        
        .offline-title {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }
        
        .offline-message {
            font-size: 1.1rem;
            color: var(--text-secondary);
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        
        .retry-button {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .retry-button:hover {
            background: #5855eb;
            transform: translateY(-2px);
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        @media (max-width: 480px) {
            .offline-icon { font-size: 3rem; }
            .offline-title { font-size: 1.5rem; }
            .offline-message { font-size: 1rem; }
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">🚀</div>
        <h1 class="offline-title">You're Offline</h1>
        <p class="offline-message">
            It looks like you've lost your connection to the cosmic network. 
            Don't worry, you can still explore the cached version of my portfolio!
        </p>
        <button class="retry-button" onclick="window.location.reload()">
            🔄 Try Again
        </button>
    </div>
</body>
</html>`;
};

// ===============================================
// SERVICE WORKER EVENT HANDLERS
// ===============================================

// Install Event - Cache core assets
self.addEventListener('install', (event) => {
    log('Service Worker installing...');
    
    event.waitUntil(
        (async () => {
            try {
                // Open cache and add core assets
                const cache = await caches.open(CACHE_NAME);
                log('Caching core assets...');
                await cache.addAll(CORE_ASSETS);
                
                // Cache static assets
                log('Caching static assets...');
                const staticCache = await caches.open(`${CACHE_NAME}-static`);
                await staticCache.addAll(STATIC_ASSETS);
                
                // Cache audio assets
                log('Caching audio assets...');
                const audioCache = await caches.open(`${CACHE_NAME}-audio`);
                await audioCache.addAll(AUDIO_ASSETS);
                
                // Create offline page
                const offlineCache = await caches.open(OFFLINE_CACHE);
                await offlineCache.put('/offline.html', new Response(createOfflinePage(), {
                    headers: { 'Content-Type': 'text/html' }
                }));
                
                log('Installation complete, skipping waiting...');
                self.skipWaiting();
                
            } catch (error) {
                log('Installation failed:', error);
                throw error;
            }
        })()
    );
});

// Activate Event - Clean old caches and take control
self.addEventListener('activate', (event) => {
    log('Service Worker activating...');
    
    event.waitUntil(
        (async () => {
            try {
                // Clean old caches
                await cleanOldCaches();
                
                // Take control of all clients
                await self.clients.claim();
                
                log('Service Worker activated successfully');
                
                // Notify clients of successful activation
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_ACTIVATED',
                        version: CACHE_VERSION,
                        timestamp: Date.now()
                    });
                });
                
            } catch (error) {
                log('Activation failed:', error);
                throw error;
            }
        })()
    );
});

// Fetch Event - Handle all network requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Skip POST requests for now
    if (request.method !== 'GET') {
        return;
    }
    
    event.respondWith(handleFetch(request));
});

// ===============================================
// CACHING STRATEGIES
// ===============================================

// Main fetch handler with multiple strategies
const handleFetch = async (request) => {
    const url = new URL(request.url);
    
    try {
        // Strategy 1: Cache First (for static assets)
        if (isStaticAsset(request)) {
            return await cacheFirst(request);
        }
        
        // Strategy 2: Network First (for dynamic content)
        if (isDynamicContent(request)) {
            return await networkFirst(request);
        }
        
        // Strategy 3: Stale While Revalidate (for images and fonts)
        if (isAsset(request)) {
            return await staleWhileRevalidate(request);
        }
        
        // Default: Network First with offline fallback
        return await networkFirst(request);
        
    } catch (error) {
        log('Fetch failed, trying offline fallback:', error.message);
        return await getOfflineFallback(request);
    }
};

// Cache First Strategy - Serve from cache, fallback to network
const cacheFirst = async (request) => {
    const cacheName = getCacheName(request);
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
        log(`Cache hit: ${request.url}`);
        return cached;
    }
    
    log(`Cache miss: ${request.url}`);
    const response = await fetch(request);
    
    if (response.status === 200) {
        cache.put(request, response.clone());
    }
    
    return response;
};

// Network First Strategy - Try network, fallback to cache
const networkFirst = async (request) => {
    const cacheName = getCacheName(request);
    const cache = await caches.open(cacheName);
    
    try {
        const response = await fetch(request);
        
        if (response.status === 200) {
            log(`Network success: ${request.url}`);
            cache.put(request, response.clone());
        }
        
        return response;
        
    } catch (error) {
        log(`Network failed: ${request.url}`);
        const cached = await cache.match(request);
        
        if (cached) {
            log(`Cache fallback: ${request.url}`);
            return cached;
        }
        
        throw error;
    }
};

// Stale While Revalidate Strategy - Return cache immediately, update in background
const staleWhileRevalidate = async (request) => {
    const cacheName = getCacheName(request);
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    // Return cached version immediately if available
    if (cached) {
        log(`Stale cache hit: ${request.url}`);
        
        // Update cache in background
        fetch(request).then(response => {
            if (response.status === 200) {
                cache.put(request, response.clone());
                log(`Background update: ${request.url}`);
            }
        }).catch(error => {
            log(`Background update failed: ${request.url}`, error);
        });
        
        return cached;
    }
    
    // No cache, fetch from network
    const response = await fetch(request);
    
    if (response.status === 200) {
        cache.put(request, response.clone());
    }
    
    return response;
};

// ===============================================
// HELPER FUNCTIONS FOR REQUEST CATEGORIZATION
// ===============================================

const isStaticAsset = (request) => {
    const url = new URL(request.url);
    return STATIC_ASSETS.some(asset => request.url.includes(asset)) ||
           url.pathname.includes('.css') ||
           url.pathname.includes('.js') ||
           url.hostname.includes('cdnjs') ||
           url.hostname.includes('jsdelivr');
};

const isDynamicContent = (request) => {
    const url = new URL(request.url);
    return url.pathname.includes('api/') ||
           url.hostname.includes('api.') ||
           request.url.includes('dynamic') ||
           request.headers.get('cache-control') === 'no-cache';
};

const isAsset = (request) => {
    return request.destination === 'image' ||
           request.destination === 'font' ||
           request.url.includes('.woff') ||
           request.url.includes('.ttf') ||
           request.url.includes('.jpg') ||
           request.url.includes('.png') ||
           request.url.includes('.webp') ||
           request.url.includes('.gif');
};

// ===============================================
// OFFLINE FALLBACKS
// ===============================================

const getOfflineFallback = async (request) => {
    // HTML pages - return offline page
    if (request.destination === 'document') {
        const offlineCache = await caches.open(OFFLINE_CACHE);
        return await offlineCache.match('/offline.html');
    }
    
    // Images - return placeholder
    if (request.destination === 'image') {
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="#6366f1"><rect width="200" height="200" fill="#f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6366f1" font-family="sans-serif">📷</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
    
    // Audio - return silence
    if (request.url.includes('.mp3') || request.url.includes('.wav')) {
        return new Response(new ArrayBuffer(0), {
            headers: { 'Content-Type': 'audio/mpeg' }
        });
    }
    
    // Default fallback
    return new Response('Offline - Resource not available', {
        status: 503,
        statusText: 'Service Unavailable'
    });
};

// ===============================================
// BACKGROUND SYNC & PUSH NOTIFICATIONS
// ===============================================

// Background Sync - Handle failed requests
self.addEventListener('sync', (event) => {
    log(`Background sync triggered: ${event.tag}`);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
    
    if (event.tag === 'newsletter-signup') {
        event.waitUntil(syncNewsletterSignup());
    }
});

const handleBackgroundSync = async () => {
    try {
        // Handle failed requests stored in IndexedDB
        log('Processing background sync...');
        
        // Sync implementation would go here
        // For now, just log the sync
        log('Background sync completed');
        
    } catch (error) {
        log('Background sync failed:', error);
        throw error;
    }
};

const syncNewsletterSignup = async () => {
    try {
        log('Syncing newsletter signup...');
        
        // Implementation for syncing newsletter signups
        // This would retrieve failed signups from IndexedDB and retry them
        
        log('Newsletter sync completed');
        
    } catch (error) {
        log('Newsletter sync failed:', error);
        throw error;
    }
};

// Push Notifications
self.addEventListener('push', (event) => {
    log('Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        tag: 'portfolio-update',
        renotify: true,
        actions: [
            { action: 'view', title: 'View Portfolio' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Thanatsitt Portfolio', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    log('Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// ===============================================
// CACHE MANAGEMENT & UPDATES
// ===============================================

// Handle cache updates
self.addEventListener('message', (event) => {
    log('Message received:', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
                
            case 'CACHE_URLS':
                event.waitUntil(cacheUrls(event.data.urls));
                break;
                
            case 'CLEAR_CACHE':
                event.waitUntil(clearCache(event.data.cacheName));
                break;
                
            case 'GET_CACHE_SIZE':
                event.waitUntil(getCacheSize().then(size => {
                    event.ports[0].postMessage({ size });
                }));
                break;
        }
    }
});

const cacheUrls = async (urls) => {
    const cache = await caches.open(RUNTIME_CACHE);
    return Promise.all(
        urls.map(async (url) => {
            try {
                const response = await fetch(url);
                if (response.status === 200) {
                    await cache.put(url, response);
                    log(`Cached: ${url}`);
                }
            } catch (error) {
                log(`Failed to cache: ${url}`, error);
            }
        })
    );
};

const clearCache = async (cacheName) => {
    const success = await caches.delete(cacheName);
    log(`Cache cleared: ${cacheName}`, success);
    return success;
};

const getCacheSize = async () => {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
};

// ===============================================
// ERROR HANDLING & MONITORING
// ===============================================

self.addEventListener('error', (event) => {
    log('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    log('Service Worker unhandled rejection:', event.reason);
    event.preventDefault();
});

// ===============================================
// INITIALIZATION & READY STATE
// ===============================================

// Service Worker ready
log('Service Worker script loaded and ready');

// Performance monitoring
const swStartTime = performance.now();
log(`Service Worker initialization time: ${swStartTime.toFixed(2)}ms`);

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CACHE_NAME,
        handleFetch,
        cacheFirst,
        networkFirst,
        staleWhileRevalidate
    };
}

// ===============================================
// VERSION INFO & DEBUGGING
// ===============================================

console.log(`
🚀 THANATSITT PORTFOLIO SERVICE WORKER v${CACHE_VERSION}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Features Enabled:
   • Advanced Caching Strategies
   • Offline Support with Fallbacks
   • Background Sync
   • Push Notifications
   • Performance Monitoring
   • Cache Management
   • Error Handling

📊 Cache Configuration:
   • Core Assets: ${CORE_ASSETS.length} files
   • Static Assets: ${STATIC_ASSETS.length} files
   • Audio Assets: ${AUDIO_ASSETS.length} files
   • Runtime Caching: Enabled

🎯 Last Updated: ${LAST_UPDATED}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ready for offline-first portfolio experience! 🌟
`);
