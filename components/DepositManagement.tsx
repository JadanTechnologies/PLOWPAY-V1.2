

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Deposit } from '../../types';
import Icon from './icons/index.tsx';
import { useCurrency } from '../../hooks/useCurrency';

type DepositTab = 'ACTIVE' | 'APPLIED' | 'REFUNDED' | 'ALL';

const DepositManagement: React.FC = () => {
    const { deposits, customers, staff, branches, updateDeposit, currentStaffUser } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState<DepositTab>('ACTIVE');
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
    const [newStatus, setNewStatus] = useState<'APPLIED' | 'REFUNDED' | 'ACTIVE'>('ACTIVE');
    const [notes, setNotes] = useState('');
    const [appliedSaleIdInput, setAppliedSaleIdInput] = useState('');

    const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c.name])), [customers]);
    const staffMap = useMemo(() => new Map(staff.map(s => [s.id, s.name])), [staff]);
    const branchMap = useMemo(() => new Map(branches.map(b => [b.id, b.name])), [branches]);

    const filteredDeposits = useMemo(() => {
        const userDeposits = currentStaffUser
            ? deposits.filter(d => d.branchId === currentStaffUser.branchId)
            : deposits;
        
        const sortedDeposits = [...userDeposits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (activeTab === 'ALL') return sortedDeposits;
        return sortedDeposits.filter(d => d.status === activeTab);
    }, [deposits, activeTab, currentStaffUser]);

    const openModal = (deposit: Deposit) => {
        setSelectedDeposit(deposit);
        setNewStatus(deposit.status);
        setNotes(deposit.notes || '');
        setAppliedSaleIdInput(deposit.appliedSaleId || '');
        setModalOpen(true);
    };

    const handleUpdateStatus = () => {
        if (selectedDeposit) {
            updateDeposit(selectedDeposit.id, { 
                status: newStatus, 
                notes,
                appliedSaleId: newStatus === 'APPLIED' ? appliedSaleIdInput : undefined
            });
            setModalOpen(false);
        }
    };

    const getStatusBadge = (status: Deposit['status']) => {
        const styles = {
            ACTIVE: 'bg-green-500/20 text-green-300',
            APPLIED: 'bg-blue-500/20 text-blue-300',
            REFUNDED: 'bg-yellow-500/20 text-yellow-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };

    const TabButton: React.FC<{ tab: DepositTab, label: string }> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
            {label}
        </button>
    );

    return (
        <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Deposit Management</h2>
            
            <div className="flex flex-wrap gap-2 border-b border-slate-700 mb-6 pb-2">
                <TabButton tab="ACTIVE" label="Active" />
                <TabButton tab="APPLIED" label="Applied" />
                <TabButton tab="REFUNDED" label="Refunded" />
                <TabButton tab="ALL" label="All" />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-700 text-xs text-slate-400 uppercase">
                        <tr>
                            <th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Branch</th>
                            <th className="p-3 text-right">Amount</th><th className="p-3">Staff</th>
                            <th className="p-3 text-center">Status</th><th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDeposits.map(deposit => (
                            <tr key={deposit.id} className="border-b border-slate-800 hover:bg-slate-700/50">
                                <td className="p-3 text-sm text-slate-400">{new Date(deposit.date).toLocaleString()}</td>
                                <td className="p-3">{customerMap.get(deposit.customerId) || 'N/A'}</td>
                                <td className="p-3">{branchMap.get(deposit.branchId) || 'N/A'}</td>
                                <td className="p-3 text-right font-mono font-bold text-cyan-400">{formatCurrency(deposit.amount)}</td>
                                <td className="p-3">{staffMap.get(deposit.staffId) || 'N/A'}</td>
                                <td className="p-3 text-center">
                                    {getStatusBadge(deposit.status)}
                                    {deposit.status === 'APPLIED' && deposit.appliedSaleId && (
                                        <div className="text-xs text-slate-500 mt-1 font-mono">
                                            Sale: {deposit.appliedSaleId.slice(0, 15)}
                                        </div>
                                    )}
                                </td>
                                <td className="p-3 text-center">
                                    <button onClick={() => openModal(deposit)} className="text-yellow-400 hover:text-yellow-300 font-semibold text-sm">Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredDeposits.length === 0 && (
                    <p className="text-center py-12 text-slate-500">No deposits found in this category.</p>
                )}
            </div>

            {isModalOpen && selectedDeposit && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-white">Manage Deposit</h3>
                        <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700 mb-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Customer:</span>
                                <span className="font-semibold">{customerMap.get(selectedDeposit.customerId)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Amount:</span>
                                <span className="font-bold text-cyan-400">{formatCurrency(selectedDeposit.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Date:</span>
                                <span className="text-sm">{new Date(selectedDeposit.date).toLocaleString()}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-slate-400">Recorded by:</span>
                                <span>{staffMap.get(selectedDeposit.staffId)} at {branchMap.get(selectedDeposit.branchId)}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-400">Status</label>
                                <select value={newStatus} onChange={e => setNewStatus(e.target.value as any)} className="w-full bg-slate-700 p-2 rounded-md mt-1 text-white border border-slate-600 focus:ring-cyan-500">
                                    <option>ACTIVE</option>
                                    <option>APPLIED</option>
                                    <option>REFUNDED</option>
                                </select>
                            </div>
                             {newStatus === 'APPLIED' && (
                                <div>
                                    <label className="text-sm font-medium text-slate-400">Applied to Sale ID (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={appliedSaleIdInput} 
                                        onChange={e => setAppliedSaleIdInput(e.target.value)}
                                        placeholder="Enter Sale ID..."
                                        className="w-full bg-slate-700 p-2 rounded-md mt-1 text-white border border-slate-600 focus:ring-cyan-500 font-mono"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-slate-400">Notes</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-slate-700 p-2 rounded-md mt-1 text-white border border-slate-600 focus:ring-cyan-500" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-500 font-semibold">Cancel</button>
                            <button onClick={handleUpdateStatus} className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold">Update Deposit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepositManagement;