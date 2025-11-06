
import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import PointOfSale from './PointOfSale';
import Inventory from './Inventory';
import { Page } from '../App';
import LogisticsManagement from './LogisticsManagement';
import Reports from './Reports';
import Settings from './Settings';
import PurchaseOrderManagement from './PurchaseOrderManagement';
import Accounting from './Accounting';


const TenantApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('DASHBOARD');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleSetPage = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);
  
  const renderPage = () => {
    switch (currentPage) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'POS':
        return <PointOfSale />;
      case 'INVENTORY':
        return <Inventory />;
      case 'PURCHASES':
        return <PurchaseOrderManagement />;
      case 'LOGISTICS':
        return <LogisticsManagement />;
      case 'ACCOUNTING':
        return <Accounting />;
      case 'REPORTS':
        return <Reports />;
      case 'SETTINGS':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
      <div className="flex h-screen bg-gray-900 text-gray-200">
        <Sidebar 
          currentPage={currentPage} 
          setPage={handleSetPage} 
          isOpen={isSidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            pageTitle={currentPage} 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 sm:p-6 lg:p-8">
            {renderPage()}
          </main>
        </div>
      </div>
  );
};

export default TenantApp;
