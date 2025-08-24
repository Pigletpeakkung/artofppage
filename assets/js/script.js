/**
 * ===============================================
 * THANATSITT PORTFOLIO - ENHANCED JAVASCRIPT v3.0
 * ===============================================
 * Ultra-Modern Portfolio with Advanced Features
 * Author: Thanatsitt Santisamranwilai
 * Version: 3.0.0 (2025 Modern Update)
 * Features: GSAP Animations, Performance Optimization,
 *          Enhanced UX/UI, Modern ES6+ Features
 * ===============================================
 */

// === PERFORMANCE MONITORING ===
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.init();
    }

    init() {
        this.startTime = performance.now();
        this.observePerformance();
    }

    observePerformance() {
        // Performance Observer for monitoring
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.metrics.set(entry.name, entry);
                });
            });
            observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
        }
    }

    logMetrics() {
        const loadTime = performance.now() - this.startTime;
        console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
        
        if (this.metrics.has('largest-contentful-paint')) {
            const lcp = this.metrics.get('largest-contentful-paint');
            console.log(`LCP: ${lcp.startTime.toFixed(2)}ms`);
        }
    }
}

// === CONFIGURATION & STATE MANAGEMENT ===
const CONFIG = {
    // Animation settings
    animations: {
        duration: {
            fast: 0.3,
            normal: 0.6,
            slow: 1.0
        },
        easing: 'power2.out',
        stagger: 0.1
    },
    
    // Particle system settings
    particles: {
        count: 80,
        size: { min: 1, max: 4 },
        speed: { min: 0.5, max: 2 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4']
    },
    
    // Moon animation settings
    moon: {
        duration: 45,
        phases: ['new', 'waxing', 'full', 'waning']
    },
    
    // Performance settings
    performance: {
        enableParticles: true,
        enableAnimations: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        throttleResize: 16
    }
};

const STATE = {
    currentTheme: localStorage.getItem('theme') || 'light',
    currentSection: 'home',
    isLoading: true,
    audioContext: null,
    animations: new Map(),
    observers: new Map()
};

// === UTILITY FUNCTIONS ===
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

    // Get random number in range
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Format time for audio
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    // Check if element is in viewport
    isInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top <= windowHeight * (1 - threshold) && rect.bottom >= windowHeight * threshold;
    },

    // Preload images
    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
        });
    }
};

// === ENHANCED ANIMATION MANAGER ===
class ModernAnimationManager {
    constructor() {
        this.timelines = new Map();
        this.scrollTriggers = [];
        this.init();
    }

    init() {
        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger);
        
        // Initialize animations in order
        this.initLoadingAnimation();
        this.initHeroAnimations();
        this.initMoonAnimation();
        this.initSkillAnimations();
        this.initScrollAnimations();
        this.initMicroInteractions();
    }

    initLoadingAnimation() {
        const tl = gsap.timeline();
        
        tl.to('.loading-spinner .spinner-ring', {
            rotation: 360,
            duration: 1.2,
            ease: 'none',
            repeat: -1,
            stagger: -0.4
        })
        .to('.loading-content h2', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=1')
        .to('.loading-content p', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.4');

        this.timelines.set('loading', tl);
    }

    initHeroAnimations() {
        const tl = gsap.timeline({ paused: true });
        
        tl.from('.hero__title', {
            duration: 1.2,
            y: 100,
            opacity: 0,
            ease: 'power3.out'
        })
        .from('.hero__subtitle', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            ease: 'power2.out'
        }, '-=0.8')
        .from('.hero__description', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power2.out'
        }, '-=0.6')
        .from('.cta-button', {
            duration: 0.6,
            scale: 0,
            opacity: 0,
            ease: 'back.out(1.7)',
            stagger: 0.2
        }, '-=0.4')
        .from('.profile-container', {
            duration: 1,
            scale: 0,
            opacity: 0,
            ease: 'elastic.out(1, 0.5)'
        }, '-=1');

        this.timelines.set('hero', tl);
    }

    initMoonAnimation() {
        const moon = document.getElementById('heroMoon');
        if (!moon) return;

        // Main moon trajectory timeline
        const moonTimeline = gsap.timeline({ repeat: -1 });

        moonTimeline
            .fromTo(moon, {
                x: -150,
                y: 100,
                rotation: 0,
                opacity: 0
            }, {
                x: () => window.innerWidth * 0.2,
                y: -20,
                rotation: 45,
                opacity: 1,
                duration: 15,
                ease: 'power2.inOut'
            })
            .to(moon, {
                x: () => window.innerWidth * 0.8,
                y: -40,
                rotation: 180,
                duration: 20,
                ease: 'power1.inOut'
            })
            .to(moon, {
                x: () => window.innerWidth + 150,
                y: 80,
                rotation: 270,
                opacity: 0,
                duration: 12,
                ease: 'power2.inOut'
            })
            .set(moon, {
                x: -150,
                y: 100,
                rotation: 0,
                opacity: 0
            });

        // Floating effect
        gsap.to(moon, {
            y: '+=20',
            duration: 3,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        });

        // Interactive features
        this.addMoonInteractivity(moon);
        this.timelines.set('moon', moonTimeline);
    }

    addMoonInteractivity(moon) {
        moon.addEventListener('click', () => {
            this.createMoonClickEffect(moon);
        });

        moon.addEventListener('mouseenter', () => {
            gsap.to(moon, {
                scale: 1.1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        moon.addEventListener('mouseleave', () => {
            gsap.to(moon, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    }

    createMoonClickEffect(moon) {
        // Moon burst animation
        gsap.to(moon, {
            scale: 1.3,
            duration: 0.1,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1
        });

        // Create star burst
        const rect = moon.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 12; i++) {
            this.createBurstStar(centerX, centerY, i);
        }
    }

    createBurstStar(centerX, centerY, index) {
        const star = document.createElement('div');
        star.className = 'burst-star';
        star.innerHTML = '✨';
        star.style.cssText = `
            position: fixed;
            left: ${centerX}px;
            top: ${centerY}px;
            font-size: 20px;
            pointer-events: none;
            z-index: 1000;
            user-select: none;
        `;
        
        document.body.appendChild(star);

        const angle = (360 / 12) * index;
        const distance = Utils.random(80, 120);
        const x = Math.cos(angle * Math.PI / 180) * distance;
        const y = Math.sin(angle * Math.PI / 180) * distance;

        gsap.to(star, {
            x: x,
            y: y,
            opacity: 0,
            scale: 0,
            rotation: 360,
            duration: 1.5,
            ease: 'power2.out',
            onComplete: () => {
                if (document.body.contains(star)) {
                    document.body.removeChild(star);
                }
            }
        });
    }

    initSkillAnimations() {
        // Skill progress bars
        const skillBars = document.querySelectorAll('.skill-progress__fill');
        
        skillBars.forEach((bar) => {
            const progress = bar.dataset.progress;
            
            ScrollTrigger.create({
                trigger: bar.closest('.skill-card'),
                start: 'top 80%',
                onEnter: () => {
                    gsap.to(bar, {
                        width: `${progress}%`,
                        duration: 1.5,
                        ease: 'power2.out',
                        delay: Utils.random(0, 0.5)
                    });
                }
            });
        });

        // Skill card hover animations
        document.querySelectorAll('.skill-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    y: -10,
                    scale: 1.02,
                    duration: CONFIG.animations.duration.fast,
                    ease: CONFIG.animations.easing
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    y: 0,
                    scale: 1,
                    duration: CONFIG.animations.duration.fast,
                    ease: CONFIG.animations.easing
                });
            });
        });
    }

    initScrollAnimations() {
        // Section reveal animations
        document.querySelectorAll('.section').forEach((section, index) => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top 80%',
                onEnter: () => {
                    gsap.from(section.querySelectorAll('.section__title, .section__subtitle'), {
                        y: 50,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        stagger: 0.2
                    });
                }
            });
        });

        // Navbar scroll effect
        ScrollTrigger.create({
            start: 'top -80',
            end: 'bottom bottom',
            onUpdate: (self) => {
                const navbar = document.querySelector('.navbar');
                if (self.direction === -1) {
                    navbar.classList.remove('scrolled');
                } else {
                    navbar.classList.add('scrolled');
                }
            }
        });
    }

    initMicroInteractions() {
        // Button hover effects
        document.querySelectorAll('.cta-button, .demo-button').forEach(button => {
            button.addEventListener('mouseenter', () => {
                gsap.to(button, {
                    y: -2,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            });

            button.addEventListener('mouseleave', () => {
                gsap.to(button, {
                    y: 0,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            });
        });

        // Social star animations
        document.querySelectorAll('.social-star').forEach(star => {
            star.addEventListener('mouseenter', () => {
                gsap.to(star, {
                    y: -3,
                    scale: 1.1,
                    rotation: 15,
                    duration: 0.3,
                    ease: 'back.out(1.5)'
                });
            });

            star.addEventListener('mouseleave', () => {
                gsap.to(star, {
                    y: 0,
                    scale: 1,
                    rotation: 0,
                    duration: 0.3,
                    ease: 'back.out(1.5)'
                });
            });
        });
    }

    playTimeline(name) {
        const timeline = this.timelines.get(name);
        if (timeline) timeline.play();
    }

    pauseTimeline(name) {
        const timeline = this.timelines.get(name);
        if (timeline) timeline.pause();
    }

    cleanup() {
        this.scrollTriggers.forEach(trigger => trigger.kill());
        this.timelines.clear();
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
}

// === ENHANCED PARTICLE SYSTEM ===
class EnhancedParticleSystem {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.options = {
            ...CONFIG.particles,
            ...options
        };
        
        this.particles = [];
        this.animationId = null;
        this.init();
    }

    init() {
        this.createParticles();
        this.animate();
        this.handleResize();
    }

    createParticles() {
        const { count, colors, size } = this.options;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const particleSize = Utils.random(size.min, size.max);
            const color = colors[Math.floor(Math.random() * colors.length)];
            const opacity = Utils.random(0.3, 0.8);
            
            particle.style.cssText = `
                width: ${particleSize}px;
                height: ${particleSize}px;
                background: ${color};
                opacity: ${opacity};
                left: ${Utils.random(0, 100)}%;
                top: ${Utils.random(100, 120)}%;
                animation-duration: ${Utils.random(15, 25)}s;
                animation-delay: ${Utils.random(0, 10)}s;
            `;
            
            this.container.appendChild(particle);
            this.particles.push({
                element: particle,
                speed: Utils.random(this.options.speed.min, this.options.speed.max),
                x: parseFloat(particle.style.left),
                y: parseFloat(particle.style.top)
            });
        }
    }

    animate() {
        this.particles.forEach((particle, index) => {
            particle.y -= particle.speed;
            
            if (particle.y < -10) {
                particle.y = 110;
                particle.x = Utils.random(0, 100);
            }
            
            particle.element.style.left = particle.x + '%';
            particle.element.style.top = particle.y + '%';
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    handleResize() {
        window.addEventListener('resize', Utils.debounce(() => {
            this.particles.forEach(particle => {
                if (particle.x > 100) {
                    particle.x = Utils.random(0, 100);
                }
            });
        }, CONFIG.performance.throttleResize));
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.particles.forEach(particle => {
            if (this.container.contains(particle.element)) {
                this.container.removeChild(particle.element);
            }
        });
        this.particles = [];
    }
}

// === ENHANCED AUDIO MANAGER ===
class EnhancedAudioManager {
    constructor() {
        this.audioElements = new Map();
        this.currentlyPlaying = null;
        this.init();
    }

    init() {
        this.registerAudioElements();
        this.setupAudioControls();
    }

    registerAudioElements() {
        // Register all audio elements
        const audioElements = document.querySelectorAll('audio[id]');
        audioElements.forEach(audio => {
            this.audioElements.set(audio.id, {
                element: audio,
                button: document.querySelector(`[id="${audio.id.replace('Audio', '').replace('Demo', '')}DemoBtn"], [id="play${audio.id.replace('Audio', '').replace('Demo', '')}Demo"]`),
                progress: null,
                duration: null
            });
        });
    }

    setupAudioControls() {
        this.audioElements.forEach((audioData, id) => {
            const { element, button } = audioData;
            
            if (button) {
                button.addEventListener('click', () => this.toggleAudio(id));
                
                // Update button on audio events
                element.addEventListener('loadedmetadata', () => {
                    this.updateDuration(id);
                });
                
                element.addEventListener('timeupdate', () => {
                    this.updateProgress(id);
                });
                
                element.addEventListener('ended', () => {
                    this.resetAudio(id);
                });
            }
        });
    }

    async toggleAudio(audioId) {
        const audioData = this.audioElements.get(audioId);
        if (!audioData) return;

        const { element, button } = audioData;
        
        // Stop currently playing audio
        if (this.currentlyPlaying && this.currentlyPlaying !== audioId) {
            this.stopAudio(this.currentlyPlaying);
        }

        try {
            if (element.paused) {
                await element.play();
                this.currentlyPlaying = audioId;
                button.classList.add('playing');
                this.updateButtonText(button, 'Pause');
            } else {
                element.pause();
                this.currentlyPlaying = null;
                button.classList.remove('playing');
                this.updateButtonText(button, 'Play');
            }
        } catch (error) {
            console.error('Audio playback failed:', error);
            this.showAudioError(button);
        }
    }

    stopAudio(audioId) {
        const audioData = this.audioElements.get(audioId);
        if (!audioData) return;

        const { element, button } = audioData;
        element.pause();
        element.currentTime = 0;
        button.classList.remove('playing');
        this.updateButtonText(button, 'Play');
    }

    resetAudio(audioId) {
        const audioData = this.audioElements.get(audioId);
        if (!audioData) return;

        const { element, button } = audioData;
        element.currentTime = 0;
        button.classList.remove('playing');
        this.updateButtonText(button, 'Play');
        this.currentlyPlaying = null;
    }

    updateProgress(audioId) {
        const audioData = this.audioElements.get(audioId);
        if (!audioData) return;

        const { element } = audioData;
        const progressBar = document.querySelector(`#${audioId.replace('Audio', '').replace('Demo', '')}Demo`)
            ?.parentElement?.querySelector('.demo-progress__fill');
        const durationSpan = document.querySelector(`#${audioId.replace('Audio', '').replace('Demo', '')}Demo`)
            ?.parentElement?.querySelector('.demo-duration');

        if (progressBar && element.duration) {
            const progress = (element.currentTime / element.duration) * 100;
            progressBar.style.width = `${progress}%`;
        }

        if (durationSpan && element.duration) {
            const current = Utils.formatTime(element.currentTime);
            const total = Utils.formatTime(element.duration);
            durationSpan.textContent = `${current} / ${total}`;
        }
    }

    updateDuration(audioId) {
        const audioData = this.audioElements.get(audioId);
        if (!audioData) return;

        const { element } = audioData;
        const durationSpan = document.querySelector(`#${audioId.replace('Audio', '').replace('Demo', '')}Demo`)
            ?.parentElement?.querySelector('.demo-duration');

        if (durationSpan && element.duration) {
            const total = Utils.formatTime(element.duration);
            durationSpan.textContent = `0:00 / ${total}`;
        }
    }

    updateButtonText(button, text) {
        const textSpan = button.querySelector('span');
        if (textSpan) {
            const originalText = textSpan.textContent;
            if (text === 'Pause') {
                textSpan.textContent = textSpan.textContent.replace('Play', 'Pause');
            } else {
                textSpan.textContent = originalText.replace('Pause', 'Play');
            }
        }
    }

    showAudioError(button) {
        const originalText = button.textContent;
        button.textContent = 'Error Loading';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 3000);
    }
}

// === ENHANCED THEME MANAGER ===
class EnhancedThemeManager {
    constructor() {
        this.currentTheme = STATE.currentTheme;
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
        this.setupSystemThemeListener();
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
            
            // Update icon based on current theme
            this.updateThemeIcon(themeIcon);
        }
    }

    setupSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Smooth transition animation
        const themeToggle = document.getElementById('themeToggle');
        gsap.to(themeToggle, {
            rotation: 360,
            duration: 0.6,
            ease: 'back.out(1.5)'
        });
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        STATE.currentTheme = theme;
        
        // Update theme icon
        const themeIcon = document.getElementById('themeIcon');
        this.updateThemeIcon(themeIcon);
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme } 
        }));
    }

    updateThemeIcon(icon) {
        if (!icon) return;
        
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
            icon.title = 'Switch to light theme';
        } else {
            icon.className = 'fas fa-moon';
            icon.title = 'Switch to dark theme';
        }
    }
}

