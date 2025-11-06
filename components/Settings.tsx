import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './icons';
import { StaffRole, TenantPermission } from '../types';

type SettingsTab = 'general' | 'branches' | 'staff' | 'roles';

const permissionLabels: Record<TenantPermission, string> = {
    accessPOS: 'Access Point of Sale',
    manageInventory: 'Manage Inventory',
    viewReports: 'View Reports',
    manageStaff: 'Manage Staff Members',
    accessSettings: 'Access Settings',
    manageLogistics: 'Manage Logistics',
    managePurchases: 'Manage Purchases',
    accessAccounting: 'Access Accounting',
};

const permissionGroups: Record<string, TenantPermission[]> = {
    'Sales & Operations': ['accessPOS', 'managePurchases'],
    'Inventory & Logistics': ['manageInventory', 'manageLogistics'],
    'Administration': ['viewReports', 'manageStaff', 'accessSettings', 'accessAccounting'],
};

const CollapsiblePermissionSection: React.FC<{
    title: string;
    permissions: TenantPermission[];
    assignedPermissions: Set<TenantPermission>;
    onPermissionChange: (permission: TenantPermission, isChecked: boolean) => void;
}> = ({ title, permissions, assignedPermissions, onPermissionChange }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-gray-700/50 rounded-lg border border-gray-600">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left font-semibold"
            >
                <span className="text-white">{title}</span>
                <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} className="w-5 h-5 transition-transform text-gray-400" />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {permissions.map(permission => (
                        <label key={permission} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-600/50 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={assignedPermissions.has(permission)}
                                onChange={(e) => onPermissionChange(permission, e.target.checked)}
                                className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-indigo-500 focus:ring-indigo-600 focus:ring-offset-gray-800"
                            />
                            <span className="text-gray-300">{permissionLabels[permission]}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};


const Settings: React.FC = () => {
    const { 
        branches, staff, staffRoles, allTenantPermissions, 
        addBranch, addStaff, addStaffRole, updateStaffRole, deleteStaffRole 
    } = useAppContext();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    // Modals
    const [isBranchModalOpen, setBranchModalOpen] = useState(false);
    const [isStaffModalOpen, setStaffModalOpen] = useState(false);
    const [isRoleModalOpen, setRoleModalOpen] = useState(false);
    
    // Forms
    const [branchForm, setBranchForm] = useState({ name: '' });
    const [staffForm, setStaffForm] = useState({ name: '', email: '', username: '', password: '', roleId: staffRoles[0]?.id || '', branchId: branches[0]?.id || '' });
    const [roleForm, setRoleForm] = useState<{ id: string | null; name: string; permissions: Set<TenantPermission> }>({ id: null, name: '', permissions: new Set() });
    
    const roleMap = new Map(staffRoles.map(r => [r.id, r.name]));
    const branchMap = new Map(branches.map(b => [b.id, b.name]));

    // Branch Handlers
    const handleAddBranch = () => {
        if(branchForm.name.trim()) {
            addBranch(branchForm.name);
            setBranchForm({ name: '' });
            setBranchModalOpen(false);
        }
    };

    // Staff Handlers
    const handleAddStaff = () => {
        if(staffForm.name && staffForm.email && staffForm.username && staffForm.password && staffForm.roleId && staffForm.branchId) {
            addStaff(staffForm);
            setStaffForm({ name: '', email: '', username: '', password: '', roleId: staffRoles[0]?.id || '', branchId: branches[0]?.id || '' });
            setStaffModalOpen(false);
        } else {
            alert('Please fill all fields');
        }
    };
    
    // Role Handlers
    const openRoleModal = (role: StaffRole | null = null) => {
        if(role) {
            setRoleForm({ id: role.id, name: role.name, permissions: new Set(role.permissions) });
        } else {
            setRoleForm({ id: null, name: '', permissions: new Set() });
        }
        setRoleModalOpen(true);
    };

    const handleRolePermissionChange = (permission: TenantPermission, isChecked: boolean) => {
        setRoleForm(prev => {
            const newPermissions = new Set(prev.permissions);
            if (isChecked) newPermissions.add(permission);
            else newPermissions.delete(permission);
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleSaveRole = () => {
        if (!roleForm.name.trim()) {
            alert("Role name cannot be empty.");
            return;
        }
        if (roleForm.id) {
            updateStaffRole(roleForm.id, Array.from(roleForm.permissions));
        } else {
            addStaffRole({ name: roleForm.name, permissions: Array.from(roleForm.permissions) });
        }
        setRoleModalOpen(false);
    };
    
    const handleDeleteRole = (roleId: string) => {
        if(window.confirm("Are you sure you want to delete this role?")) {
            deleteStaffRole(roleId);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                 return (
                    <div className="max-w-2xl space-y-6">
                        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                            <h3 className="text-xl font-semibold mb-4 text-white">Business Profile</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Business Name</label>
                                    <input type="text" defaultValue="Tenant Business" className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Address</label>
                                    <input type="text" defaultValue="123 Main St, Anytown, USA" className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Phone</label>
                                    <input type="text" defaultValue="(555) 123-4567" className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                            <h3 className="text-xl font-semibold mb-4 text-white">Localization</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Currency</label>
                                    <select className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md">
                                        <option>USD ($)</option>
                                        <option>EUR (€)</option>
                                        <option>GBP (£)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Timezone</label>
                                    <select className="w-full mt-1 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md">
                                        <option>(GMT-05:00) Eastern Time</option>
                                        <option>(GMT-06:00) Central Time</option>
                                        <option>(GMT-08:00) Pacific Time</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md">Save Changes</button>
                        </div>
                    </div>
                );
            case 'branches':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-white">Manage Branches</h3>
                            <button onClick={() => setBranchModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center"><Icon name="plus" className="w-5 h-5 mr-2" />Add Branch</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                           {branches.map(branch => {
                                const staffCount = staff.filter(s => s.branchId === branch.id).length;
                                return (
                                    <div key={branch.id} className="p-4 bg-gray-700 rounded-md flex justify-between items-center shadow-md">
                                        <span className="font-semibold text-white">{branch.name}</span>
                                        <span className="text-sm text-gray-300 bg-gray-800 px-2 py-1 rounded-full flex items-center gap-2">
                                            <Icon name="users" className="w-4 h-4" />
                                            {staffCount} Staff
                                        </span>
                                    </div>
                                );
                           })}
                        </div>
                    </div>
                );
            case 'staff':
                return (
                     <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-white">Manage Staff</h3>
                            <button onClick={() => setStaffModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center"><Icon name="plus" className="w-5 h-5 mr-2" />Add Staff</button>
                        </div>
                        <div className="overflow-x-auto bg-gray-900/50 rounded-lg">
                           <table className="w-full text-left">
                               <thead className="border-b border-gray-700"><tr><th className="p-3 text-sm font-semibold tracking-wide">Name</th><th className="p-3 text-sm font-semibold tracking-wide">Email</th><th className="p-3 text-sm font-semibold tracking-wide">Branch</th><th className="p-3 text-sm font-semibold tracking-wide">Role</th></tr></thead>
                               <tbody>
                                {staff.map(s => <tr key={s.id} className="border-b border-gray-700 hover:bg-gray-700/50"><td className="p-3 font-medium">{s.name}</td><td className="p-3 text-gray-400">{s.email}</td><td className="p-3">{branchMap.get(s.branchId)}</td><td className="p-3">{roleMap.get(s.roleId)}</td></tr>)}
                               </tbody>
                           </table>
                        </div>
                    </div>
                );
            case 'roles':
                return (
                     <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-white">Roles & Permissions</h3>
                            <button onClick={() => openRoleModal()} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center"><Icon name="plus" className="w-5 h-5 mr-2" />Add Role</button>
                        </div>
                         <div className="space-y-4">
                            {staffRoles.map(role => (
                                <div key={role.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-lg text-white">{role.name}</h4>
                                        <div className="space-x-3">
                                            <button onClick={() => openRoleModal(role)} className="text-yellow-400 text-sm font-semibold hover:text-yellow-300">Edit</button>
                                            <button onClick={() => handleDeleteRole(role.id)} className="text-red-500 text-sm font-semibold hover:text-red-400">Delete</button>
                                        </div>
                                    </div>
                                    <ul className="text-sm text-gray-300 grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {role.permissions.map(p => <li key={p} className="flex items-center"><Icon name="check" className="w-4 h-4 mr-2 text-green-500"/>{permissionLabels[p]}</li>)}
                                    </ul>
                                </div>
                            ))}
                         </div>
                    </div>
                );
        }
    };

    const TabButton: React.FC<{tab: SettingsTab, label: string}> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
            {label}
        </button>
    );

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
            <div className="flex space-x-2 border-b border-gray-700 mb-6">
                <TabButton tab="general" label="General" />
                <TabButton tab="branches" label="Branches" />
                <TabButton tab="staff" label="Staff" />
                <TabButton tab="roles" label="Roles & Permissions" />
            </div>
            <div>
                {renderTabContent()}
            </div>

            {/* Modals */}
            {isBranchModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-white">Add New Branch</h3>
                        <div><label className="text-sm text-gray-400">Branch Name</label><input type="text" value={branchForm.name} onChange={e => setBranchForm({name: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1 text-white border border-gray-600 focus:ring-indigo-500"/></div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={() => setBranchModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 font-semibold">Cancel</button><button onClick={handleAddBranch} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 font-semibold">Save</button></div>
                    </div>
                </div>
            )}
            {isStaffModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-white">Add New Staff Member</h3>
                        <div className="space-y-4">
                            <div><label className="text-sm text-gray-400">Full Name</label><input type="text" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1 text-white border border-gray-600 focus:ring-indigo-500"/></div>
                            <div><label className="text-sm text-gray-400">Email</label><input type="email" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1 text-white border border-gray-600 focus:ring-indigo-500"/></div>
                            <div><label className="text-sm text-gray-400">Username</label><input type="text" value={staffForm.username} onChange={e => setStaffForm({...staffForm, username: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1 text-white border border-gray-600 focus:ring-indigo-500"/></div>
                            <div><label className="text-sm text-gray-400">Password</label><input type="password" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1 text-white border border-gray-600 focus:ring-indigo-500"/></div>
                            <div><label className="text-sm text-gray-400">Branch</label><select value={staffForm.branchId} onChange={e => setStaffForm({...staffForm, branchId: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1 text-white border border-gray-600 focus:ring-indigo-500">{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                            <div><label className="text-sm text-gray-400">Role</label><select value={staffForm.roleId} onChange={e => setStaffForm({...staffForm, roleId: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1 text-white border border-gray-600 focus:ring-indigo-500">{staffRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={() => setStaffModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 font-semibold">Cancel</button><button onClick={handleAddStaff} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 font-semibold">Save</button></div>
                    </div>
                </div>
            )}
            {isRoleModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4 text-white">{roleForm.id ? 'Edit' : 'Add'} Role</h3>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-400">Role Name</label>
                            <input type="text" value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1 text-white border border-gray-600 focus:ring-indigo-500"/>
                        </div>
                        <h4 className="mb-2 font-semibold text-white">Permissions</h4>
                        <div className="space-y-3 flex-grow overflow-y-auto pr-2 -mr-2">
                           {Object.entries(permissionGroups).map(([groupTitle, groupPermissions]) => (
                                <CollapsiblePermissionSection
                                    key={groupTitle}
                                    title={groupTitle}
                                    permissions={groupPermissions}
                                    assignedPermissions={roleForm.permissions}
                                    onPermissionChange={handleRolePermissionChange}
                                />
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
                            <button onClick={() => setRoleModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 font-semibold">Cancel</button>
                            <button onClick={handleSaveRole} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 font-semibold">Save Role</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;