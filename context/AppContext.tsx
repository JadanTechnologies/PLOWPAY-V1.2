import React, { createContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
// FIX: Removed supabase import as it's not used in the demo version and the file is empty.
import { 
    AppContextType, Product, Sale, Branch, StockLog, Tenant, SubscriptionPlan, 
    AdminUser, AdminRole, Permission, BrandConfig, PageContent, FaqItem, 
    PaymentSettings, NotificationSettings, Truck, Shipment, TrackerProvider, Staff, 
    CartItem, StaffRole, TenantPermission, allTenantPermissions, Supplier, 
    PurchaseOrder, Account, JournalEntry, Announcement, SystemSettings, Customer, 
    Consignment, Category, PaymentTransaction, EmailTemplate, SmsTemplate, 
    InAppNotification, MaintenanceSettings, AccessControlSettings, LandingPageMetrics, 
    AuditLog, NotificationType, Deposit, SupportTicket, TicketMessage, BlogPost,
    FeaturedUpdateSettings,
    LocalSession,
    Profile
} from '../types';
import { allCurrencies, allLanguages, allTimezones } from '../utils/data';

export const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedPrefs = window.localStorage.getItem('theme');
        if (typeof storedPrefs === 'string') {
            return storedPrefs as 'light' | 'dark';
        }
        const userMedia = window.matchMedia('(prefers-color-scheme: light)');
        if (userMedia.matches) {
            return 'light';
        }
    }
    return 'dark';
};

// --- START SAMPLE DATA ---
const sampleAdminRoles: AdminRole[] = [
    { id: 'role-super', name: 'Admin', permissions: ['viewPlatformDashboard', 'manageTenants', 'manageSubscriptions', 'manageTeam', 'manageRoles', 'manageSystemSettings', 'managePaymentGateways', 'manageNotificationSettings', 'manageAnnouncements', 'viewAuditLogs', 'manageSupport', 'manageBlog'] },
    { id: 'role-support', name: 'Support', permissions: ['viewPlatformDashboard', 'manageTenants', 'manageSupport'] }
];

const sampleAdminUsers: AdminUser[] = [
    { id: 'user-super', name: 'Platform Owner', email: 'superadmin@flowpay.com', username: 'superadmin', roleId: 'role-super', status: 'ACTIVE', joinDate: new Date('2023-01-15') }
];

const sampleSubscriptionPlans: SubscriptionPlan[] = [
    { id: 'plan-basic', name: 'Basic', price: 29, priceYearly: 290, features: ['1 Branch', '2 Staff', 'POS & Inventory', 'Basic Reporting'], description: 'For small businesses just getting started.', recommended: false },
    { id: 'plan-pro', name: 'Pro', price: 79, priceYearly: 790, features: ['5 Branches', '10 Staff', 'All Features', 'Advanced Reporting', 'API Access'], description: 'For growing businesses that need more power.', recommended: true }
];

const sampleTenants: Tenant[] = [
    { 
        id: 'tenant-1', businessName: 'The Coffee Corner', ownerName: 'Tenant Admin', email: 'tenantadmin@example.com', username: 'tenantadmin',
        status: 'ACTIVE', planId: 'plan-pro', joinDate: new Date('2023-05-20'), isVerified: true, billingCycle: 'monthly'
    }
];

const sampleBranches: Branch[] = [
    { id: 'branch-1', name: 'Main Street Cafe', location: { lat: 34.0522, lng: -118.2437 } }
];

const sampleStaffRoles: StaffRole[] = [
    { id: 'srole-admin', name: 'Tenant Admin', permissions: allTenantPermissions },
    { id: 'srole-cashier', name: 'Cashier', permissions: ['accessPOS', 'makeDeposits', 'accessReturns'] }
];

const sampleStaff: Staff[] = [
    { id: 'staff-1', name: 'Tenant Admin', email: 'tenantadmin@example.com', username: 'tenantadmin', roleId: 'srole-admin', branchId: 'branch-1' },
    { id: 'staff-2', name: 'Cashier User', email: 'cashier@example.com', username: 'cashier', roleId: 'srole-cashier', branchId: 'branch-1' },
];