// === ENHANCED NAVIGATION MANAGER ===
class EnhancedNavigationManager {
    constructor() {
        this.sections = [];
        this.navLinks = [];
        this.currentSection = 'home';
        this.init();
    }

    init() {
        this.setupSections();
        this.setupNavLinks();
        this.setupScrollSpy();
        this.setupSmoothScrolling();
    }

    setupSections() {
        this.sections = Array.from(document.querySelectorAll('.section[id]'));
    }

    setupNavLinks() {
        this.navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
        
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });
    }

    setupScrollSpy() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.updateActiveSection(entry.target.id);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-20% 0px -20% 0px'
        });

        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    setupSmoothScrolling() {
        // Enhanced smooth scrolling with GSAP
        this.scrollToSection = (targetId) => {
            const target = document.getElementById(targetId);
            if (!target) return;

            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
            const targetPosition = target.offsetTop - navbarHeight;

            gsap.to(window, {
                duration: 1,
                scrollTo: {
                    y: targetPosition,
                    autoKill: false
                },
                ease: 'power2.inOut'
            });
        };
    }

    updateActiveSection(sectionId) {
        if (this.currentSection === sectionId) return;
        
        this.currentSection = sectionId;
        STATE.currentSection = sectionId;

        // Update nav link active states
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update URL without triggering scroll
        if (history.pushState) {
            history.pushState(null, null, `#${sectionId}`);
        }
    }
}

