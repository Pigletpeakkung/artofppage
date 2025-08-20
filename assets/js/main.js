/**
 * Main JavaScript File for Thanatsitt Portfolio
 * Enhanced with performance optimizations, accessibility features, and modern animations
 */

// GSAP Registration and Setup
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Global Configuration
const CONFIG = {
    animations: {
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.1
    },
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
    },
    performance: {
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        slowConnection: navigator.connection && navigator.connection.effectiveType.includes('2g')
    }
};

// Utility Functions
const Utils = {
    // Debounce function for performance
    debounce(func, wait, immediate) {
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
        return rect.top < windowHeight * (1 - threshold) && rect.bottom > windowHeight * threshold;
    },

    // Get element's position relative to page
    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset,
            width: rect.width,
            height: rect.height
        };
    },

    // Generate random number within range
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
};

// Enhanced Smooth Scrolling
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        // Handle anchor links
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[href^="#"]');
            if (target) {
                e.preventDefault();
                this.scrollToTarget(target.getAttribute('href'));
            }
        });

        // Handle navigation updates
        this.updateActiveNavigation();
        window.addEventListener('scroll', Utils.throttle(() => {
            this.updateActiveNavigation();
        }, 100));
    }

    scrollToTarget(targetId) {
        const target = document.querySelector(targetId);
        if (!target) return;

        const navbar = document.querySelector('.navbar');
        const offset = navbar ? navbar.offsetHeight + 20 : 20;
        const targetPosition = this.getElementPosition(target).top - offset;

        gsap.to(window, {
            duration: 1.2,
            scrollTo: {
                y: targetPosition,
                autoKill: false
            },
            ease: "power2.inOut"
        });

        // Close mobile menu if open
        const navbarCollapse = document.querySelector('.navbar-collapse.show');
        if (navbarCollapse) {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse);
            bsCollapse.hide();
        }
    }

    updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        const scrollPos = window.pageYOffset + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    getElementPosition(element) {
        return Utils.getElementPosition(element);
    }
}

// Enhanced Navbar Controller
class NavbarController {
    constructor() {
        this.navbar = document.getElementById('mainNavbar');
        this.lastScrollTop = 0;
        this.scrollThreshold = 10;
        this.init();
    }

    init() {
        if (!this.navbar) return;

        window.addEventListener('scroll', Utils.throttle(() => {
            this.handleScroll();
        }, 16)); // ~60fps

        // Handle navbar collapse on mobile
        this.setupMobileNavigation();
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class
        if (scrollTop > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        // Hide/show navbar on scroll (mobile)
        if (window.innerWidth <= CONFIG.breakpoints.mobile) {
            if (Math.abs(this.lastScrollTop - scrollTop) <= this.scrollThreshold) return;

            if (scrollTop > this.lastScrollTop && scrollTop > 100) {
                // Scrolling down
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                this.navbar.style.transform = 'translateY(0)';
            }
        }

        this.lastScrollTop = scrollTop;
    }

    setupMobileNavigation() {
        const navbarToggler = this.navbar.querySelector('.navbar-toggler');
        const navbarCollapse = this.navbar.querySelector('.navbar-collapse');

        if (navbarToggler && navbarCollapse) {
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.navbar.contains(e.target) && navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                    bsCollapse.hide();
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                    bsCollapse.hide();
                }
            });
        }
    }
}

// Enhanced Typewriter Effect
class TypewriterEffect {
    constructor(element, options = {}) {
        this.element = element;
        this.phrases = options.phrases || [
            'AI Creative Designer',
            'Digital Innovation Specialist',
            'Voice Acting Professional',
            'Creative Technology Expert',
            'Multilingual Content Creator',
            'Machine Learning Enthusiast'
        ];
        this.typingSpeed = options.typingSpeed || 100;
        this.deletingSpeed = options.deletingSpeed || 50;
        this.pauseTime = options.pauseTime || 2000;
        this.currentPhraseIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;

        this.init();
    }

    init() {
        if (!this.element) return;
        
        // Add cursor
        this.element.innerHTML = '<span class="typewriter-text"></span><span class="typewriter-cursor">|</span>';
        this.textElement = this.element.querySelector('.typewriter-text');
        
        // Start typing after a delay
        setTimeout(() => this.type(), 1000);
    }

