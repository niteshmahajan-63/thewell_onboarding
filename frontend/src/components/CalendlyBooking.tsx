import React, { useEffect, useState } from 'react'
import { InlineWidget } from 'react-calendly';

// Define props interface for the component
interface CalendlyBookingProps {
    handleStepComplete: (completed: boolean) => void;
    recordId: string;
}

const CalendlyBooking: React.FC<CalendlyBookingProps> = ({ handleStepComplete, recordId }) => {
    const [isBookingComplete, setIsBookingComplete] = useState(false)

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
            <div className="text-center py-16">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-12 max-w-md mx-auto">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-lg font-semibold text-green-800">Meeting Booked Successfully!</p>
                    <p className="text-sm text-green-600 mt-2">Your intake session has been scheduled.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full mx-auto">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Book Your Intake Meeting</h2>
                <p className="text-gray-600 mx-auto max-w-md">
                    To proceed with your onboarding, please book your intake meeting using the calender below.
                </p>
            </div>
            <div className="bg-white border-2 border-well-primary rounded-xl p-4 mx-auto">
                <div className="calendly-embed" style={{ width: "100%" }}>
                    <InlineWidget
                        url="https://calendly.com/brandon-thewell/introductory-discussion-20min"
                        styles={{ height: '700px' }}
                        utm={{ utmContent: recordId }}
                    />
                </div>
            </div>
        </div>
    )
}

export default CalendlyBooking