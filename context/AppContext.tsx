





import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Product, Sale, AppContextType, ProductVariant, Branch, StockLog, Tenant, SubscriptionPlan, TenantStatus, AdminUser, AdminUserStatus, BrandConfig, PageContent, FaqItem, AdminRole, Permission, PaymentSettings, NotificationSettings, Truck, Shipment, TrackerProvider, Staff, CartItem, StaffRole, TenantPermission, allTenantPermissions, Supplier, PurchaseOrder, Account, JournalEntry, Payment, Announcement, SystemSettings, Currency, Language, TenantAutomations, Customer, Consignment, Category } from '../types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

const mockBranches: Branch[] = [
    { id: 'branch-1', name: 'Downtown' },
    { id: 'branch-2', name: 'Uptown' },
    { id: 'branch-3', name: 'Westside' },
    { id: 'branch-4', name: 'Eastside' },
];

const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Electronics' },
    { id: 'cat-2', name: 'Apparel' },
    { id: 'cat-3', name: 'Groceries' },
    { id: 'cat-4', name: 'Books' },
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

const mockCustomers: Customer[] = [
    { id: 'cust-walkin', name: 'Walk-in Customer', creditBalance: 0 },
    { id: 'cust-1', name: 'John Doe', phone: '555-0101', email: 'john.d@example.com', creditBalance: 150.75, creditLimit: 500 },
    { id: 'cust-2', name: 'Jane Smith', phone: '555-0102', email: 'jane.s@example.com', creditBalance: 0, creditLimit: 1000 },
    { id: 'cust-3', name: 'Prestige Worldwide', phone: '555-0103', email: 'contact@prestigeww.com', creditBalance: 1250.00, creditLimit: 10000 },
];

const mockSubscriptionPlans: SubscriptionPlan[] = [
    { id: 'plan_basic', name: 'Basic', price: 29, description: 'For small businesses just getting started.', features: ['1 Branch', 'Up to 1,000 Products', 'Core POS Features', 'Basic Reporting'], recommended: false },
    { id: 'plan_pro', name: 'Pro', price: 79, description: 'For growing businesses that need more power.', features: ['Up to 5 Branches', 'Unlimited Products', 'Advanced POS Features', 'Full Reporting Suite', 'Staff Management'], recommended: true },
    { id: 'plan_premium', name: 'Premium', price: 149, description: 'For large businesses and enterprises.', features: ['Unlimited Branches', 'Everything in Pro', 'API Access', 'Dedicated Support', 'Advanced Automations'], recommended: false },
];

export const allPermissions: Permission[] = [
    'viewPlatformDashboard',
    'manageTenants',
    'manageSubscriptions',
    'manageTeam',
    'manageRoles',
    'manageSystemSettings',
    'managePaymentGateways',
    'manageNotificationSettings',
    'manageAnnouncements'
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
        
        // Special case for the demo tenant
        const isDemoTenant = i === 0;
        const status = statuses[i % statuses.length];
        const joinDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        let trialEndDate: Date | undefined = undefined;
        if (status === 'TRIAL') {
            trialEndDate = new Date(joinDate.getTime() + 14 * 24 * 60 * 60 * 1000);
        }

        tenants.push({
            id: `tenant-${i+1}`,
            businessName: businessNames[i],
            ownerName: ownerNames[i],
            email: isDemoTenant ? `tenant@example.com` : `${ownerFirstName}@example.com`,
            username: isDemoTenant ? 'tenant' : ownerFirstName,
            password: isDemoTenant ? 'tenant' : 'tenant12345',
            companyAddress: `${i+1}23 Market St, San Francisco, CA 94103`,
            companyPhone: `(555) 123-456${i}`,
            companyLogoUrl: '',
            status: status,
            planId: mockSubscriptionPlans[i % mockSubscriptionPlans.length].id,
            joinDate: joinDate,
            trialEndDate: trialEndDate,
            currency: isDemoTenant ? 'USD' : undefined,
            language: isDemoTenant ? 'en' : undefined,
            automations: {
                generateEODReport: i % 2 === 0,
                sendLowStockAlerts: true,
            }
        });
    }
    return tenants.sort((a,b) => b.joinDate.getTime() - a.joinDate.getTime());
};

const generateMockProducts = (): Product[] => {
    const productNames = {
        [mockCategories[0].id]: ['Laptop', 'Smartphone', 'Headphones', 'Smart Watch'],
        [mockCategories[1].id]: ['T-Shirt', 'Jeans', 'Jacket', 'Sneakers'],
        [mockCategories[2].id]: ['Milk', 'Bread', 'Eggs', 'Cheese'],
        [mockCategories[3].id]: ['Sci-Fi Novel', 'Cookbook', 'History Book', 'Biography']
    };
    const variants = {
        [mockCategories[0].id]: [{name: '16GB RAM', price: 1200}, {name: '32GB RAM', price: 1500}],
        [mockCategories[1].id]: [{name: 'Medium', price: 25}, {name: 'Large', price: 28}],
        [mockCategories[2].id]: [{name: '1 Gallon', price: 4}, {name: 'Half Gallon', price: 2.5}],
        [mockCategories[3].id]: [{name: 'Hardcover', price: 30}, {name: 'Paperback', price: 15}]
    };

    let products: Product[] = [];
    let productId = 1;

    mockCategories.forEach(category => {
        const categoryProductNames = productNames[category.id as keyof typeof productNames] || [];
        categoryProductNames.forEach(name => {
            const hasBatch = category.name === 'Groceries' || (category.name === 'Electronics' && Math.random() > 0.5);
            
            const product: Product = {
                id: `prod-${productId++}`,
                name: name,
                categoryId: category.id,
                isFavorite: Math.random() > 0.7,
                variants: (variants[category.id as keyof typeof variants] || []).map((variant, index) => {
                    const stockByBranch: { [branchId: string]: number } = {};
                    const consignmentStockByBranch: { [branchId: string]: number } = {};

                    mockBranches.forEach(branch => {
                        stockByBranch[branch.id] = Math.floor(Math.random() * 100);
                        if (Math.random() > 0.6) { // 40% chance of having consignment stock
                            consignmentStockByBranch[branch.id] = Math.floor(Math.random() * 50);
                        }
                    });
                    
                    const expiryDate = new Date();
                    expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * 12) + 6);
                    
                    return {
                        id: `var-${productId}-${index}`,
                        name: variant.name,
                        sellingPrice: variant.price,
                        costPrice: variant.price * (Math.random() * 0.3 + 0.5), // Cost is 50-80% of selling price
                        sku: `${name.substring(0,3).toUpperCase()}-${index}`,
                        stockByBranch: stockByBranch,
                        consignmentStockByBranch: consignmentStockByBranch,
                        batchNumber: hasBatch ? `B${Math.floor(Math.random() * 9000) + 1000}` : undefined,
                        expiryDate: hasBatch ? expiryDate.toISOString().split('T')[0] : undefined,
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
    for (let i = 0; i < 50; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const variant = product.variants[Math.floor(Math.random() * product.variants.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const total = variant.sellingPrice * quantity;
        const paidAmount = total * (Math.random() > 0.2 ? 1 : Math.random()); // 80% chance of full payment
        
        sales.push({
            id: `sale-${i}`,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            items: [{
                productId: product.id,
                variantId: variant.id,
                name: product.name,
                variantName: variant.name,
                quantity: quantity,
                sellingPrice: variant.sellingPrice,
                costPrice: variant.costPrice,
            }],
            total: total,
            branchId: mockBranches[Math.floor(Math.random() * mockBranches.length)].id,
            customerId: mockCustomers[Math.floor(Math.random() * mockCustomers.length)].id,
            payments: [{ method: 'Cash', amount: paidAmount }],
            change: 0,
            staffId: mockStaff[Math.floor(Math.random() * mockStaff.length)].id,
            discount: 0,
            status: paidAmount < total ? 'PARTIALLY_PAID' : 'PAID',
            amountDue: total - paidAmount,
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

const mockConsignments: Consignment[] = [
    {
        id: 'con-1', supplierId: 'sup-2', branchId: 'branch-1', receivedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), status: 'ACTIVE',
        items: [
            { variantId: 'var-7-0', productName: 'Jacket', variantName: 'Medium', quantityReceived: 20, quantitySold: 5, costPrice: 50 },
            { variantId: 'var-8-1', productName: 'Sneakers', variantName: 'Large', quantityReceived: 15, quantitySold: 10, costPrice: 40 },
        ]
    }
];


const mockAccounts: Account[] = [
    { id: 'acc-cash', name: 'Cash', type: 'ASSET', balance: 15000 },
    { id: 'acc-ar', name: 'Accounts Receivable', type: 'ASSET', balance: 5000 },
    { id: 'acc-inventory', name: 'Inventory', type: 'ASSET', balance: 25000 },
    { id: 'acc-ap', name: 'Accounts Payable', type: 'LIABILITY', balance: 8000 },
    { id: 'acc-consign-liability', name: 'Consignment Liability', type: 'LIABILITY', balance: 0 },
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
    helpCenter: "## Welcome to the Help Center\n\nFind answers to common questions here. You can browse topics by category or use the search bar to find what you're looking for.",
    apiDocs: "## API Documentation\n\nIntegrate with FlowPay using our powerful REST API. Find detailed information about endpoints, parameters, and authentication.",
    blog: "## Our Latest News\n\nCheck out the latest updates, articles, and case studies from the FlowPay team.",
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

const mockSystemSettings: SystemSettings = {
    currencies: [
        { code: 'USD', name: 'United States Dollar', symbol: '$', enabled: true },
        { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', enabled: true },
        { code: 'EUR', name: 'Euro', symbol: '€', enabled: true },
        { code: 'GBP', name: 'British Pound', symbol: '£', enabled: false },
    ],
    defaultCurrency: 'USD',
    languages: [
        { code: 'en', name: 'English', enabled: true },
        { code: 'es', name: 'Español', enabled: true },
        { code: 'fr', name: 'Français', enabled: false },
    ],
    defaultLanguage: 'en',
};


const mockAnnouncements: Announcement[] = [
    { 
        id: 'anno-1', 
        title: 'Platform Maintenance Scheduled', 
        content: 'We will be performing scheduled maintenance on Sunday at 2 AM UTC. The platform may be temporarily unavailable.',
        targetAudience: 'ALL',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        readBy: []
    },
    { 
        id: 'anno-2', 
        title: 'New Reporting Features Live!', 
        content: 'We have just rolled out advanced new reporting features for all tenants. Check out the Reports page to learn more.',
        targetAudience: 'TENANTS',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        readBy: []
    }
];

interface AppContextProviderProps {
    children: ReactNode;
    onLogout?: () => void;
}

const TENANTS_STORAGE_KEY = 'flowpay-tenants';
const SALES_STORAGE_KEY = 'flowpay-sales';
// The simple login logic implies we are always tenant-1 for the demo
const CURRENT_TENANT_ID = 'tenant-1';

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children, onLogout = () => {} }) => {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    
    const [sales, setSales] = useState<Sale[]>(() => {
        try {
            const storedSales = window.localStorage.getItem(SALES_STORAGE_KEY);
            if (storedSales) {
                const parsedSales = JSON.parse(storedSales);
                return parsedSales.map((sale: any) => ({ ...sale, date: new Date(sale.date) }));
            }
        } catch (error) { console.error("Error reading sales from local storage", error); }
        return mockSales;
    });

    const [tenants, setTenants] = useState<Tenant[]>(() => {
        try {
            const stored = window.localStorage.getItem(TENANTS_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.map((t: any) => ({ ...t, joinDate: new Date(t.joinDate), trialEndDate: t.trialEndDate ? new Date(t.trialEndDate) : undefined }));
            }
        } catch (e) { console.error("Failed to load tenants from storage", e); }
        return mockTenants;
    });

    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(() => {
        const initialTenants = (() => {
            try {
                const stored = window.localStorage.getItem(TENANTS_STORAGE_KEY);
                return stored ? JSON.parse(stored).map((t: any) => ({ ...t, joinDate: new Date(t.joinDate) })) : mockTenants;
            } catch { return mockTenants; }
        })();
        return initialTenants.find((t: Tenant) => t.id === CURRENT_TENANT_ID) || null;
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
        } catch (error) { console.error("Error saving sales to local storage", error); }
    }, [sales]);

    useEffect(() => {
        try {
            window.localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
            setCurrentTenant(tenants.find(t => t.id === CURRENT_TENANT_ID) || null);
        } catch (e) { console.error("Failed to save tenants to storage", e); }
    }, [tenants]);

    const [branches, setBranches] = useState<Branch[]>(mockBranches);
    const [categories, setCategories] = useState<Category[]>(mockCategories);
    const [staff, setStaff] = useState<Staff[]>(mockStaff);
    const [staffRoles, setStaffRoles] = useState<StaffRole[]>(mockStaffRoles);
    const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(mockSubscriptionPlans);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>(mockAdminUsers);
    const [adminRoles, setAdminRoles] = useState<AdminRole[]>(mockAdminRoles);
    const [currentAdminUser] = useState<AdminUser | null>(mockAdminUsers.find(u => u.email === 'admin@flowpay.com') || null);
    const [brandConfig, setBrandConfig] = useState<BrandConfig>(mockBrandConfig);
    const [pageContent, setPageContent] = useState<PageContent>(mockPageContent);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(mockPaymentSettings);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings);
    const [systemSettings, setSystemSettings] = useState<SystemSettings>(mockSystemSettings);
    const [currentLanguage, setCurrentLanguage] = useState<string>(currentTenant?.language || mockSystemSettings.defaultLanguage);
    const [currentCurrency, setCurrentCurrency] = useState<string>(currentTenant?.currency || mockSystemSettings.defaultCurrency);
    const [trucks, setTrucks] = useState<Truck[]>(mockTrucks);
    const [shipments, setShipments] = useState<Shipment[]>(mockShipments);
    const [trackerProviders, setTrackerProviders] = useState<TrackerProvider[]>(mockTrackerProviders);
    const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
    const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(mockJournalEntries);
    const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
    const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
    const [consignments, setConsignments] = useState<Consignment[]>(mockConsignments);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        if (currentTenant) {
            setCurrentLanguage(currentTenant.language || systemSettings.defaultLanguage);
            setCurrentCurrency(currentTenant.currency || systemSettings.defaultCurrency);
        }
    }, [currentTenant, systemSettings.defaultLanguage, systemSettings.defaultCurrency]);

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

    const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'date' | 'status' | 'amountDue'>): Promise<{success: boolean, message: string, newSale?: Sale}> => {
        // Create a mutable deep copy of items to update cost prices.
        const processedItems: CartItem[] = JSON.parse(JSON.stringify(saleData.items));
    
        // This array will hold functions to update state, to be run after calculations.
        const stateUpdateQueue: (() => void)[] = [];
    
        for (const item of processedItems) {
            const product = products.find(p => p.id === item.productId);
            const variant = product?.variants.find(v => v.id === item.variantId);
    
            if (variant) {
                let totalCostForItem = 0;
                let qtyToDeduct = item.quantity;
                let deductedFromConsign = 0;
                const branchId = saleData.branchId;
    
                // 1. Fulfill from consignment stock first
                const consignmentStock = variant.consignmentStockByBranch?.[branchId] || 0;
                if (consignmentStock > 0) {
                    const qtyFromConsign = Math.min(qtyToDeduct, consignmentStock);
                    
                    const activeConsignment = consignments.find(c => 
                        c.branchId === branchId &&
                        c.status === 'ACTIVE' &&
                        c.items.some(ci => ci.variantId === item.variantId)
                    );
    
                    if (activeConsignment) {
                        const consignmentItem = activeConsignment.items.find(ci => ci.variantId === item.variantId);
                        if (consignmentItem) {
                            totalCostForItem += qtyFromConsign * consignmentItem.costPrice;
                            qtyToDeduct -= qtyFromConsign;
                            deductedFromConsign = qtyFromConsign;
    
                            // Queue up consignment update.
                            stateUpdateQueue.push(() => {
                                setConsignments(prev => prev.map(con => {
                                    if (con.id === activeConsignment.id) {
                                        return {
                                            ...con,
                                            items: con.items.map(ci => 
                                                ci.variantId === item.variantId 
                                                    ? { ...ci, quantitySold: ci.quantitySold + qtyFromConsign } 
                                                    : ci
                                            )
                                        };
                                    }
                                    return con;
                                }));
                            });
                        }
                    }
                }
    
                // 2. Fulfill remaining from owned stock.
                if (qtyToDeduct > 0) {
                    totalCostForItem += qtyToDeduct * variant.costPrice;
                }
    
                // 3. Calculate average cost for this cart item and update it.
                item.costPrice = item.quantity > 0 ? totalCostForItem / item.quantity : 0;
    
                // 4. Queue up product stock update for both stock types.
                const qtyFromOwned = item.quantity - deductedFromConsign;
                stateUpdateQueue.push(() => {
                    setProducts(prevProducts => {
                        return prevProducts.map(p => {
                            if (p.id === item.productId) {
                                return {
                                    ...p,
                                    variants: p.variants.map(v => {
                                        if (v.id === item.variantId) {
                                            const newStockByBranch = { ...v.stockByBranch };
                                            if (qtyFromOwned > 0) {
                                                newStockByBranch[branchId] = (newStockByBranch[branchId] || 0) - qtyFromOwned;
                                            }
    
                                            const newConsignmentStockByBranch = { ...(v.consignmentStockByBranch || {}) };
                                            if (deductedFromConsign > 0) {
                                                newConsignmentStockByBranch[branchId] = (newConsignmentStockByBranch[branchId] || 0) - deductedFromConsign;
                                            }
    
                                            return {
                                                ...v,
                                                stockByBranch: newStockByBranch,
                                                consignmentStockByBranch: newConsignmentStockByBranch,
                                            };
                                        }
                                        return v;
                                    })
                                };
                            }
                            return p;
                        });
                    });
                });
            }
        }
        
        // Now, create the new Sale object with the processed items
        const totalPaid = saleData.payments.reduce((acc, p) => acc + p.amount, 0) - saleData.change;
        const amountDue = saleData.total - totalPaid;
    
        const newSale: Sale = {
            ...saleData,
            items: processedItems, // Use the items with correct cost prices
            id: `sale-${Date.now()}`,
            date: new Date(),
            amountDue: amountDue > 0 ? amountDue : 0,
            status: amountDue <= 0 ? 'PAID' : 'PARTIALLY_PAID'
        };
        
        // Execute all queued state updates for stock and consignments
        stateUpdateQueue.forEach(updateFn => updateFn());
    
        // Update customer credit balance if necessary
        if (newSale.amountDue > 0) {
            setCustomers(prevCustomers => prevCustomers.map(c => 
                c.id === newSale.customerId ? { ...c, creditBalance: c.creditBalance + newSale.amountDue } : c
            ));
        }
        
        // Create stock logs for the sale
        const newStockLogs: StockLog[] = processedItems.map(item => ({
            id: `log-${Date.now()}-${item.variantId}`, date: new Date(),
            productId: item.productId, variantId: item.variantId,
            productName: item.name, variantName: item.variantName,
            action: 'SALE', quantity: -item.quantity,
            branchId: saleData.branchId, referenceId: newSale.id
        }));
        
        setStockLogs(prev => [...newStockLogs, ...prev]);
        
        // Add the new sale to the sales list
        setSales(prev => [newSale, ...prev]);
    
        // Handle SMS notifications
        let notificationMessage = '';
        const customer = customers.find(c => c.id === newSale.customerId);
        if (notificationSettings.sms.twilio.enabled && customer?.phone) {
             if (!notificationSettings.sms.twilio.accountSid || !notificationSettings.sms.twilio.apiKey || !notificationSettings.sms.twilio.fromNumber) {
                 notificationMessage = ' Twilio is enabled but not configured.';
            } else {
                console.log(`Simulating Twilio SMS to ${customer.phone} from ${notificationSettings.sms.twilio.fromNumber}: Order confirmation for $${saleData.total.toFixed(2)}.`);
                notificationMessage = ` SMS confirmation sent to ${customer.phone}.`;
            }
        }
        
        return { success: true, message: `Sale completed!${notificationMessage}`, newSale: newSale };
    }, [products, consignments, customers, notificationSettings]);
    
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

    const updateProductVariant = useCallback((productId: string, variantId: string, variantData: Partial<Omit<ProductVariant, 'id' | 'stockByBranch'>>) => {
        setProducts(prevProducts =>
            prevProducts.map(p => {
                if (p.id === productId) {
                    return {
                        ...p,
                        variants: p.variants.map(v =>
                            v.id === variantId ? { ...v, ...variantData } : v
                        )
                    };
                }
                return p;
            })
        );
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

    const updateSystemSettings = useCallback((newSettings: Partial<SystemSettings>) => {
        setSystemSettings(prev => ({ ...prev, ...newSettings }));
    }, []);
    
    const updateCurrentTenantSettings = useCallback((newSettings: Partial<Pick<Tenant, 'currency' | 'language'>>) => {
        setTenants(prevTenants =>
            prevTenants.map(t =>
                t.id === CURRENT_TENANT_ID ? { ...t, ...newSettings } : t
            )
        );
        if(newSettings.language) setCurrentLanguage(newSettings.language);
        if(newSettings.currency) setCurrentCurrency(newSettings.currency);
    }, []);
    
    const updateTenantAutomations = useCallback((newAutomations: Partial<TenantAutomations>) => {
        setTenants(prevTenants =>
            prevTenants.map(t => {
                if (t.id === CURRENT_TENANT_ID) {
                    return { ...t, automations: { ...(t.automations || { generateEODReport: false, sendLowStockAlerts: false }), ...newAutomations } };
                }
                return t;
            })
        );
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

    const sellShipment = useCallback(async (shipmentId: string, customerData: Pick<Customer, 'name' | 'phone'>): Promise<{success: boolean; message: string;}> => {
        const shipment = shipments.find(s => s.id === shipmentId);
        if (!shipment) return { success: false, message: 'Shipment not found.' };

        // For simplicity, this direct sale is always to a walk-in customer.
        const customerId = 'cust-walkin'; 
        
        const total = shipment.items.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
        const saleItems: CartItem[] = shipment.items.map(item => ({
             productId: item.productId,
             variantId: item.variantId,
             name: item.productName,
             variantName: products.find(p => p.id === item.productId)?.variants.find(v => v.id === item.variantId)?.name || 'N/A',
             quantity: item.quantity,
             sellingPrice: item.sellingPrice,
             costPrice: products.find(p => p.id === item.productId)?.variants.find(v => v.id === item.variantId)?.costPrice || 0,
        }));
        
        const newSale: Omit<Sale, 'id' | 'date' | 'status' | 'amountDue'> = {
            items: saleItems,
            total,
            branchId: 'DIRECT_SALE',
            customerId,
            payments: [{ method: 'Cargo Sale', amount: total }],
            change: 0,
            staffId: 'staff-1', // Default staff for direct cargo sales
            discount: 0,
        };
        await addSale(newSale);

        updateShipmentStatus(shipmentId, 'SOLD_IN_TRANSIT');
        
        return { success: true, message: `Shipment ${shipment.shipmentCode} sold to ${customerData.name}.` };
    }, [shipments, products, updateShipmentStatus, addSale]);

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

    const addTenant = useCallback((tenantData: Omit<Tenant, 'id' | 'joinDate' | 'status' | 'trialEndDate'>) => {
        const joinDate = new Date();
        const newTenant: Tenant = {
            ...tenantData,
            id: `tenant-${Date.now()}`,
            joinDate: joinDate,
            status: 'TRIAL',
            trialEndDate: new Date(joinDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
        };
        setTenants(prev => [newTenant, ...prev].sort((a,b) => b.joinDate.getTime() - a.joinDate.getTime()));
    }, []);
    
    const addAnnouncement = useCallback((announcementData: Omit<Announcement, 'id' | 'createdAt' | 'readBy'>) => {
        const newAnnouncement: Announcement = {
            ...announcementData,
            id: `anno-${Date.now()}`,
            createdAt: new Date(),
            readBy: []
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
    }, []);

    const markAnnouncementAsRead = useCallback((announcementId: string, userId: string) => {
        setAnnouncements(prev => prev.map(anno => {
            if (anno.id === announcementId && !anno.readBy.includes(userId)) {
                return { ...anno, readBy: [...anno.readBy, userId] };
            }
            return anno;
        }));
    }, []);

    const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'creditBalance'>) => {
        const newCustomer: Customer = {
            ...customerData,
            id: `cust-${Date.now()}`,
            creditBalance: 0,
        };
        setCustomers(prev => [newCustomer, ...prev]);
    }, []);

    const recordCreditPayment = useCallback((customerId: string, amount: number) => {
        setCustomers(prev => prev.map(c => 
            c.id === customerId ? { ...c, creditBalance: c.creditBalance - amount } : c
        ));
        addJournalEntry({
            description: `Credit payment from customer ${customerId}`,
            transactions: [
                { accountId: 'acc-cash', amount: amount }, // Debit Cash
                { accountId: 'acc-ar', amount: -amount } // Credit Accounts Receivable
            ]
        });
    }, [addJournalEntry]);

    const addConsignment = useCallback((consignmentData: Omit<Consignment, 'id' | 'status'>) => {
        const newConsignment: Consignment = {
            ...consignmentData,
            id: `con-${Date.now()}`,
            status: 'ACTIVE'
        };
        setConsignments(prev => [newConsignment, ...prev]);

        // Add stock to products
        setProducts(prevProducts => {
            const productsCopy = JSON.parse(JSON.stringify(prevProducts));
            newConsignment.items.forEach(item => {
                const product = productsCopy.find((p: Product) => p.variants.some(v => v.id === item.variantId));
                if (product) {
                    const variant = product.variants.find((v: ProductVariant) => v.id === item.variantId);
                    if (variant) {
                        if (!variant.consignmentStockByBranch) {
                            variant.consignmentStockByBranch = {};
                        }
                        variant.consignmentStockByBranch[newConsignment.branchId] = (variant.consignmentStockByBranch[newConsignment.branchId] || 0) + item.quantityReceived;
                    }
                }
            });
            return productsCopy;
        });
    }, []);

    const addCategory = useCallback((categoryName: string) => {
        const newCategory: Category = {
            id: `cat-${Date.now()}`,
            name: categoryName,
        };
        setCategories(prev => [...prev, newCategory]);
    }, []);

    const updateCategory = useCallback((categoryId: string, newName: string) => {
        setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, name: newName } : cat));
    }, []);

    const deleteCategory = useCallback((categoryId: string) => {
        const isCategoryInUse = products.some(p => p.categoryId === categoryId);
        if (isCategoryInUse) {
            alert("Cannot delete category. It is currently assigned to one or more products.");
            return;
        }
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }, [products]);
    
    const extendTrial = useCallback((tenantId: string, days: number) => {
        setTenants(prev => prev.map(t => {
            if (t.id === tenantId && t.trialEndDate) {
                const newEndDate = new Date(t.trialEndDate);
                newEndDate.setDate(newEndDate.getDate() + days);
                return { ...t, trialEndDate: newEndDate };
            }
            return t;
        }));
    }, []);

    const activateSubscription = useCallback((tenantId: string, planId: string) => {
        setTenants(prev => prev.map(t => {
            if (t.id === tenantId) {
                const updatedTenant: Partial<Tenant> & { id: string } = { ...t, status: 'ACTIVE' as TenantStatus, planId };
                delete updatedTenant.trialEndDate;
                return updatedTenant as Tenant;
            }
            return t;
        }));
    }, []);

    const processExpiredTrials = useCallback(() => {
        const now = new Date();
        let processed = 0;
        let suspended = 0;
        setTenants(prev => {
            const newTenants = prev.map(t => {
                if (t.status === 'TRIAL' && t.trialEndDate) {
                    processed++;
                    const trialEndDate = new Date(t.trialEndDate);
                    if (trialEndDate < now) {
                        suspended++;
                        return { ...t, status: 'SUSPENDED' as TenantStatus };
                    }
                }
                return t;
            });
            return newTenants;
        });
        return { processed, suspended };
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
        currentTenant,
        subscriptionPlans,
        adminUsers,
        adminRoles,
        allPermissions,
        currentAdminUser,
        brandConfig,
        pageContent,
        paymentSettings,
        notificationSettings,
        systemSettings,
        trucks,
        shipments,
        trackerProviders,
        suppliers,
        purchaseOrders,
        accounts,
        journalEntries,
        announcements,
        customers,
        consignments,
        categories,
        searchTerm,
        currentLanguage,
        currentCurrency,
        setCurrentCurrency,
        setCurrentLanguage,
        setSearchTerm,
        getMetric,
        addSale,
        adjustStock,
        transferStock,
        addProduct,
        updateProductVariant,
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
        updateSystemSettings,
        updateCurrentTenantSettings,
        updateTenantAutomations,
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
        addAnnouncement,
        markAnnouncementAsRead,
        addCustomer,
        recordCreditPayment,
        addConsignment,
        addCategory,
        updateCategory,
        deleteCategory,
        extendTrial,
        activateSubscription,
        processExpiredTrials,
        logout: onLogout,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};