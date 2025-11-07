

import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Product, Sale, AppContextType, ProductVariant, Branch, StockLog, Tenant, SubscriptionPlan, TenantStatus, AdminUser, AdminUserStatus, BrandConfig, PageContent, FaqItem, AdminRole, Permission, PaymentSettings, NotificationSettings, Truck, Shipment, TrackerProvider, Staff, CartItem, StaffRole, TenantPermission, allTenantPermissions, Supplier, PurchaseOrder, Account, JournalEntry, Payment, Announcement, SystemSettings, Currency, Language, TenantAutomations, Customer, Consignment, Category, PaymentTransaction, EmailTemplate, SmsTemplate, InAppNotification, MaintenanceSettings, AccessControlSettings, LandingPageMetrics, AuditLog, NotificationType, Deposit, SupportTicket, TicketMessage } from '../types';

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
    { id: 'staff-role-cashier', name: 'Cashier', permissions: ['accessPOS', 'viewReports', 'makeDeposits', 'accessReturns'] },
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
    { id: 'plan_basic', name: 'Basic', price: 29, priceYearly: 278, description: 'For small businesses just getting started.', features: ['1 Branch', 'Up to 1,000 Products', 'Core POS Features', 'Basic Reporting'], recommended: false },
    { id: 'plan_pro', name: 'Pro', price: 79, priceYearly: 758, description: 'For growing businesses that need more power.', features: ['Up to 5 Branches', 'Unlimited Products', 'Advanced POS Features', 'Full Reporting Suite', 'Staff Management'], recommended: true },
    { id: 'plan_premium', name: 'Premium', price: 149, priceYearly: 1430, description: 'For large businesses and enterprises.', features: ['Unlimited Branches', 'Everything in Pro', 'API Access', 'Dedicated Support', 'Advanced Automations'], recommended: false },
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
    'manageAnnouncements',
    'viewAuditLogs',
    'manageSupport'
];

const mockAdminRoles: AdminRole[] = [
    { id: 'role-admin', name: 'Admin', permissions: [...allPermissions] },
    { id: 'role-support', name: 'Support', permissions: ['viewPlatformDashboard', 'manageTenants', 'manageSupport'] },
    { id: 'role-developer', name: 'Developer', permissions: ['viewPlatformDashboard', 'manageSystemSettings'] }
];


