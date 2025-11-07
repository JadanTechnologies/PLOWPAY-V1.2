

import React from 'react';
import { Tenant } from '../../types';
import Icon from '../icons/index.tsx';

interface TenantDetailModalProps {
    tenant: Tenant;
    planName: string;
    onClose: () => void;
}

const DetailItem: React.FC<{ icon: string; label: string; value?: string | React.ReactNode; }> = ({ icon, label, value }) => (
    <div className="flex items-start">
        <Icon name={icon} className="w-5 h-5 text-cyan-400 mt-1 mr-3 flex-shrink-0" />
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="font-semibold text-white break-words">{value || 'Not set'}</p>
        </div>
    </div>
);

const getStatusBadge = (status: Tenant['status']) => {
    const styles: {[key in Tenant['status']]: string} = {
        ACTIVE: 'bg-green-500/20 text-green-300',
        SUSPENDED: 'bg-red-500/20 text-red-300',
        TRIAL: 'bg-yellow-500/20 text-yellow-300',
        UNVERIFIED: 'bg-gray-500/20 text-gray-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
            {status}
        </span>
    );
};

const TenantDetailModal: React.FC<TenantDetailModalProps> = ({ tenant, planName, onClose }) => {
    const { automations } = tenant;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center">
                         {tenant.companyLogoUrl ? (
                            <img src={tenant.companyLogoUrl} alt={`${tenant.businessName} Logo`} className="h-10 w-10 rounded-md mr-3 object-contain" />
                        ) : (
                            <div className="h-10 w-10 rounded-md mr-3 bg-gray-700 flex items-center justify-center">
                               <Icon name="briefcase" className="w-6 h-6 text-cyan-400" />
                            </div>
                        )}
                        <div>
                            <h3 className="text-xl font-bold text-white">{tenant.businessName}</h3>
                            <p className="text-sm text-gray-400">Tenant ID: {tenant.id}</p>
                        </div>
                    </div>
                    {getStatusBadge(tenant.status)}
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Owner & Company Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <h4 className="font-semibold text-lg text-white mb-3">Owner Details</h4>
                            <div className="space-y-3">
                                <DetailItem icon="user" label="Owner Name" value={tenant.ownerName} />
                                <DetailItem icon="at-symbol" label="Email" value={tenant.email} />
                                <DetailItem icon="user" label="Username" value={tenant.username} />
                            </div>
                        </div>
                         <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <h4 className="font-semibold text-lg text-white mb-3">Company Details</h4>
                            <div className="space-y-3">
                                <DetailItem icon="phone" label="Phone" value={tenant.companyPhone} />
                                <DetailItem icon="map-pin" label="Address" value={tenant.companyAddress} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Subscription & Config */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                         <h4 className="font-semibold text-lg text-white mb-3">Subscription & Security</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <DetailItem icon="credit-card" label="Plan" value={planName} />
                            <DetailItem icon="calendar" label="Join Date" value={tenant.joinDate.toLocaleDateString()} />
                            <DetailItem 
                                icon="calendar" 
                                label="Trial End Date" 
                                value={tenant.trialEndDate ? new Date(tenant.trialEndDate).toLocaleDateString() : 'N/A'} 
                            />
                            <DetailItem icon="at-symbol" label="Last Login IP" value={<span className="font-mono">{tenant.lastLoginIp || 'N/A'}</span>} />
                            <DetailItem icon="calendar" label="Last Login Date" value={tenant.lastLoginDate ? new Date(tenant.lastLoginDate).toLocaleString() : 'N/A'} />
                         </div>
                    </div>

                    {/* Automations */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                         <h4 className="font-semibold text-lg text-white mb-3">Configuration</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <DetailItem icon="cash" label="Currency" value={tenant.currency} />
                            <DetailItem icon="globe" label="Language" value={tenant.language} />
                            <DetailItem 
                                icon="settings" 
                                label="EOD Reports" 
                                value={<span className={`font-bold ${automations?.generateEODReport ? 'text-green-400' : 'text-red-400'}`}>{automations?.generateEODReport ? 'Enabled' : 'Disabled'}</span>}
                            />
                            <DetailItem 
                                icon="settings" 
                                label="Low Stock Alerts" 
                                value={<span className={`font-bold ${automations?.sendLowStockAlerts ? 'text-green-400' : 'text-red-400'}`}>{automations?.sendLowStockAlerts ? 'Enabled' : 'Disabled'}</span>}
                            />
                         </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-900/50 rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 font-semibold">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TenantDetailModal;