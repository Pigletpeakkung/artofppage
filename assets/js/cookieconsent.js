
/*!
 * Cookie Consent Manager v2.1.0
 * Modern GDPR/CCPA compliant cookie consent solution
 * Author: Thanatsitt Santisamranwilai
 * License: MIT
 */

(function(window, document, undefined) {
    'use strict';

    // Default configuration
    const defaultConfig = {
        // Cookie settings
        cookieName: 'portfolio_cookie_consent',
        cookieExpiry: 365, // days
        
        // Content configuration
        content: {
            header: '🍪 We use cookies',
            message: 'This website uses cookies to enhance your browsing experience and provide personalized content. By continuing to use this site, you consent to our use of cookies.',
            dismiss: 'Accept All',
            deny: 'Reject All',
            link: 'Learn More',
            href: '/privacy-policy.html',
            close: '✕',
            policy: 'Cookie Policy',
            save: 'Save Preferences',
            settings: 'Cookie Settings'
        },

        // UI configuration
        position: 'bottom', // 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
        layout: 'block', // 'block', 'classic', 'edgeless'
        palette: {
            popup: {
                background: '#1a1a1a',
                text: '#ffffff',
                link: '#4ECDC4'
            },
            button: {
                background: '#A78BFA',
                text: '#ffffff',
                border: 'transparent'
            },
            highlight: {
                background: '#FF6B6B',
                text: '#ffffff',
                border: 'transparent'
            }
        },

        // Behavior
        showLink: true,
        dismissOnScroll: false,
        dismissOnTimeout: false,
        autoOpen: true,
        revokable: true,
        animateRevokable: true,
        
        // Compliance
        type: 'info', // 'info', 'opt-in', 'opt-out'
        law: {
            regionalLaw: true,
            countryCode: 'US',
            hasTransition: false
        },

        // Categories for granular consent
        categories: {
            necessary: {
                name: 'Necessary',
                description: 'Essential cookies for website functionality',
                required: true,
                enabled: true
            },
            analytics: {
                name: 'Analytics',
                description: 'Help us understand how visitors interact with our website',
                required: false,
                enabled: false
            },
            marketing: {
                name: 'Marketing',
                description: 'Used to track visitors and display relevant ads',
                required: false,
                enabled: false
            },
            preferences: {
                name: 'Preferences',
                description: 'Remember your settings and preferences',
                required: false,
                enabled: false
            }
        },

        // Callbacks
        onPopupOpen: function() {},
        onPopupClose: function() {},
        onInitialise: function(status) {},
        onStatusChange: function(status, chosenBefore) {},
        onRevokeChoice: function() {},
        onNoCookieLaw: function(countryCode, country) {}
    };

    // Cookie Consent Class
    class CookieConsent {
        constructor(options = {}) {
            this.config = this.mergeObjects(defaultConfig, options);
            this.status = this.getStatus();
            this.element = null;
            this.backdrop = null;
            this.settingsModal = null;
            
            this.init();
        }

        // Utility: Deep merge objects
        mergeObjects(target, source) {
            const result = { ...target };
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.mergeObjects(target[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
            return result;
        }

        // Initialize the consent manager
        init() {
            if (this.hasConsented()) {
                this.config.onInitialise.call(this, this.status);
                this.loadApprovedCookies();
                if (this.config.revokable) {
                    this.attachRevokeButton();
                }
                return;
            }

            if (this.config.autoOpen) {
                this.open();
            }

            this.config.onInitialise.call(this, this.status);
        }

        // Create the consent popup
        createPopup() {
            const popup = document.createElement('div');
            popup.className = `cc-window cc-${this.config.layout} cc-type-${this.config.type} cc-theme-${this.config.position}`;
            popup.setAttribute('role', 'dialog');
            popup.setAttribute('aria-live', 'polite');
            popup.setAttribute('aria-label', 'Cookie Consent');
            popup.setAttribute('aria-describedby', 'cookieconsent:desc');

            const innerHTML = `
                <span id="cookieconsent:desc" class="cc-message">
                    <strong class="cc-header">${this.config.content.header}</strong>
                    <p>${this.config.content.message}</p>
                    ${this.config.showLink ? `<a aria-label="${this.config.content.policy}" class="cc-link" href="${this.config.content.href}" target="_blank">${this.config.content.link}</a>` : ''}
                </span>
                <div class="cc-compliance">
                    ${this.config.type === 'opt-in' ? `
                        <button class="cc-btn cc-deny" type="button">${this.config.content.deny}</button>
                        <button class="cc-btn cc-allow" type="button">${this.config.content.dismiss}</button>
                        <button class="cc-btn cc-settings" type="button">${this.config.content.settings}</button>
                    ` : `
                        <button class="cc-btn cc-dismiss" type="button">${this.config.content.dismiss}</button>
                        ${this.config.showLink ? `<button class="cc-btn cc-settings" type="button">${this.config.content.settings}</button>` : ''}
                    `}
                </div>
                <button class="cc-close" type="button" aria-label="Close">${this.config.content.close}</button>
            `;

            popup.innerHTML = innerHTML;
            this.attachStyles(popup);
            this.attachEvents(popup);
            
            return popup;
        }

        // Create settings modal
        createSettingsModal() {
            const modal = document.createElement('div');
            modal.className = 'cc-settings-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'cc-settings-title');

            let categoriesHTML = '';
            Object.keys(this.config.categories).forEach(key => {
                const category = this.config.categories[key];
                categoriesHTML += `
                    <div class="cc-category">
                        <div class="cc-category-header">
                            <label class="cc-switch">
                                <input type="checkbox" 
                                       data-category="${key}" 
                                       ${category.enabled ? 'checked' : ''} 
                                       ${category.required ? 'disabled' : ''}>
                                <span class="cc-slider"></span>
                                <span class="cc-category-name">${category.name}</span>
                                ${category.required ? '<span class="cc-required">(Required)</span>' : ''}
                            </label>
                        </div>
                        <p class="cc-category-description">${category.description}</p>
                    </div>
                `;
            });

            modal.innerHTML = `
                <div class="cc-settings-content">
                    <div class="cc-settings-header">
                        <h2 id="cc-settings-title">Cookie Settings</h2>
                        <button class="cc-settings-close" type="button" aria-label="Close">${this.config.content.close}</button>
                    </div>
                    <div class="cc-settings-body">
                        <p>Manage your cookie preferences. You can enable or disable different types of cookies below.</p>
                        <div class="cc-categories">
                            ${categoriesHTML}
                        </div>
                    </div>
                    <div class="cc-settings-footer">
                        <button class="cc-btn cc-save" type="button">${this.config.content.save}</button>
                        <button class="cc-btn cc-deny-all" type="button">${this.config.content.deny}</button>
                        <button class="cc-btn cc-allow-all" type="button">${this.config.content.dismiss}</button>
                    </div>
                </div>
            `;

            this.attachSettingsStyles(modal);
            this.attachSettingsEvents(modal);
            
            return modal;
        }

        // Attach CSS styles
        attachStyles(element) {
            const style = document.createElement('style');
            style.textContent = `
                .cc-window {
                    position: fixed;
                    z-index: 9999;
                    font-family: inherit;
                    font-size: 14px;
                    line-height: 1.5;
                    max-width: 100%;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    border-radius: 8px;
                    padding: 20px;
                    background: ${this.config.palette.popup.background};
                    color: ${this.config.palette.popup.text};
                    transition: all 0.3s ease;
                }
                
                .cc-theme-bottom { bottom: 20px; left: 20px; right: 20px; }
                .cc-theme-top { top: 20px; left: 20px; right: 20px; }
                .cc-theme-bottom-left { bottom: 20px; left: 20px; max-width: 400px; }
                .cc-theme-bottom-right { bottom: 20px; right: 20px; max-width: 400px; }
                .cc-theme-top-left { top: 20px; left: 20px; max-width: 400px; }
                .cc-theme-top-right { top: 20px; right: 20px; max-width: 400px; }
                
                .cc-header { display: block; margin-bottom: 8px; font-weight: 600; }
                .cc-message { display: block; margin-bottom: 16px; }
                .cc-message p { margin: 8px 0; }
                
                .cc-link {
                    color: ${this.config.palette.popup.link};
                    text-decoration: underline;
                    transition: opacity 0.2s ease;
                }
                .cc-link:hover { opacity: 0.8; }
                
                .cc-compliance { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
                
                .cc-btn {
                    padding: 10px 20px;
                    border: 2px solid ${this.config.palette.button.border};
                    border-radius: 6px;
                    background: ${this.config.palette.button.background};
                    color: ${this.config.palette.button.text};
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    display: inline-block;
                }
                .cc-btn:hover { opacity: 0.9; transform: translateY(-1px); }
                .cc-btn:active { transform: translateY(0); }
                
                .cc-deny, .cc-deny-all {
                    background: transparent;
                    color: ${this.config.palette.popup.text};
                    border-color: ${this.config.palette.popup.text};
                }
                
                .cc-settings {
                    background: transparent;
                    color: ${this.config.palette.popup.link};
                    border-color: ${this.config.palette.popup.link};
                }
                
                .cc-close {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    background: none;
                    border: none;
                    color: ${this.config.palette.popup.text};
                    font-size: 18px;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.2s ease;
                }
                .cc-close:hover { opacity: 1; }
                
                .cc-revoke {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    z-index: 9998;
                    padding: 8px 12px;
                    background: ${this.config.palette.button.background};
                    color: ${this.config.palette.button.text};
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.3s ease;
                }
                .cc-revoke:hover { opacity: 0.9; }
                
                @media (max-width: 768px) {
                    .cc-window {
                        left: 10px !important;
                        right: 10px !important;
                        bottom: 10px !important;
                        max-width: none;
                    }
                    .cc-compliance { flex-direction: column; }
                    .cc-btn { width: 100%; text-align: center; }
                }
                
                .cc-animate { animation: ccSlideUp 0.3s ease; }
                @keyframes ccSlideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        // Attach settings modal styles
        attachSettingsStyles(modal) {
            const style = document.createElement('style');
            style.textContent = `
                .cc-settings-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: ccFadeIn 0.3s ease;
                }
                
                .cc-settings-content {
                    background: white;
                    border-radius: 12px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    animation: ccSlideIn 0.3s ease;
                }
                
                .cc-settings-header {
                    padding: 24px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .cc-settings-header h2 {
                    margin: 0;
                    color: #333;
                    font-size: 24px;
                }
                
                .cc-settings-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    transition: color 0.2s ease;
                }
                .cc-settings-close:hover { color: #333; }
                
                .cc-settings-body {
                    padding: 24px;
                    color: #555;
                }
                
                .cc-category {
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #f0f0f0;
                }
                .cc-category:last-child { border-bottom: none; }
                
                .cc-category-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;
                }
                
                .cc-switch {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    gap: 12px;
                }
                
                .cc-switch input {
                    position: relative;
                    width: 44px;
                    height: 24px;
                    appearance: none;
                    background: #ddd;
                    border-radius: 12px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                
                .cc-switch input:checked {
                    background: ${this.config.palette.button.background};
                }
                
                .cc-switch input:before {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    background: white;
                    border-radius: 50%;
                    transition: transform 0.2s ease;
                }
                
                .cc-switch input:checked:before {
                    transform: translateX(20px);
                }
                
                .cc-switch input:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .cc-category-name {
                    font-weight: 600;
                    color: #333;
                }
                
                .cc-required {
                    color: #666;
                    font-size: 12px;
                    font-weight: normal;
                }
                
                .cc-category-description {
                    margin: 0;
                    font-size: 14px;
                    color: #666;
                }
                
                .cc-settings-footer {
                    padding: 24px;
                    border-top: 1px solid #eee;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }
                
                @keyframes ccFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes ccSlideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @media (max-width: 768px) {
                    .cc-settings-footer {
                        flex-direction: column;
                    }
                    .cc-settings-footer .cc-btn {
                        width: 100%;
                        text-align: center;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Attach event listeners
        attachEvents(element) {
            // Dismiss button
            const dismissBtn = element.querySelector('.cc-dismiss, .cc-allow');
            if (dismissBtn) {
                dismissBtn.addEventListener('click', () => this.accept());
            }

            // Deny button
            const denyBtn = element.querySelector('.cc-deny');
            if (denyBtn) {
                denyBtn.addEventListener('click', () => this.deny());
            }

            // Settings button
            const settingsBtn = element.querySelector('.cc-settings');
            if (settingsBtn) {
                settingsBtn.addEventListener('click', () => this.openSettings());
            }

            // Close button
            const closeBtn = element.querySelector('.cc-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }

            // Dismiss on scroll
            if (this.config.dismissOnScroll) {
                let ticking = false;
                const scrollHandler = () => {
                    if (!ticking) {
                        requestAnimationFrame(() => {
                            if (window.pageYOffset > 100) {
                                this.accept();
                                window.removeEventListener('scroll', scrollHandler);
                            }
                            ticking = false;
                        });
                        ticking = true;
                    }
                };
                window.addEventListener('scroll', scrollHandler);
            }

            // Auto dismiss on timeout
            if (this.config.dismissOnTimeout) {
                setTimeout(() => {
                    if (this.element && document.body.contains(this.element)) {
                        this.accept();
                    }
                }, this.config.dismissOnTimeout);
            }
        }

        // Attach settings modal events
        attachSettingsEvents(modal) {
            // Close modal
            const closeBtn = modal.querySelector('.cc-settings-close');
            closeBtn.addEventListener('click', () => this.closeSettings());

            // Save preferences
            const saveBtn = modal.querySelector('.cc-save');
            saveBtn.addEventListener('click', () => this.savePreferences());

            // Accept all
            const acceptAllBtn = modal.querySelector('.cc-allow-all');
            acceptAllBtn.addEventListener('click', () => {
                this.enableAllCategories();
                this.accept();
            });

            // Deny all
            const denyAllBtn = modal.querySelector('.cc-deny-all');
            denyAllBtn.addEventListener('click', () => {
                this.disableAllCategories();
                this.deny();
            });

            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeSettings();
                }
            });

            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeSettings();
                }
            });
        }

        // Open consent popup
        open() {
            if (this.element) return;

            this.element = this.createPopup();
            this.element.classList.add('cc-animate');
            document.body.appendChild(this.element);
            
            // Focus management for accessibility
            this.element.querySelector('.cc-btn').focus();
            
            this.config.onPopupOpen.call(this);
        }

        // Close consent popup
        close() {
            if (!this.element) return;

            this.element.remove();
            this.element = null;
            this.config.onPopupClose.call(this);
        }

        // Open settings modal
        openSettings() {
            if (this.settingsModal) return;

            this.settingsModal = this.createSettingsModal();
            document.body.appendChild(this.settingsModal);
            
            // Focus management
            this.settingsModal.querySelector('.cc-settings-close').focus();
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }

        // Close settings modal
        closeSettings() {
            if (!this.settingsModal) return;

            this.settingsModal.remove();
            this.settingsModal = null;
            
            // Restore body scroll
            document.body.style.overflow = '';
        }

        // Accept cookies
        accept() {
            this.enableAllCategories();
            this.setStatus('allow');
            this.close();
            this.closeSettings();
            this.loadApprovedCookies();
            
            if (this.config.revokable) {
                this.attachRevokeButton();
            }
        }

        // Deny cookies
        deny() {
            this.disableAllCategories();
            this.setStatus('deny');
            this.close();
            this.closeSettings();
            this.clearNonEssentialCookies();
        }

        // Save custom preferences
        savePreferences() {
            const checkboxes = this.settingsModal.querySelectorAll('input[type="checkbox"]');
            const preferences = {};
            
            checkboxes.forEach(checkbox => {
                const category = checkbox.dataset.category;
                preferences[category] = checkbox.checked;
                this.config.categories[category].enabled = checkbox.checked;
            });

            this.setStatus('allow', preferences);
            this.close();
            this.closeSettings();
            this.loadApprovedCookies();
            
            if (this.config.revokable) {
                this.attachRevokeButton();
            }
        }

        // Enable all cookie categories
        enableAllCategories() {
            Object.keys(this.config.categories).forEach(key => {
                this.config.categories[key].enabled = true;
            });
        }

        // Disable non-essential categories
        disableAllCategories() {
            Object.keys(this.config.categories).forEach(key => {
                if (!this.config.categories[key].required) {
                    this.config.categories[key].enabled = false;
                }
            });
        }

        // Cookie management
        setStatus(status, preferences = null) {
            const consentData = {
                status: status,
                date: new Date().toISOString(),
                categories: preferences || this.getCategoriesStatus()
            };

            this.setCookie(this.config.cookieName, JSON.stringify(consentData), this.config.cookieExpiry);
            this.status = status;
            
            this.config.onStatusChange.call(this, status, this.hasConsented());
        }

        getStatus() {
            const cookie = this.getCookie(this.config.cookieName);
            if (cookie) {
                try {
                    const data = JSON.parse(cookie);
                    // Update categories from saved preferences
                    if (data.categories) {
                        Object.keys(data.categories).forEach(key => {
                            if (this.config.categories[key]) {
                                this.config.categories[key].enabled = data.categories[key];
                            }
                        });
                    }
                    return data.status;
                } catch (e) {
                    return null;
                }
            }
            return null;
        }

        getCategoriesStatus() {
            const status = {};
            Object.keys(this.config.categories).forEach(key => {
                status[key] = this.config.categories[key].enabled;
            });
            return status;
        }

        hasConsented() {
            return this.status === 'allow' || this.status === 'deny';
        }

        // Cookie utilities
        setCookie(name, value, days) {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
        }

        getCookie(name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        // Load approved cookies/scripts
        loadApprovedCookies() {
            Object.keys(this.config.categories).forEach(category => {
                if (this.config.categories[category].enabled) {
                    this.loadCategoryScripts(category);
                }
            });
        }

        loadCategoryScripts(category) {
            // Trigger custom events for each category
            const event = new CustomEvent('cookieConsentChanged', {
                detail: {
                    category: category,
                    enabled: true
                }
            });
            window.dispatchEvent(event);

            // Load category-specific scripts
            switch (category) {
                case 'analytics':
                    this.loadAnalytics();
                    break;
                case 'marketing':
                    this.loadMarketing();
                    break;
                case 'preferences':
                    this.loadPreferences();
                    break;
            }
        }

        loadAnalytics() {
            // Example: Load Google Analytics
            if (window.gtag) return; // Already loaded
            
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
            document.head.appendChild(script);
            
            script.onload = () => {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'GA_MEASUREMENT_ID');
            };
        }

        loadMarketing() {
            // Example: Load Facebook Pixel, Google Ads, etc.
            console.log('Loading marketing scripts...');
        }

        loadPreferences() {
            // Example: Load preference-related scripts
            console.log('Loading preference scripts...');
        }

        // Clear non-essential cookies
        clearNonEssentialCookies() {
            // Get all cookies
            const cookies = document.cookie.split(';');
            
            // Essential cookie patterns (customize as needed)
            const essentialPatterns = [
                /^portfolio_cookie_consent/,
                /^PHPSESSID/,
                /^csrftoken/,
                /^sessionid/
            ];
            
            cookies.forEach(cookie => {
                const cookieName = cookie.split('=')[0].trim();
                const isEssential = essentialPatterns.some(pattern => pattern.test(cookieName));
                
                if (!isEssential) {
                    // Clear the cookie
                    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname}`;
                    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
                }
            });
        }

        // Attach revoke button
        attachRevokeButton() {
            if (document.querySelector('.cc-revoke')) return;

            const revokeBtn = document.createElement('button');
            revokeBtn.className = 'cc-revoke';
            revokeBtn.textContent = '🍪';
            revokeBtn.title = 'Cookie Settings';
            revokeBtn.addEventListener('click', () => {
                this.openSettings();
            });

            document.body.appendChild(revokeBtn);

            if (this.config.animateRevokable) {
                setTimeout(() => {
                    revokeBtn.style.transform = 'translateX(0)';
                }, 2000);
            }
        }

        // Public API methods
        getConfig() {
            return this.config;
        }

        getStatus() {
            return this.status;
        }

        getCategoryStatus(category) {
            return this.config.categories[category]?.enabled || false;
        }

        revoke() {
            this.config.onRevokeChoice.call(this);
            this.setStatus(null);
            this.clearNonEssentialCookies();
            
            // Remove revoke button
            const revokeBtn = document.querySelector('.cc-revoke');
            if (revokeBtn) revokeBtn.remove();
            
            // Show consent popup again
            this.open();
        }
    }

    // Auto-initialize if not disabled
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.cookieConsentDisabled) {
            window.cookieConsent = new CookieConsent();
        }
    });

    // Export for manual initialization
    window.CookieConsent = CookieConsent;

})(window, document);

// Example usage and event listeners
document.addEventListener('cookieConsentChanged', function(e) {
    console.log(`Cookie category ${e.detail.category} is now ${e.detail.enabled ? 'enabled' : 'disabled'}`);
    
    // Example: Enable/disable specific tracking based on consent
    if (e.detail.category === 'analytics' && e.detail.enabled) {
        // Initialize analytics tracking
        console.log('Analytics tracking enabled');
    }
    
    if (e.detail.category === 'marketing' && e.detail.enabled) {
        // Initialize marketing pixels
        console.log('Marketing tracking enabled');
    }
});
