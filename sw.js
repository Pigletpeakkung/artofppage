// ===============================================
// COMPLETE PEGEARTS PORTFOLIO SERVICE WORKER
// With ALL Assets: Audio, Images, Icons, Documents
// ===============================================

const CACHE_NAME = 'pegearts-complete-v3.0';
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
// COMPLETE ASSET URLS (CORRECTED)
// ===============================================
function getAudioUrls() {
  if (IS_CUSTOM_DOMAIN) {
    return [
      '/assets/demo/voice/intro/Thann_Intro.wav',
      '/assets/projects/voice/narrative/thanattsitt-2033447-tha-4d5m7gd2g.mp3'
    ];
  } else {
    return [
      // ✅ CORRECTED: Raw URLs (not blob URLs)
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
      // ✅ CORRECTED: Raw URL (not blob URL)
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
      // ✅ CORRECTED: Raw URLs (not blob URLs)
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
      // ✅ CORRECTED: Raw URL (not blob URL)
      'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/sitedata/doc/Thanns_Main_CV-4.pdf'
    ];
  }
}

// ===============================================
// COMPLETE RESOURCE LIST
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
  
  // 📱 PWA Files
  '/manifest.json',
  '/sw.js',
  
  // 🎨 CSS Libraries
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  
  // 🔤 Google Fonts
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
  
  // 📚 JavaScript Libraries
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
  'https://unpkg.com/aos@2.3.1/dist/aos.js',
  'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js',
  
  // 🎵 ALL Your Audio Files
  ...getAudioUrls(),
  
  // 🖼️ ALL Your Images
  ...getImageUrls(),
  
  // 🎯 ALL Your Icons
  ...getIconUrls(),
  
  // 📄 ALL Your Documents
  ...getDocumentUrls(),
  
  // 📱 Standard PWA Icons
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Asset type mapping for better organization
const ASSET_TYPES = {
  audio: ['.wav', '.mp3', '.ogg', '.m4a', '.aac'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  documents: ['.pdf', '.doc', '.docx', '.txt'],
  icons: ['favicon.ico', 'favicon.svg', 'apple-touch-icon']
};

// ===============================================
// INSTALL EVENT - CACHE ALL ASSETS
// ===============================================
self.addEventListener('install', event => {
  console.log(`🚀 Installing Complete Asset Cache on ${CURRENT_DOMAIN}...`);
  
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
          url.endsWith('.html') || url === '/' || url === '/sw.js' || url === '/manifest.json'
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
      console.log('✅ All assets cached');
      
      // Log cache statistics
      results.forEach((result, index) => {
        const cacheNames = ['Static', 'Pages', 'Audio', 'Images', 'Documents', 'Dynamic'];
        if (result.status === 'fulfilled' && result.value) {
          const settled = result.value.filter(r => r.status === 'fulfilled').length;
          const total = result.value.length;
          console.log(`📊 ${cacheNames[index]}: ${settled}/${total} cached`);
        }
      });
      
      self.skipWaiting();
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
    console.log(`✅ Cached: ${url}`);
    return { success: true, url };
  } catch (error) {
    console.warn(`⚠️ Failed to cache: ${url}`, error.message);
    return { success: false, url, error: error.message };
  }
}

// ===============================================
// ACTIVATE EVENT
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
      console.log(`📊 Cache Summary:`);
      console.log(`   Static: ${static_.length} items`);
      console.log(`   Pages: ${pages.length} items`);
      console.log(`   Audio: ${audio.length} items`);
      console.log(`   Images: ${images.length} items`);
      console.log(`   Documents: ${docs.length} items`);
      
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
          domain: CURRENT_DOMAIN
        });
      });
    })
  );
});

// ===============================================
// FETCH EVENT - ASSET-AWARE HANDLING
// ===============================================
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  
  event.respondWith(handleAssetAwareRequest(request));
});

