/*!
 * Portfolio Main Entry Point
 * Author: Thanatsitt Santisamranwilai
 * Version: 2.0.0
 */

'use strict';

/*
========================================
MAIN APPLICATION ENTRY POINT
========================================
*/

// Import the main application (if using modules)
// import { PortfolioApp } from './app.js';

// Application configuration
const MAIN_CONFIG = {
    // Environment detection
    isDevelopment: window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.search.includes('debug=true'),
    
    // Feature flags
    features: {
        enableAnalytics: true,
        enableServiceWorker: true,
        enableOfflineMode: false,
        enablePWA: false
    },
    
    // Loading preferences
    loading: {
        showSplashScreen: true,
        minLoadingTime: 1000, // Minimum time to show loading
        enablePreloader: true
    }
};

/*
========================================
PRE-INITIALIZATION SETUP
========================================
*/

// Set up critical path CSS and early optimizations
function setupCriticalPath() {
    // Add critical CSS loading class
    document.documentElement.classList.add('loading');
    
    // Prevent FOUC (Flash of Unstyled Content)
    document.documentElement.style.visibility = 'hidden';
    
    // Enable critical path font loading
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            document.documentElement.classList.add('fonts-loaded');
        });
    }
}

// Early theme detection (before app loads)
function setupEarlyTheme() {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;
    
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
}

// Setup loading screen
function setupLoadingScreen() {
    if (!MAIN_CONFIG.loading.showSplashScreen) return;
    
    const loadingHTML = `
        <div id="app-loading" class="app-loading">
            <div class="loading-content">
                <div class="loading-logo">
                    <div class="logo-animation">
                        <svg viewBox="0 0 100 100" class="loading-spinner">
                            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                            </svg>
                        </div>
                    </div>
                    <h1 class="loading-title">Thanatsitt</h1>
                    <p class="loading-subtitle">Loading Portfolio...</p>
                </div>
                <div class="loading-progress">
                    <div class="progress-bar" id="loadingProgress"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', loadingHTML);
}

// Progress tracking
let loadingProgress = 0;
const loadingSteps = [
    'Initializing application...',
    'Loading core modules...',
    'Setting up animations...',
    'Preparing user interface...',
    'Finalizing setup...'
];

function updateLoadingProgress(step, progress) {
    const progressBar = document.getElementById('loadingProgress');
    const subtitle = document.querySelector('.loading-subtitle');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    if (subtitle && loadingSteps[step]) {
        subtitle.textContent = loadingSteps[step];
    }
}

/*
========================================
APPLICATION INITIALIZATION
========================================
*/

async function initializePortfolioApp() {
    const startTime = Date.now();
    
    try {
        // Step 1: Initialize app core (20%)
        updateLoadingProgress(0, 20);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Step 2: Load modules (40%)
        updateLoadingProgress(1, 40);
        
        // The PortfolioApp is already initialized from app.js
        // We just need to wait for it to be ready
        await waitForAppReady();
        
        // Step 3: Setup animations (60%)
        updateLoadingProgress(2, 60);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Step 4: Prepare UI (80%)
        updateLoadingProgress(3, 80);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Step 5: Finalize (100%)
        updateLoadingProgress(4, 100);
        
        // Ensure minimum loading time for better UX
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MAIN_CONFIG.loading.minLoadingTime - elapsedTime);
        
        if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        
        // Initialize additional features
        await initializeAdditionalFeatures();
        
        // Complete initialization
        completeInitialization();
        
    } catch (error) {
        handleInitializationError(error);
    }
}

function waitForAppReady() {
    return new Promise((resolve) => {
        if (window.portfolioApp && window.portfolioApp.isInitialized) {
            resolve();
            return;
        }
        
        document.addEventListener('portfolioAppReady', resolve, { once: true });
        
        // Fallback timeout
        setTimeout(resolve, 5000);
    });
}

async function initializeAdditionalFeatures() {
    const promises = [];
    
    // Initialize analytics
    if (MAIN_CONFIG.features.enableAnalytics && !MAIN_CONFIG.isDevelopment) {
        promises.push(initializeAnalytics());
    }
    
    // Initialize service worker
    if (MAIN_CONFIG.features.enableServiceWorker && 'serviceWorker' in navigator) {
        promises.push(initializeServiceWorker());
    }
    
    // Initialize PWA features
    if (MAIN_CONFIG.features.enablePWA) {
        promises.push(initializePWA());
    }
    
    await Promise.allSettled(promises);
}

async function initializeAnalytics() {
    // Add your analytics initialization here
    // Example: Google Analytics, Adobe Analytics, etc.
    console.log('📊 Analytics initialized');
}

async function initializeServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('🔧 Service Worker registered:', registration);
    } catch (error) {
        console.warn('Service Worker registration failed:', error);
    }
}

async function initializePWA() {
    // PWA features like install prompt, offline capabilities
    console.log('📱 PWA features initialized');
}

function completeInitialization() {
    // Remove loading screen
    const loadingScreen = document.getElementById('app-loading');
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }
    
    // Show main content
    document.documentElement.style.visibility = '';
    document.documentElement.classList.remove('loading');
    document.documentElement.classList.add('loaded');
    
    // Dispatch app ready event
    document.dispatchEvent(new CustomEvent('mainAppReady', {
        detail: {
            loadTime: Date.now() - window.performance.timing.navigationStart,
            config: MAIN_CONFIG
        }
    }));
    
    console.log('🎉 Portfolio application fully loaded and ready!');
}

function handleInitializationError(error) {
    console.error('❌ Application initialization failed:', error);
    
    // Remove loading screen
    const loadingScreen = document.getElementById('app-loading');
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div class="loading-content error">
                <div class="error-icon">⚠️</div>
                <h2>Loading Error</h2>
                <p>Something went wrong while loading the application.</p>
                <button onclick="window.location.reload()" class="retry-button">
                    Retry
                </button>
            </div>
        `;
    }
    
    // Show basic content even if JS fails
    document.documentElement.style.visibility = '';
}

