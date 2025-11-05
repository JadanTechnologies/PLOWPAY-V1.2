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
  id: string;
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
  name: 'Basic' | 'Pro' | 'Premium';
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


export interface AppContextType {
  products: Product[];
  sales: Sale[];
  branches: Branch[];
  stockLogs: StockLog[];
  tenants: Tenant[];
  subscriptionPlans: SubscriptionPlan[];
  getMetric: (metric: 'totalRevenue' | 'salesVolume' | 'newCustomers' | 'activeBranches') => number;
  adjustStock: (productId: string, variantId: string, branchId: string, newStock: number, reason: string) => void;
  transferStock: (productId: string, variantId: string, fromBranchId: string, toBranchId: string, quantity: number) => void;
  addProduct: (productData: Omit<Product, 'id' | 'isFavorite' | 'variants'> & { variants: Omit<ProductVariant, 'id'>[] }) => void;
}