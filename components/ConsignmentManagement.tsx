
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Consignment } from '../types';
import Icon from './icons/index.tsx';
import { useCurrency } from '../hooks/useCurrency';

const ConsignmentManagement: React.FC = () => {
    const { consignments, suppliers, branches, products, addConsignment } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [isModalOpen, setModalOpen] = useState(false);
    
    const initialFormState = {
        supplierId: suppliers[0]?.id || '',
        branchId: branches[0]?.id || '',
        receivedDate: new Date(),
        items: [{ variantId: '', quantityReceived: 1, costPrice: 0 }] as Omit<Consignment['items'][0], 'variantName' | 'productName' | 'quantitySold'>[]
    };
    const [formState, setFormState] = useState(initialFormState);

    const supplierMap = useMemo(() => new Map(suppliers.map(s => [s.id, s.name])), [suppliers]);
    const branchMap = useMemo(() => new Map(branches.map(b => [b.id, b.name])), [branches]);
    const allVariants = useMemo(() => products.flatMap(p => p.variants.map(v => ({...v, productName: p.name}))), [products]);

    const handleOpenModal = () => {
        setFormState(initialFormState);
        setModalOpen(true);
    };

    const handleItemChange = (index: number, field: keyof typeof formState.items[0], value: string) => {
        const newItems = [...formState.items];
        const numValue = field === 'quantityReceived' || field === 'costPrice' ? parseFloat(value) : value;
        (newItems[index] as any)[field] = numValue;
        setFormState(prev => ({ ...prev, items: newItems }));
    };

    const addItemRow = () => {
        setFormState(prev => ({ ...prev, items: [...prev.items, { variantId: '', quantityReceived: 1, costPrice: 0 }] }));
    };

    const removeItemRow = (index: number) => {
        if (formState.items.length > 1) {
            setFormState(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
        }
    };

    const handleSubmit = () => {
        if(formState.supplierId && formState.branchId && formState.items.every(i => i.variantId && i.quantityReceived > 0)) {
            const itemsWithNames = formState.items.map(item => {
                const variant = allVariants.find(v => v.id === item.variantId);
                return {
                    ...item,
                    productName: variant?.productName || 'N/A',
                    variantName: variant?.name || 'N/A',
                    quantitySold: 0
                };
            });
            addConsignment({ ...formState, items: itemsWithNames });
            setModalOpen(false);
        } else {
            alert('Please fill all required fields and ensure items are valid.');
        }
    };
    
    return (
        <div className="p-6 bg-slate-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Consignment Management</h2>
                <button onClick={handleOpenModal} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <Icon name="plus" className="w-5 h-5 mr-2" /> New Consignment Intake
                </button>
            </div>
            <div className="space-y-4">
                {consignments.map(con => (
                    <div key={con.id} className="bg-slate-900/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <p className="font-bold text-lg">{supplierMap.get(con.supplierId)} to {branchMap.get(con.branchId)}</p>
                                <p className="text-sm text-slate-400">Received on: {con.receivedDate.toLocaleDateString()}</p>
                            </div>
                             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${con.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'}`}>{con.status}</span>
                        </div>
                        <table className="w-full text-sm text-left mt-2">
                             <thead className="border-b border-slate-700"><tr><th className="p-2">Product</th><th className="p-2 text-right">Received</th><th className="p-2 text-right">Sold</th><th className="p-2 text-right">Remaining</th><th className="p-2 text-right">Cost</th><th className="p-2 text-right">Value Sold</th></tr></thead>
                             <tbody>
                                {con.items.map(item => (
                                    <tr key={item.variantId} className="border-b border-slate-700/50">
                                        <td className="p-2">{item.productName} ({item.variantName})</td>
                                        <td className="p-2 text-right">{item.quantityReceived}</td>
                                        <td className="p-2 text-right text-yellow-400">{item.quantitySold}</td>
                                        <td className="p-2 text-right font-bold text-green-400">{item.quantityReceived - item.quantitySold}</td>
                                        <td className="p-2 text-right font-mono">{formatCurrency(item.costPrice)}</td>
                                        <td className="p-2 text-right font-mono">{formatCurrency(item.costPrice * item.quantitySold)}</td>
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                    </div>
                ))}
            </div>
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-slate-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4">New Consignment Intake</h3>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm">Supplier</label><select onChange={e => setFormState({...formState, supplierId: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md mt-1">{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                                <div><label className="text-sm">Destination Branch</label><select onChange={e => setFormState({...formState, branchId: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md mt-1">{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                            </div>
                            <h4 className="font-semibold mt-4 pt-4 border-t border-slate-700">Items</h4>
                             <div className="space-y-2">
                                {formState.items.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center bg-slate-900/50 p-2 rounded-md">
                                        <select value={item.variantId} onChange={e => handleItemChange(index, 'variantId', e.target.value)} className="w-1/2 bg-slate-700 p-2 rounded-md text-sm"><option value="">Select product</option>{allVariants.map(v => <option key={v.id} value={v.id}>{v.productName} - {v.name}</option>)}</select>
                                        <input type="number" placeholder="Qty Received" value={item.quantityReceived} onChange={e => handleItemChange(index, 'quantityReceived', e.target.value)} className="w-1/4 bg-slate-700 p-2 rounded-md text-sm" />
                                        <input type="number" placeholder="Cost Price" value={item.costPrice} onChange={e => handleItemChange(index, 'costPrice', e.target.value)} className="w-1/4 bg-slate-700 p-2 rounded-md text-sm" />
                                        <button onClick={() => removeItemRow(index)} className="text-red-500 hover:text-red-400 p-1"><Icon name="trash" className="w-5 h-5"/></button>
                                    </div>
                                ))}
                             </div>
                             <button onClick={addItemRow} className="text-cyan-400 text-sm font-semibold">+ Add Item</button>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500">Cancel</button>
                            <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500">Add Intake</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsignmentManagement;
