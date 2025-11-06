

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './icons';
import { Sale } from '../types';
import { useCurrency } from '../hooks/useCurrency';
import { useTranslation } from '../hooks/useTranslation';

const MetricCard: React.FC<{ title: string; value: string; iconName: string; iconBgColor: string }> = ({ title, value, iconName, iconBgColor }) => (
  <div className="p-4 bg-slate-800 rounded-lg shadow-lg flex items-center border border-slate-700">
    <div className={`p-3 rounded-full ${iconBgColor} mr-4`}>
      <Icon name={iconName} className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { sales, getMetric, branches, customers } = useAppContext();
  const { formatCurrency } = useCurrency();
  const { t } = useTranslation();

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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title={t('totalRevenue')} value={formatCurrency(totalRevenue)} iconName="cash" iconBgColor="bg-gradient-to-br from-teal-500 to-cyan-600" />
        <MetricCard title="Sales Volume" value={salesVolume.toLocaleString()} iconName="pos" iconBgColor="bg-gradient-to-br from-green-500 to-emerald-600" />
        <MetricCard title="New Customers" value={newCustomers.toLocaleString()} iconName="user" iconBgColor="bg-gradient-to-br from-amber-500 to-orange-600" />
        <MetricCard title="Active Branches" value={activeBranches.toString()} iconName="briefcase" iconBgColor="bg-gradient-to-br from-purple-500 to-indigo-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-4 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
          <h3 className="mb-4 text-lg font-semibold text-white">Sales Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => formatCurrency(Number(value))} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#22d3ee" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="p-4 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
          <h3 className="mb-4 text-lg font-semibold text-white">Branch Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => formatCurrency(Number(value))} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="performance" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
        <h3 className="mb-4 text-lg font-semibold text-white">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-700">
              <tr>
                <th className="p-3 text-sm font-semibold tracking-wide">Sale ID</th>
                <th className="p-3 text-sm font-semibold tracking-wide">Customer</th>
                <th className="p-3 text-sm font-semibold tracking-wide">Branch</th>
                <th className="p-3 text-sm font-semibold tracking-wide">Date</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 5).map((sale: Sale, index: number) => (
                <tr key={sale.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="p-3 whitespace-nowrap font-mono text-slate-400 text-sm">{sale.id.split('-')[0]}...</td>
                  <td className="p-3 whitespace-nowrap">{customers.find(c => c.id === sale.customerId)?.name || 'N/A'}</td>
                  <td className="p-3 whitespace-nowrap">{branches.find(b => b.id === sale.branchId)?.name}</td>
                  <td className="p-3 whitespace-nowrap">{sale.date.toLocaleDateString()}</td>
                  <td className="p-3 whitespace-nowrap text-right font-medium text-cyan-400">{formatCurrency(sale.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;