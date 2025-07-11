import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class WebhookRepository {
    private readonly logger = new Logger(WebhookRepository.name);

    constructor(private prismaService: PrismaService) {}

    /**
     * Check if a Calendly booking exists
     */
    async findCalendlyBooking(zohoRecordId: string): Promise<any> {
        try {
            return await this.prismaService.calendlyBookings.findUnique({
                where: {
                    zohoRecordId: zohoRecordId
                }
            });
        } catch (error) {
            this.logger.error(`Error finding Calendly booking: ${error.message}`);
            return null;
        }
    }

    /**
     * Store a Calendly booking in the database
     * Creates new record or updates existing one
     */
    async storeCalendlyBooking(zohoRecordId: string, payload: any): Promise<any> {
        try {
            const existingBooking = await this.findCalendlyBooking(zohoRecordId);
            
            if (existingBooking) {
                this.logger.log(`Updating existing Calendly booking for zohoRecordId: ${zohoRecordId}`);
                return await this.prismaService.calendlyBookings.update({
                    where: {
                        zohoRecordId: zohoRecordId
                    },
                    data: {
                        payload: payload,
                        updatedAt: new Date()
                    }
                });
            } else {
                this.logger.log(`Creating new Calendly booking for zohoRecordId: ${zohoRecordId}`);
                return await this.prismaService.calendlyBookings.create({
                    data: {
                        zohoRecordId: zohoRecordId,
                        payload: payload
                    }
                });
            }
        } catch (error) {
            this.logger.error(`Error storing Calendly booking: ${error.message}`);
            throw error;
        }
    }

    async findStripePayment(zohoRecordId: string): Promise<any> {
        try {
            return await this.prismaService.stripePayments.findUnique({
                where: {
                    zohoRecordId: zohoRecordId
                }
            });
        } catch (error) {
            this.logger.error(`Error finding Stripe payment: ${error.message}`);
            return null;
        }
    }

    async storeStripePayment(stripePaymentData: any): Promise<any> {
        try {
            const existingPayment = await this.findStripePayment(stripePaymentData.zohoRecordId);

            if (existingPayment) {
                this.logger.log(`Updating existing Stripe payment for zohoRecordId: ${stripePaymentData.zohoRecordId}`);
                return await this.prismaService.stripePayments.update({
                    where: {
                        zohoRecordId: stripePaymentData.zohoRecordId
                    },
                    data: {
                        ...stripePaymentData,
                        updatedAt: new Date()
                    }
                });
            } else {
                this.logger.log(`Creating new Stripe payment for zohoRecordId: ${stripePaymentData.zohoRecordId}`);
                return await this.prismaService.stripePayments.create({
                    data: stripePaymentData
                });
            }
        } catch (error) {
            this.logger.error(`Error storing Stripe payment: ${error.message}`);
            throw error;
        }
    }
}
