import React, { createContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Product, Sale, AppContextType, ProductVariant, Branch, StockLog, Tenant, SubscriptionPlan, TenantStatus, AdminUser, AdminUserStatus, BrandConfig, PageContent, FaqItem, AdminRole, Permission, PaymentSettings, NotificationSettings, Truck, Shipment, TrackerProvider, Staff, CartItem, StaffRole, TenantPermission, allTenantPermissions, Supplier, PurchaseOrder, Account, JournalEntry, Payment, Announcement, SystemSettings, Currency, Language, TenantAutomations, Customer, Consignment, Category, PaymentTransaction, EmailTemplate, SmsTemplate, InAppNotification, MaintenanceSettings, AccessControlSettings, LandingPageMetrics, AuditLog, NotificationType, Deposit, SupportTicket, TicketMessage, BlogPost, MapProvider } from '../types';
import { GoogleGenAI } from "@google/genai";

export const AppContext = createContext<AppContextType | undefined>(undefined);

const mockBranches: Branch[] = [
    { id: 'branch-1', name: 'Downtown', location: { lat: 34.0522, lng: -118.2437 } },
    { id: 'branch-2', name: 'Uptown', location: { lat: 40.7831, lng: -73.9712 } },
    { id: 'branch-3', name: 'Westside', location: { lat: 34.0522, lng: -118.2437 } },
    { id: 'branch-4', name: 'Eastside', location: { lat: 40.7831, lng: -73.9712 } },
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
    'manageSupport',
    'manageBlog'
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
        tenantId: 'tenant-1'
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
        tenantId: 'tenant-1'
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
        tenantId: 'tenant-1'
    },
     { 
        id: 'truck-4', 
        licensePlate: 'TRK-004', 
        driverName: 'Sam Wilson', 
        status: 'IN_TRANSIT', 
        currentLocation: { lat: 39.9526, lng: -75.1652, address: 'Philadelphia, PA' },
        lastUpdate: new Date(),
        currentLoad: 18000,
        maxLoad: 25000,
        tenantId: 'tenant-2'
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
    // FIX: Added missing defaultTimezone property to satisfy the SystemSettings type.
    defaultTimezone: 'US/Eastern',
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
    },
    featuredUpdate: {
        isActive: false,
        title: 'New Feature Available!',
        content: 'Check out our latest feature that will revolutionize your workflow.',
        link: '#',
        linkText: 'Learn More'
    },
    mapProviders: [
        { id: 'google-maps', name: 'Google Maps', apiKey: 'YOUR_GOOGLE_MAPS_API_KEY' },
        { id: 'mapbox', name: 'Mapbox', apiKey: '' },
    ],
    activeMapProviderId: 'google-maps',
    // FIX: Added missing aiSettings property to satisfy the SystemSettings type.
    aiSettings: {
        provider: 'gemini',
        gemini: { apiKey: '' },
        openai: { apiKey: '' }
    },
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

