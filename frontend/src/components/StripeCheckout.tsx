import React, { useState } from 'react'
import { Button } from './ui/button'
import { useOnboardingContext } from '../contexts/OnboardingContext'
import { getCheckoutSession } from '../services/onboardingService'
import type { CheckoutSessionRequest } from '../types/onboarding.types'

const StripeCheckout: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { recordId } = useOnboardingContext()

    const handleCheckout = async () => {
        setIsLoading(true)
        setError(null)
        
        try {
            if (!recordId) {
                throw new Error('Record ID is missing');
            }
            
            const request: CheckoutSessionRequest = { recordId }
            const response = await getCheckoutSession(request)
            
            if (response.data.sessionUrl) {
                window.open(response.data.sessionUrl, '_self')
            } else {
                throw new Error('No checkout session URL returned')
            }
            
        } catch (err) {
            setError('Failed to initialize payment process. Please try again.')
            console.error('Stripe checkout error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full mx-auto">
            <div className="text-center mb-4">
				<h3 className="text-xl font-semibold text-gray-800 mb-2">Complete Your Payment</h3>
                <p className="text-gray-600 mx-auto max-w-md">
                    To proceed with your onboarding, please complete the payment through our secure Stripe portal.
                </p>
			</div>
            
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            <div className="flex flex-col items-center gap-4">
                <Button 
                    onClick={handleCheckout} 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                    {isLoading ? 'Processing...' : 'Pay with Stripe'}
                </Button>
                
                <p className="text-sm text-gray-500 mt-2">
                    {isLoading ? 
                        'Payment page is opening in a new tab. Please complete your payment there.' : 
                        'Click the button to proceed to the payment page'}
                </p>
            </div>
        </div>
    )
}

export default StripeCheckout