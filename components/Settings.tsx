import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Icon from './icons/index.tsx';
import { StaffRole, TenantPermission, TenantAutomations } from '../types';
import { allCurrencies, allLanguages } from '../utils/data';

type SettingsTab = 'general' | 'branches' | 'staff' | 'roles' | 'automations' | 'security';

// FIX: Add 'accessSupport' permission label.
const permissionLabels: Record<TenantPermission, string> = {
    accessPOS: 'Access Point of Sale',
    manageInventory: 'Manage Inventory',
    viewReports: 'View Reports',
    manageStaff: 'Manage Staff Members',
    accessSettings: 'Access Settings',
    manageLogistics: 'Manage Logistics',
    managePurchases: 'Manage Purchases',
    accessAccounting: 'Access Accounting',
    viewAuditLogs: 'View Audit Logs',
    makeDeposits: 'Make Deposits',
    manageDeposits: 'Manage Deposits',
    accessReturns: 'Process Returns',
    accessSupport: 'Access Support',
};

// FIX: Add 'accessSupport' to the 'Administration' permission group.
const permissionGroups: Record<string, TenantPermission[]> = {
    'Sales & Operations': ['accessPOS', 'managePurchases', 'makeDeposits', 'accessReturns'],
    'Inventory & Logistics': ['manageInventory', 'manageLogistics'],
    'Administration': ['viewReports', 'manageStaff', 'accessSettings', 'accessAccounting', 'viewAuditLogs', 'manageDeposits', 'accessSupport'],
};

