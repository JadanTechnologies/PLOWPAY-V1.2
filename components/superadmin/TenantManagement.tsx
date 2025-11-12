

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Tenant, TenantStatus } from '../../types';
import Icon from '../icons/index.tsx';
import TenantDetailModal from './TenantDetailModal';

interface TenantManagementProps {
    onImpersonate: (tenant: Tenant) => void;
}

const TenantManagement: React.FC<TenantManagementProps> = ({ onImpersonate }) => {
    const { tenants, subscriptionPlans, addTenant, extendTrial, activateSubscription, updateTenant, setNotification } = useAppContext();
    const [modal, setModal] = useState<'NONE' | 'ADD_TENANT' | 'EDIT_TENANT' | 'VIEW_TENANT' | 'EXTEND_TRIAL' | 'ACTIVATE'>('NONE');
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const ITEMS_PER_PAGE = 10;


    const initialFormState: Omit<Tenant, 'id' | 'joinDate' | 'status' | 'trialEndDate' | 'isVerified' | 'billingCycle' | 'lastLoginIp' | 'lastLoginDate'> = {
        businessName: '', ownerName: '', email: '', username: '', password: '', 
        companyAddress: '', companyPhone: '', companyLogoUrl: '',
        planId: subscriptionPlans[0]?.id || ''
    };
    const [formState, setFormState] = useState(initialFormState);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [extendDays, setExtendDays] = useState(14);
    const [selectedPlanId, setSelectedPlanId] = useState(subscriptionPlans[0]?.id || '');

    const planMap = new Map(subscriptionPlans.map(p => [p.id, p.name]));
    
    const filteredTenants = useMemo(() => {
        return tenants.filter(tenant => 
            tenant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tenants, searchTerm]);

    const totalPages = Math.ceil(filteredTenants.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentTenants = filteredTenants.slice(startIndex, endIndex);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const openModal = (modalType: 'ADD_TENANT' | 'EDIT_TENANT' | 'VIEW_TENANT' | 'EXTEND_TRIAL' | 'ACTIVATE', tenant: Tenant | null = null) => {
        setModal(modalType);
        setLogoFile(null);
        setLogoPreview(null);
        if (tenant) {
            setSelectedTenant(tenant);
            if (modalType === 'ACTIVATE') {
                setSelectedPlanId(tenant.planId);
            }
             if (modalType === 'EDIT_TENANT') {
                setFormState({
                    businessName: tenant.businessName,
                    ownerName: tenant.ownerName,
                    email: tenant.email,
                    username: tenant.username,
                    password: '', // Don't pre-fill password for security
                    companyAddress: tenant.companyAddress || '',
                    companyPhone: tenant.companyPhone || '',
                    companyLogoUrl: tenant.companyLogoUrl || '',
                    planId: tenant.planId,
                });
                setLogoPreview(tenant.companyLogoUrl || null);
            }
        } else {
            setFormState(initialFormState);
        }
    };

    const closeModal = () => {
        setModal('NONE');
        setSelectedTenant(null);
        setFormState(initialFormState);
        setExtendDays(14);
        setLogoFile(null);
        setLogoPreview(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (modal === 'EDIT_TENANT' && selectedTenant) {
            const updateData: Partial<Tenant> = { ...formState };
            if (!formState.password || formState.password.trim() === '') {
                delete (updateData as any).password;
            }
             if (logoPreview !== selectedTenant.companyLogoUrl) {
                updateData.companyLogoUrl = logoPreview || '';
            }
            updateTenant(selectedTenant.id, updateData);
            setNotification({ type: 'success', message: 'Tenant updated successfully.' });
            closeModal();
        } else {
            if (!logoPreview) {
                setNotification({type: 'error', message: 'Please upload a company logo.'});
                return;
            }
            const { success, message } = await addTenant(formState, logoPreview);
            setNotification({ type: success ? 'success' : 'error', message });
            if (success) {
                closeModal();
            }
        }
    };

    const handleExtendTrial = () => {
        if (selectedTenant && extendDays > 0) {
            extendTrial(selectedTenant.id, extendDays);
            closeModal();
        }
    };

    const handleActivate = () => {
        if (selectedTenant && selectedPlanId) {
            activateSubscription(selectedTenant.id, selectedPlanId, 'monthly');
            closeModal();
        }
    };


    const getStatusBadge = (status: TenantStatus) => {
        const styles: {[key in TenantStatus]: string} = {
            ACTIVE: 'bg-green-500/20 text-green-300',
            SUSPENDED: 'bg-red-500/20 text-red-300',
            TRIAL: 'bg-yellow-500/20 text-yellow-300',
            UNVERIFIED: 'bg-slate-500/20 text-slate-300',
        };
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Tenant Management</h2>
                <button onClick={() => openModal('ADD_TENANT')} className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    Add Tenant
                </button>
            </div>
            <div className="mb-4">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Icon name="search" className="w-5 h-5 text-slate-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search by business name or email..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full max-w-sm py-2 pl-10 pr-4 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-700 text-xs text-slate-400 uppercase">
                        <tr>
                            <th className="p-3">Business Name</th>
                            <th className="p-3">Owner</th>
                            <th className="p-3">Email</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3">Plan</th>
                            <th className="p-3">Join Date</th>
                            <th className="p-3">Trial Ends</th>
                            <th className="p-3">Last Login IP</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTenants.map(tenant => (
                            <tr key={tenant.id} className="border-b border-slate-700 hover:bg-slate-700/50 text-sm">
                                <td className="p-3 whitespace-nowrap font-medium">{tenant.businessName}</td>
                                <td className="p-3 whitespace-nowrap text-slate-300">{tenant.ownerName}</td>
                                <td className="p-3 whitespace-nowrap text-slate-400">{tenant.email}</td>
                                <td className="p-3 whitespace-nowrap text-center">{getStatusBadge(tenant.status)}</td>
                                <td className="p-3 whitespace-nowrap">{planMap.get(tenant.planId)}</td>
                                <td className="p-3 whitespace-nowrap text-slate-400">{tenant.joinDate.toLocaleDateString()}</td>
                                <td className="p-3 whitespace-nowrap text-slate-400">
                                    {tenant.status === 'TRIAL' && tenant.trialEndDate ? (
                                        new Date(tenant.trialEndDate).toLocaleDateString()
                                    ) : 'N/A'}
                                </td>
                                <td className="p-3 whitespace-nowrap text-slate-400 font-mono">{tenant.lastLoginIp || 'N/A'}</td>
                                <td className="p-3 text-center whitespace-nowrap space-x-2">
                                     <button onClick={() => onImpersonate(tenant)} title="Impersonate Tenant" className="text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1 rounded-md text-xs">Impersonate</button>
                                     <button onClick={() => openModal('VIEW_TENANT', tenant)} className="text-sky-400 hover:text-sky-300 font-semibold px-2 py-1 rounded-md text-xs">View</button>
                                     <button onClick={() => openModal('EDIT_TENANT', tenant)} className="text-yellow-400 hover:text-yellow-300 font-semibold px-2 py-1 rounded-md text-xs">Edit</button>
                                     {tenant.status === 'TRIAL' && (
                                        <>
                                            <button onClick={() => openModal('EXTEND_TRIAL', tenant)} className="text-green-400 hover:text-green-300 font-semibold px-2 py-1 rounded-md text-xs">Extend</button>
                                            <button onClick={() => openModal('ACTIVATE', tenant)} className="text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1 rounded-md text-xs">Activate</button>
                                        </>
                                    )}
                                    {tenant.status === 'SUSPENDED' && (
                                        <button onClick={() => openModal('ACTIVATE', tenant)} className="text-green-400 hover:text-green-300 font-semibold px-2 py-1 rounded-md text-xs">Activate</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
             <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-slate-400">
                    Showing {filteredTenants.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredTenants.length)} of {filteredTenants.length} tenants
                </span>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handlePrevPage} 
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-slate-700 rounded-md text-sm font-semibold hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-slate-400">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <button 
                        onClick={handleNextPage} 
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-slate-700 rounded-md text-sm font-semibold hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>

            {modal === 'VIEW_TENANT' && selectedTenant && (
                <TenantDetailModal 
                    tenant={selectedTenant}
                    planName={planMap.get(selectedTenant.planId) || 'N/A'}
                    onClose={closeModal}
                />
            )}

            {(modal === 'ADD_TENANT' || modal === 'EDIT_TENANT') && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-white">{modal === 'EDIT_TENANT' ? 'Edit Tenant' : 'Add New Tenant'}</h3>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400">Business Name</label>
                                    <input type="text" name="businessName" value={formState.businessName} onChange={handleFormChange} required className="w-full mt-1 py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400">Owner Name</label>
                                    <input type="text" name="ownerName" value={formState.ownerName} onChange={handleFormChange} required className="w-full mt-1 py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400">Email</label>
                                    <input type="email" name="email" value={formState.email} onChange={handleFormChange} required className="w-full mt-1 py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400">Username</label>
                                    <input type="text" name="username" value={formState.username} onChange={handleFormChange} required className="w-full mt-1 py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-400">Password</label>
                                    <input type="password" name="password" value={formState.password || ''} onChange={handleFormChange} placeholder={modal === 'EDIT_TENANT' ? 'Leave blank to keep current password' : ''} required={modal === 'ADD_TENANT'} className="w-full mt-1 py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400">Plan</label>
                                    <select name="planId" value={formState.planId} onChange={handleFormChange} className="w-full mt-1 py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md">
                                        {subscriptionPlans.map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                                    </select>
                                </div>
                                 <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-400">Company Logo</label>
                                    <div className="mt-1 flex items-center space-x-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo Preview" className="h-16 w-16 rounded-md object-contain bg-white/10" />
                                        ) : (
                                            <div className="h-16 w-16 rounded-md bg-slate-600 flex items-center justify-center">
                                                <Icon name="briefcase" className="w-8 h-8 text-slate-500" />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label htmlFor="logo-upload" className="cursor-pointer bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md text-sm inline-block">
                                                <span>{logoFile || logoPreview ? 'Change Logo' : 'Upload Logo'}</span>
                                                <input id="logo-upload" name="logo" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} required={modal === 'ADD_TENANT' && !logoPreview}/>
                                            </label>
                                            {logoPreview && (
                                                <button type="button" onClick={() => { setLogoPreview(null); setLogoFile(null); }} className="text-xs text-rose-400 hover:text-rose-300 font-semibold">
                                                    Remove Logo
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-700">
                            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 font-semibold">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold">
                                {modal === 'EDIT_TENANT' ? 'Save Changes' : 'Save Tenant'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {modal === 'EXTEND_TRIAL' && selectedTenant && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-white">Extend Trial for {selectedTenant.businessName}</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="extendDays" className="block text-sm font-medium text-slate-400">Days to Extend</label>
                                <input type="number" id="extendDays" value={extendDays} onChange={(e) => setExtendDays(parseInt(e.target.value, 10))} className="w-full mt-1 py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={closeModal} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 font-semibold">Cancel</button>
                            <button onClick={handleExtendTrial} className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold">Extend Trial</button>
                        </div>
                    </div>
                </div>
            )}

            {modal === 'ACTIVATE' && selectedTenant && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-white">Activate Subscription for {selectedTenant.businessName}</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="planId" className="block text-sm font-medium text-slate-400">Subscription Plan</label>
                                <select id="planId" value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} className="w-full mt-1 py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md">
                                    {subscriptionPlans.map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={closeModal} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 font-semibold">Cancel</button>
                            <button onClick={handleActivate} className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold">Activate</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantManagement;
