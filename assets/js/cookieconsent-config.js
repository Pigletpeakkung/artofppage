/* ==================================
   COOKIE CONSENT CONFIGURATION
   Using vanilla-cookieconsent v3.1.0
   GDPR/CCPA compliant cookie management
   ================================== */

import 'https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3.1.0/dist/cookieconsent.umd.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Cookie Consent
    CookieConsent.run({
        // === GENERAL CONFIGURATION ===
        guiOptions: {
            consentModal: {
                layout: 'box',
                position: 'bottom right',
                equalWeightButtons: false,
                flipButtons: false
            },
            preferencesModal: {
                layout: 'box',
                position: 'right',
                equalWeightButtons: false,
                flipButtons: false
            }
        },

        // === COOKIE CATEGORIES ===
        categories: {
            necessary: {
                enabled: true,  // Always enabled
                readOnly: true, // Cannot be disabled
                autoClear: {
                    cookies: [
                        {
                            name: /^cc_/,     // Cookie consent cookies
                        },
                        {
                            name: 'theme',    // Theme preference
                        }
                    ]
                }
            },
            functionality: {
                enabled: false,  // Disabled by default
                autoClear: {
                    cookies: [
                        {
                            name: /^(theme|lang|preferences).*$/,
                        }
                    ],
                    reloadPage: false
                }
            },
            analytics: {
                enabled: false,  // Disabled by default
                autoClear: {
                    cookies: [
                        {
                            name: /^(_ga|_gid|_gat|gtag|_gtag).*$/,
                        }
                    ],
                    reloadPage: true
                },
                services: {
                    ga4: {
                        label: 'Google Analytics 4',
                        onAccept: () => {
                            console.log('Analytics cookies accepted');
                            loadGoogleAnalytics();
                        },
                        onReject: () => {
                            console.log('Analytics cookies rejected');
                            // Remove any existing GA scripts
                            removeGoogleAnalytics();
                        }
                    }
                }
            },
            marketing: {
                enabled: false,  // Disabled by default
                autoClear: {
                    cookies: [
                        {
                            name: /^(_fbp|_fbc|fr|tr).*$/,
                        },
                        {
                            name: /^(li_|UserMatchHistory|AnalyticsSyncHistory).*$/,
                        }
                    ],
                    reloadPage: true
                },
                services: {
                    linkedin: {
                        label: 'LinkedIn Insights',
                        onAccept: () => {
                            console.log('Marketing cookies accepted');
                            loadLinkedInInsights();
                        },
                        onReject: () => {
                            console.log('Marketing cookies rejected');
                            removeLinkedInInsights();
                        }
                    }
                }
            }
        },

        // === LANGUAGE CONFIGURATION ===
        language: {
            default: 'en',
            autoDetect: 'browser',
            translations: {
                en: {
                    consentModal: {
                        title: 'We value your privacy',
                        description: 'This website uses cookies to enhance your browsing experience and provide personalized content. By clicking "Accept All", you consent to our use of cookies.',
                        acceptAllBtn: 'Accept All',
                        acceptNecessaryBtn: 'Reject All',
                        showPreferencesBtn: 'Manage Preferences',
                        footer: '<a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a>'
                    },
                    preferencesModal: {
                        title: 'Cookie Preferences',
                        acceptAllBtn: 'Accept All',
                        acceptNecessaryBtn: 'Reject All',
                        savePreferencesBtn: 'Save Preferences',
                        closeIconLabel: 'Close',
                        serviceCounterLabel: 'Service|Services',
                        sections: [
                            {
                                title: 'Cookie Usage',
                                description: 'We use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want.'
                            },
                            {
                                title: 'Strictly Necessary Cookies',
                                description: 'These cookies are essential for the proper functioning of the website. Without these cookies, the website would not work properly.',
                                linkedCategory: 'necessary'
                            },
                            {
                                title: 'Functionality Cookies',
                                description: 'These cookies allow the website to provide enhanced functionality and personalization. They may be set by us or by third party providers.',
                                linkedCategory: 'functionality'
                            },
                            {
                                title: 'Analytics Cookies',
                                description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
                                linkedCategory: 'analytics'
                            },
                            {
                                title: 'Marketing Cookies',
                                description: 'These cookies are used to deliver relevant advertisements and marketing campaigns to you.',
                                linkedCategory: 'marketing'
                            },
                            {
                                title: 'More Information',
                                description: 'For any queries in relation to our policy on cookies and your choices, please <a href="mailto:Thanattsitt.info@yahoo.co.uk">contact us</a>.'
                            }
                        ]
                    }
                }
            }
        },

        // === BEHAVIOR CONFIGURATION ===
        onFirstConsent: ({cookie}) => {
            console.log('First consent:', cookie);
            
            // Enable theme persistence if functionality cookies accepted
            if (CookieConsent.acceptedCategory('functionality')) {
                document.body.setAttribute('data-theme-persist', 'true');
            }
            
            // Update privacy indicator
            updatePrivacyIndicator();
        },

        onConsent: ({cookie}) => {
            console.log('Consent updated:', cookie);
            
            // Handle theme persistence
            if (CookieConsent.acceptedCategory('functionality')) {
                document.body.setAttribute('data-theme-persist', 'true');
                // Save current theme if not already saved
                if (!localStorage.getItem('theme')) {
                    const currentTheme = document.body.getAttribute('data-theme') || 'light';
                    localStorage.setItem('theme', currentTheme);
                }
            } else {
                document.body.removeAttribute('data-theme-persist');
                localStorage.removeItem('theme');
            }
            
            updatePrivacyIndicator();
        },

        onChange: ({cookie, changedCategories}) => {
            console.log('Consent changed:', cookie, changedCategories);
            updatePrivacyIndicator();
        }
    });

    // Show cookie preferences if manually triggered
    window.showCookiePreferences = function() {
        CookieConsent.showPreferences();
    };

    // Accept all cookies function
    window.acceptAllCookies = function() {
        CookieConsent.acceptCategory(['necessary', 'functionality', 'analytics', 'marketing']);
    };

    // Reject all cookies function  
    window.rejectAllCookies = function() {
        CookieConsent.acceptCategory(['necessary']);
    };
});

// === ANALYTICS INTEGRATION ===

/**
 * Load Google Analytics 4
 */
function loadGoogleAnalytics() {
    // Replace with your actual GA4 Measurement ID
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // TODO: Replace with actual ID
    
    // Check if already loaded
    if (window.gtag) {
        console.log('Google Analytics already loaded');
        return;
    }
    
    // Create and load GA4 script
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(gtagScript);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        anonymize_ip: true,
        cookie_flags: 'SameSite=Strict;Secure',
        page_title: document.title,
        custom_map: {
            dimension1: 'theme_preference'
        }
    });
    
    // Send theme preference as custom dimension
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    gtag('event', 'page_view', {
        theme_preference: currentTheme
    });
    
    console.log('Google Analytics 4 loaded successfully');
}

/**
 * Remove Google Analytics
 */
function removeGoogleAnalytics() {
    // Remove GA scripts
    const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com"]');
    gaScripts.forEach(script => script.remove());
    
    // Clear global variables
    if (window.gtag) {
        delete window.gtag;
    }
    if (window.dataLayer) {
        window.dataLayer = [];
    }
    
    console.log('Google Analytics removed');
}

/**
 * Load LinkedIn Insights Tag
 */
function loadLinkedInInsights() {
    // Replace with your actual LinkedIn Partner ID
    const LINKEDIN_PARTNER_ID = 'XXXXXXX'; // TODO: Replace with actual ID
    
    // Check if already loaded
    if (window._linkedin_data_partner_ids) {
        console.log('LinkedIn Insights already loaded');
        return;
    }
    
    // Initialize LinkedIn tracking
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);
    
    // Load LinkedIn script
    (function(l) {
        if (!l) {
            window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q = [];
        }
        
        const s = document.getElementsByTagName('script')[0];
        const b = document.createElement('script');
        b.type = 'text/javascript';
        b.async = true;
        b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
        s.parentNode.insertBefore(b, s);
    })(window.lintrk);
    
    console.log('LinkedIn Insights loaded successfully');
}

/**
 * Remove LinkedIn Insights
 */
function removeLinkedInInsights() {
    // Remove LinkedIn scripts
    const linkedInScripts = document.querySelectorAll('script[src*="snap.licdn.com"]');
    linkedInScripts.forEach(script => script.remove());
    
    // Clear global variables
    if (window._linkedin_data_partner_ids) {
        delete window._linkedin_data_partner_ids;
    }
    if (window.lintrk) {
        delete window.
