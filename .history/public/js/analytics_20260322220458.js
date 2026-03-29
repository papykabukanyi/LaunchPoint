// Analytics & Marketing Attribution System
// Comprehensive tracking for political marketing platform

class AnalyticsManager {
    constructor() {
        this.config = AppConfig.ANALYTICS;
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.pageLoadTime = Date.now();
        this.events = [];
        this.customDimensions = {};
        
        // Initialize tracking if enabled
        if (this.config.enabled) {
            this.initialize();
        }
    }

    initialize() {
        this.initializeGoogleAnalytics();
        this.initializeFacebookPixel();
        this.initializeGoogleTagManager();
        this.setupEventListeners();
        this.trackPageView();
        
        if (AppConfig.DEBUG.enabled) {
            console.log('🔍 Analytics initialized:', this.config);
        }
    }

    // Google Analytics 4 Setup
    initializeGoogleAnalytics() {
        if (!this.config.googleAnalyticsId) return;

        // Load GA4 script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', this.config.googleAnalyticsId, {
            custom_map: {
                'custom_dimension_1': 'campaign_id',
                'custom_dimension_2': 'utm_source',
                'custom_dimension_3': 'utm_medium',
                'custom_dimension_4': 'utm_campaign',
                'custom_dimension_5': 'user_type'
            },
            // Enhanced tracking
            allow_google_signals: true,
            allow_ad_personalization_signals: true,
            anonymize_ip: true
        });

        // Set custom dimensions
        const utmData = this.getUTMParameters();
        if (utmData.utm_source) {
            gtag('config', this.config.googleAnalyticsId, {
                custom_map: {
                    'utm_source': utmData.utm_source,
                    'utm_medium': utmData.utm_medium,
                    'utm_campaign': utmData.utm_campaign
                }
            });
        }
    }

    // Facebook Pixel Setup
    initializeFacebookPixel() {
        if (!this.config.facebookPixelId) return;

        // Facebook Pixel Code
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');

        fbq('init', this.config.facebookPixelId);
        fbq('track', 'PageView');
        
        // Advanced matching for better attribution
        const userEmail = this.getUserEmail();
        if (userEmail) {
            fbq('init', this.config.facebookPixelId, {
                em: userEmail
            });
        }
    }

    // Google Tag Manager Setup
    initializeGoogleTagManager() {
        if (!this.config.googleTagManagerId) return;

        // GTM script
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer', this.config.googleTagManagerId);
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Track link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                this.trackLinkClick(link);
            }
        });

        // Track form interactions
        document.addEventListener('submit', (e) => {
            if (e.target.tagName === 'FORM') {
                this.trackFormSubmit(e.target);
            }
        });

        // Track button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .btn');
            if (button) {
                this.trackButtonClick(button);
            }
        });

        // Track scroll depth
        this.setupScrollTracking();

        // Track time on page
        this.setupTimeTracking();

        // Track file downloads
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.isDownloadLink(link.href)) {
                this.trackFileDownload(link.href);
            }
        });

        // Track external links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.isExternalLink(link.href)) {
                this.trackExternalLink(link.href);
            }
        });

        // Track video interactions (if any)
        document.addEventListener('play', (e) => {
            if (e.target.tagName === 'VIDEO') {
                this.trackVideoPlay(e.target);
            }
        }, true);

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.trackPageHide();
            } else {
                this.trackPageShow();
            }
        });
    }

    // Scroll depth tracking
    setupScrollTracking() {
        let maxScroll = 0;
        const thresholds = [25, 50, 75, 100];
        const tracked = new Set();

        const trackScroll = AppConfig.utils.throttle(() => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            maxScroll = Math.max(maxScroll, scrollPercent);

            for (const threshold of thresholds) {
                if (scrollPercent >= threshold && !tracked.has(threshold)) {
                    tracked.add(threshold);
                    this.trackEvent('scroll_depth', {
                        event_category: 'engagement',
                        event_label: `${threshold}%`,
                        value: threshold
                    });
                }
            }
        }, 1000);

        window.addEventListener('scroll', trackScroll, { passive: true });
    }

    // Time on page tracking
    setupTimeTracking() {
        const intervals = [30, 60, 180, 300, 600]; // seconds
        const tracked = new Set();

        setInterval(() => {
            const timeOnPage = Math.round((Date.now() - this.pageLoadTime) / 1000);
            
            for (const interval of intervals) {
                if (timeOnPage >= interval && !tracked.has(interval)) {
                    tracked.add(interval);
                    this.trackEvent('time_on_page', {
                        event_category: 'engagement',
                        event_label: `${interval}s`,
                        value: interval
                    });
                }
            }
        }, 5000);
    }

    // Page view tracking
    trackPageView() {
        if (!this.config.trackPageViews) return;

        const pageData = {
            page_title: document.title,
            page_location: window.location.href,
            page_referrer: document.referrer,
            ...this.getUTMParameters(),
            campaign_id: AppConfig.CAMPAIGN.id,
            user_type: this.getUserType()
        };

        // Google Analytics
        if (window.gtag) {
            gtag('event', 'page_view', pageData);
        }

        // Facebook Pixel
        if (window.fbq) {
            fbq('track', 'PageView', pageData);
        }

        // Custom tracking
        this.trackEvent('page_view', pageData);
    }

    // Generic event tracking
    trackEvent(eventName, eventData = {}) {
        const event = {
            event_name: eventName,
            timestamp: Date.now(),
            session_id: this.sessionId,
            user_id: this.userId,
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            ...eventData,
            ...this.getUTMParameters()
        };

        // Store event locally
        this.events.push(event);

        // Google Analytics
        if (window.gtag) {
            gtag('event', eventName, eventData);
        }

        // Facebook Pixel
        if (window.fbq) {
            fbq('trackCustom', eventName, eventData);
        }

        // Send to custom analytics endpoint
        if (API) {
            API.trackEvent(event).catch(error => {
                console.warn('Failed to track event:', error);
            });
        }

        if (AppConfig.DEBUG.enabled) {
            console.log('📊 Event tracked:', event);
        }
    }

    // Specific tracking methods
    trackLinkClick(link) {
        this.trackEvent('link_click', {
            event_category: 'navigation',
            event_label: link.href,
            link_text: link.textContent.trim(),
            link_url: link.href,
            link_domain: new URL(link.href, window.location.origin).hostname
        });
    }

    trackButtonClick(button) {
        this.trackEvent('button_click', {
            event_category: 'engagement',
            event_label: button.textContent.trim() || button.getAttribute('aria-label') || 'Unknown',
            button_id: button.id || null,
            button_class: button.className || null
        });
    }

    trackFormSubmit(form) {
        this.trackEvent('form_submit', {
            event_category: 'engagement',
            event_label: form.id || form.name || 'Unknown Form',
            form_id: form.id || null,
            form_method: form.method || 'GET',
            form_action: form.action || window.location.href
        });
    }

    trackFileDownload(url) {
        const filename = url.split('/').pop().split('?')[0];
        this.trackEvent('file_download', {
            event_category: 'engagement',
            event_label: filename,
            file_url: url,
            file_extension: filename.split('.').pop()
        });
    }

    trackExternalLink(url) {
        const domain = new URL(url).hostname;
        this.trackEvent('external_link', {
            event_category: 'navigation',
            event_label: domain,
            external_url: url,
            external_domain: domain
        });
    }

    trackVideoPlay(video) {
        this.trackEvent('video_play', {
            event_category: 'engagement',
            event_label: video.src || video.currentSrc || 'Unknown Video',
            video_title: video.title || null,
            video_duration: video.duration || null
        });
    }

    trackPageHide() {
        const timeOnPage = Date.now() - this.pageLoadTime;
        this.trackEvent('page_hide', {
            event_category: 'engagement',
            event_label: 'page_exit',
            value: Math.round(timeOnPage / 1000)
        });
    }

    trackPageShow() {
        this.trackEvent('page_show', {
            event_category: 'engagement',
            event_label: 'page_return'
        });
    }

    // Campaign-specific tracking
    trackVolunteerSignup(data) {
        this.trackEvent('volunteer_signup', {
            event_category: 'conversion',
            event_label: 'volunteer_form',
            value: 1,
            ...data
        });

        // Facebook conversion
        if (window.fbq) {
            fbq('track', 'CompleteRegistration', {
                content_name: 'Volunteer Signup',
                ...data
            });
        }
    }

    trackDonation(amount, method) {
        this.trackEvent('donation', {
            event_category: 'conversion',
            event_label: 'donation_form',
            value: amount,
            currency: 'USD',
            payment_method: method
        });

        // Facebook purchase event
        if (window.fbq) {
            fbq('track', 'Purchase', {
                value: amount,
                currency: 'USD',
                content_name: 'Campaign Donation'
            });
        }

        // Google Analytics enhanced ecommerce
        if (window.gtag) {
            gtag('event', 'purchase', {
                transaction_id: this.generateTransactionId(),
                value: amount,
                currency: 'USD',
                items: [{
                    item_id: 'donation',
                    item_name: 'Campaign Donation',
                    category: 'donation',
                    quantity: 1,
                    price: amount
                }]
            });
        }
    }

    trackNewsletterSignup(email) {
        this.trackEvent('newsletter_signup', {
            event_category: 'conversion',
            event_label: 'newsletter_form',
            value: 1
        });

        // Facebook lead event
        if (window.fbq) {
            fbq('track', 'Lead', {
                content_name: 'Newsletter Signup'
            });
        }
    }

    trackContactForm(formData) {
        this.trackEvent('contact_form', {
            event_category: 'conversion',
            event_label: 'contact_form',
            interest: formData.interest || null,
            value: 1
        });

        // Facebook lead event
        if (window.fbq) {
            fbq('track', 'Lead', {
                content_name: 'Contact Form'
            });
        }
    }

    // Utility methods
    generateSessionId() {
        let sessionId = sessionStorage.getItem('analyticsSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('analyticsSessionId', sessionId);
        }
        return sessionId;
    }

    getUserId() {
        let userId = localStorage.getItem('analyticsUserId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('analyticsUserId', userId);
        }
        return userId;
    }

    getUserEmail() {
        // Try to get user email from various sources
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        return user?.email || null;
    }

    getUserType() {
        // Determine user type based on behavior/data
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) return 'registered';
        
        const hasInteracted = this.events.some(e => e.event_category === 'conversion');
        if (hasInteracted) return 'engaged';
        
        return 'visitor';
    }

    getUTMParameters() {
        // Get UTM parameters from URL or session storage
        const urlParams = AppConfig.utils.getUrlParams();
        const sessionUTM = AppConfig.utils.getSessionStorage('utmData') || {};
        
        return {
            utm_source: urlParams.utm_source || sessionUTM.utm_source || null,
            utm_medium: urlParams.utm_medium || sessionUTM.utm_medium || null,
            utm_campaign: urlParams.utm_campaign || sessionUTM.utm_campaign || null,
            utm_term: urlParams.utm_term || sessionUTM.utm_term || null,
            utm_content: urlParams.utm_content || sessionUTM.utm_content || null
        };
    }

    isDownloadLink(url) {
        const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.mp3', '.mp4', '.avi'];
        return downloadExtensions.some(ext => url.toLowerCase().includes(ext));
    }

    isExternalLink(url) {
        try {
            const linkDomain = new URL(url, window.location.origin).hostname;
            return linkDomain !== window.location.hostname;
        } catch {
            return false;
        }
    }

    generateTransactionId() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Attribution analysis
    getAttributionData() {
        return {
            firstTouch: this.getFirstTouchAttribution(),
            lastTouch: this.getLastTouchAttribution(),
            sessionInfo: {
                sessionId: this.sessionId,
                pageViews: this.events.filter(e => e.event_name === 'page_view').length,
                timeOnSite: Date.now() - this.pageLoadTime,
                eventsCount: this.events.length
            },
            utmData: this.getUTMParameters()
        };
    }

    getFirstTouchAttribution() {
        const firstVisit = localStorage.getItem('firstTouchAttribution');
        if (firstVisit) {
            return JSON.parse(firstVisit);
        }

        const attribution = {
            timestamp: Date.now(),
            url: window.location.href,
            referrer: document.referrer,
            ...this.getUTMParameters()
        };

        localStorage.setItem('firstTouchAttribution', JSON.stringify(attribution));
        return attribution;
    }

    getLastTouchAttribution() {
        const attribution = {
            timestamp: Date.now(),
            url: window.location.href,
            referrer: document.referrer,
            ...this.getUTMParameters()
        };

        sessionStorage.setItem('lastTouchAttribution', JSON.stringify(attribution));
        return attribution;
    }

    // Data export
    exportAnalyticsData() {
        return {
            config: this.config,
            sessionId: this.sessionId,
            userId: this.userId,
            events: this.events,
            attribution: this.getAttributionData(),
            customDimensions: this.customDimensions
        };
    }

    // Set custom dimension
    setCustomDimension(key, value) {
        this.customDimensions[key] = value;
        
        if (window.gtag) {
            gtag('config', this.config.googleAnalyticsId, {
                custom_map: { [key]: value }
            });
        }
    }

    // Clear analytics data
    clearAnalyticsData() {
        this.events = [];
        sessionStorage.removeItem('analyticsSessionId');
        sessionStorage.removeItem('lastTouchAttribution');
    }
}

