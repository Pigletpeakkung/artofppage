// Service Worker for PegeArts Portfolio
const CACHE_NAME = 'pegearts-v1.0.0';
const STATIC_CACHE = 'pegearts-static-v1.0.0';
const DYNAMIC_CACHE = 'pegearts-dynamic-v1.0.0';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/js/main.js',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Cache size limits
const CACHE_SIZE_LIMIT = 50;

// Install event
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Precaching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(err => {
                console.error('[SW] Error precaching assets:', err);
            })
    );
    
    // Force activation
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control immediately
    self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle different types of requests
    if (request.method === 'GET') {
        if (STATIC_ASSETS.includes(request.url) || request.url.includes('/assets/')) {
            // Cache first strategy for static assets
            event.respondWith(cacheFirst(request));
        } else if (request.url.includes('api') || request.url.includes('contact')) {
            // Network first for API calls
            event.respondWith(networkFirst(request));
        } else if (request.destination === 'image') {
            // Cache first for images
            event.respondWith(cacheFirst(request));
        } else {
            // Network first for other requests
            event.respondWith(networkFirst(request));
        }
    }
});

// Cache first strategy
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache first failed:', error);
        return getOfflineFallback(request);
    }
}

// Network first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            limitCacheSize(DYNAMIC_CACHE, CACHE_SIZE_LIMIT);
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Network first failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return getOfflineFallback(request);
    }
}

// Limit cache size
async function limitCacheSize(cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxSize) {
        const keysToDelete = keys.slice(0, keys.length - maxSize);
        await Promise.all(keysToDelete.map(key => cache.delete(key)));
    }
}

// Offline fallback
function getOfflineFallback(request) {
    if (request.destination === 'document') {
        return caches.match('/');
    }
    
    if (request.destination === 'image') {
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image unavailable</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
    
    return new Response('Content unavailable offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
    });
}

// Background sync (if supported)
self.addEventListener('sync', event => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(syncContactForm());
    }
});

// Sync contact form data
async function syncContactForm() {
    try {
        // Retrieve stored form data
        const formData = await getStoredFormData();
        
        if (formData) {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                clearStoredFormData();
                notifyUser('Message sent successfully!');
            }
        }
    } catch (error) {
        console.error('[SW] Sync failed:', error);
    }
}

// Push notification handler
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        tag: data.tag || 'default',
        actions: data.actions || [],
        data: data.data || {}
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    const action = event.action;
    const data = event.notification.data;
    
    let url = '/';
    
    if (action === 'view_portfolio') {
        url = '/#portfolio';
    } else if (action === 'contact') {
        url = '/#contact';
    } else if (data.url) {
        url = data.url;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            // Check if portfolio is already open
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Message handler for communication with main thread
self.addEventListener('message', event => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_URLS':
            event.waitUntil(cacheUrls(data.urls));
            break;
            
        case 'CLEAR_CACHE':
            event.waitUntil(clearCaches());
            break;
    }
});

// Cache specific URLs
async function cacheUrls(urls) {
    const cache = await caches.open(DYNAMIC_CACHE);
    return cache.addAll(urls);
}

// Clear all caches
async function clearCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(cacheNames.map(name => caches.delete(name)));
}

// Utility functions for IndexedDB operations
async function getStoredFormData() {
    // Implementation depends on your IndexedDB setup
    return null;
}

async function clearStoredFormData() {
    // Implementation depends on your IndexedDB setup
}

function notifyUser(message) {
    self.registration.showNotification('PegeArts Portfolio', {
        body: message,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        tag: 'notification'
    });
}

// Performance monitoring
self.addEventListener('fetch', event => {
    const startTime = performance.now();
    
    event.respondWith(
        handleRequest(event.request).then(response => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Log slow requests
            if (duration > 1000) {
                console.warn(`[SW] Slow request detected: ${event.request.url} took ${duration}ms`);
            }
            
            return response;
        })
    );
});

async function handleRequest(request) {
    // Your existing fetch handling logic
    return fetch(request);
}

console.log('[SW] Service Worker loaded successfully');
