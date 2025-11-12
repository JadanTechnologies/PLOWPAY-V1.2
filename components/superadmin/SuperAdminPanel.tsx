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
import { BrandConfig, PageContent, FaqItem, SystemSettings, Currency, Language, LandingPageMetrics, FeaturedUpdateSettings, Tenant, AISettings, IpGeolocationProvider, MapProvider, SupabaseSettings } from '../../types';
import Icon from '../icons/index.tsx';
import { usePermissions } from '../../hooks/usePermissions';
import Announcements from './Announcements';
import PaymentTransactions from './PaymentTransactions';
import TemplateManagement from './TemplateManagement';
import Maintenance from './Maintenance';
import AccessManagement from './AccessManagement';
import SuperAdminProfile from './Profile';
import SuperAdminAuditLogs from './AuditLogs';
import SupportManagement from './SupportManagement';
import BlogManagement from './BlogManagement';
import Communications from './Communications';
import { allTimezones } from '../../utils/data';

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
    type SettingsTab = 'branding' | 'content' | 'faqs' | 'localization' | 'providers' | 'ai_settings' | 'landing' | 'featured_update' | 'supabase';
    const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
    const { brandConfig, pageContent, systemSettings, updateBrandConfig, updatePageContent, updateFaqs, updateSystemSettings, updateLandingPageMetrics, setNotification } = useAppContext();

    // State for each settings tab
    const [brandForm, setBrandForm] = useState<BrandConfig>(brandConfig);
    const [contentForm, setContentForm] = useState<Omit<PageContent, 'faqs'>>(pageContent);
    const [faqs, setFaqs] = useState<FaqItem[]>(pageContent.faqs);
    const [landingMetrics, setLandingMetrics] = useState(systemSettings.landingPageMetrics);
    const [featuredUpdate, setFeaturedUpdate] = useState<FeaturedUpdateSettings>(systemSettings.featuredUpdate);
    const [aiSettings, setAiSettings] = useState<AISettings>(systemSettings.aiSettings);
    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const [showOpenAiKey, setShowOpenAiKey] = useState(false);
    const [supabaseSettings, setSupabaseSettings] = useState<SupabaseSettings>(systemSettings.supabaseSettings);
    const [showSupabaseKey, setShowSupabaseKey] = useState(false);
    
    // State for localization
    const [currencies, setCurrencies] = useState<Currency[]>(systemSettings.currencies);
    const [defaultCurrency, setDefaultCurrency] = useState<string>(systemSettings.defaultCurrency);
    const [languages, setLanguages] = useState<Language[]>(systemSettings.languages);
    const [defaultLanguage, setDefaultLanguage] = useState<string>(systemSettings.defaultLanguage);
    const [defaultTimezone, setDefaultTimezone] = useState<string>(systemSettings.defaultTimezone);

    // State for providers
    const [mapProviders, setMapProviders] = useState<MapProvider[]>(systemSettings.mapProviders);
    const [activeMapProviderId, setActiveMapProviderId] = useState<string>(systemSettings.activeMapProviderId);
    const [ipGeoProviders, setIpGeoProviders] = useState<IpGeolocationProvider[]>(systemSettings.ipGeolocationProviders);
    const [activeIpGeoProviderId, setActiveIpGeoProviderId] = useState<string>(systemSettings.activeIpGeolocationProviderId);


    useEffect(() => {
        setBrandForm(brandConfig);
        setContentForm(pageContent);
        setFaqs(pageContent.faqs);
        setLandingMetrics(systemSettings.landingPageMetrics);
        setFeaturedUpdate(systemSettings.featuredUpdate);
        setAiSettings(systemSettings.aiSettings);
        setSupabaseSettings(systemSettings.supabaseSettings);
        setCurrencies(systemSettings.currencies);
        setDefaultCurrency(systemSettings.defaultCurrency);
        setLanguages(systemSettings.languages);
        setDefaultLanguage(systemSettings.defaultLanguage);
        setDefaultTimezone(systemSettings.defaultTimezone);
        setMapProviders(systemSettings.mapProviders);
        setActiveMapProviderId(systemSettings.activeMapProviderId);
        setIpGeoProviders(systemSettings.ipGeolocationProviders);
        setActiveIpGeoProviderId(systemSettings.activeIpGeolocationProviderId);
    }, [brandConfig, pageContent, systemSettings]);

    const handleBrandSave = () => {
        if(window.confirm("Are you sure you want to save branding settings?")){
            updateBrandConfig(brandForm);
            setNotification({ type: 'success', message: 'Branding settings saved successfully.' });
        }
    };

    const handleContentSave = () => {
        if(window.confirm("Are you sure you want to save page content?")){
            updatePageContent(contentForm);
            setNotification({ type: 'success', message: 'Page content saved successfully.' });
        }
    };

    const handleFaqsSave = () => {
        if(window.confirm("Are you sure you want to save FAQs?")){
            updateFaqs(faqs);
            setNotification({ type: 'success', message: 'FAQs saved successfully.' });
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

    const pageContentKeys: (keyof Omit<PageContent, 'faqs'>)[] = [ 'about', 'contact', 'terms', 'privacy', 'refund', 'helpCenter', 'apiDocs', 'blog' ];

    const handleCurrencyToggle = (code: string) => {
        const newCurrencies = currencies.map(c => c.code === code ? { ...c, enabled: !c.enabled } : c);
        setCurrencies(newCurrencies);
    
        // If the currency that was just disabled IS the currently selected default currency...
        if (code === defaultCurrency && !newCurrencies.find(c => c.code === code)?.enabled) {
            // ...find a new default from the remaining enabled currencies.
            const newDefault = newCurrencies.find(c => c.enabled);
            if (newDefault) {
                setDefaultCurrency(newDefault.code);
            }
        }
    };
    
    const handleLanguageToggle = (code: string) => {
        const newLanguages = languages.map(l => l.code === code ? { ...l, enabled: !l.enabled } : l);
        setLanguages(newLanguages);
        
        // If the language that was just disabled IS the currently selected default language...
        if (code === defaultLanguage && !newLanguages.find(l => l.code === code)?.enabled) {
            // ...find a new default from the remaining enabled languages.
            const newDefault = newLanguages.find(l => l.enabled);
            if (newDefault) {
                setDefaultLanguage(newDefault.code);
            }
        }
    };

    const handleCurrencySave = () => {
        if (!currencies.find(c => c.enabled)) {
            setNotification({ message: 'At least one currency must be enabled.', type: 'error' });
            return;
        }
        if (!currencies.find(c => c.code === defaultCurrency)?.enabled) {
            setNotification({ message: 'The selected default currency must be enabled. Please select an enabled currency as the default.', type: 'error' });
            return;
        }
        if (window.confirm("Are you sure you want to save currency settings?")) {
            updateSystemSettings({ currencies, defaultCurrency });
            setNotification({ type: 'success', message: 'Currency settings saved successfully.' });
        }
    };

    const handleLanguageSave = () => {
         if (!languages.find(l => l.enabled)) {
            setNotification({ message: 'At least one language must be enabled.', type: 'error' });
            return;
        }
        if (!languages.find(l => l.code === defaultLanguage)?.enabled) {
            setNotification({ message: 'The selected default language must be enabled. Please select an enabled language as the default.', type: 'error' });
            return;
        }
        if (window.confirm("Are you sure you want to save language settings?")) {
            updateSystemSettings({ languages, defaultLanguage });
            setNotification({ type: 'success', message: 'Language settings saved successfully.' });
        }
    };
    
    const handleTimezoneSave = () => {
        if (window.confirm("Are you sure you want to save the default timezone?")) {
            updateSystemSettings({ defaultTimezone });
            setNotification({ type: 'success', message: 'Default timezone saved successfully.' });
        }
    };

    const handleMetricsChange = (metric: keyof LandingPageMetrics, field: 'value' | 'label', value: string) => {
        const isValue = field === 'value';
        setLandingMetrics(prev => ({ ...prev, [metric]: { ...prev[metric], [field]: isValue ? Number(value) : value, } }));
    };

    const handleMetricsSave = () => {
        if(window.confirm("Are you sure you want to update landing page metrics?")){
            updateLandingPageMetrics(landingMetrics);
            setNotification({ type: 'success', message: 'Landing page metrics saved successfully.' });
        }
    };
    
    const handleFeaturedUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFeaturedUpdate(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleFeaturedUpdateSave = () => {
         if(window.confirm("Are you sure you want to update the featured update banner?")){
            updateSystemSettings({ ...systemSettings, featuredUpdate });
            setNotification({ type: 'success', message: 'Featured update saved successfully.' });
        }
    };

    const handleAiSettingsChange = (provider: 'gemini' | 'openai', field: 'apiKey', value: string) => {
        setAiSettings(prev => ({ ...prev, [provider]: { ...prev[provider], [field]: value, } }));
    };
    
    const handleAiProviderChange = (provider: 'gemini' | 'openai') => {
        setAiSettings(prev => ({ ...prev, provider: provider }));
    };

    const handleAiSettingsSave = () => {
        const { provider, gemini, openai } = aiSettings;

        if (provider === 'gemini' && !gemini.apiKey.trim()) {
            setNotification({ message: 'Gemini API key is required when it is the selected provider.', type: 'error' });
            return;
        }
        if (provider === 'openai' && !openai.apiKey.trim()) {
            setNotification({ message: 'OpenAI API key is required when it is the selected provider.', type: 'error' });
            return;
        }

        if (gemini.apiKey.trim() && !gemini.apiKey.startsWith('AIza')) {
            setNotification({ message: 'Invalid Gemini API key format. It should start with "AIza".', type: 'error' });
            return;
        }
        if (openai.apiKey.trim() && !openai.apiKey.startsWith('sk-')) {
            setNotification({ message: 'Invalid OpenAI API key format. It should start with "sk-".', type: 'error' });
            return;
        }

        if (window.confirm("Are you sure you want to save AI settings?")) {
            updateSystemSettings({ aiSettings });
            setNotification({ type: 'success', message: 'AI settings saved successfully.' });
        }
    };

    const handleSupabaseSettingsSave = () => {
        if (window.confirm("Are you sure you want to save these Supabase settings? Note: This will NOT update the primary app connection. See instructions.")) {
            updateSystemSettings({ supabaseSettings });
            setNotification({ type: 'success', message: 'Supabase settings saved successfully.' });
        }
    };

    const handleProviderSave = () => {
        if (window.confirm("Are you sure you want to save provider settings?")) {
            updateSystemSettings({ 
                mapProviders,
                activeMapProviderId,
                ipGeolocationProviders: ipGeoProviders,
                activeIpGeolocationProviderId: activeIpGeoProviderId 
            });
            setNotification({ type: 'success', message: 'Provider settings saved successfully.' });
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
            case 'localization':
                 return (
                    <div className="space-y-8">
                        {/* Currency Settings */}
                        <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                            <h3 className="text-lg font-semibold text-white">Currency Settings</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {currencies.map(currency => (
                                    <div key={currency.code} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-700/50">
                                        <div><span className="font-semibold">{currency.name}</span><span className="text-slate-400 ml-2">({currency.code} - {currency.symbol})</span></div>
                                        <Toggle enabled={currency.enabled} onChange={() => handleCurrencyToggle(currency.code)} />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400">Default Currency</label>
                                <select value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3">
                                    {currencies.filter(c => c.enabled).map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                                </select>
                            </div>
                            <div className="text-right"><button onClick={handleCurrencySave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save Currency Settings</button></div>
                        </div>

                        {/* Language Settings */}
                        <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                            <h3 className="text-lg font-semibold text-white">Language Settings</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {languages.map(lang => (
                                    <div key={lang.code} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-700/50">
                                        <div><span className="font-semibold">{lang.name}</span><span className="text-slate-400 ml-2">({lang.code})</span></div>
                                        <Toggle enabled={lang.enabled} onChange={() => handleLanguageToggle(lang.code)} />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400">Default Language</label>
                                <select value={defaultLanguage} onChange={e => setDefaultLanguage(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3">
                                    {languages.filter(l => l.enabled).map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                                </select>
                            </div>
                            <div className="text-right"><button onClick={handleLanguageSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save Language Settings</button></div>
                        </div>
                        
                        {/* Timezone Settings */}
                        <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                             <h3 className="text-lg font-semibold text-white">Timezone Settings</h3>
                             <div>
                                 <label className="block text-sm font-medium text-slate-400">Default Platform Timezone</label>
                                 <select value={defaultTimezone} onChange={e => setDefaultTimezone(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3">
                                     {allTimezones.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                 </select>
                            </div>
                             <div className="text-right"><button onClick={handleTimezoneSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save Timezone</button></div>
                        </div>
                    </div>
                );
            case 'providers':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                            <h3 className="text-lg font-semibold text-white">Map Provider Settings</h3>
                             <div>
                                <label className="block text-sm font-medium text-slate-400">Active Map Provider</label>
                                <select value={activeMapProviderId} onChange={e => setActiveMapProviderId(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3">
                                    {mapProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                             {mapProviders.map((provider, index) => (
                                <div key={provider.id}>
                                    <label className="block text-sm font-medium text-slate-400">{provider.name} API Key</label>
                                    <input type="password" value={provider.apiKey} onChange={e => { const newProviders = [...mapProviders]; newProviders[index].apiKey = e.target.value; setMapProviders(newProviders); }} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3"/>
                                </div>
                             ))}
                        </div>
                         <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                            <h3 className="text-lg font-semibold text-white">IP Geolocation Provider</h3>
                             <div>
                                <label className="block text-sm font-medium text-slate-400">Active IP Geolocation Provider</label>
                                <select value={activeIpGeoProviderId} onChange={e => setActiveIpGeoProviderId(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3">
                                    {ipGeoProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                             {ipGeoProviders.map((provider, index) => (
                                <div key={provider.id} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400">{provider.name} API Key</label>
                                        <input type="password" value={provider.apiKey} onChange={e => { const newProviders = [...ipGeoProviders]; newProviders[index].apiKey = e.target.value; setIpGeoProviders(newProviders); }} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400">{provider.name} API Endpoint</label>
                                        <input type="text" value={provider.apiEndpoint} onChange={e => { const newProviders = [...ipGeoProviders]; newProviders[index].apiEndpoint = e.target.value; setIpGeoProviders(newProviders); }} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3"/>
                                    </div>
                                </div>
                             ))}
                        </div>
                        <div className="text-right"><button onClick={handleProviderSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save Provider Settings</button></div>
                    </div>
                );
            case 'ai_settings':
                 return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Default AI Provider</label>
                            <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg p-1.5 max-w-xs">
                                <button onClick={() => handleAiProviderChange('gemini')} className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold ${aiSettings.provider === 'gemini' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}>Gemini</button>
                                <button onClick={() => handleAiProviderChange('openai')} className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold ${aiSettings.provider === 'openai' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}>OpenAI</button>
                            </div>
                        </div>
                         <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                            <h4 className="font-semibold text-white">Google Gemini Settings</h4>
                            <label className="block text-sm font-medium text-slate-400">API Key</label>
                            <div className="relative">
                                <input type={showGeminiKey ? 'text' : 'password'} value={aiSettings.gemini.apiKey} onChange={e => handleAiSettingsChange('gemini', 'apiKey', e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 pr-10 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                                <button type="button" onClick={() => setShowGeminiKey(!showGeminiKey)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white">
                                    <Icon name={showGeminiKey ? 'eye-slash' : 'eye'} className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                            <h4 className="font-semibold text-white">OpenAI Settings</h4>
                            <label className="block text-sm font-medium text-slate-400">API Key</label>
                            <div className="relative">
                                 <input type={showOpenAiKey ? 'text' : 'password'} value={aiSettings.openai.apiKey} onChange={e => handleAiSettingsChange('openai', 'apiKey', e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 pr-10 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                                 <button type="button" onClick={() => setShowOpenAiKey(!showOpenAiKey)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white">
                                    <Icon name={showOpenAiKey ? 'eye-slash' : 'eye'} className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <button onClick={handleAiSettingsSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save AI Settings</button>
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
            case 'featured_update':
                return (
                    <div className="space-y-6">
                         <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <div>
                                <h4 className="font-semibold text-white">Show Featured Update Banner</h4>
                                <p className="text-sm text-slate-400">Display a banner on the tenant dashboard for important announcements or new features.</p>
                            </div>
                            <Toggle enabled={featuredUpdate.isActive} onChange={isActive => setFeaturedUpdate(prev => ({ ...prev, isActive }))} />
                        </div>
                        <div className={`space-y-4 ${!featuredUpdate.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
                            <input name="title" value={featuredUpdate.title} onChange={handleFeaturedUpdateChange} placeholder="Banner Title" className="w-full bg-slate-700 p-2 rounded-md"/>
                            <textarea name="content" value={featuredUpdate.content} onChange={handleFeaturedUpdateChange} placeholder="Banner Content" rows={3} className="w-full bg-slate-700 p-2 rounded-md"/>
                            <div className="grid grid-cols-2 gap-4">
                                <input name="link" value={featuredUpdate.link || ''} onChange={handleFeaturedUpdateChange} placeholder="Link URL (optional)" className="w-full bg-slate-700 p-2 rounded-md"/>
                                <input name="linkText" value={featuredUpdate.linkText || ''} onChange={handleFeaturedUpdateChange} placeholder="Link Text (e.g., Learn More)" className="w-full bg-slate-700 p-2 rounded-md"/>
                            </div>
                        </div>
                         <div className="text-right">
                             <button onClick={handleFeaturedUpdateSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save Featured Update</button>
                        </div>
                    </div>
                );
            case 'supabase':
                return (
                    <div className="space-y-6">
                        <div className="bg-yellow-900/50 border border-yellow-700 p-4 rounded-lg flex items-start gap-3">
                            <Icon name="notification" className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-yellow-300">Important: Primary Connection Method</h4>
                                <p className="text-sm text-yellow-400 mt-1">For the main application to connect to Supabase upon startup, you <strong className="font-bold text-white">must</strong> set the credentials in a <code className="bg-black/50 p-1 rounded">.env</code> file in your project's root directory. The settings saved here are for reference or for other parts of the application and will not affect the initial connection.</p>
                                <pre className="bg-black/50 p-3 rounded-md text-xs text-white mt-2 overflow-x-auto">
                                    <code>
                                        VITE_SUPABASE_URL="YOUR_SUPABASE_URL_HERE"<br />
                                        VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY_HERE"
                                    </code>
                                </pre>
                            </div>
                        </div>
                        <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                            <h3 className="text-lg font-semibold text-white">Supabase Credentials</h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-400">Project URL</label>
                                <input type="text" value={supabaseSettings.projectUrl} onChange={e => setSupabaseSettings({...supabaseSettings, projectUrl: e.target.value})} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-400">Anon (Public) Key</label>
                                 <div className="relative">
                                    <input type={showSupabaseKey ? 'text' : 'password'} value={supabaseSettings.anonKey} onChange={e => setSupabaseSettings({...supabaseSettings, anonKey: e.target.value})} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 pr-10 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                                     <button type="button" onClick={() => setShowSupabaseKey(!showSupabaseKey)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white">
                                        <Icon name={showSupabaseKey ? 'eye-slash' : 'eye'} className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <button onClick={handleSupabaseSettingsSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save Supabase Settings</button>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <nav className="flex flex-col space-y-2">
                        {(['branding', 'content', 'faqs', 'localization', 'providers', 'ai_settings', 'supabase', 'landing', 'featured_update'] as SettingsTab[]).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left p-3 rounded-md font-medium text-sm ${activeTab === tab ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                                {tab.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="lg:col-span-3">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

interface SuperAdminPanelProps {
  onImpersonate: (tenant: Tenant) => void;
}

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ onImpersonate }) => {
  const [currentPage, setCurrentPage] = useState<SuperAdminPage>('PLATFORM_DASHBOARD');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { hasPermission } = usePermissions();

  const handleSetPage = useCallback((page: SuperAdminPage) => {
    setCurrentPage(page);
  }, []);

  const pageTitleMap: Record<SuperAdminPage, string> = {
    PLATFORM_DASHBOARD: 'Platform Dashboard',
    TENANTS: 'Tenant Management',
    SUBSCRIPTIONS: 'Subscription Management',
    TEAM_MANAGEMENT: 'Team Management',
    ROLE_MANAGEMENT: 'Role Management',
    PAYMENT_GATEWAYS: 'Payment Gateways',
    PAYMENT_TRANSACTIONS: 'Payment Transactions',
    NOTIFICATIONS: 'Notification Settings',
    TEMPLATE_MANAGEMENT: 'Template Management',
    SETTINGS: 'System Settings',
    ANNOUNCEMENTS: 'Announcements',
    MAINTENANCE: 'Platform Maintenance',
    ACCESS_MANAGEMENT: 'Access Management',
    PROFILE: 'My Profile',
    AUDIT_LOGS: 'Audit Logs',
    SUPPORT_TICKETS: 'Support Tickets',
    BLOG_MANAGEMENT: 'Blog Management',
    COMMUNICATIONS: 'Communications',
    // FIX: Added missing 'FLEET_OVERVIEW' property to satisfy the 'Record<SuperAdminPage, string>' type.
    FLEET_OVERVIEW: 'Fleet Overview',
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'PLATFORM_DASHBOARD': return hasPermission('viewPlatformDashboard') && <PlatformDashboard />;
      case 'TENANTS': return hasPermission('manageTenants') && <TenantManagement onImpersonate={onImpersonate}/>;
      case 'SUBSCRIPTIONS': return hasPermission('manageSubscriptions') && <SubscriptionManagement />;
      case 'PAYMENT_TRANSACTIONS': return hasPermission('managePaymentGateways') && <PaymentTransactions />;
      case 'TEAM_MANAGEMENT': return hasPermission('manageTeam') && <TeamManagement />;
      case 'ROLE_MANAGEMENT': return hasPermission('manageRoles') && <RoleManagement />;
      case 'PAYMENT_GATEWAYS': return hasPermission('managePaymentGateways') && <PaymentGateways />;
      case 'NOTIFICATIONS': return hasPermission('manageNotificationSettings') && <NotificationSettings />;
      case 'TEMPLATE_MANAGEMENT': return hasPermission('manageNotificationSettings') && <TemplateManagement />;
      case 'SETTINGS': return hasPermission('manageSystemSettings') && <Settings />;
      case 'ANNOUNCEMENTS': return hasPermission('manageAnnouncements') && <Announcements />;
      case 'COMMUNICATIONS': return hasPermission('manageNotificationSettings') && <Communications />;
      case 'MAINTENANCE': return hasPermission('manageSystemSettings') && <Maintenance />;
      case 'ACCESS_MANAGEMENT': return hasPermission('manageSystemSettings') && <AccessManagement />;
      case 'PROFILE': return <SuperAdminProfile />;
      case 'AUDIT_LOGS': return hasPermission('viewAuditLogs') && <SuperAdminAuditLogs />;
      case 'SUPPORT_TICKETS': return hasPermission('manageSupport') && <SupportManagement />;
      case 'BLOG_MANAGEMENT': return hasPermission('manageBlog') && <BlogManagement />;
      default: return <PlatformDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
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
          {renderPage() || <div>Access Denied or Page Not Found</div>}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminPanel;