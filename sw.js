// ===============================================
// 🚀 PEGEARTS COMPLETE PORTFOLIO SERVICE WORKER
// Enhanced with Performance Optimizations & Smart Caching
// Version: 3.2 - Production Ready with Advanced Features
// Author: Thanatsitt Santisamranwilai (PegeArts)
// ===============================================

// ===============================================
// 📋 CACHE CONFIGURATION & VERSIONING
// ===============================================
const CACHE_VERSION = 'pegearts-v3.2.0';
const CACHE_NAME = `${CACHE_VERSION}-complete`;
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const AUDIO_CACHE = `${CACHE_NAME}-audio`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;
const PAGES_CACHE = `${CACHE_NAME}-pages`;
const DOCUMENTS_CACHE = `${CACHE_NAME}-documents`;
const API_CACHE = `${CACHE_NAME}-api`;
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;

// ===============================================
// 🌐 AUTO-DETECT HOSTING SETUP
// ===============================================
const CURRENT_DOMAIN = self.location.origin;
const IS_CUSTOM_DOMAIN = CURRENT_DOMAIN.includes('pegearts.com');
const IS_GITHUB_PAGES = CURRENT_DOMAIN.includes('github.io');
const IS_VERCEL = CURRENT_DOMAIN.includes('vercel.app');
const IS_NETLIFY = CURRENT_DOMAIN.includes('netlify.app');

console.log(`🌐 Complete asset caching initialized on: ${CURRENT_DOMAIN}`);
console.log(`📡 Hosting detected: ${IS_CUSTOM_DOMAIN ? 'Custom Domain' : IS_GITHUB_PAGES ? 'GitHub Pages' : IS_VERCEL ? 'Vercel' : IS_NETLIFY ? 'Netlify' : 'Unknown'}`);

// ===============================================
// ⚡ PERFORMANCE & CONNECTION MANAGEMENT
// ===============================================
let isOnline = navigator.onLine || true;
let connectionQuality = 'fast';
let lastNetworkCheck = 0;
const NETWORK_CHECK_INTERVAL = 30000; // 30 seconds

// Enhanced cache size limits with dynamic adjustment
const MAX_CACHE_SIZE = {
  [STATIC_CACHE]: 200,       // CDN libraries & external resources
  [PAGES_CACHE]: 30,         // HTML pages
  [AUDIO_CACHE]: 20,         // Voice demo files (high priority)
  [IMAGE_CACHE]: 150,        // Images, icons, graphics
  [DOCUMENTS_CACHE]: 25,     // PDFs and documents
  [DYNAMIC_CACHE]: 75,       // Dynamic content
  [API_CACHE]: 50,           // API responses
  [RUNTIME_CACHE]: 100       // Runtime cached resources
};

// Enhanced connection detection with caching
async function detectConnection() {
  const now = Date.now();
  
  // Use cached result if recent
  if (now - lastNetworkCheck < NETWORK_CHECK_INTERVAL && connectionQuality !== 'unknown') {
    return connectionQuality;
  }
  
  try {
    if ('connection' in navigator && navigator.connection) {
      const conn = navigator.connection;
      const effectiveType = conn.effectiveType;
      const downlink = conn.downlink;
      const rtt = conn.rtt;
      
      // Advanced quality detection
      if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 0.5 || rtt > 2000) {
        connectionQuality = 'slow';
      } else if (effectiveType === '3g' || downlink < 2 || rtt > 1000) {
        connectionQuality = 'medium';
      } else if (effectiveType === '4g' && downlink >= 2 && rtt <= 1000) {
        connectionQuality = 'fast';
      } else {
        connectionQuality = 'fast'; // Default to fast for unknown
      }
      
      console.log(`📶 Connection: ${connectionQuality} (${effectiveType}, ${downlink}Mbps, ${rtt}ms RTT)`);
    } else {
      // Fallback: Performance-based detection
      const startTime = performance.now();
      try {
        await fetch('/favicon.ico', { 
          method: 'HEAD', 
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        });
        const elapsed = performance.now() - startTime;
        
        if (elapsed > 2000) connectionQuality = 'slow';
        else if (elapsed > 1000) connectionQuality = 'medium';
        else connectionQuality = 'fast';
        
        console.log(`📶 Connection: ${connectionQuality} (${elapsed.toFixed(0)}ms probe)`);
      } catch (error) {
        connectionQuality = 'slow';
        console.log(`📶 Connection: ${connectionQuality} (probe failed)`);
      }
    }
    
    lastNetworkCheck = now;
    isOnline = navigator.onLine;
    
  } catch (error) {
    console.warn('⚠️ Connection detection failed:', error.message);
    connectionQuality = 'medium'; // Safe fallback
  }
  
  return connectionQuality;
}

// Network status listeners
self.addEventListener('online', () => {
  isOnline = true;
  connectionQuality = 'unknown'; // Force re-detection
  console.log('🟢 Network: Online');
});

self.addEventListener('offline', () => {
  isOnline = false;
  connectionQuality = 'offline';
  console.log('🔴 Network: Offline');
});

// ===============================================
// 📂 COMPLETE ASSET URL GENERATORS (ENHANCED)
// ===============================================

// Audio files with fallback and validation
function getAudioUrls() {
  const baseLocal = '/assets/demo/voice/';
  const baseGitHub = 'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/demo/voice/';
  const projectsLocal = '/assets/projects/voice/';
  const projectsGitHub = 'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/projects/voice/';
  
  const audioFiles = [
    // Intro/Demo files (high priority)
    'intro/Thann_Intro.wav',
    'intro/PegeArts_Demo_Reel.wav',
    
    // Project files
    'narrative/thanattsitt-2033447-tha-4d5m7gd2g.mp3',
    
    // Commercial samples
    'commercial/Tech_Product_Launch.wav',
    'commercial/Lifestyle_Brand.wav',
    'commercial/Gaming_Platform.wav',
    
    // E-Learning samples
    'elearning/AI_Course_Module.wav',
    'elearning/Web_Dev_Tutorial.wav',
    'elearning/Business_Training.wav',
    
    // Narration samples
    'narration/Documentary_Sample.wav',
    'narration/Tech_Explainer.wav',
    'narration/Corporate_Story.wav',
    
    // Character/Animation
    'character/AI_Assistant.wav',
    'character/Game_Character.wav',
    'character/Animation_Voice.wav',
    
    // Multilingual samples
    'multilingual/Thai_Sample.wav',
    'multilingual/English_Accent_Neutral.wav',
    'multilingual/Tech_Bilingual.wav'
  ];
  
  if (IS_CUSTOM_DOMAIN) {
    return [
      ...audioFiles.map(file => `${baseLocal}${file}`),
      `${projectsLocal}narrative/thanattsitt-2033447-tha-4d5m7gd2g.mp3`
    ];
  } else {
    return [
      ...audioFiles.map(file => `${baseGitHub}${file}`),
      `${projectsGitHub}narrative/thanattsitt-2033447-tha-4d5m7gd2g.mp3`
    ];
  }
}

// Enhanced image URLs with comprehensive coverage
function getImageUrls() {
  const baseLocal = '/assets/images/';
  const baseGitHub = 'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/images/';
  
  const imageFiles = [
    // Profile images (high priority)
    'data/profile/1755844218313.jpg',
    'profile/thanatsitt-profile-main.jpg',
    'profile/thanatsitt-studio-setup.jpg',
    'profile/pegearts-workspace.jpg',
    
    // Project showcases
    'projects/ai-voice-assistant.jpg',
    'projects/multilingual-elearning.jpg',
    'projects/commercial-campaign.jpg',
    'projects/web-development-portfolio.jpg',
    'projects/machine-learning-model.jpg',
    'projects/voice-over-studio.jpg',
    
    // Technology stack visuals
    'tech/ai-development.svg',
    'tech/voice-recording.svg',
    'tech/web-development.svg',
    'tech/machine-learning.svg',
    'tech/audio-waveform.svg',
    
    // UI/UX elements
    'ui/hero-background.jpg',
    'ui/gradient-overlay.png',
    'ui/waveform-animation.gif',
    'ui/voice-visualizer.svg',
    'ui/audio-spectrum.svg',
    
    // Social media assets
    'social/og-image-1200x630.jpg',
    'social/twitter-card-1200x600.jpg',
    'social/linkedin-banner-1584x396.jpg',
    'social/facebook-cover-851x315.jpg',
    
    // Background patterns
    'backgrounds/hero-gradient.jpg',
    'backgrounds/studio-background.jpg',
    'backgrounds/tech-pattern.svg',
    'backgrounds/audio-waves.svg'
  ];
  
  const basePath = IS_CUSTOM_DOMAIN ? baseLocal : baseGitHub;
  return imageFiles.map(file => `${basePath}${file}`);
}

// Icon URLs with comprehensive PWA support
function getIconUrls() {
  const iconFiles = [
    // Standard favicons
    '/assets/icons/favicon-16x16.png',
    '/assets/icons/favicon-32x32.png',
    '/assets/icons/favicon.svg',
    '/favicon.ico',
    
    // Apple Touch Icons
    '/assets/icons/apple-touch-icon.png',
    '/assets/icons/apple-touch-icon-57x57.png',
    '/assets/icons/apple-touch-icon-60x60.png',
    '/assets/icons/apple-touch-icon-72x72.png',
    '/assets/icons/apple-touch-icon-76x76.png',
    '/assets/icons/apple-touch-icon-114x114.png',
    '/assets/icons/apple-touch-icon-120x120.png',
    '/assets/icons/apple-touch-icon-144x144.png',
    '/assets/icons/apple-touch-icon-152x152.png',
    '/assets/icons/apple-touch-icon-180x180.png',
    
    // Microsoft Tiles
    '/assets/icons/ms-icon-70x70.png',
    '/assets/icons/ms-icon-144x144.png',
    '/assets/icons/ms-icon-150x150.png',
    '/assets/icons/ms-icon-310x150.png',
    '/assets/icons/ms-icon-310x310.png',
    
    // PWA Manifest Icons
    '/assets/icons/web-app-manifest-192x192.png',
    '/assets/icons/web-app-manifest-512x512.png',
    '/assets/icons/maskable-icon-192x192.png',
    '/assets/icons/maskable-icon-512x512.png'
  ];
  
  if (!IS_CUSTOM_DOMAIN) {
    // Add GitHub raw URLs for non-custom domains
    const githubBase = 'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main';
    return [
      ...iconFiles,
      ...iconFiles.filter(icon => icon.startsWith('/assets/')).map(icon => `${githubBase}${icon}`)
    ];
  }
  
  return iconFiles;
}

// Document URLs with comprehensive file support
function getDocumentUrls() {
  const baseLocal = '/assets/sitedata/doc/';
  const baseGitHub = 'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/sitedata/doc/';
  
  const documentFiles = [
    // Primary documents
    'Thanns_Main_CV-4.pdf',
    'Thanatsitt_Resume_2024.pdf',
    'PegeArts_Portfolio_2024.pdf',
    
    // Voice over materials
    'Voice_Over_Rate_Card.pdf',
    'Voice_Demo_Scripts.pdf',
    'Audio_Technical_Specs.pdf',
    
    // Development portfolios
    'AI_Development_Portfolio.pdf',
    'Web_Development_Showcase.pdf',
    'Machine_Learning_Projects.pdf',
    
    // Business documents
    'Client_Testimonials.pdf',
    'Service_Agreement_Template.pdf',
    'Technical_Requirements.pdf',
    
    // Additional formats
    'README.txt',
    'CHANGELOG.md',
    'LICENSE.txt'
  ];
  
  const basePath = IS_CUSTOM_DOMAIN ? baseLocal : baseGitHub;
  return documentFiles.map(file => `${basePath}${file}`);
}

// ===============================================
// 📦 COMPLETE STATIC RESOURCES LIST
// ===============================================
const STATIC_RESOURCES = [
  // 📄 Core HTML Pages
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/portfolio.html',
  '/contact.html',
  '/blog.html',
  '/faq.html',
  '/help.html',
  '/privacy-policy.html',
  '/terms-of-service.html',
  '/cookie-policy.html',
  '/sitemap.html',
  '/offline.html',
  '/404.html',
  '/me.html',
  
  // 📱 PWA & Configuration Files
  '/manifest.json',
  '/sw.js',
  '/browserconfig.xml',
  '/robots.txt',
  
  // 🗺️ Sitemap & SEO Files
  '/sitemap.xml',
  '/audio-sitemap.xml',
  '/image-sitemap.xml',
  '/news-sitemap.xml',
  
  // 🎨 External CSS Libraries (with integrity)
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.css',
  
  // 📚 JavaScript Libraries (with version pinning)
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
  'https://unpkg.com/aos@2.3.1/dist/aos.js',
  'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js',
  'https://unpkg.com/typed.js@2.0.12',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://unpkg.com/lottie-web@5.9.6/build/player/lottie.min.js',
  
  // 🎵 Audio Files (High Priority)
  ...getAudioUrls(),
  
  // 🖼️ Image Files
  ...getImageUrls(),
  
  // 🎯 Icon Files
  ...getIconUrls(),
  
  // 📄 Document Files
  ...getDocumentUrls()
];

// ===============================================
// 🏷️ ENHANCED ASSET TYPE MAPPING
// ===============================================
const ASSET_TYPES = {
  audio: {
    extensions: ['.wav', '.mp3', '.ogg', '.m4a', '.aac', '.flac', '.weba'],
    mimeTypes: ['audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/flac', 'audio/webm'],
    cache: AUDIO_CACHE,
    strategy: 'CacheFirst',
    priority: 'high',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    patterns: ['/voice/', '/audio/', '/demo/']
  },
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp', '.ico'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif', 'image/bmp', 'image/x-icon'],
    cache: IMAGE_CACHE,
    strategy: 'CacheFirst',
    priority: 'medium',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    patterns: ['/images/', '/img/', '/assets/images/', '/icons/']
  },
  documents: {
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.md'],
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/rtf', 'text/markdown'],
    cache: DOCUMENTS_CACHE,
    strategy: 'CacheFirst',
    priority: 'medium',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    patterns: ['/doc/', '/documents/', '/assets/sitedata/doc/']
  },
  pages: {
    extensions: ['.html', '.htm'],
    mimeTypes: ['text/html'],
    cache: PAGES_CACHE,
    strategy: 'NetworkFirst',
    priority: 'high',
    maxAge: 60 * 60 * 1000, // 1 hour
    patterns: ['/']
  },
  scripts: {
    extensions: ['.js', '.mjs', '.ts'],
    mimeTypes: ['application/javascript', 'text/javascript', 'application/x-javascript', 'text/ecmascript'],
    cache: STATIC_CACHE,
    strategy: 'StaleWhileRevalidate',
    priority: 'high',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    patterns: ['/js/', '/scripts/', '.js']
  },
  styles: {
    extensions: ['.css', '.scss', '.sass', '.less'],
    mimeTypes: ['text/css'],
    cache: STATIC_CACHE,
    strategy: 'StaleWhileRevalidate',
    priority: 'high',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    patterns: ['/css/', '/styles/', '.css']
  },
  fonts: {
    extensions: ['.woff', '.woff2', '.ttf', '.otf', '.eot'],
    mimeTypes: ['font/woff', 'font/woff2', 'font/ttf', 'font/otf', 'application/vnd.ms-fontobject'],
    cache: STATIC_CACHE,
    strategy: 'CacheFirst',
    priority: 'high',
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    patterns: ['/fonts/', '/assets/fonts/', 'fonts.gstatic.com']
  },
  api: {
    extensions: ['.json', '.xml', '.api'],
    mimeTypes: ['application/json', 'application/xml', 'text/xml'],
    cache: API_CACHE,
    strategy: 'NetworkFirst',
    priority: 'medium',
    maxAge: 5 * 60 * 1000, // 5 minutes
    patterns: ['/api/', '/_api/', '/analytics/', '/_vercel/']
  }
};

// ===============================================
// 🧹 ENHANCED CACHE SIZE MANAGEMENT
// ===============================================
async function cleanupCache(cacheName, maxEntries = null, maxAge = null) {
  try {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    const currentMaxSize = maxEntries || MAX_CACHE_SIZE[cacheName] || 100;
    let cleanedCount = 0;
    
    console.log(`🧹 Cleaning cache: ${cacheName} (${requests.length}/${currentMaxSize} entries)`);
    
    // Remove expired entries based on age
    if (maxAge) {
      const now = Date.now();
      for (const request of requests) {
        try {
          const response = await cache.match(request);
          if (response) {
            const cachedDate = response.headers.get('sw-cached-date');
            const lastModified = response.headers.get('last-modified');
            const dateHeader = response.headers.get('date');
            
            let entryDate = now; // Default to now if no date found
            
            if (cachedDate) {
              entryDate = parseInt(cachedDate);
            } else if (lastModified) {
              entryDate = new Date(lastModified).getTime();
            } else if (dateHeader) {
              entryDate = new Date(dateHeader).getTime();
            }
            
            if (now - entryDate > maxAge) {
              await cache.delete(request);
              cleanedCount++;
              console.log(`🗑️ Expired: ${request.url.split('/').pop()}`);
            }
          }
        } catch (error) {
          console.warn(`⚠️ Error checking entry age for: ${request.url}`, error);
        }
      }
    }
    
    // Remove excess entries (FIFO - oldest first)
    const remainingRequests = await cache.keys();
    if (remainingRequests.length > currentMaxSize) {
      // Sort by URL timestamp or use FIFO approach
      const sortedRequests = remainingRequests.sort((a, b) => {
        // Simple FIFO based on URL (not perfect but workable)
        return a.url.localeCompare(b.url);
      });
      
      const excessCount = remainingRequests.length - currentMaxSize;
      const toDelete = sortedRequests.slice(0, excessCount);
      
      for (const request of toDelete) {
        await cache.delete(request);
        cleanedCount++;
        console.log(`🗑️ Excess: ${request.url.split('/').pop()}`);
      }
    }
    
    const finalRequests = await cache.keys();
    console.log(`✅ Cache cleanup complete: ${cacheName} (${cleanedCount} removed, ${finalRequests.length} remaining)`);
    
    return {
      cacheName,
      initialCount: requests.length,
      removedCount: cleanedCount,
      finalCount: finalRequests.length,
      success: true
    };
    
  } catch (error) {
    console.error(`❌ Cache cleanup failed for ${cacheName}:`, error);
    return {
      cacheName,
      error: error.message,
      success: false
    };
  }
}

// Comprehensive cache cleanup for all caches
async function cleanupAllCaches() {
  console.log('🧹 Starting comprehensive cache cleanup...');
  
  const cleanupPromises = Object.entries(MAX_CACHE_SIZE).map(([cacheName, maxSize]) => {
    const assetType = Object.values(ASSET_TYPES).find(type => type.cache === cacheName);
    return cleanupCache(cacheName, maxSize, assetType?.maxAge);
  });
  
  const results = await Promise.allSettled(cleanupPromises);
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
  const failed = results.filter(r => r.status === 'rejected' || !r.value.success);
  
  const totalRemoved = successful.reduce((sum, result) => sum + result.value.removedCount, 0);
  
  console.log(`🧹 Cleanup complete: ${successful.length}/${results.length} caches cleaned, ${totalRemoved} total items removed`);
  
  if (failed.length > 0) {
    console.warn(`⚠️ ${failed.length} cache cleanups failed:`, failed);
  }
  
  return {
    totalCaches: results.length,
    successfulCaches: successful.length,
    failedCaches: failed.length,
    totalItemsRemoved: totalRemoved,
    details: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason })
  };
}

// ===============================================
// 🚀 INTELLIGENT PRELOADING SYSTEM
// ===============================================
async function smartPreload() {
  const quality = await detectConnection();
  const isLowData = quality === 'slow';
  
  console.log(`🚀 Smart preload starting (connection: ${quality})`);
  
  if (quality === 'fast') {
    console.log('⚡ Fast connection: Full preload strategy');
    return await Promise.allSettled([
      preloadCriticalAssets(),
      preloadSpecificAssets('audio'),
      preloadSpecificAssets('images'),
      preloadSpecificAssets('documents')
    ]);
  } else if (quality === 'medium') {
    console.log('📱 Medium connection: Selective preload strategy');
    return await Promise.allSettled([
      preloadCriticalAssets(),
      preloadSpecificAssets('images') // Images only for medium
    ]);
  } else {
    console.log('🐌 Slow connection: Critical-only preload strategy');
    return await preloadCriticalAssets();
  }
}

// Preload critical assets only
async function preloadCriticalAssets() {
  const criticalAssets = [
    '/',
    '/manifest.json',
    ...getAudioUrls().slice(0, 2), // First 2 audio files
    ...getImageUrls().filter(url => url.includes('profile')).slice(0, 1), // Profile image only
    ...getIconUrls().filter(url => url.includes('favicon')).slice(0, 3) // Essential icons
  ];
  
  console.log(`📦 Preloading ${criticalAssets.length} critical assets...`);
  
  const results = await Promise.allSettled(
    criticalAssets.map(url => preloadSingleAsset(url))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  console.log(`✅ Critical preload: ${successful}/${criticalAssets.length} assets cached`);
  
  return {
    type: 'critical',
    total: criticalAssets.length,
    successful,
    failed: criticalAssets.length - successful
  };
}

// Preload specific asset type
async function preloadSpecificAssets(assetType) {
  let urls = [];
  let cacheName = RUNTIME_CACHE;
  
  switch (assetType) {
    case 'audio':
      urls = getAudioUrls();
      cacheName = AUDIO_CACHE;
      break;
    case 'images':
      urls = getImageUrls();
      cacheName = IMAGE_CACHE;
      break;
    case 'documents':
      urls = getDocumentUrls();
      cacheName = DOCUMENTS_CACHE;
      break;
    case 'icons':
      urls = getIconUrls();
      cacheName = IMAGE_CACHE;
      break;
    default:
      console.warn(`⚠️ Unknown asset type for preload: ${assetType}`);
      return { success: false, error: 'Unknown asset type' };
  }
  
  console.log(`📦 Preloading ${assetType}: ${urls.length} files...`);
  
  const cache = await caches.open(cacheName);
  const results = await Promise.allSettled(
    urls.map(url => cache.add(url).catch(error => {
      console.warn(`⚠️ Preload failed: ${url.split('/').pop()} - ${error.message}`);
      return { url, error: error.message };
    }))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected');
  
  console.log(`✅ ${assetType} preload: ${successful}/${urls.length} assets cached`);
  
  return {
    success: true,
    assetType,
    total: urls.length,
    successful,
    failed: failed.length,
    failures: failed.slice(0, 5).map(f => f.reason?.message || f.reason) // Limit failure details
  };
}

// Preload single asset with error handling
async function preloadSingleAsset(url) {
  try {
    const cacheName = getAssetCacheName(url);
    const cache = await caches.open(cacheName);
    
    // Check if already cached
    const existing = await cache.match(url);
    if (existing) {
      return { url, status: 'already_cached' };
    }
    
    // Fetch and cache
    await cache.add(url);
    return { url, status: 'cached' };
  } catch (error) {
    console.warn(`⚠️ Preload failed: ${url.split('/').pop()}`, error.message);
    throw error;
  }
}

// ===============================================
// 📊 ENHANCED DEBUG & STATISTICS
// ===============================================
function logComprehensiveStats() {
  console.group('📊 PegeArts Service Worker - Comprehensive Statistics');
  
  // Basic info
  console.log(`🌐 Domain: ${CURRENT_DOMAIN}`);
  console.log(`🏠 Hosting: ${IS_CUSTOM_DOMAIN ? 'Custom Domain' : IS_GITHUB_PAGES ? 'GitHub Pages' : IS_VERCEL ? 'Vercel' : IS_NETLIFY ? 'Netlify' : 'Unknown'}`);
  console.log(`💾 Cache Version: ${CACHE_VERSION}`);
  console.log(`📶 Connection: ${connectionQuality} (Online: ${isOnline})`);
  
  // Resource counts
  console.log(`📊 Total Static Resources: ${STATIC_RESOURCES.length}`);
  console.log(`🎵 Audio Files: ${getAudioUrls().length}`);
  console.log(`🖼️ Images: ${getImageUrls().length}`);
  console.log(`🎯 Icons: ${getIconUrls().length}`);
  console.log(`📄 Documents: ${getDocumentUrls().length}`);
  
  // Cache configuration
  console.log(`🔧 Cache Limits:`, MAX_CACHE_SIZE);
  
  // Asset type summary
  console.log(`🏷️ Asset Types Supported:`);
  Object.entries(ASSET_TYPES).forEach(([type, config]) => {
    console.log(`   ${type}: ${config.extensions.length} extensions, ${config.strategy} strategy, ${config.priority} priority`);
  });
  
  // Feature detection
  const features = [
    ['📱 Push Notifications', 'PushManager' in self],
    ['🔄 Background Sync', 'sync' in self.registration],
    ['📊 Storage API', 'storage' in navigator],
    ['🌐 Network Info', 'connection' in navigator],
    ['💾 Persistent Storage', 'storage' in navigator && 'persist' in navigator.storage],
    ['🎯 Performance API', 'performance' in self],
    ['🔐 Crypto API', 'crypto' in self],
    ['📡 Fetch API', 'fetch' in self]
  ];
  
  console.log(`🎯 Available Features:`);
  features.forEach(([name, available]) => {
    console.log(`   ${name}: ${available ? '✅' : '❌'}`);
  });
  
  console.groupEnd();
}

// ===============================================
// 🛠️ ENHANCED CACHE HELPER FUNCTIONS
// ===============================================

// Enhanced cache helper with detailed error handling
async function cacheWithFallback(cache, url, options = {}) {
  const maxRetries = options.retries || 2;
  const timeout = options.timeout || 10000;
  const priority = options.priority || 'normal';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create request with appropriate options
      const requestOptions = {
        cache: options.cache || 'default',
        mode: url.startsWith('http') && !url.includes(self.location.origin) ? 'cors' : 'same-origin',
        credentials: 'omit', // Don't send credentials for security
        redirect: 'follow'
      };
      
      // Add timeout for fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const request = new Request(url, {
        ...requestOptions,
        signal: controller.signal
      });
      
      const response = await fetch(request);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Add custom headers for tracking
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-date', Date.now().toString());
      headers.set('sw-cache-version', CACHE_VERSION);
      headers.set('sw-priority', priority);
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      await cache.put(url, modifiedResponse);
      
      console.log(`✅ Cached (attempt ${attempt}): ${url.split('/').pop()}`);
      return { 
        success: true, 
        url, 
        attempts: attempt,
        size: response.headers.get('content-length') || 'unknown',
        type: response.headers.get('content-type') || 'unknown'
      };
      
    } catch (error) {
      console.warn(`⚠️ Cache attempt ${attempt}/${maxRetries} failed: ${url.split('/').pop()} - ${error.message}`);
      
      if (attempt === maxRetries) {
        return { 
          success: false, 
          url, 
          error: error.message,
          attempts: attempt,
          critical: priority === 'high'
        };
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Get appropriate cache name for URL
function getAssetCacheName(url) {
  const urlObj = new URL(url, self.location.origin);
  const pathname = urlObj.pathname.toLowerCase();
  const extension = pathname.split('.').pop();
  
  // Check each asset type
  for (const [type, config] of Object.entries(ASSET_TYPES)) {
    // Check extensions
    if (config.extensions.includes(`.${extension}`)) {
      return config.cache;
    }
    
    // Check patterns
    if (config.patterns.some(pattern => pathname.includes(pattern.toLowerCase()))) {
      return config.cache;
    }
    
    // Check hostname patterns for external resources
    if (config.patterns.some(pattern => urlObj.hostname.includes(pattern))) {
      return config.cache;
    }
  }
  
  // Default fallbacks
  if (pathname.endsWith('/') || extension === 'html') return PAGES_CACHE;
  if (urlObj.hostname !== self.location.hostname) return STATIC_CACHE;
  
  return RUNTIME_CACHE;
}

// Get asset type from URL
function getAssetType(url) {
  const urlObj = new URL(url, self.location.origin);
  const pathname = urlObj.pathname.toLowerCase();
  const extension = pathname.split('.').pop();
  
  for (const [type, config] of Object.entries(ASSET_TYPES)) {
    if (config.extensions.includes(`.${extension}`) || 
        config.patterns.some(pattern => pathname.includes(pattern.toLowerCase()))) {
      return type;
    }
  }
  
  return 'unknown';
}

// ===============================================
// 🎯 INSTALL EVENT - COMPREHENSIVE CACHING
// ===============================================
self.addEventListener('install', event => {
  console.log(`🚀 Installing PegeArts Complete Service Worker v${CACHE_VERSION}...`);
  logComprehensiveStats();
  
  event.waitUntil(
    (async () => {
      try {
        // Initialize all caches
        const cacheNames = [STATIC_CACHE, PAGES_CACHE, AUDIO_CACHE, IMAGE_CACHE, DOCUMENTS_CACHE, DYNAMIC_CACHE, API_CACHE, RUNTIME_CACHE];
        await Promise.all(cacheNames.map(name => caches.open(name)));
        console.log(`📦 Initialized ${cacheNames.length} cache stores`);
        
        // Organize resources by type
        const resourcesByType = {
          libraries: STATIC_RESOURCES.filter(url => 
            url.includes('cdn') || url.includes('googleapis.com') || 
            url.includes('unpkg.com') || url.includes('jsdelivr.net') ||
            url.includes('tailwindcss.com')
          ),
          pages: STATIC_RESOURCES.filter(url => 
            url.endsWith('.html') || url === '/' || url.endsWith('.xml') ||
            url === '/manifest.json' || url === '/sw.js' || url === '/robots.txt'
          ),
          audio: getAudioUrls(),
          images: getImageUrls(),
          icons: getIconUrls(),
          documents: getDocumentUrls()
        };
        
        console.log(`📋 Resource organization:`);
        Object.entries(resourcesByType).forEach(([type, resources]) => {
          console.log(`   ${type}: ${resources.length} files`);
        });
        
        // Cache resources by priority
        const cachingResults = await Promise.allSettled([
          // High priority: Libraries and critical resources
          cacheResourceBatch(STATIC_CACHE, resourcesByType.libraries, 'libraries', { priority: 'high', retries: 3 }),
          
          // High priority: HTML pages
          cacheResourceBatch(PAGES_CACHE, resourcesByType.pages, 'pages', { priority: 'high', retries: 2 }),
          
          // Medium priority: Audio files (user experience critical)
          cacheResourceBatch(AUDIO_CACHE, resourcesByType.audio, 'audio', { priority: 'medium', retries: 2 }),
          
          // Medium priority: Images and icons
          cacheResourceBatch(IMAGE_CACHE, [...resourcesByType.images, ...resourcesByType.icons], 'images', { priority: 'medium', retries: 1 }),
          
          // Low priority: Documents
          cacheResourceBatch(DOCUMENTS_CACHE, resourcesByType.documents, 'documents', { priority: 'low', retries: 1 })
        ]);
        
        // Process results
        const results = cachingResults.map((result, index) => {
          const types = ['libraries', 'pages', 'audio', 'images', 'documents'];
          const type = types[index];
          
          if (result.status === 'fulfilled') {
            const { successful, failed, total } = result.value;
            console.log(`✅ ${type}: ${successful}/${total} cached (${failed} failed)`);
            return { type, successful, failed, total, status: 'success' };
          } else {
            console.error(`❌ ${type}: caching failed -`, result.reason);
            return { type, status: 'failed', error: result.reason };
          }
        });
        
        // Calculate overall success rate
        const totalSuccessful = results.reduce((sum, r) => sum + (r.successful || 0), 0);
        const totalAttempted = results.reduce((sum, r) => sum + (r.total || 0), 0);
        const successRate = totalAttempted > 0 ? ((totalSuccessful / totalAttempted) * 100).toFixed(1) : 0;
        
        console.log(`📊 Installation Summary: ${totalSuccessful}/${totalAttempted} resources cached (${successRate}% success rate)`);
        
        // Smart preloading based on connection
        if (successRate > 50) { // Only if basic caching was successful
          try {
            const preloadResult = await smartPreload();
            console.log(`🚀 Smart preload completed:`, preloadResult);
          } catch (error) {
            console.warn(`⚠️ Smart preload failed:`, error);
          }
        }
        
        // Skip waiting to activate immediately
        await self.skipWaiting();
        console.log(`🎯 Service Worker installation complete - activated immediately`);
        
      } catch (error) {
        console.error('❌ Service Worker installation failed:', error);
        throw error; // Re-throw to trigger failed installation
      }
    })()
  );
});

// Cache resource batch with detailed tracking
async function cacheResourceBatch(cacheName, resources, batchName, options = {}) {
  if (!resources || resources.length === 0) {
    return { batchName, total: 0, successful: 0, failed: 0, results: [] };
  }
  
  console.log(`📦 Caching ${batchName}: ${resources.length} resources...`);
  
  const cache = await caches.open(cacheName);
  const batchSize = options.batchSize || 5; // Process in smaller batches to avoid overwhelming
  const batches = [];
  
  // Split into batches
  for (let i = 0; i < resources.length; i += batchSize) {
    batches.push(resources.slice(i, i + batchSize));
  }
  
  const allResults = [];
  let successful = 0;
  let failed = 0;
  
  // Process batches sequentially to avoid overwhelming the browser
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`📦 Processing ${batchName} batch ${i + 1}/${batches.length} (${batch.length} items)...`);
    
    const batchResults = await Promise.allSettled(
      batch.map(url => cacheWithFallback(cache, url, options))
    );
    
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        allResults.push(result.value);
        if (result.value.success) {
          successful++;
        } else {
          failed++;
        }
      } else {
        allResults.push({ success: false, error: result.reason });
        failed++;
      }
    });
    
    // Brief pause between batches
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`✅ ${batchName} batch complete: ${successful}/${resources.length} successful`);
  
  return {
    batchName,
    total: resources.length,
    successful,
    failed,
    results: allResults.slice(0, 10) // Limit detailed results to prevent memory issues
  };
}

