import { Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingRepository } from './onboarding.repository';
import { zohoConfig } from '../config/zoho.config';
import { PrismaService } from '../common/prisma.service';
import { StripeService } from '../services/stripe.service';
import { PandaDocService } from '../services/panda-doc.service';
import { ZohoService } from '../services/zoho.service';

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
        {
            provide: ZohoService,
            useFactory: (
                configService: ConfigService,
                httpService: HttpService,
            ) => {
                return new ZohoService('onboarding', configService, httpService);
            },
        },
    ],
    exports: [OnboardingService, ZohoService],
})
export class OnboardingModule { }