// === ENHANCED TYPEWRITER EFFECT ===
class EnhancedTypewriter {
    constructor() {
        this.init();
    }

    init() {
        const typewriterElement = document.getElementById('typewriterText');
        if (!typewriterElement || !window.Typed) return;

        const options = {
            strings: [
                'Thanatsitt^1000',
                'an AI Innovator^1000',
                'a Creative Designer^1000',
                'a Voice Artist^1000',
                'a Digital Creator^1000'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            startDelay: 1000,
            loop: true,
            showCursor: true,
            cursorChar: '|',
            smartBackspace: true,
            onComplete: () => {
                // Animation complete callback
            },
            preStringTyped: (arrayPos, self) => {
                // Before each string animation
            }
        };

        new Typed('#typewriterText', options);
    }
}

// === ENHANCED LOADING MANAGER ===
class EnhancedLoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loadStartTime = performance.now();
        this.minLoadTime = 1500; // Minimum loading time for UX
        this.init();
    }

    init() {
        this.preloadAssets();
        this.setupLoadingAnimation();
    }

    async preloadAssets() {
        const imagesToPreload = [
            'https://github.com/Pigletpeakkung/artofppage/raw/74ef50ce6221cc36848c31580fd8c1f8bea38fb6/assets/images/data/profile/1755844218313.jpg'
        ];

        try {
            await Promise.all(imagesToPreload.map(src => Utils.preloadImage(src)));
            this.assetsLoaded();
        } catch (error) {
            console.warn('Some assets failed to preload:', error);
            this.assetsLoaded();
        }
    }

    // === ENHANCED LOADING MANAGER CONTINUED ===
    setupLoadingAnimation() {
        // Enhanced loading text animation
        const loadingText = document.querySelector('.loading-content p');
        if (loadingText) {
            const messages = [
                'Initializing cosmic systems...',
                'Loading digital universe...',
                'Preparing stellar experience...',
                'Calibrating AI systems...',
                'Ready for launch!'
            ];

            let messageIndex = 0;
            const messageInterval = setInterval(() => {
                if (messageIndex < messages.length - 1) {
                    gsap.to(loadingText, {
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => {
                            messageIndex++;
                            loadingText.textContent = messages[messageIndex];
                            gsap.to(loadingText, {
                                opacity: 1,
                                duration: 0.3
                            });
                        }
                    });
                } else {
                    clearInterval(messageInterval);
                }
            }, 800);
        }
    }

    async assetsLoaded() {
        const elapsedTime = performance.now() - this.loadStartTime;
        const remainingTime = Math.max(0, this.minLoadTime - elapsedTime);

        // Wait for minimum load time
        setTimeout(() => {
            this.hideLoadingScreen();
        }, remainingTime);
    }

    hideLoadingScreen() {
        if (!this.loadingScreen) return;

        // Stop loading animations
        const loadingTimeline = window.animationManager?.timelines.get('loading');
        if (loadingTimeline) loadingTimeline.kill();

        // Fade out loading screen
        gsap.to(this.loadingScreen, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                this.loadingScreen.classList.add('loading-screen--hidden');
                STATE.isLoading = false;
                
                // Start main animations
                this.initMainAnimations();
                
                // Log performance metrics
                window.performanceMonitor?.logMetrics();
            }
        });
    }

    initMainAnimations() {
        // Start hero animations
        window.animationManager?.playTimeline('hero');
        
        // Initialize AOS if available
        if (window.AOS) {
            AOS.init({
                duration: 800,
                offset: 100,
                easing: 'ease-out-cubic',
                once: true,
                mirror: false
            });
        }

        // Start typewriter effect
        new EnhancedTypewriter();
    }
}

// === ENHANCED UI INTERACTIONS ===
class EnhancedUIManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupBackToTop();
        this.setupNewsletterForm();
        this.setupNotificationSystem();
        this.setupMiscInteractions();
    }

    setupBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (!backToTopBtn) return;

        // Show/hide on scroll
        const scrollTrigger = ScrollTrigger.create({
            start: 'top -300',
            end: 'bottom bottom',
            onUpdate: (self) => {
                if (self.progress > 0.1) {
                    backToTopBtn.classList.add('back-to-top--visible');
                } else {
                    backToTopBtn.classList.remove('back-to-top--visible');
                }
            }
        });

        // Click handler
        backToTopBtn.addEventListener('click', () => {
            gsap.to(window, {
                duration: 1.2,
                scrollTo: { y: 0 },
                ease: 'power2.inOut'
            });

            // Button animation
            gsap.to(backToTopBtn, {
                scale: 0.9,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut'
            });
        });
    }

    setupNewsletterForm() {
        const newsletterForm = document.getElementById('newsletterForm');
        if (!newsletterForm) return;

        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('newsletterEmail')?.value;
            const messageDiv = document.getElementById('newsletterMessage');
            
            if (!email) {
                this.showFormMessage(messageDiv, 'Please enter your email address.', 'error');
                return;
            }

            if (!this.isValidEmail(email)) {
                this.showFormMessage(messageDiv, 'Please enter a valid email address.', 'error');
                return;
            }

            // Simulate API call
            const submitBtn = newsletterForm.querySelector('.newsletter-submit');
            const originalContent = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                this.showFormMessage(messageDiv, 'Successfully subscribed! Welcome aboard! 🚀', 'success');
                newsletterForm.reset();
                
            } catch (error) {
                this.showFormMessage(messageDiv, 'Something went wrong. Please try again later.', 'error');
            } finally {
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
            }
        });
    }

    setupNotificationSystem() {
        const notifyBtn = document.getElementById('notifyBtn');
        if (!notifyBtn) return;

        notifyBtn.addEventListener('click', () => {
            this.showNotification('🚀 You\'ll be notified when new projects are launched!', 'success');
            
            // Button animation
            gsap.to(notifyBtn, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1
            });

            // Disable button temporarily
            notifyBtn.disabled = true;
            notifyBtn.innerHTML = '<i class="fas fa-check"></i> <span>Subscribed!</span>';
            
            setTimeout(() => {
                notifyBtn.disabled = false;
                notifyBtn.innerHTML = '<i class="fas fa-bell"></i> <span>Notify Me</span>';
            }, 3000);
        });
    }

    setupMiscInteractions() {
        // Update copyright year
        const currentYearElement = document.getElementById('current-year');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }

        // Profile orbit interactions
        document.querySelectorAll('.profile-orbit').forEach((orbit, index) => {
            orbit.addEventListener('click', () => {
                this.createOrbitEffect(orbit, index);
            });
        });

        // Voice demo button enhancements
        const voiceDemoBtn = document.getElementById('voiceDemoBtn');
        if (voiceDemoBtn) {
            voiceDemoBtn.addEventListener('click', () => {
                this.createVoiceWave(voiceDemoBtn);
            });
        }
    }

    createOrbitEffect(orbit, index) {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            inset: -10px;
            border: 2px solid var(--primary-color);
            border-radius: 50%;
            opacity: 0.8;
            animation: none;
            pointer-events: none;
        `;
        
        orbit.appendChild(ripple);

        gsap.fromTo(ripple, {
            scale: 0.8,
            opacity: 0.8
        }, {
            scale: 1.5,
            opacity: 0,
            duration: 1,
            ease: 'power2.out',
            onComplete: () => {
                if (orbit.contains(ripple)) {
                    orbit.removeChild(ripple);
                }
            }
        });
    }

    createVoiceWave(button) {
        const waves = 3;
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < waves; i++) {
            const wave = document.createElement('div');
            wave.style.cssText = `
                position: fixed;
                left: ${centerX - 25}px;
                top: ${centerY - 25}px;
                width: 50px;
                height: 50px;
                border: 2px solid var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
            `;
            
            document.body.appendChild(wave);

            gsap.fromTo(wave, {
                scale: 0,
                opacity: 0.8
            }, {
                scale: 2 + i * 0.5,
                opacity: 0,
                duration: 1.5,
                delay: i * 0.2,
                ease: 'power2.out',
                onComplete: () => {
                    if (document.body.contains(wave)) {
                        document.body.removeChild(wave);
                    }
                }
            });
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFormMessage(messageDiv, message, type) {
        if (!messageDiv) return;

        messageDiv.textContent = message;
        messageDiv.className = `form-message form-message--${type}`;
        
        gsap.fromTo(messageDiv, {
            opacity: 0,
            y: -10
        }, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            gsap.to(messageDiv, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    messageDiv.textContent = '';
                    messageDiv.className = 'form-message';
                }
            });
        }, 5000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <span class="notification__message">${message}</span>
                <button class="notification__close" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-card);
            border: 1px solid var(--border-default);
            border-radius: var(--border-radius-lg);
            padding: var(--space-md);
            box-shadow: var(--shadow-large);
            z-index: 10000;
            max-width: 400px;
            backdrop-filter: var(--glass-blur);
        `;

        document.body.appendChild(notification);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification__close');
        closeBtn.addEventListener('click', () => {
            this.closeNotification(notification);
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            this.closeNotification(notification);
        }, 5000);

        // Animate in
        gsap.fromTo(notification, {
            x: 100,
            opacity: 0
        }, {
            x: 0,
            opacity: 1,
            duration: 0.4,
            ease: 'back.out(1.5)'
        });
    }

    closeNotification(notification) {
        gsap.to(notification, {
            x: 100,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut',
            onComplete: () => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }
        });
    }
}

