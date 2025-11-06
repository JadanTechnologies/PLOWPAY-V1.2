
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Tenant, TenantStatus } from '../../types';
import Icon from '../icons';

const TenantManagement: React.FC = () => {
    const { tenants, subscriptionPlans, addTenant } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    
    const initialFormState = {
        businessName: '', ownerName: '', email: '', username: '', password: '', 
        companyAddress: '', companyPhone: '', companyLogoUrl: '',
        planId: subscriptionPlans[0]?.id || ''
    };
    const [formState, setFormState] = useState<Omit<Tenant, 'id' | 'joinDate' | 'status'>>(initialFormState);

    const planMap = new Map(subscriptionPlans.map(p => [p.id, p.name]));
    
    const openModal = () => setModalOpen(true);
    const closeModal = () => {
        setModalOpen(false);
        setFormState(initialFormState);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addTenant(formState);
        closeModal();
    };


    const getStatusBadge = (status: TenantStatus) => {
        const styles: {[key in TenantStatus]: string} = {
            ACTIVE: 'bg-green-500/20 text-green-300',
            SUSPENDED: 'bg-red-500/20 text-red-300',
            TRIAL: 'bg-yellow-500/20 text-yellow-300',
        };
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Tenant Management</h2>
                <button onClick={openModal} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    Add Tenant
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-3 text-sm font-semibold tracking-wide">Business Name</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">Owner</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">Email</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-center">Status</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">Plan</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">Join Date</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map(tenant => (
                            <tr key={tenant.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-3 whitespace-nowrap font-medium">{tenant.businessName}</td>
                                <td className="p-3 whitespace-nowrap text-gray-300">{tenant.ownerName}</td>
                                <td className="p-3 whitespace-nowrap text-gray-400">{tenant.email}</td>
                                <td className="p-3 whitespace-nowrap text-center">{getStatusBadge(tenant.status)}</td>
                                <td className="p-3 whitespace-nowrap">{planMap.get(tenant.planId)}</td>
                                <td className="p-3 whitespace-nowrap text-gray-400">{tenant.joinDate.toLocaleDateString()}</td>
                                <td className="p-3 text-center whitespace-nowrap space-x-2">
                                     <button className="text-sky-400 hover:text-sky-300 font-semibold px-2 py-1 rounded-md text-sm">View</button>
                                     <button className="text-yellow-400 hover:text-yellow-300 font-semibold px-2 py-1 rounded-md text-sm">Edit</button>
                                     <button className="text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded-md text-sm">Suspend</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {tenants.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No tenants found.</p>
                )}
            </div>

            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4 text-white">Add New Tenant</h3>
                        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
                            <fieldset className="p-4 border border-gray-700 rounded-md">
                                <legend className="px-2 text-lg font-semibold text-cyan-400">Company Information</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="text-sm text-gray-400">Business Name</label><input required name="businessName" onChange={handleFormChange} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                                    <div><label className="text-sm text-gray-400">Subscription Plan</label><select required name="planId" onChange={handleFormChange} className="w-full bg-gray-700 p-2 rounded-md mt-1">{subscriptionPlans.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price}/mo</option>)}</select></div>
                                    <div><label className="text-sm text-gray-400">Company Phone</label><input name="companyPhone" onChange={handleFormChange} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                                    <div><label className="text-sm text-gray-400">Company Logo URL</label><input name="companyLogoUrl" onChange={handleFormChange} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                                    <div className="md:col-span-2"><label className="text-sm text-gray-400">Company Address</label><input name="companyAddress" onChange={handleFormChange} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                                </div>
                            </fieldset>

                             <fieldset className="p-4 border border-gray-700 rounded-md">
                                <legend className="px-2 text-lg font-semibold text-cyan-400">Owner's Credentials</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="text-sm text-gray-400">Owner's Full Name</label><input required name="ownerName" onChange={handleFormChange} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                                    <div><label className="text-sm text-gray-400">Owner's Email</label><input required type="email" name="email" onChange={handleFormChange} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                                    <div><label className="text-sm text-gray-400">Username</label><input required name="username" onChange={handleFormChange} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                                    <div><label className="text-sm text-gray-400">Password</label><input required type="password" name="password" onChange={handleFormChange} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                                </div>
                            </fieldset>
                            
                            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-700">
                                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 font-semibold">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-500 font-semibold">Create Tenant</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantManagement;
