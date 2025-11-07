import React, { useState } from 'react';
import Icon from './icons/index.tsx';
import { useAppContext } from '../hooks/useAppContext';
import { View } from '../App';
import { AdminUser, Tenant } from '../types';

interface LoginProps {
  onLoginSuccess: (user: AdminUser | Tenant) => void;
  onNavigate: (view: View) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { brandConfig, updateLastLogin, tenants, adminUsers } = useAppContext();


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const lowerCaseInput = email.toLowerCase();
    // In a real app, this would be the request IP. We simulate it here.
    const simulatedIp = '203.0.113.42'; 

    const adminUser = adminUsers.find(u => (u.username?.toLowerCase() === lowerCaseInput || u.email.toLowerCase() === lowerCaseInput) && u.password === password);
    if (adminUser) {
        updateLastLogin(lowerCaseInput, simulatedIp);
        onLoginSuccess(adminUser);
        return;
    }

    const tenantUser = tenants.find(t => (t.username.toLowerCase() === lowerCaseInput || t.email.toLowerCase() === lowerCaseInput) && t.password === password);
    if (tenantUser) {
       updateLastLogin(lowerCaseInput, simulatedIp);
       onLoginSuccess(tenantUser);
       return;
    }

    setError('Invalid credentials. Please try again.');
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
          <div className="inline-block">
             {brandConfig.logoUrl ? (
                <img src={brandConfig.logoUrl} alt={`${brandConfig.name} Logo`} className="h-12 w-auto" />
              ) : (
                <svg className="w-12 h-12 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.54-.403 1.25-.624 1.968-.624a4.58 4.58 0 0 1 .844.119" />
                </svg>
              )}
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-white">Sign in to {brandConfig.name}</h2>
          <p className="mt-2 text-sm text-gray-400">
            Welcome back! Please enter your details.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Username or Email</label>
              <input
                id="email-address"
                name="email"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username or Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-sr" className="sr-only">Password</label>
              <input
                id="password-sr"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <div className="text-sm">
                <button onClick={() => onNavigate('forgot_password')} className="font-medium text-indigo-400 hover:text-indigo-300">
                    Forgot your password?
                </button>
            </div>
          </div>


          {error && (
            <div className="flex items-center text-red-400">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
            >
              Sign In
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <button onClick={() => onNavigate('signup')} className="font-medium text-indigo-400 hover:text-indigo-300">
                Sign up
            </button>
        </p>

        <div className="text-center text-sm text-gray-500 bg-gray-900/50 p-3 rounded-md border border-gray-700">
            <p className="font-semibold text-gray-400 mb-2">Use these credentials for the demo:</p>
            <p><strong className="text-gray-300">Super Admin:</strong> super</p>
            <p><strong className="text-gray-300">Password:</strong> super</p>
            <div className="my-2 border-t border-gray-700"></div>
            <p><strong className="text-gray-300">Tenant:</strong> tenant</p>
            <p><strong className="text-gray-300">Password:</strong> tenant</p>
        </div>
      </div>
    </div>
  );
};

export default Login;