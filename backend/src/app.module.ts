import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OnboardingModule } from './onboarding/onboarding.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		OnboardingModule,
		WebhookModule,
	],
})
export class AppModule { }
