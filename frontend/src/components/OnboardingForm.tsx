import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import PandaDocSigning from './PandaDocSigning'
import StripeCheckout from './StripeCheckout'
import CalendlyBooking from './CalendlyBooking'
import { completeStep, downloadReceipt } from '../services/onboardingService'

interface Step {
    id: string | number;
    title: string;
    name: string;
    type: string;
}

interface OnboardingFormProps {
    currentStep: number;
    steps: Step[];
    setCurrentStep: (step: number) => void;
    pandaDocSessionId: string | null;
    recordId: string;
    completedSteps: Set<string>;
    setCompletedSteps: (steps: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({
    currentStep,
    steps,
    setCurrentStep,
    pandaDocSessionId,
    recordId,
    completedSteps,
    setCompletedSteps
}) => {
    console.log(steps);
    console.log(currentStep);
    
    const [stepCompleting, setStepCompleting] = useState(false)

    const getCurrentStepObject = () => {
        return steps.find(step => String(step.id) === String(currentStep))
    }

    const getNextStep = () => {
        const currentIndex = steps.findIndex(step => String(step.id) === String(currentStep))
        return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null
    }

    const handleComplete = () => {
        setStepCompleting(true)

        setTimeout(() => {
            const nextStep = getNextStep()
            if (nextStep) {
                setCurrentStep(Number(nextStep.id))
            }
            setStepCompleting(false)
        }, 1500)
    }

    const handleStepComplete = async (isComplete: boolean) => {
        if (isComplete) {
            try {
                await completeStep({
                    zohoRecordId: recordId,
                    stepId: currentStep
                });

                const currentStepId = String(currentStep);

                setCompletedSteps(prevCompletedSteps => {
                    const newCompletedSteps = new Set(prevCompletedSteps);
                    newCompletedSteps.add(currentStepId);
                    return newCompletedSteps;
                });

                handleComplete();
            } catch (error) {
                console.error('Error completing step:', error);
                handleComplete();
            }
        }
    }

    useEffect(() => {
        const currentStepId = String(currentStep);

        if (completedSteps && completedSteps.has(currentStepId)) {
            const nextStep = getNextStep();
            if (nextStep) {
                setTimeout(() => {
                    setCurrentStep(Number(nextStep.id));
                }, 300);
            }
        }
    }, [currentStep, completedSteps, setCurrentStep, getNextStep, steps]);

    const currentStepObject = getCurrentStepObject()

    // Check if all steps are completed
    const allStepsCompleted = steps.length > 0 && completedSteps.size === steps.length;

    if (allStepsCompleted) {
        const handleDownloadReceipt = async () => {
            try {
                const data = await downloadReceipt(recordId);
                if (data) {
                    window.open(data.data, '_blank');
                } else {
                    console.error('Could not download payment receipt. Please contact support.');
                }
            } catch (err) {
                console.error('Error downloading payment receipt:', err);
            }
        };
        return (
            <div className="w-full mx-auto space-y-4 sm:space-y-8 px-4 sm:px-0">
                <Card className="w-full bg-white border-gray-300 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-well-dark via-well-primary to-well-light w-full">
                        <CardTitle className="text-center text-white font-bold text-lg sm:text-xl">
                            Onboarding Complete
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
                                <p className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: '#000' }}>Onboarding Complete!</p>
                                <p className="text-base sm:text-lg" style={{ color: '#000' }}>Thank you for completing your onboarding. You're all set, and we're excited to start working with you!</p>
                                <button
                                    className="mt-6 sm:mt-8 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold shadow transition-colors"
                                    style={{ backgroundColor: '#BE9E44', color: '#fff', border: '1px solid #000', borderRadius: 0 }}
                                    onClick={handleDownloadReceipt}
                                >
                                    Download Payment Receipt
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!currentStepObject) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-300">Invalid step configuration</p>
            </div>
        )
    }

    return (
        <div className="w-full mx-auto space-y-8">
            <Card className="w-full bg-white border-gray-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-well-dark via-well-primary to-well-light w-full">
                    <CardTitle className="text-center text-white font-bold text-xl">
                        {currentStepObject.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className={`p-6 ${currentStepObject.type === 'meeting' ? 'min-h-[850px]' : 'min-h-[400px]'} flex items-center justify-center bg-white w-full`}>

                    {/* Agreement Step */}
                    {currentStepObject.type === 'agreement' && !stepCompleting && pandaDocSessionId && (
                        <PandaDocSigning
                            handleStepComplete={handleStepComplete}
                        />
                    )}

                    {currentStepObject.type === 'agreement' && !stepCompleting && !pandaDocSessionId && (
                        <div className="text-center py-16">
                            <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl p-12 max-w-md mx-auto">
                                <p className="text-lg text-gray-300">Loading document...</p>
                                <p className="text-sm text-gray-400 mt-2">Please wait while we load your agreement</p>
                            </div>
                        </div>
                    )}

                    {/* Payment Step */}
                    {currentStepObject.type === 'payment' && !stepCompleting && (
                        <StripeCheckout
                            handleStepComplete={handleStepComplete}
                        />
                    )}

                    {/* Meeting Step */}
                    {currentStepObject.type === 'meeting' && !stepCompleting && (
                        <CalendlyBooking handleStepComplete={handleStepComplete} recordId={recordId} />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default OnboardingForm