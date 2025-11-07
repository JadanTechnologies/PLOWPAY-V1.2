
export interface Branch {
  id: string;
  name: string;
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
 | 'accessReturns';

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
  automations?: TenantAutomations;
  isVerified: boolean;
  billingCycle: 'monthly' | 'yearly';
  logoutTimeout?: number; // in minutes
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
  | 'viewAuditLogs';

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
  phone?: string;
  avatarUrl?: string;
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

export interface StripeSettings {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
}

export interface FlutterwaveSettings {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
}

export interface PaystackSettings {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
}

export interface ManualGatewaySettings {
    enabled: boolean;
    details: string;
}

export interface PaymentSettings {
    stripe: StripeSettings;
    flutterwave: FlutterwaveSettings;
    paystack: PaystackSettings;
    manual: ManualGatewaySettings;
}

export interface ResendSettings {
    apiKey: string;
}

export interface SMTPSettings {
    host: number;
    port: number;
    user: string;
    pass: string;
}

export interface EmailSettings {
    provider: 'resend' | 'smtp';
    resend: ResendSettings;
    smtp: SMTPSettings;
}

export interface TwilioSettings {
    enabled: boolean;
    accountSid: string;
    apiKey: string;
    fromNumber: string;
}

export interface SmsSettings {
    twilio: TwilioSettings;
}

export interface FirebaseSettings {
    enabled: boolean;
    serverKey: string;
    vapidKey: string;
}

export interface PushSettings {
    firebase: FirebaseSettings;
}

export interface NotificationSettings {
    email: EmailSettings;
    sms: SmsSettings;
    push: PushSettings;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface PurchaseOrderItem {
  variantId: string;
  variantName: string;
  productName: string;
  quantity: number;
  cost: number;
}

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

export interface ConsignmentItem {
    variantId: string;
    variantName: string;
    productName: string;
    quantityReceived: number;
    quantitySold: number;
    costPrice: number; // Agreed price per item
}

export interface Consignment {
    id: string;
    supplierId: string;
    branchId: string;
    receivedDate: Date;
    items: ConsignmentItem[];
    status: 'ACTIVE' | 'SETTLED';
}

export interface Account {
    id: string;
    name: string;
    type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
    balance: number;
}

export interface Transaction {
    accountId: string;
    amount: number; // Positive for debit, negative for credit
}

export interface JournalEntry {
    id: string;
    date: Date;
    description: string;
    transactions: Transaction[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'TENANTS' | 'STAFF' | 'ALL';
  createdAt: Date;
  readBy: string[]; // Array of user IDs (admin or tenant)
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  enabled: boolean;
}

export interface Language {
  code: string;
  name: string;
  enabled: boolean;
}

export interface MaintenanceSettings {
  isActive: boolean;
  message: string;
}

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
  deviceWhitelist: ('desktop' | 'mobile' | 'tablet')[];
  deviceBlacklist: ('desktop' | 'mobile' | 'tablet')[];
}

export interface LandingPageMetrics {
    businesses: { value: number; label: string };
    users: { value: number; label: string };
    revenue: { value: number; label: string };
}

export interface SystemSettings {
  currencies: Currency[];
  defaultCurrency: string;
  languages: Language[];
  defaultLanguage: string;
  maintenanceSettings: MaintenanceSettings;
  accessControlSettings: AccessControlSettings;
  landingPageMetrics: LandingPageMetrics;
}

export type PaymentTransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REJECTED';

export interface PaymentTransaction {
    id: string;
    tenantId: string;
    planId: string;
    amount: number;
    method: string; // 'Stripe', 'Paystack', 'Manual'
    status: PaymentTransactionStatus;
    createdAt: Date;
    proofOfPaymentUrl?: string;
    transactionId?: string; // From payment gateway
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
}

export interface SmsTemplate {
    id: string;
    name: string;
    body: string;
}

export interface InAppNotification {
  id: string;
  userId: string; // Tenant ID for tenant notifications
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface AuditLog {
    id: string;
    timestamp: Date;
    userId: string;
    userName: string;
    userType: 'TENANT' | 'STAFF' | 'SUPER_ADMIN';
    tenantId?: string; // To scope logs for tenant admins
    action: string; // e.g., 'UPDATED_PRODUCT', 'DELETED_USER'
    details: string; // e.g., "Updated Product 'Laptop' (ID: prod-1)"
}

export interface NotificationType {
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface Deposit {
  id: string;
  customerId: string;
  amount: number;
  date: Date;
  staffId: string;
  branchId: string;
  notes?: string;
  status: 'ACTIVE' | 'REFUNDED' | 'APPLIED';
  appliedSaleId?: string;
}

export interface AppContextType {
  products: Product[];
  sales: Sale[];
  branches: Branch[];
  staff: Staff[];
  staffRoles: StaffRole[];
  currentStaffUser: Staff | null;
  allTenantPermissions: TenantPermission[];
  stockLogs: StockLog[];
  tenants: Tenant[];
  currentTenant: Tenant | null;
  subscriptionPlans: SubscriptionPlan[];
  adminUsers: AdminUser[];
  adminRoles: AdminRole[];
  allPermissions: Permission[];
  currentAdminUser: AdminUser | null;
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
  deposits: Deposit[];
  categories: Category[];
  paymentTransactions: PaymentTransaction[];
  emailTemplates: EmailTemplate[];
  smsTemplates: SmsTemplate[];
  inAppNotifications: InAppNotification[];
  auditLogs: AuditLog[];
  notification: NotificationType | null;
  setNotification: (notification: NotificationType | null) => void;
  logAction: (action: string, details: string, user?: { id: string; name: string; type: 'STAFF' | 'TENANT' | 'SUPER_ADMIN' }) => void;
  searchTerm: string;
  currentLanguage: string;
  currentCurrency: string;
  setCurrentCurrency: (currencyCode: string) => void;
  setCurrentLanguage: (langCode: string) => void;
  setSearchTerm: (term: string) => void;
  getMetric: (metric: 'totalRevenue' | 'salesVolume' | 'newCustomers' | 'activeBranches') => number;
  addSale: (saleData: Omit<Sale, 'id' | 'date' | 'status' | 'amountDue'>) => Promise<{success: boolean, message: string, newSale?: Sale}>;
  adjustStock: (productId: string, variantId: string, branchId: string, newStock: number, reason: string) => void;
  transferStock: (productId: string, variantId: string, fromBranchId: string, toBranchId: string, quantity: number) => void;
  addProduct: (productData: Omit<Product, 'id' | 'isFavorite' | 'variants'> & { variants: Omit<ProductVariant, 'id'>[] }) => void;
  updateProductVariant: (productId: string, variantId: string, variantData: Partial<Omit<ProductVariant, 'id' | 'stockByBranch'>>) => void;
  addAdminUser: (userData: Omit<AdminUser, 'id' | 'joinDate' | 'status'>) => void;
  updateAdminUser: (userId: string, userData: Partial<Omit<AdminUser, 'id' | 'joinDate'>>) => void;
  updateAdminRole: (roleId: string, permissions: Permission[]) => void;
  addAdminRole: (roleData: Omit<AdminRole, 'id'>) => void;
  deleteAdminRole: (roleId: string) => void;
  updateBrandConfig: (newConfig: Partial<BrandConfig>) => void;
  updatePageContent: (newPageContent: Partial<Omit<PageContent, 'faqs'>>) => void;
  updateFaqs: (newFaqs: FaqItem[]) => void;
  updatePaymentSettings: (newSettings: PaymentSettings) => void;
  updateNotificationSettings: (newSettings: NotificationSettings) => void;
  updateSystemSettings: (newSettings: Partial<SystemSettings>) => void;
  updateMaintenanceSettings: (settings: MaintenanceSettings) => void;
  updateAccessControlSettings: (settings: AccessControlSettings) => void;
  updateLandingPageMetrics: (metrics: LandingPageMetrics) => void;
  updateCurrentTenantSettings: (newSettings: Partial<Pick<Tenant, 'currency' | 'language' | 'logoutTimeout'>>) => void;
  updateTenantAutomations: (newAutomations: Partial<TenantAutomations>) => void;
  addSubscriptionPlan: (planData: Omit<SubscriptionPlan, 'id'>) => void;
  updateSubscriptionPlan: (planId: string, planData: Partial<Omit<SubscriptionPlan, 'id'>>) => void;
  deleteSubscriptionPlan: (planId: string) => void;
  addTruck: (truckData: Omit<Truck, 'id' | 'lastUpdate'>) => void;
  updateTruck: (truckId: string, truckData: Partial<Omit<Truck, 'id'>>) => void;
  addShipment: (shipmentData: Omit<Shipment, 'id'>) => void;
  updateShipmentStatus: (shipmentId: string, status: Shipment['status']) => void;
  updateTrackerProviders: (providers: TrackerProvider[]) => void;
  addBranch: (branchName: string) => void;
  addStaff: (staffData: Omit<Staff, 'id'>) => void;
  sellShipment: (shipmentId: string, customer: Pick<Customer, 'name' | 'phone'>) => Promise<{success: boolean; message: string;}>;
  receiveShipment: (shipmentId: string) => void;
  addPurchaseOrder: (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'total' | 'createdAt'>) => void;
  updatePurchaseOrderStatus: (poId: string, status: PurchaseOrder['status']) => void;
  addStaffRole: (roleData: Omit<StaffRole, 'id'>) => void;
  updateStaffRole: (roleId: string, permissions: TenantPermission[]) => void;
  deleteStaffRole: (roleId: string) => void;
  addAccount: (accountData: Omit<Account, 'id' | 'balance'>) => void;
  addJournalEntry: (entryData: Omit<JournalEntry, 'id' | 'date'>) => void;
  addTenant: (tenantData: Omit<Tenant, 'id' | 'joinDate' | 'status' | 'trialEndDate' | 'isVerified' | 'billingCycle'>) => Promise<{ success: boolean; message: string }>;
  verifyTenant: (email: string) => void;
  updateTenantProfile: (tenantData: Partial<Omit<Tenant, 'id'>>) => void;
  updateAdminProfile: (adminData: Partial<Omit<AdminUser, 'id'>>) => void;
  addAnnouncement: (announcementData: Omit<Announcement, 'id' | 'createdAt' | 'readBy'>) => void;
  markAnnouncementAsRead: (announcementId: string, userId: string) => void;
  addCustomer: (customerData: Omit<Customer, 'id' | 'creditBalance'>) => void;
  recordCreditPayment: (customerId: string, amount: number) => void;
  addDeposit: (depositData: Omit<Deposit, 'id' | 'date' | 'status'>) => Promise<{success: boolean, message: string}>;
  updateDeposit: (depositId: string, updates: Partial<Pick<Deposit, 'status' | 'notes' | 'appliedSaleId'>>) => void;
  addConsignment: (consignmentData: Omit<Consignment, 'id' | 'status'>) => void;
  addCategory: (categoryName: string) => void;
  updateCategory: (categoryId: string, newName: string) => void;
  deleteCategory: (categoryId: string) => void;
  extendTrial: (tenantId: string, days: number) => void;
  activateSubscription: (tenantId: string, planId: string, billingCycle: 'monthly' | 'yearly') => void;
  changeSubscriptionPlan: (tenantId: string, newPlanId: string, billingCycle: 'monthly' | 'yearly') => void;
  processExpiredTrials: () => { processed: number; suspended: number };
  processSubscriptionPayment: (tenantId: string, planId: string, method: string, amount: number, billingCycle: 'monthly' | 'yearly', success: boolean, proofOfPaymentUrl?: string) => Promise<{success: boolean, message: string}>;
  updatePaymentTransactionStatus: (transactionId: string, newStatus: 'COMPLETED' | 'REJECTED') => void;
  updateEmailTemplate: (templateId: string, newSubject: string, newBody: string) => void;
  updateSmsTemplate: (templateId: string, newBody: string) => void;
  markInAppNotificationAsRead: (notificationId: string) => void;
  logout?: () => void;
}
