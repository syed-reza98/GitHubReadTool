/**
 * API Validation and Error Handling Module
 * Provides comprehensive validation and error handling for API endpoints
 */

export class APIValidator {
    constructor() {
        this.errorMessages = {
            required: (field) => `${field} is required`,
            minLength: (field, min) => `${field} must be at least ${min} characters long`,
            maxLength: (field, max) => `${field} cannot exceed ${max} characters`,
            email: 'Invalid email format',
            url: 'Invalid URL format',
            phone: 'Invalid phone number format'
        };
    }

    validateResumeGenerationRequest(data) {
        const errors = [];
        
        if (!data.jobTitle || typeof data.jobTitle !== 'string') {
            errors.push(this.errorMessages.required('Job title'));
        } else if (data.jobTitle.trim().length < 2) {
            errors.push(this.errorMessages.minLength('Job title', 2));
        }

        if (!data.jobDescription || typeof data.jobDescription !== 'string') {
            errors.push(this.errorMessages.required('Job description'));
        } else if (data.jobDescription.trim().length < 50) {
            errors.push(this.errorMessages.minLength('Job description', 50));
        } else if (data.jobDescription.length > 5000) {
            errors.push(this.errorMessages.maxLength('Job description', 5000));
        }

        if (data.companyName && data.companyName.length > 200) {
            errors.push(this.errorMessages.maxLength('Company name', 200));
        }

        // Validate user profile if provided
        if (data.userProfile) {
            const profileErrors = this.validateUserProfile(data.userProfile);
            errors.push(...profileErrors);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateUserProfile(profile) {
        const errors = [];

        if (profile.email && !this.isValidEmail(profile.email)) {
            errors.push(this.errorMessages.email);
        }

        if (profile.phone && !this.isValidPhone(profile.phone)) {
            errors.push(this.errorMessages.phone);
        }

        if (profile.linkedin && !this.isValidURL(profile.linkedin)) {
            errors.push('Invalid LinkedIn URL');
        }

        if (profile.github && !this.isValidURL(profile.github)) {
            errors.push('Invalid GitHub URL');
        }

        if (profile.portfolio && !this.isValidURL(profile.portfolio)) {
            errors.push('Invalid portfolio URL');
        }

        return errors;
    }

    validateChatMessage(data) {
        const errors = [];

        if (!data.message || typeof data.message !== 'string') {
            errors.push(this.errorMessages.required('Message'));
        } else if (data.message.trim().length === 0) {
            errors.push('Message cannot be empty');
        } else if (data.message.length > 1000) {
            errors.push(this.errorMessages.maxLength('Message', 1000));
        }

        if (!data.resume || typeof data.resume !== 'object') {
            errors.push('Current resume data is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .slice(0, 5000); // Limit length
    }

    createErrorResponse(errors, statusCode = 400) {
        return {
            success: false,
            error: 'Validation failed',
            details: errors,
            statusCode
        };
    }

    createSuccessResponse(data) {
        return {
            success: true,
            data,
            timestamp: new Date().toISOString()
        };
    }
}

export class ErrorHandler {
    constructor() {
        this.errorTypes = {
            VALIDATION_ERROR: 'VALIDATION_ERROR',
            API_ERROR: 'API_ERROR',
            NETWORK_ERROR: 'NETWORK_ERROR',
            SERVER_ERROR: 'SERVER_ERROR',
            GITHUB_API_ERROR: 'GITHUB_API_ERROR',
            AI_SERVICE_ERROR: 'AI_SERVICE_ERROR'
        };
    }

    handleError(error, context = {}) {
        const errorInfo = this.categorizeError(error);
        const logEntry = this.createLogEntry(errorInfo, context);
        
        // Log error
        console.error('Application Error:', logEntry);
        
        // Return user-friendly error message
        return this.getUserFriendlyMessage(errorInfo);
    }

    categorizeError(error) {
        if (error.name === 'ValidationError') {
            return {
                type: this.errorTypes.VALIDATION_ERROR,
                message: error.message,
                recoverable: true
            };
        }

        if (error.message?.includes('GitHub API')) {
            return {
                type: this.errorTypes.GITHUB_API_ERROR,
                message: error.message,
                recoverable: true
            };
        }

        if (error.message?.includes('AI') || error.message?.includes('Models')) {
            return {
                type: this.errorTypes.AI_SERVICE_ERROR,
                message: error.message,
                recoverable: true
            };
        }

        if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
            return {
                type: this.errorTypes.NETWORK_ERROR,
                message: 'Network connection failed',
                recoverable: true
            };
        }

        if (error.status >= 500) {
            return {
                type: this.errorTypes.SERVER_ERROR,
                message: 'Internal server error',
                recoverable: false
            };
        }

        return {
            type: this.errorTypes.API_ERROR,
            message: error.message || 'An unexpected error occurred',
            recoverable: true
        };
    }

    createLogEntry(errorInfo, context) {
        return {
            timestamp: new Date().toISOString(),
            type: errorInfo.type,
            message: errorInfo.message,
            recoverable: errorInfo.recoverable,
            context,
            stack: context.error?.stack,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location?.href : undefined
        };
    }

    getUserFriendlyMessage(errorInfo) {
        const messages = {
            [this.errorTypes.VALIDATION_ERROR]: {
                title: 'Input Validation Error',
                message: errorInfo.message,
                suggestion: 'Please check your input and try again.'
            },
            [this.errorTypes.GITHUB_API_ERROR]: {
                title: 'GitHub API Error',
                message: 'Unable to fetch data from GitHub.',
                suggestion: 'Please check your GitHub token and try again.'
            },
            [this.errorTypes.AI_SERVICE_ERROR]: {
                title: 'AI Service Error',
                message: 'AI service is temporarily unavailable.',
                suggestion: 'Please try again later or use the offline mode.'
            },
            [this.errorTypes.NETWORK_ERROR]: {
                title: 'Connection Error',
                message: 'Unable to connect to the server.',
                suggestion: 'Please check your internet connection and try again.'
            },
            [this.errorTypes.SERVER_ERROR]: {
                title: 'Server Error',
                message: 'The server encountered an internal error.',
                suggestion: 'Please try again later or contact support.'
            }
        };

        return messages[errorInfo.type] || {
            title: 'Unexpected Error',
            message: 'An unexpected error occurred.',
            suggestion: 'Please try again or contact support if the problem persists.'
        };
    }

    async reportError(error, context = {}) {
        try {
            // In a real application, this would send error reports to a logging service
            const errorReport = {
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                },
                context,
                timestamp: new Date().toISOString(),
                version: '0.3.0'
            };

            // For now, just log to console
            console.warn('Error Report Generated:', errorReport);
            
            // Could send to logging service like Sentry, LogRocket, etc.
            // await fetch('/api/errors', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(errorReport)
            // });
            
        } catch (reportingError) {
            console.error('Failed to report error:', reportingError);
        }
    }
}

export class HealthChecker {
    constructor() {
        this.checks = [
            { name: 'Server', url: '/api/health', timeout: 5000 },
            { name: 'GitHub API', url: '/api/health/github', timeout: 10000 },
            { name: 'AI Service', url: '/api/health/ai', timeout: 15000 }
        ];
    }

    async performHealthChecks() {
        const results = await Promise.allSettled(
            this.checks.map(check => this.performSingleCheck(check))
        );

        const healthStatus = {
            overall: 'healthy',
            timestamp: new Date().toISOString(),
            services: {}
        };

        results.forEach((result, index) => {
            const checkName = this.checks[index].name;
            
            if (result.status === 'fulfilled') {
                healthStatus.services[checkName] = {
                    status: 'healthy',
                    responseTime: result.value.responseTime,
                    details: result.value.details
                };
            } else {
                healthStatus.services[checkName] = {
                    status: 'unhealthy',
                    error: result.reason.message,
                    responseTime: null
                };
                healthStatus.overall = 'degraded';
            }
        });

        return healthStatus;
    }

    async performSingleCheck(check) {
        const startTime = Date.now();
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), check.timeout);
            
            const response = await fetch(check.url, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
            
            clearTimeout(timeoutId);
            
            const responseTime = Date.now() - startTime;
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const details = await response.json();
            
            return {
                responseTime,
                details
            };
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(`Timeout after ${check.timeout}ms`);
            }
            throw error;
        }
    }

    async checkDependencies() {
        const dependencies = {
            localStorage: typeof localStorage !== 'undefined',
            fetch: typeof fetch !== 'undefined',
            WebSocket: typeof WebSocket !== 'undefined',
            indexedDB: typeof indexedDB !== 'undefined'
        };

        const missing = Object.entries(dependencies)
            .filter(([name, available]) => !available)
            .map(([name]) => name);

        return {
            allAvailable: missing.length === 0,
            available: dependencies,
            missing
        };
    }
}

// Rate limiting utility
export class RateLimiter {
    constructor() {
        this.limits = new Map();
        this.defaultLimit = { requests: 100, windowMs: 60000 }; // 100 requests per minute
    }

    setLimit(key, requests, windowMs) {
        this.limits.set(key, { requests, windowMs });
    }

    checkLimit(key) {
        const limit = this.limits.get(key) || this.defaultLimit;
        const now = Date.now();
        const windowStart = now - limit.windowMs;
        
        // Get or create request history
        if (!this.requestHistory) {
            this.requestHistory = new Map();
        }
        
        const requests = this.requestHistory.get(key) || [];
        
        // Remove old requests
        const validRequests = requests.filter(time => time > windowStart);
        
        // Check if limit exceeded
        if (validRequests.length >= limit.requests) {
            return {
                allowed: false,
                retryAfter: Math.ceil((validRequests[0] - windowStart) / 1000)
            };
        }
        
        // Add current request
        validRequests.push(now);
        this.requestHistory.set(key, validRequests);
        
        return {
            allowed: true,
            remaining: limit.requests - validRequests.length
        };
    }
}