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
    },
    moon: {
        floatDuration: 8000,
        glowPulseDuration: 4000,
        phaseDuration: 12000
    },
    stars: {
        count: 8,
        twinkleDuration: [3000, 5000, 4000, 6000, 3500, 4500, 5500, 6500],
        colors: ['#FFB3E6', '#B3E5FF', '#E6B3FF', '#B3FFE6', '#FFE6B3', '#FFB3D9', '#B3D9FF', '#D9B3FF']
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
    },

    // Format time for animations
    formatTime: function(ms) {
        return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
    },

    // Check if browser supports feature
    supportsFeature: function(feature) {
        switch(feature) {
            case 'intersectionObserver':
                return 'IntersectionObserver' in window;
            case 'webGL':
                try {
                    const canvas = document.createElement('canvas');
                    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                } catch (e) {
                    return false;
                }
            case 'serviceWorker':
                return 'serviceWorker' in navigator;
            case 'localStorage':
                try {
                    localStorage.setItem('test', 'test');
                    localStorage.removeItem('test');
                    return true;
                } catch (e) {
                    return false;
                }
            default:
                return false;
        }
    }
};

/*
========================================
ENHANCED MOON & STARS ANIMATION CONTROLLER
========================================
*/
class MoonStarsController {
    constructor() {
        this.moonContainer = Utils.querySelector('.hero-section__moon-container');
        this.starsContainer = Utils.querySelector('.stars-container');
        this.moon = Utils.querySelector('.moon');
        this.stars = [];
        this.isAnimating = false;
        this.animationFrameId = null;
        this.startTime = Date.now();
        
        this.init();
    }

    init() {
        if (!this.moonContainer) {
            this.createMoonContainer();
        }
        
        this.createMoonElements();
        this.createStars();
        this.startAnimations();
        this.handleVisibilityChange();
        this.handleResizeOptimization();
    }

    createMoonContainer() {
        this.moonContainer = Utils.createElement('div', {
            className: 'hero-section__moon-container'
        });
        
        const heroSection = Utils.querySelector('.hero-section');
        if (heroSection) {
            heroSection.appendChild(this.moonContainer);
        }
    }

    createMoonElements() {
        if (!this.moonContainer) return;

        // Create moon glow
        const moonGlow = Utils.createElement('div', {
            className: 'moon-glow'
        });

        // Create moon SVG
        const moonSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        moonSvg.setAttribute('class', 'moon');
        moonSvg.setAttribute('viewBox', '0 0 200 200');
        moonSvg.setAttribute('width', '200');
        moonSvg.setAttribute('height', '200');

        // Moon body (main circle)
        const moonBody = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        moonBody.setAttribute('class', 'moon-body');
        moonBody.setAttribute('cx', '100');
        moonBody.setAttribute('cy', '100');
        moonBody.setAttribute('r', '90');
        moonBody.setAttribute('fill', '#f7fafc');
        moonBody.setAttribute('stroke', '#e2e8f0');
        moonBody.setAttribute('stroke-width', '2');

        // Create craters
        const craters = [
            { cx: 75, cy: 70, r: 12, opacity: 0.3 },
            { cx: 130, cy: 85, r: 8, opacity: 0.4 },
            { cx: 85, cy: 130, r: 15, opacity: 0.35 },
            { cx: 125, cy: 140, r: 6, opacity: 0.45 },
            { cx: 60, cy: 115, r: 10, opacity: 0.3 },
            { cx: 140, cy: 60, r: 7, opacity: 0.4 }
        ];

        craters.forEach((crater, index) => {
            const craterElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            craterElement.setAttribute('class', `moon-crater crater-${index + 1}`);
            craterElement.setAttribute('cx', crater.cx);
            craterElement.setAttribute('cy', crater.cy);
            craterElement.setAttribute('r', crater.r);
            craterElement.setAttribute('fill', '#cbd5e0');
            craterElement.setAttribute('opacity', crater.opacity);
            moonSvg.appendChild(craterElement);
        });

        moonSvg.appendChild(moonBody);

        // Create moon phase overlay
        const phaseOverlay = Utils.createElement('div', {
            className: 'moon-phase-overlay'
        });

        // Assemble moon container
        this.moonContainer.appendChild(moonGlow);
        this.moonContainer.appendChild(moonSvg);
        this.moonContainer.appendChild(phaseOverlay);

        this.moon = moonSvg;
    }

    createStars() {
        if (!this.moonContainer) return;

        this.starsContainer = Utils.createElement('div', {
            className: 'stars-container'
        });

        // Create stars with pastel colors
        for (let i = 0; i < CONFIG.stars.count; i++) {
            const star = Utils.createElement('div', {
                className: `star star--${i + 1}`
            });
            
            // Set CSS custom properties for animation
            star.style.setProperty('--duration', `${CONFIG.stars.twinkleDuration[i]}ms`);
            star.style.setProperty('--delay', `${i * 200}ms`);
            star.style.color = CONFIG.stars.colors[i];
            
            this.starsContainer.appendChild(star);
            this.stars.push(star);
        }

        this.moonContainer.appendChild(this.starsContainer);
    }

    startAnimations() {
        if (!this.supportsAnimations()) {
            return;
        }

        this.isAnimating = true;
        this.animateMoon();
        this.animateStars();
        this.startContinuousAnimation();
    }

    animateMoon() {
        if (!this.moon) return;

        // Enhanced floating animation with easing
        const duration = CONFIG.moon.floatDuration;
        const startTime = Date.now();
        
        const animate = () => {
            if (!this.isAnimating) return;
            
            const elapsed = Date.now() - startTime;
            const progress = (elapsed % duration) / duration;
            
            // Smooth floating motion with multiple sine waves
            const floatY = Math.sin(progress * Math.PI * 2) * 15 + 
                          Math.sin(progress * Math.PI * 4) * 5;
            const floatX = Math.cos(progress * Math.PI * 2) * 8;
            const rotation = Math.sin(progress * Math.PI * 2) * 3;
            
            if (this.moonContainer) {
                this.moonContainer.style.transform = 
                    `translate(${floatX}px, ${floatY}px) rotate(${rotation}deg)`;
            }
            
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    animateStars() {
        this.stars.forEach((star, index) => {
            if (!star) return;
            
            const duration = CONFIG.stars.twinkleDuration[index];
            const delay = index * 200;
            
            setTimeout(() => {
                this.animateIndividualStar(star, duration);
            }, delay);
        });
    }

    animateIndividualStar(star, duration) {
        const startTime = Date.now();
        
        const animate = () => {
            if (!this.isAnimating || !star) return;
            
            const elapsed = Date.now() - startTime;
            const progress = (elapsed % duration) / duration;
            
            // Twinkling effect
            const opacity = 0.3 + Math.sin(progress * Math.PI * 2) * 0.7;
            const scale = 0.8 + Math.sin(progress * Math.PI * 2) * 0.4;
            
            // Subtle movement
            const moveX = Math.sin(progress * Math.PI * 4) * 2;
            const moveY = Math.cos(progress * Math.PI * 6) * 3;
            
            star.style.opacity = opacity;
            star.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    startContinuousAnimation() {
        // Glow pulse animation
        if (this.moonContainer) {
            const moonGlow = this.moonContainer.querySelector('.moon-glow');
            if (moonGlow) {
                this.animateMoonGlow(moonGlow);
            }
        }
    }

    animateMoonGlow(glowElement) {
        const duration = CONFIG.moon.glowPulseDuration;
        const startTime = Date.now();
        
        const animate = () => {
            if (!this.isAnimating || !glowElement) return;
            
            const elapsed = Date.now() - startTime;
            const progress = (elapsed % duration) / duration;
            
            const opacity = 0.6 + Math.sin(progress * Math.PI * 2) * 0.4;
            const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.1;
            
            glowElement.style.opacity = opacity;
            glowElement.style.transform = `scale(${scale})`;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    handleVisibilityChange() {
        Utils.addEventListenerSafe(document, 'visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }

    handleResizeOptimization() {
        const resizeHandler = Utils.debounce(() => {
            this.optimizeForScreenSize();
        }, 250);
        
        Utils.addEventListenerSafe(window, 'resize', resizeHandler);
        this.optimizeForScreenSize(); // Initial call
    }

    optimizeForScreenSize() {
        if (!this.moonContainer) return;
        
        const screenWidth = window.innerWidth;
        
        // Hide on very small screens for performance
        if (screenWidth < 576) {
            this.moonContainer.style.display = 'none';
            this.pauseAnimations();
        } else {
            this.moonContainer.style.display = 'block';
            if (!this.isAnimating) {
                this.resumeAnimations();
            }
            
            // Scale based on screen size
            const scale = screenWidth < 768 ? 0.7 : screenWidth < 992 ? 0.85 : 1;
            this.moonContainer.style.setProperty('--scale', scale);
        }
    }

    supportsAnimations() {
        return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    pauseAnimations() {
        this.isAnimating = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    resumeAnimations() {
        if (!this.supportsAnimations()) return;
        
        this.isAnimating = true;
        this.startAnimations();
    }

    destroy() {
        this.pauseAnimations();
        if (this.moonContainer && this.moonContainer.parentElement) {
            this.moonContainer.parentElement.removeChild(this.moonContainer);
        }
    }
}

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
            contactForm: Utils.querySelector('.contact-form'),
            animateOnScroll: Utils.querySelectorAll('.animate-on-scroll')
        };
    }

    init() {
        this.observeSections();
        this.observeSkillCards();
        this.observePortfolioCards();
        this.observeAboutSection();
        this.observeContactSection();
        this.observeGenericElements();
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

            // Animate progress bar with proper width classes
            const progressBar = card.querySelector('.skill-progress-bar');
            if (progressBar) {
                setTimeout(() => {
                    // Check for width classes that match the CSS
                    const widthClasses = [
                        'skill-progress-bar--95',
                        'skill-progress-bar--92', 
                        'skill-progress-bar--90',
                        'skill-progress-bar--88',
                        'skill-progress-bar--93',
                        'skill-progress-bar--87'
                    ];
                    
                    const hasWidthClass = widthClasses.some(className => 
                        progressBar.classList.contains(className)
                    );
                    
                    if (hasWidthClass) {
                        // The CSS class will handle the width animation
                        progressBar.style.transition = 'width 2s cubic-bezier(0.4, 0, 0.2, 1)';
                    } else {
                        // Fallback: set a default width
                        progressBar.style.width = '85%';
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
            card.classList.add('show');
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
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
                this.elements.aboutImage.classList.add('animate');
                this.elements.aboutImage.style.opacity = '1';
                this.elements.aboutImage.style.transform = 'translateX(0)';
            }, 200);
        }

        if (this.elements.aboutTextContent) {
            setTimeout(() => {
                this.elements.aboutTextContent.classList.add('animate');
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
                this.elements.contactInfo.classList.add('animate');
                this.elements.contactInfo.style.opacity = '1';
                this.elements.contactInfo.style.transform = 'translateX(0)';
            }, 200);
        }

        if (this.elements.contactForm) {
            setTimeout(() => {
                this.elements.contactForm.classList.add('animate');
                this.elements.contactForm.style.opacity = '1';
                this.elements.contactForm.style.transform = 'translateX(0)';
            }, 400);
        }
    }

    observeGenericElements() {
        const genericObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const delay = element.dataset.delay || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animate');
                    }, parseInt(delay));
                    
                    genericObserver.unobserve(element);
                }
            });
        }, this.observerOptions);

        this.elements.animateOnScroll.forEach(element => {
            genericObserver.observe(element);
        });
        
        this.observers.set('generic', genericObserver);
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
            this.addCursor();
            this.type();
        }
    }

