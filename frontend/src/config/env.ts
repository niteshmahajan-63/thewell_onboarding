// Environment variables for frontend application
export const env = {
    STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    API_URL: import.meta.env.VITE_API_URL || '',
    APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'https://onboarding.thewell.solutions/payments',
};