const CollapsiblePermissionSection: React.FC<{
    title: string;
    permissions: TenantPermission[];
    assignedPermissions: Set<TenantPermission>;
    onPermissionChange: (permission: TenantPermission, isChecked: boolean) => void;
}> = ({ title, permissions, assignedPermissions, onPermissionChange }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-slate-700/50 rounded-lg border border-slate-600">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left font-semibold"
            >
                <span className="text-white">{title}</span>
                <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} className="w-5 h-5 transition-transform text-slate-400" />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {permissions.map(permission => (
                        <label key={permission} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-600/50 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={assignedPermissions.has(permission)}
                                onChange={(e) => onPermissionChange(permission, e.target.checked)}
                                className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-slate-800"
                            />
                            <span className="text-slate-300">{permissionLabels[permission]}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const Toggle: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => {
    return (
        <button
            type="button"
            className={`${enabled ? 'bg-cyan-600' : 'bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
        >
            <span
                aria-hidden="true"
                className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    );
};


const SettingCard: React.FC<{ title: string, icon: string, description: string, children: React.ReactNode, actions?: React.ReactNode }> = ({ title, icon, description, children, actions }) => (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center">
                    <Icon name={icon} className="w-6 h-6 mr-3 text-cyan-400" />
                    {title}
                </h3>
                <p className="text-slate-400 mt-1">{description}</p>
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
        <div className="mt-6 border-t border-slate-700 pt-6">
            {children}
        </div>
    </div>
);

const Localization: React.FC = () => {
    const { currentTenant, systemSettings, updateCurrentTenantSettings } = useAppContext();

    const handleSettingChange = (setting: 'currency' | 'language', value: string) => {
        if (!currentTenant) return;
        updateCurrentTenantSettings({ [setting]: value });
    };

    return (
        <SettingCard title="Localization" icon="globe" description="Set your preferred language and currency. Changes are applied in real-time.">
            <div className="space-y-4 max-w-sm">
                <div>
                    <label className="block text-sm font-medium text-slate-400">Currency</label>
                    <select
                        value={currentTenant?.currency || systemSettings.defaultCurrency}
                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                        className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        {allCurrencies.map(c => (
                            <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400">Language</label>
                    <select
                        value={currentTenant?.language || systemSettings.defaultLanguage}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        {allLanguages.map(l => (
                            <option key={l.code} value={l.code}>{l.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </SettingCard>
    );
};

const Security: React.FC = () => {
    const { currentTenant, updateCurrentTenantSettings } = useAppContext();
    const [logoutTimeout, setLogoutTimeout] = useState(currentTenant?.logoutTimeout || 30);

    const handleSave = () => {
        updateCurrentTenantSettings({ logoutTimeout });
        alert('Security settings saved!');
    };
    
    return (
        <SettingCard 
            title="Security" 
            icon="shield-check" 
            description="Manage security settings for your tenant account."
            actions={<button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save</button>}
        >
            <div className="space-y-4 max-w-sm">
                <div>
                    <label className="block text-sm font-medium text-slate-400">Automatic Logout Timeout</label>
                    <div className="flex items-center space-x-3 mt-1">
                        <input
                            type="range"
                            min="5"
                            max="120"
                            step="5"
                            value={logoutTimeout}
                            onChange={(e) => setLogoutTimeout(Number(e.target.value))}
                            className="w-full"
                        />
                         <span className="font-semibold text-white bg-slate-700 px-3 py-1 rounded-md w-24 text-center">{logoutTimeout} mins</span>
                    </div>
                     <p className="text-xs text-slate-500 mt-2">Automatically log out users after a period of inactivity.</p>
                </div>
            </div>
        </SettingCard>
    );
};

const Branches: React.FC = () => {
    const { branches, addBranch } = useAppContext();
    const [newBranchName, setNewBranchName] = useState('');

    const handleAddBranch = () => {
        if (newBranchName.trim()) {
            addBranch(newBranchName.trim());
            setNewBranchName('');
        }
    };
    
    return (
        <SettingCard title="Branches" icon="briefcase" description="Manage your business locations.">
            <div className="space-y-4">
                <div className="flex gap-2">
                    <input type="text" value={newBranchName} onChange={e => setNewBranchName(e.target.value)} placeholder="New branch name" className="flex-grow bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-cyan-500"/>
                    <button onClick={handleAddBranch} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Add Branch</button>
                </div>
                <div className="space-y-2">
                    {branches.map(branch => (
                        <div key={branch.id} className="bg-slate-700/50 p-3 rounded-md flex justify-between items-center">
                            <span className="font-semibold text-white">{branch.name}</span>
                            {/* Edit/Delete functionality can be added here */}
                        </div>
                    ))}
                </div>
            </div>
        </SettingCard>
    )
}

const Staff: React.FC = () => {
    const { staff, staffRoles, addStaff } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [formState, setFormState] = useState({ name: '', email: '', username: '', password: '', roleId: staffRoles[0]?.id || '', branchId: '' });
    
    const roleMap = new Map(staffRoles.map(r => [r.id, r.name]));

    const handleAddStaff = () => {
        addStaff(formState);
        setModalOpen(false);
    }
    
    return (
        <SettingCard title="Staff" icon="users" description="Manage staff members and their access.">
            <div className="flex justify-end mb-4">
                <button onClick={() => setModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center"><Icon name="plus" className="w-5 h-5 mr-2" />Add Staff</button>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-700 text-xs text-slate-400 uppercase">
                        <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3 text-center">Actions</th></tr>
                    </thead>
                     <tbody>
                        {staff.map(s => (
                            <tr key={s.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                <td className="p-3">{s.name}</td><td className="p-3">{s.email}</td><td className="p-3">{roleMap.get(s.roleId)}</td>
                                <td className="p-3 text-center"><button className="text-yellow-400 font-semibold text-sm">Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
             {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add Staff Member</h3>
                         <div className="space-y-4">
                            <input type="text" placeholder="Full Name" onChange={e => setFormState({...formState, name: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md"/>
                            <input type="email" placeholder="Email" onChange={e => setFormState({...formState, email: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md"/>
                            <input type="text" placeholder="Username" onChange={e => setFormState({...formState, username: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md"/>
                            <input type="password" placeholder="Password" onChange={e => setFormState({...formState, password: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md"/>
                            <select onChange={e => setFormState({...formState, roleId: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md">{staffRoles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md bg-slate-600">Cancel</button>
                            <button onClick={handleAddStaff} className="px-4 py-2 rounded-md bg-cyan-600">Add</button>
                        </div>
                    </div>
                </div>
            )}
        </SettingCard>
    );
};

const Roles: React.FC = () => {
    const { staffRoles, addStaffRole, updateStaffRole, deleteStaffRole, allTenantPermissions } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<StaffRole | null>(null);
    const [formName, setFormName] = useState('');
    const [formPermissions, setFormPermissions] = useState<Set<TenantPermission>>(new Set());

    const openModal = (role: StaffRole | null = null) => {
        if (role) {
            setEditingRole(role);
            setFormName(role.name);
            setFormPermissions(new Set(role.permissions));
        } else {
            setEditingRole(null);
            setFormName('');
            setFormPermissions(new Set());
        }
        setModalOpen(true);
    };

    const handlePermissionChange = (permission: TenantPermission, isChecked: boolean) => {
        const newPermissions = new Set(formPermissions);
        if (isChecked) newPermissions.add(permission); else newPermissions.delete(permission);
        setFormPermissions(newPermissions);
    };

    const handleSubmit = () => {
        if (formName.trim()) {
            if (editingRole) {
                updateStaffRole(editingRole.id, Array.from(formPermissions));
            } else {
                addStaffRole({ name: formName, permissions: Array.from(formPermissions) });
            }
            setModalOpen(false);
        }
    };

    return (
         <SettingCard title="Roles & Permissions" icon="lock-closed" description="Define roles and control what staff can access.">
            <div className="flex justify-end mb-4">
                <button onClick={() => openModal()} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center"><Icon name="plus" className="w-5 h-5 mr-2" />Add Role</button>
            </div>
            <div className="space-y-3">
                {staffRoles.map(role => (
                    <div key={role.id} className="bg-slate-700/50 p-3 rounded-md flex justify-between items-center">
                        <span className="font-semibold">{role.name}</span>
                        <div className="space-x-2">
                           <button onClick={() => openModal(role)} className="text-yellow-400 font-semibold text-sm">Edit</button>
                           <button onClick={() => deleteStaffRole(role.id)} className="text-rose-400 font-semibold text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4">{editingRole ? 'Edit Role' : 'Add New Role'}</h3>
                        <div className="mb-4">
                            <label className="text-sm">Role Name</label>
                            <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md mt-1"/>
                        </div>
                         <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                            {Object.entries(permissionGroups).map(([groupTitle, groupPermissions]) => (
                                <CollapsiblePermissionSection
                                    key={groupTitle}
                                    title={groupTitle}
                                    permissions={groupPermissions}
                                    assignedPermissions={formPermissions}
                                    onPermissionChange={handlePermissionChange}
                                />
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md bg-slate-600">Cancel</button>
                            <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-cyan-600">Save Role</button>
                        </div>
                    </div>
                </div>
            )}
         </SettingCard>
    );
};

const Automations: React.FC = () => {
    const { currentTenant, updateTenantAutomations } = useAppContext();
    const [automations, setAutomations] = useState<TenantAutomations>(currentTenant?.automations || { generateEODReport: false, sendLowStockAlerts: false });

    useEffect(() => {
        setAutomations(currentTenant?.automations || { generateEODReport: false, sendLowStockAlerts: false });
    }, [currentTenant?.automations]);

    const handleToggle = (key: keyof TenantAutomations) => {
        const newAutomations = { ...automations, [key]: !automations[key] };
        setAutomations(newAutomations);
        updateTenantAutomations(newAutomations);
    };

    return (
        <SettingCard title="Automations" icon="settings" description="Automate repetitive tasks to save time.">
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                        <h4 className="font-semibold text-white">Generate End-of-Day Reports</h4>
                        <p className="text-sm text-slate-400">Automatically generate and email a sales summary at the end of each day.</p>
                    </div>
                    <Toggle enabled={automations.generateEODReport} onChange={() => handleToggle('generateEODReport')} />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                        <h4 className="font-semibold text-white">Send Low Stock Alerts</h4>
                        <p className="text-sm text-slate-400">Receive an in-app notification when an item's stock reaches its reorder point.</p>
                    </div>
                    <Toggle enabled={automations.sendLowStockAlerts} onChange={() => handleToggle('sendLowStockAlerts')} />
                </div>
            </div>
        </SettingCard>
    );
};


const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    
    const TabButton: React.FC<{tab: SettingsTab, label: string}> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === tab ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
            {label}
        </button>
    );

    const renderContent = () => {
        switch(activeTab) {
            case 'general': return <Localization />;
            case 'security': return <Security />;
            case 'branches': return <Branches />;
            case 'staff': return <Staff />;
            case 'roles': return <Roles />;
            case 'automations': return <Automations />;
            default: return <Localization />;
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Settings</h2>
                <p className="text-slate-400 mt-1">Manage your tenant account and operational settings.</p>
            </div>
             <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-2">
                <TabButton tab="general" label="General" />
                <TabButton tab="security" label="Security" />
                <TabButton tab="branches" label="Branches" />
                <TabButton tab="staff" label="Staff" />
                <TabButton tab="roles" label="Roles" />
                <TabButton tab="automations" label="Automations" />
            </div>
            {renderContent()}
        </div>
    );
};

export default Settings;