
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { SubscriptionPlan } from '../types';
import Icon from './icons';
import { useCurrency } from '../hooks/useCurrency';

const PlanCard: React.FC<{
    plan: SubscriptionPlan;
    isCurrent: boolean;
    onSelect: (planId: string) => void;
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
                onClick={() => onSelect(plan.id)}
                disabled={isCurrent}
                className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold transition-colors ${isCurrent ? 'bg-indigo-600 text-white cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            >
                {isCurrent ? 'Current Plan' : 'Switch to this Plan'}
            </button>
        </div>
    );
};


const Billing: React.FC = () => {
    const { currentTenant, subscriptionPlans, changeSubscriptionPlan } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState<SubscriptionPlan | null>(null);

    const currentPlan = useMemo(() => {
        return subscriptionPlans.find(p => p.id === currentTenant?.planId);
    }, [currentTenant, subscriptionPlans]);

    const handleSelectPlan = (planId: string) => {
        const selectedPlan = subscriptionPlans.find(p => p.id === planId);
        if (selectedPlan && currentTenant && selectedPlan.id !== currentTenant.planId) {
            setShowConfirmModal(selectedPlan);
        }
    };

    const handleConfirmChange = () => {
        if (showConfirmModal && currentTenant) {
            setIsLoading(true);
            setTimeout(() => { // Simulate API call
                changeSubscriptionPlan(currentTenant.id, showConfirmModal.id);
                setIsLoading(false);
                setShowConfirmModal(null);
            }, 1000);
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

            {/* Confirmation Modal */}
            {showConfirmModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-center">
                        <h3 className="text-xl font-bold mb-2">Confirm Plan Change</h3>
                        <p className="text-gray-400 mb-4">You are about to switch to the <strong className="text-white">{showConfirmModal.name}</strong> plan for <strong className="text-white">{formatCurrency(showConfirmModal.price)}/mo</strong>.</p>
                        <p className="text-xs text-gray-500 mb-6">Changes will be prorated and applied to your next billing cycle.</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowConfirmModal(null)} className="px-6 py-2 rounded-md bg-gray-600 hover:bg-gray-500 font-semibold" disabled={isLoading}>
                                Cancel
                            </button>
                            <button onClick={handleConfirmChange} className="px-6 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 font-semibold flex items-center" disabled={isLoading}>
                                {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {isLoading ? 'Switching...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Billing;
