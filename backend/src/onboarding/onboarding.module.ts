import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingRepository } from './onboarding.repository';
import { zohoConfig } from '../config/zoho.config';
import { PrismaService } from '../common/prisma.service';
import { StripeService } from '../services/stripe.service';
import { PandaDocService } from '../services/panda-doc.service';
import { ZohoService } from '../services/zoho.service';
import { SlackService } from 'src/common/slack.service';

@Module({
    imports: [
        HttpModule,
        ConfigModule.forFeature(zohoConfig),
    ],
    controllers: [OnboardingController],
    providers: [
        OnboardingService,
        OnboardingRepository,
        PrismaService,
        StripeService,
        PandaDocService,
        ZohoService,
        SlackService
    ],
    exports: [OnboardingService],
})
export class OnboardingModule { }
