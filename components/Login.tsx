

import React, { useState } from 'react';
import Icon from './icons/index.tsx';
import { useAppContext } from '../hooks/useAppContext';
import { View } from '../App';

interface LoginProps {
  onNavigate: (view: View) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { brandConfig, login } = useAppContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { success, message } = await login(username, password);

    if (!success) {
        setError(message);
    }
    // On success, the effect in AppContext will handle navigation.
    
    setLoading(false);
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 rounded-2xl shadow-2xl relative border border-slate-800">
        <button 
          onClick={() => onNavigate('landing')} 
          className="absolute top-4 left-4 text-slate-400 hover:text-cyan-400 transition-colors flex items-center text-sm font-semibold"
        >
            <Icon name="chevronLeft" className="w-5 h-5 mr-1" />
            Back to Home
        </button>

        <div className="text-center">
          <div className="inline-block">
             {brandConfig.logoUrl ? (
                <img src={brandConfig.logoUrl} alt={`${brandConfig.name} Logo`} className="h-12 w-auto" />
              ) : (
                <svg className="w-12 h-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.54-.403 1.25-.624 1.968-.624a4.58 4.58 0 0 1 .844.119" />
                </svg>
              )}
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-white">Sign in to {brandConfig.name}</h2>
          <p className="mt-2 text-sm text-slate-400">
            Welcome back! Please enter your details.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-700 text-slate-200 placeholder-slate-400 rounded-t-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
                placeholder="Username (e.g. super, tenant)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-700 text-slate-200 placeholder-slate-400 rounded-b-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
                placeholder="Password (e.g. 12345)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <div className="text-sm">
                <button type="button" onClick={() => onNavigate('forgot_password')} className="font-medium text-cyan-400 hover:text-cyan-300">
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
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <button onClick={() => onNavigate('signup')} className="font-medium text-cyan-400 hover:text-cyan-300">
                Sign up
            </button>
        </p>
      </div>
    </div>
  );
};

export default Login;