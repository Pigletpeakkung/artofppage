// ===============================================
// PORTFOLIO WEBSITE - COMPLETE JAVASCRIPT
// Thanatsitt Santisamranwilai - AI Creative Designer
// Version: 3.0 | Full Coverage Implementation
// ===============================================

'use strict';

// ===============================================
// GLOBAL CONFIGURATION
// ===============================================

const CONFIG = {
    animation: {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        stagger: 100
    },
    audio: {
        volume: 0.8,
        fadeTime: 500,
        preloadTimeout: 5000
    },
    performance: {
        enableParticles: true,
        maxParticles: 50,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    },
    accessibility: {
        focusRingColor: '#A78BFA',
        announceDelay: 100,
        keyboardShortcuts: true
    },
    forms: {
        validateOnInput: true,
        submitDelay: 1000,
        apiEndpoint: '/api/contact'
    },
    social: {
        shareApiEnabled: navigator.share !== undefined
    }
};

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

const Utils = {
    // Debounce function for performance optimization
    debounce(func, wait, immediate = false) {
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
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return (
            rect.top <= windowHeight * (1 - threshold) &&
            rect.bottom >= windowHeight * threshold
        );
    },

    // Generate unique ID
    generateId(prefix = 'element') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Sanitize HTML to prevent XSS
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // Format time for audio duration
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // Check if user prefers reduced motion
    prefersReducedMotion() {
        return CONFIG.performance.reducedMotion;
    },

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Get cookie value
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    },

    // Set cookie
    setCookie(name, value, days = 365) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
    },

    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        }
    }
};

// ===============================================
// ERROR HANDLING SYSTEM
// ===============================================

const ErrorHandler = {
    errorCount: 0,
    maxErrors: 10,

    init() {
        // Global error handling
        window.addEventListener('error', this.handleJSError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
        
        // Resource loading errors
        document.addEventListener('error', this.handleResourceError.bind(this), true);
        
        console.log('🛡️ Error Handler initialized');
    },

    handleJSError(event) {
        this.reportError('JavaScript Error', event.message, event.filename, event.lineno);
    },

    handlePromiseRejection(event) {
        this.reportError('Promise Rejection', event.reason?.message || event.reason);
        event.preventDefault();
    },

    handleResourceError(event) {
        const element = event.target;
        if (element.tagName === 'IMG') {
            this.handleImageError(element);
        } else if (element.tagName === 'AUDIO') {
            this.handleAudioError(element);
        } else if (element.tagName === 'SCRIPT') {
            this.handleScriptError(element);
        }
    },

    handleImageError(img) {
        console.warn('Image failed to load:', img.src);
        
        // Replace with placeholder SVG
        img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="Arial, sans-serif" font-size="16">Image not available</text></svg>';
        img.alt = 'Image not available';
        img.classList.add('error-placeholder');
    },

    handleAudioError(audio) {
        console.warn('Audio failed to load:', audio.src);
        
        // Disable associated buttons
        const buttons = document.querySelectorAll(`button[aria-label*="${audio.id}"], button[data-audio="${audio.id}"]`);
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Audio unavailable</span>';
            btn.classList.add('btn-error');
        });

        // Show error message to user
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Audio content is currently unavailable. Please try again later.');
        }
    },

    handleScriptError(script) {
        console.warn('Script failed to load:', script.src);
        this.reportError('Script Loading Error', `Failed to load: ${script.src}`);
    },

    reportError(type, message, source = '', line = '') {
        this.errorCount++;
        
        // Prevent error spam
        if (this.errorCount > this.maxErrors) {
            console.warn('Maximum error count reached. Suppressing further error reports.');
            return;
        }

        // Report to analytics or error tracking service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: `${type}: ${message}`,
                fatal: false,
                custom_map: {
                    source: source,
                    line: line
                }
            });
        }

        // Log for debugging
        console.group(`🚨 Error Report #${this.errorCount}`);
        console.log('Type:', type);
        console.log('Message:', message);
        if (source) console.log('Source:', source);
        if (line) console.log('Line:', line);
        console.log('Timestamp:', new Date().toISOString());
        console.groupEnd();
    }
};

// ===============================================
// LOADING SCREEN MANAGER
// ===============================================

const LoadingManager = {
    loadingScreen: null,
    isLoading: true,
    loadingProgress: 0,
    totalAssets: 0,
    loadedAssets: 0,

    init() {
        this.loadingScreen = document.getElementById('loadingScreen');
        if (!this.loadingScreen) {
            this.createLoadingScreen();
        }
        
        this.setupProgressTracking();
        this.startLoading();
        console.log('⏳ Loading Manager initialized');
    },

    createLoadingScreen() {
        this.loadingScreen = document.createElement('div');
        this.loadingScreen.id = 'loadingScreen';
        this.loadingScreen.className = 'loading-screen';
        this.loadingScreen.setAttribute('aria-hidden', 'true');
        this.loadingScreen.innerHTML = `
            <div class="loading-content">
                <div class="logo-animation">
                    <div class="loading-logo">
                        <span class="logo-text">Thanatsitt</span>
                        <div class="loading-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
                <div class="loading-text">
                    <h2>Loading Portfolio...</h2>
                    <div class="loading-progress">
                        <div class="progress-bar" id="loadingProgressBar"></div>
                        <span class="progress-text" id="loadingProgressText">0%</span>
                    </div>
                </div>
            </div>
        `;
        document.body.insertBefore(this.loadingScreen, document.body.firstChild);
    },

    setupProgressTracking() {
        // Count total assets to load
        const images = document.querySelectorAll('img');
        const audios = document.querySelectorAll('audio');
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        
        this.totalAssets = images.length + audios.length + stylesheets.length;

        // Track image loading
        images.forEach(img => {
            if (img.complete) {
                this.assetLoaded();
            } else {
                img.addEventListener('load', () => this.assetLoaded());
                img.addEventListener('error', () => this.assetLoaded());
            }
        });

        // Track audio loading
        audios.forEach(audio => {
            audio.addEventListener('canplaythrough', () => this.assetLoaded());
            audio.addEventListener('error', () => this.assetLoaded());
        });

        // Track stylesheet loading
        stylesheets.forEach(link => {
            if (link.sheet) {
                this.assetLoaded();
            } else {
                link.addEventListener('load', () => this.assetLoaded());
                link.addEventListener('error', () => this.assetLoaded());
            }
        });
    },

    startLoading() {
        // Simulate minimum loading time for better UX
        setTimeout(() => {
            this.checkLoadingComplete();
        }, 1000);
    },

    assetLoaded() {
        this.loadedAssets++;
        this.updateProgress();
    },

    updateProgress() {
        if (this.totalAssets === 0) return;
        
        this.loadingProgress = Math.min((this.loadedAssets / this.totalAssets) * 100, 100);
        
        const progressBar = document.getElementById('loadingProgressBar');
        const progressText = document.getElementById('loadingProgressText');
        
        if (progressBar) {
            progressBar.style.width = `${this.loadingProgress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(this.loadingProgress)}%`;
        }

        // Check if loading is complete
        if (this.loadingProgress >= 100) {
            setTimeout(() => this.completeLoading(), 500);
        }
    },

    checkLoadingComplete() {
        if (document.readyState === 'complete' && this.loadedAssets >= this.totalAssets) {
            this.completeLoading();
        } else {
            setTimeout(() => this.checkLoadingComplete(), 100);
        }
    },

    completeLoading() {
        if (!this.isLoading) return;
        
        this.isLoading = false;
        
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('loading-complete');
            
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                this.loadingScreen.remove();
                
                // Announce completion
                if (window.accessibilityManager) {
                    window.accessibilityManager.announce('Portfolio website fully loaded and ready for interaction');
                }
                
                // Trigger page entrance animations
                AnimationManager.triggerEntranceAnimations();
                
            }, 800);
        }
    }
};

// ===============================================
// CONTACT FORM MANAGER
// ===============================================

const ContactFormManager = {
    form: null,
    isSubmitting: false,
    validationRules: {
        name: { required: true, minLength: 2, maxLength: 50 },
        email: { required: true, email: true },
        message: { required: true, minLength: 10, maxLength: 1000 },
        projectType: { required: false },
        budget: { required: false }
    },

    init() {
        this.form = document.getElementById('contactForm');
        if (!this.form) {
            console.warn('Contact form not found');
            return;
        }

        this.setupFormValidation();
        this.setupFormSubmission();
        console.log('📧 Contact Form Manager initialized');
    },

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('input', () => {
                if (CONFIG.forms.validateOnInput) {
                    this.validateField(input);
                }
            });

            // Validation on blur
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            // Clear errors on focus
            input.addEventListener('focus', () => {
                this.clearFieldError(input);
            });
        });
    },

    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission();
        });
    },

    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = this.validationRules[fieldName];
        
        if (!rules) return true;

        // Clear previous errors
        this.clearFieldError(field);

        // Required validation
        if (rules.required && !value) {
            this.showFieldError(field, `${this.getFieldLabel(field)} is required`);
            return false;
        }

        // Email validation
        if (rules.email && value && !Utils.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }

        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
            this.showFieldError(field, `${this.getFieldLabel(field)} must be at least ${rules.minLength} characters`);
            return false;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            this.showFieldError(field, `${this.getFieldLabel(field)} must be no more than ${rules.maxLength} characters`);
            return false;
        }

        // Field is valid
        field.classList.add('valid');
        return true;
    },

    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    },

    async handleFormSubmission() {
        if (this.isSubmitting) return;

        // Validate form
        if (!this.validateForm()) {
            this.showFormMessage('Please correct the errors above', 'error');
            return;
        }

        this.isSubmitting = true;
        this.showSubmittingState();

        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());

            // Simulate API call (replace with actual endpoint)
            const response = await this.submitToAPI(data);

            if (response.success) {
                this.showSuccessState();
                this.form.reset();
                
                // Track submission
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        form_name: 'contact',
                        project_type: data.projectType || 'not_specified'
                    });
                }
            } else {
                throw new Error(response.message || 'Submission failed');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            this.showFormMessage('Sorry, there was an error sending your message. Please try again.', 'error');
            ErrorHandler.reportError('Form Submission Error', error.message);
        } finally {
            this.isSubmitting = false;
            setTimeout(() => this.resetSubmitButton(), 3000);
        }
    },

    async submitToAPI(data) {
        // Replace this with your actual API endpoint
        const response = await fetch(CONFIG.forms.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    },

    showFieldError(field, message) {
        field.classList.add('error');
        field.classList.remove('valid');
        
        const errorId = `${field.name}-error`;
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        // Announce error to screen readers
        if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Error: ${message}`, 'assertive');
        }
    },

    clearFieldError(field) {
        field.classList.remove('error');
        
        const errorId = `${field.name}-error`;
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    },

    showSubmittingState() {
        const submitBtn = this.form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('submitting');
            submitBtn.innerHTML = `
                <div class="loading-spinner"></div>
                <span>Sending...</span>
            `;
        }
    },

    showSuccessState() {
        const successElement = document.getElementById('form-success');
        if (successElement) {
            successElement.style.display = 'block';
            successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        this.showFormMessage('Thank you! Your message has been sent successfully.', 'success');
        
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Message sent successfully. Thank you for contacting me!');
        }
    },

    resetSubmitButton() {
        const submitBtn = this.form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('submitting');
            submitBtn.innerHTML = `
                <i class="fas fa-paper-plane" aria-hidden="true"></i>
                <span>Send Message</span>
            `;
        }
    },

    showFormMessage(message, type = 'info') {
        // Create or update form message element
        let messageElement = this.form.querySelector('.form-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'form-message';
            messageElement.setAttribute('role', 'alert');
            this.form.appendChild(messageElement);
        }

        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
        messageElement.style.display = 'block';

        // Auto-hide non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        }
    },

    getFieldLabel(field) {
        const label = this.form.querySelector(`label[for="${field.id}"]`);
        return label ? label.textContent.replace('*', '').trim() : field.name;
    }
};

// ===============================================
// COOKIE CONSENT MANAGER
// ===============================================

const CookieConsentManager = {
    consentBanner: null,
    consentGiven: false,

    init() {
        // Check if consent was already given
        this.consentGiven = Utils.getCookie('cookieConsent') === 'true';
        
        if (!this.consentGiven) {
            this.showConsentBanner();
        }
        
        console.log('🍪 Cookie Consent Manager initialized');
    },

    showConsentBanner() {
        this.consentBanner = document.getElementById('cookieConsent');
        
        if (!this.consentBanner) {
            this.createConsentBanner();
        }

        this.consentBanner.style.display = 'block';
        this.consentBanner.setAttribute('aria-hidden', 'false');
        
        // Setup event listeners
        this.setupConsentListeners();

        // Announce to screen readers
        setTimeout(() => {
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Cookie consent banner displayed. Please review and accept or decline.');
            }
        }, 1000);
    },

    createConsentBanner() {
        this.consentBanner = document.createElement('div');
        this.consentBanner.id = 'cookieConsent';
        this.consentBanner.className = 'cookie-consent';
        this.consentBanner.setAttribute('role', 'dialog');
        this.consentBanner.setAttribute('aria-labelledby', 'cookie-title');
        this.consentBanner.innerHTML = `
            <div class="cookie-content">
                <h3 id="cookie-title">We use cookies</h3>
                <p>This website uses cookies to enhance your browsing experience and provide personalized content. We respect your privacy and only use essential cookies.</p>
                <div class="cookie-actions">
                    <button id="acceptCookies" class="btn btn-primary">Accept All</button>
                    <button id="declineCookies" class="btn btn-outline">Essential Only</button>
                    <a href="/privacy-policy" class="cookie-policy-link">Privacy Policy</a>
                </div>
            </div>
        `;
        document.body.appendChild(this.consentBanner);
    },

    setupConsentListeners() {
        const acceptBtn = document.getElementById('acceptCookies');
        const declineBtn = document.getElementById('declineCookies');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptCookies());
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', () => this.declineCookies());
        }
    },

    acceptCookies() {
        Utils.setCookie('cookieConsent', 'true', 365);
        Utils.setCookie('analyticsConsent', 'true', 365);
        this.consentGiven = true;
        this.hideConsentBanner();
        
        // Enable analytics
        this.enableAnalytics();
        
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Cookie preferences saved. All cookies accepted.');
        }
    },

    declineCookies() {
        Utils.setCookie('cookieConsent', 'true', 365);
        Utils.setCookie('analyticsConsent', 'false', 365);
        this.consentGiven = true;
        this.hideConsentBanner();
        
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Cookie preferences saved. Only essential cookies will be used.');
        }
    },

    hideConsentBanner() {
        if (this.consentBanner) {
            this.consentBanner.style.display = 'none';
            this.consentBanner.setAttribute('aria-hidden', 'true');
        }
    },

    enableAnalytics() {
        // Enable Google Analytics if consent given
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                analytics_storage: 'granted'
            });
        }
    }
};

// ===============================================
// SOCIAL SHARING MANAGER
// ===============================================

const SocialSharingManager = {
    init() {
        this.setupShareButtons();
        this.setupCopyLinkButton();
        console.log('📤 Social Sharing Manager initialized');
    },

    setupShareButtons() {
        const shareButtons = document.querySelectorAll('.share-button');
        
        shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = button.dataset.platform;
                this.shareToPlatform(platform);
            });
        });

        // Native Web Share API if available
        if (CONFIG.social.shareApiEnabled) {
            this.setupNativeShare();
        }
    },

    setupNativeShare() {
        const nativeShareBtn = document.getElementById('nativeShare');
        if (nativeShareBtn) {
            nativeShareBtn.addEventListener('click', async () => {
                try {
                    await navigator.share({
                        title: document.title,
                        text: 'Check out this amazing AI Creative Designer portfolio!',
                        url: window.location.href
                    });
                } catch (error) {
                    console.log('Native sharing failed:', error);
                    this.fallbackShare();
                }
            });
        }
    },

    setupCopyLinkButton() {
        const copyButton = document.getElementById('copyLink');
        if (copyButton) {
            copyButton.addEventListener('click', async () => {
                const success = await Utils.copyToClipboard(window.location.href);
                
                if (success) {
                    this.showCopySuccess(copyButton);
                    if (window.accessibilityManager) {
                        window.accessibilityManager.announce('Portfolio URL copied to clipboard');
                    }
                }
            });
        }
    },

    shareToplatform(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const text = encodeURIComponent('Check out this amazing AI Creative Designer portfolio!');
        
        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            reddit: `https://reddit.com/submit?url=${url}&title=${title}`,
            email: `mailto:?subject=${title}&body=${text}%20${url}`
        };

        if (shareUrls[platform]) {
            if (platform === 'email') {
                window.location.href = shareUrls[platform];
            } else {
                window.open(shareUrls[platform], '_blank', 'width=550,height=420');
            }
        }
    },

    showCopySuccess(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.add('success');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('success');
        }, 2000);
    },

    fallbackShare() {
        // Fallback to copy URL
        Utils.copyToClipboard(window.location.href);
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('URL copied to clipboard for sharing');
        }
    }
};

