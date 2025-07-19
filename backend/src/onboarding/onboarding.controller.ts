import { Controller, Get, Query, Logger, Post, Body } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { ApiResponse, createSuccessResponse } from '../common/utils';
import { CreateCheckoutSessionDto, GetRecordByIdDto, CompleteStepDto, CreatePaymentIntentDto } from './dto';

@Controller('api/onboarding')
export class OnboardingController {
	private readonly logger = new Logger(OnboardingController.name);

	constructor(private readonly onboardingService: OnboardingService) { }

	@Get('get-record')
	async getRecordWithSteps(
		@Query() query: GetRecordByIdDto
	): Promise<ApiResponse<{ record: Record<string, any>, steps: any[] }>> {
		const { recordId } = query;

		try {
			const result = await this.onboardingService.getRecordWithSteps(recordId);

			return createSuccessResponse(
				result,
				'Record and onboarding steps retrieved successfully'
			);
		} catch (error) {
			this.logger.error(`Failed to fetch record with steps for ${recordId}:`, error.message);
			throw error;
		}
	}

	@Get('records')
	async getRecords(): Promise<ApiResponse<Record<string, any>>> {
		try {
			const data = await this.onboardingService.getRecords();

			return createSuccessResponse(data, 'Records retrieved successfully');
		} catch (error) {
			this.logger.error(`Failed to fetch records:`, error.message);
			throw error;
		}
	}

	@Post('create-checkout-session')
	async createCheckoutSession(
		@Body() checkoutSessionDto: CreateCheckoutSessionDto,
	): Promise<ApiResponse<{ sessionUrl: string }>> {
		this.logger.log(`Creating checkout session for record: ${checkoutSessionDto.recordId}`);

		try {
			const session = await this.onboardingService.createCheckoutSession(checkoutSessionDto.recordId);
			return createSuccessResponse({ sessionUrl: session.url }, 'Checkout session created successfully');
		} catch (error) {
			this.logger.error(`Failed to create checkout session for record ${checkoutSessionDto.recordId}:`, error.message);
			throw error;
		}
	}

	@Post('complete-step')
	async completeStep(
		@Body() completeStepDto: CompleteStepDto,
	): Promise<ApiResponse<any>> {
		this.logger.log(`Marking step ${completeStepDto.stepId} as complete for record: ${completeStepDto.zohoRecordId}`);

		try {
			const result = await this.onboardingService.completeStep(
				completeStepDto.zohoRecordId,
				completeStepDto.stepId
			);
			return createSuccessResponse(result, 'Step marked as completed successfully');
		} catch (error) {
			this.logger.error(`Failed to mark step ${completeStepDto.stepId} as complete for record ${completeStepDto.zohoRecordId}:`, error.message);
			throw error;
		}
	}

	@Post('create-payment-intent')
	async createPaymentIntent(
		@Body() paymentIntentDto: CreatePaymentIntentDto,
	): Promise<ApiResponse<string>> {
		try {
			const paymentIntent = await this.onboardingService.createPaymentIntent(paymentIntentDto.recordId);
			return createSuccessResponse(paymentIntent, 'Payment intent created successfully');
		} catch (error) {
			this.logger.error(`Failed to create payment intent for record ${paymentIntentDto.recordId}:`, error.message);
			throw error;
		}
	}

	@Get('download-invoice')
	async downloadInvoice(
		@Query() query: GetRecordByIdDto
	): Promise<ApiResponse<string>> {
		const { recordId } = query;

		this.logger.log(`Downloading invoice for record: ${recordId}`);

		try {
			const pandadocSessionId = await this.onboardingService.downloadInvoice(recordId);
			return createSuccessResponse(pandadocSessionId, 'Invoice downloaded successfully');
		} catch (error) {
			this.logger.error(`Failed to download invoice for record ${recordId}:`, error.message);
			throw error;
		}
	}
}
