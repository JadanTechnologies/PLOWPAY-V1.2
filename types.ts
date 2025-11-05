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
  // FIX: Corrected the type from a literal 'string' to the `string` type.
  name: string;
  // FIX: Corrected the type from a literal 'string' to the `string` type.
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

export interface AppContextType {
  products: Product[];
  sales: Sale[];
  branches: Branch[];
  getMetric: (metric: 'totalRevenue' | 'salesVolume' | 'newCustomers' | 'activeBranches') => number;
  adjustStock: (productId: string, variantId: string, branchId: string, newStock: number) => void;
  transferStock: (productId: string, variantId: string, fromBranchId: string, toBranchId: string, quantity: number) => void;
}