/*
========================================
STARTUP SEQUENCE
========================================
*/

// Run pre-initialization setup immediately
setupCriticalPath();
setupEarlyTheme();

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupLoadingScreen();
        initializePortfolioApp();
    });
} else {
    setupLoadingScreen();
    initializePortfolioApp();
}

// Export for debugging
if (MAIN_CONFIG.isDevelopment) {
    window.mainConfig = MAIN_CONFIG;
    window.updateLoadingProgress = updateLoadingProgress;
}
// Add to main.js after the MAIN_CONFIG object

const COOKIE_CONFIG = {
    enabled: !MAIN_CONFIG.isDevelopment, // Disable in development
    position: 'bottom', // 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
    theme: 'auto', // 'auto', 'light', 'dark'
    categories: {
        necessary: true, // Always required
        analytics: false,
        marketing: false,
        preferences: false
    },
    services: {
        googleAnalytics: 'analytics',
        facebookPixel: 'marketing',
        themePreference: 'preferences'
    }
};

/*
========================================
COOKIE CONSENT CONTROLLER
========================================
*/

class CookieConsentController {
    constructor() {
        this.consentGiven = false;
        this.preferences = { ...COOKIE_CONFIG.categories };
        this.consentKey = 'portfolio-cookie-consent';
        this.preferencesKey = 'portfolio-cookie-preferences';
        
        this.init();
    }

    init() {
        if (!COOKIE_CONFIG.enabled) return;
        
        // Check if consent already given
        this.loadSavedPreferences();
        
        if (!this.consentGiven) {
            this.showConsentBanner();
        } else {
            this.applyConsentPreferences();
        }
        
        this.bindEvents();
    }

    loadSavedPreferences() {
        try {
            const consent = localStorage.getItem(this.consentKey);
            const preferences = localStorage.getItem(this.preferencesKey);
            
            if (consent === 'true') {
                this.consentGiven = true;
                
                if (preferences) {
                    this.preferences = { ...this.preferences, ...JSON.parse(preferences) };
                }
            }
        } catch (e) {
            console.warn('Could not load cookie preferences:', e);
        }
    }

    showConsentBanner() {
        const banner = this.createConsentBanner();
        document.body.appendChild(banner);
        
        // Animate in
        requestAnimationFrame(() => {
            banner.classList.add('show');
        });

        // Focus management for accessibility
        setTimeout(() => {
            const acceptButton = banner.querySelector('.cookie-accept');
            if (acceptButton) acceptButton.focus();
        }, 300);
    }

    createConsentBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-modal', 'false');
        banner.setAttribute('aria-labelledby', 'cookie-title');
        banner.setAttribute('aria-describedby', 'cookie-description');

        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-text">
                    <h3 id="cookie-title" class="cookie-title">
                        <i class="fas fa-cookie-bite"></i>
                        Cookie Preferences
                    </h3>
                    <p id="cookie-description" class="cookie-description">
                        This website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                        You can choose which types of cookies to allow.
                    </p>
                </div>
                
