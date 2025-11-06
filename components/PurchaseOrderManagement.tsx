
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { PurchaseOrder, PurchaseOrderItem } from '../types';
import Icon from './icons';

const PurchaseOrderManagement: React.FC = () => {
    const { purchaseOrders, suppliers, branches, products, addPurchaseOrder, updatePurchaseOrderStatus } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);

    const initialFormState = {
        supplierId: suppliers[0]?.id || '',
        destinationBranchId: branches[0]?.id || '',
        items: [{ variantId: '', quantity: 1, cost: 0 }] as Omit<PurchaseOrderItem, 'variantName' | 'productName'>[],
        status: 'PENDING' as PurchaseOrder['status']
    };
    const [formState, setFormState] = useState(initialFormState);

    const supplierMap = useMemo(() => new Map(suppliers.map(s => [s.id, s.name])), [suppliers]);
    const branchMap = useMemo(() => new Map(branches.map(b => [b.id, b.name])), [branches]);
    const allVariants = useMemo(() => products.flatMap(p => p.variants.map(v => ({...v, productName: p.name}))), [products]);

    const handleOpenModal = () => {
        setFormState(initialFormState);
        setModalOpen(true);
    };

    const handleItemChange = (index: number, field: keyof Omit<PurchaseOrderItem, 'variantName' | 'productName'>, value: string) => {
        const newItems = [...formState.items];
        const numValue = field === 'quantity' || field === 'cost' ? parseFloat(value) : value;
        (newItems[index] as any)[field] = numValue;

        if (field === 'variantId') {
            const variant = allVariants.find(v => v.id === value);
            if (variant) {
                newItems[index].cost = variant.costPrice;
            }
        }
        setFormState(prev => ({ ...prev, items: newItems }));
    };

    const addItemRow = () => {
        setFormState(prev => ({ ...prev, items: [...prev.items, { variantId: '', quantity: 1, cost: 0 }] }));
    };

    const removeItemRow = (index: number) => {
        if (formState.items.length > 1) {
            setFormState(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
        }
    };
    
    const handleSubmit = () => {
        if(formState.supplierId && formState.destinationBranchId && formState.items.every(i => i.variantId && i.quantity > 0)) {
            const itemsWithNames = formState.items.map(item => {
                const variant = allVariants.find(v => v.id === item.variantId);
                return {
                    ...item,
                    productName: variant?.productName || 'N/A',
                    variantName: variant?.name || 'N/A'
                };
            });
            addPurchaseOrder({ ...formState, items: itemsWithNames });
            setModalOpen(false);
        } else {
            alert('Please fill all required fields and ensure items are valid.');
        }
    };
    
    const totalCost = useMemo(() => formState.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0), [formState.items]);

    const getStatusBadge = (status: PurchaseOrder['status']) => {
        const styles = {
            PENDING: 'bg-yellow-500/20 text-yellow-300',
            ORDERED: 'bg-blue-500/20 text-blue-300',
            RECEIVED: 'bg-green-500/20 text-green-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Purchase Orders</h2>
                <button onClick={handleOpenModal} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    New Purchase Order
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-3">PO Number</th><th className="p-3">Supplier</th><th className="p-3">Destination</th><th className="p-3">Date</th><th className="p-3 text-right">Total</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseOrders.map(po => (
                            <tr key={po.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-3 font-mono">{po.poNumber}</td>
                                <td className="p-3">{supplierMap.get(po.supplierId)}</td>
                                <td className="p-3">{branchMap.get(po.destinationBranchId)}</td>
                                <td className="p-3 text-sm text-gray-400">{po.createdAt.toLocaleDateString()}</td>
                                <td className="p-3 text-right font-mono">${po.total.toFixed(2)}</td>
                                <td className="p-3 text-center">{getStatusBadge(po.status)}</td>
                                <td className="p-3 text-center">
                                    {po.status === 'ORDERED' && <button onClick={() => updatePurchaseOrderStatus(po.id, 'RECEIVED')} className="text-green-400 text-sm font-semibold">Receive Stock</button>}
                                    {po.status === 'PENDING' && <button onClick={() => updatePurchaseOrderStatus(po.id, 'ORDERED')} className="text-blue-400 text-sm font-semibold">Mark as Ordered</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4 text-white">New Purchase Order</h3>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm">Supplier</label><select name="supplierId" value={formState.supplierId} onChange={e => setFormState({...formState, supplierId: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1">{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                                <div><label className="text-sm">Destination Branch</label><select name="destinationBranchId" value={formState.destinationBranchId} onChange={e => setFormState({...formState, destinationBranchId: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1">{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                            </div>
                            <h4 className="font-semibold mt-4 pt-4 border-t border-gray-700">Items</h4>
                             <div className="space-y-2">
                                {formState.items.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center bg-gray-900/50 p-2 rounded-md">
                                        <select value={item.variantId} onChange={e => handleItemChange(index, 'variantId', e.target.value)} className="w-1/2 bg-gray-700 p-2 rounded-md text-sm"><option value="">Select product</option>{allVariants.map(v => <option key={v.id} value={v.id}>{v.productName} - {v.name}</option>)}</select>
                                        <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-1/4 bg-gray-700 p-2 rounded-md text-sm" />
                                        <input type="number" placeholder="Cost" value={item.cost} onChange={e => handleItemChange(index, 'cost', e.target.value)} className="w-1/4 bg-gray-700 p-2 rounded-md text-sm" />
                                        <button onClick={() => removeItemRow(index)} className="text-red-500 hover:text-red-400 p-1"><Icon name="trash" className="w-5 h-5"/></button>
                                    </div>
                                ))}
                             </div>
                             <button onClick={addItemRow} className="text-indigo-400 text-sm font-semibold">+ Add Item</button>
                        </div>
                        <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-700">
                             <div className="text-xl font-bold">Total: ${totalCost.toFixed(2)}</div>
                             <div className="flex gap-3"><button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button><button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500">Create PO</button></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrderManagement;
