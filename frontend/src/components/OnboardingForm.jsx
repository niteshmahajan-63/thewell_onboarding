import { useState } from 'react'
import PandaDocSigning from './PandaDocSigning'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import StripeCheckout from './StripeCheckout'
import CalendlyBooking from './CalendlyBooking'

const OnboardingForm = ({ currentStep, steps, setCurrentStep, markStepAsCompleted, documentId }) => {
	const [stepCompleting, setStepCompleting] = useState(false)

	const handlePandaDocComplete = (isComplete, data) => {
		if (isComplete) {
			console.log('Document signed successfully:', data)
			setStepCompleting(true)

			markStepAsCompleted(currentStep)

			setTimeout(() => {
				setCurrentStep(2)
				setStepCompleting(false)
			}, 1500)
		}
	}
	
	const handleCalendlyComplete = () => {
		setStepCompleting(true)
		
		markStepAsCompleted(currentStep)
		
		// No need to advance to next step as this is the last step
		setTimeout(() => {
			setStepCompleting(false)
		}, 1500)
	}

	return (
		<div className="w-full mx-auto space-y-8">
			<Card className="w-full bg-white border-gray-300 overflow-hidden">
				<CardHeader className="bg-gradient-to-r from-well-dark via-well-primary to-well-light w-full">
					<CardTitle className="text-center text-white font-bold text-xl">
						Step {currentStep}: {steps[currentStep - 1].title}
					</CardTitle>
				</CardHeader>
				<CardContent className={`p-6 ${currentStep === 3 ? 'min-h-[850px]' : 'min-h-[400px]'} flex items-center justify-center bg-white w-full`}>
					{currentStep === 1 && !stepCompleting && documentId && (
						<PandaDocSigning
							onSigningComplete={handlePandaDocComplete}
							documentId={documentId}
						/>
					)}

					{currentStep === 1 && !stepCompleting && !documentId && (
						<div className="text-center py-16">
							<div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl p-12 max-w-md mx-auto">
								<p className="text-lg text-gray-300">Loading document...</p>
								<p className="text-sm text-gray-400 mt-2">Please wait while we load your agreement</p>
							</div>
						</div>
					)}

					{currentStep === 1 && stepCompleting && (
						<div className="text-center py-16">
							<div className="bg-green-50 border-2 border-green-200 rounded-xl p-12 max-w-md mx-auto">
								<div className="flex items-center justify-center mb-4">
									<div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
										<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
									</div>
								</div>
								<p className="text-lg font-semibold text-green-800">Document Signed Successfully!</p>
								<p className="text-sm text-green-600 mt-2">Moving to next step...</p>
							</div>
						</div>
					)}

					{currentStep === 2 && (
						<StripeCheckout onNext={() => {
							markStepAsCompleted(currentStep);
							setCurrentStep(3);
						}} />
					)}

					{currentStep === 3 && !stepCompleting && (
						<CalendlyBooking onBookingComplete={handleCalendlyComplete} />
					)}
					
					{currentStep === 3 && stepCompleting && (
						<div className="text-center py-16">
							<div className="bg-green-50 border-2 border-green-200 rounded-xl p-12 max-w-md mx-auto">
								<div className="flex items-center justify-center mb-4">
									<div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
										<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
									</div>
								</div>
								<p className="text-lg font-semibold text-green-800">Onboarding Complete!</p>
								<p className="text-sm text-green-600 mt-2">All steps have been completed successfully.</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

export default OnboardingForm
