import React, { useState, useCallback } from 'react';
import { SuperAdminPage } from '../../App';
import SuperAdminSidebar from './SuperAdminSidebar';
import Header from '../Header';
import PlatformDashboard from './PlatformDashboard';
import TenantManagement from './TenantManagement';

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
            default:
                return <PlatformDashboard />;
        }
    };
    
    const pageTitleMap: Record<SuperAdminPage, string> = {
        PLATFORM_DASHBOARD: 'Platform Dashboard',
        TENANTS: 'Tenant Management',
        SUBSCRIPTIONS: 'Subscription Plans',
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
