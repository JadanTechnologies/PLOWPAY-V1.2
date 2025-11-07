



import React, { useState, useCallback, useEffect } from 'react';
import { SuperAdminPage } from '../../App';
import SuperAdminSidebar from './SuperAdminSidebar';
import Header from '../Header';
import PlatformDashboard from './PlatformDashboard';
import TenantManagement from './TenantManagement';
import TeamManagement from './TeamManagement';
import RoleManagement from './RoleManagement';
import PaymentGateways from './PaymentSettings';
import NotificationSettings from './NotificationSettings';
import SubscriptionManagement from './SubscriptionManagement';
import { useAppContext } from '../../hooks/useAppContext';
import { BrandConfig, PageContent, FaqItem, SystemSettings, Currency, Language, LandingPageMetrics } from '../../types';
import Icon from '/components/icons/index.tsx';
import { usePermissions } from '../../hooks/usePermissions';
import Announcements from './Announcements';
import PaymentTransactions from './PaymentTransactions';
import TemplateManagement from './TemplateManagement';
import Maintenance from './Maintenance';
import AccessManagement from './AccessManagement';
import SuperAdminProfile from './Profile';
import SuperAdminAuditLogs from './AuditLogs';

const Toggle: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => {
    return (
        <button
            type="button"
            className={`${enabled ? 'bg-cyan-600' : 'bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
        >
            <span
                aria-hidden="true"
                className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    );
};

const Settings: React.FC = () => {
    type SettingsTab = 'branding' | 'content' | 'faqs' | 'currencies' | 'languages' | 'landing';
    const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
    const { brandConfig, pageContent, systemSettings, updateBrandConfig, updatePageContent, updateFaqs, updateSystemSettings, updateLandingPageMetrics, setNotification } = useAppContext();

    const [brandForm, setBrandForm] = useState<BrandConfig>(brandConfig);
    const [contentForm, setContentForm] = useState<Omit<PageContent, 'faqs'>>(pageContent);
    const [faqs, setFaqs] = useState<FaqItem[]>(pageContent.faqs);
    const [systemSettingsForm, setSystemSettingsForm] = useState<SystemSettings>(systemSettings);
    const [landingMetrics, setLandingMetrics] = useState(systemSettings.landingPageMetrics);


     useEffect(() => {
        setSystemSettingsForm(systemSettings);
        setLandingMetrics(systemSettings.landingPageMetrics);
    }, [systemSettings]);

    const handleBrandSave = () => {
        if(window.confirm("Are you sure you want to save branding settings?")){
            updateBrandConfig(brandForm);
            setNotification({ message: 'Branding settings saved!', type: 'success' });
        }
    };

    const handleContentSave = () => {
        if(window.confirm("Are you sure you want to save page content?")){
            updatePageContent(contentForm);
            setNotification({ message: 'Page content saved!', type: 'success' });
        }
    };

    const handleFaqsSave = () => {
        if(window.confirm("Are you sure you want to save FAQs?")){
            updateFaqs(faqs);
            setNotification({ message: 'FAQs saved!', type: 'success' });
        }
    };

    const handleFaqChange = (id: string, field: 'question' | 'answer', value: string) => {
        setFaqs(faqs.map(faq => faq.id === id ? { ...faq, [field]: value } : faq));
    };

    const addFaq = () => {
        setFaqs([...faqs, { id: `faq-${Date.now()}`, question: '', answer: '' }]);
    };

    const removeFaq = (id: string) => {
        if(window.confirm("Are you sure you want to remove this FAQ?")){
            setFaqs(faqs.filter(faq => faq.id !== id));
        }
    };

    const pageContentKeys: (keyof Omit<PageContent, 'faqs'>)[] = [
        'about', 'contact', 'terms', 'privacy', 'refund', 'helpCenter', 'apiDocs', 'blog'
    ];

    const handleCurrencyToggle = (code: string) => {
        setSystemSettingsForm(prev => ({
            ...prev,
            currencies: prev.currencies.map(c => c.code === code ? { ...c, enabled: !c.enabled } : c)
        }));
    };

    const handleDefaultCurrencyChange = (code: string) => {
        setSystemSettingsForm(prev => ({ ...prev, defaultCurrency: code }));
    };

    const handleLanguageToggle = (code: string) => {
        setSystemSettingsForm(prev => ({
            ...prev,
            languages: prev.languages.map(l => l.code === code ? { ...l, enabled: !l.enabled } : l)
        }));
    };

    const handleDefaultLanguageChange = (code: string) => {
        setSystemSettingsForm(prev => ({ ...prev, defaultLanguage: code }));
    };

    const handleLocalizationSave = () => {
        // Ensure default currency/language is still enabled
        const defaultCurrencyIsEnabled = systemSettingsForm.currencies.find(c => c.code === systemSettingsForm.defaultCurrency)?.enabled;
        if (!defaultCurrencyIsEnabled) {
            setNotification({ message: 'The selected default currency is disabled. Please enable it before saving.', type: 'error' });
            return;
        }
        const defaultLanguageIsEnabled = systemSettingsForm.languages.find(l => l.code === systemSettingsForm.defaultLanguage)?.enabled;
        if (!defaultLanguageIsEnabled) {
            setNotification({ message: 'The selected default language is disabled. Please enable it before saving.', type: 'error' });
            return;
        }
        if(window.confirm("Are you sure you want to save localization settings?")){
            updateSystemSettings(systemSettingsForm);
            setNotification({ message: 'Localization settings saved!', type: 'success' });
        }
    };
    
    const handleMetricsChange = (metric: keyof LandingPageMetrics, field: 'value' | 'label', value: string) => {
        const isValue = field === 'value';
        setLandingMetrics(prev => ({
            ...prev,
            [metric]: {
                ...prev[metric],
                [field]: isValue ? Number(value) : value,
            }
        }));
    };

    const handleMetricsSave = () => {
        if(window.confirm("Are you sure you want to update landing page metrics?")){
            updateLandingPageMetrics(landingMetrics);
            setNotification({ message: 'Landing page metrics updated!', type: 'success'});
        }
    };


    const renderTabContent = () => {
        switch (activeTab) {
            case 'branding':
                return (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="brandName" className="block text-sm font-medium text-slate-400">Brand Name</label>
                            <input type="text" id="brandName" value={brandForm.name} onChange={e => setBrandForm({...brandForm, name: e.target.value})} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                        <div>
                            <label htmlFor="logoUrl" className="block text-sm font-medium text-slate-400">Logo URL</label>
                            <input type="text" id="logoUrl" value={brandForm.logoUrl} onChange={e => setBrandForm({...brandForm, logoUrl: e.target.value})} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                             <p className="mt-2 text-xs text-slate-500">Provide a full URL to an image file. Leave blank to use the default SVG logo.</p>
                        </div>
                        <div>
                            <label htmlFor="faviconUrl" className="block text-sm font-medium text-slate-400">Favicon URL</label>
                            <input type="text" id="faviconUrl" value={brandForm.faviconUrl} onChange={e => setBrandForm({...brandForm, faviconUrl: e.target.value})} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                             <p className="mt-2 text-xs text-slate-500">Provide a full URL to an icon file (.ico, .png, .svg).</p>
                        </div>
                        <div className="text-right">
                             <button onClick={handleBrandSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save Branding</button>
                        </div>
                    </div>
                );
            case 'content':
                return (
                     <div className="space-y-6">
                        {pageContentKeys.map(key => (
                           <div key={key}>
                               <label htmlFor={key} className="block text-sm font-medium text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').replace('Api', 'API').trim()}</label>
                               <textarea id={key} name={key} rows={8} value={contentForm[key]} onChange={e => setContentForm({ ...contentForm, [key]: e.target.value })} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm"/>
                               <p className="mt-2 text-xs text-slate-500">You can use simple markdown for headings (e.g., ## My Heading).</p>
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
                            <div key={faq.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3">
                                <input type="text" placeholder="Question" value={faq.question} onChange={e => handleFaqChange(faq.id, 'question', e.target.value)} className="block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 font-semibold"/>
                                <textarea placeholder="Answer" rows={3} value={faq.answer} onChange={e => handleFaqChange(faq.id, 'answer', e.target.value)} className="block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500"/>
                                <div className="text-right">
                                    <button onClick={() => removeFaq(faq.id)} className="text-rose-500 hover:text-rose-400 text-sm font-semibold">Remove</button>
                                </div>
                            </div>
                        ))}
                        <div className="pt-4 flex justify-between items-center">
                            <button onClick={addFaq} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                                <Icon name="plus" className="w-5 h-5 mr-2" /> Add FAQ
                            </button>
                             <button onClick={handleFaqsSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save FAQs</button>
                        </div>
                    </div>
                );
            case 'currencies':
                 return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Enabled Currencies</h3>
                            <div className="space-y-2 bg-slate-900/50 p-4 rounded-md border border-slate-700">
                                {systemSettingsForm.currencies.map(currency => (
                                    <div key={currency.code} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-700/50">
                                        <div>
                                            <span className="font-semibold">{currency.name}</span>
                                            <span className="text-slate-400 ml-2">({currency.code} - {currency.symbol})</span>
                                        </div>
                                        <Toggle enabled={currency.enabled} onChange={() => handleCurrencyToggle(currency.code)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="defaultCurrency" className="block text-sm font-medium text-slate-400">Default Currency</label>
                            <select id="defaultCurrency" value={systemSettingsForm.defaultCurrency} onChange={e => handleDefaultCurrencyChange(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                                {systemSettingsForm.currencies.filter(c => c.enabled).map(c => (
                                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                                ))}
                            </select>
                        </div>
                        <div className="text-right">
                            <button onClick={handleLocalizationSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save Currencies</button>
                        </div>
                    </div>
                );
            case 'languages':
                 return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Enabled Languages</h3>
                            <div className="space-y-2 bg-slate-900/50 p-4 rounded-md border border-slate-700">
                                {systemSettingsForm.languages.map(lang => (
                                    <div key={lang.code} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-700/50">
                                        <div>
                                            <span className="font-semibold">{lang.name}</span>
                                            <span className="text-slate-400 ml-2">({lang.code})</span>
                                        </div>
                                        <Toggle enabled={lang.enabled} onChange={() => handleLanguageToggle(lang.code)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="defaultLanguage" className="block text-sm font-medium text-slate-400">Default Language</label>
                            <select id="defaultLanguage" value={systemSettingsForm.defaultLanguage} onChange={e => handleDefaultLanguageChange(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                                {systemSettingsForm.languages.filter(l => l.enabled).map(l => (
                                    <option key={l.code} value={l.code}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="text-right">
                            <button onClick={handleLocalizationSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save Languages</button>
                        </div>
                    </div>
                );
             case 'landing':
                return (
                     <div className="space-y-6">
                        {Object.keys(landingMetrics).map((key) => {
                            const metricKey = key as keyof LandingPageMetrics;
                            const item = landingMetrics[metricKey];
                            return (
                                <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 capitalize">{key} Label</label>
                                        <input type="text" value={item.label} onChange={e => handleMetricsChange(metricKey, 'label', e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 capitalize">{key} Value</label>
                                        <input type="number" value={item.value} onChange={e => handleMetricsChange(metricKey, 'value', e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3"/>
                                    </div>
                                </div>
                            );
                        })}
                         <div className="text-right">
                             <button onClick={handleMetricsSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save Metrics</button>
                        </div>
                    </div>
                );
        }
    };
    
    const TabButton: React.FC<{tab: SettingsTab, label: string}> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === tab ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
            {label}
        </button>
    );

    return (
        <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>
            <div className="flex flex-wrap gap-2 border-b border-slate-700 mb-6 pb-2">
                <TabButton tab="branding" label="Branding" />
                <TabButton tab="landing" label="Landing Page" />
                <TabButton tab="content" label="Page Content" />
                <TabButton tab="faqs" label="FAQs" />
                <TabButton tab="currencies" label="Currencies" />
                <TabButton tab="languages" label="Languages" />
            </div>
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
}

const AccessDenied: React.FC = () => (
    <div className="p-6 bg-slate-800 rounded-lg shadow-lg text-center border border-slate-700">
        <Icon name="lock-closed" className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400">You do not have the required permissions to view this page.</p>
    </div>
);

const SuperAdminPanel: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<SuperAdminPage>('PLATFORM_DASHBOARD');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { hasPermission } = usePermissions();

    const handleSetPage = useCallback((page: SuperAdminPage) => {
        setCurrentPage(page);
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case 'PLATFORM_DASHBOARD':
                return hasPermission('viewPlatformDashboard') ? <PlatformDashboard /> : <AccessDenied />;
            case 'TENANTS':
                return hasPermission('manageTenants') ? <TenantManagement /> : <AccessDenied />;
            case 'SUBSCRIPTIONS':
                return hasPermission('manageSubscriptions') ? <SubscriptionManagement /> : <AccessDenied />;
            case 'TEAM_MANAGEMENT':
                return hasPermission('manageTeam') ? <TeamManagement /> : <AccessDenied />;
            case 'ROLE_MANAGEMENT':
                return hasPermission('manageRoles') ? <RoleManagement /> : <AccessDenied />;
            case 'PAYMENT_GATEWAYS':
                return hasPermission('managePaymentGateways') ? <PaymentGateways /> : <AccessDenied />;
            case 'PAYMENT_TRANSACTIONS':
                return hasPermission('managePaymentGateways') ? <PaymentTransactions /> : <AccessDenied />;
            case 'NOTIFICATIONS':
                return hasPermission('manageNotificationSettings') ? <NotificationSettings /> : <AccessDenied />;
            case 'TEMPLATE_MANAGEMENT':
                return hasPermission('manageNotificationSettings') ? <TemplateManagement /> : <AccessDenied />;
            case 'ANNOUNCEMENTS':
                return hasPermission('manageAnnouncements') ? <Announcements /> : <AccessDenied />;
            case 'MAINTENANCE':
                return hasPermission('manageSystemSettings') ? <Maintenance /> : <AccessDenied />;
            case 'ACCESS_MANAGEMENT':
                return hasPermission('manageSystemSettings') ? <AccessManagement /> : <AccessDenied />;
            case 'SETTINGS':
                 return hasPermission('manageSystemSettings') ? <Settings /> : <AccessDenied />;
            case 'AUDIT_LOGS':
                return hasPermission('viewAuditLogs') ? <SuperAdminAuditLogs /> : <AccessDenied />;
            case 'PROFILE':
                return <SuperAdminProfile />; // All admins should be able to see their profile
            default:
                return hasPermission('viewPlatformDashboard') ? <PlatformDashboard /> : <AccessDenied />;
        }
    };
    
    const pageTitleMap: Record<SuperAdminPage, string> = {
        PLATFORM_DASHBOARD: 'Platform Dashboard',
        TENANTS: 'Tenant Management',
        SUBSCRIPTIONS: 'Subscription Plans',
        TEAM_MANAGEMENT: 'Team Management',
        ROLE_MANAGEMENT: 'Role Management',
        PAYMENT_GATEWAYS: 'Payment Gateways',
        PAYMENT_TRANSACTIONS: 'Payment Transactions',
        NOTIFICATIONS: 'Notification Settings',
        TEMPLATE_MANAGEMENT: 'Template Management',
        ANNOUNCEMENTS: 'Global Announcements',
        MAINTENANCE: 'Platform Maintenance',
        ACCESS_MANAGEMENT: 'Access Management',
        SETTINGS: 'System Settings',
        AUDIT_LOGS: 'Audit Logs',
        PROFILE: 'My Profile',
    };

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200">
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

export default SuperAdminPanel;