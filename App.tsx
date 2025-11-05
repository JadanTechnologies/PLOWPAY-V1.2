
import React, { useState } from 'react';
import { AppContextProvider } from './context/AppContext';
import TenantApp from './components/TenantApp';
import SuperAdminPanel from './components/superadmin/SuperAdminPanel';

export type Page = 'DASHBOARD' | 'POS' | 'INVENTORY' | 'REPORTS' | 'SETTINGS';
export type SuperAdminPage = 'PLATFORM_DASHBOARD' | 'TENANTS' | 'SUBSCRIPTIONS';


const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'TENANT' | 'SUPER_ADMIN'>('TENANT');

  return (
    <AppContextProvider>
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
    </AppContextProvider>
  );
};

export default App;