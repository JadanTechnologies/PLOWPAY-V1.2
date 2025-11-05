
import React, {useState} from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Product, ProductVariant } from '../types';
import Icon from './icons';

const Inventory: React.FC = () => {
    const { products, adjustStock } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [newStockValue, setNewStockValue] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('Correction');

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const openAdjustModal = (product: Product, variant: ProductVariant) => {
        setSelectedProduct(product);
        setSelectedVariant(variant);
        setNewStockValue(variant.stock.toString());
        setIsModalOpen(true);
    };

    const closeAdjustModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setSelectedVariant(null);
        setNewStockValue('');
        setAdjustmentReason('Correction');
    };

    const handleStockAdjustment = () => {
        if (selectedProduct && selectedVariant && newStockValue !== '') {
            const newStock = parseInt(newStockValue, 10);
            if (!isNaN(newStock) && newStock >= 0) {
                adjustStock(selectedProduct.id, selectedVariant.id, newStock);
                closeAdjustModal();
            } else {
                alert("Please enter a valid, non-negative number for the stock.");
            }
        }
    };


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
                                <th className="p-3 text-sm font-semibold tracking-wide text-right">Stock</th>
                                <th className="p-3 text-sm font-semibold tracking-wide text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.flatMap((product, pIndex) => 
                                product.variants.map((variant, vIndex) => (
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
                                    <td className={`p-3 whitespace-nowrap text-right font-bold ${variant.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>{variant.stock}</td>
                                    <td className="p-3 text-center whitespace-nowrap">
                                        <button onClick={() => openAdjustModal(product, variant)} className="text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded-md text-sm">Adjust</button>
                                    </td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredProducts.length === 0 && (
                     <p className="text-center text-gray-400 py-8">No products found.</p>
                )}
            </div>

            {/* Stock Adjustment Modal */}
            {isModalOpen && selectedProduct && selectedVariant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-2 text-white">Adjust Stock</h3>
                        <p className="text-gray-400 mb-4">
                            Product: <span className="font-semibold text-gray-300">{selectedProduct.name}</span> - <span className="font-semibold text-gray-300">{selectedVariant.name}</span>
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Current Stock</label>
                                <p className="text-2xl font-bold text-white bg-gray-900 rounded-md px-3 py-2">{selectedVariant.stock}</p>
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
                            <button
                                type="button"
                                onClick={closeAdjustModal}
                                className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleStockAdjustment}
                                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 font-semibold"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;