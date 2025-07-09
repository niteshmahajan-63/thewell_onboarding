import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { CalendlyInviteeData, CalendlyWebhookPayload } from './dto/calendly.dto';
import { WebhookRepository } from './webhook.repository';

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);
    private readonly calendlyWebhookSecret: string;

    constructor(
        private configService: ConfigService,
        private webhookRepository: WebhookRepository
    ) {
        this.calendlyWebhookSecret = this.configService.get<string>('WEBHOOK_SIGNING_KEY');
        if (!this.calendlyWebhookSecret) {
            this.logger.warn('WEBHOOK_SIGNING_KEY is not set in environment variables');
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
            this.logger.error('Cannot validate signature: WEBHOOK_SIGNING_KEY is not set');
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
}
