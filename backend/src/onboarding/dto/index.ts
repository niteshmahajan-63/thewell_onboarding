import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetRecordByIdDto {
	@IsString()
	@IsNotEmpty()
	recordId: string;
}

export class CompleteStepDto {
	@IsString()
	@IsNotEmpty()
	zohoRecordId: string;
	
	@IsNumber()
	@IsNotEmpty()
	@Transform(({ value }) => parseInt(value, 10))
	stepId: number;
}

export class CreatePaymentIntentDto {
	@IsString()
	@IsNotEmpty()
	recordId: string;
}

export class CheckPaymentStatusDto {
	@IsString()
	@IsNotEmpty()
	recordId: string;
}

export class SendSlackMessageDto {
	@IsOptional()
	@IsString()
	message?: string;

	@IsOptional()
	@IsString()
	errorMessage?: string;

	@IsOptional()
	@IsString()
	component?: string;

	@IsOptional()
	@IsString()
	page?: string;

	@IsOptional()
	@IsString()
	userAction?: string;

	@IsOptional()
	@IsString()
	errorStack?: string;

	@IsOptional()
	@IsString()
	browserInfo?: string;

	@IsOptional()
	@IsString()
	recordId?: string;

	@IsOptional()
	errorType?: 'javascript' | 'api' | 'network' | 'validation' | 'general';

	@IsOptional()
	severity?: 'low' | 'medium' | 'high' | 'critical';

	@IsOptional()
	additionalContext?: Record<string, any>;
}