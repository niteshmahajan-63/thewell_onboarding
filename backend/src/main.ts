import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
	const logger = new Logger('Bootstrap');
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: [
			"http://localhost:5173",
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
