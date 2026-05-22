import React from 'react'

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer style={{ backgroundColor: '#111111', fontFamily: 'Inter, sans-serif' }}>

            {/* ── Main 3-column grid ── */}
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-14 sm:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Left – Logo */}
                    <div
                        className="flex flex-col items-center justify-center pb-10 md:pb-0 md:pr-16"
                        style={{ borderRight: '1px solid #3a3020' }}
                    >
                        <img
                            src={`${import.meta.env.BASE_URL}thewell-logo.png`}
                            alt="The Well"
                            className="h-28 sm:h-36 w-auto object-contain mb-4"
                        />
                    </div>

                    {/* Right – Get In Touch */}
                    <div className="pt-10 md:pt-0 md:pl-16">
                        <h3 className="mb-7 uppercase" style={{ fontFamily: 'Cinzel, serif', color: '#BE9E44', fontSize: '16px', fontWeight: 700, lineHeight: '30px', letterSpacing: '2.5px' }}>
                            Get In Touch
                        </h3>
                        <div className="space-y-5">
                            <p style={{ color: '#F8F5F0', fontSize: '16px', fontWeight: 400, lineHeight: '30px' }}>
                                21501 N. 78th Ave #100&nbsp;&nbsp;Peoria,<br />AZ 85382
                            </p>
                            <p className="flex items-center gap-2.5" style={{ color: '#F8F5F0', fontSize: '16px', fontWeight: 400, lineHeight: '30px' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#BE9E44', flexShrink: 0 }}>
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                </svg>
                                952-900-3810
                            </p>
                            <p className="flex items-center gap-2.5" style={{ color: '#F8F5F0', fontSize: '16px', fontWeight: 400, lineHeight: '30px' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#BE9E44', flexShrink: 0 }}>
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                                info@emailthewell.com
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Bottom bar ── */}
            <div style={{ borderTop: '1px solid #2a2218', backgroundColor: '#0d0d0d' }}>
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-1.5" style={{ color: '#F8F5F0', fontSize: '16px', fontWeight: 400, lineHeight: '22px' }}>
                        <span>&copy;{currentYear} The Well Recruiting Solutions. All Rights Reserved.</span>
                    </div>
                </div>
            </div>

        </footer>
    )
}

export default Footer