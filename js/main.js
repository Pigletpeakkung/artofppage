/* ==================================================================================== */
/* 🎯 MAIN.JS - COMPLETE PORTFOLIO JAVASCRIPT FRAMEWORK */
/* ==================================================================================== */

'use strict';

// ==================================================================================== //
// 🎯 GLOBAL VARIABLES & CONFIGURATION
// ==================================================================================== //

const CONFIG = {
  // Animation settings
  ANIMATION_DURATION: 300,
  SCROLL_OFFSET: 100,
  TYPING_SPEED: 50,
  DELETING_SPEED: 30,
  
  // Voice demo settings
  VOICE_DEMO_URL: 'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/demo/voice/intro/Thann_Intro.wav',
  VOICE_DEMO_DURATION: 30000, // 30 seconds
  
  // Form settings
  FORM_ENDPOINT: 'https://formspree.io/f/your-form-id',
  MAX_MESSAGE_LENGTH: 1000,
  
  // Theme settings
  THEME_KEY: 'portfolio-theme',
  THEME_TRANSITION_DURATION: 300,
  
  // Intersection Observer settings
  OBSERVER_THRESHOLD: 0.1,
  OBSERVER_ROOT_MARGIN: '0px 0px -100px 0px',
  
  // Loading settings
  MIN_LOADING_TIME: 2000,
  MAX_LOADING_TIME: 5000,
  
  // Toast settings
  TOAST_DURATION: 5000,
  TOAST_ANIMATION_DURATION: 300,
  
  // Cookie settings
  COOKIE_EXPIRY_DAYS: 365,
  
  // Performance settings
  DEBOUNCE_DELAY: 250,
  THROTTLE_DELAY: 16,
  
  // API endpoints
  ANALYTICS_ENDPOINT: 'https://api.analytics.com/track',
  NEWSLETTER_ENDPOINT: 'https://api.newsletter.com/subscribe',
  
  // Social media links
  SOCIAL_LINKS: {
    github: 'https://github.com/Pigletpeakkung',
    linkedin: 'https://linkedin.com/in/thanatsitt-s',
    twitter: 'https://twitter.com/pegearts',
    email: 'mailto:thanattsitt.info@yahoo.co.uk',
    phone: 'tel:+66XXXXXXXXX'
  }
};

// Global state management
const AppState = {
  isLoading: true,
  currentTheme: 'dark',
  isMobileMenuOpen: false,
  activeSection: 'home',
  isVoicePlaying: false,
  scrollProgress: 0,
  userPreferences: {},
  formData: {},
  animations: new Map(),
  observers: new Map(),
  timers: new Map(),
  cache: new Map(),
  touchStartY: 0,
  touchEndY: 0,
  lastScrollTop: 0,
  modalStack: [],
  notifications: [],
  isOnline: navigator.onLine,
  performanceMetrics: {},
  deviceInfo: {},
  speechSynthesis: null,
  audioContext: null,
  currentAudio: null,
  serviceWorkerRegistration: null,
  updateAvailable: false,
  consentGiven: false,
  focusedElement: null,
  currentModal: null,
  loadingProgress: 0,
  errors: [],
  warnings: []
};

// ==================================================================================== //
// 🎯 UTILITY FUNCTIONS
// ==================================================================================== //

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
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Get element with error handling
  getElement(selector, context = document) {
    try {
      const element = context.querySelector(selector);
      if (!element) {
        console.warn(`Element not found: ${selector}`);
      }
      return element;
    } catch (error) {
      console.error(`Error selecting element: ${selector}`, error);
      return null;
    }
  },

  // Get multiple elements with error handling
  getElements(selector, context = document) {
    try {
      return Array.from(context.querySelectorAll(selector));
    } catch (error) {
      console.error(`Error selecting elements: ${selector}`, error);
      return [];
    }
  },

  // Local storage helpers with error handling
  storage: {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
      }
    },

    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
      }
    }
  },

  // Cookie helpers
  cookies: {
    set(name, value, days = CONFIG.COOKIE_EXPIRY_DAYS) {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    },

    get(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },

    delete(name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  },

  // Format date helper
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
  },

  // Validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number
  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Generate unique ID
  generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  },

  // Smooth scroll to element
  scrollToElement(element, offset = 0) {
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  },

  // Check if element is in viewport
  isInViewport(element, threshold = 0.1) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

    return (vertInView && horInView);
  },

  // Capitalize string
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Sanitize HTML
  sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  },

  // Deep clone object
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = Utils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  },

  // Detect WebGL support
  detectWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
    } catch (e) {
      return false;
    }
  },

  // Format number
  formatNumber(num, options = {}) {
    return new Intl.NumberFormat('en-US', options).format(num);
  },

  // Get device type
  getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent)) {
      return 'tablet';
    }
    if (/mobi|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile|iphone|ipad|ipod|android|blackberry|webos/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  },

  // Animation helpers
  animate: {
    fadeIn(element, duration = CONFIG.ANIMATION_DURATION) {
      if (!element) return Promise.resolve();
      
      return new Promise(resolve => {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const animation = element.animate([
          { opacity: 0 },
          { opacity: 1 }
        ], {
          duration,
          easing: 'ease-in-out',
          fill: 'forwards'
        });
        
        animation.onfinish = () => {
          element.style.opacity = '1';
          resolve();
        };
      });
    },

    fadeOut(element, duration = CONFIG.ANIMATION_DURATION) {
      if (!element) return Promise.resolve();
      
      return new Promise(resolve => {
        const animation = element.animate([
          { opacity: 1 },
          { opacity: 0 }
        ], {
          duration,
          easing: 'ease-in-out',
          fill: 'forwards'
        });
        
        animation.onfinish = () => {
          element.style.display = 'none';
          element.style.opacity = '0';
          resolve();
        };
      });
    },

    slideUp(element, duration = CONFIG.ANIMATION_DURATION) {
      if (!element) return Promise.resolve();
      
      return new Promise(resolve => {
        const height = element.offsetHeight;
        element.style.overflow = 'hidden';
        
        const animation = element.animate([
          { height: `${height}px`, opacity: 1 },
          { height: '0px', opacity: 0 }
        ], {
          duration,
          easing: 'ease-in-out',
          fill: 'forwards'
        });
        
        animation.onfinish = () => {
          element.style.display = 'none';
          resolve();
        };
      });
    },

    slideDown(element, duration = CONFIG.ANIMATION_DURATION) {
      if (!element) return Promise.resolve();
      
      return new Promise(resolve => {
        element.style.display = 'block';
        element.style.overflow = 'hidden';
        element.style.height = '0px';
        
        const height = element.scrollHeight;
        
        const animation = element.animate([
          { height: '0px', opacity: 0 },
          { height: `${height}px`, opacity: 1 }
        ], {
          duration,
          easing: 'ease-in-out',
          fill: 'forwards'
        });
        
        animation.onfinish = () => {
          element.style.height = 'auto';
          element.style.overflow = 'visible';
          resolve();
        };
      });
    },

    bounceIn(element, duration = CONFIG.ANIMATION_DURATION) {
      if (!element) return Promise.resolve();
      
      return new Promise(resolve => {
        element.style.display = 'block';
        
        const animation = element.animate([
          { transform: 'scale(0)', opacity: 0 },
          { transform: 'scale(1.1)', opacity: 0.8, offset: 0.6 },
          { transform: 'scale(1)', opacity: 1 }
        ], {
          duration,
          easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          fill: 'forwards'
        });
        
        animation.onfinish = resolve;
      });
    }
  },

  // Performance utilities
  performance: {
    mark(name) {
      if (performance.mark) {
        performance.mark(name);
      }
    },

    measure(name, startMark, endMark) {
      if (performance.measure) {
        try {
          performance.measure(name, startMark, endMark);
          const measure = performance.getEntriesByName(name)[0];
          return measure ? measure.duration : 0;
        } catch (error) {
          console.warn('Performance measurement failed:', error);
          return 0;
        }
      }
      return 0;
    },

    now() {
      return performance.now ? performance.now() : Date.now();
    }
  },

  // Delay utility
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// ==================================================================================== //
// 🎯 LOADING SCREEN MANAGER
// ==================================================================================== //

const LoadingManager = {
  init() {
    Utils.performance.mark('loading-start');
    this.loadingScreen = Utils.getElement('.loading-screen');
    this.loadingSpinner = Utils.getElement('.loading-spinner');
    this.loadingText = Utils.getElement('.loading-text');
    this.loadingProgress = Utils.getElement('.loading-progress');
    
    if (!this.loadingScreen) {
      this.createLoadingScreen();
    }
    
    this.startLoading();
  },

  createLoadingScreen() {
    const loadingHTML = `
      <div class="loading-screen" id="loadingScreen">
        <div class="loading-content">
          <div class="loading-logo">
            <img src="assets/images/logo/logo.png" alt="Portfolio Logo" width="80" height="80">
          </div>
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <div class="loading-text">Initializing experience...</div>
          <div class="loading-progress">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', loadingHTML);
    this.loadingScreen = Utils.getElement('.loading-screen');
    this.loadingSpinner = Utils.getElement('.loading-spinner');
    this.loadingText = Utils.getElement('.loading-text');
    this.loadingProgress = Utils.getElement('.loading-progress');
  },

  startLoading() {
    const loadingTexts = [
      'Initializing experience...',
      'Loading components...',
      'Preparing animations...',
      'Setting up interactions...',
      'Almost ready...',
      'Welcome!'
    ];
    
    let textIndex = 0;
    let progress = 0;
    
    const updateProgress = () => {
      progress += Math.random() * 15 + 5;
      progress = Math.min(progress, 95);
      
      if (this.loadingProgress) {
        const progressBar = this.loadingProgress.querySelector('.progress-bar');
        if (progressBar) {
          progressBar.style.width = `${progress}%`;
        }
      }
      
      AppState.loadingProgress = progress;
    };
    
    const textInterval = setInterval(() => {
      if (this.loadingText && textIndex < loadingTexts.length - 1) {
        textIndex++;
        this.loadingText.textContent = loadingTexts[textIndex];
        updateProgress();
      }
    }, 600);
    
    const progressInterval = setInterval(updateProgress, 200);
    
    AppState.timers.set('loadingText', textInterval);
    AppState.timers.set('loadingProgress', progressInterval);
    
    // Simulate loading time based on connection speed
    const connectionSpeed = navigator.connection ? navigator.connection.effectiveType : '4g';
    let loadingTime = CONFIG.MIN_LOADING_TIME;
    
    switch (connectionSpeed) {
      case 'slow-2g':
        loadingTime = CONFIG.MAX_LOADING_TIME;
        break;
      case '2g':
        loadingTime = CONFIG.MAX_LOADING_TIME * 0.8;
        break;
      case '3g':
        loadingTime = CONFIG.MIN_LOADING_TIME * 1.5;
        break;
      default:
        loadingTime = CONFIG.MIN_LOADING_TIME;
    }
    
    setTimeout(() => {
      this.hideLoading();
    }, loadingTime);
  },

  updateProgress(percentage, text) {
    if (this.loadingProgress) {
      const progressBar = this.loadingProgress.querySelector('.progress-bar');
      if (progressBar) {
        progressBar.style.width = `${percentage}%`;
      }
    }
    
    if (this.loadingText && text) {
      this.loadingText.textContent = text;
    }
    
    AppState.loadingProgress = percentage;
  },

  async hideLoading() {
    if (!this.loadingScreen) return;
    
    Utils.performance.mark('loading-end');
    Utils.performance.measure('loading-duration', 'loading-start', 'loading-end');
    
    // Clear intervals
    const textInterval = AppState.timers.get('loadingText');
    const progressInterval = AppState.timers.get('loadingProgress');
    
    if (textInterval) {
      clearInterval(textInterval);
      AppState.timers.delete('loadingText');
    }
    
    if (progressInterval) {
      clearInterval(progressInterval);
      AppState.timers.delete('loadingProgress');
    }
    
    // Complete progress
    this.updateProgress(100, 'Welcome!');
    
    // Wait a bit then fade out
    await Utils.delay(800);
    
    await Utils.animate.fadeOut(this.loadingScreen, 600);
    this.loadingScreen.remove();
    AppState.isLoading = false;
    
    // Initialize main application
    App.initializeAfterLoading();
  }
};

// ==================================================================================== //
// 🎯 THEME MANAGER
// ==================================================================================== //

const ThemeManager = {
  init() {
    this.themeToggle = Utils.getElement('.theme-toggle');
    this.body = document.body;
    this.html = document.documentElement;
    
    // Load saved theme or detect system preference
    this.loadTheme();
    this.bindEvents();
    this.updateThemeToggle();
    this.initializeThemeTransitions();
  },

  loadTheme() {
    const savedTheme = Utils.storage.get(CONFIG.THEME_KEY);
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    AppState.currentTheme = savedTheme || systemTheme;
    this.applyTheme(AppState.currentTheme, false);
  },

  applyTheme(theme, animate = true) {
    if (animate) {
      this.body.classList.add('theme-transitioning');
    }
    
    this.html.setAttribute('data-theme', theme);
    this.body.setAttribute('data-theme', theme);
    AppState.currentTheme = theme;
    Utils.storage.set(CONFIG.THEME_KEY, theme);
    
    // Update meta theme color
    this.updateMetaThemeColor(theme);
    
    // Update favicon based on theme
    this.updateFavicon(theme);
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme, previousTheme: AppState.currentTheme } 
    }));
    
    if (animate) {
      setTimeout(() => {
        this.body.classList.remove('theme-transitioning');
      }, CONFIG.THEME_TRANSITION_DURATION);
    }
    
    // Track theme change
    Analytics.trackEvent('theme_change', { theme });
  },

  updateMetaThemeColor(theme) {
    let metaThemeColor = Utils.getElement('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    const colors = {
      dark: '#0f0f23',
      light: '#ffffff'
    };
    
    metaThemeColor.content = colors[theme] || colors.dark;
  },

  updateFavicon(theme) {
    const favicon = Utils.getElement('link[rel="icon"]');
    if (favicon) {
      const faviconPath = theme === 'dark' 
        ? 'assets/images/favicon/favicon-dark.ico' 
        : 'assets/images/favicon/favicon-light.ico';
      favicon.href = faviconPath;
    }
  },

  toggleTheme() {
    const newTheme = AppState.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme, true);
    this.updateThemeToggle();
    
    // Add visual feedback
    this.addToggleFeedback();
  },

  addToggleFeedback() {
    if (this.themeToggle) {
      this.themeToggle.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.themeToggle.style.transform = '';
      }, 150);
    }
  },

  updateThemeToggle() {
    if (!this.themeToggle) return;
    
    const isDark = AppState.currentTheme === 'dark';
    const icon = this.themeToggle.querySelector('i');
    
    if (icon) {
      icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    } else {
      this.themeToggle.innerHTML = isDark ? '☀️' : '🌙';
    }
    
    const title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    this.themeToggle.setAttribute('title', title);
    this.themeToggle.setAttribute('aria-label', title);
  },

  initializeThemeTransitions() {
    // Add CSS custom properties for smooth transitions
    const style = document.createElement('style');
    style.textContent = `
      .theme-transitioning,
      .theme-transitioning * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
      }
    `;
    document.head.appendChild(style);
  },

  bindEvents() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleTheme();
      });
      
      // Keyboard support
      this.themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!Utils.storage.get(CONFIG.THEME_KEY)) {
        this.applyTheme(e.matches ? 'dark' : 'light');
        this.updateThemeToggle();
      }
    });
    
    // Listen for custom theme change events
    window.addEventListener('themeChanged', (e) => {
      console.log(`Theme changed to: ${e.detail.theme}`);
    });
  }
};

// ==================================================================================== //
// 🎯 NAVIGATION MANAGER
// ==================================================================================== //

const NavigationManager = {
  init() {
    this.navbar = Utils.getElement('.navbar');
    this.navBrand = Utils.getElement('.nav-brand');
    this.navLinks = Utils.getElements('.nav-link');
    this.mobileMenuBtn = Utils.getElement('.mobile-menu-btn');
    this.mobileMenu = Utils.getElement('.mobile-menu');
    this.mobileNavLinks = Utils.getElements('.mobile-nav-link');
    this.scrollProgress = Utils.getElement('.scroll-progress');
    this.backToTop = Utils.getElement('#backToTop');
    
    this.createScrollProgress();
    this.createBackToTop();
    this.bindEvents();
    this.updateActiveLink();
    this.initializeScrollSpy();
  },

  createScrollProgress() {
    if (!this.scrollProgress) {
      const progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      progressBar.setAttribute('role', 'progressbar');
      progressBar.setAttribute('aria-label', 'Page scroll progress');
      
      if (this.navbar) {
        this.navbar.appendChild(progressBar);
      } else {
        document.body.appendChild(progressBar);
      }
      
      this.scrollProgress = progressBar;
    }
  },

  createBackToTop() {
    if (!this.backToTop) {
      const backToTopBtn = document.createElement('button');
      backToTopBtn.id = 'backToTop';
      backToTopBtn.className = 'back-to-top';
      backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
      backToTopBtn.setAttribute('aria-label', 'Back to top');
      backToTopBtn.setAttribute('title', 'Back to top');
      
      document.body.appendChild(backToTopBtn);
      this.backToTop = backToTopBtn;
    }
  },

  bindEvents() {
    // Mobile menu toggle
    if (this.mobileMenuBtn) {
      this.mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMobileMenu();
      });
    }
    
    // Navigation link clicks
    [...this.navLinks, ...this.mobileNavLinks].forEach(link => {
      link.addEventListener('click', (e) => this.handleNavClick(e));
    });
    
    // Scroll events
    window.addEventListener('scroll', Utils.throttle(() => {
      this.updateScrollProgress();
      this.updateNavbarAppearance();
      this.updateActiveLink();
      this.updateBackToTop();
    }, CONFIG.THROTTLE_DELAY), { passive: true });
    
    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
      if (AppState.isMobileMenuOpen && 
          !this.mobileMenu?.contains(e.target) && 
          !this.mobileMenuBtn?.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && AppState.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
    
    // Back to top button
    if (this.backToTop) {
      this.backToTop.addEventListener('click', () => {
        this.scrollToTop();
      });
    }
    
    // Navbar brand click
    if (this.navBrand) {
      this.navBrand.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToTop();
      });
    }
    
    // Handle resize
    window.addEventListener('resize', Utils.debounce(() => {
      if (window.innerWidth > 1024 && AppState.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
    }, CONFIG.DEBOUNCE_DELAY));
  },

  handleNavClick(e) {
    e.preventDefault();
    const href = e.target.getAttribute('href') || e.target.closest('a').getAttribute('href');
    
    if (href && href.startsWith('#')) {
      const targetId = href.substring(1);
      const targetElement = Utils.getElement(`#${targetId}`);
      
      if (targetElement) {
        this.scrollToSection(targetElement);
        this.closeMobileMenu();
        
        // Update URL without triggering scroll
        if (history.pushState) {
          history.pushState(null, null, href);
        }
        
        // Track navigation
        Analytics.trackEvent('navigation_click', { section: targetId });
      }
    }
  },

  scrollToSection(element) {
    if (!element) return;
    
    const navbarHeight = this.navbar ? this.navbar.offsetHeight : 0;
    const offset = navbarHeight + 20;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    // Smooth scroll with custom easing
    this.smoothScrollTo(offsetPosition, 800);
  },

  smoothScrollTo(targetPosition, duration) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let currentTime = 0;
    const increment = 20;
    
    const easeInOutQuad = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };
    
    const scrollAnimation = () => {
      currentTime += increment;
      const val = easeInOutQuad(currentTime, startPosition, distance, duration);
      window.scrollTo(0, val);
      
      if (currentTime < duration) {
        requestAnimationFrame(scrollAnimation);
      }
    };
    
    scrollAnimation();
  },

  scrollToTop() {
    this.smoothScrollTo(0, 600);
    Analytics.trackEvent('scroll_to_top');
  },

  toggleMobileMenu() {
    if (AppState.isMobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  },

  openMobileMenu() {
    if (!this.mobileMenu) return;
    
    AppState.isMobileMenuOpen = true;
    this.mobileMenu.classList.add('show');
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
    
    // Update button state
    if (this.mobileMenuBtn) {
      this.mobileMenuBtn.classList.add('active');
      this.mobileMenuBtn.setAttribute('aria-expanded', 'true');
      this.mobileMenuBtn.setAttribute('aria-label', 'Close menu');
    }
    
    // Animate menu items
    const menuItems = this.mobileMenu.querySelectorAll('.mobile-nav-link');
    menuItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.transform = 'translateX(0)';
        item.style.opacity = '1';
      }, index * 100);
    });
    
    // Focus first menu item
    const firstLink = this.mobileMenu.querySelector('.mobile-nav-link');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 300);
    }
    
    // Track menu open
    Analytics.trackEvent('mobile_menu_open');
  },

  closeMobileMenu() {
    if (!this.mobileMenu) return;
    
    AppState.isMobileMenuOpen = false;
    this.mobileMenu.classList.remove('show');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
    
    // Update button state
    if (this.mobileMenuBtn) {
      this.mobileMenuBtn.classList.remove('active');
      this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
      this.mobileMenuBtn.setAttribute('aria-label', 'Open menu');
    }
    
    // Reset menu items animation
    const menuItems = this.mobileMenu.querySelectorAll('.mobile-nav-link');
    menuItems.forEach(item => {
      item.style.transform = '';
      item.style.opacity = '';
    });
    
    // Track menu close
    Analytics.trackEvent('mobile_menu_close');
  },

  updateScrollProgress() {
    if (!this.scrollProgress) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    this.scrollProgress.style.width = `${Math.min(progress, 100)}%`;
    this.scrollProgress.setAttribute('aria-valuenow', Math.round(progress));
    
    AppState.scrollProgress = progress;
  },

  updateNavbarAppearance() {
    if (!this.navbar) return;
    
    const scrolled = window.pageYOffset > 50;
    const scrollingDown = window.pageYOffset > AppState.lastScrollTop;
    
    this.navbar.classList.toggle('scrolled', scrolled);
    this.navbar.classList.toggle('scroll-down', scrollingDown && window.pageYOffset > 200);
    this.navbar.classList.toggle('scroll-up', !scrollingDown);
    
    AppState.lastScrollTop = window.pageYOffset;
  },

  updateBackToTop() {
    if (!this.backToTop) return;
    
    const shouldShow = window.pageYOffset > window.innerHeight * 0.5;
    this.backToTop.classList.toggle('show', shouldShow);
  },

  updateActiveLink() {
    const sections = Utils.getElements('section[id], .section[id]');
    let activeSection = '';
    
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const isVisible = rect.top <= 100 && rect.bottom >= 100;
      
      if (isVisible) {
        activeSection = section.id;
      }
    });
    
    if (activeSection && activeSection !== AppState.activeSection) {
      AppState.activeSection = activeSection;
      
      // Update nav links
      [...this.navLinks, ...this.mobileNavLinks].forEach(link => {
        const href = link.getAttribute('href');
        const isActive = href === `#${activeSection}`;
        
        link.classList.toggle('active', isActive);
        link.setAttribute('aria-current', isActive ? 'page' : 'false');
      });
      
      // Update page title if needed
      this.updatePageTitle(activeSection);
    }
  },

  updatePageTitle(section) {
    const sectionTitles = {
      home: 'Home - Thanatsitt Santisamranwilai',
      about: 'About - Thanatsitt Santisamranwilai',
      skills: 'Skills - Thanatsitt Santisamranwilai',
      experience: 'Experience - Thanatsitt Santisamranwilai',
      projects: 'Projects - Thanatsitt Santisamranwilai',
      testimonials: 'Testimonials - Thanatsitt Santisamranwilai',
      contact: 'Contact - Thanatsitt Santisamranwilai'
    };
    
    const newTitle = sectionTitles[section];
    if (newTitle && document.title !== newTitle) {
      document.title = newTitle;
    }
  },

  initializeScrollSpy() {
    // Enhanced scroll spy with intersection observer
    const options = {
      threshold: 0.1,
      rootMargin: '-100px 0px -100px 0px'
    };
    
    const scrollSpyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId !== AppState.activeSection) {
            AppState.activeSection = sectionId;
            this.updateActiveLink();
          }
        }
      });
    }, options);
    
    // Observe all sections
    const sections = Utils.getElements('section[id], .section[id]');
    sections.forEach(section => {
      scrollSpyObserver.observe(section);
    });
    
    AppState.observers.set('scrollSpy', scrollSpyObserver);
  }
};

