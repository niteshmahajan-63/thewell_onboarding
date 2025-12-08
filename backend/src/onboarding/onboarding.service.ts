import { Injectable, Logger } from '@nestjs/common';
import { StripeService } from '../services/stripe.service';
import { OnboardingRepository } from './onboarding.repository';
import { PandaDocService } from '../services/panda-doc.service';
import { ZohoService } from '../services/zoho.service';
import { SlackService, ErrorInfo } from 'src/common/slack.service';
import { SendSlackMessageDto } from './dto';
import { ZohoUpdateService } from 'src/services/zoho-update.service';

@Injectable()
export class OnboardingService {
	private readonly logger = new Logger(OnboardingService.name);

	constructor(
		private readonly zohoService: ZohoService,
		private readonly onboardingRepository: OnboardingRepository,
		private readonly stripeService: StripeService,
		private readonly pandaDocService: PandaDocService,
		private readonly slackService: SlackService,
		private readonly zohoUpdateService: ZohoUpdateService,
	) { }

	/*
	 * Get a record by ID from Zoho and upsert it in the database
	 * @param recordId - The Zoho record ID
	 * @returns {Promise<Record<string, any>>} - The record data with database ID
	 * @throws {Error} - If there is an error during the upsert operation
	 */
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
			stripeCustomerId: zohoRecord.Stripe_Customer_Id || null,
			pandadocAgreementCompleted: zohoRecord.Pandadoc_Agreement_Completed || null,
			stripePaymentCompleted: zohoRecord.Stripe_Payment_Completed || null,
			amount: zohoRecord.Amount || null,
			calendlyBookingURL: zohoRecord.Calendly_Booking_URL.value || null,
			customerEmail: zohoRecord.Customer_Email || null,
			deactivatedLink: zohoRecord.Deactivated_Link || null,
			customPandadocURL: zohoRecord.Custom_Pandadoc_URL.value || null,
			microdepositUrl: zohoRecord.Microdeposit_URL || {},
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
	 * @param zohoRecord - The Zoho record containing the required fields
	 * @returns {Promise<void>}
	 * @throws {Error} - If there is an error during the creation or update of client steps
	 */
	private async createOrUpdateClientSteps(zohoRecord: Record<string, any>): Promise<void> {
		const recordId = zohoRecord.ID;

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
					recordId,
					onboardingStep.id
				);

