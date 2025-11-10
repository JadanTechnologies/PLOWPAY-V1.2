// FIX: Import React to provide type definitions for React.Dispatch and React.SetStateAction.
import React from 'react';

// FIX: The 'L' variable from Leaflet.js needs to be declared in the global scope for TypeScript to recognize it on the 'window' object across all files.
declare global {
  var L: any;
}

export interface Branch {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface StaffRole {
    id: string;
    name: string;
    permissions: TenantPermission[];
}

export type TenantPermission =
 | 'accessPOS'
 | 'manageInventory'
 | 'viewReports'
 | 'manageStaff'
 | 'accessSettings'
 | 'manageLogistics'
 | 'managePurchases'
 | 'accessAccounting'
 | 'viewAuditLogs'
 | 'makeDeposits'
 | 'manageDeposits'
 | 'accessReturns'
 | 'accessSupport'
 | 'manageTemplates'
 | 'sendCommunications';

export const allTenantPermissions: TenantPermission[] = [
    'accessPOS',
    'manageInventory',
    'viewReports',
    'manageStaff',
    'accessSettings',
    'manageLogistics',
    'managePurchases',
    'accessAccounting',
    'viewAuditLogs',
    'makeDeposits',
    'manageDeposits',
    'accessReturns',
    'accessSupport',
    'manageTemplates',
    'sendCommunications',
];


export interface Staff {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  roleId: string;
  branchId: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., 'Large', 'Red'
  sku: string;
  sellingPrice: number;
  costPrice: number;
  stockByBranch: { [branchId: string]: number }; // Owned stock
  consignmentStockByBranch?: { [branchId: string]: number }; // Consignment stock
  reorderPointByBranch?: { [branchId: string]: number }; // Reorder point
  batchNumber?: string;
  expiryDate?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id:string;
  name: string;
  categoryId: string;
  variants: ProductVariant[];
  isFavorite?: boolean;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface Payment {
  method: string;
  amount: number;
}

export interface Customer {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    creditBalance: number;
    creditLimit?: number;
}

export interface Sale {
  id: string;
  date: Date;
  items: CartItem[];
  total: number;
  branchId: string;
  customerId: string;
  payments: Payment[];
  change: number;
  staffId: string;
  discount?: number;
  status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';
  amountDue: number;
}

export type StockLogAction = 'ADJUSTMENT' | 'TRANSFER' | 'SALE' | 'PURCHASE_RECEIVED' | 'CONSIGNMENT_IN' | 'RETURN';


export interface StockLog {
  id: string;
  date: Date;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  action: StockLogAction;
  quantity: number; // For adjustments, this is the change (+/-). For transfers, the amount moved.
  fromBranchId?: string; // For transfers
  toBranchId?: string; // For transfers
  branchId?: string; // For adjustments
  reason?: string; // For adjustments
  referenceId?: string; // e.g., saleId or purchaseOrderId
}

export interface Truck {
  id: string;
  licensePlate: string;
  driverName: string;
  status: 'IDLE' | 'IN_TRANSIT' | 'MAINTENANCE';
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  lastUpdate: Date;
  currentLoad: number; // in kg
  maxLoad: number; // in kg
  tenantId: string;
}

export interface Shipment {
  id: string;
  shipmentCode: string;
  origin: string;
  destination: string;
  truckId: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'SOLD_IN_TRANSIT';
  items: {
    productId: string;
    variantId: string;
    productName: string;
    quantity: number;
    sellingPrice: number;
  }[];
  estimatedDelivery: Date;
}

export interface TrackerProvider {
    id: string;
    name: string;
    apiKey: string;
    apiEndpoint: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // per month
  priceYearly: number;
  features: string[];
  description: string;
  recommended: boolean;
}

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'UNVERIFIED';

export interface TenantAutomations {
  generateEODReport: boolean;
  sendLowStockAlerts: boolean;
  sendCreditLimitAlerts: boolean;
}

export interface Tenant {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  username: string;
  password?: string;
  companyAddress?: string;
  country?: string;
  state?: string;
  phoneCountryCode?: string;
  companyPhone?: string;
  companyLogoUrl?: string;
  status: TenantStatus;
  planId: string;
  joinDate: Date;
  trialEndDate?: Date;
  currency?: string; // e.g. 'USD', 'NGN'
  language?: string; // e.g. 'en', 'es'
  timezone?: string;
  automations?: TenantAutomations;
  isVerified: boolean;
  billingCycle: 'monthly' | 'yearly';
  logoutTimeout?: number; // in minutes
  logisticsConfig?: {
    activeTrackerProviderId: string;
  };
  lastLoginIp?: string;
  lastLoginDate?: Date;
}

export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED';

export type Permission = 
  | 'viewPlatformDashboard'
  | 'manageTenants'
  | 'manageSubscriptions'
  | 'manageTeam'
  | 'manageRoles'
  | 'manageSystemSettings'
  | 'managePaymentGateways'
  | 'manageNotificationSettings'
  | 'manageAnnouncements'
  | 'viewAuditLogs'
  | 'manageSupport'
  | 'manageBlog';

// FIX: Export `allPermissions` array for use in other files.
export const allPermissions: Permission[] = [
  'viewPlatformDashboard',
  'manageTenants',
  'manageSubscriptions',
  'manageTeam',
  'manageRoles',
  'manageSystemSettings',
  'managePaymentGateways',
  'manageNotificationSettings',
  'manageAnnouncements',
  'viewAuditLogs',
  'manageSupport',
  'manageBlog',
];

export interface AdminRole {
    id: string;
    name: string;
    permissions: Permission[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  roleId: string;
  status: AdminUserStatus;
  joinDate: Date;
  avatarUrl?: string;
  lastLoginIp?: string;
  lastLoginDate?: Date;
  phone?: string;
}

export interface BrandConfig {
    name: string;
    logoUrl: string;
    faviconUrl: string;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface PageContent {
    about: string;
    contact: string;
    terms: string;
    privacy: string;
    refund: string;
    faqs: FaqItem[];
    helpCenter: string;
    apiDocs: string;
    blog: string;
}

export interface PaymentSettings {
    stripe: { enabled: boolean; publicKey: string; secretKey: string; };
    flutterwave: { enabled: boolean; publicKey: string; secretKey: string; };
    paystack: { enabled: boolean; publicKey: string; secretKey: string; };
    manual: { enabled: boolean; details: string; };
}

export interface NotificationSettings {
    email: { provider: 'resend' | 'smtp'; resend: { apiKey: string }; smtp: { host: number, port: number, user: string, pass: string }};
    sms: { twilio: { enabled: boolean; accountSid: string; apiKey: string; fromNumber: string }};
    push: { firebase: { enabled: boolean, serverKey: string, vapidKey: string }, oneSignal: { enabled: boolean, appId: string, apiKey: string }};
}

export interface Currency { code: string; name: string; symbol: string; enabled: boolean; }
export interface Language { code: string; name: string; enabled: boolean; }
export interface LandingPageMetrics {
    businesses: { value: number; label: string; };
    users: { value: number; label: string; };
    revenue: { value: number; label: string; };
}
export interface FeaturedUpdateSettings {
    isActive: boolean;
    title: string;
    content: string;
    link?: string;
    linkText?: string;
}

export interface MapProvider { id: string; name: string; apiKey: string; }
export interface IpGeolocationProvider { id: string; name: string; apiKey: string; apiEndpoint: string; }
export interface AISettings { provider: 'gemini' | 'openai'; gemini: { apiKey: string; }; openai: { apiKey: string; }; }
export interface SupabaseSettings { projectUrl: string; anonKey: string; }
export interface MaintenanceSettings { isActive: boolean; message: string; }
export interface AccessControlSettings {
    mode: 'ALLOW_ALL' | 'BLOCK_LISTED' | 'ALLOW_LISTED';
    ipWhitelist: string[];
    ipBlacklist: string[];
    countryWhitelist: string[];
    countryBlacklist: string[];
    regionWhitelist: string[];
    regionBlacklist: string[];
    browserWhitelist: string[];
    browserBlacklist: string[];
    deviceWhitelist: ('desktop'|'mobile'|'tablet')[];
    deviceBlacklist: ('desktop'|'mobile'|'tablet')[];
}
export interface SystemSettings {
    currencies: Currency[];
    defaultCurrency: string;
    languages: Language[];
    defaultLanguage: string;
    defaultTimezone: string;
    maintenanceSettings: MaintenanceSettings;
    accessControlSettings: AccessControlSettings;
    landingPageMetrics: LandingPageMetrics;
    featuredUpdate: FeaturedUpdateSettings;
    mapProviders: MapProvider[];
    activeMapProviderId: string;
    ipGeolocationProviders: IpGeolocationProvider[];
    activeIpGeolocationProviderId: string;
    aiSettings: AISettings;
    supabaseSettings: SupabaseSettings;
}

export interface Supplier { id: string; name: string; contactPerson: string; email: string; phone: string; }
export interface PurchaseOrderItem { variantId: string; productName: string; variantName: string; quantity: number; cost: number; }
export interface PurchaseOrder {
    id: string;
    poNumber: string;
    supplierId: string;
    destinationBranchId: string;
    items: PurchaseOrderItem[];
    total: number;
    status: 'PENDING' | 'ORDERED' | 'RECEIVED';
    createdAt: Date;
}

export interface Account { id: string; name: string; type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'; balance: number; }
export interface JournalEntry {
    id: string; date: Date; description: string;
    transactions: { accountId: string; amount: number; }[];
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    targetAudience: 'ALL' | 'TENANTS' | 'STAFF';
    createdAt: Date;
    readBy: string[];
}

export interface Consignment {
    id: string;
    supplierId: string;
    branchId: string;
    receivedDate: Date;
    items: {
        variantId: string;
        productName: string;
        variantName: string;
        quantityReceived: number;
        quantitySold: number;
        costPrice: number;
    }[];
    status: 'ACTIVE' | 'SETTLED';
}

export type PaymentTransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REJECTED';

export interface PaymentTransaction {
    id: string;
    tenantId: string;
    planId: string;
    amount: number;
    method: string;
    status: PaymentTransactionStatus;
    createdAt: Date;
    proofOfPaymentUrl?: string;
}

export interface EmailTemplate { id: string; name: string; subject: string; body: string; tenantId?: string; }
export interface SmsTemplate { id: string; name: string; body: string; tenantId?: string; }
export interface InAppNotification { id: string; userId: string; message: string; read: boolean; createdAt: Date; }
export interface AuditLog {
    id: string;
    timestamp: Date;
    userId: string;
    userName: string;
    userType: 'STAFF' | 'TENANT' | 'SUPER_ADMIN';
    tenantId?: string;
    action: string;
    details: string;
}

export interface Deposit {
    id: string;
    customerId: string;
    amount: number;
    date: Date;
    staffId: string;
    branchId: string;
    status: 'ACTIVE' | 'APPLIED' | 'REFUNDED';
    notes?: string;
    appliedSaleId?: string;
}

export interface CreditPayment {
  id: string;
  customerId: string;
  amount: number;
  date: Date;
  recordedByStaffId: string;
}

export interface TicketMessage { id: string; sender: 'TENANT' | 'ADMIN'; message: string; timestamp: Date; }
export interface SupportTicket {
    id: string;
    tenantId: string;
    subject: string;
    department: 'Technical' | 'Billing' | 'General';
    priority: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'In Progress' | 'Closed';
    createdAt: Date;
    updatedAt: Date;
    messages: TicketMessage[];
}

export interface BlogPost {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
    status: 'DRAFT' | 'PUBLISHED';
    featuredImage?: string;
}

export interface Budget {
  id: string;
  accountId: string;
  amount: number;
  period: string; // Format: "YYYY-MM"
}

export interface NotificationType {
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface Profile {
  id: string;
  is_super_admin: boolean;
  tenant_id: string | null;
}

export interface LocalSession {
  user: { id: string; email: string };
  profile: Profile;
}


export interface AppContextType {
    products: Product[];
    sales: Sale[];
    branches: Branch[];
    staff: Staff[];
    staffRoles: StaffRole[];
    stockLogs: StockLog[];
    tenants: Tenant[];
    subscriptionPlans: SubscriptionPlan[];
    adminUsers: AdminUser[];
    adminRoles: AdminRole[];
    brandConfig: BrandConfig;
    pageContent: PageContent;
    paymentSettings: PaymentSettings;
    notificationSettings: NotificationSettings;
    systemSettings: SystemSettings;
    trucks: Truck[];
    shipments: Shipment[];
    trackerProviders: TrackerProvider[];
    suppliers: Supplier[];
    purchaseOrders: PurchaseOrder[];
    accounts: Account[];
    journalEntries: JournalEntry[];
    announcements: Announcement[];
    customers: Customer[];
    consignments: Consignment[];
    categories: Category[];
    paymentTransactions: PaymentTransaction[];
    emailTemplates: EmailTemplate[];
    smsTemplates: SmsTemplate[];
    auditLogs: AuditLog[];
    deposits: Deposit[];
    creditPayments: CreditPayment[];
    supportTickets: SupportTicket[];
    blogPosts: BlogPost[];
    inAppNotifications: InAppNotification[];
    budgets: Budget[];