    addCursor() {
        // Add blinking cursor styling if not already present
        if (!this.element.classList.contains('typewriter-cursor')) {
            this.element.classList.add('typewriter-cursor');
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

        // Add some randomness to typing speed for more natural feel
        typeSpeed += Math.random() * 50 - 25;

        if (!this.isDeleting && this.currentCharIndex === currentText.length) {
            this.isPaused = true;
            typeSpeed = this.options.pauseDuration;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }

        this.timeoutId = setTimeout(() => this.type(), Math.max(typeSpeed, 50));
    }

    updateTexts(newTexts) {
        this.texts = newTexts;
        this.currentTextIndex = 0;
        this.restart();
    }

    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    restart() {
        this.stop();
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;
        this.type();
    }

    pause() {
        this.stop();
    }

    resume() {
        if (!this.timeoutId) {
            this.type();
        }
    }
}

/*
========================================
ENHANCED THEME CONTROLLER
========================================
*/
class ThemeController {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        this.themeToggle = Utils.querySelector('#themeToggle');
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.transitions = new Map();
        
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme, false);
        this.bindEvents();
        this.watchSystemTheme();
        this.createThemeTransition();
    }

    getStoredTheme() {
        if (Utils.supportsFeature('localStorage')) {
            return localStorage.getItem(CONFIG.theme.storageKey);
        }
        return null;
    }

    getSystemTheme() {
        return this.mediaQuery.matches ? 'dark' : 'light';
    }

    createThemeTransition() {
        // Create a smooth transition for theme changes
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                transition: background-color ${CONFIG.theme.transitionDuration}ms ease,
                           color ${CONFIG.theme.transitionDuration}ms ease,
                           border-color ${CONFIG.theme.transitionDuration}ms ease,
                           box-shadow ${CONFIG.theme.transitionDuration}ms ease !important;
            }
        `;
        style.id = 'theme-transition-style';
        document.head.appendChild(style);
        
        // Remove transition after theme change completes
        setTimeout(() => {
            const transitionStyle = document.getElementById('theme-transition-style');
            if (transitionStyle) {
                transitionStyle.remove();
            }
        }, CONFIG.theme.transitionDuration + 100);
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

        // Add keyboard shortcut for theme toggle (Ctrl/Cmd + Shift + T)
        Utils.addEventListenerSafe(document, 'keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    watchSystemTheme() {
        Utils.addEventListenerSafe(this.mediaQuery, 'change', (e) => {
            if (!this.getStoredTheme()) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    toggleTheme() {
        if (this.themeToggle) {
            this.themeToggle.classList.add('switching');
        }

        this.createThemeTransition();

        setTimeout(() => {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(this.currentTheme);
            
            if (this.themeToggle) {
                this.themeToggle.classList.remove('switching');
            }
        }, CONFIG.theme.transitionDuration / 2);
    }

    applyTheme(theme, animate = true) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        
        if (Utils.supportsFeature('localStorage')) {
            localStorage.setItem(CONFIG.theme.storageKey, theme);
        }
        
        this.updateThemeToggleIcon(theme);
        this.updateMetaThemeColor(theme);
        this.announceThemeChange(theme);
        
        // Dispatch custom event
        const themeChangeEvent = new CustomEvent('themeChanged', {
            detail: { theme, previousTheme: this.currentTheme }
        });
        document.dispatchEvent(themeChangeEvent);
    }

    updateThemeToggleIcon(theme) {
        if (!this.themeToggle) return;

        const moonIcon = this.themeToggle.querySelector('.fa-moon');
        const sunIcon = this.themeToggle.querySelector('.fa-sun');

        if (moonIcon && sunIcon) {
            if (theme === 'dark') {
                moonIcon.classList.add('d-none');
                sunIcon.classList.remove('d-none');
                this.themeToggle.setAttribute('aria-label', 'Switch to light mode');
            } else {
                moonIcon.classList.remove('d-none');
                sunIcon.classList.add('d-none');
                this.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
            }
        }
    }

    updateMetaThemeColor(theme) {
        const metaThemeColor = Utils.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            const color = theme === 'dark' ? '#1A202C' : '#A78BFA';
            metaThemeColor.setAttribute('content', color);
        }
    }

    announceThemeChange(theme) {
        // Announce theme change to screen readers
        const announcement = `Theme changed to ${theme} mode`;
        const liveRegion = Utils.querySelector('#live-region');
        if (liveRegion) {
            liveRegion.textContent = announcement;
            setTimeout(() => liveRegion.textContent = '', 1000);
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            this.applyTheme(theme);
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
        this.navbar = Utils.querySelector('#mainNavbar') || Utils.querySelector('.header__navbar');
        this.navLinks = Utils.querySelectorAll('.nav-link');
        this.sections = Utils.querySelectorAll('section[id]');
        this.lastScrollTop = 0;
        this.isVisible = true;
        this.scrollDirection = 'up';
        this.throttledHandleScroll = Utils.throttle(this.handleScroll.bind(this), CONFIG.performance.throttleLimit);
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateActiveNavLinks();
        this.addScrollIndicator();
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
                    this.closeMobileMenu();
                    
                    // Update active link immediately for better UX
                    this.setActiveLink(link);
                }
            });
        });

        // Handle mobile menu toggle
        const navbarToggler = Utils.querySelector('.navbar-toggler');
        if (navbarToggler) {
            Utils.addEventListenerSafe(navbarToggler, 'click', () => {
                this.handleMobileMenuToggle();
            });
        }
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Determine scroll direction
        this.scrollDirection = scrollTop > this.lastScrollTop ? 'down' : 'up';

        // Add scrolled class
        if (this.navbar) {
            if (scrollTop > CONFIG.navbar.scrollThreshold) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            this.handleNavbarVisibility(scrollTop);
        }

        this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        this.updateActiveNavLinks();
        this.updateScrollIndicator(scrollTop);
    }

    handleNavbarVisibility(scrollTop) {
        if (scrollTop > CONFIG.navbar.hideThreshold) {
            if (this.scrollDirection === 'down' && this.isVisible) {
                // Scrolling down - hide navbar
                this.navbar.classList.add('hidden');
                this.isVisible = false;
            } else if (this.scrollDirection === 'up' && !this.isVisible) {
                // Scrolling up - show navbar
                this.navbar.classList.remove('hidden');
                this.isVisible = true;
            }
        } else if (scrollTop <= CONFIG.navbar.hideThreshold && !this.isVisible) {
            // Near top - always show navbar
            this.navbar.classList.remove('hidden');
            this.isVisible = true;
        }
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

    setActiveLink(activeLink) {
        this.navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    closeMobileMenu() {
        const navbarCollapse = Utils.querySelector('#navbarNav');
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            if (window.bootstrap && bootstrap.Collapse) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            } else {
                // Fallback without Bootstrap
                navbarCollapse.classList.remove('show');
            }
        }
    }

    handleMobileMenuToggle() {
        const navbarCollapse = Utils.querySelector('#navbarNav');
        if (navbarCollapse) {
            const isOpen = navbarCollapse.classList.contains('show');
            
            // Update aria-expanded attribute
            const toggler = Utils.querySelector('.navbar-toggler');
            if (toggler) {
                toggler.setAttribute('aria-expanded', !isOpen);
            }
        }
    }

    addScrollIndicator() {
        // Create scroll progress indicator
        const scrollIndicator = Utils.createElement('div', {
            className: 'scroll-progress-indicator',
            id: 'scrollProgress'
        });
        
        scrollIndicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-light), var(--primary-accent));
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        
        document.body.appendChild(scrollIndicator);
    }

    updateScrollIndicator(scrollTop) {
        const scrollIndicator = Utils.querySelector('#scrollProgress');
        if (scrollIndicator) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            scrollIndicator.style.width = `${Math.min(scrollPercent, 100)}%`;
        }
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
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupInitialState();
    }

    setupInitialState() {
        // Ensure all cards are visible initially
        this.portfolioCards.forEach(card => {
            card.style.display = 'block';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });

        // Set first filter as active if none is active
        if (this.filters.length > 0 && !Utils.querySelector('.portfolio-filter.active')) {
            this.filters[0].classList.add('active');
            this.filters[0].setAttribute('aria-selected', 'true');
        }
    }

    bindEvents() {
        this.filters.forEach(filter => {
            Utils.addEventListenerSafe(filter, 'click', () => {
                if (this.isAnimating) return;
                
                const filterValue = filter.getAttribute('data-filter');
                this.setActiveFilter(filter);
                this.filterPortfolio(filterValue);
            });

            // Keyboard support
            Utils.addEventListenerSafe(filter, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!this.isAnimating) {
                        const filterValue = filter.getAttribute('data-filter');
                        this.setActiveFilter(filter);
                        this.filterPortfolio(filterValue);
                    }
                }
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

    async filterPortfolio(filterValue) {
        if (this.isAnimating || this.currentFilter === filterValue) return;
        
        this.isAnimating = true;
        this.currentFilter = filterValue;

        // Announce filter change to screen readers
        this.announceFilterChange(filterValue);

        // Phase 1: Hide all cards
        await this.hideCards();

        // Phase 2: Show filtered cards
        await this.showFilteredCards(filterValue);

        this.isAnimating = false;
    }

    hideCards() {
        return new Promise(resolve => {
            this.portfolioCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px) scale(0.95)';
                }, index * 50);
            });

            setTimeout(() => {
                this.portfolioCards.forEach(card => {
                    card.style.display = 'none';
                });
                resolve();
            }, this.portfolioCards.length * 50 + 200);
        });
    }

    showFilteredCards(filterValue) {
        return new Promise(resolve => {
            const visibleCards = [];
            
            this.portfolioCards.forEach(card => {
                const cardCategories = card.getAttribute('data-category') || '';
                const shouldShow = filterValue === 'all' || cardCategories.includes(filterValue);
                
                if (shouldShow) {
                    visibleCards.push(card);
                    card.style.display = 'block';
                }
            });

            // Animate visible cards back in
            visibleCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                    card.classList.add('show');
                }, index * 100);
            });

            setTimeout(resolve, visibleCards.length * 100 + 200);
        });
    }

    announceFilterChange(filterValue) {
        const filterText = filterValue === 'all' ? 'all projects' : filterValue;
        const announcement = `Showing ${filterText}`;
        
        const liveRegion = Utils.querySelector('#live-region');
        if (liveRegion) {
            liveRegion.textContent = announcement;
            setTimeout(() => liveRegion.textContent = '', 1000);
        }
    }

    // Public method to get current filter
    getCurrentFilter() {
        return this.currentFilter;
    }

    // Public method to set filter programmatically
    setFilter(filterValue) {
        const targetFilter = Utils.querySelector(`[data-filter="${filterValue}"]`);
        if (targetFilter) {
            this.setActiveFilter(targetFilter);
            this.filterPortfolio(filterValue);
        }
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
            name: { required: true, minLength: 2, maxLength: 50 },
            email: { required: true, email: true, maxLength: 100 },
            subject: { maxLength: 100 },
            message: { required: true, minLength: 10, maxLength: 1000 }
        };

        this.init();
    }

    init() {
        if (this.form) {
            this.bindFormEvents();
            this.setupValidation();
            this.setupFormAccessibility();
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

        // Character count for textarea
        const messageField = this.form.querySelector('#message');
        if (messageField) {
            this.addCharacterCounter(messageField);
        }
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

    setupFormAccessibility() {
        // Add ARIA attributes for better accessibility
        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            const label = group.querySelector('label');
            const input = group.querySelector('.form-control');
            
            if (label && input) {
                const labelId = label.id || Utils.generateId();
                label.id = labelId;
                input.setAttribute('aria-labelledby', labelId);
                
                if (this.validationRules[input.name]?.required) {
                    input.setAttribute('aria-required', 'true');
                }
            }
        });
    }

    addCharacterCounter(textarea) {
        const maxLength = this.validationRules[textarea.name]?.maxLength || 1000;
        
        const counter = Utils.createElement('div', {
            className: 'character-counter',
            'aria-live': 'polite'
        });
        
        counter.style.cssText = `
            text-align: right;
            font-size: 0.875rem;
            color: var(--text-muted);
            margin-top: 0.25rem;
        `;
        
        const updateCounter = () => {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${remaining} characters remaining`;
            
            if (remaining < 50) {
                counter.style.color = '#ef4444';
            } else if (remaining < 100) {
                counter.style.color = '#f59e0b';
            } else {
                counter.style.color = 'var(--text-muted)';
            }
        };
        
        Utils.addEventListenerSafe(textarea, 'input', updateCounter);
        updateCounter();
        
        textarea.parentNode.appendChild(counter);
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

        // Length validations
        if (rules.minLength && value && value.length < rules.minLength) {
            this.showFieldError(field, `Minimum ${rules.minLength} characters required`);
            return false;
        }

        if (rules.maxLength && value && value.length > rules.maxLength) {
            this.showFieldError(field, `Maximum ${rules.maxLength} characters allowed`);
            return false;
        }

        // Name validation (letters, spaces, hyphens, apostrophes)
        if (fieldName === 'name' && value && !/^[a-zA-Z\s\-']+$/.test(value)) {
            this.showFieldError(field, 'Name can only contain letters, spaces, hyphens, and apostrophes');
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
        return emailRegex.test(email) && email.length <= 100;
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
        });
        
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
        field.parentNode.appendChild(errorDiv);

        // Focus on field if it's not already focused
        if (document.activeElement !== field) {
            field.focus();
        }
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
        const requiredFields = this.form.querySelectorAll('.form-control[required], .form-control[name]');
        let isValid = true;
        let firstErrorField = null;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
                if (!firstErrorField) {
                    firstErrorField = field;
                }
            }
        });

        if (!isValid && firstErrorField) {
            this.scrollToFirstError(firstErrorField);
        }

        return isValid;
    }

    async handleSubmit() {
        if (!this.validateForm()) {
            return;
        }

        this.setLoadingState(true);

        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);
            
            // Clean and sanitize data
            Object.keys(data).forEach(key => {
                data[key] = data[key].trim();
            });
            
            await this.submitForm(data);
            
            this.showSuccessMessage();
            this.form.reset();
            this.clearAllErrors();
            
            // Focus on first field after reset
            const firstField = this.form.querySelector('.form-control');
            if (firstField) {
                firstField.focus();
            }
            
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
            emailInput.focus();
            return;
        }

        const submitButton = this.newsletterForm.querySelector('.newsletter-button');
        const originalHTML = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        submitButton.disabled = true;

        try {
            await this.submitNewsletter({ email });
            
            this.showNewsletterMessage('Thank you for subscribing!', 'success');
            emailInput.value = '';
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showNewsletterMessage('Subscription failed. Please try again.', 'error');
        } finally {
            submitButton.innerHTML = originalHTML;
            submitButton.disabled = false;
        }
    }

    async submitForm(data) {
        // Simulate API call - replace with actual endpoint
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure (90% success rate for demo)
                if (Math.random() > 0.1) {
                    resolve({ success: true, message: 'Message sent successfully!' });
                } else {
                    reject(new Error('Network error'));
                }
            }, 2000);
        });
    }

    async submitNewsletter(data) {
        // Simulate API call - replace with actual endpoint
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure (95% success rate for demo)
                if (Math.random() > 0.05) {
                    resolve({ success: true, message: 'Subscribed successfully!' });
                } else {
                    reject(new Error('Network error'));
                }
            }, 1000);
        });
    }

    setLoadingState(isLoading) {
        if (!this.submitButton) return;

        if (isLoading) {
            this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin icon-spacing"></i>Sending...';
            this.submitButton.disabled = true;
            this.submitButton.setAttribute('aria-busy', 'true');
            this.form.classList.add('loading');
        } else {
            this.submitButton.innerHTML = this.originalButtonText;
            this.submitButton.disabled = false;
            this.submitButton.setAttribute('aria-busy', 'false');
            this.form.classList.remove('loading');
        }
    }

    scrollToFirstError(firstErrorField = null) {
        const errorField = firstErrorField || this.form.querySelector('.form-control.error');
        if (errorField) {
            errorField.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            setTimeout(() => errorField.focus(), 500);
        }
    }

    clearAllErrors() {
        const errorFields = this.form.querySelectorAll('.form-control.error');
        errorFields.forEach(field => this.clearFieldError(field));
    }

    showSuccessMessage() {
        const existingMessage = this.form.querySelector('.alert');
        if (existingMessage) {
            existingMessage.remove();
        }

        const successDiv = Utils.createElement('div', {
            className: 'alert alert-success',
            'aria-live': 'polite',
            role: 'status'
        });
        
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <strong>Success!</strong> Your message has been sent successfully. 
            I'll get back to you as soon as possible.
        `;
        
        this.form.appendChild(successDiv);

        // Smooth scroll to message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        setTimeout(() => successDiv.remove(), 8000);
    }

    showErrorMessage(message) {
        const existingMessage = this.form.querySelector('.alert');
        if (existingMessage) {
            existingMessage.remove();
        }

        const errorDiv = Utils.createElement('div', {
            className: 'alert alert-danger',
            'aria-live': 'assertive',
            role: 'alert'
        });
        
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <strong>Error:</strong> ${message}
        `;
        
        this.form.appendChild(errorDiv);

        // Smooth scroll to message
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        setTimeout(() => errorDiv.remove(), 8000);
    }

    showNewsletterMessage(message, type) {
        const existingMessage = this.newsletterForm.querySelector('.newsletter-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = Utils.createElement('div', {
            className: 'newsletter-message',
            'aria-live': type === 'error' ? 'assertive' : 'polite',
            role: type === 'error' ? 'alert' : 'status'
        });
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        const bgColor = type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        const textColor = type === 'success' ? '#10b981' : '#ef4444';
        
        messageDiv.style.cssText = `
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: ${bgColor};
            color: ${textColor};
            border: 1px solid ${textColor}33;
        `;

        messageDiv.innerHTML = `<i class="${icon}"></i>${message}`;

        this.newsletterForm.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 5000);
    }
}

/*
========================================
PERFORMANCE OPTIMIZER
========================================
*/
class PerformanceOptimizer {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.init();
    }

    init() {
        this.optimizeScrolling();
        this.lazyLoadImages();
        this.preloadCriticalAssets();
        this.optimizeAnimations();
        this.monitorPerformance();
        this.setupIntersectionObservers();
    }

    optimizeScrolling() {
        // Use passive event listeners for better scroll performance
        let supportsPassive = false;
        try {
            window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
                get: function() { supportsPassive = true; }
            }));
        } catch(e) {}

        this.supportsPassive = supportsPassive;
        const scrollOptions = supportsPassive ? { passive: true } : false;
        
        // Add passive listeners for touch events
        Utils.addEventListenerSafe(document, 'touchstart', function() {}, scrollOptions);
        Utils.addEventListenerSafe(document, 'touchmove', function() {}, scrollOptions);
        Utils.addEventListenerSafe(document, 'wheel', function() {}, scrollOptions);
    }

    lazyLoadImages() {
        if (!Utils.supportsFeature('intersectionObserver')) {
            // Fallback for browsers without IntersectionObserver
            this.loadAllImages();
            return;
        }

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all images with data-src
        Utils.querySelectorAll('img[data-src]').forEach(img => {
            // Add loading placeholder
            img.style.backgroundColor = 'var(--background-secondary)';
            img.style.minHeight = '200px';
            imageObserver.observe(img);
        });

        this.observers.set('images', imageObserver);
    }

    loadImage(img) {
        if (!img.dataset.src) return;

        // Create a new image to preload
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            img.style.backgroundColor = '';
            img.style.minHeight = '';
            
            // Fade in animation
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            
            requestAnimationFrame(() => {
                img.style.opacity = '1';
            });
        };
        
        imageLoader.onerror = () => {
            img.classList.add('lazy-error');
            img.alt = 'Failed to load image';
        };
        
        imageLoader.src = img.dataset.src;
    }

    loadAllImages() {
        // Fallback for browsers without IntersectionObserver
        Utils.querySelectorAll('img[data-src]').forEach(img => {
            this.loadImage(img);
        });
    }

    preloadCriticalAssets() {
        const criticalAssets = [
            // Add your critical assets here
            // '/assets/images/hero-bg.jpg',
            // '/assets/images/about-image.jpg'
        ];

        criticalAssets.forEach(asset => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = this.getAssetType(asset);
            link.href = asset;
            link.crossOrigin = 'anonymous';
            
            // Only add if not already present
            if (!document.querySelector(`link[href="${asset}"]`)) {
                document.head.appendChild(link);
            }
        });
    }

    getAssetType(url) {
        if (url.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i)) return 'image';
        if (url.match(/\.css$/i)) return 'style';
        if (url.match(/\.js$/i)) return 'script';
        if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
        return 'fetch';
    }

    optimizeAnimations() {
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

        // Optimize animations based on device capabilities
        this.optimizeForDevice();
    }

    optimizeForDevice() {
        const isLowEndDevice = this.detectLowEndDevice();
        
        if (isLowEndDevice) {
            document.body.classList.add('low-end-device');
            this.reduceAnimationComplexity();
        }
    }

    detectLowEndDevice() {
        // Simple heuristics for low-end device detection
        const memory = navigator.deviceMemory;
        const cores = navigator.hardwareConcurrency;
        const connection = navigator.connection;
        
        if (memory && memory <= 2) return true;
        if (cores && cores <= 2) return true;
        if (connection && connection.effectiveType === 'slow-2g') return true;
        
        return false;
    }

    reduceAnimationComplexity() {
        const style = document.createElement('style');
        style.id = 'low-end-optimizations';
        style.textContent = `
            .low-end-device * {
                animation-duration: 0.3s !important;
                transition-duration: 0.3s !important;
            }
            .low-end-device .hero-section__moon-container,
            .low-end-device .stars-container {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
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

    setupIntersectionObservers() {
        // Optimize expensive operations with intersection observers
        if (!Utils.supportsFeature('intersectionObserver')) return;

        const expensiveElementsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-viewport');
                } else {
                    entry.target.classList.remove('in-viewport');
                }
            });
        }, { threshold: 0.1 });

        // Observe elements that might have expensive CSS effects
        Utils.querySelectorAll('.glass-card, .skill-card, .portfolio-card').forEach(el => {
            expensiveElementsObserver.observe(el);
        });

        this.observers.set('expensive', expensiveElementsObserver);
    }

    monitorPerformance() {
        if (!window.performance) return;

        // Monitor key performance metrics
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                this.recordMetric(entry.entryType, entry);
            });
        });

        // Observe different types of performance entries
        try {
            observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
        } catch (e) {
            // Fallback for older browsers
            setTimeout(() => {
                this.recordNavigationMetrics();
            }, 1000);
        }
    }

    recordMetric(type, entry) {
        if (!this.metrics.has(type)) {
            this.metrics.set(type, []);
        }
        
        this.metrics.get(type).push({
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            timestamp: Date.now()
        });

        // Keep only recent metrics (last 100)
        const typeMetrics = this.metrics.get(type);
        if (typeMetrics.length > 100) {
            typeMetrics.splice(0, typeMetrics.length - 100);
        }
    }

    recordNavigationMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.recordMetric('navigation', navigation);
        }
    }

    getPerformanceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: {},
            recommendations: []
        };

        this.metrics.forEach((entries, type) => {
            report.metrics[type] = {
                count: entries.length,
                latest: entries[entries.length - 1] || null
            };
        });

        // Add recommendations based on metrics
        this.generateRecommendations(report);

        return report;
    }

    generateRecommendations(report) {
        const navigation = report.metrics.navigation?.latest;
        
        if (navigation) {
            if (navigation.duration > 3000) {
                report.recommendations.push('Consider optimizing page load time');
            }
            
            if (navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart > 1000) {
                report.recommendations.push('DOM processing time is high');
            }
        }
    }

    cleanup() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        this.metrics.clear();
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
        this.announcements = [];
        this.init();
    }

    init() {
        this.enhanceKeyboardNavigation();
        this.addSkipLinks();
        this.improveAriaLabels();
        this.handleFocusManagement();
        this.announceRouteChanges();
        this.setupLiveRegions();
        this.enhanceFormAccessibility();
        this.addKeyboardShortcuts();
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

        // Handle focus trapping
        this.setupFocusTrapping();
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
            case 'ArrowDown':
            case 'ArrowUp':
                this.handleArrowKeys(e);
                break;
        }
    }

    handleTabNavigation(e) {
        // Enhanced tab trapping for modals and dropdowns
        const activeModal = Utils.querySelector('.modal.show');
        const activeDropdown = Utils.querySelector('.dropdown.show');
        const activeElement = activeModal || activeDropdown;
        
        if (activeElement) {
            this.trapFocus(activeElement, e);
        }

        // Skip hidden elements
        this.skipHiddenElements(e);
    }

    skipHiddenElements(e) {
        const focusableEls = Utils.querySelectorAll(this.focusableElements);
        const visibleFocusableEls = focusableEls.filter(el => {
            return el.offsetParent !== null && 
                   !el.hasAttribute('disabled') && 
                   !el.getAttribute('aria-hidden');
        });

        // If current target is hidden, move to next visible element
        const currentIndex = visibleFocusableEls.indexOf(e.target);
        if (currentIndex === -1 && visibleFocusableEls.length > 0) {
            e.preventDefault();
            visibleFocusableEls[0].focus();
        }
    }

    handleEscapeKey(e) {
        // Close any open modals, dropdowns, or menus
        const openElements = Utils.querySelectorAll('.modal.show, .dropdown.show, .navbar-collapse.show');
        openElements.forEach(element => {
            this.closeElement(element);
        });

        // Clear any error messages
        const errorMessages = Utils.querySelectorAll('.error-message, .alert');
        errorMessages.forEach(msg => {
            if (msg.parentElement) {
                msg.remove();
            }
        });
    }

    closeElement(element) {
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
    }

    handleActivationKeys(e) {
        const target = e.target;
        
        // Handle custom interactive elements
        if (target.getAttribute('role') === 'button' && !target.disabled) {
            e.preventDefault();
            target.click();
        }

        // Handle filter buttons
        if (target.classList.contains('portfolio-filter')) {
            e.preventDefault();
            target.click();
        }
    }

    handleArrowKeys(e) {
        // Handle arrow navigation for filter buttons
        if (e.target.classList.contains('portfolio-filter')) {
            e.preventDefault();
            const filters = Utils.querySelectorAll('.portfolio-filter');
            const currentIndex = Array.from(filters).indexOf(e.target);
            
            let nextIndex;
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                nextIndex = (currentIndex + 1) % filters.length;
            } else {
                nextIndex = (currentIndex - 1 + filters.length) % filters.length;
            }
            
            filters[nextIndex].focus();
        }
    }

    trapFocus(container, e) {
        const focusableEls = container.querySelectorAll(this.focusableElements);
        const visibleFocusableEls = Array.from(focusableEls).filter(el => 
            el.offsetParent !== null && !el.hasAttribute('disabled')
        );
        
        if (visibleFocusableEls.length === 0) return;
        
        const firstFocusableEl = visibleFocusableEls[0];
        const lastFocusableEl = visibleFocusableEls[visibleFocusableEls.length - 1];

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

    setupFocusTrapping() {
        // Automatically trap focus when modals open
        const modals = Utils.querySelectorAll('.modal');
        modals.forEach(modal => {
            Utils.addEventListenerSafe(modal, 'shown.bs.modal', () => {
                const firstFocusable = modal.querySelector(this.focusableElements);
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            });
        });
    }

    addSkipLinks() {
        // Enhance existing skip links
        const skipLinks = Utils.querySelectorAll('.skip-link');
        skipLinks.forEach(link => {
            Utils.addEventListenerSafe(link, 'click', (e) => {
                e.preventDefault();
                const target = Utils.querySelector(link.getAttribute('href'));
                if (target) {
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                    
                    // Remove tabindex after focus
                    setTimeout(() => target.removeAttribute('tabindex'), 100);
                }
            });
        });

        // Add more skip links if needed
        this.addAdditionalSkipLinks();
    }

    addAdditionalSkipLinks() {
        const mainContent = Utils.querySelector('main') || Utils.querySelector('#main');
        if (!mainContent) return;

        const existingSkipLink = Utils.querySelector('.skip-link[href="#main"]');
        if (existingSkipLink) return;

        const skipLink = Utils.createElement('a', {
            href: '#main',
            className: 'skip-link',
            'aria-label': 'Skip to main content'
        }, 'Skip to main content');

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    improveAriaLabels() {
        // Enhance interactive elements with proper ARIA labels
        const interactiveElements = Utils.querySelectorAll('button, a, input, textarea, select');
        
        interactiveElements.forEach(element => {
            this.enhanceElementAccessibility(element);
        });

        // Add ARIA landmarks
        this.addAriaLandmarks();
        
        // Enhance form elements
        this.enhanceFormElements();
    }

    enhanceElementAccessibility(element) {
        // Skip if already has proper labeling
        if (element.getAttribute('aria-label') || 
            element.getAttribute('aria-labelledby') || 
            element.getAttribute('aria-describedby')) {
            return;
        }

        const text = element.textContent?.trim() || 
                    element.value?.trim() || 
                    element.placeholder?.trim() || 
                    element.title?.trim() ||
                    element.alt?.trim();

        if (text) {
            element.setAttribute('aria-label', text);
        }

        // Add role if missing
        if (element.tagName === 'DIV' && element.onclick) {
            element.setAttribute('role', 'button');
            element.setAttribute('tabindex', '0');
        }
    }

    addAriaLandmarks() {
        // Add landmark roles to major sections
        const landmarks = [
            { selector: 'header, .header', role: 'banner' },
            { selector: 'nav, .nav', role: 'navigation' },
            { selector: 'main, .main', role: 'main' },
            { selector: 'aside, .sidebar', role: 'complementary' },
            { selector: 'footer, .footer', role: 'contentinfo' }
        ];

        landmarks.forEach(({ selector, role }) => {
            const elements = Utils.querySelectorAll(selector);
            elements.forEach(el => {
                if (!el.getAttribute('role')) {
                    el.setAttribute('role', role);
                }
            });
        });
    }

    enhanceFormElements() {
        const forms = Utils.querySelectorAll('form');
        forms.forEach(form => {
            // Add form labels and descriptions
            const formGroups = form.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                const label = group.querySelector('label');
                const input = group.querySelector('input, textarea, select');
                
                if (label && input) {
                    const labelId = label.id || `label-${Utils.generateId()}`;
                    label.id = labelId;
                    input.setAttribute('aria-labelledby', labelId);
                }
            });
        });
    }

    setupLiveRegions() {
        // Add live regions for announcements
        if (!Utils.querySelector('#live-region')) {
            const liveRegion = Utils.createElement('div', {
                id: 'live-region',
                'aria-live': 'polite',
                'aria-atomic': 'true',
                className: 'visually-hidden'
            });
            
            document.body.appendChild(liveRegion);
        }

        // Add assertive live region for urgent announcements
        if (!Utils.querySelector('#live-region-assertive')) {
            const assertiveLiveRegion = Utils.createElement('div', {
                id: 'live-region-assertive',
                'aria-live': 'assertive',
                'aria-atomic': 'true',
                className: 'visually-hidden'
            });
            
            document.body.appendChild(assertiveLiveRegion);
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
                        this.focusSection(target);
                    }
                }, 1000); // Wait for smooth scroll to complete
            });
        });
    }

    focusSection(section) {
        const heading = section.querySelector('h1, h2, h3, .section-title');
        if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus();
            
            // Announce section change
            this.announce(`Navigated to ${heading.textContent}`);
            
            // Remove tabindex after focus to restore natural tab order
            setTimeout(() => heading.removeAttribute('tabindex'), 100);
        }
    }

    announceRouteChanges() {
        // Announce section changes to screen readers
        if (!Utils.supportsFeature('intersectionObserver')) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    const sectionTitle = entry.target.querySelector('h1, h2, .section-title');
                    if (sectionTitle) {
                        const announcement = `Viewing ${sectionTitle.textContent} section`;
                        this.announce(announcement, false); // Use polite announcement
                    }
                }
            });
        }, { threshold: 0.5 });

        Utils.querySelectorAll('section[id]').forEach(section => {
            observer.observe(section);
        });
    }

    enhanceFormAccessibility() {
        // Add better error announcements
        const forms = Utils.querySelectorAll('form');
        forms.forEach(form => {
            Utils.addEventListenerSafe(form, 'submit', (e) => {
                const errors = form.querySelectorAll('.error-message');
                if (errors.length > 0) {
                    const errorCount = errors.length;
                    const announcement = `Form has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please review and correct.`;
                    this.announce(announcement, true); // Use assertive announcement
                }
            });
        });
    }

    addKeyboardShortcuts() {
        const shortcuts = [
            { key: 'h', description: 'Go to home section', action: () => this.navigateToSection('#hero') },
            { key: 'a', description: 'Go to about section', action: () => this.navigateToSection('#about') },
            { key: 's', description: 'Go to skills section', action: () => this.navigateToSection('#skills') },
            { key: 'p', description: 'Go to portfolio section', action: () => this.navigateToSection('#portfolio') },
            { key: 'c', description: 'Go to contact section', action: () => this.navigateToSection('#contact') },
            { key: '/', description: 'Show keyboard shortcuts', action: () => this.showKeyboardShortcuts() }
        ];

        Utils.addEventListenerSafe(document, 'keydown', (e) => {
            // Only trigger if Alt key is pressed (to avoid conflicts)
            if (!e.altKey || e.ctrlKey || e.metaKey) return;

            const shortcut = shortcuts.find(s => s.key === e.key.toLowerCase());
            if (shortcut) {
                e.preventDefault();
                shortcut.action();
            }
        });

        // Store shortcuts for help display
        this.keyboardShortcuts = shortcuts;
    }

    navigateToSection(sectionId) {
        const section = Utils.querySelector(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => this.focusSection(section), 1000);
        }
    }

    showKeyboardShortcuts() {
        const existing = Utils.querySelector('#keyboard-shortcuts-modal');
        if (existing) {
            existing.remove();
            return;
        }

        const modal = Utils.createElement('div', {
            id: 'keyboard-shortcuts-modal',
            className: 'keyboard-shortcuts-modal',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'shortcuts-title'
        });

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        const content = Utils.createElement('div', {
            className: 'shortcuts-content'
        });

        content.style.cssText = `
            background: var(--background-card);
            padding: 2rem;
            border-radius: 1rem;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        const title = Utils.createElement('h2', {
            id: 'shortcuts-title'
        }, 'Keyboard Shortcuts');

        const shortcutsList = Utils.createElement('ul', {
            className: 'shortcuts-list'
        });

        shortcutsList.style.cssText = `
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        `;

        this.keyboardShortcuts.forEach(shortcut => {
            const item = Utils.createElement('li');
            item.style.cssText = `
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid var(--border-color);
            `;
            
            item.innerHTML = `
                <span>${shortcut.description}</span>
                <kbd style="background: var(--background-secondary); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">Alt + ${shortcut.key.toUpperCase()}</kbd>
            `;
            
            shortcutsList.appendChild(item);
        });

        const closeButton = Utils.createElement('button', {
            type: 'button',
            className: 'button button--secondary',
            'aria-label': 'Close keyboard shortcuts dialog'
        }, 'Close');

        closeButton.style.cssText = `
            margin-top: 1rem;
            width: 100%;
        `;

        Utils.addEventListenerSafe(closeButton, 'click', () => {
            modal.remove();
        });

        Utils.addEventListenerSafe(modal, 'click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        Utils.addEventListenerSafe(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                modal.remove();
            }
        });

        content.appendChild(title);
        content.appendChild(shortcutsList);
        content.appendChild(closeButton);
        modal.appendChild(content);
        document.body.appendChild(modal);

        // Focus the close button
        closeButton.focus();
    }

    announce(message, assertive = false) {
        const liveRegionId = assertive ? '#live-region-assertive' : '#live-region';
        const liveRegion = Utils.querySelector(liveRegionId);
        
        if (liveRegion) {
            // Clear previous announcement
            liveRegion.textContent = '';
            
            // Add new announcement after a brief delay
            setTimeout(() => {
                liveRegion.textContent = message;
                
                // Clear after announcement to allow repeat announcements
                setTimeout(() => {
                    liveRegion.textContent = '';
                }, 1000);
            }, 100);
        }

        // Store announcement for debugging
        this.announcements.push({
            message,
            assertive,
            timestamp: Date.now()
        });

        // Keep only recent announcements
        if (this.announcements.length > 20) {
            this.announcements.splice(0, this.announcements.length - 20);
        }
    }

    getRecentAnnouncements() {
        return this.announcements.slice(-10);
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
        this.timelines = new Map();
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
                } else {
                    console.warn('GSAP not loaded, using CSS animations fallback');
                }
            });
        }
    }

    setupGSAP() {
        this.isGSAPReady = true;
        
        // Register ScrollTrigger plugin
        if (window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
            
            // Refresh ScrollTrigger on resize
            Utils.addEventListenerSafe(window, 'resize', 
                Utils.debounce(() => ScrollTrigger.refresh(), 250)
            );
        }

        this.initHeroAnimations();
        this.initScrollAnimations();
        this.initHoverAnimations();
        this.initLoadingAnimations();
    }

    initHeroAnimations() {
        if (!this.isGSAPReady) return;

        const tl = gsap.timeline({ 
            delay: 0.5,
            onComplete: () => {
                // Dispatch event when hero animations complete
                document.dispatchEvent(new CustomEvent('heroAnimationsComplete'));
            }
        });

        // Animate hero elements with stagger
        tl.from('.hero-title', {
            duration: 1.2,
            y: 60,
            opacity: 0,
            ease: 'power3.out'
        })
        .from('#typewriter', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power2.out'
        }, '-=0.6')
        .from('.hero-description', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power2.out'
        }, '-=0.5')
        .from('.hero-section__cta .button', {
            duration: 0.7,
            y: 25,
            opacity: 0,
            stagger: 0.15,
            ease: 'back.out(1.4)'
        }, '-=0.4')
        .from('.hero-section__social-links li', {
            duration: 0.6,
            scale: 0,
            opacity: 0,
            stagger: 0.08,
            ease: 'back.out(1.7)',
            transformOrigin: 'center'
        }, '-=0.3')
        .from('.scroll-indicator', {
            duration: 0.8,
            y: 20,
            opacity: 0,
            ease: 'power2.out'
        }, '-=0.2');

        this.timelines.set('hero', tl);

        // Animate geometric shapes with continuous rotation
        this.animateGeometricShapes();
    }

    animateGeometricShapes() {
        if (!this.isGSAPReady) return;

        const shapes = Utils.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const duration = 20 + index * 5; // Different speeds for each shape
            const direction = index % 2 === 0 ? 360 : -360;
            
            gsap.to(shape, {
                rotation: direction,
                duration: duration,
                repeat: -1,
                ease: 'none'
            });

            // Add floating motion
            gsap.to(shape, {
                y: '+=20',
                duration: 3 + index,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        });
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
                scrub: 1
            }
        });

        // Skills section animations
        this.animateSkillsSection();
        
        // Portfolio section animations
        this.animatePortfolioSection();
        
        // About section animations
        this.animateAboutSection();
        
        // Contact section animations
        this.animateContactSection();

        // Add scroll-based text reveals
        this.addScrollTextReveals();
    }

    animateSkillsSection() {
        const skillCards = Utils.querySelectorAll('.skill-card');
        
        gsap.fromTo(skillCards, {
            y: 80,
            opacity: 0,
            scale: 0.8,
            rotationX: 15
        }, {
            y: 0,
            opacity: 1,
            scale: 1,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.4)',
            scrollTrigger: {
                trigger: '.skills-grid',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Animate progress bars separately
        const progressBars = Utils.querySelectorAll('.skill-progress-bar');
        progressBars.forEach(bar => {
            const widthClass = Array.from(bar.classList)
                .find(cls => cls.startsWith('skill-progress-bar--'));
            
            if (widthClass) {
                const targetWidth = widthClass.match(/(\d+)$/)?.[1] || 85;
                
                gsap.fromTo(bar, {
                    width: '0%'
                }, {
                    width: `${targetWidth}%`,
                    duration: 1.5,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: bar.closest('.skill-card'),
                        start: 'top 70%',
                        toggleActions: 'play none none reverse'
                    }
                });
            }
        });
    }

    animatePortfolioSection() {
        const portfolioCards = Utils.querySelectorAll('.portfolio-card');
        
        gsap.fromTo(portfolioCards, {
            y: 60,
            opacity: 0,
            rotationY: 15,
            scale: 0.9
        }, {
            y: 0,
            opacity: 1,
            rotationY: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.portfolio-grid',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    animateAboutSection() {
        const aboutImage = Utils.querySelector('.about-image');
        const aboutTextContent = Utils.querySelector('.about-text-content');
        
        if (aboutImage) {
            gsap.fromTo(aboutImage, {
                x: -80,
                opacity: 0,
                scale: 0.8
            }, {
                x: 0,
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.about-section',
                    start: 'top 70%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
        
        if (aboutTextContent) {
            gsap.fromTo(aboutTextContent, {
                x: 80,
                opacity: 0
            }, {
                x: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.about-section',
                    start: 'top 70%',
                    toggleActions: 'play none none reverse'
                }
            });
        }

        // Animate highlight items
        const highlights = Utils.querySelectorAll('.highlight-item');
        gsap.fromTo(highlights, {
            x: 30,
            opacity: 0
        }, {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.about-highlights',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    animateContactSection() {
        const contactInfo = Utils.querySelector('.contact-info');
        const contactForm = Utils.querySelector('.contact-form');
        
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        if (contactInfo) {
            tl.fromTo(contactInfo, {
                x: -60,
                opacity: 0
            }, {
                x: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power3.out'
            });
        }

        if (contactForm) {
            tl.fromTo(contactForm, {
                x: 60,
                opacity: 0
            }, {
                x: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.4');
        }
    }

    addScrollTextReveals() {
        const textElements = Utils.querySelectorAll('.section-title, .section-subtitle, h1, h2, h3');
        
        textElements.forEach(element => {
            gsap.fromTo(element, {
                y: 30,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    }

    initHoverAnimations() {
        if (!this.isGSAPReady) return;

        // Enhanced button hover animations
        this.setupButtonHoverAnimations();
        
        // Card hover effects
        this.setupCardHoverAnimations();
        
        // Social link hover effects
        this.setupSocialHoverAnimations();
    }

    setupButtonHoverAnimations() {
        Utils.querySelectorAll('.button').forEach(button => {
            const hoverTl = gsap.timeline({ paused: true });
            
            hoverTl.to(button, {
                scale: 1.05,
                y: -2,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                duration: 0.3,
                ease: 'power2.out'
            });

            Utils.addEventListenerSafe(button, 'mouseenter', () => hoverTl.play());
            Utils.addEventListenerSafe(button, 'mouseleave', () => hoverTl.reverse());
        });
    }

    setupCardHoverAnimations() {
        // Skill card hover effects
        Utils.querySelectorAll('.skill-card').forEach(card => {
            const icon = card.querySelector('i');
            const hoverTl = gsap.timeline({ paused: true });
            
            hoverTl.to(card, {
                y: -10,
                scale: 1.02,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                duration: 0.3,
                ease: 'power2.out'
            });

            if (icon) {
                hoverTl.to(icon, {
                    scale: 1.1,
                    rotation: 5,
                    duration: 0.3,
                    ease: 'power2.out'
                }, 0);
            }

            Utils.addEventListenerSafe(card, 'mouseenter', () => hoverTl.play());
            Utils.addEventListenerSafe(card, 'mouseleave', () => hoverTl.reverse());
        });

        // Portfolio card 3D hover effects
        Utils.querySelectorAll('.portfolio-card').forEach(card => {
            let hoverTl = null;

            Utils.addEventListenerSafe(card, 'mousemove', (e) => {
                if (hoverTl) hoverTl.kill();

                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                                const rotateX = (y - centerY) / 8;
                const rotateY = (centerX - x) / 8;

                hoverTl = gsap.to(card, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    scale: 1.05,
                    z: 50,
                    duration: 0.3,
                    ease: 'power2.out',
                    transformPerspective: 1000,
                    transformOrigin: 'center'
                });
            });

            Utils.addEventListenerSafe(card, 'mouseleave', () => {
                if (hoverTl) hoverTl.kill();
                
                gsap.to(card, {
                    rotationX: 0,
                    rotationY: 0,
                    scale: 1,
                    z: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });
        });
    }

    setupSocialHoverAnimations() {
        Utils.querySelectorAll('.social-link').forEach(link => {
            const icon = link.querySelector('i');
            const hoverTl = gsap.timeline({ paused: true });
            
            hoverTl.to(link, {
                scale: 1.2,
                duration: 0.3,
                ease: 'back.out(1.7)'
            })
            .to(icon, {
                rotation: 360,
                duration: 0.6,
                ease: 'power2.inOut'
            }, 0);

            Utils.addEventListenerSafe(link, 'mouseenter', () => hoverTl.restart());
            Utils.addEventListenerSafe(link, 'mouseleave', () => {
                gsap.to([link, icon], {
                    scale: 1,
                    rotation: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });
    }

    initLoadingAnimations() {
        if (!this.isGSAPReady) return;

        // Page load animation sequence
        const loadingTl = gsap.timeline({
            onComplete: () => {
                document.body.classList.add('loaded');
                // Start other animations after loading completes
                this.startDelayedAnimations();
            }
        });

        // Hide all content initially
        gsap.set('main > *:not(.hero-section)', { opacity: 0, y: 30 });

        // Animate loading sequence
        loadingTl.to('.loading-overlay', {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out'
        })
        .from('.navbar', {
            y: -100,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out'
        }, '-=0.4')
        .to('main > *:not(.hero-section)', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        }, '-=0.2');

        this.timelines.set('loading', loadingTl);
    }

    startDelayedAnimations() {
        // Start animations that should happen after page load
        this.animateScrollIndicator();
        this.animateFloatingElements();
    }

    animateScrollIndicator() {
        const scrollIndicator = Utils.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            gsap.to(scrollIndicator, {
                y: 10,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }
    }

    animateFloatingElements() {
        const floatingElements = Utils.querySelectorAll('.floating-element');
        floatingElements.forEach((element, index) => {
            gsap.to(element, {
                y: '+=20',
                rotation: '+=5',
                duration: 4 + index,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: index * 0.5
            });
        });
    }

    // Public methods for controlling animations
    pauseAllAnimations() {
        this.timelines.forEach(timeline => {
            timeline.pause();
        });
        gsap.globalTimeline.pause();
    }

    resumeAllAnimations() {
        this.timelines.forEach(timeline => {
            timeline.resume();
        });
        gsap.globalTimeline.resume();
    }

    killAllAnimations() {
        this.timelines.forEach(timeline => {
            timeline.kill();
        });
        this.timelines.clear();
        gsap.killTweensOf('*');
    }

    refreshScrollTriggers() {
        if (window.ScrollTrigger) {
            ScrollTrigger.refresh();
        }
    }
}

/*
========================================
APPLICATION CONTROLLER
========================================
*/
class PortfolioApp {
    constructor() {
        this.isInitialized = false;
        this.controllers = new Map();
        this.errorCount = 0;
        this.maxErrors = 10;
        
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                Utils.addEventListenerSafe(document, 'DOMContentLoaded', () => {
                    this.initializeApp();
                });
            } else {
                this.initializeApp();
            }
        } catch (error) {
            this.handleError('Initialization failed', error);
        }
    }

    async initializeApp() {
        try {
            console.log('🚀 Initializing Portfolio Application...');
            
            // Initialize error handling
            this.setupErrorHandling();
            
            // Check browser compatibility
            this.checkBrowserCompatibility();
            
            // Initialize performance monitoring
            this.initializePerformanceOptimizer();
            
            // Initialize core controllers in order
            await this.initializeControllers();
            
            // Setup event listeners
            this.setupGlobalEventListeners();
            
            // Mark as initialized
            this.isInitialized = true;
            document.body.classList.add('app-initialized');
            
            // Dispatch initialization complete event
            this.dispatchAppReady();
            
            console.log('✅ Portfolio Application initialized successfully');
            
        } catch (error) {
            this.handleError('App initialization failed', error);
        }
    }

    checkBrowserCompatibility() {
        const features = {
            intersectionObserver: Utils.supportsFeature('intersectionObserver'),
            localStorage: Utils.supportsFeature('localStorage'),
            customProperties: window.CSS && CSS.supports('color', 'var(--test)'),
            flexbox: window.CSS && CSS.supports('display', 'flex'),
            grid: window.CSS && CSS.supports('display', 'grid')
        };

        const unsupportedFeatures = Object.entries(features)
            .filter(([feature, supported]) => !supported)
            .map(([feature]) => feature);

        if (unsupportedFeatures.length > 0) {
            console.warn('Some features are not supported:', unsupportedFeatures);
            document.body.classList.add('legacy-browser');
            this.showBrowserWarning(unsupportedFeatures);
        }

        return features;
    }

    showBrowserWarning(unsupportedFeatures) {
        const warningDiv = Utils.createElement('div', {
            className: 'browser-warning',
            role: 'alert'
        });

        warningDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f59e0b;
            color: white;
            padding: 1rem;
            text-align: center;
            z-index: 10000;
            font-size: 0.875rem;
        `;

        warningDiv.innerHTML = `
            <strong>Browser Compatibility Notice:</strong> 
            Some features may not work optimally in your browser. 
            Consider updating to a modern browser for the best experience.
            <button onclick="this.parentElement.remove()" style="margin-left: 1rem; background: none; border: 1px solid white; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">Dismiss</button>
        `;

        document.body.appendChild(warningDiv);

        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (warningDiv.parentElement) {
                warningDiv.remove();
            }
        }, 10000);
    }

    async initializeControllers() {
        const controllerConfigs = [
            { name: 'performance', class: PerformanceOptimizer, critical: true },
            { name: 'accessibility', class: AccessibilityEnhancer, critical: true },
            { name: 'theme', class: ThemeController, critical: false },
            { name: 'navbar', class: NavbarController, critical: false },
            { name: 'typewriter', class: TypewriterEffect, critical: false, args: [Utils.querySelector('#typewriter'), CONFIG.typewriter.texts] },
            { name: 'moonStars', class: MoonStarsController, critical: false },
            { name: 'scrollAnimations', class: ScrollAnimations, critical: false },
            { name: 'portfolioFilter', class: PortfolioFilter, critical: false },
            { name: 'contactForm', class: ContactFormController, critical: false },
            { name: 'gsapAnimations', class: GSAPAnimations, critical: false }
        ];

        for (const config of controllerConfigs) {
            try {
                await this.initializeController(config);
            } catch (error) {
                if (config.critical) {
                    throw error; // Re-throw critical errors
                } else {
                    console.warn(`Non-critical controller '${config.name}' failed to initialize:`, error);
                }
            }
        }
    }

    async initializeController(config) {
        try {
            const { name, class: ControllerClass, args = [] } = config;
            
            if (!ControllerClass) {
                throw new Error(`Controller class not found for ${name}`);
            }

            console.log(`Initializing ${name} controller...`);
            
            const controller = new ControllerClass(...args);
            this.controllers.set(name, controller);
            
            // Add small delay between controller initializations
            await new Promise(resolve => setTimeout(resolve, 50));
            
        } catch (error) {
            this.handleError(`Failed to initialize ${config.name} controller`, error);
            throw error;
        }
    }

    initializePerformanceOptimizer() {
        // Initialize performance optimizer early
        if (!this.controllers.has('performance')) {
            try {
                const optimizer = new PerformanceOptimizer();
                this.controllers.set('performance', optimizer);
            } catch (error) {
                console.warn('Performance optimizer failed to initialize:', error);
            }
        }
    }

    setupErrorHandling() {
        // Global error handler
        Utils.addEventListenerSafe(window, 'error', (event) => {
            this.handleError('Global JavaScript error', event.error);
        });

        // Unhandled promise rejection handler
        Utils.addEventListenerSafe(window, 'unhandledrejection', (event) => {
            this.handleError('Unhandled promise rejection', event.reason);
            event.preventDefault(); // Prevent console logging
        });

        // Resource loading errors
        Utils.addEventListenerSafe(document, 'error', (event) => {
            if (event.target !== document) {
                this.handleResourceError(event.target);
            }
        }, true);
    }

    handleError(message, error) {
        this.errorCount++;
        
        console.error(`Portfolio App Error: ${message}`, error);
        
        // Store error for debugging
        if (!window.portfolioErrors) {
            window.portfolioErrors = [];
        }
        
        window.portfolioErrors.push({
            message,
            error: error?.toString(),
            stack: error?.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });

        // Prevent infinite error loops
        if (this.errorCount > this.maxErrors) {
            console.error('Too many errors detected. Stopping error handling.');
            return;
        }

        // Show user-friendly error message for critical errors
        if (this.errorCount <= 3) {
            this.showErrorNotification(message);
        }
    }

    handleResourceError(element) {
        const tagName = element.tagName.toLowerCase();
        const source = element.src || element.href;
        
        console.warn(`Failed to load ${tagName}: ${source}`);
        
        // Handle specific resource failures
        switch (tagName) {
            case 'img':
                this.handleImageError(element);
                break;
            case 'script':
                this.handleScriptError(element);
                break;
            case 'link':
                this.handleStylesheetError(element);
                break;
        }
    }

    handleImageError(img) {
        // Add error class for styling
        img.classList.add('image-error');
        
        // Set fallback image or placeholder
        if (!img.src.includes('placeholder')) {
            img.alt = 'Image failed to load';
            // You could set a placeholder image here
            // img.src = '/assets/images/placeholder.svg';
        }
    }

    handleScriptError(script) {
        const src = script.src;
        
        // Handle specific script failures
        if (src.includes('gsap')) {
            console.warn('GSAP failed to load, disabling GSAP animations');
            document.body.classList.add('no-gsap');
        }
    }

    handleStylesheetError(link) {
        console.warn('Stylesheet failed to load:', link.href);
        // Could add fallback styles here
    }

    showErrorNotification(message) {
        // Only show user-friendly notifications for critical errors
        if (!message.includes('critical') && !message.includes('failed to initialize')) {
            return;
        }

        const notification = Utils.createElement('div', {
            className: 'error-notification',
            role: 'alert'
        });

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            max-width: 350px;
            z-index: 10001;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Something went wrong</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; opacity: 0.9;">
                        The page is still functional, but some features may not work as expected.
                    </p>
                </div>
                <button onclick="this.closest('.error-notification').remove()" 
                        style="background: none; border: none; color: white; font-size: 1.25rem; cursor: pointer; margin-left: auto;"
                        aria-label="Close notification">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }

    setupGlobalEventListeners() {
        // Handle visibility changes
        Utils.addEventListenerSafe(document, 'visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle online/offline status
        Utils.addEventListenerSafe(window, 'online', () => {
            this.handleOnlineStatus(true);
        });

        Utils.addEventListenerSafe(window, 'offline', () => {
            this.handleOnlineStatus(false);
        });

        // Handle resize with debouncing
        Utils.addEventListenerSafe(window, 'resize', 
            Utils.debounce(() => this.handleResize(), CONFIG.performance.debounceDelay)
        );

        // Handle theme changes
        Utils.addEventListenerSafe(document, 'themeChanged', (e) => {
            this.handleThemeChange(e.detail);
        });
    }

    handleVisibilityChange() {
        const isHidden = document.hidden;
        
        // Pause/resume animations based on visibility
        const gsapController = this.controllers.get('gsapAnimations');
        if (gsapController) {
            if (isHidden) {
                gsapController.pauseAllAnimations();
            } else {
                gsapController.resumeAllAnimations();
            }
        }

        // Pause/resume other animations
        const moonController = this.controllers.get('moonStars');
        if (moonController) {
            if (isHidden) {
                moonController.pauseAnimations();
            } else {
                moonController.resumeAnimations();
            }
        }
    }

    handleOnlineStatus(isOnline) {
        const statusElement = Utils.querySelector('#connection-status');
        
        if (!statusElement) {
            // Create connection status indicator
            const indicator = Utils.createElement('div', {
                id: 'connection-status',
                'aria-live': 'polite'
            });
            
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                z-index: 1000;
                transition: all 0.3s ease;
            `;
            
            document.body.appendChild(indicator);
        }

        const indicator = Utils.querySelector('#connection-status');
        
        if (isOnline) {
            indicator.textContent = 'Back online';
            indicator.style.background = '#10b981';
            indicator.style.color = 'white';
            
            setTimeout(() => {
                indicator.style.opacity = '0';
                setTimeout(() => indicator.remove(), 300);
            }, 2000);
        } else {
            indicator.textContent = 'You are offline';
            indicator.style.background = '#ef4444';
            indicator.style.color = 'white';
            indicator.style.opacity = '1';
        }
    }

    handleResize() {
        // Refresh scroll triggers
        const gsapController = this.controllers.get('gsapAnimations');
        if (gsapController) {
            gsapController.refreshScrollTriggers();
        }

        // Update moon/stars animations for screen size
        const moonController = this.controllers.get('moonStars');
        if (moonController) {
            moonController.optimizeForScreenSize();
        }

        // Notify other controllers of resize
        this.controllers.forEach((controller, name) => {
            if (controller.handleResize && typeof controller.handleResize === 'function') {
                try {
                    controller.handleResize();
                } catch (error) {
                    console.warn(`Error in ${name} controller resize handler:`, error);
                }
            }
        });
    }

    handleThemeChange(themeDetail) {
        // Update any theme-dependent animations or configurations
        console.log('Theme changed to:', themeDetail.theme);
        
        // You can add theme-specific adjustments here
        const moonController = this.controllers.get('moonStars');
        if (moonController && moonController.updateTheme) {
            moonController.updateTheme(themeDetail.theme);
        }
    }

    dispatchAppReady() {
        const appReadyEvent = new CustomEvent('portfolioAppReady', {
            detail: {
                timestamp: Date.now(),
                controllers: Array.from(this.controllers.keys()),
                config: CONFIG
            }
        });
        
        document.dispatchEvent(appReadyEvent);
    }

    // Public API methods
    getController(name) {
        return this.controllers.get(name);
    }

    getAllControllers() {
        return new Map(this.controllers);
    }

    getAppStatus() {
        return {
            initialized: this.isInitialized,
            errorCount: this.errorCount,
            controllers: Array.from(this.controllers.keys()),
            timestamp: new Date().toISOString()
        };
    }

    restart() {
        console.log('Restarting Portfolio Application...');
        
        // Cleanup existing controllers
        this.cleanup();
        
        // Reset state
        this.isInitialized = false;
        this.errorCount = 0;
        this.controllers.clear();
        
        // Reinitialize
        setTimeout(() => {
            this.initializeApp();
        }, 100);
    }

    cleanup() {
        // Cleanup all controllers
        this.controllers.forEach((controller, name) => {
            try {
                if (controller.destroy && typeof controller.destroy === 'function') {
                    controller.destroy();
                } else if (controller.cleanup && typeof controller.cleanup === 'function') {
                    controller.cleanup();
                }
            } catch (error) {
                console.warn(`Error cleaning up ${name} controller:`, error);
            }
        });

        // Remove body classes
        document.body.classList.remove('app-initialized', 'loaded', 'keyboard-navigation');
        
        // Clean up any remaining timers or intervals
        for (let i = 1; i < 99999; i++) {
            window.clearTimeout(i);
            window.clearInterval(i);
        }
    }
}

/*
========================================
INITIALIZATION
========================================
*/

// Initialize the application
const portfolioApp = new PortfolioApp();

// Expose app to global scope for debugging
if (typeof window !== 'undefined') {
    window.portfolioApp = portfolioApp;
    window.portfolioConfig = CONFIG;
    window.portfolioUtils = Utils;
}

// Handle page unload
Utils.addEventListenerSafe(window, 'beforeunload', () => {
    if (portfolioApp && portfolioApp.cleanup) {
        portfolioApp.cleanup();
    }
});

/*
========================================
DEVELOPMENT HELPERS
========================================
*/

// Add development helpers only in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.portfolioDev = {
        // Get performance report
        getPerformanceReport() {
            const optimizer = portfolioApp.getController('performance');
            return optimizer ? optimizer.getPerformanceReport() : null;
        },
        
        // Get recent accessibility announcements
        getAccessibilityAnnouncements() {
            const a11y = portfolioApp.getController('accessibility');
            return a11y ? a11y.getRecentAnnouncements() : [];
        },
        
        // Toggle animations
        toggleAnimations() {
            const gsap = portfolioApp.getController('gsapAnimations');
            if (gsap) {
                if (gsap.timelines.size > 0) {
                    gsap.pauseAllAnimations();
                    console.log('Animations paused');
                } else {
                    gsap.resumeAllAnimations();
                    console.log('Animations resumed');
                }
            }
        },
        
        // Get app status
        getStatus() {
            return portfolioApp.getAppStatus();
        },
        
        // Get all errors
        getErrors() {
            return window.portfolioErrors || [];
        },
        
        // Restart app
        restart() {
            portfolioApp.restart();
        }
    };
    
    console.log('🔧 Development helpers available at window.portfolioDev');
}

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PortfolioApp, CONFIG, Utils };
}

export { PortfolioApp, CONFIG, Utils };

// Add to your app.js or create a separate privacy.js file
function showPrivacyPolicy() {
    const modal = document.createElement('div');
    modal.className = 'privacy-modal';
    modal.innerHTML = `
        <div class="privacy-content">
            <h2>Privacy Policy</h2>
            <div class="privacy-text">
                <h3>Cookie Usage</h3>
                <p>This website uses cookies to:</p>
                <ul>
                    <li><strong>Necessary:</strong> Ensure basic functionality and security</li>
                    <li><strong>Analytics:</strong> Understand visitor behavior with Google Analytics</li>
                    <li><strong>Preferences:</strong> Remember your settings (theme, language)</li>
                    <li><strong>Marketing:</strong> Show relevant content and advertisements</li>
                </ul>
                
                <h3>Data Collection</h3>
                <p>We collect minimal data necessary for website functionality...</p>
                
                <h3>Your Rights</h3>
                <p>You can modify your cookie preferences at any time...</p>
            </div>
            <button class="cookie-button cookie-button--primary" onclick="this.closest('.privacy-modal').remove()">
                Close
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

