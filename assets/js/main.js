// ===============================================
    // ENHANCED PORTFOLIO APPLICATION CLASS WITH FIXED THEME
    // ===============================================
    class EnhancedPortfolioApp {
      constructor() {
        this.isInitialized = false;
        this.currentAudio = null;
        this.isPlaying = false;
        this.lastScrollY = 0;
        this.scrollDirection = 'up';
        this.ticking = false;
        
        // Initialize the app
        this.init();
      }

      async init() {
        try {
          console.log('🚀 Initializing Enhanced Portfolio...');
          
          // Show loading screen
          this.showLoadingScreen();
          
          // Initialize core systems
          await this.initializeCore();
          
          // Initialize theme FIRST
          this.initializeTheme();
          
          // Initialize libraries
          this.initializeLibraries();
          
          // Setup event listeners
          this.setupEventListeners();
          
          // Initialize animations
          this.initializeAnimations();
          
          // Setup scroll effects
          this.setupScrollEffects();
          
          // Hide loading screen
          await this.hideLoadingScreen();
          
          this.isInitialized = true;
          console.log('✅ Portfolio initialized successfully!');
          
        } catch (error) {
          console.error('❌ Initialization error:', error);
          this.fallbackInitialization();
        }
      }

      showLoadingScreen() {
        const loader = document.getElementById('loadingScreen');
        if (loader) {
          loader.style.display = 'flex';
        }
      }

      async hideLoadingScreen() {
        return new Promise(resolve => {
          const loader = document.getElementById('loadingScreen');
          if (loader) {
            setTimeout(() => {
              loader.style.opacity = '0';
              setTimeout(() => {
                loader.style.display = 'none';
                resolve();
              }, 500);
            }, 1000);
          } else {
            resolve();
          }
        });
      }

      async initializeCore() {
        // Update current year
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
          yearElement.textContent = new Date().getFullYear();
        }
        
        // Initialize scroll progress
        this.updateScrollProgress();
        
        // Preload critical images
        await this.preloadImages();
      }

      async preloadImages() {
        const imageUrls = [
          'https://raw.githubusercontent.com/Pigletpeakkung/artofppage/main/assets/images/data/profile/1755844218313.jpg'
        ];
        
        const loadPromises = imageUrls.map(url => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = () => {
              console.warn(`Failed to load image: ${url}`);
              resolve(); // Don't reject, just continue
            };
            img.src = url;
            setTimeout(resolve, 2000); // Timeout after 2 seconds
          });
        });
        
        await Promise.all(loadPromises);
      }

// ADD THESE ENHANCEMENTS TO YOUR EXISTING CLASS