    type() {
        if (this.isPaused) return;

        const currentPhrase = this.phrases[this.currentPhraseIndex];
        
        if (this.isDeleting) {
            // Deleting characters
            this.textElement.textContent = currentPhrase.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
            
            if (this.currentCharIndex === 0) {
                this.isDeleting = false;
                this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
                setTimeout(() => this.type(), 500);
                return;
            }
            
            setTimeout(() => this.type(), this.deletingSpeed);
        } else {
            // Typing characters
            this.textElement.textContent = currentPhrase.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
            
            if (this.currentCharIndex === currentPhrase.length) {
                this.isPaused = true;
                setTimeout(() => {
                    this.isPaused = false;
                    this.isDeleting = true;
                    this.type();
                }, this.pauseTime);
                return;
            }
            
            setTimeout(() => this.type(), this.typingSpeed + Utils.random(-30, 30));
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        this.type();
    }
}

// Enhanced Moon and Stars Animation
class CelestialAnimations {
    constructor() {
        this.moonContainer = document.querySelector('.hero-section__moon-container');
        this.moon = document.querySelector('.moon');
        this.stars = document.querySelectorAll('.star');
        this.init();
    }

    init() {
        if (!this.moonContainer) return;

        this.setupMoonAnimation();
        this.setupStarsAnimation();
        this.setupResponsiveAnimations();
        this.setupInteractiveEffects();
    }

    setupMoonAnimation() {
        if (!this.moon) return;

        // Enhanced moon floating animation
        gsap.to(this.moonContainer, {
            y: -20,
            rotation: 2,
            duration: 4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });

        // Moon glow pulse
        const moonGlow = this.moonContainer.querySelector('.moon-glow');
        if (moonGlow) {
            gsap.to(moonGlow, {
                opacity: 0.8,
                scale: 1.1,
                duration: 3,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1
            });
        }

        // Moon phase rotation
        const moonPhase = this.moonContainer.querySelector('.moon-phase-overlay');
        if (moonPhase) {
            gsap.to(moonPhase, {
                rotation: 360,
                duration: 20,
                ease: "none",
                repeat: -1
            });
        }

        // Animate moon craters
        const craters = this.moonContainer.querySelectorAll('.moon-crater');
        craters.forEach((crater, index) => {
            gsap.to(crater, {
                opacity: 0.7,
                scale: 1.1,
                                duration: 2 + index * 0.3,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: index * 0.5
            });
        });
    }

    setupStarsAnimation() {
        this.stars.forEach((star, index) => {
            // Individual star twinkling
            gsap.to(star, {
                opacity: Utils.random(0.3, 1),
                scale: Utils.random(0.8, 1.4),
                duration: Utils.random(2, 4),
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: Utils.random(0, 2)
            });

            // Gentle movement
            gsap.to(star, {
                x: Utils.random(-5, 5),
                y: Utils.random(-5, 5),
                duration: Utils.random(8, 12),
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: Utils.random(0, 3)
            });

            // Color shifting for pastel effect
            const colors = ['#FFB3E6', '#B3E5FF', '#E6B3FF', '#B3FFE6', '#FFE6B3', '#FFB3D9', '#B3D9FF', '#D9B3FF'];
            gsap.to(star, {
                color: colors[Math.floor(Math.random() * colors.length)],
                duration: Utils.random(5, 8),
                repeat: -1,
                yoyo: true,
                delay: Utils.random(0, 4)
            });
        });
    }

    setupResponsiveAnimations() {
        // Adjust animations based on screen size
        const updateAnimations = () => {
            const isMobile = window.innerWidth <= CONFIG.breakpoints.mobile;
            const animationScale = isMobile ? 0.7 : 1;
            
            gsap.set(this.moonContainer, {
                scale: animationScale
            });
        };

        updateAnimations();
        window.addEventListener('resize', Utils.debounce(updateAnimations, 250));
    }

