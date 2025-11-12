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
                 <div key={post.id} className="bg-slate-900 p-8 rounded-