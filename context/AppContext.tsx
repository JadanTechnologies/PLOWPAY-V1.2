
import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { Product, Sale, AppContextType, ProductVariant, Branch, StockLog, Tenant, SubscriptionPlan, TenantStatus, AdminUser, AdminUserStatus, BrandConfig, PageContent, FaqItem, AdminRole, Permission, PaymentSettings, NotificationSettings, Truck, Shipment, TrackerProvider, Staff, CartItem, StaffRole, TenantPermission, allTenantPermissions, Supplier, PurchaseOrder, Account, JournalEntry } from '../types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

const mockBranches: Branch[] = [
    { id: 'branch-1', name: 'Downtown' },
    { id: 'branch-2', name: 'Uptown' },
    { id: 'branch-3', name: 'Westside' },
    { id: 'branch-4', name: 'Eastside' },
];

const mockStaffRoles: StaffRole[] = [
    { id: 'staff-role-manager', name: 'Manager', permissions: [...allTenantPermissions] },
    { id: 'staff-role-cashier', name: 'Cashier', permissions: ['accessPOS', 'viewReports'] },
    { id: 'staff-role-logistics', name: 'Logistics', permissions: ['manageLogistics', 'manageInventory'] },
];

const mockStaff: Staff[] = [
    { id: 'staff-1', name: 'Alice Manager', email: 'alice@tenant.com', username: 'alice', password: 'password123', roleId: 'staff-role-manager', branchId: 'branch-1' },
    { id: 'staff-2', name: 'Bob Cashier', email: 'bob@tenant.com', username: 'bob', password: 'password123', roleId: 'staff-role-cashier', branchId: 'branch-1' },
    { id: 'staff-3', name: 'Charlie Logistics', email: 'charlie@tenant.com', username: 'charlie', password: 'password123', roleId: 'staff-role-logistics', branchId: 'branch-2' },
];

const mockSubscriptionPlans: SubscriptionPlan[] = [
    { id: 'plan_basic', name: 'Basic', price: 29 },
    { id: 'plan_pro', name: 'Pro', price: 79 },
    { id: 'plan_premium', name: 'Premium', price: 149 },
];

export const allPermissions: Permission[] = [
    'viewPlatformDashboard',
    'manageTenants',
    'manageSubscriptions',
    'manageTeam',
    'manageRoles',
    'manageSystemSettings',
    'managePaymentGateways',
    'manageNotificationSettings'
];

const mockAdminRoles: AdminRole[] = [
    { id: 'role-admin', name: 'Admin', permissions: [...allPermissions] },
    { id: 'role-support', name: 'Support', permissions: ['viewPlatformDashboard', 'manageTenants'] },
    { id: 'role-developer', name: 'Developer', permissions: ['viewPlatformDashboard', 'manageSystemSettings'] }
];


const generateMockAdminUsers = (): AdminUser[] => {
    return [
        { id: 'admin-1', name: 'Super Admin', email: 'admin@flowpay.com', roleId: 'role-admin', status: 'ACTIVE', joinDate: new Date('2023-01-15') },
        { id: 'admin-2', name: 'Jane Smith (Support)', email: 'jane.s@flowpay.com', roleId: 'role-support', status: 'ACTIVE', joinDate: new Date('2023-05-20') },
        { id: 'admin-3', name: 'Mike Johnson (Developer)', email: 'mike.j@flowpay.com', roleId: 'role-developer', status: 'ACTIVE', joinDate: new Date('2023-08-01') },
        { id: 'admin-4', name: 'Emily Davis (Support)', email: 'emily.d@flowpay.com', roleId: 'role-support', status: 'SUSPENDED', joinDate: new Date('2023-10-11') },
    ];
};

const generateMockTenants = (): Tenant[] => {
    const tenants: Tenant[] = [];
    const businessNames = ['Innovate Inc.', 'Quantum Solutions', 'Stellar Goods', 'Apex Retail', 'Zenith Supplies', 'Synergy Corp', 'Momentum Trading', 'Odyssey Services'];
    const ownerNames = ['Alice Johnson', 'Bob Williams', 'Charlie Brown', 'Diana Miller', 'Ethan Davis', 'Fiona Garcia', 'George Rodriguez', 'Helen Martinez'];
    const statuses: TenantStatus[] = ['ACTIVE', 'TRIAL', 'SUSPENDED'];

    for (let i = 0; i < 8; i++) {
        const ownerFirstName = ownerNames[i].split(' ')[0].toLowerCase();
        tenants.push({
            id: `tenant-${i+1}`,
            businessName: businessNames[i],
            ownerName: ownerNames[i],
            email: `${ownerFirstName}@example.com`,
            username: ownerFirstName,
            password: 'tenant12345',
            companyAddress: `${i+1}23 Market St, San Francisco, CA 94103`,
            companyPhone: `(555) 123-456${i}`,
            companyLogoUrl: '',
            status: statuses[i % statuses.length],
            planId: mockSubscriptionPlans[i % mockSubscriptionPlans.length].id,
            joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        });
    }
    return tenants.sort((a,b) => b.joinDate.getTime() - a.joinDate.getTime());
};

const generateMockProducts = (): Product[] => {
    const categories = ['Electronics', 'Apparel', 'Groceries', 'Books'];
    const productNames = {
        'Electronics': ['Laptop', 'Smartphone', 'Headphones', 'Smart Watch'],
        'Apparel': ['T-Shirt', 'Jeans', 'Jacket', 'Sneakers'],
        'Groceries': ['Milk', 'Bread', 'Eggs', 'Cheese'],
        'Books': ['Sci-Fi Novel', 'Cookbook', 'History Book', 'Biography']
    };
    const variants = {
        'Electronics': [{name: '16GB RAM', price: 1200}, {name: '32GB RAM', price: 1500}],
        'Apparel': [{name: 'Medium', price: 25}, {name: 'Large', price: 28}],
        'Groceries': [{name: '1 Gallon', price: 4}, {name: 'Half Gallon', price: 2.5}],
        'Books': [{name: 'Hardcover', price: 30}, {name: 'Paperback', price: 15}]
    };

    let products: Product[] = [];
    let productId = 1;

    categories.forEach(category => {
        productNames[category as keyof typeof productNames].forEach(name => {
            const product: Product = {
                id: `prod-${productId++}`,
                name: name,
                category: category,
                isFavorite: Math.random() > 0.7,
                variants: variants[category as keyof typeof variants].map((variant, index) => {
                    const stockByBranch: { [branchId: string]: number } = {};
                    mockBranches.forEach(branch => {
                        stockByBranch[branch.id] = Math.floor(Math.random() * 100);
                    });
                    return {
                        id: `var-${productId}-${index}`,
                        name: variant.name,
                        sellingPrice: variant.price,
                        costPrice: variant.price * (Math.random() * 0.3 + 0.5), // Cost is 50-80% of selling price
                        sku: `${name.substring(0,3).toUpperCase()}-${index}`,
                        stockByBranch: stockByBranch,
                    }
                })
            };
            products.push(product);
        });
    });
    return products;
};


