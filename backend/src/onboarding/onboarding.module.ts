import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { ZohoService } from './zoho.service';
import { zohoConfig } from 'src/config/zoho.config';
import { PrismaService } from '../common/prisma.service';
import { StripeService } from './stripe.service';

@Module({
    imports: [
        HttpModule,
        ConfigModule.forFeature(zohoConfig),
    ],
    controllers: [OnboardingController],
    providers: [OnboardingService, ZohoService, PrismaService, StripeService],
    exports: [OnboardingService],
})
export class OnboardingModule { }
