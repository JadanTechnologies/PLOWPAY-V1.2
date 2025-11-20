import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Icon from './icons/index.tsx';
import { useCurrency } from '../../hooks/useCurrency';
import { Account } from '../types';

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    
    let colorClass = 'bg-green-500';
    if (percentage >= 90) {
        colorClass = 'bg-red-500';
    } else if (percentage >= 75) {
        colorClass = 'bg-yellow-500';
    }

    return (
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const AddBudgetModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (accountId: string, amount: number) => void;
    accounts: Account[];
}> = ({ isOpen, onClose, onSave, accounts }) => {
    const [accountId, setAccountId] = useState(accounts[0]?.id || '');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (accounts.length > 0) {
            setAccountId(accounts[0].id);
        }
    }, [accounts]);

    const handleSave = () => {
        if (accountId && amount && Number(amount) > 0) {
            onSave(accountId, Number(amount));
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-slate-700">
                <h3 className="text-xl font-bold mb-4 text-white">Add New Budget Item</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Expense Category</label>
                        <select
                            value={accountId}
                            onChange={e => setAccountId(e.target.value)}
                            className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            {accounts.length > 0 ? (
                                accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)
                            ) : (
                                <option disabled>No unbudgeted categories</option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Budget Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-500 font-semibold">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-500 font-semibold">Save Budget</button>
                </div>
            </div>
        </div>
    );
};

const Budgeting: React.FC = () => {
    const { accounts, journalEntries, budgets, updateBudget, deleteBudget } = useAppContext();
    const { formatCurrency } = useCurrency();
    
    const [currentPeriod, setCurrentPeriod] = useState(new Date().toISOString().slice(0, 7)); // "YYYY-MM"
    const [localBudgets, setLocalBudgets] = useState<Record<string, number>>({});
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    const expenseAccounts = useMemo(() => {
        return accounts.filter(acc => acc.type === 'EXPENSE');
    }, [accounts]);
    
    // Initialize localBudgets from context when component mounts or period changes
    useEffect(() => {
        const initialBudgets: Record<string, number> = {};
        expenseAccounts.forEach(acc => {
            const budget = budgets.find(b => b.accountId === acc.id && b.period === currentPeriod);
            initialBudgets[acc.id] = budget ? budget.amount : 0;
        });
        setLocalBudgets(initialBudgets);
    }, [budgets, expenseAccounts, currentPeriod]);

    const monthlyExpenses = useMemo(() => {
        const expenses: Record<string, number> = {};
        expenseAccounts.forEach(acc => expenses[acc.id] = 0);

        journalEntries
            .filter(entry => new Date(entry.date).toISOString().slice(0, 7) === currentPeriod)
            .forEach(entry => {
                entry.transactions.forEach(tx => {
                    if (expenses.hasOwnProperty(tx.accountId)) {
                        // Expenses are recorded as positive values in journal (debits)
                        expenses[tx.accountId] += tx.amount;
                    }
                });
            });

        return expenses;
    }, [journalEntries, expenseAccounts, currentPeriod]);
    
    const handleBudgetChange = (accountId: string, value: string) => {
        const amount = parseFloat(value) || 0;
        setLocalBudgets(prev => ({ ...prev, [accountId]: amount }));
    };

    const handleSaveBudgets = () => {
        Object.entries(localBudgets).forEach(([accountId, amount]) => {
            const originalBudget = budgets.find(b => b.accountId === accountId && b.period === currentPeriod);
            const originalAmount = originalBudget ? originalBudget.amount : 0;

            const numericAmount = Number(amount);

            if (numericAmount !== originalAmount) {
                if (numericAmount > 0) {
                    updateBudget(accountId, numericAmount, currentPeriod);
                } else {
                    deleteBudget(accountId, currentPeriod);
                }
            }
        });
    };

    const handleAddBudget = (accountId: string, amount: number) => {
        setLocalBudgets(prev => ({...prev, [accountId]: amount }));
        updateBudget(accountId, amount, currentPeriod);
    };

    const unbudgetedAccounts = useMemo(() => {
        return expenseAccounts.filter(acc => !localBudgets[acc.id] || localBudgets[acc.id] === 0);
    }, [expenseAccounts, localBudgets]);
    
    // FIX: Explicitly cast `amount` to a number as Object.values may not be strongly typed.
    const totalBudgeted = useMemo(() => Object.values(localBudgets).reduce((sum, amount) => sum + Number(amount), 0), [localBudgets]);
    // FIX: Explicitly cast `amount` to a number as Object.values may not be strongly typed.
    const totalSpent = useMemo(() => Object.values(monthlyExpenses).reduce((sum, amount) => sum + Number(amount), 0), [monthlyExpenses]);

    return (
        <div className="space-y-6">
            <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Monthly Budgeting</h2>
                        <p className="text-slate-400 mt-1">Set and track budgets for your expense categories.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="month"
                            value={currentPeriod}
                            onChange={(e) => setCurrentPeriod(e.target.value)}
                            className="bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                         <button onClick={() => setAddModalOpen(true)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md flex items-center">
                            <Icon name="plus" className="w-5 h-5 mr-2" />
                            Add Budget
                        </button>
                        <button onClick={handleSaveBudgets} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                            Save All Budgets
                        </button>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm">Total Budgeted</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalBudgeted)}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm">Total Spent</p>
                        <p className="text-2xl font-bold text-red-400">{formatCurrency(totalSpent)}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm">Remaining</p>
                        <p className={`text-2xl font-bold ${totalBudgeted - totalSpent >= 0 ? 'text-green-400' : 'text-orange-400'}`}>
                            {formatCurrency(totalBudgeted - totalSpent)}
                        </p>
                    </div>
                </div>

                {/* Budget Items */}
                <div className="space-y-4">
                    {expenseAccounts.length > 0 ? (
                        expenseAccounts.map(account => {
                            const budgetAmount = localBudgets[account.id] || 0;
                            const spentAmount = monthlyExpenses[account.id] || 0;
                            const remaining = budgetAmount - spentAmount;

                            return (
                                <div key={account.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                    <div className="md:col-span-3">
                                        <p className="font-semibold text-white">{account.name}</p>
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="text-xs text-slate-500 sr-only">Budget for {account.name}</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">$</span>
                                            <input
                                                type="number"
                                                value={budgetAmount === 0 ? '' : budgetAmount}
                                                onChange={(e) => handleBudgetChange(account.id, e.target.value)}
                                                placeholder="Set Budget"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 pl-7 pr-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-6">
                                        <div className="flex justify-between items-center mb-1 text-sm">
                                            <span className="text-slate-400">Spent: <span className="font-bold text-white">{formatCurrency(spentAmount)}</span></span>
                                            <span className={`font-semibold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {formatCurrency(remaining)} {remaining >= 0 ? 'left' : 'over'}
                                            </span>
                                        </div>
                                        <ProgressBar value={spentAmount} max={budgetAmount} />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Icon name="calculator" className="w-12 h-12 mx-auto mb-2"/>
                            <p>No expense accounts found.</p>
                            <p className="text-sm">Please create an account with type 'EXPENSE' in the Accounting section to start budgeting.</p>
                        </div>
                    )}
                </div>
            </div>
             <AddBudgetModal 
                isOpen={isAddModalOpen} 
                onClose={() => setAddModalOpen(false)} 
                onSave={handleAddBudget} 
                accounts={unbudgetedAccounts} 
            />
        </div>
    );
};

export default Budgeting;