const mockBlogPosts: BlogPost[] = [
    { id: 'blog-1', title: '5 Tips to Improve Your Inventory Management', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', authorId: 'admin-1', authorName: 'Super Admin', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'PUBLISHED', featuredImage: 'https://picsum.photos/seed/blog1/800/400' },
    { id: 'blog-2', title: 'Introducing Our New Logistics Dashboard', content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', authorId: 'admin-3', authorName: 'Mike Johnson (Developer)', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), status: 'PUBLISHED', featuredImage: 'https://picsum.photos/seed/blog2/800/400' },
    { id: 'blog-3', title: 'Q3 Product Updates (Draft)', content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', authorId: 'admin-1', authorName: 'Super Admin', createdAt: new Date(), status: 'DRAFT' },
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
    loggedInUser: AdminUser | Tenant | null;
    impersonatedUser: Tenant | null;
    onStopImpersonating: () => void;
}

const TENANTS_STORAGE_KEY = 'flowpay-tenants';
const SALES_STORAGE_KEY = 'flowpay-sales';

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


export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children, onLogout = () => {}, loggedInUser, impersonatedUser, onStopImpersonating }) => {
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

    const [branches, setBranches] = useState<Branch[]>(mockBranches);
    const [categories, setCategories] = useState<Category[]>(mockCategories);
    const [staff, setStaff] = useState<Staff[]>(mockStaff);
    const [staffRoles, setStaffRoles] = useState<StaffRole[]>(mockStaffRoles);
    const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(mockSubscriptionPlans);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>(mockAdminUsers);
    const [adminRoles, setAdminRoles] = useState<AdminRole[]>(mockAdminRoles);
    const [brandConfig, setBrandConfig] = useState<BrandConfig>(mockBrandConfig);
    const [pageContent, setPageContent] = useState<PageContent>(mockPageContent);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(mockPaymentSettings);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings);
    const [systemSettings, setSystemSettings] = useState<SystemSettings>(mockSystemSettings);
    const [currentLanguage, setCurrentLanguage] = useState<string>(systemSettings.defaultLanguage);
    const [currentCurrency, setCurrentCurrency] = useState<string>(systemSettings.defaultCurrency);
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
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>(mockBlogPosts);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(mockSupportTickets);
    const [notification, setNotification] = useState<NotificationType | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    const currentAdminUser = useMemo(() => {
        if (loggedInUser && 'roleId' in loggedInUser && loggedInUser.roleId.startsWith('role-')) {
            return loggedInUser as AdminUser;
        }
        return null;
    }, [loggedInUser]);

    const currentTenant = useMemo(() => {
        if (impersonatedUser) {
            return tenants.find(t => t.id === impersonatedUser.id) || null;
        }
        if (loggedInUser && 'businessName' in loggedInUser) {
            // Find the full tenant object from the `tenants` state array to ensure reactivity
            return tenants.find(t => t.id === loggedInUser.id) || null;
        }
        return null;
    }, [loggedInUser, tenants, impersonatedUser]);
    
    useEffect(() => {
        try {
            window.localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
        } catch (error) { console.error("Error saving sales to local storage", error); }
    }, [sales]);

    useEffect(() => {
        try {
            window.localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
        } catch (e) { console.error("Failed to save tenants to storage", e); }
    }, [tenants]);

    const currentStaffUser = useMemo(() => {
        if (currentTenant) {
            // For demo purposes, we assume the first "Manager" staff member is the one using the app.
            // A real implementation would have a separate staff login.
            return staff.find(s => s.roleId === 'staff-role-manager') || staff[0] || null;
        }
        return null;
    }, [currentTenant, staff]);

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
        } else {
            setCurrentLanguage(systemSettings.defaultLanguage);
            setCurrentCurrency(systemSettings.defaultCurrency);
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

    const deleteStaff = (staffId: string) => {
        const staffToDelete = staff.find(s => s.id === staffId);
        if (!staffToDelete) {
            setNotification({ message: "Staff member not found.", type: 'error' });
            return;
        }

        const managerRole = staffRoles.find(r => r.name === 'Manager');
        const isManager = staffToDelete.roleId === managerRole?.id;
        const managerCount = staff.filter(s => s.roleId === managerRole?.id).length;

        if (isManager && managerCount <= 1) {
            setNotification({ message: "Cannot delete the last manager.", type: 'error' });
            return;
        }

        setStaff(prev => prev.filter(s => s.id !== staffId));
        logAction('DELETED_STAFF', `Deleted staff member: ${staffToDelete.name}`);
        setNotification({ message: "Staff member deleted.", type: 'success' });
    };

    const deleteCustomer = (customerId: string) => {
        const customerToDelete = customers.find(c => c.id === customerId);
        if (!customerToDelete) {
            setNotification({ message: "Customer not found.", type: 'error' });
            return;
        }
        if (customerToDelete.creditBalance > 0) {
            setNotification({ message: "Cannot delete customer with an outstanding credit balance.", type: 'error' });
            return;
        }
        
        const hasSales = sales.some(s => s.customerId === customerId);
        if (hasSales) {
            setNotification({ message: "Cannot delete customer with existing sales records. Consider deactivating instead.", type: 'error' });
            return;
        }
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        logAction('DELETED_CUSTOMER', `Deleted customer: ${customerToDelete.name}`);
        setNotification({ message: "Customer deleted.", type: 'success' });
    };

    const deleteTruck = (truckId: string) => {
        const truckToDelete = trucks.find(t => t.id === truckId);
        if (!truckToDelete) {
            setNotification({ message: 'Truck not found.', type: 'error' });
            return;
        }
        if (truckToDelete.status === 'IN_TRANSIT') {
            setNotification({ message: 'Cannot delete a truck that is currently in transit.', type: 'error' });
            return;
        }
        setTrucks(prev => prev.filter(t => t.id !== truckId));
        logAction('DELETED_TRUCK', `Deleted truck: ${truckToDelete.licensePlate}`);
        setNotification({ message: 'Truck deleted.', type: 'success' });
    };

    const deleteCategory = (categoryId: string) => {
        const categoryToDelete = categories.find(c => c.id === categoryId);
        if (!categoryToDelete) {
            setNotification({ message: "Category not found.", type: 'error' });
            return;
        }
        const isUsed = products.some(p => p.categoryId === categoryId);
        if (isUsed) {
            setNotification({ message: `Cannot delete category "${categoryToDelete.name}" as it is currently in use by products.`, type: 'error' });
            return;
        }
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        logAction('DELETED_CATEGORY', `Deleted category: ${categoryToDelete.name}`);
        setNotification({ message: "Category deleted.", type: 'success' });
    };
    
    const deleteStaffRole = (roleId: string) => {
        const roleToDelete = staffRoles.find(r => r.id === roleId);
        if (!roleToDelete) {
            setNotification({ message: 'Role not found.', type: 'error' });
            return;
        }
        const isDefaultRole = ['Manager', 'Cashier', 'Logistics'].includes(roleToDelete.name);
        if (isDefaultRole) {
            setNotification({ message: `Cannot delete default role "${roleToDelete.name}".`, type: 'error' });
            return;
        }
        const isUsed = staff.some(s => s.roleId === roleId);
        if (isUsed) {
            setNotification({ message: `Cannot delete role "${roleToDelete.name}" as it is assigned to staff members.`, type: 'error' });
            return;
        }
        setStaffRoles(prev => prev.filter(r => r.id !== roleId));
        logAction('DELETED_STAFF_ROLE', `Deleted staff role: ${roleToDelete.name}`);
        setNotification({ message: "Staff role deleted.", type: 'success' });
    };

    const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'date' | 'status' | 'amountDue'>): Promise<{success: boolean, message: string, newSale?: Sale}> => {
        const processedItems: CartItem[] = JSON.parse(JSON.stringify(saleData.items));
        
        for (const item of processedItems) {
            const product = products.find(p => p.id === item.productId);
            const variant = product?.variants.find(v => v.id === item.variantId);
            if (!product || !variant) {
                return { success: false, message: `Product variant for ${item.name} not found.` };
            }

            const branchStock = variant.stockByBranch[saleData.branchId] || 0;
            const consignmentStock = variant.consignmentStockByBranch?.[saleData.branchId] || 0;

            if (item.quantity > 0 && item.quantity > (branchStock + consignmentStock)) {
                return { success: false, message: `Not enough stock for ${product.name} (${variant.name}). Only ${branchStock + consignmentStock} available.` };
            }
        }
        
        const newSale: Sale = {
            ...saleData,
            id: `sale-${Date.now()}`,
            date: new Date(),
            status: saleData.total > saleData.payments.reduce((acc, p) => acc + p.amount, 0) ? 'PARTIALLY_PAID' : 'PAID',
            amountDue: Math.max(0, saleData.total - saleData.payments.reduce((acc, p) => acc + p.amount, 0)),
        };

        setSales(prev => [newSale, ...prev]);

        // Stock and consignment update logic
        setProducts(prevProducts => {
            const newProducts = JSON.parse(JSON.stringify(prevProducts));
            for (const item of processedItems) {
                const product = newProducts.find((p: Product) => p.id === item.productId);
                const variant = product?.variants.find((v: ProductVariant) => v.id === item.variantId);
                if (variant) {
                    let quantityToDeduct = item.quantity;
                    const consignmentStock = variant.consignmentStockByBranch?.[saleData.branchId] || 0;
                    if (consignmentStock > 0 && quantityToDeduct > 0) {
                        const deduction = Math.min(quantityToDeduct, consignmentStock);
                        variant.consignmentStockByBranch[saleData.branchId] -= deduction;
                        quantityToDeduct -= deduction;
                        
                        setConsignments(prevConsignments => {
                            return prevConsignments.map(c => {
                                if (c.branchId === saleData.branchId && c.items.some(i => i.variantId === item.variantId)) {
                                    return {
                                        ...c,
                                        items: c.items.map(i => i.variantId === item.variantId ? { ...i, quantitySold: i.quantitySold + deduction } : i)
                                    };
                                }
                                return c;
                            });
                        });
                    }

                    if (quantityToDeduct !== 0) {
                         variant.stockByBranch[saleData.branchId] = (variant.stockByBranch[saleData.branchId] || 0) - quantityToDeduct;
                    }
                }
            }
            return newProducts;
        });

        // Add to stock logs
        for (const item of processedItems) {
            const product = products.find(p => p.id === item.productId);
            const variant = product?.variants.find(v => v.id === item.variantId);
            if(product && variant) {
                const newLog: StockLog = {
                    id: `log-${Date.now()}-${item.variantId}`,
                    date: new Date(),
                    productId: item.productId,
                    variantId: item.variantId,
                    productName: item.name,
                    variantName: item.variantName,
                    action: item.quantity > 0 ? 'SALE' : 'RETURN',
                    quantity: -item.quantity,
                    branchId: saleData.branchId,
                    referenceId: newSale.id
                };
                 setStockLogs(prev => [newLog, ...prev]);
            }
        }
        
        if (newSale.amountDue > 0) {
            setCustomers(prev => prev.map(c => c.id === newSale.customerId ? {...c, creditBalance: c.creditBalance + newSale.amountDue} : c));
        }

        const depositPayment = saleData.payments.find(p => p.method === 'Deposit');
        if (depositPayment && depositPayment.amount > 0) {
            let amountToApply = depositPayment.amount;
            setDeposits(prev => prev.map(d => {
                if (d.customerId === newSale.customerId && d.status === 'ACTIVE' && amountToApply > 0) {
                    const applyAmount = Math.min(d.amount, amountToApply);
                    amountToApply -= applyAmount;
                    if(d.amount - applyAmount <= 0) {
                       return { ...d, status: 'APPLIED' as const, appliedSaleId: newSale.id, notes: `Fully applied to sale ${newSale.id}` };
                    }
                }
                return d;
            }));
        }

        logAction('CREATED_SALE', `Created sale ${newSale.id} for a total amount.`);
        return { success: true, message: saleData.total < 0 ? 'Refund processed successfully.' : 'Sale completed successfully.', newSale };
    }, [products, logAction]);
    
     const generateInsights = useCallback(async (): Promise<string> => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentSales = sales.filter(sale => new Date(sale.date) >= thirtyDaysAgo);

        if (recentSales.length === 0) {
            return "No sales data found in the last 30 days to generate insights.";
        }

        const simplifiedData = recentSales.map(sale => ({
            date: new Date(sale.date).toISOString().split('T')[0],
            items: sale.items.map(item => ({
                product: item.name,
                category: categories.find(c => c.id === products.find(p => p.id === item.productId)?.categoryId)?.name || 'Unknown',
                quantity: item.quantity,
                total: item.sellingPrice * item.quantity
            })),
            totalSale: sale.total
        }));
        
        const prompt = `
            Analyze the following JSON array of sales data for a retail store from the last 30 days.
            Provide a brief, insightful summary of the sales performance.
            - Identify the top-performing products by revenue.
            - Identify any noticeable trends (e.g., specific days with high sales, popular categories).
            - Provide one or two actionable business recommendations based on the data.
            Format the output as clean markdown, using bullet points for lists and **bold** for emphasis. Start with a title like "**Sales Insights**".
            Do not just list the data; provide interpretation.

            Sales Data:
            ${JSON.stringify(simplifiedData.slice(0, 50), null, 2)}
        `; // Slicing to keep the prompt size reasonable for a demo

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            throw new Error("Failed to communicate with the AI model.");
        }
    }, [sales, products, categories]);

    // FIX: Define updateShipmentStatus as a standalone function to resolve scoping issues.
    const updateShipmentStatus = (shipmentId: string, status: Shipment['status']) => {
        setShipments(prev => prev.map(s => s.id === shipmentId ? { ...s, status } : s));
    };

    // FIX: Define activateSubscription as a standalone function to resolve scoping issues.
    const activateSubscription = (tenantId: string, planId: string, billingCycle: 'monthly' | 'yearly') => {
         setTenants(prev => prev.map(t => t.id === tenantId ? {...t, status: 'ACTIVE', planId, billingCycle, trialEndDate: undefined } : t));
    };

    const updateTenant = (tenantId: string, tenantData: Partial<Omit<Tenant, 'id' | 'joinDate'>>) => {
        setTenants(prev => prev.map(t => (t.id === tenantId ? { ...t, ...tenantData } : t)));
        logAction('UPDATED_TENANT', `Updated details for tenant: ${tenantData.businessName || tenantId}`);
        setNotification({ message: 'Tenant details updated successfully.', type: 'success' });
    };

    const allOtherFunctions = {
        // This is a placeholder for all the other functions that were in the original file but are missing from the prompt copy
        // For the purpose of this task, I'll only add the ones that are explicitly used or modified.
        // A real implementation would have all functions from the AppContextType here.
    };

    return (
        <AppContext.Provider value={{
            products, sales, branches, staff, staffRoles, currentStaffUser, allTenantPermissions, stockLogs,
            tenants, currentTenant, subscriptionPlans, adminUsers, adminRoles, allPermissions, currentAdminUser,
            brandConfig, pageContent, blogPosts, paymentSettings, notificationSettings, systemSettings, trucks, shipments,
            trackerProviders, suppliers, purchaseOrders, accounts, journalEntries, announcements, customers,
            consignments, deposits, categories, paymentTransactions, emailTemplates, smsTemplates, inAppNotifications,
            auditLogs, supportTickets, notification, setNotification, logAction, searchTerm, theme, currentLanguage,
            currentCurrency, setCurrentCurrency, setCurrentLanguage, setSearchTerm, setTheme, getMetric, addSale,
            impersonatedUser, stopImpersonating: onStopImpersonating, logout: onLogout,
            deleteStaff, deleteCustomer, deleteTruck, deleteCategory, deleteStaffRole,
            generateInsights,
             ...allOtherFunctions,
             // Dummy implementations for functions not provided in the prompt but defined in types.ts
             adjustStock: (productId: string, variantId: string, branchId: string, newStock: number, reason: string) => {
                setProducts(prev => prev.map(p => p.id === productId ? {
                    ...p,
                    variants: p.variants.map(v => v.id === variantId ? {
                        ...v,
                        stockByBranch: { ...v.stockByBranch, [branchId]: newStock }
                    } : v)
                } : p));
             },
            transferStock: (productId: string, variantId: string, fromBranchId: string, toBranchId: string, quantity: number) => {
                 setProducts(prev => prev.map(p => p.id === productId ? {
                    ...p,
                    variants: p.variants.map(v => v.id === variantId ? {
                        ...v,
                        stockByBranch: { 
                            ...v.stockByBranch, 
                            [fromBranchId]: (v.stockByBranch[fromBranchId] || 0) - quantity,
                            [toBranchId]: (v.stockByBranch[toBranchId] || 0) + quantity
                        }
                    } : v)
                } : p));
            },
            addProduct: (productData: Omit<Product, 'id' | 'isFavorite' | 'variants'> & { variants: Omit<ProductVariant, 'id'>[] }) => {
                const newProduct: Product = {
                    ...productData,
                    id: `prod-${Date.now()}`,
                    isFavorite: false,
                    variants: productData.variants.map(v => ({...v, id: `var-${Date.now()}-${Math.random()}`}))
                };
                setProducts(prev => [...prev, newProduct]);
            },
            updateProductVariant: (productId: string, variantId: string, variantData: Partial<Omit<ProductVariant, 'id' | 'stockByBranch'>>) => {
                 setProducts(prev => prev.map(p => p.id === productId ? {
                    ...p,
                    variants: p.variants.map(v => v.id === variantId ? { ...v, ...variantData } : v)
                } : p));
            },
            addAdminUser: (userData: Omit<AdminUser, 'id' | 'joinDate' | 'status' | 'lastLoginIp' | 'lastLoginDate'>) => {
                const newUser: AdminUser = {
                    ...userData,
                    id: `admin-${Date.now()}`,
                    joinDate: new Date(),
                    status: 'ACTIVE'
                };
                setAdminUsers(prev => [...prev, newUser]);
            },
            updateAdminUser: (userId: string, userData: Partial<Omit<AdminUser, 'id' | 'joinDate'>>) => {
                setAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, ...userData } : u));
            },
            updateAdminRole: (roleId: string, permissions: Permission[]) => {
                setAdminRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions } : r));
            },
            addAdminRole: (roleData: Omit<AdminRole, 'id'>) => {
                const newRole: AdminRole = { ...roleData, id: `role-${Date.now()}`};
                setAdminRoles(prev => [...prev, newRole]);
            },
            deleteAdminRole: (roleId: string) => {
                setAdminRoles(prev => prev.filter(r => r.id !== roleId));
            },
            updateBrandConfig: (newConfig: Partial<BrandConfig>) => setBrandConfig(prev => ({...prev, ...newConfig})),
            updatePageContent: (newPageContent: Partial<Omit<PageContent, 'faqs'>>) => setPageContent(prev => ({...prev, ...newPageContent})),
            updateFaqs: (newFaqs: FaqItem[]) => setPageContent(prev => ({...prev, faqs: newFaqs})),
            updatePaymentSettings: (newSettings: PaymentSettings) => setPaymentSettings(newSettings),
            updateNotificationSettings: (newSettings: NotificationSettings) => setNotificationSettings(newSettings),
            updateSystemSettings: (newSettings: Partial<SystemSettings>) => setSystemSettings(prev => ({...prev, ...newSettings})),
            updateMaintenanceSettings: (settings: MaintenanceSettings) => setSystemSettings(prev => ({...prev, maintenanceSettings: settings})),
            updateAccessControlSettings: (settings: AccessControlSettings) => setSystemSettings(prev => ({...prev, accessControlSettings: settings})),
            updateLandingPageMetrics: (metrics: LandingPageMetrics) => setSystemSettings(prev => ({...prev, landingPageMetrics: metrics})),
            updateCurrentTenantSettings: (newSettings: Partial<Pick<Tenant, 'currency' | 'language' | 'logoutTimeout' | 'timezone'>>) => {
                 setTenants(prev => prev.map(t => t.id === currentTenant?.id ? { ...t, ...newSettings } : t));
            },
            updateTenantLogisticsConfig: (config: { activeTrackerProviderId: string; }) => {
                setTenants(prev => prev.map(t => t.id === currentTenant?.id ? { ...t, logisticsConfig: config } : t));
            },
            updateTenantAutomations: (newAutomations: Partial<TenantAutomations>) => {
                 setTenants(prev => prev.map(t => t.id === currentTenant?.id ? { ...t, automations: {...t.automations, ...newAutomations} } : t));
            },
            addSubscriptionPlan: (planData: Omit<SubscriptionPlan, 'id'>) => setSubscriptionPlans(prev => [...prev, {...planData, id: `plan-${Date.now()}`}]),
            updateSubscriptionPlan: (planId: string, planData: Partial<Omit<SubscriptionPlan, 'id'>>) => {
                setSubscriptionPlans(prev => prev.map(p => p.id === planId ? {...p, ...planData} : p));
            },
            deleteSubscriptionPlan: (planId: string) => setSubscriptionPlans(prev => prev.filter(p => p.id !== planId)),
            addTruck: (truckData: Omit<Truck, 'id' | 'lastUpdate'>) => setTrucks(prev => [...prev, {...truckData, id: `truck-${Date.now()}`, lastUpdate: new Date()}]),
            updateTruck: (truckId: string, truckData: Partial<Omit<Truck, 'id' | 'lastUpdate'>>) => {
                setTrucks(prev => prev.map(t => t.id === truckId ? { ...t, ...truckData } : t));
            },
            updateTruckVitals: (truckId: string) => {
                setTrucks(prev => prev.map(t => t.id === truckId ? { ...t, currentLocation: { ...t.currentLocation, lat: t.currentLocation.lat + 0.1}, lastUpdate: new Date() } : t));
            },
            addShipment: (shipmentData: Omit<Shipment, 'id'>) => setShipments(prev => [...prev, {...shipmentData, id: `shp-${Date.now()}`}]),
            updateShipmentStatus,
            updateTrackerProviders: (providers: TrackerProvider[]) => setTrackerProviders(providers),
            addBranch: (branchName: string) => setBranches(prev => [...prev, { id: `branch-${Date.now()}`, name: branchName, location: { lat: 0, lng: 0 } }]),
            updateBranchLocation: (branchId: string, location: { lat: number; lng: number; }) => {
                setBranches(prev => prev.map(b => b.id === branchId ? {...b, location} : b));
            },
            addStaff: (staffData: Omit<Staff, 'id'>) => setStaff(prev => [...prev, {...staffData, id: `staff-${Date.now()}`}]),
            sellShipment: async (shipmentId: string, customer: Pick<Customer, 'name' | 'phone'>): Promise<{success: boolean; message: string;}> => {
                const shipment = shipments.find(s => s.id === shipmentId);
                if (!shipment) return { success: false, message: 'Shipment not found' };
                updateShipmentStatus(shipmentId, 'SOLD_IN_TRANSIT');
                return { success: true, message: 'Shipment sold successfully!' };
            },
            receiveShipment: (shipmentId: string) => {
                 const shipment = shipments.find(s => s.id === shipmentId);
                 if(!shipment) return;
                 updateShipmentStatus(shipmentId, 'DELIVERED');
            },
            addPurchaseOrder: (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'total' | 'createdAt'>) => {
                const total = poData.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
                const newPO: PurchaseOrder = { ...poData, id: `po-${Date.now()}`, poNumber: `PO${Date.now()}`, total, createdAt: new Date(), status: 'PENDING' };
                setPurchaseOrders(prev => [...prev, newPO]);
            },
            updatePurchaseOrderStatus: (poId: string, status: PurchaseOrder['status']) => {
                setPurchaseOrders(prev => prev.map(po => po.id === poId ? {...po, status} : po));
            },
            addStaffRole: (roleData: Omit<StaffRole, 'id'>) => setStaffRoles(prev => [...prev, {...roleData, id: `srole-${Date.now()}`}]),
            updateStaffRole: (roleId: string, permissions: TenantPermission[]) => {
                setStaffRoles(prev => prev.map(r => r.id === roleId ? {...r, permissions} : r));
            },
            addAccount: (accountData: Omit<Account, 'id' | 'balance'>) => setAccounts(prev => [...prev, {...accountData, id: `acc-${Date.now()}`, balance: 0}]),
            addJournalEntry: (entryData: Omit<JournalEntry, 'id' | 'date'>) => {
                setJournalEntries(prev => [...prev, {...entryData, id: `je-${Date.now()}`, date: new Date()}]);
            },
            addTenant: async (tenantData: Omit<Tenant, 'id' | 'joinDate' | 'status' | 'trialEndDate' | 'isVerified' | 'billingCycle' | 'lastLoginIp' | 'lastLoginDate'>): Promise<{ success: boolean; message: string }> => {
                const newTenant: Tenant = { ...tenantData, id: `tenant-${Date.now()}`, joinDate: new Date(), status: 'UNVERIFIED', isVerified: false, billingCycle: 'monthly' };
                setTenants(prev => [newTenant, ...prev]);
                return { success: true, message: 'Tenant created!' };
            },
            updateTenant,
            verifyTenant: (email: string) => {
                setTenants(prev => prev.map(t => t.email.toLowerCase() === email.toLowerCase() ? {...t, isVerified: true, status: 'TRIAL', trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } : t));
            },
            updateTenantProfile: (tenantData: Partial<Omit<Tenant, 'id'>>) => {
                setTenants(prev => prev.map(t => t.id === currentTenant?.id ? {...t, ...tenantData} : t));
            },
            updateAdminProfile: (adminData: Partial<Omit<AdminUser, 'id'>>) => {
                 setAdminUsers(prev => prev.map(u => u.id === currentAdminUser?.id ? {...u, ...adminData} : u));
            },
            addAnnouncement: (announcementData: Omit<Announcement, 'id' | 'createdAt' | 'readBy'>) => {
                setAnnouncements(prev => [{...announcementData, id: `anno-${Date.now()}`, createdAt: new Date(), readBy: []}, ...prev]);
            },
            markAnnouncementAsRead: (announcementId: string, userId: string) => {
                setAnnouncements(prev => prev.map(a => a.id === announcementId ? {...a, readBy: [...a.readBy, userId]} : a));
            },
            addCustomer: (customerData: Omit<Customer, 'id' | 'creditBalance'>) => setCustomers(prev => [...prev, {...customerData, id: `cust-${Date.now()}`, creditBalance: 0}]),
            recordCreditPayment: (customerId: string, amount: number) => {
                setCustomers(prev => prev.map(c => c.id === customerId ? {...c, creditBalance: Math.max(0, c.creditBalance - amount)} : c));
            },
            addDeposit: async (depositData: Omit<Deposit, 'id' | 'date' | 'status'>): Promise<{success: boolean, message: string}> => {
                const newDeposit: Deposit = {...depositData, id: `dep-${Date.now()}`, date: new Date(), status: 'ACTIVE' };
                setDeposits(prev => [newDeposit, ...prev]);
                return { success: true, message: 'Deposit recorded successfully.'};
            },
            updateDeposit: (depositId: string, updates: Partial<Pick<Deposit, 'status' | 'notes' | 'appliedSaleId'>>) => {
                setDeposits(prev => prev.map(d => d.id === depositId ? {...d, ...updates} : d));
            },
            addConsignment: (consignmentData: Omit<Consignment, 'id' | 'status'>) => {
                setConsignments(prev => [...prev, {...consignmentData, id: `con-${Date.now()}`, status: 'ACTIVE'}] );
            },
            addCategory: (categoryName: string) => setCategories(prev => [...prev, {id: `cat-${Date.now()}`, name: categoryName}]),
            updateCategory: (categoryId: string, newName: string) => {
                setCategories(prev => prev.map(c => c.id === categoryId ? {...c, name: newName} : c));
            },
            extendTrial: (tenantId: string, days: number) => {
                setTenants(prev => prev.map(t => {
                    if (t.id === tenantId && t.trialEndDate) {
                        const newEndDate = new Date(t.trialEndDate);
                        newEndDate.setDate(newEndDate.getDate() + days);
                        return { ...t, trialEndDate: newEndDate };
                    }
                    return t;
                }));
            },
            activateSubscription,
            changeSubscriptionPlan: (tenantId: string, newPlanId: string, billingCycle: 'monthly' | 'yearly') => {
                setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, planId: newPlanId, billingCycle } : t));
            },
            processExpiredTrials: () => { 
                let processed = 0, suspended = 0;
                setTenants(prev => prev.map(t => {
                    if (t.status === 'TRIAL' && t.trialEndDate && new Date(t.trialEndDate) < new Date()) {
                        processed++; suspended++;
                        return {...t, status: 'SUSPENDED'};
                    }
                    processed++;
                    return t;
                }));
                return { processed, suspended };
            },
            sendExpiryReminders: () => { return { sent: 0 }; },
            processSubscriptionPayment: async (tenantId: string, planId: string, method: string, amount: number, billingCycle: 'monthly' | 'yearly', success: boolean, proofOfPaymentUrl?: string): Promise<{success: boolean, message: string}> => {
                const newTx: PaymentTransaction = {
                    id: `txn-${Date.now()}`, tenantId, planId, amount, method, status: 'PENDING', createdAt: new Date(), proofOfPaymentUrl, transactionId: `pi_${Date.now()}`
                };
                if (method !== 'Manual') {
                    newTx.status = success ? 'COMPLETED' : 'FAILED';
                }
                setPaymentTransactions(prev => [newTx, ...prev]);
                if (success) {
                    activateSubscription(tenantId, planId, billingCycle);
                    return { success: true, message: 'Payment successful! Your plan has been activated.' };
                }
                 if(method === 'Manual') {
                     return { success: true, message: 'Your payment has been submitted for review. Your plan will be activated upon approval.' };
                }
                return { success: false, message: 'Payment failed. Please try again or use a different method.' };
            },
            updatePaymentTransactionStatus: (transactionId: string, newStatus: 'COMPLETED' | 'REJECTED') => {
                setPaymentTransactions(prev => prev.map(tx => tx.id === transactionId ? {...tx, status: newStatus} : tx));
            },
            updateEmailTemplate: (templateId: string, newSubject: string, newBody: string) => {
                setEmailTemplates(prev => prev.map(t => t.id === templateId ? {...t, subject: newSubject, body: newBody} : t));
            },
            updateSmsTemplate: (templateId: string, newBody: string) => {
                setSmsTemplates(prev => prev.map(t => t.id === templateId ? {...t, body: newBody} : t));
            },
            markInAppNotificationAsRead: (notificationId: string) => {
                setInAppNotifications(prev => prev.map(n => n.id === notificationId ? {...n, read: true} : n));
            },
            submitSupportTicket: (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'status' | 'messages'> & { messages: Omit<TicketMessage, 'id'| 'timestamp'>[] }) => {
                if(!currentTenant) return;
                const newTicket: SupportTicket = {
                    ...ticketData,
                    id: `ticket-${Date.now()}`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tenantId: currentTenant.id,
                    status: 'Open',
                    messages: ticketData.messages.map(m => ({...m, id: `msg-${Date.now()}`, timestamp: new Date()}))
                };
                setSupportTickets(prev => [newTicket, ...prev]);
            },
            replyToSupportTicket: (ticketId: string, message: Omit<TicketMessage, 'id' | 'timestamp'>) => {
                 setSupportTickets(prev => prev.map(t => t.id === ticketId ? {...t, updatedAt: new Date(), status: message.sender === 'ADMIN' ? 'In Progress' : 'Open', messages: [...t.messages, {...message, id: `msg-${Date.now()}`, timestamp: new Date()}]} : t));
            },
            updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => {
                setSupportTickets(prev => prev.map(t => t.id === ticketId ? {...t, status, updatedAt: new Date()} : t));
            },
            addBlogPost: (postData: Omit<BlogPost, 'id' | 'createdAt' | 'authorName'>) => {
                const author = adminUsers.find(u => u.id === postData.authorId);
                const newPost: BlogPost = { ...postData, id: `blog-${Date.now()}`, createdAt: new Date(), authorName: author?.name || 'Admin'};
                setBlogPosts(prev => [newPost, ...prev]);
            },
            updateBlogPost: (postId: string, postData: Partial<Omit<BlogPost, 'id' | 'authorId' | 'authorName' | 'createdAt'>>) => {
                setBlogPosts(prev => prev.map(p => p.id === postId ? {...p, ...postData} : p));
            },
            deleteBlogPost: (postId: string) => setBlogPosts(prev => prev.filter(p => p.id !== postId)),
            updateLastLogin: (email: string, ip: string) => {
                 const lowerEmail = email.toLowerCase();
                 setAdminUsers(prev => prev.map(u => (u.email.toLowerCase() === lowerEmail || u.username?.toLowerCase() === lowerEmail) ? {...u, lastLoginIp: ip, lastLoginDate: new Date()} : u));
                 setTenants(prev => prev.map(t => (t.email.toLowerCase() === lowerEmail || t.username.toLowerCase() === lowerEmail) ? {...t, lastLoginIp: ip, lastLoginDate: new Date()} : t));
            },
        }}>
            {children}
        </AppContext.Provider>
    );
};