import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { SubscriptionPlan, TenantStatus } from '../types';
import Icon from './icons/index.tsx';
import { useCurrency } from '../hooks/useCurrency';

const PlanCard: React.FC<{
    plan: SubscriptionPlan;
    isCurrent: boolean;
    onSelect: (plan: SubscriptionPlan) => void;
    billingCycle: 'monthly' | 'yearly';
}> = ({ plan, isCurrent, onSelect, billingCycle }) => {
    const { formatCurrency } = useCurrency();
    const isRecommended = plan.recommended;
    const price = billingCycle === 'yearly' ? plan.priceYearly : plan.price;
    const pricePerMonth = billingCycle === 'yearly' ? plan.priceYearly / 12 : plan.price;

    return (
        <div className={`bg-slate-800 p-8 rounded-lg border-2 ${isCurrent ? 'border-cyan-500' : isRecommended ? 'border-teal-500' : 'border-slate-700'} relative flex flex-col`}>
            {isRecommended && !isCurrent && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Recommended</span>}
            <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
            <p className="text-slate-400 mt-2 h-10">{plan.description}</p>
            <div className="mt-4">
                <span className="text-5xl font-extrabold text-white">{formatCurrency(pricePerMonth).replace(/\.00$/, '')}</span>
                <span className="text-lg text-slate-400">/mo</span>
                {billingCycle === 'yearly' && <p className="text-sm text-slate-500">Billed as {formatCurrency(price)} per year</p>}
            </div>
            <ul className="mt-6 space-y-3 text-slate-400 flex-grow">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                        <Icon name="check" className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                    </li>
                ))}
            </ul>
            <button
                onClick={() => onSelect(plan)}
                disabled={isCurrent}
                className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold transition-colors ${isCurrent ? 'bg-cyan-600 text-white cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
            >
                {isCurrent ? 'Current Plan' : 'Switch to this Plan'}
            </button>
        </div>
    );
};

interface BillingProps {
    onStartCheckout: (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') => void;
}

const Billing: React.FC<BillingProps> = ({ onStartCheckout }) => {
    const { currentTenant, subscriptionPlans } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(currentTenant?.billingCycle || 'monthly');

    const currentPlan = useMemo(() => {
        return subscriptionPlans.find(p => p.id === currentTenant?.planId);
    }, [currentTenant, subscriptionPlans]);

    const handleSelectPlan = (plan: SubscriptionPlan) => {
        if (currentTenant && plan.id !== currentTenant.planId) {
            onStartCheckout(plan, billingCycle);
        }
    };
    
    if (!currentTenant || !currentPlan) {
        return <div>Loading...</div>;
    }
    
    const getStatusBadge = (status: TenantStatus) => {
        const styles: {[key in TenantStatus]: string} = {
            ACTIVE: 'bg-green-500/20 text-green-300',
            SUSPENDED: 'bg-red-500/20 text-red-300',
            TRIAL: 'bg-yellow-500/20 text-yellow-300',
            UNVERIFIED: 'bg-slate-500/20 text-slate-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };

    return (
        <div className="space-y-8">
            <div className="p-6 bg-slate-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-white">Billing & Subscription</h2>
                <p className="text-slate-400 mt-1">Manage your plan and view billing details.</p>
            </div>

            {/* Current Plan */}
            <div className="bg-slate-800 p-6 rounded-lg border border-cyan-500 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">Your Current Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-cyan-400">{currentPlan.name}</span>
                            <span className="ml-4">{getStatusBadge(currentTenant.status)}</span>
                        </div>
                        <p className="text-slate-400">{currentPlan.description}</p>
                        <div className="flex items-center text-sm text-slate-300">
                           <Icon name="calendar" className="w-5 h-5 mr-2 text-slate-400" />
                           Subscribed on: {currentTenant.joinDate.toLocaleDateString()}
                        </div>
                        {currentTenant.status === 'TRIAL' && currentTenant.trialEndDate && (
                             <div className="flex items-center text-sm text-yellow-300 bg-yellow-500/10 p-2 rounded-md">
                                <Icon name="calendar" className="w-5 h-5 mr-2" />
                                Trial ends on: {new Date(currentTenant.trialEndDate).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                    <div className="text-left md:text-right bg-slate-900/50 p-4 rounded-md">
                        <p className="text-slate-400 capitalize">{currentTenant.billingCycle} cost</p>
                        <p className="text-4xl font-extrabold text-white">{formatCurrency(currentTenant.billingCycle === 'yearly' ? currentPlan.priceYearly : currentPlan.price)}</p>
                        <p className="text-slate-500">Next payment due: July 15, 2024</p>
                    </div>
                </div>
            </div>

            {/* Change Plan */}
             <div className="py-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white">Change Your Plan</h2>
                <div className="mt-4 inline-flex items-center bg-slate-700 p-1 rounded-full text-sm font-semibold">
                    <button onClick={() => setBillingCycle('monthly')} className={`px-4 py-1 rounded-full transition-colors ${billingCycle === 'monthly' ? 'bg-cyan-600 text-white' : 'text-slate-300'}`}>Monthly</button>
                    <button onClick={() => setBillingCycle('yearly')} className={`px-4 py-1 rounded-full transition-colors relative ${billingCycle === 'yearly' ? 'bg-cyan-600 text-white' : 'text-slate-300'}`}>
                        Yearly
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Save 20%</span>
                    </button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {subscriptionPlans.map((plan) => (
                  <PlanCard 
                    key={plan.id} 
                    plan={plan}
                    isCurrent={plan.id === currentPlan.id}
                    onSelect={handleSelectPlan}
                    billingCycle={billingCycle}
                  />
                ))}
              </div>
            </div>
        </div>
    );
};

export default Billing;