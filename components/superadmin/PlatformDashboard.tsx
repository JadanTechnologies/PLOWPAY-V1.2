import React, { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Icon from '../icons';

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

const PlatformDashboard: React.FC = () => {
    const { tenants, subscriptionPlans } = useAppContext();

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

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Monthly Recurring Revenue" value={`$${platformMetrics.mrr.toLocaleString()}`} iconName="dashboard" iconBgColor="bg-emerald-500" />
                <MetricCard title="Active Tenants" value={platformMetrics.activeTenants.toLocaleString()} iconName="briefcase" iconBgColor="bg-sky-500" />
                <MetricCard title="New Tenants (30d)" value={platformMetrics.newTenants.toLocaleString()} iconName="user" iconBgColor="bg-amber-500" />
                <MetricCard title="Churn Rate" value="2.1%" iconName="reports" iconBgColor="bg-rose-500" />
            </div>
            {/* Additional charts and tables for the platform dashboard can be added here */}
             <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-white">Platform Overview</h3>
                <p className="text-gray-400">More platform-wide analytics and reporting tools will be available here soon.</p>
            </div>
        </div>
    );
};

export default PlatformDashboard;
