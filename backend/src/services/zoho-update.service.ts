import { Injectable, Logger } from "@nestjs/common";
import { ZohoService } from "./zoho.service";
import { PandaDocService } from "./panda-doc.service";
import { OnboardingRepository } from "src/onboarding/onboarding.repository";

@Injectable()
export class ZohoUpdateService {
    private readonly logger = new Logger(ZohoUpdateService.name);

    constructor(
        private readonly zohoService: ZohoService,
        private readonly pandaDocService: PandaDocService,
        private readonly onboardingRepository: OnboardingRepository,
    ) {}

    async updatePandaDocURL(recordId: string): Promise<void> {
        try {
            const zohoRecord = await this.zohoService.getRecordById(recordId);
            const pandaDocId = zohoRecord.PandaDoc_ID;
            if (!pandaDocId) {
                this.logger.warn(`No PandaDoc ID found for record ${recordId}`);
                return;
            }

            const response = await this.pandaDocService.isDocumentSigned(pandaDocId);
            if (!response || response === true || !('sharedLink' in response)) {
                this.logger.warn(`No signing link found for PandaDoc ID ${pandaDocId}`);
                return;
            }

            const payload = {
                Sender_PandaDoc_URL:
                {
                    value: response.sharedLink,
                    url: response.sharedLink
                },
                Pandadoc_Agreement_Completed: 'Yes',
                Signer_Name: response.signerName,
                Title: response.signerTitle
            };
            await this.zohoService.updateRecord(recordId, payload);

            this.logger.log(`PandaDoc URL updated successfully for record ${recordId}`);
        } catch (error) {
            this.logger.error(`Failed to update PandaDoc URL for record ${recordId}: ${error.message}`);
            throw error;
        }
    }

    async updateStripePayment(recordId: string): Promise<void> {
        try {
            const zohoRecord = await this.zohoService.getRecordById(recordId);
            const stripeCustomerId = zohoRecord.Stripe_Customer_Id;
            const Stripe_Payment_Completed = zohoRecord.Stripe_Payment_Completed;
            if (!stripeCustomerId) {
                this.logger.warn(`No Stripe Customer ID found for record ${recordId}`);
                return;
            }
            if (Stripe_Payment_Completed === "Yes") {
                this.logger.log(`Stripe payment already completed for record ${recordId}`);
                return;
            }
            const response = await this.onboardingRepository.getStripePaymentRecord(recordId);

            if (response && response.paymentStatus === "succeeded") {
                let formattedPaymentDate = response.paymentDate;
                if (response.paymentDate) {
                    let dateStr = response.paymentDate;
                    if (response.paymentDate instanceof Date) {
                        dateStr = response.paymentDate.toISOString();
                    }
                    if (typeof dateStr === 'string') {
                        formattedPaymentDate = dateStr.replace(/\.[0-9]{3}Z$/, '');
                    }
                }

                const payload = {
                    Stripe_Payment_ID: response.paymentId,
                    Payment_Source: response.paymentSource,
                    Payment_Date: formattedPaymentDate,
                    Payment: '',
                    Payment_Status: response.paymentStatus,
                    Stripe_Payment_Completed: 'Yes',
                };
                await this.zohoService.updateRecord(recordId, payload);
            }
        } catch (error) {
            this.logger.error(`Failed to update Stripe payment for record ${recordId}: ${error.message}`);
            throw error;
        }
    }

    async updateCalendly(recordId: string): Promise<void> {
        this.logger.log(`Updating Calendly booking for record: ${recordId}`);

        try {
            const payload = {
                Intake_Meeting_Completed: "Yes"
            }

            await this.zohoService.updateRecord(recordId, payload);
            this.logger.log(`Calendly booking updated successfully for record ${recordId}`);
        } catch (error) {
            this.logger.error(`Failed to update Calendly booking for record ${recordId}: ${error.message}`);
            throw error;
        }
    }

    async updateMicroDepositUrl(recordId: string, microdepositUrl: string): Promise<void> {
        try {
            const zohoRecord = await this.zohoService.getRecordById(recordId);

            if(!zohoRecord.Microdeposit_URL) {
                const payload = {
                    Microdeposit_URL: {
                        value: microdepositUrl,
                        url: microdepositUrl
                    },
                };
                await this.zohoService.updateRecord(recordId, payload);
            }

            this.logger.log(`PandaDoc URL updated successfully for record ${recordId}`);
        } catch (error) {
            this.logger.error(`Failed to update PandaDoc URL for record ${recordId}: ${error.message}`);
            throw error;
        }
    }
}