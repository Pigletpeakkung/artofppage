// sw.js - Service Worker for Thanatsitt Portfolio PWA
// Version: 2.1.0
// Author: Thanatsitt Santisamranwilai
// Updated: 2025-08-22

const CACHE_NAME = 'thanatsitt-portfolio-v2.1.0';
const CACHE_VERSION = '2.1.0';
const APP_PREFIX = 'thanatsitt-pwa';

// Define caching strategies for different resource types
const CACHE_STRATEGIES = {
    // Critical resources - cache first, update in background
    critical: [
        '/',
        '/index.html',
        '/manifest.json',
        'assets/images/data/profile/1755844218313.jpg',
        'assets/demo/voice/intro/Thann_Intro.wav'
    ],
    
    // Static assets - cache with versioning
    static: [
        // CSS files
        '/assets/css/styles.css',
        '/assets/css/styles.min.css',
        
        // JavaScript files
        '/assets/js/main.js',
        '/assets/js/app.js',
        '/assets/js/bundle.min.js',
        
        // Images
        '/assets/images/',
        '/assets/icons/',
        
        // Fonts
        '/assets/fonts/',
        
        // Offline page
        '/offline.html'
    ],
    
    // CDN resources - network first with cache fallback
    cdn: [
        'https://cdn.jsdelivr.net/',
        'https://cdnjs.cloudflare.com/',
        'https://fonts.googleapis.com/',
        'https://fonts.gstatic.com/',
        'https://unpkg.com/'
    ],
    
    // API or dynamic content - network only
    dynamic: [
        '/api/',
        '/auth/',
        '/analytics/'
    ]
};

// Resources to precache on install
const PRECACHE_RESOURCES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/offline.html',
    'assets/images/data/profile/1755844218313.jpg',
    // Fallback for GitHub URLs
    'https://github.com/Pigletpeakkung/artofppage/blob/dc1ca7a25990549cd908472ee93d5a3330597cd2/assets/images/data/profile/1755844218313.jpg',
    'https://github.com/Pigletpeakkung/artofppage/blob/f7b2577e5dc8ae015893169968bc469f6528db5c/assets/demo/voice/intro/Thann_Intro.wav'
];

// Install event - precache critical resources
self.addEventListener('install', event => {
    console.log('🚀 Service Worker installing...', CACHE_VERSION);
    
    event.waitUntil(
        (async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                
                // Precache critical resources
                await cache.addAll(PRECACHE_RESOURCES.map(url => new Request(url, {
                    cache: 'reload' // Force fresh download
                })));
                
                console.log('✅ Critical resources cached successfully');
                
                // Skip waiting to activate immediately
                self.skipWaiting();
                
            } catch (error) {
                console.error('❌ Failed to cache resources during install:', error);
            }
        })()
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🔄 Service Worker activating...', CACHE_VERSION);
    
    event.waitUntil(
        (async () => {
            try {
                // Take control of all clients immediately
                await self.clients.claim();
                
                // Clean up old caches
                const cacheNames = await caches.keys();
                const oldCaches = cacheNames.filter(name => 
                    name.startsWith(APP_PREFIX) && name !== CACHE_NAME
                );
                
                await Promise.all(
                    oldCaches.map(cacheName => {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
                
                console.log('✅ Service Worker activated and old caches cleaned');
                
                // Notify all clients about the update
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_ACTIVATED',
                        version: CACHE_VERSION
                    });
                });
                
            } catch (error) {
                console.error('❌ Error during activation:', error);
            }
        })()
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(handleFetch(request));
});

// Main fetch handler with different strategies
async function handleFetch(request) {
    const url = new URL(request.url);
    
    try {
        // Strategy 1: Critical resources - Cache First
        if (shouldUseCacheFirst(url)) {
            return await cacheFirst(request);
        }
        
        // Strategy 2: CDN resources - Stale While Revalidate
        if (shouldUseStaleWhileRevalidate(url)) {
            return await staleWhileRevalidate(request);
        }
        
        // Strategy 3: Dynamic content - Network First
        if (shouldUseNetworkFirst(url)) {
            return await networkFirst(request);
        }
        
        // Strategy 4: Static assets - Cache First with fallback
        return await cacheFirstWithFallback(request);
        
    } catch (error) {
        console.error('Fetch failed:', error);
        return await handleFetchError(request);
    }
}

// Cache First strategy - for critical/static resources
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Update cache in background for next time
        fetch(request).then(response => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
        }).catch(() => {}); // Silent fail for background updates
        
        return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const response = await fetch(request);
    if (response.ok) {
        cache.put(request, response.clone());
    }
    return response;
}