// ===============================================
// ACCESSIBILITY MANAGER (ENHANCED)
// ===============================================

class AccessibilityManager {
    constructor() {
        this.reducedMotion = Utils.prefersReducedMotion();
        this.highContrast = window.matchMedia('(prefers-contrast: high)').matches;
        this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.previousFocus = null;
        this.liveRegion = null;
        this.focusTrap = null;
        this.init();
    }

    init() {
        this.setupLiveRegion();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupReducedMotion();
        this.setupColorSchemeDetection();
        this.setupSkipLinks();
        this.setupModalAccessibility();
        console.log('♿ Accessibility Manager initialized');
    }

    setupLiveRegion() {
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only visually-hidden';
        this.liveRegion.id = 'live-announcements';
        document.body.appendChild(this.liveRegion);
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Custom keyboard shortcuts
            if (CONFIG.accessibility.keyboardShortcuts) {
                this.handleKeyboardShortcuts(e);
            }
            
            // Focus management
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
            
            // Escape key functionality
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl + Shift + T: Toggle theme
        if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'T') {
            e.preventDefault();
            ThemeManager.toggle();
            this.announce('Theme toggled');
        }
        
        // Ctrl + Home: Back to top
        if (e.ctrlKey && e.key === 'Home') {
            e.preventDefault();
            this.scrollToTop();
        }
        
        // Alt + M: Skip to main content
        if (e.altKey && e.key.toLowerCase() === 'm') {
            e.preventDefault();
            this.skipToMain();
        }

        // Alt + C: Skip to contact form
        if (e.altKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            this.skipToContact();
        }

        // Alt + N: Skip to navigation
        if (e.altKey && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            this.skipToNavigation();
        }
    }

    setupFocusManagement() {
        // Enhanced focus indicators
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation *:focus {
                outline: 3px solid ${CONFIG.accessibility.focusRingColor} !important;
                outline-offset: 2px !important;
                border-radius: 4px !important;
            }
            
            .keyboard-navigation *:focus:not(:focus-visible) {
                outline: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    setupReducedMotion() {
        if (this.reducedMotion) {
            document.documentElement.classList.add('reduce-motion');
            CONFIG.animation.duration = 0;
            CONFIG.performance.enableParticles = false;
            
            // Disable AOS animations
            if (typeof AOS !== 'undefined') {
                AOS.init({ disable: true });
            }
        }
    }

    setupColorSchemeDetection() {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                ThemeManager.setTheme(e.matches ? 'dark' : 'light');
            }
        });

        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        highContrastQuery.addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.classList.add('high-contrast');
            } else {
                document.documentElement.classList.remove('high-contrast');
            }
        });
    }

    setupSkipLinks() {
        const skipLinks = document.querySelectorAll('.skip-link');
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    this.announce(`Skipped to ${target.getAttribute('aria-label') || targetId}`);
                }
            });
        });
    }

    setupModalAccessibility() {
        // Handle modal focus trapping
        document.addEventListener('shown.bs.modal', (e) => {
            this.trapFocus(e.target);
            this.saveFocus();
        });

        document.addEventListener('hidden.bs.modal', (e) => {
            this.releaseFocus();
            this.restoreFocus();
        });
    }

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        this.focusTrap = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        modal.addEventListener('keydown', this.focusTrap);
        
        // Focus first element
        if (firstElement) {
            firstElement.focus();
        }
    }

    releaseFocus() {
        if (this.focusTrap) {
            document.removeEventListener('keydown', this.focusTrap);
            this.focusTrap = null;
        }
    }

    announce(message, priority = 'polite') {
        if (this.liveRegion) {
            this.liveRegion.setAttribute('aria-live', priority);
            setTimeout(() => {
                this.liveRegion.textContent = message;
                setTimeout(() => {
                    this.liveRegion.textContent = '';
                }, 1000);
            }, CONFIG.accessibility.announceDelay);
        }
    }

    skipToMain() {
        const mainContent = document.getElementById('main-content') || document.querySelector('main');
        if (mainContent) {
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
            this.announce('Skipped to main content');
        }
    }

    skipToContact() {
        const contactForm = document.getElementById('contactForm') || document.getElementById('contact');
        if (contactForm) {
            contactForm.setAttribute('tabindex', '-1');
            contactForm.focus();
            this.announce('Skipped to contact form');
        }
    }

    skipToNavigation() {
        const navigation = document.querySelector('nav') || document.getElementById('mainNavbar');
        if (navigation) {
            const firstLink = navigation.querySelector('a');
            if (firstLink) {
                firstLink.focus();
                this.announce('Skipped to navigation menu');
            }
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: Utils.prefersReducedMotion() ? 'auto' : 'smooth'
        });
        this.announce('Scrolled to top of page');
        
        // Focus on skip link or main heading
        const skipLink = document.querySelector('.skip-link');
        const mainHeading = document.querySelector('h1');
        
        if (skipLink) {
            skipLink.focus();
        } else if (mainHeading) {
            mainHeading.setAttribute('tabindex', '-1');
            mainHeading.focus();
        }
    }

    handleEscapeKey() {
        // Close any open modals
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        });

        // Stop any playing audio
        AudioManager.stopAll();

        // Close mobile menu if open
        const mobileMenu = document.querySelector('.navbar-collapse.show');
        if (mobileMenu) {
            const bsCollapse = bootstrap.Collapse.getInstance(mobileMenu);
            if (bsCollapse) bsCollapse.hide();
        }
    }

    saveFocus() {
        this.previousFocus = document.activeElement;
    }

    restoreFocus() {
        if (this.previousFocus && this.previousFocus.focus) {
            this.previousFocus.focus();
            this.previousFocus = null;
        }
    }
}

// ===============================================
// THEME MANAGER (ENHANCED)
// ===============================================

const ThemeManager = {
    currentTheme: 'light',
    systemTheme: 'light',
    
    init() {
        this.systemTheme = this.getSystemTheme();
        this.currentTheme = this.getStoredTheme() || this.systemTheme;
        this.setTheme(this.currentTheme);
        this.setupToggleButton();
        this.setupSystemThemeListener();
        console.log('🎨 Theme Manager initialized:', this.currentTheme);
    },

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },

    getStoredTheme() {
        return localStorage.getItem('theme');
    },

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateToggleButton();
        this.updateMetaThemeColor();
        
        // Announce theme change
        if (window.accessibilityManager && theme !== this.getStoredTheme()) {
            window.accessibilityManager.announce(`Switched to ${theme} theme`);
        }
    },

    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Track theme change
        if (typeof gtag !== 'undefined') {
            gtag('event', 'theme_change', {
                theme: newTheme
            });
        }
    },

    setupToggleButton() {
        const toggleButton = document.getElementById('themeToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggle());
            
            // Keyboard support
            toggleButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }
    },

    setupSystemThemeListener() {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', (e) => {
            this.systemTheme = e.matches ? 'dark' : 'light';
            
            // Auto-switch if no manual preference set
            if (!this.getStoredTheme()) {
                this.setTheme(this.systemTheme);
            }
        });
    },

    updateToggleButton() {
        const toggleButton = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        if (toggleButton && themeIcon) {
            const isDark = this.currentTheme === 'dark';
            themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            toggleButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
            toggleButton.title = `Switch to ${isDark ? 'light' : 'dark'} theme (Ctrl+Shift+T)`;
        }
    },

    updateMetaThemeColor() {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = this.currentTheme === 'dark' ? '#1A202C' : '#F8FAFC';
        }
    }
};

// ===============================================
// AUDIO MANAGER (ENHANCED)
// ===============================================

