import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Product, CartItem, ProductVariant, Payment, Sale } from '../types';
import Icon from './icons';
import Calculator from './Calculator';
import { useCurrency } from '../hooks/useCurrency';

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product, variant: ProductVariant) => void }> = ({ product, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [isAdding, setIsAdding] = useState(false);
  const { formatCurrency } = useCurrency();

  const handleAddToCartClick = () => {
      setIsAdding(true);
      setTimeout(() => {
          onAddToCart(product, selectedVariant);
          setIsAdding(false);
      }, 300);
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-200 cursor-pointer flex flex-col">
      <div onClick={handleAddToCartClick}>
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
          <p className="text-xl font-semibold text-indigo-400">{formatCurrency(selectedVariant.sellingPrice)}</p>
          <button onClick={handleAddToCartClick} disabled={isAdding} className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-500 transition-colors w-9 h-9 flex items-center justify-center">
            {isAdding ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <Icon name="plus" className="w-5 h-5" />
            )}
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
    const { formatCurrency } = useCurrency();
    
    const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);
    const remaining = useMemo(() => totalDue - totalPaid, [totalDue, totalPaid]);
    const change = useMemo(() => (remaining < 0 ? Math.abs(remaining) : 0), [remaining]);
    
    // A sale is completable if some payment is made, or if it's a zero-value sale.
    const isCompletable = totalPaid > 0 || totalDue === 0;

    const addPayment = () => {
        const amount = parseFloat(currentAmount);
        if (isNaN(amount) || amount <= 0) return;
        setPayments([...payments, { method: currentMethod, amount }]);
        setCurrentAmount('');
    };

    const handleQuickCash = (amount: number) => {
        setCurrentMethod('Cash');
        setCurrentAmount(String(amount.toFixed(2)));
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
                    <p className="text-5xl font-extrabold text-indigo-400 tracking-tight">{formatCurrency(totalDue)}</p>
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
                                Exact: <button className="font-semibold text-indigo-400" onClick={() => handleQuickCash(remaining)}>{formatCurrency(remaining)}</button>
                                &nbsp;|&nbsp;
                                Next Bill: <button className="font-semibold text-indigo-400" onClick={() => handleQuickCash(nextBill(remaining))}>{formatCurrency(nextBill(remaining))}</button>
                            </div>
                        )}
                        <button onClick={addPayment} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-md text-lg">Add Payment</button>
                    </div>

                    {/* Right side: Summary */}
                    <div className="bg-gray-700/50 p-4 rounded-md flex flex-col">
                         <h4 className="font-semibold mb-2">Payments Received:</h4>
                         <ul className="flex-grow space-y-1 text-sm">
                            {payments.map((p, i) => <li key={i} className="flex justify-between"><span>{p.method}</span><span>{formatCurrency(p.amount)}</span></li>)}
                            {payments.length === 0 && <li className="text-gray-400">No payments added.</li>}
                         </ul>
                         <div className="border-t border-gray-600 pt-2 space-y-1 mt-2 text-lg">
                            <div className="flex justify-between"><span>Total Paid:</span><span>{formatCurrency(totalPaid)}</span></div>
                            <div className={`flex justify-between font-bold ${remaining <= 0 ? 'text-green-400' : 'text-red-400'}`}><span>Remaining:</span><span>{remaining > 0 ? formatCurrency(remaining) : formatCurrency(0)}</span></div>
                            {change > 0 && <div className="flex justify-between font-bold text-yellow-400"><span>Change Due:</span><span>{formatCurrency(change)}</span></div>}
                         </div>
                    </div>
                </div>

                <button onClick={() => onConfirm(payments, change)} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-md text-xl">
                    {remaining > 0 ? 'Complete with Deposit' : 'Complete Sale'}
                </button>
                 <p className="text-xs text-gray-500 text-center mt-2">
                    {remaining > 0 ? `An outstanding balance of ${formatCurrency(remaining)} will be recorded as credit.` : 'Payment covers total amount.'}
                </p>
            </div>
        </div>
    );
};

