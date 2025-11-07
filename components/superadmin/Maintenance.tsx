import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
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

const Maintenance: React.FC = () => {
    const { systemSettings, updateMaintenanceSettings } = useAppContext();
    const [isActive, setIsActive] = useState(systemSettings.maintenanceSettings.isActive);
    const [message, setMessage] = useState(systemSettings.maintenanceSettings.message);

    const handleSave = () => {
        updateMaintenanceSettings({ isActive, message });
        alert('Maintenance settings saved!');
    };

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-md max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Platform Maintenance Mode</h2>
            <p className="text-gray-400 mb-6">Activate maintenance mode to show a custom message to all users except super admins.</p>

            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Maintenance Mode Status</h3>
                        <p className={`text-sm font-bold ${isActive ? 'text-cyan-400' : 'text-gray-400'}`}>Currently {isActive ? 'ACTIVE' : 'INACTIVE'}</p>
                    </div>
                    <Toggle enabled={isActive} onChange={setIsActive} />
                </div>
                
                <div className={!isActive ? 'opacity-50' : ''}>
                    <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-gray-400">Maintenance Message</label>
                    <textarea
                        id="maintenanceMessage"
                        rows={5}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        disabled={!isActive}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:cursor-not-allowed"
                    />
                     <p className="mt-2 text-xs text-gray-500">This message will be displayed to all non-admin users when maintenance mode is active.</p>
                </div>
            </div>

            <div className="text-right mt-6">
                <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">
                    Save Settings
                </button>
            </div>
        </div>
    );
};

export default Maintenance;