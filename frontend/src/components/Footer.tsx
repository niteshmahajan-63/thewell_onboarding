import React from 'react'

const Footer: React.FC = () => {
    return (
        <footer className="bg-black border-t mt-8 sm:mt-16" style={{ borderTopColor: '#cbb26a' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="flex flex-col items-center space-y-6 sm:space-y-8">
                    <div className="flex items-center">
                        <img
                            src={`${import.meta.env.BASE_URL}thewell-logo.png`}
                            alt="The Well"
                            className="h-16 sm:h-20 w-auto object-contain"
                        />
                    </div>

                    <div className="text-center text-gray-400 space-y-1 sm:space-y-2">
                        <p className="font-medium text-sm sm:text-base">The Well Recruiting Solutions</p>
                        <p className="text-sm sm:text-base">21501 N. 78th Ave #100</p>
                        <p className="text-sm sm:text-base">Peoria, AZ 85382</p>
                        <p className="font-medium text-sm sm:text-base" style={{ color: '#cbb26a' }}>info@emailthewell.com</p>
                    </div>

                    <div className="flex space-x-6 sm:space-x-8">
                        <a
                            href="https://www.youtube.com/@TheWell.Solutions"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors transform hover:scale-110"
                            style={{ color: '#cbb26a' }}
                            title="YouTube"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </a>
                        <a
                            href="https://www.linkedin.com/company/the-well-recruiting-solutions/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors transform hover:scale-110"
                            style={{ color: '#cbb26a' }}
                            title="LinkedIn"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    </div>

                    <div className="text-center pt-6 sm:pt-8 w-full" style={{ borderTopColor: '#cbb26a', borderTopWidth: '1px', borderTopStyle: 'solid' }}>
                        <p className="text-xs sm:text-sm" style={{ color: '#cbb26a' }}>&copy;{new Date().getFullYear()} The Well. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer