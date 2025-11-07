import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Customer } from '../types';
import Icon from '/components/icons/index.tsx';
import { useCurrency } from '../hooks/useCurrency';

const CreditManagement: React.FC = () => {
    const { customers, recordCreditPayment, addCustomer } = useAppContext();
    const { formatCurrency } = useCurrency();

    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '', address: '', creditLimit: 0 });

    const openPaymentModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setPaymentAmount('');
        setPaymentModalOpen(true);
    };

    const handleRecordPayment = () => {
        if (selectedCustomer && paymentAmount) {
            const amount = parseFloat(paymentAmount);
            if (amount > 0) {
                recordCreditPayment(selectedCustomer.id, amount);
                setPaymentModalOpen(false);
            }
        }
    };
    
    const handleAddCustomer = () => {
        if(customerForm.name) {
            addCustomer(customerForm);
            setCustomerModalOpen(false);
            setCustomerForm({ name: '', phone: '', email: '', address: '', creditLimit: 0 });
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Customer Credit Management</h2>
                    <button onClick={() => setCustomerModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        Add Customer
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700">
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
                                <tr key={customer.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-3 font-medium">{customer.name}</td>
                                    <td className="p-3 text-gray-400">{customer.phone || 'N/A'}</td>
                                    <td className={`p-3 text-right font-mono ${customer.creditBalance > 0 ? 'text-red-400' : 'text-green-400'}`}>{formatCurrency(customer.creditBalance)}</td>
                                    <td className="p-3 text-right font-mono">{customer.creditLimit ? formatCurrency(customer.creditLimit) : 'N/A'}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => openPaymentModal(customer)} className="text-green-400 hover:text-green-300 font-semibold px-2 py-1 rounded-md text-sm" disabled={customer.creditBalance <= 0}>
                                            Record Payment
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isPaymentModalOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Record Payment for {selectedCustomer.name}</h3>
                        <p className="text-gray-400">Current Balance: <span className="font-bold text-red-400">{formatCurrency(selectedCustomer.creditBalance)}</span></p>
                        <div className="mt-4">
                            <label className="text-sm">Payment Amount</label>
                            <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} max={selectedCustomer.creditBalance} className="w-full bg-gray-700 p-2 rounded-md mt-1" />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setPaymentModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button>
                            <button onClick={handleRecordPayment} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500">Confirm Payment</button>
                        </div>
                    </div>
                </div>
            )}
            
            {isCustomerModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add New Customer</h3>
                        <div className="space-y-4">
                            <div><label className="text-sm">Name</label><input type="text" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Phone</label><input type="tel" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                             <div><label className="text-sm">Credit Limit</label><input type="number" value={customerForm.creditLimit} onChange={e => setCustomerForm({...customerForm, creditLimit: parseFloat(e.target.value)})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setCustomerModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button>
                            <button onClick={handleAddCustomer} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500">Save Customer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditManagement;