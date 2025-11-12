import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Customer } from '../../types';
import Icon from '../icons';
import { useCurrency } from '../../hooks/useCurrency';
import { CustomerCreditDetailModal } from '../CreditManagement';


const CashierCredit: React.FC = () => {
    const { customers } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

    const creditCustomers = useMemo(() => {
        return customers.filter(c => c.id !== 'cust-walkin' && c.creditBalance > 0)
            .sort((a,b) => b.creditBalance - a.creditBalance);
    }, [customers]);

    return (
        <div className="space-y-6">
            <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-white">Customer Credit Records</h2>
                <p className="text-slate-400 mt-1">View customers with outstanding balances and record payments.</p>
            </div>

            <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-700 text-xs text-slate-400 uppercase">
                            <tr>
                                <th className="p-3">Customer Name</th>
                                <th className="p-3">Phone</th>
                                <th className="p-3 text-right">Credit Balance</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {creditCustomers.map(customer => (
                                <tr key={customer.id} className="border-b border-slate-800 hover:bg-slate-700/50">
                                    <td className="p-3 font-medium">{customer.name}</td>
                                    <td className="p-3 text-slate-400">{customer.phone || 'N/A'}</td>
                                    <td className={`p-3 text-right font-mono text-red-400`}>{formatCurrency(customer.creditBalance)}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => setViewingCustomer(customer)} className="text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1 rounded-md text-sm">
                                            View & Record Payment
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {creditCustomers.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <Icon name="check" className="w-12 h-12 mx-auto mb-2 text-green-500"/>
                            <p>No customers with outstanding credit.</p>
                        </div>
                    )}
                </div>
            </div>

            {viewingCustomer && (
                <CustomerCreditDetailModal customer={viewingCustomer} onClose={() => setViewingCustomer(null)} />
            )}
        </div>
    );
};

export default CashierCredit;
