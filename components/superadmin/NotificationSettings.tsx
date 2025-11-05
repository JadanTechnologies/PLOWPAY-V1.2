
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { NotificationSettings, EmailSettings } from '../../types';
import Icon from '../icons';

const NotificationSettings: React.FC = () => {
    const { notificationSettings, updateNotificationSettings } = useAppContext();
    const [formState, setFormState] = useState<NotificationSettings>(notificationSettings);

    const handleProviderChange = (provider: 'resend' | 'smtp') => {
        setFormState(prev => ({
            ...prev,
            email: { ...prev.email, provider }
        }));
    };

    const handleEmailChange = (provider: 'resend' | 'smtp', field: string, value: string | number) => {
        setFormState(prev => ({
            ...prev,
            email: {
                ...prev.email,
                [provider]: {
                    ...prev.email[provider],
                    [field]: value
                }
            }
        }));
    };
    
    const handleSave = () => {
        updateNotificationSettings(formState);
        alert('Notification settings saved successfully!');
    };
    
    const isResendActive = formState.email.provider === 'resend';
    const isSmtpActive = formState.email.provider === 'smtp';

    return (
        <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Notification Settings</h2>
                        <p className="text-gray-400">Configure providers for sending emails, SMS, and push notifications.</p>
                    </div>
                     <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md mt-4 sm:mt-0">
                        Save All Settings
                    </button>
                </div>
            </div>

            {/* Email Settings */}
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-3">Email Provider</h3>
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-400 mb-2">Select the active email service provider:</p>
                    <div className="flex gap-4">
                        <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${isResendActive ? 'bg-cyan-900/50 border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}>
                            <input type="radio" name="emailProvider" value="resend" checked={isResendActive} onChange={() => handleProviderChange('resend')} className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
                            <span className="ml-3 text-white font-semibold">Resend</span>
                        </label>
                        <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${isSmtpActive ? 'bg-cyan-900/50 border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}>
                            <input type="radio" name="emailProvider" value="smtp" checked={isSmtpActive} onChange={() => handleProviderChange('smtp')} className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
                            <span className="ml-3 text-white font-semibold">SMTP</span>
                        </label>
                    </div>
                </div>

                {/* Resend Settings */}
                <div className={`space-y-4 transition-opacity duration-300 ${isResendActive ? 'opacity-100' : 'opacity-40'}`}>
                    <h4 className="text-lg font-semibold text-white">Resend Configuration</h4>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">API Key</label>
                        <input type="password" value={formState.email.resend.apiKey} onChange={e => handleEmailChange('resend', 'apiKey', e.target.value)} disabled={!isResendActive} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700/50" />
                    </div>
                </div>

                <div className="my-6 border-t border-gray-700"></div>

                {/* SMTP Settings */}
                <div className={`space-y-4 transition-opacity duration-300 ${isSmtpActive ? 'opacity-100' : 'opacity-40'}`}>
                    <h4 className="text-lg font-semibold text-white">SMTP Configuration</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400">SMTP Host</label>
                            <input type="text" value={formState.email.smtp.host} onChange={e => handleEmailChange('smtp', 'host', e.target.value)} disabled={!isSmtpActive} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700/50" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400">SMTP Port</label>
                            <input type="number" value={formState.email.smtp.port} onChange={e => handleEmailChange('smtp', 'port', parseInt(e.target.value, 10))} disabled={!isSmtpActive} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Username</label>
                            <input type="text" value={formState.email.smtp.user} onChange={e => handleEmailChange('smtp', 'user', e.target.value)} disabled={!isSmtpActive} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Password</label>
                            <input type="password" value={formState.email.smtp.pass} onChange={e => handleEmailChange('smtp', 'pass', e.target.value)} disabled={!isSmtpActive} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700/50" />
                        </div>
                    </div>
                </div>
            </div>
            
             {/* Placeholder for SMS Settings */}
            <div className="bg-gray-800 rounded-lg shadow-md p-6 opacity-50">
                <h3 className="text-xl font-bold text-white">SMS Provider</h3>
                <p className="text-gray-400 mt-2">Configuration for services like Twilio will be available here soon.</p>
            </div>
            
             {/* Placeholder for Push Notification Settings */}
            <div className="bg-gray-800 rounded-lg shadow-md p-6 opacity-50">
                <h3 className="text-xl font-bold text-white">Push Notifications</h3>
                 <p className="text-gray-400 mt-2">Configuration for services like Firebase Cloud Messaging will be available here soon.</p>
            </div>

        </div>
    );
};

export default NotificationSettings;
