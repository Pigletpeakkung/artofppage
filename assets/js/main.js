// =============================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// =============================================================================

const CONFIG = {
    // Animation settings
    ANIMATION_DURATION: 300,
    SCROLL_THRESHOLD: 100,
    INTERSECTION_THRESHOLD: 0.1,
    
    // Star system settings
    STAR_COUNT: 50,
    SHOOTING_STAR_INTERVAL: 8000,
    CONSTELLATION_COUNT: 3,
    
    // Performance settings
    DEBOUNCE_DELAY: 100,
    THROTTLE_DELAY: 16,
    
    // Theme settings
    THEME_STORAGE_KEY: 'thanatsitt-theme',
    DEFAULT_THEME: 'light',
    
    // Form settings
    FORM_SUBMIT_URL: '#', // Replace with actual endpoint
    FORM_SUCCESS_MESSAGE: 'Thank you! Your message has been sent successfully.',
    FORM_ERROR_MESSAGE: 'Sorry, there was an error sending your message. Please try again.',
    
    // Typing animation settings
    TYPING_SPEED: 100,
    ERASING_SPEED: 50,
    PAUSE_DURATION: 2000
};

// Global state
const STATE = {
    currentTheme: CONFIG.DEFAULT_THEME,
    isScrolling: false,
    activeFilter: 'all',
    typingInstance: null,
    intersectionObserver: null,
    stars: [],
    constellations: [],
    isFormSubmitting: false,
    currentSection: 'home'
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function calls
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Get random number between min and max
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Get random integer between min and max
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random array element
 */
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Check if element is in viewport
 */
function isInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
        rect.top >= -threshold * windowHeight &&
        rect.left >= -threshold * windowWidth &&
        rect.bottom <= windowHeight + threshold * windowHeight &&
        rect.right <= windowWidth + threshold * windowWidth
    );
}

/**
 * Smooth scroll to element
 */
function smoothScrollTo(element, offset = 80) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

/**
 * Add CSS class with animation support
 */
function addClassWithAnimation(element, className, duration = CONFIG.ANIMATION_DURATION) {
    element.classList.add(className);
    return new Promise(resolve => {
        setTimeout(resolve, duration);
    });
}

/**
 * Remove CSS class with animation support
 */
function removeClassWithAnimation(element, className, duration = CONFIG.ANIMATION_DURATION) {
    element.classList.remove(className);
    return new Promise(resolve => {
        setTimeout(resolve, duration);
    });
}

// =============================================================================
// THEME MANAGEMENT
// =============================================================================

class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadTheme();
        this.bindEvents();
        this.updateThemeToggle();
    }

    loadTheme() {
        const savedTheme = localStorage.getItem(CONFIG.THEME_STORAGE_KEY);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        STATE.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        this.applyTheme(STATE.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        STATE.currentTheme = theme;
        localStorage.setItem(CONFIG.THEME_STORAGE_KEY, theme);
        
        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#1A202C' : '#F8FAFC');
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    toggleTheme() {
        const newTheme = STATE.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.updateThemeToggle();
        
        // Add visual feedback
        this.addToggleAnimation();
    }

    updateThemeToggle() {
        const toggleButton = document.querySelector('.theme-toggle');
        if (toggleButton) {
            const icon = STATE.currentTheme === 'light' ? 'fa-moon' : 'fa-sun';
            const title = STATE.currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
            
            toggleButton.innerHTML = `<i class="fas ${icon}"></i>`;
            toggleButton.setAttribute('title', title);
            toggleButton.setAttribute('aria-label', title);
        }
    }

    addToggleAnimation() {
        const toggleButton = document.querySelector('.theme-toggle');
        if (toggleButton) {
            toggleButton.style.transform = 'scale(0.8) rotate(180deg)';
            setTimeout(() => {
                toggleButton.style.transform = 'scale(1) rotate(0deg)';
            }, 150);
        }
    }

    bindEvents() {
        // Theme toggle button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.theme-toggle')) {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(CONFIG.THEME_STORAGE_KEY)) {
                this.applyTheme(e.matches ? 'dark' : 'light');
                this.updateThemeToggle();
            }
        });

        // Keyboard shortcut (Ctrl/Cmd + Shift + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
}