// Network First strategy - for dynamic content
async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Stale While Revalidate strategy - for CDN resources
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Always fetch in background to update cache
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => {}); // Silent fail
    
    // Return cached version immediately, or wait for network
    return cachedResponse || fetchPromise;
}

// Cache First with fallback strategy
async function cacheFirstWithFallback(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return await cache.match('/offline.html') || 
                   new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        }
        throw error;
    }
}

// Error handler for failed fetches
async function handleFetchError(request) {
    const cache = await caches.open(CACHE_NAME);
    
    // Try to find any cached version
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // For navigation requests, show offline page
    if (request.mode === 'navigate') {
        const offlinePage = await cache.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
    }
    
    // Return a basic offline response
    return new Response(
        JSON.stringify({
            error: 'Offline',
            message: 'This content is not available offline'
        }),
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

// Helper functions to determine caching strategy
function shouldUseCacheFirst(url) {
    return CACHE_STRATEGIES.critical.some(pattern => 
        url.pathname === pattern || url.pathname.startsWith(pattern)
    ) || CACHE_STRATEGIES.static.some(pattern =>
        url.pathname.includes(pattern)
    );
}

function shouldUseStaleWhileRevalidate(url) {
    return CACHE_STRATEGIES.cdn.some(pattern => 
        url.origin.includes(pattern.replace('https://', '').replace('/', ''))
    );
}

function shouldUseNetworkFirst(url) {
    return CACHE_STRATEGIES.dynamic.some(pattern => 
        url.pathname.startsWith(pattern)
    );
}

// Background Sync for offline actions
self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'contact-form') {
        event.waitUntil(handleContactFormSync());
    }
    
    if (event.tag === 'analytics') {
        event.waitUntil(handleAnalyticsSync());
    }
});

// Handle contact form submissions when back online
async function handleContactFormSync() {
    try {
        // Retrieve offline contact form submissions from IndexedDB
        // This would integrate with your contact form implementation
        console.log('📧 Syncing offline contact form submissions...');
        
        // Implementation would go here based on your form structure
        
    } catch (error) {
        console.error('❌ Failed to sync contact forms:', error);
    }
}

// Handle analytics data when back online
async function handleAnalyticsSync() {
    try {
        console.log('📊 Syncing offline analytics data...');
        
        // Implementation for analytics sync would go here
        
    } catch (error) {
        console.error('❌ Failed to sync analytics:', error);
    }
}

// Push notification handling
self.addEventListener('push', event => {
    console.log('📱 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/badge-72.png',
        tag: 'portfolio-update',
        data: {
            url: '/'
        },
        actions: [
            {
                action: 'view',
                title: 'View Portfolio',
                icon: '/assets/icons/view-icon.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/assets/icons/dismiss-icon.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Thanatsitt Portfolio', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('🔔 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', event => {
    console.log('💬 Message received in SW:', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
                
            case 'CACHE_URLS':
                event.waitUntil(cacheUrls(event.data.urls));
                break;
                
            case 'GET_VERSION':
                event.ports[0].postMessage({
                    type: 'VERSION',
                    version: CACHE_VERSION
                });
                break;
                
            default:
                console.log('Unknown message type:', event.data.type);
        }
    }
});

// Cache additional URLs on demand
async function cacheUrls(urls) {
    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(urls);
        console.log('✅ Additional URLs cached:', urls);
    } catch (error) {
        console.error('❌ Failed to cache additional URLs:', error);
    }
}

// Periodic cleanup of old caches and data
self.addEventListener('periodicsync', event => {
    if (event.tag === 'cleanup') {
        event.waitUntil(performCleanup());
    }
});

async function performCleanup() {
    try {
        console.log('🧹 Performing periodic cleanup...');
        
        // Clean up old caches
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
            name.startsWith(APP_PREFIX) && name !== CACHE_NAME
        );
        
        await Promise.all(oldCaches.map(name => caches.delete(name)));
        
        console.log('✅ Periodic cleanup completed');
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    }
}

// Global error handler
self.addEventListener('error', event => {
    console.error('🚨 Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('🚨 Unhandled promise rejection in SW:', event.reason);
});

// Log service worker version on startup
console.log(`
🚀 Thanatsitt Portfolio Service Worker v${CACHE_VERSION}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Contact: thanattsitt.info@yahoo.co.uk
🌐 Website: https://pegearts.com
📂 Repository: https://github.com/Pigletpeakkung/artofppage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Features: Offline Support, Background Sync, Push Notifications
⚡ Caching: Multi-strategy approach for optimal performance
🔄 Version: ${CACHE_VERSION}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
