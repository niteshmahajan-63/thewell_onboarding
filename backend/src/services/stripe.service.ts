import { Injectable } from "@nestjs/common";
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }

    /**
     * Retrieves a Stripe customer by their ID
     * @param customerId The ID of the Stripe customer
     * @returns The Stripe customer object
     */
    async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
        try {
            const invoice = await this.stripe.invoices.retrieve(invoiceId);
            return invoice;
        } catch (error) {
            throw new Error(`Failed to retrieve invoice: ${error.message}`);
        }
    }

    /**
     * Creates a payment intent for Stripe Elements
     * @param recordId The record ID for the payment intent
     * @param stripeCustomerId The Stripe customer ID
     * @param amount The amount to be charged in cents
     * @returns The payment intent client secret and id
     */
    async createPaymentIntent(recordId: string, stripeCustomerId: string, amount: number): Promise<{ client_secret: string, invoice_id: string }> {
        try {
            const invoice = await this.stripe.invoices.create({
                customer: stripeCustomerId,
                collection_method: 'send_invoice',
                days_until_due: 0,
                metadata: {
                    recordId: recordId,
                },
                payment_settings: {
                    payment_method_types: ['card', 'us_bank_account'],
                }
            });

            if (invoice) {
                await this.stripe.invoiceItems.create({
                    customer: stripeCustomerId,
                    amount: amount,
                    currency: 'usd',
                    invoice: invoice.id,
                    description: `Engagement Setup Fee`
                });

                const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id, {
                    expand: ['confirmation_secret'],
                });

                if (finalizedInvoice) {
                    const client_secret = finalizedInvoice.confirmation_secret.client_secret;

                    return {
                        client_secret: client_secret,
                        invoice_id: invoice.id,
                    };
                } else {
                    throw new Error('Failed to finalize invoice');
                }
            } else {
                throw new Error('Failed to create invoice');
            }
        } catch (error) {
            throw new Error(`Failed to create payment intent: ${error.message}`);
        }
    }

    async getPaymentIntent(paymentIntentId: string): Promise<{ status: string, amount: number, currency: string }> {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            return {
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency
            };
        } catch (error) {
            throw new Error(`Failed to check payment status: ${error.message}`);
        }
    }
}