				// Create the step if it doesn't exist
				if (!existingClientStep) {
					await this.onboardingRepository.createClientStep(
						recordId,
						onboardingStep.id,
						false
					);
				}
			}
		}
	}

	/**
	 * Fetches all records from the database
	 * @returns {Promise<Record<string, any>>} - The records data
	 * @throws {Error} - If there is an error during the fetch operation
	 */
	async getRecords(): Promise<Record<string, any>> {
		return this.zohoService.getRecords();
	}

	/**
	 * Creates a payment intent for Stripe Elements
	 * @param recordId 
	 * @returns { string } - The payment intent client secret
	 * @throws { Error } - If the payment intent creation fails
	 */
	async createPaymentIntent(
		recordId: string,
	): Promise<string> {
		try {
			const record = await this.onboardingRepository.findRecordById(recordId);
			if (!record) {
				throw new Error(`Record with ID ${recordId} not found`);
			}

			const existingPaymentRecord = await this.onboardingRepository.getStripePaymentRecord(recordId);

			if (existingPaymentRecord && existingPaymentRecord.clientSecret) {
				this.logger.log(`Payment intent already exists for record: ${recordId}`);
				return existingPaymentRecord.clientSecret;
			} else {
				const stripeCustomerId = record.stripeCustomerId;
				const amount = record.amount * 100;
				const paymentIntent = await this.stripeService.createPaymentIntent(recordId, stripeCustomerId, amount);
				await this.onboardingRepository.storeStripePayment({
					zohoRecordId: recordId,
					clientSecret: paymentIntent.client_secret,
					customerId: stripeCustomerId,
					invoiceId: paymentIntent.invoice_id,
				});
				this.logger.log(`Payment intent created successfully for record: ${recordId}`);
				return paymentIntent.client_secret;
			}
		} catch (error) {
			this.logger.error(`Failed to create payment intent for record ${recordId}: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Get all onboarding steps with their completion status for a specific record
	 * @param recordId - The Zoho record ID
	 * @return {Promise<any[]>} - The onboarding steps with completion status
	 * @throws {Error} - If there is an error during the fetch operation
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
	 * @param recordId - The Zoho record ID
	 * @param stepId - The ID of the onboarding step
	 * @return {Promise<any>} - The updated client step
	 * @throws {Error} - If there is an error during the completion operation
	 */
	async completeStep(recordId: string, stepId: number): Promise<any> {
		this.logger.log(`Marking step ${stepId} as complete for record: ${recordId}`);

		try {
			// Check if the step exists
			const steps = await this.onboardingRepository.findOnboardingSteps();
			const stepExists = steps.some(step => step.id === stepId);

			if (!stepExists) {
				throw new Error(`Step with ID ${stepId} does not exist`);
			}

			// Update step completion status
			const updatedClientStep = await this.onboardingRepository.updateStepCompletionStatus(recordId, stepId);

			if (stepId === 1) {
				await this.zohoUpdateService.updatePandaDocURL(recordId);
			}

			if (stepId === 2) {
				// await this.zohoUpdateService.updateStripePayment(recordId);
			}

			if (stepId === 3) {
				await this.zohoUpdateService.updateCalendly(recordId);
			}

			if (!updatedClientStep) {
				throw new Error(`Step with ID ${stepId} not found for client with Zoho record ID ${recordId}`);
			}

			this.logger.log(`Successfully marked step ${stepId} as complete for record: ${recordId}`);
			return updatedClientStep;
		} catch (error) {
			this.logger.error(`Failed to mark step ${stepId} as complete for record ${recordId}: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Get both record data and onboarding steps in a single operation
	 * @param recordId - The Zoho record ID
	 * @return {Promise<{ record: Record<string, any>, steps: any[], pandadoc_session_id: string }>} - The record data and onboarding steps
	 * @throws {Error} - If there is an error during the fetch operation
	 */
	async getRecordWithSteps(recordId: string): Promise<{ record: Record<string, any>, steps: any[], pandadoc_session_id: string }> {
		this.logger.log(`Fetching record data and steps for record: ${recordId}`);

		try {
			const record = await this.getRecordById(recordId);

			let pandadoc_session_id = null;
			if ((record.Agreement_Required === 'Yes') && (record.PandaDoc_ID)) {
				pandadoc_session_id = await this.pandaDocService.getSigningLink(record.PandaDoc_ID);
			}

			const dbRecord = await this.onboardingRepository.findRecordById(recordId);
			if (!dbRecord) {
				throw new Error(`Record with ID ${recordId} not found in the database`);
			}

			if ((dbRecord.agreementRequired === 'Yes') && (dbRecord.pandaDocId)) {
				if (dbRecord.pandadocAgreementCompleted !== "Yes") {
					const response = await this.pandaDocService.isDocumentSigned(record.PandaDoc_ID);
					if (response) {
						await this.zohoUpdateService.updatePandaDocURL(recordId);
						await this.completeStep(recordId, 1);
					}
				}
			}

			if (dbRecord.stripeRequired === "Yes") {
				if (dbRecord.stripePaymentCompleted !== "Yes") {
					const response = await this.onboardingRepository.getStripePaymentRecord(recordId);
					if (response && response.paymentStatus === "succeeded") {
						await this.zohoUpdateService.updateStripePayment(recordId);
						await this.completeStep(recordId, 2);
					}
				}
			}

			const steps = await this.getOnboardingSteps(recordId);

			return { record, steps, pandadoc_session_id };
		} catch (error) {
			this.logger.error(`Failed to fetch record with steps for ${recordId}: ${error.message}`);
			throw error;
		}
	}

	async downloadInvoice(recordId: string): Promise<string> {
		this.logger.log(`Downloading invoice for record: ${recordId}`);

		try {
			const stripePaymentRecord = await this.onboardingRepository.getStripePaymentRecord(recordId);
			if (!stripePaymentRecord) {
				throw new Error(`No Stripe payment record found for record ID ${recordId}`);
			}
			return stripePaymentRecord.hostedInvoiceUrl;
		} catch (error) {
			this.logger.error(`Failed to download invoice for record ${recordId}: ${error.message}`);
			throw error;
		}
	}

	async downloadDueInvoice(recordId: string): Promise<string> {
		this.logger.log(`Downloading due invoice for record: ${recordId}`);

		try {
			const stripePaymentRecord = await this.onboardingRepository.getStripePaymentRecord(recordId);

			if (!stripePaymentRecord || !stripePaymentRecord.invoiceId) {
				throw new Error(`No Invoice found for record ID ${recordId}`);
			}

			const invoice = await this.stripeService.getInvoice(stripePaymentRecord.invoiceId);
			if (!invoice) {
				throw new Error(`No Stripe payment record found for record ID ${recordId}`);
			}
			return invoice.invoice_pdf || '';
		} catch (error) {
			this.logger.error(`Failed to download due invoice for record ${recordId}: ${error.message}`);
			throw error;
		}
	}

	async checkPaymentStatus(recordId: string): Promise<{ status: string, isMicrodeposits: boolean }> {
		this.logger.log(`Checking payment status for recordId: ${recordId}`);

		try {
			const paymentRecord = await this.onboardingRepository.getStripePaymentRecord(recordId);

			if (!paymentRecord) {
				throw new Error(`Payment intent with ID ${recordId} not found`);
			}

			let isMicrodeposits = false;
			if (paymentRecord.paymentId) {
				const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentRecord.paymentId);
				if (paymentIntent && paymentIntent.next_action?.type === 'verify_with_microdeposits') {
					isMicrodeposits = true;
				}
			}

			return {
				status: paymentRecord.paymentStatus,
				isMicrodeposits: isMicrodeposits
			};
		} catch (error) {
			this.logger.error(`Failed to check payment status for recordId ${recordId}: ${error.message}`);
			throw error;
		}
	}

	async sendSlackMessage(slackMessageDto: SendSlackMessageDto): Promise<void> {
		try {
			if (slackMessageDto.message && !slackMessageDto.errorMessage) {
				await this.slackService.sendMessage(slackMessageDto.message);
				this.logger.log('Simple Slack message sent successfully');
			} else if (slackMessageDto.errorMessage || slackMessageDto.errorType) {
				const errorInfo: ErrorInfo = {
					errorMessage: slackMessageDto.errorMessage || 'Frontend Error',
					statusCode: this.getStatusCodeFromErrorType(slackMessageDto.errorType),
					endpoint: slackMessageDto.page || 'Frontend',
					method: slackMessageDto.userAction || 'USER_ACTION',
					stackTrace: slackMessageDto.errorStack,
					timestamp: new Date().toISOString(),
					recordId: slackMessageDto.recordId,
				};

				await this.slackService.sendFrontendErrorAlert(errorInfo, {
					component: slackMessageDto.component,
					page: slackMessageDto.page,
					userAction: slackMessageDto.userAction,
					browserInfo: slackMessageDto.browserInfo,
					errorType: slackMessageDto.errorType,
					severity: slackMessageDto.severity,
					additionalContext: slackMessageDto.additionalContext,
				});

				this.logger.log('Frontend error alert sent to Slack successfully');
			} else {
				await this.slackService.sendMessage('Empty notification from frontend');
				this.logger.log('Fallback Slack message sent successfully');
			}
		} catch (error) {
			this.logger.error(`Failed to send Slack message: ${error.message}`);
			throw error;
		}
	}

	private getStatusCodeFromErrorType(errorType?: string): number {
		switch (errorType) {
			case 'javascript':
				return 500;
			case 'api':
				return 502;
			case 'network':
				return 503;
			case 'validation':
				return 400;
			case 'general':
			default:
				return 500;
		}
	}
}
