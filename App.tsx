





import React, { useState, useEffect } from 'react';
import { AppContextProvider } from './context/AppContext';
import TenantApp from './components/TenantApp';
import SuperAdminPanel from './components/superadmin/SuperAdminPanel';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import { useAppContext } from './hooks/useAppContext';
import { FaqItem, PageContent } from './types';
import Icon from './components/icons';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';


export type Page = 'DASHBOARD' | 'POS' | 'INVENTORY' | 'LOGISTICS' | 'PURCHASES' | 'ACCOUNTING' | 'REPORTS' | 'SETTINGS' | 'CREDIT_MANAGEMENT' | 'CONSIGNMENT' | 'BILLING' | 'CHECKOUT';
export type SuperAdminPage = 'PLATFORM_DASHBOARD' | 'TENANTS' | 'SUBSCRIPTIONS' | 'TEAM_MANAGEMENT' | 'ROLE_MANAGEMENT' | 'PAYMENT_GATEWAYS' | 'PAYMENT_TRANSACTIONS' | 'NOTIFICATIONS' | 'TEMPLATE_MANAGEMENT' | 'SETTINGS' | 'ANNOUNCEMENTS';
export type View = 'landing' | 'login' | 'signup' | 'forgot_password' | 'terms' | 'privacy' | 'refund' | 'contact' | 'about' | 'faq' | 'help' | 'api' | 'blog' | 'app';

// InfoPage component to display text-based content
const InfoPage: React.FC<{ pageKey: View, setView: (view: View) => void }> = ({ pageKey, setView }) => {
    const { brandConfig, pageContent } = useAppContext();

    const keyMap: Record<string, keyof Omit<PageContent, 'faqs'>> = {
        'about': 'about',
        'contact': 'contact',
        'terms': 'terms',
        'privacy': 'privacy',
        'refund': 'refund',
        'help': 'helpCenter',
        'api': 'apiDocs',
        'blog': 'blog'
    };

    const contentKey = keyMap[pageKey];
    const content = pageKey === 'faq' ? pageContent.faqs : pageContent[contentKey];

    const titleMap: Record<string, string> = {
        about: 'About Us',
        contact: 'Contact Us',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        refund: 'Refund Policy',
        faq: 'Frequently Asked Questions',
        help: 'Help Center',
        api: 'API Documentation',
        blog: 'Blog'
    };
    const title = titleMap[pageKey];

    const FaqAccordion: React.FC<{ items: FaqItem[] }> = ({ items }) => {
        const [openId, setOpenId] = useState<string | null>(items.length > 0 ? items[0].id : null);

        return (
            <div className="space-y-4">
                {items.map(item => (
                    <div key={item.id} className="border-b-2 border-gray-800">
                        <button
                            onClick={() => setOpenId(openId === item.id ? null : item.id)}
                            className="w-full text-left flex justify-between items-center py-4 focus:outline-none"
                        >
                            <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                            <Icon name={openId === item.id ? 'minus' : 'plus'} className="w-6 h-6 text-indigo-400" />
                        </button>
                        {openId === item.id && (
                            <div className="pb-4 text-gray-400 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.answer.replace(/\n/g, '<br />') }}/>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-300">
             <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                     <a href="#" onClick={(e) => { e.preventDefault(); setView('landing'); }} className="flex items-center">
                       {brandConfig.logoUrl ? (
                            <img src={brandConfig.logoUrl} alt={`${brandConfig.name} Logo`} className="h-8 w-auto" />
                        ) : (
                            <svg className="w-8 h-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.54-.403 1.25-.624 1.968-.624a4.58 4.58 0 0 1 .844.119" />
                            </svg>
                        )}
                        <span className="ml-2 text-2xl font-bold text-white">{brandConfig.name}</span>
                    </a>
                    <button onClick={() => setView('landing')} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors">
                        Back to Home
                    </button>
                </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-white mb-8">{title}</h1>
                <div className="bg-gray-900 p-8 rounded-lg">
                    {pageKey === 'faq' ? (
                        <FaqAccordion items={content as FaqItem[]} />
                    ) : (
                       <div className="prose prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: (content as string).replace(/\n/g, '<br />') }}></div>
                    )}
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [userRole, setUserRole] = useState<'TENANT' | 'SUPER_ADMIN' | null>(null);

  const handleLoginSuccess = (role: 'TENANT' | 'SUPER_ADMIN') => {
    setUserRole(role);
    setView('app');
  };

  const handleLogout = () => {
    setUserRole(null);
    setView('landing');
  };
  
  const RenderedView = () => {
      const { brandConfig } = useAppContext();
      useEffect(() => {
        document.title = `${brandConfig.name} - SaaS POS`;
        const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (favicon) {
            favicon.href = brandConfig.faviconUrl;
        }
    }, [brandConfig]);

    switch (view) {
      case 'landing':
        return <LandingPage onNavigate={setView} />;
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} onNavigate={setView} />;
      case 'signup':
        return <SignUp onNavigate={setView} />;
      case 'forgot_password':
        return <ForgotPassword onNavigate={setView} />;
      case 'terms':
      case 'privacy':
      case 'refund':
      case 'contact':
      case 'about':
      case 'faq':
      case 'help':
      case 'api':
      case 'blog':
        return <InfoPage pageKey={view} setView={setView} />;
      case 'app':
        if (userRole) {
          return userRole === 'TENANT' ? <TenantApp /> : <SuperAdminPanel />;
        }
        setTimeout(() => setView('login'), 0); 
        return <Login onLoginSuccess={handleLoginSuccess} onNavigate={setView} />;
      default:
        return <LandingPage onNavigate={setView} />;
    }
  }

  return (
    <AppContextProvider onLogout={handleLogout}>
      <RenderedView/>
    </AppContextProvider>
  )
};

export default App;