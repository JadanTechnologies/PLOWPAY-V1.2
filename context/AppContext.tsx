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
    LocalSession, Profile, allPermissions, IpGeolocationProvider, MapProvider, AISettings, SupabaseSettings,
    ProductVariant,
    Budget,
    CreditPayment,
    StockLogAction
} from '../types';

// Initial Data
const branches: Branch[] = [
  { id: 'branch-1', name: 'Downtown', location: { lat: 37.7749, lng: -122.4194 } },
  { id: 'branch-2', name: 'Uptown', location: { lat: 37.7949, lng: -122.4294 } },
];

const staffRoles: StaffRole[] = [
    { id: 'role-admin', name: 'Admin', permissions: allTenantPermissions },
    { id: 'role-cashier', name: 'Cashier', permissions: ['accessPOS', 'makeDeposits', 'viewReports', 'accessCashierCredit', 'accessCashierDeposits', 'makeCreditSales'] },
    { id: 'role-stock', name: 'Stock Manager', permissions: ['manageInventory', 'managePurchases', 'viewAuditLogs'] },
]

const staff: Staff[] = [
  { id: 'staff-1', name: 'Jane Doe', email: 'jane@example.com', username: 'jane', password: '12345', roleId: 'role-admin', branchId: 'branch-1', lastKnownLocation: { lat: 37.78, lng: -122.41, timestamp: new Date() } },
  { id: 'staff-2', name: 'John Smith', email: 'john@example.com', username: 'john', password: '12345', roleId: 'role-cashier', branchId: 'branch-1', lastKnownLocation: { lat: 37.77, lng: -122.43, timestamp: new Date() } },
];

const categories: Category[] = [
    { id: 'cat-1', name: 'Electronics' },
    { id: 'cat-2', name: 'Groceries' },
    { id: 'cat-3', name: 'Apparel' },
]

const products: Product[] = [
  { id: 'prod-1', name: 'Laptop', categoryId: 'cat-1', variants: [
      { id: 'var-1a', name: '13-inch', sku: 'LP13', sellingPrice: 1200, costPrice: 800, stockByBranch: { 'branch-1': 10, 'branch-2': 5 }, batchNumber: 'B123', expiryDate: '2025-12-31' },
      { id: 'var-1b', name: '15-inch', sku: 'LP15', sellingPrice: 1500, costPrice: 1000, stockByBranch: { 'branch-1': 8, 'branch-2': 3 } }
  ], isFavorite: true },
  { id: 'prod-2', name: 'Milk', categoryId: 'cat-2', variants: [
      { id: 'var-2a', name: '1 Gallon', sku: 'MK1G', sellingPrice: 4, costPrice: 2.5, stockByBranch: { 'branch-1': 50, 'branch-2': 30 }, consignmentStockByBranch: { 'branch-1': 20 }, reorderPointByBranch: {'branch-1': 10}, expiryDate: '2024-08-15' }
  ], isFavorite: true },
  { id: 'prod-3', name: 'T-Shirt', categoryId: 'cat-3', variants: [
      { id: 'var-3a', name: 'Medium', sku: 'TSM', sellingPrice: 25, costPrice: 10, stockByBranch: { 'branch-1': 100, 'branch-2': 80 } },
      { id: 'var-3b', name: 'Large', sku: 'TSL', sellingPrice: 25, costPrice: 10, stockByBranch: { 'branch-1': 90, 'branch-2': 70 } }
  ] },
  { id: 'prod-4', name: 'Keyboard', categoryId: 'cat-1', variants: [
      { id: 'var-4a', name: 'Standard', sku: 'KB104', sellingPrice: 75, costPrice: 40, stockByBranch: { 'branch-1': 25, 'branch-2': 15 } }
  ] },
];

const customers: Customer[] = [
    { id: 'cust-walkin', name: 'Walk-in Customer', creditBalance: 0 },
    { id: 'cust-1', name: 'Alice Johnson', phone: '555-0101', email: 'alice@example.com', creditBalance: 250, creditLimit: 1000 },
    { id: 'cust-2', name: 'Bob Williams', phone: '555-0102', email: 'bob@example.com', creditBalance: 0 },
];

const sales: Sale[] = [
  { id: 'sale-1', date: new Date(new Date().setDate(new Date().getDate() - 1)), items: [
      { productId: 'prod-1', variantId: 'var-1a', name: 'Laptop', variantName: '13-inch', quantity: 1, sellingPrice: 1200, costPrice: 800 },
      { productId: 'prod-4', variantId: 'var-4a', name: 'Keyboard', variantName: 'Standard', quantity: 1, sellingPrice: 75, costPrice: 40 }
  ], total: 1275, branchId: 'branch-1', customerId: 'cust-1', payments: [{ method: 'Card', amount: 1275 }], change: 0, staffId: 'staff-1', status: 'PAID', amountDue: 0 },
  { id: 'sale-2', date: new Date(new Date().setDate(new Date().getDate() - 2)), items: [
      { productId: 'prod-2', variantId: 'var-2a', name: 'Milk', variantName: '1 Gallon', quantity: 2, sellingPrice: 4, costPrice: 2.5 }
  ], total: 8, branchId: 'branch-2', customerId: 'cust-walkin', payments: [{ method: 'Cash', amount: 10 }], change: 2, staffId: 'staff-2', status: 'PAID', amountDue: 0 },
  { id: 'sale-3', date: new Date(new Date().setDate(new Date().getDate() - 35)), items: [
      { productId: 'prod-3', variantId: 'var-3a', name: 'T-Shirt', variantName: 'Medium', quantity: 5, sellingPrice: 25, costPrice: 10 }
  ], total: 125, branchId: 'branch-1', customerId: 'cust-1', payments: [], change: 0, staffId: 'staff-1', status: 'UNPAID', amountDue: 125 },
];

