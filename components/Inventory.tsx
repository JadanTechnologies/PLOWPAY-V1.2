

import React, {useState, useMemo} from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Product, ProductVariant, StockLog, Category } from '../types';
import Icon from './icons';
import { useCurrency } from '../hooks/useCurrency';

type NewVariant = Omit<ProductVariant, 'id'>;

const Inventory: React.FC = () => {
    const { products, branches, categories, adjustStock, transferStock, addProduct, stockLogs, searchTerm, addCategory, updateCategory, deleteCategory } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState<'inventory' | 'history' | 'categories'>('inventory');
    const [categoryFilter, setCategoryFilter] = useState('all');
    
    // Adjust Modal State
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [newStockValue, setNewStockValue] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('Correction');
    const [adjustmentBranchId, setAdjustmentBranchId] = useState<string>(branches[0]?.id || '');
    
    // Transfer Modal State
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isTransferConfirmOpen, setIsTransferConfirmOpen] = useState(false);
    const [transferFromBranchId, setTransferFromBranchId] = useState<string>('');
    const [transferToBranchId, setTransferToBranchId] = useState<string>('');
    const [transferQuantity, setTransferQuantity] = useState('');

    // Add Product Modal State
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductCategoryId, setNewProductCategoryId] = useState(categories[0]?.id || '');
    const [newProductVariants, setNewProductVariants] = useState<NewVariant[]>([
        { name: '', sku: '', sellingPrice: 0, costPrice: 0, stockByBranch: branches.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {}), batchNumber: '', expiryDate: '' }
    ]);

    // Category Modal State
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryFormName, setCategoryFormName] = useState('');

    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

    const filteredProducts = products.filter(p => {
        const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (categoryMap.get(p.categoryId) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

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
                adjustStock(selectedProduct.id, selectedVariant.id, adjustmentBranchId, newStock, adjustmentReason);
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

    const initiateStockTransfer = () => {
        if(selectedProduct && selectedVariant && transferFromBranchId && transferToBranchId && transferQuantity) {
            const quantity = parseInt(transferQuantity, 10);
            const availableStock = selectedVariant.stockByBranch[transferFromBranchId] || 0;
            if(quantity > 0 && quantity <= availableStock) {
                setIsTransferConfirmOpen(true);
            } else {
                alert(`Invalid quantity. Please ensure it's a positive number and not more than the available stock of ${availableStock}.`);
            }
        } else {
            alert("Please fill out all fields for the transfer.");
        }
    };

    const confirmAndExecuteTransfer = () => {
        if(selectedProduct && selectedVariant && transferFromBranchId && transferToBranchId && transferQuantity) {
            const quantity = parseInt(transferQuantity, 10);
            transferStock(selectedProduct.id, selectedVariant.id, transferFromBranchId, transferToBranchId, quantity);
            setIsTransferConfirmOpen(false);
            closeTransferModal();
        }
    };

    const resetAddProductForm = () => {
        setNewProductName('');
        setNewProductCategoryId(categories[0]?.id || '');
        setNewProductVariants([{ name: '', sku: '', sellingPrice: 0, costPrice: 0, stockByBranch: branches.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {}), batchNumber: '', expiryDate: '' }]);
    };

    const closeAddProductModal = () => {
        setIsAddProductModalOpen(false);
        resetAddProductForm();
    };

    const handleAddProduct = () => {
        if (!newProductName || !newProductCategoryId || newProductVariants.some(v => !v.name || !v.sku)) {
            alert('Please fill out all required product and variant fields.');
            return;
        }
        addProduct({
            name: newProductName,
            categoryId: newProductCategoryId,
            variants: newProductVariants
        });
        closeAddProductModal();
    };

    const handleVariantChange = (index: number, field: keyof Omit<NewVariant, 'stockByBranch'>, value: string | number) => {
        const updatedVariants = [...newProductVariants];
        (updatedVariants[index] as any)[field] = value;
        setNewProductVariants(updatedVariants);
    };

    const handleVariantStockChange = (variantIndex: number, branchId: string, value: string) => {
        const updatedVariants = [...newProductVariants];
        updatedVariants[variantIndex].stockByBranch[branchId] = Number(value);
        setNewProductVariants(updatedVariants);
    }

    const addVariantRow = () => {
        setNewProductVariants([...newProductVariants, { name: '', sku: '', sellingPrice: 0, costPrice: 0, stockByBranch: branches.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {}), batchNumber: '', expiryDate: '' }]);
    };

    const removeVariantRow = (index: number) => {
        if (newProductVariants.length > 1) {
            const updatedVariants = newProductVariants.filter((_, i) => i !== index);
            setNewProductVariants(updatedVariants);
        }
    };

    const openCategoryModal = (category: Category | null) => {
        if (category) {
            setEditingCategory(category);
            setCategoryFormName(category.name);
        } else {
            setEditingCategory(null);
            setCategoryFormName('');
        }
        setCategoryModalOpen(true);
    };

    const closeCategoryModal = () => {
        setCategoryModalOpen(false);
    };

    const handleSaveCategory = () => {
        if (categoryFormName.trim() === '') {
            alert('Category name cannot be empty.');
            return;
        }
        if (editingCategory) {
            updateCategory(editingCategory.id, categoryFormName);
        } else {
            addCategory(categoryFormName);
        }
        closeCategoryModal();
    };

    const handleDeleteCategory = (categoryId: string) => {
        if (window.confirm("Are you sure you want to delete this category? This cannot be undone.")) {
            deleteCategory(categoryId);
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
    
    const branchMap = useMemo(() => new Map(branches.map(b => [b.id, b.name])), [branches]);

    return (
        <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">Inventory Management</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setIsAddProductModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                            <Icon name="plus" className="w-5 h-5 mr-2" />
                            Add Product
                        </button>
                    </div>
                </div>

                <div className="border-b border-gray-700 mb-4">
                    <nav className="flex space-x-4">
                        <button onClick={() => setActiveTab('inventory')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'inventory' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                            Current Inventory
                        </button>
                        <button onClick={() => setActiveTab('categories')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'categories' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                            Categories
                        </button>
                        <button onClick={() => setActiveTab('history')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                            History
                        </button>
                    </nav>
                </div>
                
                {activeTab === 'inventory' && (
                    <div>
                        <div className="mb-4">
                            <select 
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-xs"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-700">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold tracking-wide">Product Name</th>
                                        <th className="p-3 text-sm font-semibold tracking-wide">Category</th>
                                        <th className="p-3 text-sm font-semibold tracking-wide">Variant</th>
                                        <th className="p-3 text-sm font-semibold tracking-wide">SKU</th>
                                        <th className="p-3 text-sm font-semibold tracking-wide">Batch #</th>
                                        <th className="p-3 text-sm font-semibold tracking-wide">Expiry Date</th>
                                        <th className="p-3 text-sm font-semibold tracking-wide text-right">Selling Price</th>
                                        {branches.map(branch => (
                                            <th key={branch.id} className="p-3 text-sm font-semibold tracking-wide text-right">{branch.name}</th>
                                        ))}
                                        <th className="p-3 text-sm font-semibold tracking-wide text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.flatMap((product) => 
                                        product.variants.map((variant, vIndex) => (
                                            <tr key={`${product.id}-${variant.id}`} className="border-b border-gray-700 hover:bg-gray-700/50">
                                                {vIndex === 0 && (
                                                    <td rowSpan={product.variants.length} className="p-3 align-top whitespace-nowrap font-medium border-r border-gray-700">{product.name}</td>
                                                )}
                                                {vIndex === 0 && (
                                                    <td rowSpan={product.variants.length} className="p-3 align-top whitespace-nowrap border-r border-gray-700">{categoryMap.get(product.categoryId)}</td>
                                                )}
                                                <td className="p-3 whitespace-nowrap">{variant.name}</td>
                                                <td className="p-3 whitespace-nowrap text-gray-400">{variant.sku}</td>
                                                <td className="p-3 whitespace-nowrap text-gray-400">{variant.batchNumber || 'N/A'}</td>
                                                <td className="p-3 whitespace-nowrap text-gray-400">{variant.expiryDate || 'N/A'}</td>
                                                <td className="p-3 whitespace-nowrap text-right font-mono text-indigo-400">{formatCurrency(variant.sellingPrice)}</td>
                                                {branches.map(branch => {
                                                    const stock = variant.stockByBranch[branch.id] || 0;
                                                    return (
                                                        <td key={branch.id} className={`p-3 whitespace-nowrap text-right font-bold ${stock < 10 ? 'text-red-500' : 'text-green-500'}`}>
                                                            {stock}
                                                        </td>
                                                    );
                                                })}
                                                <td className="p-3 text-center whitespace-nowrap space-x-2">
                                                    <button onClick={() => openAdjustModal(product, variant)} className="text-yellow-400 hover:text-yellow-300 font-semibold px-2 py-1 rounded-md text-sm">Adjust</button>
                                                    <button onClick={() => openTransferModal(product, variant)} className="text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded-md text-sm">Transfer</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {filteredProducts.length === 0 && (
                                <p className="text-center text-gray-400 py-8">No products found for the selected criteria.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-white">Manage Categories</h3>
                            <button onClick={() => openCategoryModal(null)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                                <Icon name="plus" className="w-5 h-5 mr-2" />Add Category
                            </button>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-4 max-w-2xl mx-auto">
                            <ul className="space-y-2">
                                {categories.map(cat => (
                                    <li key={cat.id} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-md">
                                        <span className="font-medium text-white">{cat.name}</span>
                                        <div className="space-x-3">
                                            <button onClick={() => openCategoryModal(cat)} className="text-yellow-400 hover:text-yellow-300 font-semibold text-sm">Edit</button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-400 font-semibold text-sm">Delete</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-700">
                                <tr>
                                    <th className="p-3 text-sm font-semibold tracking-wide">Date</th>
                                    <th className="p-3 text-sm font-semibold tracking-wide">Product</th>
                                    <th className="p-3 text-sm font-semibold tracking-wide">Action</th>
                                    <th className="p-3 text-sm font-semibold tracking-wide">Details</th>
                                    <th className="p-3 text-sm font-semibold tracking-wide text-right">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockLogs.map(log => (
                                    <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-3 whitespace-nowrap text-sm text-gray-400">{log.date.toLocaleString()}</td>
                                        <td className="p-3 whitespace-nowrap">
                                            <div className="font-medium">{log.productName}</div>
                                            <div className="text-sm text-gray-400">{log.variantName}</div>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                log.action === 'ADJUSTMENT' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-indigo-500/20 text-indigo-300'
                                            }`}>
                                                {log.action === 'ADJUSTMENT' ? 'Adjustment' : 'Transfer'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-300">
                                            {log.action === 'ADJUSTMENT' ? (
                                                <>
                                                    <div><strong>Branch:</strong> {branchMap.get(log.branchId!)}</div>
                                                    <div><strong>Reason:</strong> {log.reason}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div><strong>From:</strong> {branchMap.get(log.fromBranchId!)}</div>
                                                    <div><strong>To:</strong> {branchMap.get(log.toBranchId!)}</div>
                                                </>
                                            )}
                                        </td>
                                        <td className="p-3 whitespace-nowrap text-right font-bold font-mono">
                                            {log.action === 'ADJUSTMENT' ? (
                                                <span className={log.quantity > 0 ? 'text-green-500' : 'text-red-500'}>
                                                    {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">{log.quantity}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {stockLogs.length === 0 && (
                            <p className="text-center text-gray-400 py-8">No stock history found.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            {isAddProductModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4 text-white">Add New Product</h3>
                        <div className="overflow-y-auto pr-2 flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="prodName" className="block text-sm font-medium text-gray-400">Product Name</label>
                                    <input type="text" id="prodName" value={newProductName} onChange={e => setNewProductName(e.target.value)} className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label htmlFor="prodCat" className="block text-sm font-medium text-gray-400">Category</label>
                                    <select id="prodCat" value={newProductCategoryId} onChange={e => setNewProductCategoryId(e.target.value)} className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <h4 className="text-lg font-semibold mb-2 text-white">Variants</h4>
                            <div className="space-y-4">
                                {newProductVariants.map((variant, index) => (
                                    <div key={index} className="bg-gray-900 p-4 rounded-md border border-gray-700">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400">Variant Name</label>
                                                <input type="text" value={variant.name} onChange={e => handleVariantChange(index, 'name', e.target.value)} className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400">SKU</label>
                                                <input type="text" value={variant.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)} className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400">Cost Price</label>
                                                <input type="number" value={variant.costPrice} onChange={e => handleVariantChange(index, 'costPrice', parseFloat(e.target.value))} className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400">Selling Price</label>
                                                <input type="number" value={variant.sellingPrice} onChange={e => handleVariantChange(index, 'sellingPrice', parseFloat(e.target.value))} className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400">Batch Number (Optional)</label>
                                                <input type="text" value={variant.batchNumber} onChange={e => handleVariantChange(index, 'batchNumber', e.target.value)} className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400">Expiry Date (Optional)</label>
                                                <input type="date" value={variant.expiryDate} onChange={e => handleVariantChange(index, 'expiryDate', e.target.value)} className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-gray-400 mb-2">Initial Stock</p>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                            {branches.map(branch => (
                                                <div key={branch.id}>
                                                    <label className="block text-xs text-gray-500">{branch.name}</label>
                                                    <input type="number" value={variant.stockByBranch[branch.id] || 0} onChange={e => handleVariantStockChange(index, branch.id, e.target.value)} className="w-full mt-1 py-1 px-2 text-white text-sm bg-gray-700 border border-gray-600 rounded-md"/>
                                                </div>
                                            ))}
                                        </div>

                                        {newProductVariants.length > 1 && (
                                            <div className="text-right mt-2">
                                                <button onClick={() => removeVariantRow(index)} className="text-red-500 hover:text-red-400 text-sm font-semibold">Remove Variant</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button onClick={addVariantRow} className="mt-4 text-indigo-400 hover:text-indigo-300 font-semibold text-sm">+ Add Another Variant</button>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-700">
                            <button type="button" onClick={closeAddProductModal} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 font-semibold">Cancel</button>
                            <button type="button" onClick={handleAddProduct} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 font-semibold">Save Product</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Category Add/Edit Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-white">{editingCategory ? 'Edit' : 'Add'} Category</h3>
                        <div>
                            <label htmlFor="catName" className="block text-sm font-medium text-gray-400">Category Name</label>
                            <input type="text" id="catName" value={categoryFormName} onChange={e => setCategoryFormName(e.target.value)} className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={closeCategoryModal} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 font-semibold">Cancel</button>
                            <button onClick={handleSaveCategory} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 font-semibold">Save</button>
                        </div>
                    </div>
                </div>
            )}


            {/* Stock Adjustment Modal */}
            {isAdjustModalOpen && selectedProduct && selectedVariant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-2 text-white">Adjust Stock</h3>
                        <div className="text-gray-400 mb-4">
                           <p> {selectedProduct.name} - {selectedVariant.name}</p>
                           {selectedVariant.batchNumber && <p className="text-sm">Batch: {selectedVariant.batchNumber}</p>}
                           {selectedVariant.expiryDate && <p className="text-sm">Expires: {selectedVariant.expiryDate}</p>}
                        </div>
                        
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
                        <div className="text-gray-400 mb-4">
                           <p>{selectedProduct.name} - {selectedVariant.name}</p>
                           {selectedVariant.batchNumber && <p className="text-sm">Batch: {selectedVariant.batchNumber}</p>}
                        </div>
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
                            <button type="button" onClick={initiateStockTransfer} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 font-semibold">Transfer Stock</button>
                        </div>
                    </div>
                </div>
            )}

             {/* Transfer Confirmation Modal */}
            {isTransferConfirmOpen && selectedProduct && selectedVariant && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md text-center">
                        <Icon name="truck" className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-white">Confirm Transfer</h3>
                        <p className="text-gray-400 mb-4">Please review the details below before confirming.</p>
                        <div className="bg-gray-900/50 p-4 rounded-md text-left space-y-2">
                            <div><span className="font-semibold text-gray-300">Product:</span> {selectedProduct.name} - {selectedVariant.name}</div>
                            <div><span className="font-semibold text-gray-300">Quantity:</span> {transferQuantity}</div>
                            <div><span className="font-semibold text-gray-300">From:</span> {branchMap.get(transferFromBranchId)}</div>
                            <div><span className="font-semibold text-gray-300">To:</span> {branchMap.get(transferToBranchId)}</div>
                        </div>
                        <div className="mt-6 flex justify-center space-x-4">
                            <button onClick={() => setIsTransferConfirmOpen(false)} className="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 font-semibold">Cancel</button>
                            <button onClick={confirmAndExecuteTransfer} className="px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 font-semibold">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;