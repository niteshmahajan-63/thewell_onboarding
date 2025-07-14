import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookRepository } from './webhook.repository';
import { PrismaService } from '../common/prisma.service';
import { StripeService } from 'src/services/stripe.service';

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
        StripeService
    ],
    exports: [WebhookService],
})
export class WebhookModule {}
