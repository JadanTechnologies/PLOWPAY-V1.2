
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Tenant, TenantStatus } from '../../types';
import Icon from '../icons';
import TenantDetailModal from './TenantDetailModal';

const TenantManagement: React.FC = () => {
    const { tenants, subscriptionPlans, addTenant, extendTrial, activateSubscription } = useAppContext();
    const [modal, setModal] = useState<'NONE' | 'ADD_TENANT' | 'VIEW_TENANT' | 'EXTEND_TRIAL' | 'ACTIVATE'>('NONE');
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

    const initialFormState: Omit<Tenant, 'id' | 'joinDate' | 'status' | 'trialEndDate' | 'isVerified' | 'billingCycle'> = {
        businessName: '', ownerName: '', email: '', username: '', password: '', 
        companyAddress: '', companyPhone: '', companyLogoUrl: '',
        planId: subscriptionPlans[0]?.id || ''
    };
    const [formState, setFormState] = useState(initialFormState);
    const [extendDays, setExtendDays] = useState(14);
    const [selectedPlanId, setSelectedPlanId] = useState(subscriptionPlans[0]?.id || '');

    const planMap = new Map(subscriptionPlans.map(p => [p.id, p.name]));
    
    const openModal = (modalType: 'ADD_TENANT' | 'VIEW_TENANT' | 'EXTEND_TRIAL' | 'ACTIVATE', tenant: Tenant | null = null) => {
        setModal(modalType);
        if (tenant) {
            setSelectedTenant(tenant);
            if (modalType === 'ACTIVATE') {
                setSelectedPlanId(tenant.planId);
            }
        }
    };

    const closeModal = () => {
        setModal('NONE');
        setSelectedTenant(null);
        setFormState(initialFormState);
        setExtendDays(14);
    };


    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addTenant(formState);
        closeModal();
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
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map(tenant => (
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
                                <td className="p-3 text-center whitespace-nowrap space-x-2">
                                     <button onClick={() => openModal('VIEW_TENANT', tenant)} className="text-sky-400 hover:text-sky-300 font-semibold px-2 py-1 rounded-md text-xs">View</button>
                                     <button className="text-yellow-400 hover:text-yellow-300 font-semibold px-2 py-1 rounded-md text-xs">Edit</button>
                                     {tenant.status === 'TRIAL' && (
                                        <>
                                            <button onClick={() => openModal('EXTEND_TRIAL', tenant)} className="text-green-400 hover:text-green-300 font-semibold px-2 py-1 rounded-md text-xs">Extend</button>
                                            <button onClick={() => openModal('ACTIVATE', tenant)} className="text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1 rounded-md text-xs">Activate</button>
                                        </>
                                    )}
                                    {tenant.status === 'SUSPENDED' && (
                                        <button onClick={() => openModal('ACTIVATE', tenant)} className="text-green-400 hover:text-green-300 font-semibold px-2 py-1 rounded-