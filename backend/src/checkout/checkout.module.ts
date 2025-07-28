import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { ZohoService } from 'src/services/zoho.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Module({
	controllers: [CheckoutController],
	providers: [
		CheckoutService,
		{
			provide: ZohoService,
			useFactory: (
				configService: ConfigService,
				httpService: HttpService,
			) => {
				return new ZohoService('checkout', configService, httpService);
			},
		},
	],
	exports: [CheckoutService, ZohoService],
})
export class CheckoutModule { }