// === ACCESSIBILITY ENHANCEMENTS ===
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupReducedMotion();
        this.setupAnnouncements();
    }

    setupKeyboardNavigation() {
        // Escape key handlers
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Stop any playing audio
                if (window.audioManager?.currentlyPlaying) {
                    window.audioManager.stopAudio(window.audioManager.currentlyPlaying);
                }
                
                // Close any notifications
                document.querySelectorAll('.notification').forEach(notification => {
                    window.uiManager.closeNotification(notification);
                });
            }
        });

        // Tab trap for modals (if any are added later)
        this.setupTabTrap();
    }

    setupTabTrap() {
        const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
        
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            // Add tab trap logic for future modal implementations
        });
    }

    setupFocusManagement() {
        // Enhanced focus indicators
        document.addEventListener('focusin', (e) => {
            if (e.target.classList.contains('interactive-element')) {
                gsap.to(e.target, {
                    scale: 1.02,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            }
        });

        document.addEventListener('focusout', (e) => {
            if (e.target.classList.contains('interactive-element')) {
                gsap.to(e.target, {
                    scale: 1,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            }
        });
    }

    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleReducedMotion = (mediaQuery) => {
            if (mediaQuery.matches) {
                // Disable complex animations
                CONFIG.performance.enableAnimations = false;
                
                // Stop particle systems
                if (window.heroParticles) {
                    window.heroParticles.destroy();
                }
                if (window.footerParticles) {
                    window.footerParticles.destroy();
                }
                
                // Disable moon animation
                const moonTimeline = window.animationManager?.timelines.get('moon');
                if (moonTimeline) {
                    moonTimeline.pause();
                }
            }
        };

        prefersReducedMotion.addEventListener('change', handleReducedMotion);
        handleReducedMotion(prefersReducedMotion);
    }

    setupAnnouncements() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-announcements';
        document.body.appendChild(liveRegion);

        // Listen for theme changes
        window.addEventListener('themeChanged', (e) => {
            this.announce(`Theme changed to ${e.detail.theme} mode`);
        });
    }

    announce(message) {
        const liveRegion = document.getElementById('live-announcements');
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
}

// === ERROR HANDLING & MONITORING ===
class ErrorManager {
    constructor() {
        this.errors = [];
        this.init();
    }

    init() {
        this.setupErrorHandlers();
        this.setupPerformanceMonitoring();
    }

    setupErrorHandlers() {
        window.addEventListener('error', (e) => {
            this.logError('JavaScript Error', e.error, e.filename, e.lineno);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.logError('Unhandled Promise Rejection', e.reason);
        });
    }

    setupPerformanceMonitoring() {
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 50) {
                        console.warn(`Long task detected: ${entry.duration}ms`);
                    }
                });
            });
            observer.observe({ entryTypes: ['longtask'] });
        }
    }

    logError(type, error, filename = '', lineno = 0) {
        const errorInfo = {
            type,
            message: error?.message || error,
            filename,
            lineno,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errors.push(errorInfo);
        console.error('Error logged:', errorInfo);

        // In production, send to error tracking service
        // this.sendToErrorTracking(errorInfo);
    }

    sendToErrorTracking(errorInfo) {
        // Implementation for error tracking service
        // Example: Sentry, LogRocket, etc.
    }
}

