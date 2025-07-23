import React from 'react'
import { Check } from 'lucide-react'

interface Step {
    id: string | number;
    title: string;
    name: string;
    type: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
    completedSteps: Set<number | string>;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, completedSteps }) => {
    const compareStepId = (stepId: string | number, value: number): boolean => {
        const numericId = typeof stepId === 'string' ? parseInt(stepId, 10) : stepId;
        return !isNaN(numericId) && numericId === value;
    };

    const isCurrentGreaterThan = (stepId: string | number): boolean => {
        const numericId = typeof stepId === 'string' ? parseInt(stepId, 10) : stepId;
        return !isNaN(numericId) && currentStep > numericId;
    };

    const isCurrentGreaterOrEqual = (stepId: string | number): boolean => {
        const numericId = typeof stepId === 'string' ? parseInt(stepId, 10) : stepId;
        return !isNaN(numericId) && currentStep >= numericId;
    };

    return (
        <div className="flex flex-row items-center justify-between w-full max-w-4xl mx-auto mt-4 sm:mt-8 mb-4 sm:mb-8 px-4 sm:px-6 overflow-x-auto pb-4">
            {steps.map((step, index) => (
                <div key={step.id} className="flex-1 relative flex flex-col items-center min-w-[100px]">
                    <div className="relative z-10">
                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-base sm:text-xl font-bold border-2 transition-all duration-300 ${
                            completedSteps.has(String(step.id)) || isCurrentGreaterThan(step.id)
                                ? 'bg-well-primary text-white border-well-primary'
                                : compareStepId(step.id, currentStep)
                                    ? 'bg-well-primary text-white border-well-primary'
                                    : 'bg-white text-gray-600 border-gray-300'
                        }`}>
                            {completedSteps.has(String(step.id)) || isCurrentGreaterThan(step.id) ? (
                                <Check className="w-5 h-5 sm:w-7 sm:h-7" />
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 text-center px-2">
                        <div className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
                            completedSteps.has(String(step.id)) || isCurrentGreaterOrEqual(step.id)
                                ? 'text-well-primary'
                                : 'text-gray-500'
                        }`}>
                            {step.name === "Intake Meeting" ? (
                                <>
                                    <span className="sm:hidden">Meeting</span>
                                    <span className="hidden sm:inline">{step.name}</span>
                                </>
                            ) : (
                                step.name
                            )}
                        </div>
                    </div>

                    {index < steps.length - 1 && (
                        <div 
                            className={`absolute h-[2px] top-5 sm:top-7 ${
                                completedSteps.has(String(step.id)) || isCurrentGreaterThan(step.id)
                                    ? 'bg-well-primary'
                                    : 'bg-gray-300'
                            }`} 
                            style={{ 
                                left: 'calc(50% + 15px)',
                                width: 'calc(100% - 60px)',
                                transform: 'translateX(15px)'
                            }}
                        ></div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default StepIndicator