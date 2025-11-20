import React, { useState } from 'react';
import { SubscriptionPlan } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './icons/index.tsx';
// FIX: Changed to a named import for useCurrency as it's not a default export.
import { useCurrency } from '../hooks/useCurrency';

interface CheckoutProps {
    plan: SubscriptionPlan;
    billingCycle: 'monthly' | 'yearly';
    onComplete: () => void;
}

type PaymentStatus = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR' | 'PENDING_MANUAL';

const Checkout: React.FC<CheckoutProps> = ({ plan, billingCycle, onComplete }) => {
    const { paymentSettings, currentTenant, processSubscriptionPayment } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
    const [status, setStatus] = useState<PaymentStatus>('IDLE');
    const [statusMessage, setStatusMessage] = useState('');
    
    const price = billingCycle === 'yearly' ? plan.priceYearly : plan.price;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofOfPayment(e.target.files[0]);
        }
    };
    
    const handlePayment = async (method: string) => {
        if (!currentTenant) return;
        
        setSelectedMethod(method);
        setStatus('PROCESSING');
        
        if (method === 'Manual') {
            if (!proofOfPayment) {
                setStatus('ERROR');
                setStatusMessage('Please upload proof of payment before submitting.');
                return;
            }
            // Simulate file upload and get a URL
            const mockProofUrl = `/uploads/proof_${Date.now()}.jpg`;
            const { success, message } = await processSubscriptionPayment(currentTenant.id, plan.id, method, price, billingCycle, true, mockProofUrl);
            setStatus(success ? 'PENDING_MANUAL' : 'ERROR');
            setStatusMessage(message);
        } else {
            // Simulate online payment API call
            setTimeout(async () => {
                const isSuccess = Math.random() > 0.1; // 90% success rate
                const { success, message } = await processSubscriptionPayment(currentTenant.id, plan.id, method, price, billingCycle, isSuccess);
                setStatus(success ? 'SUCCESS' : 'ERROR');
                setStatusMessage(message);
            }, 2000);
        }
    };
    
    const PaymentMethodButton: React.FC<{ name: string, icon: string }> = ({ name, icon }) => (
        <button
            onClick={() => handlePayment(name)}
            disabled={status === 'PROCESSING'}
            className="w-full flex items-center justify-center p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
            <Icon name={icon} className="w-6 h-6 mr-3" />
            <span className="font-semibold">Pay with {name}</span>
        </button>
    );

    if (status === 'SUCCESS' || status === 'ERROR' || status === 'PENDING_MANUAL') {
        const isSuccess = status === 'SUCCESS';
        const isPending = status === 'PENDING_MANUAL';
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <div className={`p-6 bg-slate-800 rounded-lg shadow-lg max-w-md`}>
                    <Icon name={isSuccess || isPending ? 'check' : 'x-mark'} className={`w-16 h-16 mx-auto mb-4 ${isSuccess ? 'text-green-400' : isPending ? 'text-yellow-400' : 'text-red-400'}`} />
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isSuccess ? 'Payment Successful!' : isPending ? 'Payment Submitted' : 'Payment Failed'}
                    </h2>
                    <p className="text-slate-400 mb-6">{statusMessage}</p>
                    <button onClick={onComplete} className="bg-cyan-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-cyan-500">
                        Back to Billing
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="p-6 bg-slate-800 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold text-white">Checkout</h2>
                <p className="text-slate-400 mt-1">You are changing your subscription to the <span className="font-bold text-cyan-400">{plan.name} ({billingCycle})</span> plan.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Summary */}
                <div className="bg-slate-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-white">Order Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">{plan.name} Plan ({billingCycle})</span>
                            <span className="font-semibold text-white">{formatCurrency(price)}</span>
                        </div>
                         <div className="flex justify-between items-center text-lg font-bold border-t border-slate-700 pt-3">
                            <span className="text-white">Total Due Today</span>
                            <span className="text-cyan-400">{formatCurrency(price)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-slate-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-white">Select Payment Method</h3>
                     {status === 'PROCESSING' && (
                        <div className="flex justify-center items-center p-8 bg-slate-900/50 rounded-lg">
                            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="ml-4 text-lg">Processing payment for {selectedMethod}...</p>
                        </div>
                    )}
                    <div className={`space-y-4 ${status !== 'IDLE' ? 'hidden' : ''}`}>
                        {paymentSettings.stripe.enabled && <PaymentMethodButton name="Stripe" icon="credit-card" />}
                        {paymentSettings.flutterwave.enabled && <PaymentMethodButton name="Flutterwave" icon="credit-card" />}
                        {paymentSettings.paystack.enabled && <PaymentMethodButton name="Paystack" icon="credit-card" />}
                        {paymentSettings.manual.enabled && (
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <h4 className="font-semibold mb-2">Manual Bank Transfer</h4>
                                <p className="text-sm text-slate-400 whitespace-pre-wrap mb-4">{paymentSettings.manual.details}</p>
                                <div>
                                    <label className="text-sm font-medium text-slate-300">Upload Proof of Payment</label>
                                    <input type="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-cyan-300 hover:file:bg-slate-600"/>
                                    {proofOfPayment && <p className="text-xs text-green-400 mt-1">File selected: {proofOfPayment.name}</p>}
                                </div>
                                <button onClick={() => handlePayment('Manual')} disabled={status === 'PROCESSING'} className="w-full mt-4 p-3 bg-cyan-600 rounded-lg hover:bg-cyan-500 font-semibold transition-colors disabled:opacity-50">
                                    I have paid, Submit for Review
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;