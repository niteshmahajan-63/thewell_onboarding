import { Injectable, Logger } from '@nestjs/common';
import { ZohoService } from '../services/zoho.service';

@Injectable()
export class CheckoutService {
    private readonly logger = new Logger(CheckoutService.name);

    constructor(
        private readonly zohoService: ZohoService,
    ) { }

    async getRecords(): Promise<Record<string, any>> {
        return this.zohoService.getRecords();
    }
}
