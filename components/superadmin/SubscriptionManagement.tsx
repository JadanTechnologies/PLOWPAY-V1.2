
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { SubscriptionPlan } from '../../types';
import Icon from '../icons/index.tsx';
import { useCurrency } from '../../hooks/useCurrency';
import ConfirmationModal from '../ConfirmationModal';

const SubscriptionManagement: React.FC = () => {
    const { subscriptionPlans, addSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
    const planToDelete = useMemo(() => subscriptionPlans.find(p => p.id === deletingPlanId), [deletingPlanId, subscriptionPlans]);

    const initialFormState: Omit<SubscriptionPlan, 'id'> = {
        name: '',
        price: 0,
        priceYearly: 0,
        description: '',
        features: [''],
        recommended: false
    };
    const [formData, setFormData] = useState(initialFormState);

    const openModal = (plan: SubscriptionPlan | null = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({ name: plan.name, price: plan.price, priceYearly: plan.priceYearly, description: plan.description, features: plan.features, recommended: plan.recommended });
        } else {
            setEditingPlan(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value 
        }));
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeatureRow = () => {
        setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    };

    const removeFeatureRow = (index: number) => {
        if (formData.features.length > 1) {
            setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPlan) {
            updateSubscriptionPlan(editingPlan.id, formData);
        } else {
            addSubscriptionPlan(formData);
        }
        closeModal();
    };

    return (
        <div className="p-6 bg-slate-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Subscription Plan Management</h2>
                <button onClick={() => openModal()} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    Add Plan
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {subscriptionPlans.map((plan) => (
                    <div key={plan.id} className={`bg-slate-900/50 p-6 rounded-lg border-2 ${plan.recommended ? 'border-cyan-500' : 'border-slate-700'} relative flex flex-col`}>
                        {plan.recommended && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Recommended</span>}
                        <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                        <p className="text-slate-400 mt-2 h-12">{plan.description}</p>
                        <div className="mt-4">
                            <span className="text-4xl font-extrabold text-white">{formatCurrency(plan.price)}</span>
                            <span className="text-lg text-slate-400">/mo</span>
                            <p className="text-sm text-slate-500">or {formatCurrency(plan.priceYearly)}/year</p>
                        </div>
                        <ul className="mt-6 space-y-2 text-slate-400 flex-grow">
                            {plan.features.map((feature, i) => ( <li key={i} className="flex items-center"><Icon name="check" className="w-5 h-5 text-green-500 mr-2" />{feature}</li> ))}
                        </ul>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => openModal(plan)} className="text-yellow-400 font-semibold text-sm">Edit</button>
                            <button onClick={() => setDeletingPlanId(plan.id)} className="text-rose-400 font-semibold text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col border border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-white">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h3>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                            <input name="name" placeholder="Plan Name" value={formData.name} onChange={handleFormChange} required className="w-full bg-slate-700 p-2 rounded-md"/>
                            <textarea name="description" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md"/>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" name="price" placeholder="Monthly Price" value={formData.price} onChange={handleFormChange} className="w-full bg-slate-700 p-2 rounded-md"/>
                                <input type="number" name="priceYearly" placeholder="Yearly Price" value={formData.priceYearly} onChange={handleFormChange} className="w-full bg-slate-700 p-2 rounded-md"/>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Features</h4>
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <input value={feature} onChange={e => handleFeatureChange(index, e.target.value)} className="flex-grow bg-slate-700 p-2 rounded-md text-sm"/>
                                        <button type="button" onClick={() => removeFeatureRow(index)} className="text-red-500 p-1"><Icon name="trash" className="w-5 h-5"/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addFeatureRow} className="text-cyan-400 text-sm font-semibold">+ Add Feature</button>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="recommended" name="recommended" checked={formData.recommended} onChange={handleFormChange} className="h-4 w-4 rounded text-cyan-500 bg-slate-600 border-slate-500 focus:ring-cyan-600"/>
                                <label htmlFor="recommended" className="ml-2 text-sm">Mark as Recommended</label>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-700">
                            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500">{editingPlan ? 'Save Changes' : 'Create Plan'}</button>
                        </div>
                    </form>
                </div>
            )}
            <ConfirmationModal
                isOpen={!!planToDelete}
                onClose={() => setDeletingPlanId(null)}
                onConfirm={() => {
                    if (deletingPlanId) {
                        deleteSubscriptionPlan(deletingPlanId);
                    }
                }}
                title={`Delete Plan: ${planToDelete?.name}`}
                confirmText="Delete Plan"
            >
                Are you sure you want to delete this subscription plan? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default SubscriptionManagement;
