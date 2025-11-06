
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { SubscriptionPlan } from '../../types';
import Icon from '../icons';
import { useCurrency } from '../../hooks/useCurrency';

const SubscriptionManagement: React.FC = () => {
    const { subscriptionPlans, addSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

    const initialFormState: Omit<SubscriptionPlan, 'id'> = {
        name: '',
        price: 0,
        description: '',
        features: [''],
        recommended: false
    };
    const [formData, setFormData] = useState(initialFormState);

    const openModal = (plan: SubscriptionPlan | null = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({ name: plan.name, price: plan.price, description: plan.description, features: plan.features, recommended: plan.recommended });
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
        // FIX: Completed the state setter function which was truncated.
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

    const handleDelete = (planId: string) => {
        if (window.confirm('Are you sure you want to delete this subscription plan?')) {
            deleteSubscriptionPlan(planId);
        }
    };
    
    return (
        <div className="space-y-6">
             <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Subscription Plan Management</h2>
                        <p className="text-gray-400 mt-1">Create and manage subscription plans for your tenants.</p>
                    </div>
                    <button onClick={() => openModal()} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        Add Plan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptionPlans.map(plan => (
                    <div key={plan.id} className={`bg-gray-800 p-6 rounded-lg border-2 ${plan.recommended ? 'border-cyan-500' : 'border-gray-700'} relative flex flex-col`}>
                        {plan.recommended && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Recommended</span>}
                        <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                        <p className="text-gray-400 mt-2 flex-grow">{plan.description}</p>
                        <div className="my-4">
                            <span className="text-4xl font-extrabold text-white">{formatCurrency(plan.price).replace(/\.00$/, '')}</span>
                            <span className="text-lg text-gray-400">/mo</span>
                        </div>
                        <ul className="space-y-2 text-gray-300 text-sm mb-6">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start">
                                    <Icon name="check" className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-auto flex justify-end space-x-2">
                             <button onClick={() => openModal(plan)} className="text-yellow-400 hover:text-yellow-300 font-semibold px-3 py-1 rounded-md text-sm">Edit</button>
                             <button onClick={() => handleDelete(plan.id)} className="text-rose-400 hover:text-rose-300 font-semibold px-3 py-1 rounded-md text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4 text-white">{editingPlan ? 'Edit' : 'Add'} Subscription Plan</h3>
                        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4">
                            <div>
                                <label className="text-sm text-gray-400">Plan Name</label>
                                <input name="name" value={formData.name} onChange={handleFormChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" required />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Price (per month)</label>
                                <input name="price" type="number" value={formData.price} onChange={handleFormChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" required />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Description</label>
                                <input name="description" value={formData.description} onChange={handleFormChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" required />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Features</label>
                                <div className="space-y-2">
                                    {formData.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input value={feature} onChange={e => handleFeatureChange(index, e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-sm" placeholder={`Feature ${index + 1}`} />
                                            <button type="button" onClick={() => removeFeatureRow(index)} className="text-red-500 hover:text-red-400 p-1"><Icon name="trash" className="w-5 h-5"/></button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addFeatureRow} className="text-cyan-400 text-sm font-semibold mt-2">+ Add Feature</button>
                            </div>
                             <div className="flex items-center">
                                <input id="recommended" name="recommended" type="checkbox" checked={formData.recommended} onChange={handleFormChange} className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"/>
                                <label htmlFor="recommended" className="ml-2 block text-sm text-gray-300">Mark as Recommended</label>
                            </div>

                        </form>
                         <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-700">
                            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500">
                                {editingPlan ? 'Save Changes' : 'Create Plan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;
