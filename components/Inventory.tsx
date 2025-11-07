






import React, {useState, useMemo} from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Product, ProductVariant, StockLog, Category } from '../types';
import Icon from '/components/icons/index.tsx';
import { useCurrency } from '../hooks/useCurrency';

type NewVariant = Omit<ProductVariant, 'id'>;

const Inventory: React.FC = () => {
    const { products, branches, categories, adjustStock, transferStock, addProduct, updateProductVariant, stockLogs, searchTerm, addCategory, updateCategory, deleteCategory } = useAppContext();
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

    // Edit Variant Modal State
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    
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
        { name: '', sku: '', sellingPrice: 0, costPrice: 0, stockByBranch: branches.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {}), reorderPointByBranch: branches.reduce((acc, b) => ({...acc, [b.id]: 10}), {}), batchNumber: '', expiryDate: '' }
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

    const openEditModal = (product: Product, variant: ProductVariant) => {
        setEditingProduct(product);
        setEditingVariant({ ...variant });
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingProduct(null);
        setEditingVariant(null);
    };
    
    const handleVariantUpdate = () => {
        if (editingProduct && editingVariant) {
            const { id, stockByBranch, ...variantData } = editingVariant;
            updateProductVariant(editingProduct.id, id, variantData);
            closeEditModal();
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
        setNewProductVariants([{ name: '', sku: '', sellingPrice: 0, costPrice: 0, stockByBranch: branches.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {}), reorderPointByBranch: branches.reduce((acc, b) => ({...acc, [b.id]: 10}), {}), batchNumber: '', expiryDate: '' }]);
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
        setNewProductVariants([...newProductVariants, { name: '', sku: '', sellingPrice: 0, costPrice: 0, stockByBranch: branches.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {}), reorderPointByBranch: branches.reduce((acc, b) => ({...acc, [b.id]: 10}), {}), batchNumber: '', expiryDate: '' }]);
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

    const getExpiryDateStyles = (dateString?: string) => {
        if (!dateString) return 'text-slate-400';
        const expiryDate = new Date(dateString);
        const today = new Date();
        today.setHours(0,0,0,0);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        if (expiryDate < today) {
            return 'text-red-500 font-bold'; // Expired
        }
        if (expiryDate <= thirtyDaysFromNow) {
            return 'text-yellow-400'; // Expiring soon
        }
        return 'text-slate-400';
    };

    const getStockLevelStyles = (stock: number, reorderPoint?: number) => {
        if (stock <= 0) return 'text-red-500';
        if (reorderPoint !== undefined && stock <= reorderPoint) return 'text-orange-400';
        return 'text-green-500';
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

    const TabButton: React.FC<{tab: 'inventory' | 'history' | 'categories', label: string}> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === tab ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">Inventory Management</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setIsAddProductModalOpen(true)} className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold py-2 px-4 rounded-md flex items-center shadow-lg shadow-cyan-500/20">
                            <Icon name="plus" className="w-5 h-5 mr-2" />
                            Add Product
                        </button>
                    </div>
                </div>

                <div className="border-b border-slate-700 mb-4">
                    <nav className="flex space-x-2">
                        <TabButton tab="inventory" label="Current Inventory"/>
                        <TabButton tab="categories" label="Categories"/>
                        <TabButton tab="history" label="History"/>
                    </nav>
                </div>
                
                {activeTab === 'inventory' && (
                    <div>
                        <div className="mb-4">
                            <select 
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                                className="bg-slate-700 border border-slate-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 max-w-xs"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-700 text-xs text-slate-400 uppercase">
                                    <tr>
                                        <th className="p-3">Product</th>
                                        <th className="p-3">SKU</th>
                                        <th className="p-3">Expiry Date</th>
                                        <th className="p-3 text-right">Selling Price</th>
                                        {branches.map(branch => (
                                            <th key={branch.id} className="p-3 text-sm font-semibold tracking-wide text-right">{branch.name}</th>
                                        ))}
                                        <th className="p-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <React.Fragment key={product.id}>
                                            <tr className="border-b border-slate-800 bg-slate-900/50">
                                                <td colSpan={4 + branches.length} className="p-3 font-semibold text-white">
                                                    {product.name} <span className="text-sm font-normal text-slate-400 ml-2">({categoryMap.get(product.categoryId)})</span>
                                                </td>
                                            </tr>
                                            {product.variants.map((variant) => (
                                                <tr key={variant.id} className="border-b border-slate-800 hover:bg-slate-700/50 text-sm">
                                                    <td className="p-3 pl-6">{variant.name}</td>
                                                    <td className="p-3 whitespace-nowrap text-slate-400 font-mono">{variant.sku}</td>
                                                    <td className={`p-3 whitespace-nowrap ${getExpiryDateStyles(variant.expiryDate)}`}>{variant.expiryDate || 'N/A'}</td>
                                                    <td className="p-3 whitespace-nowrap text-right font-mono text-cyan-400">{formatCurrency(variant.sellingPrice)}</td>
                                                    {branches.map(branch => {
                                                        const stock = variant.stockByBranch[branch.id] || 0;
                                                        const reorderPoint = variant.reorderPointByBranch?.[branch.id];
                                                        return (
                                                            <td key={branch.id} className="p-3 whitespace-nowrap text-right font-bold">
                                                                <span className={getStockLevelStyles(stock, reorderPoint)}>{stock}</span>
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-3 text-center whitespace-nowrap space-x-2">
                                                        <button onClick={() => openAdjustModal(product, variant)} className="text-yellow-400 hover:text-yellow-300 font-semibold px-2 py-1 rounded-md text-xs">Adjust</button>
                                                        <button onClick={() => openTransferModal(product, variant)} className="text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1 rounded-md text-xs">Transfer</button>
                                                        <button onClick={() => openEditModal(product, variant)} className="text-slate-400 hover:text-slate-300 font-semibold px-2 py-1 rounded-md text-xs">Edit</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                            {filteredProducts.length === 0 && (
                                <p className="text-center text-slate-400 py-8">No products found for the selected criteria.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-white">Manage Categories</h3>
                            <button onClick={() => openCategoryModal(null)} className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                                <Icon name="plus" className="w-5 h-5 mr-2" />Add Category
                            </button>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-4 max-w-2xl mx-auto border border-slate-700">
                            <ul className="space-y-2">
                                {categories.map(cat => (
                                    <li key={cat.id} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-md">
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
                            <thead className="border-b border-slate-700 text-xs text-slate-400 uppercase">
                                <tr>
                                    <th className="p-3">Date</th><th className="p-3">Product</th><th className="p-3">Action</th>
                                    <th className="p-3">Details</th><th className="p-3 text-right">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockLogs.map(log => (
                                    <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-700/50 text-sm">
                                        <td className="p-3 whitespace-nowrap text-slate-400">{log.date.toLocaleString()}</td>
                                        <td className="p-3 whitespace-nowrap">
                                            <div className="font-medium">{log.productName}</div>
                                            <div className="text-xs text-slate-400">{log.variantName}</div>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ log.action === 'ADJUSTMENT' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-cyan-500/20 text-cyan-300' }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-300 text-xs">
                                            {log.action === 'ADJUSTMENT' ? (<><div><strong>Branch:</strong> {branchMap.get(log.branchId!)}</div><div><strong>Reason:</strong> {log.reason}</div></>) 
                                            : (<><div><strong>From:</strong> {branchMap.get(log.fromBranchId!)}</div><div><strong>To:</strong> {branchMap.get(log.toBranchId!)}</div></>)}
                                        </td>
                                        <td className="p-3 whitespace-nowrap text-right font-bold font-mono">
                                            {log.action === 'ADJUSTMENT' ? (<span className={log.quantity > 0 ? 'text-green-500' : 'text-red-500'}>{log.quantity > 0 ? `+${log.quantity}` : log.quantity}</span>) : (<span className="text-slate-300">{log.quantity}</span>)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {stockLogs.length === 0 && <p className="text-center text-slate-400 py-8">No stock history found.</p>}
                    </div>
                )}
            </div>

            {/* Modals */}
             {(isAdjustModalOpen || isEditModalOpen || isTransferModalOpen || isAddProductModalOpen || isCategoryModalOpen || isTransferConfirmOpen) && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    {/* All modals will be rendered here. Their content is controlled by the respective `is...Open` state */}
                    {isAdjustModalOpen && selectedProduct && selectedVariant && (
                        <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-slate-700">
                             <h3 className="text-xl font-bold mb-2 text-white">Adjust Stock</h3>
                             <p className="text-slate-400 mb-4">{selectedProduct.name} - {selectedVariant.name}</p>
                             <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400">Branch</label>
                                    <select value={adjustmentBranchId} onChange={(e) => { const newBranchId = e.target.value; setAdjustmentBranchId(newBranchId); setNewStockValue(selectedVariant.stockByBranch[newBranchId]?.toString() || '0');}} className="w-full py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md">
                                        {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400">Current Stock at {branches.find(b => b.id === adjustmentBranchId)?.name}</label>
                                    <p className="text-2xl font-bold text-white bg-slate-900 rounded-md px-3 py-2">{selectedVariant.stockByBranch[adjustmentBranchId] || 0}</p>
                                </div>
                                <div>
                                    <label htmlFor="newStock" className="block text-sm font-medium text-slate-400">New Stock Count</label>
                                    <input type="number" id="newStock" value={newStockValue} onChange={(e) => setNewStockValue(e.target.value)} className="w-full py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md"/>
                                </div>
                                 <div>
                                    <label htmlFor="reason" className="block text-sm font-medium text-slate-400">Reason</label>
                                    <select id="reason" value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value)} className="w-full py-2 px-3 text-white bg-slate-700 border border-slate-600 rounded-md">
                                        <option>Correction</option><option>Damaged Goods</option><option>Stock Intake</option><option>Returned</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button onClick={closeAdjustModal} className="px-4 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-500 font-semibold">Cancel</button>
                                <button onClick={handleStockAdjustment} className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold">Save</button>
                            </div>
                        </div>
                    )}
                    {isAddProductModalOpen && (
                         <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700">
                             <h3 className="text-xl font-bold mb-4 text-white">Add New Product</h3>
                             <div className="overflow-y-auto pr-2 flex-grow">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm text-slate-400">Product Name</label>
                                        <input value={newProductName} onChange={e => setNewProductName(e.target.value)} className="w-full mt-1 p-2 text-white bg-slate-700 border border-slate-600 rounded-md"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400">Category</label>
                                        <select value={newProductCategoryId} onChange={e => setNewProductCategoryId(e.target.value)} className="w-full mt-1 p-2 text-white bg-slate-700 border border-slate-600 rounded-md">
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <h4 className="text-lg font-semibold mb-2 text-white">Variants</h4>
                                {newProductVariants.map((variant, index) => (
                                    <div key={index} className="bg-slate-900/50 p-4 rounded-md border border-slate-700 mb-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <input placeholder="Variant Name (e.g., Large)" value={variant.name} onChange={e => handleVariantChange(index, 'name', e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md text-sm border border-slate-600"/>
                                            <input placeholder="SKU" value={variant.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md text-sm border border-slate-600"/>
                                            <input type="number" placeholder="Selling Price" value={variant.sellingPrice} onChange={e => handleVariantChange(index, 'sellingPrice', Number(e.target.value))} className="w-full bg-slate-700 p-2 rounded-md text-sm border border-slate-600"/>
                                            <input type="number" placeholder="Cost Price" value={variant.costPrice} onChange={e => handleVariantChange(index, 'costPrice', Number(e.target.value))} className="w-full bg-slate-700 p-2 rounded-md text-sm border border-slate-600"/>
                                            <input placeholder="Batch #" value={variant.batchNumber || ''} onChange={e => handleVariantChange(index, 'batchNumber', e.target.value)} className="w-full bg-slate-700 p-2 rounded-md text-sm border border-slate-600"/>
                                            <input type="date" placeholder="Expiry Date" value={variant.expiryDate || ''} onChange={e => handleVariantChange(index, 'expiryDate', e.target.value)} className="w-full bg-slate-700 p-2 rounded-md text-sm border border-slate-600"/>
                                        </div>
                                        <h5 className="text-sm font-semibold mt-4 mb-2 text-slate-300">Initial Stock</h5>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {branches.map(branch => (
                                                <div key={branch.id}>
                                                    <label className="text-xs text-slate-400">{branch.name}</label>
                                                    <input type="number" value={variant.stockByBranch[branch.id] || 0} onChange={e => handleVariantStockChange(index, branch.id, e.target.value)} className="w-full bg-slate-700 p-1 rounded-md text-xs border border-slate-600"/>
                                                </div>
                                            ))}
                                        </div>
                                        {index > 0 && (
                                            <div className="text-right mt-2">
                                                <button type="button" onClick={() => removeVariantRow(index)} className="text-red-500 hover:text-red-400 text-xs font-semibold">Remove Variant</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={addVariantRow} className="mt-4 text-cyan-400 font-semibold text-sm">+ Add Variant</button>
                             </div>
                             <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-700">
                                <button type="button" onClick={closeAddProductModal} className="px-4 py-2 rounded-md bg-slate-600 font-semibold">Cancel</button>
                                <button type="button" onClick={handleAddProduct} className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 font-semibold">Save Product</button>
                             </div>
                         </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Inventory;