// ===============================================
// ASSET-AWARE REQUEST HANDLER
// ===============================================
async function handleAssetAwareRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Strategy 1: HTML Pages
    if (isHtmlPage(request)) {
      return await handleHtmlPageRequest(request);
    }
    
    // Strategy 2: Audio Files (High Priority Cache)
    if (isAudioFile(request)) {
      return await handleAssetRequest(request, AUDIO_CACHE, 'audio');
    }
    
    // Strategy 3: Images & Icons
    if (isImageFile(request)) {
      return await handleAssetRequest(request, IMAGE_CACHE, 'image');
    }
    
    // Strategy 4: Documents (PDF, etc.)
    if (isDocumentFile(request)) {
      return await handleAssetRequest(request, DOCUMENTS_CACHE, 'document');
    }
    
    // Strategy 5: External Libraries
    if (isExternalLibrary(request)) {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }
    
    // Strategy 6: Same-origin assets
    if (url.origin === self.location.origin) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Strategy 7: GitHub raw content
    if (url.hostname === 'raw.githubusercontent.com' && 
        url.pathname.includes('/Pigletpeakkung/artofppage/')) {
      return await cacheFirst(request, getAssetCache(request));
    }
    
    // Strategy 8: Google Fonts
    if (url.hostname.includes('fonts.googleapis.com') || 
        url.hostname.includes('fonts.gstatic.com')) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 9: CDN Resources
    if (isCDNRequest(request)) {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }
    
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('❌ Asset request failed:', request.url, error);
    return await handleAssetFailure(request, error);
  }
}

// ===============================================
// ASSET TYPE CHECKERS
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
         ['/', '/about', '/terms', '/sitemap', '/cookies', '/faq', '/help'].includes(url.pathname);
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
      console.log(`📦 Serving cached ${assetType}:`, request.url);
      return cachedResponse;
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      console.log(`✅ Cached new ${assetType}:`, request.url);
      return networkResponse;
    }
    
    throw new Error(`${assetType} network response not ok`);
    
  } catch (error) {
    console.error(`❌ ${assetType} failed to load:`, request.url);
    return await createAssetFallback(request, assetType, error);
  }
}

// ===============================================
// HTML PAGE HANDLER (Enhanced)
// ===============================================
async function handleHtmlPageRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Try network first for fresh content
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, networkResponse.clone());
      console.log(`📄 Fresh page served and cached: ${pathname}`);
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    console.log(`🔄 Network failed for ${pathname}, trying cache...`);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`📄 Serving cached page: ${pathname}`);
      return cachedResponse;
    }
    
    // Try page mapping and fallbacks
    return await servePageFallback(pathname);
  }
}

// ===============================================
// CACHING STRATEGIES
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
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// ===============================================
// ASSET FALLBACK CREATORS
// ===============================================
async function createAssetFallback(request, assetType, error) {
  const url = new URL(request.url);
  
  switch (assetType) {
    case 'audio':
      return new Response(JSON.stringify({
        error: 'Audio not available offline',
        message: 'Voice demo will be available when you\'re back online',
        file: url.pathname.split('/').pop(),
        domain: CURRENT_DOMAIN
      }), {
        status: 404,
        statusText: 'Audio Offline',
        headers: { 'Content-Type': 'application/json' }
      });
      
    case 'document':
      return new Response(JSON.stringify({
        error: 'Document not available offline',
        message: 'CV/Resume will be available when you\'re back online',
        file: url.pathname.split('/').pop(),
        domain: CURRENT_DOMAIN,
        alternativeText: 'Thanatsitt\'s CV - Professional web developer with expertise in modern frameworks and voice integration.'
      }), {
        status: 404,
        statusText: 'Document Offline',
        headers: { 'Content-Type': 'application/json' }
      });
      
    case 'image':
      return createImagePlaceholder(url.pathname);
      
    default:
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;
      throw error;
  }
}

