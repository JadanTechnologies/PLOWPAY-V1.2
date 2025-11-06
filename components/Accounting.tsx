
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './icons';
import { Account, JournalEntry } from '../types';

type AccountingTab = 'dashboard' | 'journal' | 'accounts' | 'reports';

const MetricCard: React.FC<{ title: string; value: string; iconName: string; iconBgColor: string }> = ({ title, value, iconName, iconBgColor }) => (
  <div className="p-4 bg-gray-800 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full ${iconBgColor} mr-4`}>
      <Icon name={iconName} className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);


const Accounting: React.FC = () => {
    const { accounts, journalEntries, addAccount, addJournalEntry } = useAppContext();
    const [activeTab, setActiveTab] = useState<AccountingTab>('dashboard');

    const [isAccountModalOpen, setAccountModalOpen] = useState(false);
    const [isJournalModalOpen, setJournalModalOpen] = useState(false);

    const [accountForm, setAccountForm] = useState({ name: '', type: 'ASSET' as Account['type'] });
    const [journalForm, setJournalForm] = useState({ description: '', transactions: [{ accountId: '', amount: 0 }, { accountId: '', amount: 0 }] });

    const financials = useMemo(() => {
        const totalRevenue = accounts.filter(a => a.type === 'REVENUE').reduce((sum, a) => sum - a.balance, 0);
        const totalExpenses = accounts.filter(a => a.type === 'EXPENSE').reduce((sum, a) => sum + a.balance, 0);
        const netIncome = totalRevenue - totalExpenses;
        const totalAssets = accounts.filter(a => a.type === 'ASSET').reduce((sum, a) => sum + a.balance, 0);
        const totalLiabilities = accounts.filter(a => a.type === 'LIABILITY').reduce((sum, a) => sum - a.balance, 0);
        const totalEquity = accounts.filter(a => a.type === 'EQUITY').reduce((sum, a) => sum - a.balance, 0);
        return { totalRevenue, totalExpenses, netIncome, totalAssets, totalLiabilities, totalEquity };
    }, [accounts]);

    const handleAddAccount = () => {
        if(accountForm.name) {
            addAccount(accountForm);
            setAccountModalOpen(false);
            setAccountForm({ name: '', type: 'ASSET' });
        }
    };
    
    const handleJournalTransactionChange = (index: number, field: 'accountId' | 'amount', value: string) => {
        const newTransactions = [...journalForm.transactions];
        (newTransactions[index] as any)[field] = field === 'amount' ? parseFloat(value) : value;
        setJournalForm(prev => ({...prev, transactions: newTransactions}));
    };
    
    const addJournalTransactionRow = () => {
        setJournalForm(prev => ({ ...prev, transactions: [...prev.transactions, { accountId: '', amount: 0 }]}));
    };

    const handleAddJournalEntry = () => {
        const debits = journalForm.transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const credits = journalForm.transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
        if (Math.abs(debits + credits) > 0.001) {
            alert('Journal entry is not balanced. Total debits must equal total credits.');
            return;
        }
        addJournalEntry(journalForm);
        setJournalModalOpen(false);
        setJournalForm({ description: '', transactions: [{ accountId: '', amount: 0 }, { accountId: '', amount: 0 }] });
    };

    const TabButton: React.FC<{tab: AccountingTab, label: string}> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
        </button>
    );

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return (
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <MetricCard title="Total Revenue" value={`$${financials.totalRevenue.toLocaleString()}`} iconName="trending-up" iconBgColor="bg-green-500" />
                        <MetricCard title="Total Expenses" value={`$${financials.totalExpenses.toLocaleString()}`} iconName="trending-up" iconBgColor="bg-red-500" />
                        <MetricCard title="Net Income" value={`$${financials.netIncome.toLocaleString()}`} iconName="chart-pie" iconBgColor="bg-blue-500" />
                    </div>
                );
            case 'journal':
                 return (
                     <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Journal Entries</h3>
                            <button onClick={() => setJournalModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center"><Icon name="plus" className="w-5 h-5 mr-2" />Add Entry</button>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                               <thead className="border-b border-gray-700"><tr><th className="p-3">Date</th><th className="p-3">Description</th><th className="p-3">Debits</th><th className="p-3">Credits</th></tr></thead>
                               <tbody>
                                {journalEntries.map(je => <tr key={je.id} className="border-b border-gray-700">
                                    <td className="p-3">{je.date.toLocaleDateString()}</td><td className="p-3">{je.description}</td>
                                    <td className="p-3 font-mono">{je.transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</td>
                                    <td className="p-3 font-mono">{-je.transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</td>
                                </tr>)}
                               </tbody>
                           </table>
                        </div>
                    </div>
                );
            case 'accounts':
                return (
                     <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Chart of Accounts</h3>
                            <button onClick={() => setAccountModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center"><Icon name="plus" className="w-5 h-5 mr-2" />Add Account</button>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                               <thead className="border-b border-gray-700"><tr><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3 text-right">Balance</th></tr></thead>
                               <tbody>
                                {accounts.map(acc => <tr key={acc.id} className="border-b border-gray-700">
                                    <td className="p-3">{acc.name}</td><td className="p-3">{acc.type}</td><td className="p-3 text-right font-mono">${acc.balance.toFixed(2)}</td>
                                </tr>)}
                               </tbody>
                           </table>
                        </div>
                    </div>
                );
            case 'reports':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <h3 className="font-bold text-lg mb-2 text-center">Income Statement</h3>
                            <div className="space-y-1">
                                <div className="flex justify-between"><span className="font-semibold">Revenue</span><span>${financials.totalRevenue.toFixed(2)}</span></div>
                                <div className="flex justify-between border-b border-gray-700 pb-1"><span className="pl-4">Total Revenue</span><span>${financials.totalRevenue.toFixed(2)}</span></div>
                                <div className="flex justify-between pt-2"><span className="font-semibold">Expenses</span></div>
                                {accounts.filter(a => a.type === 'EXPENSE').map(a => <div key={a.id} className="flex justify-between pl-4"><span className="text-gray-400">{a.name}</span><span>${a.balance.toFixed(2)}</span></div>)}
                                <div className="flex justify-between border-b border-gray-700 pb-1"><span className="pl-4">Total Expenses</span><span>${financials.totalExpenses.toFixed(2)}</span></div>
                                <div className="flex justify-between pt-2 font-bold text-xl"><span className="font-semibold">Net Income</span><span>${financials.netIncome.toFixed(2)}</span></div>
                            </div>
                        </div>
                         <div className="bg-gray-900/50 p-4 rounded-lg">
                            <h3 className="font-bold text-lg mb-2 text-center">Balance Sheet</h3>
                             <div className="space-y-1">
                                <div className="flex justify-between font-semibold"><span>Assets</span></div>
                                {accounts.filter(a => a.type === 'ASSET').map(a => <div key={a.id} className="flex justify-between pl-4"><span className="text-gray-400">{a.name}</span><span>${a.balance.toFixed(2)}</span></div>)}
                                <div className="flex justify-between border-b border-gray-700 pb-1 font-bold"><span>Total Assets</span><span>${financials.totalAssets.toFixed(2)}</span></div>
                                
                                <div className="flex justify-between pt-2 font-semibold"><span>Liabilities</span></div>
                                {accounts.filter(a => a.type === 'LIABILITY').map(a => <div key={a.id} className="flex justify-between pl-4"><span className="text-gray-400">{a.name}</span><span>${(-a.balance).toFixed(2)}</span></div>)}
                                <div className="flex justify-between font-bold"><span>Total Liabilities</span><span>${financials.totalLiabilities.toFixed(2)}</span></div>

                                <div className="flex justify-between pt-2 font-semibold"><span>Equity</span></div>
                                {accounts.filter(a => a.type === 'EQUITY').map(a => <div key={a.id} className="flex justify-between pl-4"><span className="text-gray-400">{a.name}</span><span>${(-a.balance).toFixed(2)}</span></div>)}
                                <div className="flex justify-between font-bold"><span>Total Equity</span><span>${financials.totalEquity.toFixed(2)}</span></div>
                                
                                <div className="flex justify-between pt-2 font-bold text-xl border-t border-gray-700"><span>Total Liabilities + Equity</span><span>${(financials.totalLiabilities + financials.totalEquity).toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-white mb-6">Accounting</h2>
                <div className="border-b border-gray-700 mb-4">
                    <nav className="flex space-x-2">
                        <TabButton tab="dashboard" label="Dashboard" />
                        <TabButton tab="journal" label="Journal Entries" />
                        <TabButton tab="accounts" label="Chart of Accounts" />
                        <TabButton tab="reports" label="Reports" />
                    </nav>
                </div>
                {renderContent()}
            </div>
            
            {/* Modals */}
            {isAccountModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add New Account</h3>
                        <div className="space-y-4">
                            <div><label className="text-sm">Account Name</label><input type="text" onChange={e => setAccountForm({...accountForm, name: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Account Type</label><select onChange={e => setAccountForm({...accountForm, type: e.target.value as Account['type']})} className="w-full bg-gray-700 p-2 rounded-md mt-1"><option>ASSET</option><option>LIABILITY</option><option>EQUITY</option><option>REVENUE</option><option>EXPENSE</option></select></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={() => setAccountModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button><button onClick={handleAddAccount} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500">Save</button></div>
                    </div>
                </div>
            )}
             {isJournalModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
                        <h3 className="text-xl font-bold mb-4">New Journal Entry</h3>
                        <div className="space-y-4">
                           <div><label className="text-sm">Description</label><input type="text" onChange={e => setJournalForm({...journalForm, description: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                           {journalForm.transactions.map((tx, index) => (
                               <div key={index} className="flex gap-4 items-end">
                                   <div className="flex-1"><label className="text-sm">Account</label><select value={tx.accountId} onChange={e => handleJournalTransactionChange(index, 'accountId', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md mt-1"><option value="">Select Account</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                                   <div><label className="text-sm">Debit</label><input type="number" onChange={e => handleJournalTransactionChange(index, 'amount', e.target.value)} value={tx.amount > 0 ? tx.amount : ''} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                                   <div><label className="text-sm">Credit</label><input type="number" onChange={e => handleJournalTransactionChange(index, 'amount', `-${e.target.value}`)} value={tx.amount < 0 ? -tx.amount : ''} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                               </div>
                           ))}
                           <button onClick={addJournalTransactionRow} className="text-indigo-400 text-sm font-semibold">+ Add line</button>
                        </div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={() => setJournalModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button><button onClick={handleAddJournalEntry} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500">Save Entry</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accounting;
