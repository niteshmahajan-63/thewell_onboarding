import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
	const logger = new Logger('Bootstrap');
	// Use default NestJS setup with body parsing enabled
	const app = await NestFactory.create(AppModule);
	
	// Use raw body parsing only for the Stripe webhook route
	// This middleware must be registered before any other body parser
	app.use('/api/webhook/stripe', express.raw({ 
		type: 'application/json',
		limit: '10mb' // Adjust limit if needed
	}));
	
	// Regular body parsers for all other routes
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

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

	const port = process.env.PORT || 5000;
	await app.listen(port);
	logger.log(`Application started successfully on port ${port}`);
}

bootstrap().catch((err) => {
	console.error('Error starting application:', err);
});
