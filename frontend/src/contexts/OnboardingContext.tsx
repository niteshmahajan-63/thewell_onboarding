import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useOnboarding } from '../hooks/useOnboarding'
import type { OnboardingRecord, OnboardingStep } from '../types/onboarding.types'

interface OnboardingContextType {
  recordId: string
  currentStep: number
  setCurrentStep: (step: number) => void
  completedSteps: Set<string>
  setCompletedSteps: (steps: Set<string> | ((prev: Set<string>) => Set<string>)) => void
  pandaDocSessionId: string | null
  companyName: string | null
  amount: number | null
  email: string | null
  calendlyBookingURL: string | null
  isLoading: boolean
  error: string | null
  onboardingConfig: OnboardingRecord | null
  steps: OnboardingStep[]
  loadOnboardingData: () => Promise<void>
}

interface OnboardingProviderProps {
  children: ReactNode
  recordId: string
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export const OnboardingProvider = ({ children, recordId }: OnboardingProviderProps) => {
	const onboardingState = useOnboarding(recordId)

	return (
		<OnboardingContext.Provider value={onboardingState}>
			{children}
		</OnboardingContext.Provider>
	)
}

export const useOnboardingContext = (): OnboardingContextType => {
	const context = useContext(OnboardingContext)
	if (!context) {
		throw new Error('useOnboardingContext must be used within an OnboardingProvider')
	}
	return context
}
