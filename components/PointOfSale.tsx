
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Product, CartItem, ProductVariant, Payment, Sale } from '../types';
import Icon from './icons';
import Calculator from './Calculator';

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product, variant: ProductVariant) => void }> = ({ product, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-200 cursor-pointer flex flex-col">
      <div onClick={() => onAddToCart(product, selectedVariant)}>
        <img className="w-full aspect-[4/3] object-cover rounded-t-lg" src={`https://picsum.photos/seed/${product.id}/400/300`} alt={product.name} />
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
          <p className="text-xl font-semibold text-indigo-400">${selectedVariant.sellingPrice.toFixed(2)}</p>
          <button onClick={() => onAddToCart(product, selectedVariant)} className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-500 transition-colors">
            <Icon name="plus" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentModal: React.FC<{ totalDue: number; onClose: () => void; onConfirm: (payments: Payment[], change: number) => void; }> = ({ totalDue, onClose, onConfirm }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [currentAmount, setCurrentAmount] = useState('');
    const [currentMethod, setCurrentMethod] = useState<'Cash' | 'Card' | 'Bank'>('Cash');
    
    const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);
    const remaining = useMemo(() => totalDue - totalPaid, [totalDue, totalPaid]);
    const change = useMemo(() => (remaining < 0 ? Math.abs(remaining) : 0), [remaining]);
    const isFullyPaid = remaining <= 0;

    const addPayment = () => {
        const amount = parseFloat(currentAmount);
        if (isNaN(amount) || amount <= 0) return;
        setPayments([...payments, { method: currentMethod, amount }]);
        setCurrentAmount('');
    };

    const handleQuickCash = (amount: number) => {
        setCurrentMethod('Cash');
        setCurrentAmount(String(amount));
    };

    const nextBill = (amount: number) => {
        const multiples = [1, 5, 10, 20, 50, 100];
        for (const bill of multiples) {
            if (bill >= amount) return bill;
        }
        return Math.ceil(amount / 100) * 100;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-white">Payment</h3>
                    <button onClick={onClose}><Icon name="x-mark" className="w-6 h-6"/></button>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-md text-center mb-4">
                    <p className="text-gray-400 text-lg">Total Due</p>
                    <p className="text-5xl font-extrabold text-indigo-400 tracking-tight">${totalDue.toFixed(2)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left side: Payment input */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {(['Cash', 'Card', 'Bank'] as const).map(method => (
                                <button key={method} onClick={() => setCurrentMethod(method)} className={`py-2 rounded-md font-semibold transition-colors ${currentMethod === method ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{method}</button>
                            ))}
                        </div>
                        <input type="number" placeholder="Amount" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md text-2xl text-center"/>
                        {currentMethod === 'Cash' && remaining > 0 && (
                            <div className="text-center text-sm text-gray-400">
                                Exact: <button className="font-semibold text-indigo-400" onClick={() => handleQuickCash(remaining)}>${remaining.toFixed(2)}</button>
                                &nbsp;|&nbsp;
                                Next Bill: <button className="font-semibold text-indigo-400" onClick={() => handleQuickCash(nextBill(remaining))}>${nextBill(remaining).toFixed(2)}</button>
                            </div>
                        )}
                        <button onClick={addPayment} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-md text-lg">Add Payment</button>
                    </div>

                    {/* Right side: Summary */}
                    <div className="bg-gray-700/50 p-4 rounded-md flex flex-col">
                         <h4 className="font-semibold mb-2">Payments Received:</h4>
                         <ul className="flex-grow space-y-1 text-sm">
                            {payments.map((p, i) => <li key={i} className="flex justify-between"><span>{p.method}</span><span>${p.amount.toFixed(2)}</span></li>)}
                            {payments.length === 0 && <li className="text-gray-400">No payments added.</li>}
                         </ul>
                         <div className="border-t border-gray-600 pt-2 space-y-1 mt-2 text-lg">
                            <div className="flex justify-between"><span>Total Paid:</span><span>${totalPaid.toFixed(2)}</span></div>
                            <div className={`flex justify-between font-bold ${isFullyPaid ? 'text-green-400' : 'text-red-400'}`}><span>Remaining:</span><span>${remaining > 0 ? remaining.toFixed(2) : '0.00'}</span></div>
                            {change > 0 && <div className="flex justify-between font-bold text-yellow-400"><span>Change Due:</span><span>${change.toFixed(2)}</span></div>}
                         </div>
                    </div>
                </div>

                <button onClick={() => onConfirm(payments, change)} disabled={!isFullyPaid} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-md text-xl disabled:bg-gray-600 disabled:cursor-not-allowed">
                    Complete Sale
                </button>
            </div>
        </div>
    );
};

const InvoiceModal: React.FC<{ sale: Sale; onClose: () => void; }> = ({ sale, onClose }) => {
    const { brandConfig } = useAppContext();
    const subtotal = sale.items.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
    const tax = sale.total - subtotal;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4">
            <div id="invoice-modal" className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div id="invoice-content" className="p-6 overflow-y-auto">
                    {/* Header */}
                    <div className="text-center mb-6">
                         {brandConfig.logoUrl ? (
                            <img src={brandConfig.logoUrl} alt={`${brandConfig.name} Logo`} className="h-12 w-auto mx-auto mb-2" />
                        ) : ( <Icon name="pos" className="w-12 h-12 text-indigo-400 mx-auto" />)}
                        <h2 className="text-2xl font-bold">{brandConfig.name}</h2>
                        <p className="text-sm">123 Market St, San Francisco, CA</p>
                    </div>

                    {/* Sale Info */}
                    <div className="flex justify-between text-sm mb-4">
                        <div>
                            <p><strong>Sale ID:</strong> {sale.id}</p>
                            <p><strong>Date:</strong> {sale.date.toLocaleString()}</p>
                        </div>
                        <div>
                             <p><strong>Customer:</strong> {sale.customer.name}</p>
                             {sale.customer.phone && <p><strong>Phone:</strong> {sale.customer.phone}</p>}
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-sm mb-4">
                        <thead>
                            <tr className="border-b-2 border-dashed border-gray-600"><th className="text-left py-1">Item</th><th className="text-center py-1">Qty</th><th className="text-right py-1">Price</th><th className="text-right py-1">Total</th></tr>
                        </thead>
                        <tbody>
                            {sale.items.map(item => (
                                <tr key={item.variantId} className="border-b border-dashed border-gray-700">
                                    <td className="py-1">
                                        <div>{item.name}</div>
                                        <div className="text-xs text-gray-400">{item.variantName}</div>
                                    </td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-right">${item.sellingPrice.toFixed(2)}</td>
                                    <td className="text-right">${(item.quantity * item.sellingPrice).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="space-y-1 text-sm mb-4">
                        <div className="flex justify-between"><span className="text-gray-400">Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Tax:</span><span>${tax.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>${sale.total.toFixed(2)}</span></div>
                    </div>
                    
                    {/* Payments */}
                    <div className="space-y-1 text-sm border-t border-gray-700 pt-2">
                         {sale.payments.map((p, i) => (
                            <div key={i} className="flex justify-between"><span className="text-gray-400">Paid ({p.method}):</span><span>${p.amount.toFixed(2)}</span></div>
                         ))}
                         {sale.change > 0 && <div className="flex justify-between font-bold"><span>Change:</span><span>${sale.change.toFixed(2)}</span></div>}
                    </div>

                    <p className="text-center text-xs mt-6 text-gray-400">Thank you for your business!</p>
                </div>
                <div className="no-print mt-auto p-4 bg-gray-900/50 rounded-b-lg flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 font-semibold">Close</button>
                    <button onClick={handlePrint} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 font-semibold flex items-center gap-2"><Icon name="inventory" className="w-5 h-5"/>Print Invoice</button>
                </div>
            </div>
        </div>
    );
};


const PointOfSale: React.FC = () => {
  const { products, searchTerm, addSale, branches } = useAppContext();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const defaultCustomer = { name: 'Walk-in Customer', phone: '' };
  const [customer, setCustomer] = useState(defaultCustomer);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  const [saleStatus, setSaleStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (saleStatus) {
      const timer = setTimeout(() => setSaleStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [saleStatus]);

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
          sellingPrice: variant.sellingPrice
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

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0), [cart]);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleConfirmPayment = async (payments: Payment[], change: number) => {
      if (cart.length === 0) return;
      
      const saleData = {
          items: cart,
          total: total,
          branchId: branches[0]?.id || 'branch-1', // Default to first branch
          customer: customer,
          payments: payments,
          change: change
      };

      const result = await addSale(saleData);
      
      if(result.success && result.newSale) {
          setSaleStatus({ message: result.message, type: 'success' });
          setLastCompletedSale(result.newSale);
          setInvoiceModalOpen(true);
          setPaymentModalOpen(false);

          // Reset POS
          setCart([]);
          setCustomer(defaultCustomer);
          setIsEditingCustomer(false);
      } else {
          setSaleStatus({ message: result.message || 'An unknown error occurred.', type: 'error' });
      }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
      {isCalculatorOpen && <Calculator onClose={() => setIsCalculatorOpen(false)} />}
      
      {isPaymentModalOpen && <PaymentModal totalDue={total} onClose={() => setPaymentModalOpen(false)} onConfirm={handleConfirmPayment} />}
      {isInvoiceModalOpen && lastCompletedSale && <InvoiceModal sale={lastCompletedSale} onClose={() => setInvoiceModalOpen(false)} />}
      
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
        
         {saleStatus && (
            <div className={`p-3 rounded-md mb-4 text-sm ${saleStatus.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {saleStatus.message}
            </div>
        )}
        
        <div className="p-3 bg-gray-900/50 rounded-md mb-4">
            {isEditingCustomer ? (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-400">Customer Name</label>
                        <input type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Phone Number (for SMS confirmation)</label>
                        <input type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-sm" placeholder="Optional"/>
                    </div>
                    <button onClick={() => setIsEditingCustomer(false)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm py-1 rounded-md">Done</button>
                </div>
            ) : (
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">{customer.name}</h3>
                        {customer.phone && <p className="text-sm text-gray-400">{customer.phone}</p>}
                    </div>
                    <button onClick={() => setIsEditingCustomer(true)} className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold">
                       {customer.name === 'Walk-in Customer' ? 'Add Customer' : 'Edit'}
                    </button>
                </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto -mr-2 pr-2">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center mt-8">Your cart is empty.</p>
          ) : (
            <ul className="space-y-3">
              {cart.map(item => (
                <li key={item.variantId} className="flex items-center bg-gray-700 p-2 rounded-md">
                    <img className="w-16 h-16 object-cover rounded-md mr-3 flex-shrink-0" src={`https://picsum.photos/seed/${item.productId}/200`} alt={item.name} />
                    <div className="flex-1 mr-2 overflow-hidden">
                        <p className="font-semibold truncate">{item.name}</p>
                        <p className="text-sm text-indigo-400 font-bold">{item.variantName}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.quantity} &times; ${item.sellingPrice.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <p className="font-bold text-lg">${(item.sellingPrice * item.quantity).toFixed(2)}</p>
                        <div className="flex items-center">
                            <button onClick={() => handleUpdateQuantity(item.variantId, -1)} className="p-1 rounded-full bg-gray-600 hover:bg-gray-500"><Icon name="minus" className="w-4 h-4" /></button>
                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item.variantId, 1)} className="p-1 rounded-full bg-gray-600 hover:bg-gray-500"><Icon name="plus" className="w-4 h-4" /></button>
                        </div>
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
            <button onClick={() => setPaymentModalOpen(true)} className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-md text-xl">
              Pay Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointOfSale;