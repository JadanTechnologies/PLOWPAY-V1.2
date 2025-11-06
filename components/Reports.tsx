
import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Product, Sale } from '../types';

const MetricCard: React.FC<{ title: string; value: string | number; iconName: string; iconBgColor: string }> = ({ title, value, iconName, iconBgColor }) => (
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


const Reports: React.FC = () => {
  const { sales, products, branches } = useAppContext();
  
  const salesMetrics = useMemo(() => {
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
    const totalItemsSold = sales.reduce((acc, sale) => acc + sale.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0), 0);
    const averageSaleValue = sales.length > 0 ? totalRevenue / sales.length : 0;
    
    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalSales: sales.length,
      totalItemsSold,
      averageSaleValue: averageSaleValue.toFixed(2)
    };
  }, [sales]);

  const salesByCategory = useMemo(() => {
    const categoryData: { [key: string]: number } = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          categoryData[product.category] = (categoryData[product.category] || 0) + item.sellingPrice * item.quantity;
        }
      });
    });
    return Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  }, [sales, products]);
  
  const topSellingProducts = useMemo(() => {
    const productData: { [key: string]: { name: string; variantName: string; quantity: number } } = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productData[item.variantId]) {
          productData[item.variantId] = { name: item.name, variantName: item.variantName, quantity: 0 };
        }
        productData[item.variantId].quantity += item.quantity;
      });
    });
    return Object.values(productData).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
  }, [sales]);

  const lowStockItems = useMemo(() => {
      const LOW_STOCK_THRESHOLD = 10;
      return products.flatMap(p => p.variants)
          .map(v => ({
              ...v,
              totalStock: Object.values(v.stockByBranch).reduce((sum, stock) => sum + stock, 0),
              productName: products.find(p => p.variants.some(pv => pv.id === v.id))?.name || 'N/A'
          }))
          .filter(v => v.totalStock <= LOW_STOCK_THRESHOLD)
          .sort((a, b) => a.totalStock - b.totalStock);
  }, [products]);

  const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Revenue" value={`$${salesMetrics.totalRevenue}`} iconName="dashboard" iconBgColor="bg-blue-500" />
            <MetricCard title="Total Sales" value={salesMetrics.totalSales} iconName="pos" iconBgColor="bg-green-500" />
            <MetricCard title="Items Sold" value={salesMetrics.totalItemsSold} iconName="inventory" iconBgColor="bg-orange-500" />
            <MetricCard title="Avg. Sale Value" value={`$${salesMetrics.averageSaleValue}`} iconName="calculator" iconBgColor="bg-purple-500" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 p-4 bg-gray-800 rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-white">Sales by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={salesByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {salesByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} formatter={(value: number) => `$${value.toFixed(2)}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="lg:col-span-3 p-4 bg-gray-800 rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-white">Top Selling Products</h3>
                <div className="overflow-x-auto h-[300px]">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700 sticky top-0 bg-gray-800"><tr><th className="p-3">Product</th><th className="p-3 text-right">Quantity Sold</th></tr></thead>
                        <tbody>
                            {topSellingProducts.map(item => (
                                <tr key={`${item.name}-${item.variantName}`} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-3"><div className="font-medium">{item.name}</div><div className="text-sm text-gray-400">{item.variantName}</div></td>
                                    <td className="p-3 text-right font-bold text-lg">{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-white">Low Stock Report</h3>
             <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700 sticky top-0 bg-gray-800">
                        <tr>
                            <th className="p-3">Product</th>
                            <th className="p-3 text-right">Total Stock</th>
                            {branches.map(b => <th key={b.id} className="p-3 text-right">{b.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {lowStockItems.map(item => (
                            <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-3">
                                    <div className="font-medium">{item.productName}</div>
                                    <div className="text-sm text-gray-400">{item.name}</div>
                                </td>
                                <td className="p-3 text-right font-bold text-red-500">{item.totalStock}</td>
                                {branches.map(b => <td key={b.id} className="p-3 text-right text-gray-300">{item.stockByBranch[b.id] || 0}</td>)}
                            </tr>
                        ))}
                         {lowStockItems.length === 0 && (
                            <tr><td colSpan={2 + branches.length} className="text-center p-6 text-gray-400">No low stock items. Well done!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default Reports;
