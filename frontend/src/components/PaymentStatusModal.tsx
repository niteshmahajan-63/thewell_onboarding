import React from 'react';

interface PaymentStatusModalProps {
    status: 'processing' | 'succeeded' | 'failed';
    message: string;
    onClose?: () => void;
}

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({ status, message, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
                <div className={`text-center ${
                    status === 'succeeded' ? 'text-[#967D35]' : 
                    status === 'failed' ? 'text-red-600' : 
                    'text-[#967D35]'
                }`}>
                    {status === 'processing' && (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 border-4 border-[#BE9E44] border-t-transparent rounded-full animate-spin"></div>
                            <h3 className="text-xl font-semibold">Processing Payment</h3>
                            <p className="text-gray-600 text-sm">{message}</p>
                        </div>
                    )}

                    {status === 'succeeded' && (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#F7F4EA]">
                                <svg className="w-8 h-8 text-[#BE9E44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold">Payment Successful</h3>
                            <p className="text-gray-600 text-sm">{message}</p>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-red-600">Payment Failed</h3>
                            <p className="text-gray-600 text-sm">{message}</p>
                            {onClose && (
                                <button
                                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                    onClick={onClose}
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentStatusModal;
