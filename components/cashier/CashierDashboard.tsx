import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Icon from '../icons';
import { useCurrency } from '../../hooks/useCurrency';
import { Sale, Deposit, Customer, ProductVariant, CartItem } from '../../types';
import DashboardDetailModal from './DashboardDetailModal';
import InvoiceModal from '../InvoiceModal';

interface MetricCardProps {
    title: string;
    value: string | number;
    iconName: string;
    iconBgColor: string;
    onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, iconName, iconBgColor, onClick }) => (
  <button onClick={onClick} disabled={!onClick} className="p-4 bg-slate-800 rounded-lg shadow-lg flex items-center border border-slate-700 w-full text-left hover:bg-slate-700/50 transition-colors disabled:hover:bg-slate-800 disabled:cursor-default">
    <div className={`p-3 rounded-full ${iconBgColor} mr-4`}>
      <Icon name={iconName} className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </button>
);

// Define more specific types for modal data
type ProductInfo = ProductVariant & { productName: string; stock: number; };
type SoldItemInfo = CartItem & { saleDate: Date };

const CashierDashboard: React.FC = () => {
    const { sales, deposits, products, customers, currentStaffUser } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [modalState, setModalState] = useState<{ title: string; data: any[], type: 'sale' | 'deposit' | 'customer' | 'product' | 'sold_item' } | null>(null);
    const [reprintSale, setReprintSale] = useState<Sale | null>(null);

    const cashierSales = useMemo(() => {
        if (!currentStaffUser) return [];
        return sales.filter(sale => sale.staffId === currentStaffUser.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, currentStaffUser]);

    const branchDeposits = useMemo(() => {
        if (!currentStaffUser) return [];
        return deposits.filter(deposit => deposit.branchId === currentStaffUser.branchId);
    }, [deposits, currentStaffUser]);
    
    const branchCreditSales = useMemo(() => {
        if (!currentStaffUser) return [];
        return sales.filter(s => s.branchId === currentStaffUser.branchId && s.amountDue > 0);
    }, [sales, currentStaffUser]);

    const { branchProductsData, totalProductsInBranch, remainingStock } = useMemo(() => {
        if (!currentStaffUser) return { branchProductsData: [], totalProductsInBranch: 0, remainingStock: 0 };
        const branchId = currentStaffUser.branchId;
        const data: ProductInfo[] = [];
        let remaining = 0;

        products.forEach(p => {
            p.variants.forEach(v => {
                const stockInBranch = (v.stockByBranch[branchId] || 0) + (v.consignmentStockByBranch?.[branchId] || 0);
                if (stockInBranch > 0) {
                    data.push({ ...v, productName: p.name, stock: stockInBranch });
                    remaining += stockInBranch;
                }
            });
        });
        return { branchProductsData: data, totalProductsInBranch: data.length, remainingStock: remaining };
    }, [products, currentStaffUser]);

    const soldItemsData = useMemo(() => {
        return cashierSales.flatMap(s => s.items.map(item => ({ ...item, saleDate: s.date })));
    }, [cashierSales]);

    const totalSoldCount = useMemo(() => soldItemsData.reduce((sum, item) => sum + item.quantity, 0), [soldItemsData]);
    
    const metrics = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        weekStart.setHours(0,0,0,0);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);

        const salesToday = cashierSales.filter(s => new Date(s.date) >= todayStart);
        const salesThisWeek = cashierSales.filter(s => new Date(s.date) >= weekStart);
        const salesThisMonth = cashierSales.filter(s => new Date(s.date) >= monthStart);
        const salesThisYear = cashierSales.filter(s => new Date(s.date) >= yearStart);
        
        return {
            today: { data: salesToday, total: salesToday.reduce((sum, s) => sum + s.total, 0) },
            week: { data: salesThisWeek, total: salesThisWeek.reduce((sum, s) => sum + s.total, 0) },
            month: { data: salesThisMonth, total: salesThisMonth.reduce((sum, s) => sum + s.total, 0) },
            year: { data: salesThisYear, total: salesThisYear.reduce((sum, s) => sum + s.total, 0) },
            deposits: { data: branchDeposits, total: branchDeposits.reduce((sum, d) => sum + d.amount, 0) },
            credit: { data: branchCreditSales, total: branchCreditSales.reduce((sum, s) => sum + s.amountDue, 0) },
            totalCustomers: { data: customers, total: customers.length }
        };
    }, [cashierSales, branchDeposits, branchCreditSales, customers]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <MetricCard title="Today's Sales" value={formatCurrency(metrics.today.total)} iconName="cash" iconBgColor="bg-green-500" onClick={() => setModalState({ title: "Today's Sales", data: metrics.today.data, type: 'sale' })} />
                <MetricCard title="This Week's Sales" value={formatCurrency(metrics.week.total)} iconName="calendar" iconBgColor="bg-sky-500" onClick={() => setModalState({ title: "This Week's Sales", data: metrics.week.data, type: 'sale' })} />
                <MetricCard title="This Month's Sales" value={formatCurrency(metrics.month.total)} iconName="calendar" iconBgColor="bg-blue-500" onClick={() => setModalState({ title: "This Month's Sales", data: metrics.month.data, type: 'sale' })} />
                <MetricCard title="This Year's Sales" value={formatCurrency(metrics.year.total)} iconName="calendar" iconBgColor="bg-indigo-500" onClick={() => setModalState({ title: "This Year's Sales", data: metrics.year.data, type: 'sale' })} />
                <MetricCard title="Total Deposits" value={formatCurrency(metrics.deposits.total)} iconName="cash" iconBgColor="bg-teal-500" onClick={() => setModalState({ title: "Branch Deposits", data: metrics.deposits.data, type: 'deposit' })} />
                <MetricCard title="Total Credit" value={formatCurrency(metrics.credit.total)} iconName="credit-card" iconBgColor="bg-red-500" onClick={() => setModalState({ title: "Branch Credit Sales", data: metrics.credit.data, type: 'sale' })} />
                <MetricCard title="Products in Branch" value={totalProductsInBranch} iconName="inventory" iconBgColor="bg-purple-500" onClick={() => setModalState({ title: 'Products in Branch', data: branchProductsData, type: 'product' })} />
                <MetricCard title="Products Sold (You)" value={totalSoldCount} iconName="pos" iconBgColor="bg-amber-500" onClick={() => setModalState({ title: 'Products You Sold', data: soldItemsData, type: 'sold_item' })} />
                <MetricCard title="Remaining Products" value={remainingStock} iconName="inventory" iconBgColor="bg-orange-500" onClick={() => setModalState({ title: 'Remaining Products in Branch', data: branchProductsData, type: 'product' })} />
                <MetricCard title="Total Customers" value={metrics.totalCustomers.total} iconName="users" iconBgColor="bg-pink-500" onClick={() => setModalState({ title: "All Customers", data: metrics.totalCustomers.data, type: 'customer' })} />
            </div>

             <div className="p-4 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                <h3 className="mb-4 text-lg font-semibold text-white">Your Recent Sales</h3>
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-700 text-xs text-slate-400 uppercase">
                    <tr>
                        <th className="p-3">Sale ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-right">Total</th>
                        <th className="p-3 text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {cashierSales.slice(0, 5).map((sale: Sale) => (
                        <tr key={sale.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="p-3 whitespace-nowrap font-mono text-slate-400 text-sm">{sale.id.split('-')[0]}...</td>
                            <td className="p-3 whitespace-nowrap">{customers.find(c => c.id === sale.customerId)?.name || 'N/A'}</td>
                            <td className="p-3 whitespace-nowrap">{sale.date.toLocaleDateString()}</td>
                            <td className="p-3 whitespace-nowrap text-right font-medium text-cyan-400">{formatCurrency(sale.total)}</td>
                            <td className="p-3 text-center">
                                <button onClick={() => setReprintSale(sale)} className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">Reprint Invoice</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>

            {modalState && (
                <DashboardDetailModal
                    title={modalState.title}
                    data={modalState.data}
                    type={modalState.type}
                    onClose={() => setModalState(null)}
                    onReprint={setReprintSale}
                />
            )}
            {reprintSale && <InvoiceModal sale={reprintSale} onClose={() => setReprintSale(null)} />}
        </div>
    );
};

export default CashierDashboard;