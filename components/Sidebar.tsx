

import React from 'react';
import { Page } from '../App';
import Icon from './icons';

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
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setPage(page);
        }}
        className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-indigo-600 text-white'
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


const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage, isOpen, setIsOpen }) => {
  const navItems = [
    { page: 'DASHBOARD', icon: 'dashboard', label: 'Dashboard' },
    { page: 'POS', icon: 'pos', label: 'Point of Sale' },
    { page: 'INVENTORY', icon: 'inventory', label: 'Inventory' },
    { page: 'PURCHASES', icon: 'clipboard-document-list', label: 'Purchases' },
    { page: 'LOGISTICS', icon: 'truck', label: 'Logistics' },
    { page: 'ACCOUNTING', icon: 'calculator', label: 'Accounting' },
    { page: 'REPORTS', icon: 'reports', label: 'Reports' },
    { page: 'SETTINGS', icon: 'settings', label: 'Settings' },
  ];

  return (
    <div
      className={`relative flex flex-col bg-gray-800 text-white transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        <div className={`flex items-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <svg className="w-8 h-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.54-.403 1.25-.624 1.968-.624a4.58 4.58 0 0 1 .844.119" />
            </svg>
            <span className="ml-2 text-xl font-bold">FlowPay</span>
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
    </div>
  );
};

export default Sidebar;
