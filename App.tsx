import React, { useState } from 'react';
import { AppContextProvider } from './context/AppContext';
import TenantApp from './components/TenantApp';
import SuperAdminPanel from './components/superadmin/SuperAdminPanel';
import LandingPage from './components/LandingPage';
import Login from './components/Login';

export type Page = 'DASHBOARD' | 'POS' | 'INVENTORY' | 'REPORTS' | 'SETTINGS';
export type SuperAdminPage = 'PLATFORM_DASHBOARD' | 'TENANTS' | 'SUBSCRIPTIONS' | 'TEAM_MANAGEMENT' | 'SETTINGS';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'login' | 'app'>('landing');
  const [userRole, setUserRole] = useState<'TENANT' | 'SUPER_ADMIN' | null>(null);

  const handleLoginSuccess = (role: 'TENANT' | 'SUPER_ADMIN') => {
    setUserRole(role);
    setView('app');
  };

  const handleLogout = () => {
    setUserRole(null);
    setView('landing');
  };

  const renderContent = () => {
    switch (view) {
      case 'landing':
        return <LandingPage onLogin={() => setView('login')} />;
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setView('landing')} />;
      case 'app':
        if (userRole) {
          return (
            <AppContextProvider onLogout={handleLogout}>
              {userRole === 'TENANT' ? <TenantApp /> : <SuperAdminPanel />}
            </AppContextProvider>
          );
        }
        // If role is null for some reason, send back to login
        setView('login');
        return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setView('landing')} />;
      default:
        // Fallback to landing page for any unknown state
        return <LandingPage onLogin={() => setView('login')} />;
    }
  };

  return <>{renderContent()}</>;
};

export default App;