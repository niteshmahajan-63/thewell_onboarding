import { useState, useEffect, useCallback } from 'react'
import { getOnboardingByRecordId, getOnboardingSteps } from '../services/onboardingService'
import type { OnboardingStep, OnboardingRecord } from '../types/onboarding.types'
import pandaDocService from '../services/pandadoc'

export const useOnboarding = (recordId: string) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
    const [documentId, setDocumentId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [onboardingConfig, setOnboardingConfig] = useState<OnboardingRecord | null>(null)
    const [steps, setSteps] = useState<OnboardingStep[]>([])

    useEffect(() => {
        const fetchSteps = async () => {
            if (recordId) {
                try {
                    const response = await getOnboardingSteps(recordId)
                    setSteps(response.data)
                } catch (err) {
                    console.error('Failed to fetch onboarding steps:', err)
                    setError(err instanceof Error ? err.message : 'Failed to fetch onboarding steps')
                }
            }
        }
        fetchSteps()
    }, [recordId])

    const loadOnboardingData = useCallback(async () => {
        if (!recordId || recordId.trim() === '') return

        try {
            setIsLoading(true)
            setError(null)

            const response = await getOnboardingByRecordId(recordId)
            const onboardingData = response.data

            setOnboardingConfig(onboardingData)

            if (onboardingData.PandaDoc_ID) {
                setDocumentId(onboardingData.PandaDoc_ID)
            }

        } catch (error) {
            console.error('Failed to load onboarding data:', error)
            setError(error instanceof Error ? error.message : 'Failed to load onboarding data')
        } finally {
            setIsLoading(false)
        }
    }, [recordId])

    const checkDocumentStatus = useCallback(async () => {
        if (!documentId || completedSteps.has(1)) {
            return;
        }

        try {
            if (!pandaDocService.isConfigured()) {
                console.log('PandaDoc service is not configured');
                return;
            }

            const result = await pandaDocService.getDocumentById(documentId);

            if (result.isCompleted) {
                console.log('Document is already completed on page load');

                setCompletedSteps(prevSteps => {
                    const newSteps = new Set(prevSteps);
                    newSteps.add(1);
                    return newSteps;
                });

                setCurrentStep(currentStepValue =>
                    currentStepValue === 1 ? 2 : currentStepValue
                );
            } else {
                console.log('Document is not yet completed, status:', result.document.status);
            }
        } catch (error) {
            console.error('Error checking document status:',
                error instanceof Error ? error.message : 'Unknown error');
        }
    }, [documentId, completedSteps])

    useEffect(() => {
        loadOnboardingData()
    }, [loadOnboardingData])

    useEffect(() => {
        if (documentId) {
            checkDocumentStatus()
        }
    }, [documentId, checkDocumentStatus])

    return {
        recordId,
        currentStep,
        setCurrentStep,
        completedSteps,
        setCompletedSteps,
        documentId,
        isLoading,
        error,
        onboardingConfig,
        steps,
        loadOnboardingData,
        checkDocumentStatus
    }
}
