

import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { Product, Sale, AppContextType, ProductVariant, Branch, StockLog, Tenant, SubscriptionPlan, TenantStatus, AdminUser, AdminUserStatus, BrandConfig, PageContent, FaqItem, AdminRole, Permission, PaymentSettings, NotificationSettings } from '../types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

const mockBranches: Branch[] = [
    { id: 'branch-1', name: 'Downtown' },
    { id: 'branch-2', name: 'Uptown' },
    { id: 'branch-3', name: 'Westside' },
    { id: 'branch-4', name: 'Eastside' },
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
        tenants.push({
            id: `tenant-${i+1}`,
            businessName: businessNames[i],
            ownerName: ownerNames[i],
            email: `${ownerNames[i].split(' ')[0].toLowerCase()}@example.com`,
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
                        price: variant.price,
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
    for (let i = 0; i < 50; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const variant = product.variants[Math.floor(Math.random() * product.variants.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const total = variant.price * quantity;
        sales.push({
            id: `sale-${i}`,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            items: [{
                productId: product.id,
                variantId: variant.id,
                name: product.name,
                variantName: variant.name,
                quantity: quantity,
                price: variant.price
            }],
            total: total,
            branchId: mockBranches[Math.floor(Math.random() * mockBranches.length)].id,
            customer: ['John Doe', 'Jane Smith', 'Walk-in'][Math.floor(Math.random() * 3)]
        });
    }
    return sales.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const mockProducts = generateMockProducts();
const mockSales = generateMockSales(mockProducts);
export const mockTenants = generateMockTenants();
// FIX: Corrected function call to match its definition.
const mockAdminUsers = generateMockAdminUsers();

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
            enabled: false,
            accountSid: '',
            apiKey: '',
            fromNumber: ''
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
    const [sales] = useState<Sale[]>(mockSales);
    const [branches] = useState<Branch[]>(mockBranches);
    const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
    const [tenants] = useState<Tenant[]>(mockTenants);
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(mockSubscriptionPlans);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>(mockAdminUsers);
    const [adminRoles, setAdminRoles] = useState<AdminRole[]>(mockAdminRoles);
    // Simulate a logged-in super admin user to enforce permissions
    const [currentAdminUser] = useState<AdminUser | null>(mockAdminUsers.find(u => u.email === 'admin@flowpay.com') || null);
    const [brandConfig, setBrandConfig] = useState<BrandConfig>(mockBrandConfig);
    const [pageContent, setPageContent] = useState<PageContent>(mockPageContent);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(mockPaymentSettings);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings);
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


    const value: AppContextType = {
        products,
        sales,
        branches,
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
        searchTerm,
        setSearchTerm,
        getMetric,
        adjustStock,
        transferStock,
        addProduct,
        addAdminUser,
        updateAdminUser,
        updateAdminRole,
        updateBrandConfig,
        updatePageContent,
        updateFaqs,
        updatePaymentSettings,
        updateNotificationSettings,
        addSubscriptionPlan,
        updateSubscriptionPlan,
        deleteSubscriptionPlan,
        logout: onLogout,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};