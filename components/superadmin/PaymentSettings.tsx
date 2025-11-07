

import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { PaymentSettings } from '../../types';
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

const PaymentGateways: React.FC = () => {
    const { paymentSettings, updatePaymentSettings } = useAppContext();
    const [formState, setFormState] = useState<PaymentSettings>(paymentSettings);

    const handleToggle = (provider: keyof PaymentSettings) => {
        setFormState(prev => ({
            ...prev,
            [provider]: { ...prev[provider], enabled: !prev[provider].enabled }
        }));
    };

    const handleChange = (provider: keyof Omit<PaymentSettings, 'manual'>, field: 'publicKey' | 'secretKey', value: string) => {
        setFormState(prev => ({
            ...prev,
            [provider]: { ...prev[provider], [field]: value }
        }));
    };

    const handleManualChange = (value: string) => {
        setFormState(prev => ({
            ...prev,
            manual: { ...prev.manual, details: value }
        }));
    };
    
    const handleSave = () => {
        updatePaymentSettings(formState);
        alert('Payment settings saved successfully!');
    };

    return (
        <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Payment Gateways</h2>
                        <p className="text-gray-400">Configure and manage payment providers for your tenants.</p>
                    </div>
                     <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md mt-4 sm:mt-0">
                        Save All Settings
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stripe */}
                <div className="bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Stripe</h3>
                        <Toggle enabled={formState.stripe.enabled} onChange={() => handleToggle('stripe')} />
                    </div>
                    <div className={`space-y-4 transition-opacity ${formState.stripe.enabled ? 'opacity-100' : 'opacity-50'}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Public Key</label>
                            <input type="text" value={formState.stripe.publicKey} onChange={e => handleChange('stripe', 'publicKey', e.target.value)} disabled={!formState.stripe.enabled} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Secret Key</label>
                            <input type="password" value={formState.stripe.secretKey} onChange={e => handleChange('stripe', 'secretKey', e.target.value)} disabled={!formState.stripe.enabled} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700/50" />
                        </div>
                    </div>
                </div>

                {/* Flutterwave */}
                <div className="bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Flutterwave</h3>
                        <Toggle enabled={formState.flutterwave.enabled} onChange={() => handleToggle('flutterwave')} />
                    </div>
                     <div className={`space-y-4 transition-opacity ${formState.flutterwave.enabled ? 'opacity-100' : 'opacity-50'}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Public Key</label>
                            <input type="text" value={formState.flutterwave.publicKey} onChange={e => handleChange('flutterwave', 'publicKey', e.target.value)} disabled={!formState.flutterwave.enabled} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Secret Key</label>
                            <input type="password" value={formState.flutterwave.secretKey} onChange={e => handleChange('flutterwave', 'secretKey', e.target.value)} disabled={!formState.flutterwave.enabled} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700/50" />
                        </div>
                    </div>
                </div>

                {/* Paystack */}
                <div className="bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Paystack</h3>
                        <Toggle enabled={formState.paystack.enabled} onChange={() => handleToggle('paystack')} />
                    </div>
                     <div className={`space-y-4 transition-opacity ${formState.paystack.enabled ? 'opacity-100' : 'opacity-50'}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Public Key</label>
                            <input type="text" value={formState.paystack.publicKey} onChange={e => handleChange('paystack', 'publicKey', e.target.value)} disabled={!formState.paystack.enabled} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Secret Key</label>
                            <input type="password" value={formState.paystack.secretKey} onChange={e => handleChange('paystack', 'secretKey', e.target.value)} disabled={!formState.paystack.enabled} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700/50" />
                        </div>
                    </div>
                </div>

                {/* Manual Payment */}
                <div className="bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Manual Payment Gateway</h3>
                        <Toggle enabled={formState.manual.enabled} onChange={() => handleToggle('manual')} />
                    </div>
                     <div className={`space-y-4 transition-opacity ${formState.manual.enabled ? 'opacity-100' : 'opacity-50'}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Payment Instructions / Bank Details</label>
                            <textarea rows={5} value={formState.manual.details} onChange={e => handleManualChange(e.target.value)} disabled={!formState.manual.enabled} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700/50 font-mono text-sm" placeholder="e.g., Bank Name, Account Number, etc."/>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PaymentGateways;