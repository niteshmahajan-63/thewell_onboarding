import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { CalendlyWebhookPayload } from './dto/calendly.dto';
import { WebhookRepository } from './webhook.repository';
import Stripe from 'stripe';
import { StripeService } from '../services/stripe.service';

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);
    private readonly calendlyWebhookSecret: string;
    private readonly stripeWebhookSecret: string;
    private readonly stripeApiKey: string;

    constructor(
        private configService: ConfigService,
        private webhookRepository: WebhookRepository,
        private stripeService: StripeService
    ) {
        // Initialize Calendly webhook secret
        this.calendlyWebhookSecret = this.configService.get<string>('CALENDLY_WEBHOOK_SIGNING_KEY');
        if (!this.calendlyWebhookSecret) {
            this.logger.warn('CALENDLY_WEBHOOK_SIGNING_KEY is not set in environment variables');
        }

        // Initialize Stripe webhook secret
        this.stripeWebhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SIGNING_KEY');
        if (!this.stripeWebhookSecret) {
            this.logger.warn('STRIPE_WEBHOOK_SIGNING_KEY is not set in environment variables');
        }

        // Initialize Stripe API key
        this.stripeApiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!this.stripeApiKey) {
            this.logger.warn('STRIPE_SECRET_KEY is not set in environment variables');
        }
    }

    /**
     * Validates a Calendly webhook signature
     * @param signatureHeader The signature header from Calendly
     * @param body The webhook payload as a JSON string
     * @returns Whether the signature is valid
     */
    async validateCalendlySignature(signatureHeader: string, body: string): Promise<boolean> {
        if (!this.calendlyWebhookSecret) {
            this.logger.error('Cannot validate signature: CALENDLY_WEBHOOK_SIGNING_KEY is not set');
            return false;
        }

        if (!signatureHeader) {
            this.logger.warn('Missing Calendly webhook signature header');
            return false;
        }

        try {
            const signatureParts = {};
            signatureHeader.split(',').forEach(part => {
                const [key, value] = part.split('=');
                signatureParts[key] = value;
            });

            const timestamp = signatureParts['t'];
            const signature = signatureParts['v1'];

            if (!timestamp || !signature) {
                this.logger.warn('Invalid signature format from Calendly');
                return false;
            }

            const hmac = createHmac('sha256', this.calendlyWebhookSecret);
            const data = timestamp + '.' + body;
            hmac.update(data);
            const calculatedSignature = hmac.digest('hex');

            return timingSafeEqual(
                Buffer.from(calculatedSignature, 'hex'),
                Buffer.from(signature, 'hex')
            );
        } catch (error) {
            this.logger.error(`Error validating Calendly signature: ${error.message}`);
            return false;
        }
    }

    /**
     * Handle Calendly webhook event
     * @param payload The webhook payload from Calendly
     * @returns Response based on event type
     */
    async handleCalendlyEvent(payload: CalendlyWebhookPayload) {
        const eventType = payload?.event;

        switch (eventType) {
            case 'invitee.created':
                // Check if utm_content exists (which contains zohoRecordId)
                console.log(payload);
                const zohoRecordId = payload.payload.tracking?.utm_content;

                if (!zohoRecordId) {
                    this.logger.warn('Missing zohoRecordId (utm_content) in Calendly payload');
                    return {
                        message: 'Cannot process Calendly event: missing zohoRecordId',
                        success: false
                    };
                }

                await this.webhookRepository.storeCalendlyBooking(zohoRecordId, payload.payload);

                return {
                    message: 'Calendly invitee.created event processed successfully',
                    success: true
                };

            default:
                this.logger.log(`Received unhandled Calendly event type: ${eventType}`);
                return {
                    message: 'Event received but not processed - event type not supported',
                    success: true
                };
        }
    }

    async validateStripeSignature(signature: string, body: string | Buffer): Promise<Stripe.Event | boolean> {
        if (!this.stripeWebhookSecret) {
            this.logger.error('Cannot validate Stripe signature: STRIPE_WEBHOOK_SIGNING_KEY is not set');
            return false;
        }

        if (!this.stripeApiKey) {
            this.logger.error('Cannot validate Stripe signature: STRIPE_SECRET_KEY is not set');
            return false;
        }

        if (!signature) {
            this.logger.warn('Missing Stripe webhook signature header');
            return false;
        }

        try {
            const stripe = new Stripe(this.stripeApiKey);

            const event = stripe.webhooks.constructEvent(
                body,
                signature,
                this.stripeWebhookSecret
            );

            this.logger.log(`Stripe signature verification succeeded for event: ${event.type}`);
            return event;
        } catch (error) {
            this.logger.error(`Error validating Stripe signature: ${error.message}`);
            // Log more details for debugging
            this.logger.debug(`Body type: ${typeof body}`);
            this.logger.debug(`Body length: ${body ? body.length : 0}`);
            return false;
        }
    }

    async handleStripeEvent(event: Stripe.Event) {
        const eventType = event.type;

        switch (eventType) {
            case 'payment_intent.succeeded':
                try {
                    this.logger.log('Stripe payment intent succeeded');
                    
                    const paymentIntent = event.data.object as Stripe.PaymentIntent;

                    // PaymentIntent does not have 'invoice' property
                    // If you need to link to an invoice, you must handle 'invoice.payment_succeeded' event instead

                    await this.webhookRepository.storeStripePayment({
                        zohoRecordId: paymentIntent.metadata?.recordId,
                        customerId: paymentIntent.customer,
                        paymentDate: new Date(paymentIntent.created * 1000),
                        paymentStatus: paymentIntent.status,
                        paymentId: paymentIntent.id,
                        payment: 'Setup Fee',
                        amount: paymentIntent.amount ? paymentIntent.amount / 100 : 0,
                        paymentSource: 'Credit Card/Debit Card',
                        invoiceId: null,
                        hostedInvoiceUrl: null,
                        createdAt: new Date(paymentIntent.created * 1000),
                        updatedAt: new Date()
                    });

                    return {
                        message: 'Stripe payment_intent.succeeded event processed successfully',
                        success: true
                    };
                } catch (error) {
                    this.logger.error(`Error processing Stripe payment intent: ${error.message}`);
                    if (event?.data?.object) {
                        this.logger.debug(`PaymentIntent ID: ${(event.data.object as any).id || 'unknown'}`);
                    }

                    return {
                        message: `Failed to process Stripe payment intent: ${error.message}`,
                        success: false
                    };
                }
            default:
                this.logger.log(`Received unhandled Stripe event type: ${eventType}`);
                return {
                    message: 'Event received but not processed - event type not supported',
                    success: true
                };
        }
    }
}
