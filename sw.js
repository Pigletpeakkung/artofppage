// ===============================================
// COMPLETE SERVICE WORKER FOR PORTFOLIO
// Version: 3.0 - Covers ALL Resources
// ===============================================

const CACHE_NAME = 'portfolio-v3.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const AUDIO_CACHE = `${CACHE_NAME}-audio`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;

// ===============================================
// COMPLETE RESOURCE LIST
// ===============================================
const STATIC_RESOURCES = [
  // 📄 Core HTML/CSS/JS
  '/',
  '/index.html',
  '/manifest.json',
  
  // 🎨 Stylesheets
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  
  // 🔤 Fonts
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
  'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2',
  'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2',
  
  // 📚 JavaScript Libraries
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
  'https://unpkg.com/aos@2.3.1/dist/aos.js',
  'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js',
  
  // 🎵 Audio Files
  'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/demo/voice/intro/Thann_Intro.wav',
  'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/projects/voice/narrative/thanattsitt-2033447-tha-4d5m7gd2g.mp3',
  
  // 🖼️ Images
  'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/images/data/profile/1755844218313.jpg',
  
  // 📱 PWA Icons (add these if you have them)
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico'
];

// Audio file extensions for special handling
const AUDIO_EXTENSIONS = ['.wav', '.mp3', '.ogg', '.m4a', '.aac'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
const FONT_EXTENSIONS = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];

// ===============================================
// INSTALL EVENT - Cache All Resources
// ===============================================
self.addEventListener('install', event => {
  console.log('🚀 Portfolio Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static resources...');
        return cache.addAll(STATIC_RESOURCES.map(url => new Request(url, {
          cache: 'no-cache',
          mode: 'cors'
        })));
      }),
      
      // Initialize other caches
      caches.open(AUDIO_CACHE),
      caches.open(IMAGE_CACHE),
      caches.open(DYNAMIC_CACHE)
      
    ]).then(() => {
      console.log('✅ All resources cached successfully');
      self.skipWaiting();
    }).catch(error => {
      console.error('❌ Caching failed:', error);
      // Don't fail completely, some resources might be unavailable
      self.skipWaiting();
    })
  );
});

// ===============================================
// ACTIVATE EVENT - Clean Old Caches
// ===============================================
self.addEventListener('activate', event => {
  console.log('🔄 Portfolio Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.startsWith(CACHE_NAME)) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
      
    ]).then(() => {
      console.log('✅ Service Worker activated successfully');
      
      // Notify clients about activation
      return self.clients.matchAll();
    }).then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          message: '🎉 Portfolio is now available offline!'
        });
      });
    })
  );
});

// ===============================================
// FETCH EVENT - Smart Caching Strategy
// ===============================================
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) return;
  
  event.respondWith(handleRequest(request));
});

// ===============================================
// SMART REQUEST HANDLER
// ===============================================
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Audio files (Cache First with special handling)
    if (isAudioRequest(request)) {
      return await handleAudioRequest(request);
    }
    
    // Strategy 2: Images (Cache First)
    if (isImageRequest(request)) {
      return await handleImageRequest(request);
    }
    
    // Strategy 3: Fonts (Cache First)
    if (isFontRequest(request)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 4: JavaScript Libraries (Stale While Revalidate)
    if (isJavaScriptLibrary(request)) {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }
    
    // Strategy 5: CSS Libraries (Stale While Revalidate)
    if (isCSSLibrary(request)) {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }
    
    // Strategy 6: GitHub Raw Content (Cache First)
    if (url.hostname === 'raw.githubusercontent.com') {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 7: Google Fonts (Stale While Revalidate)
    if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }
    
    // Strategy 8: CDN Resources (Stale While Revalidate)
    if (isCDNRequest(request)) {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }
    
    // Strategy 9: Same Origin (Network First)
    if (url.origin === self.location.origin) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Strategy 10: Everything else (Network First)
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('❌ Request failed:', request.url, error);
    return await handleFailedRequest(request, error);
  }
}

// ===============================================
// CACHING STRATEGIES
// ===============================================

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse && networkResponse.status === 200) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// ===============================================
// SPECIALIZED HANDLERS
// ===============================================

