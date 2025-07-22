import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { useOnboardingContext } from '../contexts/OnboardingContext'
import { createPaymentIntent, downloadInvoice } from '../services/onboardingService'
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

interface StripeCheckoutProps {
    handleStepComplete: (completed: boolean) => void;
}

interface Appearance extends StripeAppearance {
    layout?: {
        type: 'tabs' | 'accordion' | 'spacedAccordionItems';
        defaultCollapsed?: boolean;
    };
}

const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY);

const CheckoutForm: React.FC<StripeCheckoutProps> = ({ handleStepComplete }) => {
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

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message || 'An unexpected error occurred.');
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            setMessage('Payment successful!');
            if (handleStepComplete) {
                handleStepComplete(true)
            }
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
                    className="px-6 py-3 w-full rounded-md font-medium transition-all transform hover:-translate-y-0.5"
                    style={{ 
                        backgroundColor: '#BE9E44', 
                        color: '#fff',
                        transition: 'background-color 0.2s ease-in-out'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#967D35'} 
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#BE9E44'}
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

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ handleStepComplete }) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { recordId, companyName, amount } = useOnboardingContext();

    useEffect(() => {
        if (recordId) {
            const fetchPaymentIntent = async () => {
                try {
                    const request: PaymentIntentRequest = { recordId };
                    const response = await createPaymentIntent(request);

                    if (response.data) {
                        setClientSecret(response.data);
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

    const handleDownloadInvoice = async () => {
        try {
            const data = await downloadInvoice(recordId);
            if (data) {
                window.open(data.data, '_blank');
            } else {
                console.error('Could not download invoice. Please contact support.');
            }
        } catch (err) {
            console.error('Error downloading invoice:', err);
        }
    };

    return (
        <div className="w-full h-screen flex bg-gray-50 overflow-hidden">
            {/* Left Panel */}
            <div className="w-1/2 flex flex-col py-3 px-5 relative bg-white">
                {/* Rest of the content centered */}
                <div className="flex flex-1">
                    <div className="flex flex-col items-center justify-center w-full">
                        {/* Logo - Aligned with image left edge */}
                        <div className="mb-20 w-[30rem] text-left">
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-30 h-30 bg-black rounded-lg mr-2 p-4">
                                    <img src="/thewell-logo.png" alt="The Well Logo" className="h-16 w-16 rounded" />
                                </div>
                                <span className="text-black text-2xl font-semibold tracking-tight">
                                    THE WELL
                                </span>
                            </div>
                        </div>

                        {/* Plan Information - Aligned with image left edge */}
                        <div className="mb-8 w-[30rem] text-left">
                            <div className="inline-flex items-center py-1 rounded-full bg-white/10 mb-3">
                                <span className="text-black text-sm font-medium">{companyName || 'Company'}</span>
                            </div>
                            <div className="flex items-baseline justify-start">
                                <span className="text-2xl font-bold text-black leading-none">
                                    ${amount ? Number(amount).toFixed(2) : '0.00'}
                                </span>
                            </div>
                        </div>

                        {/* Center Section - Large Visual Card */}
                        <div className="flex items-center justify-center mb-6 relative">
                            <img
                                src="/78792.jpg"
                                alt="Visual Card"
                                className="w-[30rem] h-90 object-cover rounded-2xl shadow-2xl border border-white/20 bg-white/10 backdrop-blur-sm"
                            />
                            <button
                                className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full shadow-lg transition-all duration-200 font-medium" 
                                style={{ 
                                    backgroundColor: '#BE9E44', 
                                    color: '#fff',
                                    transition: 'background-color 0.2s ease-in-out'
                                }} 
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#967D35'} 
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#BE9E44'}
                                onClick={handleDownloadInvoice}
                            >
                                Download Invoice
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Panel */}
            <div className="w-1/2 flex flex-col justify-center px-8 py-4 bg-white h-screen overflow-y-auto">
                <div className="max-w-lg mx-auto w-full">
                    {/* Header */}
                    <div className="mb-4">
                        <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                            Complete Your Payment
                        </h1>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Your payment receipt will be ready to download after you finish the onboarding steps.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                            <div className="flex items-start">
                                <svg className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <span className="font-medium text-sm">Payment Error</span>
                                    <p className="mt-1 text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Form */}
                    {!clientSecret ? (
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-well-primary"></div>
                                <div className="absolute inset-0 rounded-full border-2 border-gray-100"></div>
                            </div>
                            <p className="mt-3 text-gray-500 text-sm">Initializing secure payment...</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
                            <Elements stripe={stripePromise} options={options}>
                                <CheckoutForm
                                    handleStepComplete={handleStepComplete}
                                />
                            </Elements>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StripeCheckout