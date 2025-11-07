import React, { useState, useEffect } from 'react';
import { View } from '../App';
import Icon from './icons/index.tsx';
import { useAppContext } from '../hooks/useAppContext';

interface VerificationPageProps {
  email: string | null;
  onNavigate: (view: View) => void;
}

const VerificationPage: React.FC<VerificationPageProps> = ({ email, onNavigate }) => {
    const { brandConfig, verifyTenant } = useAppContext();
    const [isVerifying, setIsVerifying] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const handleVerification = () => {
        if (!email) return;
        setIsVerifying(true);
        // Simulate API call
        setTimeout(() => {
            verifyTenant(email);
            const interval = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);

            setTimeout(() => {
                clearInterval(interval);
                onNavigate('login');
            }, 5000);

        }, 1000);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-2xl text-center">
                <div className="inline-block mx-auto">
                    {brandConfig.logoUrl ? (
                        <img src={brandConfig.logoUrl} alt={`${brandConfig.name} Logo`} className="h-12 w-auto" />
                    ) : (
                        <svg className="w-12 h-12 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.54-.403 1.25-.624 1.968-.624a4.58 4.58 0 0 1 .844.119" />
                        </svg>
                    )}
                </div>
                 <h2 className="mt-4 text-3xl font-extrabold text-white">Verify Your Email</h2>

                {isVerifying ? (
                     <div>
                        <Icon name="check" className="w-16 h-16 mx-auto text-green-400 mb-4" />
                        <p className="text-lg text-gray-300">Account verified successfully!</p>
                        <p className="text-gray-400 mt-2">Redirecting to login in {countdown} seconds...</p>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-400">
                            Thank you for signing up! A verification link has been sent to <strong className="text-indigo-400">{email}</strong>. Please check your inbox to activate your account.
                        </p>
                        <div className="mt-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                             <p className="text-sm text-yellow-300 mb-3">This is a demo environment. No email has been sent.</p>
                            <button
                                onClick={handleVerification}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Simulate Email Verification
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerificationPage;