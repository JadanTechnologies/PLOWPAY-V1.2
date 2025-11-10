import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './icons/index.tsx';
import { Sale } from '../types';
import { useCurrency } from '../hooks/useCurrency';
import { useTranslation } from '../hooks/useTranslation';
import AIInsights from './AIInsights';
import GoogleMap from './GoogleMap';

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
            {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex items-center border border-slate-200 dark:border-slate-700">
                    <Skeleton className="h-12 w-12 rounded-full mr-4" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                </div>
            ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-[300px] w-full" />
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        </div>
        
        {/* Recent Sales Table Skeleton */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <Skeleton className="h-6 w-1/4 mb-4" />
            <div className="space-y-4 mt-4">
                {/* Header */}
                <div className="flex space-x-4 px-3">
                    <Skeleton className="h-4 w-1/6" />
                    <Skeleton className="h-4 w-1/6" />
                    <Skeleton className="h-4 w-1/6" />
                    <Skeleton className="h-4 w-1/6" />
                    <Skeleton className="h-4 w-1/6" />
                </div>
                {/* Rows */}
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex space-x-4 p-3 border-t border-slate-200 dark:border-slate-700">
                        <Skeleton className="h-5 w-1/6" />
                        <Skeleton className="h-5 w-1/6" />
                        <Skeleton className="h-5 w-1/6" />
                        <Skeleton className="h-5 w-1/6" />
                        <Skeleton className="h-5 w-1/6" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);


const MetricCard: React.FC<{ title: string; value: string; iconName: string; iconBgColor: string }> = ({ title, value, iconName, iconBgColor }) => (
  <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex items-center border border-slate-200 dark:border-slate-700">
    <div className={`p-3 rounded-full ${iconBgColor} mr-4`}>
      <Icon name={iconName} className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { sales, getMetric, branches, customers, staff, isLoading } = useAppContext();
  const { formatCurrency } = useCurrency();
  const { t } = useTranslation();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const totalRevenue = getMetric('totalRevenue');
  const salesVolume = getMetric('salesVolume');
  const newCustomers = getMetric('newCustomers');
  const activeBranches = getMetric('activeBranches');
  
  const salesData = sales.slice(0, 10).map(s => ({ name: s.date.toLocaleDateString(), sales: s.total })).reverse();
  const branchData = [
    { name: 'Downtown', performance: 4000 },
    { name: 'Uptown', performance: 3000 },
    { name: 'Westside', performance: 2000 },
    { name: 'Eastside', performance: 2780 },
  ];

  return (
    <div className="space-y-6">
      <AIInsights />
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title={t('totalRevenue')} value={formatCurrency(totalRevenue)} iconName="cash" iconBgColor="bg-gradient-to-br from-teal-500 to-cyan-600" />
        <MetricCard title="Sales Volume" value={salesVolume.toLocaleString()} iconName="pos" iconBgColor="bg-gradient-to-br from-green-500 to-emerald-600" />
        <MetricCard title="New Customers" value={newCustomers.toLocaleString()} iconName="user" iconBgColor="bg-gradient-to-br from-amber-500 to-orange-600" />
        <MetricCard title="Active Branches" value={activeBranches.toString()} iconName="briefcase" iconBgColor="bg-gradient-to-br from-purple-500 to-indigo-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Sales Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="name" stroke="#64748b" className="dark:stroke-slate-400" />
              <YAxis stroke="#64748b" className="dark:stroke-slate-400" tickFormatter={(value) => formatCurrency(Number(value))} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }} wrapperClassName="dark:!bg-slate-900 dark:!border-slate-700" formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#22d3ee" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Branch Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="name" stroke="#64748b" className="dark:stroke-slate-400" />
              <YAxis stroke="#64748b" className="dark:stroke-slate-400" tickFormatter={(value) => formatCurrency(Number(value))} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }} wrapperClassName="dark:!bg-slate-900 dark:!border-slate-700" formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="performance" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
                  <GoogleMap users={staff} branches={branches} />
              )}
          </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 w-12"></th>
                <th className="p-3 text-sm font-semibold tracking-wide">Sale ID</th>
                <th className="p-3 text-sm font-semibold tracking-wide">Customer</th>
                <th className="p-3 text-sm font-semibold tracking-wide">Cashier</th>
                <th className="p-3 text-sm font-semibold tracking-wide">Branch</th>
                <th className="p-3 text-sm font-semibold tracking-wide">Date</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 5).map((sale: Sale) => (
                <React.Fragment key={sale.id}>
                  <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer" onClick={() => toggleRow(sale.id)}>
                    <td className="p-3"><button><Icon name={expandedRows.has(sale.id) ? 'chevronDown' : 'chevronRight'} className="w-5 h-5"/></button></td>
                    <td className="p-3 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400 text-sm">{sale.id.split('-')[0]}...</td>
                    <td className="p-3 whitespace-nowrap">{customers.find(c => c.id === sale.customerId)?.name || 'N/A'}</td>
                    <td className="p-3 whitespace-nowrap">{staff.find(s => s.id === sale.staffId)?.name || 'N/A'}</td>
                    <td className="p-3 whitespace-nowrap">{branches.find(b => b.id === sale.branchId)?.name}</td>
                    <td className="p-3 whitespace-nowrap">{sale.date.toLocaleDateString()}</td>
                    <td className="p-3 whitespace-nowrap text-right font-medium text-cyan-600 dark:text-cyan-400">{formatCurrency(sale.total)}</td>
                  </tr>
                  {expandedRows.has(sale.id) && (
                     <tr className="bg-slate-100 dark:bg-slate-900/50">
                        <td colSpan={7} className="p-4">
                            <div className="p-3 bg-slate-200/50 dark:bg-slate-700/50 rounded-md">
                                <h4 className="font-semibold text-sm mb-2 text-slate-900 dark:text-white">Items in this Sale</h4>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-300 dark:border-slate-600">
                                            <th className="p-1 text-left">Item Name</th>
                                            <th className="p-1 text-right">Quantity</th>
                                            <th className="p-1 text-right">Unit Price</th>
                                            <th className="p-1 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sale.items.map(item => (
                                            <tr key={item.variantId}>
                                                <td className="p-1">{item.name} ({item.variantName})</td>
                                                <td className="p-1 text-right">{item.quantity}</td>
                                                <td className="p-1 text-right font-mono">{formatCurrency(item.sellingPrice)}</td>
                                                <td className="p-1 text-right font-mono">{formatCurrency(item.sellingPrice * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;