// ==================================================================================== //
// 🎯 ANIMATION MANAGER
// ==================================================================================== //

const AnimationManager = {
  init() {
    this.setupIntersectionObserver();
    this.initializeAnimations();
    this.bindEvents();
  },

  setupIntersectionObserver() {
    const options = {
      threshold: CONFIG.OBSERVER_THRESHOLD,
      rootMargin: CONFIG.OBSERVER_ROOT_MARGIN
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
        }
      });
    }, options);

    AppState.observers.set('animation', this.observer);
  },

  initializeAnimations() {
    // Set initial states for animated elements
    this.setInitialStates();
    
    // Animate elements on scroll
    const animatedElements = Utils.getElements('[data-animate], .animate-on-scroll');
    animatedElements.forEach(element => {
      this.observer.observe(element);
    });

    // Initialize typing animation
    this.initTypingAnimation();
    
    // Initialize skill bars
    this.initSkillBars();
    
    // Initialize counter animations
    this.initCounterAnimations();
    
    // Initialize parallax effects
    this.initParallaxEffects();
    
    // Initialize reveal animations
    this.initRevealAnimations();
  },

  setInitialStates() {
    const elements = Utils.getElements('[data-animate], .animate-on-scroll');
    elements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
  },

  animateElement(element) {
    const animationType = element.dataset.animate || 'fadeInUp';
    const delay = parseInt(element.dataset.delay) || 0;
    const duration = parseInt(element.dataset.duration) || 600;
    
    setTimeout(() => {
      this.applyAnimation(element, animationType, duration);
    }, delay);
    
    // Stop observing once animated
    this.observer.unobserve(element);
  },

  applyAnimation(element, type, duration) {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    
    switch (type) {
      case 'fadeIn':
        element.style.transform = 'none';
        break;
      case 'fadeInUp':
        element.style.transform = 'translateY(0)';
        break;
      case 'fadeInDown':
        element.style.transform = 'translateY(0)';
        break;
      case 'fadeInLeft':
        element.style.transform = 'translateX(0)';
        break;
      case 'fadeInRight':
        element.style.transform = 'translateX(0)';
        break;
      case 'zoomIn':
        element.style.transform = 'scale(1)';
        break;
      case 'rotateIn':
        element.style.transform = 'rotate(0deg)';
        break;
      default:
        element.style.transform = 'translateY(0)';
    }
    
    element.classList.add('animated', `animate-${type}`);
    
    // Clean up after animation
    setTimeout(() => {
      element.classList.remove('animated', `animate-${type}`);
      element.style.transition = '';
    }, duration);
  },

  initTypingAnimation() {
    const typingElements = Utils.getElements('.typing-text, [data-typing]');
    
    typingElements.forEach(element => {
      const texts = element.dataset.texts ? 
        element.dataset.texts.split('|') : 
        ['AI Creative Designer', 'Voice Artist', 'Full-Stack Developer'];
      
      let textIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      let isPaused = false;
      
      const typeText = () => {
        if (isPaused) {
          setTimeout(typeText, 100);
          return;
        }
        
        const currentText = texts[textIndex];
        
        if (isDeleting) {
          element.textContent = currentText.substring(0, charIndex - 1);
          charIndex--;
        } else {
          element.textContent = currentText.substring(0, charIndex + 1);
          charIndex++;
        }
        
        // Add cursor
        element.innerHTML = element.textContent + '<span class="typing-cursor">|</span>';
        
        let typeSpeed = isDeleting ? CONFIG.DELETING_SPEED : CONFIG.TYPING_SPEED;
        
        if (!isDeleting && charIndex === currentText.length) {
          typeSpeed = 2000; // Pause at end
          isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
          isDeleting = false;
          textIndex = (textIndex + 1) % texts.length;
          typeSpeed = 500; // Pause before next text
        }
        
        setTimeout(typeText, typeSpeed);
      };
      
      // Start typing animation when element is visible
      const typingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !element.dataset.typingStarted) {
            element.dataset.typingStarted = 'true';
            typeText();
            typingObserver.unobserve(element);
          }
        });
      }, { threshold: 0.5 });
      
      typingObserver.observe(element);
    });
  },

  initSkillBars() {
    const skillBars = Utils.getElements('.skill-bar-fill, [data-skill-level]');
    
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const skillBar = entry.target;
          const percentage = skillBar.dataset.skillLevel || 
                            skillBar.dataset.percentage || 
                            skillBar.getAttribute('data-level') || '0';
          
          // Animate the skill bar
          setTimeout(() => {
            skillBar.style.width = percentage + '%';
            skillBar.style.transition = 'width 1.5s ease-in-out';
            
            // Add percentage text if needed
            const percentageText = skillBar.dataset.showPercentage;
            if (percentageText === 'true') {
              const textElement = document.createElement('span');
              textElement.className = 'skill-percentage';
              textElement.textContent = percentage + '%';
              skillBar.appendChild(textElement);
            }
          }, 300);
          
          skillObserver.unobserve(skillBar);
        }
      });
    }, { threshold: 0.3 });
    
    skillBars.forEach(bar => skillObserver.observe(bar));
    AppState.observers.set('skills', skillObserver);
  },

  initCounterAnimations() {
    const counters = Utils.getElements('[data-count], .counter-number');
    
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => counterObserver.observe(counter));
    AppState.observers.set('counters', counterObserver);
  },
  animateCounter(element) {
    const target = parseInt(element.dataset.count) || parseInt(element.textContent) || 0;
    const duration = parseInt(element.dataset.duration) || 2000;
    const startValue = parseInt(element.dataset.start) || 0;
    const increment = (target - startValue) / (duration / 16);
    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';
    
    let current = startValue;
    
    const updateCounter = () => {
      current += increment;
      
      if (current >= target) {
        element.textContent = prefix + target.toLocaleString() + suffix;
      } else {
        element.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
        requestAnimationFrame(updateCounter);
      }
    };
    
    updateCounter();
    
    // Add completed class
    setTimeout(() => {
      element.classList.add('counter-completed');
    }, duration);
  },

  initParallaxEffects() {
    const parallaxElements = Utils.getElements('[data-parallax], .parallax-element');
    
    if (parallaxElements.length === 0) return;
    
    const updateParallax = Utils.throttle(() => {
      const scrollTop = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const speed = parseFloat(element.dataset.parallax) || 0.5;
        const yPos = -(scrollTop * speed);
        
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
          element.style.transform = `translateY(${yPos}px)`;
        }
      });
    }, CONFIG.THROTTLE_DELAY);
    
    window.addEventListener('scroll', updateParallax, { passive: true });
  },

  initRevealAnimations() {
    const revealElements = Utils.getElements('.reveal-on-scroll, [data-reveal]');
    
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const revealType = element.dataset.reveal || 'fadeInUp';
          const delay = parseInt(element.dataset.revealDelay) || 0;
          
          setTimeout(() => {
            element.classList.add('revealed', `reveal-${revealType}`);
          }, delay);
          
          revealObserver.unobserve(element);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
      element.classList.add('reveal-hidden');
      revealObserver.observe(element);
    });
    
    AppState.observers.set('reveal', revealObserver);
  },

  bindEvents() {
    // Pause animations when page is not visible
    document.addEventListener('visibilitychange', () => {
      const isPaused = document.hidden;
      const animatedElements = Utils.getElements('.animated, [data-animate]');
      
      animatedElements.forEach(element => {
        if (isPaused) {
          element.style.animationPlayState = 'paused';
        } else {
          element.style.animationPlayState = 'running';
        }
      });
    });
    
    // Reduce animations for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.reduceAnimations();
    }
  },

  reduceAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  },

  // Trigger hero animations
  triggerHeroAnimations() {
    const heroElements = Utils.getElements('.hero .animate-on-load, .hero [data-hero-animate]');
    
    heroElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate-fadeInUp');
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 200 + 500);
    });
  }
};

// ==================================================================================== //
// 🎯 FORM MANAGER
// ==================================================================================== //

