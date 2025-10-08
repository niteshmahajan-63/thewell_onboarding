import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { SlackService } from './common/slack.service';
import * as express from 'express';

async function bootstrap() {
	const logger = new Logger('Bootstrap');
	const app = await NestFactory.create(AppModule);

	app.use('/api/webhook/stripe', express.raw({ 
		type: 'application/json',
		limit: '10mb'
	}));

	app.use(express.json({ limit: '10mb' }));
	app.use(express.urlencoded({ extended: true, limit: '10mb' }));

	app.enableCors({
		origin: [
			"http://localhost:8080",
			"https://onboarding.thewell.solutions"
		],
		credentials: true,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
		}),
	);

	const slackService = app.get(SlackService);
	app.useGlobalFilters(new GlobalExceptionFilter(slackService));

	const port = process.env.PORT || 5000;
	await app.listen(port);
	logger.log(`Application started successfully on port ${port}`);
}

bootstrap().catch((err) => {
	console.error('Error starting application:', err);
});
