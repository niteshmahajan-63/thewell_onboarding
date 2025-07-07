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
     * @returns The URL for the checkout session
     */
    async createCheckoutSession(recordId: string): Promise<{ url: string }> {
        const customerId = await this.createOrUpdateCustomer('pradeep@gmail.com', 'Pradeep');

        const setupPrice = await this.createSetupFeeProduct();
        const subscriptionPrice = await this.createSubscriptionProduct();

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: customerId,
            line_items: [
                {
                    price: setupPrice.id,
                    quantity: 1,
                },
                {
                    price: subscriptionPrice.id,
                    quantity: 1,
                }
            ],
            mode: 'subscription',
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
     * Creates a one-time setup fee product and price
     * @returns The price object for the setup fee
     */
    private async createSetupFeeProduct(): Promise<Stripe.Price> {
        const setupProduct = await this.stripe.products.create({
            name: 'One-Time Setup Fee',
            type: 'service',
            description: 'Description for One-Time Setup Fee',
        });

        return await this.stripe.prices.create({
            unit_amount: 1000,
            currency: 'usd',
            product: setupProduct.id,
        });
    }

    /**
     * Creates a subscription product and price
     * @returns The price object for the subscription
     */
    private async createSubscriptionProduct(): Promise<Stripe.Price> {
        const subscriptionProduct = await this.stripe.products.create({
            name: 'Monthly Subscription',
            type: 'service',
            description: 'Description for Monthly Subscription',
        });

        return await this.stripe.prices.create({
            unit_amount: 5000,
            currency: 'usd',
            recurring: { interval: 'month' },
            product: subscriptionProduct.id,
        });
    }
}