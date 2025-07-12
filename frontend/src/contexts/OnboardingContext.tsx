import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useOnboarding } from '../hooks/useOnboarding'
import type { OnboardingRecord, OnboardingStep } from '../types/onboarding.types'

interface OnboardingContextType {
  recordId: string
  currentStep: number
  setCurrentStep: (step: number) => void
  completedSteps: Set<number>
  setCompletedSteps: (steps: Set<number> | ((prev: Set<number>) => Set<number>)) => void
  documentId: string | null
  isLoading: boolean
  error: string | null
  onboardingConfig: OnboardingRecord | null
  steps: OnboardingStep[]
  loadOnboardingData: () => Promise<void>
  checkDocumentStatus: () => Promise<void>
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