const FormManager = {
  init() {
    this.contactForm = Utils.getElement('#contactForm');
    this.newsletterForm = Utils.getElement('#newsletterForm');
    this.forms = Utils.getElements('form[data-form]');
    
    if (this.contactForm) {
      this.initContactForm();
    }
    
    if (this.newsletterForm) {
      this.initNewsletterForm();
    }
    
    this.forms.forEach(form => {
      this.initGenericForm(form);
    });
    
    this.bindGlobalFormEvents();
  },

  initContactForm() {
    const formInputs = this.contactForm.querySelectorAll('input, textarea, select');
    const submitBtn = this.contactForm.querySelector('button[type="submit"]');
    
    // Load saved form data
    this.loadFormData(this.contactForm);
    
    // Add real-time validation
    formInputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        this.clearFieldError(input);
        this.saveFormData(this.contactForm);
      });
      
      // Character counter for textarea
      if (input.tagName === 'TEXTAREA') {
        this.addCharacterCounter(input);
      }
      
      // Auto-resize textarea
      if (input.tagName === 'TEXTAREA') {
        this.addAutoResize(input);
      }
    });
    
    // Form submission
    this.contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
    
    // Auto-save form data
    this.setupAutoSave(this.contactForm);
  },

  initNewsletterForm() {
    const emailInput = this.newsletterForm.querySelector('input[type="email"]');
    const submitBtn = this.newsletterForm.querySelector('button[type="submit"]');
    
    if (emailInput) {
      emailInput.addEventListener('input', () => {
        this.validateField(emailInput);
      });
    }
    
    this.newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
  },

  initGenericForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
    
    form.addEventListener('submit', (e) => this.handleGenericSubmit(e));
  },

  validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type || field.tagName.toLowerCase();
    const fieldName = field.name || field.id;
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required.';
    }
    
    // Email validation
    else if (fieldType === 'email' && value && !Utils.isValidEmail(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address.';
    }
    
    // Phone validation
    else if (fieldType === 'tel' && value && !Utils.isValidPhone(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid phone number.';
    }
    
    // URL validation
    else if (fieldType === 'url' && value && !this.isValidURL(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid URL.';
    }
    
    // Message length validation
    else if (fieldName === 'message' && value.length > CONFIG.MAX_MESSAGE_LENGTH) {
      isValid = false;
      errorMessage = `Message must be less than ${CONFIG.MAX_MESSAGE_LENGTH} characters.`;
    }
    
    // Name validation
    else if (fieldName === 'name' && value && value.length < 2) {
      isValid = false;
      errorMessage = 'Name must be at least 2 characters long.';
    }
    
    // Custom validation patterns
    const pattern = field.getAttribute('pattern');
    if (pattern && value && !new RegExp(pattern).test(value)) {
      isValid = false;
      errorMessage = field.getAttribute('data-error-message') || 'Please enter a valid value.';
    }
    
    this.showFieldValidation(field, isValid, errorMessage);
    return isValid;
  },

  isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  },

  showFieldValidation(field, isValid, errorMessage) {
    const fieldContainer = field.closest('.form-group') || field.parentNode;
    
    field.classList.remove('valid', 'invalid');
    field.classList.add(isValid ? 'valid' : 'invalid');
    
    // Remove existing error message
    const existingError = fieldContainer.querySelector('.form-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Remove existing success message
    const existingSuccess = fieldContainer.querySelector('.form-success');
    if (existingSuccess) {
      existingSuccess.remove();
    }
    
    // Add error message if needed
    if (!isValid && errorMessage) {
      const errorElement = document.createElement('div');
      errorElement.className = 'form-error';
      errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
      fieldContainer.appendChild(errorElement);
      
      // Add shake animation
      field.classList.add('shake');
      setTimeout(() => field.classList.remove('shake'), 500);
    }
    
    // Add success indicator for valid fields
    else if (isValid && field.value.trim()) {
      const successElement = document.createElement('div');
      successElement.className = 'form-success';
      successElement.innerHTML = '<i class="fas fa-check-circle"></i>';
      fieldContainer.appendChild(successElement);
    }
  },

  clearFieldError(field) {
    const fieldContainer = field.closest('.form-group') || field.parentNode;
    
    field.classList.remove('invalid');
    
    const errorElement = fieldContainer.querySelector('.form-error');
    if (errorElement) {
      errorElement.remove();
    }
  },

  addCharacterCounter(textarea) {
    const maxLength = parseInt(textarea.getAttribute('maxlength')) || CONFIG.MAX_MESSAGE_LENGTH;
    const fieldContainer = textarea.closest('.form-group') || textarea.parentNode;
    
    let counter = fieldContainer.querySelector('.char-counter');
    if (!counter) {
      counter = document.createElement('div');
      counter.className = 'char-counter';
      fieldContainer.appendChild(counter);
    }
    
    const updateCounter = () => {
      const currentLength = textarea.value.length;
      const remaining = maxLength - currentLength;
      
      counter.textContent = `${currentLength}/${maxLength}`;
      
      counter.className = 'char-counter';
      if (remaining < maxLength * 0.1) {
        counter.classList.add('warning');
      }
      if (remaining < 0) {
        counter.classList.add('error');
      }
    };
    
    textarea.addEventListener('input', updateCounter);
    updateCounter();
  },

  addAutoResize(textarea) {
    const resize = () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };
    
    textarea.addEventListener('input', resize);
    textarea.addEventListener('focus', resize);
    
    // Initial resize
    setTimeout(resize, 0);
  },

  setupAutoSave(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    const formId = form.id || 'form-' + Utils.generateId();
    
    const saveData = Utils.debounce(() => {
      this.saveFormData(form);
    }, 1000);
    
    inputs.forEach(input => {
      input.addEventListener('input', saveData);
    });
  },

  saveFormData(form) {
    const formId = form.id || 'default-form';
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    Utils.storage.set(`form-data-${formId}`, data);
  },

  loadFormData(form) {
    const formId = form.id || 'default-form';
    const savedData = Utils.storage.get(`form-data-${formId}`);
    
    if (savedData) {
      Object.keys(savedData).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field && savedData[key]) {
          field.value = savedData[key];
          
          // Trigger validation for loaded data
          this.validateField(field);
        }
      });
      
      // Show restore notification
      ToastManager.show('info', 'Your previously entered data has been restored.', 3000);
    }
  },

  clearFormData(form) {
    const formId = form.id || 'default-form';
    Utils.storage.remove(`form-data-${formId}`);
  },

  async handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    // Add honeypot check
    const honeypot = form.querySelector('input[name="honeypot"]');
    if (honeypot && honeypot.value) {
      console.warn('Bot detected');
      return;
    }
    
    // Validate all fields
    const fields = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isFormValid = true;
    
    fields.forEach(field => {
      if (!this.validateField(field)) {
        isFormValid = false;
      }
    });
    
    if (!isFormValid) {
      this.showFormMessage(form, 'error', 'Please fix the errors above.');
      this.focusFirstError(form);
      return;
    }
    
    // Show loading state
    this.setFormLoading(submitBtn, true);
    
    try {
      // Add timestamp and session info
      formData.append('timestamp', new Date().toISOString());
      formData.append('session_id', Utils.generateId());
      formData.append('user_agent', navigator.userAgent);
      formData.append('page_url', window.location.href);
      
      const response = await fetch(CONFIG.FORM_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        this.handleFormSuccess(form);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.handleFormError(form, error.message);
    } finally {
      this.setFormLoading(submitBtn, false);
    }
  },

  async handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!Utils.isValidEmail(email)) {
      ToastManager.show('error', 'Please enter a valid email address.');
      return;
    }
    
    this.setFormLoading(submitBtn, true);
    
    try {
      const response = await fetch(CONFIG.NEWSLETTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          timestamp: new Date().toISOString(),
          source: 'portfolio-website'
        })
      });
      
      if (response.ok) {
        ToastManager.show('success', 'Successfully subscribed to newsletter!');
        form.reset();
        Analytics.trackEvent('newsletter_signup', { email });
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      ToastManager.show('error', 'Subscription failed. Please try again.');
    } finally {
      this.setFormLoading(submitBtn, false);
    }
  },

  async handleGenericSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formType = form.dataset.form || 'generic';
    const endpoint = form.action || CONFIG.FORM_ENDPOINT;
    
    console.log(`Handling ${formType} form submission`);
    
    // Basic validation
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      ToastManager.show('error', 'Please fill in all required fields.');
      return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    this.setFormLoading(submitBtn, true);
    
    try {
      const formData = new FormData(form);
      formData.append('form_type', formType);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        ToastManager.show('success', 'Form submitted successfully!');
        form.reset();
        Analytics.trackEvent('form_submit', { type: formType });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      ToastManager.show('error', 'Submission failed. Please try again.');
    } finally {
      this.setFormLoading(submitBtn, false);
    }
  },

  handleFormSuccess(form) {
    this.showFormMessage(form, 'success', 'Thank you! Your message has been sent successfully.');
    form.reset();
    this.clearFormData(form);
    
    // Track successful submission
    Analytics.trackEvent('form_submit_success', { 
      form_id: form.id,
      form_type: 'contact'
    });
    
    // Show thank you modal
    setTimeout(() => {
      ModalManager.showThankYou();
    }, 1000);
  },

  handleFormError(form, errorMessage) {
    const message = errorMessage || 'Sorry, there was an error sending your message. Please try again.';
    this.showFormMessage(form, 'error', message);
    
    // Track form error
    Analytics.trackEvent('form_submit_error', {
      form_id: form.id,
      error_message: errorMessage
    });
  },

  showFormMessage(form, type, message) {
    // Remove existing messages
    const existingMessages = form.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `form-message form-message-${type}`;
    messageElement.innerHTML = `
      <div class="form-message-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
        <button type="button" class="form-message-close" aria-label="Close message">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    // Add close functionality
    const closeBtn = messageElement.querySelector('.form-message-close');
    closeBtn.addEventListener('click', () => {
      Utils.animate.fadeOut(messageElement).then(() => {
        messageElement.remove();
      });
    });
    
    // Insert at the top of the form
    form.insertBefore(messageElement, form.firstChild);
    
    // Animate in
    Utils.animate.fadeIn(messageElement);
    
    // Auto-hide success messages
    if (type === 'success') {
      setTimeout(() => {
        if (messageElement.parentNode) {
          Utils.animate.fadeOut(messageElement).then(() => {
            messageElement.remove();
          });
        }
      }, 5000);
    }
    
    // Scroll to message
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  focusFirstError(form) {
    const firstError = form.querySelector('.invalid');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  setFormLoading(button, isLoading) {
    if (!button) return;
    
    if (isLoading) {
      button.classList.add('loading');
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      
      // Store original text
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent;
      }
      
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    } else {
      button.classList.remove('loading');
      button.disabled = false;
      button.setAttribute('aria-busy', 'false');
      
      // Restore original text
      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
      }
    }
  },

  bindGlobalFormEvents() {
    // Prevent multiple form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.dataset.submitting === 'true') {
        e.preventDefault();
        return false;
      }
      form.dataset.submitting = 'true';
      
      // Reset after a delay
      setTimeout(() => {
        form.dataset.submitting = 'false';
      }, 3000);
    });
    
    // Auto-expand textareas
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'TEXTAREA' && e.target.classList.contains('auto-resize')) {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
      }
    });
    
    // Form field focus effects
    document.addEventListener('focus', (e) => {
      if (e.target.matches('input, textarea, select')) {
        const fieldContainer = e.target.closest('.form-group');
        if (fieldContainer) {
          fieldContainer.classList.add('focused');
        }
      }
    }, true);
    
    document.addEventListener('blur', (e) => {
      if (e.target.matches('input, textarea, select')) {
        const fieldContainer = e.target.closest('.form-group');
        if (fieldContainer) {
          fieldContainer.classList.remove('focused');
        }
      }
    }, true);
  }
};

// ==================================================================================== //
// 🎯 VOICE DEMO MANAGER
// ==================================================================================== //

const VoiceDemoManager = {
  init() {
    this.floatingBtn = Utils.getElement('#floatingVoiceBtn');
    this.voiceDemoBtn = Utils.getElement('.voice-demo-btn');
    this.waveBars = Utils.getElements('.wave-bar');
    this.audioElements = Utils.getElements('audio[data-voice-demo]');
    this.currentAudio = null;
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    
    if (!this.floatingBtn) {
      this.createFloatingButton();
    }
    
    this.initializeAudioSystem();
    this.bindEvents();
    this.showFloatingButton();
  },

  createFloatingButton() {
    const floatingHTML = `
      <div id="floatingVoiceBtn" class="floating-voice-demo" role="button" tabindex="0">
        <div class="floating-voice-btn">
          <button class="voice-demo-btn" aria-label="Play voice demo">
            <i class="fas fa-play"></i>
          </button>
          <div class="voice-info">
            <h4>Voice Demo</h4>
            <p>Hear my introduction</p>
            <div class="voice-waveform" aria-hidden="true">
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
            </div>
          </div>
          <div class="voice-duration">
            <span class="current-time">0:00</span>
            <span class="total-time">2:30</span>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', floatingHTML);
    this.floatingBtn = Utils.getElement('#floatingVoiceBtn');
    this.voiceDemoBtn = Utils.getElement('.voice-demo-btn');
    this.waveBars = Utils.getElements('.wave-bar');
  },

  initializeAudioSystem() {
    try {
      // Initialize Web Audio API for visualization
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  },

  bindEvents() {
    // Voice demo button clicks
    const voiceButtons = Utils.getElements('.voice-demo-btn, [data-voice-trigger]');
    voiceButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleVoiceDemo(btn.dataset.voiceUrl || CONFIG.VOICE_DEMO_URL);
      });
    });
    
    // Floating button click
    if (this.floatingBtn) {
      this.floatingBtn.addEventListener('click', () => {
        this.toggleVoiceDemo();
      });
      
      this.floatingBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleVoiceDemo();
        }
      });
    }
    
    // Show/hide on scroll
    window.addEventListener('scroll', Utils.throttle(() => {
      this.updateFloatingButtonVisibility();
    }, CONFIG.THROTTLE_DELAY), { passive: true });
    
    // Handle audio element events
    this.audioElements.forEach(audio => {
      audio.addEventListener('loadstart', () => this.handleAudioEvent('loadstart', audio));
      audio.addEventListener('loadeddata', () => this.handleAudioEvent('loadeddata', audio));
      audio.addEventListener('canplay', () => this.handleAudioEvent('canplay', audio));
      audio.addEventListener('play', () => this.handleAudioEvent('play', audio));
      audio.addEventListener('pause', () => this.handleAudioEvent('pause', audio));
      audio.addEventListener('ended', () => this.handleAudioEvent('ended', audio));
      audio.addEventListener('error', (e) => this.handleAudioEvent('error', audio, e));
      audio.addEventListener('timeupdate', () => this.handleAudioEvent('timeupdate', audio));
    });
    
    // Keyboard shortcuts for audio control
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;
      
      switch (e.key) {
        case ' ':
          if (this.currentAudio) {
            e.preventDefault();
            this.toggleVoiceDemo();
          }
          break;
        case 'Escape':
          if (AppState.isVoicePlaying) {
            this.stopVoiceDemo();
          }
          break;
      }
    });
  },

  showFloatingButton() {
    setTimeout(() => {
      if (this.floatingBtn) {
        this.floatingBtn.classList.add('show');
        
        // Add entrance animation
        Utils.animate.bounceIn(this.floatingBtn, 600);
      }
    }, 3000);
  },

  updateFloatingButtonVisibility() {
    if (!this.floatingBtn) return;
    
    const scrolled = window.pageYOffset > 300;
    const nearBottom = (window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 1000;
    const inViewport = scrolled && !nearBottom;
    
    this.floatingBtn.classList.toggle('show', inViewport);
    
    // Update position based on scroll
    if (inViewport) {
      const scrollProgress = window.pageYOffset / (document.body.offsetHeight - window.innerHeight);
      const translateY = scrollProgress * 20; // Subtle parallax effect
      this.floatingBtn.style.transform = `translateY(${translateY}px)`;
    }
  },

  async toggleVoiceDemo(audioUrl = CONFIG.VOICE_DEMO_URL) {
    if (AppState.isVoicePlaying) {
      this.stopVoiceDemo();
    } else {
      await this.playVoiceDemo(audioUrl);
    }
  },

  async playVoiceDemo(audioUrl = CONFIG.VOICE_DEMO_URL) {
    try {
      // Stop any currently playing audio
      this.stopAllAudio();
      
      // Create or get audio element
      if (!this.currentAudio || this.currentAudio.src !== audioUrl) {
        this.currentAudio = this.createAudioElement(audioUrl);
      }
      
      // Resume audio context if suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Play audio
      await this.currentAudio.play();
      
      AppState.isVoicePlaying = true;
      AppState.currentAudio = this.currentAudio;
      
      this.updateVoiceButton();
      this.startWaveAnimation();
      this.startVisualization();
      
      // Track voice demo play
      Analytics.trackEvent('voice_demo_play', {
        audio_url: audioUrl,
        duration: this.currentAudio.duration
      });
      
    } catch (error) {
      console.error('Voice demo error:', error);
      this.handleVoiceError(error);
    }
  },

  createAudioElement(audioUrl) {
    const audio = new Audio();
    audio.src = audioUrl;
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    
    // Set up audio context connection for visualization
    if (this.audioContext && this.analyser) {
      try {
        const source = this.audioContext.createMediaElementSource(audio);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      } catch (error) {
        console.warn('Audio context connection failed:', error);
      }
    }
    
    // Event listeners
    audio.addEventListener('ended', () => this.stopVoiceDemo());
    audio.addEventListener('error', (e) => this.handleVoiceError(e));
    audio.addEventListener('timeupdate', () => this.updateProgress());
    audio.addEventListener('loadedmetadata', () => this.updateDuration());
    
    return audio;
  },

  stopVoiceDemo() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    
    AppState.isVoicePlaying = false;
    AppState.currentAudio = null;
    
    this.updateVoiceButton();
    this.stopWaveAnimation();
    this.stopVisualization();
    
    // Track voice demo stop
    Analytics.trackEvent('voice_demo_stop');
  },

  stopAllAudio() {
    // Stop any other audio elements
    const allAudio = document.querySelectorAll('audio');
    allAudio.forEach(audio => {
      if (!audio.paused) {
        audio.pause();
      }
    });
  },

  updateVoiceButton() {
    const buttons = Utils.getElements('.voice-demo-btn, [data-voice-trigger]');
    
    buttons.forEach(btn => {
      const icon = btn.querySelector('i') || btn;
      const isPlaying = AppState.isVoicePlaying;
      
      if (btn.querySelector('i')) {
        icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
      } else {
        btn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
      }
      
      const label = isPlaying ? 'Pause voice demo' : 'Play voice demo';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      btn.classList.toggle('playing', isPlaying);
    });
  },

  updateProgress() {
    if (!this.currentAudio) return;
    
    const currentTime = this.currentAudio.currentTime;
    const duration = this.currentAudio.duration;
    
    // Update time displays
    const currentTimeEl = Utils.getElement('.current-time');
    const progressBars = Utils.getElements('.audio-progress');
    
    if (currentTimeEl) {
      currentTimeEl.textContent = this.formatTime(currentTime);
    }
    
    progressBars.forEach(bar => {
      const progress = (currentTime / duration) * 100;
      bar.style.width = `${progress}%`;
    });
  },

  updateDuration() {
    if (!this.currentAudio) return;
    
    const duration = this.currentAudio.duration;
    const totalTimeEl = Utils.getElement('.total-time');
    
    if (totalTimeEl && !isNaN(duration)) {
      totalTimeEl.textContent = this.formatTime(duration);
    }
  },

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  startWaveAnimation() {
    this.waveBars.forEach((bar, index) => {
      bar.classList.add('active');
      bar.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Add floating button animation
    if (this.floatingBtn) {
      this.floatingBtn.classList.add('playing');
    }
  },

  stopWaveAnimation() {
    this.waveBars.forEach(bar => {
      bar.classList.remove('active');
      bar.style.animationDelay = '';
    });
    
    // Remove floating button animation
    if (this.floatingBtn) {
      this.floatingBtn.classList.remove('playing');
    }
  },

  startVisualization() {
    if (!this.analyser || !this.dataArray) return;
    
    const visualize = () => {
      if (!AppState.isVoicePlaying) return;
      
      requestAnimationFrame(visualize);
      
      this.analyser.getByteFrequencyData(this.dataArray);
      
      // Update wave bars based on frequency data
      this.waveBars.forEach((bar, index) => {
        const dataIndex = Math.floor((index / this.waveBars.length) * this.dataArray.length);
        const value = this.dataArray[dataIndex];
        const height = (value / 255) * 100;
        
        bar.style.height = `${Math.max(height, 10)}%`;
      });
    };
    
    visualize();
  },

  stopVisualization() {
    // Reset wave bars to default state
    this.waveBars.forEach(bar => {
      bar.style.height = '';
    });
  },

  handleAudioEvent(eventType, audio, error = null) {
    switch (eventType) {
      case 'loadstart':
        console.log('Audio loading started');
        break;
      case 'loadeddata':
        console.log('Audio data loaded');
        break;
      case 'canplay':
        console.log('Audio can start playing');
        break;
      case 'play':
        console.log('Audio started playing');
        break;
      case 'pause':
        console.log('Audio paused');
        break;
      case 'ended':
        console.log('Audio playback ended');
        this.stopVoiceDemo();
        break;
      case 'error':
        console.error('Audio error:', error);
        this.handleVoiceError(error);
        break;
      case 'timeupdate':
        this.updateProgress();
        break;
    }
  },

  handleVoiceError(error) {
    console.error('Voice demo error:', error);
    
    let errorMessage = 'Unable to play voice demo. ';
    
    if (error && error.target && error.target.error) {
      switch (error.target.error.code) {
        case 1:
          errorMessage += 'Media loading aborted.';
          break;
        case 2:
          errorMessage += 'Network error occurred.';
          break;
        case 3:
          errorMessage += 'Media decoding failed.';
          break;
        case 4:
          errorMessage += 'Media format not supported.';
          break;
        default:
          errorMessage += 'Please try again.';
      }
    } else {
      errorMessage += 'Please try again.';
    }
    
    ToastManager.show('error', errorMessage);
    this.stopVoiceDemo();
    
    // Track error
    Analytics.trackEvent('voice_demo_error', {
      error_message: errorMessage,
      error_code: error?.target?.error?.code || 'unknown'
    });
  }
};

// ==================================================================================== //
// 🎯 TOAST NOTIFICATION MANAGER
// ==================================================================================== //

const ToastManager = {
  init() {
    this.container = Utils.getElement('.toast-container');
    if (!this.container) {
      this.createContainer();
    }
    this.toasts = [];
    this.maxToasts = 5;
  },

  createContainer() {
    const containerHTML = `
      <div class="toast-container" id="toastContainer" role="region" aria-label="Notifications" aria-live="polite">
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', containerHTML);
    this.container = Utils.getElement('.toast-container');
  },

  show(type = 'info', message, duration = CONFIG.TOAST_DURATION, options = {}) {
    const toast = this.createToast(type, message, options);
    
    // Limit number of toasts
    if (this.toasts.length >= this.maxToasts) {
      this.hide(this.toasts[0]);
    }
    
    this.container.appendChild(toast);
    this.toasts.push(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Auto-hide if duration is specified
    if (duration > 0) {
      setTimeout(() => {
        this.hide(toast);
      }, duration);
    }
    
    // Track toast display
    Analytics.trackEvent('toast_show', { type, message: message.substring(0, 50) });
    
    return toast;
  },

  createToast(type, message, options = {}) {
    const toastId = Utils.generateId('toast');
    const { 
      persistent = false, 
      actionText = null, 
      actionHandler = null,
      icon = null 
    } = options;
    
    const icons = {
      success: icon || 'fas fa-check-circle',
      error: icon || 'fas fa-exclamation-circle',
      warning: icon || 'fas fa-exclamation-triangle',
      info: icon || 'fas fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">
          <i class="${icons[type] || icons.info}"></i>
        </div>
        <div class="toast-body">
          <div class="toast-message">${Utils.sanitizeHTML(message)}</div>
          ${actionText && actionHandler ? `
            <button class="toast-action" type="button">${actionText}</button>
          ` : ''}
        </div>
        ${!persistent ? `
          <button class="toast-close" type="button" aria-label="Close notification">
            <i class="fas fa-times"></i>
          </button>
        ` : ''}
      </div>
      <div class="toast-progress"></div>
    `;
    
    // Bind events
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide(toast));
    }
    
    const actionBtn = toast.querySelector('.toast-action');
    if (actionBtn && actionHandler) {
      actionBtn.addEventListener('click', (e) => {
        actionHandler(e, toast);
      });
    }
    
    // Handle keyboard navigation
    toast.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && closeBtn) {
        this.hide(toast);
      }
    });
    
    return toast;
  },

  async hide(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.classList.remove('show');
    toast.classList.add('hiding');
    
    // Remove from toasts array
    const index = this.toasts.indexOf(toast);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, CONFIG.TOAST_ANIMATION_DURATION);
  },

  clear() {
    this.toasts.forEach(toast => this.hide(toast));
    this.toasts = [];
  },

  // Convenience methods
  success(message, duration, options) {
    return this.show('success', message, duration, options);
  },

  error(message, duration, options) {
    return this.show('error', message, duration, options);
  },

  warning(message, duration, options) {
    return this.show('warning', message, duration, options);
  },

  info(message, duration, options) {
    return this.show('info', message, duration, options);
  },

  // Show confirmation toast with action
  confirm(message, confirmText = 'Confirm', confirmHandler) {
    return this.show('warning', message, 0, {
      persistent: true,
      actionText: confirmText,
      actionHandler: (e, toast) => {
        confirmHandler();
        this.hide(toast);
      }
    });
  },

  // Show loading toast
  loading(message) {
    return this.show('info', message, 0, {
      persistent: true,
      icon: 'fas fa-spinner fa-spin'
    });
  }
};

