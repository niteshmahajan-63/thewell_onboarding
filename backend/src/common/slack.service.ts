import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface ErrorInfo {
    errorMessage: string;
    statusCode?: number;
    endpoint?: string;
    method?: string;
    stackTrace?: string;
    timestamp?: string;
    recordId?: string;
}

export interface FrontendErrorContext {
    component?: string;
    page?: string;
    userAction?: string;
    browserInfo?: string;
    errorType?: string;
    severity?: string;
    additionalContext?: Record<string, any>;
}

@Injectable()
export class SlackService {
    private readonly webhookUrl = process.env.SLACK_WEBHOOK_URL;
    private readonly logger = new Logger(SlackService.name);

    async sendMessage(message?: string) {
        if (!this.webhookUrl) {
            this.logger.error('SLACK_WEBHOOK_URL not set');
            return;
        }

        try {
            await axios.post(this.webhookUrl, {
                text: message || 'Notification from Onboarding API'
            });
        } catch (error) {
            this.logger.error('Failed to send message to Slack', error.message);
        }
    }

    async sendErrorAlert(errorInfo: ErrorInfo) {
        if (!this.webhookUrl) {
            this.logger.error('SLACK_WEBHOOK_URL not set');
            return;
        }

        const {
            errorMessage,
            statusCode = 500,
            endpoint = 'Unknown',
            method = 'Unknown',
            stackTrace,
            timestamp = new Date().toISOString(),
            recordId
        } = errorInfo;

        try {
            const blocks: any[] = [
                {
                    type: "header",
                    text: { type: "plain_text", text: "🚨 Error Alert", emoji: true }
                },
                {
                    type: "section",
                    fields: [
                        { type: "mrkdwn", text: `*Portal:*\nOnboarding Backend` },
                        { type: "mrkdwn", text: `*Status:*\n${statusCode} ${this.getStatusText(statusCode)}` },
                        { type: "mrkdwn", text: `*Endpoint:*\n${method} ${endpoint}` },
                        { type: "mrkdwn", text: `*Timestamp:*\n${timestamp}` }
                    ]
                },
                {
                    type: "section",
                    text: { type: "mrkdwn", text: `*Error Message:*\n\`\`\`${errorMessage}\`\`\`` }
                }
            ];

            if (recordId) {
                blocks[1].fields.push({ type: "mrkdwn", text: `*Record ID:*\n${recordId}` });
            }

            if (stackTrace) {
                blocks.push({
                    type: "section",
                    text: { type: "mrkdwn", text: `*Stack Trace:*\n\`\`\`${stackTrace.substring(0, 500)}${stackTrace.length > 500 ? '...' : ''}\`\`\`` }
                });
            }

            blocks.push({ type: "divider" });

            await axios.post(this.webhookUrl, { blocks });

        } catch (error) {
            this.logger.error('Failed to send error alert to Slack', error.message);
        }
    }

    async sendFrontendErrorAlert(errorInfo: ErrorInfo, frontendContext: FrontendErrorContext) {
        if (!this.webhookUrl) {
            this.logger.error('SLACK_WEBHOOK_URL not set');
            return;
        }

        const {
            errorMessage,
            stackTrace,
            timestamp = new Date().toISOString(),
            recordId
        } = errorInfo;

        const {
            component,
            page,
            userAction,
            browserInfo,
            errorType,
            severity = 'medium',
            additionalContext
        } = frontendContext;

        try {
            const severityEmoji = this.getSeverityEmoji(severity);
            const blocks: any[] = [
                {
                    type: "header",
                    text: { type: "plain_text", text: `${severityEmoji} Frontend Error Alert`, emoji: true }
                },
                {
                    type: "section",
                    fields: [
                        { type: "mrkdwn", text: `*Portal:*\nOnboarding Frontend` },
                        { type: "mrkdwn", text: `*Severity:*\n${severity.toUpperCase()}` },
                        { type: "mrkdwn", text: `*Error Type:*\n${errorType || 'Unknown'}` },
                        { type: "mrkdwn", text: `*Timestamp:*\n${timestamp}` }
                    ]
                },
                {
                    type: "section",
                    text: { type: "mrkdwn", text: `*Error Message:*\n\`\`\`${errorMessage}\`\`\`` }
                }
            ];

            const frontendFields: any[] = [];
            if (page) frontendFields.push({ type: "mrkdwn", text: `*Page:*\n${page}` });
            if (component) frontendFields.push({ type: "mrkdwn", text: `*Component:*\n${component}` });
            if (userAction) frontendFields.push({ type: "mrkdwn", text: `*User Action:*\n${userAction}` });
            if (browserInfo) frontendFields.push({ type: "mrkdwn", text: `*Browser:*\n${browserInfo}` });

            if (frontendFields.length > 0) {
                blocks.push({
                    type: "section",
                    fields: frontendFields
                });
            }

            if (recordId) {
                const userFields: any[] = [];
                if (recordId) userFields.push({ type: "mrkdwn", text: `*Record ID:*\n${recordId}` });
                
                blocks.push({
                    type: "section",
                    fields: userFields
                });
            }

            if (stackTrace) {
                blocks.push({
                    type: "section",
                    text: { type: "mrkdwn", text: `*Stack Trace:*\n\`\`\`${stackTrace.substring(0, 800)}${stackTrace.length > 800 ? '...' : ''}\`\`\`` }
                });
            }

            if (additionalContext && Object.keys(additionalContext).length > 0) {
                const contextString = JSON.stringify(additionalContext, null, 2);
                blocks.push({
                    type: "section",
                    text: { type: "mrkdwn", text: `*Additional Context:*\n\`\`\`${contextString.substring(0, 500)}${contextString.length > 500 ? '...' : ''}\`\`\`` }
                });
            }

            blocks.push({ type: "divider" });

            await axios.post(this.webhookUrl, { blocks });

        } catch (error) {
            this.logger.error('Failed to send frontend error alert to Slack', error.message);
        }
    }

    private getSeverityEmoji(severity: string): string {
        switch (severity.toLowerCase()) {
            case 'critical': return '🔥';
            case 'high': return '🚨';
            case 'medium': return '⚠️';
            case 'low': return 'ℹ️';
            default: return '⚠️';
        }
    }

    private getStatusText(statusCode: number): string {
        const statusTexts: { [key: number]: string } = {
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            500: 'Internal Server Error',
            502: 'Bad Gateway',
            503: 'Service Unavailable'
        };
        return statusTexts[statusCode] || 'Error';
    }
}
