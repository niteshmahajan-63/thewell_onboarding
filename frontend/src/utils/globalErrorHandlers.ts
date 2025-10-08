import { errorReportingService } from '../services/errorReportingService';

export function initializeGlobalErrorHandlers(): void {
    window.addEventListener('error', (event) => {
        const error = event.error || new Error(event.message);
        
        errorReportingService.reportError(error, {
            component: 'GlobalErrorHandler',
            userAction: 'Unknown (uncaught error)',
            errorType: 'javascript',
            severity: 'high',
            additionalContext: {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                source: 'window.onerror',
                userAgent: navigator.userAgent
            }
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason instanceof Error 
            ? event.reason 
            : new Error(String(event.reason));

        errorReportingService.reportError(error, {
            component: 'GlobalErrorHandler',
            userAction: 'Promise rejection',
            errorType: 'javascript',
            severity: 'high',
            additionalContext: {
                reason: event.reason,
                source: 'unhandledrejection',
                promise: event.promise
            }
        });
    });

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);

            if (!response.ok) {
                const error = new Error(`HTTP Error: ${response.status} ${response.statusText}`);
                
                errorReportingService.reportApiError(
                    {
                        response: {
                            status: response.status,
                            statusText: response.statusText,
                            url: response.url
                        },
                        message: error.message
                    },
                    {
                        method: args[1]?.method || 'GET',
                        url: typeof args[0] === 'string' ? args[0] : (args[0] as Request).url || args[0].toString(),
                        data: args[1]?.body
                    },
                    {
                        component: 'GlobalFetchHandler',
                        userAction: 'API request via fetch',
                        errorType: 'api'
                    }
                );
            }
            
            return response;
        } catch (networkError) {
            errorReportingService.reportApiError(
                networkError,
                {
                    method: args[1]?.method || 'GET',
                    url: typeof args[0] === 'string' ? args[0] : (args[0] as Request).url || args[0].toString(),
                    data: args[1]?.body
                },
                {
                    component: 'GlobalFetchHandler',
                    userAction: 'API request via fetch',
                    errorType: 'network',
                    severity: 'high'
                }
            );
            
            throw networkError;
        }
    };

    console.log('Global error handlers initialized');
}