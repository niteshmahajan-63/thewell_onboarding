import { Injectable, Logger } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { PrismaService } from '../common/prisma.service';
import { StripeService } from './stripe.service';

@Injectable()
export class OnboardingService {
	private readonly logger = new Logger(OnboardingService.name);

	constructor(
		private readonly zohoService: ZohoService,
		private readonly prisma: PrismaService,
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
			// Upsert the record in the database
			const savedClient = await this.prisma.client.upsert({
				where: { zohoRecordId: clientData.zohoRecordId },
				update: clientData,
				create: clientData,
			});

			this.logger.log(`Record ${recordId} saved/updated in the database with id: ${savedClient.id}`);

			// Return the combined data (with database id included)
			return { ...zohoRecord, dbId: savedClient.id };
		} catch (error) {
			this.logger.error(`Failed to save/update record in database: ${error.message}`);
			// Return the Zoho data even if database operation fails
			return zohoRecord;
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
}
