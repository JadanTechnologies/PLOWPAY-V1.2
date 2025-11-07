import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Icon from './icons/index.tsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Sale, Customer, PurchaseOrder, Consignment, Supplier } from '../types';
import { useCurrency } from '../../hooks/useCurrency';

type ReportTab = 'profit_loss' | 'sales' | 'credit' | 'purchases' | 'consignment' | 'deposit_sales';

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

// Individual Report Table Components
const ProfitLossSummary: React.FC<{ data: any, formatCurrency: (val: number) => string }> = ({ data, formatCurrency }) => (
    <div className="bg-gray-900/50 p-6 rounded-lg max-w-2xl mx-auto">
        <h3 className="font-bold text-xl mb-4 text-center text-white">Profit & Loss Summary</h3>
        <div className="space-y-3 text-lg">
            <div className="flex justify-between p-2 rounded-md bg-gray-800/50">
                <span className="font-semibold text-gray-300">Total Gross Revenue</span>
                <span className="font-mono">{formatCurrency(data.totalSellingPrice)}</span>
            </div>
            <div className="flex justify-between p-2">
                <span className="text-gray-400">Discounts</span>
                <span className="font-mono text-red-400">- {formatCurrency(data.discount)}</span>
            </div>
            <div className="flex justify-between p-2 border-t border-b border-gray-700 font-bold">
                <span className="text-white">Net Revenue</span>
                <span className="font-mono text-white">{formatCurrency(data.totalSellingPrice - data.discount)}</span>
            </div>
            <div className="flex justify-between p-2">
                <span className="text-gray-400">Cost of Goods Sold (COGS)</span>
                <span className="font-mono text-red-400">- {formatCurrency(data.totalCostPrice)}</span>
            </div>
            <div className="flex justify-between p-3 rounded-md bg-green-500/10 font-bold text-2xl mt-2">
                <span className="text-green-300">Gross Profit</span>
                <span className="font-mono text-green-300">{formatCurrency(data.profit)}</span>
            </div>
        </div>
    </div>
);

const DetailedSalesReport: React.FC<{ data: any[], totals: any, formatCurrency: (val: number) => string }> = ({ data, totals, formatCurrency }) => (
    <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-gray-700 sticky top-0 bg-gray-800">
                <tr>
                    <th className="p-2">S/N</th><th className="p-2">Branch</th><th className="p-2">Customer</th><th className="p-2">Item</th>
                    <th className="p-2 text-right">Qty Sold</th>
                    <th className="p-2 text-right">Cost Price</th><th className="p-2 text-right">Total Cost</th>
                    <th className="p-2 text-right">Sell Price</th><th className="p-2 text-right">Total Sell</th>
                    <th className="p-2 text-right">Discount</th><th className="p-2 text-right">Net Price</th>
                    <th className="p-2 text-right">Profit</th><th className="p-2">Attendant</th><th className="p-2">Date & Time</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr key={row.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="p-2">{index + 1}</td><td className="p-2">{row.branchName}</td><td className="p-2">{row.customerName}</td><td className="p-2">{row.itemName}</td>
                        <td className="p-2 text-right font-bold">{row.quantitySold}</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(row.costPrice)}</td><td className="p-2 text-right font-mono">{formatCurrency(row.totalCostPrice)}</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(row.sellingPrice)}</td><td className="p-2 text-right font-mono">{formatCurrency(row.totalSellingPrice)}</td>
                        <td className="p-2 text-right font-mono text-red-400">{formatCurrency(row.discount)}</td><td className="p-2 text-right font-mono">{formatCurrency(row.balanceAfterDiscount)}</td>
                        <td className="p-2 text-right font-mono font-bold text-green-400">{formatCurrency(row.profit)}</td><td className="p-2">{row.attendant}</td><td className="p-2">{row.dateTime}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="sticky bottom-0 bg-gray-800 font-bold border-t-2 border-gray-600">
                <tr>
                    <td colSpan={4} className="p-2 text-right">Grand Total</td>
                    <td className="p-2 text-right">{totals.quantitySold}</td><td></td>
                    <td className="p-2 text-right font-mono">{formatCurrency(totals.totalCostPrice)}</td><td></td>
                    <td className="p-2 text-right font-mono">{formatCurrency(totals.totalSellingPrice)}</td>
                    <td className="p-2 text-right font-mono text-red-400">{formatCurrency(totals.discount)}</td><td></td>
                    <td className="p-2 text-right font-mono text-green-400">{formatCurrency(totals.profit)}</td>
                    <td colSpan={2}></td>
                </tr>
            </tfoot>
        </table>
    </div>
);

