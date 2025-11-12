import React from 'react';
import { Sale } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { useCurrency } from '../hooks/useCurrency';
import Icon from './icons';

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

export default InvoiceModal;