// ===============================================
// 🔄 ACTIVATE EVENT - ENHANCED CLEANUP & SETUP
// ===============================================
self.addEventListener('activate', event => {
  console.log(`🔄 Activating PegeArts Service Worker v${CACHE_VERSION}...`);
  
  event.waitUntil(
    (async () => {
      try {
        // Get all existing cache names
        const existingCacheNames = await caches.keys();
        const currentCacheNames = [STATIC_CACHE, PAGES_CACHE, AUDIO_CACHE, IMAGE_CACHE, DOCUMENTS_CACHE, DYNAMIC_CACHE, API_CACHE, RUNTIME_CACHE];
        
        console.log(`🔍 Found ${existingCacheNames.length} existing caches`);
        
        // Identify old caches to delete
        const oldCaches = existingCacheNames.filter(name => 
          name.startsWith('pegearts-') && !currentCacheNames.includes(name)
        );
        
        // Delete old caches
        if (oldCaches.length > 0) {
          console.log(`🗑️ Deleting ${oldCaches.length} old caches...`);
          const deletionResults = await Promise.allSettled(
            oldCaches.map(cacheName => {
              console.log(`🗑️ Deleting: ${cacheName}`);
              return caches.delete(cacheName);
            })
          );
          
          const deletedCount = deletionResults.filter(r => r.status === 'fulfilled').length;
                    console.log(`✅ Deleted ${deletedCount}/${oldCaches.length} old caches`);
        } else {
          console.log(`✨ No old caches to delete`);
        }
        
        // Perform comprehensive cache cleanup
        console.log(`🧹 Performing cache maintenance...`);
        const cleanupResults = await cleanupAllCaches();
        console.log(`🧹 Cache cleanup results:`, cleanupResults);
        
        // Take control of all clients immediately
        await self.clients.claim();
        console.log(`👑 Claimed control of all clients`);
        
        // Get final cache statistics
        const finalStats = await getFinalCacheStatistics();
        console.log(`📊 Final cache statistics:`, finalStats);
        
        // Detect connection quality for optimizations
        const connectionQuality = await detectConnection();
        console.log(`📶 Connection quality: ${connectionQuality}`);
        
        // Notify all clients of successful activation
        const clients = await self.clients.matchAll({ includeUncontrolled: true });
        const activationMessage = {
          type: 'SW_ACTIVATED',
          version: CACHE_VERSION,
          message: '🎉 PegeArts portfolio with complete asset caching is now active!',
          stats: finalStats,
          connectionQuality,
          domain: CURRENT_DOMAIN,
          hostingType: IS_CUSTOM_DOMAIN ? 'custom' : IS_GITHUB_PAGES ? 'github' : IS_VERCEL ? 'vercel' : IS_NETLIFY ? 'netlify' : 'unknown',
          features: {
            audioFiles: getAudioUrls().length,
            imageFiles: getImageUrls().length,
            iconFiles: getIconUrls().length,
            documentFiles: getDocumentUrls().length,
            totalAssets: STATIC_RESOURCES.length
          },
          timestamp: new Date().toISOString()
        };
        
        clients.forEach(client => {
          try {
            client.postMessage(activationMessage);
          } catch (error) {
            console.warn('⚠️ Failed to message client:', error);
          }
        });
        
        console.log(`📢 Notified ${clients.length} clients of activation`);
        
        // Schedule initial health check
        setTimeout(() => {
          performComprehensiveHealthCheck().catch(error => {
            console.warn('⚠️ Initial health check failed:', error);
          });
        }, 5000);
        
        console.log(`✅ PegeArts Service Worker v${CACHE_VERSION} activation complete`);
        logComprehensiveStats();
        
      } catch (error) {
        console.error('❌ Service Worker activation failed:', error);
        throw error;
      }
    })()
  );
});

// Get comprehensive cache statistics
async function getFinalCacheStatistics() {
  const cacheNames = [STATIC_CACHE, PAGES_CACHE, AUDIO_CACHE, IMAGE_CACHE, DOCUMENTS_CACHE, DYNAMIC_CACHE, API_CACHE, RUNTIME_CACHE];
  const stats = {
    totalCaches: cacheNames.length,
    totalItems: 0,
    cacheDetails: {},
    storageEstimate: await getStorageEstimate()
  };
  
  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      const itemCount = keys.length;
      const maxSize = MAX_CACHE_SIZE[cacheName] || 100;
      
      stats.cacheDetails[cacheName] = {
        items: itemCount,
        maxSize,
        utilizationPercent: Math.round((itemCount / maxSize) * 100),
        sampleItems: keys.slice(0, 3).map(req => ({
          url: req.url.split('/').pop(),
          method: req.method
        }))
      };
      
      stats.totalItems += itemCount;
    } catch (error) {
      stats.cacheDetails[cacheName] = {
        error: error.message
      };
    }
  }
  
  return stats;
}

// ===============================================
// 🌐 FETCH EVENT - INTELLIGENT REQUEST ROUTING
// ===============================================
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip non-HTTP protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip browser extensions and special schemes
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' || 
      url.protocol === 'safari-web-extension:') {
    return;
  }
  
  // Skip WebSocket upgrades
  if (request.headers.get('upgrade') === 'websocket') {
    return;
  }
  
  event.respondWith(handleIntelligentRequest(request));
});

// ===============================================
// 🧠 INTELLIGENT REQUEST HANDLER (COMPREHENSIVE)
// ===============================================
async function handleIntelligentRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();
  const assetType = getAssetType(request.url);
  const startTime = performance.now();
  
  try {
    // Route 1: HTML Pages and Navigation (Network First with Smart Fallback)
    if (isNavigationRequest(request) || assetType === 'pages') {
      return await handlePageRequest(request);
    }
    
    // Route 2: Audio Files (Cache First - High Priority for UX)
    if (assetType === 'audio') {
      return await handleAudioRequest(request);
    }
    
    // Route 3: Images and Icons (Cache First with Smart Updates)
    if (assetType === 'images') {
      return await handleImageRequest(request);
    }
    
    // Route 4: Documents (Cache First with Validation)
    if (assetType === 'documents') {
      return await handleDocumentRequest(request);
    }
    
    // Route 5: CSS and JavaScript (Stale While Revalidate)
    if (assetType === 'scripts' || assetType === 'styles') {
      return await handleStaticAssetRequest(request);
    }
    
    // Route 6: Fonts (Cache First - Long Term)
    if (assetType === 'fonts') {
      return await handleFontRequest(request);
    }
    
    // Route 7: API Requests (Network First with Short Cache)
    if (assetType === 'api' || isAPIRequest(request)) {
      return await handleAPIRequest(request);
    }
    
    // Route 8: External CDN Resources (Stale While Revalidate with Long Cache)
    if (isExternalCDN(url)) {
      return await handleCDNRequest(request);
    }
    
    // Route 9: GitHub Raw Content (Cache First for Portfolio Assets)
    if (isGitHubRawContent(url)) {
      return await handleGitHubRawRequest(request);
    }
    
    // Route 10: Google Fonts (Cache First - Very Long Term)
    if (isGoogleFonts(url)) {
      return await handleGoogleFontsRequest(request);
    }
    
    // Route 11: Same Origin Assets (Smart Network First)
    if (url.origin === self.location.origin) {
      return await handleSameOriginRequest(request);
    }
    
    // Default Route: Generic Network First
    return await handleGenericRequest(request);
    
  } catch (error) {
    const responseTime = performance.now() - startTime;
    console.error(`❌ Request failed: ${pathname.split('/').pop()} (${responseTime.toFixed(0)}ms) - ${error.message}`);
    
    // Performance monitoring
    if (typeof performanceMonitor !== 'undefined') {
      performanceMonitor.recordFailedRequest(request.url, error);
    }
    
    // Error tracking
    if (typeof errorTracker !== 'undefined') {
      errorTracker.logError(request.url, error, assetType);
    }
    
    return await handleRequestFailure(request, error, assetType);
  }
}

// ===============================================
// 🔍 REQUEST TYPE DETECTION FUNCTIONS
// ===============================================

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         request.destination === 'document' ||
         (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  const apiPatterns = ['/api/', '/_api/', '/analytics/', '/_vercel/', '/graphql', '/rest/'];
  return apiPatterns.some(pattern => url.pathname.includes(pattern)) ||
         request.headers.get('accept')?.includes('application/json');
}

function isExternalCDN(url) {
  const cdnDomains = [
    'cdnjs.cloudflare.com',
    'unpkg.com',
    'jsdelivr.net',
    'cdn.tailwindcss.com',
    'stackpath.bootstrapcdn.com',
    'maxcdn.bootstrapcdn.com',
    'ajax.googleapis.com'
  ];
  return cdnDomains.some(domain => url.hostname.includes(domain));
}

function isGitHubRawContent(url) {
  return url.hostname === 'raw.githubusercontent.com' && 
         url.pathname.includes('/Pigletpeakkung/artofppage/');
}

function isGoogleFonts(url) {
  return url.hostname.includes('fonts.googleapis.com') || 
         url.hostname.includes('fonts.gstatic.com');
}

// ===============================================
// 📄 SPECIALIZED REQUEST HANDLERS
// ===============================================

// Handle HTML page requests with intelligent fallbacks
async function handlePageRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Network first for fresh content
    const networkResponse = await fetch(request, { 
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (networkResponse && networkResponse.ok) {
      // Cache the fresh response
      const cache = await caches.open(PAGES_CACHE);
      const responseToCache = networkResponse.clone();
      
      // Add caching headers
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-date', Date.now().toString());
      headers.set('sw-cache-version', CACHE_VERSION);
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
      console.log(`📄 Fresh page served and cached: ${pathname}`);
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
    
  } catch (error) {
    console.log(`🔄 Network failed for page ${pathname}, trying cache...`);
    
    // Try exact cache match
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`📄 Cached page served: ${pathname}`);
      return cachedResponse;
    }
    
    // Try page mapping and intelligent fallbacks
    return await handlePageFallback(pathname, request);
  }
}

// Handle audio requests with high priority caching
async function handleAudioRequest(request) {
  const url = new URL(request.url);
  const fileName = url.pathname.split('/').pop();
  
  try {
    // Check cache first (Cache First strategy for audio)
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`🎵 Audio cache hit: ${fileName}`);
      if (typeof performanceMonitor !== 'undefined') {
        performanceMonitor.recordCacheHit(request.url);
      }
      return cachedResponse;
    }
    
    console.log(`🌐 Fetching audio: ${fileName}`);
    if (typeof performanceMonitor !== 'undefined') {
      performanceMonitor.recordCacheMiss(request.url);
    }
    
    // Network fetch with timeout
    const networkResponse = await fetch(request, {
      signal: AbortSignal.timeout(15000) // 15 second timeout for audio
    });
    
    if (networkResponse && networkResponse.ok) {
      // Cache the audio file
      const cache = await caches.open(AUDIO_CACHE);
      const responseToCache = networkResponse.clone();
      
      // Add metadata headers
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-date', Date.now().toString());
      headers.set('sw-asset-type', 'audio');
      headers.set('sw-priority', 'high');
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
      console.log(`✅ Audio cached: ${fileName}`);
      
      // Cleanup cache if needed
      setTimeout(() => {
        cleanupCache(AUDIO_CACHE, MAX_CACHE_SIZE[AUDIO_CACHE]);
      }, 1000);
      
      return networkResponse;
    }
    
    throw new Error(`Audio network response not ok: ${networkResponse.status}`);
    
  } catch (error) {
    console.error(`❌ Audio request failed: ${fileName} - ${error.message}`);
    return await createAudioFallback(request, error);
  }
}

