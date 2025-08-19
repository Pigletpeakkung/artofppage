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
