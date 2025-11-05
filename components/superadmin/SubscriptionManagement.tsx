import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { SubscriptionPlan } from '../../types';
import Icon from '../icons';

const SubscriptionManagement: React.FC = () => {
    const { subscriptionPlans, addSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, tenants } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [formData, setFormData] = useState<{ name: 'Basic' | 'Pro' | 'Premium', price: number }>({ name: 'Basic', price: 0 });

    const openModal = (plan: SubscriptionPlan | null = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({ name: plan.name, price: plan.price });
        } else {
            setEditingPlan(null);
            setFormData({ name: 'Basic', price: 0 });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'price' ? parseFloat(value) : value 
        }));
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
                    <div key={plan.id} className="bg-gray-800 rounded-lg shadow-md p-6 flex flex-col justify-between border border-gray-700 hover:border-cyan-500 transition-colors">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                                <div className="text-right">
                                    <p className="text-3xl font-extrabold text-cyan-400">${plan.price}</p>
                                    <p className="text-sm text-gray-400">per month</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <div className="flex items-center text-gray-300">
                                    <Icon name="users" className="w-5 h-5 mr-2 text-gray-400"/>
                                    <span>{tenantsPerPlan[plan.id] || 0} Active Tenants</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-2">
                            <button onClick={() => openModal(plan)} className="text-yellow-400 hover:text-yellow-300 font-semibold px-3 py-1 rounded-md text-sm bg-gray-700 hover:bg-gray-600 transition-all">Edit</button>
                            <button onClick={() => handleDelete(plan.id)} className="text-rose-400 hover:text-rose-300 font-semibold px-3 py-1 rounded-md text-sm bg-gray-700 hover:bg-gray-600 transition-all">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-white">{editingPlan ? 'Edit Subscription Plan' : 'Add New Subscription Plan'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-400">Plan Name</label>
                                <select id="name" name="name" value={formData.name} onChange={handleFormChange} required className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    <option value="Basic">Basic</option>
                                    <option value="Pro">Pro</option>
                                    <option value="Premium">Premium</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-400">Monthly Price ($)</label>
                                <input type="number" id="price" name="price" value={formData.price} onChange={handleFormChange} required min="0" step="1" className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-700">
                                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 font-semibold">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-500 font-semibold">
                                    {editingPlan ? 'Save Changes' : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;