// =============================================================================
// NAVIGATION MANAGEMENT
// =============================================================================

class NavigationManager {
    constructor() {
        this.navbar = null;
        this.navLinks = [];
        this.sections = [];
        this.init();
    }

    init() {
        this.navbar = document.querySelector('.header__navbar');
        this.navLinks = Array.from(document.querySelectorAll('.nav-link'));
        this.sections = Array.from(document.querySelectorAll('section[id]'));
        
        this.bindEvents();
        this.updateActiveSection();
    }

    bindEvents() {
        // Smooth scroll for navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    smoothScrollTo(targetElement);
                    this.closeNavbar();
                }
            });
        });

        // Update active section on scroll
        window.addEventListener('scroll', throttle(() => {
            this.updateScrolledState();
            this.updateActiveSection();
        }, CONFIG.THROTTLE_DELAY));

        // Close navbar on outside click (mobile)
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar') && this.isNavbarOpen()) {
                this.closeNavbar();
            }
        });

        // Close navbar on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isNavbarOpen()) {
                this.closeNavbar();
            }
        });
    }

    updateScrolledState() {
        if (!this.navbar) return;

        const scrolled = window.pageYOffset > CONFIG.SCROLL_THRESHOLD;
        this.navbar.classList.toggle('navbar-scrolled', scrolled);
    }

    updateActiveSection() {
        const scrollPosition = window.pageYOffset + 100;
        let activeSection = '';

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                activeSection = sectionId;
            }
        });

        // Update active nav link
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            link.classList.toggle('active', href === activeSection);
        });

        // Update current section state
        STATE.currentSection = activeSection || 'home';
    }

    isNavbarOpen() {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        return navbarCollapse && navbarCollapse.classList.contains('show');
    }

    closeNavbar() {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            navbarToggler?.click();
        }
    }
}

// =============================================================================
// TYPING ANIMATION
// =============================================================================

class TypingAnimation {
    constructor(element, phrases, options = {}) {
        this.element = element;
        this.phrases = phrases;
        this.options = {
            typingSpeed: options.typingSpeed || CONFIG.TYPING_SPEED,
            erasingSpeed: options.erasingSpeed || CONFIG.ERASING_SPEED,
            pauseDuration: options.pauseDuration || CONFIG.PAUSE_DURATION,
            loop: options.loop !== false,
            cursor: options.cursor || '|',
            showCursor: options.showCursor !== false
        };
        
        this.currentPhraseIndex = 0;
        this.currentCharIndex = 0;
        this.isTyping = true;
        this.isRunning = false;
        
        this.init();
    }

    init() {
        if (!this.element || this.phrases.length === 0) return;
        
        this.element.style.minHeight = this.element.offsetHeight + 'px';
        this.start();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.type();
    }

    stop() {
        this.isRunning = false;
    }

    type() {
        if (!this.isRunning) return;

        const currentPhrase = this.phrases[this.currentPhraseIndex];
        
        if (this.isTyping) {
            // Typing phase
            if (this.currentCharIndex < currentPhrase.length) {
                const textToShow = currentPhrase.substring(0, this.currentCharIndex + 1);
                this.updateDisplay(textToShow);
                this.currentCharIndex++;
                setTimeout(() => this.type(), this.options.typingSpeed);
            } else {
                // Finished typing, pause before erasing
                setTimeout(() => {
                    this.isTyping = false;
                    this.type();
                }, this.options.pauseDuration);
            }
        } else {
            // Erasing phase
            if (this.currentCharIndex > 0) {
                const textToShow = currentPhrase.substring(0, this.currentCharIndex - 1);
                this.updateDisplay(textToShow);
                this.currentCharIndex--;
                setTimeout(() => this.type(), this.options.erasingSpeed);
            } else {
                // Finished erasing, move to next phrase
                this.isTyping = true;
                this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
                
                if (this.options.loop || this.currentPhraseIndex !== 0) {
                    setTimeout(() => this.type(), this.options.typingSpeed);
                } else {
                    this.isRunning = false;
                }
            }
        }
    }