const AudioManager = {
    activeAudio: null,
    audioElements: new Map(),
    globalVolume: 0.8,
    
    init() {
        this.loadVolumePreference();
        this.setupAudioElements();
        this.setupAudioControls();
        this.setupGlobalAudioControls();
        console.log('🎵 Audio Manager initialized');
    },

    loadVolumePreference() {
        const savedVolume = localStorage.getItem('audioVolume');
        if (savedVolume) {
            this.globalVolume = parseFloat(savedVolume);
        }
    },

    setupAudioElements() {
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            this.audioElements.set(audio.id, {
                element: audio,
                isLoaded: false,
                duration: 0,
                button: null
            });
            
            // Setup audio event listeners
            audio.addEventListener('loadedmetadata', () => {
                const audioData = this.audioElements.get(audio.id);
                audioData.isLoaded = true;
                audioData.duration = audio.duration;
                this.updateProgressBar(audio, 0);
                this.updateDurationDisplay(audio);
            });

            audio.addEventListener('timeupdate', () => {
                this.updateProgressBar(audio, audio.currentTime);
                this.updateTimeDisplay(audio);
            });

            audio.addEventListener('ended', () => {
                this.handleAudioEnd(audio);
            });

            audio.addEventListener('error', () => {
                ErrorHandler.handleAudioError(audio);
            });

            audio.addEventListener('play', () => {
                this.handleAudioPlay(audio);
            });

            audio.addEventListener('pause', () => {
                this.handleAudioPause(audio);
            });

            // Set volume
            audio.volume = this.globalVolume;
            
            // Preload important audio files
            if (audio.getAttribute('preload') === 'auto') {
                audio.load();
            }
        });
    },

    setupAudioControls() {
        // Voice demo buttons
        const demoButtons = document.querySelectorAll('.demo-button, .moon-voice-demo');
        demoButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAudioToggle(button);
            });

            // Keyboard support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleAudioToggle(button);
                }
            });

            // Store button reference
            const audioId = this.getAudioIdFromButton(button);
            if (audioId && this.audioElements.has(audioId)) {
                this.audioElements.get(audioId).button = button;
            }
        });

                // Progress bar interactions
        this.setupProgressBarInteractions();
    },

    setupProgressBarInteractions() {
        const progressBars = document.querySelectorAll('.audio-progress');
        progressBars.forEach(progressBar => {
            progressBar.addEventListener('click', (e) => {
                const audio = this.findAudioForProgressBar(progressBar);
                if (audio && audio.duration) {
                    const rect = progressBar.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = clickX / rect.width;
                    const newTime = percentage * audio.duration;
                    audio.currentTime = Math.max(0, Math.min(newTime, audio.duration));
                }
            });

            // Keyboard navigation for progress bars
            progressBar.addEventListener('keydown', (e) => {
                const audio = this.findAudioForProgressBar(progressBar);
                if (!audio) return;

                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        audio.currentTime = Math.max(0, audio.currentTime - 5);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
                        break;
                }
            });
        });
    },

    setupGlobalAudioControls() {
        // Global volume control if exists
        const volumeControl = document.getElementById('globalVolumeControl');
        if (volumeControl) {
            volumeControl.value = this.globalVolume;
            volumeControl.addEventListener('input', (e) => {
                this.setGlobalVolume(e.target.value);
            });
        }

        // Global mute button
        const muteButton = document.getElementById('globalMuteButton');
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                this.toggleGlobalMute();
            });
        }
    },

    handleAudioToggle(button) {
        const audioId = this.getAudioIdFromButton(button);
        const audio = document.getElementById(audioId);
        
        if (!audio) {
            console.warn('Audio element not found:', audioId);
            return;
        }

        // Stop other playing audio first
        if (this.activeAudio && this.activeAudio !== audio && !this.activeAudio.paused) {
            this.stopAudio(this.activeAudio);
        }

        if (audio.paused) {
            this.playAudio(audio, button);
        } else {
            this.pauseAudio(audio, button);
        }
    },

    getAudioIdFromButton(button) {
        // Enhanced mapping for all audio elements
        const buttonAudioMap = {
            'voiceDemoBtn': 'heroVoiceIntroAudio',
            'playIntroDemo': 'introDemo',
            'playNarrativeDemo': 'narrativeDemo',
            'playCharacterDemo': 'characterDemo',
            'playCommercialDemo': 'commercialDemo',
            'playPodcastDemo': 'podcastDemo'
        };
        
        return buttonAudioMap[button.id] || button.getAttribute('data-audio') || button.closest('[data-audio]')?.getAttribute('data-audio');
    },

    async playAudio(audio, button) {
        try {
            // Load audio if not already loaded
            if (audio.readyState < 2) {
                audio.load();
                await new Promise((resolve, reject) => {
                    const onLoaded = () => {
                        audio.removeEventListener('canplaythrough', onLoaded);
                        audio.removeEventListener('error', onError);
                        resolve();
                    };
                    const onError = () => {
                        audio.removeEventListener('canplaythrough', onLoaded);
                        audio.removeEventListener('error', onError);
                        reject(new Error('Audio loading failed'));
                    };
                    audio.addEventListener('canplaythrough', onLoaded);
                    audio.addEventListener('error', onError);
                });
            }

            this.activeAudio = audio;
            this.updateButtonState(button, 'playing');
            
            await audio.play();
            
            if (window.accessibilityManager) {
                const audioLabel = audio.getAttribute('aria-label') || audio.getAttribute('title') || 'Audio';
                window.accessibilityManager.announce(`Playing ${audioLabel}`);
            }

            // Track audio play event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'audio_play', {
                    audio_id: audio.id,
                    audio_duration: audio.duration
                });
            }

        } catch (error) {
            console.error('Audio play failed:', error);
            this.updateButtonState(button, 'error');
            ErrorHandler.handleAudioError(audio);
        }
    },

    pauseAudio(audio, button) {
        audio.pause();
        this.updateButtonState(button, 'paused');
        
        if (window.accessibilityManager) {
            const audioLabel = audio.getAttribute('aria-label') || audio.getAttribute('title') || 'Audio';
            window.accessibilityManager.announce(`Paused ${audioLabel}`);
        }
    },

    stopAudio(audio) {
        audio.pause();
        audio.currentTime = 0;
        
        if (this.activeAudio === audio) {
            this.activeAudio = null;
        }
        
        this.updateAllButtonStates();
    },

    stopAll() {
        this.audioElements.forEach(({ element }) => {
            if (!element.paused) {
                this.stopAudio(element);
            }
        });
    },

    handleAudioPlay(audio) {
        this.activeAudio = audio;
        const audioData = this.audioElements.get(audio.id);
        if (audioData?.button) {
            this.updateButtonState(audioData.button, 'playing');
        }
    },

    handleAudioPause(audio) {
        const audioData = this.audioElements.get(audio.id);
        if (audioData?.button) {
            this.updateButtonState(audioData.button, 'paused');
        }
    },

    handleAudioEnd(audio) {
        this.activeAudio = null;
        this.updateAllButtonStates();
        
        if (window.accessibilityManager) {
            const audioLabel = audio.getAttribute('aria-label') || audio.getAttribute('title') || 'Audio';
            window.accessibilityManager.announce(`Finished playing ${audioLabel}`);
        }

        // Auto-play next audio if in a playlist
        const nextAudio = this.findNextAudio(audio);
        if (nextAudio) {
            setTimeout(() => {
                const nextButton = this.audioElements.get(nextAudio.id)?.button;
                if (nextButton) {
                    this.playAudio(nextAudio, nextButton);
                }
            }, 1000);
        }
    },

    findNextAudio(currentAudio) {
        // Find next audio in sequence for playlist functionality
        const audioIds = Array.from(this.audioElements.keys());
        const currentIndex = audioIds.indexOf(currentAudio.id);
        
        if (currentIndex >= 0 && currentIndex < audioIds.length - 1) {
            return document.getElementById(audioIds[currentIndex + 1]);
        }
        
        return null;
    },

    updateButtonState(button, state) {
        if (!button) return;

        const icon = button.querySelector('i');
        const text = button.querySelector('span, .btn-text');
        
        button.classList.remove('playing', 'paused', 'error', 'loading');
        button.classList.add(state);
        
        switch (state) {
            case 'playing':
                if (icon) icon.className = 'fas fa-pause';
                if (text) text.textContent = 'Pause';
                button.setAttribute('aria-pressed', 'true');
                break;
            case 'paused':
            case 'stopped':
                if (icon) icon.className = 'fas fa-play';
                if (text) text.textContent = 'Play';
                button.setAttribute('aria-pressed', 'false');
                break;
            case 'loading':
                if (icon) icon.className = 'fas fa-spinner fa-spin';
                if (text) text.textContent = 'Loading...';
                button.disabled = true;
                break;
            case 'error':
                if (icon) icon.className = 'fas fa-exclamation-triangle';
                if (text) text.textContent = 'Error';
                button.disabled = true;
                button.setAttribute('aria-pressed', 'false');
                break;
        }
    },

    updateAllButtonStates() {
        const buttons = document.querySelectorAll('.demo-button, .moon-voice-demo, [data-audio]');
        buttons.forEach(button => {
            if (!button.disabled) {
                this.updateButtonState(button, 'stopped');
            }
        });
    },

    updateProgressBar(audio, currentTime) {
        const progressContainers = document.querySelectorAll('.audio-progress, .progress-container');
        progressContainers.forEach(container => {
            const progressFill = container.querySelector('.progress-bar, .progress-fill');
            if (progressFill && audio.duration) {
                const percentage = (currentTime / audio.duration) * 100;
                progressFill.style.width = `${percentage}%`;
                container.setAttribute('aria-valuenow', Math.round(percentage));
                container.setAttribute('aria-valuetext', `${Utils.formatTime(currentTime)} of ${Utils.formatTime(audio.duration)}`);
            }
        });
    },

    updateTimeDisplay(audio) {
        const timeDisplays = document.querySelectorAll('.time-display, .audio-time');
        timeDisplays.forEach(display => {
            if (audio.duration) {
                display.textContent = `${Utils.formatTime(audio.currentTime)} / ${Utils.formatTime(audio.duration)}`;
            }
        });
    },

    updateDurationDisplay(audio) {
        const durationDisplays = document.querySelectorAll('.audio-duration');
        durationDisplays.forEach(display => {
            display.textContent = Utils.formatTime(audio.duration);
        });
    },

    findAudioForProgressBar(progressBar) {
        // Find associated audio element
        const audioContainer = progressBar.closest('.audio-player, .voice-demo, .demo-card');
        if (audioContainer) {
            return audioContainer.querySelector('audio');
        }
        
        // Fallback: find by data attribute
        const audioId = progressBar.getAttribute('data-audio');
        if (audioId) {
            return document.getElementById(audioId);
        }
        
        return null;
    },

    setGlobalVolume(volume) {
        this.globalVolume = parseFloat(volume);
        localStorage.setItem('audioVolume', this.globalVolume.toString());
        
        // Update all audio elements
        this.audioElements.forEach(({ element }) => {
            element.volume = this.globalVolume;
        });

        if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Volume set to ${Math.round(this.globalVolume * 100)}%`);
        }
    },

    toggleGlobalMute() {
        const isMuted = this.globalVolume === 0;
        const newVolume = isMuted ? 0.8 : 0;
        this.setGlobalVolume(newVolume);
        
        // Update mute button
        const muteButton = document.getElementById('globalMuteButton');
        if (muteButton) {
            const icon = muteButton.querySelector('i');
            if (icon) {
                icon.className = isMuted ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            }
        }
    }
};

// ===============================================
// ANIMATION MANAGER (ENHANCED)
// ===============================================

const AnimationManager = {
    observers: new Map(),
    animatedElements: new Set(),
    
    init() {
        if (!Utils.prefersReducedMotion()) {
            this.setupScrollAnimations();
            this.setupParticleSystem();
            this.setupBackgroundAnimations();
            this.setupCounterAnimations();
            this.setupTypewriterAnimations();
        }
        console.log('✨ Animation Manager initialized');
    },

    setupScrollAnimations() {
        // Initialize AOS with custom settings
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: CONFIG.animation.duration,
                easing: CONFIG.animation.easing,
                once: true,
                mirror: false,
                anchorPlacement: 'top-bottom',
                offset: 50,
                disable: function() {
                    return window.innerWidth < 768 || Utils.prefersReducedMotion();
                }
            });
        }

        // Custom intersection observer for additional animations
        this.setupIntersectionObserver();
    },

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: [0.1, 0.5, 0.8],
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target, entry.intersectionRatio);
                    this.animatedElements.add(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements that need custom animations
        const elementsToAnimate = document.querySelectorAll(
            '.animate-on-scroll, .counter, .progress-animate, .typewriter, .fade-in-up, .slide-in-left, .slide-in-right'
        );
        elementsToAnimate.forEach(el => observer.observe(el));
        
        this.observers.set('intersection', observer);
    },

    animateElement(element, intersectionRatio) {
        element.classList.add('animated', 'in-view');
        
        // Custom animations based on element class
        if (element.classList.contains('counter')) {
            this.animateCounter(element);
        }
        
        if (element.classList.contains('progress-animate')) {
            this.animateProgressBar(element);
        }

        if (element.classList.contains('typewriter')) {
            this.animateTypewriter(element);
        }

        if (element.classList.contains('stagger-children')) {
            this.staggerChildren(element);
        }

        // Trigger custom entrance animations
        this.triggerEntranceAnimation(element, intersectionRatio);
    },

    animateCounter(element) {
        const target = parseInt(element.dataset.target || element.textContent.replace(/[^\d]/g, ''));
        const duration = parseInt(element.dataset.duration || '2000');
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            const formattedValue = Math.round(current).toLocaleString();
            const suffix = element.dataset.suffix || '';
            const prefix = element.dataset.prefix || '';
            
            element.textContent = `${prefix}${formattedValue}${suffix}`;
        }, duration / steps);
    },

    animateProgressBar(element) {
        const target = element.dataset.width || element.dataset.value || '100%';
        element.style.width = '0%';
        
        setTimeout(() => {
            element.style.transition = `width ${CONFIG.animation.duration}ms ${CONFIG.animation.easing}`;
            element.style.width = target;
        }, 100);
    },

    animateTypewriter(element) {
        const text = element.dataset.text || element.textContent;
        const speed = parseInt(element.dataset.speed || '50');
        let i = 0;
        
        element.textContent = '';
        element.style.borderRight = '2px solid';
        
        const typeTimer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeTimer);
                // Remove cursor after typing is complete
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 500);
            }
        }, speed);
    },

    staggerChildren(element) {
        const children = Array.from(element.children);
        children.forEach((child, index) => {
            child.style.animationDelay = `${index * CONFIG.animation.stagger}ms`;
            child.classList.add('stagger-item');
        });
    },

    triggerEntranceAnimation(element, intersectionRatio) {
        // Different animations based on intersection ratio
        if (intersectionRatio > 0.8) {
            element.classList.add('fully-visible');
        } else if (intersectionRatio > 0.5) {
            element.classList.add('mostly-visible');
        } else {
            element.classList.add('partially-visible');
        }
    },

    setupParticleSystem() {
        if (!CONFIG.performance.enableParticles) return;

        // Initialize particles.js if available
        if (typeof particlesJS !== 'undefined') {
            const particleConfigs = {
                hero: {
                    particles: {
                        number: { value: CONFIG.performance.maxParticles },
                        color: { value: '#A78BFA' },
                        shape: { type: 'circle' },
                        opacity: {
                            value: 0.4,
                            random: true,
                            animation: { enable: true, speed: 1, opacity_min: 0.1 }
                        },
                        size: {
                            value: 3,
                            random: true,
                            animation: { enable: true, speed: 2, size_min: 0.1 }
                        },
                        move: {
                            enable: true,
                            speed: 1.5,
                            direction: 'none',
                            random: true,
                            straight: false,
                            out_mode: 'out',
                            bounce: false
                        }
                    },
                    interactivity: {
                        detect_on: 'window',
                        events: {
                            onhover: { enable: true, mode: 'repulse' },
                            onclick: { enable: true, mode: 'push' },
                            resize: true
                        },
                        modes: {
                            repulse: { distance: 100, duration: 0.4 },
                            push: { particles_nb: 4 }
                        }
                    },
                    retina_detect: true
                }
            };

            // Initialize particles for different sections
            const particleContainers = document.querySelectorAll('#particles-js, .particles-container');
            particleContainers.forEach(container => {
                particlesJS(container.id, particleConfigs.hero);
            });
        }
    },

    setupBackgroundAnimations() {
        // Floating shapes animation
        const floatingShapes = document.querySelectorAll('.floating-shape, .cosmic-element');
        floatingShapes.forEach((shape, index) => {
            shape.style.animationDelay = `${index * 0.5}s`;
            shape.style.animationDuration = `${6 + (index % 3)}s`;
        });

        // Cosmic background effects
        this.setupCosmicBackground();
        this.setupGradientAnimation();
    },

    setupCosmicBackground() {
        const cosmicBg = document.querySelector('.cosmic-bg, .hero-background');
        if (!cosmicBg) return;

        // Create animated stars
        const starsContainer = cosmicBg.querySelector('.stars') || this.createStarsContainer(cosmicBg);
        
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: #A78BFA;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${Math.random() * 3 + 2}s infinite;
                animation-delay: ${Math.random() * 3}s;
            `;
            starsContainer.appendChild(star);
        }
    },

    createStarsContainer(parent) {
        const container = document.createElement('div');
        container.className = 'stars';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        parent.appendChild(container);
        return container;
    },

    setupGradientAnimation() {
        // Animated gradients for hero section
        const gradientElements = document.querySelectorAll('.gradient-animated');
        gradientElements.forEach(element => {
            element.style.background = `
                linear-gradient(45deg, #A78BFA, #F9A8D4, #A78BFA, #F9A8D4);
                background-size: 400% 400%;
                animation: gradientShift 8s ease infinite;
            `;
        });
    },

    setupCounterAnimations() {
        // Enhanced counter animations with more options
        const counters = document.querySelectorAll('.counter-enhanced');
        counters.forEach(counter => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateEnhancedCounter(counter);
                        observer.unobserve(counter);
                    }
                });
            });
            observer.observe(counter);
        });
    },

    animateEnhancedCounter(element) {
        const target = parseFloat(element.dataset.target);
        const duration = parseInt(element.dataset.duration || '2000');
        const easing = element.dataset.easing || 'easeOutCubic';
        const decimals = parseInt(element.dataset.decimals || '0');
        
        let startValue = 0;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Apply easing function
            const easedProgress = this.applyEasing(progress, easing);
            const currentValue = startValue + (target - startValue) * easedProgress;
            
            element.textContent = this.formatCounterValue(currentValue, decimals, element.dataset);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },

    applyEasing(t, easing) {
        const easingFunctions = {
            linear: t => t,
            easeOutCubic: t => 1 - Math.pow(1 - t, 3),
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
            easeOutBounce: t => {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (t < 1 / d1) {
                    return n1 * t * t;
                } else if (t < 2 / d1) {
                    return n1 * (t -= 1.5 / d1) * t + 0.75;
                } else if (t < 2.5 / d1) {
                    return n1 * (t -= 2.25 / d1) * t + 0.9375;
                } else {
                    return n1 * (t -= 2.625 / d1) * t + 0.984375;
                }
            }
        };
        
        return easingFunctions[easing] ? easingFunctions[easing](t) : t;
    },

    formatCounterValue(value, decimals, dataset) {
        const formattedValue = decimals > 0 ? value.toFixed(decimals) : Math.round(value);
        const prefix = dataset.prefix || '';
        const suffix = dataset.suffix || '';
        const separator = dataset.separator === 'true';
        
        const finalValue = separator ? parseFloat(formattedValue).toLocaleString() : formattedValue;
        return `${prefix}${finalValue}${suffix}`;
    },

    setupTypewriterAnimations() {
        const typewriterElements = document.querySelectorAll('.typewriter-enhanced');
        typewriterElements.forEach(element => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateEnhancedTypewriter(element);
                        observer.unobserve(element);
                    }
                });
            });
            observer.observe(element);
        });
    },

    animateEnhancedTypewriter(element) {
        const texts = element.dataset.texts ? element.dataset.texts.split('|') : [element.textContent];
        const speed = parseInt(element.dataset.speed || '100');
        const deleteSpeed = parseInt(element.dataset.deleteSpeed || '50');
        const pauseDuration = parseInt(element.dataset.pause || '2000');
        const loop = element.dataset.loop !== 'false';
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const type = () => {
            const currentText = texts[textIndex];
            
            if (!isDeleting) {
                element.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                
                if (charIndex === currentText.length) {
                    isDeleting = true;
                    setTimeout(type, pauseDuration);
                    return;
                }
            } else {
                element.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                
                if (charIndex === 0) {
                    isDeleting = false;
                    textIndex = (textIndex + 1) % texts.length;
                    
                    if (!loop && textIndex === 0 && texts.length > 1) {
                        return; // Stop animation if not looping and we've gone through all texts
                    }
                }
            }
            
            const currentSpeed = isDeleting ? deleteSpeed : speed;
            setTimeout(type, currentSpeed);
        };
        
        // Start typing animation
        element.textContent = '';
        type();
    },

    triggerEntranceAnimations() {
        // Trigger entrance animations when loading is complete
        const entranceElements = document.querySelectorAll('.entrance-animation');
        entranceElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-in');
            }, index * 100);
        });
        
        // Trigger hero animations
        const heroElements = document.querySelectorAll('.hero-animate');
        heroElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('hero-visible');
            }, 500 + (index * 200));
        });
    },

    // Performance optimization methods
    pauseAnimations() {
        // Pause heavy animations when page is not visible
        const heavyAnimations = document.querySelectorAll('.particles-js-canvas, .floating-shape');
        heavyAnimations.forEach(element => {
            element.style.animationPlayState = 'paused';
        });
    },

    resumeAnimations() {
        // Resume animations when page becomes visible
        const pausedAnimations = document.querySelectorAll('.particles-js-canvas, .floating-shape');
        pausedAnimations.forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }
};

