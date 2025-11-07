import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
// FIX: Aliased the NotificationSettings type to NotificationSettingsType to avoid a name collision with the component.
import { NotificationSettings as NotificationSettingsType } from '../../types';
import Icon from '../icons/index.tsx';

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

const NotificationSettings: React.FC = () => {
    const { notificationSettings, updateNotificationSettings } = useAppContext();
    // FIX: Used the aliased NotificationSettingsType for the component's state.
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

                 {/* Push Notification Settings */}
                <div className="bg-gray-800 rounded-lg shadow-md p-6 space-y-4 lg:col-span-2">
                    <h3 className="text-xl font-bold text-white">Push Notifications</h3>
                    
                    {/* Firebase Section */}
                    <div className="p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-white">Firebase Cloud Messaging</h4>
                            <Toggle
                                enabled={formState.push.firebase.enabled}
                                onChange={enabled => setFormState(prev => ({ ...prev, push: { ...prev.push, firebase: { ...prev.push.firebase, enabled } } }))}
                            />
                        </div>
                        <div className={`space-y-4 mt-4 ${!formState.push.firebase.enabled && 'opacity-50'}`}>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Server Key</label>
                                <input
                                    type="password"
                                    value={formState.push.firebase.serverKey}
                                    onChange={e => setFormState(prev => ({ ...prev, push: { ...prev.push, firebase: { ...prev.push.firebase, serverKey: e.target.value } } }))}
                                    disabled={!formState.push.firebase.enabled}
                                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white disabled:bg-gray-700/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">VAPID Key</label>
                                <input
                                    type="text"
                                    value={formState.push.firebase.vapidKey}
                                    onChange={e => setFormState(prev => ({ ...prev, push: { ...prev.push, firebase: { ...prev.push.firebase, vapidKey: e.target.value } } }))}
                                    disabled={!formState.push.firebase.enabled}
                                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white disabled:bg-gray-700/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* OneSignal Section */}
                    <div className="p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-white">OneSignal</h4>
                            <Toggle
                                enabled={formState.push.oneSignal.enabled}
                                onChange={enabled => setFormState(prev => ({ ...prev, push: { ...prev.push, oneSignal: { ...prev.push.oneSignal, enabled } } }))}
                            />
                        </div>
                        <div className={`space-y-4 mt-4 ${!formState.push.oneSignal.enabled && 'opacity-50'}`}>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">App ID</label>
                                <input
                                    type="text"
                                    value={formState.push.oneSignal.appId}
                                    onChange={e => setFormState(prev => ({ ...prev, push: { ...prev.push, oneSignal: { ...prev.push.oneSignal, appId: e.target.value } } }))}
                                    disabled={!formState.push.oneSignal.enabled}
                                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white disabled:bg-gray-700/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">REST API Key</label>
                                <input
                                    type="password"
                                    value={formState.push.oneSignal.apiKey}
                                    onChange={e => setFormState(prev => ({ ...prev, push: { ...prev.push, oneSignal: { ...prev.push.oneSignal, apiKey: e.target.value } } }))}
                                    disabled={!formState.push.oneSignal.enabled}
                                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white disabled:bg-gray-700/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;