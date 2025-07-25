import React from 'react'
import Header from './Header'
import Footer from './Footer'

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Header />

            <main className="flex-1 bg-black flex items-center justify-center pt-8 sm:pt-16 pb-8 px-4 sm:px-8">
                <div className="text-center">
                    <h1 className="text-4xl sm:text-6xl font-bold text-well-primary mb-2 sm:mb-4">404</h1>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">Page Not Found</h2>
                    <p className="text-gray-400 mb-6 sm:mb-8 max-w-md text-sm sm:text-base px-4 sm:px-0">
                        The onboarding page you're looking for doesn't exist.
                        Please check the URL and make sure it includes a valid record ID.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default NotFound