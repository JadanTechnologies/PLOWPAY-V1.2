
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Product } from '../types';
import Icon from './icons';

const Inventory: React.FC = () => {
    const { products } = useAppContext();
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                                    {vIndex === 0 && (
                                    <td rowSpan={product.variants.length} className="p-3 align-top text-center border-l border-gray-700">
                                        <button className="text-gray-400 hover:text-white p-1">Edit</button>
                                        <button className="text-gray-400 hover:text-white p-1">Delete</button>
                                    </td>
                                     )}
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
        </div>
    );
};

export default Inventory;
