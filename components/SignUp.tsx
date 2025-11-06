import React, { useState } from 'react';
import { View } from '../App';
import Icon from './icons';
import { useAppContext } from '../hooks/useAppContext';

interface SignUpProps {
  onNavigate: (view: View) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onNavigate }) => {
    const { addTenant, subscriptionPlans, brandConfig } = useAppContext();
    const [formState, setFormState] = useState({
        businessName: '',
        fullName: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formState.businessName || !formState.fullName || !formState.email || !formState.password) {
            setError('All fields are required.');
            return;
        }
        if (formState.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        addTenant({
            businessName: formState.businessName,
            ownerName: formState.fullName,
            email: formState.email,
            username: formState.email, // Simple default
            password: formState.password,
            planId: subscriptionPlans[0]?.id || '' // Default to first plan
        });

        alert('Sign up successful! You can now log in with your email and password.');
        onNavigate('login');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-2xl relative">
                <button 
                  onClick={() => onNavigate('landing')} 
                  className="absolute top-4 left-4 text-gray-400 hover:text-indigo-400 transition-colors flex items-center text-sm font-semibold"
                >
                    <Icon name="chevronLeft" className="w-5 h-5 mr-1" />
                    Back to Home
                </button>
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-white">Create your {brandConfig.name} account</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Start your 14-day free trial. No credit card required.
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSignUp}>
                    <input name="businessName" type="text" required placeholder="Business Name" value={formState.businessName} onChange={handleFormChange} className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    <input name="fullName" type="text" required placeholder="Your Full Name" value={formState.fullName} onChange={handleFormChange} className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    <input name="email" type="email" required placeholder="Email Address" value={formState.email} onChange={handleFormChange} className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    <input name="password" type="password" required placeholder="Password" value={formState.password} onChange={handleFormChange} className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <div>
                        <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 mt-4">
                            Sign Up
                        </button>
                    </div>
                </form>

                <p className="mt-2 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <button onClick={() => onNavigate('login')} className="font-medium text-indigo-400 hover:text-indigo-300">
                        Log In
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