const sampleCategories: Category[] = [
    { id: 'cat-1', name: 'Beverages' },
    { id: 'cat-2', name: 'Pastries' }
];

const sampleProducts: Product[] = [
    {
        id: 'prod-1', name: 'Espresso', categoryId: 'cat-1',
        variants: [
            { id: 'var-1', name: 'Single', sku: 'ESP-S', sellingPrice: 2.5, costPrice: 0.5, stockByBranch: { 'branch-1': 100 } },
            { id: 'var-2', name: 'Double', sku: 'ESP-D', sellingPrice: 3.5, costPrice: 1.0, stockByBranch: { 'branch-1': 100 } }
        ],
        isFavorite: true
    },
    {
        id: 'prod-2', name: 'Croissant', categoryId: 'cat-2',
        variants: [
            { id: 'var-3', name: 'Plain', sku: 'CRO-P', sellingPrice: 3.0, costPrice: 1.2, stockByBranch: { 'branch-1': 50 } },
            { id: 'var-4', name: 'Chocolate', sku: 'CRO-C', sellingPrice: 3.75, costPrice: 1.5, stockByBranch: { 'branch-1': 40 } }
        ]
    }
];

const sampleCustomers: Customer[] = [
    { id: 'cust-walkin', name: 'Walk-in Customer', creditBalance: 0 },
    { id: 'cust-1', name: 'John Doe', phone: '555-1234', creditBalance: 25.50, creditLimit: 200 }
];
// --- END SAMPLE DATA ---


export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // FIX: Changed session state to use LocalSession for demo purposes without Supabase.
    const [session, setSession] = useState<LocalSession | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Data states, now fetched from Supabase
    const [products, setProducts] = useState<Product[]>(sampleProducts);
    const [sales, setSales] = useState<Sale[]>([]);
    const [branches, setBranches] = useState<Branch[]>(sampleBranches);
    const [staff, setStaff] = useState<Staff[]>(sampleStaff);
    const [staffRoles, setStaffRoles] = useState<StaffRole[]>(sampleStaffRoles);
    const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>(sampleTenants);
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(sampleSubscriptionPlans);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>(sampleAdminUsers);
    const [adminRoles, setAdminRoles] = useState<AdminRole[]>(sampleAdminRoles);
    const [brandConfig, setBrandConfig] = useState<BrandConfig>({ name: "FlowPay", logoUrl: "", faviconUrl: "/vite.svg" });
    const [pageContent, setPageContent] = useState<PageContent>({ about: '', contact: '', terms: '', privacy: '', refund: '', faqs: [], helpCenter: '', apiDocs: '', blog: '' });
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
        stripe: { enabled: false, publicKey: '', secretKey: '' },
        flutterwave: { enabled: false, publicKey: '', secretKey: '' },
        paystack: { enabled: false, publicKey: '', secretKey: '' },
        manual: { enabled: false, details: '' }
    });
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        email: {
            provider: 'resend',
            resend: { apiKey: '' },
            smtp: { host: 0, port: 0, user: '', pass: '' }
        },
        sms: {
            twilio: { enabled: false, accountSid: '', apiKey: '', fromNumber: '' }
        },
        push: {
            firebase: { enabled: false, serverKey: '', vapidKey: '' },
            oneSignal: { enabled: false, appId: '', apiKey: '' }
        }
    });
    const [systemSettings, setSystemSettings] = useState<SystemSettings>({
        currencies: allCurrencies.map(c => ({...c, enabled: true})),
        defaultCurrency: 'USD',
        languages: allLanguages.map(l => ({...l, enabled: true})),
        defaultLanguage: 'en',
        defaultTimezone: 'UTC',
        maintenanceSettings: { isActive: false, message: 'We are currently down for maintenance. Please check back soon.' },
        accessControlSettings: {
            mode: 'ALLOW_ALL',
            ipWhitelist: [],
            ipBlacklist: [],
            countryWhitelist: [],
            countryBlacklist: [],
            regionWhitelist: [],
            regionBlacklist: [],
            browserWhitelist: [],
            browserBlacklist: [],
            deviceWhitelist: [],
            deviceBlacklist: [],
        },
        landingPageMetrics: {
            businesses: { value: 0, label: 'Businesses Trust Us' },
            users: { value: 0, label: 'Active Users Daily' },
            revenue: { value: 0, label: 'Million in Revenue Processed' },
        },
        featuredUpdate: {
            isActive: false,
            title: '',
            content: '',
        },
        mapProviders: [{id: 'google', name: 'Google Maps', apiKey: ''}],
        activeMapProviderId: 'google',
        ipGeolocationProviders: [{ id: 'ipinfo', name: 'IPinfo.io', apiKey: '', apiEndpoint: 'https://ipinfo.io/' }],
        activeIpGeolocationProviderId: 'ipinfo',
        aiSettings: {
            provider: 'gemini',
            gemini: { apiKey: '' },
            openai: { apiKey: '' }
        },
        supabaseSettings: {
            projectUrl: '',
            anonKey: ''
        }
    });
    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [trackerProviders, setTrackerProviders] = useState<TrackerProvider[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
    const [consignments, setConsignments] = useState<Consignment[]>([]);
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [categories, setCategories] = useState<Category[]>(sampleCategories);
    const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
    const [smsTemplates, setSmsTemplates] = useState<SmsTemplate[]>([]);
    const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [notification, setNotification] = useState<NotificationType | null>(null);

    // App state
    const [searchTerm, setSearchTerm] = useState('');
    const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
    const [currentLanguage, setCurrentLanguage] = useState<string>('en');
    const [currentCurrency, setCurrentCurrency] = useState<string>('USD');
    const [impersonatedUser, setImpersonatedUser] = useState<Tenant | null>(null);

    // FIX: Replaced Supabase auth with localStorage-based session management for demo purposes.
    // Auth & Profile loading from localStorage
    useEffect(() => {
        const storedSession = localStorage.getItem('session');
        if (storedSession) {
            try {
                const parsedSession: LocalSession = JSON.parse(storedSession);
                setSession(parsedSession);
                setProfile(parsedSession.profile);
                if (parsedSession.profile.tenant_id) {
                    const tenant = sampleTenants.find(t => t.id === parsedSession.profile.tenant_id);
                    setCurrentTenant(tenant || null);
                }
            } catch (e) {
                localStorage.removeItem('session');
            }
        }
        setIsLoading(false);
    }, []);

    // FIX: Removed Supabase data fetching useEffect. The app now relies on sample data.

    // UI Effects
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    // FIX: Implemented login logic for demo users.
    const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
        if (password !== '12345') {
            return { success: false, message: 'Invalid username or password.' };
        }

        let user: AdminUser | Staff | null = null;
        let profile: Profile | null = null;

        if (username.toLowerCase() === 'superadmin' || username.toLowerCase() === 'super') {
            user = adminUsers.find(u => u.username?.toLowerCase() === 'superadmin') || null;
            if (user) {
                profile = { id: user.id, is_super_admin: true, tenant_id: null };
            }
        } else if (username.toLowerCase() === 'tenantadmin' || username.toLowerCase() === 'tenant') {
            user = staff.find(s => s.username.toLowerCase() === 'tenantadmin') || null;
            if (user) {
                profile = { id: user.id, is_super_admin: false, tenant_id: 'tenant-1' };
            }
        } else {
             user = staff.find(s => s.username.toLowerCase() === username.toLowerCase()) || null;
             if(user) {
                 profile = { id: user.id, is_super_admin: false, tenant_id: 'tenant-1' };
             }
        }

        if (user && profile) {
            const localSession: LocalSession = { user: { id: user.id, email: user.email }, profile };
            localStorage.setItem('session', JSON.stringify(localSession));
            setSession(localSession);
            setProfile(profile);
            if (profile.tenant_id) {
                setCurrentTenant(tenants.find(t => t.id === profile.tenant_id) || null);
            }
            return { success: true, message: 'Logged in successfully.' };
        }

        return { success: false, message: 'Invalid username or password.' };
    }, [adminUsers, staff, tenants]);
    
    // FIX: Updated logout to clear localStorage session.
    const logout = useCallback(async () => {
        localStorage.removeItem('session');
        setSession(null);
        setProfile(null);
        setImpersonatedUser(null);
    }, []);
    
    const stopImpersonating = () => {
        setImpersonatedUser(null);
    };

    // Data manipulation functions (examples)
    const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'date' | 'status' | 'amountDue'>): Promise<{success: boolean, message: string, newSale?: Sale}> => {
      // This is a simplified local state update. A real app would use a database.
      const newSale: Sale = {
        ...saleData,
        id: `sale-${Date.now()}`,
        date: new Date(),
        status: saleData.total - saleData.payments.reduce((sum, p) => sum + p.amount, 0) <= 0 ? 'PAID' : 'UNPAID',
        amountDue: Math.max(0, saleData.total - saleData.payments.reduce((sum, p) => sum + p.amount, 0)),
      };
      setSales(prev => [newSale, ...prev]);
      setNotification({ type: 'success', message: 'Sale recorded!' });
      return { success: true, message: 'Sale completed successfully.', newSale };
    }, []);
    
    // FIX: Implemented addTenant to work with local state for the demo signup flow.
    const addTenant = useCallback(async (
        tenantData: Omit<Tenant, 'id' | 'joinDate' | 'status' | 'trialEndDate' | 'isVerified' | 'billingCycle' | 'lastLoginIp' | 'lastLoginDate'>,
        logoBase64: string
    ): Promise<{ success: boolean; message: string }> => {
        const existingTenant = tenants.find(t => t.email.toLowerCase() === tenantData.email.toLowerCase() || t.username.toLowerCase() === tenantData.username.toLowerCase());
        if (existingTenant) {
            return { success: false, message: 'A tenant with this email or username already exists.' };
        }
        const newId = `tenant-${Date.now()}`;
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);
        
        const newTenant: Tenant = {
            ...tenantData,
            id: newId,
            joinDate: new Date(),
            status: 'UNVERIFIED',
            trialEndDate,
            isVerified: false,
            billingCycle: 'monthly',
            companyLogoUrl: logoBase64,
        };
        setTenants(prev => [...prev, newTenant]);
        
        // Also create a staff user for the tenant owner
        const newStaff: Staff = {
            id: `staff-${Date.now()}`,
            name: tenantData.ownerName,
            email: tenantData.email,
            username: tenantData.username,
            password: tenantData.password,
            roleId: 'srole-admin', // Assuming 'srole-admin' is the Tenant Admin role
            branchId: 'branch-1', // Assuming a default branch
        };
        setStaff(prev => [...prev, newStaff]);

        return { success: true, message: 'Tenant created successfully.' };
    }, [tenants]);

    // Dummy implementations for functions not fully implemented after refactor
    const dummyFunction = async (...args: any[]): Promise<any> => {
        console.warn('Function not fully implemented after Supabase migration.');
        setNotification({ type: 'info', message: 'This feature is in development.' });
        return { success: false, message: 'Not implemented.' };
    };


    const value = {
        // Auth & Profile
        session,
        profile,
        isLoading,
        currentAdminUser: profile?.is_super_admin ? (adminUsers.find(u => u.id === profile.id) || null) : null,
        currentTenant,
        login,
        logout,
        impersonatedUser,
        handleImpersonate: setImpersonatedUser,
        stopImpersonating,
        
        // Data
        products, sales, branches, staff, staffRoles, stockLogs, tenants, subscriptionPlans,
        adminUsers, adminRoles, brandConfig, pageContent, blogPosts, paymentSettings,
        notificationSettings, systemSettings, trucks, shipments, trackerProviders, suppliers,
        purchaseOrders, accounts, journalEntries, announcements, customers, consignments,
        deposits, categories, paymentTransactions, emailTemplates, smsTemplates,
        inAppNotifications, auditLogs, supportTickets,
        
        // UI & State
        notification, setNotification,
        searchTerm, setSearchTerm,
        theme, setTheme,
        currentLanguage, setCurrentLanguage,
        currentCurrency, setCurrentCurrency,
        
        // Functions (provide a mix of real and dummy functions)
        addSale,
        addTenant,
        // ... many other functions from types.ts need to be re-implemented here
        // For this exercise, we will add dummy implementations for the rest
        logAction: (...args: any[]) => console.log('logAction called', args),
        getMetric: (metric: any) => 0,
        adjustStock: dummyFunction,
        transferStock: dummyFunction,
        addProduct: dummyFunction,
        updateProductVariant: dummyFunction,
        addAdminUser: dummyFunction,
        updateAdminUser: dummyFunction,
        updateAdminRole: dummyFunction,
        addAdminRole: dummyFunction,
        deleteAdminRole: dummyFunction,
        updateBrandConfig: dummyFunction,
        updatePageContent: dummyFunction,
        updateFaqs: dummyFunction,
        updatePaymentSettings: dummyFunction,
        updateNotificationSettings: dummyFunction,
        updateSystemSettings: dummyFunction,
        updateMaintenanceSettings: dummyFunction,
        updateAccessControlSettings: dummyFunction,
        updateLandingPageMetrics: dummyFunction,
        updateCurrentTenantSettings: dummyFunction,
        updateTenantLogisticsConfig: dummyFunction,
        updateTenantAutomations: dummyFunction,
        addSubscriptionPlan: dummyFunction,
        updateSubscriptionPlan: dummyFunction,
        deleteSubscriptionPlan: dummyFunction,
        addTruck: dummyFunction,
        updateTruck: dummyFunction,
        deleteTruck: dummyFunction,
        updateTruckVitals: dummyFunction,
        addShipment: dummyFunction,
        updateShipmentStatus: dummyFunction,
        updateTrackerProviders: dummyFunction,
        addBranch: dummyFunction,
        updateBranchLocation: dummyFunction,
        addStaff: dummyFunction,
        deleteStaff: dummyFunction,
        sellShipment: dummyFunction,
        receiveShipment: dummyFunction,
        addPurchaseOrder: dummyFunction,
        updatePurchaseOrderStatus: dummyFunction,
        addStaffRole: dummyFunction,
        updateStaffRole: dummyFunction,
        deleteStaffRole: dummyFunction,
        addAccount: dummyFunction,
        addJournalEntry: dummyFunction,
        updateTenant: dummyFunction,
        verifyTenant: dummyFunction,
        updateTenantProfile: dummyFunction,
        updateAdminProfile: dummyFunction,
        addAnnouncement: dummyFunction,
        markAnnouncementAsRead: dummyFunction,
        addCustomer: dummyFunction,
        deleteCustomer: dummyFunction,
        recordCreditPayment: dummyFunction,
        addDeposit: dummyFunction,
        updateDeposit: dummyFunction,
        addConsignment: dummyFunction,
        addCategory: dummyFunction,
        updateCategory: dummyFunction,
        deleteCategory: dummyFunction,
        extendTrial: dummyFunction,
        activateSubscription: dummyFunction,
        changeSubscriptionPlan: dummyFunction,
        processExpiredTrials: () => ({ processed: 0, suspended: 0 }),
        sendExpiryReminders: () => ({ sent: 0 }),
        processSubscriptionPayment: dummyFunction,
        updatePaymentTransactionStatus: dummyFunction,
        updateEmailTemplate: dummyFunction,
        updateSmsTemplate: dummyFunction,
        markInAppNotificationAsRead: dummyFunction,
        submitSupportTicket: dummyFunction,
        replyToSupportTicket: dummyFunction,
        updateTicketStatus: dummyFunction,
        addBlogPost: dummyFunction,
        updateBlogPost: dummyFunction,
        deleteBlogPost: dummyFunction,
        updateLastLogin: dummyFunction,
        generateInsights: async () => 'AI insights not available with Supabase integration yet.',
        allPermissions: [] as Permission[],
        allTenantPermissions: [] as TenantPermission[],
        currentStaffUser: null,
    };

    return (
        <AppContext.Provider value={value as any}>
            {children}
        </AppContext.Provider>
    );
};
