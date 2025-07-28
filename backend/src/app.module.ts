import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OnboardingModule } from './onboarding/onboarding.module';
import { WebhookModule } from './webhook/webhook.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		OnboardingModule,
		WebhookModule,
		CheckoutModule,
	],
})
export class AppModule { }
