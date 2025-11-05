

import React, { useState, useCallback } from 'react';
import { SuperAdminPage } from '../../App';
import SuperAdminSidebar from './SuperAdminSidebar';
import Header from '../Header';
import PlatformDashboard from './PlatformDashboard';
import TenantManagement from './TenantManagement';
import TeamManagement from './TeamManagement';
import { useAppContext } from '../../hooks/useAppContext';
import { BrandConfig, PageContent, FaqItem } from '../../types';
import Icon from '../icons';

const Settings: React.FC = () => {
    type SettingsTab = 'branding' | 'content' | 'faqs';
    const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
    const { brandConfig, pageContent, updateBrandConfig, updatePageContent, updateFaqs } = useAppContext();

    const [brandForm, setBrandForm] = useState<BrandConfig>(brandConfig);
    const [contentForm, setContentForm] = useState<Omit<PageContent, 'faqs'>>(pageContent);
    const [faqs, setFaqs] = useState<FaqItem[]>(pageContent.faqs);

    const handleBrandSave = () => {
        updateBrandConfig(brandForm);
        alert('Branding settings saved!');
    };

    const handleContentSave = () => {
        updatePageContent(contentForm);
        alert('Page content saved!');
    };

    const handleFaqsSave = () => {
        updateFaqs(faqs);
        alert('FAQs saved!');
    };

    const handleFaqChange = (id: string, field: 'question' | 'answer', value: string) => {
        setFaqs(faqs.map(faq => faq.id === id ? { ...faq, [field]: value } : faq));
    };

    const addFaq = () => {
        setFaqs([...faqs, { id: `faq-${Date.now()}`, question: '', answer: '' }]);
    };

    const removeFaq = (id: string) => {
        setFaqs(faqs.filter(faq => faq.id !== id));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'branding':
                return (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="brandName" className="block text-sm font-medium text-gray-400">Brand Name</label>
                            <input type="text" id="brandName" value={brandForm.name} onChange={e => setBrandForm({...brandForm, name: e.target.value})} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                        <div>
                            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-400">Logo URL</label>
                            <input type="text" id="logoUrl" value={brandForm.logoUrl} onChange={e => setBrandForm({...brandForm, logoUrl: e.target.value})} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                             <p className="mt-2 text-xs text-gray-500">Provide a full URL to an image file. Leave blank to use the default SVG logo.</p>
                        </div>
                        <div>
                            <label htmlFor="faviconUrl" className="block text-sm font-medium text-gray-400">Favicon URL</label>
                            <input type="text" id="faviconUrl" value={brandForm.faviconUrl} onChange={e => setBrandForm({...brandForm, faviconUrl: e.target.value})} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                             <p className="mt-2 text-xs text-gray-500">Provide a full URL to an icon file (.ico, .png, .svg).</p>
                        </div>
                        <div className="text-right">
                             <button onClick={handleBrandSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save Branding</button>
                        </div>
                    </div>
                );
            case 'content':
                return (
                     <div className="space-y-6">
                        {Object.keys(contentForm).map(key => (
                           <div key={key}>
                               <label htmlFor={key} className="block text-sm font-medium text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                               <textarea id={key} name={key} rows={8} value={contentForm[key as keyof typeof contentForm]} onChange={e => setContentForm({ ...contentForm, [key]: e.target.value })} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm"/>
                               <p className="mt-2 text-xs text-gray-500">You can use simple markdown for headings (e.g., ## My Heading).</p>
                           </div>
                        ))}
                         <div className="text-right">
                             <button onClick={handleContentSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save Content</button>
                        </div>
                     </div>
                );
            case 'faqs':
                return (
                    <div className="space-y-4">
                        {faqs.map(faq => (
                            <div key={faq.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-3">
                                <input type="text" placeholder="Question" value={faq.question} onChange={e => handleFaqChange(faq.id, 'question', e.target.value)} className="block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 font-semibold"/>
                                <textarea placeholder="Answer" rows={3} value={faq.answer} onChange={e => handleFaqChange(faq.id, 'answer', e.target.value)} className="block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500"/>
                                <div className="text-right">
                                    <button onClick={() => removeFaq(faq.id)} className="text-rose-500 hover:text-rose-400 text-sm font-semibold">Remove</button>
                                </div>
                            </div>
                        ))}
                        <div className="pt-4 flex justify-between items-center">
                            <button onClick={addFaq} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                                <Icon name="plus" className="w-5 h-5 mr-2" /> Add FAQ
                            </button>
                             <button onClick={handleFaqsSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save FAQs</button>
                        </div>
                    </div>
                );
        }
    };
    
    const TabButton: React.FC<{tab: SettingsTab, label: string}> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === tab ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
            {label}
        </button>
    );

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>
            <div className="flex space-x-2 border-b border-gray-700 mb-6">
                <TabButton tab="branding" label="Branding" />
                <TabButton tab="content" label="Page Content" />
                <TabButton tab="faqs" label="FAQs" />
            </div>
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
}

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
                 return <Settings />;
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
