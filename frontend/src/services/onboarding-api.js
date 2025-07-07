class OnboardingAPIService {
	constructor() {
		this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
	}

	async getOnboardingByRecordId(recordId) {
		try {
			const url = `${this.baseUrl}/onboarding/record?recordId=${recordId}`
			
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				}
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`)
			}

			const data = await response.json()
			return data.data;
		} catch (error) {
			console.error('Failed to fetch onboarding data by record ID:', error)
			throw error
		}
	}

	async getCheckoutSession(recordId) {
		try {
			const url = `${this.baseUrl}/onboarding/create-checkout-session`
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ recordId })
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`)
			}

			const data = await response.json()
			return data.data.sessionUrl
		} catch (error) {
			console.error('Failed to create checkout session:', error)
			throw error
		}
	}

	// Mark a step as completed
	async completeStep(stepId, metadata = {}) {
		// This method marks a step as completed by sending a POST request to the API
	}
}

export default new OnboardingAPIService()