    currentTenant: Tenant | null;
    currentAdminUser: AdminUser | null;
    impersonatedUser: Tenant | null;
    notification: NotificationType | null;
    setNotification: React.Dispatch<React.SetStateAction<NotificationType | null>>;
    logAction: (action: string, details: string, user?: { id: string; name: string; type: 'STAFF' | 'TENANT' | 'SUPER_ADMIN' }) => void;
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    theme: 'light' | 'dark';
    setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
    currentLanguage: string;
    setCurrentLanguage: React.Dispatch<React.SetStateAction<string>>;
    currentCurrency: string;
    setCurrentCurrency: React.Dispatch<React.SetStateAction<string>>;
    
    getMetric: (metric: 'totalRevenue' | 'salesVolume' | 'newCustomers' | 'activeBranches') => number;
    addSale: (saleData: Omit<Sale, 'id' | 'date' | 'status' | 'amountDue'>) => Promise<{ success: boolean; message: string; newSale?: Sale }>;
    adjustStock: (productId: string, variantId: string, branchId: string, quantityChange: number, reason: string) => void;
    transferStock: (productId: string, variantId: string, fromBranchId: string, toBranchId: string, quantity: number) => void;
    addProduct: (productData: Omit<Product, 'id' | 'isFavorite' | 'variants'> & { variants: Omit<ProductVariant, 'id'>[] }) => void;
    updateProductVariant: (productId: string, variantId: string, variantData: Partial<Omit<ProductVariant, 'id' | 'stockByBranch'>>) => void;
    
