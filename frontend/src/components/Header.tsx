import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-black border-b" style={{ borderBottomColor: '#cbb26a' }}>
            <div className="max-w-full mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between min-h-[5rem] sm:h-20 py-2 gap-4 sm:gap-0">
                    <div className="flex items-center">
                        <img
                            src={`${import.meta.env.BASE_URL}thewell-logo.png`}
                            alt="The Well"
                            className="w-auto object-contain h-12 sm:h-[70px]"
                        />
                    </div>
                    <div className="text-center flex-1 sm:pr-6">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#be9e44' }}>
                            Welcome to Your Onboarding Journey
                        </h1>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
