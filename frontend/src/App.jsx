import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import OnboardingHeader from './components/OnboardingHeader'
import StepIndicator from './components/StepIndicator'
import OnboardingForm from './components/OnboardingForm'
import onboardingAPI from './services/onboarding-api'

function App() {
	const { recordId } = useParams()
	const [currentStep, setCurrentStep] = useState(1)
	const [completedSteps, setCompletedSteps] = useState(new Set())
	const [documentId, setDocumentId] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)

	if (!recordId || recordId.trim() === '') {
		return <Navigate to="/404" replace />
	}

	const steps = [
		{ id: 1, title: 'Sign Our Service Agreement', name: 'Agreement' },
		{ id: 2, title: 'Complete Your Payment', name: 'Payment' },
		{ id: 3, title: 'Book Your Intake Meeting', name: 'Intake Meeting' }
	]

	const markStepAsCompleted = async (stepId) => {
		try {
			// Update local state immediately for better UX
			setCompletedSteps(prev => new Set([...prev, stepId]))
			
			// Update the API
			await onboardingAPI.completeStep(stepId)
			console.log('Step completed successfully:', stepId)
		} catch (error) {
			console.error('Failed to mark step as completed:', error)
			// Revert local state if API call fails
			setCompletedSteps(prev => {
				const newSet = new Set([...prev])
				newSet.delete(stepId)
				return newSet
			})
		}
	}

	const loadOnboardingData = async () => {
		try {
			setIsLoading(true)
			setError(null)
			
			// Use the new API method with recordId from URL
			const onboardingData = await onboardingAPI.getOnboardingByRecordId(recordId)
			
			setDocumentId(onboardingData.PandaDoc_ID)
			
			if (onboardingData.currentStep) {
				setCurrentStep(onboardingData.currentStep)
			}
			
			if (onboardingData.completedSteps) {
				setCompletedSteps(new Set(onboardingData.completedSteps))
			}
			
			console.log('Onboarding data loaded for record ID:', recordId, onboardingData)
			
		} catch (error) {
			console.error('Failed to load onboarding data:', error)
			setError(error.message)
		} finally {
			setIsLoading(false)
		}
	}
	
	useEffect(() => {
		// Only load data if we have a valid recordId
		if (recordId && recordId.trim() !== '') {
			loadOnboardingData()
		}
	}, [recordId])

	useEffect(() => {
		const checkDocumentStatus = async () => {
			// Only check if we have a documentId and step 1 is not already completed
			if (documentId && !completedSteps.has(1)) {
				try {
					// Import the pandadoc service dynamically to avoid issues if not configured
					const pandaDocService = (await import('./services/pandadoc')).default
					
					if (pandaDocService.isConfigured()) {
						const result = await pandaDocService.getDocumentById(documentId)
						
						if (result.isCompleted) {
							console.log('Document is already completed on page load')
							// Use functional updates to avoid stale closure issues
							setCompletedSteps(prev => new Set([...prev, 1]))
							// Advance to next step if we're still on step 1
							setCurrentStep(prev => prev === 1 ? 2 : prev)
							// Update API
							await markStepAsCompleted(1)
						}
					}
				} catch (error) {
					console.log('Could not check document status on load:', error.message)
				}
			}
		}

		// Only run after documentId is loaded
		if (documentId) {
			// TODO: Uncomment this line to enable document status check
			// checkDocumentStatus()
		}
	}, [documentId]) // Run when documentId changes

	// Function to handle step change from dropdown
	const handleStepChange = (e) => {
		const newStep = parseInt(e.target.value)
		setCurrentStep(newStep)
	}

	return (
		<div className="min-h-screen bg-black text-white flex flex-col">
			<Header />

			{/* Main Content */}
			<main className="flex-1 bg-black">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="space-y-8">
						<OnboardingHeader />
						
						{/* Demo Step Selector */}
						{/* <div className="bg-gray-800 rounded-lg p-4 mb-4">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
								<div className="space-y-1">
									<h3 className="text-yellow-400 text-sm font-semibold">Demo Controls</h3>
								</div>
								<div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6">
									<div className="flex items-center">
										<label htmlFor="step-selector" className="mr-2 text-sm text-gray-300">Jump to step:</label>
										<select 
											id="step-selector"
											className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm"
											value={currentStep}
											onChange={handleStepChange}
										>
											{steps.map(step => (
												<option key={step.id} value={step.id}>
													{step.id}: {step.name}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
						</div> */}
						
						{/* Loading State */}
						{isLoading && (
							<div className="flex justify-center items-center py-16">
								<div className="flex items-center space-x-3">
									<div className="w-6 h-6 border-2 border-well-primary border-t-transparent rounded-full animate-spin"></div>
									<span className="text-gray-300">Loading onboarding data...</span>
								</div>
							</div>
						)}

						{/* Error State */}
						{error && (
							<div className="bg-red-900 border border-red-700 rounded-lg p-4 text-center">
								<p className="text-red-300 mb-2">Failed to load onboarding data</p>
								<p className="text-red-400 text-sm mb-4">{error}</p>
							</div>
						)}
						
						{/* Main Content */}
						{!isLoading && !error && (
							<>
								<StepIndicator steps={steps} currentStep={currentStep} completedSteps={completedSteps} />
								<OnboardingForm
									currentStep={currentStep}
									steps={steps}
									setCurrentStep={setCurrentStep}
									markStepAsCompleted={markStepAsCompleted}
									documentId={documentId}
								/>
							</>
						)}
					</div>
				</div>
			</main>

			<Footer />
		</div>
	)
}

export default App
