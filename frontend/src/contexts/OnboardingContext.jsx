import { createContext, useContext } from 'react'
import { useOnboarding } from '../hooks/useOnboarding'

const OnboardingContext = createContext()

/**
 * OnboardingProvider component that wraps the app and provides onboarding state
 */
export const OnboardingProvider = ({ children, recordId }) => {
	const onboardingState = useOnboarding(recordId)

	return (
		<OnboardingContext.Provider value={onboardingState}>
			{children}
		</OnboardingContext.Provider>
	)
}

/**
 * Custom hook to access onboarding context
 */
export const useOnboardingContext = () => {
	const context = useContext(OnboardingContext)
	if (!context) {
		throw new Error('useOnboardingContext must be used within an OnboardingProvider')
	}
	return context
}
