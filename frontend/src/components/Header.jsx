import React from 'react'

const Header = () => {
  return (
    <header className="bg-black border-b" style={{ borderBottomColor: '#cbb26a' }}>
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between h-20 py-2">
          <div className="flex items-center pl-6">
            <img 
              src={`${import.meta.env.BASE_URL}thewell-logo.png`} 
              alt="The Well" 
              className="w-auto object-contain"
              style={{ height: '70px' }}
            />
          </div>
          <div className="text-center flex-1 pr-6">
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#be9e44' }}>
              Welcome to Your Onboarding Journey
            </h1>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
