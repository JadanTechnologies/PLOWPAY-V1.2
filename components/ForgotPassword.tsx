import React, { useState } from 'react';
import { View } from '../App';
import Icon from './icons/index.tsx';
import { useAppContext } from '../hooks/useAppContext';

interface ForgotPasswordProps {
  onNavigate: (view: View) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
    const { brandConfig } = useAppContext();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd make an API call here.
        // We'll just simulate the success state.
        setSubmitted(true);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-2xl relative">
                <button 
                  onClick={() => onNavigate('login')} 
                  className="absolute top-4 left-4 text-gray-400 hover:text-indigo-400 transition-colors flex items-center text-sm font-semibold"
                >
                    <Icon name="chevronLeft" className="w-5 h-5 mr-1" />
                    Back to Log In
                </button>

                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-white">Reset your password</h2>
                </div>

                {submitted ? (
                    <div className="text-center">
                        <Icon name="check" className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <p className="text-gray-300">
                            If an account with the email <strong>{email}</strong> exists, a password reset link has been sent. Please check your inbox.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-center text-sm text-gray-400">
                            Enter your email address and we will send you a link to reset your password.
                        </p>
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <input
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Email Address"
                            />
                            <div>
                                <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800">
                                    Send Reset Link
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;