    updateDisplay(text) {
        if (!this.element) return;
        
        const cursor = this.options.showCursor ? 
            `<span class="typing-cursor" style="animation: blink 1s infinite;">${this.options.cursor}</span>` : '';
        
        this.element.innerHTML = text + cursor;
    }

    updatePhrases(newPhrases) {
        this.phrases = newPhrases;
        this.currentPhraseIndex = 0;
    }
}

// =============================================================================
// STAR SYSTEM
// =============================================================================

class StarSystem {
    constructor(container) {
        this.container = container;
        this.stars = [];
        this.constellations = [];
        this.shootingStars = [];
        
        this.colors = [
            'pastel-pink', 'pastel-blue', 'pastel-purple', 'pastel-green',
            'pastel-yellow', 'pastel-rose', 'pastel-sky', 'pastel-lavender',
            'pastel-mint', 'pastel-peach', 'pastel-coral', 'pastel-sage'
        ];
        
        this.sizes = ['tiny', 'small', 'medium', 'large', 'xl'];
        this.animations = ['twinkle', 'move', 'pulse', 'float', 'breathe'];
        
        this.init();
    }

    init() {
        if (!this.container) return;
        
        this.createStarField();
        this.createConstellations();
        this.startShootingStars();
        this.bindEvents();
    }

    createStarField() {
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
            const star = this.createStar();
            fragment.appendChild(star);
            this.stars.push(star);
        }
        
