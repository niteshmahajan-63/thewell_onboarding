import { useState, useEffect, useCallback } from 'react'
import { getOnboardingByRecordId } from '../services/onboardingService'
import type { OnboardingStep, OnboardingRecord } from '../types/onboarding.types'

export const useOnboarding = (recordId: string) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
    const [pandaDocSessionId, setPandaDocSessionId] = useState<string | null>(null)
    const [companyName, setCompanyName] = useState<string | null>(null)
    const [amount, setAmount] = useState<number | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const [calendlyBookingURL, setCalendlyBookingURL] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [onboardingConfig, setOnboardingConfig] = useState<OnboardingRecord | null>(null)
    const [steps, setSteps] = useState<OnboardingStep[]>([])

    const loadOnboardingData = useCallback(async () => {
        if (!recordId || recordId.trim() === '') return

        try {
            setIsLoading(true)
            setError(null)

            const response = await getOnboardingByRecordId(recordId)
            const record = response.data.record
            const steps = response.data.steps
            const pandadoc_session_id = response.data.pandadoc_session_id
            setEmail(record.Customer_Email || null)

            setOnboardingConfig(record)
            setSteps(steps)
            setPandaDocSessionId(pandadoc_session_id)
            setCompanyName(record.Company_Name || null)
            setAmount(record.Amount || null)
            setCalendlyBookingURL(record.Calendly_Booking_URL.value)

            if (record.Agreement_Required === "No" && record.Stripe_Required === "No") {
                setCurrentStep(3);
            } else if (record.Agreement_Required === "No") {
                setCurrentStep(2);
            }
            
            const completedStepIds = new Set<string>()
            steps.forEach(step => {
                if (step.isCompleted) {
                    const stepId = String(step.id);
                    completedStepIds.add(stepId);
                }
            })
            setCompletedSteps(completedStepIds)

        } catch (error) {
            console.error('Failed to load onboarding data:', error)
            setError(error instanceof Error ? error.message : 'Failed to load onboarding data')
        } finally {
            setIsLoading(false)
        }
    }, [recordId])

    useEffect(() => {
        loadOnboardingData()
    }, [loadOnboardingData])

    return {
        recordId,
        currentStep,
        setCurrentStep,
        completedSteps,
        setCompletedSteps,
        pandaDocSessionId,
        companyName,
        amount,
        email,
        calendlyBookingURL,
        isLoading,
        error,
        onboardingConfig,
        steps,
        loadOnboardingData,
    }
}
