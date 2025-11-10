import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Icon from './icons/index.tsx';
import { Staff as StaffType, StaffRole, TenantPermission, TenantAutomations, Branch } from '../types';
import { allCurrencies, allLanguages, allTimezones } from '../utils/data';
import ConfirmationModal from './ConfirmationModal';
import GoogleMap from './GoogleMap';


type SettingsTab = 'general' | 'branches' | 'staff' | 'roles' | 'automations' | 'security';

// FIX: Added missing permission labels for 'manageTemplates' and 'sendCommunications' to satisfy the Record<TenantPermission, string> type.
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
    manageTemplates: 'Manage Templates',
    sendCommunications: 'Send Communications',
};

// FIX: Added missing permissions to the 'Administration' group so they appear in the UI.
const permissionGroups: Record<string, TenantPermission[]> = {
    'Sales & Operations': ['accessPOS', 'managePurchases', 'makeDeposits', 'accessReturns'],
    'Inventory & Logistics': ['manageInventory', 'manageLogistics'],
    'Administration': ['viewReports', 'manageStaff', 'accessSettings', 'accessAccounting', 'viewAuditLogs', 'manageDeposits', 'accessSupport', 'manageTemplates', 'sendCommunications'],
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
    const { currentTenant, systemSettings, updateCurrentTenantSettings, setNotification } = useAppContext();

    const [formState, setFormState] = useState({
        currency: currentTenant?.currency || systemSettings.defaultCurrency,
        language: currentTenant?.language || systemSettings.defaultLanguage,
        timezone: currentTenant?.timezone || systemSettings.defaultTimezone,
    });
    
    // Sync local state if currentTenant changes from outside
    useEffect(() => {
        if (currentTenant) {
            setFormState({
                currency: currentTenant.currency || systemSettings.defaultCurrency,
                language: currentTenant.language || systemSettings.defaultLanguage,
                timezone: currentTenant.timezone || systemSettings.defaultTimezone,
            });
        }
    }, [currentTenant, systemSettings]);
    
    const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSave = () => {
        updateCurrentTenantSettings(formState);
        setNotification({ type: 'success', message: 'Localization settings saved successfully!' });
    };
    
    const isDirty = useMemo(() => {
        if (!currentTenant) return false;
        return (
            formState.currency !== (currentTenant.currency || systemSettings.defaultCurrency) ||
            formState.language !== (currentTenant.language || systemSettings.defaultLanguage) ||
            formState.timezone !== (currentTenant.timezone || systemSettings.defaultTimezone)
        );
    }, [formState, currentTenant, systemSettings]);

    return (
        <SettingCard 
            title="Localization" 
            icon="globe" 
            description="Set your preferred language, currency, and timezone."
            actions={
                <button onClick={handleSave} disabled={!isDirty} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    Save
                </button>
            }
        >
            <div className="space-y-4 max-w-sm">
                <div>
                    <label className="block text-sm font-medium text-slate-400">Currency</label>
                    <select
                        name="currency"
                        value={formState.currency}
                        onChange={handleFormChange}
                        className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        {systemSettings.currencies.filter(c => c.enabled).map(c => (
                            <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400">Language</label>
                    <select
                        name="language"
                        value={formState.language}
                        onChange={handleFormChange}
                        className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        {systemSettings.languages.filter(l => l.enabled).map(l => (
                            <option key={l.code} value={l.code}>{l.name}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-400">Timezone</label>
                    <select
                        name="timezone"
                        value={formState.timezone}
                        onChange={handleFormChange}
                        className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        {allTimezones.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
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

const LocationEditModal: React.FC<{ branch: Branch; onClose: () => void; onSave: (location: { lat: number, lng: number }) => void; }> = ({ branch, onClose, onSave }) => {
    const [selectedLocation, setSelectedLocation] = useState(branch.location);
    
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col border border-slate-700">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-white">Set Location for {branch.name}</h3>
                    <p className="text-sm text-slate-400">Click on the map or drag the pin to set the location.</p>
                </div>
                <div className="flex-grow bg-slate-900">
                     {typeof window.L === 'undefined' ? <p className="p-4 text-center text-red-400">Map could not be loaded.</p> : (
                        <GoogleMap 
                            onClick={(latlng) => setSelectedLocation(latlng)}
                            editableBranch={{
                                branch: { ...branch, location: selectedLocation },
                                onPositionChange: (latlng) => setSelectedLocation(latlng)
                            }}
                        />
                     )}
                </div>
                <div className="p-4 flex justify-end gap-3 border-t border-slate-700">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-500 font-semibold">Cancel</button>
                    <button onClick={() => onSave(selectedLocation)} className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-500 font-semibold">Save Location</button>
                </div>
            </div>
        </div>
    );
};


const Branches: React.FC = () => {
    const { branches, addBranch, setNotification, updateBranchLocation } = useAppContext();
    const [newBranchName, setNewBranchName] = useState('');
    const [isLocationModalOpen, setLocationModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

    const openLocationModal = (branch: Branch) => {
        setEditingBranch(branch);
        setLocationModalOpen(true);
    };

    const handleAddBranch = () => {
        const trimmedName = newBranchName.trim();
        if (!trimmedName) {
            setNotification({ type: 'error', message: 'Branch name cannot be empty.' });
            return;
        }
        if (branches.some(b => b.name.toLowerCase() === trimmedName.toLowerCase())) {
            setNotification({ type: 'error', message: 'A branch with this name already exists.' });
            return;
        }
        
        addBranch(trimmedName);
        setNewBranchName('');
    };
    
    return (
        <SettingCard title="Branches" icon="briefcase" description="Manage your business locations and visualize them on a map.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input type="text" value={newBranchName} onChange={e => setNewBranchName(e.target.value)} placeholder="New branch name" className="flex-grow bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-cyan-500"/>
                        <button onClick={handleAddBranch} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Add</button>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {branches.map(branch => (
                            <div key={branch.id} className="bg-slate-700/50 p-3 rounded-md flex justify-between items-center">
                                <span className="font-semibold text-white">{branch.name}</span>
                                <button onClick={() => openLocationModal(branch)} className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm">
                                    {branch.location.lat === 0 && branch.location.lng === 0 ? 'Set Location' : 'Edit Location'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-900 rounded-lg overflow-hidden h-96 border border-slate-700">
                    {typeof window.L === 'undefined' ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <Icon name="x-mark" className="w-12 h-12 text-red-500 mb-2" />
                            <h4 className="font-bold text-white">Map Failed to Load</h4>
                            <p className="text-slate-400 text-sm">Please check your internet connection.</p>
                        </div>
                    ) : (
                        <GoogleMap branches={branches} />
                    )}
                </div>
            </div>

            {isLocationModalOpen && editingBranch && (
                <LocationEditModal 
                    branch={editingBranch}
                    onClose={() => setLocationModalOpen(false)}
                    onSave={(location) => {
                        updateBranchLocation(editingBranch.id, location);
                        setNotification({type: 'success', message: `${editingBranch.name} location updated.`});
                        setLocationModalOpen(false);
                    }}
                />
            )}
        </SettingCard>
    );
}

const Staff: React.FC = () => {
    const { staff, staffRoles, branches, addStaff, deleteStaff } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [deletingStaff, setDeletingStaff] = useState<StaffType | null>(null);
    const [formState, setFormState] = useState({ name: '', email: '', username: '', password: '', roleId: staffRoles[0]?.id || '', branchId: branches[0]?.id || '' });
    const [errors, setErrors] = useState<Partial<Record<keyof typeof formState, string>>>({});
    
    const roleMap = new Map(staffRoles.map(r => [r.id, r.name]));

    const openModal = () => {
        setFormState({ name: '', email: '', username: '', password: '', roleId: staffRoles[0]?.id || '', branchId: branches[0]?.id || '' });
        setErrors({});
        setModalOpen(true);
    };

    const validateStaffForm = () => {
        const newErrors: Partial<Record<keyof typeof formState, string>> = {};
        if (!formState.name.trim()) newErrors.name = 'Name is required.';
        
        if (!formState.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
            newErrors.email = 'Email format is invalid.';
        } else if (staff.some(s => s.email.toLowerCase() === formState.email.toLowerCase())) {
            newErrors.email = 'An account with this email already exists.';
        }

        if (!formState.username.trim()) {
            newErrors.username = 'Username is required.';
        } else if (staff.some(s => s.username.toLowerCase() === formState.username.toLowerCase())) {
            newErrors.username = 'This username is already taken.';
        }

        if (!formState.password || formState.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long.';
        }
        
        if (!formState.roleId) newErrors.roleId = 'A role must be selected.';
        if (!formState.branchId) newErrors.branchId = 'A branch must be assigned.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddStaff = () => {
        if (validateStaffForm()) {
            addStaff(formState);
            setModalOpen(false);
        }
    };
    
    return (
        <SettingCard title="Staff" icon="users" description="Manage staff members and their access.">
            <div className="flex justify-end mb-4">
                <button onClick={openModal} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center"><Icon name="plus" className="w-5 h-5 mr-2" />Add Staff</button>
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
                                <td className="p-3 text-center space-x-3">
                                    <button className="text-yellow-400 font-semibold text-sm">Edit</button>
                                    <button onClick={() => setDeletingStaff(s)} className="text-rose-400 font-semibold text-sm">Delete</button>
                                </td>
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
                            <div>
                                <label className="text-xs text-slate-400">Full Name</label>
                                <input type="text" placeholder="Full Name" onChange={e => setFormState({...formState, name: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md mt-1"/>
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Email</label>
                                <input type="email" placeholder="Email" onChange={e => setFormState({...formState, email: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md mt-1"/>
                                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Username</label>
                                <input type="text" placeholder="Username" onChange={e => setFormState({...formState, username: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md mt-1"/>
                                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Password</label>
                                <input type="password" placeholder="Password" onChange={e => setFormState({...formState, password: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md mt-1"/>
                                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Role</label>
                                <select onChange={e => setFormState({...formState, roleId: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md mt-1">{staffRoles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>
                                {errors.roleId && <p className="text-red-400 text-xs mt-1">{errors.roleId}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Branch</label>
                                <select onChange={e => setFormState({...formState, branchId: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md mt-1" value={formState.branchId}>
                                    {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                {errors.branchId && <p className="text-red-400 text-xs mt-1">{errors.branchId}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md bg-slate-600">Cancel</button>
                            <button onClick={handleAddStaff} className="px-4 py-2 rounded-md bg-cyan-600">Add</button>
                        </div>
                    </div>
                </div>
            )}
             <ConfirmationModal
                isOpen={!!deletingStaff}
                onClose={() => setDeletingStaff(null)}
                onConfirm={() => {
                    if (deletingStaff) {
                        deleteStaff(deletingStaff.id);
                    }
                }}
                title={`Delete Staff Member: ${deletingStaff?.name}`}
                confirmText="Delete"
            >
                Are you sure you want to delete this staff member? This action cannot be undone.
            </ConfirmationModal>
        </SettingCard>
    );
};

const Roles: React.FC = () => {
    const { staffRoles, addStaffRole, updateStaffRole, deleteStaffRole, setNotification } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<StaffRole | null>(null);
    const [formName, setFormName] = useState('');
    const [formPermissions, setFormPermissions] = useState<Set<TenantPermission>>(new Set());
    const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
    const roleToDelete = useMemo(() => staffRoles.find(r => r.id === deletingRoleId), [deletingRoleId, staffRoles]);

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
        const trimmedName = formName.trim();
        if (!trimmedName) {
            setNotification({ type: 'error', message: 'Role name cannot be empty.' });
            return;
        }

        if (editingRole) {
            // Name editing is disabled in the UI, so we only update permissions
            updateStaffRole(editingRole.id, Array.from(formPermissions));
            setModalOpen(false);
        } else {
            // Validate for new roles
            if (staffRoles.some(role => role.name.toLowerCase() === trimmedName.toLowerCase())) {
                setNotification({ type: 'error', message: 'A role with this name already exists.' });
                return;
            }
            addStaffRole({ name: trimmedName, permissions: Array.from(formPermissions) });
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
                           <button onClick={() => setDeletingRoleId(role.id)} className="text-rose-400 font-semibold text-sm">Delete</button>
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
                            <input
                                type="text"
                                value={formName}
                                onChange={e => setFormName(e.target.value)}
                                className="w-full bg-slate-700 p-2 rounded-md mt-1 read-only:bg-slate-800 read-only:cursor-not-allowed"
                                readOnly={!!editingRole}
                            />
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
             <ConfirmationModal
                isOpen={!!roleToDelete}
                onClose={() => setDeletingRoleId(null)}
                onConfirm={() => {
                    if (deletingRoleId) {
                        deleteStaffRole(deletingRoleId);
                    }
                }}
                title={`Delete Role: ${roleToDelete?.name}`}
                confirmText="Delete"
            >
                Are you sure you want to delete this role? This action cannot be undone.
            </ConfirmationModal>
         </SettingCard>
    );
};

const Automations: React.FC = () => {
    const { currentTenant, updateTenantAutomations } = useAppContext();
    const [automations, setAutomations] = useState<TenantAutomations>(currentTenant?.automations || { generateEODReport: false, sendLowStockAlerts: false, sendCreditLimitAlerts: false });

    useEffect(() => {
        setAutomations(currentTenant?.automations || { generateEODReport: false, sendLowStockAlerts: false, sendCreditLimitAlerts: false });
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
                 <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                        <h4 className="font-semibold text-white">Credit Limit Alerts</h4>
                        <p className="text-sm text-slate-400">Receive an in-app notification when a customer approaches or exceeds their credit limit.</p>
                    </div>
                    <Toggle enabled={automations.sendCreditLimitAlerts} onChange={() => handleToggle('sendCreditLimitAlerts')} />
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