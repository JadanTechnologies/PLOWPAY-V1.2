import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { AdminUser, AdminUserStatus, Permission } from '../../types';
import Icon from '../icons/index.tsx';
import { usePermissions } from '../../hooks/usePermissions';

// FIX: Added 'manageSupport' to permissionLabels to include all possible permissions.
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
};

const TeamManagement: React.FC = () => {
    const { adminUsers, adminRoles, addAdminUser, updateAdminUser } = useAppContext();
    const { hasPermission } = usePermissions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', roleId: adminRoles[1]?.id || '' });

    const roleMap = new Map(adminRoles.map(r => [r.id, r.name]));

    const openModal = (user: AdminUser | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ name: user.name, email: user.email, roleId: user.roleId });
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '', roleId: adminRoles.find(r => r.name === 'Support')?.id || adminRoles[0]?.id || '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            updateAdminUser(editingUser.id, { name: formData.name, email: formData.email, roleId: formData.roleId });
        } else {
            addAdminUser({ name: formData.name, email: formData.email, roleId: formData.roleId });
        }
        closeModal();
    };
    
    const toggleUserStatus = (user: AdminUser) => {
        const newStatus: AdminUserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        updateAdminUser(user.id, { status: newStatus });
    };

    const getStatusBadge = (status: AdminUserStatus) => {
        const styles: {[key in AdminUserStatus]: string} = {
            ACTIVE: 'bg-green-500/20 text-green-300',
            SUSPENDED: 'bg-red-500/20 text-red-300',
        };
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
                {status}
            </span>
        );
    };
    
    const canManage = hasPermission('manageTeam');

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Team Management</h2>
                {canManage && (
                    <button onClick={() => openModal()} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        Add Team Member
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-3 text-sm font-semibold tracking-wide">Name</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">Email</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">Role</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-center">Status</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">Join Date</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">Last Login IP</th>
                            {canManage && <th className="p-3 text-sm font-semibold tracking-wide text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {adminUsers.map(user => (
                            <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-3 whitespace-nowrap font-medium">{user.name}</td>
                                <td className="p-3 whitespace-nowrap text-gray-400">{user.email}</td>
                                <td className="p-3 whitespace-nowrap">{roleMap.get(user.roleId) || 'Unknown Role'}</td>
                                <td className="p-3 whitespace-nowrap text-center">{getStatusBadge(user.status)}</td>
                                <td className="p-3 whitespace-nowrap text-gray-400">{user.joinDate.toLocaleDateString()}</td>
                                <td className="p-3 whitespace-nowrap text-gray-400 font-mono">{user.lastLoginIp || 'N/A'}</td>
                                {canManage && (
                                    <td className="p-3 text-center whitespace-nowrap space-x-2">
                                         <button onClick={() => openModal(user)} className="text-yellow-400 hover:text-yellow-300 font-semibold px-2 py-1 rounded-md text-sm">Edit</button>
                                         <button onClick={() => toggleUserStatus(user)} className={`${user.status === 'ACTIVE' ? 'text-rose-400 hover:text-rose-300' : 'text-green-400 hover:text-green-300'} font-semibold px-2 py-1 rounded-md text-sm`}>
                                            {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                         </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {adminUsers.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No team members found.</p>
                )}
            </div>

            {isModalOpen && canManage && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-white">{editingUser ? 'Edit Team Member' : 'Add Team Member'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-400">Full Name</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email Address</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} required className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                             <div>
                                <label htmlFor="roleId" className="block text-sm font-medium text-gray-400">Role</label>
                                <select id="roleId" name="roleId" value={formData.roleId} onChange={handleFormChange} className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    {adminRoles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                             {formData.roleId && (
                                <div className="p-3 bg-gray-900/50 rounded-md border border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Role Permissions:</h4>
                                    <ul className="text-xs text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-1">
                                        {adminRoles.find(r => r.id === formData.roleId)?.permissions.map(p => (
                                            <li key={p} className="flex items-center truncate">
                                                <Icon name="check" className="w-4 h-4 mr-2 text-cyan-400 flex-shrink-0" />
                                                <span className="truncate" title={permissionLabels[p] || p}>{permissionLabels[p] || p}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-700">
                                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 font-semibold">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-500 font-semibold">
                                    {editingUser ? 'Save Changes' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagement;