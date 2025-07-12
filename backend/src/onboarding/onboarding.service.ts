import { Injectable, Logger } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { StripeService } from './stripe.service';
import { OnboardingRepository } from './onboarding.repository';

@Injectable()
export class OnboardingService {
	private readonly logger = new Logger(OnboardingService.name);

	constructor(
		private readonly zohoService: ZohoService,
		private readonly onboardingRepository: OnboardingRepository,
		private readonly stripeService: StripeService,
	) { }

	async getRecordById(
		recordId: string,
	): Promise<Record<string, any>> {
		// Get the record from Zoho
		const zohoRecord = await this.zohoService.getRecordById(recordId);

		// Extract needed fields from the Zoho response
		const clientData = {
			zohoRecordId: zohoRecord.ID,
			dealId: zohoRecord.Deal_ID || null,
			dealName: zohoRecord.Deal_Name || null,
			contactId: zohoRecord.Contact_ID || null,
			contactName: zohoRecord.Contact_Name || null,
			companyId: zohoRecord.Company_ID || null,
			companyName: zohoRecord.Company_Name || null,
			pandaDocId: zohoRecord.PandaDoc_ID || null,
			agreementId: zohoRecord.Agreement_ID || null,
			agreementName: zohoRecord.Agreement_Name || null,
			agreementRequired: zohoRecord.Agreement_Required || null,
			paymentLink: zohoRecord.Payment_Link || {},
			stripeRequired: zohoRecord.Stripe_Required || null,
			intakeMeetingRequired: zohoRecord.Intake_Meeting_Required || null,
		};

		try {
			// Upsert the record in the database using the repository
			const savedClient = await this.onboardingRepository.upsertClient(clientData);

			this.logger.log(`Record ${recordId} saved/updated in the database with id: ${savedClient.id}`);
			
			// Add or update client steps based on required fields
			await this.createOrUpdateClientSteps(zohoRecord);

			// Return the combined data (with database id included)
			return { ...zohoRecord, dbId: savedClient.id };
		} catch (error) {
			this.logger.error(`Failed to save/update record in database: ${error.message}`);
			// Return the Zoho data even if database operation fails
			return zohoRecord;
		}
	}
	
	/**
	 * Creates or updates client steps based on the zoho record's required fields
	 */
	private async createOrUpdateClientSteps(zohoRecord: Record<string, any>): Promise<void> {
		const zohoRecordId = zohoRecord.ID;
		
		// Define the mapping of requirements to step types to match existing records in DB
		const requiredStepsMap = [
			{ field: 'Agreement_Required', value: 'Yes', stepName: 'Agreement', stepTitle: 'Sign Our Service Agreement', stepType: 'agreement' },
			{ field: 'Stripe_Required', value: 'Yes', stepName: 'Payment', stepTitle: 'Complete Your Payment', stepType: 'payment' },
			{ field: 'Intake_Meeting_Required', value: 'Yes', stepName: 'Intake Meeting', stepTitle: 'Book Your Intake Meeting', stepType: 'meeting' },
		];
		
		// Process each required step
		for (const step of requiredStepsMap) {
			if (zohoRecord[step.field] === step.value) {
				// Find the step in OnboardingSteps table by name using repository
				const onboardingStep = await this.onboardingRepository.findOnboardingStepByName(step.stepName);
				
				// Skip if the step is not found in the database
				if (!onboardingStep) {
					this.logger.warn(`OnboardingStep with name '${step.stepName}' not found in the database, skipping`);
					continue;
				}
				
				// Check if the client step already exists using repository
				const existingClientStep = await this.onboardingRepository.findClientStep(
					zohoRecordId,
					onboardingStep.id
				);
				
				// Create the step if it doesn't exist
				if (!existingClientStep) {
					await this.onboardingRepository.createClientStep(
						zohoRecordId,
						onboardingStep.id,
						false
					);
				}
			}
		}
	}

	async getRecords(): Promise<Record<string, any>> {
		return this.zohoService.getRecords();
	}

	async createCheckoutSession(
		recordId: string,
	): Promise<{ url: string }> {
		this.logger.log(`Creating checkout session for record: ${recordId}`);

		try {
			// TODO: fetch stripeCustomerId and amount from the database
			const stripeCustomerId = 'cus_SdVWP6tYPR0Os8';
			const amount = 1000;
			
			const session = await this.stripeService.createCheckoutSession(recordId, stripeCustomerId, amount);
			this.logger.log(`Checkout session created successfully for record: ${recordId}`);
			return { url: session.url };
		} catch (error) {
			this.logger.error(`Failed to create checkout session for record ${recordId}: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Get all onboarding steps with their completion status for a specific record
	 * @param recordId - The Zoho record ID
	 */
	async getOnboardingSteps(recordId?: string): Promise<any[]> {
		if (recordId) {
			// Return steps with completion status if recordId is provided
			return this.onboardingRepository.findOnboardingStepsWithStatus(recordId);
		}
		
		// Return all steps without completion status if no recordId is provided
		return this.onboardingRepository.findOnboardingSteps();
	}
	
	/**
	 * Mark a specific step as completed for a client
	 * @param zohoRecordId - The Zoho record ID
	 * @param stepId - The ID of the onboarding step
	 */
	async completeStep(zohoRecordId: string, stepId: number): Promise<any> {
		this.logger.log(`Marking step ${stepId} as complete for record: ${zohoRecordId}`);
		
		try {
			// Check if the step exists
			const steps = await this.onboardingRepository.findOnboardingSteps();
			const stepExists = steps.some(step => step.id === stepId);
			
			if (!stepExists) {
				throw new Error(`Step with ID ${stepId} does not exist`);
			}
			
			// Update step completion status
			const updatedClientStep = await this.onboardingRepository.updateStepCompletionStatus(zohoRecordId, stepId);
			
			if (!updatedClientStep) {
				throw new Error(`Step with ID ${stepId} not found for client with Zoho record ID ${zohoRecordId}`);
			}
			
			this.logger.log(`Successfully marked step ${stepId} as complete for record: ${zohoRecordId}`);
			return updatedClientStep;
		} catch (error) {
			this.logger.error(`Failed to mark step ${stepId} as complete for record ${zohoRecordId}: ${error.message}`);
			throw error;
		}
	}
}
