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
}