import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookRepository } from './webhook.repository';
import { PrismaService } from '../common/prisma.service';

@Module({
    imports: [
        HttpModule,
        ConfigModule,
    ],
    controllers: [WebhookController],
    providers: [
        WebhookService,
        WebhookRepository,
        PrismaService
    ],
    exports: [WebhookService],
})
export class WebhookModule {}
