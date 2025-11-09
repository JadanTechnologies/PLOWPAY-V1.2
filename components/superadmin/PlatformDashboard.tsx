
import React, { useMemo, useState } from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { useAppContext } from '../../hooks/useAppContext';
import Icon from '../icons/index.tsx';

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

const PlatformDashboard: React.FC = () => {
    const { tenants, subscriptionPlans, processExpiredTrials, sendExpiryReminders } = useAppContext();
    const [trialJobStatus, setTrialJobStatus] = useState('');
    const [reminderJobStatus, setReminderJobStatus] = useState('');


    const platformMetrics = useMemo(() => {
        const planMap = new Map(subscriptionPlans.map(p => [p.id, p.price]));
        const mrr = tenants
            .filter(t => t.status === 'ACTIVE' || t.status === 'TRIAL')
            .reduce((acc, tenant) => acc + (planMap.get(tenant.planId) || 0), 0);

        const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newTenants = tenants.filter(t => t.joinDate > thirtyDaysAgo).length;

        return { mrr, activeTenants, newTenants };
    }, [tenants, subscriptionPlans]);

    const tenantGrowthData = useMemo(() => {
        if (!tenants || tenants.length === 0) return [];

        const monthlyJoins = new Map<string, number>();

        tenants.forEach(tenant => {
            const joinDate = tenant.joinDate;
            const key = `${joinDate.getFullYear()}-${String(joinDate.getMonth() + 1).padStart(2, '0')}`;
            monthlyJoins.set(key, (monthlyJoins.get(key) || 0) + 1);
        });

        const sortedTenants = [...tenants].sort((a, b) => a.joinDate.getTime() - b.joinDate.getTime());
        if (sortedTenants.length === 0) return [];
        
        const firstDate = sortedTenants[0].joinDate;
        const lastDate = new Date();
        
        const dataPoints: { name: string; tenants: number }[] = [];
        let cumulativeTenants = 0;
        let currentDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);

        while (currentDate <= lastDate) {
            const year = currentDate.getFullYear();
            const monthNum = currentDate.getMonth() + 1;
            const monthKey = `${year}-${String(monthNum).padStart(2, '0')}`;
            
            cumulativeTenants += monthlyJoins.get(monthKey) || 0;
            
            const monthShort = currentDate.toLocaleString('default', { month: 'short' });
            const yearShort = year.toString().slice(-2);
            
            dataPoints.push({ name: `${monthShort} '${yearShort}`, tenants: cumulativeTenants });
            
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        return dataPoints.slice(-12);
    }, [tenants]);

    const revenueByPlanData = useMemo(() => {
        const planMap = new Map(subscriptionPlans.map(p => [p.id, { name: p.name, price: p.price }]));
        
        const revenueData = tenants.reduce((acc, tenant) => {
            const plan = planMap.get(tenant.planId);
            if (plan && (tenant.status === 'ACTIVE' || tenant.status === 'TRIAL')) {
                acc[plan.name] = (acc[plan.name] || 0) + plan.price;
            }
            return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(revenueData).map(([name, value]) => ({ name, value }));
    }, [tenants, subscriptionPlans]);
    
    const handleRunTrialJob = () => {
        setTrialJobStatus('Processing...');
        // Simulate async job
        setTimeout(() => {
            const { processed, suspended } = processExpiredTrials();
            setTrialJobStatus(`Job completed. ${processed} trials checked, ${suspended} accounts suspended. Last run: ${new Date().toLocaleTimeString()}`);
        }, 1000);
    };

    const handleRunReminderJob = () => {
        setReminderJobStatus('Processing...');
        setTimeout(() => {
            const { sent } = sendExpiryReminders();
            setReminderJobStatus(`Job completed. ${sent} reminders sent. Last run: ${new Date().toLocaleTimeString()}`);
        }, 1000);
    };

    const COLORS = ['#14b8a6', '#06b6d4', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Monthly Recurring Revenue" value={`$${platformMetrics.mrr.toLocaleString()}`} iconName="cash" iconBgColor="bg-gradient-to-br from-teal-500 to-green-600" />
                <MetricCard title="Active Tenants" value={platformMetrics.activeTenants.toLocaleString()} iconName="briefcase" iconBgColor="bg-gradient-to-br from-cyan-500 to-sky-600" />
                <MetricCard title="New Tenants (30d)" value={platformMetrics.newTenants.toLocaleString()} iconName="user" iconBgColor="bg-gradient-to-br from-amber-500 to-orange-600" />
                <MetricCard title="Churn Rate" value="2.1%" iconName="chart-bar" iconBgColor="bg-gradient-to-br from-rose-500 to-red-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
                    <h3 className="mb-4 text-lg font-semibold text-white">Tenant Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={tenantGrowthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorTenants" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                            <Area type="monotone" dataKey="tenants" name="Total Tenants" stroke="#14b8a6" fillOpacity={1} fill="url(#colorTenants)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
                    <h3 className="mb-4 text-lg font-semibold text-white">MRR by Plan</h3>
                    <ResponsiveContainer width="100%" height={300}>
                       <PieChart>
                            <Pie
                                data={revenueByPlanData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                // FIX: Added a fallback for 'percent' to ensure it's a number before performing arithmetic operations, resolving a potential TypeScript error.
                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            >
                                {revenueByPlanData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} formatter={(value: number) => `$${value.toLocaleString()}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
                <h3 className="mb-4 text-lg font-semibold text-white">System Cron Jobs</h3>
                <div className="space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-700">
                        <div>
                            <h4 className="font-semibold text-white">Process Expired Trials</h4>
                            <p className="text-sm text-slate-400 mt-1">
                                Checks for tenants whose trial period has ended and updates their status to 'Suspended'. 
                                This is a simulation of a daily automated job.
                            </p>
                            {trialJobStatus && <p className="text-xs text-cyan-400 mt-2 font-mono">{trialJobStatus}</p>}
                        </div>
                        <button
                            onClick={handleRunTrialJob}
                            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-2 px-4 rounded-md flex items-center flex-shrink-0"
                        >
                            <Icon name="play" className="w-5 h-5 mr-2" />
                            Run Job Manually
                        </button>
                    </div>
                     <div className="bg-slate-900/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-700">
                        <div>
                            <h4 className="font-semibold text-white">Send Expiry Reminders</h4>
                            <p className="text-sm text-slate-400 mt-1">
                                Sends in-app and email notifications to tenants whose trials are expiring within 3 days.
                            </p>
                            {reminderJobStatus && <p className="text-xs text-cyan-400 mt-2 font-mono">{reminderJobStatus}</p>}
                        </div>
                        <button
                            onClick={handleRunReminderJob}
                            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-2 px-4 rounded-md flex items-center flex-shrink-0"
                        >
                            <Icon name="play" className="w-5 h-5 mr-2" />
                            Run Job Manually
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformDashboard;