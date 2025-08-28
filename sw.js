// ===============================================
// COMPLETE PEGEARTS PORTFOLIO SERVICE WORKER
// Enhanced with Performance Optimizations & Smart Caching
// Version: 3.1 - Production Ready
// ===============================================

const CACHE_NAME = 'pegearts-complete-v3.1';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const AUDIO_CACHE = `${CACHE_NAME}-audio`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;
const PAGES_CACHE = `${CACHE_NAME}-pages`;
const DOCUMENTS_CACHE = `${CACHE_NAME}-documents`;

// ===============================================
// AUTO-DETECT HOSTING SETUP
// ===============================================
const CURRENT_DOMAIN = self.location.origin;
const IS_CUSTOM_DOMAIN = CURRENT_DOMAIN.includes('pegearts.com');
const IS_GITHUB_PAGES = CURRENT_DOMAIN.includes('github.io');

console.log(`🌐 Complete asset caching on: ${CURRENT_DOMAIN}`);

// ===============================================
// PERFORMANCE & CONNECTION MANAGEMENT
// ===============================================
let isOnline = true;
let connectionQuality = 'fast';

const MAX_CACHE_SIZE = {
  [DYNAMIC_CACHE]: 50,    // 50 items max
  [AUDIO_CACHE]: 15,      // 15 audio files max
  [IMAGE_CACHE]: 100,     // 100 images max
  [DOCUMENTS_CACHE]: 25,  // 25 documents max
  [STATIC_CACHE]: 200,    // 200 library files max
  [PAGES_CACHE]: 30       // 30 pages max
};

async function detectConnection() {
  if ('connection' in navigator) {
    const conn = navigator.connection;
    
    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
      connectionQuality = 'slow';
    } else if (conn.effectiveType === '3g') {
      connectionQuality = 'medium';
    } else {
      connectionQuality = 'fast';
    }
  }
  
  return connectionQuality;
}

// ===============================================
// COMPLETE ASSET URLS (CORRECTED & VERIFIED)
// ===============================================
function getAudioUrls() {
  if (IS_CUSTOM_DOMAIN) {
    return [
      '/assets/demo/voice/intro/Thann_Intro.wav',
      '/assets/projects/voice/narrative/thanattsitt-2033447-tha-4d5m7gd2g.mp3'
    ];
  } else {
    return [
      'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/demo/voice/intro/Thann_Intro.wav',
      'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/projects/voice/narrative/thanattsitt-2033447-tha-4d5m7gd2g.mp3'
    ];
  }
}

function getImageUrls() {
  if (IS_CUSTOM_DOMAIN) {
    return [
      '/assets/images/data/profile/1755844218313.jpg'
    ];
  } else {
    return [
      'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/images/data/profile/1755844218313.jpg'
    ];
  }
}

function getIconUrls() {
  if (IS_CUSTOM_DOMAIN) {
    return [
      '/assets/icons/favicon.svg',
      '/assets/icons/favicon.ico',
      '/favicon.ico'
    ];
  } else {
    return [
      'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/icons/favicon.svg',
      'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/icons/favicon.ico'
    ];
  }
}

function getDocumentUrls() {
  if (IS_CUSTOM_DOMAIN) {
    return [
      '/assets/sitedata/doc/Thanns_Main_CV-4.pdf'
    ];
  } else {
    return [
      'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/sitedata/doc/Thanns_Main_CV-4.pdf'
    ];
  }
}

// ===============================================
// COMPLETE RESOURCE LIST (OPTIMIZED)
// ===============================================
const STATIC_RESOURCES = [
  // 📄 HTML Pages
  '/',
  '/index.html',
  '/about.html',
  '/term-of-service.html',
  '/sitemap.html',
  '/offline.html',
  '/cookie-policy.html',
  '/faq.html',
  '/404.html',
  '/me.html',
  
  // 📱 PWA Files
  '/manifest.json',
  '/sw.js',
  
  // 🗺️ Sitemap Files
  '/sitemap.xml',
  '/audio-sitemap.xml',
  
  // 🎨 CSS Libraries
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  
  // 🔤 Google Fonts
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  
  // 📚 JavaScript Libraries  
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
  'https://unpkg.com/aos@2.3.1/dist/aos.js',
  'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js',
  'https://unpkg.com/typed.js@2.0.12',
  
  // 🎵 ALL Your Audio Files
  ...getAudioUrls(),
  
  // 🖼️ ALL Your Images
  ...getImageUrls(),
  
  // 🎯 ALL Your Icons
  ...getIconUrls(),
  
  // 📄 ALL Your Documents
  ...getDocumentUrls()
];

// Asset type mapping for better organization
const ASSET_TYPES = {
  audio: ['.wav', '.mp3', '.ogg', '.m4a', '.aac'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  documents: ['.pdf', '.doc', '.docx', '.txt'],
  icons: ['favicon.ico', 'favicon.svg', 'apple-touch-icon']
};

// ===============================================
// CACHE SIZE MANAGEMENT
// ===============================================
async function cleanupCache(cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    const maxSize = MAX_CACHE_SIZE[cacheName] || 100;
    
    if (requests.length > maxSize) {
      // Remove oldest entries (FIFO)
      const toDelete = requests.slice(0, requests.length - maxSize);
      await Promise.all(toDelete.map(request => cache.delete(request)));
      console.log(`🧹 Cleaned ${toDelete.length} old entries from ${cacheName}`);
      return toDelete.length;
    }
    return 0;
  } catch (error) {
    console.warn(`⚠️ Cache cleanup failed for ${cacheName}:`, error);
    return 0;
  }
}

// ===============================================
// SMART PRELOADING BASED ON CONNECTION
// ===============================================
async function smartPreload() {
  const quality = await detectConnection();
  
  if (quality === 'fast') {
    console.log('🚀 Fast connection detected - preloading all assets');
    return Promise.allSettled([
      preloadSpecificAssets('audio'),
      preloadSpecificAssets('images'),
      preloadSpecificAssets('documents')
    ]);
  } else if (quality === 'medium') {
    console.log('📱 Medium connection - preloading critical assets only');
    return preloadSpecificAssets('images');
  } else {
    console.log('🐌 Slow connection - skipping preload');
    return Promise.resolve();
  }
}

// ===============================================
// ENHANCED DEBUG INFO
// ===============================================
function logCacheStats() {
  console.group('🎯 PegeArts Service Worker Status');
  console.log(`🌐 Domain: ${CURRENT_DOMAIN}`);
  console.log(`🏠 Hosting: ${IS_CUSTOM_DOMAIN ? 'Custom Domain' : 'GitHub Pages'}`);
  console.log(`📊 Total Resources: ${STATIC_RESOURCES.length}`);
  console.log(`🎵 Audio URLs: ${getAudioUrls().length}`);
  console.log(`🖼️ Image URLs: ${getImageUrls().length}`);
  console.log(`📄 Document URLs: ${getDocumentUrls().length}`);
  console.log(`🎯 Icon URLs: ${getIconUrls().length}`);
  console.log(`💾 Cache Version: ${CACHE_NAME}`);
  console.log(`🔗 Connection Quality: ${connectionQuality}`);
  console.groupEnd();
}

// ===============================================
// INSTALL EVENT - CACHE ALL ASSETS
// ===============================================
self.addEventListener('install', event => {
  console.log(`🚀 Installing Complete Asset Cache on ${CURRENT_DOMAIN}...`);
  logCacheStats();
  
  event.waitUntil(
    Promise.allSettled([
      // Cache static resources (CSS, JS libraries)
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static libraries...');
        const libraryResources = STATIC_RESOURCES.filter(url => 
          url.includes('cdn') || url.includes('googleapis.com') || 
          url.includes('unpkg.com') || url.includes('jsdelivr.net')
        );
        return Promise.allSettled(
          libraryResources.map(url => cacheWithFallback(cache, url))
        );
      }),
      
      // Cache HTML pages
      caches.open(PAGES_CACHE).then(cache => {
        console.log('📄 Caching HTML pages...');
        const htmlResources = STATIC_RESOURCES.filter(url => 
          url.endsWith('.html') || url === '/' || url === '/sw.js' || 
          url === '/manifest.json' || url.endsWith('.xml')
        );
        return Promise.allSettled(
          htmlResources.map(url => cacheWithFallback(cache, url))
        );
      }),
      
      // Cache audio files
      caches.open(AUDIO_CACHE).then(cache => {
        console.log('🎵 Caching audio files...');
        const audioUrls = getAudioUrls();
        return Promise.allSettled(
          audioUrls.map(url => cacheWithFallback(cache, url))
        );
      }),
      
      // Cache images
      caches.open(IMAGE_CACHE).then(cache => {
        console.log('🖼️ Caching images and icons...');
        const imageUrls = [...getImageUrls(), ...getIconUrls()];
        return Promise.allSettled(
          imageUrls.map(url => cacheWithFallback(cache, url))
        );
      }),
      
      // Cache documents
      caches.open(DOCUMENTS_CACHE).then(cache => {
        console.log('📄 Caching documents...');
        const docUrls = getDocumentUrls();
        return Promise.allSettled(
          docUrls.map(url => cacheWithFallback(cache, url))
        );
      }),
      
      // Initialize dynamic cache
      caches.open(DYNAMIC_CACHE)
      
    ]).then(results => {
      console.log('✅ Initial caching complete');
      
      // Log cache statistics
      results.forEach((result, index) => {
        const cacheNames = ['Static', 'Pages', 'Audio', 'Images', 'Documents', 'Dynamic'];
        if (result.status === 'fulfilled' && result.value) {
          const settled = result.value.filter(r => r.status === 'fulfilled').length;
          const total = result.value.length;
          console.log(`📊 ${cacheNames[index]}: ${settled}/${total} cached`);
        }
      });
      
      // Smart preloading
      return smartPreload();
      
    }).then(() => {
      console.log('🎯 Service Worker installation complete');
      self.skipWaiting();
    }).catch(error => {
      console.error('❌ Installation failed:', error);
    })
  );
});

// ===============================================
// ENHANCED CACHE HELPER
// ===============================================
async function cacheWithFallback(cache, url) {
  try {
    const request = new Request(url, {
      cache: 'no-cache',
      mode: url.startsWith('http') && !url.includes(self.location.origin) ? 'cors' : 'same-origin'
    });
    
    await cache.add(request);
    console.log(`✅ Cached: ${url.split('/').pop()}`);
    return { success: true, url };
  } catch (error) {
    console.warn(`⚠️ Failed to cache: ${url.split('/').pop()}`, error.message);
    return { success: false, url, error: error.message };
  }
}

// ===============================================
// ACTIVATE EVENT - ENHANCED WITH CLEANUP
// ===============================================
self.addEventListener('activate', event => {
  console.log(`🔄 Activating Complete Asset Cache on ${CURRENT_DOMAIN}...`);
  
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
      
      // Clean up oversized caches
      ...Object.keys(MAX_CACHE_SIZE).map(cacheName => cleanupCache(cacheName)),
      
      // Take control
      self.clients.claim()
      
    ]).then(() => {
      console.log('✅ Complete Asset Cache Activated');
      return Promise.all([
        caches.open(STATIC_CACHE).then(cache => cache.keys()),
        caches.open(PAGES_CACHE).then(cache => cache.keys()),
        caches.open(AUDIO_CACHE).then(cache => cache.keys()),
        caches.open(IMAGE_CACHE).then(cache => cache.keys()),
        caches.open(DOCUMENTS_CACHE).then(cache => cache.keys())
      ]);
    }).then(([static_, pages, audio, images, docs]) => {
      console.log(`📊 Final Cache Summary:`);
      console.log(`   📚 Static Libraries: ${static_.length} items`);
      console.log(`   📄 HTML Pages: ${pages.length} items`);
      console.log(`   🎵 Audio Files: ${audio.length} items`);
      console.log(`   🖼️ Images & Icons: ${images.length} items`);
      console.log(`   📄 Documents: ${docs.length} items`);
      
      return self.clients.matchAll();
    }).then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          message: '🎉 Complete portfolio with all assets available offline!',
          assets: {
            audio: getAudioUrls().length,
            images: getImageUrls().length,
            icons: getIconUrls().length,
            documents: getDocumentUrls().length
          },
          domain: CURRENT_DOMAIN,
          quality: connectionQuality
        });
      });
      
      logCacheStats();
    })
  );
});

// ===============================================
// FETCH EVENT - ASSET-AWARE HANDLING
// ===============================================
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and non-HTTP protocols
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  
  event.respondWith(handleAssetAwareRequest(request));
});

// ===============================================
// ASSET-AWARE REQUEST HANDLER (ENHANCED)
// ===============================================
async function handleAssetAwareRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Strategy 1: HTML Pages (Network First)
    if (isHtmlPage(request)) {
      return await handleHtmlPageRequest(request);
    }
    
    // Strategy 2: Audio Files (Cache First - High Priority)
    if (isAudioFile(request)) {
      return await handleAssetRequest(request, AUDIO_CACHE, 'audio');
    }
    
    // Strategy 3: Images & Icons (Cache First)
    if (isImageFile(request)) {
      return await handleAssetRequest(request, IMAGE_CACHE, 'image');
    }
    
    // Strategy 4: Documents (Cache First)
    if (isDocumentFile(request)) {
      return await handleAssetRequest(request, DOCUMENTS_CACHE, 'document');
    }
    
    // Strategy 5: External Libraries (Stale While Revalidate)
    if (isExternalLibrary(request)) {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }
    
    // Strategy 6: Same-origin assets (Smart Network First)
    if (url.origin === self.location.origin) {
      return await smartNetworkFirst(request, DYNAMIC_CACHE);
    }
    
    // Strategy 7: GitHub raw content (Cache First)
    if (url.hostname === 'raw.githubusercontent.com' && 
        url.pathname.includes('/Pigletpeakkung/artofppage/')) {
      return await cacheFirst(request, getAssetCache(request));
    }
    
    // Strategy 8: Google Fonts (Cache First)
    if (url.hostname.includes('fonts.googleapis.com') || 
        url.hostname.includes('fonts.gstatic.com')) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 9: CDN Resources (Stale While Revalidate)
    if (isCDNRequest(request)) {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }
    
    // Default: Smart Network First
    return await smartNetworkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('❌ Asset request failed:', request.url.split('/').pop(), error.message);
    return await handleAssetFailure(request, error);
  }
}

// ===============================================
// ASSET TYPE CHECKERS (ENHANCED)
// ===============================================
function isAudioFile(request) {
  const url = new URL(request.url);
  return ASSET_TYPES.audio.some(ext => url.pathname.includes(ext)) ||
         (url.hostname === 'raw.githubusercontent.com' && 
          url.pathname.includes('/voice/')) ||
         (url.origin === self.location.origin && 
          (url.pathname.includes('/assets/demo/voice/') || 
           url.pathname.includes('/assets/projects/voice/')));
}

function isImageFile(request) {
  const url = new URL(request.url);
  return ASSET_TYPES.images.some(ext => url.pathname.includes(ext)) ||
         ASSET_TYPES.icons.some(icon => url.pathname.includes(icon)) ||
         (url.hostname === 'raw.githubusercontent.com' && 
          (url.pathname.includes('/images/') || url.pathname.includes('/icons/'))) ||
         (url.origin === self.location.origin && 
          (url.pathname.includes('/assets/images/') || url.pathname.includes('/assets/icons/')));
}

function isDocumentFile(request) {
  const url = new URL(request.url);
  return ASSET_TYPES.documents.some(ext => url.pathname.includes(ext)) ||
         (url.hostname === 'raw.githubusercontent.com' && 
          url.pathname.includes('/doc/')) ||
         (url.origin === self.location.origin && 
          url.pathname.includes('/assets/sitedata/doc/'));
}

function isHtmlPage(request) {
  const url = new URL(request.url);
  return request.mode === 'navigate' || 
         url.pathname.endsWith('.html') || 
         url.pathname === '/' ||
         ['/', '/about', '/terms', '/sitemap', '/cookies', '/faq', '/help', '/me'].includes(url.pathname);
}

function isExternalLibrary(request) {
  const url = new URL(request.url);
  return url.hostname.includes('cdnjs.cloudflare.com') ||
         url.hostname.includes('unpkg.com') ||
         url.hostname.includes('jsdelivr.net');
}

function isCDNRequest(request) {
  const url = new URL(request.url);
  return url.hostname.includes('cdn') ||
         url.hostname.includes('unpkg.com') ||
         url.hostname.includes('jsdelivr.net') ||
         url.hostname.includes('cdnjs.cloudflare.com');
}

// ===============================================
// SMART CACHE SELECTOR
// ===============================================
function getAssetCache(request) {
  if (isAudioFile(request)) return AUDIO_CACHE;
  if (isImageFile(request)) return IMAGE_CACHE;
  if (isDocumentFile(request)) return DOCUMENTS_CACHE;
  if (isHtmlPage(request)) return PAGES_CACHE;
  return DYNAMIC_CACHE;
}

// ===============================================
// ENHANCED ASSET REQUEST HANDLER
// ===============================================
async function handleAssetRequest(request, cacheName, assetType) {
  try {
    // Check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`📦 Cache hit: ${assetType} - ${request.url.split('/').pop()}`);
      return cachedResponse;
    }
    
    // Fetch from network
    console.log(`🌐 Network fetch: ${assetType} - ${request.url.split('/').pop()}`);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      console.log(`✅ Cached new ${assetType}: ${request.url.split('/').pop()}`);
      return networkResponse;
    }
    
    throw new Error(`${assetType} network response not ok: ${networkResponse.status}`);
    
  } catch (error) {
    console.error(`❌ ${assetType} failed: ${request.url.split('/').pop()} - ${error.message}`);
    return await createAssetFallback(request, assetType, error);
  }
}

// ===============================================
// HTML PAGE HANDLER (ENHANCED)
// ===============================================
async function handleHtmlPageRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Try network first for fresh content
    const networkResponse = await fetch(request, { cache: 'no-cache' });
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, networkResponse.clone());
      console.log(`📄 Fresh page served: ${pathname}`);
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
    
  } catch (error) {
    console.log(`🔄 Network failed for ${pathname}, trying cache...`);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`📄 Cache hit: ${pathname}`);
      return cachedResponse;
    }
    
    // Try page mapping and fallbacks
    return await servePageFallback(pathname);
  }
}

// ===============================================
// CACHING STRATEGIES (ENHANCED)
// ===============================================
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  
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

async function smartNetworkFirst(request, cacheName) {
  const quality = await detectConnection();
  
  if (quality === 'slow') {
    // Use cache-first for slow connections
    return await cacheFirst(request, cacheName);
  }
  
  return await networkFirst(request, cacheName);
}

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
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse && networkResponse.status === 200) {
      caches.open(cacheName).then(cache => {
        cache.put(request, networkResponse.clone());
      });
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// ===============================================
// ASSET FALLBACK CREATORS (ENHANCED)
// ===============================================
async function createAssetFallback(request, assetType, error) {
  const url = new URL(request.url);
  const fileName = url.pathname.split('/').pop();
  
  switch (assetType) {
    case 'audio':
      return new Response(JSON.stringify({
        error: 'Audio not available offline',
        message: `Voice demo "${fileName}" will be available when you're back online`,
        file: fileName,
        domain: CURRENT_DOMAIN,
        type: 'audio',
        suggestion: 'Check your internet connection and try again'
      }), {
        status: 404,
        statusText: 'Audio Offline',
        headers: { 
          'Content-Type': 'application/json',
          'X-Offline-Resource': 'audio'
        }
      });
      
    case 'document':
      return new Response(JSON.stringify({
        error: 'Document not available offline',
        message: `Document "${fileName}" will be available when you're back online`,
        file: fileName,
        domain: CURRENT_DOMAIN,
        type: 'document',
        alternativeText: 'Thanatsitt Santisamranwilai - Professional AI Developer & Voice Artist with expertise in modern web frameworks, machine learning, and multilingual voice work.',
        contact: 'thanattsitt.info@yahoo.co.uk'
      }), {
        status: 404,
        statusText: 'Document Offline',
        headers: { 
          'Content-Type': 'application/json',
          'X-Offline-Resource': 'document'
        }
      });
      
    case 'image':
      return createImagePlaceholder(url.pathname, fileName);
      
    default:
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;
      throw error;
  }
}

function createImagePlaceholder(pathname, fileName) {
  const isIcon = ASSET_TYPES.icons.some(icon => fileName.includes(icon));
  const isProfile = pathname.includes('profile');
  const width = isIcon ? '64' : isProfile ? '300' : '400';
  const height = isIcon ? '64' : isProfile ? '300' : '300';
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.8"/>
          <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0.6"/>
        </linearGradient>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="#8b5cf6" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" rx="${isIcon ? '8' : '20'}"/>
      <rect width="100%" height="100%" fill="url(#dots)" opacity="0.5"/>
      ${isIcon ? 
        `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui" font-size="28" fill="white">🎨</text>` :
        isProfile ?
        `<circle cx="50%" cy="35%" r="18%" fill="white" opacity="0.2"/>
         <circle cx="50%" cy="35%" r="12%" fill="white" opacity="0.4"/>
         <text x="50%" y="35%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui" font-size="36" fill="white">👨‍💻</text>
         <text x="50%" y="65%" text-anchor="middle" font-family="system-ui" font-size="16" fill="white" font-weight="600">
           PegeArts
         </text>
         <text x="50%" y="75%" text-anchor="middle" font-family="system-ui" font-size="12" fill="white" opacity="0.8">
           AI Developer & Voice Artist
         </text>
         <text x="50%" y="85%" text-anchor="middle" font-family="system-ui" font-size="10" fill="white" opacity="0.6">
           Available when online
         </text>` :
        `<circle cx="50%" cy="40%" r="15%" fill="white" opacity="0.3"/>
         <text x="50%" y="40%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui" font-size="32" fill="white">📸</text>
         <text x="50%" y="65%" text-anchor="middle" font-family="system-ui" font-size="14" fill="white" font-weight="600">
           ${fileName.substring(0, 20)}${fileName.length > 20 ? '...' : ''}
         </text>
         <text x="50%" y="75%" text-anchor="middle" font-family="system-ui" font-size="10" fill="white" opacity="0.8">
           PegeArts Portfolio
         </text>
         <text x="50%" y="85%" text-anchor="middle" font-family="system-ui" font-size="8" fill="white" opacity="0.6">
           Available when online
         </text>`
      }
    </svg>
  `;
  
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache',
      'X-Offline-Resource': 'image-placeholder'
    }
  });
}

// ===============================================
// PAGE FALLBACK HANDLER (ENHANCED)
// ===============================================
async function servePageFallback(pathname) {
  console.log(`🔄 Serving fallback for: ${pathname}`);
  
  const pageMap = {
    '/about.html': '/about.html',
    '/about': '/about.html',
    '/terms': '/term-of-service.html',
    '/term-of-service.html': '/term-of-service.html',
    '/sitemap.html': '/sitemap.html',
    '/sitemap': '/sitemap.html',
    '/cookie-policy.html': '/cookie-policy.html',
    '/cookies': '/cookie-policy.html',
    '/faq.html': '/faq.html',
    '/faq': '/faq.html',
    '/help': '/faq.html',
    '/me.html': '/me.html',
    '/me': '/me.html'
  };
  
  const mappedPage = pageMap[pathname];
  if (mappedPage) {
    const cachedPage = await caches.match(mappedPage);
    if (cachedPage) {
      console.log(`📄 Serving mapped page: ${mappedPage}`);
      return cachedPage;
    }
  }
  
  // Try offline.html
  const offlinePage = await caches.match('/offline.html');
  if (offlinePage) {
    console.log(`📄 Serving offline page`);
    return offlinePage;
  }
  
  // Try home page
  const homePage = await caches.match('/') || await caches.match('/index.html');
  if (homePage) {
    console.log(`📄 Serving home page as fallback`);
    return homePage;
  }
  
  // Custom 404
  return await serve404Page(pathname);
}

// ===============================================
// ASSET FAILURE HANDLER (ENHANCED)
// ===============================================
async function handleAssetFailure(request, error) {
  const url = new URL(request.url);
  
  // Handle navigation requests
  if (request.mode === 'navigate' || isHtmlPage(request)) {
    return await servePageFallback(url.pathname);
  }
  
  // Handle specific asset types
  if (isAudioFile(request)) {
    return await createAssetFallback(request, 'audio', error);
  }
  
  if (isImageFile(request)) {
    return await createAssetFallback(request, 'image', error);  
  }
  
  if (isDocumentFile(request)) {
    return await createAssetFallback(request, 'document', error);
  }
  
  // Try any cached version
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log(`📦 Serving stale cache for: ${request.url.split('/').pop()}`);
    return cachedResponse;
  }
  
  throw error;
}

// ===============================================
// ENHANCED 404 PAGE
// ===============================================
async function serve404Page(pathname) {
  const cached404 = await caches.match('/404.html');
  if (cached404) return cached404;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en" class="dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 - Page Not Found | PegeArts</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
      <style>
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .float { animation: float 3s ease-in-out infinite; }
      </style>
    </head>
    <body class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white min-h-screen flex items-center justify-center">
      <div class="text-center max-w-2xl mx-auto px-6">
        <div class="text-8xl mb-8 float">🚀</div>
        <h1 class="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">404</h1>
        <h2 class="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p class="text-lg opacity-80 mb-8">
          The page <code class="bg-purple-900/50 px-2 py-1 rounded text-sm">${pathname}</code> doesn't exist.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <a href="/" class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-all hover:scale-105">
            <i class="fas fa-home mr-2"></i> Home
          </a>
          <a href="/about.html" class="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg transition-all hover:scale-105">
            <i class="fas fa-user mr-2"></i> About
          </a>
          <a href="/faq.html" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-all hover:scale-105">
            <i class="fas fa-question mr-2"></i> FAQ
          </a>
          <a href="/sitemap.html" class="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-all hover:scale-105">
            <i class="fas fa-sitemap mr-2"></i> Sitemap
          </a>
        </div>
        
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-sm space-y-2">
          <div class="flex items-center justify-center space-x-4">
            <span class="text-green-400">🟢 Service Worker Active</span>
            <span class="text-blue-400">📱 PWA Ready</span>
          </div>
          <p class="opacity-80">🌐 Complete Asset Cache: Audio, Images, Documents & Pages</p>
          <p class="opacity-60 text-xs">${CURRENT_DOMAIN} • ${IS_CUSTOM_DOMAIN ? 'Custom Domain' : 'GitHub Pages'}</p>
        </div>
        
        <button onclick="history.back()" class="mt-4 text-purple-400 hover:text-purple-300 transition-colors">
          <i class="fas fa-arrow-left mr-2"></i> Go Back
        </button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    status: 404,
    headers: { 
      'Content-Type': 'text/html',
      'X-Offline-Page': '404'
    }
  });
}

// ===============================================
// ENHANCED MESSAGING SYSTEM
// ===============================================
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_COMPLETE_CACHE_STATUS':
      getCompleteCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
      
    case 'PRELOAD_ASSETS':
      preloadSpecificAssets(payload?.assetType).then(result => {
        event.ports[0].postMessage(result);
      });
      break;
      
    case 'GET_ASSET_LIST':
      getAssetList().then(assets => {
        event.ports[0].postMessage({ assets });
      });
      break;
      
    case 'CLEAR_CACHE_TYPE':
      if (payload?.cacheType) {
        clearSpecificCache(payload.cacheType).then(() => {
          event.ports[0].postMessage({ success: true, cleared: payload.cacheType });
        });
      }
      break;
      
    case 'GET_CONNECTION_STATUS':
      detectConnection().then(quality => {
        event.ports[0].postMessage({ 
          connectionQuality: quality,
          isOnline: isOnline,
          domain: CURRENT_DOMAIN
        });
      });
      break;
  }
});

async function getCompleteCacheStatus() {
  const cacheTypes = {
    [STATIC_CACHE]: 'Libraries & CDN',
    [PAGES_CACHE]: 'HTML Pages',
    [AUDIO_CACHE]: 'Voice Demos',
    [IMAGE_CACHE]: 'Images & Icons',
    [DOCUMENTS_CACHE]: 'PDF & Documents',
    [DYNAMIC_CACHE]: 'Dynamic Content'
  };
  
  const status = {
    domain: CURRENT_DOMAIN,
    hostingType: IS_CUSTOM_DOMAIN ? 'custom' : 'github',
    totalCaches: Object.keys(cacheTypes).length,
    connectionQuality: connectionQuality,
    details: {},
    summary: {
      totalItems: 0,
      audioFiles: 0,
      imageFiles: 0,
      documentFiles: 0,
      htmlPages: 0,
      libraries: 0
    }
  };
  
  for (const [cacheName, description] of Object.entries(cacheTypes)) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      status.details[cacheName] = {
        description,
        count: keys.length,
        maxSize: MAX_CACHE_SIZE[cacheName] || 100,
        items: keys.slice(0, 3).map(req => ({
          url: req.url.split('/').pop(),
          type: getUrlType(req.url)
        }))
      };
      
      status.summary.totalItems += keys.length;
      
      // Count by type
      keys.forEach(req => {
        const url = req.url;
        if (ASSET_TYPES.audio.some(ext => url.includes(ext))) status.summary.audioFiles++;
        else if (ASSET_TYPES.images.some(ext => url.includes(ext))) status.summary.imageFiles++;
        else if (ASSET_TYPES.documents.some(ext => url.includes(ext))) status.summary.documentFiles++;
        else if (url.includes('.html') || url.endsWith('/')) status.summary.htmlPages++;
        else if (url.includes('.js') || url.includes('.css')) status.summary.libraries++;
      });
      
    } catch (error) {
      status.details[cacheName] = {
        description,
        count: 0,
        error: error.message
      };
    }
  }
  
  return status;
}

function getUrlType(url) {
  if (ASSET_TYPES.audio.some(ext => url.includes(ext))) return 'audio';
  if (ASSET_TYPES.images.some(ext => url.includes(ext))) return 'image';
  if (ASSET_TYPES.documents.some(ext => url.includes(ext))) return 'document';
  if (url.includes('.html') || url.endsWith('/')) return 'page';
  if (url.includes('.js')) return 'script';
  if (url.includes('.css')) return 'style';
  return 'other';
}

async function preloadSpecificAssets(assetType) {
  let urls = [];
  let cacheName = DYNAMIC_CACHE;
  
  switch (assetType) {
    case 'audio':
      urls = getAudioUrls();
      cacheName = AUDIO_CACHE;
      break;
    case 'images':
      urls = [...getImageUrls(), ...getIconUrls()];
      cacheName = IMAGE_CACHE;
      break;
    case 'documents':
      urls = getDocumentUrls();
      cacheName = DOCUMENTS_CACHE;
      break;
    default:
      return { success: false, message: 'Unknown asset type' };
  }
  
  const cache = await caches.open(cacheName);
  const results = await Promise.allSettled(
    urls.map(url => cache.add(url).catch(error => ({ url, error: error.message })))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected');
  
  return {
    success: true,
    assetType,
    total: urls.length,
    successful,
    failed: failed.length,
    failures: failed.map(f => f.reason)
  };
}

async function getAssetList() {
  return {
    audio: getAudioUrls(),
    images: getImageUrls(),
    icons: getIconUrls(),
    documents: getDocumentUrls(),
    domain: CURRENT_DOMAIN,
    hostingType: IS_CUSTOM_DOMAIN ? 'custom' : 'github',
    connectionQuality: connectionQuality
  };
}

async function clearSpecificCache(cacheType) {
  const cacheMap = {
    'static': STATIC_CACHE,
    'pages': PAGES_CACHE,
    'audio': AUDIO_CACHE,
    'images': IMAGE_CACHE,
    'documents': DOCUMENTS_CACHE,
    'dynamic': DYNAMIC_CACHE
  };
  
  const cacheName = cacheMap[cacheType];
  if (cacheName) {
    await caches.delete(cacheName);
    console.log(`🗑️ Cleared ${cacheType} cache: ${cacheName}`);
    
    // Recreate empty cache
    await caches.open(cacheName);
    console.log(`📦 Recreated empty ${cacheType} cache`);
    
    return true;
  }
  
  return false;
}

// ===============================================
// BACKGROUND SYNC SUPPORT (Progressive Enhancement)
// ===============================================
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case 'cache-update':
      event.waitUntil(updateCriticalAssets());
      break;
    case 'preload-audio':
      event.waitUntil(preloadSpecificAssets('audio'));
      break;
    case 'cleanup-caches':
      event.waitUntil(cleanupAllCaches());
      break;
  }
});

async function updateCriticalAssets() {
  try {
    console.log('🔄 Updating critical assets in background...');
    
    const criticalUrls = [
      '/',
      '/manifest.json',
      ...getAudioUrls().slice(0, 2), // Only first 2 audio files
      ...getImageUrls().slice(0, 1)  // Only profile image
    ];
    
    const updatePromises = criticalUrls.map(async url => {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (response.ok) {
          const cache = await caches.open(getAssetCache({ url }));
          await cache.put(url, response);
          console.log(`✅ Updated: ${url.split('/').pop()}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to update: ${url.split('/').pop()}`);
      }
    });
    
    await Promise.allSettled(updatePromises);
    console.log('✅ Background asset update complete');
    
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

async function cleanupAllCaches() {
  console.log('🧹 Starting comprehensive cache cleanup...');
  
  const cleanupPromises = Object.keys(MAX_CACHE_SIZE).map(cacheName => 
    cleanupCache(cacheName)
  );
  
  const results = await Promise.allSettled(cleanupPromises);
  const totalCleaned = results.reduce((sum, result) => {
    return sum + (result.status === 'fulfilled' ? result.value : 0);
  }, 0);
  
  console.log(`🧹 Cache cleanup complete: ${totalCleaned} items removed`);
  
  // Notify clients about cleanup
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'CACHE_CLEANUP_COMPLETE',
      totalCleaned,
      timestamp: Date.now()
    });
  });
}

// ===============================================
// PUSH NOTIFICATION SUPPORT (Future Enhancement)
// ===============================================
self.addEventListener('push', event => {
  console.log('📨 Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/assets/icons/favicon.svg',
    badge: '/assets/icons/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Portfolio',
        icon: '/assets/icons/favicon.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/icons/favicon.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('PegeArts Portfolio', options)
  );
});

self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(CURRENT_DOMAIN)
    );
  }
});

// ===============================================
// ADVANCED ERROR TRACKING & RECOVERY
// ===============================================
class ServiceWorkerErrorTracker {
  constructor() {
    this.errors = new Map();
    this.maxErrors = 50;
  }
  
  logError(url, error, context = 'unknown') {
    const key = `${context}:${url}`;
    const errorInfo = {
      url,
      error: error.message,
      context,
      timestamp: Date.now(),
      count: (this.errors.get(key)?.count || 0) + 1
    };
    
    this.errors.set(key, errorInfo);
    
    // Cleanup old errors
    if (this.errors.size > this.maxErrors) {
      const oldestKey = Array.from(this.errors.keys())[0];
      this.errors.delete(oldestKey);
    }
    
    console.error(`❌ SW Error [${context}]: ${url.split('/').pop()} - ${error.message}`);
    
    // Critical error detection
    if (errorInfo.count > 3) {
      this.handleCriticalError(key, errorInfo);
    }
  }
  
  async handleCriticalError(key, errorInfo) {
    console.warn(`🚨 Critical error detected: ${key}`);
    
    // Attempt cache recovery
    if (errorInfo.context === 'cache') {
      await this.recoverCache(errorInfo.url);
    }
    
    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CRITICAL_ERROR',
        error: errorInfo,
        recoveryAttempted: true
      });
    });
  }
  
  async recoverCache(url) {
    try {
      console.log(`🔧 Attempting cache recovery for: ${url.split('/').pop()}`);
      
      // Clear problematic cache entry
      const caches_list = await caches.keys();
      for (const cacheName of caches_list) {
        const cache = await caches.open(cacheName);
        await cache.delete(url);
      }
      
      // Attempt fresh fetch and cache
      const response = await fetch(url, { cache: 'no-cache' });
      if (response.ok) {
        const cacheName = getAssetCache({ url });
        const cache = await caches.open(cacheName);
        await cache.put(url, response);
        console.log(`✅ Cache recovery successful: ${url.split('/').pop()}`);
        return true;
      }
    } catch (error) {
      console.error(`❌ Cache recovery failed: ${url.split('/').pop()}`, error);
    }
    
    return false;
  }
  
  getErrorSummary() {
    const summary = {
      totalErrors: this.errors.size,
      criticalErrors: Array.from(this.errors.values()).filter(e => e.count > 3).length,
      contexts: {},
      recentErrors: Array.from(this.errors.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
    };
    
    // Group by context
    for (const error of this.errors.values()) {
      summary.contexts[error.context] = (summary.contexts[error.context] || 0) + 1;
    }
    
    return summary;
  }
}

const errorTracker = new ServiceWorkerErrorTracker();

// ===============================================
// ENHANCED PERFORMANCE MONITORING
// ===============================================
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      responseTimes: []
    };
  }
  
  recordCacheHit(url) {
    this.metrics.cacheHits++;
    console.log(`📊 Cache hit: ${url.split('/').pop()} (${this.getCacheHitRatio()}% hit rate)`);
  }
  
  recordCacheMiss(url) {
    this.metrics.cacheMisses++;
    console.log(`📊 Cache miss: ${url.split('/').pop()} (${this.getCacheHitRatio()}% hit rate)`);
  }
  
  recordNetworkRequest(url, responseTime) {
    this.metrics.networkRequests++;
    
    if (responseTime) {
      this.metrics.responseTimes.push(responseTime);
      
      // Keep only last 100 response times
      if (this.metrics.responseTimes.length > 100) {
        this.metrics.responseTimes.shift();
      }
      
      // Update average
      this.metrics.averageResponseTime = 
        this.metrics.responseTimes.reduce((a, b) => a + b, 0) / 
        this.metrics.responseTimes.length;
    }
    
    console.log(`📊 Network request: ${url.split('/').pop()} (${responseTime}ms)`);
  }
  
  recordFailedRequest(url, error) {
    this.metrics.failedRequests++;
    errorTracker.logError(url, error, 'network');
    console.log(`📊 Failed request: ${url.split('/').pop()} (${this.getSuccessRate()}% success rate)`);
  }
  
  getCacheHitRatio() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? Math.round((this.metrics.cacheHits / total) * 100) : 0;
  }
  
  getSuccessRate() {
    const total = this.metrics.networkRequests + this.metrics.failedRequests;
    return total > 0 ? Math.round((this.metrics.networkRequests / total) * 100) : 0;
  }
  
  getPerformanceReport() {
    return {
      ...this.metrics,
      cacheHitRatio: this.getCacheHitRatio(),
      successRate: this.getSuccessRate(),
      errors: errorTracker.getErrorSummary(),
      timestamp: Date.now()
    };
  }
  
  reset() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      responseTimes: []
    };
    console.log('📊 Performance metrics reset');
  }
}

const performanceMonitor = new PerformanceMonitor();

// ===============================================
// INTEGRATE MONITORING INTO EXISTING FUNCTIONS
// ===============================================

// Update the handleAssetRequest function to include monitoring
async function handleAssetRequestWithMonitoring(request, cacheName, assetType) {
  const startTime = Date.now();
  const url = request.url;
  
  try {
    // Check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      performanceMonitor.recordCacheHit(url);
      const responseTime = Date.now() - startTime;
      console.log(`📦 Cache hit: ${assetType} - ${url.split('/').pop()} (${responseTime}ms)`);
      return cachedResponse;
    }
    
    performanceMonitor.recordCacheMiss(url);
    
    // Fetch from network
    console.log(`🌐 Network fetch: ${assetType} - ${url.split('/').pop()}`);
    const networkResponse = await fetch(request);
    const responseTime = Date.now() - startTime;
    
    if (networkResponse && networkResponse.status === 200) {
      performanceMonitor.recordNetworkRequest(url, responseTime);
      
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      console.log(`✅ Cached new ${assetType}: ${url.split('/').pop()} (${responseTime}ms)`);
      return networkResponse;
    }
    
    throw new Error(`${assetType} network response not ok: ${networkResponse.status}`);
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    performanceMonitor.recordFailedRequest(url, error);
    errorTracker.logError(url, error, assetType);
    
    console.error(`❌ ${assetType} failed: ${url.split('/').pop()} (${responseTime}ms) - ${error.message}`);
    return await createAssetFallback(request, assetType, error);
  }
}

// Replace the original handleAssetRequest with the monitored version
const originalHandleAssetRequest = handleAssetRequest;
handleAssetRequest = handleAssetRequestWithMonitoring;

// ===============================================
// ENHANCED MESSAGE HANDLERS (CONTINUED)
// ===============================================
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_COMPLETE_CACHE_STATUS':
      getCompleteCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
      
    case 'PRELOAD_ASSETS':
      preloadSpecificAssets(payload?.assetType).then(result => {
        event.ports[0].postMessage(result);
      });
      break;
      
    case 'GET_ASSET_LIST':
      getAssetList().then(assets => {
        event.ports[0].postMessage({ assets });
      });
      break;
      
    case 'CLEAR_CACHE_TYPE':
      if (payload?.cacheType) {
        clearSpecificCache(payload.cacheType).then((success) => {
          event.ports[0].postMessage({ success, cleared: payload.cacheType });
        });
      }
      break;
      
    case 'GET_CONNECTION_STATUS':
      detectConnection().then(quality => {
        event.ports[0].postMessage({ 
          connectionQuality: quality,
          isOnline: isOnline,
          domain: CURRENT_DOMAIN
        });
      });
      break;
      
    case 'GET_PERFORMANCE_REPORT':
      event.ports[0].postMessage({
        performance: performanceMonitor.getPerformanceReport(),
        domain: CURRENT_DOMAIN
      });
      break;
      
    case 'RESET_PERFORMANCE_METRICS':
      performanceMonitor.reset();
      event.ports[0].postMessage({ success: true });
      break;
      
    case 'FORCE_CACHE_UPDATE':
      updateCriticalAssets().then(() => {
        event.ports[0].postMessage({ success: true, message: 'Cache update complete' });
      }).catch(error => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
      break;
      
    case 'GET_ERROR_SUMMARY':
      event.ports[0].postMessage({
        errors: errorTracker.getErrorSummary(),
        domain: CURRENT_DOMAIN
      });
      break;
  }
});

// ===============================================
// PERIODIC MAINTENANCE & HEALTH CHECKS
// ===============================================
async function performHealthCheck() {
  console.log('🏥 Performing service worker health check...');
  
  const healthReport = {
    timestamp: Date.now(),
    domain: CURRENT_DOMAIN,
    caches: {},
    performance: performanceMonitor.getPerformanceReport(),
    errors: errorTracker.getErrorSummary(),
    connection: await detectConnection(),
    storage: await getStorageEstimate()
  };
  
  // Check each cache
  const cacheNames = [STATIC_CACHE, PAGES_CACHE, AUDIO_CACHE, IMAGE_CACHE, DOCUMENTS_CACHE, DYNAMIC_CACHE];
  
  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      healthReport.caches[cacheName] = {
        healthy: true,
        itemCount: keys.length,
        maxSize: MAX_CACHE_SIZE[cacheName] || 100
      };
    } catch (error) {
      healthReport.caches[cacheName] = {
        healthy: false,
        error: error.message
      };
    }
  }
  
  console.log('🏥 Health check complete:', healthReport);
  
  // Notify clients of health status
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'HEALTH_REPORT',
      report: healthReport
    });
  });
  
  return healthReport;
}

async function getStorageEstimate() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota,
        usage: estimate.usage,
        usagePercent: Math.round((estimate.usage / estimate.quota) * 100)
      };
    } catch (error) {
      return { error: error.message };
    }
  }
  return { available: false };
}

// Schedule periodic health checks (every 30 minutes)
setInterval(performHealthCheck, 30 * 60 * 1000);

// ===============================================
// STARTUP DIAGNOSTICS
// ===============================================
function runStartupDiagnostics() {
  console.group('🚀 PegeArts Service Worker v3.1 - Startup Diagnostics');
  
  console.log(`🌐 Domain: ${CURRENT_DOMAIN}`);
  console.log(`🏠 Hosting Type: ${IS_CUSTOM_DOMAIN ? 'Custom Domain' : 'GitHub Pages'}`);
  console.log(`📊 Total Static Resources: ${STATIC_RESOURCES.length}`);
  console.log(`🎵 Audio Files: ${getAudioUrls().length}`);
  console.log(`🖼️ Images: ${getImageUrls().length}`);
  console.log(`🎯 Icons: ${getIconUrls().length}`);
  console.log(`📄 Documents: ${getDocumentUrls().length}`);
  console.log(`💾 Cache Version: ${CACHE_NAME}`);
  console.log(`🔧 Max Cache Sizes:`, MAX_CACHE_SIZE);
  
  // Feature detection
  const features = {
    '📱 Push Notifications': 'PushManager' in window,
    '🔄 Background Sync': 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    '📊 Storage API': 'storage' in navigator,
    '🌐 Network Information': 'connection' in navigator,
    '📝 Persistent Storage': 'storage' in navigator && 'persist' in navigator.storage
  };
  
  console.log('🎯 Available Features:');
  Object.entries(features).forEach(([feature, available]) => {
    console.log(`   ${feature}: ${available ? '✅' : '❌'}`);
  });
  
  console.log('🎯 Cache Strategy Summary:');
  console.log('   📄 HTML Pages: Network First → Cache');
  console.log('   🎵 Audio Files: Cache First (High Priority)');
  console.log('   🖼️ Images/Icons: Cache First');
  console.log('   📄 Documents: Cache First');
  console.log('   📚 Libraries: Stale While Revalidate');
  console.log('   🌐 External CDN: Stale While Revalidate');
  console.log('   🔗 GitHub Raw: Cache First');
  
  console.groupEnd();
  
  // Initial health check
  setTimeout(performHealthCheck, 5000);
}

// ===============================================
// INITIALIZE SERVICE WORKER
// ===============================================
console.log(`🚀 PegeArts Complete Portfolio Service Worker v3.1 Ready!`);
console.log(`📊 Features: Smart Caching, Asset Management, Performance Monitoring, Error Tracking`);
console.log(`🌐 Domain: ${CURRENT_DOMAIN} (${IS_CUSTOM_DOMAIN ? 'Custom' : 'GitHub Pages'})`);
console.log(`🎯 All GitHub assets cached with RAW URLs - No more 404s!`);

// Run startup diagnostics
runStartupDiagnostics();

// ===============================================
// EXPORT FOR TESTING (Optional)
// ===============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CACHE_NAME,
    getAudioUrls,
    getImageUrls,
    getDocumentUrls,
    getIconUrls,
    performanceMonitor,
    errorTracker,
    MAX_CACHE_SIZE
  };
}

// ===============================================
// SERVICE WORKER COMPLETE - PRODUCTION READY! 🚀
// ===============================================

