import { Controller, Get, Query, Logger } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { ApiResponse, createSuccessResponse } from '../common/utils';
import { GetRecordByIdDto } from './dto';

@Controller('api/onboarding')
export class OnboardingController {
	private readonly logger = new Logger(OnboardingController.name);

	constructor(private readonly onboardingService: OnboardingService) { }

	@Get('record')
	async getRecordById(
		@Query() query: GetRecordByIdDto,
	): Promise<ApiResponse<Record<string, any>>> {
		const { recordId } = query;
		this.logger.log(`Received request to fetch record: ${recordId}`);

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
}
