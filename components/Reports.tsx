
import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Sale } from '../types';
import { useCurrency } from '../hooks/useCurrency';

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
  const { sales, products, branches, staff, categories, customers } = useAppContext();
  const { formatCurrency } = useCurrency();
  
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return { start, end };
  });
  const [activeFilter, setActiveFilter] = useState('Last Month');

  const setDateFilter = (filter: string) => {
    setActiveFilter(filter);
    const end = new Date();
    const start = new Date();
    switch(filter) {
        case 'Today':
            start.setHours(0, 0, 0, 0);
            break;
        case 'This Week':
            start.setDate(start.getDate() - start.getDay());
            start.setHours(0, 0, 0, 0);
            break;
        case 'This Month':
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            break;
        case 'Last Month':
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);
            end.setDate(0);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case 'This Year':
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            break;
    }
    setDateRange({ start, end });
  };

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
        const saleDate = new Date(sale.date);
        const startOfDay = new Date(dateRange.start);
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(dateRange.end);
        endOfDay.setHours(23,59,59,999);
        return saleDate >= startOfDay && saleDate <= endOfDay;
    });
}, [sales, dateRange]);


  const salesMetrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
    const totalItemsSold = filteredSales.reduce((acc, sale) => acc + sale.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0), 0);
    const averageSaleValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    
    return {
      totalRevenue: totalRevenue,
      totalSales: filteredSales.length,
      totalItemsSold,
      averageSaleValue: averageSaleValue
    };
  }, [filteredSales]);

  const salesByCategory = useMemo(() => {
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    const categoryData: { [key: string]: number } = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const categoryName = categoryMap.get(product.categoryId) || 'Uncategorized';
          categoryData[categoryName] = (categoryData[categoryName] || 0) + item.sellingPrice * item.quantity;
        }
      });
    });
    return Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  }, [filteredSales, products, categories]);
  
  const topSellingProducts = useMemo(() => {
    const productData: { [key: string]: { name: string; variantName: string; quantity: number } } = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productData[item.variantId]) {
          productData[item.variantId] = { name: item.name, variantName: item.variantName, quantity: 0 };
        }
        productData[item.variantId].quantity += item.quantity;
      });
    });
    return Object.values(productData).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
  }, [filteredSales]);

    const detailedReportData = useMemo(() => {
    return filteredSales.flatMap(sale =>
        sale.items.map(item => {
            const saleSubtotal = sale.items.reduce((acc, i) => acc + (i.sellingPrice * i.quantity), 0);
            const itemTotal = item.sellingPrice * item.quantity;
            const itemDiscount = (sale.discount && saleSubtotal > 0) ? (itemTotal / saleSubtotal) * sale.discount : 0;
            const balanceAfterDiscount = itemTotal - itemDiscount;
            const totalCostPrice = item.costPrice * item.quantity;
            const profit = balanceAfterDiscount - totalCostPrice;
            const customer = customers.find(c => c.id === sale.customerId);

            return {
                id: `${sale.id}-${item.variantId}`,
                branchName: branches.find(b => b.id === sale.branchId)?.name || 'Direct Sale',
                customerName: customer?.name || 'N/A',
                itemName: `${item.name} (${item.variantName})`,
                quantityBefore: 'N/A',
                quantityAfter: 'N/A',
                quantitySold: item.quantity,
                costPrice: item.costPrice,
                totalCostPrice,
                sellingPrice: item.sellingPrice,
                totalSellingPrice: itemTotal,
                discount: itemDiscount,
                balanceAfterDiscount,
                profit,
                attendant: staff.find(s => s.id === sale.staffId)?.name || 'N/A',
                dateTime: sale.date.toLocaleString(),
            };
        })
    );
  }, [filteredSales, branches, staff, customers]);

  const grandTotals = useMemo(() => {
    return detailedReportData.reduce((acc, item) => {
        acc.totalCostPrice += item.totalCostPrice;
        acc.totalSellingPrice += item.totalSellingPrice;
        acc.discount += item.discount;
        acc.profit += item.profit;
        acc.quantitySold += item.quantitySold;
        return acc;
    }, { totalCostPrice: 0, totalSellingPrice: 0, discount: 0, profit: 0, quantitySold: 0 });
  }, [detailedReportData]);


  const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];
  const dateFilters = ['Today', 'This Week', 'This Month', 'Last Month', 'This Year'];

  return (
    <div className="space-y-6">
       <div className="p-4 bg-gray-800 rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-4">
              <div className="flex space-x-2">
                  {dateFilters.map(filter => (
                      <button key={filter} onClick={() => setDateFilter(filter)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${activeFilter === filter ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                          {filter}
                      </button>
                  ))}
              </div>
              <div className="flex items-center gap-2 text-sm">
                  <input type="date" value={dateRange.start.toISOString().split('T')[0]} onChange={e => { setDateRange(prev => ({...prev, start: new Date(e.target.value)})); setActiveFilter('Custom'); }} className="bg-gray-700 border border-gray-600 rounded-md p-1"/>
                  <span>to</span>
                  <input type="date" value={dateRange.end.toISOString().split('T')[0]} onChange={e => { setDateRange(prev => ({...prev, end: new Date(e.target.value)})); setActiveFilter('Custom'); }} className="bg-gray-700 border border-gray-600 rounded-md p-1"/>
              </div>
          </div>
       </div>

       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Revenue" value={formatCurrency(salesMetrics.totalRevenue)} iconName="dashboard" iconBgColor="bg-blue-500" />
            <MetricCard title="Total Sales" value={salesMetrics.totalSales} iconName="pos" iconBgColor="bg-green-500" />
            <MetricCard title="Items Sold" value={salesMetrics.totalItemsSold} iconName="inventory" iconBgColor="bg-orange-500" />
            <MetricCard title="Avg. Sale Value" value={formatCurrency(salesMetrics.averageSaleValue)} iconName="calculator" iconBgColor="bg-purple-500" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 p-4 bg-gray-800 rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-white">Sales by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={salesByCategory} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {salesByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} formatter={(value: number) => formatCurrency(value)} />
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
            <h3 className="mb-4 text-lg font-semibold text-white">Detailed Sales Report</h3>
            <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="border-b border-gray-700 sticky top-0 bg-gray-800">
                        <tr>
                            <th className="p-2">S/N</th><th className="p-2">Branch</th><th className="p-2">Customer</th><th className="p-2">Item</th>
                            <th className="p-2 text-right">Qty Before</th><th className="p-2 text-right">Qty After</th><th className="p-2 text-right">Qty Sold</th>
                            <th className="p-2 text-right">Cost Price</th><th className="p-2 text-right">Total Cost</th>
                            <th className="p-2 text-right">Sell Price</th><th className="p-2 text-right">Total Sell</th>
                            <th className="p-2 text-right">Discount</th><th className="p-2 text-right">Net Price</th>
                            <th className="p-2 text-right">Profit</th><th className="p-2">Attendant</th><th className="p-2">Date & Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detailedReportData.map((row, index) => (
                            <tr key={row.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-2">{index + 1}</td><td className="p-2">{row.branchName}</td><td className="p-2">{row.customerName}</td><td className="p-2">{row.itemName}</td>
                                <td className="p-2 text-right">{row.quantityBefore}</td><td className="p-2 text-right">{row.quantityAfter}</td><td className="p-2 text-right font-bold">{row.quantitySold}</td>
                                <td className="p-2 text-right font-mono">{formatCurrency(row.costPrice)}</td><td className="p-2 text-right font-mono">{formatCurrency(row.totalCostPrice)}</td>
                                <td className="p-2 text-right font-mono">{formatCurrency(row.sellingPrice)}</td><td className="p-2 text-right font-mono">{formatCurrency(row.totalSellingPrice)}</td>
                                <td className="p-2 text-right font-mono text-red-400">{formatCurrency(row.discount)}</td><td className="p-2 text-right font-mono">{formatCurrency(row.balanceAfterDiscount)}</td>
                                <td className="p-2 text-right font-mono font-bold text-green-400">{formatCurrency(row.profit)}</td><td className="p-2">{row.attendant}</td><td className="p-2">{row.dateTime}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="sticky bottom-0 bg-gray-800 font-bold border-t-2 border-gray-600">
                        <tr>
                            <td colSpan={6} className="p-2 text-right">Grand Total</td>
                            <td className="p-2 text-right">{grandTotals.quantitySold}</td><td></td>
                            <td className="p-2 text-right font-mono">{formatCurrency(grandTotals.totalCostPrice)}</td><td></td>
                            <td className="p-2 text-right font-mono">{formatCurrency(grandTotals.totalSellingPrice)}</td>
                            <td className="p-2 text-right font-mono text-red-400">{formatCurrency(grandTotals.discount)}</td><td></td>
                            <td className="p-2 text-right font-mono text-green-400">{formatCurrency(grandTotals.profit)}</td>
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>
  );
};

export default Reports;
