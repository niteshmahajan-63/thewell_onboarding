import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { CheckCircle, FileText, Loader2, AlertCircle } from 'lucide-react'
import pandaDocService from '../services/pandadoc'

const PandaDocSigning = ({ onSigningComplete, documentId: propDocumentId }) => {
	const [isDocumentSigned, setIsDocumentSigned] = useState(false)
	const [showEmbedded, setShowEmbedded] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [documentId, setDocumentId] = useState(null)
	const [documentUrl, setDocumentUrl] = useState(null)
	const [error, setError] = useState(null)
	const [configStatus, setConfigStatus] = useState(null)
	const [documentInfo, setDocumentInfo] = useState(null) // New state for document info

	useEffect(() => {
		// Check PandaDoc configuration on component mount
		const config = pandaDocService.getConfigStatus()
		setConfigStatus(config)

		// Listen for messages from PandaDoc iframe or popup
		const handleMessage = (event) => {
			// More specific origin validation
			if (event.origin === 'https://app.pandadoc.com' ||
				event.origin === 'https://pandadoc.com' ||
				event.origin.endsWith('.pandadoc.com')) {

				const { type, data } = event.data || {}

				console.log('PandaDoc message received:', { type, data })

				if (type === 'document_completed' ||
					type === 'document_signed' ||
					type === 'session_view.document.completed') {
					setIsDocumentSigned(true)
					setShowEmbedded(false)
					setIsLoading(false)
					setError(null)

					// Notify parent component
					if (onSigningComplete) {
						onSigningComplete(true, data)
					}
				} else if (type === 'session_view.document.exception' || type === 'error') {
					setError(data?.message || 'An error occurred during signing')
					setIsLoading(false)
				}
			}
		}

		window.addEventListener('message', handleMessage)

		return () => {
			window.removeEventListener('message', handleMessage)
		}
	}, [onSigningComplete])

	const handleStartSigning = async () => {
		setIsLoading(true)
		setError(null)

		try {
			// Check if PandaDoc is properly configured
			if (!pandaDocService.isConfigured()) {
				throw new Error('PandaDoc integration is not properly configured. Please check your environment variables.')
			}

			let currentDocumentId = documentId
			let currentDocumentUrl = documentUrl

			// Get existing document by ID
			if (!currentDocumentId) {
				console.log('Fetching document by ID:', propDocumentId)
				let result = await pandaDocService.getDocumentById(propDocumentId)

				let document = result.document
				currentDocumentId = document.id
				setDocumentId(currentDocumentId)
				setDocumentInfo(result) // Store document info for UI display

				// Use publicUrl from API response
				currentDocumentUrl = result.publicUrl
				if (!currentDocumentUrl) {
					console.error('No public_url or embed_url found. Document fields:', document)
					throw new Error('This document does not have a public or embed URL and cannot be displayed.\nStatus: ' + document.status + '\nID: ' + document.id)
				}
				setDocumentUrl(currentDocumentUrl)

				// Always show the document, even if completed
				console.log('Document status:', document.status)
				// TODO: uncomment this if you want to handle already completed documents
				// if (result.isCompleted) {
				// 	console.log('Document is already completed, marking as signed')
				// 	setIsDocumentSigned(true)
				// 	// Trigger completion callback immediately
				// 	if (onSigningComplete) {
				// 		onSigningComplete(true, { documentId: currentDocumentId })
				// 	}
				// 	return // Don't proceed to show the document
				// }
			}

			// Show document in iframe instead of popup
			setShowEmbedded(true)
			setTimeout(() => {
				embedDocumentInIframe(currentDocumentUrl)
				setIsLoading(false)
			}, 100)

		} catch (error) {
			console.error('Error starting signing process:', error)
			setError(error.message)
			setIsLoading(false)

			// Fallback for demo/development
			if (error.message.includes('not properly configured')) {
				setTimeout(() => {
					setIsDocumentSigned(true)
					if (onSigningComplete) {
						onSigningComplete(true)
					}
				}, 2000)
			}
		}
	}

	const embedDocumentInIframe = (url) => {
		const container = document.getElementById('pandadoc-container')
		if (container) {
			container.innerHTML = `
        <iframe 
          src="${url}" 
          width="100%" 
          height="800" 
          frameborder="0"
          title="Service Agreement"
          class="w-full rounded-lg"
          allow="camera; microphone; fullscreen">
        </iframe>
      `
		}
	}

	if (isDocumentSigned) {
		return (
			<Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 max-w-lg mx-auto">
				<CardContent className="p-8 text-center space-y-6">
					<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
						<CheckCircle className="w-12 h-12 text-green-600" />
					</div>
					<div className="space-y-3">
						<h3 className="text-green-800 font-bold text-xl">
							✓ Document signed successfully!
						</h3>
						<p className="text-green-700">
							Your service agreement has been completed. You can now proceed to the next step.
						</p>
						{documentId && (
							<p className="text-green-600 text-sm">
								Document ID: {documentId}
							</p>
						)}
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="w-full mx-auto">
			<div className="text-center mb-4">
				<h3 className="text-xl font-bold text-gray-900">Service Agreement</h3>
				<p className="text-gray-600 mx-auto">
					Please review and sign our service agreement to begin your journey with The Well.
				</p>
			</div>

			{error && (
				<Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 mb-4">
					<CardContent className="p-4 text-center space-y-2">
						<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
							<AlertCircle className="w-6 h-6 text-red-600" />
						</div>
						<div className="space-y-1">
							<h4 className="text-red-800 font-semibold">Error</h4>
							<p className="text-red-700 text-sm">{error}</p>
						</div>
						<Button
							variant="outline"
							onClick={() => setError(null)}
							className="border-red-300 text-red-700 hover:bg-red-50"
						>
							Dismiss
						</Button>
					</CardContent>
				</Card>
			)}

			{isLoading && (
				<div className="flex justify-center items-center py-4 mb-4">
					<div className="flex items-center space-x-3">
						<Loader2 className="h-5 w-5 animate-spin text-well-primary" />
						<span className="text-gray-600">Loading document...</span>
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

			{showEmbedded && (
				<Card className="bg-white border-gray-200 shadow-lg w-full mt-0">
					<CardContent className="p-0">
						<div id="pandadoc-container" className="w-full rounded-lg overflow-hidden bg-gray-50"></div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}

export default PandaDocSigning
