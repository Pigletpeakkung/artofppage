/*!
 * Portfolio Application
 * Enhanced JavaScript Animation System
 * Author: Thanatsitt Santisamranwilai
 * Version: 2.0.0
 */

'use strict';

/*
========================================
CONFIGURATION OBJECT
========================================
*/
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
    },
    performance: {
        debounceDelay: 250,
        throttleLimit: 100
    }
};

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
    },

    // Safe query selector
    querySelector: function(selector) {
        return document.querySelector(selector);
    },

    // Safe query selector all
    querySelectorAll: function(selector) {
        return Array.from(document.querySelectorAll(selector));
    },

    // Add event listener with error handling
    addEventListenerSafe: function(element, event, handler, options = {}) {
        if (element && typeof handler === 'function') {
            try {
                element.addEventListener(event, handler, options);
                return true;
            } catch (error) {
                console.warn(`Failed to add event listener for ${event}:`, error);
                return false;
            }
        }
        return false;
    },

    // Create element with attributes
    createElement: function(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        if (content) {
            element.textContent = content;
        }
        
        return element;
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

        this.elements = this.getElements();
        this.observers = new Map();
        
        this.init();
    }

    getElements() {
        return {
            sections: Utils.querySelectorAll('.section'),
            skillCards: Utils.querySelectorAll('.skill-card'),
            portfolioCards: Utils.querySelectorAll('.portfolio-card'),
            aboutImage: Utils.querySelector('.about-image'),
            aboutTextContent: Utils.querySelector('.about-text-content'),
            contactInfo: Utils.querySelector('.contact-info'),
            contactForm: Utils.querySelector('.contact-form')
        };
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
                    this.animateSectionElements(entry.target);
                }
            });
        }, this.observerOptions);

        this.elements.sections.forEach(section => {
            sectionObserver.observe(section);
        });
        
        this.observers.set('sections', sectionObserver);
    }

    animateSectionElements(section) {
        const title = section.querySelector('.section-title');
        const subtitle = section.querySelector('.section-subtitle');

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

    observeSkillCards() {
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.animateSkillCard(entry.target);
                }
            });
        }, {
            ...this.observerOptions,
            threshold: 0.3
        });

        this.elements.skillCards.forEach(card => {
            skillObserver.observe(card);
        });
        
        this.observers.set('skills', skillObserver);
    }

    animateSkillCard(card) {
        const index = Array.from(this.elements.skillCards).indexOf(card);
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
            card.classList.add('animate');

            // Animate progress bar
            const progressBar = card.querySelector('.skill-progress-bar');
            if (progressBar) {
                setTimeout(() => {
                    const targetWidth = progressBar.className.match(/skill-progress-bar--(\d+)/);
                    if (targetWidth && targetWidth[1]) {
                        progressBar.style.width = `${targetWidth[1]}%`;
                    }
                }, 500);
            }
        }, index * CONFIG.animations.staggerDelay);
    }

    observePortfolioCards() {
        const portfolioObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animatePortfolioCard(entry.target);
                }
            });
        }, this.observerOptions);

        this.elements.portfolioCards.forEach(card => {
            portfolioObserver.observe(card);
        });
        
        this.observers.set('portfolio', portfolioObserver);
    }

    animatePortfolioCard(card) {
        const index = Array.from(this.elements.portfolioCards).indexOf(card);
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.animation = 'fadeInUp 0.8s ease-out forwards';
        }, index * 200);
    }

    observeAboutSection() {
        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateAboutElements();
                }
            });
        }, this.observerOptions);

        const aboutSection = Utils.querySelector('.about-section');
        if (aboutSection) {
            aboutObserver.observe(aboutSection);
            this.observers.set('about', aboutObserver);
        }
    }

    animateAboutElements() {
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

    observeContactSection() {
        const contactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateContactElements();
                }
            });
        }, this.observerOptions);

        const contactSection = Utils.querySelector('.contact-section');
        if (contactSection) {
            contactObserver.observe(contactSection);
            this.observers.set('contact', contactObserver);
        }
    }

    animateContactElements() {
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

    // Cleanup method
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
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
        this.texts = texts || CONFIG.typewriter.texts;
        this.options = {
            speed: options.speed || CONFIG.typewriter.speed,
            deleteSpeed: options.deleteSpeed || CONFIG.typewriter.deleteSpeed,
            pauseDuration: options.pauseDuration || CONFIG.typewriter.pauseDuration
        };

        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;
        this.timeoutId = null;

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

        this.timeoutId = setTimeout(() => this.type(), typeSpeed);
    }

    // Stop the typewriter effect
    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    // Restart the typewriter effect
    restart() {
        this.stop();
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;
        this.type();
    }
}

