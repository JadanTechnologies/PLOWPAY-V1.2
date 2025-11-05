
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { AdminRole, Permission } from '../../types';

// FIX: Added 'managePaymentGateways' to satisfy the Record<Permission, string> type.
const permissionLabels: Record<Permission, string> = {
    viewPlatformDashboard: 'View Platform Dashboard',
    manageTenants: 'Manage Tenants',
    manageSubscriptions: 'Manage Subscriptions',
    manageTeam: 'Manage Team Members',
    manageRoles: 'Manage Roles & Permissions',
    manageSystemSettings: 'Manage System Settings',
    managePaymentGateways: 'Manage Payment Gateways'
};

const RoleCard: React.FC<{ role: AdminRole }> = ({ role }) => {
    const { allPermissions, updateAdminRole } = useAppContext();
    const [permissions, setPermissions] = useState<Set<Permission>>(new Set(role.permissions));
    
    useEffect(() => {
        setPermissions(new Set(role.permissions));
    }, [role.permissions]);

    const handlePermissionChange = (permission: Permission, isChecked: boolean) => {
        const newPermissions = new Set(permissions);
        if (isChecked) {
            newPermissions.add(permission);
        } else {
            newPermissions.delete(permission);
        }
        setPermissions(newPermissions);
    };
    
    const handleSave = () => {
        updateAdminRole(role.id, Array.from(permissions));
        alert(`Role '${role.name}' updated successfully.`);
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                <h3 className="text-xl font-bold text-white">{role.name}</h3>
                <button 
                  onClick={handleSave}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md text-sm"
                >
                    Save Changes
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allPermissions.map(permission => (
                    <label key={permission} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700/50 transition-colors">
                        <input
                            type="checkbox"
                            checked={permissions.has(permission)}
                            onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                            className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                        />
                        <span className="text-gray-300">{permissionLabels[permission]}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};


const RoleManagement: React.FC = () => {
    const { adminRoles } = useAppContext();

    return (
        <div className="space-y-6">
             <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-white mb-2">Role & Permission Management</h2>
                <p className="text-gray-400">Define what users can see and do within the admin panel. Changes are applied immediately.</p>
            </div>
            <div className="space-y-6">
                {adminRoles.map(role => (
                    <RoleCard key={role.id} role={role} />
                ))}
            </div>
        </div>
    );
};

export default RoleManagement;