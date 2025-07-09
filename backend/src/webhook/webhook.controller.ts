import { 
    Controller, 
    Logger, 
    Post, 
    Body, 
    Headers, 
    HttpStatus, 
    HttpException 
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CalendlyWebhookPayload } from './dto';

@Controller('api/webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(private webhookService: WebhookService) {}

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
}
