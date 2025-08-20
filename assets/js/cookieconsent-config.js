/*!
 * Cookie Consent Configuration
 * GDPR/CCPA Compliant Cookie Manager
 * Author: Thanatsitt Santisamranwilai
 * Version: 1.2.0
 */

'use strict';

// Initialize Cookie Consent when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍪 Initializing Cookie Consent Manager...');
    
    // Cookie Consent Configuration
    window.cookieconsent.initialise({
        // Container and positioning
        container: document.body,
        position: 'bottom-right',
        static: false,
        
        // Cookie settings
        cookie: {
            name: 'portfolio_cookieconsent_status',
            path: '/',
            domain: window.location.hostname === 'localhost' ? '' : '.pegearts.com',
            expiryDays: 365,
            secure: window.location.protocol === 'https:',
            sameSite: 'Lax'
        },
        
        // Content configuration
        content: {
            header: 'Cookie Settings',
            message: 'This website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. By continuing to use this site, you consent to our use of cookies.',
            dismiss: 'Accept All',
            allow: 'Accept All', 
            deny: 'Decline',
            link: 'Learn more',
            href: '/privacy-policy.html',
            close: '×',
            policy: 'Cookie Policy',
            target: '_blank',
            
            // Custom messages for different compliance levels
            messageOptOut: 'We use cookies to improve your experience. You can opt out of non-essential cookies.',
            messageOptIn: 'We would like to use cookies to improve your experience. Please choose your preferences.',
            
            // Button text customization
            settings: 'Cookie Settings',
            save: 'Save Preferences',
            
            // Category descriptions
            necessary: 'Essential cookies are required for basic site functionality.',
            analytics: 'Analytics cookies help us understand how visitors interact with our website.',
            marketing: 'Marketing cookies are used to track visitors across websites for personalized advertising.',
            preferences: 'Preference cookies remember your settings and choices.',
        },
        
        // Compliance type - set to 'opt-in' for GDPR compliance
        type: 'opt-in',
        
        // Layout and theming
        theme: 'edgeless',
        palette: {
            popup: {
                background: 'rgba(0, 0, 0, 0.9)',
                text: '#ffffff',
                border: 'rgba(255, 255, 255, 0.1)'
            },
            button: {
                background: 'linear-gradient(135deg, #A78BFA, #F9A8D4)',
                text: '#ffffff',
                border: 'transparent'
            },
            highlight: {
                background: '#A78BFA',
                text: '#ffffff',
                border: '#A78BFA'
            }
        },
        
        // Custom styling
        elements: {
            messagelink: '<span id="cookieconsent:desc" class="cc-message">{{message}} <a aria-label="learn more about cookies" role="button" tabindex="0" class="cc-link" href="{{href}}" rel="noopener noreferrer nofollow" target="{{target}}">{{link}}</a></span>',
            allow: '<a aria-label="allow cookies" role="button" tabindex="0" class="cc-btn cc-allow" href="#">{{allow}}</a>',
            deny: '<a aria-label="deny cookies" role="button" tabindex="0" class="cc-btn cc-deny" href="#">{{deny}}</a>',
            link: '<a aria-label="learn more about our privacy policy" role="button" tabindex="0" class="cc-link" href="{{href}}" rel="noopener noreferrer nofollow" target="{{target}}">{{link}}</a>',
            close: '<span aria-label="dismiss cookie message" role="button" tabindex="0" class="cc-close" href="#">{{close}}</span>',
        },
        
        // Advanced options
        revokable: true,
        animateRevokable: true,
        showLink: true,
        enabled: true,
        autoOpen: true,
        autoAttach: true,
        whitelistPage: [],
        blacklistPage: [],
        
        // Custom cookie categories for granular control
        categories: {
            necessary: {
                needed: true,
                wanted: true,
                checked: true,
                language: 'en'
            },
            analytics: {
                needed: false,
                wanted: false, 
                checked: false,
                language: 'en'
            },
            marketing: {
                needed: false,
                wanted: false,
                checked: false,
                language: 'en'
            },
            preferences: {
                needed: false,
                wanted: false,
                checked: false, 
                language: 'en'
            }
        },
        
        // Compliance and legal
        law: {
            regionalLaw: true,
            countryCode: 'US', // Default to US, will be detected
            gdprApplies: true,
            ccpaApplies: true
        },
        
        // Location-based compliance detection
        location: {
            services: ['ipinfo'],
            serviceDefinitions: {
                ipinfo: function(done) {
                    fetch('https://ipinfo.io/json')
                        .then(response => response.json())
                        .then(data => {
                            const country = data.country;
                            const isEU = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'].includes(country);
                            const isCCPA = ['US'].includes(country);
                            
                            done({
                                country: country,
                                hasLaw: isEU || isCCPA,
                                gdpr: isEU,
                                ccpa: isCCPA
                            });
                        })
                        .catch(() => {
                            // Fallback - assume GDPR applies for safety
                            done({
                                country: 'US',
                                hasLaw: true,
                                gdpr: true,
                                ccpa: true
                            });
                        });
                }
            }
        },
        
        // Event callbacks
        onStatusChange: function(status, chosenBefore) {
            console.log('🍪 Cookie consent status changed:', status);
            handleCookieConsent(status, chosenBefore);
            
            // Track consent change
            if (typeof gtag !== 'undefined') {
                gtag('event', 'cookie_consent_update', {
                    event_category: 'Privacy',
                    event_label: status,
                    value: chosenBefore ? 1 : 0
                });
            }
            
            // Store consent in localStorage for reference
            localStorage.setItem('portfolio_cookie_consent', JSON.stringify({
                status: status,
                timestamp: new Date().toISOString(),
                chosenBefore: chosenBefore
            }));
        },
        
        onRevokeChoice: function() {
            console.log('🍪 Cookie consent revoked');
            handleCookieRevocation();
            
            // Track revocation
            if (typeof gtag !== 'undefined') {
                gtag('event', 'cookie_consent_revoked', {
                    event_category: 'Privacy',
                    event_label: 'manual_revocation'
                });
            }
        },
        
        onInitialise: function(status) {
            console.log('🍪 Cookie consent initialized with status:', status);
            
            // Set initial consent state
            if (status === cookieconsent.status.allow) {
                enableCookies();
            } else {
                disableCookies();
            }
        },
        
        onNoCrawl: function(status) {
            console.log('🍪 Cookie consent - crawler detected, status:', status);
        }
    });
});

