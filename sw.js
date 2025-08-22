// ===== ENHANCED SERVICE WORKER FOR THANATSITT PORTFOLIO 2025 =====

const CACHE_NAME = 'thanatsitt-portfolio-v2.0.0';
const STATIC_CACHE = 'thanatsitt-static-v2.0.0';
const DYNAMIC_CACHE = 'thanatsitt-dynamic-v2.0.0';
const IMAGE_CACHE = 'thanatsitt-images-v2.0.0';

// Assets to cache immediately on install
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/css/main.css',
    '/assets/js/main.js',
    '/assets/images/data/profile/1755844218313.jpg',
    '/favicon.ico',
    '/apple-touch-icon.png'
];

// External resources to cache
const EXTERNAL_ASSETS = [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css',
    'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js',
    'https://cdnjs.cloudflare.com/ajax/libs/typed.js/2.1.0/typed.umd.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap'
];

// Assets that should be cached on demand
const CACHE_ON_DEMAND = [
    '/assets/images/',
    '/assets/audio/',
    '/assets/fonts/',
    '/assets/demo/'
];

// Network timeout for fallback
const NETWORK_TIMEOUT = 3000;

// Install event - Cache core assets
self.addEventListener('install', event => {
    console.log('🚀 Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache core assets
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Caching core assets...');
                return cache.addAll(CORE_ASSETS);
            }),
            
            // Cache external resources with error handling
            caches.open(STATIC_CACHE).then(cache => {
                console.log('🌐 Caching external resources...');
                return Promise.allSettled(
                    EXTERNAL_ASSETS.map(url => 
                        cache.add(url).catch(err => {
                            console.warn(`Failed to cache ${url}:`, err);
                            return null;
                        })
                    )
                );
            })
        ]).then(() => {
            console.log('✅ Service Worker installation complete');
            return self.skipWaiting();
        }).catch(err => {
            console.error('❌ Service Worker installation failed:', err);
        })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
    console.log('🔄 Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old versions of caches
                    if (cacheName !== STATIC_CACHE && 
                        cacheName !== DYNAMIC_CACHE && 
                        cacheName !== IMAGE_CACHE &&
                        (cacheName.startsWith('thanatsitt-') || cacheName.startsWith('workbox-'))) {
                        console.log(`🗑️ Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - Smart caching strategy
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Different strategies for different types of requests
    if (isNavigationRequest(request)) {
        // HTML pages - Network first with cache fallback
        event.respondWith(handleNavigationRequest(request));
    } else if (isStaticAsset(request)) {
        // CSS, JS, Fonts - Cache first with network fallback
        event.respondWith(handleStaticAsset(request));
    } else if (isImageRequest(request)) {
        // Images - Cache first with network fallback and optimization
        event.respondWith(handleImageRequest(request));
    } else if (isExternalResource(request)) {
        // External CDN resources - Cache first with network fallback
        event.respondWith(handleExternalResource(request));
    } else {
        // Everything else - Network first with cache fallback
        event.respondWith(handleGenericRequest(request));
    }
});

// Helper Functions

function isNavigationRequest(request) {
    return request.mode === 'navigate' || 
           (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/i);
}

function isImageRequest(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i);
}

function isExternalResource(request) {
    const url = new URL(request.url);
    return !url.hostname.includes('pegearts.com') && 
           !url.hostname.includes('localhost') &&
           (url.hostname.includes('googleapis.com') || 
            url.hostname.includes('cdnjs.cloudflare.com') ||
            url.hostname.includes('cdn.jsdelivr.net') ||
            url.hostname.includes('unpkg.com'));
}

// Navigation Request Handler (Network First)
async function handleNavigationRequest(request) {
    try {
        // Try network first with timeout
        const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
            )
        ]);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (err) {
        console.log('🌐 Network failed, trying cache for:', request.url);
        
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Ultimate fallback - offline page or main page
        const offlineResponse = await caches.match('/') || 
                              await caches.match('/index.html');
        if (offlineResponse) {
            return offlineResponse;
        }
        
        // Return a basic offline response
        return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline - Thanatsitt Portfolio</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                           display: flex; align-items: center; justify-content: center; 
                           min-height: 100vh; margin: 0; background: #f9fafb; color: #111827; }
                    .offline-message { text-align: center; max-width: 400px; }
                    h1 { color: #6366f1; margin-bottom: 1rem; }
                    p { margin-bottom: 1.5rem; line-height: 1.6; }
                    button { background: #6366f1; color: white; border: none; padding: 0.75rem 1.5rem; 
                            border-radius: 0.5rem; cursor: pointer; font-size: 1rem; }
                    button:hover { background: #4f46e5; }
                </style>
            </head>
            <body>
                <div class="offline-message">
                    <h1>You're Offline</h1>
                    <p>It looks like you're not connected to the internet. Please check your connection and try again.</p>
                    <button onclick="window.location.reload()">Try Again</button>
                </div>
            </body>
            </html>`,
            {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
}

// Static Asset Handler (Cache First)
async function handleStaticAsset(request) {
    try {
        // Check cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fetch from network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (err) {
        console.error('❌ Failed to fetch static asset:', request.url, err);
        throw err;
    }
}

// Image Request Handler (Cache First with Optimization)
async function handleImageRequest(request) {
    try {
        // Check cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fetch from network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(IMAGE_CACHE);
            
            // Clone response for caching
            const responseToCache = networkResponse.clone();
            
            // Cache with size limit check
            const contentLength = responseToCache.headers.get('content-length');
            const maxSize = 5 * 1024 * 1024; // 5MB limit
            
            if (!contentLength || parseInt(contentLength) < maxSize) {
                cache.put(request, responseToCache);
            }
        }
        
        return networkResponse;
    } catch (err) {
        console.error('❌ Failed to fetch image:', request.url, err);
        
        // Return placeholder image for failed image requests
        return new Response(
            `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f3f4f6"/>
                <text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">
                    Image unavailable
                </text>
            </svg>`,
            {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'image/svg+xml' }
            }
        );
    }
}

// External Resource Handler (Cache First)
async function handleExternalResource(request) {
    try {
        // Check cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fetch from network with shorter timeout for external resources
        const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('External resource timeout')), 2000)
            )
        ]);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (err) {
        console.warn('⚠️ External resource failed:', request.url);
        
        // For CSS/JS external resources, return empty response to prevent page breaking
        if (request.url.includes('.css')) {
            return new Response('/* External CSS unavailable */', {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'text/css' }
            });
        } else if (request.url.includes('.js')) {
            return new Response('// External JS unavailable', {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'application/javascript' }
            });
        }
        
        throw err;
    }
}

