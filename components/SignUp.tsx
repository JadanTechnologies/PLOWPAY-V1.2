import React, { useState, useMemo } from 'react';
import { View } from '../App';
import Icon from './icons/index.tsx';
import { useAppContext } from '../hooks/useAppContext';

interface SignUpProps {
  onNavigate: (view: View, data?: any) => void;
}

const PasswordStrengthMeter: React.FC<{ password?: string }> = ({ password = '' }) => {
    const strength = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/\d/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }, [password]);

    const strengthText = ['Very Weak', 'Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][strength];
    const strengthColor = ['bg-red-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-500'][strength];
    const width = `${(strength / 5) * 100}%`;

    if (!password) return null;

    return (
        <div>
            <div className="w-full bg-slate-600 rounded-full h-2 my-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
                    style={{ width }}
                ></div>
            </div>
            <p className={`text-xs font-semibold ${strength < 3 ? 'text-red-400' : 'text-green-400'}`}>
                Password strength: {strengthText}
            </p>
        </div>
    );
};


const SignUp: React.FC<SignUpProps> = ({ onNavigate }) => {
    const { addTenant, subscriptionPlans, brandConfig, setNotification } = useAppContext();
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

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formState.businessName || !formState.fullName || !formState.email || !formState.password) {
            setError('All fields are required.');
            return;
        }
        if (formState.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        const result = await addTenant({
            businessName: formState.businessName,
            ownerName: formState.fullName,
            email: formState.email,
            username: formState.email, // Simple default
            password: formState.password,
            planId: subscriptionPlans[0]?.id || '' // Default to first plan
        });
        
        if (result.success) {
            setNotification({ message: 'Sign up successful! Please check your email to verify your account.', type: 'success' });
            onNavigate('verification', { email: formState.email });
        } else {
             setNotification({ message: result.message, type: 'error' });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl relative">
                <button 
                  onClick={() => onNavigate('landing')} 
                  className="absolute top-4 left-4 text-slate-400 hover:text-cyan-400 transition-colors flex items-center text-sm font-semibold"
                >
                    <Icon name="chevronLeft" className="w-5 h-5 mr-1" />
                    Back to Home
                </button>
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-white">Create your {brandConfig.name} account</h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Start your 14-day free trial. No credit card required.
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSignUp}>
                    <input name="businessName" type="text" required placeholder="Business Name" value={formState.businessName} onChange={handleFormChange} className="appearance-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm" />
                    <input name="fullName" type="text" required placeholder="Your Full Name" value={formState.fullName} onChange={handleFormChange} className="appearance-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm" />
                    <input name="email" type="email" required placeholder="Email Address" value={formState.email} onChange={handleFormChange} className="appearance-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm" />
                    <div>
                        <input name="password" type="password" required placeholder="Password" value={formState.password} onChange={handleFormChange} className="appearance-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm" />
                        <PasswordStrengthMeter password={formState.password} />
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <div>
                        <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 mt-4">
                            Sign Up
                        </button>
                    </div>
                </form>

                <p className="mt-2 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <button onClick={() => onNavigate('login')} className="font-medium text-cyan-400 hover:text-cyan-300">
                        Log In
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignUp;