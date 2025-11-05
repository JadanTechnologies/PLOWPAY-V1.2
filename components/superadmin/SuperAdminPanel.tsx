
import React, { useState, useCallback } from 'react';
import { SuperAdminPage } from '../../App';
import SuperAdminSidebar from './SuperAdminSidebar';
import Header from '../Header';
import PlatformDashboard from './PlatformDashboard';
import TenantManagement from './TenantManagement';
import TeamManagement from './TeamManagement';

const SuperAdminPanel: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<SuperAdminPage>('PLATFORM_DASHBOARD');
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const handleSetPage = useCallback((page: SuperAdminPage) => {
        setCurrentPage(page);
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case 'PLATFORM_DASHBOARD':
                return <PlatformDashboard />;
            case 'TENANTS':
                return <TenantManagement />;
            case 'SUBSCRIPTIONS':
                return (
                    <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-white">Subscription Management</h3>
                        <p className="text-gray-400 mt-4">Subscription plan management will be available here.</p>
                    </div>
                );
            case 'TEAM_MANAGEMENT':
                return <TeamManagement />;
            case 'SETTINGS':
                 return (
                    <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-white">System Settings</h3>
                        <p className="text-gray-400 mt-4">Global system settings will be managed from this page.</p>
                    </div>
                );
            default:
                return <PlatformDashboard />;
        }
    };
    
    const pageTitleMap: Record<SuperAdminPage, string> = {
        PLATFORM_DASHBOARD: 'Platform Dashboard',
        TENANTS: 'Tenant Management',
        SUBSCRIPTIONS: 'Subscription Plans',
        TEAM_MANAGEMENT: 'Team Management',
        SETTINGS: 'System Settings',
    };

    return (
        <div className="flex h-screen bg-gray-950 text-gray-200">
            <SuperAdminSidebar
                currentPage={currentPage}
                setPage={handleSetPage}
                isOpen={isSidebarOpen}
                setIsOpen={setSidebarOpen}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    pageTitle={pageTitleMap[currentPage]}
                    toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-950 p-4 sm:p-6 lg:p-8">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default SuperAdminPanel;