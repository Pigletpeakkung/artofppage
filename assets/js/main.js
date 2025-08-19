// Service Worker Integration
class ServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.updateAvailable = false;
        this.init();
    }

    async init() {
        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker not supported');
            return;
        }

        try {
            this.registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered successfully');
            
            this.setupEventListeners();
            this.checkForUpdates();
            
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    }

    setupEventListeners() {
        // Listen for SW messages
        navigator.serviceWorker.addEventListener('message', (event) => {
            this.handleMessage(event.data);
        });

        // Listen for SW state changes
        if (this.registration) {
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.updateAvailable = true;
                        this.showUpdateNotification();
                    }
                });
            });
        }

        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.handleConnectionChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleConnectionChange(false);
        });
    }

    handleMessage(data) {
        switch (data.type) {
            case 'SW_UPDATED':
                console.log('🔄 Service Worker updated to version:', data.version);
                break;
                
            case 'SYNC_COMPLETE':
                console.log('📡 Background sync completed:', data.results);
                this.showSyncNotification(data.results);
                break;
                
            case 'CONTENT_UPDATED':
                console.log('🔄 Content updated:', data.assets);
                this.handleContentUpdate(data.assets);
                break;
        }
    }

    async checkForUpdates() {
        if (this.registration) {
            try {
                await this.registration.update();
            } catch (error) {
                console.warn('Failed to check for SW updates:', error);
            }
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'alert alert-info position-fixed bottom-0 start-0 m-3 shadow-lg';
        notification.style.zIndex = '9999';
        notification.style.maxWidth = '400px';
        notification.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    <strong>🎉 Update Available!</strong>
                    <div class="small text-muted">New features and improvements</div>
                </div>
                <div class="ms-3">
                    <button class="btn btn-primary btn-sm" onclick="this.parentElement.parentElement.parentElement.querySelector('.update-now').click()">
                        Update Now
                    </button>
                    <button class="btn btn-outline-secondary btn-sm ms-1" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Later
                    </button>
                </div>
            </div>
            <button class="update-now d-none" onclick="window.swManager.applyUpdate()"></button>
        `;
        
        document.body.appendChild(notification);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    async applyUpdate() {
        if (this.registration && this.registration.waiting) {
            // Send message to SW to skip waiting
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Reload page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    }

    handleConnectionChange(isOnline) {
        const statusDiv = document.getElementById('connectionStatus') || this.createConnectionStatus();
        
        if (isOnline) {
            statusDiv.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
            statusDiv.innerHTML = '<i class="fas fa-wifi me-2"></i>Connection restored!';
            
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        } else {
            statusDiv.className = 'alert alert-warning position-fixed top-0 start-50 translate-middle-x mt-3';
            statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>You\'re offline. Some features may be limited.';
            statusDiv.style.display = 'block';
        }
    }

    createConnectionStatus() {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'connectionStatus';
        statusDiv.style.zIndex = '9999';
        statusDiv.style.display = 'none';
        document.body.appendChild(statusDiv);
        return statusDiv;
    }

    showSyncNotification(results) {
        if (results.successful > 0) {
            const notification = document.createElement('div');
            notification.className = 'alert alert-success position-fixed top-0 end-0 m-3';
            notification.style.zIndex = '9999';
            notification.innerHTML = `
                <i class="fas fa-sync-alt me-2"></i>
                Synced ${results.successful} items successfully
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    handleContentUpdate(assets) {
        // Show subtle update indicator
        const indicator = document.createElement('div');
        indicator.className = 'position-fixed top-0 start-50 translate-middle-x bg-primary text-white px-3 py-1 rounded-bottom';
        indicator.style.zIndex = '9998';
        indicator.style.fontSize = '0.875rem';
        indicator.innerHTML = '<i class="fas fa-download me-1"></i>Content updated';
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.style.transform = 'translateY(-100%)';
            setTimeout(() => indicator.remove(), 300);
        }, 2000);
    }

    // Public methods for manual cache management
    async getCacheStats() {
        if (!navigator.serviceWorker.controller) return null;

        return new Promise((resolve) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = (event) => {
                resolve(event.data.success ? event.data.stats : null);
            };
            
            navigator.serviceWorker.controller.postMessage(
                { type: 'GET_CACHE_STATS' },
                [channel.port2]
            );
        });
    }

    async clearCache() {
        if (!navigator.serviceWorker.controller) return false;

        return new Promise((resolve) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = (event) => {
                resolve(event.data.success);
            };
            
            navigator.serviceWorker.controller.postMessage(
                { type: 'CLEAR_CACHE' },
                [channel.port2]
            );
        });
    }

    async cacheUrls(urls) {
        if (!navigator.serviceWorker.controller || !Array.isArray(urls)) return false;

        return new Promise((resolve) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = (event) => {
                resolve(event.data.success);
            };
            
            navigator.serviceWorker.controller.postMessage(
                { type: 'CACHE_URLS', data: { urls } },
                [channel.port2]
            );
        });
    }
}

// Update your main PortfolioApp initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize main application
        window.portfolioApp = new PortfolioApp();
        
        // Initialize service worker manager
        window.swManager = new ServiceWorkerManager();
        
        // Initialize other components
        window.lazyLoader = new LazyImageLoader();
        window.cookieManager = new CookieManager();
        
        console.log('🚀 Portfolio application initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize portfolio application:', error);
        
        // Fallback initialization
        document.body.classList.add('loaded');
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
});