    addAdminUser: (userData: Omit<AdminUser, 'id' | 'joinDate' | 'status' | 'lastLoginIp' | 'lastLoginDate'>) => void;
    updateAdminUser: (userId: string, userData: Partial<AdminUser>) => void;
    updateAdminRole: (roleId: string, permissions: Permission[]) => void;
    addAdminRole: (roleData: Omit<AdminRole, 'id'>) => void;
    deleteAdminRole: (roleId: string) => void;
    
    session: LocalSession | null;
    profile: Profile | null;
    isLoading: boolean;
    handleImpersonate: (tenant: Tenant) => void;
    stopImpersonating: () => void;
    login: (username: string, password: string) => Promise<{ success: boolean; message: string; }>;
    logout: () => void;
    
    allTenantPermissions: TenantPermission[];
    allPermissions: Permission[];
    currentStaffUser: Staff | null;
    setCurrentStaffUser: React.Dispatch<React.SetStateAction<Staff | null>>;
    activateSubscription: (tenantId: string, planId: string, billingCycle: 'monthly' | 'yearly') => void;

    updateBrandConfig: (newConfig: Partial<BrandConfig>) => void;
    updatePageContent: (newPageContent: Partial<PageContent>) => void;
    updateFaqs: (newFaqs: FaqItem[]) => void;
    updatePaymentSettings: (newSettings: PaymentSettings) => void;
    updateNotificationSettings: (newSettings: NotificationSettings) => void;
    updateSystemSettings: (newSettings: Partial<SystemSettings>) => void;
    updateMaintenanceSettings: (settings: MaintenanceSettings) => void;
    updateAccessControlSettings: (settings: AccessControlSettings) => void;
    updateLandingPageMetrics: (metrics: LandingPageMetrics) => void;
    updateTenant: (tenantId: string, tenantData: Partial<Tenant>) => void;
    updateCurrentTenantSettings: (newSettings: Partial<Pick<Tenant, 'currency' | 'language' | 'logoutTimeout' | 'timezone'>>) => void;
    updateTenantLogisticsConfig: (config: any) => void;
    updateTenantAutomations: (newAutomations: Partial<Tenant['automations']>) => void;
    addSubscriptionPlan: (planData: Omit<SubscriptionPlan, 'id'>) => void;
    updateSubscriptionPlan: (planId: string, planData: Partial<SubscriptionPlan>) => void;
    deleteSubscriptionPlan: (planId: string) => void;
    addTruck: (truckData: Omit<Truck, 'id' | 'lastUpdate'>) => void;
    updateTruck: (truckId: string, truckData: Partial<Truck>) => void;
    deleteTruck: (truckId: string) => void;
    updateTruckVitals: (truckId: string) => void;
    addShipment: (shipmentData: Omit<Shipment, 'id'>) => void;
    updateShipmentStatus: (shipmentId: string, status: Shipment['status']) => void;
    updateTrackerProviders: (providers: TrackerProvider[]) => void;
    addBranch: (branchName: string) => void;
    updateBranchLocation: (branchId: string, location: { lat: number; lng: number }) => void;
    addStaff: (staffData: Omit<Staff, 'id'>) => void;
    deleteStaff: (staffId: string) => void;
    sellShipment: (shipmentId: string, customer: Pick<Customer, 'name' | 'phone'>) => Promise<{ success: boolean; message: string }>;
    receiveShipment: (shipmentId: string) => void;
    addPurchaseOrder: (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'total' | 'createdAt'>) => void;
    updatePurchaseOrderStatus: (poId: string, status: PurchaseOrder['status']) => void;
    addStaffRole: (roleData: Omit<StaffRole, 'id'>) => void;
    updateStaffRole: (roleId: string, permissions: TenantPermission[]) => void;
    deleteStaffRole: (roleId: string) => void;
    addAccount: (accountData: Omit<Account, 'id' | 'balance'>) => void;
    addJournalEntry: (entryData: Omit<JournalEntry, 'id' | 'date'>) => void;
    addTenant: (tenantData: Omit<Tenant, 'id' | 'joinDate' | 'status' | 'trialEndDate' | 'isVerified' | 'billingCycle' | 'lastLoginIp' | 'lastLoginDate'>, logoBase64: string) => Promise<{ success: boolean; message: string }>;
    verifyTenant: (email: string) => void;
    updateTenantProfile: (tenantData: Partial<Tenant>) => void;
    updateAdminProfile: (adminData: Partial<AdminUser>) => void;
    addAnnouncement: (announcementData: Omit<Announcement, 'id' | 'createdAt' | 'readBy'>) => void;
    markAnnouncementAsRead: (announcementId: string, userId: string) => void;
    addCustomer: (customerData: Omit<Customer, 'id' | 'creditBalance'>) => void;
    deleteCustomer: (customerId: string) => void;
    recordCreditPayment: (customerId: string, amount: number, staffId: string) => void;
    addDeposit: (depositData: Omit<Deposit, 'id' | 'date' | 'status'>) => Promise<{ success: boolean; message: string }>;
    updateDeposit: (depositId: string, updates: Partial<Pick<Deposit, 'status' | 'notes' | 'appliedSaleId'>>) => void;
    addConsignment: (consignmentData: Omit<Consignment, 'id' | 'status'>) => void;
    addCategory: (categoryName: string) => void;
    updateCategory: (categoryId: string, newName: string) => void;
    deleteCategory: (categoryId: string) => void;
    extendTrial: (tenantId: string, days: number) => void;
    changeSubscriptionPlan: (tenantId: string, newPlanId: string, billingCycle: 'monthly' | 'yearly') => void;
    processExpiredTrials: () => { processed: number; suspended: number; };
    sendExpiryReminders: () => { sent: number; };
    processSubscriptionPayment: (tenantId: string, planId: string, method: string, amount: number, billingCycle: 'monthly' | 'yearly', success: boolean, proofOfPaymentUrl?: string) => Promise<{ success: boolean; message: string }>;
    updatePaymentTransactionStatus: (transactionId: string, newStatus: 'COMPLETED' | 'REJECTED') => void;
    updateEmailTemplate: (templateId: string, newSubject: string, newBody: string) => void;
    updateSmsTemplate: (templateId: string, newBody: string) => void;
    markInAppNotificationAsRead: (notificationId: string) => void;
    submitSupportTicket: (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'status' | 'messages'> & { messages: Omit<TicketMessage, 'id' | 'timestamp'>[]; }) => void;
    replyToSupportTicket: (ticketId: string, message: Omit<TicketMessage, 'id' | 'timestamp'>) => void;
    updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
    addBlogPost: (postData: Omit<BlogPost, 'id' | 'createdAt' | 'authorName'>) => void;
    updateBlogPost: (postId: string, postData: Partial<BlogPost>) => void;
    deleteBlogPost: (postId: string) => void;
    updateLastLogin: (email: string, ip: string) => void;
    generateInsights: () => Promise<string>;
    updateBudget: (accountId: string, amount: number, period: string) => void;
    deleteBudget: (accountId: string, period: string) => void;
    addTenantEmailTemplate: (templateData: Omit<EmailTemplate, 'id' | 'tenantId'>) => void;
    updateTenantEmailTemplate: (templateId: string, updates: Partial<Omit<EmailTemplate, 'id' | 'tenantId'>>) => void;
    deleteTenantEmailTemplate: (templateId: string) => void;
    addTenantSmsTemplate: (templateData: Omit<SmsTemplate, 'id' | 'tenantId'>) => void;
    updateTenantSmsTemplate: (templateId: string, updates: Partial<Omit<SmsTemplate, 'id' | 'tenantId'>>) => void;
    deleteTenantSmsTemplate: (templateId: string) => void;
    sendBulkMessage: (type: 'email' | 'sms', customerIds: string[], message: string, subject?: string) => Promise<{ success: boolean; message: string }>;
}