import React, { createContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
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
    Profile,
    // FIX: Import `allPermissions` to be used for sample data.
    allPermissions,
    // FIX: Import missing types.
    ProductVariant,
    TenantAutomations,
    TenantStatus
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
    { id: 'role-super', name: 'Admin', permissions: allPermissions },
    { id: 'role-support', name: 'Support', permissions: ['viewPlatformDashboard', 'manageTenants', 'manageSupport'] }
];

const sampleAdminUsers: AdminUser[] = [
    { id: 'user-super', name: 'Platform Owner', email: 'super@flowpay.com', username: 'super', password: '12345', roleId: 'role-super', status: 'ACTIVE', joinDate: new Date('2023-01-15') }
];

const sampleSubscriptionPlans: SubscriptionPlan[] = [
    { id: 'plan-basic', name: 'Basic', price: 29, priceYearly: 290, features: ['1 Branch', '2 Staff', 'POS & Inventory', 'Basic Reporting'], description: 'For small businesses just getting started.', recommended: false },
    { id: 'plan-pro', name: 'Pro', price: 79, priceYearly: 790, features: ['5 Branches', '10 Staff', 'All Features', 'Advanced Reporting', 'API Access'], description: 'For growing businesses that need more power.', recommended: true }
];

const sampleTenants: Tenant[] = [
    { 
        id: 'tenant-1', businessName: 'The Coffee Corner', ownerName: 'Tenant Admin', email: 'tenant@example.com', username: 'tenant', password: '12345',
        status: 'ACTIVE', planId: 'plan-pro', joinDate: new Date('2023-05-20'), isVerified: true, billingCycle: 'monthly',
        currency: 'NGN', language: 'en', timezone: 'Africa/Lagos'
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
    { id: 'staff-1', name: 'Tenant Admin', email: 'tenant@example.com', username: 'tenant', password: '12345', roleId: 'srole-admin', branchId: 'branch-1' },
    { id: 'staff-2', name: 'Cashier User', email: 'cashier@example.com', username: 'cashier', password: '12345', roleId: 'srole-cashier', branchId: 'branch-1' },
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

// Combine all data into a single structure for easier state management and persistence
interface LocalStorageData {
    products: Product[]; sales: Sale[]; branches: Branch[]; staff: Staff[]; staffRoles: StaffRole[]; stockLogs: StockLog[];
    tenants: Tenant[]; subscriptionPlans: SubscriptionPlan[]; adminUsers: AdminUser[]; adminRoles: AdminRole[]; brandConfig: BrandConfig;
    pageContent: PageContent; blogPosts: BlogPost[]; paymentSettings: PaymentSettings; notificationSettings: NotificationSettings;
    systemSettings: SystemSettings; trucks: Truck[]; shipments: Shipment[]; trackerProviders: TrackerProvider[]; suppliers: Supplier[];
    purchaseOrders: PurchaseOrder[]; accounts: Account[]; journalEntries: JournalEntry[]; announcements: Announcement[]; customers: Customer[];
    consignments: Consignment[]; deposits: Deposit[]; categories: Category[]; paymentTransactions: PaymentTransaction[]; emailTemplates: EmailTemplate[];
    smsTemplates: SmsTemplate[]; inAppNotifications: InAppNotification[]; auditLogs: AuditLog[]; supportTickets: SupportTicket[];
}

const LOCAL_STORAGE_KEY = 'flowpay_demo_data';

const getInitialData = (): LocalStorageData => {
    const defaultData: LocalStorageData = {
        products: sampleProducts, sales: [], branches: sampleBranches, staff: sampleStaff, staffRoles: sampleStaffRoles, stockLogs: [],
        tenants: sampleTenants, subscriptionPlans: sampleSubscriptionPlans, adminUsers: sampleAdminUsers, adminRoles: sampleAdminRoles,
        brandConfig: { name: "FlowPay", logoUrl: "", faviconUrl: "/vite.svg" },
        pageContent: { about: 'About us content here.', contact: 'Contact us content here.', terms: 'Terms of service here.', privacy: 'Privacy policy here.', refund: 'Refund policy here.', faqs: [{id: 'faq-1', question: 'What is FlowPay?', answer: 'An awesome POS.'}], helpCenter: 'Help center content.', apiDocs: 'API docs content.', blog: 'Blog intro here.' },
        blogPosts: [], paymentSettings: { stripe: { enabled: true, publicKey: '', secretKey: '' }, flutterwave: { enabled: false, publicKey: '', secretKey: '' }, paystack: { enabled: false, publicKey: '', secretKey: '' }, manual: { enabled: true, details: 'Bank: Demo Bank\nAccount: 123456789\nName: FlowPay Inc.' } },
        notificationSettings: { email: { provider: 'resend', resend: { apiKey: '' }, smtp: { host: 0, port: 0, user: '', pass: '' } }, sms: { twilio: { enabled: false, accountSid: '', apiKey: '', fromNumber: '' } }, push: { firebase: { enabled: false, serverKey: '', vapidKey: '' }, oneSignal: { enabled: false, appId: '', apiKey: '' } } },
        systemSettings: { currencies: allCurrencies.map(c => ({...c, enabled: true})), defaultCurrency: 'USD', languages: allLanguages.map(l => ({...l, enabled: true})), defaultLanguage: 'en', defaultTimezone: 'UTC', maintenanceSettings: { isActive: false, message: 'We are currently down for maintenance. Please check back soon.' }, accessControlSettings: { mode: 'ALLOW_ALL', ipWhitelist: [], ipBlacklist: [], countryWhitelist: [], countryBlacklist: [], regionWhitelist: [], regionBlacklist: [], browserWhitelist: [], browserBlacklist: [], deviceWhitelist: [], deviceBlacklist: [] }, landingPageMetrics: { businesses: { value: 100, label: 'Businesses Trust Us' }, users: { value: 500, label: 'Active Users Daily' }, revenue: { value: 1, label: 'Million in Revenue Processed' } }, featuredUpdate: { isActive: false, title: '', content: '' }, mapProviders: [{id: 'google', name: 'Google Maps', apiKey: ''}], activeMapProviderId: 'google', ipGeolocationProviders: [{ id: 'ipinfo', name: 'IPinfo.io', apiKey: '', apiEndpoint: 'https://ipinfo.io/' }], activeIpGeolocationProviderId: 'ipinfo', aiSettings: { provider: 'gemini', gemini: { apiKey: '' }, openai: { apiKey: '' } }, supabaseSettings: { projectUrl: '', anonKey: '' } },
        trucks: [], shipments: [], 
        trackerProviders: [
            { id: 'teltonika', name: 'Teltonika', apiKey: '', apiEndpoint: '' },
            { id: 'ruptela', name: 'Ruptela', apiKey: '', apiEndpoint: '' },
            { id: 'queclink', name: 'Queclink', apiKey: '', apiEndpoint: '' },
            { id: 'calamp', name: 'CalAmp', apiKey: '', apiEndpoint: '' },
            { id: 'meitrack', name: 'Meitrack', apiKey: '', apiEndpoint: '' },
            { id: 'concox', name: 'Concox (Jimi IoT)', apiKey: '', apiEndpoint: '' },
            { id: 'suntech', name: 'Suntech', apiKey: '', apiEndpoint: '' },
            { id: 'gosafe', name: 'Gosafe', apiKey: '', apiEndpoint: '' },
            { id: 'atrack', name: 'ATrack', apiKey: '', apiEndpoint: '' },
            { id: 'systech', name: 'Systech', apiKey: '', apiEndpoint: '' },
            { id: 'topflytech', name: 'Topflytech', apiKey: '', apiEndpoint: '' },
        ],
        suppliers: [], purchaseOrders: [], accounts: [], journalEntries: [], announcements: [],
        customers: sampleCustomers, consignments: [], deposits: [], categories: sampleCategories, paymentTransactions: [], emailTemplates: [],
        smsTemplates: [], inAppNotifications: [], auditLogs: [], supportTickets: [],
    };

    try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
            const parsed = JSON.parse(storedData);
            // Quick check to see if structure is valid
            if (parsed.products && parsed.tenants) {
                // Re-hydrate dates
                parsed.tenants.forEach((t: Tenant) => { t.joinDate = new Date(t.joinDate); if (t.trialEndDate) t.trialEndDate = new Date(t.trialEndDate); });
                parsed.adminUsers.forEach((u: AdminUser) => u.joinDate = new Date(u.joinDate));
                return parsed;
            }
        }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
    }
    
    // If no stored data or it's invalid, save the default
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
};


