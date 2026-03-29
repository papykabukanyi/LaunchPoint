// Configuration & Settings for Political Marketing Platform
// Dynamic configuration management for campaigns

const AppConfig = {
    // API Configuration
    API_BASE_URL: window.location.origin,
    API_ENDPOINTS: {
        contact: '/api/contact',
        newsletter: '/api/newsletter',
        campaign: '/api/campaign',
        analytics: '/api/analytics',
        upload: '/api/upload',
        admin: {
            login: '/api/admin/login',
            dashboard: '/api/admin/dashboard',
            export: '/api/admin/export/contacts'
        }
    },

    // Campaign Configuration (can be dynamically loaded)
    CAMPAIGN: {
        id: 1,
        name: 'Vote for Change',
        candidate: 'Your Candidate 2026',
        office: 'Mayor',
        location: 'Springfield, IL',
        colors: {
            primary: '#1e3a8a',
            secondary: '#3b82f6',
            accent: '#dc2626'
        },
        contact: {
            email: 'info@voteforchange2026.com',
            phone: '(555) 123-4567',
            address: '123 Campaign St, Springfield, IL 62701'
        },
        social: {
            facebook: 'https://facebook.com/candidate2026',
            twitter: 'https://twitter.com/candidate2026',
            instagram: 'https://instagram.com/candidate2026',
            youtube: 'https://youtube.com/candidate2026'
        },
        seo: {
            title: 'Vote for Change - Professional Political Campaign',
            description: 'Join our movement for positive change in our community.',
            keywords: 'political campaign, mayor, election, vote, change'
        }
    },

    // Marketing Firm Configuration
    MARKETING_FIRM: {
        name: 'Blue Ocean Strategies',
        website: 'https://blueoceansstrategies.com',
        phone: '(555) 123-4567',
        email: 'info@blueoceanstrategies.com'
    },

    // Analytics Configuration
    ANALYTICS: {
        googleAnalyticsId: '',
        facebookPixelId: '',
        googleTagManagerId: '',
        hotjarId: '',
        enabled: true,
        trackPageViews: true,
        trackEvents: true,
        trackFormSubmissions: true
    },

    // UI Configuration
    UI: {
        loadingDelay: 1000,
        animationDuration: 300,
        notificationDuration: 5000,
        autoSaveInterval: 30000,
        theme: 'light', // light, dark, auto
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'America/Chicago'
    },

    // Form Configuration
    FORMS: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        requiredFields: ['firstName', 'lastName', 'email', 'message'],
        enableAutosave: true,
        enableRealTimeValidation: true,
        reCaptchaEnabled: false,
        reCaptchaSiteKey: ''
    },

    // Feature Flags
    FEATURES: {
        newsletter: true,
        events: true,
        donations: true,
        volunteer: true,
        socialFeed: true,
        liveChat: false,
        multiLanguage: false,
        darkMode: true,
        offlineMode: false,
        pushNotifications: false
    },

    // Rate Limiting
    RATE_LIMITS: {
        contactForm: {
            max: 5,
            windowMs: 15 * 60 * 1000 // 15 minutes
        },
        newsletter: {
            max: 3,
            windowMs: 60 * 60 * 1000 // 1 hour
        }
    },

    // Error Messages
    MESSAGES: {
        errors: {
            network: 'Network error. Please check your connection and try again.',
            server: 'Server error. Please try again later.',
            validation: 'Please check your input and try again.',
            rateLimited: 'Too many requests. Please wait before trying again.',
            fileUpload: 'File upload failed. Please try again.',
            required: 'This field is required.',
            email: 'Please enter a valid email address.',
            phone: 'Please enter a valid phone number.',
            fileSize: 'File size too large. Maximum size is 5MB.',
            fileType: 'File type not allowed.'
        },
        success: {
            contact: 'Thank you for your message! We\'ll get back to you soon.',
            newsletter: 'Successfully subscribed to our newsletter!',
            volunteer: 'Thank you for volunteering! We\'ll be in touch.',
            donation: 'Thank you for your generous donation!',
            general: 'Success! Your request has been processed.'
        },
        info: {
            loading: 'Loading...',
            saving: 'Saving...',
            uploading: 'Uploading...',
            processing: 'Processing your request...'
        }
    },

    // Development/Debug Settings
    DEBUG: {
        enabled: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        logLevel: 'info', // error, warn, info, debug
        showPerformanceMetrics: false,
        enableTestMode: false
    }
};

// Dynamic configuration loading
AppConfig.loadCampaignConfig = async function(campaignId) {
    try {
        const response = await fetch(`${this.API_BASE_URL}${this.API_ENDPOINTS.campaign}/${campaignId}`);
        if (response.ok) {
            const campaignData = await response.json();
            this.CAMPAIGN = { ...this.CAMPAIGN, ...campaignData };
            this.applyCampaignTheme();
            return campaignData;
        }
    } catch (error) {
        console.warn('Failed to load campaign configuration:', error);
    }
    return null;
};

// Apply campaign theme dynamically
AppConfig.applyCampaignTheme = function() {
    if (this.CAMPAIGN.colors) {
        const root = document.documentElement;
        root.style.setProperty('--primary-blue', this.CAMPAIGN.colors.primary || '#1e3a8a');
        root.style.setProperty('--secondary-blue', this.CAMPAIGN.colors.secondary || '#3b82f6');
        root.style.setProperty('--accent-red', this.CAMPAIGN.colors.accent || '#dc2626');
    }
};

// Utility functions
AppConfig.utils = {
    // Format phone numbers
    formatPhone: (phone) => {
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
    },

    // Format dates
    formatDate: (date, format = AppConfig.UI.dateFormat) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // Format numbers
    formatNumber: (num, locale = 'en-US') => {
        return new Intl.NumberFormat(locale).format(num);
    },

    // Format currency
    formatCurrency: (amount, currency = 'USD', locale = 'en-US') => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Debounce function
    debounce: (func, wait, immediate) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },

    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Generate UUID
    generateUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Get URL parameters
    getUrlParams: () => {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    // Device detection
    isMobile: () => /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    
    isTablet: () => /(iPad|Android|Windows NT.*Touch)/i.test(navigator.userAgent),
    
    isDesktop: () => !AppConfig.utils.isMobile() && !AppConfig.utils.isTablet(),

    // Local storage with expiration
    setStorage: (key, value, expiration = null) => {
        const data = {
            value: value,
            timestamp: Date.now(),
            expiration: expiration
        };
        localStorage.setItem(key, JSON.stringify(data));
    },

    getStorage: (key) => {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            const data = JSON.parse(item);
            if (data.expiration && Date.now() > data.timestamp + data.expiration) {
                localStorage.removeItem(key);
                return null;
            }
            return data.value;
        } catch (error) {
            console.warn('Error reading from localStorage:', error);
            return null;
        }
    },

    // Session storage utilities
    setSessionStorage: (key, value) => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Error writing to sessionStorage:', error);
        }
    },

    getSessionStorage: (key) => {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.warn('Error reading from sessionStorage:', error);
            return null;
        }
    }
};

// Environment detection and configuration adjustment
if (AppConfig.DEBUG.enabled) {
    console.log('🚀 Political Marketing Platform - Debug Mode Enabled');
    console.log('Configuration:', AppConfig);
    window.AppConfig = AppConfig; // Make available in console for debugging
}

// Performance monitoring
if (AppConfig.DEBUG.showPerformanceMetrics) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page Load Performance:', {
                loadTime: perfData.loadEventEnd - perfData.fetchStart,
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
                firstPaint: performance.getEntriesByType('paint')[0]?.startTime
            });
        }, 0);
    });
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
} else {
    window.AppConfig = AppConfig;
}