/*
========================================
ENHANCED THEME CONTROLLER
========================================
*/
class ThemeController {
    constructor() {
        this.currentTheme = localStorage.getItem(CONFIG.theme.storageKey) || this.getSystemTheme();
        this.themeToggle = Utils.querySelector('#themeToggle');
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.bindEvents();
        this.watchSystemTheme();
    }

    getSystemTheme() {
        return this.mediaQuery.matches ? 'dark' : 'light';
    }

    bindEvents() {
        if (this.themeToggle) {
            Utils.addEventListenerSafe(this.themeToggle, 'click', () => {
                this.toggleTheme();
            });

            Utils.addEventListenerSafe(this.themeToggle, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }
    }

    watchSystemTheme() {
        Utils.addEventListenerSafe(this.mediaQuery, 'change', (e) => {
            if (!localStorage.getItem(CONFIG.theme.storageKey)) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    toggleTheme() {
        if (this.themeToggle) {
            this.themeToggle.classList.add('switching');
        }

        setTimeout(() => {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(this.currentTheme);
            
            if (this.themeToggle) {
                this.themeToggle.classList.remove('switching');
            }
        }, CONFIG.theme.transitionDuration / 2);
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem(CONFIG.theme.storageKey, theme);
        this.updateThemeToggleIcon(theme);
        
        // Update meta theme-color
        const metaThemeColor = Utils.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#1A202C' : '#A78BFA');
        }
    }

    updateThemeToggleIcon(theme) {
        if (!this.themeToggle) return;

        const moonIcon = this.themeToggle.querySelector('.fa-moon');
        const sunIcon = this.themeToggle.querySelector('.fa-sun');

        if (moonIcon && sunIcon) {
            if (theme === 'dark') {
                moonIcon.classList.add('d-none');
                sunIcon.classList.remove('d-none');
            } else {
                moonIcon.classList.remove('d-none');
                sunIcon.classList.add('d-none');
            }
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
        this.navbar = Utils.querySelector('#mainNavbar');
        this.navLinks = Utils.querySelectorAll('.nav-link');
        this.sections = Utils.querySelectorAll('section[id]');
        this.lastScrollTop = 0;
        this.isVisible = true;
        this.throttledHandleScroll = Utils.throttle(this.handleScroll.bind(this), CONFIG.performance.throttleLimit);
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateActiveNavLinks();
    }

    bindEvents() {
        // Throttled scroll handling
        Utils.addEventListenerSafe(window, 'scroll', this.throttledHandleScroll, { passive: true });

        // Smooth scroll for navigation links
        this.navLinks.forEach(link => {
            Utils.addEventListenerSafe(link, 'click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const target = Utils.querySelector(targetId);
                
                if (target) {
                    const offset = this.navbar ? this.navbar.offsetHeight + 20 : 80;
                    const targetPosition = target.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    const navbarCollapse = Utils.querySelector('#navbarNav');
                    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                        bsCollapse.hide();
                    }
                }
            });
        });
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add scrolled class
        if (this.navbar) {
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
        }

        this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        this.updateActiveNavLinks();
    }

    updateActiveNavLinks() {
        let current = '';
        const scrollPosition = window.pageYOffset + 200;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
}

/*
========================================
PORTFOLIO FILTER CONTROLLER
========================================
*/
class PortfolioFilter {
    constructor() {
        this.filters = Utils.querySelectorAll('.portfolio-filter');
        this.portfolioCards = Utils.querySelectorAll('.portfolio-card');
        this.currentFilter = 'all';
        
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        this.filters.forEach(filter => {
            Utils.addEventListenerSafe(filter, 'click', () => {
                const filterValue = filter.getAttribute('data-filter');
                this.setActiveFilter(filter);
                this.filterPortfolio(filterValue);
            });
        });
    }

    setActiveFilter(activeFilter) {
        this.filters.forEach(filter => {
            filter.classList.remove('active');
            filter.setAttribute('aria-selected', 'false');
        });
        
        activeFilter.classList.add('active');
        activeFilter.setAttribute('aria-selected', 'true');
    }

    filterPortfolio(filterValue) {
        this.currentFilter = filterValue;

        this.portfolioCards.forEach((card, index) => {
            const cardCategories = card.getAttribute('data-category') || '';
            const shouldShow = filterValue === 'all' || cardCategories.includes(filterValue);

            if (shouldShow) {
                setTimeout(() => {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                                }, index * 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
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
        this.form = Utils.querySelector('#contactForm');
        this.newsletterForm = Utils.querySelector('#newsletterForm');
        this.submitButton = this.form?.querySelector('button[type="submit"]');
        this.originalButtonText = this.submitButton?.innerHTML;
        this.validationRules = {
            name: { required: true, minLength: 2 },
            email: { required: true, email: true },
            message: { required: true, minLength: 10 }
        };

        this.init();
    }

    init() {
        if (this.form) {
            this.bindFormEvents();
            this.setupValidation();
        }
        
        if (this.newsletterForm) {
            this.bindNewsletterEvents();
        }
    }

    bindFormEvents() {
        Utils.addEventListenerSafe(this.form, 'submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        const inputs = this.form.querySelectorAll('.form-control');
        inputs.forEach(input => {
            Utils.addEventListenerSafe(input, 'blur', () => this.validateField(input));
            Utils.addEventListenerSafe(input, 'input', () => this.clearFieldError(input));
        });
    }

    bindNewsletterEvents() {
        Utils.addEventListenerSafe(this.newsletterForm, 'submit', (e) => {
            e.preventDefault();
            this.handleNewsletterSubmit();
        });
    }

    setupValidation() {
        const emailField = this.form.querySelector('#email');
        if (emailField) {
            Utils.addEventListenerSafe(emailField, 'input', () => {
                this.validateEmail(emailField);
            });
        }
    }

    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = this.validationRules[fieldName];

        if (!rules) return true;

        // Required validation
        if (rules.required && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        // Email validation
        if (rules.email && value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }

        // Minimum length validation
        if (rules.minLength && value && value.length < rules.minLength) {
            this.showFieldError(field, `Minimum ${rules.minLength} characters required`);
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
        field.setAttribute('aria-invalid', 'true');

        // Remove existing error message
        this.clearFieldError(field);

        // Add new error message
        const errorDiv = Utils.createElement('div', {
            className: 'error-message',
            'aria-live': 'polite'
        }, message);
        
        errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
        field.parentNode.appendChild(errorDiv);
    }

    showFieldSuccess(field) {
        field.classList.add('success');
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');
        this.clearFieldError(field);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    validateForm() {
        const requiredFields = this.form.querySelectorAll('.form-control[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    async handleSubmit() {
        if (!this.validateForm()) {
            this.scrollToFirstError();
            return;
        }

        this.setLoadingState(true);

        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);
            
            // Simulate form submission (replace with actual API call)
            await this.submitForm(data);
            
            this.showSuccessMessage();
            this.form.reset();
            this.clearAllErrors();
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage('Something went wrong. Please try again later.');
        } finally {
            this.setLoadingState(false);
        }
    }

    async handleNewsletterSubmit() {
        const emailInput = this.newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        if (!email || !this.isValidEmail(email)) {
            this.showNewsletterMessage('Please enter a valid email address', 'error');
            return;
        }

        const submitButton = this.newsletterForm.querySelector('.newsletter-button');
        const originalHTML = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        submitButton.disabled = true;

        try {
            // Simulate newsletter subscription
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showNewsletterMessage('Thank you for subscribing!', 'success');
            emailInput.value = '';
        } catch (error) {
            this.showNewsletterMessage('Subscription failed. Please try again.', 'error');
        } finally {
            submitButton.innerHTML = originalHTML;
            submitButton.disabled = false;
        }
    }

    async submitForm(data) {
        // Replace with actual API endpoint
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure
                if (Math.random() > 0.1) {
                    resolve({ success: true, message: 'Message sent successfully!' });
                } else {
                    reject(new Error('Network error'));
                }
            }, 2000);
        });
    }

    setLoadingState(isLoading) {
        if (!this.submitButton) return;

        if (isLoading) {
            this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin icon-spacing"></i>Sending...';
            this.submitButton.disabled = true;
            this.form.classList.add('loading');
        } else {
            this.submitButton.innerHTML = this.originalButtonText;
            this.submitButton.disabled = false;
            this.form.classList.remove('loading');
        }
    }

    scrollToFirstError() {
        const firstError = this.form.querySelector('.form-control.error');
        if (firstError) {
            firstError.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            firstError.focus();
        }
    }

    clearAllErrors() {
        const errorFields = this.form.querySelectorAll('.form-control.error');
        errorFields.forEach(field => this.clearFieldError(field));
    }

    showSuccessMessage() {
        const successDiv = Utils.createElement('div', {
            className: 'alert alert-success',
            'aria-live': 'polite'
        });
        
        successDiv.style.cssText = `
            margin-top: 1.5rem;
            padding: 1rem;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            color: #10b981;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;
        
        successDiv.innerHTML = '<i class="fas fa-check-circle"></i>Thank you! Your message has been sent successfully.';
        this.form.appendChild(successDiv);

        setTimeout(() => successDiv.remove(), 5000);
    }

    showErrorMessage(message) {
        const errorDiv = Utils.createElement('div', {
            className: 'alert alert-danger',
            'aria-live': 'polite'
        });
        
        errorDiv.style.cssText = `
            margin-top: 1.5rem;
            padding: 1rem;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 0.75rem;
            color: #ef4444;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;
        
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
        this.form.appendChild(errorDiv);

        setTimeout(() => errorDiv.remove(), 5000);
    }

    showNewsletterMessage(message, type) {
        const existingMessage = this.newsletterForm.querySelector('.newsletter-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = Utils.createElement('div', {
            className: 'newsletter-message',
            'aria-live': 'polite'
        });
        
        messageDiv.style.cssText = `
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;

        if (type === 'success') {
            messageDiv.style.background = 'rgba(16, 185, 129, 0.1)';
            messageDiv.style.color = '#10b981';
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i>${message}`;
        } else {
            messageDiv.style.background = 'rgba(239, 68, 68, 0.1)';
            messageDiv.style.color = '#ef4444';
            messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
        }

        this.newsletterForm.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
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
        this.optimizeAnimations();
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
        
        // Add passive listeners for touch events
        Utils.addEventListenerSafe(document, 'touchstart', function() {}, scrollOptions);
        Utils.addEventListenerSafe(document, 'touchmove', function() {}, scrollOptions);
    }

    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            
                            // Add loading animation
                            img.style.opacity = '0';
                            img.style.transition = 'opacity 0.3s ease';
                            
                            img.onload = () => {
                                img.style.opacity = '1';
                            };
                        }
                        
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            Utils.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            Utils.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    preloadCriticalAssets() {
        const criticalAssets = [
            '/assets/images/hero-bg.jpg',
            '/assets/images/about-image.jpg'
            // Add more critical assets here
        ];

        criticalAssets.forEach(asset => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = this.getAssetType(asset);
            link.href = asset;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    getAssetType(url) {
        if (url.match(/\.(jpg|jpeg|png|webp|svg)$/i)) return 'image';
        if (url.match(/\.css$/i)) return 'style';
        if (url.match(/\.js$/i)) return 'script';
        if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
        return 'fetch';
    }

    optimizeAnimations() {
        // Disable animations for users who prefer reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            this.disableAnimations();
        }

        // Listen for changes in motion preference
        Utils.addEventListenerSafe(prefersReducedMotion, 'change', (e) => {
            if (e.matches) {
                this.disableAnimations();
            } else {
                this.enableAnimations();
            }
        });
    }

    disableAnimations() {
        const style = document.createElement('style');
        style.id = 'reduced-motion-style';
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }

    enableAnimations() {
        const style = Utils.querySelector('#reduced-motion-style');
        if (style) {
            style.remove();
        }
    }
}

/*
========================================
ACCESSIBILITY ENHANCEMENTS
========================================
*/
class AccessibilityEnhancer {
    constructor() {
        this.focusableElements = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
        this.init();
    }

    init() {
        this.enhanceKeyboardNavigation();
        this.addSkipLinks();
        this.improveAriaLabels();
        this.handleFocusManagement();
        this.announceRouteChanges();
    }

    enhanceKeyboardNavigation() {
        Utils.addEventListenerSafe(document, 'keydown', (e) => {
            this.handleGlobalKeyDown(e);
        });

        // Add focus indicators for keyboard users
        Utils.addEventListenerSafe(document, 'keydown', () => {
            document.body.classList.add('keyboard-navigation');
        });

        Utils.addEventListenerSafe(document, 'mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    handleGlobalKeyDown(e) {
        switch(e.key) {
            case 'Tab':
                this.handleTabNavigation(e);
                break;
            case 'Escape':
                this.handleEscapeKey(e);
                break;
            case 'Enter':
            case ' ':
                this.handleActivationKeys(e);
                break;
        }
    }

    handleTabNavigation(e) {
        // Enhanced tab trapping for modals and dropdowns
        const activeModal = Utils.querySelector('.modal.show, .dropdown.show');
        if (activeModal) {
            this.trapFocus(activeModal, e);
        }
    }

    handleEscapeKey(e) {
        // Close any open modals, dropdowns, or menus
        const openElements = Utils.querySelectorAll('.modal.show, .dropdown.show, .navbar-collapse.show');
        openElements.forEach(element => {
            if (element.classList.contains('modal') && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(element);
                if (modal) modal.hide();
            } else if (element.classList.contains('dropdown') && window.bootstrap) {
                const dropdown = bootstrap.Dropdown.getInstance(element);
                if (dropdown) dropdown.hide();
            } else if (element.classList.contains('navbar-collapse') && window.bootstrap) {
                const collapse = bootstrap.Collapse.getInstance(element);
                if (collapse) collapse.hide();
            }
        });
    }

    handleActivationKeys(e) {
        const target = e.target;
        
        // Handle custom interactive elements
        if (target.getAttribute('role') === 'button' && !target.disabled) {
            e.preventDefault();
            target.click();
        }
    }

    trapFocus(container, e) {
        const focusableEls = container.querySelectorAll(this.focusableElements);
        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstFocusableEl) {
                lastFocusableEl.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusableEl) {
                firstFocusableEl.focus();
                e.preventDefault();
            }
        }
    }

    addSkipLinks() {
        // Skip links are already in HTML, but we can enhance them
        const skipLinks = Utils.querySelectorAll('.skip-link');
        skipLinks.forEach(link => {
            Utils.addEventListenerSafe(link, 'click', (e) => {
                e.preventDefault();
                const target = Utils.querySelector(link.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    improveAriaLabels() {
        // Enhance interactive elements with proper ARIA labels
        const interactiveElements = Utils.querySelectorAll('button, a, input, textarea, select');
        
        interactiveElements.forEach(element => {
            if (!element.getAttribute('aria-label') && 
                !element.getAttribute('aria-labelledby') && 
                !element.getAttribute('aria-describedby')) {
                
                const text = element.textContent || 
                           element.value || 
                           element.placeholder || 
                           element.title;
                
                if (text && text.trim()) {
                    element.setAttribute('aria-label', text.trim());
                }
            }
        });

        // Add live regions for dynamic content
        this.addLiveRegions();
    }

    addLiveRegions() {
        // Add a live region for announcements
        if (!Utils.querySelector('#live-region')) {
            const liveRegion = Utils.createElement('div', {
                id: 'live-region',
                'aria-live': 'polite',
                'aria-atomic': 'true',
                className: 'sr-only'
            });
            
            liveRegion.style.cssText = `
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
            
            document.body.appendChild(liveRegion);
        }
    }

    handleFocusManagement() {
        // Manage focus for SPA-like navigation
        const navLinks = Utils.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            Utils.addEventListenerSafe(link, 'click', () => {
                setTimeout(() => {
                    const targetId = link.getAttribute('href');
                    const target = Utils.querySelector(targetId);
                    if (target) {
                        const heading = target.querySelector('h1, h2, h3, .section-title');
                        if (heading) {
                            heading.setAttribute('tabindex', '-1');
                            heading.focus();
                            // Remove tabindex after focus to restore natural tab order
                            setTimeout(() => heading.removeAttribute('tabindex'), 100);
                        }
                    }
                }, 1000); // Wait for smooth scroll to complete
            });
        });
    }

    announceRouteChanges() {
        // Announce section changes to screen readers
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionTitle = entry.target.querySelector('h1, h2, .section-title');
                    if (sectionTitle) {
                        this.announce(`Navigated to ${sectionTitle.textContent}`);
                    }
                }
            });
        }, { threshold: 0.5 });

                Utils.querySelectorAll('section[id]').forEach(section => {
            observer.observe(section);
        });
    }

    announce(message) {
        const liveRegion = Utils.querySelector('#live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            // Clear after announcement to allow repeat announcements
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
}

/*
========================================
GSAP ANIMATION ENHANCEMENTS
========================================
*/
class GSAPAnimations {
    constructor() {
        this.isGSAPReady = false;
        this.init();
    }

    init() {
        // Wait for GSAP to load
        if (window.gsap) {
            this.setupGSAP();
        } else {
            // Fallback if GSAP doesn't load
            Utils.addEventListenerSafe(window, 'load', () => {
                if (window.gsap) {
                    this.setupGSAP();
                }
            });
        }
    }

    setupGSAP() {
        this.isGSAPReady = true;
        
        // Register ScrollTrigger plugin
        if (window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }

        this.initHeroAnimations();
        this.initScrollAnimations();
        this.initHoverAnimations();
    }

    initHeroAnimations() {
        if (!this.isGSAPReady) return;

        const tl = gsap.timeline({ delay: 0.5 });

        tl.from('.hero-title', {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power3.out'
        })
        .from('#typewriter', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power2.out'
        }, '-=0.5')
        .from('.hero-description', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power2.out'
        }, '-=0.4')
        .from('.hero-section__cta .button', {
            duration: 0.6,
            y: 20,
            opacity: 0,
            stagger: 0.2,
            ease: 'back.out(1.7)'
        }, '-=0.3')
        .from('.hero-section__social-links li', {
            duration: 0.5,
            scale: 0,
            opacity: 0,
            stagger: 0.1,
            ease: 'back.out(1.7)'
        }, '-=0.2')
        .from('.scroll-indicator', {
            duration: 0.8,
            y: 20,
            opacity: 0,
            ease: 'power2.out'
        }, '-=0.1');

        // Animate geometric shapes
        if (window.ScrollTrigger) {
            gsap.to('.shape--1', {
                rotation: 360,
                duration: 20,
                repeat: -1,
                ease: 'none'
            });

            gsap.to('.shape--2', {
                rotation: -360,
                duration: 25,
                repeat: -1,
                ease: 'none'
            });

            gsap.to('.shape--3', {
                rotation: 360,
                duration: 30,
                repeat: -1,
                ease: 'none'
            });
        }
    }

    initScrollAnimations() {
        if (!this.isGSAPReady || !window.ScrollTrigger) return;

        // Parallax effect for hero background
        gsap.to('.hero-section__geometric-shapes', {
            yPercent: -50,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });

        // Skills cards animation
        gsap.fromTo('.skill-card', {
            y: 60,
            opacity: 0,
            scale: 0.8
        }, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'back.out(1.7)',
            scrollTrigger: {
                trigger: '.skills-grid',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Portfolio cards staggered animation
        gsap.fromTo('.portfolio-card', {
            y: 50,
            opacity: 0,
            rotationX: 15
        }, {
            y: 0,
            opacity: 1,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.portfolio-grid',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Contact section animation
        gsap.fromTo('.contact-info', {
            x: -50,
            opacity: 0
        }, {
            x: 0,
            opacity: 1,
            duration: 0.8,
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        gsap.fromTo('.contact-form', {
            x: 50,
            opacity: 0
        }, {
            x: 0,
            opacity: 1,
            duration: 0.8,
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    initHoverAnimations() {
        if (!this.isGSAPReady) return;

        // Button hover animations
        Utils.querySelectorAll('.button').forEach(button => {
            const hoverTl = gsap.timeline({ paused: true });
            
            hoverTl.to(button, {
                scale: 1.05,
                duration: 0.3,
                ease: 'back.out(1.7)'
            });

            Utils.addEventListenerSafe(button, 'mouseenter', () => hoverTl.play());
            Utils.addEventListenerSafe(button, 'mouseleave', () => hoverTl.reverse());
        });

        // Skill card hover effects
        Utils.querySelectorAll('.skill-card').forEach(card => {
            const hoverTl = gsap.timeline({ paused: true });
            
            hoverTl.to(card, {
                y: -10,
                scale: 1.02,
                duration: 0.3,
                ease: 'power2.out'
            });

            Utils.addEventListenerSafe(card, 'mouseenter', () => hoverTl.play());
            Utils.addEventListenerSafe(card, 'mouseleave', () => hoverTl.reverse());
        });

        // Portfolio card 3D hover effects
        Utils.querySelectorAll('.portfolio-card').forEach(card => {
            Utils.addEventListenerSafe(card, 'mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                gsap.to(card, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    duration: 0.3,
                    ease: 'power2.out',
                    transformPerspective: 1000,
                    transformOrigin: 'center'
                });
            });

            Utils.addEventListenerSafe(card, 'mouseleave', () => {
                gsap.to(card, {
                    rotationX: 0,
                    rotationY: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });
        });
    }
}

/*
========================================
MAIN APPLICATION CLASS
========================================
*/
class PortfolioApp {
    constructor() {
        this.components = new Map();
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            Utils.addEventListenerSafe(document, 'DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }

    async initializeComponents() {
        try {
            // Show loading state
            document.body.classList.add('loading');

            // Initialize core components
            this.components.set('scrollAnimations', new ScrollAnimations());
            this.components.set('themeController', new ThemeController());
            this.components.set('navbarController', new NavbarController());
            this.components.set('portfolioFilter', new PortfolioFilter());
            this.components.set('contactForm', new ContactFormController());
            this.components.set('performanceOptimizer', new PerformanceOptimizer());
            this.components.set('accessibilityEnhancer', new AccessibilityEnhancer());
            
            // Initialize GSAP animations if available
            if (window.gsap) {
                this.components.set('gsapAnimations', new GSAPAnimations());
            }

            // Initialize typewriter effect
            const typewriterElement = Utils.querySelector('#typewriter');
            if (typewriterElement) {
                this.components.set('typewriter', new TypewriterEffect(
                    typewriterElement,
                    CONFIG.typewriter.texts
                ));
            }

            // Wait a bit for all animations to initialize
            await new Promise(resolve => setTimeout(resolve, 500));

            // Remove loading state and show content
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');

            this.isInitialized = true;
            
            // Dispatch custom event for other scripts
            const initEvent = new CustomEvent('portfolioAppReady', {
                detail: { app: this }
            });
            document.dispatchEvent(initEvent);

            console.log('🚀 Portfolio application initialized successfully!');
            this.logFeatures();
            
        } catch (error) {
            console.error('❌ Error initializing portfolio application:', error);
            this.handleInitializationError(error);
        }
    }

    logFeatures() {
        console.log(`
        🎨 Welcome to Thanatsitt's Portfolio!
        
        ✨ Features:
        • Advanced scroll animations
        • Dark/Light theme toggle  
        • Responsive design
        • Accessibility enhancements
        • Performance optimizations
        • Interactive contact form
        • Portfolio filtering
        • GSAP animations
        • Lazy loading
        • SEO optimized
        
        🛠️ Built with:
        • Vanilla JavaScript (ES6+)
        • CSS3 with custom properties
        • Bootstrap 5.3.2
        • Font Awesome 6.4
        • GSAP 3.12.2
        • Modern web APIs
        
        🚀 Enjoy exploring!
        
        📊 Performance Features:
        • Intersection Observer API
        • Passive event listeners
        • Debounced/throttled handlers
        • Lazy image loading
        • Critical resource preloading
        • Reduced motion support
        
        ♿ Accessibility Features:
        • ARIA labels and roles
        • Keyboard navigation
        • Focus management
        • Screen reader support
        • Skip links
        • Live regions
        
        🔧 Developer Tools:
        • Global app instance: window.PortfolioApp
        • Utility functions: window.Utils
        • Component access: app.getComponent('name')
        • Debug mode: app.enableDebugMode()
        `);
    }

    handleInitializationError(error) {
        // Graceful degradation
        document.body.classList.remove('loading');
        document.body.classList.add('loaded', 'degraded');
        
        // Show user-friendly error message
        const errorMessage = Utils.createElement('div', {
            className: 'init-error',
            'aria-live': 'polite'
        });
        
        errorMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee2e2;
            color: #dc2626;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            max-width: 300px;
        `;
        
        errorMessage.innerHTML = `
            <strong>Notice:</strong> Some interactive features may not be fully available. 
            The site is still functional for browsing.
        `;
        
        document.body.appendChild(errorMessage);
        
        // Auto-remove error message
        setTimeout(() => errorMessage.remove(), 10000);
    }

    // Public method to get component instances
    getComponent(name) {
        return this.components.get(name);
    }

    // Public method to check if app is ready
    isReady() {
        return this.isInitialized;
    }

    // Public method to reinitialize specific components
    reinitialize(componentName) {
        if (componentName && this.components.has(componentName)) {
            // Destroy existing component if it has a destroy method
            const existingComponent = this.components.get(componentName);
            if (existingComponent && typeof existingComponent.destroy === 'function') {
                existingComponent.destroy();
            }
            
            // Reinitialize specific component
            this.initializeComponent(componentName);
        } else {
            // Reinitialize all components
            this.components.clear();
            this.initializeComponents();
        }
    }

    initializeComponent(componentName) {
        try {
            switch(componentName) {
                case 'scrollAnimations':
                    this.components.set('scrollAnimations', new ScrollAnimations());
                    break;
                case 'themeController':
                    this.components.set('themeController', new ThemeController());
                    break;
                case 'navbarController':
                    this.components.set('navbarController', new NavbarController());
                    break;
                case 'portfolioFilter':
                    this.components.set('portfolioFilter', new PortfolioFilter());
                    break;
                case 'contactForm':
                    this.components.set('contactForm', new ContactFormController());
                    break;
                case 'typewriter':
                    const typewriterElement = Utils.querySelector('#typewriter');
                    if (typewriterElement) {
                        this.components.set('typewriter', new TypewriterEffect(
                            typewriterElement,
                            CONFIG.typewriter.texts
                        ));
                    }
                    break;
                default:
                    console.warn(`Unknown component: ${componentName}`);
            }
            console.log(`✅ Component '${componentName}' reinitialized successfully`);
        } catch (error) {
            console.error(`❌ Error reinitializing component '${componentName}':`, error);
        }
    }

    // Debug mode for development
    enableDebugMode() {
        window.portfolioDebug = {
            config: CONFIG,
            components: this.components,
            utils: Utils,
            logPerformance: () => {
                console.log('Performance Metrics:', {
                    loadTime: performance.now(),
                    navigation: performance.getEntriesByType('navigation')[0],
                    resources: performance.getEntriesByType('resource').length
                });
            },
            testAccessibility: () => {
                const issues = [];
                // Check for missing alt text
                Utils.querySelectorAll('img:not([alt])').forEach(img => {
                    issues.push(`Missing alt text: ${img.src}`);
                });
                // Check for missing ARIA labels
                Utils.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(btn => {
                    if (!btn.textContent.trim()) {
                        issues.push(`Button missing accessible name: ${btn.outerHTML}`);
                    }
                });
                console.log('Accessibility Issues:', issues);
                return issues;
            }
        };
        console.log('🐛 Debug mode enabled. Access via window.portfolioDebug');
    }

    // Method to update configuration
    updateConfig(newConfig) {
        Object.assign(CONFIG, newConfig);
        console.log('📝 Configuration updated:', CONFIG);
        
        // Reinitialize components that depend on config
        this.reinitialize('typewriter');
    }

    // Method to get performance metrics
    getPerformanceMetrics() {
        return {
            loadTime: performance.now(),
            navigation: performance.getEntriesByType('navigation')[0],
            resourceCount: performance.getEntriesByType('resource').length,
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            } : null
        };
    }
}

/*
========================================
ERROR HANDLING AND MONITORING
========================================
*/

// Global error handler
Utils.addEventListenerSafe(window, 'error', (e) => {
    console.error('Global error caught:', {
        message: e.message,
        source: e.filename,
        line: e.lineno,
        column: e.colno,
        error: e.error
    });
    
    // You could send this to an error tracking service
    // trackError('javascript', e.error);
});

// Unhandled promise rejection handler
Utils.addEventListenerSafe(window, 'unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    
    // You could send this to an error tracking service
    // trackError('promise', e.reason);
});

// Page visibility change handler (for analytics)
Utils.addEventListenerSafe(document, 'visibilitychange', () => {
    if (document.hidden) {
        console.log('📱 Page became hidden');
    } else {
        console.log('👀 Page became visible');
    }
});

/*
========================================
INITIALIZE APPLICATION
========================================
*/

// Create and initialize the main application
const portfolioApp = new PortfolioApp();

// Make app instance globally accessible
window.PortfolioApp = portfolioApp;
window.Utils = Utils;
window.CONFIG = CONFIG;

// Auto-enable debug mode in development
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    portfolioApp.enableDebugMode();
}

/*
========================================
SERVICE WORKER REGISTRATION (PWA)
========================================
*/

// Register service worker for PWA functionality
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered:', registration);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content available, show update notification
                        showUpdateNotification();
                    }
                });
            });
        } catch (error) {
            console.log('❌ Service Worker registration failed:', error);
        }
    });
}

function showUpdateNotification() {
    const notification = Utils.createElement('div', {
        className: 'update-notification',
        'aria-live': 'polite'
    });
    
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-light);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 90vw;
    `;
    
    notification.innerHTML = `
        <span>New content available!</span>
        <button onclick="location.reload()" style="
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
        ">Update</button>
        <button onclick="this.parentElement.remove()" style="
            background: transparent;
            border: none;
            color: white;
            padding: 0.5rem;
            cursor: pointer;
            margin-left: auto;
        ">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

/*
========================================
EXPORT FOR MODULE SYSTEMS
========================================
*/

// For environments that support modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PortfolioApp,
        Utils,
        CONFIG
    };
}

// For AMD systems
if (typeof define === 'function' && define.amd) {
    define('portfolio-app', [], function() {
        return {
            PortfolioApp,
            Utils,
            CONFIG
        };
    });
}

// Initialization complete
console.log('📦 Portfolio application script loaded and ready!');
