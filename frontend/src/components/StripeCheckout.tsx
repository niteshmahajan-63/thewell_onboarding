import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { useOnboardingContext } from '../contexts/OnboardingContext'
import { createPaymentIntent } from '../services/onboardingService'
import type { PaymentIntentRequest } from '../types/onboarding.types'
import {
    Elements,
    useStripe,
    useElements,
    PaymentElement
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import type { Appearance as StripeAppearance, StripeElementsOptions } from '@stripe/stripe-js'
import { env } from '../config/env'

// Extend the Stripe Appearance type to include the layout property
interface Appearance extends StripeAppearance {
    layout?: {
        type: 'tabs' | 'accordion' | 'spacedAccordionItems';
        defaultCollapsed?: boolean;
    };
}

const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
    // No longer need clientSecret prop with PaymentElement
}

const CheckoutForm: React.FC<CheckoutFormProps> = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setMessage(null);

        // Use the PaymentElement with confirmPayment
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return to the same page after payment
                return_url: window.location.href,
            },
            redirect: 'if_required',
        });

        if (error) {
            // Show error to your customer
            setMessage(error.message || 'An unexpected error occurred.');
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            setMessage('Payment successful!');
            // You can redirect or update UI here
            // Optionally mark the step as completed
        } else {
            setMessage('Payment processing. Please wait a moment.');
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-6 max-w-lg mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Details
                </label>
                <div className="border border-gray-300 rounded-md p-4 bg-white shadow-sm transition-all hover:shadow">
                    <PaymentElement
                        options={{
                            layout: {
                                type: 'tabs',
                                defaultCollapsed: false,
                                radios: false,
                                spacedAccordionItems: false
                            },
                            paymentMethodOrder: ['card'],
                        }}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Your card information is secured with industry-standard encryption.
                </p>
            </div>

            {message && (
                <div className={`p-4 mb-4 rounded-md max-w-lg mx-auto ${message.includes('successful')
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    <div className="flex items-center">
                        {message.includes('successful') ? (
                            <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span className="font-medium">{message}</span>
                    </div>
                </div>
            )}

            <div className="max-w-lg mx-auto">
                <Button
                    type="submit"
                    disabled={isLoading || !stripe || !elements}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 w-full rounded-md font-medium transition-all transform hover:-translate-y-0.5"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : 'Pay Now'}
                </Button>
            </div>
        </form>
    );
};

const StripeCheckout: React.FC = () => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { recordId } = useOnboardingContext();

    useEffect(() => {
        if (recordId) {
            const fetchPaymentIntent = async () => {
                try {
                    const request: PaymentIntentRequest = { recordId };
                    const response = await createPaymentIntent(request);

                    if (response.data.clientSecret) {
                        setClientSecret(response.data.clientSecret);
                    } else {
                        setError('No client secret returned from the server');
                    }
                } catch (err) {
                    setError('Failed to initialize payment process. Please try again.');
                    console.error('Stripe payment intent error:', err);
                }
            };

            fetchPaymentIntent();
        }
    }, [recordId]);

    const appearance: Appearance = {
        theme: 'flat',
        variables: {
            fontFamily: ' "Gill Sans", sans-serif',
            fontLineHeight: '1.5',
            borderRadius: '10px',
            colorBackground: '#F6F8FA',
            accessibleColorOnColorPrimary: '#262626'
        },
        layout: {
            type: 'tabs',
            defaultCollapsed: false,
        },
        rules: {
            '.Block': {
                backgroundColor: 'var(--colorBackground)',
                boxShadow: 'none',
                padding: '12px'
            },
            '.Input': {
                padding: '12px'
            },
            '.Input:disabled, .Input--invalid:disabled': {
                color: 'lightgray'
            },
            '.Tab': {
                padding: '10px 12px 8px 12px',
                border: 'none'
            },
            '.Tab:hover': {
                border: 'none',
                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
            },
            '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
                border: 'none',
                backgroundColor: '#fff',
                boxShadow: '0 0 0 1.5px var(--colorPrimaryText), 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
            },
            '.Label': {
                fontWeight: '500'
            }
        }
    };

    const options: StripeElementsOptions = {
        clientSecret: clientSecret || '',
        appearance,
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Complete Your Payment</h3>
                <p className="text-gray-600 mx-auto max-w-md">
                    To proceed with your onboarding, please enter your card details below.
                </p>
            </div>

            {error && (
                <div className="p-4 mb-6 rounded-md bg-red-50 border border-red-200 text-red-700">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            )}

            {!clientSecret ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-sm text-gray-500">Initializing payment form...</p>
                </div>
            ) : (
                <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200 transition-all hover:shadow-xl max-w-2xl mx-auto">
                    <Elements stripe={stripePromise} options={options}>
                        <CheckoutForm />
                    </Elements>
                </div>
            )}
        </div>
    );
};

export default StripeCheckout