// === MAIN APPLICATION INITIALIZATION ===
class PortfolioApp {
    constructor() {
        this.managers = {};
        this.init();
    }

    async init() {
        try {
            // Initialize performance monitoring first
            this.managers.performance = new PerformanceMonitor();
            window.performanceMonitor = this.managers.performance;

            // Initialize error handling
            this.managers.error = new ErrorManager();

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize core managers
            await this.initializeManagers();

            // Initialize particle systems if enabled
            if (CONFIG.performance.enableParticles) {
                this.initializeParticleSystems();
            }

            console.log('🚀 Portfolio App initialized successfully');

        } catch (error) {
            console.error('Failed to initialize Portfolio App:', error);
            this.managers.error?.logError('Initialization Error', error);
        }
    }

    async initializeManagers() {
        // Initialize managers in order of dependency
        this.managers.theme = new EnhancedThemeManager();
        window.themeManager = this.managers.theme;

        this.managers.animation = new ModernAnimationManager();
        window.animationManager = this.managers.animation;

        this.managers.audio = new EnhancedAudioManager();
        window.audioManager = this.managers.audio;

        this.managers.navigation = new EnhancedNavigationManager();
        window.navigationManager = this.managers.navigation;

        this.managers.loading = new EnhancedLoadingManager();
        window.loadingManager = this.managers.loading;

        this.managers.ui = new EnhancedUIManager();
        window.uiManager = this.managers.ui;

        this.managers.accessibility = new AccessibilityManager();
        window.accessibilityManager = this.managers.accessibility;
    }