const generateMockAdminUsers = (): AdminUser[] => {
    const users: Omit<AdminUser, 'phone' | 'lastLoginIp' | 'lastLoginDate'>[] = [
        { id: 'admin-1', name: 'Super Admin', email: 'super@flowpay.com', username: 'super', password: 'super', roleId: 'role-admin', status: 'ACTIVE', joinDate: new Date('2023-01-15'), avatarUrl: 'https://i.pravatar.cc/150?u=admin-1' },
        { id: 'admin-2', name: 'Jane Smith (Support)', email: 'jane.s@flowpay.com', username: 'jane', password: 'password', roleId: 'role-support', status: 'ACTIVE', joinDate: new Date('2023-05-20'), avatarUrl: 'https://i.pravatar.cc/150?u=admin-2' },
        { id: 'admin-3', name: 'Mike Johnson (Developer)', email: 'mike.j@flowpay.com', username: 'mike', password: 'password', roleId: 'role-developer', status: 'ACTIVE', joinDate: new Date('2023-08-01'), avatarUrl: 'https://i.pravatar.cc/150?u=admin-3' },
        { id: 'admin-4', name: 'Emily Davis (Support)', email: 'emily.d@flowpay.com', username: 'emily', password: 'password', roleId: 'role-support', status: 'SUSPENDED', joinDate: new Date('2023-10-11'), avatarUrl: 'https://i.pravatar.cc/150?u=admin-4' },
    ];
    return users.map((u, i) => ({
        ...u, 
        phone: `555-123-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        lastLoginIp: `198.51.100.${i + 1}`,
        lastLoginDate: new Date(Date.now() - (i + 1) * 2 * 60 * 60 * 1000) // 2, 4, 6... hours ago
    }));
};

const generateMockTenants = (): Tenant[] => {
    const tenants: Tenant[] = [];
    const businessNames = ['Innovate Inc.', 'Quantum Solutions', 'Stellar Goods', 'Apex Retail', 'Zenith Supplies', 'Synergy Corp', 'Momentum Trading', 'Odyssey Services'];
    const ownerNames = ['Alice Johnson', 'Bob Williams', 'Charlie Brown', 'Diana Miller', 'Ethan Davis', 'Fiona Garcia', 'George Rodriguez', 'Helen Martinez'];
    const statuses: TenantStatus[] = ['ACTIVE', 'TRIAL', 'SUSPENDED', 'UNVERIFIED'];

    for (let i = 0; i < 8; i++) {
        const ownerFirstName = ownerNames[i].split(' ')[0].toLowerCase();
        
        // Special case for the demo tenant
        const isDemoTenant = i === 0;
        const status = isDemoTenant ? 'ACTIVE' : statuses[i % statuses.length];
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
            country: 'US',
            state: 'CA',
            phoneCountryCode: '+1',
            companyPhone: `(555) 123-456${i}`,
            companyLogoUrl: '',
            status: status,
            planId: mockSubscriptionPlans[i % mockSubscriptionPlans.length].id,
            joinDate: joinDate,
            trialEndDate: trialEndDate,
            currency: isDemoTenant ? 'USD' : undefined,
            language: isDemoTenant ? 'en' : undefined,
            logoutTimeout: isDemoTenant ? 30 : undefined,
            automations: {
                generateEODReport: i % 2 === 0,
                sendLowStockAlerts: true,
            },
            isVerified: status !== 'UNVERIFIED',
            billingCycle: i % 2 === 0 ? 'monthly' : 'yearly',
            logisticsConfig: isDemoTenant ? { activeTrackerProviderId: 'teltonika' } : undefined,
            lastLoginIp: `192.0.2.${i + 10}`,
            lastLoginDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000), // 1, 2, 3... days ago
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
                    const reorderPointByBranch: { [branchId: string]: number } = {};

                    mockBranches.forEach(branch => {
                        stockByBranch[branch.id] = Math.floor(Math.random() * 100);
                        reorderPointByBranch[branch.id] = Math.floor(Math.random() * 15) + 5; // Reorder point between 5 and 20
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
                        reorderPointByBranch: reorderPointByBranch,
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
    { id: 'samsara', name: 'Samsara', apiKey: '', apiEndpoint: 'https://api.samsara.com' },
    { id: 'geotab', name: 'Geotab', apiKey: '', apiEndpoint: 'https://my.geotab.com/api' },
    { id: 'keeptruckin', name: 'KeepTruckin (Motive)', apiKey: '', apiEndpoint: 'https://api.keeptruckin.com' },
    { id: 'other', name: 'Other Provider', apiKey: '', apiEndpoint: '' },
];

const mockTrucks: Truck[] = [
    { 
        id: 'truck-1', 
        licensePlate: 'TRK-001', 
        driverName: 'John Smith', 
        status: 'IN_TRANSIT', 
        currentLocation: { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
        lastUpdate: new Date(),
        currentLoad: 15400,
        maxLoad: 25000,
    },
    { 
        id: 'truck-2', 
        licensePlate: 'TRK-002', 
        driverName: 'Maria Garcia', 
        status: 'IDLE', 
        currentLocation: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        currentLoad: 0,
        maxLoad: 20000,
    },
    { 
        id: 'truck-3', 
        licensePlate: 'TRK-003', 
        driverName: 'Chen Wei', 
        status: 'MAINTENANCE', 
        currentLocation: { lat: 29.7604, lng: -95.3698, address: 'Houston, TX' },
        lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        currentLoad: 5000,
        maxLoad: 22000,
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
        smtp: { host: 587, port: 587, user: 'user', pass: 'password' }
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
            enabled: true,
            serverKey: 'firebase-server-key-123',
            vapidKey: 'firebase-vapid-key-456'
        },
        oneSignal: {
            enabled: true,
            appId: 'onesignal-app-id-789',
            apiKey: 'onesignal-api-key-abc',
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
    maintenanceSettings: {
        isActive: false,
        message: 'The platform is currently undergoing scheduled maintenance. We expect to be back online shortly. Thank you for your patience.'
    },
    accessControlSettings: {
        mode: 'ALLOW_ALL',
        ipWhitelist: [],
        ipBlacklist: ['81.91.130.5'],
        countryWhitelist: [],
        countryBlacklist: ['IR', 'KP'],
        regionWhitelist: [],
        regionBlacklist: [],
        browserWhitelist: [],
        browserBlacklist: ['IE'],
        deviceWhitelist: [],
        deviceBlacklist: [],
    },
    landingPageMetrics: {
        businesses: { value: 2500, label: 'Businesses Powered' },
        users: { value: 15000, label: 'Active Users Daily' },
        revenue: { value: 50, label: 'Million in Revenue Secured' },
    }
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

const mockPaymentTransactions: PaymentTransaction[] = [
    { id: 'txn-1', tenantId: 'tenant-1', planId: 'plan_pro', amount: 79, method: 'Stripe', status: 'COMPLETED', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), transactionId: 'pi_123' },
    { id: 'txn-2', tenantId: 'tenant-2', planId: 'plan_basic', amount: 29, method: 'Manual', status: 'PENDING', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), proofOfPaymentUrl: '/mock/proof.jpg' },
    { id: 'txn-3', tenantId: 'tenant-4', planId: 'plan_pro', amount: 79, method: 'Stripe', status: 'FAILED', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), transactionId: 'pi_456' },
];

const mockEmailTemplates: EmailTemplate[] = [
    { id: 'email-welcome', name: 'Welcome Email', subject: 'Welcome to FlowPay, {{tenantName}}!', body: 'Hello {{tenantName}},\n\nWelcome aboard! We are excited to have you.\n\nThanks,\nThe FlowPay Team' },
    { id: 'email-invoice', name: 'Invoice Notification', subject: 'Your Invoice for {{planName}} is ready', body: 'Hi {{tenantName}},\n\nThis is to inform you that your invoice for the amount of {{amount}} is now available.\n\nThanks,' },
];

const mockSmsTemplates: SmsTemplate[] = [
    { id: 'sms-welcome', name: 'Welcome SMS', body: 'Welcome to FlowPay, {{tenantName}}! We are happy to have you.' },
    { id: 'sms-payment-reminder', name: 'Payment Reminder', body: 'Hi {{tenantName}}, a friendly reminder that your payment of {{amount}} for your {{planName}} plan is due soon.' },
];

const mockInAppNotifications: InAppNotification[] = [
    { id: 'notif-1', userId: 'tenant-1', message: 'Your stock for "Laptop" is running low in the Downtown branch.', read: false, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { id: 'notif-2', userId: 'tenant-1', message: 'A new announcement has been posted by the platform admin.', read: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
];

const mockSupportTickets: SupportTicket[] = [
    {
        id: 'ticket-1', tenantId: 'tenant-1', subject: 'Cannot log in to POS on tablet',
        department: 'Technical', priority: 'High', status: 'Open',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        messages: [
            { id: 'msg-1', sender: 'TENANT', message: 'Hi, I am unable to log into the POS system on our store tablet. It keeps saying "invalid credentials" but they are correct.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
        ]
    },
    {
        id: 'ticket-2', tenantId: 'tenant-1', subject: 'Question about billing cycle',
        department: 'Billing', priority: 'Low', status: 'In Progress',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        messages: [
            { id: 'msg-2', sender: 'TENANT', message: 'How do I change from monthly to yearly billing?', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
            { id: 'msg-3', sender: 'ADMIN', message: 'Hi there, you can change your billing cycle from the "Billing" page in your dashboard. Let me know if you need further assistance.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ]
    },
    {
        id: 'ticket-3', tenantId: 'tenant-2', subject: 'Product import failed',
        department: 'Technical', priority: 'Medium', status: 'Closed',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        messages: [
            { id: 'msg-4', sender: 'TENANT', message: 'The CSV import for new products is failing.', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
            { id: 'msg-5', sender: 'ADMIN', message: 'We have identified and resolved the issue with the importer. Please try again.', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) }
        ]
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

const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedPrefs = window.localStorage.getItem('theme');
        if (typeof storedPrefs === 'string') {
            return storedPrefs as 'light' | 'dark';
        }

        const userMedia = window.matchMedia('(prefers-color-scheme: light)');
        if (userMedia.matches) {
            return 'light';
        }
    }
    return 'dark';
};


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
                return stored ? JSON.parse(stored).map((t: any) => ({ ...t, joinDate: new Date(t.joinDate), trialEndDate: t.trialEndDate ? new Date(t.trialEndDate) : undefined })) : mockTenants;
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
            const updatedCurrentTenant = tenants.find(t => t.id === CURRENT_TENANT_ID) || null;
            if (JSON.stringify(updatedCurrentTenant) !== JSON.stringify(currentTenant)) {
                setCurrentTenant(updatedCurrentTenant);
            }
        } catch (e) { console.error("Failed to save tenants to storage", e); }
    }, [tenants, currentTenant]);

    const [branches, setBranches] = useState<Branch[]>(mockBranches);
    const [categories, setCategories] = useState<Category[]>(mockCategories);
    const [staff, setStaff] = useState<Staff[]>(mockStaff);
    const [staffRoles, setStaffRoles] = useState<StaffRole[]>(mockStaffRoles);
    const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(mockSubscriptionPlans);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>(mockAdminUsers);
    const [adminRoles, setAdminRoles] = useState<AdminRole[]>(mockAdminRoles);
    const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(mockAdminUsers.find(u => u.email === 'super@flowpay.com') || null);
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
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
    const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>(mockPaymentTransactions);
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
    const [smsTemplates, setSmsTemplates] = useState<SmsTemplate[]>(mockSmsTemplates);
    const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>(mockInAppNotifications);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(mockSupportTickets);
    const [notification, setNotification] = useState<NotificationType | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    // To test permissions, change the index: 0=Manager (all perms), 1=Cashier (limited), 2=Logistics (limited)
    const [currentStaffUser, setCurrentStaffUser] = useState<Staff | null>(mockStaff[0]);

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark = theme === 'dark';

        root.classList.remove(isDark ? 'light' : 'dark');
        root.classList.add(theme);

        localStorage.setItem('theme', theme);
    }, [theme]);

    const logAction = useCallback((action: string, details: string, user?: { id: string; name: string; type: 'STAFF' | 'TENANT' | 'SUPER_ADMIN' }) => {
        const userToLog = user || (currentAdminUser ? { id: currentAdminUser.id, name: currentAdminUser.name, type: 'SUPER_ADMIN' } : (currentTenant ? { id: currentTenant.id, name: currentTenant.ownerName, type: 'TENANT' } : null));
    
        if (userToLog) {
            const newLog: AuditLog = {
                id: `log-${Date.now()}`,
                timestamp: new Date(),
                userId: userToLog.id,
                userName: userToLog.name,
                userType: userToLog.type,
                tenantId: (userToLog.type === 'STAFF' || userToLog.type === 'TENANT') ? currentTenant?.id : undefined,
                action,
                details,
            };
            setAuditLogs(prev => [newLog, ...prev]);
        }
    }, [currentAdminUser, currentTenant]);

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
        const processedItems: CartItem[] = JSON.parse(JSON.stringify(saleData.items));
        const stateUpdateQueue: (() => void)[] = [];
    
        for (const item of processedItems) {
            const product = products.find(p => p.id === item.productId);
            const variant = product?.variants.find(v => v.id === item.variantId);
    
            if (variant) {
                let totalCostForItem = 0;
                let qtyToDeduct = item.quantity;
                let deductedFromConsign = 0;
                const branchId = saleData.branchId;
    
                if (qtyToDeduct > 0) {
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
                }
    
                if (qtyToDeduct !== 0) {
                    totalCostForItem += qtyToDeduct * variant.costPrice;
                }
    
                item.costPrice = item.quantity !== 0 ? totalCostForItem / item.quantity : 0;
    
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
                                            if (qtyFromOwned !== 0) {
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
        
        const totalPaid = saleData.payments.reduce((acc, p) => acc + p.amount, 0) - saleData.change;
        const amountDue = saleData.total - totalPaid;
    
        const newSale: Sale = {
            ...saleData,
            items: processedItems,
            id: `sale-${Date.now()}`,
            date: new Date(),
            amountDue: amountDue > 0 ? amountDue : 0,
            status: amountDue <= 0 ? 'PAID' : 'PARTIALLY_PAID'
        };
        
        stateUpdateQueue.forEach(updateFn => updateFn());
    
        if (newSale.amountDue > 0) {
            setCustomers(prevCustomers => prevCustomers.map(c => 
                c.id === newSale.customerId ? { ...c, creditBalance: c.creditBalance + newSale.amountDue } : c
            ));
        }
        
        const depositPaymentAmount = saleData.payments.filter(p => p.method === 'Deposit').reduce((sum, p) => sum + p.amount, 0);

        if (depositPaymentAmount > 0) {
            setDeposits(prevDeposits => {
                let amountToApply = depositPaymentAmount;
                const updatedDeposits = [...prevDeposits];

                const customerActiveDepositsIndices = updatedDeposits
                    .map((d, index) => ({ deposit: d, index }))
                    .filter(({ deposit }) => deposit.customerId === saleData.customerId && deposit.status === 'ACTIVE')
                    .sort((a, b) => new Date(a.deposit.date).getTime() - new Date(b.deposit.date).getTime())
                    .map(item => item.index);

                for (const index of customerActiveDepositsIndices) {
                    if (amountToApply <= 0) break;
                    
                    const deposit = updatedDeposits[index];
                    const amountToUse = Math.min(deposit.amount, amountToApply);
                    
                    if (amountToUse >= deposit.amount) { // Full use
                        updatedDeposits[index] = { ...deposit, status: 'APPLIED', appliedSaleId: newSale.id };
                    } else { // Partial use
                        updatedDeposits[index] = { ...deposit, amount: amountToUse, status: 'APPLIED', appliedSaleId: newSale.id };
                        const remainderDeposit: Deposit = { ...deposit, id: `dep-rem-${Date.now()}`, amount: deposit.amount - amountToUse, date: new Date(), appliedSaleId: undefined };
                        updatedDeposits.push(remainderDeposit);
                    }
                    amountToApply -= amountToUse;
                }
                return updatedDeposits;
            });
        }
        
        const newStockLogs: StockLog[] = processedItems.map(item => ({
            id: `log-${Date.now()}-${item.variantId}`, date: new Date(),
            productId: item.productId, variantId: item.variantId,
            productName: item.name, variantName: item.variantName,
            action: item.quantity < 0 ? 'RETURN' : 'SALE',
            quantity: -item.quantity,
            branchId: saleData.branchId, referenceId: newSale.id
        }));
        
        setStockLogs(prev => [...newStockLogs, ...prev]);
        setSales(prev => [newSale, ...prev]);

        if (currentStaffUser) {
            const currencySymbol = systemSettings.currencies.find(c => c.code === currentCurrency)?.symbol || '$';
            logAction('SALE_PROCESSED', `Processed sale ${newSale.id} for ${currencySymbol}${newSale.total.toFixed(2)}`, { id: currentStaffUser.id, name: currentStaffUser.name, type: 'STAFF' });
        }
    
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
    }, [products, consignments, customers, notificationSettings, deposits, currentStaffUser, logAction, systemSettings.currencies, currentCurrency]);
    
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
            if (currentStaffUser) {
                const branchName = branches.find(b => b.id === branchId)?.name || 'Unknown Branch';
                logAction('STOCK_ADJUSTMENT', `Adjusted stock for ${logEntry.productName} (${logEntry.variantName}) at ${branchName}. New count: ${newStock}. Reason: ${reason}`, { id: currentStaffUser.id, name: currentStaffUser.name, type: 'STAFF' });
            }
        }
    }, [currentStaffUser, logAction, branches]);

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
             if (currentStaffUser) {
                const fromBranchName = branches.find(b => b.id === fromBranchId)?.name || 'Unknown';
                const toBranchName = branches.find(b => b.id === toBranchId)?.name || 'Unknown';
                logAction('STOCK_TRANSFER', `Transferred ${quantity} units of ${logEntry.productName} from ${fromBranchName} to ${toBranchName}`, { id: currentStaffUser.id, name: currentStaffUser.name, type: 'STAFF' });
            }
        }
    }, [currentStaffUser, logAction, branches]);
    
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

    const addAdminUser = useCallback((userData: Omit<AdminUser, 'id' | 'joinDate' | 'status' | 'lastLoginIp' | 'lastLoginDate'>) => {
        setAdminUsers(prev => [
            ...prev,
            {
                ...userData,
                id: `admin-${Date.now()}`,
                joinDate: new Date(),
                status: 'ACTIVE',
                lastLoginIp: '127.0.0.1',
                lastLoginDate: new Date()
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

    const updateMaintenanceSettings = useCallback((settings: MaintenanceSettings) => {
        setSystemSettings(prev => ({
            ...prev,
            maintenanceSettings: settings
        }));
    }, []);

    const updateAccessControlSettings = useCallback((settings: AccessControlSettings) => {
        setSystemSettings(prev => ({
            ...prev,
            accessControlSettings: settings
        }));
    }, []);
    
    const updateLandingPageMetrics = useCallback((metrics: LandingPageMetrics) => {
        setSystemSettings(prev => ({
            ...prev,
            landingPageMetrics: metrics,
        }));
    }, []);

    const updateCurrentTenantSettings = useCallback((newSettings: Partial<Pick<Tenant, 'currency' | 'language' | 'logoutTimeout'>>) => {
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

    const updateTruckVitals = useCallback((truckId: string) => {
        const truckToUpdate = trucks.find(t => t.id === truckId);
        if (!truckToUpdate) return;
        
        let notificationMessage: string | null = null;
        
        setTrucks(prevTrucks => prevTrucks.map(truck => {
            if (truck.id === truckId) {
                const updatedTruck = {
                    ...truck,
                    lastUpdate: new Date(),
                    currentLocation: {
                        ...truck.currentLocation,
                        lat: truck.currentLocation.lat + (Math.random() - 0.5) * 0.1,
                        lng: truck.currentLocation.lng + (Math.random() - 0.5) * 0.1,
                    },
                };
                
                const randomEvent = Math.random();
                if (truck.status === 'IN_TRANSIT') {
                    if (randomEvent < 0.1) {
                        updatedTruck.status = 'IDLE';
                        notificationMessage = `Truck ${truck.licensePlate} has stopped unexpectedly.`;
                    } else if (randomEvent < 0.3) {
                        const loadChange = Math.floor(Math.random() * 500) + 200;
                        updatedTruck.currentLoad = Math.max(0, truck.currentLoad - loadChange);
                        notificationMessage = `Unloaded ${loadChange}kg from ${truck.licensePlate}. Current load: ${(updatedTruck.currentLoad/1000).toFixed(1)}t.`;
                    }
                } else if (truck.status === 'IDLE') {
                     if (randomEvent < 0.2) {
                        updatedTruck.status = 'IN_TRANSIT';
                        notificationMessage = `Truck ${truck.licensePlate} has started moving.`;
                    } else if (randomEvent < 0.5) {
                        const loadChange = Math.floor(Math.random() * 1000) + 500;
                        updatedTruck.currentLoad = Math.min(truck.maxLoad, truck.currentLoad + loadChange);
                        notificationMessage = `Added ${loadChange}kg to ${truck.licensePlate}. Current load: ${(updatedTruck.currentLoad/1000).toFixed(1)}t.`;
                    }
                }
                
                return updatedTruck;
            }
            return truck;
        }));

        if (notificationMessage) {
            setInAppNotifications(prev => [
                {
                    id: `notif-truck-${Date.now()}`,
                    userId: currentTenant?.id || 'tenant-1',
                    message: notificationMessage,
                    read: false,
                    createdAt: new Date(),
                },
                ...prev
            ]);
        }
    }, [trucks, currentTenant]);

    const updateTenantLogisticsConfig = useCallback((config: { activeTrackerProviderId: string }) => {
        setTenants(prevTenants => prevTenants.map(t =>
            t.id === CURRENT_TENANT_ID ? { ...t, logisticsConfig: { ...(t.logisticsConfig || { activeTrackerProviderId: '' }), ...config } } : t
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
            staffId: currentStaffUser?.id || 'staff-unknown',
            discount: 0,
        };
        await addSale(newSale);

        updateShipmentStatus(shipmentId, 'SOLD_IN_TRANSIT');
        
        return { success: true, message: `Shipment ${shipment.shipmentCode} sold to ${customerData.name}.` };
    }, [shipments, products, updateShipmentStatus, addSale, currentStaffUser]);

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
        setPurchaseOrders(prev =>
            prev.map(po => {
                if (po.id === poId) {
                    // If we are receiving the order, update stock
                    if (status === 'RECEIVED' && po.status !== 'RECEIVED') {
                        setProducts(prevProducts => {
                            const productsCopy = JSON.parse(JSON.stringify(prevProducts));
                            for (const item of po.items) {
                                const product = productsCopy.find((p: Product) => p.variants.some(v => v.id === item.variantId));
                                if (product) {
                                    const variant = product.variants.find((v: ProductVariant) => v.id === item.variantId);
                                    if (variant) {
                                        variant.stockByBranch[po.destinationBranchId] = (variant.stockByBranch[po.destinationBranchId] || 0) + item.quantity;
                                    }
                                }
                            }
                            return productsCopy;
                        });
    
                        // Add to stock log
                        const newStockLogs: StockLog[] = po.items.map(item => ({
                            id: `log-${Date.now()}-${item.variantId}`,
                            date: new Date(),
                            productId: products.find(p => p.variants.some(v => v.id === item.variantId))?.id || 'unknown',
                            variantId: item.variantId,
                            productName: item.productName,
                            variantName: item.variantName,
                            action: 'PURCHASE_RECEIVED',
                            quantity: item.quantity,
                            branchId: po.destinationBranchId,
                            referenceId: po.id,
                        }));
                        setStockLogs(prev => [...prev, ...newStockLogs]);
                    }
                    return { ...po, status };
                }
                return po;
            })
        );
    }, [products]);

    const addStaffRole = useCallback((roleData: Omit<StaffRole, 'id'>) => {
        const newRole: StaffRole = { ...roleData, id: `staff-role-${Date.now()}` };
        setStaffRoles(prev => [...prev, newRole]);
    }, []);
    
    const updateStaffRole = useCallback((roleId: string, permissions: TenantPermission[]) => {
        setStaffRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions } : r));
    }, []);
    
    const deleteStaffRole = useCallback((roleId: string) => {
        const isInUse = staff.some(s => s.roleId === roleId);
        if (isInUse) {
            alert("Cannot delete a role that is assigned to staff members.");
            return;
        }
        setStaffRoles(prev => prev.filter(r => r.id !== roleId));
    }, [staff]);

    const addAccount = useCallback((accountData: Omit<Account, 'id' | 'balance'>) => {
        const newAccount: Account = { ...accountData, id: `acc-${Date.now()}`, balance: 0 };
        setAccounts(prev => [...prev, newAccount]);
    }, []);

    const addJournalEntry = useCallback((entryData: Omit<JournalEntry, 'id' | 'date'>) => {
        const newEntry: JournalEntry = { ...entryData, id: `je-${Date.now()}`, date: new Date() };
        setJournalEntries(prev => [newEntry, ...prev]);
        setAccounts(prevAccounts => {
            const newAccounts = [...prevAccounts];
            newEntry.transactions.forEach(tx => {
                const accountIndex = newAccounts.findIndex(acc => acc.id === tx.accountId);
                if (accountIndex !== -1) {
                    newAccounts[accountIndex].balance += tx.amount;
                }
            });
            return newAccounts;
        });
    }, []);

    const addTenant = useCallback(async (tenantData: Omit<Tenant, 'id' | 'joinDate' | 'status' | 'trialEndDate' | 'isVerified' | 'billingCycle' | 'lastLoginIp' | 'lastLoginDate'>): Promise<{ success: boolean; message: string }> => {
        const existingTenant = tenants.find(t => t.email.toLowerCase() === tenantData.email.toLowerCase() || t.username.toLowerCase() === tenantData.username.toLowerCase());
        if (existingTenant) {
            return { success: false, message: 'An account with that email or username already exists.' };
        }
        const newTenant: Tenant = {
            ...tenantData,
            id: `tenant-${Date.now()}`,
            joinDate: new Date(),
            status: 'UNVERIFIED',
            isVerified: false,
            billingCycle: 'monthly',
            trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
        };
        setTenants(prev => [newTenant, ...prev]);
        return { success: true, message: 'Tenant created successfully. Please verify your email.' };
    }, [tenants]);

    const verifyTenant = useCallback((email: string) => {
        setTenants(prev => prev.map(t => {
            if (t.email.toLowerCase() === email.toLowerCase() && !t.isVerified) {
                return { ...t, isVerified: true, status: 'TRIAL' };
            }
            return t;
        }));
    }, []);
    
    const updateTenantProfile = useCallback((tenantData: Partial<Omit<Tenant, 'id'>>) => {
        if (!currentTenant) return;
        setTenants(prev => prev.map(t => t.id === currentTenant.id ? { ...t, ...tenantData } : t));
    }, [currentTenant]);

    const updateAdminProfile = useCallback((adminData: Partial<Omit<AdminUser, 'id'>>) => {
        if (!currentAdminUser) return;
        setAdminUsers(prev => prev.map(u => u.id === currentAdminUser.id ? { ...u, ...adminData } : u));
    }, [currentAdminUser]);
    
    const addAnnouncement = useCallback((announcementData: Omit<Announcement, 'id' | 'createdAt' | 'readBy'>) => {
        const newAnnouncement: Announcement = { ...announcementData, id: `anno-${Date.now()}`, createdAt: new Date(), readBy: [] };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
    }, []);

    const markAnnouncementAsRead = useCallback((announcementId: string, userId: string) => {
        setAnnouncements(prev => prev.map(a => {
            if (a.id === announcementId && !a.readBy.includes(userId)) {
                return { ...a, readBy: [...a.readBy, userId] };
            }
            return a;
        }));
    }, []);

    const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'creditBalance'>) => {
        const newCustomer: Customer = { ...customerData, id: `cust-${Date.now()}`, creditBalance: 0 };
        setCustomers(prev => [...prev, newCustomer]);
    }, []);

    const recordCreditPayment = useCallback((customerId: string, amount: number) => {
        setCustomers(prev => prev.map(c => {
            if (c.id === customerId) {
                return { ...c, creditBalance: Math.max(0, c.creditBalance - amount) };
            }
            return c;
        }));
        if (currentStaffUser) {
            const customerName = customers.find(c => c.id === customerId)?.name || 'Unknown Customer';
            const currencySymbol = systemSettings.currencies.find(c => c.code === currentCurrency)?.symbol || '$';
            logAction('CREDIT_PAYMENT_RECORDED', `Recorded payment of ${currencySymbol}${amount.toFixed(2)} for ${customerName}`, { id: currentStaffUser.id, name: currentStaffUser.name, type: 'STAFF' });
        }
    }, [currentStaffUser, logAction, customers, currentCurrency, systemSettings.currencies]);

    const addDeposit = useCallback(async (depositData: Omit<Deposit, 'id' | 'date' | 'status'>): Promise<{success: boolean, message: string}> => {
        const newDeposit: Deposit = {
            ...depositData,
            id: `dep-${Date.now()}`,
            date: new Date(),
            status: 'ACTIVE',
        };
        setDeposits(prev => [newDeposit, ...prev]);
        if (currentStaffUser) {
            const customerName = customers.find(c => c.id === depositData.customerId)?.name || 'Unknown Customer';
            const currencySymbol = systemSettings.currencies.find(c => c.code === currentCurrency)?.symbol || '$';
            logAction('DEPOSIT_RECORDED', `Recorded deposit of ${currencySymbol}${depositData.amount.toFixed(2)} for ${customerName}`, { id: currentStaffUser.id, name: currentStaffUser.name, type: 'STAFF' });
        }
        return { success: true, message: 'Deposit recorded successfully.' };
    }, [currentStaffUser, logAction, customers, currentCurrency, systemSettings.currencies]);

    const updateDeposit = useCallback((depositId: string, updates: Partial<Pick<Deposit, 'status' | 'notes' | 'appliedSaleId'>>) => {
        setDeposits(prev => prev.map(dep => {
            if (dep.id === depositId) {
                const updatedDeposit = { ...dep, ...updates };
                // If status is changed to something other than APPLIED, clear the appliedSaleId.
                if (updates.status && updates.status !== 'APPLIED') {
                    updatedDeposit.appliedSaleId = undefined;
                }
                return updatedDeposit;
            }
            return dep;
        }));
    }, []);
    
    const addConsignment = useCallback((consignmentData: Omit<Consignment, 'id' | 'status'>) => {
        const newConsignment: Consignment = { ...consignmentData, id: `con-${Date.now()}`, status: 'ACTIVE' };
        setConsignments(prev => [...prev, newConsignment]);
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
        const newCategory: Category = { id: `cat-${Date.now()}`, name: categoryName };
        setCategories(prev => [...prev, newCategory]);
    }, []);
    
    const updateCategory = useCallback((categoryId: string, newName: string) => {
        setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, name: newName } : c));
    }, []);
    
    const deleteCategory = useCallback((categoryId: string) => {
        const isInUse = products.some(p => p.categoryId === categoryId);
        if (isInUse) {
            alert("Cannot delete a category that is currently in use by products.");
            return;
        }
        setCategories(prev => prev.filter(c => c.id !== categoryId));
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

    const activateSubscription = useCallback((tenantId: string, planId: string, billingCycle: 'monthly' | 'yearly') => {
        setTenants(prev => prev.map(t => {
            if (t.id === tenantId) {
                return { ...t, status: 'ACTIVE', planId, billingCycle, trialEndDate: undefined };
            }
            return t;
        }));
    }, []);
    
    const changeSubscriptionPlan = useCallback((tenantId: string, newPlanId: string, billingCycle: 'monthly' | 'yearly') => {
        setTenants(prev => prev.map(t => {
            if (t.id === tenantId) {
                return { ...t, planId: newPlanId, billingCycle };
            }
            return t;
        }));
    }, []);
    
    const processExpiredTrials = useCallback(() => {
        let processed = 0;
        let suspended = 0;
        const today = new Date();
        setTenants(prev => prev.map(t => {
            if (t.status === 'TRIAL' && t.trialEndDate && new Date(t.trialEndDate) < today) {
                processed++;
                suspended++;
                return { ...t, status: 'SUSPENDED' };
            }
            if (t.status === 'TRIAL') processed++;
            return t;
        }));
        return { processed, suspended };
    }, []);

    const sendExpiryReminders = useCallback(() => {
        let sent = 0;
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        const tenantsToRemind = tenants.filter(tenant => {
            if (tenant.status === 'TRIAL' && tenant.trialEndDate) {
                const endDate = new Date(tenant.trialEndDate);
                return endDate <= threeDaysFromNow && endDate >= today;
            }
            return false;
        });

        sent = tenantsToRemind.length;

        // Simulate sending notifications
        tenantsToRemind.forEach(tenant => {
            console.log(`Simulating sending expiry reminder to ${tenant.businessName}`);
        });

        return { sent };
    }, [tenants]);

    const processSubscriptionPayment = useCallback(async (tenantId: string, planId: string, method: string, amount: number, billingCycle: 'monthly' | 'yearly', success: boolean, proofOfPaymentUrl?: string): Promise<{success: boolean, message: string}> => {
        const newTransaction: PaymentTransaction = {
            id: `txn-${Date.now()}`,
            tenantId, planId, amount, method,
            status: success ? (method === 'Manual' ? 'PENDING' : 'COMPLETED') : 'FAILED',
            createdAt: new Date(),
            proofOfPaymentUrl,
            transactionId: success ? `pi_${Date.now()}`: undefined,
        };
        setPaymentTransactions(prev => [newTransaction, ...prev]);

        if (success && method !== 'Manual') {
            activateSubscription(tenantId, planId, billingCycle);
            return { success: true, message: 'Payment successful! Your subscription is now active.' };
        } else if (success && method === 'Manual') {
            changeSubscriptionPlan(tenantId, planId, billingCycle);
            return { success: true, message: 'Payment submitted for review. Your plan will be activated upon approval.'};
        } else {
            return { success: false, message: 'Payment failed. Please check your details and try again.' };
        }
    }, [activateSubscription, changeSubscriptionPlan]);

    const updatePaymentTransactionStatus = useCallback((transactionId: string, newStatus: 'COMPLETED' | 'REJECTED') => {
        setPaymentTransactions(prev => prev.map(tx => {
            if (tx.id === transactionId) {
                if (newStatus === 'COMPLETED' && tx.method === 'Manual') {
                    activateSubscription(tx.tenantId, tx.planId, tx.billingCycle || 'monthly');
                }
                return { ...tx, status: newStatus };
            }
            return tx;
        }));
    }, [activateSubscription]);

    const updateEmailTemplate = useCallback((templateId: string, newSubject: string, newBody: string) => {
        setEmailTemplates(prev => prev.map(t => t.id === templateId ? { ...t, subject: newSubject, body: newBody } : t));
    }, []);

    const updateSmsTemplate = useCallback((templateId: string, newBody: string) => {
        setSmsTemplates(prev => prev.map(t => t.id === templateId ? { ...t, body: newBody } : t));
    }, []);

    const markInAppNotificationAsRead = useCallback((notificationId: string) => {
        setInAppNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    }, []);
    
    const submitSupportTicket = useCallback((ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'status'>) => {
        if (!currentTenant) return;
        const newTicket: SupportTicket = {
            ...ticketData,
            id: `ticket-${Date.now()}`,
            tenantId: currentTenant.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'Open',
            messages: ticketData.messages.map(msg => ({
                ...msg,
                id: `msg-${Date.now()}`,
                timestamp: new Date()
            }))
        };
        setSupportTickets(prev => [newTicket, ...prev]);
    }, [currentTenant]);

    const replyToSupportTicket = useCallback((ticketId: string, message: Omit<TicketMessage, 'id' | 'timestamp'>) => {
        setSupportTickets(prev => prev.map(ticket => {
            if (ticket.id === ticketId) {
                const newTicket = {
                    ...ticket,
                    updatedAt: new Date(),
                    messages: [
                        ...ticket.messages,
                        { ...message, id: `msg-${Date.now()}`, timestamp: new Date() }
                    ]
                };
                if (message.sender === 'ADMIN') {
                    newTicket.status = 'In Progress';
                }
                return newTicket;
            }
            return ticket;
        }));
    }, []);

    const updateTicketStatus = useCallback((ticketId: string, status: SupportTicket['status']) => {
        setSupportTickets(prev => prev.map(ticket => ticket.id === ticketId ? { ...ticket, status, updatedAt: new Date() } : ticket));
    }, []);

    const updateLastLogin = useCallback((email: string, ip: string) => {
        const lowerEmail = email.toLowerCase();
        setAdminUsers(prev => prev.map(u => 
            (u.email.toLowerCase() === lowerEmail || u.username?.toLowerCase() === lowerEmail)
            ? { ...u, lastLoginIp: ip, lastLoginDate: new Date() }
            : u
        ));
        setTenants(prev => prev.map(t =>
            (t.email.toLowerCase() === lowerEmail || t.username.toLowerCase() === lowerEmail)
            ? { ...t, lastLoginIp: ip, lastLoginDate: new Date() }
            : t
        ));
    }, []);

    const value: AppContextType = {
        products, sales, branches, staff, staffRoles, currentStaffUser, allTenantPermissions, stockLogs, tenants, currentTenant,
        subscriptionPlans, adminUsers, adminRoles, allPermissions, currentAdminUser, brandConfig, pageContent,
        paymentSettings, notificationSettings, systemSettings, trucks, shipments, trackerProviders, suppliers,
        purchaseOrders, accounts, journalEntries, announcements, customers, consignments, deposits, categories,
        paymentTransactions, emailTemplates, smsTemplates, inAppNotifications, auditLogs, supportTickets, notification,
        setNotification, searchTerm, setSearchTerm, theme, setTheme, currentLanguage, setCurrentLanguage, currentCurrency, setCurrentCurrency,
        getMetric, addSale, adjustStock, transferStock, addProduct, updateProductVariant, addAdminUser,
        updateAdminUser, updateAdminRole, addAdminRole, deleteAdminRole, updateBrandConfig, updatePageContent,
        updateFaqs, updatePaymentSettings, updateNotificationSettings, updateSystemSettings, updateMaintenanceSettings,
        updateAccessControlSettings, updateLandingPageMetrics, updateCurrentTenantSettings, updateTenantAutomations,
        addSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, addTruck, updateTruck, addShipment,
        updateShipmentStatus, updateTrackerProviders, addBranch, addStaff, sellShipment, receiveShipment,
        addPurchaseOrder, updatePurchaseOrderStatus, addStaffRole, updateStaffRole, deleteStaffRole, addAccount,
        addJournalEntry, addTenant, verifyTenant, updateTenantProfile, updateAdminProfile, addAnnouncement,
        markAnnouncementAsRead, addCustomer, recordCreditPayment, addDeposit, updateDeposit, addConsignment, addCategory, updateCategory,
        deleteCategory, extendTrial, activateSubscription, changeSubscriptionPlan, processExpiredTrials,
        sendExpiryReminders,
        processSubscriptionPayment, updatePaymentTransactionStatus, updateEmailTemplate, updateSmsTemplate,
        markInAppNotificationAsRead,
        submitSupportTicket, replyToSupportTicket, updateTicketStatus,
        updateTruckVitals, updateTenantLogisticsConfig,
        updateLastLogin,
        logout: onLogout,
        logAction
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
