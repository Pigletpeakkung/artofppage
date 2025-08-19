/* ==================================
   THANATSITT PORTFOLIO - MAIN JAVASCRIPT
   Modern ES2023+ Features & 2025 Best Practices
   Performance-optimized, accessible, and maintainable
   ================================== */

// === STRICT MODE & MODULE IMPORTS ===
'use strict';

// === CONSTANTS & CONFIGURATION ===
const CONFIG = {
    // Animation settings
    ANIMATION_DURATION: 300,
    SCROLL_THRESHOLD: 100,
    TYPING_SPEED: 100,
    TYPING_DELAY: 1000,
    
    // Performance settings
    THROTTLE_DELAY: 16, // ~60fps
    DEBOUNCE_DELAY: 250,
    INTERSECTION_THRESHOLD: 0.1,
    
    // Theme settings
    THEME_STORAGE_KEY: 'portfolio-theme',
    DEFAULT_THEME: 'light',
    
    // Contact form settings
    FORM_TIMEOUT: 10000,
    MAX_MESSAGE_LENGTH: 1000,
    
    // Social links
    SOCIAL_LINKS: {
        github: 'https://github.com/thanatsitt',
        linkedin: 'https://linkedin.com/in/thanatsitt',
        email: 'Thanattsitt.info@yahoo.co.uk'
    }
};

// === UTILITY FUNCTIONS ===

/**
 * Debounce function to limit function calls
 */
const debounce = (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
};

/**
 * Throttle function to limit function calls
 */
const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Safe localStorage operations
 */
const storage = {
    get: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn('localStorage get failed:', error);
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.warn('localStorage set failed:', error);
            return false;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('localStorage remove failed:', error);
            return false;
        }
    }
};

/**
 * Create and dispatch custom events
 */
const emitEvent = (eventName, detail = {}) => {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
};

// === THEME MANAGEMENT ===
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || CONFIG.DEFAULT_THEME;
        this.systemTheme = this.getSystemTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
        this.watchSystemTheme();
        
        document.addEventListener('cc:onChange', () => {
            this.handleConsentChange();
        });
    }

    getStoredTheme() {
        return storage.get(CONFIG.THEME_STORAGE_KEY);
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.updateThemeToggle(theme);
        emitEvent('themeChanged', { theme });
        
        if (this.canStoreTheme()) {
            storage.set(CONFIG.THEME_STORAGE_KEY, theme);
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    setupThemeToggle() {
        const toggleButton = document.querySelector('.theme-toggle');
        if (!toggleButton) return;

        toggleButton.addEventListener('click', () => this.toggleTheme());

        toggleButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    updateThemeToggle(theme) {
        const toggleButton = document.querySelector('.theme-toggle');
        if (!toggleButton) return;

        const icon = toggleButton.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        toggleButton.setAttribute('aria-label', 
            `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`
        );
    }

    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            this.systemTheme = e.matches ? 'dark' : 'light';
            
            if (!this.getStoredTheme()) {
                this.applyTheme(this.systemTheme);
            }
        });
    }

    canStoreTheme() {
        if (typeof CookieConsent !== 'undefined') {
            return CookieConsent.acceptedCategory('functionality');
        }
        return true;
    }

    handleConsentChange() {
        if (this.canStoreTheme()) {
            storage.set(CONFIG.THEME_STORAGE_KEY, this.currentTheme);
        } else {
            storage.remove(CONFIG.THEME_STORAGE_KEY);
        }
    }
}

