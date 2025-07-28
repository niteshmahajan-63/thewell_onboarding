import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiResponse, createSuccessResponse } from 'src/common/utils';
import { GetRecordByIdDto } from 'src/onboarding/dto';
import { CheckoutService } from './checkout.service';

@Controller('api/checkout')
export class CheckoutController {
    private readonly logger = new Logger(CheckoutController.name);

    constructor(private readonly checkoutService: CheckoutService) { }

    @Get('get-record')
    async getRecord(
        @Query() query: GetRecordByIdDto
    ) {
        const { recordId } = query;

        try {
            //code to get record by ID
            this.logger.log(`Fetching record with ID: ${recordId}`);
        } catch (error) {
            this.logger.error(`Failed to fetch record with steps for ${recordId}:`, error.message);
            throw error;
        }
    }

    @Get('records')
    async getRecords(): Promise<ApiResponse<Record<string, any>>> {
        try {
            const data = await this.checkoutService.getRecords();

            return createSuccessResponse(data, 'Records retrieved successfully');
        } catch (error) {
            this.logger.error(`Failed to fetch records:`, error.message);
            throw error;
        }
    }
}
