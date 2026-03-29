// API Handler for Political Marketing Platform
// Centralized API communication with error handling and retry logic

class ApiClient {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || AppConfig.API_BASE_URL;
        this.endpoints = config.endpoints || AppConfig.API_ENDPOINTS;
        this.timeout = config.timeout || 10000;
        this.retryAttempts = config.retryAttempts || 3;
        this.retryDelay = config.retryDelay || 1000;
        
        // Request interceptors
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        
        // Rate limiting
        this.requestQueue = new Map();
        this.rateLimits = AppConfig.RATE_LIMITS;
        
        // Cache for GET requests
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Add request interceptor
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }

    // Add response interceptor
    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
    }

    // Rate limiting check
    checkRateLimit(endpoint) {
        const now = Date.now();
        const key = endpoint;
        const limit = this.getRateLimitForEndpoint(endpoint);
        
        if (!limit) return true;
        
        if (!this.requestQueue.has(key)) {
            this.requestQueue.set(key, []);
        }
        
        const requests = this.requestQueue.get(key);
        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < limit.windowMs);
        
        if (validRequests.length >= limit.max) {
            return false;
        }
        
        validRequests.push(now);
        this.requestQueue.set(key, validRequests);
        return true;
    }

    getRateLimitForEndpoint(endpoint) {
        if (endpoint.includes('/contact')) return this.rateLimits.contactForm;
        if (endpoint.includes('/newsletter')) return this.rateLimits.newsletter;
        return null;
    }

    // Get from cache
    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    // Set cache
    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    // Main request method
    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
        const method = options.method || 'GET';
        
        // Check rate limiting
        if (!this.checkRateLimit(endpoint)) {
            throw new Error(AppConfig.MESSAGES.errors.rateLimited);
        }

        // Check cache for GET requests
        if (method === 'GET' && !options.skipCache) {
            const cached = this.getCached(url);
            if (cached) {
                return cached;
            }
        }

        // Prepare request configuration
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add body for non-GET requests
        if (options.body && method !== 'GET') {
            if (config.headers['Content-Type'] === 'application/json') {
                config.body = JSON.stringify(options.body);
            } else {
                config.body = options.body;
            }
        }

        // Apply request interceptors
        for (const interceptor of this.requestInterceptors) {
            await interceptor(config);
        }

        let lastError;
        
        // Retry logic
        for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                config.signal = controller.signal;
                
                const response = await fetch(url, config);
                clearTimeout(timeoutId);
                
                // Apply response interceptors
                for (const interceptor of this.responseInterceptors) {
                    await interceptor(response);
                }
                
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
                }
                
                const data = await this.parseResponse(response);
                
                // Cache successful GET requests
                if (method === 'GET' && !options.skipCache) {
                    this.setCache(url, data);
                }
                
                return data;
                
            } catch (error) {
                lastError = error;
                
                // Don't retry on certain errors
                if (error.name === 'AbortError' || error.message.includes('401') || error.message.includes('403')) {
                    break;
                }
                
                // Wait before retry
                if (attempt < this.retryAttempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt)));
                }
            }
        }
        
        throw this.handleError(lastError);
    }

    // Parse response based on content type
    async parseResponse(response) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else if (contentType && contentType.includes('text/')) {
            return await response.text();
        } else {
            return response;
        }
    }

    // Error handling
    handleError(error) {
        if (AppConfig.DEBUG.enabled) {
            console.error('API Error:', error);
        }
        
        if (error.name === 'AbortError') {
            return new Error('Request timed out. Please try again.');
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return new Error(AppConfig.MESSAGES.errors.network);
        }
        
        if (error.message.includes('500')) {
            return new Error(AppConfig.MESSAGES.errors.server);
        }
        
        return error;
    }

    // HTTP Methods
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: data
        });
    }

    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: data
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    // File upload with progress
    async uploadFile(file, options = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add additional fields
        if (options.fields) {
            Object.keys(options.fields).forEach(key => {
                formData.append(key, options.fields[key]);
            });
        }
        
        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && options.onProgress) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    options.onProgress(progress);
                }
            });
            
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        resolve(xhr.responseText);
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                }
            });
            
            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'));
            });
            
            xhr.addEventListener('timeout', () => {
                reject(new Error('Upload timed out'));
            });
            
            xhr.timeout = this.timeout;
            xhr.open('POST', `${this.baseUrl}${this.endpoints.upload}`);
            xhr.send(formData);
        });
    }
}

