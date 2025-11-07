import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
// FIX: Alias the NotificationSettings type to avoid a name collision with the component.
import { NotificationSettings as NotificationSettingsType } from '../../types';
import Icon from '/components/icons/index.tsx';

const Toggle: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => {
    return (
        <button
            type="button"
            className={`${enabled ? 'bg-cyan-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
        >
            <span
                aria-hidden="true"
                className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    );
};

// FIX: Renamed component from NotificationSettingsComponent to NotificationSettings to match the import in SuperAdminPanel.
const NotificationSettings: React.FC = () => {
    const { notificationSettings, updateNotificationSettings } = useAppContext();
    // FIX: Use the aliased type here.
    const [formState, setFormState] = useState<NotificationSettingsType>(notificationSettings);

    const handleSave = () => {
        updateNotificationSettings(formState);
        alert('Notification settings saved successfully!');
    };

    return (
        <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Notification Settings</h2>
                        <p className="text-gray-400 mt-1">Configure providers for email, SMS, and push notifications.</p>
                    </div>
                    <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">
                        Save All Settings
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Email Settings */}
                <div className="bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
                    <h3 className="text-xl font-bold text-white">Email (Resend)</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">API Key</label>
                        <input
                            type="password"
                            value={formState.email.resend.apiKey}
                            onChange={e => setFormState(prev => ({ ...prev, email: { ...prev.email, resend: { ...prev.email.resend, apiKey: e.target.value } } }))}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                        />
                    </div>
                </div>

                {/* SMS Settings */}
                <div className="bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">SMS (Twilio)</h3>
                        <Toggle
                            enabled={formState.sms.twilio.enabled}
                            onChange={enabled => setFormState(prev => ({ ...prev, sms: { ...prev.sms, twilio: { ...prev.sms.twilio, enabled } } }))}
                        />
                    </div>
                    <div className={`space-y-4 ${!formState.sms.twilio.enabled && 'opacity-50'}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Account SID</label>
                            <input
                                type="text"
                                value={formState.sms.twilio.accountSid}
                                onChange={e => setFormState(prev => ({ ...prev, sms: { ...prev.sms, twilio: { ...prev.sms.twilio, accountSid: e.target.value } } }))}
                                disabled={!formState.sms.twilio.enabled}
                                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white disabled:bg-gray-700/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">API Key</label>
                            <input
                                type="password"
                                value={formState.sms.twilio.apiKey}
                                onChange={e => setFormState(prev => ({ ...prev, sms: { ...prev.sms, twilio: { ...prev.sms.twilio, apiKey: e.target.value } } }))}
                                disabled={!formState.sms.twilio.enabled}
                                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white disabled:bg-gray-700/50"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400">From Number</label>
                            <input
                                type="text"
                                value={formState.sms.twilio.fromNumber}
                                onChange={e => setFormState(prev => ({ ...prev, sms: { ...prev.sms, twilio: { ...prev.sms.twilio, fromNumber: e.target.value } } }))}
                                disabled={!formState.sms.twilio.enabled}
                                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white disabled:bg-gray-700/50"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
