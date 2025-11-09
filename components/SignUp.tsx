import React, { useState, useMemo } from 'react';
import { View } from '../App';
import Icon from './icons/index.tsx';
import { useAppContext } from '../hooks/useAppContext';
import { countries, phoneCodes } from '../utils/data';
import { supabase } from '../utils/supabase';

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
    const { brandConfig, setNotification } = useAppContext();
    const [formState, setFormState] = useState({
        businessName: '',
        ownerName: '',
        email: '',
        password: '',
        country: 'US',
        phoneCountryCode: '+1',
        companyPhone: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (formState.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (!logoFile) {
            setError('Company logo is required.');
            return;
        }

        setLoading(true);

        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email: formState.email,
            password: formState.password,
            options: {
                data: {
                    full_name: formState.ownerName,
                }
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        if (user) {
            // 2. Upload logo
            const fileExt = logoFile.name.split('.').pop();
            const filePath = `${user.id}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('company_logos')
                .upload(filePath, logoFile);

            if (uploadError) {
                setError(`Error uploading logo: ${uploadError.message}`);
                // TODO: Clean up created user if this fails
                setLoading(false);
                return;
            }

            // 3. Get public URL for the logo
            const { data: { publicUrl } } = supabase.storage
                .from('company_logos')
                .getPublicUrl(filePath);

            // 4. Call DB function to create tenant and link profile
            const { error: rpcError } = await supabase.rpc('create_tenant_for_user', {
                business_name: formState.businessName,
                owner_name: formState.ownerName,
                company_logo_url: publicUrl
            });

            if (rpcError) {
                setError(`Error creating tenant: ${rpcError.message}`);
                setLoading(false);
                return;
            }
            
            setNotification({ message: 'Sign up successful! Please check your email to verify your account.', type: 'success' });
            onNavigate('verification', { email: formState.email });
        }

        setLoading(false);
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
                    <input name="ownerName" type="text" required placeholder="Your Full Name" value={formState.ownerName} onChange={handleFormChange} className="appearance-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm" />
                    <div>
                        <label className="text-sm font-medium text-slate-400">Company Logo</label>
                        <div className="mt-1 flex items-center space-x-4 p-3 bg-slate-800 border border-slate-600 rounded-md">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo Preview" className="h-16 w-16 rounded-md object-contain bg-white/10" />
                            ) : (
                                <div className="h-16 w-16 rounded-md bg-slate-700 flex items-center justify-center">
                                    <Icon name="briefcase" className="w-8 h-8 text-slate-500" />
                                </div>
                            )}
                            <label htmlFor="logo-upload" className="cursor-pointer bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md text-sm">
                                <span>{logoFile ? 'Change Logo' : 'Upload Logo'}</span>
                                <input id="logo-upload" name="logo" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} required/>
                            </label>
                        </div>
                    </div>
                    <select name="country" value={formState.country} onChange={handleFormChange} className="appearance-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm">
                        {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                     <div className="flex">
                        <select name="phoneCountryCode" value={formState.phoneCountryCode} onChange={handleFormChange} className="appearance-none relative block w-1/3 px-3 py-3 border border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400 rounded-l-md focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm">
                            {phoneCodes.map(pc => <option key={pc.code} value={pc.code}>{pc.name} ({pc.code})</option>)}
                        </select>
                        <input name="companyPhone" type="tel" required placeholder="Company Phone" value={formState.companyPhone} onChange={handleFormChange} className="appearance-none relative block w-2/3 px-3 py-3 border-r border-t border-b border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400 rounded-r-md focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm" />
                    </div>
                    <input name="email" type="email" required placeholder="Email Address" value={formState.email} onChange={handleFormChange} className="appearance-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm" />
                    <div>
                        <input name="password" type="password" required placeholder="Password" value={formState.password} onChange={handleFormChange} className="appearance-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm" />
                        <PasswordStrengthMeter password={formState.password} />
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <div>
                        <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 mt-4 disabled:opacity-50">
                            {loading ? 'Creating Account...' : 'Sign Up'}
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
