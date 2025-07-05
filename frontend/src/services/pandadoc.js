// PandaDoc API Service
class PandaDocService {
	constructor() {
		this.apiKey = import.meta.env.VITE_PANDADOC_API_KEY
		this.baseUrl = import.meta.env.VITE_PANDADOC_SANDBOX_MODE === 'true'
			? 'https://api.pandadoc.com'  // Same URL for both sandbox and production
			: 'https://api.pandadoc.com'
		this.isSandbox = import.meta.env.VITE_PANDADOC_SANDBOX_MODE === 'true'
	}

	async makeRequest(endpoint, options = {}) {
		const url = `${this.baseUrl}${endpoint}`
		const config = {
			headers: {
				'Authorization': `API-Key ${this.apiKey}`,
				'Content-Type': 'application/json',
				...options.headers
			},
			...options
		}

		try {
			const response = await fetch(url, config)

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(`PandaDoc API Error: ${response.status} - ${errorData.message || response.statusText}`)
			}

			return await response.json()
		} catch (error) {
			console.error('PandaDoc API Request Failed:', error)
			throw error
		}
	}

	// Helper method to check if API is properly configured
	isConfigured() {
		return !!(this.apiKey)
	}

	// Get configuration status for debugging
	getConfigStatus() {
		return {
			hasApiKey: !!this.apiKey,
			isSandbox: this.isSandbox,
			baseUrl: this.baseUrl
		}
	}

	// Get document by specific document ID
	async getDocumentById(documentId) {
		if (!documentId) {
			throw new Error('Document ID is required')
		}

		console.log('Fetching document by ID:', documentId)

		const document = await this.makeRequest(
			`/public/v1/documents/${documentId}/details`,
			{
				method: 'GET'
			}
		)

		const recipient = document.recipients?.[0];
    	const publicUrl = recipient?.shared_link;

		// Check if document is already completed
		if (document.status === 'document.completed' || document.status === 'document.paid') {
			console.log('Document already completed')
			return {
				document: document,
				isExisting: true,
				isCompleted: true,
				publicUrl
			}
		}

		// Check if document is in a state where it can be signed
		if (document.status === 'document.sent' || document.status === 'document.viewed') {
			console.log('Document ready for signing')
			return {
				document: document,
				isExisting: true,
				isCompleted: false,
				publicUrl
			}
		}

		// Document exists but might need to be sent
		console.log('Document found but may need to be sent, status:', document.status)
		return {
			document: document,
			isExisting: true,
			isCompleted: false,
			publicUrl
		}
	}
}

export default new PandaDocService()