function createImagePlaceholder(pathname) {
  const fileName = pathname.split('/').pop();
  const isIcon = ASSET_TYPES.icons.some(icon => fileName.includes(icon));
  const width = isIcon ? '64' : '400';
  const height = isIcon ? '64' : '300';
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8b5cf6"/>
          <stop offset="100%" style="stop-color:#ec4899"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" opacity="0.1" rx="${isIcon ? '8' : '20'}"/>
      ${isIcon ? 
        `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui" font-size="24">🎨</text>` :
        `<circle cx="50%" cy="40%" r="15%" fill="url(#grad)" opacity="0.3"/>
         <text x="50%" y="65%" text-anchor="middle" font-family="system-ui" font-size="14" fill="#8b5cf6" font-weight="600">
           📸 ${fileName}
         </text>
         <text x="50%" y="75%" text-anchor="middle" font-family="system-ui" font-size="10" fill="#666">
           PegeArts Portfolio
         </text>
         <text x="50%" y="85%" text-anchor="middle" font-family="system-ui" font-size="8" fill="#999">
           Available when online
         </text>`
      }
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

// ===============================================
// PAGE FALLBACK HANDLER
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
    '/help': '/faq.html'
  };
  
  const mappedPage = pageMap[pathname];
  if (mappedPage) {
    const cachedPage = await caches.match(mappedPage);
    if (cachedPage) return cachedPage;
  }
  
  // Try offline.html
  const offlinePage = await caches.match('/offline.html');
  if (offlinePage) return offlinePage;
  
  // Try home page
  const homePage = await caches.match('/') || await caches.match('/index.html');
  if (homePage) return homePage;
  
  // Custom 404
  return await serve404Page(pathname);
}

// ===============================================
// ASSET FAILURE HANDLER
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
  if (cachedResponse) return cachedResponse;
  
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
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white min-h-screen flex items-center justify-center">
      <div class="text-center max-w-2xl mx-auto px-6">
        <div class="text-8xl mb-8">🚀</div>
        <h1 class="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">404</h1>
        <h2 class="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p class="text-lg opacity-80 mb-8">
          The page <code class="bg-purple-900/50 px-2 py-1 rounded">${pathname}</code> doesn't exist.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <a href="/" class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors">
            <i class="fas fa-home mr-2"></i> Home
          </a>
          <a href="/about.html" class="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg transition-colors">
            <i class="fas fa-user mr-2"></i> About
          </a>
          <a href="/faq.html" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors">
            <i class="fas fa-question mr-2"></i> FAQ
          </a>
          <a href="/sitemap.html" class="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors">
            <i class="fas fa-sitemap mr-2"></i> Sitemap
          </a>
        </div>
        
        <div class="text-sm opacity-60 space-y-1">
          <p>🌐 Complete Asset Cache Active</p>
          <p>📄 Audio, Images, Documents & Pages Cached</p>
          <p>${CURRENT_DOMAIN}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    status: 404,
    headers: { 'Content-Type': 'text/html' }
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
    totalCaches: Object.keys(cacheTypes).length,
    details: {},
    summary: {
      totalItems: 0,
      audioFiles: 0,
      imageFiles: 0,
      documentFiles: 0,
      htmlPages: 0
    }
  };
  
  for (const [cacheName, description] of Object.entries(cacheTypes)) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      status.details[cacheName] = {
        description,
        count: keys.length,
        items: keys.slice(0, 3).map(req => ({
          url: req.url,
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
    hostingType: IS_CUSTOM_DOMAIN ? 'custom' : 'github'
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
  }
}

console.log(`🚀 Complete PegeArts Portfolio Service Worker Ready!`);
console.log(`📊 Asset Types: Audio, Images, Icons, Documents, Pages`);
console.log(`🌐 Domain: ${CURRENT_DOMAIN}`);
console.log(`🎯 All your GitHub assets properly cached with RAW URLs`);