// === NAVIGATION MANAGEMENT ===
class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.header__navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.section');
        this.init();
    }

    init() {
        this.setupScrollSpy();
        this.setupSmoothScrolling();
        this.setupNavbarBehavior();
        this.setupMobileMenu();
    }

    setupScrollSpy() {
        const observerOptions = {
            threshold: CONFIG.INTERSECTION_THRESHOLD,
            rootMargin: '-20% 0px -80% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.updateActiveNavLink(entry.target.id);
                }
            });
        }, observerOptions);

        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    updateActiveNavLink(sectionId) {
        this.navLinks.forEach(link => link.classList.remove('active'));

        const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            emitEvent('navigationChanged', { activeSection: sectionId });
        }
    }

    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    this.scrollToSection(targetSection);
                }
            });
        });
    }

    scrollToSection(section) {
        const headerHeight = this.navbar?.offsetHeight || 0;
        const targetPosition = section.offsetTop - headerHeight;
        
        if (prefersReducedMotion()) {
            window.scrollTo(0, targetPosition);
        } else {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    setupNavbarBehavior() {
        if (!this.navbar) return;

        let lastScrollY = window.scrollY;
        let isNavbarHidden = false;

        const handleScroll = throttle(() => {
            const currentScrollY = window.scrollY;
            const scrollingDown = currentScrollY > lastScrollY;
            const scrolledEnough = currentScrollY > CONFIG.SCROLL_THRESHOLD;

            if (currentScrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }

            if (scrolledEnough && scrollingDown && !isNavbarHidden) {
                this.navbar.style.transform = 'translateY(-100%)';
                isNavbarHidden = true;
            } else if (!scrollingDown && isNavbarHidden) {
                this.navbar.style.transform = 'translateY(0)';
                isNavbarHidden = false;
            }

            lastScrollY = currentScrollY;
        }, CONFIG.THROTTLE_DELAY);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    setupMobileMenu() {
        const mobileToggle = document.querySelector('.navbar-toggler');
        const navCollapse = document.querySelector('.navbar-collapse');
        
        if (!mobileToggle || !navCollapse) return;

        mobileToggle.addEventListener('click', () => {
            const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            
            mobileToggle.setAttribute('aria-expanded', !isExpanded);
            navCollapse.classList.toggle('show');
        });

        // Close menu when clicking nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.setAttribute('aria-expanded', 'false');
                navCollapse.classList.remove('show');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar')) {
                mobileToggle.setAttribute('aria-expanded', 'false');
                navCollapse.classList.remove('show');
            }
        });
    }
}

// === ANIMATION MANAGER ===
class AnimationManager {
    constructor() {
        this.animatedElements = new Set();
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupTypewriter();
        this.setupCounters();
        this.setupStars();
    }

    setupScrollAnimations() {
        if (prefersReducedMotion()) return;

        const animatedElements = document.querySelectorAll('[data-animate]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.animatedElements.add(entry.target);
                }
            });
        }, {
            threshold: CONFIG.INTERSECTION_THRESHOLD,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(element => observer.observe(element));
    }

    animateElement(element) {
        const animationType = element.dataset.animate;
        const delay = parseInt(element.dataset.delay) || 0;

        setTimeout(() => {
            element.classList.add('animate-in');
            
            switch (animationType) {
                case 'fade-up':
                    element.style.transform = 'translateY(0)';
                    element.style.opacity = '1';
                    break;
                case 'fade-in':
                    element.style.opacity = '1';
                    break;
                case 'scale-in':
                    element.style.transform = 'scale(1)';
                    element.style.opacity = '1';
                    break;
            }
        }, delay);
    }

    setupTypewriter() {
        const typewriterElement = document.querySelector('.subtitle[data-typewriter]');
        if (!typewriterElement) return;

        const phrases = typewriterElement.dataset.typewriter.split('|');
        let currentPhraseIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;

        const typewrite = () => {
            const currentPhrase = phrases[currentPhraseIndex];
            
            if (!isDeleting) {
                typewriterElement.textContent = currentPhrase.substring(0, currentCharIndex + 1);
                currentCharIndex++;
                
                if (currentCharIndex === currentPhrase.length) {
                    isDeleting = true;
                    setTimeout(typewrite, CONFIG.TYPING_DELAY);
                    return;
                }
            } else {
                typewriterElement.textContent = currentPhrase.substring(0, currentCharIndex - 1);
                currentCharIndex--;
                
                if (currentCharIndex === 0) {
                    isDeleting = false;
                    currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                }
            }
            
            const speed = isDeleting ? CONFIG.TYPING_SPEED / 2 : CONFIG.TYPING_SPEED;
            setTimeout(typewrite, speed);
        };

        setTimeout(typewrite, 1000);
    }

    setupCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(counter) {
        const target = parseInt(counter.dataset.counter);
        const duration = parseInt(counter.dataset.duration) || 2000;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(target * easeOut);
            
            counter.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }

    setupStars() {
        const starsContainer = document.querySelector('.stars-container');
        if (!starsContainer || prefersReducedMotion()) return;

        this.createShootingStars();
        
        setTimeout(() => {
            starsContainer.classList.add('breathing');
        }, 2000);
    }

    createShootingStars() {
        const shootingStarsContainer = document.querySelector('.shooting-stars');
        if (!shootingStarsContainer) return;

        setInterval(() => {
            if (Math.random() > 0.7) {
                this.createShootingStar();
            }
        }, 5000);
    }

    createShootingStar() {
        const shootingStarsContainer = document.querySelector('.shooting-stars');
        if (!shootingStarsContainer) return;

        const star = document.createElement('div');
        star.className = 'star star--shooting';
        
        star.style.top = Math.random() * 50 + '%';
        star.style.left = '-50px';
        
        shootingStarsContainer.appendChild(star);
        
        setTimeout(() => {
            star.remove();
        }, 8000);
    }
}