const generateMockSales = (products: Product[]): Sale[] => {
    const sales: Sale[] = [];
    const customers = [
        { name: 'John Doe', phone: '555-0101' },
        { name: 'Jane Smith', phone: '555-0102' },
        { name: 'Walk-in Customer' }
    ];
    for (let i = 0; i < 50; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const variant = product.variants[Math.floor(Math.random() * product.variants.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const total = variant.sellingPrice * quantity;
        sales.push({
            id: `sale-${i}`,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            items: [{
                productId: product.id,
                variantId: variant.id,
                name: product.name,
                variantName: variant.name,
                quantity: quantity,
                sellingPrice: variant.sellingPrice
            }],
            total: total,
            branchId: mockBranches[Math.floor(Math.random() * mockBranches.length)].id,
            customer: customers[Math.floor(Math.random() * customers.length)]
        });
    }
    return sales.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const mockProducts = generateMockProducts();
const mockSales = generateMockSales(mockProducts);
export const mockTenants = generateMockTenants();
const mockAdminUsers = generateMockAdminUsers();

const mockTrackerProviders: TrackerProvider[] = [
    { id: 'teltonika', name: 'Teltonika', apiKey: '', apiEndpoint: 'https://teltonika-api.com/v1' },
    { id: 'other', name: 'Other Provider', apiKey: '', apiEndpoint: '' },
];

const mockTrucks: Truck[] = [
    { 
        id: 'truck-1', 
        licensePlate: 'TRK-001', 
        driverName: 'John Smith', 
        status: 'IN_TRANSIT', 
        currentLocation: { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
        lastUpdate: new Date()
    },
    { 
        id: 'truck-2', 
        licensePlate: 'TRK-002', 
        driverName: 'Maria Garcia', 
        status: 'IDLE', 
        currentLocation: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    { 
        id: 'truck-3', 
        licensePlate: 'TRK-003', 
        driverName: 'Chen Wei', 
        status: 'MAINTENANCE', 
        currentLocation: { lat: 29.7604, lng: -95.3698, address: 'Houston, TX' },
        lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
];

const mockShipments: Shipment[] = [
    {
        id: 'shp-001',
        shipmentCode: 'SHP2024001',
        origin: 'New York, NY',
        destination: 'branch-1', // Downtown
        truckId: 'truck-1',
        status: 'IN_TRANSIT',
        items: [{ productId: 'prod-1', variantId: 'var-1-0', productName: 'Laptop', quantity: 50, sellingPrice: 1200 }],
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    },
    {
        id: 'shp-002',
        shipmentCode: 'SHP2024002',
        origin: 'Houston, TX',
        destination: 'branch-2', // Uptown
        truckId: 'truck-2',
        status: 'PENDING',
        items: [{ productId: 'prod-5', variantId: 'var-5-0', productName: 'T-Shirt', quantity: 200, sellingPrice: 25 }],
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    },
     {
        id: 'shp-003',
        shipmentCode: 'SHP2024003',
        origin: 'San Francisco, CA',
        destination: 'branch-3', // Westside
        truckId: 'truck-1',
        status: 'IN_TRANSIT',
        items: [{ productId: 'prod-2', variantId: 'var-2-0', productName: 'Smartphone', quantity: 100, sellingPrice: 800 }],
        estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) // 4 days from now
    },
];

const mockSuppliers: Supplier[] = [
    { id: 'sup-1', name: 'Global Electronics', contactPerson: 'John Supplier', email: 'john@globalelec.com', phone: '111-222-3333' },
    { id: 'sup-2', name: 'Fashion Forward', contactPerson: 'Jane Fashion', email: 'jane@fashionfwd.com', phone: '222-333-4444' },
];

const mockPurchaseOrders: PurchaseOrder[] = [
    {
        id: 'po-1', poNumber: 'PO2024001', supplierId: 'sup-1', destinationBranchId: 'branch-1',
        items: [{ variantId: 'var-1-0', productName: 'Laptop', variantName: '16GB RAM', quantity: 10, cost: 900 }],
        total: 9000, status: 'ORDERED', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
        id: 'po-2', poNumber: 'PO2024002', supplierId: 'sup-2', destinationBranchId: 'branch-2',
        items: [
            { variantId: 'var-5-0', productName: 'T-Shirt', variantName: 'Medium', quantity: 50, cost: 15 },
            { variantId: 'var-6-1', productName: 'Jeans', variantName: 'Large', quantity: 30, cost: 40 }
        ],
        total: 1950, status: 'PENDING', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
];

const mockAccounts: Account[] = [
    { id: 'acc-cash', name: 'Cash', type: 'ASSET', balance: 15000 },
    { id: 'acc-ar', name: 'Accounts Receivable', type: 'ASSET', balance: 5000 },
    { id: 'acc-inventory', name: 'Inventory', type: 'ASSET', balance: 25000 },
    { id: 'acc-ap', name: 'Accounts Payable', type: 'LIABILITY', balance: 8000 },
    { id: 'acc-equity', name: 'Owner\'s Equity', type: 'EQUITY', balance: 40000 },
    { id: 'acc-sales', name: 'Sales Revenue', type: 'REVENUE', balance: 100000 },
    { id: 'acc-cogs', name: 'Cost of Goods Sold', type: 'EXPENSE', balance: 55000 },
    { id: 'acc-rent', name: 'Rent Expense', type: 'EXPENSE', balance: 8000 },
];

const mockJournalEntries: JournalEntry[] = [
    { 
        id: 'je-1', date: new Date(), description: 'Daily sales revenue',
        transactions: [ { accountId: 'acc-cash', amount: 500 }, { accountId: 'acc-sales', amount: -500 } ]
    },
    { 
        id: 'je-2', date: new Date(), description: 'Paid monthly rent',
        transactions: [ { accountId: 'acc-rent', amount: 1000 }, { accountId: 'acc-cash', amount: -1000 } ]
    }
];


const mockBrandConfig: BrandConfig = {
    name: "FlowPay",
    logoUrl: "", // Empty string will use default SVG
    faviconUrl: "/vite.svg",
};

const mockPageContent: PageContent = {
    about: "## About FlowPay\n\nFlowPay is a comprehensive multi-tenant SaaS platform for businesses, featuring a Point of Sale (POS) system, inventory management, and a super admin panel. Built with modern technologies for an intuitive user experience.",
    contact: "## Contact Us\n\nFor support, please email us at support@flowpay.com. For sales inquiries, contact sales@flowpay.com.",
    terms: "## Terms of Service\n\nBy using FlowPay, you agree to our terms and conditions. Please read them carefully. These terms govern your use of our services...",
    privacy: "## Privacy Policy\n\nYour privacy is important to us. This policy explains what information we collect and how we use it...",
    refund: "## Refund Policy\n\nWe offer a 30-day money-back guarantee on all our subscription plans. If you are not satisfied, you can request a full refund within 30 days of purchase.",
    faqs: [
        { id: 'faq-1', question: "What is FlowPay?", answer: "FlowPay is an all-in-one SaaS platform for retail businesses, offering POS, inventory, and analytics." },
        { id: 'faq-2', question: "Is there a free trial?", answer: "Yes, we offer a 14-day free trial for all our plans. No credit card required." },
        { id: 'faq-3', question: "Can I use my own hardware?", answer: "Absolutely. FlowPay is a web-based application and works on any device with a modern browser, including desktops, tablets, and smartphones." },
    ]
};

const mockPaymentSettings: PaymentSettings = {
    stripe: { enabled: true, publicKey: 'pk_test_123', secretKey: 'sk_test_123' },
    flutterwave: { enabled: false, publicKey: '', secretKey: '' },
    paystack: { enabled: false, publicKey: '', secretKey: '' },
    manual: { enabled: true, details: 'Bank: FlowPay Bank\nAccount: 1234567890\nReference: Your Business Name' }
};

const mockNotificationSettings: NotificationSettings = {
    email: {
        provider: 'resend',
        resend: { apiKey: 're_123456789' },
        smtp: { host: 'smtp.example.com', port: 587, user: 'user', pass: 'password' }
    },
    sms: {
        twilio: {
            enabled: true,
            accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            apiKey: 'SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            fromNumber: '+15017122661'
        }
    },
    push: {
        firebase: {
            enabled: false,
            serverKey: '',
            vapidKey: ''
        }
    }
};

interface AppContextProviderProps {
    children: ReactNode;
    onLogout?: () => void;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children, onLogout = () => {} }) => {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [sales, setSales] = useState<Sale[]>(mockSales);
    const [branches, setBranches] = useState<Branch[]>(mockBranches);
    const [staff, setStaff] = useState<Staff[]>(mockStaff);
    const [staffRoles, setStaffRoles] = useState<StaffRole[]>(mockStaffRoles);
    const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(mockSubscriptionPlans);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>(mockAdminUsers);
    const [adminRoles, setAdminRoles] = useState<AdminRole[]>(mockAdminRoles);
    const [currentAdminUser] = useState<AdminUser | null>(mockAdminUsers.find(u => u.email === 'admin@flowpay.com') || null);
    const [brandConfig, setBrandConfig] = useState<BrandConfig>(mockBrandConfig);
    const [pageContent, setPageContent] = useState<PageContent>(mockPageContent);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(mockPaymentSettings);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings);
    const [trucks, setTrucks] = useState<Truck[]>(mockTrucks);
    const [shipments, setShipments] = useState<Shipment[]>(mockShipments);
    const [trackerProviders, setTrackerProviders] = useState<TrackerProvider[]>(mockTrackerProviders);
    const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
    const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(mockJournalEntries);
    const [searchTerm, setSearchTerm] = useState('');

    const getMetric = (metric: 'totalRevenue' | 'salesVolume' | 'newCustomers' | 'activeBranches') => {
        switch (metric) {
            case 'totalRevenue':
                return sales.reduce((acc, sale) => acc + sale.total, 0);
            case 'salesVolume':
                return sales.length;
            case 'newCustomers':
                return 32; // mock
            case 'activeBranches':
                return branches.length;
        }
    };

    const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'date'>): Promise<{success: boolean, message: string}> => {
        // 1. Decrease stock and create stock logs
        const newStockLogs: StockLog[] = [];
        setProducts(currentProducts => {
            const productsCopy = JSON.parse(JSON.stringify(currentProducts));
            for (const item of saleData.items) {
                const product = productsCopy.find((p: Product) => p.id === item.productId);
                if (product) {
                    const variant = product.variants.find((v: ProductVariant) => v.id === item.variantId);
                    if (variant && variant.stockByBranch[saleData.branchId] !== undefined) {
                        variant.stockByBranch[saleData.branchId] -= item.quantity;
                        newStockLogs.push({
                            id: `log-${Date.now()}-${item.variantId}`,
                            date: new Date(),
                            productId: item.productId,
                            variantId: item.variantId,
                            productName: item.name,
                            variantName: item.variantName,
                            action: 'SALE',
                            quantity: -item.quantity,
                            branchId: saleData.branchId,
                            referenceId: `sale-${Date.now()}`
                        });
                    }
                }
            }
            return productsCopy;
        });
    
        // 2. Create sale record
        const newSale: Sale = {
            ...saleData,
            id: `sale-${Date.now()}`,
            date: new Date(),
        };
        setSales(prev => [newSale, ...prev]);
        setStockLogs(prev => [...newStockLogs, ...prev]);
    
        // 3. Handle notification
        let notificationMessage = '';
        if (notificationSettings.sms.twilio.enabled && saleData.customer.phone) {
             if (!notificationSettings.sms.twilio.accountSid || !notificationSettings.sms.twilio.apiKey || !notificationSettings.sms.twilio.fromNumber) {
                 notificationMessage = ' Twilio is enabled but not configured.';
            } else {
                console.log(`Simulating Twilio SMS to ${saleData.customer.phone} from ${notificationSettings.sms.twilio.fromNumber}: Order confirmation for $${saleData.total.toFixed(2)}.`);
                notificationMessage = ` SMS confirmation sent to ${saleData.customer.phone}.`;
            }
        }
        
        return { success: true, message: `Sale completed!${notificationMessage}` };
    }, [notificationSettings]);
    
    const adjustStock = useCallback((productId: string, variantId: string, branchId: string, newStock: number, reason: string) => {
        let logEntry: StockLog | null = null;
        setProducts(prevProducts => {
            return prevProducts.map(product => {
                if (product.id === productId) {
                    const newVariants = product.variants.map(variant => {
                        if (variant.id === variantId) {
                            const oldStock = variant.stockByBranch[branchId] ?? 0;
                            const quantityChange = newStock - oldStock;

                            if (quantityChange !== 0) {
                                logEntry = {
                                    id: `log-${Date.now()}`,
                                    date: new Date(),
                                    productId,
                                    variantId,
                                    productName: product.name,
                                    variantName: variant.name,
                                    action: 'ADJUSTMENT',
                                    quantity: quantityChange,
                                    branchId,
                                    reason,
                                };
                            }
                            
                            const newStockByBranch = { ...variant.stockByBranch, [branchId]: newStock };
                            return { ...variant, stockByBranch: newStockByBranch };
                        }
                        return variant;
                    });
                    return { ...product, variants: newVariants };
                }
                return product;
            });
        });
        
        if (logEntry) {
            setStockLogs(prev => [logEntry!, ...prev]);
        }
    }, []);

    const transferStock = useCallback((productId: string, variantId: string, fromBranchId: string, toBranchId: string, quantity: number) => {
        let logEntry: StockLog | null = null;
        setProducts(prevProducts => {
            return prevProducts.map(p => {
                if (p.id === productId) {
                    const updatedVariants = p.variants.map(v => {
                        if (v.id === variantId) {
                            const fromStock = v.stockByBranch[fromBranchId] ?? 0;
                            const toStock = v.stockByBranch[toBranchId] ?? 0;
                            
                            if (fromStock >= quantity) {
                                logEntry = {
                                    id: `log-${Date.now()}`,
                                    date: new Date(),
                                    productId,
                                    variantId,
                                    productName: p.name,
                                    variantName: v.name,
                                    action: 'TRANSFER',
                                    quantity: quantity,
                                    fromBranchId,
                                    toBranchId,
                                };
                                const newStockByBranch = {
                                    ...v.stockByBranch,
                                    [fromBranchId]: fromStock - quantity,
                                    [toBranchId]: toStock + quantity,
                                };
                                return { ...v, stockByBranch: newStockByBranch };
                            }
                        }
                        return v;
                    });
                    return { ...p, variants: updatedVariants };
                }
                return p;
            });
        });
        
        if (logEntry) {
            setStockLogs(prev => [logEntry!, ...prev]);
        }
    }, []);
    
    const addProduct = useCallback((productData: Omit<Product, 'id' | 'isFavorite' | 'variants'> & { variants: Omit<ProductVariant, 'id'>[] }) => {
        setProducts(prevProducts => {
            const newProductId = `prod-${Date.now()}`;
            const newProduct: Product = {
                ...productData,
                id: newProductId,
                isFavorite: false,
                variants: productData.variants.map((v, index) => ({
                    ...v,
                    id: `var-${newProductId}-${index}`
                })),
            };
            return [...prevProducts, newProduct];
        });
    }, []);

    const addAdminUser = useCallback((userData: Omit<AdminUser, 'id' | 'joinDate' | 'status'>) => {
        setAdminUsers(prev => [
            ...prev,
            {
                ...userData,
                id: `admin-${Date.now()}`,
                joinDate: new Date(),
                status: 'ACTIVE'
            }
        ]);
    }, []);

    const updateAdminUser = useCallback((userId: string, userData: Partial<Omit<AdminUser, 'id' | 'joinDate'>>) => {
        setAdminUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, ...userData } : user
        ));
    }, []);
    
    const updateAdminRole = useCallback((roleId: string, permissions: Permission[]) => {
        setAdminRoles(prev => prev.map(role => 
            role.id === roleId ? { ...role, permissions } : role
        ));
    }, []);

    const addAdminRole = useCallback((roleData: Omit<AdminRole, 'id'>) => {
        setAdminRoles(prev => [
            ...prev,
            {
                ...roleData,
                id: `role-${roleData.name.toLowerCase().replace(/\s/g, '_')}-${Date.now()}`
            }
        ]);
    }, []);

    const deleteAdminRole = useCallback((roleId: string) => {
        const roleToDelete = adminRoles.find(r => r.id === roleId);
        if (!roleToDelete) return;

        if (['Admin', 'Support', 'Developer'].includes(roleToDelete.name)) {
            alert(`Cannot delete the core "${roleToDelete.name}" role.`);
            return;
        }

        const isRoleInUse = adminUsers.some(user => user.roleId === roleId);
        if (isRoleInUse) {
            alert("Cannot delete a role that is currently assigned to one or more team members.");
            return;
        }
        
        setAdminRoles(prev => prev.filter(role => role.id !== roleId));
    }, [adminUsers, adminRoles]);

    const updateBrandConfig = useCallback((newConfig: Partial<BrandConfig>) => {
        setBrandConfig(prev => ({ ...prev, ...newConfig }));
    }, []);

    const updatePageContent = useCallback((newPageContent: Partial<Omit<PageContent, 'faqs'>>) => {
        setPageContent(prev => ({ ...prev, ...newPageContent }));
    }, []);
    
    const updateFaqs = useCallback((newFaqs: FaqItem[]) => {
        setPageContent(prev => ({ ...prev, faqs: newFaqs }));
    }, []);

    const updatePaymentSettings = useCallback((newSettings: PaymentSettings) => {
        setPaymentSettings(newSettings);
    }, []);
    
    const updateNotificationSettings = useCallback((newSettings: NotificationSettings) => {
        setNotificationSettings(newSettings);
    }, []);

    const addSubscriptionPlan = useCallback((planData: Omit<SubscriptionPlan, 'id'>) => {
        setSubscriptionPlans(prev => [
            ...prev,
            {
                ...planData,
                id: `plan_${planData.name.toLowerCase()}_${Date.now()}`
            }
        ]);
    }, []);

    const updateSubscriptionPlan = useCallback((planId: string, planData: Partial<Omit<SubscriptionPlan, 'id'>>) => {
        setSubscriptionPlans(prev => prev.map(plan =>
            plan.id === planId ? { ...plan, ...planData } : plan
        ));
    }, []);

    const deleteSubscriptionPlan = useCallback((planId: string) => {
        const isPlanInUse = tenants.some(tenant => tenant.planId === planId);
        if (isPlanInUse) {
            alert("Cannot delete a subscription plan that is currently assigned to one or more tenants.");
            return;
        }
        setSubscriptionPlans(prev => prev.filter(plan => plan.id !== planId));
    }, [tenants]);

    const addTruck = useCallback((truckData: Omit<Truck, 'id' | 'lastUpdate'>) => {
        setTrucks(prev => [
            ...prev,
            {
                ...truckData,
                id: `truck-${Date.now()}`,
                lastUpdate: new Date(),
            }
        ]);
    }, []);

    const updateTruck = useCallback((truckId: string, truckData: Partial<Omit<Truck, 'id'>>) => {
        setTrucks(prev => prev.map(truck => 
            truck.id === truckId ? { ...truck, ...truckData, lastUpdate: new Date() } : truck
        ));
    }, []);

    const addShipment = useCallback((shipmentData: Omit<Shipment, 'id'>) => {
        setShipments(prev => [
            ...prev,
            {
                ...shipmentData,
                id: `shp-${Date.now()}`,
            }
        ].sort((a,b) => b.estimatedDelivery.getTime() - a.estimatedDelivery.getTime()));
    }, []);

    const updateShipmentStatus = useCallback((shipmentId: string, status: Shipment['status']) => {
        setShipments(prev => prev.map(shipment => 
            shipment.id === shipmentId ? { ...shipment, status } : shipment
        ));
    }, []);
    
    const updateTrackerProviders = useCallback((providers: TrackerProvider[]) => {
        setTrackerProviders(providers);
    }, []);

    const addBranch = useCallback((branchName: string) => {
        const newBranch: Branch = {
            id: `branch-${Date.now()}`,
            name: branchName,
        };
        setBranches(prev => [...prev, newBranch]);
        setProducts(prev => prev.map(p => ({
            ...p,
            variants: p.variants.map(v => ({
                ...v,
                stockByBranch: {
                    ...v.stockByBranch,
                    [newBranch.id]: 0
                }
            }))
        })));
    }, []);

    const addStaff = useCallback((staffData: Omit<Staff, 'id'>) => {
        const newStaff: Staff = {
            ...staffData,
            id: `staff-${Date.now()}`
        };
        setStaff(prev => [...prev, newStaff]);
    }, []);

    const sellShipment = useCallback(async (shipmentId: string, customer: Sale['customer']): Promise<{success: boolean; message: string;}> => {
        const shipment = shipments.find(s => s.id === shipmentId);
        if (!shipment) return { success: false, message: 'Shipment not found.' };

        // Create sale record from shipment
        const total = shipment.items.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
        const saleItems: CartItem[] = shipment.items.map(item => ({
             productId: item.productId,
             variantId: item.variantId,
             name: item.productName,
             variantName: products.find(p => p.id === item.productId)?.variants.find(v => v.id === item.variantId)?.name || 'N/A',
             quantity: item.quantity,
             sellingPrice: item.sellingPrice,
        }));
        
        const newSale: Sale = {
            id: `sale-${Date.now()}`,
            date: new Date(),
            items: saleItems,
            total,
            branchId: 'DIRECT_SALE',
            customer,
        };
        setSales(prev => [newSale, ...prev]);

        // Update shipment status
        updateShipmentStatus(shipmentId, 'SOLD_IN_TRANSIT');
        
        return { success: true, message: `Shipment ${shipment.shipmentCode} sold to ${customer.name}.` };
    }, [shipments, products, updateShipmentStatus]);

    const receiveShipment = useCallback((shipmentId: string) => {
        const shipment = shipments.find(s => s.id === shipmentId);
        if (!shipment || shipment.status !== 'IN_TRANSIT') return;

        setProducts(prevProducts => {
            const productsCopy = JSON.parse(JSON.stringify(prevProducts));
            for (const item of shipment.items) {
                const product = productsCopy.find((p: Product) => p.id === item.productId);
                if (product) {
                    const variant = product.variants.find((v: ProductVariant) => v.id === item.variantId);
                    if (variant) {
                        variant.stockByBranch[shipment.destination] = (variant.stockByBranch[shipment.destination] || 0) + item.quantity;
                    }
                }
            }
            return productsCopy;
        });

        updateShipmentStatus(shipmentId, 'DELIVERED');

    }, [shipments, updateShipmentStatus]);

    const addPurchaseOrder = useCallback((poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'total' | 'createdAt'>) => {
        const total = poData.items.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
        const newPO: PurchaseOrder = {
            ...poData,
            id: `po-${Date.now()}`,
            poNumber: `PO${Date.now().toString().slice(-6)}`,
            total,
            createdAt: new Date(),
        };
        setPurchaseOrders(prev => [newPO, ...prev]);
    }, []);

    const updatePurchaseOrderStatus = useCallback((poId: string, status: PurchaseOrder['status']) => {
        const po = purchaseOrders.find(p => p.id === poId);
        if (!po) return;

        if (status === 'RECEIVED') {
            const newStockLogs: StockLog[] = [];
            setProducts(prevProducts => {
                const productsCopy = JSON.parse(JSON.stringify(prevProducts));
                po.items.forEach(item => {
                    const product = productsCopy.find((p: Product) => p.variants.some(v => v.id === item.variantId));
                    if(product) {
                        const variant = product.variants.find((v: ProductVariant) => v.id === item.variantId);
                        if(variant) {
                            variant.stockByBranch[po.destinationBranchId] = (variant.stockByBranch[po.destinationBranchId] || 0) + item.quantity;
                             newStockLogs.push({
                                id: `log-${Date.now()}-${item.variantId}`, date: new Date(),
                                productId: product.id, variantId: item.variantId,
                                productName: product.name, variantName: variant.name,
                                action: 'PURCHASE_RECEIVED', quantity: item.quantity,
                                branchId: po.destinationBranchId, referenceId: po.id
                            });
                        }
                    }
                });
                return productsCopy;
            });
             setStockLogs(prev => [...newStockLogs, ...prev]);
        }

        setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status } : p));
    }, [purchaseOrders]);

    const addStaffRole = useCallback((roleData: Omit<StaffRole, 'id'>) => {
        const newRole: StaffRole = {
            id: `staff-role-${Date.now()}`,
            ...roleData
        };
        setStaffRoles(prev => [...prev, newRole]);
    }, []);
    
    const updateStaffRole = useCallback((roleId: string, permissions: TenantPermission[]) => {
        setStaffRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions } : r));
    }, []);
    
    const deleteStaffRole = useCallback((roleId: string) => {
        // Simple deletion logic, add checks for roles in use if needed
        setStaffRoles(prev => prev.filter(r => r.id !== roleId));
    }, []);

    const addAccount = useCallback((accountData: Omit<Account, 'id' | 'balance'>) => {
        const newAccount: Account = { ...accountData, id: `acc-${Date.now()}`, balance: 0 };
        setAccounts(prev => [...prev, newAccount]);
    }, []);

    const addJournalEntry = useCallback((entryData: Omit<JournalEntry, 'id' | 'date'>) => {
        const newEntry: JournalEntry = { ...entryData, id: `je-${Date.now()}`, date: new Date() };
        setJournalEntries(prev => [newEntry, ...prev]);
        
        // Update account balances
        setAccounts(prevAccounts => {
            const updatedAccounts = [...prevAccounts];
            newEntry.transactions.forEach(tx => {
                const account = updatedAccounts.find(a => a.id === tx.accountId);
                if (account) {
                    account.balance += tx.amount;
                }
            });
            return updatedAccounts;
        });
    }, []);

    const addTenant = useCallback((tenantData: Omit<Tenant, 'id' | 'joinDate' | 'status'>) => {
        const newTenant: Tenant = {
            ...tenantData,
            id: `tenant-${Date.now()}`,
            joinDate: new Date(),
            status: 'TRIAL'
        };
        setTenants(prev => [newTenant, ...prev].sort((a,b) => b.joinDate.getTime() - a.joinDate.getTime()));
    }, []);


    const value: AppContextType = {
        products,
        sales,
        branches,
        staff,
        staffRoles,
        allTenantPermissions,
        stockLogs,
        tenants,
        subscriptionPlans,
        adminUsers,
        adminRoles,
        allPermissions,
        currentAdminUser,
        brandConfig,
        pageContent,
        paymentSettings,
        notificationSettings,
        trucks,
        shipments,
        trackerProviders,
        suppliers,
        purchaseOrders,
        accounts,
        journalEntries,
        searchTerm,
        setSearchTerm,
        getMetric,
        addSale,
        adjustStock,
        transferStock,
        addProduct,
        addAdminUser,
        updateAdminUser,
        updateAdminRole,
        addAdminRole,
        deleteAdminRole,
        updateBrandConfig,
        updatePageContent,
        updateFaqs,
        updatePaymentSettings,
        updateNotificationSettings,
        addSubscriptionPlan,
        updateSubscriptionPlan,
        deleteSubscriptionPlan,
        addTruck,
        updateTruck,
        addShipment,
        updateShipmentStatus,
        updateTrackerProviders,
        addBranch,
        addStaff,
        sellShipment,
        receiveShipment,
        addPurchaseOrder,
        updatePurchaseOrderStatus,
        addStaffRole,
        updateStaffRole,
        deleteStaffRole,
        addAccount,
        addJournalEntry,
        addTenant,
        logout: onLogout,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
