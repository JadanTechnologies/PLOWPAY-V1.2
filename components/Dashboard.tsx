
import React, { useState, useMemo } from 'react';
import { ResponsiveContainer } from 'recharts';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './icons/index.tsx';
import { Sale, Staff, Product, ProductVariant } from '../types';
import { useCurrency } from '../hooks/useCurrency';
import { useTranslation } from '../hooks/useTranslation';
import AIInsights from './AIInsights';
import MapComponent from './GoogleMap';
import { Page } from '../App';

interface DashboardProps {
    onNavigate?: (page: Page) => void;
}

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

const DashboardSkeleton = () => (
    <div className="space-y-6">
        {/* AI Insights Skeleton */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <Skeleton className="h-6 w-2/5" />
                <Skeleton className="h-10 w-44 rounded-md" />
            </div>
            <Skeleton className="h-24 w-full" />
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex items-center border border-slate-200 dark:border-slate-700">
                    <Skeleton className="h-12 w-12 rounded-full mr-4" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);


const MetricCard: React.FC<{ title: string; value: string | number; iconName: string; iconBgColor: string; onClick?: () => void; }> = ({ title, value, iconName, iconBgColor, onClick }) => (
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

type ModalDataType = Sale | Staff | (ProductVariant & { productName: string, stock: number });
const DashboardDetailModal: React.FC<{ title: string; data: ModalDataType[]; type: string; onClose: () => void; onReturn?: (sale: Sale) => void; }> = ({ title, data, type, onClose, onReturn }) => {
    const { formatCurrency } = useCurrency();
    const { customers, branches, staff } = useAppContext();
    
    const renderContent = () => {
        if (data.length === 0) {
            return <p className="text-center text-slate-500 py-16">No data available.</p>
        }

        switch (type) {
            case 'sales':
                return (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-600"><tr><th className="p-2">Date</th><th className="p-2">Customer</th><th className="p-2">Branch</th><th className="p-2 text-right">Total</th>{onReturn && <th className="p-2 text-center">Actions</th>}</tr></thead>
                        <tbody>
                            {(data as Sale[]).map(sale => (
                                <tr key={sale.id} className="border-b border-slate-700/50">
                                    <td className="p-2">{new Date(sale.date).toLocaleString()}</td>
                                    <td className="p-2">{customers.find(c => c.id === sale.customerId)?.name}</td>
                                    <td className="p-2">{branches.find(b => b.id === sale.branchId)?.name}</td>
                                    <td className="p-2 text-right font-mono">{formatCurrency(sale.total)}</td>
                                    {onReturn && (
                                        <td className="p-2 text-center">
                                            <button onClick={() => onReturn(sale)} className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded hover:bg-red-600/30">Return</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'credit_sales':
                 return (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-600"><tr><th className="p-2">Date</th><th className="p-2">Customer</th><th className="p-2 text-right">Total</th><th className="p-2 text-right">Amount Due</th></tr></thead>
                        <tbody>
                            {(data as Sale[]).map(sale => (
                                <tr key={sale.id} className="border-b border-slate-700/50">
                                    <td className="p-2">{new Date(sale.date).toLocaleString()}</td>
                                    <td className="p-2">{customers.find(c => c.id === sale.customerId)?.name}</td>
                                    <td className="p-2 text-right font-mono">{formatCurrency(sale.total)}</td>
                                    <td className="p-2 text-right font-mono text-red-400">{formatCurrency(sale.amountDue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'staff':
                 return (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-600"><tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Branch</th></tr></thead>
                        <tbody>
                            {(data as Staff[]).map(s => (
                                <tr key={s.id} className="border-b border-slate-700/50">
                                    <td className="p-2">{s.name}</td>
                                    <td className="p-2">{s.email}</td>
                                    <td className="p-2">{branches.find(b => b.id === s.branchId)?.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'low_stock':
            case 'expired':
                return (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-600"><tr><th className="p-2">Product</th><th className="p-2">SKU</th>{type==='expired' && <th className="p-2">Expiry Date</th>}<th className="p-2 text-right">Stock</th><th className="p-2 text-right">Reorder Pt.</th></tr></thead>
                        <tbody>
                            {(data as (ProductVariant & { productName: string, stock: number })[]).map(item => (
                                <tr key={item.id} className="border-b border-slate-700/50">
                                    <td className="p-2">{item.productName} ({item.name})</td>
                                    <td className="p-2 font-mono">{item.sku}</td>
                                    {type==='expired' && <td className="p-2 text-red-400">{item.expiryDate}</td>}
                                    <td className="p-2 text-right font-bold text-orange-400">{item.stock}</td>
                                    <td className="p-2 text-right">{item.reorderPointByBranch?.[Object.keys(item.reorderPointByBranch)[0]] || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><Icon name="x-mark" className="w-6 h-6"/></button>
                </div>
                <div className="flex-grow overflow-y-auto p-4">
                    {renderContent()}
                </div>
                 <div className="p-4 bg-slate-900/50 rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 font-semibold">Close</button>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { sales, branches, customers, staff, isLoading, products, deposits, setSaleToReturn } = useAppContext();
  const { formatCurrency } = useCurrency();
  const { t } = useTranslation();
  const [modalState, setModalState] = useState<{ title: string; data: any[]; type: string } | null>(null);

  const metrics = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - now.getDay());
    weekStart.setHours(0,0,0,0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const salesToday = sales.filter(s => new Date(s.date) >= todayStart);
    const salesThisWeek = sales.filter(s => new Date(s.date) >= weekStart);
    const salesThisMonth = sales.filter(s => new Date(s.date) >= monthStart);
    const salesThisYear = sales.filter(s => new Date(s.date) >= yearStart);
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

    const creditSales = sales.filter(s => s.amountDue > 0);
    const totalCredit = creditSales.reduce((sum, s) => sum + s.amountDue, 0);

    const depositPayments = sales.flatMap(s => s.payments.filter(p => p.method === 'Deposit'));
    const totalDepositSalesValue = depositPayments.reduce((sum, p) => sum + p.amount, 0);
    const depositSales = sales.filter(s => s.payments.some(p => p.method === 'Deposit'));

    const lowStockProducts: (ProductVariant & { productName: string, stock: number })[] = [];
    products.forEach(p => p.variants.forEach(v => {
        Object.entries(v.stockByBranch).forEach(([branchId, stock]) => {
            if(stock <= (v.reorderPointByBranch?.[branchId] || 0)) {
                if(!lowStockProducts.some(lsp => lsp.id === v.id)){
                    lowStockProducts.push({...v, productName: p.name, stock });
                }
            }
        });
    }));

    const todayString = todayStart.toISOString().split('T')[0];
    const expiredToday: (ProductVariant & { productName: string, stock: number })[] = [];
    const expiredTotal: (ProductVariant & { productName: string, stock: number })[] = [];
    products.forEach(p => p.variants.forEach(v => {
        if(v.expiryDate) {
            const expiry = new Date(v.expiryDate);
            if(expiry < todayStart) { // Changed to less than to include all past dates
                const stock = Object.values(v.stockByBranch).reduce((s, q) => s + q, 0);
                if(stock > 0) { // Only count if there's stock
                    expiredTotal.push({...v, productName: p.name, stock});
                    if(v.expiryDate === todayString) {
                        expiredToday.push({...v, productName: p.name, stock});
                    }
                }
            }
        }
    }));
    
    return {
      salesToday: { data: salesToday, total: salesToday.reduce((sum, s) => sum + s.total, 0) },
      salesThisWeek: { data: salesThisWeek, total: salesThisWeek.reduce((sum, s) => sum + s.total, 0) },
      salesThisMonth: { data: salesThisMonth, total: salesThisMonth.reduce((sum, s) => sum + s.total, 0) },
      salesThisYear: { data: salesThisYear, total: salesThisYear.reduce((sum, s) => sum + s.total, 0) },
      totalRevenue: { data: sales, total: totalRevenue },
      creditSales: { data: creditSales, total: totalCredit },
      depositSales: { data: depositSales, total: totalDepositSalesValue },
      staff: { data: staff, total: staff.length },
      lowStock: { data: lowStockProducts, total: lowStockProducts.length },
      expiredToday: { data: expiredToday, total: expiredToday.length },
      expiredTotal: { data: expiredTotal, total: expiredTotal.length },
    };

  }, [sales, staff, products, deposits]);

  const handleReturn = (sale: Sale) => {
      setSaleToReturn(sale);
      if (onNavigate) {
          onNavigate('POS');
      }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <AIInsights />
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Revenue" value={formatCurrency(metrics.totalRevenue.total)} iconName="cash" iconBgColor="bg-gradient-to-br from-teal-500 to-cyan-600" onClick={() => setModalState({ title: 'All Sales', data: metrics.totalRevenue.data, type: 'sales' })}/>
        <MetricCard title="Today's Sales" value={formatCurrency(metrics.salesToday.total)} iconName="calendar" iconBgColor="bg-green-500" onClick={() => setModalState({ title: "Today's Sales", data: metrics.salesToday.data, type: 'sales' })} />
        <MetricCard title="This Week's Sales" value={formatCurrency(metrics.salesThisWeek.total)} iconName="calendar" iconBgColor="bg-sky-500" onClick={() => setModalState({ title: "This Week's Sales", data: metrics.salesThisWeek.data, type: 'sales' })} />
        <MetricCard title="This Month's Sales" value={formatCurrency(metrics.salesThisMonth.total)} iconName="calendar" iconBgColor="bg-blue-500" onClick={() => setModalState({ title: "This Month's Sales", data: metrics.salesThisMonth.data, type: 'sales' })} />
        <MetricCard title="This Year's Sales" value={formatCurrency(metrics.salesThisYear.total)} iconName="calendar" iconBgColor="bg-indigo-500" onClick={() => setModalState({ title: "This Year's Sales", data: metrics.salesThisYear.data, type: 'sales' })} />
        <MetricCard title="Total Credit Sales" value={formatCurrency(metrics.creditSales.total)} iconName="credit-card" iconBgColor="bg-red-500" onClick={() => setModalState({ title: 'Credit Sales', data: metrics.creditSales.data, type: 'credit_sales' })}/>
        <MetricCard title="Sales via Deposit" value={formatCurrency(metrics.depositSales.total)} iconName="cash" iconBgColor="bg-teal-500" onClick={() => setModalState({ title: 'Sales Paid with Deposit', data: metrics.depositSales.data, type: 'sales' })}/>
        <MetricCard title="Total Staff" value={metrics.staff.total} iconName="users" iconBgColor="bg-pink-500" onClick={() => setModalState({ title: 'All Staff', data: metrics.staff.data, type: 'staff' })} />
        <MetricCard title="Low Stock Products" value={metrics.lowStock.total} iconName="inventory" iconBgColor="bg-orange-500" onClick={() => setModalState({ title: 'Low Stock Products', data: metrics.lowStock.data, type: 'low_stock' })} />
        <MetricCard title="Expired Today" value={metrics.expiredToday.total} iconName="x-mark" iconBgColor="bg-yellow-500" onClick={() => setModalState({ title: 'Products Expired Today', data: metrics.expiredToday.data, type: 'expired' })} />
        <MetricCard title="Total Expired Products" value={metrics.expiredTotal.total} iconName="trash" iconBgColor="bg-rose-500" onClick={() => setModalState({ title: 'All Expired Products', data: metrics.expiredTotal.data, type: 'expired' })} />
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Staff Live Location</h3>
          <div className="h-[400px] bg-slate-900 rounded-md overflow-hidden">
               {typeof window.L === 'undefined' ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Icon name="x-mark" className="w-12 h-12 text-red-500 mb-2" />
                      <h4 className="font-bold text-white">Map Failed to Load</h4>
                      <p className="text-slate-400 text-sm">Please check your internet connection.</p>
                  </div>
              ) : (
                  <MapComponent users={staff} branches={branches} />
              )}
          </div>
      </div>

      {modalState && (
        <DashboardDetailModal 
            title={modalState.title} 
            data={modalState.data} 
            type={modalState.type} 
            onClose={() => setModalState(null)}
            onReturn={handleReturn}
        />
      )}
    </div>
  );
};

export default Dashboard;
