import React, { createContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { Session, User } from '@supabase/supabase-js';
import { 
    AppContextType, Product, Sale, Branch, StockLog, Tenant, SubscriptionPlan, 
    AdminUser, AdminRole, Permission, BrandConfig, PageContent, FaqItem, 
    PaymentSettings, NotificationSettings, Truck, Shipment, TrackerProvider, Staff, 
    CartItem, StaffRole, TenantPermission, allTenantPermissions, Supplier, 
    PurchaseOrder, Account, JournalEntry, Announcement, SystemSettings, Customer, 
    Consignment, Category, PaymentTransaction, EmailTemplate, SmsTemplate, 
    InAppNotification, MaintenanceSettings, AccessControlSettings, LandingPageMetrics, 
    AuditLog, NotificationType, Deposit, SupportTicket, TicketMessage, BlogPost,
    FeaturedUpdateSettings
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


interface Profile {
    id: string;
    is_super_admin: boolean;
    tenant_id: string | null;
}

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Data states, now fetched from Supabase
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [staffRoles, setStaffRoles] = useState<StaffRole[]>([]);
    const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
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
        aiSettings: {
            provider: 'gemini',
            gemini: { apiKey: '' },
            openai: { apiKey: '' }
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
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [consignments, setConsignments] = useState<Consignment[]>([]);
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
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

    // Auth & Profile loading
    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if(session) {
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                if(profileData) setProfile(profileData);
            }
            setIsLoading(false);
        };
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            // On signout, clear profile and data
            if (!session) {
                setProfile(null);
                setCurrentTenant(null);
                // Clear all data states
                setProducts([]); setSales([]); setBranches([]); // etc...
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    // Data fetching effect
    useEffect(() => {
        if (!session || !profile) {
            setIsLoading(false);
            return;
        };

        const fetchData = async () => {
            setIsLoading(true);

            // Fetch global data
            const [plansRes, settingsRes, announcementsRes] = await Promise.all([
                supabase.from('subscription_plans').select('*'),
                supabase.from('system_settings').select('settings').eq('id', 1).single(),
                supabase.from('announcements').select('*')
            ]);
            if (plansRes.data) setSubscriptionPlans(plansRes.data as any);
            if (settingsRes.data) {
                const dbSettings = settingsRes.data.settings as any;
                setBrandConfig({ name: dbSettings.name || 'FlowPay', logoUrl: dbSettings.logoUrl || '', faviconUrl: dbSettings.faviconUrl || '' });
                setSystemSettings(prev => ({ ...prev, ...dbSettings }));
            }
            if (announcementsRes.data) setAnnouncements(announcementsRes.data as any);
            
            // Fetch tenant or admin data
            if (profile.is_super_admin && !impersonatedUser) {
                 const [tenantsRes, adminsRes, rolesRes, paymentTransactionsRes, allSupportTicketsRes, blogPostsRes, allAuditLogsRes] = await Promise.all([
                    supabase.from('tenants').select('*'),
                    supabase.from('admin_users').select('*'),
                    supabase.from('admin_roles').select('*'),
                    supabase.from('payment_transactions').select('*'),
                    supabase.from('support_tickets').select('*, messages:ticket_messages(*)'),
                    supabase.from('blog_posts').select('*'),
                    supabase.from('audit_logs').select('*'),
                ]);
                if (tenantsRes.data) setTenants(tenantsRes.data as any);
                if (adminsRes.data) setAdminUsers(adminsRes.data as any);
                if (rolesRes.data) setAdminRoles(rolesRes.data as any);
                if (paymentTransactionsRes.data) setPaymentTransactions(paymentTransactionsRes.data as any);
                if (allSupportTicketsRes.data) setSupportTickets(allSupportTicketsRes.data as any);
                if (blogPostsRes.data) setBlogPosts(blogPostsRes.data as any);
                if (allAuditLogsRes.data) setAuditLogs(allAuditLogsRes.data as any);
            } else {
                const tenantIdToFetch = impersonatedUser?.id || profile.tenant_id;
                if (tenantIdToFetch) {
                    const { data: currentTenantData } = await supabase.from('tenants').select('*').eq('id', tenantIdToFetch).single();
                    if(currentTenantData) setCurrentTenant(currentTenantData as any);

                    // Fetch all data scoped to the tenant
                    const [
                        productsRes, salesRes, branchesRes, staffRes, staffRolesRes, stockLogsRes,
                        customersRes, suppliersRes, purchaseOrdersRes, accountsRes, journalEntriesRes,
                        consignmentsRes, depositsRes, categoriesRes, auditLogsRes, supportTicketsRes, 
                        trucksRes, shipmentsRes
                    ] = await Promise.all([
                        supabase.from('products').select('*, category:categories(name), variants:product_variants(*)').eq('tenant_id', tenantIdToFetch),
                        supabase.from('sales').select('*, items:sale_items(*), payments:sale_payments(*)').eq('tenant_id', tenantIdToFetch),
                        supabase.from('branches').select('*').eq('tenant_id', tenantIdToFetch),
                        supabase.from('staff').select('*').eq('tenant_id', tenantIdToFetch),
                        supabase.from('staff_roles').select('*').eq('tenant_id', tenantIdToFetch),
                        supabase.from('stock_logs').select('*').eq('tenant_id', tenantIdToFetch),
                        supabase.from('customers').select('*').eq('tenant_id', tenantIdToFetch),
                        supabase.from('suppliers').select('*').eq('tenant_id', tenantIdToFetch),
                        supabase.from('purchase_orders').select('*, items:purchase_order_items(*)').eq('tenant_id', tenantIdToFetch),
                        supabase.from('accounts').select('*').eq('tenant_id', tenantIdToFetch),
                        supabase.from('journal_entries').select('*, transactions:journal_transactions(*)').eq('tenant_id', tenantIdToFetch),
                        supabase.from('consignments').select('*, items:consignment_items(*)').eq('tenant_id', tenantIdToFetch),
                        supabase.from('deposits').select('*').eq('tenant_id', tenantIdToFetch),
                        supabase.from('categories').select('*').eq('tenant_id', tenantIdToFetch),
                        supabase.from('audit_logs').select('*').eq('tenant_id', tenantIdToFetch),
                        supabase.from('support_tickets').select('*, messages:ticket_messages(*)').eq('tenant_id', tenantIdToFetch),
                        supabase.from('trucks').select('*').eq('tenant_id', tenantIdToFetch),
                        supabase.from('shipments').select('*, items:shipment_items(*)').eq('tenant_id', tenantIdToFetch),
                    ]);
                    
                    if (productsRes.data) setProducts(productsRes.data.map(p => ({ ...p, variants: p.variants.map((v:any) => ({...v, sellingPrice: v.selling_price, costPrice: v.cost_price, stockByBranch: v.stock_by_branch, consignmentStockByBranch: v.consignment_stock_by_branch, reorderPointByBranch: v.reorder_point_by_branch, batchNumber: v.batch_number, expiryDate: v.expiry_date })) })) as any);
                    if (salesRes.data) setSales(salesRes.data as any);
                    if (branchesRes.data) setBranches(branchesRes.data as any);
                    if (staffRes.data) setStaff(staffRes.data as any);
                    if (staffRolesRes.data) setStaffRoles(staffRolesRes.data as any);
                    if (stockLogsRes.data) setStockLogs(stockLogsRes.data as any);
                    if (customersRes.data) setCustomers(customersRes.data as any);
                    if (suppliersRes.data) setSuppliers(suppliersRes.data as any);
                    if (purchaseOrdersRes.data) setPurchaseOrders(purchaseOrdersRes.data as any);
                    if (accountsRes.data) setAccounts(accountsRes.data as any);
                    if (journalEntriesRes.data) setJournalEntries(journalEntriesRes.data as any);
                    if (consignmentsRes.data) setConsignments(consignmentsRes.data as any);
                    if (depositsRes.data) setDeposits(depositsRes.data as any);
                    if (categoriesRes.data) setCategories(categoriesRes.data as any);
                    if (auditLogsRes.data) setAuditLogs(auditLogsRes.data as any);
                    if (supportTicketsRes.data) setSupportTickets(supportTicketsRes.data as any);
                    if (trucksRes.data) setTrucks(trucksRes.data as any);
                    if (shipmentsRes.data) setShipments(shipmentsRes.data as any);
                }
            }

            setIsLoading(false);
        };

        fetchData();
    }, [session, profile, impersonatedUser]);

    // UI Effects
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    // Auth functions
    const logout = async () => {
        await supabase.auth.signOut();
        setImpersonatedUser(null);
    };
    
    const stopImpersonating = () => {
        setImpersonatedUser(null);
    };

    // Data manipulation functions (examples)
    const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'date' | 'status' | 'amountDue'>): Promise<{success: boolean, message: string, newSale?: Sale}> => {
      if (!currentTenant) return { success: false, message: 'No tenant context.' };
      
      // THIS IS A SIMPLIFIED VERSION. A real implementation should use a Supabase Edge Function (RPC call)
      // to perform these operations in a single database transaction to ensure data integrity.
      
      const { data: sale, error } = await supabase
        .from('sales')
        .insert({
            tenant_id: currentTenant.id,
            branch_id: saleData.branchId,
            customer_id: saleData.customerId,
            total: saleData.total
            // ... other fields
        })
        .select()
        .single();
        
      if (error || !sale) {
        setNotification({ type: 'error', message: error?.message || 'Failed to record sale.' });
        return { success: false, message: error?.message || 'Failed to record sale.' };
      }
      
      // Add sale items and payments... update stock...
      // ...
      
      setNotification({ type: 'success', message: 'Sale recorded!' });
      // Refetch sales or optimistically update state
      setSales(prev => [sale as Sale, ...prev]);

      return { success: true, message: 'Sale completed successfully.', newSale: sale as Sale };
    }, [currentTenant]);
    
    const addTenant = async (tenantData: any) => {
        // This is now handled in SignUp.tsx via auth helpers and direct calls
        console.warn("addTenant from context is deprecated. Use signup flow.");
        return { success: false, message: "Use signup flow." };
    };

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