/**
 * Handle cookie consent decisions
 * @param {string} status - The consent status ('allow' or 'deny')
 * @param {boolean} chosenBefore - Whether the user has made a choice before
 */
function handleCookieConsent(status, chosenBefore) {
    if (status === cookieconsent.status.allow) {
        console.log('✅ Cookies accepted - enabling tracking');
        enableCookies();
        
        // Show success message
        showConsentMessage('Cookies enabled! Thanks for helping us improve your experience.', 'success');
        
    } else if (status === cookieconsent.status.deny) {
        console.log('❌ Cookies declined - disabling tracking');
        disableCookies();
        
        // Show info message
        showConsentMessage('Cookie preferences saved. You can change these anytime.', 'info');
    }
    
    // Update UI elements based on consent
    updateUIBasedOnConsent(status);
    
    // Notify other scripts about consent change
    document.dispatchEvent(new CustomEvent('cookieConsentChange', {
        detail: {
            status: status,
            chosenBefore: chosenBefore,
            timestamp: new Date().toISOString()
        }
    }));
}

/**
 * Handle cookie consent revocation
 */
function handleCookieRevocation() {
    disableCookies();
    clearExistingCookies();
    
    // Show revocation message
    showConsentMessage('All cookies have been cleared. Your privacy preferences have been reset.', 'warning');
    
    // Update UI
    updateUIBasedOnConsent('deny');
    
    // Notify other scripts
    document.dispatchEvent(new CustomEvent('cookieConsentRevoked', {
        detail: {
            timestamp: new Date().toISOString()
        }
    }));
}

/**
 * Enable cookies and tracking
 */
function enableCookies() {
    // Enable Google Analytics if available
    if (typeof gtag !== 'undefined') {
        console.log('📊 Enabling Google Analytics');
        gtag('consent', 'update', {
            'analytics_storage': 'granted',
            'ad_storage': 'denied', // Keep ads disabled unless specifically opted in
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
        });
    }
    
    // Enable other tracking services
    enableServiceWorkerTracking();
    enablePerformanceTracking();
    enableUserPreferences();
    
    // Set a flag for other scripts to check
    window.portfolioCookiesEnabled = true;
    
    console.log('✅ All approved tracking services enabled');
}

/**
 * Disable cookies and tracking
 */
function disableCookies() {
    // Disable Google Analytics if available
    if (typeof gtag !== 'undefined') {
        console.log('📊 Disabling Google Analytics');
        gtag('consent', 'update', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
        });
    }
    
    // Disable other tracking services
    disableServiceWorkerTracking();
    disablePerformanceTracking();
    
    // Set a flag for other scripts to check
    window.portfolioCookiesEnabled = false;
    
    console.log('❌ All tracking services disabled');
}

/**
 * Clear existing cookies (except essential ones)
 */
function clearExistingCookies() {
    console.log('🧹 Clearing non-essential cookies...');
    
    const cookiesToKeep = [
        'portfolio_cookieconsent_status',
        'portfolio_theme_preference',
        'portfolio_language_preference'
    ];
    
    // Get all cookies
    const cookies = document.cookie.split(';');
    
    // Clear each cookie except essential ones
    cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        if (!cookiesToKeep.includes(name) && name) {
            // Clear cookie by setting it to expire in the past
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            console.log('🗑️ Cleared cookie:', name);
        }
    });
    
    // Clear localStorage items related to tracking (but keep essential preferences)
    const localStorageKeep = [
        'portfolio_theme',
        'portfolio_cookie_consent',
        'portfolio_language',
        'portfolio_accessibility_settings'
    ];
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && !localStorageKeep.some(keepKey => key.includes(keepKey))) {
            if (key.includes('analytics') || key.includes('tracking') || key.includes('ga_')) {
                localStorage.removeItem(key);
                console.log('🗑️ Cleared localStorage item:', key);
            }
        }
    }
}

/**
 * Show consent-related messages to user
 * @param {string} message - The message to show
 * @param {string} type - The message type ('success', 'info', 'warning', 'error')
 */
function showConsentMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `cookie-consent-message cookie-consent-message--${type}`;
    messageEl.innerHTML = `
        <div class="cookie-consent-message__content">
            <span class="cookie-consent-message__text">${message}</span>
            <button class="cookie-consent-message__close" aria-label="Close message">&times;</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 5000);
    
    // Manual close
    messageEl.querySelector('.cookie-consent-message__close').addEventListener('click', () => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    });
}

/**
 * Update UI elements based on consent status
 * @param {string} status - The consent status
 */
function updateUIBasedOnConsent(status) {
    const consentStatus = status === cookieconsent.status.allow;
    
    // Update any privacy-related UI elements
    const privacyIndicators = document.querySelectorAll('[data-privacy-indicator]');
    privacyIndicators.forEach(indicator => {
        indicator.textContent = consentStatus ? 'Tracking Enabled' : 'Tracking Disabled';
        indicator.className = consentStatus ? 'privacy-status privacy-status--enabled' : 'privacy-status privacy-status--disabled';
    });
    
    // Update cookie settings button if present
    const cookieSettingsBtn = document.querySelector('#cookie-settings-btn');
    if (cookieSettingsBtn) {
        cookieSettingsBtn.textContent = consentStatus ? 'Cookie Settings' : 'Enable Cookies';
    }
    
    // Show/hide analytics-dependent features
    const analyticsFeatures = document.querySelectorAll('[data-requires-analytics]');
    analyticsFeatures.forEach(feature => {
        feature.style.display = consentStatus ? 'block' : 'none';
    });
}

/**
 * Enable Service Worker tracking (performance, errors)
 */
function enableServiceWorkerTracking() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Enable performance tracking
        navigator.serviceWorker.controller.postMessage({
            type: 'ENABLE_TRACKING',
            features: ['performance', 'errors', 'cache-stats']
        });
    }
}

/**
 * Disable Service Worker tracking
 */
function disableServiceWorkerTracking() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'DISABLE_TRACKING'
        });
    }
}

/**
 * Enable performance tracking
 */
function enablePerformanceTracking() {
    // Enable performance observer if supported
    if ('PerformanceObserver' in window) {
        try {
            const perfObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        console.log('📊 Page load time:', entry.loadEventEnd - entry.fetchStart + 'ms');
                    }
                }
            });
            perfObserver.observe({ entryTypes: ['navigation', 'resource'] });
            window.portfolioPerformanceTracking = perfObserver;
        } catch (error) {
            console.log('Performance tracking not supported:', error);
        }
    }
}

/**
 * Disable performance tracking
 */
function disablePerformanceTracking() {
    if (window.portfolioPerformanceTracking) {
        window.portfolioPerformanceTracking.disconnect();
        delete window.portfolioPerformanceTracking;
    }
}

/**
 * Enable user preferences storage
 */
function enableUserPreferences() {
    // This allows storing user preferences like theme, language, etc.
    window.portfolioPreferencesEnabled = true;
    console.log('✅ User preferences storage enabled');
}

/**
 * Add cookie settings button to page (if not already present)
 */
function addCookieSettingsButton() {
    if (!document.querySelector('#cookie-settings-btn')) {
        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'cookie-settings-btn';
        settingsBtn.className = 'cookie-settings-btn';
        settingsBtn.innerHTML = '🍪 Cookie Settings';
        settingsBtn.setAttribute('aria-label', 'Open cookie settings');
        
        // Style the button
        settingsBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 8px 12px;
            cursor: pointer;
            z-index: 9998;
            font-size: 12px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        
        // Add hover effect
        settingsBtn.addEventListener('mouseenter', () => {
            settingsBtn.style.background = 'rgba(0, 0, 0, 0.9)';
            settingsBtn.style.transform = 'translateY(-2px)';
        });
        
        settingsBtn.addEventListener('mouseleave', () => {
            settingsBtn.style.background = 'rgba(0, 0, 0, 0.8)';
            settingsBtn.style.transform = 'translateY(0)';
        });
        
        // Add click handler to open settings
        settingsBtn.addEventListener('click', () => {
            if (window.cookieconsent) {
                window.cookieconsent.openOptionsDialog();
            }
        });
        
        document.body.appendChild(settingsBtn);
    }
}

/**
 * Initialize cookie consent banner styling
 */
function initializeCookieConsentStyling() {
    // Add custom CSS for better integration with portfolio design
    const style = document.createElement('style');
    style.textContent = `
        /* Cookie Consent Custom Styles */
        .cc-window {
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border-radius: 16px !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            max-width: 400px !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        }
        
        .cc-message {
            font-size: 14px !important;
            line-height: 1.5 !important;
            margin-bottom: 1rem !important;
        }
        
        .cc-btn {
            border-radius: 8px !important;
            padding: 10px 20px !important;
            font-weight: 600 !important;
            font-size: 14px !important;
            transition: all 0.3s ease !important;
            text-transform: none !important;
            margin: 0 4px !important;
        }
        
        .cc-btn:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
        }
        
        .cc-link {
            color: #A78BFA !important;
            text-decoration: none !important;
            border-bottom: 1px solid transparent !important;
            transition: all 0.3s ease !important;
        }
        
        .cc-link:hover {
            border-bottom-color: #A78BFA !important;
        }
        
        .cc-revoke {
            background: rgba(0, 0, 0, 0.8) !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 8px !important;
            transition: all 0.3s ease !important;
        }
        
        .cc-revoke:hover {
            background: rgba(0, 0, 0, 0.9) !important;
            transform: translateY(-2px) !important;
        }
        
        /* Cookie consent messages */
        .cookie-consent-message {
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 300px;
            padding: 16px;
            border-radius: 12px;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 9999;
            font-family: 'Inter', sans-serif;
            animation: slideInRight 0.3s ease-out;
        }
        
        .cookie-consent-message--success {
            background: rgba(16, 185, 129, 0.9);
            color: white;
        }
        
        .cookie-consent-message--info {
            background: rgba(59, 130, 246, 0.9);
            color: white;
        }
        
        .cookie-consent-message--warning {
            background: rgba(245, 158, 11, 0.9);
            color: white;
        }
        
        .cookie-consent-message--error {
            background: rgba(239, 68, 68, 0.9);
            color: white;
        }
        
        .cookie-consent-message__content {
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }
        
        .cookie-consent-message__text {
            flex-grow: 1;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .cookie-consent-message__close {
            background: none;
            border: none;
            color: currentColor;
            cursor: pointer;
            font-size: 20px;
            line-height: 1;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }
        
        .cookie-consent-message__close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            .cc-window {
                position: fixed !important;
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
                max-width: none !important;
                border-radius: 16px 16px 0 0 !important;
            }
            
            .cookie-consent-message {
                top: 10px;
                right: 10px;
                left: 10px;
                max-width: none;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize styling when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCookieConsentStyling);
} else {
    initializeCookieConsentStyling();
}

// Add cookie settings button after consent is initialized
setTimeout(() => {
    addCookieSettingsButton();
}, 1000);

// Export functions for external use
window.portfolioCookieConsent = {
    enable: enableCookies,
    disable: disableCookies,
    clear: clearExistingCookies,
    showSettings: () => {
        if (window.cookieconsent) {
            window.cookieconsent.openOptionsDialog();
        }
    },
    getStatus: () => {
        return window.cookieconsent ? window.cookieconsent.hasConsented() : false;
    },
    revoke: () => {
        if (window.cookieconsent) {
            window.cookieconsent.revokeChoice();
        }
    }
};

console.log('🍪 Cookie Consent Configuration loaded successfully');
