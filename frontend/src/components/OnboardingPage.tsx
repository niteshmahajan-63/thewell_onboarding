import React from 'react'
import { Navigate, useParams } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { OnboardingProvider } from '../contexts/OnboardingContext'
import OnboardingContent from './OnboardingContent'

const OnboardingPage: React.FC = () => {
    const { recordId } = useParams()

	// Validate recordId from URL
	if (!recordId || recordId.trim() === '') {
		return <Navigate to="/404" replace />
	}

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Header />

            <main className="flex-1 bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <OnboardingProvider recordId={recordId}>
                        <OnboardingContent />
                    </OnboardingProvider>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default OnboardingPage