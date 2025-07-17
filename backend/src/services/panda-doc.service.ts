import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PandaDocService {
    private readonly API_BASE = process.env.PANDADOC_API_BASE;
    private readonly apiKey = process.env.PANDADOC_API_KEY;

    private headers = {
        'Authorization': `API-Key ${this.apiKey}`,
        'Content-Type': 'application/json',
    };

    async getRecipientEmail(documentId: string): Promise<string> {
        try {
            const url = `${this.API_BASE}/documents/${documentId}/details`;

            const response = await axios.get(
                url,
                { headers: this.headers },
            );

            if (response.data.status === 'document.draft') {
                await this.sendDocument(documentId);
            }

            const clientRecipient = response.data.recipients?.find(recipient => recipient.role === 'Client');
            if (!clientRecipient?.email) throw new Error('Client recipient email not found');

            return clientRecipient.email;
        } catch (err) {
            console.log(err);
            throw new HttpException('Failed to get recipient', 400);
        }
    }

    async sendDocument(documentId: string): Promise<void> {
        try {
            const url = `${this.API_BASE}/documents/${documentId}/send`;

            await axios.post(
                url,
                { silent: true },
                { headers: this.headers },
            );
        } catch (err) {
            console.log(err);
            throw new HttpException('Failed to send document', 400);
        }
    }

    async getSigningLink(documentId: string): Promise<string> {
        const recipientEmail = await this.getRecipientEmail(documentId);

        try {
            const url = `${this.API_BASE}/documents/${documentId}/session`;

            const response = await axios.post(
                url,
                { recipient: recipientEmail },
                { headers: this.headers },
            );

            return response.data.id;
        } catch (err) {
            console.log(err);
            throw new HttpException('Failed to get signing link', 400);
        }
    }

    async checkDocumentStatus(documentId: string): Promise<any> {
        try {
            const url = `${this.API_BASE}/documents/${documentId}/details`;

            const response = await axios.get(
                url,
                { headers: this.headers },
            );

            return response.data;
        } catch (err) {
            console.log(err);
            throw new HttpException('Failed to check document status', 400);
        }
    }

    async isDocumentSigned(documentId: string): Promise<boolean | { sharedLink: string, signerName: string | null, signerTitle: string | null }> {
        try {
            const documentDetails = await this.checkDocumentStatus(documentId);

            if (documentDetails.recipients && Array.isArray(documentDetails.recipients)) {
                const clientRecipient = documentDetails.recipients.find(
                    recipient => recipient.role === 'Client'
                );

                if (clientRecipient) {
                    const status = clientRecipient.has_completed === true ||
                        (clientRecipient.signature_date !== null &&
                            typeof clientRecipient.signature_date !== 'undefined');
                    if (status) {
                        const senderRecipient = documentDetails.recipients.find(
                            recipient => recipient.role === 'Sender'
                        );
                        const signerNameField = documentDetails.fields?.find(f => f.field_id === 'Signer_Name');
                        const signerTitleField = documentDetails.fields?.find(f => f.field_id === 'Signer_Title');

                        return {
                            sharedLink: senderRecipient.shared_link ?? null,
                            signerName: signerNameField?.value ?? null,
                            signerTitle: signerTitleField?.value ?? null
                        };
                    }
                }
            }

            return false;
        } catch (err) {
            console.log(err);
            throw new HttpException('Failed to check if document is signed', 400);
        }
    }
}