    setupInteractiveEffects() {
        // Mouse parallax effect (desktop only)
        if (window.innerWidth > CONFIG.breakpoints.mobile && !CONFIG.performance.reducedMotion) {
            document.addEventListener('mousemove', Utils.throttle((e) => {
                const { clientX, clientY } = e;
                const { innerWidth, innerHeight } = window;
                
                const xPercent = (clientX / innerWidth - 0.5) * 2;
                const yPercent = (clientY / innerHeight - 0.5) * 2;
                
                gsap.to(this.moonContainer, {
                    x: xPercent * 20,
                    y: yPercent * 20,
                    duration: 1.5,
                    ease: "power2.out"
                });
                
                this.stars.forEach((star, index) => {
                    const multiplier = (index + 1) * 0.3;
                    gsap.to(star, {
                        x: xPercent * 10 * multiplier,
                        y: yPercent * 10 * multiplier,
                        duration: 1.2,
                        ease: "power2.out"
                    });
                });
            }, 50));
        }
    }
}

// Enhanced Scroll Animations
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        if (CONFIG.performance.reducedMotion) {
            this.setupReducedMotionAnimations();
            return;
        }

        this.setupHeroAnimations();
        this.setupSectionAnimations();
        this.setupSkillAnimations();
        this.setupPortfolioAnimations();
        this.setupFormAnimations();
    }

    setupReducedMotionAnimations() {
        // Simple fade-in animations for accessibility
        gsap.set('.animate-on-scroll', { opacity: 1 });
    }

    setupHeroAnimations() {
        const tl = gsap.timeline();
        
        tl.from('.hero-title', {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        })
        .from('.hero-description', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.5")
        .from('.hero-section__cta .button', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.2,
            ease: "power2.out"
        }, "-=0.3")
        .from('.hero-section__social-links li', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)"
        }, "-=0.2")
        .from('.scroll-indicator', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out"
        }, "-=0.1");
    }

    setupSectionAnimations() {
        // Section titles
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        });

        // Section subtitles
        gsap.utils.toArray('.section-subtitle').forEach(subtitle => {
            gsap.from(subtitle, {
                scrollTrigger: {
                    trigger: subtitle,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                },
                y: 30,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
                delay: 0.2
            });
        });

        // About section animations
        gsap.from('.about-image', {
            scrollTrigger: {
                trigger: '.about-section',
                start: "top 70%",
                end: "bottom 30%",
                toggleActions: "play none none reverse"
            },
            x: -50,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        });

        gsap.from('.about-text-content', {
            scrollTrigger: {
                trigger: '.about-section',
                start: "top 70%",
                end: "bottom 30%",
                toggleActions: "play none none reverse"
            },
            x: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.2
        });

        gsap.from('.highlight-item', {
            scrollTrigger: {
                trigger: '.about-highlights',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)",
            delay: 0.5
        });
    }

    setupSkillAnimations() {
        gsap.utils.toArray('.skill-card').forEach((card, index) => {
            const progressBar = card.querySelector('.skill-progress-bar');
            const progressValue = progressBar ? progressBar.className.match(/skill-progress-bar--(\d+)/)?.[1] : 0;

            // Card animation
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    end: "bottom 15%",
                    toggleActions: "play none none reverse"
                },
                y: 50,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
                delay: index * 0.1
            });

            // Progress bar animation
            if (progressBar && progressValue) {
                gsap.fromTo(progressBar, 
                    { width: "0%" },
                    {
                        scrollTrigger: {
                            trigger: card,
                            start: "top 75%",
                            end: "bottom 25%",
                            toggleActions: "play none none reverse"
                        },
                        width: `${progressValue}%`,
                        duration: 1.5,
                        ease: "power2.out",
                        delay: 0.5 + index * 0.1
                    }
                );
            }
        });
    }

    setupPortfolioAnimations() {
        // Portfolio filters
        gsap.from('.portfolio-filter', {
            scrollTrigger: {
                trigger: '.portfolio-filters',
                start: "top 85%",
                end: "bottom 15%",
                toggleActions: "play none none reverse"
            },
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out"
        });

        // Portfolio cards
        gsap.utils.toArray('.portfolio-card').forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    end: "bottom 15%",
                    toggleActions: "play none none reverse"
                },
                y: 50,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
                delay: (index % 3) * 0.1
            });
        });
    }

    setupFormAnimations() {
        // Contact form elements
        gsap.utils.toArray('.contact-info, .contact-form').forEach((element, index) => {
            gsap.from(element, {
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    end: "bottom 15%",
                    toggleActions: "play none none reverse"
                },
                x: index === 0 ? -50 : 50,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                delay: index * 0.2
            });
        });

        // Form fields
        gsap.from('.form-group', {
            scrollTrigger: {
                trigger: '.contact-form',
                start: "top 75%",
                end: "bottom 25%",
                toggleActions: "play none none reverse"
            },
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.3
        });
    }
}

// Enhanced Portfolio Filter System
class PortfolioFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll('.portfolio-filter');
        this.portfolioCards = document.querySelectorAll('.portfolio-card');
        this.activeFilter = 'all';
        this.init();
    }

    init() {
        if (!this.filterButtons.length || !this.portfolioCards.length) return;

        this.setupFilterEvents();
                this.setupSearchFunctionality();
        this.setupKeyboardNavigation();
    }

    setupFilterEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.getAttribute('data-filter');
                this.filterPortfolio(filter);
                this.updateActiveButton(button);
                
                // Analytics tracking
                if (typeof trackEvent === 'function') {
                    trackEvent('Portfolio', 'Filter', filter);
                }
            });
        });
    }

    setupSearchFunctionality() {
        // Add search input if needed
        const searchInput = document.getElementById('portfolioSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchPortfolio(e.target.value);
            }, 300));
        }
    }

    setupKeyboardNavigation() {
        this.filterButtons.forEach((button, index) => {
            button.addEventListener('keydown', (e) => {
                let targetIndex = index;
                
                switch (e.key) {
                    case 'ArrowRight':
                        e.preventDefault();
                        targetIndex = (index + 1) % this.filterButtons.length;
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        targetIndex = index === 0 ? this.filterButtons.length - 1 : index - 1;
                        break;
                    case 'Home':
                        e.preventDefault();
                        targetIndex = 0;
                        break;
                    case 'End':
                        e.preventDefault();
                        targetIndex = this.filterButtons.length - 1;
                        break;
                    default:
                        return;
                }
                
                this.filterButtons[targetIndex].focus();
            });
        });
    }

    filterPortfolio(filter) {
        this.activeFilter = filter;
        
        // Create timeline for smooth filtering animation
        const tl = gsap.timeline();
        
        // Fade out all cards
        tl.to(this.portfolioCards, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: "power2.inOut",
            stagger: 0.05
        });
        
        // Filter and show relevant cards
        tl.call(() => {
            this.portfolioCards.forEach(card => {
                const categories = card.getAttribute('data-category');
                const shouldShow = filter === 'all' || categories.includes(filter);
                
                card.style.display = shouldShow ? 'block' : 'none';
            });
        });
        
        // Fade in visible cards
        tl.to(this.portfolioCards, {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.7)",
            stagger: 0.08
        });

        // Update URL without page reload
        this.updateURL(filter);
        
        // Update ARIA live region for screen readers
        this.announceFilterChange(filter);
    }

    searchPortfolio(query) {
        const searchQuery = query.toLowerCase().trim();
        
        this.portfolioCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const tags = Array.from(card.querySelectorAll('.portfolio-tag'))
                .map(tag => tag.textContent.toLowerCase());
            
            const searchContent = [title, description, ...tags].join(' ');
            const matches = searchContent.includes(searchQuery);
            
            gsap.to(card, {
                opacity: matches || searchQuery === '' ? 1 : 0.3,
                scale: matches || searchQuery === '' ? 1 : 0.95,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }

    updateActiveButton(activeButton) {
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
            button.setAttribute('aria-selected', 'false');
        });
        
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-selected', 'true');
    }

    updateURL(filter) {
        const url = new URL(window.location);
        if (filter === 'all') {
            url.searchParams.delete('filter');
        } else {
            url.searchParams.set('filter', filter);
        }
        window.history.replaceState({}, '', url);
    }

    announceFilterChange(filter) {
        const visibleCards = Array.from(this.portfolioCards)
            .filter(card => card.style.display !== 'none').length;
        
        const message = filter === 'all' 
            ? `Showing all ${visibleCards} projects`
            : `Showing ${visibleCards} projects in ${filter} category`;
        
        if (typeof updateLiveRegion === 'function') {
            updateLiveRegion(message);
        }
    }

    // Initialize from URL parameters
    initFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const filterFromURL = urlParams.get('filter');
        
        if (filterFromURL) {
            const filterButton = document.querySelector(`[data-filter="${filterFromURL}"]`);
            if (filterButton) {
                this.filterPortfolio(filterFromURL);
                this.updateActiveButton(filterButton);
            }
        }
    }
}