// Generic Request Handler (Network First)
async function handleGenericRequest(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful GET responses
        if (networkResponse.ok && request.method === 'GET') {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (err) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw err;
    }
}

// Background Sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'contact-form') {
        event.waitUntil(syncContactForm());
    }
});

async function syncContactForm() {
    try {
        // Handle offline form submissions when back online
        const forms = await getOfflineFormSubmissions();
        for (const form of forms) {
            await submitContactForm(form);
        }
        await clearOfflineFormSubmissions();
    } catch (err) {
        console.error('❌ Failed to sync contact forms:', err);
    }
}

// Push notification handler
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/icon-72x72.png',
            tag: 'portfolio-notification',
            requireInteraction: true,
            actions: [
                {
                    action: 'view',
                    title: 'View Portfolio'
                },
                {
                    action: 'close',
                    title: 'Close'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Periodic background sync for updates
self.addEventListener('periodicsync', event => {
    if (event.tag === 'portfolio-update') {
        event.waitUntil(checkForUpdates());
    }
});

async function checkForUpdates() {
    try {
        // Check for portfolio updates
        const response = await fetch('/api/version');
        const data = await response.json();
        
        if (data.version !== CACHE_NAME) {
            // Notify about updates
            self.registration.showNotification('Portfolio Updated!', {
                body: 'New features and content are available.',
                icon: '/assets/icons/icon-192x192.png',
                tag: 'update-notification'
            });
        }
    } catch (err) {
        console.log('Update check failed:', err);
    }
}

// Cache management - cleanup old entries
async function cleanupCaches() {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
        if (cacheName.startsWith('thanatsitt-')) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            
            // Remove entries older than 30 days
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            
            for (const request of requests) {
                const response = await cache.match(request);
                const dateHeader = response.headers.get('date');
                
                if (dateHeader && new Date(dateHeader).getTime() < thirtyDaysAgo) {
                    await cache.delete(request);
                }
            }
        }
    }
}

// Run cleanup periodically
setInterval(cleanupCaches, 24 * 60 * 60 * 1000); // Daily cleanup

// Helper functions for IndexedDB operations (for offline form storage)
async function getOfflineFormSubmissions() {
    // Implementation would depend on your IndexedDB setup
    return [];
}

async function submitContactForm(formData) {
    // Implementation for submitting cached form data
    return fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
}

async function clearOfflineFormSubmissions() {
    // Clear stored offline submissions after successful sync
}

console.log('🎯 Service Worker loaded successfully - Thanatsitt Portfolio v2.0.0');
