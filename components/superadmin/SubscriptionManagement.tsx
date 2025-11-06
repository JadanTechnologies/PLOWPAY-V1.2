
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { SubscriptionPlan } from '../../types';
import Icon from '../icons';

const SubscriptionManagement: React.FC = () => {
    const { subscriptionPlans, addSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, tenants } = useAppContext();
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
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeature = () => {
        setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    };

    const removeFeature = (index: number) => {
        if (formData.features.length > 1) {
            setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            features: formData.features.filter(f => f.trim() !== '') // remove empty features
        };

        if (editingPlan) {
            updateSubscriptionPlan(editingPlan.id, finalData);
        } else {
            addSubscriptionPlan(finalData);
        }
        closeModal();
    };
    
    const handleDelete = (planId: string) => {
        if (window.confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
            deleteSubscriptionPlan(planId);
        }
    };
    
    const tenantsPerPlan = tenants.reduce((acc, tenant) => {
        acc[tenant.planId] = (acc[tenant.planId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Subscription Management</h2>
                        <p className="text-gray-400 mt-1">Create, edit, and manage subscription plans for your tenants.</p>
                    </div>
                    <button onClick={() => openModal()} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center mt-4 sm:mt-0">
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        Add New Plan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptionPlans.map(plan => (
                    <div key={plan.id} className={`bg-gray-800 rounded-lg shadow-md p-6 flex flex-col border-2 ${plan.recommended ? 'border-cyan-500' : 'border-gray-700'} hover:border-cyan-500/50 transition-colors relative`}>
                         {plan.recommended && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Recommended</span>}
                        <div className="flex-grow">
                            <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                            <p className="text-gray-400 mt-1 h-10">{plan.description}</p>
                            <div className="mt-4">
                                <span className="text-4xl font-extrabold text-cyan-400">${plan.price}</span>
                                <span className="text-lg text-gray-400">/mo</span>
                            </div>
                            <ul className="mt-6 space-y-3 text-gray-300">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start">
                                        <Icon name="check" className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
                            <div className="flex items-center text-gray-300">
                                    <Icon name="users" className="w-5 h-5 mr-2 text-gray-400"/>
                                    <span>{tenantsPerPlan[plan.id] || 0} Tenants</span>
                            </div>
                            <div className="space-x-2">
                                <button onClick={() => openModal(plan)} className="text-yellow-400 hover:text-yellow-300 font-semibold px-3 py-1 rounded-md text-sm bg-gray-700 hover:bg-gray-600 transition-all">Edit</button>
                                <button onClick={() => handleDelete(plan.id)} className="text-rose-400 hover:text-rose-300 font-semibold px-3 py-1 rounded-md text-sm bg-gray-700 hover:bg-gray-600 transition-all">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4 text-white">{editingPlan ? 'Edit Subscription Plan' : 'Add New Plan'}</h3>
                        
                        <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-400">Plan Name</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="e.g., Enterprise Plan" />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-400">Monthly Price ($)</label>
                                <input type="number" id="price" name="price" value={formData.price} onChange={handleFormChange} required min="0" step="1" className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description</label>
                                <input type="text" id="description" name="description" value={formData.description} onChange={handleFormChange} required className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="A short description for the plan." />
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="recommended" name="recommended" checked={formData.recommended} onChange={handleFormChange} className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"/>
                                <label htmlFor="recommended" className="ml-3 block text-sm font-medium text-gray-300">Mark as Recommended</label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Features</label>
                                <div className="space-y-2">
                                    {formData.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="text" value={feature} onChange={e => handleFeatureChange(index, e.target.value)} className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md text-sm" placeholder="Enter a feature"/>
                                            {formData.features.length > 1 && <button type="button" onClick={() => removeFeature(index)} className="p-2 text-gray-400 hover:text-red-400 rounded-full bg-gray-700/50 hover:bg-gray-600"><Icon name="trash" className="w-4 h-4"/></button>}
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addFeature} className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold flex items-center gap-1"><Icon name="plus" className="w-4 h-4"/> Add Feature</button>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-700 flex-shrink-0">
                            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 font-semibold">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-500 font-semibold">
                                {editingPlan ? 'Save Changes' : 'Create Plan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;