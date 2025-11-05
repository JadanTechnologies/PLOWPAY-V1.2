
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './icons';
import { Sale } from '../types';

const MetricCard: React.FC<{ title: string; value: string; iconName: string; iconBgColor: string }> = ({ title, value, iconName, iconBgColor }) => (
  <div className="p-4 bg-gray-800 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full ${iconBgColor} mr-4`}>
      <Icon name={iconName} className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  // FIX: Destructure `branches` from context to look up branch names.
  const { sales, getMetric, branches } = useAppContext();

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
        <MetricCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} iconName="dashboard" iconBgColor="bg-blue-500" />
        <MetricCard title="Sales Volume" value={salesVolume.toLocaleString()} iconName="pos" iconBgColor="bg-green-500" />
        <MetricCard title="New Customers" value={newCustomers.toLocaleString()} iconName="user" iconBgColor="bg-yellow-500" />
        <MetricCard title="Active Branches" value={activeBranches.toString()} iconName="inventory" iconBgColor="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-4 bg-gray-800 rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-white">Sales Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-white">Branch Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
              <Bar dataKey="performance" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 bg-gray-800 rounded-lg shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-white">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
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
                <tr key={sale.id} className={`border-b border-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}`}>
                  <td className="p-3 whitespace-nowrap">{sale.id}</td>
                  <td className="p-3 whitespace-nowrap">{sale.customer.name}</td>
                  {/* FIX: Use `branchId` to find and display the branch name. */}
                  <td className="p-3 whitespace-nowrap">{branches.find(b => b.id === sale.branchId)?.name}</td>
                  <td className="p-3 whitespace-nowrap">{sale.date.toLocaleDateString()}</td>
                  <td className="p-3 whitespace-nowrap text-right font-medium">${sale.total.toFixed(2)}</td>
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