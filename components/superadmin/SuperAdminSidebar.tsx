import React from 'react';
import { SuperAdminPage } from '../../App';
import Icon from '../icons';

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
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setPage(page);
        }}
        className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-cyan-600 text-white'
            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <Icon name={iconName} className="w-6 h-6" />
        <span
          className={`ml-3 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
        >
          {label}
        </span>
      </a>
    </li>
  );
};


const SuperAdminSidebar: React.FC<SidebarProps> = ({ currentPage, setPage, isOpen, setIsOpen }) => {
  const navItems = [
    { page: 'PLATFORM_DASHBOARD', icon: 'chart-pie', label: 'Dashboard' },
    { page: 'TENANTS', icon: 'briefcase', label: 'Tenants' },
    { page: 'SUBSCRIPTIONS', icon: 'credit-card', label: 'Subscriptions' },
    { page: 'TEAM_MANAGEMENT', icon: 'users', label: 'Team Management' },
    { page: 'SETTINGS', icon: 'settings', label: 'System Settings' },
  ];

  return (
    <div
      className={`relative flex flex-col bg-gray-800 text-white transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        <div className={`flex items-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <Icon name="globe" className="w-8 h-8 text-cyan-400" />
            <span className="ml-2 text-xl font-bold">FlowPay Admin</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <Icon name={isOpen ? 'chevronLeft' : 'chevronRight'} className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        <ul>
            {navItems.map(item => (
                <NavItem 
                    key={item.page}
                    page={item.page as SuperAdminPage}
                    iconName={item.icon}
                    label={item.label}
                    currentPage={currentPage}
                    setPage={setPage}
                    isSidebarOpen={isOpen}
                />
            ))}
        </ul>
      </nav>
    </div>
  );
};

export default SuperAdminSidebar;