        this.container.appendChild(fragment);
    }

    createStar(options = {}) {
        const star = document.createElement('div');
        const color = options.color || randomChoice(this.colors);
        const size = options.size || randomChoice(this.sizes);
        const animation = options.animation || randomChoice(this.animations);
        const duration = options.duration || random(2, 8);
        const delay = options.delay || random(0, 5);
        
        star.className = `star star--${size} star--${color} star--animate-${animation}`;
        star.style.cssText = `
            top: ${options.top || random(0, 100)}%;
            left: ${options.left || random(0, 100)}%;
            --duration: ${duration}s;
            --delay: ${delay}s;
            --sparkle-duration: ${random(3, 7)}s;
            --sparkle-delay: ${random(0, 3)}s;
        `;
        
        // Add interactive behavior for some stars
        if (Math.random() < 0.2) {
            star.classList.add('star--interactive');
            this.addStarInteractivity(star);
        }
        
        return star;
    }

    addStarInteractivity(star) {
        star.addEventListener('click', () => {
            star.classList.add('clicked');
            setTimeout(() => star.classList.remove('clicked'), 600);
            
            // Create ripple effect
            this.createRippleEffect(star);
        });
        
        star.addEventListener('mouseenter', () => {
            star.style.zIndex = '10';
        });
        
        star.addEventListener('mouseleave', () => {
            star.style.zIndex = '';
        });
    }

    createRippleEffect(star) {
        const ripple = document.createElement('div');
        ripple.className = 'star-ripple';
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, currentColor, transparent);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: starRipple 1s ease-out forwards;
            pointer-events: none;
            z-index: 5;
        `;
        
        star.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1000);
    }

    createConstellations() {
        for (let i = 0; i < CONFIG.CONSTELLATION_COUNT; i++) {
            this.createConstellation();
        }
    }

    createConstellation() {
        const constellation = document.createElement('div');
        constellation.className = 'constellation';
        
        const starCount = randomInt(3, 6);
        const constellationStars = [];
        const centerX = random(10, 90);
        const centerY = random(10, 90);
        const radius = random(5, 15);
        
        // Create constellation stars
        for (let i = 0; i < starCount; i++) {
            const angle = (i / starCount) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            const star = this.createStar({
                top: y,
                left: x,
                size: randomChoice(['medium', 'large']),
                animation: 'pulse',
                duration: random(3, 6)
            });
            
            star.classList.add('star--constellation');
            constellation.appendChild(star);
            constellationStars.push({ element: star, x, y });
        }
        
        // Create connecting lines
        for (let i = 0; i < constellationStars.length; i++) {
            const currentStar = constellationStars[i];
            const nextStar = constellationStars[(i + 1) % constellationStars.length];
            
            const line = this.createConstellationLine(currentStar, nextStar);
            constellation.appendChild(line);
        }
        
        this.container.appendChild(constellation);
        this.constellations.push(constellation);
    }

    createConstellationLine(star1, star2) {
        const line = document.createElement('div');
        line.className = 'constellation-line';
        
        const dx = star2.x - star1.x;
        const dy = star2.y - star1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        line.style.cssText = `
            top: ${star1.y}%;
            left: ${star1.x}%;
            width: ${distance}%;
            transform: rotate(${angle}deg);
            color: ${randomChoice(this.colors.map(c => `var(--star-${c})`))};
            animation-delay: ${random(0, 4)}s;
        `;
        
        return line;
    }

    startShootingStars() {
        this.createShootingStar();
        
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.createShootingStar();
            }
        }, CONFIG.SHOOTING_STAR_INTERVAL);
    }

    createShootingStar() {
        const shootingStar = document.createElement('div');
        const color = randomChoice(this.colors);
        const variant = randomInt(1, 3);
        
        shootingStar.className = `shooting-star shooting-star--${variant}`;
        shootingStar.style.cssText = `
            top: ${random(10, 70)}%;
            left: -100px;
            color: var(--star-${color});
            animation-duration: ${random(2, 5)}s;
            animation-delay: ${random(0, 2)}s;
        `;
        
        this.container.appendChild(shootingStar);
        this.shootingStars.push(shootingStar);
        
        // Remove after animation
        setTimeout(() => {
            shootingStar.remove();
            const index = this.shootingStars.indexOf(shootingStar);
            if (index > -1) {
                this.shootingStars.splice(index, 1);
            }
        }, 6000);
    }

    bindEvents() {
        // Pause animations when not in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const stars = entry.target.querySelectorAll('.star, .shooting-star');
                stars.forEach(star => {
                    star.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
                });
            });
        });
        
        observer.observe(this.container);
        
        // Add/remove stars based on screen size
        window.addEventListener('resize', debounce(() => {
            this.adjustStarDensity();
        }, 500));
    }

    adjustStarDensity() {
        const screenWidth = window.innerWidth;
        let targetCount = CONFIG.STAR_COUNT;
        
        if (screenWidth < 768) {
            targetCount = Math.floor(CONFIG.STAR_COUNT * 0.6);
        } else if (screenWidth < 1024) {
            targetCount = Math.floor(CONFIG.STAR_COUNT * 0.8);
        }
        
        const currentCount = this.stars.length;
        
        if (currentCount > targetCount) {
            // Remove excess stars
            const starsToRemove = this.stars.splice(targetCount);
            starsToRemove.forEach(star => star.remove());
        } else if (currentCount < targetCount) {
            // Add more stars
            const fragment = document.createDocumentFragment();
            for (let i = currentCount; i < targetCount; i++) {
                const star = this.createStar();
                fragment.appendChild(star);
                this.stars.push(star);
            }
            this.container.appendChild(fragment);
        }
    }

    destroy() {
        this.stars.forEach(star => star.remove());
        this.constellations.forEach(constellation => constellation.remove());
        this.shootingStars.forEach(star => star.remove());
        
        this.stars = [];
        this.constellations = [];
        this.shootingStars = [];
    }
}

// =============================================================================
// PORTFOLIO FILTER
// =============================================================================

class PortfolioFilter {
    constructor() {
        this.filters = [];
        this.items = [];
        this.activeFilter = 'all';
        this.init();
    }

    init() {
        this.filters = Array.from(document.querySelectorAll('.portfolio-filter'));
        this.items = Array.from(document.querySelectorAll('.portfolio-card'));
        
        if (this.filters.length === 0 || this.items.length === 0) return;
        
        this.bindEvents();
        this.setActiveFilter('all');
    }

    bindEvents() {
        this.filters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                const filterValue = filter.getAttribute('data-filter') || 'all';
                this.setActiveFilter(filterValue);
            });
        });
    }

    setActiveFilter(filterValue) {
        this.activeFilter = filterValue;
        STATE.activeFilter = filterValue;
        
        // Update active filter button
        this.filters.forEach(filter => {
            const isActive = (filter.getAttribute('data-filter') || 'all') === filterValue;
            filter.classList.toggle('active', isActive);
        });
        
        // Filter items with animation
        this.filterItems(filterValue);
    }

    async filterItems(filterValue) {
        // Hide all items first
        const hidePromises = this.items.map(item => {
            return new Promise(resolve => {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8) translateY(20px)';
                setTimeout(resolve, 150);
            });
        });
        
        await Promise.all(hidePromises);
        
        // Show/hide items based on filter
        const showPromises = this.items.map(item => {
            const categories = item.getAttribute('data-category')?.split(',') || [];
            const shouldShow = filterValue === 'all' || categories.includes(filterValue);
            
            if (shouldShow) {
                item.style.display = 'block';
                return new Promise(resolve => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1) translateY(0)';
                        resolve();
                    }, 100);
                });
            } else {
                item.style.display = 'none';
                return Promise.resolve();
            }
        });
        
        await Promise.all(showPromises);
        
        // Trigger layout recalculation
        this.reorderGrid();
    }

    reorderGrid() {
        const container = document.querySelector('.portfolio-grid');
        if (!container) return;
        
        // Force reflow
        container.style.display = 'none';
        container.offsetHeight; // Trigger reflow
        container.style.display = 'grid';
    }
}

// =============================================================================
// FORM HANDLER
// =============================================================================

class FormHandler {
    constructor() {
        this.form = null;
        this.submitButton = null;
        this.messageContainer = null;
        this.init();
    }

    init() {
        this.form = document.querySelector('.contact-form');
        if (!this.form) return;
        
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.messageContainer = this.form.querySelector('.form-message') || this.createMessageContainer();
        
        this.bindEvents();
        this.setupValidation();
    }

    createMessageContainer() {
        const container = document.createElement('div');
        container.className = 'form-message';
        container.style.marginTop = '1rem';
        this.form.appendChild(container);
        return container;
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    setupValidation() {
        // Add required field indicators
        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            const label = this.form.querySelector(`label[for="${field.id}"]`);
            if (label && !label.querySelector('.required-indicator')) {
                const indicator = document.createElement('span');
                indicator.className = 'required-indicator';
                indicator.textContent = ' *';
                indicator.style.color = 'var(--error)';
                label.appendChild(indicator);
            }
        });
    }

    async handleSubmit() {
        if (STATE.isFormSubmitting) return;
        
        // Validate all fields
        const isValid = this.validateForm();
        if (!isValid) {
            this.showMessage('Please correct the errors below.', 'error');
            return;
        }
        
        STATE.isFormSubmitting = true;
        this.setSubmitState(true);
        
        try {
            const formData = this.getFormData();
            const response = await this.submitForm(formData);
            
            if (response.success) {
                this.showMessage(CONFIG.FORM_SUCCESS_MESSAGE, 'success');
                this.form.reset();
                this.clearAllErrors();
            } else {
                this.showMessage(response.message || CONFIG.FORM_ERROR_MESSAGE, 'error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage(CONFIG.FORM_ERROR_MESSAGE, 'error');
        } finally {
            STATE.isFormSubmitting = false;
            this.setSubmitState(false);
        }
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
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
        const type = field.type;
        const required = field.hasAttribute('required');
        
        // Clear previous errors
        this.clearFieldError(field);
        
        // Required field validation
        if (required && !value) {
            this.showFieldError(field, 'This field is required.');
            return false;
        }
        
        // Skip further validation if field is empty and not required
        if (!value && !required) return true;
        
        // Email validation
        if (type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Please enter a valid email address.');
                return false;
            }
        }
        
        // Phone validation
        if (field.name === 'phone' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                this.showFieldError(field, 'Please enter a valid phone number.');
                return false;
            }
        }
        
        // Message length validation
        if (field.name === 'message' && value.length < 10) {
            this.showFieldError(field, 'Message must be at least 10 characters long.');
            return false;
        }
        
        return true;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.style.cssText = `
                color: var(--error);
                font-size: 0.875rem;
                margin-top: 0.25rem;
                font-weight: 500;
            `;
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    clearAllErrors() {
        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => this.clearFieldError(field));
    }

    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    async submitForm(data) {
        // Simulate API call - replace with actual endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate success/failure
                const success = Math.random() > 0.1; // 90% success rate for demo
                resolve({
                    success,
                    message: success ? CONFIG.FORM_SUCCESS_MESSAGE : CONFIG.FORM_ERROR_MESSAGE
                });
            }, 2000);
        });
        
        // Actual implementation would be:
        /*
        const response = await fetch(CONFIG.FORM_SUBMIT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
        */
    }

    setSubmitState(isSubmitting) {
        if (!this.submitButton) return;
        
        if (isSubmitting) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = `
                <i class="fas fa-spinner fa-spin icon-spacing"></i>
                Sending...
            `;
        } else {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = `
                <i class="fas fa-paper-plane icon-spacing"></i>
                Send Message
            `;
        }
    }

    showMessage(message, type) {
        if (!this.messageContainer) return;
        
        this.messageContainer.className = `form-message text-${type === 'success' ? 'success' : 'danger'}`;
        this.messageContainer.textContent = message;
        this.messageContainer.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.messageContainer.style.display = 'none';
        }, 5000);
    }
}

// =============================================================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// =============================================================================

class ScrollAnimations {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                threshold: CONFIG.INTERSECTION_THRESHOLD,
                rootMargin: '0px 0px -50px 0px'
            }
        );
        
        this.observeElements();
    }

    observeElements() {
        // Elements to animate on scroll
        const elements = document.querySelectorAll(`
            .skill-card,
            .portfolio-card,
            .about-content,
            .contact-content,
            .section-title,
            .section-subtitle,
            .hero-section__content > *
        `);
        
        elements.forEach(element => {
            element.classList.add('fade-in');
            this.observer.observe(element);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger skill progress bars
                if (entry.target.classList.contains('skill-card')) {
                    this.animateSkillProgress(entry.target);
                }
                
                // Stagger animation for multiple elements
                if (entry.target.parentElement?.classList.contains('skills-grid') ||
                    entry.target.parentElement?.classList.contains('portfolio-grid')) {
                    this.staggerAnimation(entry.target);
                }
            }
        });
    }

    animateSkillProgress(skillCard) {
        const progressBar = skillCard.querySelector('.skill-progress-bar');
        if (progressBar && !progressBar.classList.contains('animated')) {
            progressBar.classList.add('animated');
            
            // Add a slight delay for visual effect
            setTimeout(() => {
                progressBar.style.transform = 'scaleX(1)';
            }, 300);
        }
    }

    staggerAnimation(element) {
        const siblings = Array.from(element.parentElement.children);
        const index = siblings.indexOf(element);
        
        element.style.animationDelay = `${index * 0.1}s`;
    }
}

// =============================================================================
// PERFORMANCE OPTIMIZATIONS
// =============================================================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeImages();
        this.preloadCriticalResources();
        this.setupIntersectionObservers();
        this.enablePassiveListeners();
    }

    optimizeImages() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    preloadCriticalResources() {
        // Preload critical CSS and fonts
        const criticalResources = [
            { href: 'assets/css/main.css', as: 'style' },
            { href: 'assets/css/star.css', as: 'style' },
            { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap', as: 'style' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'style') {
                link.onload = () => {
                    link.rel = 'stylesheet';
                };
            }
            document.head.appendChild(link);
        });
    }

    setupIntersectionObservers() {
        // Pause animations when not visible
        const animatedElements = document.querySelectorAll('.star, .shooting-star, [class*="animate"]');
        
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                if (element.style.animationPlayState !== undefined) {
                    element.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
                }
            });
        });
        
        animatedElements.forEach(element => animationObserver.observe(element));
    }

    enablePassiveListeners() {
        // Use passive listeners for scroll events
        const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
        
        passiveEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {}, { passive: true });
        });
    }
}

// =============================================================================
// MAIN APPLICATION CLASS
// =============================================================================

class PortfolioApp {
    constructor() {
        this.themeManager = null;
        this.navigationManager = null;
        this.typingAnimation = null;
        this.starSystem = null;
        this.portfolioFilter = null;
        this.formHandler = null;
        this.scrollAnimations = null;
        this.performanceOptimizer = null;
        
        this.init();
    }

    async init() {
  
