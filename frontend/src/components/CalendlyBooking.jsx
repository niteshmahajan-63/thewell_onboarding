import { useEffect, useState } from 'react'
import { Button } from './ui/button'

const CalendlyBooking = ({ onBookingComplete }) => {
    const [isBookingComplete, setIsBookingComplete] = useState(false)

    // Simplify by using an iframe directly instead of the script-based approach
    const handleBookingComplete = () => {
        setIsBookingComplete(true);
        setTimeout(() => {
            if (onBookingComplete) {
                onBookingComplete();
            }
        }, 1000);
    };
    
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
        <div className="text-center w-full">
            <div className="bg-white border-2 border-well-primary rounded-xl p-4 mx-auto">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Book Your Intake Meeting</h3>
                
                {/* Direct iframe approach */}
                <div className="calendly-embed" style={{ width: "100%" }}>
                    <iframe
                        src="https://calendly.com/the-well-recruiting-team/peak-retirement-introductory-call?back=1&month=2025-07&embed=true"
                        width="100%"
                        height="700"
                        frameBorder="0"
                        title="Schedule your intake meeting"
                    ></iframe>
                </div>
                
                {/* Always show "Complete" button at the bottom */}
                {/* <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button 
                        onClick={handleBookingComplete} 
                        className="bg-well-primary hover:bg-well-dark text-white"
                    >
                        Complete Booking
                    </Button>
                </div> */}
            </div>
        </div>
    )
}

export default CalendlyBooking