// ===============================================
// NAVIGATION MANAGER (ENHANCED)
// ===============================================

const NavigationManager = {
    activeSection: 'hero',
    isScrolling: false,
    scrollTimeout: null,
    navbar: null,
    
    init() {
        this.navbar = document.querySelector('.navbar');
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
        this.setupMobileNavigation();
        this.setupBackToTop();
        this.setupScrollSpy();
        this.setupNavbarBehavior();
        console.log('🧭 Navigation Manager initialized');
    },

    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId, link);
            });
        });
    },

    scrollToSection(sectionId, triggerElement) {
        const target = document.getElementById(sectionId);
        if (!target) return;

        // Calculate offset for fixed navbar
        const navbarHeight = this.navbar ? this.navbar.offsetHeight : 80;
        const offsetTop = target.offsetTop - navbarHeight - 20;
        
        this.isScrolling = true;
        
        window.scrollTo({
            top: Math.max(0, offsetTop),
            behavior: Utils.prefersReducedMotion() ? 'auto' : 'smooth'
        });

        // Clear scrolling flag after animation
        setTimeout(() => {
            this.isScrolling = false;
        }, 1000);

        // Update active navigation immediately
        this.setActiveSection(sectionId);
        
        // Focus management for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus();
        
        // Remove tabindex after focus to restore normal tab flow
        setTimeout(() => {
            target.removeAttribute('tabindex');
        }, 1000);
        
        // Announce navigation for screen readers
        if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Navigated to ${sectionId} section`);
        }

        // Track navigation
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_navigation', {
                section: sectionId,
                trigger: triggerElement ? triggerElement.textContent.trim() : 'unknown'
            });
        }
    },

    setupActiveNavigation() {
        const sections = document.querySelectorAll('section[id], main[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        if (sections.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            if (this.isScrolling) return; // Don't update during programmatic scrolling
            
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    this.setActiveSection(entry.target.id);
                }
            });
        }, { 
            threshold: [0.3, 0.7],
            rootMargin: '-20% 0px -20% 0px'
        });

        sections.forEach(section => observer.observe(section));
    },
    
// ===============================================
// GLOBAL CONFIGURATION
// ===============================================

const CONFIG = {
    animation: {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        stagger: 100
    },
    audio: {
        volume: 0.8,
        fadeTime: 500,
        preloadTimeout: 5000
    },
    performance: {
        enableParticles: true,
        maxParticles: 50,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    },
    accessibility: {
        focusRingColor: '#A78BFA',
        announceDelay: 100,
        keyboardShortcuts: true
    },
    forms: {
        validateOnInput: true,
        submitDelay: 1000,
        apiEndpoint: '/api/contact'
    },
    social: {
        shareApiEnabled: navigator.share !== undefined
    }
};

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

const Utils = {
    // Debounce function for performance optimization
    debounce(func, wait, immediate = false) {
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
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return (
            rect.top <= windowHeight * (1 - threshold) &&
            rect.bottom >= windowHeight * threshold
        );
    },

    // Generate unique ID
    generateId(prefix = 'element') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Sanitize HTML to prevent XSS
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // Format time for audio duration
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // Check if user prefers reduced motion
    prefersReducedMotion() {
        return CONFIG.performance.reducedMotion;
    },

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Get cookie value
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    },

    // Set cookie
    setCookie(name, value, days = 365) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
    },

    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        }
    }
};

// ===============================================
// ERROR HANDLING SYSTEM
// ===============================================

const ErrorHandler = {
    errorCount: 0,
    maxErrors: 10,

    init() {
        // Global error handling
        window.addEventListener('error', this.handleJSError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
        
        // Resource loading errors
        document.addEventListener('error', this.handleResourceError.bind(this), true);
        
        console.log('🛡️ Error Handler initialized');
    },

    handleJSError(event) {
        this.reportError('JavaScript Error', event.message, event.filename, event.lineno);
    },

    handlePromiseRejection(event) {
        this.reportError('Promise Rejection', event.reason?.message || event.reason);
        event.preventDefault();
    },

    handleResourceError(event) {
        const element = event.target;
        if (element.tagName === 'IMG') {
            this.handleImageError(element);
        } else if (element.tagName === 'AUDIO') {
            this.handleAudioError(element);
        } else if (element.tagName === 'SCRIPT') {
            this.handleScriptError(element);
        }
    },

    handleImageError(img) {
        console.warn('Image failed to load:', img.src);
        
        // Replace with placeholder SVG
        img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="Arial, sans-serif" font-size="16">Image not available</text></svg>';
        img.alt = 'Image not available';
        img.classList.add('error-placeholder');
    },

    handleAudioError(audio) {
        console.warn('Audio failed to load:', audio.src);
        
        // Disable associated buttons
        const buttons = document.querySelectorAll(`button[aria-label*="${audio.id}"], button[data-audio="${audio.id}"]`);
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Audio unavailable</span>';
            btn.classList.add('btn-error');
        });

        // Show error message to user
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Audio content is currently unavailable. Please try again later.');
        }
    },

    handleScriptError(script) {
        console.warn('Script failed to load:', script.src);
        this.reportError('Script Loading Error', `Failed to load: ${script.src}`);
    },

    reportError(type, message, source = '', line = '') {
        this.errorCount++;
        
        // Prevent error spam
        if (this.errorCount > this.maxErrors) {
            console.warn('Maximum error count reached. Suppressing further error reports.');
            return;
        }

        // Report to analytics or error tracking service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: `${type}: ${message}`,
                fatal: false,
                custom_map: {
                    source: source,
                    line: line
                }
            });
        }

        // Log for debugging
        console.group(`🚨 Error Report #${this.errorCount}`);
        console.log('Type:', type);
        console.log('Message:', message);
        if (source) console.log('Source:', source);
        if (line) console.log('Line:', line);
        console.log('Timestamp:', new Date().toISOString());
        console.groupEnd();
    }
};

// ===============================================
// LOADING SCREEN MANAGER
// ===============================================