// ==================================================================================== //
// 🎯 MODAL MANAGER
// ==================================================================================== //

const ModalManager = {
  init() {
    this.activeModals = [];
    this.focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    this.bindEvents();
  },

  bindEvents() {
    // Modal triggers
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal]');
      if (trigger) {
        e.preventDefault();
        const modalId = trigger.dataset.modal;
        const modalData = trigger.dataset.modalData ? JSON.parse(trigger.dataset.modalData) : {};
        this.open(modalId, modalData);
      }
      
      // Close button
      const closeBtn = e.target.closest('.modal-close, [data-modal-close]');
      if (closeBtn) {
        e.preventDefault();
        this.close();
      }
      
      // Backdrop click
      if (e.target.classList.contains('modal')) {
        this.close();
      }
    });
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModals.length > 0) {
        this.close();
      }
      
      // Tab key for focus trapping
      if (e.key === 'Tab' && this.activeModals.length > 0) {
        this.trapFocus(e);
      }
    });
    
    // Project modal triggers
    document.addEventListener('click', (e) => {
      const projectCard = e.target.closest('.project-card');
      const viewBtn = e.target.closest('.project-view, .project-details');
      
      if (projectCard && viewBtn) {
        e.preventDefault();
        const projectId = projectCard.dataset.projectId;
        this.openProjectModal(projectId);
      }
    });
  },

  async open(modalId, data = {}) {
    let modal = Utils.getElement(`#${modalId}`);
    
    // Create modal if it doesn't exist
    if (!modal) {
      modal = await this.createModal(modalId, data);
    }
    
    if (!modal) {
      console.error(`Modal ${modalId} not found and could not be created`);
      return;
    }
    
    // Update modal content if data provided
    if (Object.keys(data).length > 0) {
      this.updateModalContent(modal, data);
    }
    
    // Show modal
    await this.showModal(modal);
    
    // Track modal open
    Analytics.trackEvent('modal_open', { modal_id: modalId });
  },

  async createModal(modalId, data = {}) {
    let modalHTML = '';
    
    switch (modalId) {
      case 'project-modal':
        modalHTML = this.createProjectModal(data);
        break;
      case 'thank-you-modal':
        modalHTML = this.createThankYouModal();
        break;
      case 'contact-modal':
        modalHTML = this.createContactModal();
        break;
      case 'image-modal':
        modalHTML = this.createImageModal(data);
        break;
      case 'video-modal':
        modalHTML = this.createVideoModal(data);
        break;
      default:
        modalHTML = this.createGenericModal(modalId, data);
    }
    
    // Insert modal into DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    return Utils.getElement(`#${modalId}`);
  },

  createProjectModal(project = {}) {
    const {
      id = 'unknown',
      title = 'Project Title',
      description = 'Project description',
      image = 'assets/images/placeholder.jpg',
      technologies = [],
      features = [],
      challenges = [],
      outcomes = [],
      demoUrl = '',
      githubUrl = '',
      category = 'web',
      status = 'completed',
      client = '',
      duration = '',
      role = '',
      gallery = []
    } = project;
    
    return `
      <div id="project-modal" class="modal modal-large" role="dialog" aria-labelledby="project-modal-title" aria-modal="true">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="project-modal-title" class="modal-title">${title}</h2>
            <div class="project-meta">
              <span class="project-category">${Utils.capitalize(category)}</span>
              <span class="project-status status-${status}">${Utils.capitalize(status)}</span>
            </div>
            <button type="button" class="modal-close" aria-label="Close modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="project-hero">
              <div class="project-image">
                <img src="${image}" alt="${title}" loading="lazy">
                ${gallery.length > 0 ? `
                  <div class="project-gallery-nav">
                    <button class="gallery-prev" aria-label="Previous image">
                      <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="gallery-next" aria-label="Next image">
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </div>
                ` : ''}
              </div>
              
              <div class="project-info">
                <div class="project-description">
                  <p>${description}</p>
                </div>
                
                ${client || duration || role ? `
                  <div class="project-details">
                    ${client ? `<div class="detail-item"><strong>Client:</strong> ${client}</div>` : ''}
                    ${duration ? `<div class="detail-item"><strong>Duration:</strong> ${duration}</div>` : ''}
                    ${role ? `<div class="detail-item"><strong>Role:</strong> ${role}</div>` : ''}
                  </div>
                ` : ''}
                
                <div class="project-technologies">
                  <h4>Technologies Used</h4>
                  <div class="tech-stack">
                    ${technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                  </div>
                </div>
                
                <div class="project-actions">
                  ${demoUrl ? `
                    <a href="${demoUrl}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
                      <i class="fas fa-external-link-alt"></i> Live Demo
                    </a>
                  ` : ''}
                  ${githubUrl ? `
                    <a href="${githubUrl}" class="btn btn-outline" target="_blank" rel="noopener noreferrer">
                      <i class="fab fa-github"></i> View Code
                    </a>
                  ` : ''}
                </div>
              </div>
            </div>
            
            ${features.length > 0 || challenges.length > 0 || outcomes.length > 0 ? `
              <div class="project-sections">
                ${features.length > 0 ? `
                  <div class="project-section">
                    <h3>Key Features</h3>
                    <ul class="feature-list">
                      ${features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                
                ${challenges.length > 0 ? `
                  <div class="project-section">
                    <h3>Challenges & Solutions</h3>
                    <ul class="challenge-list">
                      ${challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                
                ${outcomes.length > 0 ? `
                  <div class="project-section">
                    <h3>Outcomes & Results</h3>
                    <ul class="outcome-list">
                      ${outcomes.map(outcome => `<li>${outcome}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            ` : ''}
            
            ${gallery.length > 0 ? `
              <div class="project-gallery">
                <h3>Project Gallery</h3>
                <div class="gallery-grid">
                  ${gallery.map((img, index) => `
                    <div class="gallery-item" data-index="${index}">
                      <img src="${img.thumb || img.url}" alt="${img.alt || `${title} screenshot ${index + 1}`}" loading="lazy">
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  createThankYouModal() {
    return `
      <div id="thank-you-modal" class="modal modal-center" role="dialog" aria-labelledby="thank-you-title" aria-modal="true">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="modal-close" aria-label="Close modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body text-center">
            <div class="thank-you-content">
              <div class="thank-you-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <h2 id="thank-you-title">Thank You!</h2>
              <p>Your message has been sent successfully. I'll get back to you within 24 hours.</p>
              
              <div class="thank-you-actions">
                <button type="button" class="btn btn-primary modal-close">
                  Continue Browsing
                </button>
                <div class="social-follow">
                  <p>Follow me for updates:</p>
                  <div class="social-links">
                    <a href="${CONFIG.SOCIAL_LINKS.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">
                      <i class="fab fa-linkedin"></i>
                    </a>
                    <a href="${CONFIG.SOCIAL_LINKS.github}" target="_blank" rel="noopener" aria-label="GitHub">
                      <i class="fab fa-github"></i>
                    </a>
                    <a href="${CONFIG.SOCIAL_LINKS.twitter}" target="_blank" rel="noopener" aria-label="Twitter">
                      <i class="fab fa-twitter"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  createContactModal() {
    return `
      <div id="contact-modal" class="modal modal-large" role="dialog" aria-labelledby="contact-modal-title" aria-modal="true">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="contact-modal-title" class="modal-title">Get In Touch</h2>
            <button type="button" class="modal-close" aria-label="Close modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="contact-options">
              <div class="contact-method">
                <div class="contact-icon">
                  <i class="fas fa-envelope"></i>
                </div>
                <div class="contact-info">
                  <h3>Email</h3>
                  <p>Get a response within 24 hours</p>
                  <a href="${CONFIG.SOCIAL_LINKS.email}" class="contact-link">
                    thanattsitt.info@yahoo.co.uk
                  </a>
                </div>
              </div>
              
              <div class="contact-method">
                <div class="contact-icon">
                  <i class="fab fa-linkedin"></i>
                </div>
                <div class="contact-info">
                  <h3>LinkedIn</h3>
                  <p>Let's connect professionally</p>
                  <a href="${CONFIG.SOCIAL_LINKS.linkedin}" target="_blank" rel="noopener" class="contact-link">
                    Connect on LinkedIn
                  </a>
                </div>
              </div>
              
              <div class="contact-method">
                <div class="contact-icon">
                  <i class="fas fa-phone"></i>
                </div>
                <div class="contact-info">
                  <h3>Phone</h3>
                  <p>Available for urgent inquiries</p>
                  <a href="${CONFIG.SOCIAL_LINKS.phone}" class="contact-link">
                    Call Now
                  </a>
                </div>
              </div>
            </div>
            
            <div class="contact-form-container">
              <h3>Send a Message</h3>
              <form id="modal-contact-form" class="contact-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="modal-name">Name *</label>
                    <input type="text" id="modal-name" name="name" required>
                  </div>
                  <div class="form-group">
                    <label for="modal-email">Email *</label>
                    <input type="email" id="modal-email" name="email" required>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="modal-subject">Subject</label>
                  <input type="text" id="modal-subject" name="subject">
                </div>
                
                <div class="form-group">
                  <label for="modal-message">Message *</label>
                  <textarea id="modal-message" name="message" rows="5" required maxlength="${CONFIG.MAX_MESSAGE_LENGTH}"></textarea>
                </div>
                
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-paper-plane"></i> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  createImageModal(data = {}) {
    const { src = '', alt = '', caption = '' } = data;
    
    return `
      <div id="image-modal" class="modal modal-image" role="dialog" aria-labelledby="image-modal-title" aria-modal="true">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="image-modal-title" class="modal-title sr-only">${alt || 'Image'}</h2>
            <button type="button" class="modal-close" aria-label="Close image">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="image-container">
              <img src="${src}" alt="${alt}" loading="lazy">
              ${caption ? `<div class="image-caption">${caption}</div>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  createVideoModal(data = {}) {
    const { src = '', title = '', poster = '' } = data;
    
    return `
      <div id="video-modal" class="modal modal-video" role="dialog" aria-labelledby="video-modal-title" aria-modal="true">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="video-modal-title" class="modal-title">${title || 'Video'}</h2>
            <button type="button" class="modal-close" aria-label="Close video">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="video-container">
              <video controls ${poster ? `poster="${poster}"` : ''}>
                <source src="${src}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  createGenericModal(modalId, data = {}) {
    const { title = 'Modal', content = '', size = 'medium' } = data;
    
    return `
      <div id="${modalId}" class="modal modal-${size}" role="dialog" aria-labelledby="${modalId}-title" aria-modal="true">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="${modalId}-title" class="modal-title">${title}</h2>
            <button type="button" class="modal-close" aria-label="Close modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            ${content}
          </div>
        </div>
      </div>
    `;
  },

  updateModalContent(modal, data) {
    // Update title
    if (data.title) {
      const titleElement = modal.querySelector('.modal-title');
      if (titleElement) {
        titleElement.textContent = data.title;
      }
    }
    
    // Update content
    if (data.content) {
      const bodyElement = modal.querySelector('.modal-body');
      if (bodyElement) {
        bodyElement.innerHTML = data.content;
      }
    }
    
    // Update image src
    if (data.src) {
      const imgElement = modal.querySelector('img');
      if (imgElement) {
        imgElement.src = data.src;
        imgElement.alt = data.alt || '';
      }
    }
  },

  async showModal(modal) {
    if (!modal) return;
    
    // Store current focus
    this.previousFocus = document.activeElement;
    
    // Add to active modals stack
    this.activeModals.push(modal);
    AppState.modalStack.push(modal.id);
    
    // Add classes and show
    document.body.classList.add('modal-open');
    modal.classList.add('show');
    
    // Wait for CSS transition
    await Utils.delay(50);
    
    // Focus management
    this.setInitialFocus(modal);
    
    // Add modal-specific event listeners
    this.bindModalEvents(modal);
    
    // Animate in
    await Utils.animate.fadeIn(modal, CONFIG.ANIMATION_DURATION);
    
    // Track modal show
    Analytics.trackEvent('modal_show', { modal_id: modal.id });
  },

  async close(modal = null) {
    // Get the modal to close (last opened if not specified)
    const modalToClose = modal || this.activeModals[this.activeModals.length - 1];
    
    if (!modalToClose) return;
    
    // Remove from active stack
    const index = this.activeModals.indexOf(modalToClose);
    if (index > -1) {
      this.activeModals.splice(index, 1);
    }
    
    const stackIndex = AppState.modalStack.indexOf(modalToClose.id);
    if (stackIndex > -1) {
      AppState.modalStack.splice(stackIndex, 1);
    }
    
    // Animate out
    await Utils.animate.fadeOut(modalToClose, CONFIG.ANIMATION_DURATION);
    
    // Remove classes
    modalToClose.classList.remove('show');
    
    // If no more modals, remove body class
    if (this.activeModals.length === 0) {
      document.body.classList.remove('modal-open');
      
      // Restore focus
      if (this.previousFocus && this.previousFocus.focus) {
        this.previousFocus.focus();
      }
    }
    
    // Remove modal-specific event listeners
    this.unbindModalEvents(modalToClose);
    
    // Remove from DOM if it was dynamically created
    if (modalToClose.dataset.dynamic !== 'false') {
      setTimeout(() => {
        if (modalToClose.parentNode) {
          modalToClose.parentNode.removeChild(modalToClose);
        }
      }, CONFIG.ANIMATION_DURATION);
    }
    
    // Track modal close
    Analytics.trackEvent('modal_close', { modal_id: modalToClose.id });
  },

  setInitialFocus(modal) {
    // Focus first focusable element or close button
    const focusableElements = modal.querySelectorAll(this.focusableSelectors);
    const firstFocusable = focusableElements[0];
    const closeButton = modal.querySelector('.modal-close');
    
    if (firstFocusable && firstFocusable !== closeButton) {
      firstFocusable.focus();
    } else if (closeButton) {
      closeButton.focus();
    }
  },

  trapFocus(event) {
    const modal = this.activeModals[this.activeModals.length - 1];
    if (!modal) return;
    
    const focusableElements = modal.querySelectorAll(this.focusableSelectors);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  },

  bindModalEvents(modal) {
    // Form submission in modals
    const forms = modal.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleModalFormSubmit(e));
    });
    
    // Gallery navigation
    const galleryPrev = modal.querySelector('.gallery-prev');
    const galleryNext = modal.querySelector('.gallery-next');
    
    if (galleryPrev && galleryNext) {
      galleryPrev.addEventListener('click', () => this.navigateGallery(modal, -1));
      galleryNext.addEventListener('click', () => this.navigateGallery(modal, 1));
    }
    
    // Gallery item clicks
    const galleryItems = modal.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => this.showGalleryItem(modal, index));
    });
  },

  unbindModalEvents(modal) {
    // Remove event listeners to prevent memory leaks
    const forms = modal.querySelectorAll('form');
    forms.forEach(form => {
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
    });
  },

  async handleModalFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Basic validation
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!FormManager.validateField(field)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      ToastManager.error('Please fill in all required fields.');
      return;
    }
    
    FormManager.setFormLoading(submitBtn, true);
    
    try {
      const response = await fetch(CONFIG.FORM_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        ToastManager.success('Message sent successfully!');
        form.reset();
        
        // Close modal after delay
        setTimeout(() => {
          this.close();
        }, 1500);
        
        Analytics.trackEvent('modal_form_submit_success');
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Modal form submission error:', error);
      ToastManager.error('Failed to send message. Please try again.');
      Analytics.trackEvent('modal_form_submit_error', { error: error.message });
    } finally {
      FormManager.setFormLoading(submitBtn, false);
    }
  },

  navigateGallery(modal, direction) {
    const currentImg = modal.querySelector('.project-image img');
    const gallery = this.getCurrentProjectGallery();
    
    if (!gallery || gallery.length === 0) return;
    
    let currentIndex = 0;
    const currentSrc = currentImg.src;
    
    // Find current image index
    gallery.forEach((img, index) => {
      if (currentSrc.includes(img.url) || currentSrc.includes(img.thumb)) {
        currentIndex = index;
      }
    });
    
    // Calculate new index
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = gallery.length - 1;
    if (newIndex >= gallery.length) newIndex = 0;
    
    // Update image
    const newImg = gallery[newIndex];
    currentImg.src = newImg.url || newImg.thumb;
    currentImg.alt = newImg.alt || `Project image ${newIndex + 1}`;
    
    // Update gallery item active state
    const galleryItems = modal.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
      item.classList.toggle('active', index === newIndex);
    });
  },

  showGalleryItem(modal, index) {
    const gallery = this.getCurrentProjectGallery();
    if (!gallery || !gallery[index]) return;
    
    const img = gallery[index];
    const currentImg = modal.querySelector('.project-image img');
    
    currentImg.src = img.url || img.thumb;
    currentImg.alt = img.alt || `Project image ${index + 1}`;
    
    // Update active state
    const galleryItems = modal.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  },

  getCurrentProjectGallery() {
    // This would be populated when opening a project modal
    return this.currentProjectGallery || [];
  },

  async openProjectModal(projectId) {
    try {
      // Get project data
      const project = await this.getProjectData(projectId);
      
      if (!project) {
        ToastManager.error('Project not found.');
        return;
      }
      
      // Store gallery for navigation
      this.currentProjectGallery = project.gallery || [];
      
      // Open modal with project data
      await this.open('project-modal', project);
      
      // Track project view
      Analytics.trackEvent('project_view', { project_id: projectId });
      
    } catch (error) {
      console.error('Error opening project modal:', error);
      ToastManager.error('Failed to load project details.');
    }
  },

  async getProjectData(projectId) {
    // Try to get from cache first
    const cacheKey = `project-${projectId}`;
    let project = AppState.cache.get(cacheKey);
    
    if (project) {
      return project;
    }
    
    // Get from data manager or API
    project = await DataManager.getProject(projectId);
    
    if (project) {
      // Cache for future use
      AppState.cache.set(cacheKey, project);
    }
    
    return project;
  },

  showThankYou() {
    this.open('thank-you-modal');
  },

  showContact() {
    this.open('contact-modal');
  },

  showImage(src, alt, caption) {
    this.open('image-modal', { src, alt, caption });
  },

  showVideo(src, title, poster) {
    this.open('video-modal', { src, title, poster });
  }
};

// ==================================================================================== //
// 🎯 DATA MANAGER
// ==================================================================================== //

const DataManager = {
  init() {
    this.apiEndpoints = {
      projects: '/api/projects',
      testimonials: '/api/testimonials',
      skills: '/api/skills',
      experience: '/api/experience'
    };
    
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    this.loadData();
  },

  async loadData() {
    try {
      Utils.performance.mark('data-load-start');
      
      const loadPromises = [
        this.loadProjects(),
        this.loadTestimonials(),
        this.loadSkills(),
        this.loadExperience()
      ];
      
      await Promise.allSettled(loadPromises);
      
      Utils.performance.mark('data-load-end');
      Utils.performance.measure('data-load-duration', 'data-load-start', 'data-load-end');
      
      console.log('📊 Data loading completed');
      
    } catch (error) {
      console.error('Data loading error:', error);
    }
  },

  async loadProjects() {
    try {
      const projects = await this.fetchWithFallback('projects', this.getLocalProjects());
      AppState.projects = projects;
      this.renderProjects();
    } catch (error) {
      console.warn('Failed to load projects:', error);
    }
  },

  async loadTestimonials() {
    try {
      const testimonials = await this.fetchWithFallback('testimonials', this.getLocalTestimonials());
      AppState.testimonials = testimonials;
      this.renderTestimonials();
    } catch (error) {
      console.warn('Failed to load testimonials:', error);
    }
  },

  async loadSkills() {
    try {
      const skills = await this.fetchWithFallback('skills', this.getLocalSkills());
      AppState.skills = skills;
      this.renderSkills();
    } catch (error) {
      console.warn('Failed to load skills:', error);
    }
  },

  async loadExperience() {
    try {
      const experience = await this.fetchWithFallback('experience', this.getLocalExperience());
      AppState.experience = experience;
      this.renderExperience();
    } catch (error) {
      console.warn('Failed to load experience:', error);
    }
  },

  async fetchWithFallback(dataType, fallbackData) {
    const cacheKey = `data-${dataType}`;
    
    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      // Try to fetch from API
      const response = await fetch(this.apiEndpoints[dataType]);
      
      if (response.ok) {
        const data = await response.json();
        this.setCachedData(cacheKey, data);
        return data;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn(`API fetch failed for ${dataType}, using fallback:`, error);
      return fallbackData;
    }
  },

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  },

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  },

  getLocalProjects() {
    return [
      {
        id: 'ai-training-platform',
        title: 'AI Training Data Platform',
        description: 'Comprehensive platform for ethical AI training data development and management with focus on voice and creative content.',
        category: 'ai-ml',
        image: 'assets/images/projects/ai-platform.jpg',
        technologies: ['Python', 'TensorFlow', 'React', 'Node.js', 'MongoDB', 'Docker', 'AWS'],
        features: [
          'Ethical AI data collection and processing',
          'Voice data annotation and labeling tools',
          'Real-time collaboration features',
          'Advanced quality control mechanisms',
          'Automated data validation and cleaning'
        ],
        challenges: [
          'Ensuring data privacy and ethical compliance',
          'Scaling processing for large datasets',
          'Creating intuitive annotation interfaces',
          'Implementing robust quality assurance'
        ],
        outcomes: [
          'Improved data quality by 40%',
          'Reduced annotation time by 60%',
          'Achieved 99.5% data accuracy',
          'Processed over 10TB of training data'
        ],
        demoUrl: 'https://ai-platform-demo.example.com',
        githubUrl: 'https://github.com/example/ai-platform',
        status: 'completed',
        client: 'Tech Startup',
        duration: '8 months',
        role: 'Lead AI Developer',
        gallery: [
          {
            url: 'assets/images/projects/ai-platform-1.jpg',
            thumb: 'assets/images/projects/thumbs/ai-platform-1.jpg',
            alt: 'AI Platform Dashboard'
          },
          {
            url: 'assets/images/projects/ai-platform-2.jpg',
            thumb: 'assets/images/projects/thumbs/ai-platform-2.jpg',
            alt: 'Data Annotation Interface'
          }
        ]
      },
      {
        id: 'voice-portfolio',
        title: 'Interactive Voice Portfolio',
        description: 'Professional voice-over portfolio showcasing multilingual capabilities with interactive audio players and real-time waveform visualization.',
        category: 'voice-media',
        image: 'assets/images/projects/voice-portfolio.jpg',
        technologies: ['JavaScript', 'Web Audio API', 'CSS3', 'HTML5', 'Node.js', 'Express'],
        features: [
          'Interactive audio players with waveform visualization',
          'Multi-language voice samples',
          'Custom audio controls and playlist management',
          'Responsive design for all devices',
          'SEO-optimized structure'
        ],
        challenges: [
          'Cross-browser audio compatibility',
          'Optimizing audio file loading',
          'Creating engaging user interface',
          'Implementing accessibility features'
        ],
        outcomes: [
          'Increased client inquiries by 200%',
          'Improved user engagement by 150%',
          'Enhanced professional credibility',
          'Streamlined client onboarding process'
        ],
        demoUrl: 'https://voice-portfolio.example.com',
        githubUrl: 'https://github.com/example/voice-portfolio',
        status: 'completed',
        client: 'Personal Project',
        duration: '3 months',
        role: 'Full-Stack Developer & Voice Artist',
        gallery: [
          {
            url: 'assets/images/projects/voice-portfolio-1.jpg',
            thumb: 'assets/images/projects/thumbs/voice-portfolio-1.jpg',
            alt: 'Voice Portfolio Homepage'
          },
          {
            url: 'assets/images/projects/voice-portfolio-2.jpg',
            thumb: 'assets/images/projects/thumbs/voice-portfolio-2.jpg',
            alt: 'Audio Player Interface'
          }
        ]
      },
      {
        id: 'blockchain-defi',
        title: 'DeFi Trading Platform',
        description: 'Decentralized finance application enabling secure peer-to-peer trading with advanced smart contract integration.',
        category: 'blockchain',
        image: 'assets/images/projects/defi-platform.jpg',
        technologies: ['Solidity', 'Web3.js', 'React', 'Ethereum', 'IPFS', 'Metamask', 'Hardhat'],
        features: [
          'Secure smart contract architecture',
          'Real-time trading interface',
          'Liquidity pool management',
          'Multi-token support',
          'Advanced analytics dashboard'
        ],
        challenges: [
          'Gas optimization for smart contracts',
          'Ensuring security and audit compliance',
          'Creating intuitive DeFi interface',
          'Managing transaction confirmations'
        ],
        outcomes: [
          'Successfully deployed on Ethereum mainnet',
          'Handled $2M+ in trading volume',
          'Zero security incidents',
          'Active community of 5000+ users'
        ],
        demoUrl: 'https://defi-demo.example.com',
        githubUrl: 'https://github.com/example/defi-platform',
        status: 'completed',
        client: 'Blockchain Startup',
        duration: '12 months',
        role: 'Blockchain Developer',
        gallery: [
          {
            url: 'assets/images/projects/defi-1.jpg',
            thumb: 'assets/images/projects/thumbs/defi-1.jpg',
            alt: 'DeFi Trading Interface'
          },
          {
            url: 'assets/images/projects/defi-2.jpg',
            thumb: 'assets/images/projects/thumbs/defi-2.jpg',
            alt: 'Analytics Dashboard'
          }
        ]
      },
      {
        id: 'creative-cms',
        title: 'Creative Content Management System',
        description: 'Custom CMS designed for creative professionals with integrated media management and client collaboration tools.',
        category: 'web-development',
        image: 'assets/images/projects/creative-cms.jpg',
        technologies: ['PHP', 'Laravel', 'Vue.js', 'MySQL', 'Redis', 'AWS S3', 'WebRTC'],
        features: [
          'Drag-and-drop content builder',
          'Advanced media library management',
          'Client collaboration portal',
          'Version control for content',
          'Multi-site management'
        ],
        challenges: [
          'Creating flexible content architecture',
          'Optimizing media handling and storage',
          'Implementing real-time collaboration',
          'Ensuring scalability and performance'
        ],
        outcomes: [
          'Reduced content creation time by 50%',
          'Improved client satisfaction scores',
          'Increased team productivity',
          'Successfully managing 100+ websites'
        ],
        demoUrl: 'https://cms-demo.example.com',
        githubUrl: 'https://github.com/example/creative-cms',
        status: 'in-progress',
        client: 'Creative Agency',
        duration: '10 months',
        role: 'Lead Developer',
        gallery: [
          {
            url: 'assets/images/projects/cms-1.jpg',
            thumb: 'assets/images/projects/thumbs/cms-1.jpg',
            alt: 'CMS Dashboard'
          },
          {
            url: 'assets/images/projects/cms-2.jpg',
            thumb: 'assets/images/projects/thumbs/cms-2.jpg',
            alt: 'Content Builder Interface'
          }
        ]
      }
    ];
  },

  getLocalTestimonials() {
    return [
      {
        id: 1,
        name: 'Sarah Chen',
        position: 'Product Manager',
        company: 'TechFlow Inc.',
        avatar: 'assets/images/testimonials/sarah-chen.jpg',
        rating: 5,
        quote: 'Thanatsitt delivered exceptional work on our AI training platform. His attention to detail and innovative approach exceeded our expectations. The project was completed on time and within budget.',
        project: 'AI Training Platform',
        date: '2024-01-15'
      },
      {
        id: 2,
        name: 'Michael Rodriguez',
        position: 'Creative Director',
        company: 'MediaWorks Studio',
        avatar: 'assets/images/testimonials/michael-rodriguez.jpg',
        rating: 5,
        quote: 'Outstanding voice-over work with incredible range and professionalism. Thanatsitt brought our characters to life and delivered exactly what we envisioned for our multimedia project.',
        project: 'Voice Portfolio',
        date: '2023-11-20'
      },
      {
        id: 3,
        name: 'Emily Watson',
        position: 'Blockchain Consultant',
        company: 'CryptVentures',
        avatar: 'assets/images/testimonials/emily-watson.jpg',
        rating: 5,
        quote: 'The DeFi platform development was flawless. Thanatsitt demonstrated deep understanding of blockchain technology and delivered a secure, scalable solution that has been running perfectly.',
        project: 'DeFi Trading Platform',
        date: '2024-02-10'
      },
      {
        id: 4,
        name: 'David Kim',
        position: 'Startup Founder',
        company: 'InnovateNow',
        avatar: 'assets/images/testimonials/david-kim.jpg',
        rating: 5,
        quote: 'Thanatsitt is a rare talent who combines technical expertise with creative vision. His full-stack development skills helped us launch our product faster than we thought possible.',
        project: 'Creative CMS',
        date: '2023-12-05'
      },
      {
        id: 5,
        name: 'Lisa Thompson',
        position: 'Marketing Director',
        company: 'Global Media Co.',
        avatar: 'assets/images/testimonials/lisa-thompson.jpg',
        rating: 5,
        quote: 'Working with Thanatsitt was a pleasure. His voice work was professional, timely, and perfectly matched our brand voice. We will definitely work with him again.',
        project: 'Brand Voice Campaign',
        date: '2024-01-30'
      }
    ];
  },

  getLocalSkills() {
    return [
      {
        category: 'AI & Machine Learning',
        icon: 'fas fa-brain',
        skills: [
          { name: 'Python', level: 95, years: 5 },
          { name: 'TensorFlow', level: 88, years: 3 },
          { name: 'PyTorch', level: 85, years: 2 },
          { name: 'OpenAI API', level: 92, years: 2 },
          { name: 'Computer Vision', level: 78, years: 2 },
          { name: 'NLP', level: 85, years: 3 },
          { name: 'Data Science', level: 90, years: 4 }
        ]
      },
      {
        category: 'Frontend Development',
        icon: 'fas fa-code',
        skills: [
          { name: 'JavaScript', level: 95, years: 7 },
          { name: 'React', level: 92, years: 4 },
          { name: 'Vue.js', level: 88, years: 3 },
          { name: 'TypeScript', level: 85, years: 2 },
          { name: 'CSS3/SCSS', level: 94, years: 6 },
          { name: 'HTML5', level: 98, years: 7 },
          { name: 'Webpack', level: 82, years: 3 }
        ]
      },
      {
        category: 'Backend Development',
        icon: 'fas fa-server',
        skills: [
          { name: 'Node.js', level: 90, years: 5 },
          { name: 'PHP', level: 85, years: 4 },
          { name: 'Laravel', level: 88, years: 3 },
          { name: 'Express.js', level: 92, years: 4 },
          { name: 'MySQL', level: 86, years: 5 },
          { name: 'MongoDB', level: 83, years: 3 },
          { name: 'Redis', level: 78, years: 2 }
        ]
      },
      {
        category: 'Blockchain & Web3',
        icon: 'fas fa-link',
        skills: [
          { name: 'Solidity', level: 88, years: 2 },
          { name: 'Web3.js', level: 85, years: 2 },
          { name: 'Ethereum', level: 90, years: 3 },
          { name: 'Smart Contracts', level: 87, years: 2 },
          { name: 'IPFS', level: 75, years: 1 },
          { name: 'Hardhat', level: 82, years: 1 }
        ]
      },
      {
        category: 'Voice & Audio',
        icon: 'fas fa-microphone',
        skills: [
          { name: 'Voice Acting', level: 95, years: 8 },
          { name: 'Audio Editing', level: 90, years: 6 },
          { name: 'Pro Tools', level: 85, years: 4 },
          { name: 'Audacity', level: 92, years: 6 },
          { name: 'Character Voice', level: 88, years: 5 },
          { name: 'Commercial VO', level: 93, years: 7 },
          { name: 'Multilingual', level: 90, years: 10 }
        ]
      },
      {
        category: 'Tools & Technologies',
        icon: 'fas fa-tools',
        skills: [
          { name: 'Git', level: 94, years: 6 },
          { name: 'Docker', level: 85, years: 3 },
          { name: 'AWS', level: 82, years: 3 },
          { name: 'Linux', level: 88, years: 5 },
          { name: 'Nginx', level: 78, years: 2 },
          { name: 'Jenkins', level: 75, years: 2 },
          { name: 'Figma', level: 83, years: 3 }
        ]
      }
    ];
  },

  getLocalExperience() {
    return [
      {
        id: 1,
        title: 'AI Creative Designer & Developer',
        company: 'Freelance',
        type: 'freelance',
        location: 'Remote',
        period: '2020 - Present',
        duration: '4+ years',
        description: 'Specialized in ethical AI training data development with focus on creative and voice content. Led multiple projects involving machine learning model training, data annotation, and AI-powered creative tools.',
        responsibilities: [
          'Developed AI training datasets for voice and creative applications',
          'Implemented machine learning models using TensorFlow and PyTorch',
          'Created data annotation tools and quality assurance systems',
          'Collaborated with international teams on AI ethics compliance',
          'Delivered 15+ successful AI projects across various industries'
        ],
        technologies: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI API', 'AWS', 'Docker'],
        achievements: [
          'Improved data quality metrics by 40%',
          'Reduced annotation time by 60%',
          'Maintained 99.5% accuracy rate across projects'
        ]
      },
      {
        id: 2,
        title: 'Professional Voice Artist',
        company: 'Voquent & Freelance',
        type: 'freelance',
        location: 'Remote/Studio',
        period: '2018 - Present',
        duration: '6+ years
        description: 'Professional voice-over artist specializing in character voices, commercial narration, and multilingual content. Worked with international brands and production companies across various media formats.',
        responsibilities: [
          'Delivered high-quality voice-over for commercials, animations, and audiobooks',
          'Performed character voices for video games and animated productions',
          'Provided multilingual voice services in English, Thai, and Japanese',
          'Managed home studio setup and audio post-production',
          'Collaborated with directors and sound engineers on creative projects'
        ],
        technologies: ['Pro Tools', 'Audacity', 'Adobe Audition', 'Zoom PodTrak P4', 'Audio-Technica AT2020'],
        achievements: [
          'Completed 200+ voice-over projects',
          'Maintained 5-star rating across all platforms',
          'Featured in international commercial campaigns'
        ]
      },
      {
        id: 3,
        title: 'Full-Stack Developer',
        company: 'Digital Agency',
        type: 'contract',
        location: 'Bangkok, Thailand',
        period: '2019 - 2022',
        duration: '3 years',
        description: 'Led development of web applications and content management systems for creative agencies and startups. Specialized in building scalable solutions with modern frameworks and cloud technologies.',
        responsibilities: [
          'Architected and developed full-stack web applications',
          'Built custom CMS solutions for creative professionals',
          'Implemented responsive designs and mobile-first approaches',
          'Optimized application performance and user experience',
          'Mentored junior developers and conducted code reviews'
        ],
        technologies: ['React', 'Node.js', 'Laravel', 'MySQL', 'AWS', 'Docker', 'Redis'],
        achievements: [
          'Delivered 25+ successful web projects',
          'Improved application performance by 150%',
          'Led team of 5 developers'
        ]
      },
      {
        id: 4,
        title: 'Blockchain Developer',
        company: 'CryptVentures',
        type: 'contract',
        location: 'Remote',
        period: '2021 - 2023',
        duration: '2 years',
        description: 'Developed decentralized applications and smart contracts for DeFi and NFT projects. Focused on security, gas optimization, and user experience in Web3 applications.',
        responsibilities: [
          'Designed and implemented smart contracts using Solidity',
          'Built Web3 frontend applications with React and Web3.js',
          'Conducted security audits and gas optimization',
          'Integrated with various DeFi protocols and APIs',
          'Created comprehensive testing suites for smart contracts'
        ],
        technologies: ['Solidity', 'Web3.js', 'Ethereum', 'Hardhat', 'OpenZeppelin', 'IPFS'],
        achievements: [
          'Deployed 10+ smart contracts to mainnet',
          'Handled $2M+ in total value locked',
          'Zero security incidents across all projects'
        ]
      },
      {
        id: 5,
        title: 'Creative Technology Consultant',
        company: 'Various Startups',
        type: 'consulting',
        location: 'Remote',
        period: '2020 - Present',
        duration: '4+ years',
        description: 'Provided technical consulting for creative startups and media companies. Helped bridge the gap between creative vision and technical implementation.',
        responsibilities: [
          'Advised on technology stack selection and architecture',
          'Created technical specifications and project roadmaps',
          'Provided training on AI tools and creative technologies',
          'Facilitated collaboration between creative and technical teams',
          'Conducted workshops on emerging technologies'
        ],
        technologies: ['Various based on client needs'],
        achievements: [
          'Consulted for 30+ creative projects',
          'Helped clients save 40% on development costs',
          'Improved project delivery times by 35%'
        ]
      }
    ];
  },

  renderProjects() {
    const projectsContainer = Utils.getElement('.projects-grid, #projects-container');
    if (!projectsContainer || !AppState.projects) return;

    const projectsHTML = AppState.projects.map(project => `
      <div class="project-card" data-project-id="${project.id}" data-category="${project.category}">
        <div class="project-image">
          <img src="${project.image}" alt="${project.title}" loading="lazy">
          <div class="project-overlay">
            <div class="project-actions">
              <button class="project-view btn-icon" aria-label="View project details">
                <i class="fas fa-eye"></i>
              </button>
              ${project.demoUrl ? `
                <a href="${project.demoUrl}" class="project-demo btn-icon" target="_blank" rel="noopener" aria-label="View live demo">
                  <i class="fas fa-external-link-alt"></i>
                </a>
              ` : ''}
              ${project.githubUrl ? `
                <a href="${project.githubUrl}" class="project-github btn-icon" target="_blank" rel="noopener" aria-label="View source code">
                  <i class="fab fa-github"></i>
                </a>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div class="project-content">
          <div class="project-header">
            <h3 class="project-title">${project.title}</h3>
            <span class="project-category">${Utils.capitalize(project.category.replace('-', ' '))}</span>
          </div>
          
          <p class="project-description">${project.description.substring(0, 120)}...</p>
          
          <div class="project-tech">
            ${project.technologies.slice(0, 4).map(tech => `
              <span class="tech-tag">${tech}</span>
            `).join('')}
            ${project.technologies.length > 4 ? `<span class="tech-more">+${project.technologies.length - 4}</span>` : ''}
          </div>
          
          <div class="project-footer">
            <span class="project-status status-${project.status}">${Utils.capitalize(project.status)}</span>
            <button class="project-details" data-project-id="${project.id}">
              View Details <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    projectsContainer.innerHTML = projectsHTML;

    // Initialize project filters if they exist
    this.initializeProjectFilters();
  },

  initializeProjectFilters() {
    const filterButtons = Utils.getElements('.project-filter, [data-filter]');
    const projectCards = Utils.getElements('.project-card');

    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        const filter = button.dataset.filter || button.textContent.toLowerCase().replace(/\s+/g, '-');
        
        // Update active filter
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter projects
        projectCards.forEach(card => {
          const category = card.dataset.category;
          const shouldShow = filter === 'all' || category === filter;
          
          if (shouldShow) {
            card.style.display = '';
            card.classList.add('filter-show');
            card.classList.remove('filter-hide');
          } else {
            card.classList.add('filter-hide');
            card.classList.remove('filter-show');
            
            setTimeout(() => {
              if (card.classList.contains('filter-hide')) {
                card.style.display = 'none';
              }
            }, 300);
          }
        });
        
        // Track filter usage
        Analytics.trackEvent('project_filter', { filter });
      });
    });
  },

  renderTestimonials() {
    const testimonialsContainer = Utils.getElement('.testimonials-slider, #testimonials-container');
    if (!testimonialsContainer || !AppState.testimonials) return;

    const testimonialsHTML = AppState.testimonials.map(testimonial => `
      <div class="testimonial-card">
        <div class="testimonial-content">
          <div class="testimonial-rating">
            ${Array.from({length: 5}, (_, i) => `
              <i class="fas fa-star ${i < testimonial.rating ? 'active' : ''}"></i>
            `).join('')}
          </div>
          
          <blockquote class="testimonial-quote">
            "${testimonial.quote}"
          </blockquote>
          
          <div class="testimonial-author">
            <div class="author-avatar">
              <img src="${testimonial.avatar}" alt="${testimonial.name}" loading="lazy">
            </div>
            <div class="author-info">
              <h4 class="author-name">${testimonial.name}</h4>
              <p class="author-position">${testimonial.position}</p>
              <p class="author-company">${testimonial.company}</p>
            </div>
          </div>
          
          ${testimonial.project ? `
            <div class="testimonial-project">
              <small>Project: ${testimonial.project}</small>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    testimonialsContainer.innerHTML = testimonialsHTML;

    // Initialize testimonials slider if needed
    this.initializeTestimonialsSlider();
  },

  initializeTestimonialsSlider() {
    const slider = Utils.getElement('.testimonials-slider');
    const cards = Utils.getElements('.testimonial-card');
    
    if (!slider || cards.length <= 1) return;

    let currentSlide = 0;
    const totalSlides = cards.length;
    let autoSlideTimer;

    // Create navigation
    const navigation = document.createElement('div');
    navigation.className = 'testimonials-nav';
    navigation.innerHTML = `
      <button class="nav-prev" aria-label="Previous testimonial">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="nav-dots">
        ${cards.map((_, i) => `
          <button class="nav-dot ${i === 0 ? 'active' : ''}" data-slide="${i}" aria-label="Go to testimonial ${i + 1}"></button>
        `).join('')}
      </div>
      <button class="nav-next" aria-label="Next testimonial">
        <i class="fas fa-chevron-right"></i>
      </button>
    `;

    slider.parentNode.appendChild(navigation);

    const prevBtn = navigation.querySelector('.nav-prev');
    const nextBtn = navigation.querySelector('.nav-next');
    const dots = navigation.querySelectorAll('.nav-dot');

    const showSlide = (index) => {
      cards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
      });
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      
      currentSlide = index;
    };

    const nextSlide = () => {
      const next = (currentSlide + 1) % totalSlides;
      showSlide(next);
    };

    const prevSlide = () => {
      const prev = (currentSlide - 1 + totalSlides) % totalSlides;
      showSlide(prev);
    };

    const startAutoSlide = () => {
      autoSlideTimer = setInterval(nextSlide, 5000);
    };

    const stopAutoSlide = () => {
      if (autoSlideTimer) {
        clearInterval(autoSlideTimer);
        autoSlideTimer = null;
      }
    };

    // Event listeners
    nextBtn.addEventListener('click', () => {
      nextSlide();
      stopAutoSlide();
      startAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
      prevSlide();
      stopAutoSlide();
      startAutoSlide();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        stopAutoSlide();
        startAutoSlide();
      });
    });

    // Pause on hover
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        stopAutoSlide();
        startAutoSlide();
      }
    }, { passive: true });

    // Start auto-slide
    startAutoSlide();

    // Store timer reference for cleanup
    AppState.timers.set('testimonials-slider', autoSlideTimer);
  },

  renderSkills() {
    const skillsContainer = Utils.getElement('.skills-grid, #skills-container');
    if (!skillsContainer || !AppState.skills) return;

    const skillsHTML = AppState.skills.map(category => `
      <div class="skill-category" data-animate="fadeInUp">
        <div class="category-header">
          <div class="category-icon">
            <i class="${category.icon}"></i>
          </div>
          <h3 class="category-title">${category.category}</h3>
        </div>
        
        <div class="skills-list">
          ${category.skills.map(skill => `
            <div class="skill-item">
              <div class="skill-header">
                <span class="skill-name">${skill.name}</span>
                <span class="skill-level">${skill.level}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-bar-fill" data-skill-level="${skill.level}"></div>
              </div>
              <div class="skill-meta">
                <small>${skill.years} year${skill.years !== 1 ? 's' : ''} experience</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    skillsContainer.innerHTML = skillsHTML;

    // Re-initialize skill bar animations
    AnimationManager.initSkillBars();
  },

  renderExperience() {
    const experienceContainer = Utils.getElement('.experience-timeline, #experience-container');
    if (!experienceContainer || !AppState.experience) return;

    const experienceHTML = AppState.experience.map((exp, index) => `
      <div class="experience-item" data-animate="fadeInUp" data-delay="${index * 100}">
        <div class="experience-marker">
          <div class="marker-dot"></div>
          <div class="marker-line"></div>
        </div>
        
        <div class="experience-content">
          <div class="experience-header">
            <h3 class="experience-title">${exp.title}</h3>
            <div class="experience-meta">
              <span class="experience-company">${exp.company}</span>
              <span class="experience-type type-${exp.type}">${Utils.capitalize(exp.type)}</span>
              <span class="experience-location">${exp.location}</span>
            </div>
            <div class="experience-period">
              <span class="period-text">${exp.period}</span>
              <span class="duration-text">${exp.duration}</span>
            </div>
          </div>
          
          <div class="experience-description">
            <p>${exp.description}</p>
          </div>
          
          <div class="experience-details">
            <div class="responsibilities">
              <h4>Key Responsibilities</h4>
              <ul>
                ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
              </ul>
            </div>
            
            <div class="technologies">
              <h4>Technologies Used</h4>
              <div class="tech-tags">
                ${exp.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
              </div>
            </div>
            
            ${exp.achievements ? `
              <div class="achievements">
                <h4>Key Achievements</h4>
                <ul class="achievements-list">
                  ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');

    experienceContainer.innerHTML = experienceHTML;
  },

  async getProject(projectId) {
    if (!AppState.projects) {
      await this.loadProjects();
    }
    
    return AppState.projects?.find(project => project.id === projectId) || null;
  },

  getProjectsByCategory(category) {
    if (!AppState.projects) return [];
    
    if (category === 'all') {
      return AppState.projects;
    }
    
    return AppState.projects.filter(project => project.category === category);
  },

  searchProjects(query) {
    if (!AppState.projects || !query) return AppState.projects || [];
    
    const searchTerm = query.toLowerCase();
    
    return AppState.projects.filter(project => 
      project.title.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchTerm)) ||
      project.category.toLowerCase().includes(searchTerm)
    );
  }
};

