
import React, { useState, useCallback, useMemo } from 'react';
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
import TenantAuditLogs from './tenant/AuditLogs';
import DepositManagement from './DepositManagement';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './icons';
import TenantSupport from './tenant/Support';


const TenantApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('DASHBOARD');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { currentTenant, currentAdminUser, stopImpersonating, impersonatedUser } = useAppContext();
  const [isExpiryBannerVisible, setExpiryBannerVisible] = useState(true);
  
  const isImpersonating = !!impersonatedUser;
  
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

  const expiryWarning = useMemo(() => {
    if (!currentTenant || currentTenant.status !== 'TRIAL' || !currentTenant.trialEndDate) {
      return null;
    }
    const today = new Date();
    const endDate = new Date(currentTenant.trialEndDate);
    const timeDiff = endDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysRemaining <= 7 && daysRemaining >= 0) {
      return {
        days: daysRemaining,
        message: `Your free trial is ending in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Upgrade now to keep your access.`
      };
    }
    return null;
  }, [currentTenant]);
  
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
      case 'DEPOSIT_MANAGEMENT':
        return <DepositManagement />;
      case 'CONSIGNMENT':
        return <ConsignmentManagement />;
      case 'BILLING':
        return <Billing onStartCheckout={startCheckout} />;
      case 'CHECKOUT':
        return checkoutState ? <Checkout plan={checkoutState.plan} billingCycle={checkoutState.billingCycle} onComplete={onCheckoutComplete} /> : <Billing onStartCheckout={startCheckout} />;
      case 'PROFILE':
        return <TenantProfile />;
      case 'AUDIT_LOGS':
        return <TenantAuditLogs />;
      case 'SUPPORT':
        return <TenantSupport />;
      default:
        return <Dashboard />;
    }
  };

  return (
      <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <Sidebar 
          currentPage={currentPage} 
          setPage={handleSetPage} 
          isOpen={isSidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          {isImpersonating && currentTenant && (
            <div className="bg-yellow-500/90 backdrop-blur-sm text-yellow-900 p-2 flex items-center justify-center text-sm font-semibold shadow-lg z-50">
                <Icon name="user" className="w-5 h-5 mr-2" />
                <span>You ({currentAdminUser?.name}) are impersonating {currentTenant.businessName}.</span>
                <button onClick={stopImpersonating} className="ml-4 bg-yellow-700 text-white px-3 py-1 rounded-md hover:bg-yellow-800 text-xs font-bold">
                    Return to Super Admin
                </button>
            </div>
          )}
          <Header 
            pageTitle={currentPage} 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            onNavigateToProfile={() => setCurrentPage('PROFILE')}
          />
           {isExpiryBannerVisible && expiryWarning && (
            <div className="bg-yellow-500/20 text-yellow-200 p-3 flex items-center justify-between text-sm">
                <div className="flex items-center">
                    <Icon name="notification" className="w-5 h-5 mr-3" />
                    <span>{expiryWarning.message}</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentPage('BILLING')} className="font-bold bg-yellow-400 text-yellow-900 px-3 py-1 rounded-md hover:bg-yellow-300">Upgrade Now</button>
                    <button onClick={() => setExpiryBannerVisible(false)} className="hover:text-white"><Icon name="x-mark" className="w-5 h-5" /></button>
                </div>
            </div>
          )}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-0 -z-10 h-full w-full bg-slate-100 dark:bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            {renderPage()}
          </main>
        </div>
      </div>
  );
};

export default TenantApp;