const LoadingManager = {
    loadingScreen: null,
    isLoading: true,
    loadingProgress: 0,
    totalAssets: 0,
    loadedAssets: 0,

    init() {
        this.loadingScreen = document.getElementById('loadingScreen');
        if (!this.loadingScreen) {
            this.createLoadingScreen();
        }
        
        this.setupProgressTracking();
        this.startLoading();
        console.log('⏳ Loading Manager initialized');
    },

    createLoadingScreen() {
        this.loadingScreen = document.createElement('div');
        this.loadingScreen.id = 'loadingScreen';
        this.loadingScreen.className = 'loading-screen';
        this.loadingScreen.setAttribute('aria-hidden', 'true');
        this.loadingScreen.innerHTML = `
            <div class="loading-content">
                <div class="logo-animation">
                    <div class="loading-logo">
                        <span class="logo-text">Thanatsitt</span>
                        <div class="loading-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
                <div class="loading-text">
                    <h2>Loading Portfolio...</h2>
                    <div class="loading-progress">
                        <div class="progress-bar" id="loadingProgressBar"></div>
                        <span class="progress-text" id="loadingProgressText">0%</span>
                    </div>
                </div>
            </div>
        `;
        document.body.insertBefore(this.loadingScreen, document.body.firstChild);
    },

    setupProgressTracking() {
        // Count total assets to load
        const images = document.querySelectorAll('img');
        const audios = document.querySelectorAll('audio');
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        
        this.totalAssets = images.length + audios.length + stylesheets.length;

        // Track image loading
        images.forEach(img => {
            if (img.complete) {
                this.assetLoaded();
            } else {
                img.addEventListener('load', () => this.assetLoaded());
                img.addEventListener('error', () => this.assetLoaded());
            }
        });

        // Track audio loading
        audios.forEach(audio => {
            audio.addEventListener('canplaythrough', () => this.assetLoaded());
            audio.addEventListener('error', () => this.assetLoaded());
        });

        // Track stylesheet loading
        stylesheets.forEach(link => {
            if (link.sheet) {
                this.assetLoaded();
            } else {
                link.addEventListener('load', () => this.assetLoaded());
                link.addEventListener('error', () => this.assetLoaded());
            }
        });
    },

    startLoading() {
        // Simulate minimum loading time for better UX
        setTimeout(() => {
            this.checkLoadingComplete();
        }, 1000);
    },

    assetLoaded() {
        this.loadedAssets++;
        this.updateProgress();
    },

    updateProgress() {
        if (this.totalAssets === 0) return;
        
        this.loadingProgress = Math.min((this.loadedAssets / this.totalAssets) * 100, 100);
        
        const progressBar = document.getElementById('loadingProgressBar');
        const progressText = document.getElementById('loadingProgressText');
        
        if (progressBar) {
            progressBar.style.width = `${this.loadingProgress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(this.loadingProgress)}%`;
        }

        // Check if loading is complete
        if (this.loadingProgress >= 100) {
            setTimeout(() => this.completeLoading(), 500);
        }
    },

    checkLoadingComplete() {
        if (document.readyState === 'complete' && this.loadedAssets >= this.totalAssets) {
            this.completeLoading();
        } else {
            setTimeout(() => this.checkLoadingComplete(), 100);
        }
    },

    completeLoading() {
        if (!this.isLoading) return;
        
        this.isLoading = false;
        
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('loading-complete');
            
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                this.loadingScreen.remove();
                
                // Announce completion
                if (window.accessibilityManager) {
                    window.accessibilityManager.announce('Portfolio website fully loaded and ready for interaction');
                }
                
                // Trigger page entrance animations
                AnimationManager.triggerEntranceAnimations();
                
            }, 800);
        }
    }
};

// ===============================================
// CONTACT FORM MANAGER
// ===============================================

const ContactFormManager = {
    form: null,
    isSubmitting: false,
    validationRules: {
        name: { required: true, minLength: 2, maxLength: 50 },
        email: { required: true, email: true },
        message: { required: true, minLength: 10, maxLength: 1000 },
        projectType: { required: false },
        budget: { required: false }
    },

    init() {
        this.form = document.getElementById('contactForm');
        if (!this.form) {
            console.warn('Contact form not found');
            return;
        }

        this.setupFormValidation();
        this.setupFormSubmission();
        console.log('📧 Contact Form Manager initialized');
    },

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('input', () => {
                if (CONFIG.forms.validateOnInput) {
                    this.validateField(input);
                }
            });

            // Validation on blur
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            // Clear errors on focus
            input.addEventListener('focus', () => {
                this.clearFieldError(input);
            });
        });
    },

    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission();
        });
    },

    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = this.validationRules[fieldName];
        
        if (!rules) return true;

        // Clear previous errors
        this.clearFieldError(field);

        // Required validation
        if (rules.required && !value) {
            this.showFieldError(field, `${this.getFieldLabel(field)} is required`);
            return false;
        }

        // Email validation
        if (rules.email && value && !Utils.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }

        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
            this.showFieldError(field, `${this.getFieldLabel(field)} must be at least ${rules.minLength} characters`);
            return false;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            this.showFieldError(field, `${this.getFieldLabel(field)} must be no more than ${rules.maxLength} characters`);
            return false;
        }

        // Field is valid
        field.classList.add('valid');
        return true;
    },

    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    },

    async handleFormSubmission() {
        if (this.isSubmitting) return;

        // Validate form
        if (!this.validateForm()) {
            this.showFormMessage('Please correct the errors above', 'error');
            return;
        }

        this.isSubmitting = true;
        this.showSubmittingState();

        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());

            // Simulate API call (replace with actual endpoint)
            const response = await this.submitToAPI(data);

            if (response.success) {
                this.showSuccessState();
                this.form.reset();
                
                // Track submission
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        form_name: 'contact',
                        project_type: data.projectType || 'not_specified'
                    });
                }
            } else {
                throw new Error(response.message || 'Submission failed');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            this.showFormMessage('Sorry, there was an error sending your message. Please try again.', 'error');
            ErrorHandler.reportError('Form Submission Error', error.message);
        } finally {
            this.isSubmitting = false;
            setTimeout(() => this.resetSubmitButton(), 3000);
        }
    },

    async submitToAPI(data) {
        // Simulate API response for demo
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Message sent successfully' });
            }, 2000);
        });
    },

    showFieldError(field, message) {
        field.classList.add('error');
        field.classList.remove('valid');
        
        const errorId = `${field.name}-error`;
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        // Announce error to screen readers
        if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Error: ${message}`, 'assertive');
        }
    },

    clearFieldError(field) {
        field.classList.remove('error');
        
        const errorId = `${field.name}-error`;
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    },

    showSubmittingState() {
        const submitBtn = this.form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('submitting');
            submitBtn.innerHTML = `
                <div class="loading-spinner"></div>
                <span>Sending...</span>
            `;
        }
    },

    showSuccessState() {
        const successElement = document.getElementById('form-success');
        if (successElement) {
            successElement.style.display = 'block';
            successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        this.showFormMessage('Thank you! Your message has been sent successfully.', 'success');
        
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Message sent successfully. Thank you for contacting me!');
        }
    },

    resetSubmitButton() {
        const submitBtn = this.form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('submitting');
            submitBtn.innerHTML = `
                <i class="fas fa-paper-plane" aria-hidden="true"></i>
                <span>Send Message</span>
            `;
        }
    },

    showFormMessage(message, type = 'info') {
        // Create or update form message element
        let messageElement = this.form.querySelector('.form-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'form-message';
            messageElement.setAttribute('role', 'alert');
            this.form.appendChild(messageElement);
        }

        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
        messageElement.style.display = 'block';

        // Auto-hide non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        }
    },

    getFieldLabel(field) {
        const label = this.form.querySelector(`label[for="${field.id}"]`);
        return label ? label.textContent.replace('*', '').trim() : field.name;
    }
};

// ===============================================
// COOKIE CONSENT MANAGER
// ===============================================

const CookieConsentManager = {
    consentBanner: null,
    consentGiven: false,

    init() {
        // Check if consent was already given
        this.consentGiven = Utils.getCookie('cookieConsent') === 'true';
        
        if (!this.consentGiven) {
            this.showConsentBanner();
        }
        
        console.log('🍪 Cookie Consent Manager initialized');
    },

    showConsentBanner() {
        this.consentBanner = document.getElementById('cookieConsent');
        
        if (!this.consentBanner) {
            this.createConsentBanner();
        }

        this.consentBanner.style.display = 'block';
        this.consentBanner.setAttribute('aria-hidden', 'false');
        
        // Setup event listeners
        this.setupConsentListeners();

        // Announce to screen readers
        setTimeout(() => {
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Cookie consent banner displayed. Please review and accept or decline.');
            }
        }, 1000);
    },

    createConsentBanner() {
        this.consentBanner = document.createElement('div');
        this.consentBanner.id = 'cookieConsent';
        this.consentBanner.className = 'cookie-consent';
        this.consentBanner.setAttribute('role', 'dialog');
        this.consentBanner.setAttribute('aria-labelledby', 'cookie-title');
        this.consentBanner.innerHTML = `
            <div class="cookie-content">
                <h3 id="cookie-title">We use cookies</h3>
                <p>This website uses cookies to enhance your browsing experience and provide personalized content. We respect your privacy and only use essential cookies.</p>
                <div class="cookie-actions">
                    <button id="acceptCookies" class="btn btn-primary">Accept All</button>
                    <button id="declineCookies" class="btn btn-outline">Essential Only</button>
                    <a href="/privacy-policy" class="cookie-policy-link">Privacy Policy</a>
                </div>
            </div>
        `;
        document.body.appendChild(this.consentBanner);
    },

    setupConsentListeners() {
        const acceptBtn = document.getElementById('acceptCookies');
        const declineBtn = document.getElementById('declineCookies');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptCookies());
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', () => this.declineCookies());
        }
    },

    acceptCookies() {
        Utils.setCookie('cookieConsent', 'true', 365);
        Utils.setCookie('analyticsConsent', 'true', 365);
        this.consentGiven = true;
        this.hideConsentBanner();
        
        // Enable analytics
        this.enableAnalytics();
        
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Cookie preferences saved. All cookies accepted.');
        }
    },

    declineCookies() {
        Utils.setCookie('cookieConsent', 'true', 365);
        Utils.setCookie('analyticsConsent', 'false', 365);
        this.consentGiven = true;
        this.hideConsentBanner();
        
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Cookie preferences saved. Only essential cookies will be used.');
        }
    },

    hideConsentBanner() {
        if (this.consentBanner) {
            this.consentBanner.style.display = 'none';
            this.consentBanner.setAttribute('aria-hidden', 'true');
        }
    },

    enableAnalytics() {
        // Enable Google Analytics if consent given
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                analytics_storage: 'granted'
            });
        }
    }
};

// ===============================================
// SOCIAL SHARING MANAGER
// ===============================================

const SocialSharingManager = {
    init() {
        this.setupShareButtons();
        this.setupCopyLinkButton();
        console.log('📤 Social Sharing Manager initialized');
    },

    setupShareButtons() {
        const shareButtons = document.querySelectorAll('.share-button');
        
        shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = button.dataset.platform;
                this.shareToPlatform(platform);
            });
        });

        // Native Web Share API if available
        if (CONFIG.social.shareApiEnabled) {
            this.setupNativeShare();
        }
    },

    setupNativeShare() {
        const nativeShareBtn = document.getElementById('nativeShare');
        if (nativeShareBtn) {
            nativeShareBtn.addEventListener('click', async () => {
                try {
                    await navigator.share({
                        title: document.title,
                        text: 'Check out this amazing AI Creative Designer portfolio!',
                        url: window.location.href
                    });
                } catch (error) {
                    console.log('Native sharing failed:', error);
                    this.fallbackShare();
                }
            });
        }
    },

    setupCopyLinkButton() {
        const copyButton = document.getElementById('copyLink');
        if (copyButton) {
            copyButton.addEventListener('click', async () => {
                const success = await Utils.copyToClipboard(window.location.href);
                
                if (success) {
                    this.showCopySuccess(copyButton);
                    if (window.accessibilityManager) {
                        window.accessibilityManager.announce('Portfolio URL copied to clipboard');
                    }
                }
            });
        }
    },

    shareToPlatform(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const text = encodeURIComponent('Check out this amazing AI Creative Designer portfolio!');
        
        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            reddit: `https://reddit.com/submit?url=${url}&title=${title}`,
            email: `mailto:?subject=${title}&body=${text}%20${url}`
        };

        if (shareUrls[platform]) {
            if (platform === 'email') {
                window.location.href = shareUrls[platform];
            } else {
                window.open(shareUrls[platform], '_blank', 'width=550,height=420');
            }
        }
    },

    showCopySuccess(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.add('success');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('success');
        }, 2000);
    },

    fallbackShare() {
        // Fallback to copy URL
        Utils.copyToClipboard(window.location.href);
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('URL copied to clipboard for sharing');
        }
    }
};

// ===============================================
// ACCESSIBILITY MANAGER (ENHANCED)
// ===============================================

class AccessibilityManager {
    constructor() {
        this.reducedMotion = Utils.prefersReducedMotion();
        this.highContrast = window.matchMedia('(prefers-contrast: high)').matches;
        this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.previousFocus = null;
        this.liveRegion = null;
        this.focusTrap = null;
        this.init();
    }

