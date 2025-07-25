import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookRepository } from './webhook.repository';
import { PrismaService } from '../common/prisma.service';
import { StripeService } from 'src/services/stripe.service';
import { PaymentGateway } from './payment.gateway';

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
        PaymentGateway
    ],
    exports: [WebhookService],
})
export class WebhookModule {}
