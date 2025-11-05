
export interface ProductVariant {
  id: string;
  name: string; // e.g., 'Large', 'Red'
  sku: string;
  price: number;
  stock: number;
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
  branch: string;
  customer: string;
}

export interface AppContextType {
  products: Product[];
  sales: Sale[];
  getMetric: (metric: 'totalRevenue' | 'salesVolume' | 'newCustomers' | 'activeBranches') => number;
}