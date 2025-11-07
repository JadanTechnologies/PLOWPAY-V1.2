import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { AdminUser } from '../../types';
import Icon from '/components/icons/index.tsx';

const SuperAdminProfile: React.FC = () => {
    const { currentAdminUser, updateAdminProfile } = useAppContext();
    const [formState, setFormState] = useState<Partial<AdminUser>>({});
    
    useEffect(() => {
        if (currentAdminUser) {
            setFormState(currentAdminUser);
        }
    }, [currentAdminUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateAdminProfile(formState);
        alert('Profile updated successfully!');
    };
    
    if (!currentAdminUser) return <div>Loading profile...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-white">My Profile</h2>
                <p className="text-gray-400 mt-1">Update your personal information.</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-4 mb-6">
                    <img src={formState.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full bg-gray-700"/>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Avatar URL</label>
                        <input type="text" name="avatarUrl" value={formState.avatarUrl || ''} onChange={handleChange} className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Full Name</label>
                        <input type="text" name="name" value={formState.name || ''} onChange={handleChange} className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400">Phone Number</label>
                        <input type="tel" name="phone" value={formState.phone || ''} onChange={handleChange} className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400">Email Address</label>
                        <input type="email" value={formState.email || ''} readOnly className="w-full mt-1 py-2 px-3 text-gray-400 bg-gray-700/50 border border-gray-600 rounded-md cursor-not-allowed"/>
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

export default SuperAdminProfile;