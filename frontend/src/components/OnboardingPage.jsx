import { useParams, Navigate } from 'react-router-dom'
import { OnboardingProvider } from '../contexts/OnboardingContext'
import Header from './Header'
import Footer from './Footer'
import OnboardingContent from './OnboardingContent'

/**
 * OnboardingPage component - handles routing and provides context
 */
const OnboardingPage = () => {
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