// Enhanced Form Handler
class FormHandler {
    constructor() {
        this.contactForm = document.getElementById('contactForm');
        this.newsletterForm = document.getElementById('newsletterForm');
        this.init();
    }

    init() {
        if (this.contactForm) {
            this.setupContactForm();
        }
        
        if (this.newsletterForm) {
            this.setupNewsletterForm();
        }
        
        this.setupFormValidation();
    }

    setupContactForm() {
        this.contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.validateForm(this.contactForm)) {
                return;
            }
            
            const formData = new FormData(this.contactForm);
            const submitButton = this.contactForm.querySelector('button[type="submit"]');
            const statusDiv = document.getElementById('submit-status');
            
            // Update UI
            this.setSubmissionState(submitButton, true);
            
            try {
                const response = await this.submitForm('/api/contact', formData);
                
                if (response.success) {
                    this.showFormMessage(statusDiv, 'success', 'Message sent successfully! I\'ll get back to you soon.');
                    this.contactForm.reset();
                    
                    // Analytics tracking
                    if (typeof trackEvent === 'function') {
                        trackEvent('Contact', 'Form Submit', 'Success');
                    }
                } else {
                    throw new Error(response.message || 'Failed to send message');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                this.showFormMessage(statusDiv, 'error', 'Sorry, there was an error sending your message. Please try again.');
                
                // Analytics tracking
                if (typeof trackEvent === 'function') {
                    trackEvent('Contact', 'Form Submit', 'Error');
                }
            } finally {
                this.setSubmissionState(submitButton, false);
            }
        });
    }

    setupNewsletterForm() {
        this.newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = this.newsletterForm.querySelector('input[type="email"]');
            const submitButton = this.newsletterForm.querySelector('button[type="submit"]');
            const statusDiv = document.getElementById('newsletter-status');
            
            if (!this.validateEmail(emailInput.value)) {
                this.showFormMessage(statusDiv, 'error', 'Please enter a valid email address');
                return;
            }
            
            const formData = new FormData(this.newsletterForm);
            
            // Update UI
            this.setSubmissionState(submitButton, true, '<i class="fas fa-spinner fa-spin"></i>');
            
            try {
                const response = await this.submitForm('/api/newsletter', formData);
                
                if (response.success) {
                    this.showFormMessage(statusDiv, 'success', 'Successfully subscribed to newsletter!');
                    this.newsletterForm.reset();
                    
                    // Analytics tracking
                    if (typeof trackEvent === 'function') {
                        trackEvent('Newsletter', 'Subscribe', 'Success');
                    }
                } else {
                    throw new Error(response.message || 'Failed to subscribe');
                }
            } catch (error) {
                console.error('Newsletter subscription error:', error);
                this.showFormMessage(statusDiv, 'error', 'Sorry, subscription failed. Please try again.');
            } finally {
                this.setSubmissionState(submitButton, false, '<i class="fas fa-arrow-right"></i>');
            }
        });
    }

    setupFormValidation() {
        // Real-time validation
        const forms = [this.contactForm, this.newsletterForm].filter(Boolean);
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', Utils.debounce(() => {
                    if (input.classList.contains('is-invalid')) {
                        this.validateField(input);
                    }
                }, 300));
            });
        });
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
                        errorMessage = 'This field is required';
        }
        
        // Email validation
        if (field.type === 'email' && value && !this.validateEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
        
        // Name validation
        if (field.name === 'name' && value && value.length < 2) {
            isValid = false;
            errorMessage = 'Name must be at least 2 characters long';
        }
        
        // Message validation
        if (field.name === 'message' && value && value.length < 10) {
            isValid = false;
            errorMessage = 'Message must be at least 10 characters long';
        }
        
        this.updateFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    updateFieldValidation(field, isValid, errorMessage) {
        const errorElement = document.getElementById(`${field.name}-error`) || 
                           field.parentNode.querySelector('.invalid-feedback');
        
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
            } else {
                // Create error element if it doesn't exist
                const newErrorElement = document.createElement('div');
                newErrorElement.className = 'invalid-feedback';
                newErrorElement.textContent = errorMessage;
                newErrorElement.style.display = 'block';
                field.parentNode.appendChild(newErrorElement);
            }
        }
    }

    async submitForm(endpoint, formData) {
        // Simulate API call - replace with actual implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate success/failure
                const success = Math.random() > 0.1; // 90% success rate for demo
                resolve({
                    success,
                    message: success ? 'Form submitted successfully' : 'Server error occurred'
                });
            }, 2000);
        });
    }

    setSubmissionState(button, isSubmitting, loadingHTML = null) {
        if (isSubmitting) {
            button.disabled = true;
            button.dataset.originalHTML = button.innerHTML;
            button.innerHTML = loadingHTML || '<i class="fas fa-spinner fa-spin icon-spacing"></i>Sending...';
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalHTML || button.innerHTML;
        }
    }

    showFormMessage(element, type, message) {
        element.textContent = message;
        element.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
        element.classList.remove('visually-hidden');
        element.setAttribute('role', 'alert');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            element.classList.add('visually-hidden');
            element.removeAttribute('role');
        }, 5000);
        
        // Announce to screen readers
        if (typeof updateLiveRegion === 'function') {
            updateLiveRegion(message);
        }
    }
}

