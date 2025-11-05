
import React, { useState } from 'react';
import { AppContextProvider } from './context/AppContext';
import TenantApp from './components/TenantApp';
import SuperAdminPanel from './components/superadmin/SuperAdminPanel';
import LandingPage from './components/LandingPage';

export type Page = 'DASHBOARD' | 'POS' | 'INVENTORY' | 'REPORTS' | 'SETTINGS';
export type SuperAdminPage = 'PLATFORM_DASHBOARD' | 'TENANTS' | 'SUBSCRIPTIONS' | 'SETTINGS';

const AppContent: React.FC = () => {
  const [userRole, setUserRole] = useState<'TENANT' | 'SUPER_ADMIN'>('TENANT');

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <label htmlFor="role-toggle" className="flex items-center cursor-pointer">
          <span className="mr-3 text-sm font-medium text-gray-300">Tenant View</span>
          <div className="relative">
            <input type="checkbox" id="role-toggle" className="sr-only" checked={userRole === 'SUPER_ADMIN'} onChange={() => setUserRole(role => role === 'TENANT' ? 'SUPER_ADMIN' : 'TENANT')} />
            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
          </div>
          <span className="ml-3 text-sm font-medium text-gray-300">Super Admin</span>
        </label>
         <style>{`
          input:checked ~ .dot {
            transform: translateX(100%);
            background-color: #34D399;
          }
        `}</style>
      </div>
      
      {userRole === 'TENANT' ? <TenantApp /> : <SuperAdminPanel />}
    </div>
  );
};


const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');

  if (view === 'landing') {
    return <LandingPage onLogin={() => setView('app')} />;
  }

  return (
    <AppContextProvider onLogout={() => setView('landing')}>
      <AppContent />
    </AppContextProvider>
  );
};

export default App;
