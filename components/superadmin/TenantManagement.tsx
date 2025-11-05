import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { TenantStatus } from '../../types';
import Icon from '../icons';

const TenantManagement: React.FC = () => {
    const { tenants, subscriptionPlans } = useAppContext();
    const planMap = new Map(subscriptionPlans.map(p => [p.id, p.name]));

    const getStatusBadge = (status: TenantStatus) => {
        const styles: {[key in TenantStatus]: string} = {
            ACTIVE: 'bg-green-500/20 text-green-300',
            SUSPENDED: 'bg-red-500/20 text-red-300',
            TRIAL: 'bg-yellow-500/20 text-yellow-300',
        };
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Tenant Management</h2>
                <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    Add Tenant
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-3 text-sm font-semibold tracking-wide">Business Name</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">Owner</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">Email</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-center">Status</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">Plan</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">Join Date</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map(tenant => (
                            <tr key={tenant.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-3 whitespace-nowrap font-medium">{tenant.businessName}</td>
                                <td className="p-3 whitespace-nowrap text-gray-300">{tenant.ownerName}</td>
                                <td className="p-3 whitespace-nowrap text-gray-400">{tenant.email}</td>
                                <td className="p-3 whitespace-nowrap text-center">{getStatusBadge(tenant.status)}</td>
                                <td className="p-3 whitespace-nowrap">{planMap.get(tenant.planId)}</td>
                                <td className="p-3 whitespace-nowrap text-gray-400">{tenant.joinDate.toLocaleDateString()}</td>
                                <td className="p-3 text-center whitespace-nowrap space-x-2">
                                     <button className="text-sky-400 hover:text-sky-300 font-semibold px-2 py-1 rounded-md text-sm">View</button>
                                     <button className="text-yellow-400 hover:text-yellow-300 font-semibold px-2 py-1 rounded-md text-sm">Edit</button>
                                     <button className="text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded-md text-sm">Suspend</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {tenants.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No tenants found.</p>
                )}
            </div>
        </div>
    );
};

export default TenantManagement;