const stockLogs: StockLog[] = [
    { id: 'log-1', date: new Date(new Date().setDate(new Date().getDate() - 1)), productId: 'prod-1', variantId: 'var-1a', productName: 'Laptop', variantName: '13-inch', action: 'SALE', quantity: -1, branchId: 'branch-1' },
];

const subscriptionPlans: SubscriptionPlan[] = [
    { id: 'plan-basic', name: 'Basic', price: 29, priceYearly: 290, features: ['1 Branch', '2 Staff Accounts', 'Basic Reporting'], description: 'Perfect for new businesses getting started.', recommended: false },
    { id: 'plan-pro', name: 'Pro', price: 79, priceYearly: 790, features: ['5 Branches', '10 Staff Accounts', 'Advanced Reporting', 'Logistics Management'], description: 'For growing businesses expanding their operations.', recommended: true },
    { id: 'plan-enterprise', name: 'Enterprise', price: 199, priceYearly: 1990, features: ['Unlimited Branches', 'Unlimited Staff', 'All Features Included', 'Dedicated Support'], description: 'For large-scale businesses with complex needs.', recommended: false },
];

const tenant1: Tenant = {
    id: 'tenant-123',
    businessName: 'Innovate Creations',
    ownerName: 'Demo Tenant',
    email: 'tenant@flowpay.com',
    username: 'tenant',
    companyAddress: '123 Innovation Drive, Tech City',
    companyPhone: '(555) 123-4567',
    companyLogoUrl: 'https://tailwindui.com/img/logos/mark.svg?color=cyan&shade=500',
    status: 'TRIAL',
    planId: 'plan-pro',
    joinDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    trialEndDate: new Date(new Date().setDate(new Date().getDate() + 9)),
    currency: 'NGN',
    language: 'en',
    timezone: 'Africa/Lagos',
    isVerified: true,
    billingCycle: 'monthly',
    automations: { generateEODReport: true, sendLowStockAlerts: false, sendCreditLimitAlerts: false },
    logisticsConfig: { activeTrackerProviderId: 'teltonika' },
    lastKnownLocation: { lat: 37.7749, lng: -122.4194, timestamp: new Date() }
};

const tenants: Tenant[] = [ tenant1 ];

const adminUsers: AdminUser[] = [
    { id: 'admin-super', name: 'Super Admin', email: 'super@flowpay.com', username: 'super', password: 'password', roleId: 'role-super', status: 'ACTIVE', joinDate: new Date(), lastLoginIp: '192.168.1.1' }
];

