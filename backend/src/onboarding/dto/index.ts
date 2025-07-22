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