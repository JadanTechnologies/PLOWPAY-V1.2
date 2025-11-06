


import React from 'react';
import { SuperAdminPage } from '../../App';
import Icon from '../icons';
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
    <li className="relative">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setPage(page);
        }}
        className={`group flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-cyan-600 text-white'
            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <Icon name={iconName} className="w-6 h-6 flex-shrink-0" />
        <span
          className={`ml-3 whitespace-nowrap transition-all duration-200 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'
          }`}
        >
          {label}
        </span>
        {!isSidebarOpen && (
          <div className="absolute left-full ml-4 w-auto min-w-max px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
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
    { page: 'SUBSCRIPTIONS', icon: 'credit-card', label: 'Subscriptions', permission: 'manageSubscriptions' },
    { page: 'PAYMENT_TRANSACTIONS', icon: 'calculator', label: 'Transactions', permission: 'managePaymentGateways' },
    { page: 'PAYMENT_GATEWAYS', icon: 'cash', label: 'Payment Gateways', permission: 'managePaymentGateways' },
    { page: 'NOTIFICATIONS', icon: 'notification', label: 'Notification Settings', permission: 'manageNotificationSettings' },
    { page: 'TEMPLATE_MANAGEMENT', icon: 'clipboard-document-list', label: 'Templates', permission: 'manageNotificationSettings' },
    { page: 'ANNOUNCEMENTS', icon: 'chat-bubble-left-right', label: 'Announcements', permission: 'manageAnnouncements' },
    { page: 'TEAM_MANAGEMENT', icon: 'users', label: 'Team', permission: 'manageTeam' },
    { page: 'ROLE_MANAGEMENT', icon: 'lock-closed', label: 'Roles', permission: 'manageRoles' },
    { page: 'MAINTENANCE', icon: 'settings', label: 'Maintenance', permission: 'manageSystemSettings' },
    { page: 'ACCESS_MANAGEMENT', icon: 'lock-closed', label: 'Access Management', permission: 'manageSystemSettings' },
  ] as const;

  const bottomNavItems = [
    { page: 'PROFILE', icon: 'user', label: 'Profile', permission: 'viewPlatformDashboard'}, // All admins can see their own profile
    { page: 'SETTINGS', icon: 'settings', label: 'Settings', permission: 'manageSystemSettings' },
  ] as const;

  return (
    <div
      className={`relative flex flex-col bg-gray-800 text-white transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
       <div className={`flex h-16 shrink-0 items-center border-b border-gray-700 ${isOpen ? 'px-4' : 'px-0 justify-center'}`}>
        <div className={`flex items-center ${isOpen ? '' : 'w-full justify-center'}`}>
            <Icon name="globe" className="w-8 h-8 text-cyan-400 flex-shrink-0" />
            <span className={`ml-2 text-xl font-bold whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>FlowPay Admin</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
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

       <div className="mt-auto p-2 border-t border-gray-700">
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
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-full flex items-center justify-center p-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white mt-2"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
            <Icon name={isOpen ? 'chevronLeft' : 'chevronRight'} className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;