// Enhanced Theme Controller
class ThemeController {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.body = document.body;
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
        this.init();
    }

    init() {
        if (!this.themeToggle) return;
        
        this.applyTheme(this.currentTheme);
        this.setupToggleButton();
        this.setupSystemPreferenceListener();
        this.setupKeyboardShortcut();
    }

    setupToggleButton() {
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Update icons based on current theme
        this.updateThemeIcons();
    }

    setupSystemPreferenceListener() {
        this.systemPreference.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                const systemTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(systemTheme);
            }
        });
    }

    setupKeyboardShortcut() {
        // Ctrl/Cmd + Shift + T to toggle theme
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Analytics tracking
        if (typeof trackEvent === 'function') {
            trackEvent('UI', 'Theme Toggle', newTheme);
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: newTheme, previous: this.currentTheme }
        }));
        
        this.currentTheme = newTheme;
    }

    applyTheme(theme) {
        this.body.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.updateThemeIcons();
        this.updateMetaThemeColor(theme);
        
        // Update ARIA label
        const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
        this.themeToggle.setAttribute('aria-label', label);
    }

    updateThemeIcons() {
        const moonIcon = this.themeToggle.querySelector('.fa-moon');
        const sunIcon = this.themeToggle.querySelector('.fa-sun');
        
        if (moonIcon && sunIcon) {
            if (this.currentTheme === 'dark') {
                moonIcon.classList.add('d-none');
                sunIcon.classList.remove('d-none');
            } else {
                moonIcon.classList.remove('d-none');
                sunIcon.classList.add('d-none');
            }
        }
    }

    updateMetaThemeColor(theme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = theme === 'dark' ? '#1A202C' : '#A78BFA';
        }
    }
}

