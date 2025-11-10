import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Customer, Sale } from '../../types';
import Icon from './icons/index.tsx';
import { useCurrency } from '../../hooks/useCurrency';
import ConfirmationModal from './ConfirmationModal';

const CustomerCreditDetailModal: React.FC<{ customer: Customer; onClose: () => void; }> = ({ customer, onClose }) => {
    const { sales, recordCreditPayment, setNotification } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [paymentAmount, setPaymentAmount] = useState('');

    const unpaidSales = useMemo(() => {
        return sales.filter(sale => sale.customerId === customer.id && sale.status !== 'PAID');
    }, [sales, customer.id]);

    const handleRecordPayment = () => {
        if (paymentAmount) {
            const amount = parseFloat(paymentAmount);
            if (amount > 0 && amount <= customer.creditBalance) {
                recordCreditPayment(customer.id, amount);
                setNotification({ type: 'success', message: `Payment of ${formatCurrency(amount)} recorded for ${customer.name}.` });
                onClose();
            } else {
                setNotification({type: 'error', message: 'Please enter a valid amount that is not more than the credit balance.'});
            }
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-700">
                <div className="p-4 border-b border-slate-700 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-white">{customer.name}</h3>
                        <p className="text-slate-400 text-sm">{customer.phone} &bull; {customer.email}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><Icon name="x-mark" className="w-6 h-6"/></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                    <div className="md:col-span-2 bg-slate-900/50 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-2">Unpaid Invoices</h4>
                        <div className="overflow-y-auto max-h-80">
                            {unpaidSales.length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <thead className="sticky top-0 bg-slate-900/50">
                                        <tr className="border-b border-slate-700">
                                            <th className="p-2">Date</th><th className="p-2">Sale ID</th><th className="p-2 text-right">Total</th><th className="p-2 text-right">Amount Due</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {unpaidSales.map(sale => (
                                            <tr key={sale.id} className="border-b border-slate-800">
                                                <td className="p-2 text-slate-400">{new Date(sale.date).toLocaleDateString()}</td>
                                                <td className="p-2 font-mono text-xs">{sale.id}</td>
                                                <td className="p-2 text-right font-mono">{formatCurrency(sale.total)}</td>
                                                <td className="p-2 text-right font-mono text-red-400">{formatCurrency(sale.amountDue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-slate-500 text-center py-8">No outstanding invoices.</p>
                            )}
                        </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 flex flex-col justify-between">
                         <div>
                            <p className="text-slate-400">Total Credit Balance</p>
                            <p className="text-4xl font-bold text-red-400">{formatCurrency(customer.creditBalance)}</p>
                            <p className="text-slate-400 mt-2">Credit Limit: {customer.creditLimit ? formatCurrency(customer.creditLimit) : 'N/A'}</p>
                        </div>
                        <div className="mt-4">
                            <label className="text-sm">Payment Amount</label>
                            <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} max={customer.creditBalance} className="w-full bg-slate-700 p-2 rounded-md mt-1" />
                            <button onClick={handleRecordPayment} className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md">
                                Record Payment
                            </button>
                        </div>
                    </div>
                </div>

                 <div className="p-4 bg-slate-900/50 mt-auto rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-500 font-semibold">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreditManagement: React.FC = () => {
    const { customers, addCustomer, deleteCustomer, setNotification } = useAppContext();
    const { formatCurrency } = useCurrency();

    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
    const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '', address: '', creditLimit: 0 });

    const handleAddCustomer = () => {
        if(customerForm.name) {
            addCustomer(customerForm);
            setNotification({ type: 'success', message: `Customer '${customerForm.name}' added successfully.` });
            setCustomerModalOpen(false);
            setCustomerForm({ name: '', phone: '', email: '', address: '', creditLimit: 0 });
        }
    };
    
    const customerToDelete = useMemo(() => customers.find(c => c.id === deletingCustomer?.id), [deletingCustomer, customers]);

    return (
        <div className="space-y-6">
            <div className="p-6 bg-slate-800 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Customer Credit Management</h2>
                    <button onClick={() => setCustomerModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        Add Customer
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-700">
                            <tr>
                                <th className="p-3">Customer Name</th>
                                <th className="p-3">Phone</th>
                                <th className="p-3 text-right">Credit Balance</th>
                                <th className="p-3 text-right">Credit Limit</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.filter(c => c.id !== 'cust-walkin').map(customer => (
                                <tr key={customer.id} className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer" onClick={() => setViewingCustomer(customer)}>
                                    <td className="p-3 font-medium">{customer.name}</td>
                                    <td className="p-3 text-slate-400">{customer.phone || 'N/A'}</td>
                                    <td className={`p-3 text-right font-mono ${customer.creditBalance > 0 ? 'text-red-400' : 'text-green-400'}`}>{formatCurrency(customer.creditBalance)}</td>
                                    <td className="p-3 text-right font-mono">{customer.creditLimit ? formatCurrency(customer.creditLimit) : 'N/A'}</td>
                                    <td className="p-3 text-center space-x-3">
                                        <button onClick={(e) => { e.stopPropagation(); setViewingCustomer(customer); }} className="text-green-400 hover:text-green-300 font-semibold px-2 py-1 rounded-md text-sm">
                                            View & Pay
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setDeletingCustomer(customer); }} className="text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded-md text-sm">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewingCustomer && (
                <CustomerCreditDetailModal customer={viewingCustomer} onClose={() => setViewingCustomer(null)} />
            )}
            
            {isCustomerModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add New Customer</h3>
                        <div className="space-y-4">
                            <div><label className="text-sm">Name</label><input type="text" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Phone</label><input type="tel" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md mt-1"/></div>
                             <div><label className="text-sm">Credit Limit</label><input type="number" value={customerForm.creditLimit} onChange={e => setCustomerForm({...customerForm, creditLimit: parseFloat(e.target.value)})} className="w-full bg-slate-700 p-2 rounded-md mt-1"/></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setCustomerModalOpen(false)} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500">Cancel</button>
                            <button onClick={handleAddCustomer} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500">Save Customer</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!deletingCustomer}
                onClose={() => setDeletingCustomer(null)}
                onConfirm={() => {
                    if (deletingCustomer) {
                        deleteCustomer(deletingCustomer.id);
                        setNotification({ type: 'success', message: `Customer '${deletingCustomer.name}' has been deleted.` });
                    }
                }}
                title={`Delete Customer: ${deletingCustomer?.name}`}
                confirmText="Delete"
            >
                Are you sure you want to delete this customer? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default CreditManagement;