// Marketing Attribution Helper
class MarketingAttribution {
    constructor() {
        this.touchpoints = this.loadTouchpoints();
    }

    addTouchpoint(data) {
        const touchpoint = {
            id: AppConfig.utils.generateUUID(),
            timestamp: Date.now(),
            type: data.type || 'unknown',
            source: data.source,
            medium: data.medium,
            campaign: data.campaign,
            content: data.content,
            term: data.term,
            url: window.location.href,
            referrer: document.referrer,
            value: data.value || 0
        };

        this.touchpoints.push(touchpoint);
        this.saveTouchpoints();
        return touchpoint;
    }

    getAttributionModel(model = 'lastTouch') {
        switch (model) {
            case 'firstTouch':
                return this.touchpoints[0] || null;
            case 'lastTouch':
                return this.touchpoints[this.touchpoints.length - 1] || null;
            case 'linear':
                return this.getLinearAttribution();
            case 'timeDecay':
                return this.getTimeDecayAttribution();
            default:
                return this.touchpoints;
        }
    }

    getLinearAttribution() {
        if (this.touchpoints.length === 0) return null;
        
        const value = 1 / this.touchpoints.length;
        return this.touchpoints.map(tp => ({ ...tp, attributedValue: value }));
    }

    getTimeDecayAttribution() {
        if (this.touchpoints.length === 0) return null;
        
        const now = Date.now();
        const halfLife = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        let totalWeight = 0;
        const weights = this.touchpoints.map(tp => {
            const age = now - tp.timestamp;
            const weight = Math.pow(0.5, age / halfLife);
            totalWeight += weight;
            return weight;
        });
        
        return this.touchpoints.map((tp, index) => ({
            ...tp,
            attributedValue: weights[index] / totalWeight
        }));
    }

    loadTouchpoints() {
        const stored = localStorage.getItem('marketingTouchpoints');
        return stored ? JSON.parse(stored) : [];
    }

    saveTouchpoints() {
        // Keep only last 50 touchpoints
        if (this.touchpoints.length > 50) {
            this.touchpoints = this.touchpoints.slice(-50);
        }
        localStorage.setItem('marketingTouchpoints', JSON.stringify(this.touchpoints));
    }

    clearTouchpoints() {
        this.touchpoints = [];
        localStorage.removeItem('marketingTouchpoints');
    }
}

// Initialize analytics
const Analytics = new AnalyticsManager();
const Attribution = new MarketingAttribution();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnalyticsManager, MarketingAttribution, Analytics, Attribution };
} else {
    window.AnalyticsManager = AnalyticsManager;
    window.MarketingAttribution = MarketingAttribution;
    window.Analytics = Analytics;
    window.Attribution = Attribution;
}