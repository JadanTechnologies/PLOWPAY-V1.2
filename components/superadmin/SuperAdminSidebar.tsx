import React from 'react';
import { SuperAdminPage } from '../../App';
import Icon from '../icons/index.tsx';
import { usePermissions } from '../../hooks/usePermissions';

interface SidebarProps {
  currentPage: SuperAdminPage;
  setPage: (page: SuperAdminPage) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  page: SuperAdminPage;
  iconName: string;
  label: string;
  currentPage: SuperAdminPage;
  setPage: (page: SuperAdminPage) => void;
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
            ? 'text-white'
            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
        }`}
      >
        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 opacity-30 rounded-lg"></div>}
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-cyan-400 rounded-r-full"></div>}
        <Icon name={iconName} className="w-6 h-6 flex-shrink-0" />
        <span
          className={`ml-4 whitespace-nowrap transition-all duration-200 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'
          }`}
        >
          {label}
        </span>
        {!isSidebarOpen && (
          <div className="absolute left-full ml-4 w-auto min-w-max px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 border border-slate-700">
            {label}
          </div>
        )}
      </a>
    </li>
  );
};


const SuperAdminSidebar: React.FC<SidebarProps> = ({ currentPage, setPage, isOpen, setIsOpen }) => {
  const { hasPermission } = usePermissions();

  const navItems = [
    { page: 'PLATFORM_DASHBOARD', icon: 'chart-pie', label: 'Dashboard', permission: 'viewPlatformDashboard' },
    { page: 'TENANTS', icon: 'briefcase', label: 'Tenants', permission: 'manageTenants' },
    { page: 'FLEET_OVERVIEW', icon: 'truck', label: 'Fleet Overview', permission: 'manageTenants' },
    { page: 'SUBSCRIPTIONS', icon: 'credit-card', label: 'Subscriptions', permission: 'manageSubscriptions' },
    { page: 'PAYMENT_TRANSACTIONS', icon: 'calculator', label: 'Transactions', permission: 'managePaymentGateways' },
    { page: 'ANNOUNCEMENTS', icon: 'chat-bubble-left-right', label: 'Announcements', permission: 'manageAnnouncements' },
    { page: 'COMMUNICATIONS', icon: 'at-symbol', label: 'Communications', permission: 'manageNotificationSettings' },
    { page: 'SUPPORT_TICKETS', icon: 'chat-bubble-left-right', label: 'Support Tickets', permission: 'manageSupport' },
    { page: 'BLOG_MANAGEMENT', icon: 'clipboard-document-list', label: 'Blog Management', permission: 'manageBlog' },
    { page: 'TEAM_MANAGEMENT', icon: 'users', label: 'Team', permission: 'manageTeam' },
    { page: 'ROLE_MANAGEMENT', icon: 'lock-closed', label: 'Roles', permission: 'manageRoles' },
    { page: 'AUDIT_LOGS', icon: 'shield-check', label: 'Audit Logs', permission: 'viewAuditLogs' },
  ] as const;

  const bottomNavItems = [
    { page: 'PROFILE', icon: 'user', label: 'Profile', permission: 'viewPlatformDashboard'}, // All admins can see their own profile
    { page: 'SETTINGS', icon: 'settings', label: 'Settings', permission: 'manageSystemSettings' },
    { page: 'PAYMENT_GATEWAYS', icon: 'cash', label: 'Payment Gateways', permission: 'managePaymentGateways' },
    { page: 'NOTIFICATIONS', icon: 'notification', label: 'Notifications', permission: 'manageNotificationSettings' },
    { page: 'TEMPLATE_MANAGEMENT', icon: 'clipboard-document-list', label: 'Templates', permission: 'manageNotificationSettings' },
    { page: 'MAINTENANCE', icon: 'settings', label: 'Maintenance', permission: 'manageSystemSettings' },
    { page: 'ACCESS_MANAGEMENT', icon: 'lock-closed', label: 'Access Management', permission: 'manageSystemSettings' },
  ] as const;

  return (
    <aside
      className={`relative flex flex-col bg-slate-900/70 backdrop-blur-xl border-r border-slate-800 text-white transition-all duration-300 ease-in-out z-20 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
       <div className={`flex h-16 shrink-0 items-center border-b border-slate-800 ${isOpen ? 'px-4' : 'px-0 justify-center'}`}>
        <div className={`flex items-center ${isOpen ? '' : 'w-full justify-center'}`}>
            <Icon name="globe" className="w-8 h-8 text-cyan-400 flex-shrink-0" />
            <span className={`ml-2 text-xl font-bold whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>FlowPay Admin</span>
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        <ul>
            {navItems.map(item => (
              hasPermission(item.permission) && (
                <NavItem 
                    key={item.page}
                    page={item.page as SuperAdminPage}
                    iconName={item.icon}
                    label={item.label}
                    currentPage={currentPage}
                    setPage={setPage}
                    isSidebarOpen={isOpen}
                />
              )
            ))}
        </ul>
      </nav>

       <div className="mt-auto p-2 border-t border-slate-800">
         <ul>
            {bottomNavItems.map(item => (
              hasPermission(item.permission) && (
                <NavItem 
                    key={item.page}
                    page={item.page as SuperAdminPage}
                    iconName={item.icon}
                    label={item.label}
                    currentPage={currentPage}
                    setPage={setPage}
                    isSidebarOpen={isOpen}
                />
              )
            ))}
        </ul>
        <div className="px-2">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="w-full flex items-center justify-center p-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white mt-2"
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                <Icon name={isOpen ? 'chevronLeft' : 'chevronRight'} className="w-6 h-6" />
            </button>
        </div>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
