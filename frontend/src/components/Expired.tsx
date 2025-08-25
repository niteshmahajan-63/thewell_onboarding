import React from 'react'

const Expired: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="text-center mt-8">
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">Link Expired</h2>
                <p className="text-gray-400 mb-6 sm:mb-8 max-w-md text-sm sm:text-base px-4 sm:px-0 mx-auto text-center">
                    The link you’re trying to access is no longer valid. Please contact <strong>The Well</strong> to request a new link.
                </p>
            </div>
        </div>
    )
}

export default Expired