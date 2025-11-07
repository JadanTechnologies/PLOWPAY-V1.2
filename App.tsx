

import React, { useState, useEffect } from 'react';
import { AppContextProvider } from './context/AppContext';
import TenantApp from './components/TenantApp';
import SuperAdminPanel from './components/superadmin/SuperAdminPanel';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import { useAppContext } from './hooks/useAppContext';
import { FaqItem, PageContent, NotificationType } from './types';
import Icon from './components/icons/index.tsx';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import MaintenancePage from './components/MaintenancePage';
import AccessDeniedPage from './components/AccessDeniedPage';
import VerificationPage from './components/VerificationPage';


export type Page = 'DASHBOARD' | 'POS' | 'INVENTORY' | 'LOGISTICS' | 'PURCHASES' | 'ACCOUNTING' | 'REPORTS' | 'SETTINGS' | 'CREDIT_MANAGEMENT' | 'CONSIGNMENT' | 'BILLING' | 'CHECKOUT' | 'PROFILE' | 'AUDIT_LOGS' | 'DEPOSIT_MANAGEMENT' | 'SUPPORT';
export type SuperAdminPage = 'PLATFORM_DASHBOARD' | 'TENANTS' | 'SUBSCRIPTIONS' | 'TEAM_MANAGEMENT' | 'ROLE_MANAGEMENT' | 'PAYMENT_GATEWAYS' | 'PAYMENT_TRANSACTIONS' | 'NOTIFICATIONS' | 'TEMPLATE_MANAGEMENT' | 'SETTINGS' | 'ANNOUNCEMENTS' | 'MAINTENANCE' | 'ACCESS_MANAGEMENT' | 'PROFILE' | 'AUDIT_LOGS' | 'SUPPORT_TICKETS';
export type View = 'landing' | 'login' | 'signup' | 'forgot_password' | 'terms' | 'privacy' | 'refund' | 'contact' | 'about' | 'faq' | 'help' | 'api' | 'blog' | 'app' | 'verification';

