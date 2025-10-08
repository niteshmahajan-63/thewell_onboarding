import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
    Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SlackService, ErrorInfo } from './slack.service';

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    constructor(private readonly slackService: SlackService) {}

    async catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: string;
        let stack: string | undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message = typeof exceptionResponse === 'string' 
                ? exceptionResponse 
                : (exceptionResponse as any).message || exception.message;
            stack = exception.stack;
        } else if (exception instanceof Error) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = exception.message;
            stack = exception.stack;
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'An unexpected error occurred';
            stack = undefined;
        }

        const errorInfo: ErrorInfo = {
            errorMessage: message,
            statusCode: status,
            endpoint: request.url,
            method: request.method,
            stackTrace: stack,
            timestamp: new Date().toISOString(),
        };

        if (status >= 500 || this.isCriticalError(status, message)) {
            try {
                await this.slackService.sendErrorAlert(errorInfo);
            } catch (slackError) {
                this.logger.error('Failed to send Slack notification', slackError);
            }
        }

        const errorResponse = {
            statusCode: status,
            message: this.getSafeErrorMessage(status, message)
        };

        response.status(status).json(errorResponse);
    }

    private isCriticalError(status: number, message: string): boolean {
        const criticalPatterns = [
            /payment.*failed/i,
            /stripe.*error/i,
            /zoho.*error/i,
            /database.*connection/i,
            /authentication.*failed/i,
            /authorization.*failed/i,
        ];

        if (status === 401) {
            return criticalPatterns.some(pattern => pattern.test(message));
        }

        if (status === 403) {
            return criticalPatterns.some(pattern => pattern.test(message));
        }

        if (status === 404 && /payment|invoice|client|record/i.test(message)) {
            return true;
        }

        return false;
    }

    private getSafeErrorMessage(status: number, message: string): string {
        if (process.env.NODE_ENV === 'production') {
            if (status >= 500) {
                return 'An internal server error occurred. Please try again later.';
            }

            const sanitizedMessage = message
                .replace(/password/gi, '[REDACTED]')
                .replace(/token/gi, '[REDACTED]')
                .replace(/key/gi, '[REDACTED]')
                .replace(/secret/gi, '[REDACTED]');
            
            return sanitizedMessage;
        }

        return message;
    }
}