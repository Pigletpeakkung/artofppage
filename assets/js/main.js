
  
        /*
        ========================================
        ENHANCED JAVASCRIPT ANIMATION SYSTEM
        ========================================
        */

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
        
