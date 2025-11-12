import React, { useState, useMemo } from 'react';
import { Sale, Deposit, Customer, ProductVariant, CartItem } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import { useCurrency } from '../../hooks/useCurrency';
import Icon from '../icons';

type ProductInfo = ProductVariant & { productName: string; stock: number; };
type SoldItemInfo = CartItem & { saleDate: Date };

interface DashboardDetailModalProps {
    title: string;
    data: Sale[] | Deposit[] | Customer[] | ProductInfo[] | SoldItemInfo[];
    type: 'sale' | 'deposit' | 'customer' | 'product' | 'sold_item';
    onClose: () => void;
    onReprint: (sale: Sale) => void;
}

const DashboardDetailModal: React.FC<DashboardDetailModalProps> = ({ title, data, type, onClose, onReprint }) => {
    const { customers } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [dateFilter, setDateFilter] = useState('');

    const filteredData = useMemo(() => {
        if (!dateFilter) return data;
        return data.filter(item => {
            if ('date' in item) { // For Sales and Deposits
                return new Date(item.date).toISOString().split('T')[0] === dateFilter;
            }
            if ('saleDate' in item) { // For Sold Items
                return new Date(item.saleDate).toISOString().split('T')[0] === dateFilter;
            }
            return true; // Customers and Products don't have dates
        });
    }, [data, dateFilter]);
    
    const renderContent = () => {
        switch (type) {
            case 'sale':
                return (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-600"><tr><th className="p-2">Date</th><th className="p-2">Customer</th><th className="p-2 text-right">Total</th><th className="p-2 text-right">Due</th><th className="p-2 text-center">Actions</th></tr></thead>
                        <tbody>
                            {(filteredData as Sale[]).map(sale => (
                                <tr key={sale.id} className="border-b border-slate-700/50">
                                    <td className="p-2">{new Date(sale.date).toLocaleString()}</td>
                                    <td className="p-2">{customers.find(c => c.id === sale.customerId)?.name}</td>
                                    <td className="p-2 text-right font-mono">{formatCurrency(sale.total)}</td>
                                    <td className="p-2 text-right font-mono text-red-400">{formatCurrency(sale.amountDue)}</td>
                                    <td className="p-2 text-center"><button onClick={() => onReprint(sale)} className="text-cyan-400 text-xs font-semibold">Reprint</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'deposit':
                 return (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-600"><tr><th className="p-2">Date</th><th className="p-2">Customer</th><th className="p-2 text-right">Amount</th><th className="p-2">Status</th></tr></thead>
                        <tbody>
                            {(filteredData as Deposit[]).map(dep => (
                                <tr key={dep.id} className="border-b border-slate-700/50">
                                    <td className="p-2">{new Date(dep.date).toLocaleString()}</td>
                                    <td className="p-2">{customers.find(c => c.id === dep.customerId)?.name}</td>
                                    <td className="p-2 text-right font-mono">{formatCurrency(dep.amount)}</td>
                                    <td className="p-2">{dep.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'customer':
                 return (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-600"><tr><th className="p-2">Name</th><th className="p-2">Phone</th><th className="p-2">Email</th><th className="p-2 text-right">Credit Balance</th></tr></thead>
                        <tbody>
                            {(filteredData as Customer[]).map(cust => (
                                <tr key={cust.id} className="border-b border-slate-700/50">
                                    <td className="p-2">{cust.name}</td>
                                    <td className="p-2">{cust.phone || 'N/A'}</td>
                                    <td className="p-2">{cust.email || 'N/A'}</td>
                                    <td className="p-2 text-right font-mono text-red-400">{formatCurrency(cust.creditBalance)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'product':
                return (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-600"><tr><th className="p-2">Product</th><th className="p-2">Variant</th><th className="p-2 text-right">Stock</th><th className="p-2 text-right">Price</th></tr></thead>
                        <tbody>
                            {(filteredData as ProductInfo[]).map(item => (
                                <tr key={item.id} className="border-b border-slate-700/50">
                                    <td className="p-2">{item.productName}</td>
                                    <td className="p-2">{item.name}</td>
                                    <td className="p-2 text-right font-bold">{item.stock}</td>
                                    <td className="p-2 text-right font-mono">{formatCurrency(item.sellingPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'sold_item':
                return (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-600"><tr><th className="p-2">Date</th><th className="p-2">Product</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Total</th></tr></thead>
                        <tbody>
                            {(filteredData as SoldItemInfo[]).map((item, index) => (
                                <tr key={`${item.variantId}-${index}`} className="border-b border-slate-700/50">
                                    <td className="p-2">{new Date(item.saleDate).toLocaleString()}</td>
                                    <td className="p-2">{item.name} ({item.variantName})</td>
                                    <td className="p-2 text-right font-bold">{item.quantity}</td>
                                    <td className="p-2 text-right font-mono">{formatCurrency(item.quantity * item.sellingPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    {(type === 'sale' || type === 'deposit' || type === 'sold_item') && (
                        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="bg-slate-700 border border-slate-600 rounded-md p-1 text-sm"/>
                    )}
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><Icon name="x-mark" className="w-6 h-6"/></button>
                </div>
                <div className="flex-grow overflow-y-auto p-4">
                    {filteredData.length > 0 ? renderContent() : <p className="text-center text-slate-500 py-16">No data available for this period.</p>}
                </div>
                <div className="p-4 bg-slate-900/50 rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 font-semibold">Close</button>
                </div>
            </div>
        </div>
    );
};

export default DashboardDetailModal;