    init() {
        this.setupLiveRegion();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupReducedMotion();
        this.setupColorSchemeDetection();
        this.setupSkipLinks();
        this.setupModalAccessibility();
        console.log('♿ Accessibility Manager initialized');
    }

    setupLiveRegion() {
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only visually-hidden';
        this.liveRegion.id = 'live-announcements';
        this.liveRegion.style.cssText = `
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        `;
        document.body.appendChild(this.liveRegion);
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Custom keyboard shortcuts
            if (CONFIG.accessibility.keyboardShortcuts) {
                this.handleKeyboardShortcuts(e);
            }
            
            // Focus management
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
            
            // Escape key functionality
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl + Shift + T: Toggle theme
        if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'T') {
            e.preventDefault();
            ThemeManager.toggle();
            this.announce('Theme toggled');
        }
        
        // Ctrl + Home: Back to top
        if (e.ctrlKey && e.key === 'Home') {
            e.preventDefault();
            this.scrollToTop();
        }
        
        // Alt + M: Skip to main content
        if (e.altKey && e.key.toLowerCase() === 'm') {
            e.preventDefault();
            this.skipToMain();
        }

        // Alt + C: Skip to contact form
        if (e.altKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            this.skipToContact();
        }

        // Alt + N: Skip to navigation
        if (e.altKey && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            this.skipToNavigation();
        }
    }

    setupFocusManagement() {
        // Enhanced focus indicators
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation *:focus {
                outline: 3px solid ${CONFIG.accessibility.focusRingColor} !important;
                outline-offset: 2px !important;
                border-radius: 4px !important;
            }
            
            .keyboard-navigation *:focus:not(:focus-visible) {
                outline: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    setupReducedMotion() {
        if (this.reducedMotion) {
            document.documentElement.classList.add('reduce-motion');
            CONFIG.animation.duration = 0;
            CONFIG.performance.enableParticles = false;
            
            // Disable AOS animations
            if (typeof AOS !== 'undefined') {
                AOS.init({ disable: true });
            }
        }
    }

    setupColorSchemeDetection() {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                ThemeManager.setTheme(e.matches ? 'dark' : 'light');
            }
        });

        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        highContrastQuery.addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.classList.add('high-contrast');
            } else {
                document.documentElement.classList.remove('high-contrast');
            }
        });
    }

    setupSkipLinks() {
        const skipLinks = document.querySelectorAll('.skip-link');
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    this.announce(`Skipped to ${target.getAttribute('aria-label') || targetId}`);
                }
            });
        });
    }

    setupModalAccessibility() {
        // Handle modal focus trapping
        document.addEventListener('shown.bs.modal', (e) => {
            this.trapFocus(e.target);
            this.saveFocus();
        });

        document.addEventListener('hidden.bs.modal', (e) => {
            this.releaseFocus();
            this.restoreFocus();
        });
    }

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        this.focusTrap = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        modal.addEventListener('keydown', this.focusTrap);
        
        // Focus first element
        if (firstElement) {
            firstElement.focus();
        }
    }

    releaseFocus() {
        if (this.focusTrap) {
            document.removeEventListener('keydown', this.focusTrap);
            this.focusTrap = null;
        }
    }

    announce(message, priority = 'polite') {
        if (this.liveRegion) {
            this.liveRegion.setAttribute('aria-live', priority);
            setTimeout(() => {
                this.liveRegion.textContent = message;
                setTimeout(() => {
                    this.liveRegion.textContent = '';
                }, 1000);
            }, CONFIG.accessibility.announceDelay);
        }
    }

    skipToMain() {
        const mainContent = document.getElementById('main-content') || document.querySelector('main');
        if (mainContent) {
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
            this.announce('Skipped to main content');
        }
    }

    skipToContact() {
        const contactForm = document.getElementById('contactForm') || document.getElementById('contact');
        if (contactForm) {
            contactForm.setAttribute('tabindex', '-1');
            contactForm.focus();
            this.announce('Skipped to contact form');
        }
    }

    skipToNavigation() {
        const navigation = document.querySelector('nav') || document.getElementById('mainNavbar');
        if (navigation) {
            const firstLink = navigation.querySelector('a');
            if (firstLink) {
                firstLink.focus();
                this.announce('Skipped to navigation menu');
            }
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: Utils.prefersReducedMotion() ? 'auto' : 'smooth'
        });
        this.announce('Scrolled to top of page');
        
        // Focus on skip link or main heading
        const skipLink = document.querySelector('.skip-link');
        const mainHeading = document.querySelector('h1');
        
        if (skipLink) {
            skipLink.focus();
        } else if (mainHeading) {
            mainHeading.setAttribute('tabindex', '-1');
            mainHeading.focus();
        }
    }

    handleEscapeKey() {
        // Close any open modals
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        });

        // Stop any playing audio
        AudioManager.stopAll();

        // Close mobile menu if open
        const mobileMenu = document.querySelector('.navbar-collapse.show');
        if (mobileMenu) {
            const bsCollapse = bootstrap.Collapse.getInstance(mobileMenu);
            if (bsCollapse) bsCollapse.hide();
        }
    }

    saveFocus() {
        this.previousFocus = document.activeElement;
    }

    restoreFocus() {
        if (this.previousFocus && this.previousFocus.focus) {
            this.previousFocus.focus();
            this.previousFocus = null;
        }
    }
}

// ===============================================
// THEME MANAGER (ENHANCED)
// ===============================================

const ThemeManager = {
    currentTheme: 'light',
    systemTheme: 'light',
    
    init() {
        this.systemTheme = this.getSystemTheme();
        this.currentTheme = this.getStoredTheme() || this.systemTheme;
        this.setTheme(this.currentTheme);
        this.setupToggleButton();
        this.setupSystemThemeListener();
        console.log('🎨 Theme Manager initialized:', this.currentTheme);
    },

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },

    getStoredTheme() {
        return localStorage.getItem('theme');
    },

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateToggleButton();
        this.updateMetaThemeColor();
        
              
        // Announce theme change
        if (window.accessibilityManager && theme !== this.getStoredTheme()) {
            window.accessibilityManager.announce(`Switched to ${theme} theme`);
        }
    },

    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Track theme change
        if (typeof gtag !== 'undefined') {
            gtag('event', 'theme_change', {
                theme: newTheme
            });
        }
    },

    setupToggleButton() {
        const toggleButton = document.getElementById('themeToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggle());
            
            // Keyboard support
            toggleButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }
    },

    setupSystemThemeListener() {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', (e) => {
            this.systemTheme = e.matches ? 'dark' : 'light';
            
            // Auto-switch if no manual preference set
            if (!this.getStoredTheme()) {
                this.setTheme(this.systemTheme);
            }
        });
    },

    updateToggleButton() {
        const toggleButton = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        if (toggleButton && themeIcon) {
            const isDark = this.currentTheme === 'dark';
            themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            toggleButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
            toggleButton.title = `Switch to ${isDark ? 'light' : 'dark'} theme (Ctrl+Shift+T)`;
        }
    },

    updateMetaThemeColor() {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = this.currentTheme === 'dark' ? '#1A202C' : '#F8FAFC';
        }
    }
};

// ===============================================
// AUDIO MANAGER (ENHANCED)
// ===============================================