// 1. Enhanced Particle Creation (add to your class)
createCustomParticles() {
  const heroSection = document.querySelector('#hero');
  if (heroSection && !heroSection.querySelector('.custom-particles')) {
    const container = document.createElement('div');
    container.className = 'custom-particles';
    container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    
    // Create floating particles
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 6 + 2}px;
        height: ${Math.random() * 6 + 2}px;
        background: rgba(139, 92, 246, ${Math.random() * 0.5 + 0.3});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        bottom: -10px;
        animation: floatUp ${Math.random() * 10 + 15}s linear infinite;
        animation-delay: ${Math.random() * 5}s;
      `;
      container.appendChild(particle);
    }
    
    heroSection.appendChild(container);
  }
}

// 2. Enhanced Voice Feedback (add to your class)
enhanceVoiceFeedback() {
  // Add speech synthesis for voice commands
  this.speechSynth = window.speechSynthesis;
  
  // Voice command responses
  this.voiceResponses = {
    play: "Voice demo is now playing",
    stop: "Voice demo stopped",
    themeChange: "Theme has been switched",
    scroll: "Scrolling to section"
  };
}
      // 🎨 FIXED THEME SYSTEM
      initializeTheme() {
        // Load saved theme or detect system preference
        const savedTheme = localStorage.getItem('portfolio-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        this.setTheme(theme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (!localStorage.getItem('portfolio-theme')) {
            this.setTheme(e.matches ? 'dark' : 'light');
          }
        });
      }

      toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.setTheme(newTheme);
        localStorage.setItem('portfolio-theme', newTheme);
        
        // Show theme change notification
        this.showNotification(`Switched to ${newTheme} theme`, 'info');
      }

      setTheme(theme) {
        const html = document.documentElement;
        const themeIcon = document.querySelector('#themeToggle i');
        
        // Remove existing theme classes
        html.classList.remove('light', 'dark');
        
        if (theme === 'dark') {
          html.classList.add('dark');
          html.setAttribute('data-theme', 'dark');
          
          if (themeIcon) {
            themeIcon.className = 'fas fa-sun text-white text-lg group-hover:rotate-180 transition-transform duration-300 relative z-10';
          }
        } else {
          html.classList.add('light');
          html.setAttribute('data-theme', 'light');
          
          if (themeIcon) {
            themeIcon.className = 'fas fa-moon text-white text-lg group-hover:rotate-180 transition-transform duration-300 relative z-10';
          }
        }
        
        console.log(`🎨 Theme set to: ${theme}`);
      }

      initializeLibraries() {
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
          AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic'
          });
        }

        // Initialize GSAP
        if (typeof gsap !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);
          
          // Set GSAP defaults
          gsap.defaults({
            duration: 0.8,
            ease: "power2.out"
          });
        }

        // Initialize Particles (optional, for performance)
        this.initializeParticles();
      }

      initializeParticles() {
        // Only initialize on desktop for performance
        if (window.innerWidth > 1024 && typeof particlesJS !== 'undefined') {
          particlesJS('particles-js', {
            particles: {
              number: { value: 50, density: { enable: true, value_area: 800 } },
              color: { value: ["#8b5cf6", "#ec4899", "#06b6d4"] },
              shape: { type: "circle" },
              opacity: { value: 0.3, random: true },
              size: { value: 3, random: true },
              line_linked: { enable: false },
              move: { 
                enable: true, 
                speed: 1, 
                direction: "none", 
                random: true, 
                out_mode: "out" 
              }
            },
            interactivity: {
              detect_on: "canvas",
              events: { 
                onhover: { enable: true, mode: "repulse" }, 
                onclick: { enable: true, mode: "push" } 
              },
              modes: {
                repulse: { distance: 100, duration: 0.4 },
                push: { particles_nb: 2 }
              }
            },
            retina_detect: true
          });
        }
      }

      setupEventListeners() {
        // Scroll events with throttling
        window.addEventListener('scroll', this.throttle(() => {
          this.updateScrollProgress();
          this.updateNavigationVisibility();
          this.updateBackToTopVisibility();
        }, 16), { passive: true });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
          themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Voice buttons
        const heroVoiceBtn = document.getElementById('heroVoiceBtn');
        if (heroVoiceBtn) {
          heroVoiceBtn.addEventListener('click', () => this.toggleVoice('hero'));
        }

        const voiceButton = document.getElementById('voiceButton');
        if (voiceButton) {
          voiceButton.addEventListener('click', () => this.toggleVoice('floating'));
        }

        // Back to top
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
          backToTop.addEventListener('click', () => this.scrollToTop());
        }

        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenuBtn && mobileMenu) {
          mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
          });
        }

        // Navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
              this.smoothScrollTo(target);
              // Close mobile menu if open
              const mobileMenu = document.getElementById('mobileMenu');
              if (mobileMenu) {
                mobileMenu.classList.add('hidden');
              }
            }
          });
        });

        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
          contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Audio event listeners
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
          audio.addEventListener('ended', () => this.handleAudioEnd());
          audio.addEventListener('error', () => this.handleAudioError());
        });

        // Resize events
        window.addEventListener('resize', this.debounce(() => {
          this.handleResize();
        }, 250));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            this.stopAllAudio();
            const mobileMenu = document.getElementById('mobileMenu');
                        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
              mobileMenu.classList.add('hidden');
            }
          }
        });

        // Performance monitoring
        this.measurePerformance();

        // Accessibility enhancements
        this.enhanceAccessibility();

        // Error handling
        this.setupErrorHandling();
      }

      initializeAnimations() {
        if (typeof gsap === 'undefined') return;

        // Hero animations
        gsap.timeline()
          .from("#profileImage", { 
            scale: 0, 
            rotation: 180, 
            duration: 1.2, 
            ease: "back.out(1.7)" 
          })
          .from(".hero-content", { 
            y: 50, 
            opacity: 0, 
            duration: 0.8 
          }, "-=0.6");

        // Counter animations
        this.animateCounters();

        // Skill bar animations
        this.animateSkillBars();

        // GSAP ScrollTrigger animations
        this.setupScrollTriggerAnimations();
      }

      animateCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-counter'));
          
          if (typeof gsap !== 'undefined') {
            gsap.to(counter, {
              innerText: target,
              duration: 2,
              ease: "power2.out",
              snap: { innerText: 1 },
              scrollTrigger: {
                trigger: counter,
                start: "top 80%",
                toggleActions: "play none none none"
              }
            });
          } else {
            // Fallback animation
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
              } else {
                counter.textContent = Math.floor(current);
              }
            }, 40);
          }
        });
      }

      animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-bar div[data-width]');
        
        skillBars.forEach(bar => {
          const width = bar.getAttribute('data-width');
          
          if (typeof gsap !== 'undefined') {
            gsap.to(bar, {
              width: width + '%',
              duration: 1.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: bar,
                start: "top 80%",
                toggleActions: "play none none none"
              }
            });
          } else {
            // Fallback animation
            setTimeout(() => {
              bar.style.width = width + '%';
            }, 500);
          }
        });
      }

      setupScrollTriggerAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // Parallax effect for background elements
        gsap.utils.toArray('.parallax-element').forEach(element => {
          gsap.to(element, {
            yPercent: -50,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          });
        });

        // Fade in animations for sections
        gsap.utils.toArray('section').forEach(section => {
          gsap.fromTo(section, 
            { opacity: 0.8, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              scrollTrigger: {
                trigger: section,
                start: "top 85%",
                end: "top 50%",
                toggleActions: "play none none reverse"
              }
            }
          );
        });
      }

      setupScrollEffects() {
        // Update active navigation
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        const observerOptions = {
          rootMargin: '-20% 0px -60% 0px',
          threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('id');
              
              // Update active nav link
              navLinks.forEach(link => {
                link.classList.remove('text-purple-400');
                link.classList.add('theme-text-primary');
                
                if (link.getAttribute('href') === `#${id}`) {
                  link.classList.add('text-purple-400');
                  link.classList.remove('theme-text-primary');
                }
              });
            }
          });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
      }

      // 🔊 VOICE FUNCTIONALITY
      toggleVoice(source) {
        if (this.isPlaying) {
          this.stopAllAudio();
        } else {
          this.playVoice(source);
        }
      }

      playVoice(source) {
        // Stop any currently playing audio
        this.stopAllAudio();

        const audioId = source === 'hero' ? 'heroAudio' : 'floatingAudio';
        const audio = document.getElementById(audioId);
        
        if (!audio) {
          console.error('Audio element not found:', audioId);
          this.showNotification('Audio not available. Please try again later.', 'warning');
          return;
        }

        // Update UI for playing state
        this.updateVoiceUI(source, 'playing');
        
        // Play audio
        audio.currentTime = 0;
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.currentAudio = audio;
              this.isPlaying = true;
              console.log('🔊 Voice demo playing');
            })
            .catch(error => {
              console.error('Audio play failed:', error);
              this.handleAudioError();
            });
        }
      }

      updateVoiceUI(source, state) {
        if (state === 'playing') {
          if (source === 'hero') {
            const heroIcon = document.getElementById('heroVoiceIcon');
            const heroText = document.getElementById('heroVoiceText');
            const heroButton = document.getElementById('heroVoiceBtn');
            
            if (heroIcon) heroIcon.className = 'fas fa-stop mr-2';
            if (heroText) heroText.textContent = 'Stop Voice';
            if (heroButton) heroButton.classList.add('playing');
          }
          
          if (source === 'floating') {
            const floatingIcon = document.getElementById('voiceIcon');
            const floatingButton = document.getElementById('voiceButton');
            const visualizer = document.querySelector('.voice-visualizer');
            
            if (floatingIcon) floatingIcon.className = 'fas fa-stop text-white text-lg';
            if (floatingButton) floatingButton.classList.add('playing');
            if (visualizer) visualizer.classList.add('active');
          }
        } else {
          // Reset to default state
          this.resetAudioUI();
        }
      }

      resetAudioUI() {
        // Reset all UI elements
        const heroIcon = document.getElementById('heroVoiceIcon');
        const heroText = document.getElementById('heroVoiceText');
        const floatingIcon = document.getElementById('voiceIcon');
        const visualizer = document.querySelector('.voice-visualizer');
        const heroButton = document.getElementById('heroVoiceBtn');
        const floatingButton = document.getElementById('voiceButton');
        
        if (heroIcon) heroIcon.className = 'fas fa-play mr-2';
        if (heroText) heroText.textContent = 'Play Voice Demo';
        if (floatingIcon) floatingIcon.className = 'fas fa-play text-white text-lg';
        if (visualizer) visualizer.classList.remove('active');
        
        // Reset button states
        if (heroButton) {
          heroButton.classList.remove('playing');
          heroButton.setAttribute('aria-pressed', 'false');
        }
        if (floatingButton) {
          floatingButton.classList.remove('playing');
          floatingButton.setAttribute('aria-pressed', 'false');
        }
        
        // Global cleanup
        document.querySelectorAll('.playing').forEach(btn => {
          btn.classList.remove('playing');
        });
      }

      stopAllAudio() {
        // Stop current audio
        if (this.currentAudio) {
          this.currentAudio.pause();
          this.currentAudio.currentTime = 0;
        }
        
        // Stop all audio elements
        document.querySelectorAll('audio').forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });
        
        // Reset UI
        this.resetAudioUI();
        
        this.currentAudio = null;
        this.isPlaying = false;
      }

      handleAudioEnd() {
        this.stopAllAudio();
      }

      handleAudioError() {
        console.error('Audio loading/playback error');
        this.stopAllAudio();
        this.showNotification('Audio unavailable. Please try again later.', 'warning');
      }

      // 📜 SCROLL FUNCTIONALITY
      updateScrollProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        
        const progressBar = document.getElementById('scrollProgress');
        if (progressBar) {
          progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
        
        // Update scroll direction
        if (scrollTop > this.lastScrollY) {
          this.scrollDirection = 'down';
        } else {
          this.scrollDirection = 'up';
        }
        this.lastScrollY = scrollTop;
      }

      updateNavigationVisibility() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        const isLight = document.documentElement.classList.contains('light');
        
        if (this.lastScrollY > 100) {
          if (this.scrollDirection === 'down') {
            navbar.style.transform = 'translateY(-100%)';
          } else {
            navbar.style.transform = 'translateY(0)';
            if (isLight) {
              navbar.style.background = 'rgba(255, 255, 255, 0.95)';
              navbar.style.borderColor = 'rgba(0, 0, 0, 0.1)';
            } else {
              navbar.style.background = 'rgba(0, 0, 0, 0.4)';
              navbar.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
          }
        } else {
          navbar.style.transform = 'translateY(0)';
          navbar.style.background = isLight ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
        }
      }

      updateBackToTopVisibility() {
        const backToTop = document.getElementById('backToTop');
        if (!backToTop) return;
        
        if (this.lastScrollY > 500) {
          backToTop.style.opacity = '1';
          backToTop.style.transform = 'translateY(0)';
        } else {
          backToTop.style.opacity = '0';
          backToTop.style.transform = 'translateY(16px)';
        }
      }

      scrollToTop() {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }

      smoothScrollTo(target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }

      // 📧 CONTACT FORM
      async handleContactForm(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const submitText = document.getElementById('submitText');
        const formData = new FormData(form);
        
        // Show loading state
        if (submitBtn) submitBtn.disabled = true;
        if (submitText) submitText.textContent = 'Sending...';
        
        try {
          // Simulate form submission (replace with actual endpoint)
          await this.simulateFormSubmission(formData);
          
          // Success
          this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
          form.reset();
          
        } catch (error) {
          console.error('Form submission error:', error);
          this.showNotification('Failed to send message. Please try again or contact me directly.', 'error');
        } finally {
          // Reset button state
          if (submitBtn) submitBtn.disabled = false;
          if (submitText) submitText.textContent = 'Send Message';
        }
      }

      async simulateFormSubmission(formData) {
        // Simulate API call
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate success/failure based on email validation
            const email = formData.get('email');
            if (email && email.includes('@')) {
              resolve({ success: true });
            } else {
              reject(new Error('Invalid email'));
            }
          }, 2000);
        });
      }

      // 🔔 NOTIFICATION SYSTEM
      showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm transform translate-x-full transition-transform duration-300`;
        
        // Set color based on type
        const colors = {
          success: 'bg-green-500 text-white',
          error: 'bg-red-500 text-white',
          warning: 'bg-yellow-500 text-black',
          info: 'bg-blue-500 text-white'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.innerHTML = `
          <div class="flex items-center gap-3">
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 opacity-70 hover:opacity-100">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
          notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (notification.parentElement) {
              notification.remove();
            }
          }, 300);
        }, 5000);
      }

      getNotificationIcon(type) {
        const icons = {
          success: 'check-circle',
          error: 'exclamation-circle',
          warning: 'exclamation-triangle',
          info: 'info-circle'
        };
        return icons[type] || icons.info;
      }

      // 🎯 UTILITY FUNCTIONS
      handleResize() {
        // Reinitialize particles on resize if needed
        if (window.innerWidth <= 1024 && typeof pJSDom !== 'undefined' && pJSDom[0]) {
          pJSDom[0].pJS.fn.vendors.destroypJS();
        } else if (window.innerWidth > 1024) {
          this.initializeParticles();
        }
        
        // Update AOS on resize
        if (typeof AOS !== 'undefined') {
          AOS.refresh();
        }
      }

      fallbackInitialization() {
        console.log('🔄 Running fallback initialization...');
        
        // Basic functionality without advanced features
        this.setupBasicEventListeners();
        this.hideLoadingScreen();
        
        // Show fallback message
        this.showNotification('Portfolio loaded in compatibility mode.', 'info');
      }

      setupBasicEventListeners() {
        // Basic scroll to top
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
          backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        }
        
        // Basic mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenuBtn && mobileMenu) {
          mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
          });
        }
        
        // Basic smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          });
        });
      }

      // 🔧 HELPER FUNCTIONS
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
        };
      }

      debounce(func, wait, immediate) {
        let timeout;
        return function() {
          const context = this;
          const args = arguments;
          const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
          };
          const callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
        };
      }

      // 📊 PERFORMANCE MONITORING
      measurePerformance() {
        if (typeof performance !== 'undefined' && performance.timing) {
          window.addEventListener('load', () => {
            setTimeout(() => {
              const timing = performance.timing;
              const loadTime = timing.loadEventEnd - timing.navigationStart;
              console.log(`📊 Page load time: ${loadTime}ms`);
              
              // Log performance metrics
              if (loadTime > 3000) {
                console.warn('⚠️ Slow page load detected');
              }
            }, 1000);
          });
        }
      }

      // ♿ ACCESSIBILITY ENHANCEMENTS
      enhanceAccessibility() {
        // Add focus indicators
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
          }
        });
        
        document.addEventListener('mousedown', () => {
          document.body.classList.remove('keyboard-navigation');
        });
        
        // Add skip to content link
        const skipLink = document.createElement('a');
        skipLink.href = '#hero';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded z-50';
        document.body.insertBefore(skipLink, document.body.firstChild);
      }

      // 🚨 ERROR HANDLING
      setupErrorHandling() {
        window.addEventListener('error', (e) => {
          console.error('🚨 JavaScript error:', e.error);
          
          // Don't show error notifications in production
          if (window.location.hostname === 'localhost') {
            this.showNotification('A JavaScript error occurred. Check the console for details.', 'error');
          }
        });
        
        window.addEventListener('unhandledrejection', (e) => {
          console.error('🚨 Unhandled promise rejection:', e.reason);
        });
      }
    }

    // ===============================================
    // 🚀 APPLICATION INITIALIZATION
    // ===============================================
    
    // Initialize the portfolio when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.portfolioApp = new EnhancedPortfolioApp();
      });
    } else {
      window.portfolioApp = new EnhancedPortfolioApp();
    }

    // ===============================================
    // 🛠️ ADDITIONAL UTILITY FUNCTIONS
    // ===============================================
    
    // Lazy loading for images
    function initializeLazyLoading() {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
          imageObserver.observe(img);
        });
      }
    }

    // Service Worker registration for PWA capabilities
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('🔧 Service Worker registered successfully');
          })
          .catch(error => {
            console.log('❌ Service Worker registration failed');
          });
      });
    }

    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
      // ESC key functionality
      if (e.key === 'Escape') {
        // Close mobile menu
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
        }
        
        // Stop audio
        if (window.portfolioApp) {
          window.portfolioApp.stopAllAudio();
        }
      }
      
      // Ctrl/Cmd + K for search (future enhancement)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        console.log('🔍 Search functionality - coming soon!');
      }
    });

    // Performance optimization: Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Disable animations for users who prefer reduced motion
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Analytics tracking (placeholder)
    function trackEvent(action, category, label) {
      // Replace with your analytics service
      console.log(`📊 Event tracked: ${category} - ${action} - ${label}`);
      
      // Example: Google Analytics 4
      // gtag('event', action, {
      //   event_category: category,
      //   event_label: label,
      // });
    }

    // Track important interactions
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (target) {
        const text = target.textContent.trim();
        const href = target.href;
        
        if (href && href.startsWith('#')) {
          trackEvent('navigation', 'internal_link', text);
        } else if (href && href.startsWith('http')) {
          trackEvent('click', 'external_link', href);
        } else if (target.tagName === 'BUTTON') {
          trackEvent('click', 'button', text);
        }
      }
    });

    // Console Easter Egg
    console.log(`
    🎨 Welcome to Thanatsitt's Portfolio!
    
    ╔══════════════════════════════════════╗
    ║  Thanks for checking out the code!   ║
    ║                                      ║
    ║  Built with:                         ║
    ║  • Vanilla JavaScript                ║
    ║  • Tailwind CSS                      ║
    ║  • GSAP Animations                   ║
    ║  • Modern Web Standards              ║
    ║                                      ║
    ║  Want to collaborate?                ║
    ║  📧 thanattsitt.info@yahoo.co.uk    ║
    ╚══════════════════════════════════════╝
    
    🚀 Portfolio loaded successfully!
    `);

  </script>

  <!-- 🎨 QUICK THEME FIX SCRIPT -->
  <script>
    // Additional theme fix to ensure immediate theme application
    (function() {
      const savedTheme = localStorage.getItem('portfolio-theme') || 
                        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      
      document.documentElement.classList.add(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      
      // Apply theme immediately to prevent flash
      if (savedTheme === 'light') {
        document.documentElement.style.setProperty('--bg-primary', 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)');
        document.documentElement.style.setProperty('--text-primary', '#1e293b');
      } else {
        document.documentElement.style.setProperty('--bg-primary', 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)');
        document.documentElement.style.setProperty('--text-primary', '#f1f5f9');
      }
    })();