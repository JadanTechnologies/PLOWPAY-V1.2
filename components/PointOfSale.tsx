import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Product, CartItem, ProductVariant, Payment, Sale, Deposit, TenantPermission, Customer } from '../types';
import Icon from './icons/index.tsx';
import Calculator from './Calculator';
import { useCurrency } from '../hooks/useCurrency';
import ConfirmationModal from './ConfirmationModal';

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product, variant: ProductVariant) => void }> = ({ product, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [isAdding, setIsAdding] = useState(false);
  const { formatCurrency } = useCurrency();
  const { categories } = useAppContext();
  const category = useMemo(() => categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized', [categories, product.categoryId]);

  const handleAddToCartClick = () => {
      setIsAdding(true);
      setTimeout(() => {
          onAddToCart(product, selectedVariant);
          setIsAdding(false);
      }, 300);
  };

  return (
    <div className="bg-slate-800/50 rounded-lg overflow-hidden shadow-lg border border-slate-700 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10 flex flex-col">
      <div className="relative cursor-pointer" onClick={handleAddToCartClick}>
        <img className="w-full aspect-square object-cover" src={`https://picsum.photos/seed/${product.id}/400`} alt={product.name} />
        {product.isFavorite && <Icon name="star" className="absolute top-2 right-2 w-6 h-6 text-yellow-400" />}
      </div>
      <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-base text-white mb-1 truncate">{product.name}</h3>
          <p className="text-slate-400 text-xs mb-2">{category}</p>
          <div className="mt-auto">
            {product.variants.length > 1 && (
                <select
                  value={selectedVariant.id}
                  onChange={(e) => setSelectedVariant(product.variants.find(v => v.id === e.target.value) || product.variants[0])}
                  className="w-full bg-slate-700 text-white p-2 rounded-md mb-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                >
                  {product.variants.map(variant => (
                    <option key={variant.id} value={variant.id}>{variant.name}</option>
                  ))}
                </select>
              )}
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-cyan-400">{formatCurrency(selectedVariant.sellingPrice)}</p>
              <button onClick={handleAddToCartClick} disabled={isAdding} className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-full p-2 hover:from-cyan-600 hover:to-teal-600 transition-all transform hover:scale-110 w-9 h-9 flex items-center justify-center shadow-lg shadow-cyan-500/20">
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
    </div>
  );
};

const PaymentModal: React.FC<{ 
    totalDue: number; 
    onClose: () => void; 
    onConfirm: (payments: Payment[], change: number) => void;
    customerDepositBalance: number;
}> = ({ totalDue, onClose, onConfirm, customerDepositBalance }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [currentAmount, setCurrentAmount] = useState('');
    const [currentMethod, setCurrentMethod] = useState<'Cash' | 'Card' | 'Bank' | 'Deposit'>('Cash');
    const { formatCurrency } = useCurrency();

    const isRefund = totalDue < 0;
    const amountToSettle = Math.abs(totalDue);
    
    const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);
    const totalPaidWithDeposit = useMemo(() => payments.filter(p => p.method === 'Deposit').reduce((acc, p) => acc + p.amount, 0), [payments]);
    const availableDeposit = useMemo(() => customerDepositBalance - totalPaidWithDeposit, [customerDepositBalance, totalPaidWithDeposit]);
    const remaining = useMemo(() => amountToSettle - totalPaid, [amountToSettle, totalPaid]);
    const change = useMemo(() => (remaining < 0 ? Math.abs(remaining) : 0), [remaining]);
    
    const addPayment = () => {
        const amount = parseFloat(currentAmount);
        if (isNaN(amount) || amount <= 0) return;
        if (currentMethod === 'Deposit' && amount > availableDeposit) {
            alert(`Cannot apply more than the available deposit of ${formatCurrency(availableDeposit)}.`);
            return;
        }
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
    
    const buttonText = isRefund
        ? 'Confirm Refund'
        : remaining > 0 ? 'Complete with Deposit' : 'Complete Sale';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-lg border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-white">{isRefund ? 'Process Refund' : 'Payment'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><Icon name="x-mark" className="w-6 h-6"/></button>
                </div>
                
                <div className="bg-slate-950 p-4 rounded-md text-center mb-4 border border-slate-800">
                    <p className="text-slate-400 text-lg">{isRefund ? 'Total to Refund' : 'Total Due'}</p>
                    <p className={`text-5xl font-extrabold ${isRefund ? 'text-red-400' : 'text-cyan-400'} tracking-tight`}>{formatCurrency(amountToSettle)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            {(['Cash', 'Card', 'Bank', 'Deposit'] as const).map(method => {
                                const isDeposit = method === 'Deposit';
                                const disabled = isDeposit && customerDepositBalance <= 0;
                                const label = isDeposit ? `Deposit (${formatCurrency(availableDeposit)})` : method;

                                return (
                                    <button 
                                        key={method} 
                                        onClick={() => setCurrentMethod(method)} 
                                        disabled={disabled}
                                        className={`py-3 rounded-md font-semibold transition-colors ${currentMethod === method ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                        <input type="number" placeholder="Amount" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} className="w-full bg-slate-800 p-3 rounded-md text-2xl text-center border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"/>
                        {!isRefund && currentMethod === 'Cash' && remaining > 0 && (
                            <div className="text-center text-sm text-slate-400">
                                Exact: <button className="font-semibold text-cyan-400" onClick={() => handleQuickCash(remaining)}>{formatCurrency(remaining)}</button>
                                &nbsp;|&nbsp;
                                Next Bill: <button className="font-semibold text-cyan-400" onClick={() => handleQuickCash(nextBill(remaining))}>{formatCurrency(nextBill(remaining))}</button>
                            </div>
                        )}
                        <button onClick={addPayment} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-md text-lg">{isRefund ? 'Add Refund Method' : 'Add Payment'}</button>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-md flex flex-col border border-slate-700">
                         <h4 className="font-semibold mb-2">{isRefund ? 'Refunds Issued:' : 'Payments Received:'}</h4>
                         <ul className="flex-grow space-y-1 text-sm">
                            {payments.map((p, i) => <li key={i} className="flex justify-between"><span>{p.method}</span><span>{formatCurrency(p.amount)}</span></li>)}
                            {payments.length === 0 && <li className="text-slate-400">{isRefund ? 'No refunds issued.' : 'No payments added.'}</li>}
                         </ul>
                         <div className="border-t border-slate-600 pt-2 space-y-1 mt-2 text-lg">
                            <div className="flex justify-between"><span>{isRefund ? 'Total Refunded:' : 'Total Paid:'}</span><span>{formatCurrency(totalPaid)}</span></div>
                            {!isRefund && (
                                <>
                                    <div className={`flex justify-between font-bold ${remaining <= 0 ? 'text-green-400' : 'text-red-400'}`}><span>Remaining:</span><span>{remaining > 0 ? formatCurrency(remaining) : formatCurrency(0)}</span></div>
                                    {change > 0 && <div className="flex justify-between font-bold text-yellow-400"><span>Change Due:</span><span>{formatCurrency(change)}</span></div>}
                                </>
                            )}
                         </div>
                    </div>
                </div>

                <button onClick={() => onConfirm(payments, isRefund ? 0 : change)} className={`w-full mt-6 font-bold py-3 px-4 rounded-md text-xl text-white ${isRefund ? 'bg-red-600 hover:bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600'}`}>
                    {buttonText}
                </button>
                 {!isRefund && (
                    <p className="text-xs text-slate-500 text-center mt-2">
                        {remaining > 0 ? `An outstanding balance of ${formatCurrency(remaining)} will be recorded as credit.` : 'Payment covers total amount.'}
                    </p>
                 )}
            </div>
        </div>
    );
};

const InvoiceModal: React.FC<{ sale: Sale; onClose: () => void; }> = ({ sale, onClose }) => {
    const { brandConfig, staff, customers } = useAppContext();
    const { formatCurrency } = useCurrency();
    const subtotal = sale.items.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
    const tax = sale.total - subtotal + (sale.discount || 0);
    const cashier = staff.find(s => s.id === sale.staffId);
    const customer = customers.find(c => c.id === sale.customerId);
    const isRefund = sale.total < 0;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div id="invoice-modal-container" className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div id="invoice-modal" className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-xs max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <div className="no-print p-6 text-center border-b border-slate-200 dark:border-slate-700">
                    <Icon name="check" className="w-12 h-12 mx-auto text-green-400 mb-2" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sale Completed!</h2>
                    <p className="text-slate-500 dark:text-slate-400">Your transaction was successful.</p>
                </div>
                
                <div id="invoice-content" className="p-3 overflow-y-auto">
                    <div className="receipt-header text-center mb-6">
                         <Icon name="shopping-cart" className="brand-logo w-10 h-10 text-slate-800 dark:text-slate-300 mx-auto" />
                        <h2 className="text-xl font-bold mt-2">{brandConfig.name}</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">123 Market St, San Francisco, CA</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{isRefund ? 'Refund Receipt' : 'Sales Receipt'}</p>
                    </div>

                    <div className="receipt-details flex justify-between text-xs mb-4 text-slate-700 dark:text-slate-300">
                        <div>
                            <p><strong>{isRefund ? 'Return' : 'Sale'} ID:</strong> {sale.id}</p>
                            <p><strong>Date:</strong> {sale.date.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                             <p><strong>Cashier:</strong> {cashier?.name || 'N/A'}</p>
                             <p><strong>Customer:</strong> {customer?.name || 'N/A'}</p>
                        </div>
                    </div>

                    <table className="w-full text-sm mb-4">
                        <thead>
                            <tr className="border-b-2 border-dashed border-slate-300 dark:border-slate-600"><th className="text-left py-1 font-semibold">Item</th><th className="text-center py-1 font-semibold">Qty</th><th className="text-right py-1 font-semibold">Price</th><th className="text-right py-1 font-semibold">Total</th></tr>
                        </thead>
                        <tbody>
                            {sale.items.map(item => (
                                <tr key={item.variantId} className="border-b border-dashed border-slate-300 dark:border-slate-700">
                                    <td className="py-2">
                                        <div>{item.name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.variantName}</div>
                                    </td>
                                    <td className="text-center align-top py-2">{item.quantity}</td>
                                    <td className="text-right align-top py-2">{formatCurrency(item.sellingPrice)}</td>
                                    <td className="text-right align-top py-2">{formatCurrency(item.quantity * item.sellingPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="totals-section space-y-1 text-sm mb-4">
                        <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Tax:</span><span>{formatCurrency(tax)}</span></div>
                         {sale.discount && sale.discount > 0 && <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Discount:</span><span className="text-red-500 dark:text-red-400">-{formatCurrency(sale.discount)}</span></div>}
                        <div className="flex justify-between font-bold text-base border-t border-dashed border-slate-300 dark:border-slate-600 pt-2 mt-2"><span>Total:</span><span>{formatCurrency(sale.total)}</span></div>
                    </div>
                    
                    <div className="payment-details space-y-1 text-sm">
                         {sale.payments.map((p, i) => (
                            <div key={i} className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">{isRefund ? 'Refunded via' : 'Paid'} ({p.method}):</span>
                                <span>{formatCurrency(p.amount)}</span>
                            </div>
                         ))}
                         {sale.change > 0 && <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Change:</span><span>{formatCurrency(sale.change)}</span></div>}
                    </div>

                    <p className="footer-message text-center text-xs mt-6 text-slate-500 dark:text-slate-400">Thank you for your business!</p>
                </div>
                <div className="no-print mt-auto p-4 bg-slate-100 dark:bg-slate-900/50 rounded-b-lg flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">Close</button>
                    <button onClick={handlePrint} className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 font-semibold flex items-center gap-2"><Icon name="printer" className="w-5 h-5"/>Print Receipt</button>
                </div>
            </div>
        </div>
    );
};

interface HeldOrder {
  id: number;
  cart: CartItem[];
  // FIX: Added 'id' to the customer object in HeldOrder to match the customer state type.
  customer: { id: string; name: string; phone: string; };
  discount: number;
  heldAt: Date;
}

const DepositModal: React.FC<{
    customerName: string;
    onClose: () => void;
    onConfirm: (amount: number, notes: string) => void;
}> = ({ customerName, onClose, onConfirm }) => {
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    const handleConfirm = () => {
        const numAmount = parseFloat(amount);
        if (!isNaN(numAmount) && numAmount > 0) {
            onConfirm(numAmount, notes);
        } else {
            alert('Please enter a valid amount.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-md border border-slate-700">
                <h3 className="text-xl font-bold mb-2 text-white">Record Deposit</h3>
                <p className="text-slate-400 mb-4">For Customer: <span className="font-semibold text-white">{customerName}</span></p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Deposit Amount</label>
                        <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full mt-1 bg-slate-800 p-3 rounded-md text-xl border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Notes (Optional)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full mt-1 bg-slate-800 p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-500 font-semibold">Cancel</button>
                    <button onClick={handleConfirm} className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold">Record Deposit</button>
                </div>
            </div>
        </div>
    );
};

const HeldOrdersModal: React.FC<{
    heldOrders: HeldOrder[];
    onClose: () => void;
    onRetrieve: (id: number) => void;
    onDelete: (id: number) => void;
}> = ({ heldOrders, onClose, onRetrieve, onDelete }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-slate-700 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Held Orders</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><Icon name="x-mark" className="w-6 h-6"/></button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-3">
                    {heldOrders.length === 0 ? (
                        <p className="text-center text-slate-500 py-16">No orders are currently on hold.</p>
                    ) : (
                        heldOrders.map(order => (
                            <div key={order.id} className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{order.customer.name}</p>
                                    <p className="text-sm text-slate-400">{order.cart.length} items &bull; Held at {order.heldAt.toLocaleTimeString()}</p>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => onRetrieve(order.id)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-1 px-3 rounded-md text-sm">Retrieve</button>
                                    <button onClick={() => onDelete(order.id)} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold py-1 px-3 rounded-md text-sm">Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const AddCustomerModal: React.FC<{
    onClose: () => void;
    onCustomerAdded: (customer: Customer) => void;
}> = ({ onClose, onCustomerAdded }) => {
    const { addCustomer } = useAppContext();
    const [form, setForm] = useState({ name: '', phone: '', email: ''});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!form.name) {
            alert('Customer name is required.');
            return;
        }
        const newCustomerData = { ...form, creditBalance: 0 };
        addCustomer(newCustomerData);
        onCustomerAdded({ ...newCustomerData, id: `cust-${Date.now()}` });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-slate-700">
                 <h3 className="text-xl font-bold mb-4 text-white">Add New Customer</h3>
                 <div className="space-y-4">
                    <input name="name" placeholder="Full Name (Required)" value={form.name} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-md text-white border border-slate-600" />
                    <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-md text-white border border-slate-600" />
                    <input name="email" placeholder="Email Address" value={form.email} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-md text-white border border-slate-600" />
                 </div>
                 <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 font-semibold">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-cyan-600 font-semibold">Save Customer</button>
                 </div>
            </div>
        </div>
    );
};


const CustomerSearchModal: React.FC<{
    onClose: () => void;
    onSelectCustomer: (customer: {id: string, name: string, phone?: string}) => void;
}> = ({ onClose, onSelectCustomer }) => {
    const { customers } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddCustomerModalOpen, setAddCustomerModalOpen] = useState(false);

    const filteredCustomers = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        if (!lowerSearch) return customers.filter(c => c.id !== 'cust-walkin');
        return customers.filter(c =>
            c.id !== 'cust-walkin' &&
            (c.name.toLowerCase().includes(lowerSearch) || (c.phone && c.phone.includes(lowerSearch)))
        );
    }, [customers, searchTerm]);

    const handleCustomerAdded = (newCustomer: Customer) => {
        onSelectCustomer(newCustomer);
        setAddCustomerModalOpen(false);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                <div className="bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-lg border border-slate-700 max-h-[70vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-xl font-bold text-white">Select Customer</h3>
                         <button onClick={onClose} className="text-slate-400 hover:text-white"><Icon name="x-mark" className="w-6 h-6"/></button>
                    </div>
                    <div className="relative mb-4">
                         <Icon name="search" className="w-5 h-5 text-slate-500 absolute top-1/2 left-3 -translate-y-1/2" />
                         <input type="text" placeholder="Search by name or phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 pl-10"/>
                    </div>
                    <div className="flex-grow overflow-y-auto space-y-2 -mr-2 pr-2">
                        <button onClick={() => onSelectCustomer({ id: 'cust-walkin', name: 'Walk-in Customer' })} className="w-full text-left p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 flex items-center">
                            <Icon name="user" className="w-6 h-6 mr-3 text-slate-400"/>
                            <div>
                                <p className="font-semibold">Walk-in Customer</p>
                            </div>
                        </button>
                        {filteredCustomers.map(c => (
                            <button key={c.id} onClick={() => onSelectCustomer(c)} className="w-full text-left p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 flex items-center">
                               <Icon name="user" className="w-6 h-6 mr-3 text-cyan-400"/>
                               <div>
                                 <p className="font-semibold">{c.name}</p>
                                 <p className="text-sm text-slate-400">{c.phone}</p>
                               </div>
                            </button>
                        ))}
                    </div>
                     <div className="mt-4 pt-4 border-t border-slate-700">
                        <button onClick={() => setAddCustomerModalOpen(true)} className="w-full bg-teal-600 hover:bg-teal-500 font-semibold p-3 rounded-lg flex items-center justify-center">
                            <Icon name="plus" className="w-5 h-5 mr-2" /> Add New Customer
                        </button>
                    </div>
                </div>
            </div>
            {isAddCustomerModalOpen && <AddCustomerModal onClose={() => setAddCustomerModalOpen(false)} onCustomerAdded={handleCustomerAdded} />}
        </>
    );
};


const PointOfSale: React.FC = () => {
  const { products, searchTerm, addSale, branches, categories, addDeposit, customers, deposits, currentStaffUser, staffRoles } = useAppContext();
  const { formatCurrency } = useCurrency();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('All');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [isClearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [deletingHeldOrderId, setDeletingHeldOrderId] = useState<number | null>(null);

  const userPermissions = useMemo(() => {
    if (!currentStaffUser) return new Set<TenantPermission>();
    const role = staffRoles.find(r => r.id === currentStaffUser.roleId);
    return new Set(role?.permissions || []);
  }, [currentStaffUser, staffRoles]);
  const canProcessReturns = userPermissions.has('accessReturns');


  const defaultCustomer = { id: 'cust-walkin', name: 'Walk-in Customer', phone: '' };
  const [customer, setCustomer] = useState(defaultCustomer);
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [isHeldOrdersModalOpen, setHeldOrdersModalOpen] = useState(false);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);

  const [saleStatus, setSaleStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const selectedCustomerId = customer.id;

  const currentBranchId = useMemo(() => branches.length > 0 ? branches[0].id : '', [branches]);

  const customerDepositBalance = useMemo(() => {
    if (!selectedCustomerId || selectedCustomerId === 'cust-walkin') return 0;
    return deposits.reduce((total, deposit) => {
        if (deposit.customerId === selectedCustomerId && deposit.status === 'ACTIVE') {
            return total + deposit.amount;
        }
        return total;
    }, 0);
  }, [selectedCustomerId, deposits]);

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

  useEffect(() => {
    if (cart.length === 0) {
        setIsReturnMode(false);
    }
  }, [cart]);


  const handleAddToCart = useCallback((product: Product, variant: ProductVariant) => {
    setCart(prevCart => {
        const quantityChange = isReturnMode ? -1 : 1;

        if (prevCart.length > 0 && Math.sign(prevCart[0].quantity) !== Math.sign(quantityChange)) {
            setSaleStatus({ message: 'Cannot mix sales and returns in the same transaction.', type: 'error' });
            return prevCart;
        }
        
        const existingItem = prevCart.find(item => item.variantId === variant.id);
        
        // Stock Check (only for sales, not returns)
        if (!isReturnMode) {
            const availableStock = (variant.stockByBranch[currentBranchId] || 0) + (variant.consignmentStockByBranch?.[currentBranchId] || 0);
            const currentCartQty = existingItem ? existingItem.quantity : 0;
            if (currentCartQty + 1 > availableStock) {
                setSaleStatus({ message: `Cannot add more ${product.name} (${variant.name}). Only ${availableStock} in stock.`, type: 'error' });
                return prevCart;
            }
        }

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantityChange;
            if (newQuantity === 0) {
                return prevCart.filter(item => item.variantId !== variant.id);
            }
            return prevCart.map(item =>
                item.variantId === variant.id ? { ...item, quantity: newQuantity } : item
            );
        }
        
        return [...prevCart, { 
            productId: product.id, 
            variantId: variant.id, 
            name: product.name,
            variantName: variant.name,
            quantity: quantityChange, 
            sellingPrice: variant.sellingPrice,
            costPrice: variant.costPrice,
            batchNumber: variant.batchNumber,
            expiryDate: variant.expiryDate,
        }];
    });
  }, [isReturnMode, currentBranchId, setSaleStatus]);

  const handleUpdateQuantity = useCallback((variantId: string, delta: number) => {
    setCart(prevCart => {
      const itemToUpdate = prevCart.find(item => item.variantId === variantId);
      if (!itemToUpdate) return prevCart;

      const newQuantity = itemToUpdate.quantity + delta;
      
      // Stock Check for increasing quantity in sale mode
      if (!isReturnMode && delta > 0) {
        const product = products.find(p => p.id === itemToUpdate.productId);
        const variant = product?.variants.find(v => v.id === variantId);
        if (product && variant) {
            const availableStock = (variant.stockByBranch[currentBranchId] || 0) + (variant.consignmentStockByBranch?.[currentBranchId] || 0);
            if (newQuantity > availableStock) {
                setSaleStatus({ message: `Cannot add more ${product.name} (${variant.name}). Only ${availableStock} in stock.`, type: 'error' });
                return prevCart;
            }
        }
      }

      if (newQuantity === 0) {
        return prevCart.filter(item => item.variantId !== variantId);
      }
      
      return prevCart.map(item =>
        item.variantId === variantId ? { ...item, quantity: newQuantity } : item
      );
    });
  }, [isReturnMode, products, currentBranchId, setSaleStatus]);

  const categoryOptions = useMemo(() => [{ id: 'All', name: 'All Categories' }, ...categories], [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategoryId === 'All' || product.categoryId === selectedCategoryId;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorites = !showFavorites || product.isFavorite;
      return matchesCategory && matchesSearch && matchesFavorites;
    });
  }, [products, searchTerm, selectedCategoryId, showFavorites]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0), [cart]);
  const tax = subtotal * 0.08;
  const total = subtotal + tax - discount;
  const isRefund = total < 0;

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
    setIsReturnMode(false);
  }, []);

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    const newHeldOrder: HeldOrder = {
      id: Date.now(),
      cart,
      customer: { ...customer, phone: customer.phone || '' },
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
      // FIX: Ensure customer object matches state type by providing a fallback for optional phone property.
      setCustomer({ ...orderToRetrieve.customer, phone: orderToRetrieve.customer.phone || '' });
      setDiscount(orderToRetrieve.discount);
      if (orderToRetrieve.cart.length > 0 && orderToRetrieve.cart[0].quantity < 0) {
        setIsReturnMode(true);
      } else {
        setIsReturnMode(false);
      }
      setHeldOrders(prev => prev.filter(o => o.id !== id));
      setSaleStatus({ message: 'Held order retrieved.', type: 'success' });
      setHeldOrdersModalOpen(false);
    }
  };

  const handleDeleteHeldOrder = (id: number) => {
    setHeldOrders(prev => prev.filter(o => o.id !== id));
  };
  
  const handleConfirmPayment = async (payments: Payment[], change: number) => {
    const saleData = {
        items: cart,
        total,
        branchId: branches[0].id,
        customerId: selectedCustomerId,
        payments,
        change,
        staffId: currentStaffUser?.id || 'staff-unknown',
        discount,
    };

    const { success, message, newSale } = await addSale(saleData);
    
    setSaleStatus({ message, type: success ? 'success' : 'error' });
    
    if (success && newSale) {
        setPaymentModalOpen(false);
        setLastCompletedSale(newSale);
        setInvoiceModalOpen(true);
        clearOrder();
    }
  };
  
  const handleRecordDeposit = async (amount: number, notes: string) => {
      if (!selectedCustomerId || selectedCustomerId === 'cust-walkin') {
          setSaleStatus({ message: 'Cannot record deposit for a walk-in customer.', type: 'error' });
          return;
      }
      
      const depositData = {
          customerId: selectedCustomerId,
          amount,
          staffId: currentStaffUser?.id || 'staff-unknown',
          branchId: branches[0].id,
          notes,
      };

      const { success, message } = await addDeposit(depositData);
      setSaleStatus({ message, type: success ? 'success' : 'error' });
      if (success) {
          setDepositModalOpen(false);
      }
  };

  const handleSelectCustomer = (selected: {id: string; name: string, phone?: string}) => {
    // FIX: Ensure customer object matches state type by providing a fallback for optional phone property.
    setCustomer({ ...selected, phone: selected.phone || '' });
    setIsCustomerSearchOpen(false);
  };

  return (
    <div className="flex h-full -m-4 sm:-m-6 lg:-m-8">
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {/* ... Product grid section ... */}
            <section className="lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                    <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1.5">
                        <button onClick={() => setShowFavorites(false)} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${!showFavorites ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}>All Products</button>
                        <button onClick={() => setShowFavorites(true)} className={`flex items-center px-3 py-1.5 rounded-md text-sm font-semibold ${showFavorites ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}><Icon name="star" className="w-4 h-4 mr-2 text-yellow-400"/>Favorites</button>
                    </div>
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 max-w-xs"
                    >
                        {categoryOptions.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                 <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                    ))}
                </div>
            </section>
            
            {/* ... Cart section ... */}
            <aside className="lg:col-span-1 bg-slate-900/70 backdrop-blur-xl border-l border-slate-800 flex flex-col h-full rounded-r-lg">
                <div className="p-4 border-b border-slate-800">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <Icon name="user" className="w-6 h-6 mr-3 text-slate-400" />
                            <span className="font-semibold text-lg truncate">{customer.name}</span>
                        </div>
                        <button onClick={() => setIsCustomerSearchOpen(true)} className="text-sm text-cyan-400 hover:text-cyan-300 flex-shrink-0 ml-2">
                            {customer.id === 'cust-walkin' ? 'Select Customer' : 'Change'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="text-center text-slate-500 py-16">
                           <Icon name={isReturnMode ? 'minus' : 'pos'} className="w-16 h-16 mx-auto mb-2"/>
                           <p>{isReturnMode ? 'Select items to return.' : 'Your cart is empty.'}</p>
                        </div>
                    ) : (
                        cart.map(item => {
                            const product = products.find(p => p.id === item.productId);
                            const variant = product?.variants.find(v => v.id === item.variantId);
                            const availableStock = variant ? (variant.stockByBranch[currentBranchId] || 0) + (variant.consignmentStockByBranch?.[currentBranchId] || 0) : 0;

                            return (
                             <div key={item.variantId} className="flex items-center bg-slate-800/50 p-2 rounded-lg">
                                <img src={`https://picsum.photos/seed/${item.productId}/100`} alt={item.name} className="w-12 h-12 rounded-md mr-3 object-cover"/>
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm">{item.name} <span className="text-xs text-slate-400">({item.variantName})</span></p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-cyan-400 text-xs">{formatCurrency(item.sellingPrice)}</p>
                                        <p className="text-slate-500 text-xs">(Stock: {availableStock})</p>
                                    </div>
                                    {(item.batchNumber || item.expiryDate) && (
                                        <div className="text-xs text-slate-500 mt-1">
                                            {item.batchNumber && <span className="font-mono">Batch: {item.batchNumber}</span>}
                                            {item.batchNumber && item.expiryDate && <span> &bull; </span>}
                                            {item.expiryDate && <span>Expires: {item.expiryDate}</span>}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleUpdateQuantity(item.variantId, -1)} className="bg-slate-700 rounded-full p-1 w-6 h-6 flex items-center justify-center"><Icon name="minus" className="w-4 h-4"/></button>
                                    <span className="font-bold w-4 text-center">{Math.abs(item.quantity)}</span>
                                    <button onClick={() => handleUpdateQuantity(item.variantId, 1)} className="bg-slate-700 rounded-full p-1 w-6 h-6 flex items-center justify-center"><Icon name="plus" className="w-4 h-4"/></button>
                                </div>
                            </div>
                        )})
                    )}
                </div>

                <div className="p-4 border-t border-slate-800 space-y-3">
                     <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                     <div className="flex justify-between text-sm"><span className="text-slate-400">Tax (8%)</span><span>{formatCurrency(tax)}</span></div>
                     <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Discount</span><input type="number" value={discount} onChange={handleDiscountChange} className="w-24 bg-slate-700 p-1 rounded-md text-right border border-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"/></div>
                     <div className="flex justify-between font-bold text-2xl border-t border-slate-700 pt-3"><span className="text-white">Total</span><span className={isRefund ? 'text-red-400' : 'text-cyan-400'}>{formatCurrency(total)}</span></div>

                     <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setClearConfirmOpen(true)} className="bg-slate-700 hover:bg-slate-600 font-semibold py-2 px-4 rounded-md">Clear</button>
                        {canProcessReturns ? (
                            <button onClick={() => setIsReturnMode(!isReturnMode)} className={`${isReturnMode ? 'bg-red-600 hover:bg-red-500 ring-2 ring-white/70' : 'bg-slate-700 hover:bg-slate-600'} font-semibold py-2 px-4 rounded-md transition-colors`}>
                                Return Mode
                            </button>
                        ) : <div />}
                        <button onClick={handleHoldOrder} className="bg-slate-700 hover:bg-slate-600 font-semibold py-2 px-4 rounded-md">Hold</button>
                        <button onClick={() => setHeldOrdersModalOpen(true)} className="relative bg-slate-700 hover:bg-slate-600 font-semibold py-2 px-4 rounded-md">
                            Held Orders
                            {heldOrders.length > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-cyan-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{heldOrders.length}</span>
                            )}
                        </button>
                        
                        <button onClick={() => setPaymentModalOpen(true)} disabled={cart.length === 0} className={`w-full font-bold py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed col-span-2 ${isRefund ? 'bg-red-600 hover:bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600'}`}>
                            {isRefund ? `Process Refund ${formatCurrency(Math.abs(total))}` : 'Pay'}
                        </button>
                        <button onClick={() => setDepositModalOpen(true)} className="bg-slate-700 hover:bg-slate-600 font-semibold py-2 px-4 rounded-md col-span-2">Record Deposit</button>
                     </div>
                </div>

            </aside>
        </main>
        {isPaymentModalOpen && <PaymentModal 
            totalDue={total} 
            onClose={() => setPaymentModalOpen(false)} 
            onConfirm={handleConfirmPayment}
            customerDepositBalance={customerDepositBalance}
        />}
        {isInvoiceModalOpen && lastCompletedSale && <InvoiceModal sale={lastCompletedSale} onClose={() => setInvoiceModalOpen(false)} />}
        {isDepositModalOpen && <DepositModal customerName={customer.name} onClose={() => setDepositModalOpen(false)} onConfirm={handleRecordDeposit} />}
        {isHeldOrdersModalOpen && <HeldOrdersModal heldOrders={heldOrders} onClose={() => setHeldOrdersModalOpen(false)} onRetrieve={handleRetrieveOrder} onDelete={(id) => setDeletingHeldOrderId(id)} />}
        {isCustomerSearchOpen && <CustomerSearchModal onClose={() => setIsCustomerSearchOpen(false)} onSelectCustomer={handleSelectCustomer} />}
        
        <ConfirmationModal
            isOpen={isClearConfirmOpen}
            onClose={() => setClearConfirmOpen(false)}
            onConfirm={clearOrder}
            title="Clear Current Order"
            confirmText="Clear Order"
        >
            Are you sure you want to clear the current order? All items in the cart will be removed.
        </ConfirmationModal>

        <ConfirmationModal
            isOpen={deletingHeldOrderId !== null}
            onClose={() => setDeletingHeldOrderId(null)}
            onConfirm={() => {
                if (deletingHeldOrderId) {
                    handleDeleteHeldOrder(deletingHeldOrderId);
                }
            }}
            title="Delete Held Order"
            confirmText="Delete"
        >
            Are you sure you want to delete this held order? This action cannot be undone.
        </ConfirmationModal>
    </div>
  );
};

export default PointOfSale;