// ==================================================================================== //
// 🎯 ANALYTICS MANAGER
// ==================================================================================== //

const Analytics = {
  init() {
    this.sessionId = Utils.generateId('session');
    this.pageLoadTime = Date.now();
    this.events = [];
    this.userInteractions = 0;
    this.timeOnPage = 0;
    this.scrollDepth = 0;
    this.maxScrollDepth = 0;
    
    this.initializeTracking();
    this.bindEvents();
    this.trackPageView();
  },

  initializeTracking() {
    // Initialize Google Analytics if available
    if (typeof gtag !== 'undefined') {
      this.gtag = true;
      gtag('config', 'GA_MEASUREMENT_ID', {
        session_id: this.sessionId,
        custom_map: {
          custom_dimension_1: 'session_id'
        }
      });
    }
    
    // Initialize other analytics services
    this.initializeFacebookPixel();
    this.initializeLinkedInInsight();
  },

  bindEvents() {
    // Track user interactions
    document.addEventListener('click', (e) => {
      this.userInteractions++;
      this.trackInteraction('click', e.target);
    }, { passive: true });

    // Track scroll depth
    window.addEventListener('scroll', Utils.throttle(() => {
      this.updateScrollDepth();
    }, 1000), { passive: true });

    // Track time on page
    this.startTimeTracking();

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', {
          time_on_page: this.timeOnPage,
          interactions: this.userInteractions,
          scroll_depth: this.maxScrollDepth
        });
      } else {
        this.trackEvent('page_visible');
      }
    });

    // Track before page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('page_unload', {
        time_on_page: this.timeOnPage,
        interactions: this.userInteractions,
        scroll_depth: this.maxScrollDepth,
        events_count: this.events.length
      });
    });

    // Track errors
    window.addEventListener('error', (e) => {
      this.trackError('javascript_error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.trackError('unhandled_promise_rejection', {
        reason: e.reason?.toString() || 'Unknown error'
      });
    });
  },

  trackPageView() {
    const pageData = {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      device_type: Utils.getDeviceType(),
      session_id: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.trackEvent('page_view', pageData);

    // Track with Google Analytics
    if (this.gtag) {
      gtag('event', 'page_view', pageData);
    }
  },

  trackEvent(eventName, eventData = {}) {
    const event = {
      event_name: eventName,
      event_data: eventData,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      page_url: window.location.href,
      user_interactions: this.userInteractions,
      time_on_page: this.timeOnPage
    };

    // Store event locally
    this.events.push(event);

    // Send to Google Analytics
    if (this.gtag) {
      gtag('event', eventName, eventData);
    }

    // Send to custom analytics endpoint
    this.sendToCustomAnalytics(event);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventName, eventData);
    }
  },

  trackInteraction(type, element) {
    const interactionData = {
      interaction_type: type,
      element_tag: element.tagName?.toLowerCase(),
      element_class: element.className,
      element_id: element.id,
      element_text: element.textContent?.substring(0, 100),
      timestamp: Date.now()
    };

    // Track specific interactions
    if (element.matches('a')) {
      interactionData.link_url = element.href;
      interactionData.is_external = !element.href.startsWith(window.location.origin);
    }

    if (element.matches('button')) {
      interactionData.button_type = element.type;
      interactionData.button_text = element.textContent?.trim();
    }

    this.trackEvent('user_interaction', interactionData);
  },

  updateScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

    this.scrollDepth = scrollPercent;
    this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent);

    // Track scroll milestones
    const milestones = [25, 50, 75, 90, 100];
    milestones.forEach(milestone => {
      if (scrollPercent >= milestone && !this[`scroll_${milestone}_tracked`]) {
        this[`scroll_${milestone}_tracked`] = true;
        this.trackEvent('scroll_depth', {
          depth_percent: milestone,
          depth_pixels: scrollTop
        });
      }
    });
  },

  startTimeTracking() {
    setInterval(() => {
      if (!document.hidden) {
        this.timeOnPage += 1000; // 1 second
      }
    }, 1000);

    AppState.timers.set('time-tracking', this.timeTracker);
  },

  trackError(errorType, errorData) {
    const errorEvent = {
      error_type: errorType,
      error_data: errorData,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: Date.now()
    };

    this.trackEvent('error', errorEvent);

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Tracked Error:', errorType, errorData);
    }
  },

  trackPerformance(metricName, value, unit = 'ms') {
    this.trackEvent('performance_metric', {
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit,
      page_url: window.location.href
    });
  },

  trackConversion(conversionType, conversionData = {}) {
    this.trackEvent('conversion', {
      conversion_type: conversionType,
      conversion_data: conversionData,
      session_id: this.sessionId,
      page_url: window.location.href
    });

    // Send to Google Analytics as conversion
    if (this.gtag) {
      gtag('event', 'conversion', {
        event_category: 'engagement',
        event_label: conversionType,
        value: conversionData.value || 1
      });
    }
  },

  async sendToCustomAnalytics(event) {
    try {
      // Send to custom analytics endpoint
      const response = await fetch(CONFIG.ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }
    } catch (error) {
      // Silently fail for analytics
      console.warn('Analytics tracking failed:', error);
      
      // Store failed events for retry
      this.storeFailedEvent(event);
    }
  },

  storeFailedEvent(event) {
    const failedEvents = Utils.storage.get('failed_analytics_events', []);
    failedEvents.push(event);
    
    // Limit storage to prevent overflow
    if (failedEvents.length > 100) {
      failedEvents.splice(0, failedEvents.length - 100);
    }
    
    Utils.storage.set('failed_analytics_events', failedEvents);
  },

  async retryFailedEvents() {
    const failedEvents = Utils.storage.get('failed_analytics_events', []);
    
    if (failedEvents.length === 0) return;
    
    const retryPromises = failedEvents.map(event => this.sendToCustomAnalytics(event));
    
    try {
      await Promise.allSettled(retryPromises);
      Utils.storage.remove('failed_analytics_events');
      console.log('✅ Retried failed analytics events');
    } catch (error) {
      console.warn('Failed to retry analytics events:', error);
    }
  },

  initializeFacebookPixel() {
    // Initialize Facebook Pixel if ID is provided
    if (window.FB_PIXEL_ID) {
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');

      fbq('init', window.FB_PIXEL_ID);
      fbq('track', 'PageView');
    }
  },

  initializeLinkedInInsight() {
    // Initialize LinkedIn Insight Tag if ID is provided
    if (window.LINKEDIN_PARTNER_ID) {
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      window._linkedin_data_partner_ids.push(window.LINKEDIN_PARTNER_ID);
      
      (function(l) {
        if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
        window.lintrk.q=[]}
        var s = document.getElementsByTagName("script")[0];
        var b = document.createElement("script");
        b.type = "text/javascript";b.async = true;
        b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
        s.parentNode.insertBefore(b, s);})(window.lintrk);
    }
  },

  // Convenience methods
  trackButtonClick(buttonName, buttonData = {}) {
    this.trackEvent('button_click', {
      button_name: buttonName,
      ...buttonData
    });
  },

  trackFormSubmission(formName, formData = {}) {
    this.trackEvent('form_submission', {
      form_name: formName,
      ...formData
    });
  },

  trackDownload(fileName, fileType) {
    this.trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType
    });
  },

  getAnalyticsData() {
    return {
      session_id: this.sessionId,
      events: this.events,
      user_interactions: this.userInteractions,
      time_on_page: this.timeOnPage,
      max_scroll_depth: this.maxScrollDepth,
      page_load_time: this.pageLoadTime
    };
  }
};

// ==================================================================================== //
// 🎯 MAIN APPLICATION CONTROLLER
// ==================================================================================== //

const App = {
  async init() {
    try {
      Utils.performance.mark('app-init-start');
      
      console.log('🚀 Initializing Portfolio Application...');
      
      // Initialize critical systems first
      await this.initializeCriticalSystems();
      
      // Initialize UI systems
      await this.initializeUISystems();
      
      // Initialize content and features
      await this.initializeFeatures();
      
      // Initialize analytics and monitoring
      this.initializeMonitoring();
      
      // Set up event listeners
      this.bindGlobalEvents();
      
      // Finalize initialization
      await this.finalizeInitialization();
      
      Utils.performance.mark('app-init-end');
      Utils.performance.measure('app-init-duration', 'app-init-start', 'app-init-end');
      
      console.log('✅ Portfolio Application Initialized Successfully');
      
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      this.handleInitializationError(error);
    }
  },

  async initializeCriticalSystems() {
    // Device and browser detection
    AppState.deviceInfo = {
      type: Utils.getDeviceType(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      webGL: Utils.detectWebGL(),
      touchSupported: 'ontouchstart' in window,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    };
    
    // Initialize theme system
    ThemeManager.init();
    
    // Initialize loading screen
    LoadingManager.init();
    
    // Initialize toast system
    ToastManager.init();
    
    console.log('✅ Critical systems initialized');
  },

  async initializeUISystems() {
    // Initialize navigation
    NavigationManager.init();
    
    // Initialize modal system
    ModalManager.init();
    
    // Initialize animation system
    AnimationManager.init();
    
    console.log('✅ UI systems initialized');
  },

  async initializeFeatures() {
    // Initialize form handling
    FormManager.init();
    
    // Initialize voice demo
    VoiceDemoManager.init();
    
    // Initialize data management
    DataManager.init();
    
    console.log('✅ Features initialized');
  },

  initializeMonitoring() {
    // Initialize analytics
    Analytics.init();
    
    // Initialize error monitoring
    this.initializeErrorMonitoring();
    
    // Initialize performance monitoring
    this.initializePerformanceMonitoring();
    
    console.log('✅ Monitoring systems initialized');
  },

  initializeErrorMonitoring() {
    // Global error handler
    window.addEventListener('error', (e) => {
      const error = {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack,
        timestamp: Date.now(),
        url: window.location.href
      };
      
      AppState.errors.push(error);
      console.error('Global error caught:', error);
      
      // Track error in analytics
      Analytics.trackError('global_error', error);
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
      const error = {
        reason: e.reason,
        promise: e.promise,
        timestamp: Date.now(),
        url: window.location.href
      };
      
      AppState.errors.push(error);
      console.error('Unhandled promise rejection:', error);
      
      // Track error in analytics
      Analytics.trackError('unhandled_rejection', error);
    });
  },

  initializePerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        
        if (perfData) {
          const metrics = {
            dns_lookup: perfData.domainLookupEnd - perfData.domainLookupStart,
            tcp_connect: perfData.connectEnd - perfData.connectStart,
            request_response: perfData.responseEnd - perfData.requestStart,
            dom_parse: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            load_complete: perfData.loadEventEnd - perfData.loadEventStart,
            total_load_time: perfData.loadEventEnd - perfData.navigationStart
          };
          
          AppState.performanceMetrics = metrics;
          
          // Track performance metrics
          Object.entries(metrics).forEach(([metric, value]) => {
            Analytics.trackPerformance(metric, Math.round(value));
          });
        }
      }, 0);
    });
    
    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
  },

  monitorCoreWebVitals() {
    // First Contentful Paint (FCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          Analytics.trackPerformance('first_contentful_paint', Math.round(entry.startTime));
        }
      });
    }).observe({ entryTypes: ['paint'] });
    
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      Analytics.trackPerformance('largest_contentful_paint', Math.round(lastEntry.startTime));
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      Analytics.trackPerformance('cumulative_layout_shift', Math.round(clsValue * 1000) / 1000);
    }).observe({ entryTypes: ['layout-shift'] });
  },

  bindGlobalEvents() {
    // Online/offline status
    window.addEventListener('online', () => {
      AppState.isOnline = true;
      ToastManager.success('Connection restored');
      Analytics.retryFailedEvents();
    });
    
    window.addEventListener('offline', () => {
      AppState.isOnline = false;
      ToastManager.warning('Connection lost - working offline');
    });
    
    // Orientation change
    window.addEventListener('orientationchange', Utils.debounce(() => {
      Analytics.trackEvent('orientation_change', {
        orientation: screen.orientation?.angle || 0,
        new_viewport: `${window.innerWidth}x${window.innerHeight}`
      });
    }, 500));
    
    // Resize events
    window.addEventListener('resize', Utils.debounce(() => {
      AppState.deviceInfo.viewportSize = `${window.innerWidth}x${window.innerHeight}`;
      
      Analytics.trackEvent('viewport_resize', {
        new_size: AppState.deviceInfo.viewportSize,
        device_type: Utils.getDeviceType()
      });
    }, CONFIG.DEBOUNCE_DELAY));
    
    // Context menu (right-click) prevention on production
    if (process.env.NODE_ENV === 'production') {
      document.addEventListener('contextmenu', (e) => {
        // Allow context menu on form inputs
        if (!e.target.matches('input, textarea')) {
          e.preventDefault();
        }
      });
    }
    
    // Print event
    window.addEventListener('beforeprint', () => {
      Analytics.trackEvent('page_print');
    });
    
    // Focus management for accessibility
    document.addEventListener('focusin', (e) => {
      AppState.focusedElement = e.target;
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      this.handleGlobalKeydown(e);
    });
  },

  handleGlobalKeydown(e) {
    // Skip key is pressed
    if (e.key === 'Tab' && e.altKey) {
      const skipLink = Utils.getElement('#skip-to-content');
      if (skipLink) {
        skipLink.focus();
      }
    }
    
    // Accessibility: ESC key handling
    if (e.key === 'Escape') {
      // Close any open modals
      if (AppState.modalStack.length > 0) {
        ModalManager.close();
      }
      
      // Close mobile menu
      if (AppState.isMobileMenuOpen) {
        NavigationManager.closeMobileMenu();
      }
      
      // Stop voice demo
      if (AppState.isVoicePlaying) {
        VoiceDemoManager.stopVoiceDemo();
      }
    }
    
    // Track keyboard shortcuts usage
    if (e.ctrlKey || e.metaKey) {
      Analytics.trackEvent('keyboard_shortcut', {
        key: e.key,
        ctrl: e.ctrlKey,
        meta: e.metaKey,
        alt: e.altKey,
        shift: e.shiftKey
      });
    }
  },

  async finalizeInitialization() {
    // Clean up loading screen
    await Utils.delay(1000); // Ensure minimum loading time
    
    // Initialize service worker if available
    await this.initializeServiceWorker();
    
    // Initialize PWA features
    this.initializePWAFeatures();
    
    // Check for updates
    this.checkForUpdates();
    
    // Initialize consent management
    this.initializeConsentManagement();
    
    // Show welcome message for first-time visitors
    this.checkFirstTimeVisitor();
    
    // Initialize scroll restoration
    this.initializeScrollRestoration();
  },

  async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        AppState.serviceWorkerRegistration = registration;
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              AppState.updateAvailable = true;
              this.showUpdateNotification();
            }
          });
        });
        
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  },

  initializePWAFeatures() {
    // Add to home screen prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      AppState.deferredPrompt = e;
      
      // Show install button or banner
      setTimeout(() => {
        ToastManager.show('info', 'Install this app for the best experience!', 8000, {
          actionText: 'Install',
          actionHandler: () => this.promptInstall()
        });
      }, 30000); // Show after 30 seconds
    });
    
    // Track app installation
    window.addEventListener('appinstalled', () => {
      Analytics.trackConversion('app_install');
      ToastManager.success('App installed successfully!');
    });
  },

  async promptInstall() {
    if (AppState.deferredPrompt) {
      AppState.deferredPrompt.prompt();
      const result = await AppState.deferredPrompt.userChoice;
      
      Analytics.trackEvent('install_prompt_result', { outcome: result.outcome });
      
      if (result.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      AppState.deferredPrompt = null;
    }
  },

  checkForUpdates() {
    // Check for application updates
    const lastUpdateCheck = Utils.storage.get('last_update_check');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (!lastUpdateCheck || (now - lastUpdateCheck) > oneHour) {
      Utils.storage.set('last_update_check', now);
      
      // In a real application, you might check a version endpoint
      // For now, we'll just track the check
      Analytics.trackEvent('update_check');
    }
  },

  showUpdateNotification() {
    ToastManager.show('info', 'A new version is available!', 0, {
      persistent: true,
      actionText: 'Update',
      actionHandler: () => this.applyUpdate()
    });
  },

  async applyUpdate() {
    if (AppState.serviceWorkerRegistration) {
      const newWorker = AppState.serviceWorkerRegistration.waiting;
      if (newWorker) {
        newWorker.postMessage({ action: 'skipWaiting' });
        window.location.reload();
      }
    }
  },

  initializeConsentManagement() {
    const consentGiven = Utils.cookies.get('consent');
    
    if (!consentGiven) {
      setTimeout(() => {
        this.showConsentBanner();
      }, 2000);
    } else {
      AppState.consentGiven = true;
    }
  },

  showConsentBanner() {
    const banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.innerHTML = `
      <div class="consent-content">
        <div class="consent-text">
          <h3>Privacy & Cookies</h3>
          <p>This website uses cookies and analytics to improve your experience and provide personalized content.</p>
        </div>
        <div class="consent-actions">
          <button class="btn btn-outline" id="consent-decline">Decline</button>
          <button class="btn btn-primary" id="consent-accept">Accept</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    Utils.animate.fadeIn(banner);
    
    // Event listeners
    banner.querySelector('#consent-accept').addEventListener('click', () => {
      this.handleConsent(true);
      Utils.animate.fadeOut(banner).then(() => banner.remove());
    });
    
    banner.querySelector('#consent-decline').addEventListener('click', () => {
      this.handleConsent(false);
      Utils.animate.fadeOut(banner).then(() => banner.remove());
    });
  },

  handleConsent(accepted) {
    AppState.consentGiven = accepted;
    Utils.cookies.set('consent', accepted ? 'true' : 'false', 365);
    
    Analytics.trackEvent('consent_decision', { accepted });
    
    if (accepted) {
      ToastManager.success('Thank you! Your preferences have been saved.');
    } else {
      ToastManager.info('Your privacy preferences have been saved.');
    }
  },

  checkFirstTimeVisitor() {
    const isFirstVisit = !Utils.storage.get('visited_before');
    
    if (isFirstVisit) {
      Utils.storage.set('visited_before', true);
      Analytics.trackEvent('first_visit');
      
      // Show welcome message after a delay
      setTimeout(() => {
        ToastManager.show('info', 'Welcome to my portfolio! Feel free to explore and get in touch.', 6000);
      }, 5000);
    } else {
      Analytics.trackEvent('return_visit');
    }
  },

  initializeScrollRestoration() {
    // Handle scroll restoration for better UX
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Restore scroll position if returning to page
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
        if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition));
      sessionStorage.removeItem('scrollPosition');
    }
    
    // Save scroll position before leaving
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('scrollPosition', window.pageYOffset.toString());
    });
  },

  handleInitializationError(error) {
    console.error('💥 Critical initialization error:', error);
    
    // Show user-friendly error message
    const errorBanner = document.createElement('div');
    errorBanner.className = 'error-banner';
    errorBanner.innerHTML = `
      <div class="error-content">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="error-text">
          <h3>Something went wrong</h3>
          <p>The application failed to load properly. Please refresh the page or try again later.</p>
        </div>
        <div class="error-actions">
          <button class="btn btn-primary" onclick="window.location.reload()">
            <i class="fas fa-refresh"></i> Refresh Page
          </button>
        </div>
      </div>
    `;
    
    document.body.insertBefore(errorBanner, document.body.firstChild);
    
    // Track critical error
    try {
      Analytics.trackError('critical_init_error', {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
    } catch (analyticsError) {
      console.error('Failed to track critical error:', analyticsError);
    }
    
    // Attempt graceful degradation
    this.enableBasicFunctionality();
  },

  enableBasicFunctionality() {
    // Enable basic navigation without JavaScript enhancements
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
    
    // Enable basic form functionality
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            field.style.borderColor = '#e74c3c';
            isValid = false;
          } else {
            field.style.borderColor = '';
          }
        });
        
        if (!isValid) {
          e.preventDefault();
          alert('Please fill in all required fields.');
        }
      });
    });
  },

  // Utility methods for external access
  getState() {
    return AppState;
  },

  getConfig() {
    return CONFIG;
  },

  // Cleanup method
  destroy() {
    console.log('🧹 Cleaning up application...');
    
    // Clear all timers
    AppState.timers.forEach((timer, key) => {
      clearInterval(timer);
      clearTimeout(timer);
    });
    AppState.timers.clear();
    
    // Disconnect observers
    AppState.observers.forEach((observer, key) => {
      observer.disconnect();
    });
    AppState.observers.clear();
    
    // Clear caches
    AppState.cache.clear();
    
    // Remove event listeners
    window.removeEventListener('scroll', this.scrollHandler);
    window.removeEventListener('resize', this.resizeHandler);
    
    console.log('✅ Application cleanup completed');
  }
};

// ==================================================================================== //
// 🎯 INITIALIZATION & ERROR HANDLING
// ==================================================================================== //

// Global error boundaries
window.addEventListener('error', (e) => {
  console.error('💥 Global JavaScript Error:', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    error: e.error
  });
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('💥 Unhandled Promise Rejection:', e.reason);
  e.preventDefault(); // Prevent default browser behavior
});

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      console.log(`⚡ Page loaded in ${loadTime}ms`);
    }, 0);
  });
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init().catch(error => {
      console.error('Failed to initialize application:', error);
    });
  });
} else {
  // DOM is already ready
  App.init().catch(error => {
    console.error('Failed to initialize application:', error);
  });
}

// Expose App to global scope for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  window.App = App;
  window.AppState = AppState;
  window.CONFIG = CONFIG;
  
  // Development helpers
  window.devTools = {
    clearStorage: () => {
      localStorage.clear();
      sessionStorage.clear();
      console.log('🧹 Storage cleared');
    },
    
    showState: () => {
      console.table(AppState);
    },
    
    testToast: (type = 'info', message = 'Test message') => {
      ToastManager.show(type, message);
    },
    
    testModal: (modalId = 'contact-modal') => {
      ModalManager.open(modalId);
    },
    
    simulateError: () => {
      throw new Error('Simulated error for testing');
    },
    
    performanceReport: () => {
      console.log('⚡ Performance Report:', {
        metrics: AppState.performanceMetrics,
        errors: AppState.errors.length,
        events: Analytics.getAnalyticsData().events.length,
        cacheSize: AppState.cache.size
      });
    }
  };
  
  console.log('🛠️ Development mode enabled. Use window.devTools for debugging.');
}

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    App,
    AppState,
    CONFIG,
    Utils,
    ThemeManager,
    NavigationManager,
    LoadingManager,
    AnimationManager,
    FormManager,
    VoiceDemoManager,
    ToastManager,
    ModalManager,
    DataManager,
    Analytics
  };
}

// ==================================================================================== //
// 🎯 SERVICE WORKER REGISTRATION (if available)
// ==================================================================================== //

// Register service worker for PWA functionality
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available
            ToastManager.show('info', 'New content available! Refresh to update.', 0, {
              actionText: 'Refresh',
              actionHandler: () => window.location.reload()
            });
          }
        });
      });
      
    } catch (error) {
      console.warn('❌ Service Worker registration failed:', error);
    }
  });
}

// ==================================================================================== //
// 🎯 POLYFILLS & COMPATIBILITY
// ==================================================================================== //

// IntersectionObserver polyfill for older browsers
if (!window.IntersectionObserver) {
  console.warn('IntersectionObserver not supported, loading polyfill...');
  
  // Simple fallback for scroll-based animations
  window.IntersectionObserver = class {
    constructor(callback, options = {}) {
      this.callback = callback;
      this.options = options;
      this.elements = new Set();
    }
    
    observe(element) {
      this.elements.add(element);
      this.checkIntersection(element);
    }
    
    unobserve(element) {
      this.elements.delete(element);
    }
    
    disconnect() {
      this.elements.clear();
    }
    
    checkIntersection(element) {
      const rect = element.getBoundingClientRect();
      const isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isIntersecting) {
        this.callback([{
          target: element,
          isIntersecting: true,
          intersectionRatio: 1
        }]);
      }
    }
  };
}

// RequestAnimationFrame polyfill
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = function(callback) {
    return setTimeout(callback, 16);
  };
}

if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = function(id) {
    clearTimeout(id);
  };
}

// Web Audio API fallback
if (!window.AudioContext && window.webkitAudioContext) {
  window.AudioContext = window.webkitAudioContext;
}

// CustomEvent polyfill for IE
if (typeof window.CustomEvent !== 'function') {
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  window.CustomEvent = CustomEvent;
}

// ==================================================================================== //
// 🎯 FINAL SETUP & EXPORT
// ==================================================================================== //

// Prevent context menu in production (optional)
if (process.env.NODE_ENV === 'production') {
  document.addEventListener('contextmenu', (e) => {
    if (!e.target.matches('input, textarea')) {
      e.preventDefault();
    }
  });
  
  // Disable text selection on non-content elements
  document.addEventListener('selectstart', (e) => {
    if (!e.target.matches('input, textarea, [contenteditable], .selectable')) {
      e.preventDefault();
    }
  });
}

// Add loading class to body initially
document.body.classList.add('loading');

// Console branding (optional)
if (console.log && process.env.NODE_ENV === 'production') {
  console.log(`
    %c🎯 Thanatsitt Portfolio
    %cVersion: 1.0.0
    %cBuilt with ❤️ and modern web technologies
    
    Interested in the code? Check it out on GitHub!
    
    Contact: thanattsitt.info@yahoo.co.uk
  `, 
  'color: #4CAF50; font-size: 16px; font-weight: bold;',
  'color: #2196F3; font-size: 12px;',
  'color: #666; font-size: 12px;'
  );
}

// Mark script as loaded
window.portfolioScriptLoaded = true;

console.log('📦 Portfolio application script loaded successfully');

// ==================================================================================== //
// 🎯 END OF APPLICATION
// ==================================================================================== //

})(); // End of IIFE wrapper