export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<LocalSession | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [data, setData] = useState<LocalStorageData>(getInitialData);

    const [notification, setNotification] = useState<NotificationType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
    const [currentLanguage, setCurrentLanguage] = useState<string>(data.systemSettings.defaultLanguage);
    const [currentCurrency, setCurrentCurrency] = useState<string>(data.systemSettings.defaultCurrency);
    const [impersonatedUser, setImpersonatedUser] = useState<Tenant | null>(null);

    // Persist state changes to localStorage
    const saveData = (updatedData: LocalStorageData) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
        setData(updatedData);
    };

    // Auth & Profile loading from localStorage
    useEffect(() => {
        const storedSession = localStorage.getItem('session');
        if (storedSession) {
            try {
                const parsedSession: LocalSession = JSON.parse(storedSession);
                setSession(parsedSession);
                setProfile(parsedSession.profile);
            } catch (e) {
                localStorage.removeItem('session');
            }
        }
        setIsLoading(false);
    }, []);

    // UI Effects
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    // Memoized derived state
    const currentTenant = useMemo(() => {
        if (impersonatedUser) return impersonatedUser;
        if (session && profile && !profile.is_super_admin && profile.tenant_id) {
            return data.tenants.find(t => t.id === profile.tenant_id) || null;
        }
        return null;
    }, [session, profile, data.tenants, impersonatedUser]);

    const currentAdminUser = useMemo(() => {
        if (session && profile?.is_super_admin) {
            return data.adminUsers.find(u => u.id === profile.id) || null;
        }
        return null;
    }, [session, profile, data.adminUsers]);

    const currentStaffUser = useMemo(() => {
        if (session && profile && !profile.is_super_admin && profile.tenant_id) {
            return data.staff.find(s => s.id === profile.id) || null;
        }
        return null;
    }, [session, profile, data.staff]);
    
    // --- START FUNCTION IMPLEMENTATIONS ---

    const logAction = useCallback((action: string, details: string, user?: { id: string; name: string; type: 'STAFF' | 'TENANT' | 'SUPER_ADMIN' }) => {
        const currentUser = user || currentStaffUser || currentAdminUser;
        const userType = currentAdminUser ? 'SUPER_ADMIN' : 'STAFF';
        
        if (!currentUser) return;
        
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            userId: currentUser.id,
            userName: currentUser.name,
            userType: userType,
            tenantId: currentTenant?.id,
            action,
            details,
        };
        setData(prev => {
            const newData = { ...prev, auditLogs: [newLog, ...prev.auditLogs] };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
            return newData;
        });
    }, [currentAdminUser, currentStaffUser, currentTenant]);
    
    const updateLastLogin = useCallback((email: string, ip: string) => {
        setData(prev => {
            let userUpdated = false;
            const newAdmins = prev.adminUsers.map(u => {
                if(u.email === email) {
                    userUpdated = true;
                    return {...u, lastLoginDate: new Date(), lastLoginIp: ip };
                }
                return u;
            });
            const newTenants = prev.tenants.map(t => {
                 if(t.email === email) {
                    userUpdated = true;
                    return {...t, lastLoginDate: new Date(), lastLoginIp: ip };
                }
                return t;
            });
            if (userUpdated) {
                const newData = { ...prev, adminUsers: newAdmins, tenants: newTenants };
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
                return newData;
            }
            return prev;
        });
    }, []);

    const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
        const lowerUsername = username.toLowerCase();
        
        const adminUser = data.adminUsers.find(u => u.username?.toLowerCase() === lowerUsername);
        if (adminUser) {
            if (adminUser.password === password) {
                const profile: Profile = { id: adminUser.id, is_super_admin: true, tenant_id: null };
                const localSession: LocalSession = { user: { id: adminUser.id, email: adminUser.email }, profile };
                localStorage.setItem('session', JSON.stringify(localSession));
                setSession(localSession);
                setProfile(profile);
                updateLastLogin(adminUser.email, '127.0.0.1');
                return { success: true, message: 'Logged in successfully.' };
            }
        }
    
        const staffUser = data.staff.find(s => s.username.toLowerCase() === lowerUsername);
        if (staffUser) {
            if (staffUser.password === password) {
                const tenantId = 'tenant-1'; // Hardcoded for demo
                const tenant = data.tenants.find(t => t.id === tenantId);
                if (tenant && tenant.status !== 'ACTIVE' && tenant.status !== 'TRIAL') {
                    return { success: false, message: `Account is ${tenant.status}. Please contact support.` };
                }
                const profile: Profile = { id: staffUser.id, is_super_admin: false, tenant_id: tenantId };
                const localSession: LocalSession = { user: { id: staffUser.id, email: staffUser.email }, profile };
                localStorage.setItem('session', JSON.stringify(localSession));
                setSession(localSession);
                setProfile(profile);
                if (tenant) updateLastLogin(tenant.email, '127.0.0.1');
                return { success: true, message: 'Logged in successfully.' };
            }
        }
    
        return { success: false, message: 'Invalid username or password.' };
    }, [data, updateLastLogin]);
    
    const logout = useCallback(async () => {
        localStorage.removeItem('session');
        setSession(null);
        setProfile(null);
        setImpersonatedUser(null);
    }, []);
    
    const stopImpersonating = () => setImpersonatedUser(null);
    const handleImpersonate = (tenant: Tenant) => {
        const adminStaff = data.staff.find(s => s.email === tenant.email);
        if(adminStaff) {
            const profile: Profile = { id: adminStaff.id, is_super_admin: false, tenant_id: tenant.id };
            const localSession: LocalSession = { user: {id: adminStaff.id, email: adminStaff.email}, profile};
            setImpersonatedUser(tenant);
            setSession(localSession);
            setProfile(profile);
        } else {
            setNotification({type: 'error', message: "Cannot impersonate: Tenant admin staff account not found."});
        }
    };
    
    const simpleUpdate = <T,>(key: keyof LocalStorageData, value: T) => {
        setData(prev => {
            const newData = { ...prev, [key]: value };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
            return newData;
        });
    }
    
    const addToArray = <T,>(key: keyof LocalStorageData, item: T) => {
        setData(prev => {
            // FIX: Cast `prev[key]` to `unknown` before casting to `T[]` to satisfy TypeScript's strictness.
            const currentArray = prev[key] as unknown as T[];
            const newData = { ...prev, [key]: [...currentArray, item] };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
            return newData;
        });
    }

    const updateArray = <T extends {id: string}>(key: keyof LocalStorageData, itemId: string, updates: Partial<T>) => {
        setData(prev => {
            // FIX: Cast `prev[key]` to `unknown` before casting to `T[]` to satisfy TypeScript's strictness.
            const currentArray = prev[key] as unknown as T[];
            const newArray = currentArray.map(item => item.id === itemId ? { ...item, ...updates } : item);
            const newData = { ...prev, [key]: newArray };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
            return newData;
        });
    }
    
    const deleteFromArray = (key: keyof LocalStorageData, itemId: string) => {
        setData(prev => {
            const currentArray = prev[key] as {id: string}[];
            const newArray = currentArray.filter(item => item.id !== itemId);
            const newData = { ...prev, [key]: newArray };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
            return newData;
        });
    }
    
    // --- All functions implemented using the patterns above ---
    // FIX: Define formatCurrency utility to resolve 'Cannot find name' error.
    const formatCurrency = useCallback((value: number): string => {
        const currencyInfo = data.systemSettings.currencies.find(c => c.code === currentCurrency);
        const symbol = currencyInfo ? currencyInfo.symbol : '$';
        return `${symbol}${value.toFixed(2)}`;
    }, [currentCurrency, data.systemSettings.currencies]);

    const getMetric = (metric: 'totalRevenue' | 'salesVolume' | 'newCustomers' | 'activeBranches') => {
        switch(metric) {
            case 'totalRevenue': return data.sales.reduce((sum, s) => sum + s.total, 0);
            case 'salesVolume': return data.sales.length;
            case 'newCustomers': return data.customers.filter(c => c.id !== 'cust-walkin').length; // Simplified for demo
            case 'activeBranches': return data.branches.length;
            default: return 0;
        }
    };
    const addSale = async (saleData: Omit<Sale, 'id' | 'date' | 'status' | 'amountDue'>): Promise<{success: boolean, message: string, newSale?: Sale}> => {
        const newSale: Sale = {
            ...saleData, id: `sale-${Date.now()}`, date: new Date(),
            status: saleData.total - saleData.payments.reduce((sum, p) => sum + p.amount, 0) <= 0.01 ? 'PAID' : 'UNPAID',
            amountDue: Math.max(0, saleData.total - saleData.payments.reduce((sum, p) => sum + p.amount, 0)),
        };

        setData(prev => {
            // Stock update logic
            const newProducts = [...prev.products];
            newSale.items.forEach(item => {
                const product = newProducts.find(p => p.id === item.productId);
                if(product) {
                    const variant = product.variants.find(v => v.id === item.variantId);
                    if(variant) {
                        variant.stockByBranch[newSale.branchId] = (variant.stockByBranch[newSale.branchId] || 0) - item.quantity;
                    }
                }
            });

            const newData = { ...prev, sales: [newSale, ...prev.sales], products: newProducts };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
            return newData;
        });
        
        logAction('SALE_RECORDED', `New sale ${newSale.id} for ${formatCurrency(newSale.total)}`);
        setNotification({ type: 'success', message: 'Sale recorded!' });
        return { success: true, message: 'Sale completed successfully.', newSale };
    };
    const adjustStock = (productId: string, variantId: string, branchId: string, newStock: number, reason: string) => {
        setData(prev => {
            let oldStock = 0;
            let productName = '', variantName = '';
            const newProducts = prev.products.map(p => {
                if(p.id === productId) {
                    productName = p.name;
                    return {...p, variants: p.variants.map(v => {
                        if (v.id === variantId) {
                            variantName = v.name;
                            oldStock = v.stockByBranch[branchId] || 0;
                            return {...v, stockByBranch: {...v.stockByBranch, [branchId]: newStock}};
                        }
                        return v;
                    })};
                }
                return p;
            });
            const newLog: StockLog = { id: `log-${Date.now()}`, date: new Date(), productId, variantId, productName, variantName, action: 'ADJUSTMENT', quantity: newStock - oldStock, branchId, reason };
            const newData = { ...prev, products: newProducts, stockLogs: [newLog, ...prev.stockLogs] };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
            return newData;
        });
        logAction('STOCK_ADJUSTMENT', `Adjusted stock for ${variantId} in branch ${branchId}.`);
    };
    const transferStock = (productId: string, variantId: string, fromBranchId: string, toBranchId: string, quantity: number) => {
        setData(prev => {
             let productName = '', variantName = '';
            const newProducts = prev.products.map(p => {
                if(p.id === productId) {
                    productName = p.name;
                    return {...p, variants: p.variants.map(v => {
                        if (v.id === variantId) {
                            variantName = v.name;
                            const fromStock = (v.stockByBranch[fromBranchId] || 0) - quantity;
                            const toStock = (v.stockByBranch[toBranchId] || 0) + quantity;
                            return {...v, stockByBranch: {...v.stockByBranch, [fromBranchId]: fromStock, [toBranchId]: toStock}};
                        }
                        return v;
                    })};
                }
                return p;
            });
            const newLog: StockLog = { id: `log-${Date.now()}`, date: new Date(), productId, variantId, productName, variantName, action: 'TRANSFER', quantity, fromBranchId, toBranchId };
            const newData = { ...prev, products: newProducts, stockLogs: [newLog, ...prev.stockLogs] };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
            return newData;
        });
         logAction('STOCK_TRANSFER', `Transferred ${quantity} of ${variantId} from ${fromBranchId} to ${toBranchId}.`);
    };
    // FIX: Match signature in `AppContextType`.
    const addProduct = (productData: Omit<Product, 'id' | 'isFavorite' | 'variants'> & { variants: Omit<ProductVariant, 'id'>[] }) => addToArray('products', { ...productData, id: `prod-${Date.now()}`, isFavorite: false });
    const updateProductVariant = (productId: string, variantId: string, variantData: Partial<Omit<ProductVariant, 'id' | 'stockByBranch'>>) => {
        setData(prev => {
            const newProducts = prev.products.map(p => {
                if(p.id === productId) {
                    return {...p, variants: p.variants.map(v => v.id === variantId ? {...v, ...variantData} : v)};
                }
                return p;
            });
            const newData = { ...prev, products: newProducts };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
            return newData;
        });
    };
    const addAdminUser = (userData: Omit<AdminUser, 'id' | 'joinDate' | 'status' | 'lastLoginIp' | 'lastLoginDate'>) => addToArray('adminUsers', { ...userData, id: `admin-${Date.now()}`, joinDate: new Date(), status: 'ACTIVE' });
    const updateAdminUser = (userId: string, userData: Partial<AdminUser>) => updateArray<AdminUser>('adminUsers', userId, userData);
    const updateAdminRole = (roleId: string, permissions: Permission[]) => updateArray<AdminRole>('adminRoles', roleId, { permissions });
    const addAdminRole = (roleData: Omit<AdminRole, 'id'>) => addToArray('adminRoles', { ...roleData, id: `arole-${Date.now()}` });
    const deleteAdminRole = (roleId: string) => deleteFromArray('adminRoles', roleId);
    const updateBrandConfig = (newConfig: Partial<BrandConfig>) => setData(prev => { const newData = {...prev, brandConfig: {...prev.brandConfig, ...newConfig}}; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData)); return newData; });
    const updatePageContent = (newPageContent: Partial<Omit<PageContent, 'faqs'>>) => setData(prev => { const newData = {...prev, pageContent: {...prev.pageContent, ...newPageContent}}; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData)); return newData; });
    const updateFaqs = (newFaqs: FaqItem[]) => setData(prev => { const newData = {...prev, pageContent: {...prev.pageContent, faqs: newFaqs}}; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData)); return newData; });
    const updatePaymentSettings = (newSettings: PaymentSettings) => simpleUpdate('paymentSettings', newSettings);
    const updateNotificationSettings = (newSettings: NotificationSettings) => simpleUpdate('notificationSettings', newSettings);
    const updateSystemSettings = (newSettings: Partial<SystemSettings>) => setData(prev => { const newData = {...prev, systemSettings: {...prev.systemSettings, ...newSettings}}; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData)); return newData; });
    const updateMaintenanceSettings = (settings: MaintenanceSettings) => updateSystemSettings({ maintenanceSettings: settings });
    const updateAccessControlSettings = (settings: AccessControlSettings) => updateSystemSettings({ accessControlSettings: settings });
    const updateLandingPageMetrics = (metrics: LandingPageMetrics) => updateSystemSettings({ landingPageMetrics: metrics });
    const updateCurrentTenantSettings = (newSettings: Partial<Pick<Tenant, 'currency' | 'language' | 'logoutTimeout' | 'timezone'>>) => { if(currentTenant) { updateArray<Tenant>('tenants', currentTenant.id, newSettings); setNotification({ type: 'success', message: 'Settings updated successfully.' }); }};
    const updateTenantLogisticsConfig = (config: { activeTrackerProviderId: string; }) => { if(currentTenant) updateArray<Tenant>('tenants', currentTenant.id, { logisticsConfig: config }); };
    const updateTenantAutomations = (newAutomations: Partial<TenantAutomations>) => { if(currentTenant) updateArray<Tenant>('tenants', currentTenant.id, { automations: {...currentTenant?.automations, ...newAutomations} }); };
    const addSubscriptionPlan = (planData: Omit<SubscriptionPlan, 'id'>) => addToArray('subscriptionPlans', { ...planData, id: `plan-${Date.now()}` });
    const updateSubscriptionPlan = (planId: string, planData: Partial<SubscriptionPlan>) => updateArray<SubscriptionPlan>('subscriptionPlans', planId, planData);
    const deleteSubscriptionPlan = (planId: string) => deleteFromArray('subscriptionPlans', planId);
    const addTruck = (truckData: Omit<Truck, 'id' | 'lastUpdate'>) => addToArray('trucks', { ...truckData, id: `truck-${Date.now()}`, lastUpdate: new Date() });
    const updateTruck = (truckId: string, truckData: Partial<Truck>) => updateArray<Truck>('trucks', truckId, truckData);
    const deleteTruck = (truckId: string) => deleteFromArray('trucks', truckId);
    const updateTruckVitals = (truckId: string) => updateArray<Truck>('trucks', truckId, { lastUpdate: new Date(), currentLocation: { lat: 34 + Math.random(), lng: -118 + Math.random(), address: 'Simulated Location' } });
    const addShipment = (shipmentData: Omit<Shipment, 'id'>) => addToArray('shipments', { ...shipmentData, id: `ship-${Date.now()}` });
    const updateShipmentStatus = (shipmentId: string, status: Shipment['status']) => updateArray<Shipment>('shipments', shipmentId, { status });
    const updateTrackerProviders = (providers: TrackerProvider[]) => simpleUpdate('trackerProviders', providers);
    const addBranch = (branchName: string) => addToArray('branches', { id: `branch-${Date.now()}`, name: branchName, location: { lat: 0, lng: 0 } });
    const updateBranchLocation = (branchId: string, location: { lat: number; lng: number; }) => updateArray<Branch>('branches', branchId, { location });
    const addStaff = (staffData: Omit<Staff, 'id'>) => addToArray('staff', { ...staffData, id: `staff-${Date.now()}` });
    const deleteStaff = (staffId: string) => deleteFromArray('staff', staffId);
    const sellShipment = async (shipmentId: string, customer: Pick<Customer, 'name' | 'phone'>): Promise<{success: boolean; message: string;}> => { 
        updateShipmentStatus(shipmentId, 'SOLD_IN_TRANSIT');
        return { success: true, message: 'Shipment sold successfully.' };
    };
    const receiveShipment = (shipmentId: string) => updateShipmentStatus(shipmentId, 'DELIVERED');
    const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'total' | 'createdAt'>) => {
        const total = poData.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
        addToArray('purchaseOrders', { ...poData, id: `po-${Date.now()}`, poNumber: `PO-${Date.now()}`, total, createdAt: new Date() });
    };
    const updatePurchaseOrderStatus = (poId: string, status: PurchaseOrder['status']) => updateArray<PurchaseOrder>('purchaseOrders', poId, { status });
    const addStaffRole = (roleData: Omit<StaffRole, 'id'>) => addToArray('staffRoles', { ...roleData, id: `srole-${Date.now()}` });
    const updateStaffRole = (roleId: string, permissions: TenantPermission[]) => updateArray<StaffRole>('staffRoles', roleId, { permissions });
    const deleteStaffRole = (roleId: string) => deleteFromArray('staffRoles', roleId);
    const addAccount = (accountData: Omit<Account, 'id' | 'balance'>) => addToArray('accounts', { ...accountData, id: `acc-${Date.now()}`, balance: 0 });
    const addJournalEntry = (entryData: Omit<JournalEntry, 'id' | 'date'>) => addToArray('journalEntries', { ...entryData, id: `je-${Date.now()}`, date: new Date() });
    const addTenant = async (tenantData: Omit<Tenant, 'id' | 'joinDate' | 'status' | 'trialEndDate' | 'isVerified' | 'billingCycle' | 'lastLoginIp' | 'lastLoginDate'>, logoBase64: string): Promise<{ success: boolean; message: string }> => {
        const existingTenant = data.tenants.find(t => t.email.toLowerCase() === tenantData.email.toLowerCase() || t.username.toLowerCase() === tenantData.username.toLowerCase());
        if (existingTenant) return { success: false, message: 'A tenant with this email or username already exists.' };
        
        const trialEndDate = new Date(); trialEndDate.setDate(trialEndDate.getDate() + 14);
        const newTenant: Tenant = { ...tenantData, id: `tenant-${Date.now()}`, joinDate: new Date(), status: 'UNVERIFIED', trialEndDate, isVerified: false, billingCycle: 'monthly', companyLogoUrl: logoBase64, currency: 'NGN', language: 'en', timezone: 'Africa/Lagos' };
        const newStaff: Staff = { id: `staff-${Date.now()}`, name: tenantData.ownerName, email: tenantData.email, username: tenantData.username, password: tenantData.password, roleId: 'srole-admin', branchId: 'branch-1' };
        setData(prev => { const newData = {...prev, tenants: [...prev.tenants, newTenant], staff: [...prev.staff, newStaff]}; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData)); return newData; });
        return { success: true, message: 'Tenant created successfully.' };
    };
    const updateTenant = (tenantId: string, tenantData: Partial<Tenant>) => updateArray<Tenant>('tenants', tenantId, tenantData);
    const verifyTenant = (email: string) => setData(prev => { const newTenants = prev.tenants.map(t => t.email === email ? {...t, isVerified: true, status: 'TRIAL' as TenantStatus} : t); const newData = {...prev, tenants: newTenants}; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData)); return newData; });
    const updateTenantProfile = (tenantData: Partial<Tenant>) => { if(currentTenant) updateArray<Tenant>('tenants', currentTenant.id, tenantData); };
    const updateAdminProfile = (adminData: Partial<AdminUser>) => { if(currentAdminUser) updateArray<AdminUser>('adminUsers', currentAdminUser.id, adminData); };
    const addAnnouncement = (announcementData: Omit<Announcement, 'id' | 'createdAt' | 'readBy'>) => addToArray('announcements', { ...announcementData, id: `anno-${Date.now()}`, createdAt: new Date(), readBy: [] });
    const markAnnouncementAsRead = (announcementId: string, userId: string) => setData(prev => { const newAnns = prev.announcements.map(a => a.id === announcementId ? {...a, readBy: [...a.readBy, userId]} : a); const newData = {...prev, announcements: newAnns}; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData)); return newData; });
    const addCustomer = (customerData: Omit<Customer, 'id' | 'creditBalance'>) => addToArray('customers', { ...customerData, id: `cust-${Date.now()}`, creditBalance: 0 });
    const deleteCustomer = (customerId: string) => deleteFromArray('customers', customerId);
    const recordCreditPayment = (customerId: string, amount: number) => setData(prev => { const newCusts = prev.customers.map(c => c.id === customerId ? {...c, creditBalance: c.creditBalance - amount} : c); const newData = {...prev, customers: newCusts}; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData)); return newData; });
    const addDeposit = async (depositData: Omit<Deposit, 'id' | 'date' | 'status'>): Promise<{success: boolean, message: string}> => {
        addToArray('deposits', { ...depositData, id: `dep-${Date.now()}`, date: new Date(), status: 'ACTIVE' });
        return { success: true, message: 'Deposit recorded.' };
    };
    const updateDeposit = (depositId: string, updates: Partial<Pick<Deposit, 'status' | 'notes' | 'appliedSaleId'>>) => updateArray<Deposit>('deposits', depositId, updates);
    const addConsignment = (consignmentData: Omit<Consignment, 'id' | 'status'>) => addToArray('consignments', { ...consignmentData, id: `con-${Date.now()}`, status: 'ACTIVE' });
    const addCategory = (categoryName: string) => addToArray('categories', { id: `cat-${Date.now()}`, name: categoryName });
    const updateCategory = (categoryId: string, newName: string) => updateArray<Category>('categories', categoryId, { name: newName });
    const deleteCategory = (categoryId: string) => deleteFromArray('categories', categoryId);
    const extendTrial = (tenantId: string, days: number) => setData(prev => { const newTenants = prev.tenants.map(t => { if(t.id === tenantId && t.trialEndDate) { const newDate = new Date(t.trialEndDate); newDate.setDate(newDate.getDate() + days); return {...t, trialEndDate: newDate}; } return t; }); const newData = {...prev, tenants: newTenants}; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData)); return newData; });
    const activateSubscription = (tenantId: string, planId: string, billingCycle: 'monthly' | 'yearly') => updateArray<Tenant>('tenants', tenantId, { status: 'ACTIVE', planId, billingCycle, trialEndDate: undefined });
    const changeSubscriptionPlan = (tenantId: string, newPlanId: string, billingCycle: 'monthly' | 'yearly') => updateArray<Tenant>('tenants', tenantId, { planId: newPlanId, billingCycle });
    const processExpiredTrials = () => { updateArray<Tenant>('tenants', 'tenant-1', {status: 'SUSPENDED'}); return { processed: 1, suspended: 1 }; }; // Simplified
    const sendExpiryReminders = () => { return { sent: 1 }; }; // Simplified
    const processSubscriptionPayment = async (tenantId: string, planId: string, method: string, amount: number, billingCycle: 'monthly' | 'yearly', success: boolean) => {
        const newTx: PaymentTransaction = { id: `tx-${Date.now()}`, tenantId, planId, amount, method, status: success ? (method === 'Manual' ? 'PENDING' : 'COMPLETED') : 'FAILED', createdAt: new Date() };
        if (success && method !== 'Manual') activateSubscription(tenantId, planId, billingCycle);
        addToArray('paymentTransactions', newTx);
        const message = success ? (method === 'Manual' ? 'Manual payment submitted for review.' : 'Payment successful!') : 'Payment failed.';
        return { success, message };
    };
    const updatePaymentTransactionStatus = (transactionId: string, newStatus: 'COMPLETED' | 'REJECTED') => {
        updateArray<PaymentTransaction>('paymentTransactions', transactionId, { status: newStatus });
        if(newStatus === 'COMPLETED') {
            const tx = data.paymentTransactions.find(t => t.id === transactionId);
            if(tx) activateSubscription(tx.tenantId, tx.planId, 'monthly'); // Assume monthly
        }
    };
    const updateEmailTemplate = (templateId: string, newSubject: string, newBody: string) => updateArray<EmailTemplate>('emailTemplates', templateId, { subject: newSubject, body: newBody });
    const updateSmsTemplate = (templateId: string, newBody: string) => updateArray<SmsTemplate>('smsTemplates', templateId, { body: newBody });
    const markInAppNotificationAsRead = (notificationId: string) => updateArray<InAppNotification>('inAppNotifications', notificationId, { read: true });
    const submitSupportTicket = (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'status'>) => { if(currentTenant) addToArray('supportTickets', { ...ticketData, id: `tic-${Date.now()}`, createdAt: new Date(), updatedAt: new Date(), tenantId: currentTenant.id, status: 'Open' }); };
    const replyToSupportTicket = (ticketId: string, message: Omit<TicketMessage, 'id' | 'timestamp'>) => { setData(prev => { const newTickets = prev.supportTickets.map(t => t.id === ticketId ? {...t, status: 'In Progress' as SupportTicket['status'], updatedAt: new Date(), messages: [...t.messages, {...message, id: `msg-${Date.now()}`, timestamp: new Date()}]} : t); const newData = {...prev, supportTickets: newTickets}; localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData)); return newData; }); };
    const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => updateArray<SupportTicket>('supportTickets', ticketId, { status, updatedAt: new Date() });
    const addBlogPost = (postData: Omit<BlogPost, 'id' | 'createdAt' | 'authorName'>) => addToArray('blogPosts', { ...postData, id: `blog-${Date.now()}`, createdAt: new Date(), authorName: currentAdminUser?.name || 'Admin' });
    const updateBlogPost = (postId: string, postData: Partial<BlogPost>) => updateArray<BlogPost>('blogPosts', postId, postData);
    const deleteBlogPost = (postId: string) => deleteFromArray('blogPosts', postId);
    const generateInsights = async () => 'AI insights are a premium feature, but here is a sample: Your top-selling product is Espresso (Double), generating 35% of your revenue. Consider promoting it further.';

    const value: AppContextType = {
        session, profile, isLoading,
        ...data,
        notification, setNotification, searchTerm, setSearchTerm, theme, setTheme,
        currentLanguage, setCurrentLanguage, currentCurrency, setCurrentCurrency,
        impersonatedUser, stopImpersonating, handleImpersonate, login, logout,
        currentTenant, currentAdminUser, currentStaffUser,
        allPermissions, allTenantPermissions,
        logAction, getMetric, addSale, adjustStock, transferStock, addProduct, updateProductVariant, addAdminUser, updateAdminUser, updateAdminRole,
        addAdminRole, deleteAdminRole, updateBrandConfig, updatePageContent, updateFaqs, updatePaymentSettings, updateNotificationSettings,
        updateSystemSettings, updateMaintenanceSettings, updateAccessControlSettings, updateLandingPageMetrics, updateCurrentTenantSettings,
        updateTenantLogisticsConfig, updateTenantAutomations, addSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, addTruck,
        updateTruck, deleteTruck, updateTruckVitals, addShipment, updateShipmentStatus, updateTrackerProviders, addBranch, updateBranchLocation,
        addStaff, deleteStaff, sellShipment, receiveShipment, addPurchaseOrder, updatePurchaseOrderStatus, addStaffRole, updateStaffRole,
        deleteStaffRole, addAccount, addJournalEntry, addTenant, updateTenant, verifyTenant, updateTenantProfile, updateAdminProfile,
        addAnnouncement, markAnnouncementAsRead, addCustomer, deleteCustomer, recordCreditPayment, addDeposit, updateDeposit,
        addConsignment, addCategory, updateCategory, deleteCategory, extendTrial, activateSubscription, changeSubscriptionPlan,
        processExpiredTrials, sendExpiryReminders, processSubscriptionPayment, updatePaymentTransactionStatus, updateEmailTemplate,
        updateSmsTemplate, markInAppNotificationAsRead, submitSupportTicket, replyToSupportTicket, updateTicketStatus,
        addBlogPost, updateBlogPost, deleteBlogPost, updateLastLogin, generateInsights
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};