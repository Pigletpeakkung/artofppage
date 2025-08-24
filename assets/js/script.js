/**
 * Enhanced Portfolio Script with Moon Animation & Advanced Features
 * Author: Thanatsitt Santisamranwilai
 * Modern JavaScript with GSAP, Particles.js, and interactive elements
 */

// ===============================================
// GLOBAL CONFIGURATION & UTILITIES
// ===============================================

const CONFIG = {
    ANIMATION_DURATION: 800,
    MOON_TRAVEL_TIME: 60, // seconds for complete moon cycle
    PARTICLES_COUNT: 80,
    TYPEWRITER_SPEED: 100,
    AUDIO_FADE_DURATION: 500
};

const utils = {
    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    throttle(func, delay) {
        let lastCall = 0;
        return (...args) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};

// ===============================================
// ENHANCED ANIMATION MANAGER
// ===============================================

class AnimationManager {
    constructor() {
        this.moonTimeline = null;
        this.isInitialized = false;
        this.audioInstances = new Map();
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            this.initMoonAnimation();
            this.initTypewriter();
            this.initHeroAnimations();
            this.initParticleSystem();
            this.initScrollAnimations();
            this.initHoverAnimations();
            this.initAudioHandlers();
            this.initProgressBars();
            this.initIntersectionObserver();
            
            this.isInitialized = true;
            console.log('✨ Animation Manager initialized successfully');
        } catch (error) {
            console.error('❌ Animation Manager initialization failed:', error);
        }
    }

    // ===============================================
    // MOON ANIMATION SYSTEM
    // ===============================================

    initMoonAnimation() {
        const moon = document.getElementById('heroMoon');
        if (!moon) return;

        // Kill existing timeline if it exists
        if (this.moonTimeline) {
            this.moonTimeline.kill();
        }

        // Create responsive moon travel path
        const screenWidth = window.innerWidth;
        const startX = -150;
        const endX = screenWidth + 150;
        const peakY = window.innerHeight < 768 ? -20 : -50;

        // Main moon movement timeline
        this.moonTimeline = gsap.timeline({ repeat: -1 });

        this.moonTimeline
            // Phase 1: Moon rises from left
            .fromTo(moon, {
                x: startX,
                y: 100,
                rotation: 0,
                opacity: 0,
                scale: window.innerWidth < 768 ? 0.7 : 1
            }, {
                x: screenWidth * 0.25,
                y: peakY,
                rotation: 60,
                opacity: 1,
                duration: CONFIG.MOON_TRAVEL_TIME * 0.25,
                ease: "power2.out"
            })
            // Phase 2: Moon travels across zenith
            .to(moon, {
                x: screenWidth * 0.75,
                y: peakY - 20,
                rotation: 180,
                duration: CONFIG.MOON_TRAVEL_TIME * 0.4,
                ease: "none"
            })
            // Phase 3: Moon sets on right
            .to(moon, {
                x: endX,
                y: 80,
                rotation: 300,
                opacity: 0,
                duration: CONFIG.MOON_TRAVEL_TIME * 0.35,
                ease: "power2.in"
            })
            // Phase 4: Reset position (invisible pause)
            .set(moon, {
                x: startX,
                y: 100,
                rotation: 0,
                opacity: 0
            })
            .to({}, { duration: 5 }); // Pause before next cycle

        // Add floating animation
        gsap.to(moon, {
            y: "+=15",
            duration: 4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
        });

        // Add subtle rotation wobble
        gsap.to(moon, {
            rotation: "+=10",
            duration: 6,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
        });

        // Enhanced interaction handlers
        this.setupMoonInteractions(moon);
    }

    setupMoonInteractions(moon) {
        // Click/touch interaction
        const handleMoonClick = (e) => {
            e.preventDefault();
            this.createStarBurst(moon);
            this.moonClickEffect(moon);
        };

        // Keyboard interaction
        const handleMoonKeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMoonClick(e);
            }
        };

        // Mouse hover effects
        const handleMoonHover = () => {
            gsap.to(moon, {
                scale: 1.1,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        };

        const handleMoonLeave = () => {
            gsap.to(moon, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        };

        // Add event listeners
        moon.addEventListener('click', handleMoonClick);
        moon.addEventListener('keydown', handleMoonKeydown);
        moon.addEventListener('mouseenter', handleMoonHover);
        moon.addEventListener('mouseleave', handleMoonLeave);

        // Add touch support
        moon.addEventListener('touchstart', handleMoonClick, { passive: false });
    }

    moonClickEffect(moon) {
        // Scale pulse effect
        const tl = gsap.timeline();
        
        tl.to(moon, {
            scale: 1.3,
            duration: 0.1,
            ease: "power2.out"
        })
        .to(moon, {
            scale: 1,
            duration: 0.4,
            ease: "elastic.out(1, 0.5)"
        });

        // Glow effect
        const moonGlow = moon.querySelector('.moon-glow');
        if (moonGlow) {
            gsap.fromTo(moonGlow, {
                opacity: 0.6,
                scale: 1
            }, {
                opacity: 1,
                scale: 1.5,
                duration: 0.3,
                ease: "power2.out",
                yoyo: true,
                repeat: 1
            });
        }
    }

    createStarBurst(moon) {
        const rect = moon.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const starCount = 8;
        const stars = ['✨', '⭐', '🌟', '💫'];

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.innerHTML = stars[Math.floor(Math.random() * stars.length)];
            star.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                font-size: ${16 + Math.random() * 8}px;
                pointer-events: none;
                z-index: 1000;
                user-select: none;
            `;
            
            document.body.appendChild(star);

            const angle = (360 / starCount) * i + Math.random() * 30;
            const distance = 60 + Math.random() * 40;
            const x = Math.cos(angle * Math.PI / 180) * distance;
            const y = Math.sin(angle * Math.PI / 180) * distance;

            gsap.to(star, {
                x: x,
                y: y,
                opacity: 0,
                scale: 0,
                rotation: Math.random() * 360,
                duration: 1 + Math.random() * 0.5,
                ease: "power2.out",
                onComplete: () => {
                    if (document.body.contains(star)) {
                        document.body.removeChild(star);
                    }
                }
            });
        }
    }

    // ===============================================
    // TYPEWRITER EFFECT
    // ===============================================

    initTypewriter() {
        const typewriterElement = document.getElementById('typewriterText');
        if (!typewriterElement || typeof Typed === 'undefined') return;

        new Typed('#typewriterText', {
            strings: [
                'Thanatsitt',
                'an AI Innovator',
                'a Creative Designer', 
                'a Voice Artist',
                'a Digital Creator',
                'Thanatsitt'
            ],
            typeSpeed: CONFIG.TYPEWRITER_SPEED,
            backSpeed: 50,
            backDelay: 2000,
            startDelay: 1000,
            loop: true,
            showCursor: true,
            cursorChar: '|',
            autoInsertCss: true
        });
    }

    // ===============================================
    // HERO ANIMATIONS
    // ===============================================

    initHeroAnimations() {
        const tl = gsap.timeline();
        
        tl.from(".hero__title", {
            duration: 1.2,
            y: 100,
            opacity: 0,
            ease: "power3.out"
        })
        .from(".hero__subtitle", {
            duration: 0.8,
            y: 50,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.8")
        .from(".hero__description", {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.6")
        .from(".cta-button", {
            duration: 0.6,
            scale: 0,
            opacity: 0,
            ease: "back.out(1.7)",
            stagger: 0.2
        }, "-=0.4")
        .from(".profile-container", {
            duration: 1,
            scale: 0,
            opacity: 0,
            ease: "elastic.out(1, 0.5)"
        }, "-=1");
    }

    // ===============================================
    // PARTICLE SYSTEM
    // ===============================================

    initParticleSystem() {
        if (typeof particlesJS === 'undefined') return;

        // Hero particles
        this.initHeroParticles();
        
        // Footer particles
        this.initFooterParticles();
    }

    initHeroParticles() {
        const heroParticles = document.getElementById('hero-particles');
        if (!heroParticles) return;

        particlesJS('hero-particles', {
            particles: {
                number: {
                    value: CONFIG.PARTICLES_COUNT,
                    density: { enable: true, value_area: 800 }
                },
                color: { value: "#ffffff" },
                shape: {
                    type: "circle",
                    stroke: { width: 0, color: "#000000" }
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: { enable: true, speed: 1, opacity_min: 0.1 }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: { enable: true, speed: 2, size_min: 0.1 }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#ffffff",
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 1 } },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }

    initFooterParticles() {
        const footerParticles = document.getElementById('footer-particles');
        if (!footerParticles) return;

        particlesJS('footer-particles', {
            particles: {
                number: { value: 50, density: { enable: true, value_area: 800 } },
                color: { value: "#4f46e5" },
                shape: { type: "circle" },
                opacity: {
                    value: 0.3,
                    random: true,
                    anim: { enable: true, speed: 1, opacity_min: 0.1 }
                },
                size: {
                    value: 2,
                    random: true,
                    anim: { enable: true, speed: 2, size_min: 0.1 }
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: "top",
                    random: false,
                    straight: false,
                    out_mode: "out"
                }
            },
            retina_detect: true
        });
    }

    // ===============================================
    // SCROLL ANIMATIONS
    // ===============================================

    initScrollAnimations() {
        if (typeof gsap === 'undefined' || !gsap.registerPlugin) return;

        gsap.registerPlugin(ScrollTrigger);

        // Section reveal animations
        gsap.utils.toArray('.section').forEach(section => {
            gsap.fromTo(section, {
                opacity: 0,
                y: 50
            }, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Skill cards stagger animation
        const skillCards = document.querySelectorAll('.skill-card');
        if (skillCards.length > 0) {
            gsap.fromTo(skillCards, {
                opacity: 0,
                y: 60,
                scale: 0.8
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: "back.out(1.7)",
                stagger: 0.2,
                scrollTrigger: {
                    trigger: skillCards[0].closest('.skills__grid'),
                    start: "top 80%"
                }
            });
        }
    }

    // ===============================================
    // PROGRESS BAR ANIMATIONS
    // ===============================================

    initProgressBars() {
        const progressBars = document.querySelectorAll('.skill-progress__fill');
        
        progressBars.forEach(bar => {
            const progress = parseInt(bar.dataset.progress) || 0;
            
            gsap.fromTo(bar, {
                width: '0%'
            }, {
                width: `${progress}%`,
                duration: 2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: bar,
                    start: "top 85%",
                    onStart: () => this.animatePercentage(bar, progress)
                }
            });
        });
    }

    animatePercentage(progressBar, targetValue) {
        const percentageElement = progressBar.closest('.skill-card__progress')
            ?.querySelector('.progress-percentage');
        
        if (!percentageElement) return;

        gsap.fromTo({ value: 0 }, {
            value: targetValue,
            duration: 2,
            ease: "power2.out",
            onUpdate: function() {
                percentageElement.textContent = `${Math.round(this.targets()[0].value)}%`;
            }
        });
    }

    // ===============================================
    // AUDIO HANDLING SYSTEM
    // ===============================================

    initAudioHandlers() {
        this.setupVoiceDemoControls();
        this.setupHeroAudio();
        
        // Global audio error handler
        window.handleAudioError = (audio) => {
            console.warn('Audio failed to load:', audio.src);
            this.handleAudioError(audio);
        };
    }

    setupVoiceDemoControls() {
        const demoButtons = [
            { buttonId: 'playIntroDemo', audioId: 'introDemo' },
            { buttonId: 'playHobbyDemo', audioId: 'hobbyDemo' }
        ];

        demoButtons.forEach(({ buttonId, audioId }) => {
            const button = document.getElementById(buttonId);
            const audio = document.getElementById(audioId);
            
            if (!button || !audio) return;

            this.audioInstances.set(audioId, {
                audio,
                button,
                isPlaying: false,
                progressBar: button.closest('.demo-card')?.querySelector('.demo-progress__fill'),
                durationLabel: button.closest('.demo-card')?.querySelector('.demo-duration')
            });

            this.setupAudioControl(audioId);
        });
    }

    setupAudioControl(audioId) {
        const instance = this.audioInstances.get(audioId);
        if (!instance) return;

        const { audio, button, progressBar, durationLabel } = instance;

        // Button click handler
        button.addEventListener('click', () => {
            if (instance.isPlaying) {
                this.pauseAudio(audioId);
            } else {
                this.playAudio(audioId);
            }
        });

        // Audio event listeners
        audio.addEventListener('loadedmetadata', () => {
            if (durationLabel) {
                durationLabel.textContent = `0:00 / ${utils.formatTime(audio.duration)}`;
            }
        });

        audio.addEventListener('timeupdate', () => {
            if (progressBar && audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = `${progress}%`;
            }
            
            if (durationLabel) {
                durationLabel.textContent = 
                    `${utils.formatTime(audio.currentTime)} / ${utils.formatTime(audio.duration)}`;
            }
        });

        audio.addEventListener('ended', () => {
            this.resetAudio(audioId);
        });

        audio.addEventListener('error', () => {
            this.handleAudioError(audio);
        });
    }

    playAudio(audioId) {
        // Pause all other audio first
        this.pauseAllAudio();

        const instance = this.audioInstances.get(audioId);
        if (!instance) return;

        const { audio, button } = instance;

        audio.play().then(() => {
            instance.isPlaying = true;
            this.updateButtonState(button, 'playing');
        }).catch(error => {
            console.error('Audio play failed:', error);
            this.handleAudioError(audio);
        });
    }

    pauseAudio(audioId) {
        const instance = this.audioInstances.get(audioId);
        if (!instance) return;

        const { audio, button } = instance;
        
        audio.pause();
        instance.isPlaying = false;
        this.updateButtonState(button, 'paused');
    }

    resetAudio(audioId) {
        const instance = this.audioInstances.get(audioId);
        if (!instance) return;

        const { audio, button, progressBar } = instance;
        
        audio.currentTime = 0;
        instance.isPlaying = false;
        this.updateButtonState(button, 'stopped');
        
        if (progressBar) {
            progressBar.style.width = '0%';
        }
    }

    pauseAllAudio() {
        this.audioInstances.forEach((instance, audioId) => {
            if (instance.isPlaying) {
                this.pauseAudio(audioId);
            }
        });
    }

    updateButtonState(button, state) {
        const icon = button.querySelector('i');
        const text = button.querySelector('span');
        
        switch (state) {
            case 'playing':
                if (icon) icon.className = 'fas fa-pause';
                if (text) text.textContent = text.textContent.replace('Play', 'Pause');
                button.classList.add('playing');
                break;
            case 'paused':
            case 'stopped':
                if (icon) icon.className = 'fas fa-play';
                if (text) text.textContent = text.textContent.replace('Pause', 'Play');
                button.classList.remove('playing');
                break;
        }
    }

    setupHeroAudio() {
        const voiceBtn = document.getElementById('voiceDemoBtn');
        const heroAudio = document.getElementById('heroVoiceIntroAudio');
        
        if (!voiceBtn || !heroAudio) return;

        voiceBtn.addEventListener('click', () => {
            if (heroAudio.paused) {
                this.pauseAllAudio();
                heroAudio.play().catch(error => {
                    console.error('Hero audio play failed:', error);
                });
            } else {
                heroAudio.pause();
            }
        });
    }

    handleAudioError(audio) {
        const button = audio.closest('.demo-card, .hero__image')?.querySelector('button');
        if (button) {
            button.style.opacity = '0.5';
            button.disabled = true;
            button.title = 'Audio unavailable';
        }
    }

    // ===============================================
    // HOVER ANIMATIONS & INTERACTIONS
    // ===============================================

    initHoverAnimations() {
        // Skill card hover effects
        const skillCards = document.querySelectorAll('.skill-card');
        skillCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    y: -10,
                    scale: 1.02,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });

        // CTA button hover effects
        const ctaButtons = document.querySelectorAll('.cta-button');
        ctaButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                gsap.to(button, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "back.out(1.7)"
                });
            });

            button.addEventListener('mouseleave', () => {
                gsap.to(button, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }

    // ===============================================
    // INTERSECTION OBSERVER FOR PERFORMANCE
    // ===============================================

    initIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, observerOptions);

        // Observe sections for performance optimization
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }

    // ===============================================
    // RESPONSIVE HANDLING
    // ===============================================

    handleResize() {
        // Reinitialize moon animation for new screen size
        this.initMoonAnimation();
        
        // Update particle systems
        if (window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom.forEach(pJS => {
                if (pJS.pJS) {
                    pJS.pJS.fn.canvasSize();
                    pJS.pJS.fn.canvasPaint();
                }
            });
        }
    }
}

// ===============================================
// THEME MANAGER
// ===============================================

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.themeToggle) return;

        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Keyboard support
        this.themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        if (this.themeIcon) {
            this.themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        // Animate theme transition
        gsap.to(document.body, {
            duration: 0.3,
            ease: "power2.inOut"
        });
    }
}

// ===============================================
// NAVIGATION MANAGER
// ===============================================

class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.backToTop = document.getElementById('backToTop');
        this.lastScrollTop = 0;
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
        this.setupScrollBehavior();
        this.setupBackToTop();
    }

    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: {
                            y: targetElement,
                            offsetY: 80
                        },
                        ease: "power2.inOut"
                    });
                }
            });
        });
    }

        setupActiveNavigation() {
        const sections = document.querySelectorAll('.section[id]');
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: 0
        };

        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionId = entry.target.id;
                const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                
                if (entry.isIntersecting) {
                    // Remove active class from all nav links
                    this.navLinks.forEach(link => link.classList.remove('active'));
                    // Add active class to current nav link
                    if (navLink) navLink.classList.add('active');
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            navObserver.observe(section);
        });
    }

    setupScrollBehavior() {
        const handleScroll = utils.throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Navbar hide/show behavior
            if (this.navbar) {
                if (scrollTop > this.lastScrollTop && scrollTop > 100) {
                    // Scrolling down
                    gsap.to(this.navbar, {
                        y: -100,
                        duration: 0.3,
                        ease: "power2.inOut"
                    });
                } else {
                    // Scrolling up
                    gsap.to(this.navbar, {
                        y: 0,
                        duration: 0.3,
                        ease: "power2.inOut"
                    });
                }
            }

            this.lastScrollTop = scrollTop;
        }, 100);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    setupBackToTop() {
        if (!this.backToTop) return;

        const handleScroll = utils.throttle(() => {
            const scrollTop = window.pageYOffset;
            
            if (scrollTop > 300) {
                gsap.to(this.backToTop, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                    ease: "back.out(1.7)"
                });
                this.backToTop.style.pointerEvents = 'auto';
            } else {
                gsap.to(this.backToTop, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.3,
                    ease: "power2.inOut"
                });
                this.backToTop.style.pointerEvents = 'none';
            }
        }, 100);

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Back to top click handler
        this.backToTop.addEventListener('click', () => {
            gsap.to(window, {
                duration: 1.5,
                scrollTo: { y: 0 },
                ease: "power2.inOut"
            });
        });
    }
}

// ===============================================
// LOADING SCREEN MANAGER
// ===============================================

class LoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.init();
    }

    init() {
        this.showLoadingScreen();
        this.preloadAssets();
    }

    showLoadingScreen() {
        if (!this.loadingScreen) return;

        gsap.set(this.loadingScreen, {
            opacity: 1,
            display: 'flex'
        });

        // Animate loading spinner
        gsap.to('.spinner-ring', {
            rotation: 360,
            duration: 2,
            repeat: -1,
            ease: "none",
            stagger: 0.2
        });
    }

    preloadAssets() {
        const assets = [
            // Images
            'https://github.com/Pigletpeakkung/artofppage/raw/74ef50ce6221cc36848c31580fd8c1f8bea38fb6/assets/images/data/profile/1755844218313.jpg',
            // Audio files
            'https://github.com/Pigletpeakkung/artofppage/raw/feb49ee7640dd7d8aa8ece40bbd8258b69ef1e98/assets/demo/voice/intro/Thann_Intro.wav',
            'https://github.com/Pigletpeakkung/artofppage/raw/92520ec59362efa20d141a2b031dbb40d28f4f3a/assets/demo/voice/act/Thanattsitt-Hobby-Freetalk.mp3'
        ];

        let loadedCount = 0;
        const totalAssets = assets.length;

        const updateProgress = () => {
            loadedCount++;
            const progress = (loadedCount / totalAssets) * 100;
            
            // Update progress indicator if exists
            const progressIndicator = document.querySelector('.loading-progress');
            if (progressIndicator) {
                progressIndicator.style.width = `${progress}%`;
            }

            if (loadedCount === totalAssets) {
                this.hideLoadingScreen();
            }
        };

        // Preload images
        assets.forEach(src => {
            if (src.includes('.jpg') || src.includes('.png') || src.includes('.webp')) {
                const img = new Image();
                img.onload = updateProgress;
                img.onerror = updateProgress;
                img.src = src;
            } else if (src.includes('.wav') || src.includes('.mp3')) {
                const audio = new Audio();
                audio.addEventListener('canplaythrough', updateProgress);
                audio.addEventListener('error', updateProgress);
                audio.src = src;
            }
        });

        // Minimum loading time
        setTimeout(() => {
            if (loadedCount < totalAssets) {
                this.hideLoadingScreen();
            }
        }, 3000);
    }

    hideLoadingScreen() {
        if (!this.loadingScreen) return;

        gsap.to(this.loadingScreen, {
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
                this.loadingScreen.style.display = 'none';
                document.body.classList.add('loaded');
                
                // Initialize animations after loading
                if (window.animationManager) {
                    window.animationManager.init();
                }
            }
        });
    }
}

// ===============================================
// NOTIFICATION SYSTEM
// ===============================================

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <i class="notification__icon fas fa-${this.getIcon(type)}"></i>
                <span class="notification__message">${message}</span>
                <button class="notification__close" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        notification.style.cssText = `
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            border: 1px solid var(--glass-border);
            border-radius: var(--border-radius-lg);
            padding: var(--space-md);
            margin-bottom: var(--space-sm);
            pointer-events: auto;
            transform: translateX(100%);
            opacity: 0;
        `;

        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Animate in
        gsap.to(notification, {
            x: 0,
            opacity: 1,
            duration: 0.3,
            ease: "back.out(1.7)"
        });

        // Setup close button
        const closeBtn = notification.querySelector('.notification__close');
        closeBtn.addEventListener('click', () => {
            this.hide(notification);
        });

        // Auto hide
        if (duration > 0) {
            setTimeout(() => {
                this.hide(notification);
            }, duration);
        }
    }

    hide(notification) {
        gsap.to(notification, {
            x: '100%',
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications = this.notifications.filter(n => n !== notification);
            }
        });
    }

    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }
}

// ===============================================
// FORM HANDLERS
// ===============================================

class FormManager {
    constructor() {
        this.notificationManager = new NotificationManager();
        this.init();
    }

    init() {
        this.setupNewsletterForm();
        this.setupNotifyButton();
    }

    setupNewsletterForm() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('newsletterEmail');
            const message = document.getElementById('newsletterMessage');
            
            if (!emailInput) return;

            const email = emailInput.value.trim();
            if (!this.validateEmail(email)) {
                this.showFormMessage(message, 'Please enter a valid email address.', 'error');
                return;
            }

            this.showFormMessage(message, 'Subscribing...', 'loading');

            // Simulate API call
            try {
                await this.simulateAPICall();
                this.showFormMessage(message, 'Successfully subscribed! 🚀', 'success');
                emailInput.value = '';
                this.notificationManager.show('Welcome to the cosmic journey!', 'success');
            } catch (error) {
                this.showFormMessage(message, 'Subscription failed. Please try again.', 'error');
                this.notificationManager.show('Subscription failed. Please try again.', 'error');
            }
        });
    }

    setupNotifyButton() {
        const notifyBtn = document.getElementById('notifyBtn');
        if (!notifyBtn) return;

        notifyBtn.addEventListener('click', () => {
            // Add loading state
            const originalText = notifyBtn.querySelector('span').textContent;
            const icon = notifyBtn.querySelector('i');
            
            icon.className = 'fas fa-spinner fa-spin';
            notifyBtn.querySelector('span').textContent = 'Processing...';
            notifyBtn.disabled = true;

            // Simulate processing
            setTimeout(() => {
                icon.className = 'fas fa-check';
                notifyBtn.querySelector('span').textContent = 'Notified!';
                
                this.notificationManager.show(
                    'You\'ll be the first to know when new projects launch! 🌟', 
                    'success'
                );

                // Reset button after delay
                setTimeout(() => {
                    icon.className = 'fas fa-bell';
                    notifyBtn.querySelector('span').textContent = originalText;
                    notifyBtn.disabled = false;
                }, 2000);
            }, 1500);
        });
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFormMessage(messageElement, text, type) {
        if (!messageElement) return;

        messageElement.textContent = text;
        messageElement.className = `form-message ${type}`;
        
        gsap.to(messageElement, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out"
        });

        if (type !== 'loading') {
            setTimeout(() => {
                gsap.to(messageElement, {
                    opacity: 0,
                    y: -10,
                    duration: 0.3,
                    ease: "power2.inOut"
                });
            }, 4000);
        }
    }

    simulateAPICall() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 90% success rate for demo
                Math.random() > 0.1 ? resolve() : reject();
            }, 2000);
        });
    }
}

// ===============================================
// PERFORMANCE MONITORING
// ===============================================

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            domLoadTime: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0
        };
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.measureWebVitals();
        this.monitorErrors();
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                this.metrics.pageLoadTime = perfData.loadEventEnd - perfData.loadEventStart;
                this.metrics.domLoadTime = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
            }
        });
    }

    measureWebVitals() {
        // First Contentful Paint
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.firstContentfulPaint = entry.startTime;
                }
            }
        }).observe({ type: 'paint', buffered: true });

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.largestContentfulPaint = lastEntry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
    }

    monitorErrors() {
        window.addEventListener('error', (error) => {
            console.error('JavaScript Error:', error);
            // Could send to analytics service
        });

        window.addEventListener('unhandledrejection', (error) => {
            console.error('Unhandled Promise Rejection:', error);
            // Could send to analytics service
        });
    }

    getMetrics() {
        return { ...this.metrics };
    }
}

// ===============================================
// MAIN INITIALIZATION
// ===============================================

// Global instances
window.animationManager = null;
window.themeManager = null;
window.navigationManager = null;
window.loadingManager = null;
window.formManager = null;
window.performanceMonitor = null;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize core systems
        window.loadingManager = new LoadingManager();
        window.themeManager = new ThemeManager();
        window.navigationManager = new NavigationManager();
        window.formManager = new FormManager();
        window.performanceMonitor = new PerformanceMonitor();
        
        // Animation manager will be initialized after loading screen
        window.animationManager = new AnimationManager();

        console.log('🚀 Portfolio system initialized successfully');
    } catch (error) {
        console.error('❌ Portfolio initialization failed:', error);
    }
});

// Handle window resize
window.addEventListener('resize', utils.debounce(() => {
    if (window.animationManager) {
        window.animationManager.handleResize();
    }
}, 250));

// Handle visibility changes (for performance)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is not visible
        if (window.animationManager && window.animationManager.moonTimeline) {
            window.animationManager.moonTimeline.pause();
        }
    } else {
        // Resume animations when tab becomes visible
        if (window.animationManager && window.animationManager.moonTimeline) {
            window.animationManager.moonTimeline.resume();
        }
    }
});

// Expose utilities for console debugging
window.portfolioUtils = {
    config: CONFIG,
    utils,
    getPerformanceMetrics: () => window.performanceMonitor?.getMetrics(),
    pauseAnimations: () => window.animationManager?.moonTimeline?.pause(),
    resumeAnimations: () => window.animationManager?.moonTimeline?.resume(),
    toggleTheme: () => window.themeManager?.toggleTheme()
};

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
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

console.log('✨ Enhanced Portfolio Script Loaded - Ready for Cosmic Adventures!');