    initializeParticleSystems() {
        // Hero particles
        this.managers.heroParticles = new EnhancedParticleSystem('hero-particles', {
            count: 60,
            colors: ['#6366f1', '#8b5cf6', '#ec4899']
        });
        window.heroParticles = this.managers.heroParticles;

        // Footer particles
        this.managers.footerParticles = new EnhancedParticleSystem('footer-particles', {
            count: 40,
            colors: ['#6366f1', '#8b5cf6'],
            size: { min: 1, max: 3 }
        });
        window.footerParticles = this.managers.footerParticles;
    }

    destroy() {
        // Cleanup all managers
        Object.values(this.managers).forEach(manager => {
            if (manager.destroy) {
                manager.destroy();
            }
            if (manager.cleanup) {
                manager.cleanup();
            }
        });

        // Clear global references
        Object.keys(window).forEach(key => {
            if (key.includes('Manager') || key.includes('Particles')) {
                delete window[key];
            }
        });
    }
}

// === INITIALIZE APPLICATION ===
(function() {
    'use strict';
    
    // Initialize app when ready
    const app = new PortfolioApp();
    window.portfolioApp = app;

    // Expose utilities globally for debugging
    if (process?.env?.NODE_ENV === 'development') {
        window.CONFIG = CONFIG;
        window.STATE = STATE;
        window.Utils = Utils;
    }

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause non-essential animations when tab is hidden
            Object.values(app.managers).forEach(manager => {
                if (manager.pause) manager.pause();
            });
        } else {
            // Resume animations when tab becomes visible
            Object.values(app.managers).forEach(manager => {
                if (manager.resume) manager.resume();
            });
        }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
        app.destroy();
    });

})();

// === SERVICE WORKER REGISTRATION (OPTIONAL) ===
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
