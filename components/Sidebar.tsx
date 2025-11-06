



import React from 'react';
import { Page } from '../App';
import Icon from './icons';
import { useTranslation } from '../hooks/useTranslation';

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
    <li className="relative">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setPage(page);
        }}
        className={`group flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-indigo-600 text-white'
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


const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage, isOpen, setIsOpen }) => {
  const { t } = useTranslation();

  const navItems = [
    { page: 'DASHBOARD', icon: 'dashboard', label: t('dashboard'), key: 'dashboard' },
    { page: 'POS', icon: 'pos', label: t('pos'), key: 'pos' },
    { page: 'INVENTORY', icon: 'inventory', label: t('inventory'), key: 'inventory' },
    { page: 'PURCHASES', icon: 'clipboard-document-list', label: t('purchases'), key: 'purchases' },
    { page: 'CONSIGNMENT', icon: 'briefcase', label: t('consignment'), key: 'consignment' },
    { page: 'LOGISTICS', icon: 'truck', label: t('logistics'), key: 'logistics' },
    { page: 'CREDIT_MANAGEMENT', icon: 'users', label: t('creditManagement'), key: 'credit_management' },
    { page: 'ACCOUNTING', icon: 'calculator', label: t('accounting'), key: 'accounting' },
    { page: 'REPORTS', icon: 'reports', label: t('reports'), key: 'reports' },
    { page: 'BILLING', icon: 'credit-card', label: t('billing'), key: 'billing' },
    { page: 'SETTINGS', icon: 'settings', label: t('settings'), key: 'settings' },
  ];

  return (
    <div
      className={`relative flex flex-col bg-gray-800 text-white transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className={`flex h-16 shrink-0 items-center border-b border-gray-700 ${isOpen ? 'px-4' : 'px-0 justify-center'}`}>
        <div className={`flex items-center ${isOpen ? '' : 'w-full justify-center'}`}>
            <svg className="w-8 h-8 text-indigo-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.54-.403 1.25-.624 1.968-.624a4.58 4.58 0 0 1 .844.119" />
            </svg>
            <span className={`ml-2 text-xl font-bold whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>FlowPay</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
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
      
       <div className="mt-auto p-2 border-t border-gray-700">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-full flex items-center justify-center p-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
            <Icon name={isOpen ? 'chevronLeft' : 'chevronRight'} className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;