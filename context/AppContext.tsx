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
    { id: 'role-cashier', name: 'Cashier', permissions: ['accessPOS', 'makeDeposits', 'manageDeposits', 'viewReports'] },
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
    { id: 'admin-super', name: 'Super Admin', email: 'super@flowpay.com', username: 'super', roleId: 'role-super-admin', status: 'ACTIVE', joinDate: new Date(), avatarUrl: 'https://picsum.photos/seed/admin/100' },
    { id: 'admin-support', name: 'Support Agent', email: 'support@flowpay.com', roleId: 'role-support', status: 'ACTIVE', joinDate: new Date(), avatarUrl: 'https://picsum.photos/seed/support/100' },
];

const adminRoles: AdminRole[] = [
    { id: 'role-super-admin', name: 'Admin', permissions: allPermissions },
    { id: 'role-support', name: 'Support', permissions: ['viewPlatformDashboard', 'manageTenants', 'manageSupport'] },
    { id: 'role-dev', name: 'Developer', permissions: ['manageSystemSettings'] },
];

const initialBrandConfig: BrandConfig = { name: 'FlowPay', logoUrl: '', faviconUrl: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💸</text></svg>' };

const initialPageContent: PageContent = {
    about: 'About FlowPay...', contact: 'Contact us at support@flowpay.com', terms: 'Terms of Service...', privacy: 'Privacy Policy...', refund: 'Refund Policy...',
    faqs: [
        { id: 'faq-1', question: 'What is FlowPay?', answer: 'A SaaS POS solution.' },
        { id: 'faq-2', question: 'How does billing work?', answer: 'You can choose monthly or yearly plans.' }
    ],
    helpCenter: 'Welcome to the help center.',
    apiDocs: 'API documentation...',
    blog: 'Welcome to our blog!'
};

const blogPosts: BlogPost[] = [
    { id: 'blog-1', title: 'Getting Started with FlowPay', content: 'Here is how you get started...', authorId: 'admin-super', authorName: 'Super Admin', createdAt: new Date(), status: 'PUBLISHED', featuredImage: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop' }
];

const initialPaymentSettings: PaymentSettings = {
    stripe: { enabled: true, publicKey: 'pk_test_stripe', secretKey: 'sk_test_stripe' },
    flutterwave: { enabled: true, publicKey: 'pk_test_flutterwave', secretKey: 'sk_test_flutterwave' },
    paystack: { enabled: true, publicKey: 'pk_test_paystack', secretKey: 'sk_test_paystack' },
    manual: { enabled: true, details: 'Bank: FlowPay Bank\nAccount: 1234567890\nName: FlowPay Inc.' }
};

const initialNotificationSettings: NotificationSettings = {
    email: { provider: 'resend', resend: { apiKey: 're_test_key' }, smtp: { host: 0, port: 0, user: '', pass: '' } },
    sms: { twilio: { enabled: true, accountSid: 'AC_test_sid', apiKey: 'twilio_test_key', fromNumber: '+15551234567' } },
    push: { firebase: { enabled: true, serverKey: 'firebase_test_key', vapidKey: 'firebase_vapid_key'}, oneSignal: { enabled: false, appId: '', apiKey: '' } }
};

const initialSystemSettings: SystemSettings = {
    currencies: [
      { code: 'USD', name: 'United States Dollar', symbol: '$', enabled: true },
      { code: 'EUR', name: 'Euro', symbol: '€', enabled: true },
      { code: 'GBP', name: 'British Pound', symbol: '£', enabled: true },
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', enabled: true },
    ],
    defaultCurrency: 'NGN',
    languages: [
        { code: 'en', name: 'English', enabled: true },
        { code: 'es', name: 'Spanish', enabled: true },
        { code: 'fr', name: 'French', enabled: true },
    ],
    defaultLanguage: 'en',
    defaultTimezone: 'Africa/Lagos',
    maintenanceSettings: { isActive: false, message: 'We are currently undergoing scheduled maintenance. We should be back shortly. Thank you for your patience.' },
    accessControlSettings: {
        mode: 'ALLOW_ALL', ipWhitelist: [], ipBlacklist: [], countryWhitelist: [], countryBlacklist: [],
        regionBlacklist:[], regionWhitelist:[], browserBlacklist:[], browserWhitelist:[], deviceBlacklist:[], deviceWhitelist:[],
    },
    landingPageMetrics: {
        businesses: { value: 1500, label: 'Businesses Powered' },
        users: { value: 12000, label: 'Active Users Daily' },
        revenue: { value: 5, label: 'Processed for Clients' }
    },
    featuredUpdate: { isActive: false, title: '', content: '' },
    mapProviders: [
        { id: 'google', name: 'Google Maps', apiKey: '' },
        { id: 'mapbox', name: 'Mapbox', apiKey: '' },
    ],
    activeMapProviderId: 'google',
    ipGeolocationProviders: [
        { id: 'ipinfo', name: 'IPinfo.io', apiKey: '', apiEndpoint: 'https://ipinfo.io/' },
    ],
    activeIpGeolocationProviderId: 'ipinfo',
    aiSettings: { provider: 'gemini', gemini: { apiKey: '' }, openai: { apiKey: '' } },
    supabaseSettings: { projectUrl: 'https://dpaxdweqfuurbvsncrgk.supabase.co', anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYXhkd2VxZnV1cmJ2c25jcmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDMwMjMsImV4cCI6MjA3ODIxOTAyM30.KFBAS0GFuvRwFsHtH1BJXQWOVlctQGmBEBNwp8TiVIQ' },
};

const trucks: Truck[] = [
    { id: 'truck-1', licensePlate: 'TRK-001', driverName: 'Mike Ross', status: 'IN_TRANSIT', currentLocation: { lat: 38.8951, lng: -77.0364, address: 'Washington D.C.' }, lastUpdate: new Date(), currentLoad: 15000, maxLoad: 20000, tenantId: 'tenant-123' },
    { id: 'truck-2', licensePlate: 'TRK-002', driverName: 'Harvey Specter', status: 'IDLE', currentLocation: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }, lastUpdate: new Date(), currentLoad: 0, maxLoad: 20000, tenantId: 'tenant-123' },
];

const shipments: Shipment[] = [
    { id: 'ship-1', shipmentCode: 'SHP-A1B2', origin: 'New York, NY', destination: 'branch-1', truckId: 'truck-1', status: 'IN_TRANSIT', items: [{ productId: 'prod-1', variantId: 'var-1b', productName: 'Laptop 15-inch', quantity: 20, sellingPrice: 1500 }], estimatedDelivery: new Date(new Date().setDate(new Date().getDate() + 2)) },
];

const trackerProviders: TrackerProvider[] = [
    { id: 'teltonika', name: 'Teltonika', apiKey: '', apiEndpoint: '' },
    { id: 'ruptela', name: 'Ruptela', apiKey: '', apiEndpoint: '' },
    { id: 'queclink', name: 'Queclink', apiKey: '', apiEndpoint: '' },
    { id: 'meitrack', name: 'Meitrack', apiKey: '', apiEndpoint: '' },
    { id: 'calamp', name: 'CalAmp', apiKey: '', apiEndpoint: '' },
    { id: 'geotab', name: 'Geotab', apiKey: '', apiEndpoint: '' },
    { id: 'samsara', name: 'Samsara', apiKey: '', apiEndpoint: '' },
    { id: 'atrak', name: 'ATrack', apiKey: '', apiEndpoint: '' },
    { id: 'fleetcomplete', name: 'Fleet Complete', apiKey: '', apiEndpoint: '' },
    { id: 'verizon', name: 'Verizon Connect', apiKey: '', apiEndpoint: '' },
    { id: 'other', name: 'Other', apiKey: '', apiEndpoint: '' },
];

const suppliers: Supplier[] = [
    { id: 'sup-1', name: 'Global Electronics', contactPerson: 'Sarah Connor', email: 'sarah@global.com', phone: '555-1111' },
    { id: 'sup-2', name: 'Fresh Farms Inc.', contactPerson: 'Peter Parker', email: 'pete@fresh.com', phone: '555-2222' },
];

const purchaseOrders: PurchaseOrder[] = [
    { id: 'po-1', poNumber: 'PO-2024-001', supplierId: 'sup-1', destinationBranchId: 'branch-1', items: [{ variantId: 'var-1a', productName: 'Laptop', variantName: '13-inch', quantity: 10, cost: 790 }], total: 7900, status: 'RECEIVED', createdAt: new Date(new Date().setDate(new Date().getDate() - 10)) }
];

const consignments: Consignment[] = [
    { id: 'con-1', supplierId: 'sup-2', branchId: 'branch-1', receivedDate: new Date(new Date().setDate(new Date().getDate() - 5)), items: [{ variantId: 'var-2a', productName: 'Milk', variantName: '1 Gallon', quantityReceived: 20, quantitySold: 5, costPrice: 2.2 }], status: 'ACTIVE' }
];

const accounts: Account[] = [
    { id: 'acct-cash', name: 'Cash on Hand', type: 'ASSET', balance: 15000 },
    { id: 'acct-sales', name: 'Sales Revenue', type: 'REVENUE', balance: -25000 },
    { id: 'acct-cogs', name: 'Cost of Goods Sold', type: 'EXPENSE', balance: 12000 },
    { id: 'acct-office', name: 'Office Supplies', type: 'EXPENSE', balance: 0 },
];

const journalEntries: JournalEntry[] = [
    { id: 'je-1', date: new Date(), description: 'Daily sales summary', transactions: [{ accountId: 'acct-cash', amount: 1399 }, { accountId: 'acct-sales', amount: -1399 }] },
];

const announcements: Announcement[] = [
    { id: 'anno-1', title: 'New Feature: Logistics Management', content: 'You can now track your fleet and shipments in real-time!', targetAudience: 'TENANTS', createdAt: new Date(new Date().setDate(new Date().getDate() - 2)), readBy: [] }
];

const paymentTransactions: PaymentTransaction[] = [
    { id: 'pt-1', tenantId: 'tenant-123', planId: 'plan-pro', amount: 79, method: 'Stripe', status: 'COMPLETED', createdAt: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
    { id: 'pt-2', tenantId: 'tenant-123', planId: 'plan-pro', amount: 79, method: 'Manual', status: 'PENDING', createdAt: new Date(), proofOfPaymentUrl: '/uploads/proof.jpg' }
];

const emailTemplates: EmailTemplate[] = [
    { id: 'tmpl-welcome', name: 'Welcome Email', subject: 'Welcome to FlowPay!', body: 'Hello {{tenantName}}, welcome aboard!' },
    { id: 'tmpl-expiry', name: 'Trial Expiry Reminder', subject: 'Your trial is ending soon', body: 'Hi {{tenantName}}, your trial for the {{planName}} plan is ending soon.' },
    { id: 'tmpl-tenant-promo', tenantId: 'tenant-123', name: 'Summer Sale Promo', subject: '☀️ Summer Sale is Here!', body: 'Hi {{customerName}},\n\nGet ready for our summer sale! Enjoy up to 50% off on selected items.\n\nThanks,\n{{businessName}}' },
];

const smsTemplates: SmsTemplate[] = [
    { id: 'tmpl-sms-receipt', name: 'Sale Receipt SMS', body: 'Thank you for your purchase of {{amount}} at {{businessName}}!' },
    { id: 'tmpl-tenant-sms-alert', tenantId: 'tenant-123', name: 'New Stock Alert', body: 'Hi {{customerName}}, new stock just arrived at {{businessName}}. Come check it out!' }
];

const auditLogs: AuditLog[] = [
    { id: 'audit-1', timestamp: new Date(), userId: 'staff-1', userName: 'Jane Doe', userType: 'STAFF', tenantId: 'tenant-123', action: 'CREATED_SALE', details: 'Created sale #sale-1 for $1275' },
    { id: 'audit-2', timestamp: new Date(), userId: 'admin-super', userName: 'Super Admin', userType: 'SUPER_ADMIN', action: 'UPDATED_PLAN', details: 'Updated plan "Basic" price' }
];

const deposits: Deposit[] = [
    { id: 'dep-1', customerId: 'cust-2', amount: 500, date: new Date(new Date().setDate(new Date().getDate() - 3)), staffId: 'staff-1', branchId: 'branch-1', status: 'ACTIVE' },
];

const initialCreditPayments: CreditPayment[] = [
    { id: 'cp-1', customerId: 'cust-1', amount: 100, date: new Date(new Date().setDate(new Date().getDate() - 10)), recordedByStaffId: 'staff-1' }
];

const supportTickets: SupportTicket[] = [
    { id: 'ticket-1', tenantId: 'tenant-123', subject: 'Problem with printer', department: 'Technical', priority: 'High', status: 'Open', createdAt: new Date(), updatedAt: new Date(), messages: [{id: 'msg-1', sender: 'TENANT', message: 'My receipt printer is not working.', timestamp: new Date()}] }
];

const budgets: Budget[] = [
    { id: 'budget-1', accountId: 'acct-cogs', amount: 10000, period: new Date().toISOString().slice(0, 7) }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [session, setSession] = useState<LocalSession | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    
    // Global App State
    const [productsState, setProductsState] = useState<Product[]>(products);
    const [salesState, setSalesState] = useState<Sale[]>(sales);
    const [branchesState, setBranchesState] = useState<Branch[]>(branches);
    const [staffState, setStaffState] = useState<Staff[]>(staff);
    const [staffRolesState, setStaffRolesState] = useState<StaffRole[]>(staffRoles);
    const [stockLogsState, setStockLogsState] = useState<StockLog[]>(stockLogs);
    const [tenantsState, setTenantsState] = useState<Tenant[]>(tenants);
    const [subscriptionPlansState, setSubscriptionPlansState] = useState<SubscriptionPlan[]>(subscriptionPlans);
    const [adminUsersState, setAdminUsersState] = useState<AdminUser[]>(adminUsers);
    const [adminRolesState, setAdminRolesState] = useState<AdminRole[]>(adminRoles);
    const [brandConfigState, setBrandConfigState] = useState<BrandConfig>(initialBrandConfig);
    const [pageContentState, setPageContentState] = useState<PageContent>(initialPageContent);
    const [blogPostsState, setBlogPostsState] = useState<BlogPost[]>(blogPosts);
    const [paymentSettingsState, setPaymentSettingsState] = useState<PaymentSettings>(initialPaymentSettings);
    const [notificationSettingsState, setNotificationSettingsState] = useState<NotificationSettings>(initialNotificationSettings);
    const [systemSettingsState, setSystemSettingsState] = useState<SystemSettings>(initialSystemSettings);
    const [trucksState, setTrucksState] = useState<Truck[]>(trucks);
    const [shipmentsState, setShipmentsState] = useState<Shipment[]>(shipments);
    const [trackerProvidersState, setTrackerProvidersState] = useState<TrackerProvider[]>(trackerProviders);
    const [suppliersState, setSuppliersState] = useState<Supplier[]>(suppliers);
    const [purchaseOrdersState, setPurchaseOrdersState] = useState<PurchaseOrder[]>(purchaseOrders);
    const [accountsState, setAccountsState] = useState<Account[]>(accounts);
    const [journalEntriesState, setJournalEntriesState] = useState<JournalEntry[]>(journalEntries);
    const [announcementsState, setAnnouncementsState] = useState<Announcement[]>(announcements);
    const [customersState, setCustomersState] = useState<Customer[]>(customers);
    const [consignmentsState, setConsignmentsState] = useState<Consignment[]>(consignments);
    const [categoriesState, setCategoriesState] = useState<Category[]>(categories);
    const [paymentTransactionsState, setPaymentTransactionsState] = useState<PaymentTransaction[]>(paymentTransactions);
    const [emailTemplatesState, setEmailTemplatesState] = useState<EmailTemplate[]>(emailTemplates);
    const [smsTemplatesState, setSmsTemplatesState] = useState<SmsTemplate[]>(smsTemplates);
    const [auditLogsState, setAuditLogsState] = useState<AuditLog[]>(auditLogs);
    const [depositsState, setDepositsState] = useState<Deposit[]>(deposits);
    const [creditPaymentsState, setCreditPaymentsState] = useState<CreditPayment[]>(initialCreditPayments);
    const [supportTicketsState, setSupportTicketsState] = useState<SupportTicket[]>(supportTickets);
    const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>([]);
    const [budgetsState, setBudgetsState] = useState<Budget[]>(budgets);

    const [currentStaffUser, setCurrentStaffUser] = useState<Staff | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    
    // Multi-tenancy State
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
    const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);
    const [impersonatedUser, setImpersonatedUser] = useState<Tenant | null>(null);
    const [notification, setNotification] = useState<NotificationType | null>(null);
    
    const [currentLanguage, setCurrentLanguage] = useState(systemSettingsState.defaultLanguage);
    const [currentCurrency, setCurrentCurrency] = useState(systemSettingsState.defaultCurrency);
    
    // This effect ensures the app's language and currency are in sync with the logged-in tenant's preferences.
    useEffect(() => {
        if (currentTenant) {
            setCurrentLanguage(currentTenant.language || systemSettingsState.defaultLanguage);
            setCurrentCurrency(currentTenant.currency || systemSettingsState.defaultCurrency);
        } else {
            // Reset to system defaults when no tenant is logged in (e.g., after logout)
            setCurrentLanguage(systemSettingsState.defaultLanguage);
            setCurrentCurrency(systemSettingsState.defaultCurrency);
        }
    }, [currentTenant, systemSettingsState.defaultLanguage, systemSettingsState.defaultCurrency]);

    const logAction = useCallback((action: string, details: string, user?: { id: string; name: string; type: 'STAFF' | 'TENANT' | 'SUPER_ADMIN' }) => {
        let logUser = {
            id: 'system',
            name: 'System',
            type: 'SUPER_ADMIN' as 'STAFF' | 'TENANT' | 'SUPER_ADMIN'
        };

        if(user) {
            logUser = user;
        } else if (currentAdminUser) {
            logUser = { id: currentAdminUser.id, name: currentAdminUser.name, type: 'SUPER_ADMIN' };
        } else if (currentTenant) {
            logUser = { id: currentTenant.id, name: currentTenant.ownerName, type: 'TENANT' };
        } else if (session?.profile) {
            // Fallback for user identified by session but not yet loaded into state
            logUser = { id: session.profile.id, name: session.user.email, type: session.profile.is_super_admin ? 'SUPER_ADMIN' : 'TENANT' };
        }
        
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            userId: logUser.id,
            userName: logUser.name,
            userType: logUser.type,
            tenantId: currentTenant?.id,
            action,
            details
        };
        setAuditLogsState(prev => [newLog, ...prev]);
    }, [currentAdminUser, currentTenant, session]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
    
     // Simulate loading initial data
    useEffect(() => {
        const loadData = () => {
             // In a real app, this would be an API call.
             // Here we just use the initial data.
            setIsLoading(false);
        };
        loadData();
    }, []);
    
    // Simulate auth state change
    useEffect(() => {
        const sessionData = localStorage.getItem('flowpay_session');
        if (sessionData) {
            const parsed = JSON.parse(sessionData) as LocalSession;
            setSession(parsed);
            setProfile(parsed.profile);
             if (parsed.profile.is_super_admin) {
                const admin = adminUsersState.find(u => u.email === parsed.user.email);
                setCurrentAdminUser(admin || null);
                setCurrentTenant(null); // Super admin is not a tenant
            } else if (parsed.profile.tenant_id) {
                const tenant = tenantsState.find(t => t.id === parsed.profile.tenant_id);
                const staff = staffState.find(s => s.id === parsed.user.id);
                setCurrentTenant(tenant || null);
                setCurrentStaffUser(staff || null);
                setCurrentAdminUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
        // This is a mock login function for demo purposes.
        const superAdmin = adminUsersState.find(u => u.username === username);
        const tenantUser = tenantsState.find(t => t.username === username);
        const staffUser = staffState.find(s => s.username === username);

        if (password !== '12345') {
            return { success: false, message: 'Invalid username or password.' };
        }

        let user: { id: string, email: string } | null = null;
        let profileData: Profile | null = null;
        
        if (superAdmin) {
            user = { id: superAdmin.id, email: superAdmin.email };
            profileData = { id: superAdmin.id, is_super_admin: true, tenant_id: null };
            setCurrentAdminUser(superAdmin);
            setCurrentTenant(null);
            setCurrentStaffUser(null);
        } else if (tenantUser) {
            if (!tenantUser.isVerified) {
                return { success: false, message: 'Account not verified. Please check your email.' };
            }
            user = { id: tenantUser.id, email: tenantUser.email };
            profileData = { id: tenantUser.id, is_super_admin: false, tenant_id: tenantUser.id };
            setCurrentTenant(tenantUser);
            setCurrentAdminUser(null);
            setCurrentStaffUser(null);
        } else if (staffUser) {
            // For this demo, all staff belong to the first tenant.
            const tenant = tenantsState[0];
            if (!tenant) return { success: false, message: 'No tenant configured for staff login.' };

            user = { id: staffUser.id, email: staffUser.email };
            profileData = { id: staffUser.id, is_super_admin: false, tenant_id: tenant.id };
            setCurrentTenant(tenant);
            setCurrentStaffUser(staffUser);
            setCurrentAdminUser(null);
        } else {
             return { success: false, message: 'Invalid username or password.' };
        }
        
        if (user && profileData) {
            const sessionData: LocalSession = { user, profile: profileData };
            localStorage.setItem('flowpay_session', JSON.stringify(sessionData));
            setSession(sessionData);
            setProfile(profileData);
            return { success: true, message: 'Logged in successfully.' };
        }

        return { success: false, message: 'An unexpected error occurred.' };
    };
    
    const logout = () => {
        localStorage.removeItem('flowpay_session');
        setSession(null);
        setProfile(null);
        setCurrentAdminUser(null);
        setCurrentTenant(null);
        setImpersonatedUser(null);
        setCurrentStaffUser(null);
    };

    const handleImpersonate = (tenant: Tenant) => {
        setImpersonatedUser(tenant);
        setCurrentTenant(tenant); // Set current tenant context for the app
    };
    
    const stopImpersonating = () => {
        setImpersonatedUser(null);
        setCurrentTenant(null); // Clear tenant context
    };
    
    const activateSubscription = useCallback((tenantId: string, planId: string, billingCycle: 'monthly' | 'yearly') => {
        setTenantsState(prev => prev.map(t => t.id === tenantId ? { ...t, status: 'ACTIVE', planId, billingCycle, trialEndDate: undefined } : t));
    }, []);

    const getMetric = (metric: 'totalRevenue' | 'salesVolume' | 'newCustomers' | 'activeBranches') => {
        switch (metric) {
            case 'totalRevenue': return salesState.reduce((sum, sale) => sum + sale.total, 0);
            case 'salesVolume': return salesState.length;
            case 'newCustomers': return customersState.length - 1; // Exclude walk-in
            case 'activeBranches': return branchesState.length;
            default: return 0;
        }
    };
    
    const updateDeposit = useCallback((depositId: string, updates: Partial<Pick<Deposit, 'status' | 'notes' | 'appliedSaleId'>>) => {
        setDepositsState(prev => prev.map(d => d.id === depositId ? { ...d, ...updates } : d));
    }, []);

    const formatCurrency = (value: number) => {
        const currencyInfo = systemSettingsState.currencies.find(c => c.code === currentCurrency);
        const symbol = currencyInfo ? currencyInfo.symbol : '$';
        return `${symbol}${value.toFixed(2)}`;
    };
    
    const adjustStock = (productId: string, variantId: string, branchId: string, quantityChange: number, reason: string) => {
        let productName = '';
        let variantName = '';
        let action: StockLogAction = 'ADJUSTMENT';

        if (reason === 'Sale') action = 'SALE';
        else if (reason === 'Return') action = 'RETURN';
        else if (reason.startsWith('Received from PO')) action = 'PURCHASE_RECEIVED';

        setProductsState(prev => prev.map(p => {
            if (p.id === productId) {
                productName = p.name;
                return {
                    ...p,
                    variants: p.variants.map(v => {
                        if (v.id === variantId) {
                            variantName = v.name;
                            const oldStock = v.stockByBranch[branchId] || 0;
                            const newStock = oldStock + quantityChange;
                            return { ...v, stockByBranch: { ...v.stockByBranch, [branchId]: newStock } };
                        }
                        return v;
                    })
                };
            }
            return p;
        }));
        
        const newLog: StockLog = {
            id: `log-${Date.now()}`,
            date: new Date(),
            productId, variantId, productName, variantName,
            action,
            quantity: quantityChange,
            branchId,
            reason,
        };
        setStockLogsState(prev => [newLog, ...prev]);
    };

    const addSale = async (saleData: Omit<Sale, 'id' | 'date' | 'status' | 'amountDue'>): Promise<{success: boolean, message: string, newSale?: Sale}> => {
        const { items, total, payments, customerId } = saleData;

        // Stock validation
        for (const item of items) {
            if (item.quantity > 0) { // Only check for sales, not returns
                const product = productsState.find(p => p.id === item.productId);
                const variant = product?.variants.find(v => v.id === item.variantId);
                if (!variant) return { success: false, message: `Product variant for ${item.name} not found.` };

                const totalStock = (variant.stockByBranch[saleData.branchId] || 0) + (variant.consignmentStockByBranch?.[saleData.branchId] || 0);
                if (item.quantity > totalStock) {
                    return { success: false, message: `Not enough stock for ${item.name} (${item.variantName}). Available: ${totalStock}, Requested: ${item.quantity}.` };
                }
            }
        }
        
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const amountDue = total - totalPaid;
        const status: Sale['status'] = amountDue <= 0 ? 'PAID' : (totalPaid > 0 ? 'PARTIALLY_PAID' : 'UNPAID');

        if(customerId !== 'cust-walkin' && amountDue > 0) {
            setCustomersState(prev => prev.map(c => c.id === customerId ? { ...c, creditBalance: c.creditBalance + amountDue } : c));
        }

        // Apply deposit if used
        const depositPayment = payments.find(p => p.method === 'Deposit');
        if (depositPayment && customerId !== 'cust-walkin') {
            let amountToApply = depositPayment.amount;
            const customerDeposits = depositsState.filter(d => d.customerId === customerId && d.status === 'ACTIVE').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            for (const deposit of customerDeposits) {
                if(amountToApply <= 0) break;
                const appliedAmount = Math.min(deposit.amount, amountToApply);
                // In a real app, you would probably want to split deposits or mark them as partially used. Here we simplify.
                if (appliedAmount >= deposit.amount) {
                    updateDeposit(deposit.id, { status: 'APPLIED' });
                }
                amountToApply -= appliedAmount;
            }
        }

        const newSale: Sale = {
            id: `sale-${Date.now()}`,
            date: new Date(),
            ...saleData,
            status,
            amountDue,
        };

        setSalesState(prev => [newSale, ...prev]);
        
        // Update stock and logs
        newSale.items.forEach(item => {
            adjustStock(item.productId, item.variantId, newSale.branchId, item.quantity, item.quantity < 0 ? 'Return' : 'Sale');
        });

        logAction('CREATED_SALE', `Created sale #${newSale.id} for ${formatCurrency(newSale.total)}`, {id: newSale.staffId, name: 'Staff User', type: 'STAFF'});
        
        return { success: true, message: 'Sale completed successfully!', newSale };
    };
    
    const updateTenant = (tenantId: string, tenantData: Partial<Tenant>) => {
        setTenantsState(prev => prev.map(t => t.id === tenantId ? { ...t, ...tenantData } : t));
    };

    const updateCurrentTenantSettings = (newSettings: Partial<Pick<Tenant, 'currency' | 'language' | 'logoutTimeout' | 'timezone'>>) => {
        if (currentTenant) {
            const updatedTenant = { ...currentTenant, ...newSettings };
            updateTenant(currentTenant.id, newSettings);
            setCurrentTenant(updatedTenant);
            logAction('UPDATED_TENANT_SETTINGS', `Updated settings: ${Object.keys(newSettings).join(', ')}`);
            // Note: In a real app, this should also update the session/profile data in the backend/localStorage.
        }
    };

    const updateAdminUser = (userId: string, userData: Partial<AdminUser>) => {
        setAdminUsersState(prev => prev.map(u => u.id === userId ? { ...u, ...userData } : u));
    };
    
    const updateShipmentStatus = useCallback((shipmentId: string, status: Shipment['status']) => setShipmentsState(prev => prev.map(s => s.id === shipmentId ? { ...s, status } : s)), []);

    const updateBudget = useCallback((accountId: string, amount: number, period: string) => {
        setBudgetsState(prev => {
            const existingBudgetIndex = prev.findIndex(b => b.accountId === accountId && b.period === period);
            if (existingBudgetIndex > -1) {
                const newBudgets = [...prev];
                newBudgets[existingBudgetIndex] = { ...newBudgets[existingBudgetIndex], amount };
                return newBudgets;
            } else {
                const newBudget: Budget = { id: `budget-${Date.now()}`, accountId, amount, period };
                return [...prev, newBudget];
            }
        });
        setNotification({ type: 'success', message: 'Budget saved successfully!' });
    }, [setNotification]);

    const deleteBudget = useCallback((accountId: string, period: string) => {
        setBudgetsState(prev => {
            const initialLength = prev.length;
            const newBudgets = prev.filter(b => !(b.accountId === accountId && b.period === period));
            if (newBudgets.length < initialLength) {
                setNotification({ type: 'success', message: 'Budget removed successfully!' });
            }
            return newBudgets;
        });
    }, [setNotification]);

    const addTenantEmailTemplate = useCallback((templateData: Omit<EmailTemplate, 'id' | 'tenantId'>) => {
        if (!currentTenant) return;
        const newTemplate: EmailTemplate = { ...templateData, id: `tmpl-email-${Date.now()}`, tenantId: currentTenant.id };
        setEmailTemplatesState(prev => [...prev, newTemplate]);
    }, [currentTenant]);

    const updateTenantEmailTemplate = useCallback((templateId: string, updates: Partial<Omit<EmailTemplate, 'id' | 'tenantId'>>) => {
        setEmailTemplatesState(prev => prev.map(t => (t.id === templateId && t.tenantId === currentTenant?.id) ? { ...t, ...updates } : t));
    }, [currentTenant]);

    const deleteTenantEmailTemplate = useCallback((templateId: string) => {
        setEmailTemplatesState(prev => prev.filter(t => !(t.id === templateId && t.tenantId === currentTenant?.id)));
    }, [currentTenant]);

    const addTenantSmsTemplate = useCallback((templateData: Omit<SmsTemplate, 'id' | 'tenantId'>) => {
        if (!currentTenant) return;
        const newTemplate: SmsTemplate = { ...templateData, id: `tmpl-sms-${Date.now()}`, tenantId: currentTenant.id };
        setSmsTemplatesState(prev => [...prev, newTemplate]);
    }, [currentTenant]);

    const updateTenantSmsTemplate = useCallback((templateId: string, updates: Partial<Omit<SmsTemplate, 'id' | 'tenantId'>>) => {
        setSmsTemplatesState(prev => prev.map(t => (t.id === templateId && t.tenantId === currentTenant?.id) ? { ...t, ...updates } : t));
    }, [currentTenant]);

    const deleteTenantSmsTemplate = useCallback((templateId: string) => {
        setSmsTemplatesState(prev => prev.filter(t => !(t.id === templateId && t.tenantId === currentTenant?.id)));
    }, [currentTenant]);

    const sendBulkMessage = useCallback(async (type: 'email' | 'sms', customerIds: string[], message: string, subject?: string): Promise<{ success: boolean; message: string }> => {
        // This is a simulation.
        await new Promise(resolve => setTimeout(resolve, 1000));
        const messageType = type === 'email' ? 'Email' : 'SMS';
        const logDetails = `${messageType} sent to ${customerIds.length} customers. Subject: ${subject || 'N/A'}`;
        logAction(`SENT_BULK_${type.toUpperCase()}`, logDetails);
        return { success: true, message: `${messageType} sent to ${customerIds.length} customers successfully.` };
    }, [logAction]);
    
    const sendBulkMessageToTenants = useCallback(async (type: 'email' | 'sms', tenantIds: string[], message: string, subject?: string): Promise<{ success: boolean; message: string }> => {
        // This is a simulation for super admin.
        await new Promise(resolve => setTimeout(resolve, 1000));
        const messageType = type === 'email' ? 'Email' : 'SMS';
        const logDetails = `Sent bulk ${messageType} to ${tenantIds.length} tenants. Subject: ${subject || 'N/A'}`;
        logAction(`SENT_BULK_${type.toUpperCase()}_TO_TENANTS`, logDetails);
        return { success: true, message: `${messageType} sent to ${tenantIds.length} tenants successfully.` };
    }, [logAction]);

    const recordCreditPayment = useCallback((customerId: string, amount: number, staffId: string) => {
        setCustomersState(prev => prev.map(c => c.id === customerId ? { ...c, creditBalance: Math.max(0, c.creditBalance - amount) } : c));
        const newPayment: CreditPayment = {
            id: `cp-${Date.now()}`,
            customerId,
            amount,
            date: new Date(),
            recordedByStaffId: staffId,
        };
        setCreditPaymentsState(prev => [newPayment, ...prev]);
        logAction('CREDIT_PAYMENT_RECORDED', `Recorded payment of ${formatCurrency(amount)} for customer ${customerId}`);
    }, [logAction, formatCurrency]);

    const updateUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            console.log("Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const location = { lat: latitude, lng: longitude, timestamp: new Date() };

            if (profile?.is_super_admin && currentAdminUser) {
                // Super admins location is not tracked on the map for others to see.
                return;
            } else if (profile?.tenant_id) {
                if (impersonatedUser) { // If admin is impersonating, don't update location
                    return;
                }
                
                // Is it a tenant admin or a staff member?
                const isTenantAdmin = currentTenant && !currentStaffUser;
                const isStaff = currentTenant && currentStaffUser;

                if (isTenantAdmin) {
                     setTenantsState(prev => prev.map(t => t.id === currentTenant.id ? { ...t, lastKnownLocation: location } : t));
                } else if (isStaff) {
                     setStaffState(prev => prev.map(s => s.id === currentStaffUser.id ? { ...s, lastKnownLocation: location } : s));
                }
            }
        }, () => {
            console.log("Unable to retrieve your location.");
        });
    }, [profile, currentTenant, currentStaffUser, currentAdminUser, impersonatedUser]);

    // Most functions are defined via useCallback to maintain reference equality
    const memoizedSetters = {
        // ... other setters
        updateBrandConfig: useCallback((newConfig: Partial<BrandConfig>) => setBrandConfigState(prev => ({...prev, ...newConfig})), []),
        updatePageContent: useCallback((newPageContent: Partial<PageContent>) => setPageContentState(prev => ({...prev, ...newPageContent})), []),
        updateFaqs: useCallback((newFaqs: FaqItem[]) => setPageContentState(prev => ({...prev, faqs: newFaqs})), []),
        updatePaymentSettings: useCallback((newSettings: PaymentSettings) => setPaymentSettingsState(newSettings), []),
        updateNotificationSettings: useCallback((newSettings: NotificationSettings) => setNotificationSettingsState(newSettings), []),
        updateSystemSettings: useCallback((newSettings: Partial<SystemSettings>) => setSystemSettingsState(prev => ({...prev, ...newSettings})), []),
        updateMaintenanceSettings: useCallback((settings: MaintenanceSettings) => setSystemSettingsState(prev => ({...prev, maintenanceSettings: settings})), []),
        updateAccessControlSettings: useCallback((settings: AccessControlSettings) => setSystemSettingsState(prev => ({...prev, accessControlSettings: settings})), []),
        updateLandingPageMetrics: useCallback((metrics: LandingPageMetrics) => setSystemSettingsState(prev => ({...prev, landingPageMetrics: metrics})), []),
        updateTenantLogisticsConfig: useCallback((config) => {
             if (currentTenant) {
                const newConfig = { ...currentTenant.logisticsConfig, ...config };
                updateTenant(currentTenant.id, { logisticsConfig: newConfig });
                setCurrentTenant(prev => prev ? ({ ...prev, logisticsConfig: newConfig }) : null);
             }
        }, [currentTenant]),
        updateTenantAutomations: useCallback((newAutomations: Partial<Tenant['automations']>) => {
            if (currentTenant) {
                const updatedAutomations = { ...currentTenant.automations, ...newAutomations };
                updateTenant(currentTenant.id, { automations: updatedAutomations });
                setCurrentTenant(prev => prev ? ({ ...prev, automations: updatedAutomations }) : null);
            }
        }, [currentTenant]),
        addSubscriptionPlan: useCallback((planData: Omit<SubscriptionPlan, 'id'>) => setSubscriptionPlansState(prev => [...prev, { ...planData, id: `plan-${Date.now()}` }]), []),
        updateSubscriptionPlan: useCallback((planId: string, planData: Partial<SubscriptionPlan>) => setSubscriptionPlansState(prev => prev.map(p => p.id === planId ? { ...p, ...planData } : p)), []),
        deleteSubscriptionPlan: useCallback((planId: string) => setSubscriptionPlansState(prev => prev.filter(p => p.id !== planId)), []),
        addTruck: useCallback((truckData: Omit<Truck, 'id' | 'lastUpdate'>) => setTrucksState(prev => [...prev, { ...truckData, id: `truck-${Date.now()}`, lastUpdate: new Date() }]), []),
        updateTruck: useCallback((truckId: string, truckData: Partial<Truck>) => setTrucksState(prev => prev.map(t => t.id === truckId ? { ...t, ...truckData, lastUpdate: new Date() } : t)), []),
        deleteTruck: useCallback((truckId: string) => setTrucksState(prev => prev.filter(t => t.id !== truckId)), []),
        updateTruckVitals: useCallback((truckId: string) => {
            setTrucksState(prev => prev.map(t => t.id === truckId ? { ...t, currentLocation: { ...t.currentLocation, lat: t.currentLocation.lat + 0.01 }, lastUpdate: new Date() } : t));
        }, []),
        addShipment: useCallback((shipmentData: Omit<Shipment, 'id'>) => setShipmentsState(prev => [...prev, { ...shipmentData, id: `ship-${Date.now()}` }]), []),
        updateShipmentStatus,
        updateTrackerProviders: useCallback((providers: TrackerProvider[]) => setTrackerProvidersState(providers), []),
        addBranch: useCallback((branchName: string) => setBranchesState(prev => [...prev, { id: `branch-${Date.now()}`, name: branchName, location: { lat: 0, lng: 0 } }]), []),
        updateBranchLocation: useCallback((branchId: string, location: { lat: number, lng: number }) => setBranchesState(prev => prev.map(b => b.id === branchId ? { ...b, location } : b)), []),
        addStaff: useCallback((staffData: Omit<Staff, 'id'>) => setStaffState(prev => [...prev, { ...staffData, id: `staff-${Date.now()}` }]), []),
        deleteStaff: useCallback((staffId: string) => setStaffState(prev => prev.filter(s => s.id !== staffId)), []),
        sellShipment: useCallback(async (shipmentId: string, customer: Pick<Customer, 'name' | 'phone'>) => {
            const shipment = shipmentsState.find(s => s.id === shipmentId);
            if (!shipment) return { success: false, message: 'Shipment not found' };

            const newCustomer: Customer = { id: `cust-${Date.now()}`, name: customer.name, phone: customer.phone, creditBalance: 0 };
            setCustomersState(prev => [...prev, newCustomer]);
            
            const saleTotal = shipment.items.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
            
            const saleResult = await addSale({
                items: shipment.items.map(i => {
                    const product = productsState.find(p => p.id === i.productId);
                    const variant = product?.variants.find(v => v.id === i.variantId);
                    return {
                        productId: i.productId,
                        variantId: i.variantId,
                        name: product?.name || 'N/A',
                        variantName: variant?.name || 'N/A',
                        quantity: i.quantity,
                        sellingPrice: i.sellingPrice,
                        costPrice: 0, // In-transit sales may not have accurate cost price at point of sale
                    };
                }),
                total: saleTotal,
                branchId: shipment.destination,
                customerId: newCustomer.id,
                payments: [{method: 'Direct Sale', amount: saleTotal}],
                change: 0,
                staffId: 'staff-1', // Assuming an admin action
                discount: 0
            });
            
            if (saleResult.success) {
                updateShipmentStatus(shipmentId, 'SOLD_IN_TRANSIT');
                return { success: true, message: 'Shipment sold successfully' };
            }
            return { success: false, message: saleResult.message };
        }, [shipmentsState, productsState]),
        receiveShipment: useCallback((shipmentId: string) => {
            const shipment = shipmentsState.find(s => s.id === shipmentId);
            if (!shipment) return;
            shipment.items.forEach(item => {
                adjustStock(item.productId, item.variantId, shipment.destination, item.quantity, `Received from Shipment ${shipment.shipmentCode}`);
            });
            updateShipmentStatus(shipmentId, 'DELIVERED');
        }, [shipmentsState]),
        addPurchaseOrder: useCallback((poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'total' | 'createdAt'>) => {
            const total = poData.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
            const newPO: PurchaseOrder = {
                ...poData,
                id: `po-${Date.now()}`,
                poNumber: `PO-${new Date().getFullYear()}-${purchaseOrdersState.length + 1}`,
                total,
                createdAt: new Date(),
            };
            setPurchaseOrdersState(prev => [newPO, ...prev]);
        }, [purchaseOrdersState.length]),
        updatePurchaseOrderStatus: useCallback((poId: string, status: PurchaseOrder['status']) => {
            setPurchaseOrdersState(prev => prev.map(po => {
                if (po.id === poId) {
                    if (status === 'RECEIVED') {
                        po.items.forEach(item => {
                             adjustStock(products.find(p => p.variants.some(v => v.id === item.variantId))!.id, item.variantId, po.destinationBranchId, item.quantity, `Received from PO ${po.poNumber}`);
                        });
                    }
                    return { ...po, status };
                }
                return po;
            }));
        }, [products]),
        addStaffRole: useCallback((roleData: Omit<StaffRole, 'id'>) => setStaffRolesState(prev => [...prev, { ...roleData, id: `role-${Date.now()}` }]), []),
        updateStaffRole: useCallback((roleId: string, permissions: TenantPermission[]) => setStaffRolesState(prev => prev.map(r => r.id === roleId ? { ...r, permissions } : r)), []),
        deleteStaffRole: useCallback((roleId: string) => setStaffRolesState(prev => prev.filter(r => r.id !== roleId)), []),
        addAccount: useCallback((accountData: Omit<Account, 'id' | 'balance'>) => setAccountsState(prev => [...prev, { ...accountData, id: `acct-${Date.now()}`, balance: 0 }]), []),
        addJournalEntry: useCallback((entryData: Omit<JournalEntry, 'id' | 'date'>) => {
            const newEntry: JournalEntry = { ...entryData, id: `je-${Date.now()}`, date: new Date() };
            setJournalEntriesState(prev => [newEntry, ...prev]);
            setAccountsState(prev => {
                const newAccounts = [...prev];
                newEntry.transactions.forEach(tx => {
                    const accountIndex = newAccounts.findIndex(a => a.id === tx.accountId);
                    if (accountIndex !== -1) {
                        newAccounts[accountIndex].balance += tx.amount;
                    }
                });
                return newAccounts;
            });
        }, []),
        addTenant: useCallback(async (tenantData: Omit<Tenant, 'id' | 'joinDate' | 'status' | 'trialEndDate' | 'isVerified' | 'billingCycle' | 'lastLoginIp' | 'lastLoginDate'>, logoBase64: string): Promise<{ success: boolean; message: string }> => {
            const newTenant: Tenant = {
                ...tenantData,
                id: `tenant-${Date.now()}`,
                joinDate: new Date(),
                status: 'UNVERIFIED',
                trialEndDate: new Date(new Date().setDate(new Date().getDate() + 14)),
                isVerified: false,
                billingCycle: 'monthly',
                companyLogoUrl: logoBase64, // Use the base64 string directly
                currency: systemSettingsState.defaultCurrency,
                language: systemSettingsState.defaultLanguage,
            };
            setTenantsState(prev => [...prev, newTenant]);
            return { success: true, message: 'Tenant created successfully. Please verify email.' };
        }, [systemSettingsState]),
        verifyTenant: useCallback((email: string) => {
            setTenantsState(prev => prev.map(t => t.email === email ? { ...t, isVerified: true, status: 'TRIAL' } : t));
        }, []),
        updateTenantProfile: useCallback((tenantData: Partial<Tenant>) => {
            if (currentTenant) {
                updateTenant(currentTenant.id, tenantData);
                setCurrentTenant(prev => prev ? { ...prev, ...tenantData } : null);
            }
        }, [currentTenant]),
        updateAdminProfile: useCallback((adminData: Partial<AdminUser>) => {
            if (currentAdminUser) {
                updateAdminUser(currentAdminUser.id, adminData);
                setCurrentAdminUser(prev => prev ? { ...prev, ...adminData } : null);
            }
        }, [currentAdminUser]),
        addAnnouncement: useCallback((announcementData: Omit<Announcement, 'id' | 'createdAt' | 'readBy'>) => {
            const newAnno: Announcement = { ...announcementData, id: `anno-${Date.now()}`, createdAt: new Date(), readBy: [] };
            setAnnouncementsState(prev => [newAnno, ...prev]);
        }, []),
        markAnnouncementAsRead: useCallback((announcementId: string, userId: string) => {
            setAnnouncementsState(prev => prev.map(a => a.id === announcementId ? { ...a, readBy: [...a.readBy, userId] } : a));
        }, []),
        addCustomer: useCallback((customerData: Omit<Customer, 'id' | 'creditBalance'>) => setCustomersState(prev => [...prev, { ...customerData, id: `cust-${Date.now()}`, creditBalance: 0 }]), []),
        deleteCustomer: useCallback((customerId: string) => setCustomersState(prev => prev.filter(c => c.id !== customerId)), []),
        recordCreditPayment,
        addDeposit: useCallback(async (depositData: Omit<Deposit, 'id' | 'date' | 'status'>): Promise<{success: boolean, message: string}> => {
            const newDeposit: Deposit = { ...depositData, id: `dep-${Date.now()}`, date: new Date(), status: 'ACTIVE' };
            setDepositsState(prev => [newDeposit, ...prev]);
            return { success: true, message: 'Deposit recorded successfully!' };
        }, []),
        updateDeposit,
        addConsignment: useCallback((consignmentData: Omit<Consignment, 'id' | 'status'>) => {
            const newConsignment: Consignment = { ...consignmentData, id: `con-${Date.now()}`, status: 'ACTIVE' };
            setConsignmentsState(prev => [newConsignment, ...prev]);
        }, []),
        addCategory: useCallback((categoryName: string) => setCategoriesState(prev => [...prev, { id: `cat-${Date.now()}`, name: categoryName }]), []),
        updateCategory: useCallback((categoryId: string, newName: string) => setCategoriesState(prev => prev.map(c => c.id === categoryId ? { ...c, name: newName } : c)), []),
        deleteCategory: useCallback((categoryId: string) => setCategoriesState(prev => prev.filter(c => c.id !== categoryId)), []),
        extendTrial: useCallback((tenantId: string, days: number) => {
            setTenantsState(prev => prev.map(t => {
                if (t.id === tenantId && t.trialEndDate) {
                    const newEndDate = new Date(t.trialEndDate);
                    newEndDate.setDate(newEndDate.getDate() + days);
                    return { ...t, trialEndDate: newEndDate };
                }
                return t;
            }));
        }, []),
        changeSubscriptionPlan: useCallback((tenantId: string, newPlanId: string, billingCycle: 'monthly' | 'yearly') => {
             setTenantsState(prev => prev.map(t => t.id === tenantId ? { ...t, planId: newPlanId, billingCycle } : t));
        }, []),
        processExpiredTrials: useCallback(() => {
            let processed = 0;
            let suspended = 0;
            setTenantsState(prev => prev.map(t => {
                if (t.status === 'TRIAL' && t.trialEndDate && new Date(t.trialEndDate) < new Date()) {
                    processed++;
                    suspended++;
                    return { ...t, status: 'SUSPENDED' };
                }
                if (t.status === 'TRIAL') processed++;
                return t;
            }));
            return { processed, suspended };
        }, []),
        sendExpiryReminders: useCallback(() => {
            // This is a simulation. In a real app, it would trigger emails/notifications.
            let sent = 0;
            tenantsState.forEach(t => {
                if(t.status === 'TRIAL' && t.trialEndDate) {
                    const daysRemaining = (new Date(t.trialEndDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                    if (daysRemaining > 0 && daysRemaining <= 3) {
                        sent++;
                        // Create in-app notification
                        const newNotif: InAppNotification = { id: `notif-${Date.now()}-${t.id}`, userId: t.id, message: `Your free trial is ending in ${Math.ceil(daysRemaining)} days. Upgrade now to keep your access.`, read: false, createdAt: new Date() };
                        // In a real app, you would avoid direct state update in a non-setter function like this.
                        // For demo, we do it.
                        setInAppNotifications(prev => [newNotif, ...prev]);
                    }
                }
            });
            return { sent };
        }, [tenantsState]),
        processSubscriptionPayment: useCallback(async (tenantId: string, planId: string, method: string, amount: number, billingCycle: 'monthly' | 'yearly', success: boolean, proofOfPaymentUrl?: string) => {
            const newTransaction: PaymentTransaction = {
                id: `pt-${Date.now()}`, tenantId, planId, amount, method, status: 'PENDING', createdAt: new Date(), proofOfPaymentUrl
            };
            if(method !== 'Manual') {
                newTransaction.status = success ? 'COMPLETED' : 'FAILED';
            }
            setPaymentTransactionsState(prev => [newTransaction, ...prev]);
            
            const plan = subscriptionPlansState.find(p => p.id === planId);
            
            if (success && method !== 'Manual') {
                activateSubscription(tenantId, planId, billingCycle);
                return { success: true, message: `Payment successful! Your ${plan?.name || 'selected'} plan is now active.` };
            } else if (method === 'Manual') {
                 return { success: true, message: 'Your payment has been submitted for review. Your plan will be activated upon confirmation.' };
            } else {
                 return { success: false, message: 'Your payment could not be processed. Please try again or contact support.' };
            }
        }, [activateSubscription, subscriptionPlansState]),
        updatePaymentTransactionStatus: useCallback((transactionId: string, newStatus: 'COMPLETED' | 'REJECTED') => {
            setPaymentTransactionsState(prev => prev.map(tx => {
                if (tx.id === transactionId) {
                    if (newStatus === 'COMPLETED' && tx.status === 'PENDING') {
                        // Activate subscription for the tenant
                        const plan = subscriptionPlansState.find(p => p.id === tx.planId);
                        if (plan) {
                           activateSubscription(tx.tenantId, tx.planId, tx.amount === plan.price ? 'monthly' : 'yearly');
                        }
                    }
                    return { ...tx, status: newStatus };
                }
                return tx;
            }));
        }, [subscriptionPlansState, activateSubscription]),
        updateEmailTemplate: useCallback((templateId: string, newSubject: string, newBody: string) => setEmailTemplatesState(prev => prev.map(t => t.id === templateId ? {...t, subject: newSubject, body: newBody } : t)), []),
        updateSmsTemplate: useCallback((templateId: string, newBody: string) => setSmsTemplatesState(prev => prev.map(t => t.id === templateId ? {...t, body: newBody } : t)), []),
        markInAppNotificationAsRead: useCallback((notificationId: string) => setInAppNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n)), []),
        submitSupportTicket: useCallback((ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'status' | 'messages'> & { messages: Omit<TicketMessage, 'id'| 'timestamp'>[] }) => {
            if (!currentTenant) return;
            const newTicket: SupportTicket = {
                ...ticketData,
                id: `ticket-${Date.now()}`,
                tenantId: currentTenant.id,
                status: 'Open',
                createdAt: new Date(),
                updatedAt: new Date(),
                messages: ticketData.messages.map(m => ({...m, id: `msg-${Date.now()}`, timestamp: new Date()}))
            };
            setSupportTicketsState(prev => [newTicket, ...prev]);
        }, [currentTenant]),
        replyToSupportTicket: useCallback((ticketId: string, message: Omit<TicketMessage, 'id' | 'timestamp'>) => {
            setSupportTicketsState(prev => prev.map(t => t.id === ticketId ? { ...t, status: message.sender === 'ADMIN' ? 'In Progress' : 'Open', updatedAt: new Date(), messages: [...t.messages, { ...message, id: `msg-${Date.now()}`, timestamp: new Date() }] } : t));
        }, []),
        updateTicketStatus: useCallback((ticketId: string, status: SupportTicket['status']) => {
            setSupportTicketsState(prev => prev.map(t => t.id === ticketId ? { ...t, status, updatedAt: new Date() } : t));
        }, []),
        addBlogPost: useCallback((postData: Omit<BlogPost, 'id'|'createdAt'|'authorName'>) => {
            const author = adminUsers.find(u => u.id === postData.authorId);
            const newPost: BlogPost = { ...postData, id: `blog-${Date.now()}`, createdAt: new Date(), authorName: author?.name || 'Admin' };
            setBlogPostsState(prev => [newPost, ...prev]);
        }, [adminUsers]),
        updateBlogPost: useCallback((postId: string, postData: Partial<BlogPost>) => setBlogPostsState(prev => prev.map(p => p.id === postId ? { ...p, ...postData } : p)), []),
        deleteBlogPost: useCallback((postId: string) => setBlogPostsState(prev => prev.filter(p => p.id !== postId)), []),
        updateLastLogin: useCallback((email: string, ip: string) => {
            const now = new Date();
            setTenantsState(prev => prev.map(t => t.email === email ? { ...t, lastLoginDate: now, lastLoginIp: ip } : t));
            setAdminUsersState(prev => prev.map(u => u.email === email ? { ...u, lastLoginDate: now, lastLoginIp: ip } : u));
        }, []),
         generateInsights: useCallback(async () => {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            // In a real app, this would use the Gemini API. For this demo, we return a mock response.
            return `**Key Observations:**
            - **Top Seller:** The "Laptop (13-inch)" is your best-performing item, contributing significantly to revenue.
            - **Sales Trend:** There was a noticeable dip in sales 2 days ago.
            - **Customer Behavior:** Customer 'Alice Johnson' is a high-value customer, involved in multiple high-ticket purchases.
            
            **Recommendations:**
            - Consider running a promotion on keyboards to bundle with laptop sales.
            - Investigate the sales dip. Was it a weekend? A holiday?
            - Offer a loyalty discount to 'Alice Johnson' to encourage repeat business.`;
        }, []),
        addTenantEmailTemplate,
        updateTenantEmailTemplate,
        deleteTenantEmailTemplate,
        addTenantSmsTemplate,
        updateTenantSmsTemplate,
        deleteTenantSmsTemplate,
        sendBulkMessage,
        sendBulkMessageToTenants,
        updateUserLocation,
    };
    
    // Non-memoized setters
    const addProduct = (productData: Omit<Product, 'id' | 'isFavorite' | 'variants'> & { variants: Omit<ProductVariant, 'id'>[] }) => {
        const newProduct: Product = {
            ...productData,
            id: `prod-${Date.now()}`,
            isFavorite: false,
            variants: productData.variants.map(v => ({ ...v, id: `var-${Date.now()}-${Math.random()}`}))
        };
        setProductsState(prev => [...prev, newProduct]);
    };

    const updateProductVariant = (productId: string, variantId: string, variantData: Partial<Omit<ProductVariant, 'id' | 'stockByBranch'>>) => {
        setProductsState(prev => prev.map(p => {
            if (p.id === productId) {
                return {
                    ...p,
                    variants: p.variants.map(v => v.id === variantId ? { ...v, ...variantData } : v)
                };
            }
            return p;
        }));
    };
    
     const transferStock = (productId: string, variantId: string, fromBranchId: string, toBranchId: string, quantity: number) => {
        let productName = '';
        let variantName = '';
        setProductsState(prev => prev.map(p => {
            if(p.id === productId) {
                productName = p.name;
                return { ...p, variants: p.variants.map(v => {
                    if(v.id === variantId) {
                        variantName = v.name;
                        const fromStock = v.stockByBranch[fromBranchId] || 0;
                        const toStock = v.stockByBranch[toBranchId] || 0;
                        return { ...v, stockByBranch: { ...v.stockByBranch, [fromBranchId]: fromStock - quantity, [toBranchId]: toStock + quantity }};
                    }
                    return v;
                })};
            }
            return p;
        }));

        const newLog: StockLog = {
             id: `log-${Date.now()}`, date: new Date(), productId, variantId, productName, variantName,
             action: 'TRANSFER', quantity, fromBranchId, toBranchId
        };
        setStockLogsState(prev => [newLog, ...prev]);
    };

    const addAdminUser = (userData: Omit<AdminUser, 'id' | 'joinDate' | 'status' | 'lastLoginIp' | 'lastLoginDate'>) => {
        const newUser: AdminUser = { ...userData, id: `admin-${Date.now()}`, joinDate: new Date(), status: 'ACTIVE' };
        setAdminUsersState(prev => [...prev, newUser]);
    };
    
    const updateAdminRole = (roleId: string, permissions: Permission[]) => {
        setAdminRolesState(prev => prev.map(r => r.id === roleId ? { ...r, permissions } : r));
    };

    const addAdminRole = (roleData: Omit<AdminRole, 'id'>) => {
        const newRole: AdminRole = { ...roleData, id: `role-${Date.now()}` };
        setAdminRolesState(prev => [...prev, newRole]);
    };
    
    const deleteAdminRole = (roleId: string) => {
        setAdminRolesState(prev => prev.filter(r => r.id !== roleId));
    };

    const value: AppContextType = {
        products: productsState, sales: salesState, branches: branchesState, staff: staffState,
        staffRoles: staffRolesState, stockLogs: stockLogsState, tenants: tenantsState, subscriptionPlans: subscriptionPlansState,
        adminUsers: adminUsersState, adminRoles: adminRolesState, brandConfig: brandConfigState, pageContent: pageContentState,
        paymentSettings: paymentSettingsState, notificationSettings: notificationSettingsState, systemSettings: systemSettingsState,
        trucks: trucksState, shipments: shipmentsState, trackerProviders: trackerProvidersState, suppliers: suppliersState,
        purchaseOrders: purchaseOrdersState, accounts: accountsState, journalEntries: journalEntriesState,
        announcements: announcementsState, customers: customersState, consignments: consignmentsState,
        categories: categoriesState, paymentTransactions: paymentTransactionsState, emailTemplates: emailTemplatesState,
        smsTemplates: smsTemplatesState, auditLogs: auditLogsState, deposits: depositsState,
        creditPayments: creditPaymentsState,
        supportTickets: supportTicketsState,
        blogPosts: blogPostsState,
        inAppNotifications,
        budgets: budgetsState,
        currentTenant, currentAdminUser, impersonatedUser,
        notification, setNotification, logAction,
        searchTerm, setSearchTerm, theme, setTheme,
        currentLanguage, setCurrentLanguage, currentCurrency, setCurrentCurrency,
        getMetric, addSale, adjustStock, transferStock, addProduct, updateProductVariant,
        addAdminUser, updateAdminUser, updateAdminRole, addAdminRole, deleteAdminRole,
        session, setSession, profile, setProfile, isLoading, handleImpersonate, stopImpersonating, login, logout,
        allTenantPermissions, allPermissions, currentStaffUser, setCurrentStaffUser,
        activateSubscription,
        updateBudget, deleteBudget,
        updateTenant,
        updateCurrentTenantSettings,
        ...memoizedSetters,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext, AppContextProvider };