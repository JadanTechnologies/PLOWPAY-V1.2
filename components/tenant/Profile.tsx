

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Tenant } from '../../types';
import { countries, states, phoneCodes } from '../../utils/data';

const TenantProfile: React.FC = () => {
    const { currentTenant, updateTenantProfile } = useAppContext();
    const [formState, setFormState] = useState<Partial<Tenant>>({});
    const [availableStates, setAvailableStates] = useState<{code: string, name: string}[]>([]);

    useEffect(() => {
        if (currentTenant) {
            setFormState(currentTenant);
            if (currentTenant.country) {
                setAvailableStates(states[currentTenant.country] || []);
            }
        }
    }, [currentTenant]);

    useEffect(() => {
        if (formState.country) {
            setAvailableStates(states[formState.country] || []);
        } else {
            setAvailableStates([]);
        }
    }, [formState.country]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateTenantProfile(formState);
        alert('Profile updated successfully!');
    };

    if (!currentTenant) return <div>Loading profile...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="p-6 bg-slate-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-white">My Profile</h2>
                <p className="text-slate-400 mt-1">Update your personal and business information.</p>
            </div>

            {/* Business Information */}
            <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-slate-700 pb-2">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Business Name</label>
                        <input type="text" name="businessName" value={formState.businessName || ''} onChange={handleChange} className="w-full mt-1 py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-400">Company Phone</label>
                        <div className="flex mt-1">
                            <select name="phoneCountryCode" value={formState.phoneCountryCode || ''} onChange={handleChange} className="bg-slate-700 border border-slate-600 rounded-l-md p-2 text-white">
                                {phoneCodes.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                            </select>
                            <input type="tel" name="companyPhone" value={formState.companyPhone || ''} onChange={handleChange} className="w-full py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-r-md"/>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-400">Company Address</label>
                        <input type="text" name="companyAddress" value={formState.companyAddress || ''} onChange={handleChange} className="w-full mt-1 py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Country</label>
                        <select name="country" value={formState.country || ''} onChange={handleChange} className="w-full mt-1 py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md">
                            <option value="">Select a country</option>
                            {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-400">State / Province</label>
                        <select name="state" value={formState.state || ''} onChange={handleChange} disabled={!availableStates.length} className="w-full mt-1 py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md disabled:bg-slate-700/50">
                             <option value="">Select a state</option>
                            {availableStates.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

             {/* Personal Information */}
            <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-slate-700 pb-2">Personal Information</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Full Name</label>
                        <input type="text" name="ownerName" value={formState.ownerName || ''} onChange={handleChange} className="w-full mt-1 py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Email Address</label>
                        <input type="email" value={formState.email || ''} readOnly className="w-full mt-1 py-2 px-3 text-slate-400 bg-slate-700/50 border border-slate-600 rounded-md cursor-not-allowed"/>
                         <p className="text-xs text-slate-500 mt-1">Email address cannot be changed.</p>
                    </div>
                </div>
            </div>

            <div className="text-right">
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-md">
                    Save Changes
                </button>
            </div>
        </form>
    );
};

export default TenantProfile;