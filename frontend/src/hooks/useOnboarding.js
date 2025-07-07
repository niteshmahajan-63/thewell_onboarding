import { useState, useEffect, useCallback } from 'react'
import onboardingAPI from '../services/onboarding-api'

/**
 * Custom hook to manage onboarding state and logic
 */
export const useOnboarding = (recordId) => {
	const [currentStep, setCurrentStep] = useState(1)
	const [completedSteps, setCompletedSteps] = useState(new Set())
	const [documentId, setDocumentId] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	const [onboardingConfig, setOnboardingConfig] = useState(null)

	// Generate steps dynamically based on onboarding configuration
	const generateSteps = useCallback((config) => {
		const steps = []
		let stepId = 1

		if (config?.Agreement_Required === 'Yes') {
			steps.push({ 
				id: stepId++, 
				title: 'Sign Our Service Agreement', 
				name: 'Agreement', 
				type: 'agreement' 
			})
		}

		if (config?.Stripe_Required === 'Yes') {
			steps.push({ 
				id: stepId++, 
				title: 'Complete Your Payment', 
				name: 'Payment', 
				type: 'payment' 
			})
		}

		if (config?.Intake_Meeting_Required === 'Yes') {
			steps.push({ 
				id: stepId++, 
				title: 'Book Your Intake Meeting', 
				name: 'Intake Meeting', 
				type: 'meeting' 
			})
		}

		return steps
	}, [])

	const steps = onboardingConfig ? generateSteps(onboardingConfig) : []

	const markStepAsCompleted = useCallback(async (stepId) => {
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
	}, [])

	const loadOnboardingData = useCallback(async () => {
		if (!recordId || recordId.trim() === '') return

		try {
			setIsLoading(true)
			setError(null)
			
			// Use the new API method with recordId from URL
			const onboardingData = await onboardingAPI.getOnboardingByRecordId(recordId)
			
			// Store the onboarding configuration
			setOnboardingConfig(onboardingData)
			
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
	}, [recordId])

	const checkDocumentStatus = useCallback(async () => {
		// Only check if we have a documentId and step 1 is not already completed
		if (documentId && !completedSteps.has(1)) {
			try {
				// Import the pandadoc service dynamically to avoid issues if not configured
				const pandaDocService = (await import('../services/pandadoc')).default
				
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
	}, [documentId, completedSteps, markStepAsCompleted])

	// Load onboarding data when recordId changes
	useEffect(() => {
		loadOnboardingData()
	}, [loadOnboardingData])

	// Check document status when documentId changes
	useEffect(() => {
		if (documentId) {
			// TODO: Uncomment this line to enable document status check
			// checkDocumentStatus()
		}
	}, [documentId, checkDocumentStatus])

	return {
		currentStep,
		setCurrentStep,
		completedSteps,
		setCompletedSteps,
		documentId,
		isLoading,
		error,
		onboardingConfig,
		steps,
		markStepAsCompleted,
		loadOnboardingData,
		checkDocumentStatus
	}
}
