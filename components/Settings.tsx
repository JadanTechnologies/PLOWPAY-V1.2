
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './icons';
import { Branch, Staff, StaffRole, TenantPermission } from '../types';

type SettingsTab = 'general' | 'branches' | 'staff' | 'roles';

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
                    <div className="text-center p-8">
                        <Icon name="settings" className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">General Settings</h2>
                        <p className="text-gray-400">Manage your business profile, subscription, and billing information here. (Under Construction)</p>
                    </div>
                );
            case 'branches':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Manage Branches</h3>
                            <button onClick={() => setBranchModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center"><Icon name="plus" className="w-5 h-5 mr-2" />Add Branch</button>
                        </div>
                        <ul className="space-y-2 bg-gray-900/50 rounded-lg p-4">
                            {branches.map(branch => <li key={branch.id} className="p-3 bg-gray-700 rounded-md">{branch.name}</li>)}
                        </ul>
                    </div>
                );
            case 'staff':
                return (
                     <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Manage Staff</h3>
                            <button onClick={() => setStaffModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center"><Icon name="plus" className="w-5 h-5 mr-2" />Add Staff</button>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                               <thead className="border-b border-gray-700"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Branch</th><th className="p-3">Role</th></tr></thead>
                               <tbody>
                                {staff.map(s => <tr key={s.id} className="border-b border-gray-700 hover:bg-gray-700/50"><td className="p-3">{s.name}</td><td className="p-3">{s.email}</td><td className="p-3">{branchMap.get(s.branchId)}</td><td className="p-3">{roleMap.get(s.roleId)}</td></tr>)}
                               </tbody>
                           </table>
                        </div>
                    </div>
                );
            case 'roles':
                return (
                     <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Roles & Permissions</h3>
                            <button onClick={() => openRoleModal()} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center"><Icon name="plus" className="w-5 h-5 mr-2" />Add Role</button>
                        </div>
                         <div className="space-y-4">
                            {staffRoles.map(role => (
                                <div key={role.id} className="bg-gray-900/50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-lg">{role.name}</h4>
                                        <div className="space-x-2">
                                            <button onClick={() => openRoleModal(role)} className="text-yellow-400 text-sm font-semibold">Edit</button>
                                            <button onClick={() => handleDeleteRole(role.id)} className="text-red-500 text-sm font-semibold">Delete</button>
                                        </div>
                                    </div>
                                    <ul className="text-sm text-gray-400 grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {role.permissions.map(p => <li key={p} className="flex items-center"><Icon name="check" className="w-4 h-4 mr-2 text-green-500"/>{p}</li>)}
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
                        <h3 className="text-xl font-bold mb-4">Add New Branch</h3>
                        <div><label className="text-sm">Branch Name</label><input type="text" value={branchForm.name} onChange={e => setBranchForm({name: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={() => setBranchModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button><button onClick={handleAddBranch} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500">Save</button></div>
                    </div>
                </div>
            )}
            {isStaffModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add New Staff Member</h3>
                        <div className="space-y-4">
                            <div><label className="text-sm">Full Name</label><input type="text" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Email</label><input type="email" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Username</label><input type="text" value={staffForm.username} onChange={e => setStaffForm({...staffForm, username: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Password</label><input type="password" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Branch</label><select value={staffForm.branchId} onChange={e => setStaffForm({...staffForm, branchId: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1">{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                            <div><label className="text-sm">Role</label><select value={staffForm.roleId} onChange={e => setStaffForm({...staffForm, roleId: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1">{staffRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={() => setStaffModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button><button onClick={handleAddStaff} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500">Save</button></div>
                    </div>
                </div>
            )}
            {isRoleModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                        <h3 className="text-xl font-bold mb-4">{roleForm.id ? 'Edit' : 'Add'} Role</h3>
                        <div className="mb-4"><label className="text-sm">Role Name</label><input type="text" value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                        <h4 className="mb-2 font-semibold">Permissions</h4>
                        <div className="grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-md">
                            {allTenantPermissions.map(p => <label key={p} className="flex items-center"><input type="checkbox" checked={roleForm.permissions.has(p)} onChange={e => handleRolePermissionChange(p, e.target.checked)} className="h-4 w-4 mr-2 bg-gray-600 border-gray-500 text-indigo-500 focus:ring-indigo-600" />{p}</label>)}
                        </div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={() => setRoleModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button><button onClick={handleSaveRole} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500">Save Role</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
