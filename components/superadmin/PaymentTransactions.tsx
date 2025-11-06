
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { PaymentTransaction, PaymentTransactionStatus } from '../../types';
import Icon from '../icons';
import { useCurrency } from '../../hooks/useCurrency';

const PaymentTransactions: React.FC = () => {
    const { paymentTransactions, tenants, subscriptionPlans, updatePaymentTransactionStatus } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState<PaymentTransactionStatus | 'ALL'>('ALL');
    const [proofImage, setProofImage] = useState<string | null>(null);

    const tenantMap = useMemo(() => new Map(tenants.map(t => [t.id, t.businessName])), [tenants]);
    const planMap = useMemo(() => new Map(subscriptionPlans.map(p => [p.id, p.name])), [subscriptionPlans]);
    
    const filteredTransactions = useMemo(() => {
        if (activeTab === 'ALL') return paymentTransactions;
        return paymentTransactions.filter(t => t.status === activeTab);
    }, [paymentTransactions, activeTab]);

    const getStatusBadge = (status: PaymentTransactionStatus) => {
        const styles: {[key in PaymentTransactionStatus]: string} = {
            COMPLETED: 'bg-green-500/20 text-green-300',
            PENDING: 'bg-yellow-500/20 text-yellow-300',
            FAILED: 'bg-red-500/20 text-red-300',
            REJECTED: 'bg-rose-500/20 text-rose-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };
    
    const TabButton: React.FC<{tab: PaymentTransactionStatus | 'ALL', label: string}> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === tab ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
        </button>
    );

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-white mb-6">Payment Transactions</h2>

            <div className="border-b border-gray-700 mb-4">
                <nav className="flex space-x-2">
                    <TabButton tab="ALL" label="All" />
                    <TabButton tab="PENDING" label="Pending" />
                    <TabButton tab="COMPLETED" label="Completed" />
                    <TabButton tab="FAILED" label="Failed" />
                    <TabButton tab="REJECTED" label="Rejected" />
                </nav>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-3">Date</th><th className="p-3">Tenant</th><th className="p-3">Plan</th>
                            <th className="p-3 text-right">Amount</th><th className="p-3">Method</th><th className="p-3 text-center">Status</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map(tx => (
                            <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-3 text-sm text-gray-400">{tx.createdAt.toLocaleString()}</td>
                                <td className="p-3">{tenantMap.get(tx.tenantId)}</td>
                                <td className="p-3">{planMap.get(tx.planId)}</td>
                                <td className="p-3 text-right font-mono">{formatCurrency(tx.amount)}</td>
                                <td className="p-3">{tx.method}</td>
                                <td className="p-3 text-center">{getStatusBadge(tx.status)}</td>
                                <td className="p-3 text-center space-x-2">
                                    {tx.method === 'Manual' && tx.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => setProofImage(tx.proofOfPaymentUrl || null)} className="text-sky-400 text-xs font-semibold">View Proof</button>
                                            <button onClick={() => updatePaymentTransactionStatus(tx.id, 'COMPLETED')} className="text-green-400 text-xs font-semibold">Approve</button>
                                            <button onClick={() => updatePaymentTransactionStatus(tx.id, 'REJECTED')} className="text-rose-400 text-xs font-semibold">Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredTransactions.length === 0 && (
                    <p className="text-center text-gray-500 py-12">No transactions in this category.</p>
                )}
            </div>
            
            {proofImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4" onClick={() => setProofImage(null)}>
                    <div className="bg-gray-800 p-4 rounded-lg max-w-lg w-full">
                        <h3 className="text-lg font-bold mb-2">Proof of Payment</h3>
                        {/* In a real app, this would be an actual image. Here we just show the mock URL */}
                        <div className="bg-gray-900 p-4 rounded-md text-center">
                           <Icon name="clipboard-document-list" className="w-24 h-24 mx-auto text-gray-600"/>
                           <p className="text-gray-400 mt-2">Displaying mock proof of payment.</p>
                           <p className="text-xs text-gray-500 break-all">{proofImage}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentTransactions;
