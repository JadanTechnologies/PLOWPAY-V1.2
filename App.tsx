
import React, { useState, useCallback } from 'react';
import { AppContextProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PointOfSale from './components/PointOfSale';
import Inventory from './components/Inventory';

export type Page = 'DASHBOARD' | 'POS' | 'INVENTORY' | 'REPORTS' | 'SETTINGS';

const App: React.FC = () => {
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
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppContextProvider>
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
    </AppContextProvider>
  );
};

export default App;
