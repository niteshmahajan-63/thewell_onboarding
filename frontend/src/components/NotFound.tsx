import React from 'react'
import Header from './Header'
import Footer from './Footer'

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1A1A1A' }}>
            <Header />

            <main className="flex-1 flex items-center justify-center pt-8 sm:pt-16 pb-8 px-4 sm:px-8" style={{ backgroundColor: '#1A1A1A' }}>
                <div className="text-center">
                    <p className="font-bold mb-2 sm:mb-4" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', color: '#BE9E44', fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>404</p>
                    <h2 className="text-xl sm:text-2xl font-medium uppercase mb-3 sm:mb-5" style={{ color: '#BE9E44', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>Page Not Found</h2>
                    <p className="mb-6 sm:mb-8 max-w-md text-sm sm:text-base px-4 sm:px-0" style={{ color: '#C2BDB4', fontFamily: 'Inter, sans-serif' }}>
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