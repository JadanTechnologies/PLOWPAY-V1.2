import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { AdminRole, Permission } from '../../types';
import Icon from '../icons/index.tsx';
import ConfirmationModal from '../ConfirmationModal';

const permissionLabels: Record<Permission, string> = {
    viewPlatformDashboard: 'View Platform Dashboard',
    manageTenants: 'Manage Tenants',
    manageSubscriptions: 'Manage Subscriptions',
    manageTeam: 'Manage Team Members',
    manageRoles: 'Manage Roles & Permissions',
    manageSystemSettings: 'Manage System Settings',
    managePaymentGateways: 'Manage Payment Gateways',
    manageNotificationSettings: 'Manage Notification Settings',
    manageAnnouncements: 'Manage Announcements',
    viewAuditLogs: 'View Audit Logs',
    manageSupport: 'Manage Support Tickets',
    manageBlog: 'Manage Blog Posts',
};

const permissionGroups: Record<string, Permission[]> = {
    'Platform Management': ['viewPlatformDashboard', 'manageSystemSettings', 'viewAuditLogs'],
    'User & Tenant Management': ['manageTenants', 'manageSubscriptions', 'manageTeam', 'manageRoles', 'manageSupport'],
    'Financial & Communications': ['managePaymentGateways', 'manageNotificationSettings', 'manageAnnouncements', 'manageBlog']
};

const CollapsibleSection: React.FC<{
    title: string;
    permissions: Permission[];
    assignedPermissions: Set<Permission>;
    onPermissionChange: (permission: Permission, isChecked: boolean) => void;
}> = ({ title, permissions, assignedPermissions, onPermissionChange }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left font-semibold"
            >
                <span>{title}</span>
                <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} className="w-5 h-5 transition-transform" />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {permissions.map(permission => (
                        <label key={permission} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700/50 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={assignedPermissions.has(permission)}
                                onChange={(e) => onPermissionChange(permission, e.target.checked)}
                                className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                            />
                            <span className="text-gray-300">{permissionLabels[permission]}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};


const RoleCard: React.FC<{ role: AdminRole }> = ({ role }) => {
    const { updateAdminRole, deleteAdminRole } = useAppContext();
    const [permissions, setPermissions] = useState<Set<Permission>>(new Set(role.permissions));
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    
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
    
    const handleConfirmDelete = () => {
        deleteAdminRole(role.id);
    };

    const isDeletable = !['Admin', 'Support', 'Developer'].includes(role.name);

    return (
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-700 pb-4 mb-4 gap-4">
                <h3 className="text-xl font-bold text-white">{role.name}</h3>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <button 
                      onClick={handleSave}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md text-sm"
                    >
                        Save Changes
                    </button>
                    {isDeletable && (
                         <button 
                          onClick={() => setConfirmOpen(true)}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-md text-sm"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
            <div className="space-y-4">
                {Object.entries(permissionGroups).map(([groupTitle, groupPermissions]) => (
                    <CollapsibleSection
                        key={groupTitle}
                        title={groupTitle}
                        permissions={groupPermissions}
                        assignedPermissions={permissions}
                        onPermissionChange={handlePermissionChange}
                    />
                ))}
            </div>
             <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title={`Delete Role: ${role.name}`}
                confirmText="Delete Role"
            >
                Are you sure you want to delete the "{role.name}" role? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};


const RoleManagement: React.FC = () => {
    const { adminRoles, addAdminRole } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRolePermissions, setNewRolePermissions] = useState<Set<Permission>>(new Set());

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setNewRoleName('');
        setNewRolePermissions(new Set());
    };

    const handlePermissionChange = (permission: Permission, isChecked: boolean) => {
        setNewRolePermissions(prev => {
            const next = new Set(prev);
            if (isChecked) {
                next.add(permission);
            } else {
                next.delete(permission);
            }
            return next;
        });
    };

    const handleAddRole = () => {
        if (!newRoleName.trim()) {
            alert('Role name cannot be empty.');
            return;
        }
        addAdminRole({
            name: newRoleName,
            permissions: Array.from(newRolePermissions)
        });
        closeModal();
    };


    return (
        <div className="space-y-6">
             <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Role & Permission Management</h2>
                        <p className="text-gray-400">Define what users can see and do within the admin panel.</p>
                    </div>
                     <button onClick={openModal} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center mt-4 sm:mt-0">
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        Add New Role
                    </button>
                </div>
            </div>
            <div className="space-y-6">
                {adminRoles.map(role => (
                    <RoleCard key={role.id} role={role} />
                ))}
            </div>

            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4 text-white">Add New Role</h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleAddRole(); }} className="flex-grow flex flex-col overflow-hidden">
                            <div className="mb-4">
                                <label htmlFor="roleName" className="block text-sm font-medium text-gray-400">Role Name</label>
                                <input
                                    type="text"
                                    id="roleName"
                                    value={newRoleName}
                                    onChange={e => setNewRoleName(e.target.value)}
                                    required
                                    className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="e.g., Marketing Manager"
                                />
                            </div>

                            <p className="text-sm font-medium text-gray-400 mb-2">Assign Permissions</p>
                            <div className="flex-grow overflow-y-auto pr-2 -mr-2 border-t border-b border-gray-700 py-4 space-y-4">
                                {Object.entries(permissionGroups).map(([groupTitle, groupPermissions]) => (
                                     <CollapsibleSection
                                        key={groupTitle}
                                        title={groupTitle}
                                        permissions={groupPermissions}
                                        assignedPermissions={newRolePermissions}
                                        onPermissionChange={handlePermissionChange}
                                    />
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-700 flex-shrink-0">
                                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 font-semibold">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-500 font-semibold">
                                    Create Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;