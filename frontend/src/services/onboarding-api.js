// Onboarding API Service
import { getMockDataForScenario } from './mock-data'

class OnboardingAPIService {
	constructor() {
		this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
		this.useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false' // Default to true for development
		this.mockScenario = import.meta.env.VITE_MOCK_SCENARIO || 'newUser' // Default scenario
	}

	// Mock data for development
	getMockOnboardingData() {
		return getMockDataForScenario(this.mockScenario)
	}

	async makeRequest(endpoint, options = {}) {
		if (this.useMockData) {
			console.log('[MOCK] API Request:', endpoint, options)
			// Simulate network delay
			await new Promise(resolve => setTimeout(resolve, 500))
			return this.handleMockRequest(endpoint, options)
		}

		const url = `${this.baseUrl}${endpoint}`
		const config = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.getAuthToken()}`,
				...options.headers
			},
			...options
		}

		try {
			const response = await fetch(url, config)

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`)
			}

			return await response.json()
		} catch (error) {
			console.error('API Request Failed:', error)
			throw error
		}
	}

	handleMockRequest(endpoint, options) {
		const mockData = this.getMockOnboardingData()

		switch (endpoint) {
			case '/onboarding/status':
				if (options.method === 'GET') {
					return {
						success: true,
						data: mockData
					}
				}
				break

			case '/onboarding/step/complete':
				if (options.method === 'POST') {
					const { stepId } = JSON.parse(options.body || '{}')
					console.log('[MOCK] Marking step as completed:', stepId)
					return {
						success: true,
						data: {
							stepId,
							completedAt: new Date().toISOString()
						}
					}
				}
				break

			case '/onboarding/step/update':
				if (options.method === 'POST') {
					const { stepId, status, metadata } = JSON.parse(options.body || '{}')
					console.log('[MOCK] Updating step:', { stepId, status, metadata })
					return {
						success: true,
						data: {
							stepId,
							status,
							metadata,
							updatedAt: new Date().toISOString()
						}
					}
				}
				break

			default:
				throw new Error(`Mock endpoint not implemented: ${endpoint}`)
		}

		throw new Error(`Mock method not implemented: ${options.method} ${endpoint}`)
	}

	// Get onboarding status and step information
	async getOnboardingStatus(userId = null) {
		try {
			const response = await this.makeRequest('/onboarding/status', {
				method: 'GET'
			})

			return response.data
		} catch (error) {
			console.error('Failed to fetch onboarding status:', error)
			throw error
		}
	}

	// Get onboarding data by record ID
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

	// Mark a step as completed
	async completeStep(stepId, metadata = {}) {
		try {
			const response = await this.makeRequest('/onboarding/step/complete', {
				method: 'POST',
				body: JSON.stringify({
					stepId,
					metadata,
					completedAt: new Date().toISOString()
				})
			})

			return response.data
		} catch (error) {
			console.error('Failed to complete step:', error)
			throw error
		}
	}

	// Update step status and metadata
	async updateStep(stepId, status, metadata = {}) {
		try {
			const response = await this.makeRequest('/onboarding/step/update', {
				method: 'POST',
				body: JSON.stringify({
					stepId,
					status,
					metadata,
					updatedAt: new Date().toISOString()
				})
			})

			return response.data
		} catch (error) {
			console.error('Failed to update step:', error)
			throw error
		}
	}

	// Helper method to check if API is using mock data
	isUsingMockData() {
		return this.useMockData
	}

	// Set mock scenario for testing
	setMockScenario(scenario) {
		this.mockScenario = scenario
		console.log('Mock scenario changed to:', scenario)
	}

	// Get available mock scenarios
	getAvailableScenarios() {
		return ['newUser', 'agreementSigned', 'paymentCompleted', 'fullyCompleted']
	}

	// Get current mock scenario
	getCurrentScenario() {
		return this.mockScenario
	}

	// Get configuration status for debugging
	getConfigStatus() {
		return {
			baseUrl: this.baseUrl,
			useMockData: this.useMockData,
			hasAuthToken: !!this.getAuthToken()
		}
	}
}

export default new OnboardingAPIService()
