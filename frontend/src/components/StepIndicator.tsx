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
        <div className="flex items-center justify-center space-x-8 mt-8 mb-8">
            {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${completedSteps.has(step.id) || isCurrentGreaterThan(step.id)
                                ? 'bg-well-primary text-white border-well-primary'
                                : compareStepId(step.id, currentStep)
                                    ? 'bg-well-primary text-white border-well-primary'
                                    : 'bg-white text-gray-400 border-gray-400'
                            }`}>
                            {completedSteps.has(step.id) || isCurrentGreaterThan(step.id) ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                <span className="font-bold">{index + 1}</span>
                            )}
                        </div>

                        <div className="mt-3 text-center">
                            <div className={`text-sm font-medium transition-colors duration-300 ${completedSteps.has(step.id) || isCurrentGreaterOrEqual(step.id)
                                    ? 'text-well-primary'
                                    : 'text-gray-500'
                                }`}>
                                {step.name}
                            </div>
                        </div>
                    </div>

                    {index < steps.length - 1 && (
                        <div className={`w-24 h-0.5 ml-8 ${completedSteps.has(step.id) || isCurrentGreaterThan(step.id)
                                ? 'bg-well-primary'
                                : 'bg-gray-600'
                            }`}></div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default StepIndicator