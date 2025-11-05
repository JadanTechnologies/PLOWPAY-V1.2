

export interface Branch {
  id: string;
  name: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., 'Large', 'Red'
  sku: string;
  price: number;
  stockByBranch: { [branchId: string]: number };
}

export interface Product {
  id:string;
  name: string;
  category: string;
  variants: ProductVariant[];
  isFavorite?: boolean;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  date: Date;
  items: CartItem[];
  total: number;
  branchId: string;
  customer: string;
}

export type StockLogAction = 'ADJUSTMENT' | 'TRANSFER';

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
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // per month
}

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL';

export interface Tenant {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  status: TenantStatus;
  planId: string;
  joinDate: Date;
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
  | 'manageNotificationSettings';

export interface AdminRole {
    id: string;
    name: string;
    permissions: Permission[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: AdminUserStatus;
  joinDate: Date;
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
    host: string;
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


export interface AppContextType {
  products: Product[];
  sales: Sale[];
  branches: Branch[];
  stockLogs: StockLog[];
  tenants: Tenant[];
  subscriptionPlans: SubscriptionPlan[];
  adminUsers: AdminUser[];
  adminRoles: AdminRole[];
  allPermissions: Permission[];
  currentAdminUser: AdminUser | null;
  brandConfig: BrandConfig;
  pageContent: PageContent;
  paymentSettings: PaymentSettings;
  notificationSettings: NotificationSettings;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  getMetric: (metric: 'totalRevenue' | 'salesVolume' | 'newCustomers' | 'activeBranches') => number;
  adjustStock: (productId: string, variantId: string, branchId: string, newStock: number, reason: string) => void;
  transferStock: (productId: string, variantId: string, fromBranchId: string, toBranchId: string, quantity: number) => void;
  addProduct: (productData: Omit<Product, 'id' | 'isFavorite' | 'variants'> & { variants: Omit<ProductVariant, 'id'>[] }) => void;
  addAdminUser: (userData: Omit<AdminUser, 'id' | 'joinDate' | 'status'>) => void;
  updateAdminUser: (userId: string, userData: Partial<Omit<AdminUser, 'id' | 'joinDate'>>) => void;
  updateAdminRole: (roleId: string, permissions: Permission[]) => void;
  updateBrandConfig: (newConfig: Partial<BrandConfig>) => void;
  updatePageContent: (newPageContent: Partial<Omit<PageContent, 'faqs'>>) => void;
  updateFaqs: (newFaqs: FaqItem[]) => void;
  updatePaymentSettings: (newSettings: PaymentSettings) => void;
  updateNotificationSettings: (newSettings: NotificationSettings) => void;
  addSubscriptionPlan: (planData: Omit<SubscriptionPlan, 'id'>) => void;
  updateSubscriptionPlan: (planId: string, planData: Partial<Omit<SubscriptionPlan, 'id'>>) => void;
  deleteSubscriptionPlan: (planId: string) => void;
  logout?: () => void;
}