const CreditSalesReport: React.FC<{ data: (Sale & { customerName: string })[], formatCurrency: (val: number) => string }> = ({ data, formatCurrency }) => {
    const totalOutstanding = data.reduce((acc, sale) => acc + sale.amountDue, 0);
    return (
        <div>
            <table className="w-full text-left">
                <thead className="border-b border-gray-700"><tr><th className="p-3">Sale ID</th><th className="p-3">Customer</th><th className="p-3">Date</th><th className="p-3 text-right">Total</th><th className="p-3 text-right">Amount Due</th></tr></thead>
                <tbody>
                    {data.map(sale => (
                        <tr key={sale.id} className="border-b border-gray-700">
                            <td className="p-3 font-mono">{sale.id}</td><td className="p-3">{sale.customerName}</td>
                            <td className="p-3">{new Date(sale.date).toLocaleDateString()}</td><td className="p-3 text-right font-mono">{formatCurrency(sale.total)}</td>
                            <td className="p-3 text-right font-mono font-bold text-red-400">{formatCurrency(sale.amountDue)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="font-bold border-t-2 border-gray-600">
                    <tr><td colSpan={4} className="p-3 text-right">Total Outstanding</td><td className="p-3 text-right font-mono text-red-400">{formatCurrency(totalOutstanding)}</td></tr>
                </tfoot>
            </table>
        </div>
    );
};

const DepositSalesReport: React.FC<{ data: any[], formatCurrency: (val: number) => string }> = ({ data, formatCurrency }) => {
    const totalFromDeposits = data.reduce((acc, sale) => acc + sale.depositAmount, 0);
    return (
        <div>
            <table className="w-full text-left">
                <thead className="border-b border-gray-700"><tr><th className="p-3">Sale ID</th><th className="p-3">Customer</th><th className="p-3">Date</th><th className="p-3 text-right">Total Sale</th><th className="p-3 text-right">Paid by Deposit</th></tr></thead>
                <tbody>
                    {data.map(sale => (
                        <tr key={sale.id} className="border-b border-gray-700">
                            <td className="p-3 font-mono">{sale.id}</td><td className="p-3">{sale.customerName}</td>
                            <td className="p-3">{new Date(sale.date).toLocaleDateString()}</td><td className="p-3 text-right font-mono">{formatCurrency(sale.total)}</td>
                            <td className="p-3 text-right font-mono font-bold text-cyan-400">{formatCurrency(sale.depositAmount)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="font-bold border-t-2 border-gray-600">
                    <tr><td colSpan={4} className="p-3 text-right">Total Paid from Deposits</td><td className="p-3 text-right font-mono text-cyan-400">{formatCurrency(totalFromDeposits)}</td></tr>
                </tfoot>
            </table>
        </div>
    );
};

const PurchaseOrdersReport: React.FC<{ data: PurchaseOrder[], suppliers: Map<string, string>, branches: Map<string, string>, formatCurrency: (val: number) => string }> = ({ data, suppliers, branches, formatCurrency }) => (
    <table className="w-full text-left">
        <thead className="border-b border-gray-700"><tr><th className="p-3">PO Number</th><th className="p-3">Date</th><th className="p-3">Supplier</th><th className="p-3">Destination</th><th className="p-3 text-right">Total</th><th className="p-3 text-center">Status</th></tr></thead>
        <tbody>
            {data.map(po => (<tr key={po.id} className="border-b border-gray-700"><td className="p-3 font-mono">{po.poNumber}</td><td className="p-3">{new Date(po.createdAt).toLocaleDateString()}</td><td className="p-3">{suppliers.get(po.supplierId)}</td><td className="p-3">{branches.get(po.destinationBranchId)}</td><td className="p-3 text-right font-mono">{formatCurrency(po.total)}</td><td className="p-3 text-center">{po.status}</td></tr>))}
        </tbody>
    </table>
);

const ConsignmentReport: React.FC<{ data: any[], formatCurrency: (val: number) => string }> = ({ data, formatCurrency }) => (
    <div className="space-y-6">
        {data.map(supplierData => (
            <div key={supplierData.supplierName} className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-white">{supplierData.supplierName}</h4>
                <table className="w-full text-sm text-left">
                    <thead className="border-b border-gray-700"><tr><th className="p-2">Product</th><th className="p-2">Branch</th><th className="p-2 text-right">Received</th><th className="p-2 text-right">Sold</th><th className="p-2 text-right">Remaining</th><th className="p-2 text-right">Cost Price</th><th className="p-2 text-right">Value Owed</th></tr></thead>
                    <tbody>
                        {supplierData.items.map((item: any) => (<tr key={item.variantId + item.branchName} className="border-b border-gray-700/50"><td className="p-2">{item.productName} ({item.variantName})</td><td className="p-2">{item.branchName}</td><td className="p-2 text-right">{item.quantityReceived}</td><td className="p-2 text-right text-yellow-400">{item.quantitySold}</td><td className="p-2 text-right font-bold text-green-400">{item.quantityReceived - item.quantitySold}</td><td className="p-2 text-right font-mono">{formatCurrency(item.costPrice)}</td><td className="p-2 text-right font-mono font-bold">{formatCurrency(item.quantitySold * item.costPrice)}</td></tr>))}
                    </tbody>
                    <tfoot className="font-bold border-t-2 border-gray-600"><tr><td colSpan={6} className="p-2 text-right">Total Owed to {supplierData.supplierName}</td><td className="p-2 text-right font-mono">{formatCurrency(supplierData.totalOwed)}</td></tr></tfoot>
                </table>
            </div>
        ))}
    </div>
);


const Reports: React.FC = () => {
  const { sales, products, branches, staff, categories, customers, purchaseOrders, consignments, suppliers, brandConfig } = useAppContext();
  const { formatCurrency } = useCurrency();
  
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return { start, end };
  });
  const [activeFilter, setActiveFilter] = useState('Last Month');
  const [activeReport, setActiveReport] = useState<ReportTab>('profit_loss');
  const [branchFilter, setBranchFilter] = useState('ALL');

  const setDateFilter = (filter: string) => {
    setActiveFilter(filter);
    const end = new Date();
    const start = new Date();
    switch(filter) {
        case 'Today': start.setHours(0,0,0,0); break;
        case 'This Week': start.setDate(start.getDate() - start.getDay()); start.setHours(0,0,0,0); break;
        case 'This Month': start.setDate(1); start.setHours(0,0,0,0); break;
        case 'Last Month': start.setMonth(start.getMonth() - 1, 1); end.setDate(0); start.setHours(0,0,0,0); end.setHours(23,59,59,999); break;
        case 'This Year': start.setMonth(0, 1); start.setHours(0,0,0,0); break;
    }
    setDateRange({ start, end });
  };

  const filteredSales = useMemo(() => sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const startOfDay = new Date(dateRange.start);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(dateRange.end);
    endOfDay.setHours(23,59,59,999);
    const inDateRange = saleDate >= startOfDay && saleDate <= endOfDay;
    const inBranch = branchFilter === 'ALL' || sale.branchId === branchFilter;
    return inDateRange && inBranch;
  }), [sales, dateRange, branchFilter]);

  const salesMetrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
    const totalItemsSold = filteredSales.reduce((acc, sale) => acc + sale.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0), 0);
    const averageSaleValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    return { totalRevenue, totalSales: filteredSales.length, totalItemsSold, averageSaleValue };
  }, [filteredSales]);

  const detailedReportData = useMemo(() => filteredSales.flatMap(sale => sale.items.map(item => {
    const saleSubtotal = sale.items.reduce((acc, i) => acc + (i.sellingPrice * i.quantity), 0);
    const itemTotal = item.sellingPrice * item.quantity;
    const itemDiscount = (sale.discount && saleSubtotal > 0) ? (itemTotal / saleSubtotal) * sale.discount : 0;
    const balanceAfterDiscount = itemTotal - itemDiscount;
    const totalCostPrice = item.costPrice * item.quantity;
    const profit = balanceAfterDiscount - totalCostPrice;
    return {
        id: `${sale.id}-${item.variantId}`, branchName: branches.find(b => b.id === sale.branchId)?.name || 'Direct Sale', customerName: customers.find(c => c.id === sale.customerId)?.name || 'N/A', itemName: `${item.name} (${item.variantName})`,
        quantitySold: item.quantity, costPrice: item.costPrice, totalCostPrice, sellingPrice: item.sellingPrice, totalSellingPrice: itemTotal, discount: itemDiscount, balanceAfterDiscount, profit,
        attendant: staff.find(s => s.id === sale.staffId)?.name || 'N/A', dateTime: new Date(sale.date).toLocaleString(),
    };
  })), [filteredSales, branches, staff, customers]);

  const grandTotals = useMemo(() => detailedReportData.reduce((acc, item) => {
    acc.totalCostPrice += item.totalCostPrice; acc.totalSellingPrice += item.totalSellingPrice; acc.discount += item.discount; acc.profit += item.profit; acc.quantitySold += item.quantitySold;
    return acc;
  }, { totalCostPrice: 0, totalSellingPrice: 0, discount: 0, profit: 0, quantitySold: 0 }), [detailedReportData]);
  
  const creditSalesData = useMemo(() => filteredSales.filter(sale => sale.status !== 'PAID').map(sale => ({...sale, customerName: customers.find(c => c.id === sale.customerId)?.name || 'N/A'})), [filteredSales, customers]);
  
  const depositSalesData = useMemo(() => {
    return filteredSales
        .map(sale => {
            const depositPayment = sale.payments.find(p => p.method === 'Deposit');
            if (!depositPayment) return null;
            return {
                ...sale,
                customerName: customers.find(c => c.id === sale.customerId)?.name || 'N/A',
                depositAmount: depositPayment.amount,
            };
        })
        .filter((sale): sale is (Sale & { customerName: string; depositAmount: number }) => sale !== null);
  }, [filteredSales, customers]);

  const branchMap = useMemo(() => new Map(branches.map(b => [b.id, b.name])), [branches]);

  const consignmentReportData = useMemo(() => {
    const report = suppliers.map(supplier => {
        const supplierConsignments = consignments.filter(c => {
            const inBranch = branchFilter === 'ALL' || c.branchId === branchFilter;
            const consignmentDate = new Date(c.receivedDate);
            const startOfDay = new Date(dateRange.start);
            startOfDay.setHours(0,0,0,0);
            const endOfDay = new Date(dateRange.end);
            endOfDay.setHours(23,59,59,999);
            const inDateRange = consignmentDate >= startOfDay && consignmentDate <= endOfDay;
            return c.supplierId === supplier.id && inBranch && inDateRange;
        });
        if (supplierConsignments.length === 0) return null;
        const items = supplierConsignments.flatMap(c => c.items.map(item => ({ ...item, branchName: branchMap.get(c.branchId) || 'N/A' })));
        const totalOwed = items.reduce((acc, item) => acc + (item.quantitySold * item.costPrice), 0);
        return { supplierName: supplier.name, items, totalOwed };
    }).filter((s): s is { supplierName: string; items: any[]; totalOwed: number } => s !== null);
    return report;
  }, [consignments, suppliers, branchMap, branchFilter, dateRange]);

  const purchaseData = useMemo(() => purchaseOrders.filter(po => {
    const poDate = new Date(po.createdAt);
    const startOfDay = new Date(dateRange.start); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(dateRange.end); endOfDay.setHours(23,59,59,999);
    const inDateRange = poDate >= startOfDay && poDate <= endOfDay;
    const inBranch = branchFilter === 'ALL' || po.destinationBranchId === branchFilter;
    return inDateRange && inBranch;
  }), [purchaseOrders, dateRange, branchFilter]);

  const supplierMap = useMemo(() => new Map(suppliers.map(s => [s.id, s.name])), [suppliers]);

  const handlePrint = () => window.print();

  const reportTitles: Record<ReportTab, string> = { sales: 'Detailed Sales Report', credit: 'Credit Sales Report', purchases: 'Purchase Order Report', consignment: 'Consignment Report', profit_loss: 'Profit & Loss Summary', deposit_sales: 'Deposit Sales Report' };
  const dateFilters = ['Today', 'This Week', 'This Month', 'Last Month', 'This Year'];
  const TabButton: React.FC<{tab: ReportTab, label: string}> = ({ tab, label }) => (<button onClick={() => setActiveReport(tab)} className={`px-4 py-2 font-medium text-sm rounded-md ${activeReport === tab ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{label}</button>);

  return (
    <div id="report-printable-area">
        <div className="print-header" style={{ display: 'none' }}>
            <h2 className="text-2xl font-bold">{brandConfig.name}</h2>
            <p className="text-lg">{reportTitles[activeReport]}</p>
            <p>For Period: {dateRange.start.toLocaleDateString()} to {dateRange.end.toLocaleDateString()}</p>
        </div>

        <div className="space-y-6">
            <div className="p-4 bg-gray-800 rounded-lg shadow-md no-print">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {dateFilters.map(filter => (<button key={filter} onClick={() => setDateFilter(filter)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${activeFilter === filter ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{filter}</button>))}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <input type="date" value={dateRange.start.toISOString().split('T')[0]} onChange={e => { setDateRange(prev => ({...prev, start: new Date(e.target.value)})); setActiveFilter('Custom'); }} className="bg-gray-700 border border-gray-600 rounded-md p-1"/>
                            <span className="text-gray-400">to</span>
                            <input type="date" value={dateRange.end.toISOString().split('T')[0]} onChange={e => { setDateRange(prev => ({...prev, end: new Date(e.target.value)})); setActiveFilter('Custom'); }} className="bg-gray-700 border border-gray-600 rounded-md p-1"/>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <label htmlFor="branch-filter" className="text-gray-400">Branch:</label>
                            <select
                                id="branch-filter"
                                value={branchFilter}
                                onChange={e => setBranchFilter(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="ALL">All Branches</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center"><Icon name="printer" className="w-5 h-5 mr-2"/>Print Report</button>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 no-print">
                <MetricCard title="Total Revenue" value={formatCurrency(salesMetrics.totalRevenue)} iconName="dashboard" iconBgColor="bg-blue-500" />
                <MetricCard title="Total Sales" value={salesMetrics.totalSales} iconName="pos" iconBgColor="bg-green-500" />
                <MetricCard title="Items Sold" value={salesMetrics.totalItemsSold} iconName="inventory" iconBgColor="bg-orange-500" />
                <MetricCard title="Avg. Sale Value" value={formatCurrency(salesMetrics.averageSaleValue)} iconName="calculator" iconBgColor="bg-purple-500" />
            </div>
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <div className="flex flex-wrap gap-2 border-b border-gray-700 mb-6 pb-2 no-print">
                    <TabButton tab="profit_loss" label="Profit & Loss" /><TabButton tab="sales" label="Detailed Sales" /><TabButton tab="credit" label="Credit Sales" /><TabButton tab="deposit_sales" label="Deposit Sales" /><TabButton tab="purchases" label="Purchase Orders" /><TabButton tab="consignment" label="Consignment" />
                </div>
                {activeReport === 'profit_loss' && <ProfitLossSummary data={grandTotals} formatCurrency={formatCurrency} />}
                {activeReport === 'sales' && <DetailedSalesReport data={detailedReportData} totals={grandTotals} formatCurrency={formatCurrency} />}
                {activeReport === 'credit' && <CreditSalesReport data={creditSalesData} formatCurrency={formatCurrency} />}
                {activeReport === 'deposit_sales' && <DepositSalesReport data={depositSalesData} formatCurrency={formatCurrency} />}
                {activeReport === 'purchases' && <PurchaseOrdersReport data={purchaseData} suppliers={supplierMap} branches={branchMap} formatCurrency={formatCurrency} />}
                {activeReport === 'consignment' && <ConsignmentReport data={consignmentReportData} formatCurrency={formatCurrency} />}
            </div>
        </div>
    </div>
  );
};

export default Reports;