// Enhanced Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.setupPerformanceObserver();
        this.monitorUserInteractions();
        this.setupErrorTracking();
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            
            this.metrics.pageLoad = {
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                firstPaint: this.getFirstPaint(),
                firstContentfulPaint: this.getFirstContentfulPaint()
            };
            
            this.reportMetrics();
        });
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
            });
            
            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP observer not supported');
            }
            
            // First Input Delay
            const fidObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                });
            });
            
            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID observer not supported');
            }
        }
    }

    monitorUserInteractions() {
        // Track interaction delays
        ['click', 'keydown', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                const startTime = performance.now();
                
                requestAnimationFrame(() => {
                    const interactionDelay = performance.now() - startTime;
                    if (interactionDelay > 100) { // Log slow interactions
                        console.warn(`Slow ${eventType} interaction:`, interactionDelay + 'ms');
                    }
                });
            }, { passive: true });
        });
    }

    setupErrorTracking() {
        // JavaScript errors
        window.addEventListener('error', (e) => {
            this.trackError('JavaScript Error', e.error, e.filename, e.lineno);
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError('Unhandled Promise Rejection', e.reason);
        });
        
        // Resource loading errors
        window.addEventListener('error', (e) => {
            if (e.target !== window && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
                this.trackError('Resource Load Error', e.target.src || e.target.href);
            }
        }, true);
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
        return fpEntry ? fpEntry.startTime : null;
    }

    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : null;
    }

    trackError(type, error, filename = '', lineno = '') {
        const errorData = {
            type,
            message: error?.message || error,
            filename,
            lineno,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error('Tracked Error:', errorData);
        
        // Send to analytics or error tracking service
        if (typeof trackEvent === 'function') {
            trackEvent('Error', type, errorData.message);
        }
    }

    reportMetrics() {
        console.log('Performance Metrics:', this.metrics);
        
        // Send to analytics
        if (typeof gtag !== 'undefined') {
            Object.entries(this.metrics.pageLoad || {}).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    gtag('event', 'timing_complete', {
                        'name': key,
                        'value': Math.round(value)
                    });
                }
            });
        }
    }
}

// Enhanced Accessibility Features
class AccessibilityEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupSkipLinks();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupARIALiveRegions();
        this.setupReducedMotion();
        this.setupHighContrast();
    }

    setupSkipLinks() {
        const skipLinks = document.querySelectorAll('.skip-link');
        
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                    
                    // Remove tabindex after focus
                    target.addEventListener('blur', () => {
                        target.removeAttribute('tabindex');
                    }, { once: true });
                }
            });
        });
    }

    setupKeyboardNavigation() {
        // Escape key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals, menus, etc.
                const openModal = document.querySelector('.modal.show');
                const openDropdown = document.querySelector('.dropdown-menu.show');
                const openNavbar = document.querySelector('.navbar-collapse.show');
                
                if (openModal) {
                    const modal = bootstrap.Modal.getInstance(openModal);
                    modal?.hide();
                } else if (openDropdown) {
                    const dropdown = bootstrap.Dropdown.getInstance(openDropdown.previousElementSibling);
                    dropdown?.hide();
                } else if (openNavbar) {
                    const collapse = bootstrap.Collapse.getInstance(openNavbar);
                    collapse?.hide();
                }
            }
        });
        
        // Tab key navigation enhancement
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        // Remove keyboard navigation class on mouse use
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupFocusManagement() {
        // Ensure focus visibility
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        document.addEventListener('focusin', (e) => {
            const target = e.target;
            
            // Ensure focused element is visible
            if (target.matches(focusableElements)) {
                this.ensureElementVisible(target);
            }
        });
        
        // Focus trap for modals and forms
        this.setupFocusTraps();
    }

    setupFocusTraps() {
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(modal => {
            modal.addEventListener('shown.bs.modal', () => {
                this.trapFocus(modal);
            });
        });
    }

    trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        container.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
        
        // Focus first element
        firstElement?.focus();
    }

    setupARIALiveRegions() {
        // Create global live region if it doesn't exist
        if (!document.getElementById('live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'visually-hidden';
            document.body.appendChild(liveRegion);
        }
        
        // Make updateLiveRegion globally available
        window.updateLiveRegion = (message) => {
            const liveRegion = document.getElementById('live-region');
            if (liveRegion) {
                liveRegion.textContent = message;
            }
        };
    }

    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleReducedMotion = (mediaQuery) => {
            if (mediaQuery.matches) {
                document.body.classList.add('reduced-motion');
                // Disable or reduce animations
                gsap.globalTimeline.timeScale(0.1);
            } else {
                document.body.classList.remove('reduced-motion');
                gsap.globalTimeline.timeScale(1);
            }
        };
        
        handleReducedMotion(prefersReducedMotion);
        prefersReducedMotion.addEventListener('change', handleReducedMotion);
    }

    setupHighContrast() {
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
        
        const handleHighContrast = (mediaQuery) => {
            if (mediaQuery.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        };
        
        handleHighContrast(prefersHighContrast);
        prefersHighContrast.addEventListener('change', handleHighContrast);
    }

    ensureElementVisible(element) {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        
        if (!isVisible) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
}

// Main Application Controller
class PortfolioApp {
    constructor() {
        this.components = {};
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialize core components
            this.components.smoothScroll = new SmoothScroll();
            this.components.navbar = new NavbarController();
            this.components.theme = new ThemeController();
            this.components.accessibility = new AccessibilityEnhancer();
            
            // Initialize typewriter effect
            const typewriterElement = document.getElementById('typewriter');
            if (typewriterElement) {
                this.components.typewriter = new TypewriterEffect(typewriterElement);
            }
            
            // Initialize celestial animations
            this.components.celestial = new CelestialAnimations();
            
            // Initialize scroll animations (wait for GSAP to load)
            await this.waitForGSAP();
            this.components.scrollAnimations = new ScrollAnimations();
            
            // Initialize portfolio filter
            this.components.portfolioFilter = new PortfolioFilter();
            this.components.portfolioFilter.initFromURL();
            
            // Initialize form handler
            this.components.formHandler = new FormHandler();
            
            // Initialize performance monitoring
            this.components.performance = new PerformanceMonitor();
            
            // Setup additional features
            this.setupBackToTop();
            this.setupCookieConsent();
            this.setupLazyLoading();
            this.setupServiceWorker();
            
            this.isInitialized = true;
            console.log('Portfolio app initialized successfully');
            
            // Dispatch initialization event
            window.dispatchEvent(new CustomEvent('portfolioAppReady', {
                detail: { components: Object.keys(this.components) }
            }));
            
        } catch (error) {
            console.error('Error initializing portfolio app:', error);
            this.handleInitializationError(error);
        }
    }

    async waitForGSAP() {
        return new Promise((resolve) => {
            if (typeof gsap !== 'undefined') {
                resolve();
            } else {
                const checkGSAP = () => {
                    if (typeof gsap !== 'undefined') {
                        resolve();
                    } else {
                        setTimeout(checkGSAP, 100);
                    }
                };
                checkGSAP();
            }
        });
    }

    setupBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (!backToTopBtn) return;
        
        const toggleButton = Utils.throttle(() => {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'flex';
                gsap.to(backToTopBtn, { opacity: 1, duration: 0.3 });
            } else {
                gsap.to(backToTopBtn, { 
                    opacity: 0, 
                    duration: 0.3,
                    onComplete: () => {
                        backToTopBtn.style.display = 'none';
                    }
                });
            }
        }, 100);
        
        window.addEventListener('scroll', toggleButton);
        
        backToTopBtn.addEventListener('click', () => {
            gsap.to(window, {
                duration: 1,
                scrollTo: { y: 0 },
                ease: "power2.inOut"
            });
        });
    }

    setupCookieConsent() {
        const cookieConsent = document.getElementById('cookieConsent');
        if (!cookieConsent) return;
        
        const hasConsent = localStorage.getItem('cookieConsent');
        
        if (!hasConsent) {
            setTimeout(() => {
                cookieConsent.style.display = 'block';
                gsap.from(cookieConsent, {
                    y: 100,
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.out"
                });
            }, 2000);
        }
        
        // Handle consent buttons
        const acceptBtn = document.getElementById('acceptCookies');
        const declineBtn = document.getElementById('declineCookies');
        
        acceptBtn?.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            this.hideCookieConsent(cookieConsent);
            this.initializeTracking();
        });
        
        declineBtn?.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'declined');
            this.hideCookieConsent(cookieConsent);
        });
    }

    hideCookieConsent(element) {
        gsap.to(element, {
            y: 100,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                element.style.display = 'none';
            }
        });
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            }, { rootMargin: '50px' });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }

    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    initializeTracking() {
        // Initialize analytics and tracking services
        console.log('Tracking initialized');
        
        // Example: Initialize Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID');
        }
    }

    handleInitializationError(error) {
        // Fallback initialization for critical features
        console.warn('Falling back to basic functionality');
        
        // Basic smooth scrolling fallback
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // Public API methods
    getComponent(name) {
        return this.components[name];
    }

    isReady() {
        return this.isInitialized;
    }
}

// Initialize the application
const portfolioApp = new PortfolioApp();

// Make app globally available for debugging and external access
window.portfolioApp = portfolioApp;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioApp;
}