// Handle image requests with smart caching
async function handleImageRequest(request) {
  const url = new URL(request.url);
  const fileName = url.pathname.split('/').pop();
  
  try {
    // Check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if image is stale (older than max age)
      const cachedDate = cachedResponse.headers.get('sw-cached-date');
      const maxAge = ASSET_TYPES.images.maxAge;
      
      if (cachedDate && (Date.now() - parseInt(cachedDate)) < maxAge) {
        console.log(`🖼️ Image cache hit: ${fileName}`);
        if (typeof performanceMonitor !== 'undefined') {
          performanceMonitor.recordCacheHit(request.url);
        }
        return cachedResponse;
      }
    }
    
    console.log(`🌐 Fetching image: ${fileName}`);
    if (typeof performanceMonitor !== 'undefined') {
      performanceMonitor.recordCacheMiss(request.url);
    }
    
    // Network fetch
    const networkResponse = await fetch(request, {
      signal: AbortSignal.timeout(10000) // 10 second timeout for images
    });
    
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      const responseToCache = networkResponse.clone();
      
      // Add metadata
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-date', Date.now().toString());
      headers.set('sw-asset-type', 'image');
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
      console.log(`✅ Image cached: ${fileName}`);
      return networkResponse;
    }
    
    throw new Error(`Image network response not ok: ${networkResponse.status}`);
    
  } catch (error) {
    // If we have a stale cached version, serve it
    const staleResponse = await caches.match(request);
    if (staleResponse) {
      console.log(`📦 Serving stale image: ${fileName}`);
      return staleResponse;
    }
    
    console.error(`❌ Image request failed: ${fileName} - ${error.message}`);
    return await createImagePlaceholder(request, error);
  }
}

// Handle document requests
async function handleDocumentRequest(request) {
  const url = new URL(request.url);
  const fileName = url.pathname.split('/').pop();
  
  try {
    // Cache first for documents
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`📄 Document cache hit: ${fileName}`);
      return cachedResponse;
    }
    
    console.log(`🌐 Fetching document: ${fileName}`);
    const networkResponse = await fetch(request, {
      signal: AbortSignal.timeout(20000) // 20 second timeout for documents
    });
    
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(DOCUMENTS_CACHE);
      cache.put(request, networkResponse.clone());
      console.log(`✅ Document cached: ${fileName}`);
      return networkResponse;
    }
    
    throw new Error(`Document network response not ok: ${networkResponse.status}`);
    
  } catch (error) {
    console.error(`❌ Document request failed: ${fileName} - ${error.message}`);
    return await createDocumentFallback(request, error);
  }
}

// Handle static assets (CSS/JS)
async function handleStaticAssetRequest(request) {
  const url = new URL(request.url);
  const fileName = url.pathname.split('/').pop();
  
  // Stale while revalidate strategy
  const cachedResponse = await caches.match(request);
  
  // Serve from cache immediately if available
  const serveFromCache = cachedResponse ? Promise.resolve(cachedResponse) : null;
  
  // Update cache in background
  const updateCache = fetch(request).then(async networkResponse => {
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log(`🔄 Static asset updated: ${fileName}`);
    }
    return networkResponse;
  }).catch(error => {
    console.warn(`⚠️ Failed to update static asset: ${fileName} - ${error.message}`);
    return cachedResponse;
  });
  
  // Return cached version or wait for network
  if (serveFromCache) {
    console.log(`📦 Static asset from cache: ${fileName}`);
    updateCache; // Fire and forget update
    return serveFromCache;
  } else {
    console.log(`🌐 Static asset from network: ${fileName}`);
    return updateCache;
  }
}

// Handle font requests
async function handleFontRequest(request) {
  // Cache first with very long expiration
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Fonts are not critical, return a generic error
    return new Response('Font not available', { 
      status: 404, 
      statusText: 'Font Not Found' 
    });
  }
}

// Handle API requests
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Network first for API requests
    const networkResponse = await fetch(request, {
      signal: AbortSignal.timeout(8000) // 8 second timeout
    });
    
    if (networkResponse && networkResponse.ok) {
      // Cache successful API responses briefly
      const cache = await caches.open(API_CACHE);
      const responseToCache = networkResponse.clone();
      
      // Add short expiration
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-date', Date.now().toString());
      headers.set('sw-expires', (Date.now() + ASSET_TYPES.api.maxAge).toString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
      return networkResponse;
    }
    
    throw new Error(`API response not ok: ${networkResponse.status}`);
    
  } catch (error) {
    // Try cached version for failed API requests
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if not expired
      const expiresHeader = cachedResponse.headers.get('sw-expires');
      if (!expiresHeader || Date.now() < parseInt(expiresHeader)) {
        console.log(`📦 Serving cached API response: ${url.pathname}`);
        return cachedResponse;
      }
    }
    
    throw error;
  }
}

// Handle CDN requests
async function handleCDNRequest(request) {
  return await handleStaticAssetRequest(request); // Same as static assets
}

// Handle GitHub raw content
async function handleGitHubRawRequest(request) {
  const assetType = getAssetType(request.url);
  
  // Route to appropriate handler based on asset type
  switch (assetType) {
    case 'audio':
      return await handleAudioRequest(request);
    case 'images':
      return await handleImageRequest(request);
    case 'documents':
      return await handleDocumentRequest(request);
    default:
      return await handleStaticAssetRequest(request);
  }
}

// Handle Google Fonts
async function handleGoogleFontsRequest(request) {
  return await handleFontRequest(request);
}

// Handle same origin requests
async function handleSameOriginRequest(request) {
  const connectionQuality = await detectConnection();
  
  if (connectionQuality === 'slow') {
    // Use cache-first for slow connections
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
  }
  
  // Network first for same origin
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

// Handle generic requests
async function handleGenericRequest(request) {
  return await handleSameOriginRequest(request); // Same logic
}

// ===============================================
// 🚨 FALLBACK & ERROR HANDLING
// ===============================================

// Handle page fallbacks with intelligent routing
async function handlePageFallback(pathname, originalRequest) {
  console.log(`🔄 Handling page fallback for: ${pathname}`);
  
  // Page mapping for common routes
  const pageMapping = {
    // Direct mappings
    '/about': '/about.html',
    '/services': '/services.html',
    '/portfolio': '/portfolio.html',
    '/contact': '/contact.html',
    '/blog': '/blog.html',
    '/faq': '/faq.html',
    '/help': '/faq.html',
    '/terms': '/terms-of-service.html',
    '/privacy': '/privacy-policy.html',
    '/cookies': '/cookie-policy.html',
    '/sitemap': '/sitemap.html',
    
    // Alternative spellings
    '/about-me': '/about.html',
    '/about-us': '/about.html',
    '/service': '/services.html',
    '/work': '/portfolio.html',
    '/projects': '/portfolio.html',
    '/contact-us': '/contact.html',
    '/get-in-touch': '/contact.html',
    '/frequently-asked-questions': '/faq.html',
    '/terms-and-conditions': '/terms-of-service.html',
    '/privacy-policy': '/privacy-policy.html',
    '/cookie-policy': '/cookie-policy.html',
    
    // Common typos
    '/abot': '/about.html',
    '/protfolio': '/portfolio.html',
    '/contakt': '/contact.html'
  };
  
  // Try mapped page
  const mappedPage = pageMapping[pathname.toLowerCase()];
  if (mappedPage) {
    const cachedMapped = await caches.match(mappedPage);
    if (cachedMapped) {
      console.log(`📄 Serving mapped page: ${mappedPage} for ${pathname}`);
      return cachedMapped;
    }
  }
  
  // Try removing trailing slash
  if (pathname.endsWith('/') && pathname !== '/') {
    const withoutSlash = pathname.slice(0, -1) + '.html';
    const cachedWithoutSlash = await caches.match(withoutSlash);
    if (cachedWithoutSlash) {
      console.log(`📄 Serving without slash: ${withoutSlash}`);
      return cachedWithoutSlash;
    }
  }
  
  // Try adding .html extension
  if (!pathname.includes('.')) {
    const withHtml = pathname + '.html';
    const cachedWithHtml = await caches.match(withHtml);
    if (cachedWithHtml) {
      console.log(`📄 Serving with .html: ${withHtml}`);
      return cachedWithHtml;
    }
  }
  
  // Try offline page
  const offlinePage = await caches.match('/offline.html');
  if (offlinePage) {
    console.log(`📄 Serving offline page for: ${pathname}`);
    return offlinePage;
  }
  
  // Try home page as last resort
  const homePage = await caches.match('/') || await caches.match('/index.html');
  if (homePage) {
    console.log(`📄 Serving home page as fallback for: ${pathname}`);
    return homePage;
  }
  
  // Generate custom 404 page
  return await createDynamic404Page(pathname, originalRequest);
}

// Handle request failures
async function handleRequestFailure(request, error, assetType) {
  const url = new URL(request.url);
  
  // Try any cached version first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log(`📦 Serving stale cache for failed request: ${url.pathname.split('/').pop()}`);
    return cachedResponse;
  }
  
  // Handle specific asset types
  switch (assetType) {
    case 'audio':
      return await createAudioFallback(request, error);
    case 'images':
      return await createImagePlaceholder(request, error);
    case 'documents':
      return await createDocumentFallback(request, error);
    case 'pages':
      return await handlePageFallback(url.pathname, request);
    default:
      return await createGenericFallback(request, error, assetType);
  }
}

// ===============================================
// 🎨 FALLBACK CONTENT GENERATORS
// ===============================================

// Create audio fallback
async function createAudioFallback(request, error) {
  const url = new URL(request.url);
  const fileName = url.pathname.split('/').pop();
  
  const fallbackData = {
    error: 'Audio not available offline',
    message: `Voice demo "${fileName}" will be available when you're back online`,
    file: fileName,
    type: 'audio',
    domain: CURRENT_DOMAIN,
    suggestion: 'Please check your internet connection and try again',
    alternatives: [
      'Browse other portfolio sections',
      'Read about voice services',
      'View visual portfolio items'
    ],
    contact: {
      email: 'thanattsitt.info@yahoo.co.uk',
      message: 'Contact for audio samples via email'
    },
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(fallbackData, null, 2), {
    status: 503,
    statusText: 'Audio Offline',
    headers: { 
      'Content-Type': 'application/json',
      'X-Offline-Resource': 'audio',
      'X-Fallback-Type': 'structured-data'
    }
  });
}

// Create enhanced image placeholder
async function createImagePlaceholder(request, error) {
  const url = new URL(request.url);
  const fileName = url.pathname.split('/').pop();
  const isIcon = fileName.includes('icon') || fileName.includes('favicon');
  const isProfile = url.pathname.includes('profile');
  const isProject = url.pathname.includes('project');
  
  let width = '400';
  let height = '300';
  let emoji = '📸';
  let title = 'Image';
  
  if (isIcon) {
    width = height = '64';
    emoji = '🎨';
    title = 'Icon';
  } else if (isProfile) {
    width = height = '300';
    emoji = '👨‍💻';
    title = 'Profile Photo';
  } else if (isProject) {
    width = '400';
    height = '250';
    emoji = '🚀';
    title = 'Project Image';
  }
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.9"/>
          <stop offset="50%" style="stop-color:#ec4899;stop-opacity:0.7"/>
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.8"/>
        </linearGradient>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.5" fill="#ffffff" opacity="0.4"/>
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#grad)" rx="${isIcon ? '8' : '12'}"/>
      <rect width="100%" height="100%" fill="url(#dots)" opacity="0.6"/>
      
      ${isIcon ? 
        `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
               font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="white" 
               filter="url(#glow)">${emoji}</text>` :
        `<circle cx="50%" cy="35%" r="15%" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
         <text x="50%" y="35%" text-anchor="middle" dominant-baseline="middle" 
               font-family="system-ui, -apple-system, sans-serif" font-size="48" fill="white" 
               filter="url(#glow)">${emoji}</text>
         <text x="50%" y="60%" text-anchor="middle" 
               font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="white" 
               font-weight="600" filter="url(#glow)">
           ${title}
         </text>
         <text x="50%" y="75%" text-anchor="middle" 
               font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="white" 
               opacity="0.9">
           ${fileName.length > 25 ? fileName.substring(0, 22) + '...' : fileName}
         </text>
         <text x="50%" y="85%" text-anchor="middle" 
               font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="white" 
               opacity="0.7">
           PegeArts Portfolio
         </text>
         <text x="50%" y="93%" text-anchor="middle" 
               font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="white" 
               opacity="0.6">
           Available when online
         </text>`
      }
    </svg>
  `;
  
  return new Response(svg, {
    status: 200,
    statusText: 'Image Placeholder',
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache',
      'X-Offline-Resource': 'image-placeholder',
      'X-Generated-By': 'PegeArts-SW'
    }
  });
}

// Create document fallback
async function createDocumentFallback(request, error) {
  const url = new URL(request.url);
  const fileName = url.pathname.split('/').pop();
  
  const fallbackData = {
    error: 'Document not available offline',
    message: `Document "${fileName}" will be available when you're back online`,
    file: fileName,
    type: 'document',
    domain: CURRENT_DOMAIN,
    alternativeContent: {
      name: 'Thanatsitt Santisamranwilai (PegeArts)',
      title: 'AI Developer & Voice Artist',
      expertise: [
        'Modern Web Development (React, Node.js, Python)',
        'Machine Learning & AI Implementation',
        'Professional Voice Over Services',
        'Multilingual Content Creation (English/Thai)',
        'Technical Documentation & Training'
      ],
      contact: {
        email: 'thanattsitt.info@yahoo.co.uk',
        website: CURRENT_DOMAIN,
        note: 'Full documents available online'
      }
    },
    availableOnline: [
      'Complete Resume/CV',
      'Portfolio Documentation',
      'Technical Specifications',
      'Voice Over Rate Cards',
      'Client Testimonials'
    ],
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(fallbackData, null, 2), {
    status: 503,
    statusText: 'Document Offline',
    headers: { 
      'Content-Type': 'application/json',
      'X-Offline-Resource': 'document',
      'X-Fallback-Type': 'structured-data'
    }
  });
}

// Create dynamic 404 page
async function createDynamic404Page(pathname, originalRequest) {
  const suggestions = [];
  
  // Generate intelligent suggestions based on path
  if (pathname.includes('audio') || pathname.includes('voice')) {
    suggestions.push({ text: 'Browse Voice Demos', url: '/me.html#voice-demos' });
  }
  if (pathname.includes('project') || pathname.includes('portfolio')) {
    suggestions.push({ text: 'View Portfolio', url: '/portfolio.html' });
  }
  if (pathname.includes('about') || pathname.includes('bio')) {
    suggestions.push({ text: 'About PegeArts', url: '/about.html' });
  }
  if (pathname.includes('contact')) {
    suggestions.push({ text: 'Get In Touch', url: '/contact.html' });
  }
  
  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push(
      { text: 'Home', url: '/' },
      { text: 'Portfolio', url: '/portfolio.html' },
      { text: 'About', url: '/about.html' },
      { text: 'Contact', url: '/contact.html' }
    );
  }
  
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
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .float { animation: float 3s ease-in-out infinite; }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        .slide-in { animation: slideIn 0.5s ease-out forwards; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      </style>
    </head>
    <body class="gradient-bg text-white min-h-screen flex items-center justify-center p-4">
      <div class="text-center max-w-4xl mx-auto">
        <!-- Animated 404 -->
        <div class="text-9xl font-bold mb-6 float">
          <span class="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">404</span>
        </div>
        
        <!-- Error Message -->
        <h1 class="text-4xl md:text-5xl font-bold mb-4 slide-in">Oops! Page Not Found</h1>
        <p class="text-xl opacity-90 mb-2 slide-in">
          The page <code class="bg-white/20 px-3 py-1 rounded-lg text-lg font-mono">${pathname}</code> doesn't exist.
        </p>
        <p class="text-lg opacity-75 mb-8 slide-in">
          But don't worry, let's get you back on track! 🚀
        </p>
        
        <!-- Smart Suggestions -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(suggestions.length, 4)} gap-4 mb-12">
          ${suggestions.map((suggestion, index) => `
            <a href="${suggestion.url}" 
               class="bg-white/10 backdrop-blur-sm hover:bg-white/20 px-6 py-4 rounded-xl 
                      transition-all duration-300 hover:scale-105 hover:shadow-lg slide-in"
               style="animation-delay: ${index * 0.1}s">
              <i class="fas fa-arrow-right mr-2"></i>
              ${suggestion.text}
            </a>
          `).join('')}
        </div>
        
        <!-- Additional Actions -->
        <div class="flex flex-wrap justify-center gap-4 mb-8">
          <button onclick="history.back()" 
                  class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-all hover:scale-105">
            <i class="fas fa-arrow-left mr-2"></i> Go Back
          </button>
          <a href="/" 
             class="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg transition-all hover:scale-105">
            <i class="fas fa-home mr-2"></i> Home
          </a>
          <a href="/sitemap.html" 
             class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-all hover:scale-105">
            <i class="fas fa-sitemap mr-2"></i> Sitemap
          </a>
        </div>
        
        <!-- Service Worker Status -->
        <div class="bg-black/20 backdrop-blur-sm rounded-xl p-6 text-sm slide-in">
          <div class="flex items-center justify-center space-x-6 mb-4">
            <span class="text-green-400 pulse">🟢 Service Worker Active</span>
            <span class="text-blue-400">📱 PWA Ready</span>
            <span class="text-purple-400">🎨 PegeArts v${CACHE_VERSION}</span>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs opacity-80">
            <div>🎵 Audio Files Cached</div>
            <div>🖼️ Images Cached</div>
            <div>📄 Documents Cached</div>
            <div>⚡ Offline Ready</div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-white/20">
            <p class="opacity-70">
              🌐 ${CURRENT_DOMAIN} • 
              ${IS_CUSTOM_DOMAIN ? 'Custom Domain' : IS_GITHUB_PAGES ? 'GitHub Pages' : IS_VERCEL ? 'Vercel' : 'Netlify'} • 
              Complete Portfolio Caching
            </p>
          </div>
        </div>
        
        <!-- Search Suggestion -->
        <div class="mt-8 slide-in">
          <p class="text-sm opacity-60">
            💡 Try searching for: voice demos, AI projects, web development, or contact information
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    status: 404,
    statusText: 'Page Not Found',
    headers: { 
      'Content-Type': 'text/html; charset=utf-8',
      'X-Generated-By': 'PegeArts-SW',
      'X-Fallback-Type': 'smart-404'
    }
  });
}

// Create generic fallback
async function createGenericFallback(request, error, assetType) {
  const url = new URL(request.url);
  
  const fallbackData = {
    error: 'Resource not available offline',
    url: url.href,
    assetType: assetType || 'unknown',
    message: 'This resource will be available when you\'re back online',
    domain: CURRENT_DOMAIN,
    serviceWorker: CACHE_VERSION,
    timestamp: new Date().toISOString(),
    suggestion: 'Please check your internet connection and try again'
  };
  
  return new Response(JSON.stringify(fallbackData, null, 2), {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 
      'Content-Type': 'application/json',
      'X-Offline-Resource': 'generic',
      'X-Fallback-Type': 'structured-data'
    }
  });
}

// Continue with storage estimation and other remaining functions...

async function getStorageEstimate() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota,
        usage: estimate.usage,
        usagePercent: estimate.quota ? Math.round((estimate.usage / estimate.quota) * 100) : 0,
        available: estimate.quota - estimate.usage,
        formatted: {
          quota: formatBytes(estimate.quota),
          usage: formatBytes(estimate.usage),
          available: formatBytes(estimate.quota - estimate.usage)
        }
      };
    } catch (error) {
      return { error: error.message, available: false };
    }
  }
  return { available: false, message: 'Storage API not supported' };
}