// === CONTACT FORM MANAGER ===
class ContactFormManager {
    constructor() {
        this.form = document.querySelector('#contact-form');
        this.submitButton = null;
        this.originalButtonText = '';
        this.init();
    }

    init() {
        if (!this.form) return;

        this.submitButton = this.form.querySelector('[type="submit"]');
        this.originalButtonText = this.submitButton?.textContent || 'Send Message';
        
        this.setupFormValidation();
        this.setupFormSubmission();
        this.setupCharacterCounter();
    }

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldValidation(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        this.clearFieldValidation(field);

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        } else if (field.name === 'message' && value.length > CONFIG.MAX_MESSAGE_LENGTH) {
            isValid = false;
            errorMessage = `Message must be less than ${CONFIG.MAX_MESSAGE_LENGTH} characters`;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('invalid');
        field.setAttribute('aria-invalid', 'true');
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.setAttribute('role', 'alert');
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        field.setAttribute('aria-describedby', errorElement.id || 'error-' + field.name);
    }

    clearFieldValidation(field) {
        field.classList.remove('invalid');
        field.removeAttribute('aria-invalid');
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission();
        });
    }

    async handleFormSubmission() {
        const fields = this.form.querySelectorAll('input, textarea, select');
        let isFormValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showFormMessage('Please correct the errors above', 'error');
            return;
        }

        this.setFormLoading(true);

        try {
            await this.submitForm();
            
            this.showFormMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
            this.form.reset();
            this.trackFormSubmission('success');
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showFormMessage('Failed to send message. Please try again later.', 'error');
            this.trackFormSubmission('error');
        } finally {
            this.setFormLoading(false);
        }
    }

    async submitForm() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        data.timestamp = new Date().toISOString();
        data.userAgent = navigator.userAgent;

        // Simulate API call (replace with actual endpoint)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve(data);
                } else {
                    reject(new Error('Submission failed'));
                }
            }, 2000);
        });
    }

    setFormLoading(isLoading) {
        if (!this.submitButton) return;

        if (isLoading) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
        } else {
            this.submitButton.disabled = false;
            this.submitButton.textContent = this.originalButtonText;
        }
    }

    showFormMessage(message, type) {
        const existingMessage = this.form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-message--${type}`;
        messageElement.setAttribute('role', 'alert');
        messageElement.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
            ${message}
        `;

        this.form.insertBefore(messageElement, this.form.firstChild);

        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }

    setupCharacterCounter() {
        const messageField = this.form.querySelector('textarea[name="message"]');
        if (!messageField) return;

        const counterElement = document.createElement('div');
        counterElement.className = 'character-counter';
        messageField.parentNode.appendChild(counterElement);

        const updateCounter = () => {
            const currentLength = messageField.value.length;
            const maxLength = CONFIG.MAX_MESSAGE_LENGTH;
            const remaining = maxLength - currentLength;
            
            counterElement.textContent = `${currentLength}/${maxLength}`;
            counterElement.classList.toggle('warning', remaining < 50);
            counterElement.classList.toggle('error', remaining < 0);
        };

        messageField.addEventListener('input', updateCounter);
        updateCounter();
    }

    trackFormSubmission(status) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submission', {
                event_category: 'engagement',
                event_label: status,
                value: status === 'success' ? 1 : 0
            });
        }

        emitEvent('formSubmitted', { status });
    }
}

