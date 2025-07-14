// src/panda-doc/panda-doc.service.ts
import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PandaDocService {
    private readonly API_BASE = process.env.PANDADOC_API_BASE;
    private readonly apiKey = process.env.PANDADOC_API_KEY;

    private headers = {
        Authorization: `API-Key ${this.apiKey}`,
        'Content-Type': 'application/json',
    };

    async getRecipientEmail(documentId: string): Promise<string> {
        try {
            const response = await axios.get(
                `https://api.pandadoc.com/public/v1/documents/${documentId}/details`,
                { headers: this.headers },
            );

            const recipient = response.data.recipients?.[0];
            if (!recipient?.email) throw new Error('Recipient email not found');

            return recipient.email;
        } catch (err) {
            throw new HttpException('Failed to get recipient', 400);
        }
    }

    async getSigningLink(documentId: string): Promise<string> {
        const recipientEmail = await this.getRecipientEmail(documentId);

        try {
            const response = await axios.post(
                `${this.API_BASE}/documents/${documentId}/session`,
                { recipient: recipientEmail },
                { headers: this.headers },
            );

            return response.data.session_url;
        } catch (err) {
            console.log(err);
            throw new HttpException('Failed to get signing link', 400);
        }
    }
}
