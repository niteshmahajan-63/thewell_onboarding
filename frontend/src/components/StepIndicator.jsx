import React from 'react'
import { Check } from 'lucide-react'

const StepIndicator = ({ steps, currentStep, completedSteps = new Set() }) => {
	return (
		<div className="flex items-center justify-center space-x-8 mt-8 mb-8">
			{steps.map((step, index) => (
				<div key={step.id} className="flex items-center">
					{/* Step circle and content */}
					<div className="flex flex-col items-center">
						<div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${completedSteps.has(step.id) || currentStep > step.id
								? 'bg-well-primary text-white border-well-primary'
								: currentStep === step.id
									? 'bg-well-primary text-white border-well-primary'
									: 'bg-white text-gray-400 border-gray-400'
							}`}>
							{completedSteps.has(step.id) || currentStep > step.id ? (
								<Check className="w-5 h-5" />
							) : (
								<span className="font-bold">{step.id}</span>
							)}
						</div>

						{/* Step label */}
						<div className="mt-3 text-center">
							<div className={`text-sm font-medium transition-colors duration-300 ${completedSteps.has(step.id) || currentStep >= step.id ? 'text-well-primary' : 'text-gray-500'
								}`}>
								{step.name}
							</div>
						</div>
					</div>

					{/* Connecting line after step (except for last step) */}
					{index < steps.length - 1 && (
						<div className={`w-24 h-0.5 ml-8 ${completedSteps.has(step.id) || currentStep > step.id ? 'bg-well-primary' : 'bg-gray-600'
							}`}></div>
					)}
				</div>
			))}
		</div>
	)
}

export default StepIndicator