// === PERFORMANCE MONITOR ===
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.measureLCP();
        this.measureFID();
        this.measureCLS();
        this.setupResourceMonitoring();
    }

    measurePageLoad() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    if (navigation) {
                        this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
                        this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
                        this.metrics.firstByte = navigation.responseStart - navigation.requestStart;
                        
                        console.log('Page Load Metrics:', this.metrics);
                        this.reportMetrics('page_load', this.metrics);
                    }
                }, 0);
            });
        }
    }

    measureLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
                
                console.log('LCP:', this.metrics.lcp);
                this.reportMetrics('lcp', { value: this.metrics.lcp });
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    measureFID() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name === 'first-input') {
                        this.metrics.fid = entry.processingStart - entry.startTime;
                        
                        console.log('FID:', this.metrics.fid);
                        this.reportMetrics('fid', { value: this.metrics.fid });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['first-input'] });
        }
    }

    measureCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                this.metrics.cls = clsValue;
                console.log('CLS:', this.metrics.cls);
                this.reportMetrics('cls', { value: this.metrics.cls });
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        }
    }

    setupResourceMonitoring() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.duration > 1000) {
                        console.warn('Slow resource:', entry.name, entry.duration + 'ms');
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
        }
    }

    reportMetrics(metricName, data) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_metric', {
                event_category: 'performance',
                event_label: metricName,
                value: Math.round(data.value || data.loadTime || 0)
            });
        }

        emitEvent('performanceMetric', { metric: metricName, data });
    }
}

// === ACCESSIBILITY MANAGER ===
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupAriaLiveRegions();
        this.setupReducedMotion();
    }

    setupKeyboardNavigation() {
        // Skip to main content
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Escape key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals or menus
                const openModal = document.querySelector('.modal.show');
                const openMenu = document.querySelector('.navbar-collapse.show');
                
                if (openModal) {
                    openModal.classList.remove('show');
                }
                
                if (openMenu) {
                    openMenu.classList.remove('show');
                    const toggle = document.querySelector('.navbar-toggler');
                    if (toggle) {
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        });
    }

    setupFocusManagement() {
        // Focus visible indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Focus trap for modals
        document.addEventListener('focusin', (e) => {
            const modal = e.target.closest('.modal');
            if (modal && modal.classList.contains('show')) {
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.target === modal && firstElement) {
                    firstElement.focus();
                }
            }
        });
    }

    setupAriaLiveRegions() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);

        // Listen for custom events to announce
        document.addEventListener('themeChanged', (e) => {
            this.announce(`Theme changed to ${e.detail.theme} mode`);
        });

        document.addEventListener('navigationChanged', (e) => {
            this.announce(`Navigated to ${e.detail.activeSection} section`);
        });
    }

    announce(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    setupReducedMotion() {
        if (prefersReducedMotion()) {
            document.body.classList.add('reduced-motion');
            
            // Disable autoplay animations
            const autoplayElements = document.querySelectorAll('[autoplay]');
            autoplayElements.forEach(element => {
                element.removeAttribute('autoplay');
            });
        }
    }
}

// === ERROR HANDLER ===
class ErrorHandler {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('error', (e) => {
            this.handleError(e.error, 'JavaScript Error', e.filename, e.lineno);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.handleError(e.reason, 'Unhandled Promise Rejection');
        });
    }

    handleError(error, type, filename = '', line = 0) {
        console.error(`${type}:`, error);

        // Log to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: `${type}: ${error.message || error}`,
                fatal: false
            });
        }

        // Show user-friendly error message for critical errors
        if (type === 'JavaScript Error' && error.message.includes('fetch')) {
            this.showUserError('Network error. Please check your connection and try again.');
        }
    }

    showUserError(message) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-toast';
        errorContainer.innerHTML = `
            <div class="error-toast__content">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
                <button class="error-toast__close" aria-label="Close error message">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(errorContainer);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorContainer.remove();
        }, 5000);

        // Manual close
        errorContainer.querySelector('.error-toast__close').addEventListener('click', () => {
            errorContainer.remove();
        });
    }
}

// === SERVICE WORKER REGISTRATION ===
class ServiceWorkerManager {
    constructor() {
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator && 'caches' in window) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-notification__content">
                <i class="fas fa-sync-alt me-2"></i>
                A new version is available!
                <button class="btn btn-sm btn-primary ms-2" onclick="window.location.reload()">
                    Update Now
                </button>
                <button class="update-notification__close" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        notification.querySelector('.update-notification__close').addEventListener('click', () => {
            notification.remove();
        });
    }
}

// === MAIN APPLICATION ===
class PortfolioApp {
    constructor() {
        this.managers = {};
        this.init();
    }

    async init() {
        try {
            // Initialize core managers
            this.managers.theme = new ThemeManager();
            this.managers.navigation = new NavigationManager();
            this.managers.animation = new AnimationManager();
            this.managers.contactForm = new ContactFormManager();
            this.managers.performance = new PerformanceMonitor();
            this.managers.accessibility = new AccessibilityManager();
            this.managers.errorHandler = new ErrorHandler();
            this.managers.serviceWorker = new ServiceWorkerManager();

            // Setup global event listeners
            this.setupGlobalEvents();

            // Mark app as initialized
            document.body.classList.add('app-initialized');
            emitEvent('appInitialized');

            console.log('Portfolio app initialized successfully');

        } catch (error) {
            console.error('Failed to initialize portfolio app:', error);
            this.managers.errorHandler?.handleError(error, 'Initialization Error');
        }
    }

    setupGlobalEvents() {
        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                emitEvent('pageHidden');
            } else {
                emitEvent('pageVisible');
            }
        });

        // Online/offline status
        window.addEventListener('online', () => {
            emitEvent('connectionRestored');
            console.log('Connection restored');
        });

        window.addEventListener('offline', () => {
            emitEvent('connectionLost');
            console.log('Connection lost');
        });

        // Resize handling
        const handleResize = debounce(() => {
            emitEvent('windowResized', {
                width: window.innerWidth,
                height: window.innerHeight
            });
        }, CONFIG.DEBOUNCE_DELAY);

        window.addEventListener('resize', handleResize);
    }

    // Public API methods
    getManager(name) {
        return this.managers[name];
    }

    destroy() {
        // Cleanup if needed
        Object.values(this.managers).forEach(manager => {
            if (manager.destroy) {
                manager.destroy();
            }
        });
    }
}

// === INITIALIZATION ===
let portfolioApp;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        portfolioApp = new PortfolioApp();
    });
} else {
    portfolioApp = new PortfolioApp();
}

// Export for global access
window.PortfolioApp = PortfolioApp;
window.portfolioApp = portfolioApp;

// === UTILITY EXPORTS ===
window.portfolioUtils = {
    debounce,
    throttle,
    storage,
    emitEvent,
    prefersReducedMotion
};
