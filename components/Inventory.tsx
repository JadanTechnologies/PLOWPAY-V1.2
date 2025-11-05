import React, {useState, useMemo} from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Product, ProductVariant } from '../types';
import Icon from './icons';

const Inventory: React.FC = () => {
    const { products, branches, adjustStock, transferStock } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Adjust Modal State
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [newStockValue, setNewStockValue] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('Correction');
    const [adjustmentBranchId, setAdjustmentBranchId] = useState<string>(branches[0]?.id || '');
    
    // Transfer Modal State
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferFromBranchId, setTransferFromBranchId] = useState<string>('');
    const [transferToBranchId, setTransferToBranchId] = useState<string>('');
    const [transferQuantity, setTransferQuantity] = useState('');


    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const openAdjustModal = (product: Product, variant: ProductVariant) => {
        setSelectedProduct(product);
        setSelectedVariant(variant);
        setAdjustmentBranchId(branches[0]?.id || '');
        setNewStockValue(variant.stockByBranch[branches[0]?.id || '']?.toString() || '0');
        setIsAdjustModalOpen(true);
    };

    const closeAdjustModal = () => {
        setIsAdjustModalOpen(false);
        setSelectedProduct(null);
        setSelectedVariant(null);
        setNewStockValue('');
        setAdjustmentReason('Correction');
    };

    const handleStockAdjustment = () => {
        if (selectedProduct && selectedVariant && newStockValue !== '' && adjustmentBranchId) {
            const newStock = parseInt(newStockValue, 10);
            if (!isNaN(newStock) && newStock >= 0) {
                adjustStock(selectedProduct.id, selectedVariant.id, adjustmentBranchId, newStock);
                closeAdjustModal();
            } else {
                alert("Please enter a valid, non-negative number for the stock.");
            }
        }
    };
    
    const openTransferModal = (product: Product, variant: ProductVariant) => {
        setSelectedProduct(product);
        setSelectedVariant(variant);
        setTransferFromBranchId('');
        setTransferToBranchId('');
        setTransferQuantity('');
        setIsTransferModalOpen(true);
    };
    
    const closeTransferModal = () => {
        setIsTransferModalOpen(false);
        setSelectedProduct(null);
        setSelectedVariant(null);
    };

    const handleStockTransfer = () => {
        if(selectedProduct && selectedVariant && transferFromBranchId && transferToBranchId && transferQuantity) {
            const quantity = parseInt(transferQuantity, 10);
            if(quantity > 0 && quantity <= (selectedVariant.stockByBranch[transferFromBranchId] || 0)) {
                // FIX: Corrected a typo in the variable name from `toBranchId` to `transferToBranchId`.
                transferStock(selectedProduct.id, selectedVariant.id, transferFromBranchId, transferToBranchId, quantity);
                closeTransferModal();
            } else {
                alert("Invalid quantity. Please ensure it's a positive number and not more than the available stock.");
            }
        }
    };

    const availableFromBranches = useMemo(() => {
        if (!selectedVariant) return [];
        return branches.filter(b => (selectedVariant.stockByBranch[b.id] || 0) > 0);
    }, [selectedVariant, branches]);

    const availableToBranches = useMemo(() => {
        return branches.filter(b => b.id !== transferFromBranchId);
    }, [branches, transferFromBranchId]);
    
    const maxTransferQty = useMemo(() => {
        if (!selectedVariant || !transferFromBranchId) return 0;
        return selectedVariant.stockByBranch[transferFromBranchId] || 0;
    }, [selectedVariant, transferFromBranchId]);

    return (
        <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">Inventory Management</h2>
                    <div className="flex gap-2">
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Icon name="search" className="w-5 h-5 text-gray-500" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 py-2 pl-10 pr-4 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                            <Icon name="plus" className="w-5 h-5 mr-2" />
                            Add Product
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-3 text-sm font-semibold tracking-wide">Product Name</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Category</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Variant</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">SKU</th>
                                <th className="p-3 text-sm font-semibold tracking-wide text-right">Price</th>
                                <th className="p-3 text-sm font-semibold tracking-wide text-right">Total Stock</th>
                                <th className="p-3 text-sm font-semibold tracking-wide text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.flatMap((product) => 
                                product.variants.map((variant, vIndex) => {
                                    const totalStock = Object.values(variant.stockByBranch).reduce((sum, count) => sum + count, 0);
                                    return (
                                        <tr key={`${product.id}-${variant.id}`} className="border-b border-gray-700 hover:bg-gray-700/50">
                                            {vIndex === 0 && (
                                                <td rowSpan={product.variants.length} className="p-3 align-top whitespace-nowrap font-medium border-r border-gray-700">{product.name}</td>
                                            )}
                                            {vIndex === 0 && (
                                                <td rowSpan={product.variants.length} className="p-3 align-top whitespace-nowrap border-r border-gray-700">{product.category}</td>
                                            )}
                                            <td className="p-3 whitespace-nowrap">{variant.name}</td>
                                            <td className="p-3 whitespace-nowrap text-gray-400">{variant.sku}</td>
                                            <td className="p-3 whitespace-nowrap text-right font-mono text-indigo-400">${variant.price.toFixed(2)}</td>
                                            <td className={`p-3 whitespace-nowrap text-right font-bold ${totalStock < 10 ? 'text-red-500' : 'text-green-500'}`}>{totalStock}</td>
                                            <td className="p-3 text-center whitespace-nowrap space-x-2">
                                                <button onClick={() => openAdjustModal(product, variant)} className="text-yellow-400 hover:text-yellow-300 font-semibold px-2 py-1 rounded-md text-sm">Adjust</button>
                                                <button onClick={() => openTransferModal(product, variant)} className="text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded-md text-sm">Transfer</button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredProducts.length === 0 && (
                     <p className="text-center text-gray-400 py-8">No products found.</p>
                )}
            </div>

            {/* Stock Adjustment Modal */}
            {isAdjustModalOpen && selectedProduct && selectedVariant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-2 text-white">Adjust Stock</h3>
                        <p className="text-gray-400 mb-4">
                            {selectedProduct.name} - {selectedVariant.name}
                        </p>
                        
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="adjBranch" className="block text-sm font-medium text-gray-400">Branch</label>
                                <select
                                    id="adjBranch"
                                    value={adjustmentBranchId}
                                    onChange={(e) => {
                                        const newBranchId = e.target.value;
                                        setAdjustmentBranchId(newBranchId);
                                        setNewStockValue(selectedVariant.stockByBranch[newBranchId]?.toString() || '0');
                                    }}
                                    className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Current Stock at {branches.find(b => b.id === adjustmentBranchId)?.name}</label>
                                <p className="text-2xl font-bold text-white bg-gray-900 rounded-md px-3 py-2">{selectedVariant.stockByBranch[adjustmentBranchId] || 0}</p>
                            </div>
                            <div>
                                <label htmlFor="newStock" className="block text-sm font-medium text-gray-400">New Stock Count</label>
                                <input
                                    type="number"
                                    id="newStock"
                                    value={newStockValue}
                                    onChange={(e) => setNewStockValue(e.target.value)}
                                    className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter new stock count"
                                />
                            </div>
                             <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-400">Reason for Adjustment</label>
                                <select
                                    id="reason"
                                    value={adjustmentReason}
                                    onChange={(e) => setAdjustmentReason(e.target.value)}
                                    className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option>Correction</option>
                                    <option>Damaged Goods</option>
                                    <option>Stock Intake</option>
                                    <option>Returned</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button type="button" onClick={closeAdjustModal} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 font-semibold">Cancel</button>
                            <button type="button" onClick={handleStockAdjustment} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 font-semibold">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Stock Transfer Modal */}
            {isTransferModalOpen && selectedProduct && selectedVariant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-2 text-white">Transfer Stock</h3>
                        <p className="text-gray-400 mb-4">
                            {selectedProduct.name} - {selectedVariant.name}
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="fromBranch" className="block text-sm font-medium text-gray-400">From Branch</label>
                                <select id="fromBranch" value={transferFromBranchId} onChange={e => setTransferFromBranchId(e.target.value)} className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select source...</option>
                                    {availableFromBranches.map(b => <option key={b.id} value={b.id}>{b.name} (In Stock: {selectedVariant.stockByBranch[b.id]})</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="toBranch" className="block text-sm font-medium text-gray-400">To Branch</label>
                                <select id="toBranch" value={transferToBranchId} onChange={e => setTransferToBranchId(e.target.value)} className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={!transferFromBranchId}>
                                    <option value="">Select destination...</option>
                                    {availableToBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-400">Quantity to Transfer</label>
                                <input type="number" id="quantity" value={transferQuantity} onChange={e => setTransferQuantity(e.target.value)} min="1" max={maxTransferQty} className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={!transferFromBranchId || !transferToBranchId} placeholder={`Max: ${maxTransferQty}`}/>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button type="button" onClick={closeTransferModal} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 font-semibold">Cancel</button>
                            <button type="button" onClick={handleStockTransfer} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 font-semibold">Confirm Transfer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;