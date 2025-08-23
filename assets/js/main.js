/**
 * ===============================================
 * THANATSITT PORTFOLIO - MODERN JAVASCRIPT 2025
 * Enhanced PWA with Service Workers, Animations & Theme System
 * ===============================================
 */

// === MODERN 2025 JAVASCRIPT FEATURES ===
"use strict";

// === GLOBAL STATE MANAGEMENT ===
class PortfolioApp {
    constructor() {
        this.state = {
            theme: localStorage.getItem('theme') || 'light',
            currentSection: 'home',
            animations: new Map(),
            isOffline: false,
            pwaInstallPrompt: null,
            touchStartY: 0,
            scrollThreshold: 50
        };
        
        this.init();
    }

    // === INITIALIZATION ===
    async init() {
        try {
            // DOM Content Loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupApp());
            } else {
                this.setupApp();
            }
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showErrorFallback();
        }
    }

    async setupApp() {
        // Core functionality setup
        await this.setupServiceWorker();
        this.setupTheme();
        this.setupNavigation();
        this.setupAnimations();
        this.setupInteractions();
        this.setupPWA();
        this.setupOfflineDetection();
        this.setupPerformanceOptimizations();
        
        // Hide loading screen after setup
        setTimeout(() => this.hideLoadingScreen(), 1500);
        
        console.log('🚀 Portfolio App initialized successfully');
    }

    // === SERVICE WORKER SETUP ===
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js', {
                    scope: '/'
                });
                
                console.log('✅ Service Worker registered:', registration.scope);
                
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
                console.log('❌ Service Worker registration failed:', error);
            }
        }
    }

    // === THEME MANAGEMENT ===
    setupTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        
        // Apply initial theme
        this.applyTheme(this.state.theme);
        
        // Theme toggle handler
        themeToggle?.addEventListener('click', () => {
            this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
            this.applyTheme(this.state.theme);
            
            // Animate icon transition
            this.animateThemeToggle(themeIcon);
        });

        // System theme preference detection
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.state.theme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.state.theme);
            }
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        // Update theme color meta tag
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', theme === 'dark' ? '#1e293b' : '#6366F1');
        }
    }

    animateThemeToggle(icon) {
        if (!icon) return;
        
        icon.style.transform = 'scale(0) rotate(180deg)';
        
        setTimeout(() => {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }, 150);
    }

    // === NAVIGATION SYSTEM ===
    setupNavigation() {
        const navbar = document.getElementById('navbar');
        const navLinks = document.querySelectorAll('.nav-link');
        let lastScrollY = window.scrollY;

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    this.smoothScrollTo(targetSection);
                    this.setActiveNavLink(link);
                    
                    // Close mobile menu if open
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse?.classList.contains('show')) {
                        const navbarToggler = document.querySelector('.navbar-toggler');
                        navbarToggler?.click();
                    }
                }
            });
        });

        // Navbar scroll behavior
        window.addEventListener('scroll', this.throttle(() => {
            const currentScrollY = window.scrollY;
            
            // Add/remove scrolled class
            navbar?.classList.toggle('scrolled', currentScrollY > 50);
            
            // Auto-hide navbar on scroll down (mobile)
            if (window.innerWidth <= 768) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    navbar?.style.setProperty('transform', 'translateY(-100%)');
                } else {
                    navbar?.style.setProperty('transform', 'translateY(0)');
                }
            }
            
            lastScrollY = currentScrollY;
            
            // Update active navigation based on scroll position
            this.updateActiveNavigation();
        }, 100));

        // Initial active nav update
        this.updateActiveNavigation();
    }

    smoothScrollTo(element) {
        const headerOffset = 80;
        const elementPosition = element.offsetTop;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    updateActiveNavigation() {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const scrollPosition = window.scrollY + 100;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        // Update active nav link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });

        this.state.currentSection = currentSection;
    }

    setActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // === ANIMATION SYSTEM ===
    setupAnimations() {
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 100,
                disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            });
        }

        // Setup typewriter effect
        this.setupTypewriter();
        
        // Setup skill progress bars animation
        this.setupSkillsAnimation();
        
        // Setup portfolio filters animation
        this.setupPortfolioFilters();
        
        // Setup advanced animations
        this.setupAdvancedAnimations();
    }

    setupTypewriter() {
        const typewriterElement = document.getElementById('typewriter');
        if (!typewriterElement) return;

        const phrases = [
            'AI Creative Designer',
            'Digital Innovation Specialist',
            'Voice Acting Professional',
            'Multilingual Content Creator',
            'Full-Stack Developer',
            'Creative Technology Expert'
        ];

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typingSpeed = 100;
        const deletingSpeed = 50;
        const pauseTime = 2000;

        const typeWriter = () => {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
            }

            let nextTimeout = isDeleting ? deletingSpeed : typingSpeed;

            if (!isDeleting && charIndex === currentPhrase.length) {
                nextTimeout = pauseTime;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
            }

            setTimeout(typeWriter, nextTimeout);
        };

        typeWriter();
    }

    setupSkillsAnimation() {
        const skillCards = document.querySelectorAll('.skill-card');
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };

        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target.querySelector('.skill-progress-bar');
                    if (progressBar && !progressBar.classList.contains('animated')) {
                        // Animate progress bar
                        setTimeout(() => {
                            const targetWidth = progressBar.style.width || '0%';
                            progressBar.style.width = '0%';
                            progressBar.style.transition = 'width 2s ease-out';
                            
                            requestAnimationFrame(() => {
                                progressBar.style.width = targetWidth;
                            });
                        }, 200);
                        
                        progressBar.classList.add('animated');
                    }
                }
            });
        }, observerOptions);

        skillCards.forEach(card => {
            skillObserver.observe(card);
        });
    }

    setupPortfolioFilters() {
        const filterButtons = document.querySelectorAll('.portfolio-filter');
        const portfolioCards = document.querySelectorAll('.portfolio-card');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                
                // Update active filter
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Animate portfolio cards
                this.filterPortfolioCards(portfolioCards, filter);
            });
        });
    }

    filterPortfolioCards(cards, filter) {
        cards.forEach((card, index) => {
            const categories = card.dataset.category?.split(' ') || [];
            const shouldShow = filter === 'all' || categories.includes(filter);
            
            // Animate out
            card.style.transition = 'all 0.3s ease';
            card.style.transform = 'scale(0.8)';
            card.style.opacity = '0';
            
            setTimeout(() => {
                if (shouldShow) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.transform = 'scale(1)';
                        card.style.opacity = '1';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            }, 200);
        });
    }

    setupAdvancedAnimations() {
        // Parallax effect for hero section
        this.setupParallax();
        
        // Mouse trail effect
        this.setupMouseTrail();
        
        // Scroll-triggered animations
        this.setupScrollAnimations();
    }

    setupParallax() {
        const parallaxElements = document.querySelectorAll('.hero-section__geometric-shapes .shape');
        
        window.addEventListener('scroll', this.throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach((element, index) => {
                const speed = (index + 1) * 0.2;
                element.style.transform = `translateY(${rate * speed}px) rotate(${scrolled * 0.05}deg)`;
            });
        }, 16));
    }

    setupMouseTrail() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
        const trail = [];
        const trailLength = 5;
        
        document.addEventListener('mousemove', (e) => {
            trail.unshift({ x: e.clientX, y: e.clientY });
            
            if (trail.length > trailLength) {
                trail.pop();
            }
            
            this.updateMouseTrail(trail);
        });
    }

    updateMouseTrail(trail) {
        // Implement mouse trail visualization if needed
        // This could create floating particles or cursor effects
    }

    setupScrollAnimations() {
        const animateElements = document.querySelectorAll('[data-animate]');
        
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const animationType = entry.target.dataset.animate;
                    this.triggerScrollAnimation(entry.target, animationType);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animateElements.forEach(element => {
            scrollObserver.observe(element);
        });
    }

    triggerScrollAnimation(element, type) {
        switch (type) {
            case 'fadeInUp':
                element.style.animation = 'fadeInUp 0.6s ease-out forwards';
                break;
            case 'slideInLeft':
                element.style.animation = 'slideInLeft 0.8s ease-out forwards';
                break;
            case 'zoomIn':
                element.style.animation = 'zoomIn 0.5s ease-out forwards';
                break;
            default:
                element.style.animation = 'fadeIn 0.6s ease-out forwards';
        }
    }

    // === INTERACTIVE FEATURES ===
    setupInteractions() {
        // Voice demo functionality
        this.setupVoiceDemo();
        
        // Contact form handling
        this.setupContactForm();
        
        // Newsletter form handling
        this.setupNewsletterForm();
        
        // Touch gestures for mobile
        this.setupTouchGestures();
        
        // Keyboard navigation
        this.setupKeyboardNavigation();
    }

    setupVoiceDemo() {
        const voiceTrigger = document.getElementById('voice-demo-trigger');
        const voiceAudio = document.getElementById('voice-intro-audio');
        
        if (!voiceTrigger || !voiceAudio) return;

        // Preload audio
        voiceAudio.preload = 'metadata';
        
        const playVoiceDemo = async () => {
            try {
                // Reset audio to beginning
                voiceAudio.currentTime = 0;
                
                // Add visual feedback
                voiceTrigger.style.transform = 'scale(0.95)';
                voiceTrigger.style.filter = 'brightness(1.1)';
                
                await voiceAudio.play();
                
                console.log('🎵 Voice demo playing');
                
                // Visual animation during playback
                this.animateVoiceDemo(voiceTrigger, voiceAudio.duration * 1000);
                
            } catch (error) {
                console.error('Voice demo playback failed:', error);
                this.showToast('Voice demo temporarily unavailable', 'warning');
            }
        };

        // Click handler
        voiceTrigger.addEventListener('click', playVoiceDemo);
        
        // Keyboard handler
        voiceTrigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playVoiceDemo();
            }
        });

        // Audio event handlers
        voiceAudio.addEventListener('ended', () => {
            voiceTrigger.style.transform = 'scale(1)';
            voiceTrigger.style.filter = 'brightness(1)';
        });

        voiceAudio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.showToast('Could not load voice demo', 'error');
        });
    }

    animateVoiceDemo(element, duration) {
        // Create pulsing animation during voice playback
        element.style.animation = `voicePulse ${duration/1000}s ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission(contactForm, 'contact');
        });

        // Real-time validation
        const formInputs = contactForm.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    setupNewsletterForm() {
        const newsletterForm = document.getElementById('newsletterForm');
        if (!newsletterForm) return;

        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission(newsletterForm, 'newsletter');
        });
    }

    async handleFormSubmission(form, type) {
        const submitButton = form.querySelector('button[type="submit"]');
        const statusElement = form.querySelector(`#${type === 'contact' ? 'submit' : 'newsletter'}-status`);
        
        // Show loading state
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Simulate API call (replace with actual endpoint)
            await this.simulateApiCall(data);
            
            // Success feedback
            this.showToast(
                type === 'contact' 
                    ? 'Message sent successfully! I\'ll get back to you soon.' 
                    : 'Successfully subscribed to updates!',
                'success'
            );
            
            form.reset();
            
        } catch (error) {
            console.error(`${type} form submission failed:`, error);
            this.showToast(
                'Something went wrong. Please try again later.',
                'error'
            );
        } finally {
            // Restore button state
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }

    async simulateApiCall(data) {
        // Simulate network delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure for demo
                if (Math.random() > 0.1) {
                    resolve({ success: true, data });
                } else {
                    reject(new Error('Network error'));
                }
            }, 1500);
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailPattern.test(value);
                errorMessage = 'Please enter a valid email address';
                break;
            case 'text':
                if (field.required) {
                    isValid = value.length > 0;
                    errorMessage = 'This field is required';
                }
                break;
            case 'textarea':
                if (field.required) {
                    isValid = value.length >= 10;
                    errorMessage = 'Please enter at least 10 characters';
                }
                break;
        }

        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    showFieldValidation(field, isValid, errorMessage) {
        field.classList.toggle('is-invalid', !isValid);
        field.classList.toggle('is-valid', isValid);
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Show error message if invalid
        if (!isValid && errorMessage) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = errorMessage;
            errorDiv.style.color = 'var(--error-color)';
            errorDiv.style.fontSize = 'var(--fs-sm)';
            errorDiv.style.marginTop = 'var(--space-xs)';
            field.parentNode.appendChild(errorDiv);
        }
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid', 'is-valid');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    setupTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Swipe detection
            const minSwipeDistance = 100;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.handleSwipeRight();
                    } else {
                        this.handleSwipeLeft();
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.handleSwipeDown();
                    } else {
                        this.handleSwipeUp();
                    }
                }
            }
        }, { passive: true });
    }

    handleSwipeLeft() {
        // Navigate to next section
        this.navigateSection('next');
    }

    handleSwipeRight() {
        // Navigate to previous section
        this.navigateSection('prev');
    }

    handleSwipeUp() {
        // Scroll to next section
        this.scrollToNextSection();
    }

    handleSwipeDown() {
        // Scroll to previous section
        this.scrollToPrevSection();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in a form field
            if (e.target.matches('input, textarea, select')) return;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.scrollToPrevSection();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.scrollToNextSection();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.scrollToSection('home-section');
                    break;
                case 'End':
                    e.preventDefault();
                    this.scrollToSection('contact-section');
                    break;
                case 'Escape':
                    // Close any open modals or menus
                    this.closeAllModals();
                    break;
            }
        });
    }

    navigateSection(direction) {
        const sections = Array.from(document.querySelectorAll('.section'));
        const currentIndex = sections.findIndex(section => 
            section.id === this.state.currentSection
        );
        
        if (currentIndex === -1) return;

        let nextIndex;
        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % sections.length;
        } else {
            nextIndex = currentIndex === 0 ? sections.length - 1 : currentIndex - 1;
        }

        this.smoothScrollTo(sections[nextIndex]);
    }

    scrollToNextSection() {
        this.navigateSection('next');
    }

    scrollToPrevSection() {
        this.navigateSection('prev');
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            this.smoothScrollTo(section);
        }
    }

    closeAllModals() {
        // Close any open modals, menus, or overlays
        const openElements = document.querySelectorAll('.show, .open, .active');
        openElements.forEach(element => {
            element.classList.remove('show', 'open', 'active');
        });
    }

    // === PWA FUNCTIONALITY ===
    setupPWA() {
        // Install prompt handling
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.state.pwaInstallPrompt = e;
            this.showPWAInstallPrompt();
        });

        // PWA install button
        const installButton = document.getElementById('pwa-install-button');
        installButton?.addEventListener('click', () => {
            this.installPWA();
        });

        // PWA dismiss button
        const dismissButton = document.getElementById('pwa-dismiss-button');
        dismissButton?.addEventListener('click', () => {
            this.dismissPWAPrompt();
        });

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('🎉 PWA is installed and running in standalone mode');
        }
    }

    showPWAInstallPrompt() {
        const promptElement = document.getElementById('pwa-install-prompt');
        if (!promptElement) return;

        // Don't show if user previously dismissed
        if (localStorage.getItem('pwa-install-dismissed')) return;

        // Show prompt after a delay
        setTimeout(() => {
            promptElement.classList.add('show');
        }, 5000);
    }

    async installPWA() {
        if (!this.state.pwaInstallPrompt) return;

        try {
            const result = await this.state.pwaInstallPrompt.prompt();
            console.log('PWA install prompt result:', result.outcome);
            
            if (result.outcome === 'accepted') {
                this.showToast('App installed successfully!', 'success');
            }
            
            this.state.pwaInstallPrompt = null;
            this.dismissPWAPrompt();
            
        } catch (error) {
            console.error('PWA installation failed:', error);
            this.showToast('Installation failed. Please try again.', 'error');
        }
    }

    dismissPWAPrompt() {
        const promptElement = document.getElementById('pwa-install-prompt');
        promptElement?.classList.remove('show');
        localStorage.setItem('pwa-install-dismissed', 'true');
    }

    // === OFFLINE DETECTION ===
    setupOfflineDetection() {
        const offlineIndicator = document.getElementById('offline-indicator');
        const offlineText = document.getElementById('offline-text');

        const updateOnlineStatus = () => {
            this.state.isOffline = !navigator.onLine;
            
            if (offlineIndicator && offlineText) {
                if (this.state.isOffline) {
                    offlineText.textContent = 'You\'re offline';
                    offlineIndicator.classList.add('offline', 'show');
                    offlineIndicator.classList.remove('online');
                } else {
                    offlineText.textContent = 'You\'re online';
                    offlineIndicator.classList.add('online', 'show');
                    offlineIndicator.classList.remove('offline');
                    
                    // Hide online indicator after 3 seconds
                    setTimeout(() => {
                        offlineIndicator.classList.remove('show');
                    }, 3000);
                }
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // Initial check
        updateOnlineStatus();
    }

    // === UPDATE NOTIFICATION ===
    showUpdateNotification() {
        const updateNotification = document.getElementById('update-notification');
        const updateButton = document.getElementById('update-button');
        const dismissUpdate = document.getElementById('dismiss-update');
        
        if (!updateNotification) return;

        updateNotification.classList.add('show');

        updateButton?.addEventListener('click', () => {
            window.location.reload();
        });

        dismissUpdate?.addEventListener('click', () => {
            updateNotification.classList.remove('show');
        });
    }

    // === PERFORMANCE OPTIMIZATIONS ===
    setupPerformanceOptimizations() {
        // Lazy loading for images
        this.setupLazyLoading();
        
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        images.forEach(img => {
            imageObserver.observe(img);
        });
    }

    preloadCriticalResources() {
        // Preload voice demo if not already done
        const voiceAudio = document.getElementById('voice-intro-audio');
        if (voiceAudio) {
            voiceAudio.preload = 'metadata';
        }

        // Preload critical images
        const criticalImages = [
            'assets/images/data/profile/1755844218313.jpg'
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    setupPerformanceMonitoring() {
        // Monitor Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        console.log('Performance metric:', entry.name, entry.value);
                    });
                });
                
                observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
            } catch (error) {
                console.log('Performance monitoring not available');
            }
        }
    }

    // === UTILITY FUNCTIONS ===
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Styles for toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            color: 'white',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '400px',
            backgroundColor: this.getToastColor(type),
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        });

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        // Close button handler
        const closeButton = toast.querySelector('.toast-close');
        closeButton.addEventListener('click', () => {
            this.closeToast(toast);
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            this.closeToast(toast);
        }, 5000);
    }

    closeToast(toast) {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    getToastColor(type) {
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        return colors[type] || colors.info;
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    showErrorFallback() {
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: Arial, sans-serif;
                text-align: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            ">
                <div>
                    <h1>⚠️ Something went wrong</h1>
                    <p>Please refresh the page or try again later.</p>
                    <button onclick="window.location.reload()" 
                            style="
                                padding: 12px 24px;
                                background: rgba(255,255,255,0.2);
                                border: 2px solid rgba(255,255,255,0.3);
                                color: white;
                                border-radius: 8px;
                                cursor: pointer;
                                margin-top: 20px;
                            ">
                        Reload Page
                    </button>
                </div>
            </div>
        `;
    }
}

// === ADDITIONAL CSS ANIMATIONS (Injected Dynamically) ===
const additionalStyles = `
    @keyframes voicePulse {
        0%, 100% { transform: scale(1); filter: brightness(1); }
        25% { transform: scale(1.05); filter: brightness(1.2); }
        50% { transform: scale(1.1); filter: brightness(1.3); }
        75% { transform: scale(1.05); filter: brightness(1.2); }
    }
    
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-30px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes zoomIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .toast {
        display: flex;
        align-items: center;
        justify-content
