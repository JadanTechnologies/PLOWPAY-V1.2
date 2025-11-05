

import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Product, CartItem, ProductVariant } from '../types';
import Icon from './icons';
import Calculator from './Calculator';

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product, variant: ProductVariant) => void }> = ({ product, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-200 cursor-pointer flex flex-col">
      <div onClick={() => onAddToCart(product, selectedVariant)}>
        <img className="w-full h-40 object-cover" src={`https://picsum.photos/seed/${product.id}/400/300`} alt={product.name} />
        <div className="p-4 flex-grow">
          <h3 className="font-bold text-lg text-white mb-1 truncate">{product.name}</h3>
          <p className="text-gray-400 text-sm mb-2">{product.category}</p>
        </div>
      </div>
      <div className="p-4 pt-0 mt-auto">
        {product.variants.length > 1 && (
            <select
              value={selectedVariant.id}
              onChange={(e) => setSelectedVariant(product.variants.find(v => v.id === e.target.value) || product.variants[0])}
              className="w-full bg-gray-700 text-white p-2 rounded-md mb-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {product.variants.map(variant => (
                <option key={variant.id} value={variant.id}>{variant.name}</option>
              ))}
            </select>
          )}
        <div className="flex justify-between items-center">
          <p className="text-xl font-semibold text-indigo-400">${selectedVariant.price.toFixed(2)}</p>
          <button onClick={() => onAddToCart(product, selectedVariant)} className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-500 transition-colors">
            <Icon name="plus" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PointOfSale: React.FC = () => {
  const { products, searchTerm } = useAppContext();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const handleAddToCart = useCallback((product: Product, variant: ProductVariant) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.variantId === variant.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { 
          productId: product.id, 
          variantId: variant.id, 
          name: product.name,
          variantName: variant.name,
          quantity: 1, 
          price: variant.price
        }];
    });
  }, []);

  const handleUpdateQuantity = (variantId: string, delta: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        item.variantId === variantId ? { ...item, quantity: item.quantity + delta } : item
      );
      return updatedCart.filter(item => item.quantity > 0);
    });
  };

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorites = !showFavorites || product.isFavorite;
      return matchesCategory && matchesSearch && matchesFavorites;
    });
  }, [products, searchTerm, selectedCategory, showFavorites]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
      {isCalculatorOpen && <Calculator onClose={() => setIsCalculatorOpen(false)} />}
      {/* Product Grid */}
      <div className="flex-1 flex flex-col bg-gray-800/50 rounded-lg p-4">
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <select 
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button onClick={() => setShowFavorites(!showFavorites)} className={`p-2 rounded-md transition-colors ${showFavorites ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
            <Icon name="star" className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </div>
      
      {/* Cart Section */}
      <div className="w-full lg:w-1/3 xl:w-1/4 bg-gray-800 rounded-lg p-4 flex flex-col">
        <h2 className="text-2xl font-bold border-b border-gray-700 pb-2 mb-4">Current Order</h2>
        <div className="flex-1 overflow-y-auto -mr-2 pr-2">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center mt-8">Your cart is empty.</p>
          ) : (
            <ul className="space-y-3">
              {cart.map(item => (
                <li key={item.variantId} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                  <div className="flex-1 mr-2">
                    <p className="font-semibold truncate">{item.name}</p>
                    <p className="text-sm text-gray-400">{item.variantName}</p>
                    <p className="text-sm text-indigo-400">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center">
                    <button onClick={() => handleUpdateQuantity(item.variantId, -1)} className="p-1 rounded-full bg-gray-600 hover:bg-gray-500"><Icon name="minus" className="w-4 h-4" /></button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.variantId, 1)} className="p-1 rounded-full bg-gray-600 hover:bg-gray-500"><Icon name="plus" className="w-4 h-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {cart.length > 0 && (
          <div className="mt-auto pt-4 border-t border-gray-700">
            <div className="space-y-2 text-lg">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-400"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-2xl"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
                <button className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center" onClick={() => setCart([])}>
                    <Icon name="trash" className="w-5 h-5 mr-2"/> Clear
                </button>
                 <button className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded-md">Hold</button>
                 <button className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center" onClick={() => setIsCalculatorOpen(true)}>
                    <Icon name="calculator" className="w-5 h-5"/>
                </button>
            </div>
            <button className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-md text-xl">
              Pay Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointOfSale;