import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookRepository } from './webhook.repository';
import { PrismaService } from '../common/prisma.service';
import { StripeService } from 'src/services/stripe.service';
import { PaymentGateway } from './payment.gateway';
import { ZohoUpdateService } from 'src/services/zoho-update.service';
import { ZohoService } from 'src/services/zoho.service';
import { PandaDocService } from 'src/services/panda-doc.service';
import { OnboardingRepository } from 'src/onboarding/onboarding.repository';

@Module({
    imports: [
        HttpModule,
        ConfigModule,
    ],
    controllers: [WebhookController],
    providers: [
        WebhookService,
        WebhookRepository,
        PrismaService,
        StripeService,
        PaymentGateway,
        ZohoUpdateService,
        ZohoService,
        PandaDocService,
        OnboardingRepository
    ],
    exports: [WebhookService],
})
export class WebhookModule {}
