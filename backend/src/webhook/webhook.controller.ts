import {
    Controller,
    Logger,
    Post,
    Body,
    Headers,
    HttpStatus,
    HttpException,
    Req
} from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { CalendlyWebhookPayload } from './dto';
import Stripe from 'stripe';

@Controller('api/webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(private webhookService: WebhookService) { }

    /**
     * Handle incoming Calendly webhooks
     * @param payload The webhook payload from Calendly
     * @param signature The signature header from Calendly
     * @returns Response indicating success or failure
     */
    @Post('calendly')
    async calendlyWebhook(
        @Body() payload: CalendlyWebhookPayload,
        @Headers('Calendly-Webhook-Signature') signature: string,
    ) {
        if (!signature) {
            this.logger.warn('Missing Calendly webhook signature');
            throw new HttpException('Invalid webhook signature', HttpStatus.UNAUTHORIZED);
        }

        const isValid = await this.webhookService.validateCalendlySignature(
            signature,
            JSON.stringify(payload)
        );

        if (!isValid) {
            this.logger.warn('Invalid Calendly webhook signature');
            throw new HttpException('Invalid webhook signature - verification failed', HttpStatus.UNAUTHORIZED);
        }

        try {
            return await this.webhookService.handleCalendlyEvent(payload);
        } catch (error) {
            this.logger.error(`Error processing Calendly webhook: ${error.message}`);
            throw new HttpException('Error processing webhook', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('stripe')
    async stripeWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() request: Request,
    ) {
        if (!signature) {
            this.logger.warn('Missing Stripe webhook signature');
            throw new HttpException('Invalid webhook signature', HttpStatus.UNAUTHORIZED);
        }
        
        // With route-specific express.raw, the raw body is available directly in request.body
        // for the /api/webhook/stripe endpoint
        const rawBody = request.body;

        if (!rawBody) {
            this.logger.error('Could not access raw request body for Stripe signature verification');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const result = await this.webhookService.validateStripeSignature(
            signature,
            rawBody
        );

        if (result === false) {
            this.logger.warn('Invalid Stripe webhook signature');
            throw new HttpException('Invalid webhook signature - verification failed', HttpStatus.UNAUTHORIZED);
        }

        try {
            return await this.webhookService.handleStripeEvent(result as Stripe.Event);
        } catch (error) {
            this.logger.error(`Error processing Stripe webhook: ${error.message}`);
            throw new HttpException('Error processing webhook', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