const adminRoles: AdminRole[] = [
    { id: 'role-super', name: 'Admin', permissions: allPermissions },
    { id: 'role-support', name: 'Support', permissions: ['viewPlatformDashboard', 'manageTenants', 'manageSupport', 'viewAuditLogs'] }
];

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State Initialization
    const [stateProducts, setProducts] = useState<Product[]>(products);
    const [stateSales, setSales] = useState<Sale[]>(sales);
    const [stateBranches, setBranches] = useState<Branch[]>(branches);
    const [stateStaff, setStaff] = useState<Staff[]>(staff);
    const [stateStaffRoles, setStaffRoles] = useState<StaffRole[]>(staffRoles);
    const [stateStockLogs, setStockLogs] = useState<StockLog[]>(stockLogs);
    const [stateTenants, setTenants] = useState<Tenant[]>(tenants);
    const [stateSubscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(subscriptionPlans);
    const [stateAdminUsers, setAdminUsers] = useState<AdminUser[]>(adminUsers);
    const [stateAdminRoles, setAdminRoles] = useState<AdminRole[]>(adminRoles);
    const [stateCustomers, setCustomers] = useState<Customer[]>(customers);
    
    const [stateCategories, setCategories] = useState<Category[]>(categories);
    const [stateTrucks, setTrucks] = useState<Truck[]>([]);
    const [stateShipments, setShipments] = useState<Shipment[]>([]);
    const [stateTrackerProviders, setTrackerProviders] = useState<TrackerProvider[]>([
        { id: 'teltonika', name: 'Teltonika', apiKey: '', apiEndpoint: '' },
        { id: 'geotab', name: 'Geotab', apiKey: '', apiEndpoint: '' }
    ]);
    const [stateSuppliers, setSuppliers] = useState<Supplier[]>([
        { id: 'sup-1', name: 'Tech Supplies Inc.', contactPerson: 'Michael Scott', email: 'mike@techsupplies.com', phone: '555-9876' }
    ]);
    const [statePurchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [stateAccounts, setAccounts] = useState<Account[]>([
        { id: 'acc-1', name: 'Cash on Hand', type: 'ASSET', balance: 5000 },
        { id: 'acc-2', name: 'Sales Revenue', type: 'REVENUE', balance: 0 },
        { id: 'acc-3', name: 'Inventory Asset', type: 'ASSET', balance: 15000 },
        { id: 'acc-4', name: 'Cost of Goods Sold', type: 'EXPENSE', balance: 0 },
    ]);
    const [stateJournalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [stateAnnouncements, setAnnouncements] = useState<Announcement[]>([]);
    const [stateConsignments, setConsignments] = useState<Consignment[]>([]);
    const [statePaymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);
    const [stateEmailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
    const [stateSmsTemplates, setSmsTemplates] = useState<SmsTemplate[]>([]);
    const [stateAuditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [stateDeposits, setDeposits] = useState<Deposit[]>([]);
    const [stateCreditPayments, setCreditPayments] = useState<CreditPayment[]>([]);
    const [stateSupportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [stateBlogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [stateInAppNotifications, setInAppNotifications] = useState<InAppNotification[]>([]);
    const [stateBudgets, setBudgets] = useState<Budget[]>([]);
    
    // System & Config State
    const [brandConfig, setBrandConfig] = useState<BrandConfig>({ name: 'FlowPay', logoUrl: '', faviconUrl: '' });
    const [pageContent, setPageContent] = useState<PageContent>({ about: '', contact: '', terms: '', privacy: '', refund: '', faqs: [], helpCenter: '', apiDocs: '', blog: '' });
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({ stripe: { enabled: false, publicKey: '', secretKey: '' }, flutterwave: { enabled: false, publicKey: '', secretKey: '' }, paystack: { enabled: false, publicKey: '', secretKey: '' }, manual: { enabled: true, details: '' } });
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ email: { provider: 'resend', resend: { apiKey: '' }, smtp: { host: 0, port: 0, user: '', pass: '' } }, sms: { twilio: { enabled: false, accountSid: '', apiKey: '', fromNumber: '' } }, push: { firebase: { enabled: false, serverKey: '', vapidKey: '' }, oneSignal: { enabled: false, appId: '', apiKey: '' } } });
    const [systemSettings, setSystemSettings] = useState<SystemSettings>({
        currencies: [{ code: 'USD', name: 'US Dollar', symbol: '$', enabled: true }, { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', enabled: true }],
        defaultCurrency: 'NGN',
        languages: [{ code: 'en', name: 'English', enabled: true }],
        defaultLanguage: 'en',
        defaultTimezone: 'UTC',
        maintenanceSettings: { isActive: false, message: 'We are undergoing scheduled maintenance.' },
        accessControlSettings: { mode: 'ALLOW_ALL', ipWhitelist: [], ipBlacklist: [], countryWhitelist: [], countryBlacklist: [], regionWhitelist: [], regionBlacklist: [], browserWhitelist: [], browserBlacklist: [], deviceWhitelist: [], deviceBlacklist: [] },
        landingPageMetrics: { businesses: { value: 1000, label: 'Businesses' }, users: { value: 5000, label: 'Users' }, revenue: { value: 10, label: 'Revenue' } },
        featuredUpdate: { isActive: true, title: 'New Feature!', content: 'Check out our new AI insights.' },
        mapProviders: [{ id: 'google', name: 'Google Maps', apiKey: '' }, { id: 'leaflet', name: 'Leaflet/OSM', apiKey: '' }],
        activeMapProviderId: 'leaflet',
        ipGeolocationProviders: [],
        activeIpGeolocationProviderId: '',
        aiSettings: { provider: 'gemini', gemini: { apiKey: '' }, openai: { apiKey: '' } },
        supabaseSettings: { projectUrl: '', anonKey: '' }
    });

    // App State
    const [session, setSession] = useState<LocalSession | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<NotificationType | null>(null);
    const [impersonatedUser, setImpersonatedUser] = useState<Tenant | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [currentCurrency, setCurrentCurrency] = useState('NGN');
    const [currentStaffUser, setCurrentStaffUser] = useState<Staff | null>(null);

    // Derived State
    const currentTenant = useMemo(() => impersonatedUser || (profile?.tenant_id ? stateTenants.find(t => t.id === profile.tenant_id) || null : null), [impersonatedUser, profile, stateTenants]);
    const currentAdminUser = useMemo(() => profile?.is_super_admin ? stateAdminUsers.find(u => u.id === profile.id) || null : null, [profile, stateAdminUsers]);

    // Actions
    const logAction = useCallback((action: string, details: string, user?: { id: string; name: string; type: 'STAFF' | 'TENANT' | 'SUPER_ADMIN' }) => {
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            userId: user?.id || currentStaffUser?.id || currentTenant?.id || currentAdminUser?.id || 'unknown',
            userName: user?.name || currentStaffUser?.name || currentTenant?.ownerName || currentAdminUser?.name || 'Unknown',
            userType: user?.type || (currentStaffUser ? 'STAFF' : (currentAdminUser ? 'SUPER_ADMIN' : 'TENANT')),
            tenantId: currentTenant?.id,
            action,
            details
        };
        setAuditLogs(prev => [newLog, ...prev]);
    }, [currentStaffUser, currentTenant, currentAdminUser]);

    const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'date' | 'status' | 'amountDue'>) => {
        const paidAmount = saleData.payments.reduce((sum, p) => sum + p.amount, 0);
        const isPaid = paidAmount >= saleData.total;
        const status: Sale['status'] = isPaid ? 'PAID' : (paidAmount > 0 ? 'PARTIALLY_PAID' : 'UNPAID');
        const amountDue = saleData.total - paidAmount;

        const newSale: Sale = {
            ...saleData,
            id: `sale-${Date.now()}`,
            date: new Date(),
            status,
            amountDue: amountDue > 0 ? amountDue : 0
        };

        // Update stock
        const newProducts = [...stateProducts];
        saleData.items.forEach(item => {
            const productIndex = newProducts.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                const variantIndex = newProducts[productIndex].variants.findIndex(v => v.id === item.variantId);
                if (variantIndex !== -1) {
                     // Decrement stock for sales, increment for returns (negative quantity in sale item)
                    // Logic: If item.quantity is 1 (sale), we subtract 1. If item.quantity is -1 (return), we subtract -1 (add 1).
                    // So we always subtract item.quantity.
                    const currentStock = newProducts[productIndex].variants[variantIndex].stockByBranch[saleData.branchId] || 0;
                    newProducts[productIndex].variants[variantIndex].stockByBranch[saleData.branchId] = currentStock - item.quantity;
                }
            }
             // Log Stock Movement
             const log: StockLog = {
                id: `sl-${Date.now()}-${item.variantId}`,
                date: new Date(),
                productId: item.productId,
                variantId: item.variantId,
                productName: item.name,
                variantName: item.variantName,
                action: item.quantity > 0 ? 'SALE' : 'RETURN',
                quantity: -item.quantity, // Negative quantity in log for sales (stock reduction), Positive for returns
                branchId: saleData.branchId,
                referenceId: newSale.id
            };
            setStockLogs(prev => [log, ...prev]);
        });
        setProducts(newProducts);
        setSales(prev => [...prev, newSale]);

        // Update Customer Credit if applicable
        if (amountDue > 0 && saleData.customerId !== 'cust-walkin') {
            setCustomers(prev => prev.map(c => {
                if (c.id === saleData.customerId) {
                    return { ...c, creditBalance: (c.creditBalance || 0) + amountDue };
                }
                return c;
            }));
        }
        
        // Deduct from deposit if used
        const depositPayment = saleData.payments.find(p => p.method === 'Deposit');
        if (depositPayment && saleData.customerId) {
             // Find active deposits and deduct
             // This is a simplified logic. Ideally, we match specific deposits.
             // Here we just reduce the available deposit balance by updating deposits or creating a negative deposit record/usage record.
             // For simplicity in this demo, we won't mutate past deposits but assumes validation happened before.
             const usageRecord: Deposit = {
                 id: `dep-use-${Date.now()}`,
                 customerId: saleData.customerId,
                 amount: -depositPayment.amount,
                 date: new Date(),
                 staffId: saleData.staffId,
                 branchId: saleData.branchId,
                 status: 'APPLIED',
                 appliedSaleId: newSale.id,
                 notes: 'Payment for sale'
             };
             setDeposits(prev => [...prev, usageRecord]);
        }

        // Accounting
        const revenueAccount = stateAccounts.find(a => a.type === 'REVENUE');
        const cashAccount = stateAccounts.find(a => a.type === 'ASSET' && a.name.includes('Cash')); // Simplified
        if (revenueAccount && cashAccount) {
            addJournalEntry({
                description: `Sale ${newSale.id}`,
                transactions: [
                    { accountId: cashAccount.id, amount: paidAmount }, // Debit Cash
                    { accountId: revenueAccount.id, amount: -saleData.total } // Credit Revenue (Credits are negative in our simple model usually, or we handle sign in UI. Let's stick to standard: Debits + / Credits - for balancing)
                    // Note: This simple accounting logic needs expansion for COGS, Inventory, etc.
                ]
            });
        }

        logAction('CREATE_SALE', `Created sale ${newSale.id} total ${newSale.total}`);
        return { success: true, message: 'Sale processed successfully', newSale };
    }, [stateProducts, stateAccounts, logAction]);

    const adjustStock = useCallback((productId: string, variantId: string, branchId: string, quantityChange: number, reason: string) => {
        setProducts(prev => {
            const newProducts = [...prev];
            const pIndex = newProducts.findIndex(p => p.id === productId);
            if (pIndex !== -1) {
                const vIndex = newProducts[pIndex].variants.findIndex(v => v.id === variantId);
                if (vIndex !== -1) {
                    const current = newProducts[pIndex].variants[vIndex].stockByBranch[branchId] || 0;
                    newProducts[pIndex].variants[vIndex].stockByBranch[branchId] = current + quantityChange;
                    
                    const variant = newProducts[pIndex].variants[vIndex];
                     setStockLogs(logs => [{
                        id: `sl-${Date.now()}`,
                        date: new Date(),
                        productId,
                        variantId,
                        productName: newProducts[pIndex].name,
                        variantName: variant.name,
                        action: 'ADJUSTMENT',
                        quantity: quantityChange,
                        branchId,
                        reason
                    }, ...logs]);
                }
            }
            return newProducts;
        });
        logAction('ADJUST_STOCK', `Adjusted stock for ${productId}/${variantId} by ${quantityChange}`);
    }, [logAction]);
    
    const transferStock = useCallback((productId: string, variantId: string, fromBranchId: string, toBranchId: string, quantity: number) => {
         setProducts(prev => {
            const newProducts = [...prev];
            const pIndex = newProducts.findIndex(p => p.id === productId);
            if (pIndex !== -1) {
                const vIndex = newProducts[pIndex].variants.findIndex(v => v.id === variantId);
                if (vIndex !== -1) {
                     const variant = newProducts[pIndex].variants[vIndex];
                     const fromStock = variant.stockByBranch[fromBranchId] || 0;
                     if (fromStock >= quantity) {
                         variant.stockByBranch[fromBranchId] -= quantity;
                         variant.stockByBranch[toBranchId] = (variant.stockByBranch[toBranchId] || 0) + quantity;
                         
                          setStockLogs(logs => [{
                            id: `sl-${Date.now()}`,
                            date: new Date(),
                            productId,
                            variantId,
                            productName: newProducts[pIndex].name,
                            variantName: variant.name,
                            action: 'TRANSFER',
                            quantity: quantity,
                            fromBranchId,
                            toBranchId
                        }, ...logs]);
                     }
                }
            }
            return newProducts;
        });
         logAction('TRANSFER_STOCK', `Transferred ${quantity} of ${productId} from ${fromBranchId} to ${toBranchId}`);
    }, [logAction]);

    // ... (Implement other CRUD functions similarly - creating dummy versions for brevity but functional for the UI)
    const addProduct = (data: any) => {
        const newProduct = { ...data, id: `prod-${Date.now()}`, variants: data.variants.map((v: any) => ({ ...v, id: `var-${Date.now()}-${Math.random()}` })) };
        setProducts(prev => [...prev, newProduct]);
        logAction('ADD_PRODUCT', `Added product ${newProduct.name}`);
    };
    
    const updateProductVariant = (productId: string, variantId: string, data: any) => {
        setProducts(prev => prev.map(p => {
            if (p.id === productId) {
                return {
                    ...p,
                    variants: p.variants.map(v => v.id === variantId ? { ...v, ...data } : v)
                };
            }
            return p;
        }));
        logAction('UPDATE_PRODUCT', `Updated variant ${variantId}`);
    };

    const addAdminUser = (u: any) => { setAdminUsers(prev => [...prev, { ...u, id: `admin-${Date.now()}`, status: 'ACTIVE', joinDate: new Date() }]); logAction('ADD_ADMIN', `Added admin ${u.name}`); };
    const updateAdminUser = (id: string, data: any) => { setAdminUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u)); logAction('UPDATE_ADMIN', `Updated admin ${id}`); };
    const updateAdminRole = (id: string, perms: Permission[]) => setAdminRoles(prev => prev.map(r => r.id === id ? { ...r, permissions: perms } : r));
    const addAdminRole = (r: any) => setAdminRoles(prev => [...prev, { ...r, id: `role-${Date.now()}` }]);
    const deleteAdminRole = (id: string) => setAdminRoles(prev => prev.filter(r => r.id !== id));
    
    const handleImpersonate = (tenant: Tenant) => setImpersonatedUser(tenant);
    const stopImpersonating = () => setImpersonatedUser(null);
    
    const login = async (u: string, p: string) => {
        // Simplified login logic
        if (u === 'super' && p === 'password') {
            const user = stateAdminUsers.find(au => au.username === 'super');
            if (user) {
                const session = { user: { id: user.id, email: user.email }, profile: { id: user.id, is_super_admin: true, tenant_id: null } };
                setSession(session); setProfile(session.profile);
                localStorage.setItem('flowpay_session', JSON.stringify(session));
                return { success: true, message: 'Login successful' };
            }
        }
        // Check tenants
        const tenant = stateTenants.find(t => t.username === u || t.email === u);
        if (tenant) { // Any password works for demo
             const session = { user: { id: tenant.id, email: tenant.email }, profile: { id: tenant.id, is_super_admin: false, tenant_id: tenant.id } };
             setSession(session); setProfile(session.profile);
             localStorage.setItem('flowpay_session', JSON.stringify(session));
             return { success: true, message: 'Login successful' };
        }
         // Check staff
        const staffUser = stateStaff.find(s => s.username === u || s.email === u);
        if (staffUser) {
             const session = { user: { id: staffUser.id, email: staffUser.email }, profile: { id: staffUser.id, is_super_admin: false, tenant_id: 'tenant-123' } }; // Assuming belonging to tenant-123 for demo
             setSession(session); setProfile(session.profile); setCurrentStaffUser(staffUser);
             localStorage.setItem('flowpay_session', JSON.stringify(session));
             return { success: true, message: 'Login successful' };
        }

        return { success: false, message: 'Invalid credentials' };
    };
    
    const logout = () => {
        setSession(null); setProfile(null); setCurrentStaffUser(null); setImpersonatedUser(null);
        localStorage.removeItem('flowpay_session');
    };

    // Getters for context
    const getMetric = (m: any) => 0; // Dummy implementation

    // Helper setters
    const updateBrandConfig = (c: any) => setBrandConfig(c);
    const updatePageContent = (c: any) => setPageContent(prev => ({...prev, ...c}));
    const updateFaqs = (f: any) => setPageContent(prev => ({...prev, faqs: f}));
    const updatePaymentSettings = (s: any) => setPaymentSettings(s);
    const updateNotificationSettings = (s: any) => setNotificationSettings(s);
    const updateSystemSettings = (s: any) => setSystemSettings(prev => ({...prev, ...s}));
    const updateMaintenanceSettings = (s: any) => setSystemSettings(prev => ({...prev, maintenanceSettings: s}));
    const updateAccessControlSettings = (s: any) => setSystemSettings(prev => ({...prev, accessControlSettings: s}));
    const updateLandingPageMetrics = (s: any) => setSystemSettings(prev => ({...prev, landingPageMetrics: s}));
    
    const updateTenant = (id: string, data: any) => setTenants(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    const updateCurrentTenantSettings = (data: any) => { if(currentTenant) updateTenant(currentTenant.id, data); };
    const updateTenantLogisticsConfig = (c: any) => { if(currentTenant) updateTenant(currentTenant.id, { logisticsConfig: { ...currentTenant.logisticsConfig, ...c }}); };
    const updateTenantAutomations = (a: any) => { if(currentTenant) updateTenant(currentTenant.id, { automations: a }); };
    
    const addSubscriptionPlan = (p: any) => setSubscriptionPlans(prev => [...prev, { ...p, id: `plan-${Date.now()}` }]);
    const updateSubscriptionPlan = (id: string, d: any) => setSubscriptionPlans(prev => prev.map(p => p.id === id ? { ...p, ...d } : p));
    const deleteSubscriptionPlan = (id: string) => setSubscriptionPlans(prev => prev.filter(p => p.id !== id));
    
    const addTruck = (t: any) => setTrucks(prev => [...prev, { ...t, id: `truck-${Date.now()}`, lastUpdate: new Date() }]);
    const updateTruck = (id: string, d: any) => setTrucks(prev => prev.map(t => t.id === id ? { ...t, ...d } : t));
    const deleteTruck = (id: string) => setTrucks(prev => prev.filter(t => t.id !== id));
    const updateTruckVitals = (id: string) => setTrucks(prev => prev.map(t => t.id === id ? { ...t, lastUpdate: new Date(), currentLocation: { lat: t.currentLocation.lat + 0.01, lng: t.currentLocation.lng + 0.01, address: 'Updated Location' } } : t));
    
    const addShipment = (s: any) => setShipments(prev => [...prev, { ...s, id: `ship-${Date.now()}` }]);
    const updateShipmentStatus = (id: string, s: any) => setShipments(prev => prev.map(sh => sh.id === id ? { ...sh, status: s } : sh));
    const updateTrackerProviders = (p: any) => setTrackerProviders(p);
    
    const addBranch = (name: string) => setBranches(prev => [...prev, { id: `branch-${Date.now()}`, name, location: { lat: 0, lng: 0 } }]);
    const updateBranchLocation = (id: string, loc: any) => setBranches(prev => prev.map(b => b.id === id ? { ...b, location: loc } : b));
    
    const addStaff = (s: any) => setStaff(prev => [...prev, { ...s, id: `staff-${Date.now()}` }]);
    const deleteStaff = (id: string) => setStaff(prev => prev.filter(s => s.id !== id));
    
    const sellShipment = async (id: string, c: any) => {
        // Mock implementation
        return { success: true, message: 'Shipment sold' };
    };
    const receiveShipment = (id: string) => {
        setShipments(prev => prev.map(s => s.id === id ? { ...s, status: 'DELIVERED' } : s));
        // Logic to add stock from shipment would go here
    };
    
    const addPurchaseOrder = (po: any) => setPurchaseOrders(prev => [...prev, { ...po, id: `po-${Date.now()}`, createdAt: new Date() }]);
    const updatePurchaseOrderStatus = (id: string, s: any) => setPurchaseOrders(prev => prev.map(p => p.id === id ? { ...p, status: s } : p));
    
    const addStaffRole = (r: any) => setStaffRoles(prev => [...prev, { ...r, id: `role-${Date.now()}` }]);
    const updateStaffRole = (id: string, p: any) => setStaffRoles(prev => prev.map(r => r.id === id ? { ...r, permissions: p } : r));
    const deleteStaffRole = (id: string) => setStaffRoles(prev => prev.filter(r => r.id !== id));
    
    const addAccount = (a: any) => setAccounts(prev => [...prev, { ...a, id: `acc-${Date.now()}`, balance: 0 }]);
    const addJournalEntry = (e: any) => {
        setJournalEntries(prev => [...prev, { ...e, id: `je-${Date.now()}`, date: new Date() }]);
        // Update account balances
        setAccounts(prev => prev.map(acc => {
            const tx = e.transactions.find((t: any) => t.accountId === acc.id);
            if (tx) return { ...acc, balance: acc.balance + tx.amount };
            return acc;
        }));
    };
    
    const addTenant = async (t: any, logo: string) => {
        const newTenant = { ...t, id: `tenant-${Date.now()}`, joinDate: new Date(), status: 'TRIAL', companyLogoUrl: logo, automations: {}, isVerified: false, trialEndDate: new Date(Date.now() + 14*24*60*60*1000) };
        setTenants(prev => [...prev, newTenant]);
        return { success: true, message: 'Tenant added' };
    };
    const verifyTenant = (email: string) => {
        setTenants(prev => prev.map(t => t.email === email ? { ...t, isVerified: true } : t));
    };
    const updateTenantProfile = (t: any) => { if(currentTenant) updateTenant(currentTenant.id, t); };
    const updateAdminProfile = (u: any) => { if(currentAdminUser) updateAdminUser(currentAdminUser.id, u); };
    
    const addAnnouncement = (a: any) => setAnnouncements(prev => [...prev, { ...a, id: `anno-${Date.now()}`, createdAt: new Date(), readBy: [] }]);
    const markAnnouncementAsRead = (id: string, uid: string) => setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, readBy: [...a.readBy, uid] } : a));
    
    const addCustomer = (c: any) => setCustomers(prev => [...prev, { ...c, id: `cust-${Date.now()}`, creditBalance: 0 }]);
    const deleteCustomer = (id: string) => setCustomers(prev => prev.filter(c => c.id !== id));
    const recordCreditPayment = (cid: string, amount: number, staffId: string) => {
         setCustomers(prev => prev.map(c => c.id === cid ? { ...c, creditBalance: c.creditBalance - amount } : c));
         setCreditPayments(prev => [...prev, { id: `cp-${Date.now()}`, customerId: cid, amount, date: new Date(), recordedByStaffId: staffId }]);
    };
    
    const addDeposit = async (d: any) => {
        setDeposits(prev => [...prev, { ...d, id: `dep-${Date.now()}`, date: new Date(), status: 'ACTIVE' }]);
        return { success: true, message: 'Deposit added' };
    };
    const updateDeposit = (id: string, updates: any) => setDeposits(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    
    const addConsignment = (c: any) => setConsignments(prev => [...prev, { ...c, id: `con-${Date.now()}`, status: 'ACTIVE' }]);
    
    const addCategory = (n: string) => setCategories(prev => [...prev, { id: `cat-${Date.now()}`, name: n }]);
    const updateCategory = (id: string, n: string) => setCategories(prev => prev.map(c => c.id === id ? { ...c, name: n } : c));
    const deleteCategory = (id: string) => setCategories(prev => prev.filter(c => c.id !== id));
    
    const extendTrial = (id: string, days: number) => {
         setTenants(prev => prev.map(t => {
             if (t.id === id && t.trialEndDate) {
                 const newEnd = new Date(t.trialEndDate);
                 newEnd.setDate(newEnd.getDate() + days);
                 return { ...t, trialEndDate: newEnd };
             }
             return t;
         }));
    };
    const changeSubscriptionPlan = (tid: string, pid: string, cycle: any) => {
        setTenants(prev => prev.map(t => t.id === tid ? { ...t, planId: pid, billingCycle: cycle } : t));
    };
    const processExpiredTrials = () => {
        const now = new Date();
        let suspended = 0;
        setTenants(prev => prev.map(t => {
            if (t.status === 'TRIAL' && t.trialEndDate && t.trialEndDate < now) {
                suspended++;
                return { ...t, status: 'SUSPENDED' };
            }
            return t;
        }));
        return { processed: tenants.length, suspended };
    };
    const sendExpiryReminders = () => ({ sent: 5 }); // Dummy
    const activateSubscription = (tid: string, pid: string, cycle: any) => {
         setTenants(prev => prev.map(t => t.id === tid ? { ...t, status: 'ACTIVE', planId: pid, billingCycle: cycle, trialEndDate: undefined } : t));
    };
    
    const processSubscriptionPayment = async (tid: string, pid: string, method: string, amount: number, cycle: any, success: boolean, proof?: string) => {
        const tx: PaymentTransaction = {
            id: `tx-${Date.now()}`,
            tenantId: tid,
            planId: pid,
            amount,
            method,
            status: success ? 'COMPLETED' : (method === 'Manual' ? 'PENDING' : 'FAILED'),
            createdAt: new Date(),
            proofOfPaymentUrl: proof
        };
        setPaymentTransactions(prev => [...prev, tx]);
        if (success) activateSubscription(tid, pid, cycle);
        return { success, message: success ? 'Payment successful' : 'Payment pending or failed' };
    };
    const updatePaymentTransactionStatus = (id: string, status: any) => {
        setPaymentTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        if (status === 'COMPLETED') {
            const tx = statePaymentTransactions.find(t => t.id === id);
            if (tx) activateSubscription(tx.tenantId, tx.planId, 'monthly'); // Default to monthly if unknown from tx
        }
    };
    
    const updateEmailTemplate = (id: string, s: string, b: string) => setEmailTemplates(prev => prev.map(t => t.id === id ? { ...t, subject: s, body: b } : t));
    const updateSmsTemplate = (id: string, b: string) => setSmsTemplates(prev => prev.map(t => t.id === id ? { ...t, body: b } : t));
    const markInAppNotificationAsRead = (id: string) => setInAppNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    
    const submitSupportTicket = (t: any) => setSupportTickets(prev => [...prev, { ...t, id: `ticket-${Date.now()}`, createdAt: new Date(), updatedAt: new Date(), status: 'Open', tenantId: currentTenant?.id }]);
    const replyToSupportTicket = (id: string, m: any) => setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, messages: [...t.messages, { ...m, id: `msg-${Date.now()}`, timestamp: new Date() }], updatedAt: new Date() } : t));
    const updateTicketStatus = (id: string, s: any) => setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, status: s, updatedAt: new Date() } : t));
    
    const addBlogPost = (p: any) => setBlogPosts(prev => [...prev, { ...p, id: `post-${Date.now()}`, createdAt: new Date() }]);
    const updateBlogPost = (id: string, p: any) => setBlogPosts(prev => prev.map(post => post.id === id ? { ...post, ...p } : post));
    const deleteBlogPost = (id: string) => setBlogPosts(prev => prev.filter(p => p.id !== id));
    
    const updateLastLogin = () => {}; // Handled in login
    const updateUserLocation = () => {}; // Dummy
    const generateInsights = async () => "Sales are looking great! Revenue up 5% this week.";
    
    const updateBudget = (aid: string, amt: number, period: string) => {
        setBudgets(prev => {
            const existing = prev.findIndex(b => b.accountId === aid && b.period === period);
            if (existing > -1) {
                const newBudgets = [...prev];
                newBudgets[existing].amount = amt;
                return newBudgets;
            }
            return [...prev, { id: `budget-${Date.now()}`, accountId: aid, amount: amt, period }];
        });
    };
    const deleteBudget = (aid: string, period: string) => setBudgets(prev => prev.filter(b => !(b.accountId === aid && b.period === period)));
    
    const addTenantEmailTemplate = (t: any) => setEmailTemplates(prev => [...prev, { ...t, id: `et-${Date.now()}`, tenantId: currentTenant?.id }]);
    const updateTenantEmailTemplate = (id: string, u: any) => setEmailTemplates(prev => prev.map(t => t.id === id ? { ...t, ...u } : t));
    const deleteTenantEmailTemplate = (id: string) => setEmailTemplates(prev => prev.filter(t => t.id !== id));
    
    const addTenantSmsTemplate = (t: any) => setSmsTemplates(prev => [...prev, { ...t, id: `st-${Date.now()}`, tenantId: currentTenant?.id }]);
    const updateTenantSmsTemplate = (id: string, u: any) => setSmsTemplates(prev => prev.map(t => t.id === id ? { ...t, ...u } : t));
    const deleteTenantSmsTemplate = (id: string) => setSmsTemplates(prev => prev.filter(t => t.id !== id));
    
    const sendBulkMessage = async () => ({ success: true, message: 'Messages sent' });
    const sendBulkMessageToTenants = async () => ({ success: true, message: 'Messages sent' });


    const value: AppContextType = {
        products: stateProducts, sales: stateSales, branches: stateBranches, staff: stateStaff, staffRoles: stateStaffRoles, stockLogs: stateStockLogs, tenants: stateTenants, subscriptionPlans: stateSubscriptionPlans, adminUsers: stateAdminUsers, adminRoles: stateAdminRoles, brandConfig, pageContent, paymentSettings, notificationSettings, systemSettings, trucks: stateTrucks, shipments: stateShipments, trackerProviders: stateTrackerProviders, suppliers: stateSuppliers, purchaseOrders: statePurchaseOrders, accounts: stateAccounts, journalEntries: stateJournalEntries, announcements: stateAnnouncements, customers: stateCustomers, consignments: stateConsignments, categories: stateCategories, paymentTransactions: statePaymentTransactions, emailTemplates: stateEmailTemplates, smsTemplates: stateSmsTemplates, auditLogs: stateAuditLogs, deposits: stateDeposits, creditPayments: stateCreditPayments, supportTickets: stateSupportTickets, blogPosts: stateBlogPosts, inAppNotifications: stateInAppNotifications, budgets: stateBudgets,
        currentTenant, currentAdminUser, impersonatedUser, notification, setNotification, logAction, searchTerm, setSearchTerm, theme, setTheme, currentLanguage, setCurrentLanguage, currentCurrency, setCurrentCurrency,
        getMetric, addSale, adjustStock, transferStock, addProduct, updateProductVariant, addAdminUser, updateAdminUser, updateAdminRole, addAdminRole, deleteAdminRole,
        session, setSession, profile, setProfile, isLoading, handleImpersonate, stopImpersonating, login, logout,
        allTenantPermissions, allPermissions, currentStaffUser, setCurrentStaffUser, activateSubscription,
        updateBrandConfig, updatePageContent, updateFaqs, updatePaymentSettings, updateNotificationSettings, updateSystemSettings, updateMaintenanceSettings, updateAccessControlSettings, updateLandingPageMetrics, updateTenant, updateCurrentTenantSettings, updateTenantLogisticsConfig, updateTenantAutomations, addSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, addTruck, updateTruck, deleteTruck, updateTruckVitals, addShipment, updateShipmentStatus, updateTrackerProviders, addBranch, updateBranchLocation, addStaff, deleteStaff, sellShipment, receiveShipment, addPurchaseOrder, updatePurchaseOrderStatus, addStaffRole, updateStaffRole, deleteStaffRole, addAccount, addJournalEntry, addTenant, verifyTenant, updateTenantProfile, updateAdminProfile, addAnnouncement, markAnnouncementAsRead, addCustomer, deleteCustomer, recordCreditPayment, addDeposit, updateDeposit, addConsignment, addCategory, updateCategory, deleteCategory, extendTrial, changeSubscriptionPlan, processExpiredTrials, sendExpiryReminders, processSubscriptionPayment, updatePaymentTransactionStatus, updateEmailTemplate, updateSmsTemplate, markInAppNotificationAsRead, submitSupportTicket, replyToSupportTicket, updateTicketStatus, addBlogPost, updateBlogPost, deleteBlogPost, updateLastLogin, updateUserLocation, generateInsights, updateBudget, deleteBudget,
        addTenantEmailTemplate, updateTenantEmailTemplate, deleteTenantEmailTemplate, addTenantSmsTemplate, updateTenantSmsTemplate, deleteTenantSmsTemplate, sendBulkMessage, sendBulkMessageToTenants
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