function formatBytes(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===============================================
// 💬 ENHANCED MESSAGE HANDLING SYSTEM
// ===============================================
self.addEventListener('message', async (event) => {
  const { type, payload, id } = event.data || {};
  
  try {
    let response = { success: false, error: 'Unknown message type' };
    
    switch (type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        response = { success: true, message: 'Service worker activated' };
        break;
        
      case 'GET_CACHE_STATUS':
        response = await getComprehensiveCacheStatus();
        break;
        
      case 'PRELOAD_ASSETS':
        response = await preloadSpecificAssets(payload?.assetType || 'critical');
        break;
        
      case 'CLEAR_CACHE':
        if (payload?.cacheType === 'all') {
          response = await clearAllCaches();
        } else if (payload?.cacheType) {
          response = await clearSpecificCache(payload.cacheType);
        }
        break;
        
      case 'GET_PERFORMANCE_METRICS':
        response = getPerformanceMetrics();
        break;
        
      case 'UPDATE_CONNECTION_STATUS':
        await detectConnection();
        response = { 
          success: true, 
                    connectionQuality,
          isOnline,
          message: `Connection updated: ${connectionQuality}`
        };
        break;
        
      case 'HEALTH_CHECK':
        response = await performComprehensiveHealthCheck();
        break;
        
      case 'GET_RESOURCE_LIST':
        response = await getResourceInventory(payload?.assetType);
        break;
        
      case 'OPTIMIZE_CACHES':
        response = await optimizeAllCaches();
        break;
        
      case 'GET_OFFLINE_CAPABILITIES':
        response = await getOfflineCapabilities();
        break;
        
      case 'FORCE_UPDATE_CACHE':
        response = await forceUpdateCache(payload?.urls || []);
        break;
        
      case 'GET_ANALYTICS_DATA':
        response = getAnalyticsData();
        break;
        
      default:
        response = { 
          success: false, 
          error: `Unknown message type: ${type}`,
          availableTypes: [
            'SKIP_WAITING', 'GET_CACHE_STATUS', 'PRELOAD_ASSETS', 
            'CLEAR_CACHE', 'GET_PERFORMANCE_METRICS', 'UPDATE_CONNECTION_STATUS',
            'HEALTH_CHECK', 'GET_RESOURCE_LIST', 'OPTIMIZE_CACHES',
            'GET_OFFLINE_CAPABILITIES', 'FORCE_UPDATE_CACHE', 'GET_ANALYTICS_DATA'
          ]
        };
    }
    
    // Send response back to client
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ ...response, id, timestamp: Date.now() });
    }
    
  } catch (error) {
    console.error(`❌ Message handler error for ${type}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      type,
      id,
      timestamp: Date.now()
    };
    
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage(errorResponse);
    }
  }
});

// ===============================================
// 📊 COMPREHENSIVE STATUS & ANALYTICS FUNCTIONS
// ===============================================

async function getComprehensiveCacheStatus() {
  try {
    const cacheNames = [STATIC_CACHE, PAGES_CACHE, AUDIO_CACHE, IMAGE_CACHE, DOCUMENTS_CACHE, DYNAMIC_CACHE, API_CACHE, RUNTIME_CACHE];
    const status = {
      version: CACHE_VERSION,
      domain: CURRENT_DOMAIN,
      hostingType: IS_CUSTOM_DOMAIN ? 'custom' : IS_GITHUB_PAGES ? 'github' : IS_VERCEL ? 'vercel' : 'netlify',
      connectionQuality,
      isOnline,
      timestamp: new Date().toISOString(),
      caches: {},
      totals: {
        caches: cacheNames.length,
        totalItems: 0,
        totalSizeEstimate: 0
      },
      storageInfo: await getStorageEstimate(),
      assetTypes: {}
    };
    
    // Get detailed cache information
    for (const cacheName of cacheNames) {
      try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        const maxSize = MAX_CACHE_SIZE[cacheName] || 100;
        
        // Sample a few responses to estimate size
        let sizeEstimate = 0;
        const sampleSize = Math.min(keys.length, 5);
        for (let i = 0; i < sampleSize; i++) {
          try {
            const response = await cache.match(keys[i]);
            if (response) {
              const contentLength = response.headers.get('content-length');
              if (contentLength) {
                sizeEstimate += parseInt(contentLength);
              }
            }
          } catch (error) {
            console.warn(`Sample size estimation failed for ${keys[i].url}`);
          }
        }
        
        // Extrapolate total size
        const avgSize = sampleSize > 0 ? sizeEstimate / sampleSize : 0;
        const totalSizeEstimate = avgSize * keys.length;
        
        status.caches[cacheName] = {
          items: keys.length,
          maxSize,
          utilizationPercent: Math.round((keys.length / maxSize) * 100),
          sizeEstimate: totalSizeEstimate,
          formattedSize: formatBytes(totalSizeEstimate),
          status: keys.length > 0 ? 'active' : 'empty',
          lastModified: keys.length > 0 ? await getLastModifiedTime(cache, keys[0]) : null,
          sampleUrls: keys.slice(0, 3).map(req => req.url.split('/').pop())
        };
        
        status.totals.totalItems += keys.length;
        status.totals.totalSizeEstimate += totalSizeEstimate;
        
      } catch (error) {
        status.caches[cacheName] = {
          error: error.message,
          status: 'error'
        };
      }
    }
    
    // Get asset type breakdown
    for (const [assetType, config] of Object.entries(ASSET_TYPES)) {
      const cacheInfo = status.caches[config.cache];
      if (cacheInfo && !cacheInfo.error) {
        status.assetTypes[assetType] = {
          cache: config.cache,
          items: cacheInfo.items,
          strategy: config.strategy,
          priority: config.priority,
          maxAge: config.maxAge,
          extensions: config.extensions.length,
          utilizationPercent: cacheInfo.utilizationPercent
        };
      }
    }
    
    status.totals.formattedSize = formatBytes(status.totals.totalSizeEstimate);
    
    return {
      success: true,
      data: status
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function getLastModifiedTime(cache, request) {
  try {
    const response = await cache.match(request);
    if (response) {
      const cachedDate = response.headers.get('sw-cached-date');
      const lastModified = response.headers.get('last-modified');
      
      if (cachedDate) {
        return new Date(parseInt(cachedDate)).toISOString();
      } else if (lastModified) {
        return new Date(lastModified).toISOString();
      }
    }
  } catch (error) {
    console.warn('Could not get last modified time:', error);
  }
  return null;
}

async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    const pegeartsCaches = cacheNames.filter(name => name.startsWith('pegearts-'));
    
    console.log(`🗑️ Clearing ${pegeartsCaches.length} PegeArts caches...`);
    
    const results = await Promise.allSettled(
      pegeartsCaches.map(name => caches.delete(name))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    return {
      success: true,
      message: `Cleared ${successful}/${pegeartsCaches.length} caches`,
      clearedCaches: pegeartsCaches,
      successCount: successful,
      failedCount: pegeartsCaches.length - successful
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function clearSpecificCache(cacheType) {
  try {
    const cacheMapping = {
      'static': STATIC_CACHE,
      'pages': PAGES_CACHE,
      'audio': AUDIO_CACHE,
      'images': IMAGE_CACHE,
      'documents': DOCUMENTS_CACHE,
      'dynamic': DYNAMIC_CACHE,
      'api': API_CACHE,
      'runtime': RUNTIME_CACHE
    };
    
    const cacheName = cacheMapping[cacheType];
    if (!cacheName) {
      return {
        success: false,
        error: `Unknown cache type: ${cacheType}`,
        availableTypes: Object.keys(cacheMapping)
      };
    }
    
    const deleted = await caches.delete(cacheName);
    
    return {
      success: true,
      message: `Cache ${cacheName} ${deleted ? 'cleared' : 'was already empty'}`,
      cacheType,
      cacheName,
      deleted
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Performance metrics tracking
let performanceMetrics = {
  requests: {
    total: 0,
    cacheHits: 0,
    cacheMisses: 0,
    networkSuccess: 0,
    networkFailures: 0
  },
  assetTypes: {},
  responseTime: {
    total: 0,
    count: 0,
    average: 0,
    fastest: Infinity,
    slowest: 0
  },
  errors: [],
  startTime: Date.now()
};

function getPerformanceMetrics() {
  const uptime = Date.now() - performanceMetrics.startTime;
  const hitRate = performanceMetrics.requests.total > 0 ? 
    (performanceMetrics.requests.cacheHits / performanceMetrics.requests.total * 100).toFixed(1) : 0;
  
  return {
    success: true,
    data: {
      ...performanceMetrics,
      uptime: {
        milliseconds: uptime,
        formatted: formatUptime(uptime)
      },
      cacheHitRate: `${hitRate}%`,
      averageResponseTime: performanceMetrics.responseTime.count > 0 ? 
        `${(performanceMetrics.responseTime.average).toFixed(2)}ms` : 'N/A',
      fastestResponse: performanceMetrics.responseTime.fastest !== Infinity ? 
        `${performanceMetrics.responseTime.fastest.toFixed(2)}ms` : 'N/A',
      slowestResponse: `${performanceMetrics.responseTime.slowest.toFixed(2)}ms`,
      recentErrors: performanceMetrics.errors.slice(-10) // Last 10 errors
    }
  };
}

function formatUptime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

async function performComprehensiveHealthCheck() {
  console.log('🔍 Performing comprehensive health check...');
  
  const healthCheck = {
    timestamp: new Date().toISOString(),
    version: CACHE_VERSION,
    domain: CURRENT_DOMAIN,
    overall: 'healthy',
    checks: {}
  };
  
  try {
    // 1. Cache System Health
    const cacheStatus = await getComprehensiveCacheStatus();
    healthCheck.checks.cacheSystem = {
      status: cacheStatus.success ? 'healthy' : 'unhealthy',
      details: cacheStatus.success ? 
        `${cacheStatus.data.totals.caches} caches with ${cacheStatus.data.totals.totalItems} items` :
        cacheStatus.error,
      critical: true
    };
    
    // 2. Storage Health
    const storageInfo = await getStorageEstimate();
    const storageHealthy = storageInfo.available && storageInfo.usagePercent < 90;
    healthCheck.checks.storage = {
      status: storageHealthy ? 'healthy' : 'warning',
      details: storageInfo.available ? 
        `${storageInfo.usagePercent}% used (${storageInfo.formatted.usage}/${storageInfo.formatted.quota})` :
        'Storage API not available',
      critical: storageInfo.usagePercent > 95
    };
    
    // 3. Network Connectivity
    await detectConnection();
    healthCheck.checks.network = {
      status: isOnline ? 'healthy' : 'offline',
      details: `${connectionQuality} connection, online: ${isOnline}`,
      critical: false
    };
    
    // 4. Critical Assets Availability
    const criticalAssets = ['/', '/manifest.json'];
    const assetChecks = await Promise.allSettled(
      criticalAssets.map(async url => {
        const cached = await caches.match(url);
        return { url, cached: !!cached };
      })
    );
    
    const availableAssets = assetChecks.filter(check => 
      check.status === 'fulfilled' && check.value.cached
    ).length;
    
    healthCheck.checks.criticalAssets = {
      status: availableAssets === criticalAssets.length ? 'healthy' : 'warning',
      details: `${availableAssets}/${criticalAssets.length} critical assets cached`,
      critical: availableAssets === 0
    };
    
    // 5. Performance Metrics
    const perfMetrics = getPerformanceMetrics();
    const avgResponseTime = parseFloat(perfMetrics.data.averageResponseTime) || 0;
    const responseTimeHealthy = avgResponseTime < 1000 || avgResponseTime === 0;
    
    healthCheck.checks.performance = {
      status: responseTimeHealthy ? 'healthy' : 'warning',
      details: `${perfMetrics.data.cacheHitRate} hit rate, ${perfMetrics.data.averageResponseTime} avg response`,
      critical: false
    };
    
    // 6. Error Rate
    const recentErrors = performanceMetrics.errors.filter(
      error => Date.now() - error.timestamp < 300000 // Last 5 minutes
    );
    const errorRateHealthy = recentErrors.length < 10;
    
    healthCheck.checks.errorRate = {
      status: errorRateHealthy ? 'healthy' : 'warning',
      details: `${recentErrors.length} errors in last 5 minutes`,
      critical: recentErrors.length > 50
    };
    
    // 7. Feature Support
    const features = {
      cacheAPI: 'caches' in self,
      fetchAPI: 'fetch' in self,
      indexedDB: 'indexedDB' in self,
      notifications: 'Notification' in self,
      backgroundSync: 'sync' in self.registration,
      storageEstimate: 'storage' in navigator && 'estimate' in navigator.storage
    };
    
    const supportedFeatures = Object.values(features).filter(Boolean).length;
    
    healthCheck.checks.featureSupport = {
      status: supportedFeatures >= 4 ? 'healthy' : 'warning',
      details: `${supportedFeatures}/6 features supported`,
      critical: supportedFeatures < 2,
      features
    };
    
    // Determine overall health
    const criticalIssues = Object.values(healthCheck.checks).filter(
      check => check.status === 'unhealthy' && check.critical
    ).length;
    
    const warnings = Object.values(healthCheck.checks).filter(
      check => check.status === 'warning'
    ).length;
    
    if (criticalIssues > 0) {
      healthCheck.overall = 'critical';
    } else if (warnings > 2) {
      healthCheck.overall = 'degraded';
    } else if (warnings > 0) {
      healthCheck.overall = 'warning';
    } else {
      healthCheck.overall = 'healthy';
    }
    
    healthCheck.summary = {
      total: Object.keys(healthCheck.checks).length,
      healthy: Object.values(healthCheck.checks).filter(c => c.status === 'healthy').length,
      warnings: warnings,
      critical: criticalIssues
    };
    
    console.log(`🔍 Health check complete: ${healthCheck.overall} (${healthCheck.summary.healthy}/${healthCheck.summary.total} healthy)`);
    
    return {
      success: true,
      data: healthCheck
    };
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return {
      success: false,
      error: error.message,
      data: {
        ...healthCheck,
        overall: 'critical',
        checks: {
          ...healthCheck.checks,
          healthCheckSystem: {
            status: 'unhealthy',
            details: error.message,
            critical: true
          }
        }
      }
    };
  }
}

async function getResourceInventory(assetType) {
  try {
    const inventory = {
      timestamp: new Date().toISOString(),
      domain: CURRENT_DOMAIN,
      totalResources: STATIC_RESOURCES.length,
      resourcesByType: {}
    };
    
    // Get comprehensive resource breakdown
    const resources = {
      audio: getAudioUrls(),
      images: getImageUrls(),
      icons: getIconUrls(),
      documents: getDocumentUrls(),
      pages: STATIC_RESOURCES.filter(url => 
        url.endsWith('.html') || url === '/' || url.endsWith('.xml')
      ),
      libraries: STATIC_RESOURCES.filter(url => 
        url.includes('cdn') || url.includes('googleapis.com') || 
        url.includes('unpkg.com') || url.includes('jsdelivr.net')
      )
    };
    
    // If specific asset type requested, return only that
    if (assetType && resources[assetType]) {
      const urls = resources[assetType];
      const cachedInfo = await Promise.allSettled(
        urls.map(async url => {
          const cached = await caches.match(url);
          return {
            url,
            cached: !!cached,
            fileName: url.split('/').pop(),
            size: cached ? cached.headers.get('content-length') || 'unknown' : null
          };
        })
      );
      
      const items = cachedInfo.map(result => 
        result.status === 'fulfilled' ? result.value : { error: result.reason }
      );
      
      return {
        success: true,
        data: {
          assetType,
          total: urls.length,
          cached: items.filter(item => item.cached).length,
          items: items.slice(0, 50) // Limit for performance
        }
      };
    }
    
    // Return full inventory
    for (const [type, urls] of Object.entries(resources)) {
      const cachedCount = await Promise.allSettled(
        urls.map(url => caches.match(url))
      ).then(results => 
        results.filter(r => r.status === 'fulfilled' && r.value).length
      );
      
      inventory.resourcesByType[type] = {
        total: urls.length,
        cached: cachedCount,
        cacheRate: urls.length > 0 ? ((cachedCount / urls.length) * 100).toFixed(1) + '%' : '0%',
        sampleUrls: urls.slice(0, 3).map(url => url.split('/').pop())
      };
    }
    
    return {
      success: true,
      data: inventory
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function optimizeAllCaches() {
  console.log('⚡ Starting cache optimization...');
  
  try {
    const optimization = {
      timestamp: new Date().toISOString(),
      actions: [],
      before: {},
      after: {},
      spaceSaved: 0
    };
    
    // Get initial cache status
    const initialStatus = await getComprehensiveCacheStatus();
    if (initialStatus.success) {
      optimization.before = initialStatus.data.totals;
    }
    
    // 1. Clean up all caches
    const cleanupResults = await cleanupAllCaches();
    optimization.actions.push({
      action: 'cleanup',
      result: cleanupResults,
      itemsRemoved: cleanupResults.totalItemsRemoved || 0
    });
    
    // 2. Remove duplicate entries
    let duplicatesRemoved = 0;
    for (const cacheName of Object.values({STATIC_CACHE, PAGES_CACHE, AUDIO_CACHE, IMAGE_CACHE, DOCUMENTS_CACHE, DYNAMIC_CACHE, API_CACHE, RUNTIME_CACHE})) {
      try {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        const urlMap = new Map();
        
        // Find duplicates
        for (const request of requests) {
          if (urlMap.has(request.url)) {
            await cache.delete(request);
            duplicatesRemoved++;
          } else {
            urlMap.set(request.url, request);
          }
        }
      } catch (error) {
        console.warn(`Deduplication failed for ${cacheName}:`, error);
      }
    }
    
    optimization.actions.push({
      action: 'deduplication',
      itemsRemoved: duplicatesRemoved
    });
    
    // 3. Validate cached responses
    let invalidResponsesRemoved = 0;
    for (const cacheName of Object.values({STATIC_CACHE, PAGES_CACHE, AUDIO_CACHE, IMAGE_CACHE, DOCUMENTS_CACHE, DYNAMIC_CACHE, API_CACHE, RUNTIME_CACHE})) {
      try {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests.slice(0, 10)) { // Sample first 10
          try {
            const response = await cache.match(request);
            if (!response || !response.ok) {
              await cache.delete(request);
              invalidResponsesRemoved++;
            }
          } catch (error) {
            await cache.delete(request);
            invalidResponsesRemoved++;
          }
        }
      } catch (error) {
        console.warn(`Response validation failed for ${cacheName}:`, error);
      }
    }
    
    optimization.actions.push({
      action: 'validation',
      itemsRemoved: invalidResponsesRemoved
    });
    
    // Get final cache status
    const finalStatus = await getComprehensiveCacheStatus();
    if (finalStatus.success) {
      optimization.after = finalStatus.data.totals;
      optimization.spaceSaved = optimization.before.totalSizeEstimate - optimization.after.totalSizeEstimate;
    }
    
    const totalItemsRemoved = cleanupResults.totalItemsRemoved + duplicatesRemoved + invalidResponsesRemoved;
    
    console.log(`⚡ Cache optimization complete: ${totalItemsRemoved} items removed, ${formatBytes(optimization.spaceSaved)} space saved`);
    
    return {
      success: true,
      data: optimization,
      summary: {
        totalItemsRemoved,
        spaceSaved: formatBytes(optimization.spaceSaved),
        actions: optimization.actions.length
      }
    };
    
  } catch (error) {
    console.error('❌ Cache optimization failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function getOfflineCapabilities() {
  try {
    const capabilities = {
      timestamp: new Date().toISOString(),
      serviceWorkerActive: true,
      version: CACHE_VERSION,
      domain: CURRENT_DOMAIN,
      offlineSupport: {},
      cachedResources: {},
      limitations: []
    };
    
    // Check what's available offline
    const resourceTypes = ['pages', 'audio', 'images', 'documents', 'icons'];
    
    for (const type of resourceTypes) {
      const inventory = await getResourceInventory(type);
      if (inventory.success) {
        capabilities.cachedResources[type] = {
          total: inventory.data.total,
          cached: inventory.data.cached,
          available: inventory.data.cached > 0,
          percentage: inventory.data.cached > 0 ? 
            ((inventory.data.cached / inventory.data.total) * 100).toFixed(1) : '0'
        };
      }
    }
    
    // Offline capabilities by feature
    capabilities.offlineSupport = {
      browsing: capabilities.cachedResources.pages?.cached > 0,
      voiceDemos: capabilities.cachedResources.audio?.cached > 0,
      imageViewing: capabilities.cachedResources.images?.cached > 0,
      documentDownload: capabilities.cachedResources.documents?.cached > 0,
      basicUI: capabilities.cachedResources.icons?.cached > 0,
      formSubmission: false, // Forms require network
      emailContact: false, // Email requires network
      dynamicContent: false, // API content requires network
      socialMedia: false // External links require network
    };
    
    // Identify limitations
    if (!capabilities.offlineSupport.voiceDemos) {
      capabilities.limitations.push('Voice demos require internet connection');
    }
    if (!capabilities.offlineSupport.documentDownload) {
      capabilities.limitations.push('Document downloads require internet connection');
    }
    if (!capabilities.offlineSupport.formSubmission) {
      capabilities.limitations.push('Contact forms require internet connection');
    }
    if (!capabilities.offlineSupport.browsing) {
      capabilities.limitations.push('Limited page browsing when offline');
    }
    
    // Calculate overall offline readiness
    const supportedFeatures = Object.values(capabilities.offlineSupport).filter(Boolean).length;
    const totalFeatures = Object.keys(capabilities.offlineSupport).length;
    capabilities.offlineReadiness = ((supportedFeatures / totalFeatures) * 100).toFixed(1) + '%';
    
    return {
      success: true,
      data: capabilities
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function forceUpdateCache(urls) {
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return {
      success: false,
      error: 'No URLs provided for update'
    };
  }
  
  console.log(`🔄 Force updating ${urls.length} cached resources...`);
  
  try {
    const results = await Promise.allSettled(
      urls.map(async url => {
        try {
          // Remove from all caches first
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(name => caches.open(name).then(cache => cache.delete(url)))
          );
          
          // Fetch fresh version
          const response = await fetch(url, { cache: 'reload' });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          // Cache in appropriate location
          const cacheName = getAssetCacheName(url);
          const cache = await caches.open(cacheName);
          await cache.put(url, response);
          
          return {
            url,
            success: true,
            status: response.status,
            cacheName
          };
          
        } catch (error) {
          return {
            url,
            success: false,
            error: error.message
          };
        }
      })
    );
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
    const failed = results.filter(r => r.status === 'rejected' || !r.value.success);
    
    return {
      success: true,
      data: {
        total: urls.length,
        successful: successful.length,
        failed: failed.length,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason })
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function getAnalyticsData() {
  const analytics = {
    timestamp: new Date().toISOString(),
    serviceWorker: {
      version: CACHE_VERSION,
      uptime: formatUptime(Date.now() - performanceMetrics.startTime),
      domain: CURRENT_DOMAIN,
      hosting: IS_CUSTOM_DOMAIN ? 'custom' : IS_GITHUB_PAGES ? 'github' : IS_VERCEL ? 'vercel' : 'netlify'
    },
    performance: getPerformanceMetrics().data,
    resources: {
      totalStatic: STATIC_RESOURCES.length,
      audioFiles: getAudioUrls().length,
      imageFiles: getImageUrls().length,
      documentFiles: getDocumentUrls().length,
      iconFiles: getIconUrls().length
    },
    network: {
      currentQuality: connectionQuality,
      isOnline,
      lastCheck: new Date(lastNetworkCheck).toISOString()
    },
    features: {
      assetTypes: Object.keys(ASSET_TYPES).length,
      cacheStrategies: [...new Set(Object.values(ASSET_TYPES).map(t => t.strategy))],
      maxCacheSize: Object.values(MAX_CACHE_SIZE).reduce((sum, size) => sum + size, 0)
    }
  };
  
  return {
    success: true,
    data: analytics
  };
}

// ===============================================
// 🎯 BACKGROUND SYNC & PERIODIC SYNC (FUTURE)
// ===============================================

// Register background sync if supported
if ('sync' in self.registration) {
  self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    switch (event.tag) {
      case 'cache-cleanup':
        event.waitUntil(cleanupAllCaches());
        break;
      case 'health-check':
        event.waitUntil(performComprehensiveHealthCheck());
        break;
      case 'cache-optimization':
        event.waitUntil(optimizeAllCaches());
        break;
      default:
        console.log('Unknown background sync tag:', event.tag);
    }
  });
}

// ===============================================
// 📧 NOTIFICATION SUPPORT (FUTURE ENHANCEMENT)
// ===============================================

// Handle push notifications if supported
if ('push' in self.registration) {
  self.addEventListener('push', event => {
    console.log('📧 Push notification received');
    
    // Future: Handle push notifications for portfolio updates
    // This could notify users of new voice samples, portfolio updates, etc.
  });
}

// ===============================================
// 🏁 FINAL INITIALIZATION & LOGGING
// ===============================================

console.log(`
🎨 ========================================
   PegeArts Complete Portfolio Service Worker
   Version: ${CACHE_VERSION}
   Domain: ${CURRENT_DOMAIN}
   Hosting: ${IS_CUSTOM_DOMAIN ? 'Custom Domain' : IS_GITHUB_PAGES ? 'GitHub Pages' : IS_VERCEL ? 'Vercel' : IS_NETLIFY ? 'Netlify' : 'Unknown'}
   
   📊 Asset Coverage:
   • 🎵 Audio Files: ${getAudioUrls().length}
   • 🖼️ Images: ${getImageUrls().length}  
   • 🎯 Icons: ${getIconUrls().length}
   • 📄 Documents: ${getDocumentUrls().length}
   • 📦 Total Static: ${STATIC_RESOURCES.length}
   
   ⚡ Features:
   • Complete offline support
   • Intelligent caching strategies
   • Performance optimization
   • Connection-aware loading
   • Comprehensive error handling
   • Health monitoring
   • Analytics tracking
   
   🚀 Ready for production deployment!
========================================
`);

// Initialize performance monitoring
console.log('📊 Performance monitoring initialized');
console.log('🔍 Health monitoring active');
console.log('⚡ Smart preloading configured');
console.log('🎯 Service Worker fully operational!');

// End of Service Worker


