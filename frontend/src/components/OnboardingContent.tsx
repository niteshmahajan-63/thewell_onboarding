import React from 'react'
import { useOnboardingContext } from '../contexts/OnboardingContext'
import OnboardingHeader from './OnboardingHeader'
import DemoStepSelector from './DemoStepSelector'
import StepIndicator from './StepIndicator'
import OnboardingForm from './OnboardingForm'

const OnboardingContent: React.FC = () => {
    const {
		currentStep,
		setCurrentStep,
		completedSteps,
		documentId,
		isLoading,
		error,
		onboardingConfig,
		steps,
		recordId
	} = useOnboardingContext()

    if (isLoading) {
		return (
			<div className="flex justify-center items-center py-16">
				<div className="flex items-center space-x-3">
					<div className="w-6 h-6 border-2 border-well-primary border-t-transparent rounded-full animate-spin"></div>
					<span className="text-gray-300">Loading onboarding data...</span>
				</div>
			</div>
		)
	}

    if (error) {
		return (
			<div className="bg-red-900 border border-red-700 rounded-lg p-4 text-center">
				<p className="text-red-300 mb-2">Failed to load onboarding data</p>
				<p className="text-red-400 text-sm mb-4">{error}</p>
			</div>
		)
	}

    if (!onboardingConfig) {
		return (
			<div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 text-center">
				<p className="text-yellow-300">No onboarding configuration found</p>
			</div>
		)
	}

    if (steps.length === 0) {
		return (
			<div className="bg-green-900 border border-green-700 rounded-lg p-8 text-center">
				<h2 className="text-green-300 text-xl font-semibold mb-2">All Set!</h2>
				<p className="text-green-400">No additional onboarding steps are required for your account.</p>
			</div>
		)
	}

    return (
		<div className="space-y-8">
			<OnboardingHeader />
			<DemoStepSelector 
				steps={steps} 
				currentStep={currentStep}
				setCurrentStep={setCurrentStep}
			/>
            <StepIndicator 
				steps={steps} 
				currentStep={currentStep} 
				completedSteps={completedSteps} 
			/>
            <OnboardingForm
				currentStep={currentStep}
				steps={steps}
				setCurrentStep={setCurrentStep}
				documentId={documentId}
				recordId={recordId}
			/>
		</div>
	)
}

export default OnboardingContent