// API Service - High-level API methods
class ApiService {
    constructor() {
        this.client = new ApiClient();
        
        // Add common request interceptors
        this.client.addRequestInterceptor(this.addCommonHeaders.bind(this));
        this.client.addRequestInterceptor(this.addUTMParameters.bind(this));
        
        // Add response interceptors
        this.client.addResponseInterceptor(this.logResponse.bind(this));
    }

    // Request interceptors
    async addCommonHeaders(config) {
        // Add authentication token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add user agent info
        config.headers['X-Client-Info'] = JSON.stringify({
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timestamp: Date.now()
        });
    }

    async addUTMParameters(config) {
        // Add UTM parameters from session storage
        const utmData = AppConfig.utils.getSessionStorage('utmData');
        if (utmData && config.method === 'POST') {
            if (typeof config.body === 'object') {
                Object.assign(config.body, utmData);
            }
        }
    }

    // Response interceptors
    async logResponse(response) {
        if (AppConfig.DEBUG.enabled) {
            console.log(`API Response: ${response.status} ${response.url}`);
        }
    }

    // Contact form submission
    async submitContactForm(formData) {
        try {
            const response = await this.client.post(this.client.endpoints.contact, formData);
            
            // Track successful form submission
            if (window.gtag) {
                gtag('event', 'form_submit', {
                    event_category: 'engagement',
                    event_label: 'contact_form'
                });
            }
            
            return response;
        } catch (error) {
            // Track form submission error
            if (window.gtag) {
                gtag('event', 'form_submit_error', {
                    event_category: 'engagement',
                    event_label: 'contact_form',
                    value: error.message
                });
            }
            
            throw error;
        }
    }

    // Newsletter subscription
    async subscribeNewsletter(email, additionalData = {}) {
        const data = {
            email,
            ...additionalData
        };
        
        return this.client.post(this.client.endpoints.newsletter, data);
    }

    // Get campaign data
    async getCampaignData(campaignId) {
        return this.client.get(`${this.client.endpoints.campaign}/${campaignId}`);
    }

    // Analytics event tracking
    async trackEvent(eventData) {
        if (!AppConfig.ANALYTICS.trackEvents) return;
        
        return this.client.post(this.client.endpoints.analytics, eventData);
    }

    // Admin methods
    async adminLogin(credentials) {
        const response = await this.client.post(this.client.endpoints.admin.login, credentials);
        
        // Store authentication token
        if (response.token) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        return response;
    }

    async getDashboardData() {
        return this.client.get(this.client.endpoints.admin.dashboard);
    }

    async exportContacts(format = 'csv') {
        const response = await this.client.get(`${this.client.endpoints.admin.export}?format=${format}`, {
            skipCache: true
        });
        
        // Handle file download
        if (typeof response === 'string') {
            const blob = new Blob([response], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
        
        return response;
    }

    // File upload wrapper
    async uploadFile(file, onProgress) {
        // Validate file
        if (file.size > AppConfig.FORMS.maxFileSize) {
            throw new Error(AppConfig.MESSAGES.errors.fileSize);
        }
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!AppConfig.FORMS.allowedFileTypes.includes(fileExtension)) {
            throw new Error(AppConfig.MESSAGES.errors.fileType);
        }
        
        return this.client.uploadFile(file, { onProgress });
    }

    // Health check
    async healthCheck() {
        try {
            const response = await this.client.get('/health', { timeout: 5000 });
            return { status: 'healthy', ...response };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }
}

// Global API instance
const API = new ApiService();

// Offline support
if ('serviceWorker' in navigator && 'caches' in window) {
    window.addEventListener('online', () => {
        console.log('📶 Back online - syncing queued requests');
        // Implement offline request sync here
    });
    
    window.addEventListener('offline', () => {
        console.log('📵 Gone offline - queueing requests');
        // Implement offline request queueing here
    });
}

// Export API service
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiClient, ApiService, API };
} else {
    window.ApiClient = ApiClient;
    window.ApiService = ApiService;
    window.API = API;
}