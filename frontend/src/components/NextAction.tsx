import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const NextAction: React.FC = () => {
    return (
        <>
            <div className="w-full mx-auto space-y-4 sm:space-y-8 px-4 sm:px-0">
                <Card className="w-full bg-white border-gray-300 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-well-dark via-well-primary to-well-light w-full">
                        <CardTitle className="text-center text-white font-bold text-lg sm:text-xl">
                            Microdeposit Verification Needed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] flex items-center justify-center bg-white w-full">
                        <div className="text-center w-full">
                            <div
                                className="rounded-xl p-4 sm:p-12 max-w-md mx-auto border-2"
                                style={{
                                    backgroundColor: '#d8c690',
                                    borderColor: '#CBB26A',
                                }}
                            >
                                <p className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: '#000' }}>Microdeposit Verification Needed!</p>
                                <p className="text-base sm:text-lg" style={{ color: '#000' }}>We will send you an email to verify your bank account with microdeposits shortly. Please reach out to <a
                                    href="mailto:clientcare@emailthewell.com"
                                    className="text-blue-600 underline"
                                >
                                    clientcare@emailthewell.com
                                </a>{" "} if you do not receive this email within the next 5 minutes.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default NextAction