// Global Notification/Toast Component
const Notification: React.FC<{ notification: NotificationType | null, onDismiss: () => void }> = ({ notification, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                // Allow time for fade-out animation before dismissing
                setTimeout(onDismiss, 300);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, onDismiss]);

    if (!notification) return null;
    
    const baseClasses = "fixed top-5 right-5 w-full max-w-sm p-4 rounded-lg shadow-2xl z-[100] transition-all duration-300 ease-in-out transform";
    const visibilityClasses = isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12";
    
    const typeClasses = {
        success: 'bg-green-600/90 backdrop-blur-sm border border-green-500 text-white',
        error: 'bg-red-600/90 backdrop-blur-sm border border-red-500 text-white',
        info: 'bg-blue-600/90 backdrop-blur-sm border border-blue-500 text-white',
    };
    
    const iconMap = {
        success: 'check',
        error: 'x-mark',
        info: 'notification',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[notification.type]} ${visibilityClasses}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <Icon name={iconMap[notification.type]} className="w-6 h-6" />
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium">{notification.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button onClick={() => setIsVisible(false)} className="inline-flex rounded-md text-white/70 hover:text-white/100 focus:outline-none">
                        <Icon name="x-mark" className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};


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
                    <div key={item.id} className="border-b border-slate-800">
                        <button
                            onClick={() => setOpenId(openId === item.id ? null : item.id)}
                            className="w-full text-left flex justify-between items-center py-4 focus:outline-none"
                        >
                            <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                            <Icon name={openId === item.id ? 'minus' : 'plus'} className="w-6 h-6 text-cyan-400" />
                        </button>
                        {openId === item.id && (
                            <div className="pb-4 text-slate-400 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.answer.replace(/\n/g, '<br />') }}/>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300">
             <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                     <a href="#" onClick={(e) => { e.preventDefault(); setView('landing'); }} className="flex items-center">
                       {brandConfig.logoUrl ? (
                            <img src={brandConfig.logoUrl} alt={`${brandConfig.name} Logo`} className="h-8 w-auto" />
                        ) : (
                            <svg className="w-8 h-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.54-.403 1.25-.624 1.968-.624a4.58 4.58 0 0 1 .844.119" />
                            </svg>
                        )}
                        <span className="ml-2 text-2xl font-bold text-white">{brandConfig.name}</span>
                    </a>
                    <button onClick={() => setView('landing')} className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold px-4 py-2 rounded-md hover:from-cyan-600 hover:to-teal-600 transition-colors">
                        Back to Home
                    </button>
                </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-white mb-8">{title}</h1>
                <div className="bg-slate-900 p-8 rounded-lg border border-slate-800">
                    {pageKey === 'faq' ? (
                        <FaqAccordion items={content as FaqItem[]} />
                    ) : (
                       <div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: (content as string).replace(/\n/g, '<br />') }}></div>
                    )}
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [userRole, setUserRole] = useState<'TENANT' | 'SUPER_ADMIN' | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const handleLoginSuccess = (role: 'TENANT' | 'SUPER_ADMIN') => {
    setUserRole(role);
    setView('app');
  };

  const handleLogout = () => {
    setUserRole(null);
    setView('landing');
  };

  const handleNavigate = (newView: View, data?: any) => {
    if (newView === 'verification' && data?.email) {
        setVerificationEmail(data.email);
    }
    setView(newView);
  };
  
  const RenderedView = () => {
      const { brandConfig, systemSettings, notification, setNotification } = useAppContext();
      const { isActive: isMaintenanceMode, message: maintenanceMessage } = systemSettings.maintenanceSettings || { isActive: false, message: '' };
      const { accessControlSettings } = systemSettings;
      const [isBlocked, setIsBlocked] = useState(false);

      useEffect(() => {
        document.title = `${brandConfig.name} - SaaS POS`;
        const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (favicon) {
            favicon.href = brandConfig.faviconUrl;
        }
      }, [brandConfig]);

      useEffect(() => {
        if (userRole === 'SUPER_ADMIN') {
            setIsBlocked(false);
            return;
        }

        const checkAccess = () => {
            const { mode, ipBlacklist, countryBlacklist, browserBlacklist, deviceBlacklist, ipWhitelist, countryWhitelist, browserWhitelist, deviceWhitelist } = accessControlSettings;
            if (mode === 'ALLOW_ALL') return false;

            // --- SIMULATION CONTEXT ---
            // In a real app, this data would come from the user's request, GeoIP lookup, and user-agent parsing.
            // For this demo, we'll simulate a user from a blocked country (Iran) on a blocked browser (IE).
            const userAgent = navigator.userAgent;
            let browser = "Other";
            if (userAgent.includes("Chrome")) browser = "Chrome";
            else if (userAgent.includes("Firefox")) browser = "Firefox";
            else if (userAgent.includes("Safari")) browser = "Safari";
            else if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) browser = "IE";
            
            let device: 'desktop' | 'mobile' | 'tablet' = 'desktop';
            if (/Mobi|Android/i.test(userAgent)) device = 'mobile';
            else if (/Tablet|iPad/i.test(userAgent)) device = 'tablet';


            const userContext = {
                ip: '81.91.130.5', // A sample IP from Iran for demo purposes
                country: 'IR', // Simulating a user from Iran
                browser: browser,
                device: device
            };

            if (mode === 'BLOCK_LISTED') {
                if (ipBlacklist.some(ip => ip === userContext.ip)) return true;
                if (countryBlacklist.includes(userContext.country)) return true;
                if (browserBlacklist.includes(userContext.browser)) return true;
                if (deviceBlacklist.includes(userContext.device)) return true;
            }

            if (mode === 'ALLOW_LISTED') {
                if (ipWhitelist.length > 0 && !ipWhitelist.some(ip => ip === userContext.ip)) return true;
                if (countryWhitelist.length > 0 && !countryWhitelist.includes(userContext.country)) return true;
                if (browserWhitelist.length > 0 && !browserWhitelist.includes(userContext.browser)) return true;
                if (deviceWhitelist.length > 0 && !deviceWhitelist.includes(userContext.device)) return true;
            }
            
            return false; // If no rules match to block, allow.
        };

        setIsBlocked(checkAccess());

    }, [accessControlSettings, userRole]);


    if (isBlocked) {
        return <AccessDeniedPage />;
    }

    if (isMaintenanceMode && userRole !== 'SUPER_ADMIN') {
        return <MaintenancePage message={maintenanceMessage} />;
    }
    
    let viewComponent;
    switch (view) {
      case 'landing':
        viewComponent = <LandingPage onNavigate={handleNavigate} />;
        break;
      case 'login':
        viewComponent = <Login onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
        break;
      case 'signup':
        viewComponent = <SignUp onNavigate={handleNavigate} />;
        break;
      case 'verification':
        viewComponent = <VerificationPage email={verificationEmail} onNavigate={handleNavigate} />;
        break;
      case 'forgot_password':
        viewComponent = <ForgotPassword onNavigate={handleNavigate} />;
        break;
      case 'terms':
      case 'privacy':
      case 'refund':
      case 'contact':
      case 'about':
      case 'faq':
      case 'help':
      case 'api':
      case 'blog':
        viewComponent = <InfoPage pageKey={view} setView={handleNavigate} />;
        break;
      case 'app':
        if (userRole) {
          viewComponent = userRole === 'TENANT' ? <TenantApp /> : <SuperAdminPanel />;
        } else {
            setTimeout(() => setView('login'), 0); 
            viewComponent = <Login onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
        }
        break;
      default:
        viewComponent = <LandingPage onNavigate={handleNavigate} />;
        break;
    }

    return (
        <>
            <Notification notification={notification} onDismiss={() => setNotification(null)} />
            {viewComponent}
        </>
    );
  }

  return (
    <AppContextProvider onLogout={handleLogout}>
      <RenderedView/>
    </AppContextProvider>
  )
};

export default App;