const AudioManager = {
    activeAudio: null,
    audioElements: new Map(),
    globalVolume: 0.8,
    
    init() {
        this.loadVolumePreference();
        this.setupAudioElements();
        this.setupAudioControls();
        this.setupGlobalAudioControls();
        console.log('🎵 Audio Manager initialized');
    },

    loadVolumePreference() {
        const savedVolume = localStorage.getItem('audioVolume');
        if (savedVolume) {
            this.globalVolume = parseFloat(savedVolume);
        }
    },

    setupAudioElements() {
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            this.audioElements.set(audio.id, {
                element: audio,
                isLoaded: false,
                duration: 0,
                button: null
            });
            
            // Setup audio event listeners
            audio.addEventListener('loadedmetadata', () => {
                const audioData = this.audioElements.get(audio.id);
                audioData.isLoaded = true;
                audioData.duration = audio.duration;
                this.updateProgressBar(audio, 0);
                this.updateDurationDisplay(audio);
            });

            audio.addEventListener('timeupdate', () => {
                this.updateProgressBar(audio, audio.currentTime);
                this.updateTimeDisplay(audio);
            });

            audio.addEventListener('ended', () => {
                this.handleAudioEnd(audio);
            });

            audio.addEventListener('error', () => {
                ErrorHandler.handleAudioError(audio);
            });

            audio.addEventListener('play', () => {
                this.handleAudioPlay(audio);
            });

            audio.addEventListener('pause', () => {
                this.handleAudioPause(audio);
            });

            // Set volume
            audio.volume = this.globalVolume;
            
            // Preload important audio files
            if (audio.getAttribute('preload') === 'auto') {
                audio.load();
            }
        });
    },

    setupAudioControls() {
        // Voice demo buttons
        const demoButtons = document.querySelectorAll('.demo-button, .moon-voice-demo, [data-audio]');
        demoButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAudioToggle(button);
            });

            // Keyboard support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleAudioToggle(button);
                }
            });

            // Store button reference
            const audioId = this.getAudioIdFromButton(button);
            if (audioId && this.audioElements.has(audioId)) {
                this.audioElements.get(audioId).button = button;
            }
        });

        // Progress bar interactions
        this.setupProgressBarInteractions();
    },

    setupProgressBarInteractions() {
        const progressBars = document.querySelectorAll('.audio-progress');
        progressBars.forEach(progressBar => {
            progressBar.addEventListener('click', (e) => {
                const audio = this.findAudioForProgressBar(progressBar);
                if (audio && audio.duration) {
                    const rect = progressBar.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = clickX / rect.width;
                    const newTime = percentage * audio.duration;
                    audio.currentTime = Math.max(0, Math.min(newTime, audio.duration));
                }
            });

            // Keyboard navigation for progress bars
            progressBar.addEventListener('keydown', (e) => {
                const audio = this.findAudioForProgressBar(progressBar);
                if (!audio) return;

                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        audio.currentTime = Math.max(0, audio.currentTime - 5);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
                        break;
                }
            });
        });
    },

    setupGlobalAudioControls() {
        // Global volume control if exists
        const volumeControl = document.getElementById('globalVolumeControl');
        if (volumeControl) {
            volumeControl.value = this.globalVolume;
            volumeControl.addEventListener('input', (e) => {
                this.setGlobalVolume(e.target.value);
            });
        }

        // Global mute button
        const muteButton = document.getElementById('globalMuteButton');
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                this.toggleGlobalMute();
            });
        }
    },

    handleAudioToggle(button) {
        const audioId = this.getAudioIdFromButton(button);
        const audio = document.getElementById(audioId);
        
        if (!audio) {
            console.warn('Audio element not found:', audioId);
            return;
        }

        // Stop other playing audio first
        if (this.activeAudio && this.activeAudio !== audio && !this.activeAudio.paused) {
            this.stopAudio(this.activeAudio);
        }

        if (audio.paused) {
            this.playAudio(audio, button);
        } else {
            this.pauseAudio(audio, button);
        }
    },

    getAudioIdFromButton(button) {
        // Enhanced mapping for all audio elements
        const buttonAudioMap = {
            'voiceDemoBtn': 'heroVoiceIntroAudio',
            'playIntroDemo': 'introDemo',
            'playNarrativeDemo': 'narrativeDemo',
            'playCharacterDemo': 'characterDemo',
            'playCommercialDemo': 'commercialDemo',
            'playPodcastDemo': 'podcastDemo'
        };
        
        return buttonAudioMap[button.id] || button.getAttribute('data-audio') || button.closest('[data-audio]')?.getAttribute('data-audio');
    },

    async playAudio(audio, button) {
        try {
            // Load audio if not already loaded
            if (audio.readyState < 2) {
                this.updateButtonState(button, 'loading');
                audio.load();
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Audio loading timeout'));
                    }, CONFIG.audio.preloadTimeout);

                    const onLoaded = () => {
                        clearTimeout(timeout);
                        audio.removeEventListener('canplaythrough', onLoaded);
                        audio.removeEventListener('error', onError);
                        resolve();
                    };
                    const onError = () => {
                        clearTimeout(timeout);
                        audio.removeEventListener('canplaythrough', onLoaded);
                        audio.removeEventListener('error', onError);
                        reject(new Error('Audio loading failed'));
                    };
                    audio.addEventListener('canplaythrough', onLoaded);
                    audio.addEventListener('error', onError);
                });
            }

            this.activeAudio = audio;
            this.updateButtonState(button, 'playing');
            
            await audio.play();
            
            if (window.accessibilityManager) {
                const audioLabel = audio.getAttribute('aria-label') || audio.getAttribute('title') || 'Audio';
                window.accessibilityManager.announce(`Playing ${audioLabel}`);
            }

            // Track audio play event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'audio_play', {
                    audio_id: audio.id,
                    audio_duration: audio.duration
                });
            }

        } catch (error) {
            console.error('Audio play failed:', error);
            this.updateButtonState(button, 'error');
            ErrorHandler.handleAudioError(audio);
        }
    },

    pauseAudio(audio, button) {
        audio.pause();
        this.updateButtonState(button, 'paused');
        
        if (window.accessibilityManager) {
            const audioLabel = audio.getAttribute('aria-label') || audio.getAttribute('title') || 'Audio';
            window.accessibilityManager.announce(`Paused ${audioLabel}`);
        }
    },

    stopAudio(audio) {
        audio.pause();
        audio.currentTime = 0;
        
        if (this.activeAudio === audio) {
            this.activeAudio = null;
        }
        
        this.updateAllButtonStates();
    },

    stopAll() {
        this.audioElements.forEach(({ element }) => {
            if (!element.paused) {
                this.stopAudio(element);
            }
        });
    },

    handleAudioPlay(audio) {
        this.activeAudio = audio;
        const audioData = this.audioElements.get(audio.id);
        if (audioData?.button) {
            this.updateButtonState(audioData.button, 'playing');
        }
    },

    handleAudioPause(audio) {
        const audioData = this.audioElements.get(audio.id);
        if (audioData?.button) {
            this.updateButtonState(audioData.button, 'paused');
        }
    },

    handleAudioEnd(audio) {
        this.activeAudio = null;
        this.updateAllButtonStates();
        
        if (window.accessibilityManager) {
            const audioLabel = audio.getAttribute('aria-label') || audio.getAttribute('title') || 'Audio';
            window.accessibilityManager.announce(`Finished playing ${audioLabel}`);
        }

        // Auto-play next audio if in a playlist
        const nextAudio = this.findNextAudio(audio);
        if (nextAudio) {
            setTimeout(() => {
                const nextButton = this.audioElements.get(nextAudio.id)?.button;
                if (nextButton) {
                    this.playAudio(nextAudio, nextButton);
                }
            }, 1000);
        }
    },

    findNextAudio(currentAudio) {
        // Find next audio in sequence for playlist functionality
        const audioIds = Array.from(this.audioElements.keys());
        const currentIndex = audioIds.indexOf(currentAudio.id);
        
        if (currentIndex >= 0 && currentIndex < audioIds.length - 1) {
            return document.getElementById(audioIds[currentIndex + 1]);
        }
        
        return null;
    },

    updateButtonState(button, state) {
        if (!button) return;

        const icon = button.querySelector('i');
        const text = button.querySelector('span, .btn-text');
        
        button.classList.remove('playing', 'paused', 'error', 'loading');
        button.classList.add(state);
        
        switch (state) {
            case 'playing':
                if (icon) icon.className = 'fas fa-pause';
                if (text) text.textContent = 'Pause';
                button.setAttribute('aria-pressed', 'true');
                break;
            case 'paused':
            case 'stopped':
                if (icon) icon.className = 'fas fa-play';
                if (text) text.textContent = 'Play';
                button.setAttribute('aria-pressed', 'false');
                break;
            case 'loading':
                if (icon) icon.className = 'fas fa-spinner fa-spin';
                if (text) text.textContent = 'Loading...';
                button.disabled = true;
                break;
            case 'error':
                if (icon) icon.className = 'fas fa-exclamation-triangle';
                if (text) text.textContent = 'Error';
                button.disabled = true;
                button.setAttribute('aria-pressed', 'false');
                break;
        }
    },

    updateAllButtonStates() {
        const buttons = document.querySelectorAll('.demo-button, .moon-voice-demo, [data-audio]');
        buttons.forEach(button => {
            if (!button.disabled) {
                this.updateButtonState(button, 'stopped');
            }
        });
    },

    updateProgressBar(audio, currentTime) {
        const progressContainers = document.querySelectorAll('.audio-progress, .progress-container');
        progressContainers.forEach(container => {
            const progressFill = container.querySelector('.progress-bar, .progress-fill');
            if (progressFill && audio.duration) {
                const percentage = (currentTime / audio.duration) * 100;
                progressFill.style.width = `${percentage}%`;
                container.setAttribute('aria-valuenow', Math.round(percentage));
                container.setAttribute('aria-valuetext', `${Utils.formatTime(currentTime)} of ${Utils.formatTime(audio.duration)}`);
            }
        });
    },

    updateTimeDisplay(audio) {
        const timeDisplays = document.querySelectorAll('.time-display, .audio-time');
        timeDisplays.forEach(display => {
            if (audio.duration) {
                display.textContent = `${Utils.formatTime(audio.currentTime)} / ${Utils.formatTime(audio.duration)}`;
            }
        });
    },

    updateDurationDisplay(audio) {
        const durationDisplays = document.querySelectorAll('.audio-duration');
        durationDisplays.forEach(display => {
            display.textContent = Utils.formatTime(audio.duration);
        });
    },

    findAudioForProgressBar(progressBar) {
        // Find associated audio element
        const audioContainer = progressBar.closest('.audio-player, .voice-demo, .demo-card');
        if (audioContainer) {
            return audioContainer.querySelector('audio');
        }
        
        // Fallback: find by data attribute
        const audioId = progressBar.getAttribute('data-audio');
        if (audioId) {
            return document.getElementById(audioId);
        }
        
        return null;
    },

    setGlobalVolume(volume) {
        this.globalVolume = parseFloat(volume);
        localStorage.setItem('audioVolume', this.globalVolume.toString());
        
        // Update all audio elements
        this.audioElements.forEach(({ element }) => {
            element.volume = this.globalVolume;
        });

        if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Volume set to ${Math.round(this.globalVolume * 100)}%`);
        }
    },

    toggleGlobalMute() {
        const isMuted = this.globalVolume === 0;
        const newVolume = isMuted ? 0.8 : 0;
        this.setGlobalVolume(newVolume);
        
        // Update mute button
        const muteButton = document.getElementById('globalMuteButton');
        if (muteButton) {
            const icon = muteButton.querySelector('i');
            if (icon) {
                icon.className = isMuted ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            }
        }
    }
};

// ===============================================
// ANIMATION MANAGER (ENHANCED)
// ===============================================

const AnimationManager = {
    observers: new Map(),
    animatedElements: new Set(),
    
    init() {
        if (!Utils.prefersReducedMotion()) {
            this.setupScrollAnimations();
            this.setupParticleSystem();
            this.setupBackgroundAnimations();
            this.setupCounterAnimations();
            this.setupTypewriterAnimations();
        }
        console.log('✨ Animation Manager initialized');
    },

    setupScrollAnimations() {
        // Initialize AOS with custom settings
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: CONFIG.animation.duration,
                easing: CONFIG.animation.easing,
                once: true,
                mirror: false,
                anchorPlacement: 'top-bottom',
                offset: 50,
                disable: function() {
                    return window.innerWidth < 768 || Utils.prefersReducedMotion();
                }
            });
        }

        // Custom intersection observer for additional animations
        this.setupIntersectionObserver();
    },

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: [0.1, 0.5, 0.8],
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target, entry.intersectionRatio);
                    this.animatedElements.add(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements that need custom animations
        const elementsToAnimate = document.querySelectorAll(
            '.animate-on-scroll, .counter, .progress-animate, .typewriter, .fade-in-up, .slide-in-left, .slide-in-right'
        );
        elementsToAnimate.forEach(el => observer.observe(el));
        
        this.observers.set('intersection', observer);
    },

    animateElement(element, intersectionRatio) {
        element.classList.add('animated', 'in-view');
        
        // Custom animations based on element class
        if (element.classList.contains('counter')) {
            this.animateCounter(element);
        }
        
        if (element.classList.contains('progress-animate')) {
            this.animateProgressBar(element);
        }

        if (element.classList.contains('typewriter')) {
            this.animateTypewriter(element);
        }

        if (element.classList.contains('stagger-children')) {
            this.staggerChildren(element);
        }

        // Trigger custom entrance animations
        this.triggerEntranceAnimation(element, intersectionRatio);
    },

    animateCounter(element) {
        const target = parseInt(element.dataset.target || element.textContent.replace(/[^\d]/g, ''));
        const duration = parseInt(element.dataset.duration || '2000');
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            const formattedValue = Math.round(current).toLocaleString();
            const suffix = element.dataset.suffix || '';
            const prefix = element.dataset.prefix || '';
            
            element.textContent = `${prefix}${formattedValue}${suffix}`;
        }, duration / steps);
    },

    animateProgressBar(element) {
        const target = element.dataset.width || element.dataset.value || '100%';
        element.style.width = '0%';
        
        setTimeout(() => {
            element.style.transition = `width ${CONFIG.animation.duration}ms ${CONFIG.animation.easing}`;
            element.style.width = target;
        }, 100);
    },

    animateTypewriter(element) {
        const text = element.dataset.text || element.textContent;
        const speed = parseInt(element.dataset.speed || '50');
        let i = 0;
        
        element.textContent = '';
        element.style.borderRight = '2px solid';
        
        const typeTimer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeTimer);
                // Remove cursor after typing is complete
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 500);
            }
        }, speed);
    },

    staggerChildren(element) {
        const children = Array.from(element.children);
        children.forEach((child, index) => {
            child.style.animationDelay = `${index * CONFIG.animation.stagger}ms`;
            child.classList.add('stagger-item');
        });
    },

    triggerEntranceAnimation(element, intersectionRatio) {
        // Different animations based on intersection ratio
        if (intersectionRatio > 0.8) {
            element.classList.add('fully-visible');
        } else if (intersectionRatio > 0.5) {
            element.classList.add('mostly-visible');
        } else {
            element.classList.add('partially-visible');
        }
    },

    setupParticleSystem() {
        if (!CONFIG.performance.enableParticles) return;

        // Initialize particles.js if available
        if (typeof particlesJS !== 'undefined') {
            const particleConfigs = {
                hero: {
                    particles: {
                        number: { value: CONFIG.performance.maxParticles },
                        color: { value: '#A78BFA' },
                        shape: { type: 'circle' },
                        opacity: {
                            value: 0.4,
                            random: true,
                            animation: { enable: true, speed: 1, opacity_min: 0.1 }
                        },
                        size: {
                            value: 3,
                            random: true,
                            animation: { enable: true, speed: 2, size_min: 0.1 }
                        },
                        move: {
                            enable: true,
                            speed: 1.5,
                            direction: 'none',
                            random: true,
                            straight: false,
                            out_mode: 'out',
                            bounce: false
                        }
                    },
                    interactivity: {
                        detect_on: 'window',
                        events: {
                            onhover: { enable: true, mode: 'repulse' },
                            onclick: { enable: true, mode: 'push' },
                            resize: true
                        },
                        modes: {
                            repulse: { distance: 100, duration: 0.4 },
                            push: { particles_nb: 4 }
                        }
                    },
                    retina_detect: true
                }
            };

            // Initialize particles for different sections
            const particleContainers = document.querySelectorAll('#particles-js, .particles-container');
            particleContainers.forEach(container => {
                particlesJS(container.id, particleConfigs.hero);
            });
        }
    },

    setupBackgroundAnimations() {
        // Floating shapes animation
        const floatingShapes = document.querySelectorAll('.floating-shape, .cosmic-element');
        floatingShapes.forEach((shape, index) => {
            shape.style.animationDelay = `${index * 0.5}s`;
            shape.style.animationDuration = `${6 + (index % 3)}s`;
        });

        // Cosmic background effects
        this.setupCosmicBackground();
        this.setupGradientAnimation();
    },

    setupCosmicBackground() {
        const cosmicBg = document.querySelector('.cosmic-bg, .hero-background');
        if (!cosmicBg) return;

        // Create animated stars
        const starsContainer = cosmicBg.querySelector('.stars') || this.createStarsContainer(cosmicBg);
        
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: #A78BFA;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${Math.random() * 3 + 2}s infinite;
                animation-delay: ${Math.random() * 3}s;
            `;
            starsContainer.appendChild(star);
        }
    },

    createStarsContainer(parent) {
        const container = document.createElement('div');
        container.className = 'stars';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        parent.appendChild(container);
        return container;
    },

    setupGradientAnimation() {
        // Animated gradients for hero section
        const gradientElements = document.querySelectorAll('.gradient-animated');
        gradientElements.forEach(element => {
            element.style.background = `
                linear-gradient(45deg, #A78BFA, #F9A8D4, #A78BFA, #F9A8D4);
                background-size: 400% 400%;
                animation: gradientShift 8s ease infinite;
            `;
        });
    },

    setupCounterAnimations() {
        // Enhanced counter animations with more options
        const counters = document.querySelectorAll('.counter-enhanced');
        counters.forEach(counter => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateEnhancedCounter(counter);
                        observer.unobserve(counter);
                    }
                });
            });
            observer.observe(counter);
        });
    },

    setupTypewriterAnimations() {
        const typewriterElements = document.querySelectorAll('.typewriter-enhanced');
        typewriterElements.forEach(element => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateEnhancedTypewriter(element);
                        observer.unobserve(element);
                    }
                });
            });
            observer.observe(element);
        });
    },

    triggerEntranceAnimations() {
        // Trigger entrance animations when loading is complete
        const entranceElements = document.querySelectorAll('.entrance-animation');
        entranceElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-in');
            }, index * 100);
        });
        
        // Trigger hero animations
        const heroElements = document.querySelectorAll('.hero-animate');
        heroElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('hero-visible');
            }, 500 + (index * 200));
        });
    },

    // Performance optimization methods
    pauseAnimations() {
        // Pause heavy animations when page is not visible
        const heavyAnimations = document.querySelectorAll('.particles-js-canvas, .floating-shape');
        heavyAnimations.forEach(element => {
            element.style.animationPlayState = 'paused';
        });
    },

    resumeAnimations() {
        // Resume animations when page becomes visible
        const pausedAnimations = document.querySelectorAll('.particles-js-canvas, .floating-shape');
        pausedAnimations.forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }
};

// ===============================================
// NAVIGATION MANAGER (ENHANCED)
// ===============================================

const NavigationManager = {
    activeSection: 'hero',
    isScrolling: false,
    scrollTimeout: null,
    navbar: null,
    
    init() {
        this.navbar = document.querySelector('.navbar');
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
        this.setupMobileNavigation();
        this.setupBackToTop();
        this.setupScrollSpy();
        this.setupNavbarBehavior();
        console.log('🧭 Navigation Manager initialized');
    },

    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId, link);
            });
        });
    },

    scrollToSection(sectionId, triggerElement) {
        const target = document.getElementById(sectionId);
        if (!target) return;

        // Calculate offset for fixed navbar
        const navbarHeight = this.navbar ? this.navbar.offsetHeight : 80;
        const offsetTop = target.offsetTop - navbarHeight - 20;
        
        this.isScrolling = true;
        
        window.scrollTo({
            top: Math.max(0, offsetTop),
            behavior: Utils.prefersReducedMotion() ? 'auto' : 'smooth'
        });

        // Clear scrolling flag after animation
        setTimeout(() => {
            this.isScrolling = false;
        }, 1000);

        // Update active navigation immediately
        this.setActiveSection(sectionId);
        
        // Focus management for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus();
        
        // Remove tabindex after focus to restore normal tab flow
        setTimeout(() => {
            target.removeAttribute('tabindex');
        }, 1000);
        
        // Announce navigation for screen readers
        if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Navigated to ${sectionId} section`);
        }

        // Track navigation
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_navigation', {
                section: sectionId,
                trigger: triggerElement ? triggerElement.textContent.trim() : 'unknown'
            });
        }
    },

    setupActiveNavigation() {
        const sections = document.querySelectorAll('section[id], main[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        if (sections.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            if (this.isScrolling) return; // Don't update during programmatic scrolling
            
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    this.setActiveSection(entry.target.id);
                }
            });
        }, { 
            threshold: [0.3, 0.7],
            rootMargin: '-20% 0px -20% 0px'
        });

        sections.forEach(section => observer.observe(section));
    },

    setActiveSection(sectionId) {
        if (this.activeSection === sectionId) return;
        
        this.activeSection = sectionId;
        
        // Update navigation links
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    },

    setupMobileNavigation() {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        if (navbarToggler && navbarCollapse) {
            // Close mobile nav when clicking a link
            const mobileNavLinks = navbarCollapse.querySelectorAll('.nav-link');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < 992) {
                        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                        if (bsCollapse) {
                            bsCollapse.hide();
                        }
                    }
                });
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!navbarCollapse.contains(e.target) && !navbarToggler.contains(e.target)) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                    if (bsCollapse && navbarCollapse.classList.contains('show')) {
                        bsCollapse.hide();
                    }
                }
            });
        }
    },

    setupBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (!backToTopBtn) return;

        const toggleVisibility = Utils.throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, 100);

        window.addEventListener('scroll', toggleVisibility);

        backToTopBtn.addEventListener('click', () => {
            if (window.accessibilityManager) {
                window.accessibilityManager.scrollToTop();
            }
        });
    },

    setupScrollSpy() {
        // Additional scroll spy functionality
        window.addEventListener('scroll', Utils.throttle(() => {
            if (!this.isScrolling) {
                this.updateScrollProgress();
                this.handleScrollDirection();
            }
        }, 16));
    },

    updateScrollProgress() {
        const scrollProgress = document.querySelector('.scroll-progress');
        if (scrollProgress) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            scrollProgress.style.width = `${Math.min(scrollPercent, 100)}%`;
        }
    },

    handleScrollDirection() {
        const currentScrollY = window.pageYOffset;
        const scrollingDown = currentScrollY > (this.lastScrollY || 0);
        
        if (this.navbar) {
            if (scrollingDown && currentScrollY > 100) {
                this.navbar.classList.add('navbar-hidden');
            } else {
                this.navbar.classList.remove('navbar-hidden');
            }
        }
        
        this.lastScrollY = currentScrollY;
    },

    setupNavbarBehavior() {
        // Navbar transparency on scroll
        if (this.navbar) {
            window.addEventListener('scroll', Utils.throttle(() => {
                const scrollTop = window.pageYOffset;
                
                if (scrollTop > 50) {
                    this.navbar.classList.add('navbar-scrolled');
                } else {
                    this.navbar.classList.remove('navbar-scrolled');
                }
            }, 16));
        }
    }
};

// ===============================================
// PERFORMANCE MANAGER (ENHANCED)
// ===============================================

const PerformanceManager = {
    init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupResourceHints();
        this.setupVisibilityAPI();
        this.monitorPerformance();
        console.log('⚡ Performance Manager initialized');
    },

    setupLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"], img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => this.loadImage(img));
        }
    },

    loadImage(img) {
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });

        img.addEventListener('error', () => {
            ErrorHandler.handleImageError(img);
        });

        // Handle data-src for lazy loading
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }

        // If src is already set, trigger load
        if (img.src && img.complete) {
            img.classList.add('loaded');
        }
    },

    setupImageOptimization() {
        // Add loading states to images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.complete) {
                img.classList.add('loading');
                
                const loadHandler = () => {
                    img.classList.remove('loading');
                    img.classList.add('loaded');
                    img.removeEventListener('load', loadHandler);
                };
                
                img.addEventListener('load', loadHandler);
            }
        });
    },

    setupResourceHints() {
        // Add prefetch for commonly used resources
        const resourceHints = [
            { href: '/assets/demo/voice/intro/Thann_Intro.wav', as: 'audio' },
            { href: '/assets/projects/voice/narrative/thanattsitt-2033447-tha-4d5m7gd2g.mp3', as: 'audio' },
            { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap', as: 'style' }
        ];

        resourceHints.forEach(hint => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = hint.href;
            if (hint.as) link.as = hint.as;
            document.head.appendChild(link);
        });
    },

    setupVisibilityAPI() {
        // Optimize performance when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden - pause heavy operations
                AnimationManager.pauseAnimations();
                AudioManager.stopAll();
            } else {
                // Page is visible - resume operations
                AnimationManager.resumeAnimations();
            }
        });
    },

    monitorPerformance() {
        // Monitor Core Web Vitals
        if ('web-vital' in window) {
            this.measureWebVitals();
        }

        // Monitor resource loading times
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.reportPerformanceMetrics();
            }, 0);
        });

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            this.setupPerformanceObserver();
        }
    },

    setupPerformanceObserver() {
        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'longtask') {
                        console.warn('Long task detected:', entry.duration + 'ms');
                        this.reportLongTask(entry);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
            console.log('Performance Observer not supported');
        }
    },

    measureWebVitals() {
        // This would integrate with web-vitals library if available
        if (typeof getCLS !== 'undefined') {
            getCLS(this.reportWebVital);
        }
        if (typeof getFID !== 'undefined') {
            getFID(this.reportWebVital);
        }
        if (typeof getFCP !== 'undefined') {
            getFCP(this.reportWebVital);
        }
        if (typeof getLCP !== 'undefined') {
            getLCP(this.reportWebVital);
        }
        if (typeof getTTFB !== 'undefined') {
            getTTFB(this.reportWebVital);
        }
    },

    reportWebVital(metric) {
        console.log('Web Vital:', metric);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', metric.name, {
                event_category: 'Web Vitals',
                value: Math.round(metric.value),
                event_label: metric.id,
                non_interaction: true
            });
        }
    },

    reportLongTask(entry) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'long_task', {
                event_category: 'Performance',
                value: Math.round(entry.duration),
                non_interaction: true
            });
        }
    },

    reportPerformanceMetrics() {
        if (!('performance' in window)) return;

        const perfData = performance.getEntriesByType('navigation')[0];
        
        if (perfData) {
            const metrics = {
                loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                firstByte: perfData.responseStart - perfData.requestStart,
                domInteractive: perfData.domInteractive - perfData.navigationStart,
                resourcesLoaded: performance.getEntriesByType('resource').length
            };

            console.log('📊 Performance Metrics:', metrics);

            // Report to analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'timing_complete', {
                    name: 'load',
                    value: Math.round(metrics.loadTime)
                });

                gtag('event', 'timing_complete', {
                    name: 'dom_content_loaded',
                    value: Math.round(metrics.domContentLoaded)
                });
            }
        }
    }
};

// ===============================================
// MAIN APPLICATION INITIALIZATION
// ===============================================

class PortfolioApp {
    constructor() {
        this.isInitialized = false;
        this.managers = {};
        this.initStartTime = performance.now();
    }

    async init() {
        try {
            // Check if already initialized
            if (this.isInitialized) return;

            console.log('🚀 Initializing Thanatsitt Portfolio...');

            // Initialize error handling first
            ErrorHandler.init();

            // Initialize loading screen
            LoadingManager.init();

            // Initialize core managers
            this.managers.accessibility = new AccessibilityManager();
            window.accessibilityManager = this.managers.accessibility;

            // Initialize other managers in order
            ThemeManager.init();
            AudioManager.init();
            AnimationManager.init();
            NavigationManager.init();
            PerformanceManager.init();
            ContactFormManager.init();
            CookieConsentManager.init();
            SocialSharingManager.init();

            // Setup global event listeners
            this.setupGlobalEventListeners();

            // Mark as initialized
            this.isInitialized = true;

            const initTime = performance.now() - this.initStartTime;
            console.log(`✅ Portfolio initialization complete in ${Math.round(initTime)}ms`);
            
            // Announce completion to screen readers
            setTimeout(() => {
                this.managers.accessibility.announce('Portfolio website fully loaded and ready for interaction');
            }, 1000);

            // Track initialization
            if (typeof gtag !== 'undefined') {
                gtag('event', 'app_initialization', {
                    init_time: Math.round(initTime),
                    managers_loaded: Object.keys(this.managers).length
                });
            }

        } catch (error) {
            console.error('❌ Portfolio initialization failed:', error);
            ErrorHandler.reportError('Initialization Error', error.message);
            
            // Show fallback content
            this.showFallbackContent();
        }
    }

    setupGlobalEventListeners() {
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                AudioManager.stopAll();
            }
        });

        // Handle window resize
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));

        // Handle connection changes
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.handleConnectionChange();
            });
        }

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.handleOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
            this.handleOnlineStatus(false);
        });

        // Handle beforeunload for cleanup
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    handleResize() {
        // Refresh AOS on resize
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }

        // Update particle system if needed
        if (CONFIG.performance.enableParticles && typeof pJSDom !== 'undefined' && pJSDom[0]) {
            pJSDom[0].pJS.fn.particlesRefresh();
        }

        // Update navbar behavior
        NavigationManager.setupNavbarBehavior();
    }

    handleConnectionChange() {
        const connection = navigator.connection;
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            // Disable animations for slow connections
            CONFIG.performance.enableParticles = false;
            document.documentElement.classList.add('reduce-motion');
            
            if (this.managers.accessibility) {
                this.managers.accessibility.announce('Slow connection detected. Reduced animations for better performance.');
            }
        }
    }

    handleOnlineStatus(isOnline) {
        const statusMessage = isOnline ? 'Connection restored' : 'Connection lost. Some features may not work';
        
        if (this.managers.accessibility) {
            this.managers.accessibility.announce(statusMessage);
        }

        // Update UI to reflect connection status
        document.documentElement.setAttribute('data-online', isOnline.toString());
    }

    showFallbackContent() {
        // Show basic content if JavaScript fails
        const fallbackMessage = document.createElement('div');
        fallbackMessage.className = 'fallback-message';
        fallbackMessage.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <h4>JavaScript Error</h4>
                <p>Some features may not work properly. Please refresh the page or enable JavaScript.</p>
            </div>
        `;
        
        document.body.insertBefore(fallbackMessage, document.body.firstChild);
    }

    cleanup() {
        // Cleanup resources before page unload
        AudioManager.stopAll();
        
        // Clear timers and observers
        AnimationManager.observers.forEach(observer => observer.disconnect());
        
        // Save any pending data
        localStorage.setItem('lastVisit', new Date().toISOString());
    }

    // Public methods for external access
    getManager(name) {
        return this.managers[name];
    }

    isReady() {
        return this.isInitialized;
    }

    getVersion() {
        return '3.0';
    }

    // Debug method for development
    debug() {
        return {
            initialized: this.isInitialized,
            managers: Object.keys(this.managers),
            config: CONFIG,
            performance: {
                initTime: performance.now() - this.initStartTime
            }
        };
    }
}

// ===============================================
// INITIALIZE APPLICATION
// ===============================================

// Create global app instance
window.portfolioApp = new PortfolioApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.portfolioApp.init();
    });
} else {
    // DOM is already ready
    window.portfolioApp.init();
}

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioApp;
}

// Development helper - expose to console
if (typeof window !== 'undefined') {
    window.PortfolioDebug = () => window.portfolioApp.debug();
}
