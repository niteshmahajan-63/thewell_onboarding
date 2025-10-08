import React, { Component, type ReactNode } from 'react';
import { errorReportingService } from '../services/errorReportingService';
import Header from './Header';
import Footer from './Footer';

interface Props {
    children: ReactNode;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
    reportingFailed: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    private static errorReportingAttempts = 0;
    private static lastErrorTime = 0;
    private static readonly MAX_REPORTING_ATTEMPTS = 3;
    private static readonly ERROR_REPORTING_COOLDOWN = 30000;

    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            reportingFailed: false
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            reportingFailed: false
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({ error, errorInfo });

        if (this.shouldReportError()) {
            this.reportErrorSafely(error, errorInfo);
        } else {
            console.warn('Skipping error reporting due to rate limiting or previous failures');
            this.setState({ reportingFailed: true });
        }
    }

    private shouldReportError(): boolean {
        const now = Date.now();

        if (now - ErrorBoundary.lastErrorTime > ErrorBoundary.ERROR_REPORTING_COOLDOWN) {
            ErrorBoundary.errorReportingAttempts = 0;
        }

        if (ErrorBoundary.errorReportingAttempts >= ErrorBoundary.MAX_REPORTING_ATTEMPTS) {
            return false;
        }

        return true;
    }

    private async reportErrorSafely(error: Error, errorInfo: React.ErrorInfo) {
        try {
            ErrorBoundary.errorReportingAttempts++;
            ErrorBoundary.lastErrorTime = Date.now();

            const reportingPromise = errorReportingService.reportError(error, {
                component: this.props.componentName || 'ErrorBoundary',
                userAction: 'Component rendering/lifecycle',
                errorType: 'javascript',
                severity: 'high',
                additionalContext: {
                    componentStack: errorInfo.componentStack?.substring(0, 500),
                    errorBoundary: true,
                    reportingAttempt: ErrorBoundary.errorReportingAttempts
                }
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Error reporting timeout')), 5000)
            );

            await Promise.race([reportingPromise, timeoutPromise]);

            console.log('Error successfully reported to backend');
        } catch (reportingError) {
            console.error('Failed to report error to backend:', reportingError);
            this.setState({ reportingFailed: true });
        }
    }

    private handleReload = () => {
        ErrorBoundary.errorReportingAttempts = 0;
        ErrorBoundary.lastErrorTime = 0;

        window.location.reload();
    };

    private handleRetry = () => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            reportingFailed: false
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <>
                    <Header />
                    <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        margin: '20px'
                    }}>
                        <h2 style={{ color: '#dc3545' }}>
                            Oops! Something went wrong
                        </h2>
                        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                            An error occurred in the {this.props.componentName || 'application'}.
                            {this.state.reportingFailed && (
                                <><br /><small style={{ color: '#ffc107' }}>
                                    Error reporting is temporarily unavailable
                                </small></>
                            )}
                        </p>

                        <div style={{ marginBottom: '20px' }}>
                            <button
                                onClick={this.handleRetry}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    marginRight: '10px'
                                }}
                            >
                                Try Again
                            </button>

                            <button
                                onClick={this.handleReload}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                    <Footer />
                </>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;