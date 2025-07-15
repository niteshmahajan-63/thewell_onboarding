import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import PandaDocSigning from './PandaDocSigning'
import StripeCheckout from './StripeCheckout'
import CalendlyBooking from './CalendlyBooking'
import { completeStep } from '../services/onboardingService'

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
    const [stepCompleting, setStepCompleting] = useState(false)

    const getCurrentStepObject = () => {
        return steps.find(step => String(step.id) === String(currentStep))
    }

    const getNextStep = () => {
        const currentIndex = steps.findIndex(step => String(step.id) === String(currentStep))
        return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null
    }

    const handleStepComplete = (_stepData = {}) => {
        setStepCompleting(true)

        setTimeout(() => {
            const nextStep = getNextStep()
            if (nextStep) {
                setCurrentStep(Number(nextStep.id))
            }
            setStepCompleting(false)
        }, 1500)
    }

    const handlePandaDocComplete = async (isComplete: boolean, data?: any) => {
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

                handleStepComplete(data);
            } catch (error) {
                console.error('Error completing step:', error);
                handleStepComplete(data);
            }
        }
    }

    const handleCalendlyComplete = () => {
        handleStepComplete()
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
    const isLastStep = !getNextStep()

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
                            onSigningComplete={handlePandaDocComplete}
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
                        <StripeCheckout />
                    )}

                    {/* Meeting Step */}
                    {currentStepObject.type === 'meeting' && !stepCompleting && (
                        <CalendlyBooking onBookingComplete={handleCalendlyComplete} recordId={recordId} />
                    )}

                    {/* Step Completing State */}
                    {stepCompleting && (
                        <div className="text-center py-16">
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-12 max-w-md mx-auto">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-lg font-semibold text-green-800">
                                    {isLastStep ? 'Onboarding Complete!' : `${currentStepObject.name} Completed!`}
                                </p>
                                <p className="text-sm text-green-600 mt-2">
                                    {isLastStep ? 'All steps have been completed successfully.' : 'Moving to next step...'}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default OnboardingForm