// Audio Request Handler
async function handleAudioRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(AUDIO_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Audio network response not ok');
  } catch (error) {
    // Return audio placeholder or error response
    return new Response('', {
      status: 404,
      statusText: 'Audio not available offline'
    });
  }
}

// Image Request Handler
async function handleImageRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Image network response not ok');
  } catch (error) {
    // Return placeholder image
    return createImagePlaceholder();
  }
}

// Failed Request Handler
async function handleFailedRequest(request, error) {
  const url = new URL(request.url);
  
  // Handle navigation requests (pages)
  if (request.mode === 'navigate') {
    const cachedResponse = await caches.match('/') || await caches.match('/index.html');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return createOfflinePage();
  }
  
  // Handle image requests
  if (isImageRequest(request)) {
    return createImagePlaceholder();
  }
  
  // Handle audio requests
  if (isAudioRequest(request)) {
    return new Response('', {
      status: 404,
      statusText: 'Audio not available offline'
    });
  }
  
  // For other requests, try to find any cached version
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  throw error;
}

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

// Request Type Checkers
function isAudioRequest(request) {
  const url = new URL(request.url);
  return AUDIO_EXTENSIONS.some(ext => url.pathname.includes(ext)) ||
         request.destination === 'audio';
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return IMAGE_EXTENSIONS.some(ext => url.pathname.includes(ext)) ||
         request.destination === 'image';
}

function isFontRequest(request) {
  const url = new URL(request.url);
  return FONT_EXTENSIONS.some(ext => url.pathname.includes(ext)) ||
         request.destination === 'font';
}

function isJavaScriptLibrary(request) {
  const url = new URL(request.url);
  return url.pathname.includes('.js') && (
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('jsdelivr.net')
  );
}

function isCSSLibrary(request) {
  const url = new URL(request.url);
  return url.pathname.includes('.css') && (
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('jsdelivr.net')
  );
}

function isCDNRequest(request) {
  const url = new URL(request.url);
  return url.hostname.includes('cdn') ||
         url.hostname.includes('unpkg.com') ||
         url.hostname.includes('jsdelivr.net') ||
         url.hostname.includes('cdnjs.cloudflare.com');
}

// Placeholder Creators
function createImagePlaceholder() {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8b5cf6"/>
          <stop offset="100%" style="stop-color:#ec4899"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" opacity="0.1"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
            font-family="system-ui" font-size="16" fill="#8b5cf6">
        📸 Image Unavailable Offline
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache'
    }
  });
}

function createOfflinePage() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Portfolio</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          text-align: center;
          padding: 2rem;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          margin: 0;
        }
        .offline-container {
          max-width: 500px;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
        .offline-title { font-size: 2rem; margin-bottom: 1rem; font-weight: 600; }
        .offline-message { font-size: 1.1rem; opacity: 0.9; line-height: 1.6; }
        .retry-btn {
          margin-top: 2rem;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50px;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .retry-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">🌐</div>
        <h1 class="offline-title">You're Offline</h1>
        <p class="offline-message">
          Don't worry! You can still browse the cached version of the portfolio. 
          Some features like voice demos and external links may not work until you're back online.
        </p>
        <button class="retry-btn" onclick="location.reload()">
          🔄 Try Again
        </button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

// ===============================================
// BACKGROUND SYNC & MESSAGING
// ===============================================

// Handle messages from main thread
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'PRELOAD_AUDIO':
      preloadAudio(payload.urls).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

// Get cache status
async function getCacheStatus() {
  const caches_list = await caches.keys();
  const status = {};
  
  for (const cacheName of caches_list) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }
  
  return status;
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('🗑️ All caches cleared');
}

// Preload audio files
async function preloadAudio(urls) {
  const cache = await caches.open(AUDIO_CACHE);
  await Promise.all(urls.map(url => {
    return fetch(url).then(response => {
      if (response.ok) {
        return cache.put(url, response);
      }
    }).catch(error => {
      console.warn('Failed to preload audio:', url, error);
    });
  }));
}

console.log('🚀 Complete Portfolio Service Worker loaded successfully!');
