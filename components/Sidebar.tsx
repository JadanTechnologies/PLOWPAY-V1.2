

import React, { useMemo } from 'react';
import { Page } from '../App';
import Icon from './icons/index.tsx';
import { useTranslation } from '../hooks/useTranslation';
import { useAppContext } from '../hooks/useAppContext';
import { TenantPermission } from '../types';

interface SidebarProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  page: Page;
  iconName: string;
  label: string;
  currentPage: Page;
  setPage: (page: Page) => void;
  isSidebarOpen: boolean;
}> = ({ page, iconName, label, currentPage, setPage, isSidebarOpen }) => {
  const isActive = currentPage === page;
  return (
    <li className="relative px-2">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setPage(page);
        }}
        className={`group flex items-center p-3 my-1 rounded-lg transition-all duration-200 relative ${
          isActive
            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/20'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Icon name={iconName} className="w-6 h-6 flex-shrink-0" />
        <span
          className={`ml-4 whitespace-nowrap transition-all duration-200 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'
          }`}
        >
          {label}
        </span>
        {!isSidebarOpen && (
          <div className="absolute left-full ml-4 w-auto min-w-max px-3 py-2 text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 border border-slate-200 dark:border-slate-700">
            {label}
          </div>
        )}
      </a>
    </li>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage, isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const { currentStaffUser, staffRoles } = useAppContext();

  const userPermissions = useMemo(() => {
    if (!currentStaffUser) return new Set<TenantPermission>();
    const role = staffRoles.find(r => r.id === currentStaffUser.roleId);
    return new Set(role?.permissions || []);
  }, [currentStaffUser, staffRoles]);
  
  const navItemConfig: { page: Page; icon: string; label: string; permission?: TenantPermission }[] = [
    { page: 'DASHBOARD', icon: 'layout-grid', label: t('dashboard') },
    { page: 'POS', icon: 'pos', label: t('pos'), permission: 'accessPOS' },
    { page: 'INVENTORY', icon: 'inventory', label: t('inventory'), permission: 'manageInventory' },
    { page: 'PURCHASES', icon: 'clipboard-document-list', label: t('purchases'), permission: 'managePurchases' },
    { page: 'CONSIGNMENT', icon: 'briefcase', label: t('consignment') },
    { page: 'LOGISTICS', icon: 'truck', label: t('logistics'), permission: 'manageLogistics' },
    { page: 'CREDIT_MANAGEMENT', icon: 'users', label: t('creditManagement') },
    { page: 'DEPOSIT_MANAGEMENT', icon: 'cash', label: t('depositmanagement'), permission: 'manageDeposits' },
    { page: 'ACCOUNTING', icon: 'calculator', label: t('accounting'), permission: 'accessAccounting' },
    { page: 'REPORTS', icon: 'chart-bar', label: t('reports'), permission: 'viewReports' },
    { page: 'SUPPORT', icon: 'chat-bubble-left-right', label: 'Support', permission: 'accessSupport' },
    { page: 'BILLING', icon: 'credit-card', label: t('billing') },
  ];
  
  // FIX: Added explicit type annotation to ensure permission property is typed as TenantPermission.
  const bottomNavItems: { page: Page; icon: string; label: string; permission?: TenantPermission }[] = [
      { page: 'AUDIT_LOGS', icon: 'shield-check', label: t('auditLogs'), permission: 'viewAuditLogs' },
      { page: 'PROFILE', icon: 'user', label: t('profile') },
      { page: 'SETTINGS', icon: 'settings', label: t('settings'), permission: 'accessSettings' },
  ]

  const visibleNavItems = navItemConfig.filter(item => !item.permission || userPermissions.has(item.permission));
  const visibleBottomNavItems = bottomNavItems.filter(item => !item.permission || userPermissions.has(item.permission));

  return (
    <aside
      className={`relative flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out z-20 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className={`flex h-16 shrink-0 items-center border-b border-slate-200 dark:border-slate-800 ${isOpen ? 'px-4' : 'px-0 justify-center'}`}>
        <div className={`flex items-center ${isOpen ? '' : 'w-full justify-center'}`}>
            <svg className="w-8 h-8 text-cyan-500 dark:text-cyan-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.54-.403 1.25-.624 1.968-.624a4.58 4.58 0 0 1 .844.119" />
            </svg>
            <span className={`ml-2 text-xl font-bold text-slate-800 dark:text-white whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>FlowPay</span>
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        <ul>
            {visibleNavItems.map(item => (
                <NavItem 
                    key={item.page}
                    page={item.page as Page}
                    iconName={item.icon}
                    label={item.label}
                    currentPage={currentPage}
                    setPage={setPage}
                    isSidebarOpen={isOpen}
                />
            ))}
        </ul>
      </nav>
      
       <div className="mt-auto p-2 border-t border-slate-200 dark:border-slate-800">
        <ul>
            {visibleBottomNavItems.map(item => (
                <NavItem 
                    key={item.page}
                    page={item.page as Page}
                    iconName={item.icon}
                    label={item.label}
                    currentPage={currentPage}
                    setPage={setPage}
                    isSidebarOpen={isOpen}
                />
            ))}
        </ul>
        <div className="px-2">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="w-full flex items-center justify-center p-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                <Icon name={isOpen ? 'chevronLeft' : 'chevronRight'} className="w-6 h-6" />
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;