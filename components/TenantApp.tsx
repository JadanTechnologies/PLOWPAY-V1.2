







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
import CreditManagement from './CreditManagement';
import ConsignmentManagement from './ConsignmentManagement';
import Billing from './Billing';
import { SubscriptionPlan } from '../types';
import Checkout from './Checkout';
import TenantProfile from './tenant/Profile';


const TenantApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('DASHBOARD');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const [checkoutState, setCheckoutState] = useState<{plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly'} | null>(null);

  const handleSetPage = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const startCheckout = (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') => {
    setCheckoutState({ plan, billingCycle });
    setCurrentPage('CHECKOUT');
  };

  const onCheckoutComplete = () => {
    setCheckoutState(null);
    setCurrentPage('BILLING');
  };
  
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
      case 'CREDIT_MANAGEMENT':
        return <CreditManagement />;
      case 'CONSIGNMENT':
        return <ConsignmentManagement />;
      case 'BILLING':
        return <Billing onStartCheckout={startCheckout} />;
      case 'CHECKOUT':
        return checkoutState ? <Checkout plan={checkoutState.plan} billingCycle={checkoutState.billingCycle} onComplete={onCheckoutComplete} /> : <Billing onStartCheckout={startCheckout} />;
      case 'PROFILE':
        return <TenantProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
      <div className="flex h-screen bg-slate-900 text-slate-200">
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
            onNavigateToProfile={() => setCurrentPage('PROFILE')}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-0 -z-10 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            {renderPage()}
          </main>
        </div>
      </div>
  );
};

export default TenantApp;