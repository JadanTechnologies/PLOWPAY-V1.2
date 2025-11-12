import React, { useState, useEffect, useMemo } from 'react';
import { AppContextProvider } from './context/AppContext';
import TenantApp from './components/TenantApp';
import SuperAdminPanel from './components/superadmin/SuperAdminPanel';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import { useAppContext } from './hooks/useAppContext';
import { FaqItem, PageContent, NotificationType, BlogPost, Tenant } from './types';
import Icon from './components/icons/index.tsx';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import MaintenancePage from './components/MaintenancePage';
import AccessDeniedPage from './components/AccessDeniedPage';
import VerificationPage from './components/VerificationPage';


export type Page = 'DASHBOARD' | 'POS' | 'INVENTORY' | 'LOGISTICS' | 'PURCHASES' | 'ACCOUNTING' | 'REPORTS' | 'SETTINGS' | 'CREDIT_MANAGEMENT' | 'CONSIGNMENT' | 'BILLING' | 'CHECKOUT' | 'PROFILE' | 'AUDIT_LOGS' | 'DEPOSIT_MANAGEMENT' | 'SUPPORT' | 'BUDGETING' | 'TEMPLATES' | 'COMMUNICATIONS';
export type SuperAdminPage = 'PLATFORM_DASHBOARD' | 'TENANTS' | 'SUBSCRIPTIONS' | 'TEAM_MANAGEMENT' | 'ROLE_MANAGEMENT' | 'PAYMENT_GATEWAYS' | 'PAYMENT_TRANSACTIONS' | 'NOTIFICATIONS' | 'TEMPLATE_MANAGEMENT' | 'SETTINGS' | 'ANNOUNCEMENTS' | 'MAINTENANCE' | 'ACCESS_MANAGEMENT' | 'PROFILE' | 'AUDIT_LOGS' | 'SUPPORT_TICKETS' | 'BLOG_MANAGEMENT' | 'COMMUNICATIONS' | 'FLEET_OVERVIEW';
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
    const { brandConfig, pageContent, blogPosts } = useAppContext();

    const keyMap: Record<string, keyof Omit<PageContent, 'faqs' | 'blog'>> = {
        'about': 'about',
        'contact': 'contact',
        'terms': 'terms',
        'privacy': 'privacy',
        'refund': 'refund',
        'help': 'helpCenter',
        'api': 'apiDocs',
    };

    const contentKey = keyMap[pageKey];
    const content = pageKey === 'faq' ? pageContent.faqs : pageKey === 'blog' ? null : pageContent[contentKey];

    const titleMap: Record<string, string> = {
        about: 'About Us',
        contact: 'Contact Us',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        refund: 'Refund Policy',
        faq: 'Frequently Asked Questions',
        help: 'Help Center',
        api: 'API Documentation',
        blog: 'Our Blog'
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

    const BlogList: React.FC<{ posts: BlogPost[] }> = ({ posts }) => (
        <div className="space-y-8">
            {posts.filter(p => p.status === 'PUBLISHED').map(post => (
                 <div key={post.id} className="bg-slate-900 p-8 rounded-lg shadow-lg">
                    {post.featuredImage && <img src={post.featuredImage} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-6" />}
                    <h2 className="text-3xl font-bold text-white mb-2">{post.title}</h2>
                    <p className="text-slate-400 mb-4">By {post.authorName} on {new Date(post.createdAt).toLocaleDateString()}</p>
                    <div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>
            ))}
        </div>
    );


    return (
        <div className="bg-slate-950 text-white min-h-screen">
             <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                         <a href="#" onClick={(e) => { e.preventDefault(); setView('landing'); }} className="flex items-center">
                           <svg className="w-8 h-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.54-.403 1.25-.624 1.968-.624a4.58 4.58 0 0 1 .844.119" />
                            </svg>
                           <span className="ml-2 text-2xl font-bold">{brandConfig.name}</span>
                        </a>
                        <button onClick={() => setView('login')} className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold px-4 py-2 rounded-md">
                            Go to App
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <button onClick={() => setView('landing')} className="flex items-center text-cyan-400 hover:text-cyan-300 mb-8">
                    <Icon name="chevronLeft" className="w-5 h-5 mr-2" />
                    Back to Home
                </button>
                <h1 className="text-4xl font-extrabold mb-8">{title}</h1>
                <div className="bg-slate-900 p-8 rounded-lg shadow-lg">
                    {pageKey === 'faq' && Array.isArray(content) && <FaqAccordion items={content} />}
                    {pageKey === 'blog' && blogPosts && <BlogList posts={blogPosts} />}
                    {typeof content === 'string' && <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />}
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AppContextProvider>
            <AppContent />
        </AppContextProvider>
    );
};

const AppContent: React.FC = () => {
    // FIX: Destructure setSession and setProfile from useAppContext to correctly manage authentication state.
    const { session, profile, impersonatedUser, notification, setNotification, systemSettings, setSession, setProfile } = useAppContext();
    const [view, setView] = useState<View>('landing');
    const [viewData, setViewData] = useState<any>(null);

    const isMaintenanceMode = systemSettings.maintenanceSettings.isActive;
    const isSuperAdmin = profile?.is_super_admin === true;
    
    // Simulate initial auth check
    useEffect(() => {
        const sessionData = localStorage.getItem('flowpay_session');
        if (sessionData) {
            const parsed = JSON.parse(sessionData);
            setSession(parsed);
            setProfile(parsed.profile);
            setView('app');
        } else {
            setView('landing');
        }
    }, [setSession, setProfile]);
    
     useEffect(() => {
        if (session) {
            setView('app');
        } else {
            setView('landing');
        }
    }, [session]);

    const handleNavigate = (newView: View, data?: any) => {
        setView(newView);
        if (data) {
            setViewData(data);
        }
    };
    
    // Check access control settings
    const isAccessDenied = useMemo(() => {
        if (isSuperAdmin || isMaintenanceMode) return false; // Admins and maintenance mode bypass this
        const { mode, ipBlacklist } = systemSettings.accessControlSettings;
        if (mode === 'ALLOW_ALL') return false;
        
        // This is a simplified check. A real app would get user's IP, country, etc. from a service.
        // For this demo, we'll just check a mock IP against the blacklist.
        const mockUserIp = "192.168.1.100"; 
        
        if (mode === 'BLOCK_LISTED' && ipBlacklist.includes(mockUserIp)) {
            return true;
        }

        // Add more checks for other rules (whitelist, country, etc.) here
        
        return false;
    }, [systemSettings.accessControlSettings, isSuperAdmin, isMaintenanceMode]);

    if (isMaintenanceMode && !isSuperAdmin) {
        return <MaintenancePage message={systemSettings.maintenanceSettings.message} />;
    }
    
    if (isAccessDenied) {
        return <AccessDeniedPage />;
    }

    const handleImpersonate = (tenant: Tenant) => {
      // In App.tsx, this function should just call the context function.
      // The context itself will handle the state logic.
      // This is passed down to SuperAdminPanel.
    };
    
    let content;

    if (view === 'app' && session && profile) {
        if (profile.is_super_admin && !impersonatedUser) {
            content = <SuperAdminPanel onImpersonate={handleImpersonate}/>;
        } else {
            content = <TenantApp />;
        }
    } else {
        switch (view) {
            case 'login':
                content = <Login onNavigate={handleNavigate} />;
                break;
            case 'signup':
                content = <SignUp onNavigate={handleNavigate} />;
                break;
            case 'forgot_password':
                content = <ForgotPassword onNavigate={handleNavigate} />;
                break;
            case 'verification':
                content = <VerificationPage email={viewData?.email} onNavigate={handleNavigate} />;
                break;
            case 'about':
            case 'contact':
            case 'terms':
            case 'privacy':
            case 'refund':
            case 'faq':
            case 'help':
            case 'api':
            case 'blog':
                content = <InfoPage pageKey={view} setView={setView} />;
                break;
            default:
                content = <LandingPage onNavigate={handleNavigate} />;
        }
    }

    return (
        <>
            {content}
            <Notification notification={notification} onDismiss={() => setNotification(null)} />
        </>
    );
};

export default App;