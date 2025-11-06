

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { SubscriptionPlan } from '../types';
import Icon from './icons';
import { useCurrency } from '../hooks/useCurrency';

const PlanCard: React.FC<{
    plan: SubscriptionPlan;
    isCurrent: boolean;
    onSelect: (plan: SubscriptionPlan) => void;
}> = ({ plan, isCurrent, onSelect }) => {
    const { formatCurrency } = useCurrency();
    const isRecommended = plan.recommended;

    return (
        <div className={`bg-gray-800 p-8 rounded-lg border-2 ${isCurrent ? 'border-indigo-500' : isRecommended ? 'border-cyan-500' : 'border-gray-700'} relative flex flex-col`}>
            {isRecommended && !isCurrent && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Recommended</span>}
            <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
            <p className="text-gray-400 mt-2 h-10">{plan.description}</p>
            <div className="mt-4">
                <span className="text-5xl font-extrabold text-white">{formatCurrency(plan.price).replace(/\.00$/, '')}</span>
                <span className="text-lg text-gray-400">/mo</span>
            </div>
            <ul className="mt-6 space-y-3 text-gray-400 flex-grow">
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
                className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold transition-colors ${isCurrent ? 'bg-indigo-600 text-white cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            >
                {isCurrent ? 'Current Plan' : 'Switch to this Plan'}
            </button>
        </div>
    );
};

interface BillingProps {
    onStartCheckout: (plan: SubscriptionPlan) => void;
}

const Billing: React.FC<BillingProps> = ({ onStartCheckout }) => {
    const { currentTenant, subscriptionPlans } = useAppContext();
    const { formatCurrency } = useCurrency();

    const currentPlan = useMemo(() => {
        return subscriptionPlans.find(p => p.id === currentTenant?.planId);
    }, [currentTenant, subscriptionPlans]);

    const handleSelectPlan = (plan: SubscriptionPlan) => {
        if (currentTenant && plan.id !== currentTenant.planId) {
            onStartCheckout(plan);
        }
    };
    
    if (!currentTenant || !currentPlan) {
        return <div>Loading...</div>;
    }
    
    const getStatusBadge = (status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL') => {
        const styles = {
            ACTIVE: 'bg-green-500/20 text-green-300',
            SUSPENDED: 'bg-red-500/20 text-red-300',
            TRIAL: 'bg-yellow-500/20 text-yellow-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };

    return (
        <div className="space-y-8">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-white">Billing & Subscription</h2>
                <p className="text-gray-400 mt-1">Manage your plan and view billing details.</p>
            </div>

            {/* Current Plan */}
            <div className="bg-gray-800 p-6 rounded-lg border border-indigo-500 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">Your Current Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-indigo-400">{currentPlan.name}</span>
                            <span className="ml-4">{getStatusBadge(currentTenant.status)}</span>
                        </div>
                        <p className="text-gray-400">{currentPlan.description}</p>
                        <div className="flex items-center text-sm text-gray-300">
                           <Icon name="calendar" className="w-5 h-5 mr-2 text-gray-400" />
                           Subscribed on: {currentTenant.joinDate.toLocaleDateString()}
                        </div>
                        {currentTenant.status === 'TRIAL' && currentTenant.trialEndDate && (
                             <div className="flex items-center text-sm text-yellow-300 bg-yellow-500/10 p-2 rounded-md">
                                <Icon name="calendar" className="w-5 h-5 mr-2" />
                                Trial ends on: {new Date(currentTenant.trialEndDate).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                    <div className="text-left md:text-right bg-gray-900/50 p-4 rounded-md">
                        <p className="text-gray-400">Monthly cost</p>
                        <p className="text-4xl font-extrabold text-white">{formatCurrency(currentPlan.price)}</p>
                        <p className="text-gray-500">Next payment due: July 15, 2024</p>
                    </div>
                </div>
            </div>

            {/* Change Plan */}
             <div className="py-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white">Change Your Plan</h2>
                <p className="mt-4 text-lg text-gray-400">Upgrade or downgrade to the plan that fits your needs.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {subscriptionPlans.map((plan) => (
                  <PlanCard 
                    key={plan.id} 
                    plan={plan}
                    isCurrent={plan.id === currentPlan.id}
                    onSelect={handleSelectPlan}
                  />
                ))}
              </div>
            </div>
        </div>
    );
};

export default Billing;