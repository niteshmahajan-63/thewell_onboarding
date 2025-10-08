import api from './api';

export interface FrontendErrorReport {
    message?: string;

    errorMessage?: string;
    component?: string;
    page?: string;
    userAction?: string;
    errorStack?: string;
    browserInfo?: string;
    recordId?: string;
    errorType?: 'javascript' | 'api' | 'network' | 'validation' | 'general';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    additionalContext?: Record<string, any>;
}

export interface ErrorContext {
    component?: string;
    userAction?: string;
    errorType?: 'javascript' | 'api' | 'network' | 'validation' | 'general';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    additionalContext?: Record<string, any>;
}

class ErrorReportingService {
    private recordId?: string;

    private static errorCount = 0;
    private static lastErrorTime = 0;
    private static isCircuitOpen = false;
    private static readonly MAX_ERRORS_PER_MINUTE = 5;
    private static readonly CIRCUIT_BREAKER_TIMEOUT = 60000;
    private static readonly ERROR_REPORTING_TIMEOUT = 5000;
    
    constructor() {
        this.initializeRecordId();
    }

    private initializeRecordId(): void {
        this.recordId = undefined;
    }

    setRecordId(recordId: string): void {
        this.recordId = recordId;
    }

    private checkCircuitBreaker(): boolean {
        const now = Date.now();

        if (ErrorReportingService.isCircuitOpen && 
            now - ErrorReportingService.lastErrorTime > ErrorReportingService.CIRCUIT_BREAKER_TIMEOUT) {
            ErrorReportingService.isCircuitOpen = false;
            ErrorReportingService.errorCount = 0;
        }

        if (now - ErrorReportingService.lastErrorTime > ErrorReportingService.CIRCUIT_BREAKER_TIMEOUT) {
            ErrorReportingService.errorCount = 0;
        }

        if (ErrorReportingService.isCircuitOpen) {
            console.warn('Error reporting circuit breaker is OPEN - skipping error report');
            return false;
        }

        if (ErrorReportingService.errorCount >= ErrorReportingService.MAX_ERRORS_PER_MINUTE) {
            console.warn('Too many errors reported - opening circuit breaker');
            ErrorReportingService.isCircuitOpen = true;
            ErrorReportingService.lastErrorTime = now;
            return false;
        }

        return true;
    }

    private recordErrorAttempt(): void {
        ErrorReportingService.errorCount++;
        ErrorReportingService.lastErrorTime = Date.now();
    }

    private getBrowserInfo(): string {
        const { userAgent } = navigator;
        return `${navigator.platform} | ${userAgent.split(' ').slice(0, 3).join(' ')}`;
    }

    private truncateString(str: string, maxLength: number = 1000): string {
        if (!str) return str;
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    }

    private sanitizeAdditionalContext(context: Record<string, any>): Record<string, any> {
        const sanitized: Record<string, any> = {};
        
        for (const [key, value] of Object.entries(context)) {
            if (value === null || value === undefined) continue;
            
            if (typeof value === 'string') {
                sanitized[key] = this.truncateString(value, 200);
            } else if (typeof value === 'object') {
                sanitized[key] = this.truncateString(JSON.stringify(value), 200);
            } else {
                sanitized[key] = value;
            }
        }
        
        return sanitized;
    }

    async reportError(error: Error, context: ErrorContext = {}): Promise<void> {
        if (!this.checkCircuitBreaker()) return;

        try {
            this.recordErrorAttempt();

            const errorReport: FrontendErrorReport = {
                errorMessage: this.truncateString(error.message, 500),
                component: context.component,
                page: window.location.pathname,
                userAction: context.userAction,
                errorStack: this.truncateString(error.stack || '', 800),
                browserInfo: this.getBrowserInfo(),
                recordId: this.recordId,
                errorType: context.errorType || 'javascript',
                severity: context.severity || this.determineSeverity(error, context),
                additionalContext: this.sanitizeAdditionalContext({
                    ...context.additionalContext,
                    url: window.location.href,
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    circuitBreakerStatus: 'closed'
                })
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), ErrorReportingService.ERROR_REPORTING_TIMEOUT);

            await api.post('/onboarding/send-slack-message', errorReport, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);
        } catch (reportError) {
            console.error('Failed to report error to Slack:', reportError);
        }
    }

    async reportApiError(
        error: any, 
        requestConfig: any, 
        context: ErrorContext = {}
    ): Promise<void> {
        if (!this.checkCircuitBreaker()) return;

        try {
            this.recordErrorAttempt();

            const errorMessage = error.response?.data?.message || 
                               error.message || 
                               'API request failed';
            
            const errorReport: FrontendErrorReport = {
                errorMessage: this.truncateString(errorMessage, 500),
                component: context.component,
                page: window.location.pathname,
                userAction: context.userAction || 'API request',
                errorStack: this.truncateString(error.stack || '', 800),
                browserInfo: this.getBrowserInfo(),
                recordId: this.recordId,
                errorType: 'api',
                severity: context.severity || this.determineApiErrorSeverity(error),
                additionalContext: this.sanitizeAdditionalContext({
                    ...context.additionalContext,
                    statusCode: error.response?.status,
                    method: requestConfig?.method?.toUpperCase(),
                    endpoint: requestConfig?.url?.split('?')[0],
                    hasRequestData: !!requestConfig?.data,
                    hasResponseData: !!error.response?.data
                })
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), ErrorReportingService.ERROR_REPORTING_TIMEOUT);

            await api.post('/onboarding/send-slack-message', errorReport, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);
        } catch (reportError) {
            console.error('Failed to report API error to Slack:', reportError);
        }
    }

    private determineSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
        if (error.message.toLowerCase().includes('payment') ||
            error.message.toLowerCase().includes('stripe') ||
            context.component?.toLowerCase().includes('payment')) {
            return 'critical';
        }

        if (error.name === 'TypeError' ||
            error.name === 'ReferenceError' ||
            error.message.toLowerCase().includes('network') ||
            error.message.toLowerCase().includes('failed to fetch')) {
            return 'high';
        }

        return 'medium';
    }

    private determineApiErrorSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
        const status = error.response?.status;
        
        if (!status) return 'high';
        
        if (status >= 500) return 'critical';
        if (status === 429) return 'medium';
        if (status >= 400) return 'high';
        
        return 'medium';
    }
}

export const errorReportingService = new ErrorReportingService();

export default ErrorReportingService;