export const mockOnboardingScenarios = {
	newUser: {
		documentId: 'QBJZC8ZGVeD4EfidQEonGY',
		currentStep: 1,
		completedSteps: []
	},

	agreementSigned: {
		documentId: 'QBJZC8ZGVeD4EfidQEonGY',
		currentStep: 2,
		completedSteps: [1]
	},

	paymentCompleted: {
		documentId: 'QBJZC8ZGVeD4EfidQEonGY',
		currentStep: 3,
		completedSteps: [1, 2]
	},

	fullyCompleted: {
		documentId: 'QBJZC8ZGVeD4EfidQEonGY',
		currentStep: 3,
		completedSteps: [1, 2, 3]
	}
}

export const getMockDataForScenario = (scenario = 'newUser') => {
	return mockOnboardingScenarios[scenario] || mockOnboardingScenarios.newUser
}
