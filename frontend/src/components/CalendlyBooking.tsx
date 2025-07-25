import React, { useEffect, useState } from 'react'
import { InlineWidget } from 'react-calendly';
import { useOnboardingContext } from '../contexts/OnboardingContext';

// Define props interface for the component
interface CalendlyBookingProps {
    handleStepComplete: (completed: boolean) => void;
    recordId: string;
}

const CalendlyBooking: React.FC<CalendlyBookingProps> = ({ handleStepComplete, recordId }) => {
    const [isBookingComplete, setIsBookingComplete] = useState(false)
    const { calendlyBookingURL } = useOnboardingContext();

    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (e.data?.event === 'calendly.event_scheduled') {
                setIsBookingComplete(true);
                handleStepComplete(true);
            }
        };

        window.addEventListener('message', handler);
        return () => {
            window.removeEventListener('message', handler);
        };
    }, [handleStepComplete]);

    if (isBookingComplete) {
        return (
            <></>
        )
    }

    return (
        <div className="w-full mx-auto px-4 sm:px-0">
            <div className="text-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Book Your Intake Meeting</h2>
                <p className="text-gray-600 mx-auto max-w-md">
                    To proceed with your onboarding, please book your intake meeting using the calender below.
                </p>
            </div>
            <div className="bg-white border-2 border-well-primary rounded-xl p-4 mx-auto">
                <div className="calendly-embed" style={{ width: "100%" }}>
                    <InlineWidget
                        url={calendlyBookingURL || ''}
                        styles={{ height: '700px' }}
                        utm={{ utmContent: recordId }}
                    />
                </div>
            </div>
        </div>
    )
}

export default CalendlyBooking