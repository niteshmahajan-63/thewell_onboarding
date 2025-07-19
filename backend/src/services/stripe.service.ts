import { Injectable } from "@nestjs/common";
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }

    /**
     * Creates a checkout session for the customer
     * @param recordId The record ID for the checkout session
     * @param stripeCustomerId The Stripe customer ID
     * @param amount The amount to be charged in cents
     * @returns The URL for the checkout session
     */
    async createCheckoutSession(recordId: string, stripeCustomerId: string, amount: number): Promise<{ url: string }> {
        const productPrice = await this.createProduct(amount);

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: stripeCustomerId,
            line_items: [
                {
                    price: productPrice.id,
                    quantity: 1,
                }
            ],
            mode: 'payment',
            invoice_creation: {
                enabled: true,
            },
            metadata: {
                recordId: recordId,
            },
            success_url: `${process.env.FRONTEND_URL}/${recordId}`,
            cancel_url: `${process.env.FRONTEND_URL}/${recordId}`,
        });

        return { url: session.url };
    }

    /**
     * Creates or updates a customer in Stripe
     * @param email Customer email
     * @param name Customer name
     * @returns The Stripe customer ID
     */
    async createOrUpdateCustomer(email: string, name: string): Promise<string> {
        const customers = await this.stripe.customers.list({ email });
        let customer;

        if (customers.data.length > 0) {
            customer = customers.data[0];
        } else {
            customer = await this.stripe.customers.create({
                email,
                name,
            });
        }

        return customer.id;
    }

    /**
     * Creates a product and price
     * @param amount The amount to be charged in cents
     * @returns The price object for the product
     */
    private async createProduct(amount: number): Promise<Stripe.Price> {
        const product = await this.stripe.products.create({
            name: 'Product Name',
            description: 'Product Description',
        });

        return await this.stripe.prices.create({
            unit_amount: amount,
            currency: 'usd',
            product: product.id,
        });
    }

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
    async createPaymentIntent(recordId: string, stripeCustomerId: string, amount: number): Promise<string> {
        try {
            const invoice = await this.stripe.invoices.create({
                customer: stripeCustomerId,
                collection_method: 'send_invoice',
                days_until_due: 0,
                metadata: {
                    recordId: recordId,
                },
                payment_settings: {
                    payment_method_types: ['card'],
                }
            });

            if (invoice) {
                await this.stripe.invoiceItems.create({
                    customer: stripeCustomerId,
                    amount: amount,
                    currency: 'usd',
                    invoice: invoice.id,
                });

                const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id, {
                    expand: ['confirmation_secret'],
                });

                if (finalizedInvoice) {
                    const client_secret = finalizedInvoice.confirmation_secret.client_secret;
                    return client_secret;
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

    async createInvoice(paymentIntentId: string): Promise<Stripe.Invoice> {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

            const customerId = typeof paymentIntent.customer === 'string' ? paymentIntent.customer : paymentIntent.customer?.id;

            await this.stripe.invoiceItems.create({
                customer: customerId,
                amount: paymentIntent.amount,
                currency: 'usd',
                description: 'Invoice for payment intent',
            });

            const invoice = await this.stripe.invoices.create({
                customer: customerId,
                auto_advance: true,
            });

            const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);

            return invoice;
        } catch (error) {
            throw new Error(`Failed to create invoice: ${error.message}`);
        }
    }
}