                <div class="cookie-actions">
                    <button type="button" class="cookie-button cookie-customize" aria-describedby="cookie-description">
                        <i class="fas fa-cog"></i>
                        Customize
                    </button>
                    <button type="button" class="cookie-button cookie-reject">
                        <i class="fas fa-times"></i>
                        Reject All
                    </button>
                    <button type="button" class="cookie-button cookie-accept cookie-button--primary">
                        <i class="fas fa-check"></i>
                        Accept All
                    </button>
                </div>
            </div>
        `;

        this.addConsentStyles(banner);
        return banner;
    }

    addConsentStyles(banner) {
        const position = COOKIE_CONFIG.position;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        banner.style.cssText = `
            position: fixed;
            ${position.includes('top') ? 'top: 0;' : 'bottom: 0;'}
            ${position.includes('left') ? 'left: 0;' : position.includes('right') ? 'right: 0;' : 'left: 0; right: 0;'}
            background: ${isDark ? 'rgba(26, 32, 44, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
            backdrop-filter: blur(10px);
            border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            ${position.includes('top') ? 'border-bottom' : 'border-top'}: 3px solid var(--primary-accent);
            padding: 1.5rem;
            z-index: 10000;
            max-width: ${position.includes('left') || position.includes('right') ? '400px' : 'none'};
            box-shadow: 0 ${position.includes('top') ? '4px' : '-4px'} 20px rgba(0, 0, 0, 0.15);
            transform: translateY(${position.includes('top') ? '-100%' : '100%'});
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        // Add show class styles
        const style = document.createElement('style');
        style.textContent = `
            .cookie-consent-banner.show {
                transform: translateY(0) !important;
                opacity: 1 !important;
            }
            
            .cookie-consent-content {
                display: flex;
                align-items: center;
                gap: 1.5rem;
                flex-wrap: wrap;
            }
            
            .cookie-text {
                flex: 1;
                min-width: 300px;
            }
            
            .cookie-title {
                margin: 0 0 0.5rem 0;
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .cookie-description {
                margin: 0;
                font-size: 0.9rem;
                color: var(--text-secondary);
                line-height: 1.5;
            }
            
            .cookie-actions {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }
            
            .cookie-button {
                padding: 0.6rem 1.2rem;
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                background: var(--background-secondary);
                color: var(--text-primary);
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                text-decoration: none;
                white-space: nowrap;
            }
            
            .cookie-button:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .cookie-button:focus {
                outline: 2px solid var(--primary-accent);
                outline-offset: 2px;
            }
            
            .cookie-button--primary {
                background: var(--primary-accent);
                color: white;
                border-color: var(--primary-accent);
            }
            
            .cookie-button--primary:hover {
                background: var(--primary-light);
                border-color: var(--primary-light);
            }
            
            .cookie-reject {
                color: #ef4444;
                border-color: #ef4444;
            }
            
            .cookie-reject:hover {
                background: #ef4444;
                color: white;
            }
            
            .cookie-customize:hover {
                background: var(--primary-accent);
                color: white;
                border-color: var(--primary-accent);
            }
            
            @media (max-width: 768px) {
                .cookie-consent-content {
                    flex-direction: column;
                    text-align: center;
                }
                
                .cookie-actions {
                    justify-content: center;
                    width: 100%;
                }
                
                .cookie-button {
                    flex: 1;
                    min-width: 120px;
                }
            }
            
            /* Preference modal styles */
            .cookie-preferences-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .cookie-preferences-modal.show {
                opacity: 1;
                visibility: visible;
            }
            
            .cookie-preferences-content {
                background: var(--background-card);
                border-radius: 1rem;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .cookie-preferences-modal.show .cookie-preferences-content {
                transform: scale(1);
            }
            
            .cookie-category {
                margin-bottom: 1.5rem;
                padding: 1rem;
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
            }
            
            .cookie-category-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 0.5rem;
            }
            
            .cookie-toggle {
                position: relative;
                width: 50px;
                height: 24px;
                background: var(--background-secondary);
                border-radius: 12px;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            .cookie-toggle.active {
                background: var(--primary-accent);
            }
            
            .cookie-toggle::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: transform 0.3s ease;
            }
            
            .cookie-toggle.active::after {
                transform: translateX(26px);
            }
        `;
        
        if (!document.getElementById('cookie-consent-styles')) {
            style.id = 'cookie-consent-styles';
            document.head.appendChild(style);
        }
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cookie-accept')) {
                this.acceptAll();
            } else if (e.target.closest('.cookie-reject')) {
                this.rejectAll();
            } else if (e.target.closest('.cookie-customize')) {
                this.showPreferencesModal();
            }
        });

        // Listen for theme changes to update banner appearance
        document.addEventListener('themeChanged', () => {
            this.updateBannerTheme();
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePreferencesModal();
            }
        });
    }

    acceptAll() {
        this.preferences = {
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true
        };
        
        this.saveConsent();
        this.applyConsentPreferences();
        this.removeBanner();
        this.announceToScreenReader('All cookies accepted');
    }

    rejectAll() {
        this.preferences = {
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false
        };
        
        this.saveConsent();
        this.applyConsentPreferences();
        this.removeBanner();
        this.announceToScreenReader('Non-essential cookies rejected');
    }

    saveConsent() {
        try {
            localStorage.setItem(this.consentKey, 'true');
            localStorage.setItem(this.preferencesKey, JSON.stringify(this.preferences));
            this.consentGiven = true;
        } catch (e) {
            console.warn('Could not save cookie preferences:', e);
        }
    }

    applyConsentPreferences() {
        // Apply analytics
        if (this.preferences.analytics) {
            this.enableAnalytics();
        } else {
            this.disableAnalytics();
        }

        // Apply marketing cookies
        if (this.preferences.marketing) {
            this.enableMarketing();
        } else {
            this.disableMarketing();
        }

        // Apply preference cookies (always allowed for essential functionality)
        if (this.preferences.preferences) {
            this.enablePreferences();
        }

        // Dispatch event for other parts of the app
        document.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
            detail: { preferences: this.preferences }
        }));
    }

    enableAnalytics() {
        // Initialize Google Analytics or other analytics
        if (window.gtag) {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
        console.log('📊 Analytics cookies enabled');
    }

    disableAnalytics() {
        if (window.gtag) {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
        console.log('📊 Analytics cookies disabled');
    }

    enableMarketing() {
        // Initialize marketing pixels
        console.log('🎯 Marketing cookies enabled');
    }

    disableMarketing() {
        console.log('🎯 Marketing cookies disabled');
    }

    enablePreferences() {
        console.log('⚙️ Preference cookies enabled');
    }

    showPreferencesModal() {
        const modal = this.createPreferencesModal();
        document.body.appendChild(modal);
        
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });

        // Focus management
        const firstToggle = modal.querySelector('.cookie-toggle');
        if (firstToggle) firstToggle.focus();
    }

    createPreferencesModal() {
        const modal = document.createElement('div');
        modal.className = 'cookie-preferences-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'preferences-title');

        modal.innerHTML = `
            <div class="cookie-preferences-content">
                <h2 id="preferences-title">Cookie Preferences</h2>
                <p>Choose which cookies you want to allow. You can change these settings at any time.</p>
                
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <div>
                            <h3>Necessary Cookies</h3>
                            <p>Required for basic website functionality</p>
                        </div>
                        <div class="cookie-toggle active" data-category="necessary" aria-label="Necessary cookies (always enabled)">
                            <span style="display: none;">Always Required</span>
                        </div>
                    </div>
                </div>
                
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <div>
                            <h3>Analytics Cookies</h3>
                            <p>Help us understand how visitors interact with our website</p>
                        </div>
                        <div class="cookie-toggle ${this.preferences.analytics ? 'active' : ''}" 
                             data-category="analytics" 
                             tabindex="0" 
                             role="switch" 
                             aria-checked="${this.preferences.analytics}"
                             aria-label="Toggle analytics cookies">
                        </div>
                    </div>
                </div>
                
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <div>
                            <h3>Marketing Cookies</h3>
                            <p>Used to track visitors and display relevant advertisements</p>
                        </div>
                        <div class="cookie-toggle ${this.preferences.marketing ? 'active' : ''}" 
                             data-category="marketing"
                             tabindex="0" 
                             role="switch" 
                             aria-checked="${this.preferences.marketing}"
                             aria-label="Toggle marketing cookies">
                        </div>
                    </div>
                </div>
                
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <div>
                            <h3>Preference Cookies</h3>
                            <p>Remember your settings and preferences</p>
                        </div>
                        <div class="cookie-toggle ${this.preferences.preferences ? 'active' : ''}" 
                             data-category="preferences"
                             tabindex="0" 
                             role="switch" 
                             aria-checked="${this.preferences.preferences}"
                             aria-label="Toggle preference cookies">
                        </div>
                    </div>
                </div>
                
                <div class="cookie-actions" style="margin-top: 2rem; justify-content: flex-end;">
                    <button type="button" class="cookie-button cookie-cancel">Cancel</button>
                    <button type="button" class="cookie-button cookie-save cookie-button--primary">Save Preferences</button>
                </div>
            </div>
        `;

        this.bindModalEvents(modal);
        return modal;
    }

    bindModalEvents(modal) {
        // Toggle switches
        modal.addEventListener('click', (e) => {
            const toggle = e.target.closest('.cookie-toggle');
            if (toggle && toggle.dataset.category !== 'necessary') {
                const category = toggle.dataset.category;
                const isActive = toggle.classList.contains('active');
                
                toggle.classList.toggle('active');
                toggle.setAttribute('aria-checked', !isActive);
            }
            
            if (e.target.closest('.cookie-save')) {
                this.savePreferencesFromModal(modal);
            } else if (e.target.closest('.cookie-cancel')) {
                this.closePreferencesModal();
            }
        });

        // Keyboard support for toggles
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const toggle = e.target.closest('.cookie-toggle');
                if (toggle && toggle.dataset.category !== 'necessary') {
                    e.preventDefault();
                    toggle.click();
                }
            }
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePreferencesModal();
            }
        });
    }

    savePreferencesFromModal(modal) {
        const toggles = modal.querySelectorAll('.cookie-toggle');
        
        toggles.forEach(toggle => {
            const category = toggle.dataset.category;
            const isActive = toggle.classList.contains('active');
            this.preferences[category] = isActive;
        });

        this.saveConsent();
        this.applyConsentPreferences();
        this.closePreferencesModal();
        this.removeBanner();
        this.announceToScreenReader('Cookie preferences saved');
    }

    closePreferencesModal() {
        const modal = document.querySelector('.cookie-preferences-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    removeBanner() {
        const banner = document.querySelector('.cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    }

    updateBannerTheme() {
        const banner = document.querySelector('.cookie-consent-banner');
        if (banner) {
            // Re-apply styles with new theme
            this.addConsentStyles(banner);
        }
    }

    announceToScreenReader(message) {
        const liveRegion = document.querySelector('#live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => liveRegion.textContent = '', 1000);
        }
    }

    // Public API
    updatePreferences(newPreferences) {
        this.preferences = { ...this.preferences, ...newPreferences };
        this.saveConsent();
        this.applyConsentPreferences();
    }

    getPreferences() {
        return { ...this.preferences };
    }

    resetConsent() {
        localStorage.removeItem(this.consentKey);
        localStorage.removeItem(this.preferencesKey);
        this.consentGiven = false;
        this.preferences = { ...COOKIE_CONFIG.categories };
        this.showConsentBanner();
    }

    showPreferences() {
        this.showPreferencesModal();
    }
}

// Add to the initializeAdditionalFeatures function in main.js
async function initializeAdditionalFeatures() {
    const promises = [];
    
    // Initialize cookie consent FIRST
    if (COOKIE_CONFIG.enabled) {
        const cookieConsent = new CookieConsentController();
        window.cookieConsent = cookieConsent; // Make available globally
    }
    
    // Initialize analytics (after cookie consent)
    if (MAIN_CONFIG.features.enableAnalytics && !MAIN_CONFIG.isDevelopment) {
        promises.push(initializeAnalytics());
    }
    
    // ... rest of existing code
}
        // Configuration object for easy customization
        const CONFIG = {
            animations: {
                duration: 1000,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                observerThreshold: 0.15,
                staggerDelay: 150
            },
            theme: {
                storageKey: 'portfolio-theme',
                transitionDuration: 300
            },
            navbar: {
                scrollThreshold: 100,
                hideThreshold: 200
            },
            typewriter: {
                texts: [
                    'AI Creative Designer & Digital Innovator',
                    'Machine Learning Specialist',
                    'Creative Technology Expert',
                    'Multilingual Content Creator',
                    'Digital Experience Architect',
                    'Innovation Catalyst'
                ],
                speed: 80,
                deleteSpeed: 50,
                pauseDuration: 2000
            }
        };

        /*
        ========================================
        ADVANCED SCROLL ANIMATION CONTROLLER
        ========================================
        */
        class ScrollAnimations {
            constructor() {
                this.observerOptions = {
                    threshold: CONFIG.animations.observerThreshold,
                    rootMargin: '0px 0px -50px 0px'
                };
                
                this.elements = {
                    sections: document.querySelectorAll('.section'),
                    skillCards: document.querySelectorAll('.skill-card'),
                    portfolioCards: document.querySelectorAll('.portfolio-card'),
                    aboutImage: document.querySelector('.about-image'),
                    aboutTextContent: document.querySelector('.about-text-content'),
                    contactInfo: document.querySelector('.contact-info'),
                    contactForm: document.querySelector('.contact-form')
                };

                this.init();
            }

            init() {
                this.observeSections();
                this.observeSkillCards();
                this.observePortfolioCards();
                this.observeAboutSection();
                this.observeContactSection();
            }

            observeSections() {
                const sectionObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const title = entry.target.querySelector('.section-title');
                            const subtitle = entry.target.querySelector('.section-subtitle');
                            
                            if (title) {
                                setTimeout(() => {
                                    title.style.opacity = '1';
                                    title.style.transform = 'translateY(0)';
                                }, 100);
                            }
                            
                            if (subtitle) {
                                setTimeout(() => {
                                    subtitle.style.opacity = '1';
                                    subtitle.style.transform = 'translateY(0)';
                                }, 300);
                            }
                        }
                    });
                }, this.observerOptions);

                this.elements.sections.forEach(section => {
                    sectionObserver.observe(section);
                });
            }

            observeSkillCards() {
                const skillObserver = new IntersectionObserver((entries) => {
                    entries.forEach((entry, index) => {
                        if (entry.isIntersecting) {
                            setTimeout(() => {
                                entry.target.style.opacity = '1';
                                entry.target.style.transform = 'translateY(0) scale(1)';
                                entry.target.classList.add('animate');
                                
                                // Animate progress bar
                                const progressBar = entry.target.querySelector('.skill-progress > div');
                                if (progressBar) {
                                    setTimeout(() => {
                                        progressBar.style.width = progressBar.style.width;
                                    }, 500);
                                }
                            }, Array.from(this.elements.skillCards).indexOf(entry.target) * CONFIG.animations.staggerDelay);
                        }
                    });
                }, {
                    ...this.observerOptions,
                    threshold: 0.3
                });

                this.elements.skillCards.forEach(card => {
                    skillObserver.observe(card);
                });
            }

            observePortfolioCards() {
                const portfolioObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const index = Array.from(this.elements.portfolioCards).indexOf(entry.target);
                            setTimeout(() => {
                                entry.target.style.opacity = '1';
                                entry.target.style.transform = 'translateY(0)';
                                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                            }, index * 200);
                        }
                    });
                }, this.observerOptions);

                this.elements.portfolioCards.forEach(card => {
                    portfolioObserver.observe(card);
                });
            }

            observeAboutSection() {
                const aboutObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            if (this.elements.aboutImage) {
                                setTimeout(() => {
                                    this.elements.aboutImage.style.opacity = '1';
                                    this.elements.aboutImage.style.transform = 'translateX(0)';
                                }, 200);
                            }
                            
                            if (this.elements.aboutTextContent) {
                                setTimeout(() => {
                                    this.elements.aboutTextContent.style.opacity = '1';
                                    this.elements.aboutTextContent.style.transform = 'translateX(0)';
                                }, 400);
                            }
                        }
                    });
                }, this.observerOptions);

                const aboutSection = document.querySelector('.about-section');
                if (aboutSection) {
                    aboutObserver.observe(aboutSection);
                }
            }

            observeContactSection() {
                const contactObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            if (this.elements.contactInfo) {
                                setTimeout(() => {
                                    this.elements.contactInfo.style.opacity = '1';
                                    this.elements.contactInfo.style.transform = 'translateX(0)';
                                }, 200);
                            }
                            
                            if (this.elements.contactForm) {
                                setTimeout(() => {
                                    this.elements.contactForm.style.opacity = '1';
                                    this.elements.contactForm.style.transform = 'translateX(0)';
                                }, 400);
                            }
                        }
                    });
                }, this.observerOptions);

                const contactSection = document.querySelector('.contact-section');
                if (contactSection) {
                    contactObserver.observe(contactSection);
                }
            }
        }

        /*
        ========================================
        ADVANCED TYPEWRITER EFFECT
        ========================================
        */
        class TypewriterEffect {
            constructor(element, texts, options = {}) {
                this.element = element;
                this.texts = texts;
                this.options = {
                    speed: options.speed || CONFIG.typewriter.speed,
                    deleteSpeed: options.deleteSpeed || CONFIG.typewriter.deleteSpeed,
                    pauseDuration: options.pauseDuration || CONFIG.typewriter.pauseDuration
                };
                
                this.currentTextIndex = 0;
                this.currentCharIndex = 0;
                this.isDeleting = false;
                this.isPaused = false;
                
                this.init();
            }

            init() {
                if (this.element) {
                    this.type();
                }
            }

            type() {
                const currentText = this.texts[this.currentTextIndex];
                
                if (this.isDeleting) {
                    this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
                    this.currentCharIndex--;
                } else {
                    this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
                    this.currentCharIndex++;
                }

                let typeSpeed = this.isDeleting ? this.options.deleteSpeed : this.options.speed;

                if (!this.isDeleting && this.currentCharIndex === currentText.length) {
                    this.isPaused = true;
                    typeSpeed = this.options.pauseDuration;
                    this.isDeleting = true;
                } else if (this.isDeleting && this.currentCharIndex === 0) {
                    this.isDeleting = false;
                    this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
                    typeSpeed = 500;
                }

                setTimeout(() => this.type(), typeSpeed);
            }
        }

        /*
        ========================================
        ENHANCED THEME CONTROLLER
        ========================================
        */
        class ThemeController {
            constructor() {
                this.currentTheme = localStorage.getItem(CONFIG.theme.storageKey) || 'light';
                this.themeToggle = document.getElementById('themeToggle');
                
                this.init();
            }

            init() {
                this.applyTheme(this.currentTheme);
                this.bindEvents();
            }

            bindEvents() {
                if (this.themeToggle) {
                    this.themeToggle.addEventListener('click', () => {
                        this.toggleTheme();
                    });
                }
            }

            toggleTheme() {
                this.themeToggle.classList.add('switching');
                
                setTimeout(() => {
                    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
                    this.applyTheme(this.currentTheme);
                    this.themeToggle.classList.remove('switching');
                }, CONFIG.theme.transitionDuration);
            }

            applyTheme(theme) {
                document.body.setAttribute('data-theme', theme);
                localStorage.setItem(CONFIG.theme.storageKey, theme);
                
                // Update theme toggle icon
                const moonIcon = this.themeToggle?.querySelector('.fa-moon');
                const sunIcon = this.themeToggle?.querySelector('.fa-sun');
                
                if (theme === 'dark') {
                    moonIcon?.classList.remove('d-inline-block');
                    moonIcon?.classList.add('d-none');
                    sunIcon?.classList.remove('d-none');
                    sunIcon?.classList.add('d-inline-block');
                } else {
                    moonIcon?.classList.remove('d-none');
                    moonIcon?.classList.add('d-inline-block');
                    sunIcon?.classList.remove('d-inline-block');
                    sunIcon?.classList.add('d-none');
                }
            }
        }

        /*
        ========================================
        ENHANCED NAVBAR CONTROLLER
        ========================================
        */
        class NavbarController {
            constructor() {
                this.navbar = document.getElementById('mainNavbar');
                this.lastScrollTop = 0;
                this.isVisible = true;
                
                this.init();
            }

            init() {
                               this.bindEvents();
                this.updateActiveNavLinks();
            }

            bindEvents() {
                let ticking = false;
                
                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        requestAnimationFrame(() => {
                            this.handleScroll();
                            ticking = false;
                        });
                        ticking = true;
                    }
                });

                // Smooth scroll for navigation links
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', (e) => {
                        e.preventDefault();
                        const target = document.querySelector(anchor.getAttribute('href'));
                        if (target) {
                            target.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    });
                });
            }

            handleScroll() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Add scrolled class
                if (scrollTop > CONFIG.navbar.scrollThreshold) {
                    this.navbar.classList.add('scrolled');
                } else {
                    this.navbar.classList.remove('scrolled');
                }

                // Hide/show navbar on scroll
                if (scrollTop > CONFIG.navbar.hideThreshold) {
                    if (scrollTop > this.lastScrollTop && this.isVisible) {
                        // Scrolling down
                        this.navbar.classList.add('hidden');
                        this.isVisible = false;
                    } else if (scrollTop < this.lastScrollTop && !this.isVisible) {
                        // Scrolling up
                        this.navbar.classList.remove('hidden');
                        this.isVisible = true;
                    }
                }

                this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
                this.updateActiveNavLinks();
            }

            updateActiveNavLinks() {
                const sections = document.querySelectorAll('section[id]');
                const navLinks = document.querySelectorAll('.nav-link');
                
                let current = '';
                const scrollPosition = window.pageYOffset + 200;

                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        current = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${current}`) {
                        link.classList.add('active');
                    }
                });
            }
        }

        /*
        ========================================
        FORM VALIDATION AND SUBMISSION
        ========================================
        */
        class ContactFormController {
            constructor() {
                this.form = document.getElementById('contactForm');
                this.submitButton = this.form?.querySelector('button[type="submit"]');
                this.originalButtonText = this.submitButton?.innerHTML;
                
                this.init();
            }

            init() {
                if (this.form) {
                    this.bindEvents();
                    this.setupValidation();
                }
            }

            bindEvents() {
                this.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSubmit();
                });

                // Real-time validation
                const inputs = this.form.querySelectorAll('.form-control');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => this.validateField(input));
                    input.addEventListener('input', () => this.clearFieldError(input));
                });
            }

            setupValidation() {
                const emailField = this.form.querySelector('#email');
                if (emailField) {
                    emailField.addEventListener('input', () => {
                        this.validateEmail(emailField);
                    });
                }
            }

            validateField(field) {
                const value = field.value.trim();
                const isValid = value.length > 0;

                if (field.hasAttribute('required') && !isValid) {
                    this.showFieldError(field, 'This field is required');
                    return false;
                }

                if (field.type === 'email' && value && !this.isValidEmail(value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    return false;
                }

                this.showFieldSuccess(field);
                return true;
            }

            validateEmail(field) {
                const value = field.value.trim();
                if (value && !this.isValidEmail(value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    return false;
                }
                this.clearFieldError(field);
                return true;
            }

            isValidEmail(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }

            showFieldError(field, message) {
                field.classList.add('error');
                field.classList.remove('success');
                
                // Remove existing error message
                const existingError = field.parentNode.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }

                // Add new error message
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.style.color = '#ef4444';
                errorDiv.style.fontSize = '0.9rem';
                errorDiv.style.marginTop = '5px';
                errorDiv.textContent = message;
                field.parentNode.appendChild(errorDiv);
            }

            showFieldSuccess(field) {
                field.classList.add('success');
                field.classList.remove('error');
                this.clearFieldError(field);
            }

            clearFieldError(field) {
                field.classList.remove('error');
                const errorMessage = field.parentNode.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            }

            validateForm() {
                const fields = this.form.querySelectorAll('.form-control[required]');
                let isValid = true;

                fields.forEach(field => {
                    if (!this.validateField(field)) {
                        isValid = false;
                    }
                });

                return isValid;
            }

            async handleSubmit() {
                if (!this.validateForm()) {
                    return;
                }

                this.setLoadingState(true);

                try {
                    // Simulate form submission (replace with actual API call)
                    await this.simulateFormSubmission();
                    this.showSuccessMessage();
                    this.form.reset();
                } catch (error) {
                    this.showErrorMessage('Something went wrong. Please try again later.');
                } finally {
                    this.setLoadingState(false);
                }
            }

            simulateFormSubmission() {
                return new Promise((resolve) => {
                    setTimeout(() => resolve(), 2000);
                });
            }

            setLoadingState(isLoading) {
                if (isLoading) {
                    this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i>Sending...';
                    this.submitButton.disabled = true;
                    this.form.classList.add('loading');
                } else {
                    this.submitButton.innerHTML = this.originalButtonText;
                    this.submitButton.disabled = false;
                    this.form.classList.remove('loading');
                }
            }

            showSuccessMessage() {
                const successDiv = document.createElement('div');
                successDiv.className = 'alert alert-success';
                successDiv.style.marginTop = '20px';
                successDiv.style.padding = '15px';
                successDiv.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                successDiv.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                successDiv.style.borderRadius = '10px';
                successDiv.style.color = '#10b981';
                successDiv.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 10px;"></i>Thank you! Your message has been sent successfully.';
                
                this.form.appendChild(successDiv);
                
                setTimeout(() => {
                    successDiv.remove();
                }, 5000);
            }

            showErrorMessage(message) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'alert alert-danger';
                errorDiv.style.marginTop = '20px';
                errorDiv.style.padding = '15px';
                errorDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                errorDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                errorDiv.style.borderRadius = '10px';
                errorDiv.style.color = '#ef4444';
                errorDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i>${message}`;
                
                this.form.appendChild(errorDiv);
                
                setTimeout(() => {
                    errorDiv.remove();
                }, 5000);
            }
        }

        /*
        ========================================
        PERFORMANCE OPTIMIZER
        ========================================
        */
        class PerformanceOptimizer {
            constructor() {
                this.init();
            }

            init() {
                this.optimizeScrolling();
                this.lazyLoadImages();
                this.preloadCriticalAssets();
            }

            optimizeScrolling() {
                // Use passive event listeners for better scroll performance
                let supportsPassive = false;
                try {
                    window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
                        get: function() { supportsPassive = true; }
                    }));
                } catch(e) {}

                const scrollOptions = supportsPassive ? { passive: true } : false;
                document.addEventListener('touchstart', function() {}, scrollOptions);
                document.addEventListener('touchmove', function() {}, scrollOptions);
            }

            lazyLoadImages() {
                if ('IntersectionObserver' in window) {
                    const imageObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const img = entry.target;
                                img.src = img.dataset.src;
                                img.classList.remove('lazy');
                                imageObserver.unobserve(img);
                            }
                        });
                    });

                    document.querySelectorAll('img[data-src]').forEach(img => {
                        imageObserver.observe(img);
                    });
                }
            }

            preloadCriticalAssets() {
                // Preload critical images or assets
                const criticalAssets = [
                    // Add paths to critical assets here
                ];

                criticalAssets.forEach(asset => {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = asset.includes('.css') ? 'style' : 'image';
                    link.href = asset;
                    document.head.appendChild(link);
                });
            }
        }

        /*
        ========================================
        ACCESSIBILITY ENHANCEMENTS
        ========================================
        */
        class AccessibilityEnhancer {
            constructor() {
                this.init();
            }

            init() {
                this.enhanceKeyboardNavigation();
                this.addSkipLinks();
                this.improveAriaLabels();
                this.handleReducedMotion();
            }

            enhanceKeyboardNavigation() {
                // Trap focus in modals
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        this.handleTabNavigation(e);
                    }
                    
                    if (e.key === 'Escape') {
                        this.handleEscapeKey(e);
                    }
                });
            }

            addSkipLinks() {
                if (!document.querySelector('.skip-link')) {
                    const skipLink = document.createElement('a');
                    skipLink.className = 'skip-link';
                    skipLink.href = '#main-content';
                    skipLink.textContent = 'Skip to main content';
                    skipLink.style.cssText = `
                        position: absolute;
                        top: -40px;
                        left: 6px;
                        background: var(--primary-light);
                        color: white;
                        padding: 8px;
                        text-decoration: none;
                        border-radius: 4px;
                        z-index: 9999;
                        transition: top 0.3s;
                    `;
                    
                    skipLink.addEventListener('focus', () => {
                        skipLink.style.top = '6px';
                    });
                    
                    skipLink.addEventListener('blur', () => {
                        skipLink.style.top = '-40px';
                    });
                    
                    document.body.insertBefore(skipLink, document.body.firstChild);
                }
            }

            improveAriaLabels() {
                // Add aria-labels to interactive elements that need them
                const interactiveElements = document.querySelectorAll('button, a, input, textarea');
                interactiveElements.forEach(element => {
                    if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
                        const text = element.textContent || element.value || element.placeholder;
                        if (text) {
                            element.setAttribute('aria-label', text.trim());
                        }
                    }
                });
            }

            handleReducedMotion() {
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
                
                if (prefersReducedMotion.matches) {
                    // Disable animations for users who prefer reduced motion
                    document.documentElement.style.setProperty('--transition-smooth', '0.1s');
                    document.documentElement.style.setProperty('--transition-bounce', '0.1s');
                    
                    // Remove animation classes
                    document.querySelectorAll('[class*="animate"]').forEach(el => {
                        el.style.animation = 'none';
                    });
                }
            }

            handleTabNavigation(e) {
                // Enhanced tab navigation logic can be implemented here
                // This is a placeholder for more complex focus management
            }

            handleEscapeKey(e) {
                // Close any open modals or dropdowns
                const openModals = document.querySelectorAll('.modal.show, .dropdown.show');
                openModals.forEach(modal => {
                    // Close modal logic would go here
                });
            }
        }

        /*
        ========================================
        MAIN INITIALIZATION
        ========================================
        */
        class PortfolioApp {
            constructor() {
                this.components = {};
                this.init();
            }

            init() {
                // Wait for DOM to be fully loaded
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        this.initializeComponents();
                    });
                } else {
                    this.initializeComponents();
                }
            }

            initializeComponents() {
                try {
                    // Initialize all components
                    this.components.scrollAnimations = new ScrollAnimations();
                    this.components.themeController = new ThemeController();
                    this.components.navbarController = new NavbarController();
                    this.components.contactForm = new ContactFormController();
                    this.components.performanceOptimizer = new PerformanceOptimizer();
                    this.components.accessibilityEnhancer = new AccessibilityEnhancer();

                    // Initialize typewriter effect
                    const typewriterElement = document.getElementById('typewriter');
                    if (typewriterElement) {
                        this.components.typewriter = new TypewriterEffect(
                            typewriterElement,
                            CONFIG.typewriter.texts
                        );
                    }

                    // Add loading animation completion
                    document.body.classList.add('loaded');
                    
                    console.log('🚀 Portfolio application initialized successfully!');
                } catch (error) {
                    console.error('❌ Error initializing portfolio application:', error);
                }
            }

            // Public method to get component instances
            getComponent(name) {
                return this.components[name];
            }

            // Public method to reinitialize specific components
            reinitialize(componentName) {
                if (componentName && this.components[componentName]) {
                    // Reinitialize specific component
                    delete this.components[componentName];
                    // Add reinitalization logic here based on component type
                } else {
                    // Reinitialize all components
                    this.initializeComponents();
                }
            }
        }

        /*
        ========================================
        UTILITY FUNCTIONS
        ========================================
        */
        const Utils = {
            // Debounce function for performance optimization
            debounce: function(func, wait, immediate) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        timeout = null;
                        if (!immediate) func(...args);
                    };
                    const callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) func(...args);
                };
            },

            // Throttle function for scroll events
            throttle: function(func, limit) {
                let inThrottle;
                return function() {
                    const args = arguments;
                    const context = this;
                    if (!inThrottle) {
                        func.apply(context, args);
                        inThrottle = true;
                        setTimeout(() => inThrottle = false, limit);
                    }
                };
            },

            // Check if element is in viewport
            isInViewport: function(element) {
                const rect = element.getBoundingClientRect();
                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
            },

            // Generate unique ID
            generateId: function() {
                return '_' + Math.random().toString(36).substr(2, 9);
            },

            // Smooth scroll to element
            scrollToElement: function(element, offset = 0) {
                const elementPosition = element.offsetTop - offset;
                window.scrollTo({
                    top: elementPosition,
                    behavior: 'smooth'
                });
            }
        };

        /*
        ========================================
        ERROR HANDLING AND MONITORING
        ========================================
        */
        window.addEventListener('error', (e) => {
            console.error('Global error caught:', e.error);
            // Here you could send error reports to your monitoring service
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            // Here you could send error reports to your monitoring service
        });

        /*
        ========================================
        INITIALIZE APPLICATION
        ========================================
        */
        
        // Create global app instance
        const portfolioApp = new PortfolioApp();
        
        // Make app instance globally accessible for debugging
        window.PortfolioApp = portfolioApp;
        window.Utils = Utils;

        // Add some helpful console messages
        console.log(`
        🎨 Welcome to Thanatsitt's Portfolio!
        
        ✨ Features:
        • Advanced scroll animations
        • Dark/Light theme toggle  
        • Responsive design
        • Accessibility enhancements
        • Performance optimizations
        • Interactive contact form
        
        🛠️ Built with:
        • Vanilla JavaScript (ES6+)
        • CSS3 with custom properties
        • Bootstrap 5.3
        • Font Awesome 6.4
        • Modern web APIs
        
        🚀 Enjoy exploring!
        `);
        
