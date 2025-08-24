/**
 * ✅ Enhanced Service Worker for WCAG-Compliant Portfolio PWA
 * Features: Offline support, accessibility caching, performance optimization
 */

const CACHE_NAME = 'thanatsitt-portfolio-v1.0.0';
const CACHE_PREFIX = 'thanatsitt-pwa';
const ACCESSIBILITY_CACHE = `${CACHE_PREFIX}-accessibility`;
const STATIC_CACHE = `${CACHE_PREFIX}-static`;
const DYNAMIC_CACHE = `${CACHE_PREFIX}-dynamic`;

// ✅ Essential files for offline functionality
const STATIC_ASSETS = [
  '/',
  '/site.webmanifest',
  '/browserconfig.xml',
  
  // CSS Files
  '/assets/css/styles.css',
  
  // JavaScript Files
  '/assets/js/script.js',
  
  // Essential External Libraries (CDN fallbacks)
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  
  // Essential JavaScript Libraries
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js',
  'https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
  
  // Essential Images
  'https://github.com/Pigletpeakkung/artofppage/raw/74ef50ce6221cc36848c31580fd8c1f8bea38fb6/assets/images/data/profile/1755844218313.jpg',
  'https://github.com/Pigletpeakkung/artofppage/raw/de951d75e32a77c8f18f95ec69d9219c332a783a/assets/icons/favicon.svg',
  
  // Essential Fonts
  'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap'
];

// ✅ Accessibility-specific resources
const ACCESSIBILITY_ASSETS = [
  // Voice demos for offline access
  'https://github.com/Pigletpeakkung/artofppage/raw/feb49ee7640dd7d8aa8ece40bbd8258b69ef1e98/assets/demo/voice/intro/Thann_Intro.wav',
  'https://github.com/Pigletpeakkung/artofppage/raw/92520ec59362efa20d141a2b031dbb40d28f4f3a/assets/demo/voice/act/Thanattsitt-Hobby-Freetalk.mp3'
];

// ✅ Service Worker Installation
self.addEventListener('install', (event) => {
  console.log('🌟 WCAG-Compliant Portfolio SW: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache accessibility assets
      caches.open(ACCESSIBILITY_CACHE).then((cache) => {
        console.log('♿ Caching accessibility assets...');
        return cache.addAll(ACCESSIBILITY_ASSETS);
      })
    ]).then(() => {
      console.log('✅ SW Installation complete');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('❌ SW Installation failed:', error);
    })
  );
});

// ✅ Service Worker Activation
self.addEventListener('activate', (event) => {
  console.log('🚀 WCAG-Compliant Portfolio SW: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== STATIC_CACHE && 
                cacheName !== ACCESSIBILITY_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('✅ SW Activation complete');
      
      // Notify clients about accessibility features
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            features: {
              offlineSupport: true,
              accessibilityCache: true,
              voiceDemosOffline: true,
              reducedMotion: false // Will be detected by client
            }
          });
        });
      });
    })
  );
});

// ✅ Enhanced Fetch Strategy with Accessibility Focus
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isAccessibilityAsset(request.url)) {
    event.respondWith(cacheFirst(request, ACCESSIBILITY_CACHE));
  } else if (isAPIRequest(url)) {
    event.respondWith(networkFirst(request));
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// ✅ Cache-First Strategy (for static assets)
async function cacheFirst(request, cacheName) {
  try {
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
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    return getOfflineFallback(request);
  }
}

// ✅ Network-First Strategy (for API calls)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return getOfflineFallback(request);
  }
}

// ✅ Stale-While-Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// ✅ Offline Fallbacks with Accessibility Support
function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  if (request.destination === 'document') {
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Thanatsitt Portfolio</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            text-align: center;
            padding: 20px;
          }
          .offline-content {
            max-width: 500px;
          }
          .offline-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
        </style>
      </head>
      <body>
        <div class="offline-content" role="main" aria-labelledby="offline-title">
          <div class="offline-icon" aria-hidden="true">📡</div>
          <h1 id="offline-title">You're Offline</h1>
          <p>Don't worry! This WCAG-compliant portfolio works offline too.</p>
          <p>Voice demos and key content are cached and available.</p>
          <button onclick="window.location.reload()" 
                  style="background: white; color: #6366f1; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem;">
            Try Again
          </button>
          <div class="sr-only" aria-live="polite">
            You are currently offline. Cached content is available for browsing.
          </div>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  if (request.destination === 'image') {
    return new Response(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="offline-image-title">
        <title id="offline-image-title">Image unavailable offline</title>
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="system-ui, sans-serif" font-size="14">
          Image unavailable offline
        </text>
      </svg>
    `, {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
  
  return new Response('Offline content not available', { 
    status: 503, 
    statusText: 'Service Unavailable' 
  });
}

// ✅ Helper Functions
function isStaticAsset(url) {
  return STATIC_ASSETS.includes(url) || 
         url.includes('/assets/') ||
         url.includes('bootstrap') ||
         url.includes('font-awesome') ||
         url.includes('aos') ||
         url.includes('swiper') ||
         url.includes('particles');
}

function isAccessibilityAsset(url) {
  return ACCESSIBILITY_ASSETS.includes(url) ||
         url.includes('.wav') ||
         url.includes('.mp3') ||
         url.includes('voice') ||
         url.includes('demo');
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         url.pathname.startsWith('/contact/') ||
         url.hostname.includes('api.');
}

function isImageRequest(request) {
  return request.destination === 'image' ||
         request.url.includes('.jpg') ||
         request.url.includes('.jpeg') ||
         request.url.includes('.png') ||
         request.url.includes('.gif') ||
         request.url.includes('.webp') ||
         request.url.includes('.svg');
}

// ✅ Background Sync for Contact Forms
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  try {
    // Handle queued contact form submissions
    const queuedForms = await getQueuedContactForms();
    
    for (const form of queuedForms) {
      await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(form),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    await clearQueuedContactForms();
    console.log('✅ Contact forms synced successfully');
  } catch (error) {
    console.error('❌ Contact form sync failed:', error);
  }
}

// ✅ Push Notifications for Updates
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: 'https://github.com/Pigletpeakkung/artofppage/raw/de951d75e32a77c8f18f95ec69d9219c332a783a/assets/icons/icon-32x32.png',
      badge: 'https://github.com/Pigletpeakkung/artofppage/raw/de951d75e32a77c8f18f95ec69d9219c332a783a/assets/icons/icon-16x16.png',
      vibrate: [200, 100, 200],
      tag: 'portfolio-update',
      actions: [
        {
          action: 'view',
          title: 'View Update',
          icon: 'https://github.com/Pigletpeakkung/artofppage/raw/de951d75e32a77c8f18f95ec69d9219c332a783a/assets/icons/icon-16x16.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: 'https://github.com/Pigletpeakkung/artofppage/raw/de951d75e32a77c8f18f95ec69d9219c332a783a/assets/icons/icon-16x16.png'
        }
      ],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// ✅ Notification Click Handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// ✅ Utility Functions for IndexedDB (Contact Form Queue)
async function getQueuedContactForms() {
  // Implementation would use IndexedDB to store/retrieve queued forms
  return [];
}

async function clearQueuedContactForms() {
  // Implementation would clear IndexedDB queue
  return true;
}

console.log('🌟 WCAG-Compliant Portfolio Service Worker Loaded');
console.log('♿ Accessibility-focused PWA features active');
