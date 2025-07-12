import React from 'react'
import { Card } from './ui/card'

interface Step {
    id: string | number;
    title: string;
    type: string;
}

interface DemoStepSelectorProps {
    steps: Step[];
    currentStep: number;
    setCurrentStep: (step: number) => void;
}

const DemoStepSelector: React.FC<DemoStepSelectorProps> = ({ steps, currentStep, setCurrentStep }) => {
    const handleStepChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const stepId = parseInt(event.target.value, 10)
        setCurrentStep(stepId)
    }
    return (
        <div className="flex justify-center">
            <Card className="p-4 bg-gray-800 border border-gray-700 w-full max-w-md">
                <div className="flex flex-col items-center justify-center">
                    <div className="w-full text-center mb-2">
                        <div className="text-yellow-400 text-sm font-semibold px-2 py-1 rounded-md inline-block mb-2">
                            Demo Controls
                        </div>
                        <h3 className="text-gray-300 font-medium">Jump to step:</h3>
                    </div>

                    <select
                        value={currentStep}
                        onChange={handleStepChange}
                        className="w-full p-2 rounded-md border border-gray-600 bg-gray-700 text-white cursor-pointer"
                    >
                        {steps.map((step) => (
                            <option key={step.id} value={step.id}>
                                Step {step.id}: {step.title}
                            </option>
                        ))}
                    </select>
                </div>
            </Card>
        </div>
    )
}

export default DemoStepSelector