
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { AccessControlSettings } from '../../types';
import Icon from '../icons';

const ListInput: React.FC<{ label: string, value: string[], onChange: (value: string[]) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400">{label}</label>
        <textarea
            rows={3}
            value={value.join(', ')}
            onChange={e => onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 font-mono text-sm"
        />
    </div>
);

const CheckboxGroup: React.FC<{
    label: string;
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
}> = ({ label, options, value, onChange }) => {
    const selected = new Set(value);
    const handleToggle = (option: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(option)) {
            newSelected.delete(option);
        } else {
            newSelected.add(option);
        }
        onChange(Array.from(newSelected));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-400">{label}</label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {options.map(option => (
                    <label key={option} className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md cursor-pointer hover:bg-gray-600">
                        <input
                            type="checkbox"
                            checked={selected.has(option)}
                            onChange={() => handleToggle(option)}
                            className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                        />
                        <span>{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

const BROWSER_OPTIONS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'IE', 'Other'];
const DEVICE_OPTIONS: ('desktop' | 'mobile' | 'tablet')[] = ['desktop', 'mobile', 'tablet'];

const AccessManagement: React.FC = () => {
    const { systemSettings, updateAccessControlSettings } = useAppContext();
    const [formState, setFormState] = useState<AccessControlSettings>(systemSettings.accessControlSettings);
    
    useEffect(() => {
        setFormState(systemSettings.accessControlSettings);
    }, [systemSettings.accessControlSettings]);

    const handleSave = () => {
        updateAccessControlSettings(formState);
        alert('Access control settings saved!');
    };
    
    const isBlockMode = formState.mode === 'BLOCK_LISTED';
    const isAllowMode = formState.mode === 'ALLOW_LISTED';
    
    const SettingSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <div className="space-y-4">{children}</div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Access Management</h2>
                        <p className="text-gray-400 mt-1">Control access to your platform based on IP, location, browser, and device.</p>
                    </div>
                    <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save Settings</button>
                </div>
            </div>

            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                 <h3 className="text-xl font-bold text-white mb-4">Access Mode</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['ALLOW_ALL', 'BLOCK_LISTED', 'ALLOW_LISTED'] as const).map(mode => (
                        <label key={mode} className={`p-4 rounded-lg border-2 cursor-pointer ${formState.mode === mode ? 'border-cyan-500 bg-cyan-900/50' : 'border-gray-700 hover:border-gray-600'}`}>
                            <input type="radio" name="mode" value={mode} checked={formState.mode === mode} onChange={() => setFormState(prev => ({ ...prev, mode }))} className="sr-only"/>
                            <div className="font-bold text-white">{mode.replace('_', ' ')}</div>
                            <p className="text-sm text-gray-400">
                                {mode === 'ALLOW_ALL' && 'No restrictions. All users can access the platform.'}
                                {mode === 'BLOCK_LISTED' && 'Block access for users matching the criteria in the blocklists.'}
                                {mode === 'ALLOW_LISTED' && 'Only allow access for users matching the criteria in the whitelists.'}
                            </p>
                        </label>
                    ))}
                 </div>
            </div>

            <div className={`space-y-6 transition-opacity ${formState.mode === 'ALLOW_ALL' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <SettingSection title="IP Address Rules">
                    <ListInput label="IP Whitelist" value={formState.ipWhitelist} onChange={v => setFormState(p => ({ ...p, ipWhitelist: v }))} />
                    <ListInput label="IP Blacklist" value={formState.ipBlacklist} onChange={v => setFormState(p => ({ ...p, ipBlacklist: v }))} />
                </SettingSection>

                <SettingSection title="Geography Rules">
                    <ListInput label="Country Whitelist (2-letter codes, e.g., US, CA)" value={formState.countryWhitelist} onChange={v => setFormState(p => ({ ...p, countryWhitelist: v.map(c => c.toUpperCase()) }))} />
                    <ListInput label="Country Blacklist (2-letter codes, e.g., IR, KP)" value={formState.countryBlacklist} onChange={v => setFormState(p => ({ ...p, countryBlacklist: v.map(c => c.toUpperCase()) }))} />
                </SettingSection>

                <SettingSection title="Technology Rules">
                     <CheckboxGroup label="Browser Whitelist" options={BROWSER_OPTIONS} value={formState.browserWhitelist} onChange={v => setFormState(p => ({ ...p, browserWhitelist: v }))} />
                     <CheckboxGroup label="Browser Blacklist" options={BROWSER_OPTIONS} value={formState.browserBlacklist} onChange={v => setFormState(p => ({ ...p, browserBlacklist: v }))} />
                     <hr className="border-gray-700" />
                     <CheckboxGroup label="Device Whitelist" options={DEVICE_OPTIONS} value={formState.deviceWhitelist} onChange={v => setFormState(p => ({ ...p, deviceWhitelist: v as any }))} />
                     <CheckboxGroup label="Device Blacklist" options={DEVICE_OPTIONS} value={formState.deviceBlacklist} onChange={v => setFormState(p => ({ ...p, deviceBlacklist: v as any }))} />
                </SettingSection>
            </div>
        </div>
    );
};

export default AccessManagement;
