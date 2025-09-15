import React, { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import { AlertCircle, FileText, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { useOnboardingContext } from '../contexts/OnboardingContext'

interface PandaDocSigningProps {
	handleStepComplete: (completed: boolean) => void;
}

const PandaDocSigning: React.FC<PandaDocSigningProps> = ({ handleStepComplete }) => {
	const { pandaDocSessionId, pandaDocMode, customPandadocUrl } = useOnboardingContext()
	const [error, setError] = useState<string | null>(null)
	const [showEmbedded, setShowEmbedded] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			// Check if the message is from PandaDoc
			if (event.origin === 'https://app.pandadoc.com' ||
				event.origin === 'https://pandadoc.com' ||
				event.origin.endsWith('.pandadoc.com')) {

				const { type, data } = event.data || {}

				if (type === 'document_completed' ||
					type === 'document_signed' ||
					type === 'session_view.document.completed') {
					setIsLoading(false)
					if (handleStepComplete) {
						handleStepComplete(true)
					}
				} else if (type === 'session_view.document.exception' || type === 'error') {
					setIsLoading(false)
					setError(data?.message || 'An error occurred during signing')
				} else if (type === 'session_view.document.loaded') {
					// Document has loaded in the iframe
					setIsLoading(false)
				}
			}
		}

		window.addEventListener('message', handleMessage)

		return () => {
			window.removeEventListener('message', handleMessage)
		}
	}, [handleStepComplete])

	if (error) {
		return (
			<Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 mb-4 mx-4 sm:mx-0">
				<CardContent className="p-3 sm:p-4 text-center space-y-2">
					<div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
						<AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
					</div>
					<div className="space-y-1">
						<h4 className="text-red-800 font-semibold text-sm sm:text-base">Error</h4>
						<p className="text-red-700 text-xs sm:text-sm">{error}</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	const handleStartSigning = () => {
		setIsLoading(true)
		setError(null)
		setShowEmbedded(true)
		if (pandaDocMode === "custom" && customPandadocUrl) {
			setIsLoading(false)
			window.open(customPandadocUrl, "_blank");
		}
	}

	const handleIframeLoad = () => {
		setIsLoading(false)
	}

	const handleCancel = () => {
		setError(null)
		setShowEmbedded(false)
	}

	const handleSigned = () => {
		setIsLoading(false)
		if (handleStepComplete) {
			handleStepComplete(true)
		}
	}

	return (
		<div className="w-full mx-auto px-4 sm:px-0">
			<div className="text-center mb-4">
				<h3 className="text-lg sm:text-xl font-bold text-gray-900">Service Agreement</h3>
				<p className="text-sm sm:text-base text-gray-600 mx-auto">
					Please review and sign our service agreement to begin your journey with The Well.
				</p>
			</div>

			{isLoading && (
				<div className="flex justify-center items-center py-3 sm:py-4 mb-4">
					<div className="flex items-center space-x-2 sm:space-x-3">
						<Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-well-primary" />
						<span className="text-sm sm:text-base text-gray-600">Loading document...</span>
					</div>
				</div>
			)}

			{!showEmbedded && (
				<div className="flex justify-center mb-4">
					<Button
						onClick={handleStartSigning}
						disabled={isLoading}
						className="bg-well-primary hover:bg-well-dark text-white font-semibold flex items-center space-x-2 px-6 py-2 w-full sm:w-auto"
					>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Loading Document...</span>
							</>
						) : (
							<>
								<FileText className="h-4 w-4" />
								<span>Open Document to Sign</span>
							</>
						)}
					</Button>
				</div>
			)}

			{showEmbedded && pandaDocMode === "regular" && (
				<Card className="bg-white border-gray-200 shadow-lg w-full mt-0">
					<CardContent className="p-0">
						<iframe
							src={`https://app.pandadoc.com/s/${pandaDocSessionId}/`}
							width="100%"
							height="800"
							frameBorder="0"
							title="Service Agreement"
							className="w-full rounded-lg"
							allow="camera; microphone; fullscreen"
							onLoad={handleIframeLoad}
						/>
					</CardContent>
				</Card>
			)}

			{showEmbedded && pandaDocMode === "custom" && (
				<div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-2xl">
					<p className="text-base sm:text-lg font-medium text-gray-800 text-center">
						Have you completed signing the Agreement?
					</p>
					<div className="flex space-x-4">
						<Button
							onClick={handleSigned}
							className="bg-green-600 hover:bg-green-700 text-white px-6"
						>
							Yes, I have Signed
						</Button>
						<Button
							onClick={handleCancel}
							variant="outline"
							className="px-6"
						>
							Cancel
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}

export default PandaDocSigning