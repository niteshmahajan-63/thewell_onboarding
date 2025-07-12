import { Controller, Get, Query, Logger, Post, Body } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { ApiResponse, createSuccessResponse } from '../common/utils';
import { CreateCheckoutSessionDto, GetRecordByIdDto, GetOnboardingStepsDto, CompleteStepDto } from './dto';

@Controller('api/onboarding')
export class OnboardingController {
	private readonly logger = new Logger(OnboardingController.name);

	constructor(private readonly onboardingService: OnboardingService) { }

	@Get('record')
	async getRecordById(
		@Query() query: GetRecordByIdDto,
	): Promise<ApiResponse<Record<string, any>>> {
		const { recordId } = query;

		try {
			const data = await this.onboardingService.getRecordById(
				recordId,
			);

			return createSuccessResponse(data, 'Record retrieved successfully');
		} catch (error) {
			this.logger.error(`Failed to fetch record ${recordId}:`, error.message);
			throw error;
		}
	}

	@Get('steps')
	async getOnboardingSteps(
		@Query() query: GetOnboardingStepsDto
	): Promise<ApiResponse<any[]>> {
		const { recordId } = query;
		try {
			const steps = await this.onboardingService.getOnboardingSteps(recordId);
			return createSuccessResponse(steps, 'Onboarding steps retrieved successfully');
		} catch (error) {
			this.logger.error(`Failed to fetch onboarding steps ${recordId ? 'for record ' + recordId : ''}:`, error.message);
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
}