const InvoiceModal: React.FC<{ sale: Sale; onClose: () => void; }> = ({ sale, onClose }) => {
    const { brandConfig, staff } = useAppContext();
    const { formatCurrency } = useCurrency();
    const subtotal = sale.items.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
    const tax = sale.total - subtotal + (sale.discount || 0);
    const cashier = staff.find(s => s.id === sale.staffId);

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
                             <p><strong>Cashier:</strong> {cashier?.name || 'N/A'}</p>
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
                                    <td className="text-right">{formatCurrency(item.sellingPrice)}</td>
                                    <td className="text-right">{formatCurrency(item.quantity * item.sellingPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="space-y-1 text-sm mb-4">
                        <div className="flex justify-between"><span className="text-gray-400">Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Tax:</span><span>{formatCurrency(tax)}</span></div>
                         {sale.discount && sale.discount > 0 && <div className="flex justify-between"><span className="text-gray-400">Discount:</span><span className="text-red-400">-{formatCurrency(sale.discount)}</span></div>}
                        <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>{formatCurrency(sale.total)}</span></div>
                    </div>
                    
                    {/* Payments */}
                    <div className="space-y-1 text-sm border-t border-gray-700 pt-2">
                         {sale.payments.map((p, i) => (
                            <div key={i} className="flex justify-between"><span className="text-gray-400">Paid ({p.method}):</span><span>{formatCurrency(p.amount)}</span></div>
                         ))}
                         {sale.change > 0 && <div className="flex justify-between font-bold"><span>Change:</span><span>{formatCurrency(sale.change)}</span></div>}
                    </div>

                    <p className="text-center text-xs mt-6 text-gray-400">Thank you for your business!</p>
                </div>
                <div className="no-print mt-auto p-4 bg-gray-900/50 rounded-b-lg flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 font-semibold">Close</button>
                    <button onClick={handlePrint} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 font-semibold flex items-center gap-2"><Icon name="printer" className="w-5 h-5"/>Print Invoice</button>
                </div>
            </div>
        </div>
    );
};

interface HeldOrder {
  id: number;
  cart: CartItem[];
  customer: { name: string; phone?: string; };
  discount: number;
  heldAt: Date;
}


const PointOfSale: React.FC = () => {
  const { products, searchTerm, addSale, branches } = useAppContext();
  const { formatCurrency } = useCurrency();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [discount, setDiscount] = useState(0);

  const defaultCustomer = { name: 'Walk-in Customer', phone: '' };
  const [customer, setCustomer] = useState(defaultCustomer);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  const [saleStatus, setSaleStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const HELD_ORDERS_STORAGE_KEY = 'flowpay-held-orders';
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
    try {
      const storedOrders = window.localStorage.getItem(HELD_ORDERS_STORAGE_KEY);
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        return parsed.map((order: any) => ({ ...order, heldAt: new Date(order.heldAt) }));
      }
    } catch (error) {
      console.error("Error loading held orders from local storage", error);
    }
    return [];
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(HELD_ORDERS_STORAGE_KEY, JSON.stringify(heldOrders));
    } catch (error) {
      console.error("Error saving held orders to local storage", error);
    }
  }, [heldOrders]);

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
          sellingPrice: variant.sellingPrice,
          costPrice: variant.costPrice
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
  const total = subtotal + tax - discount;

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
        value = 0;
    }
    const maxDiscount = subtotal + tax;
    if (value > maxDiscount) {
        value = maxDiscount;
    }
    setDiscount(value);
  };

  const clearOrder = useCallback(() => {
    setCart([]);
    setDiscount(0);
    setCustomer(defaultCustomer);
    setIsEditingCustomer(false);
  }, []);

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    const newHeldOrder: HeldOrder = {
      id: Date.now(),
      cart,
      customer,
      discount,
      heldAt: new Date(),
    };
    setHeldOrders(prev => [newHeldOrder, ...prev]);
    clearOrder();
    setSaleStatus({ message: 'Order held successfully.', type: 'success' });
  };

  const handleRetrieveOrder = (id: number) => {
    if (cart.length > 0) {
      if (!window.confirm('This will replace the current order. Continue?')) {
        return;
      }
    }
    const orderToRetrieve = heldOrders.find(o => o.id === id);
    if (orderToRetrieve) {
      setCart(orderToRetrieve.cart);
      setCustomer(orderToRetrieve.customer);
      setDiscount(orderToRetrieve.discount);
      setHeldOrders(prev => prev.filter(o => o.id !== id));
      setSaleStatus({ message: 'Held order retrieved.', type: 'success' });
    }
  };

  const handleDeleteHeldOrder = (id: number) => {
    setHeldOrders(prev => prev.filter(o => o.id !== id));
  };


  const handleConfirmPayment = async (payments: Payment[], change: number) => {
      if (cart.length === 0) return;

      const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0) - change;
      const finalPayments = [...payments];

      if (total > totalPaid) {
          finalPayments.push({ method: 'Credit', amount: total - totalPaid });
      }
      
      const saleData = {
          items: cart,
          total: total,
          branchId: branches[0]?.id || 'branch-1', // Default to first branch
          customer: customer,
          payments: finalPayments,
          change: change,
          staffId: 'staff-1', // Mock: assume staff-1 is logged in
          discount: discount
      };

      const result = await addSale(saleData);
      
      if(result.success && result.newSale) {
          setSaleStatus({ message: result.message, type: 'success' });
          setLastCompletedSale(result.newSale);
          setInvoiceModalOpen(true);
          setPaymentModalOpen(false);
          clearOrder();
      } else {
          setSaleStatus({ message: result.message || 'An unknown error occurred.', type: 'error' });
      }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
      {isCalculatorOpen && <Calculator onClose={() => setIsCalculatorOpen(false)} />}
      
      {isPaymentModalOpen && <PaymentModal totalDue={total > 0 ? total : 0} onClose={() => setPaymentModalOpen(false)} onConfirm={handleConfirmPayment} />}
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

        {heldOrders.length > 0 && (
          <div className="mb-4 border-b border-gray-700 pb-3">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Icon name="pause" className="w-5 h-5" />
              <span>Held Orders</span>
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 -mr-2">
              {heldOrders.map(order => (
                <div key={order.id} className="bg-gray-900/50 p-2 rounded-md flex items-center text-sm">
                  <div className="flex-grow">
                    <p className="font-semibold">{order.customer.name}</p>
                    <p className="text-xs text-gray-400">
                      {order.cart.length} items - {order.heldAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleRetrieveOrder(order.id)} 
                      className="bg-green-600 hover:bg-green-500 text-white font-semibold px-2 py-1 rounded-md text-xs flex items-center gap-1"
                    >
                      <Icon name="arrow-up-tray" className="w-4 h-4" />
                      <span>Retrieve</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteHeldOrder(order.id)} 
                      className="text-gray-400 hover:text-red-400 p-1"
                      aria-label="Delete held order"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                        <input type="tel" value={customer.phone || ''} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-sm" placeholder="Optional"/>
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
                        <p className="text-xs text-gray-400 mt-1">{item.quantity} &times; {formatCurrency(item.sellingPrice)}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <p className="font-bold text-lg">{formatCurrency(item.sellingPrice * item.quantity)}</p>
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
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-gray-400"><span>Tax (8%)</span><span>{formatCurrency(tax)}</span></div>
              <div className="flex justify-between items-center text-gray-400">
                <label htmlFor="discount">Discount</label>
                <div className="flex items-center">
                    <span className="mr-1">{formatCurrency(0).charAt(0)}</span>
                    <input
                        id="discount"
                        type="number"
                        value={discount === 0 ? '' : discount}
                        onChange={handleDiscountChange}
                        className="w-24 bg-gray-900 text-right font-semibold rounded-md p-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0.00"
                    />
                </div>
              </div>
              <div className="flex justify-between font-bold text-2xl"><span>Total</span><span>{total < 0 ? formatCurrency(0) : formatCurrency(total)}</span></div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
                <button className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center" onClick={() => {setCart([]); setDiscount(0);}}>
                    <Icon name="trash" className="w-5 h-5 mr-2"/> Clear
                </button>
                 <button 
                    onClick={handleHoldOrder}
                    disabled={cart.length === 0}
                    className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded-md flex items-center justify-center disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Icon name="pause" className="w-5 h-5 mr-2"/> Hold
                </button>
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