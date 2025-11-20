import React, { createContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { 
    AppContextType, Product, Sale, Branch, StockLog, Tenant, SubscriptionPlan, 
    AdminUser, AdminRole, Permission, BrandConfig, PageContent, FaqItem, 
    PaymentSettings, NotificationSettings, Truck, Shipment, TrackerProvider, Staff, 
    CartItem, StaffRole, TenantPermission, allTenantPermissions, Supplier, 
    PurchaseOrder, Account, JournalEntry, Announcement, SystemSettings, Customer, 
    Consignment, Category, PaymentTransaction, EmailTemplate, SmsTemplate, 
    InAppNotification, MaintenanceSettings, AccessControlSettings, LandingPageMetrics, 
    AuditLog, NotificationType, Deposit, SupportTicket, TicketMessage, BlogPost, 
    LocalSession, Profile, allPermissions, IpGeolocationProvider, MapProvider, AISettings, SupabaseSettings,
    ProductVariant,
    Budget,
    CreditPayment,
    StockLogAction
} from '../types';

// Initial Data
const branches: Branch[] = [
  { id: 'branch-1', name: 'Downtown', location: { lat: 37.7749, lng: -122.4194 } },
  { id: 'branch-2', name: 'Uptown', location: { lat: 37.7949, lng: -122.4294 } },
];

const staffRoles: StaffRole[] = [
    { id: 'role-admin', name: 'Admin', permissions: allTenantPermissions },
    { id: 'role-cashier', name: 'Cashier', permissions: ['accessPOS', 'makeDeposits', 'viewReports', 'accessCashierCredit', 'accessCashierDeposits', 'makeCreditSales'] },
    { id: 'role-stock', name: 'Stock Manager', permissions: ['manageInventory', 'managePurchases', 'viewAuditLogs'] },
]

const staff: Staff[] = [
  { id: 'staff-1', name: 'Jane Doe', email: 'jane@example.com', username: 'jane', password: '12345', roleId: 'role-admin', branchId: 'branch-1', lastKnownLocation: { lat: 37.78, lng: -122.41, timestamp: new Date() } },
  { id: 'staff-2', name: 'John Smith', email: 'john@example.com', username: 'john', password: '12345', roleId: 'role-cashier', branchId: 'branch-1', lastKnownLocation: { lat: 37.77, lng: -122.43, timestamp: new Date() } },
];

const categories: Category[] = [
    { id: 'cat-1', name: 'Electronics' },
    { id: 'cat-2', name: 'Groceries' },
    { id: 'cat-3', name: 'Apparel' },
]

const products: Product[] = [
  { id: 'prod-1', name: 'Laptop', categoryId: 'cat-1', variants: [
      { id: 'var-1a', name: '13-inch', sku: 'LP13', sellingPrice: 1200, costPrice: 800, stockByBranch: { 'branch-1': 10, 'branch-2': 5 }, batchNumber: 'B123', expiryDate: '2025-12-31' },
      { id: 'var-1b', name: '15-inch', sku: 'LP15', sellingPrice: 1500, costPrice: 1000, stockByBranch: { 'branch-1': 8, 'branch-2': 3 } }
  ], isFavorite: true },
  { id: 'prod-2', name: 'Milk', categoryId: 'cat-2', variants: [
      { id: 'var-2a', name: '1 Gallon', sku: 'MK1G', sellingPrice: 4, costPrice: 2.5, stockByBranch: { 'branch-1': 50, 'branch-2': 30 }, consignmentStockByBranch: { 'branch-1': 20 }, reorderPointByBranch: {'branch-1': 10}, expiryDate: '2024-08-15' }
  ], isFavorite: true },
  { id: 'prod-3', name: 'T-Shirt', categoryId: 'cat-3', variants: [
      { id: 'var-3a', name: 'Medium', sku: 'TSM', sellingPrice: 25, costPrice: 10, stockByBranch: { 'branch-1': 100, 'branch-2': 80 } },
      { id: 'var-3b', name: 'Large', sku: 'TSL', sellingPrice: 25, costPrice: 10, stockByBranch: { 'branch-1': 90, 'branch-2': 70 } }
  ] },
  { id: 'prod-4', name: 'Keyboard', categoryId: 'cat-1', variants: [
      { id: 'var-4a', name: 'Standard', sku: 'KB104', sellingPrice: 75, costPrice: 40, stockByBranch: { 'branch-1': 25, 'branch-2': 15 } }
  ] },
];

const customers: Customer[] = [
    { id: 'cust-walkin', name: 'Walk-in Customer', creditBalance: 0 },
    { id: 'cust-1', name: 'Alice Johnson', phone: '555-0101', email: 'alice@example.com', creditBalance: 250, creditLimit: 1000 },
    { id: 'cust-2', name: 'Bob Williams', phone: '555-0102', email: 'bob@example.com', creditBalance: 0 },
];

const sales: Sale[] = [
  { id: 'sale-1', date: new Date(new Date().setDate(new Date().getDate() - 1)), items: [
      { productId: 'prod-1', variantId: 'var-1a', name: 'Laptop', variantName: '13-inch', quantity: 1, sellingPrice: 1200, costPrice: 800 },
      { productId: 'prod-4', variantId: 'var-4a', name: 'Keyboard', variantName: 'Standard', quantity: 1, sellingPrice: 75, costPrice: 40 }
  ], total: 1275, branchId: 'branch-1', customerId: 'cust-1', payments: [{ method: 'Card', amount: 1275 }], change: 0, staffId: 'staff-1', status: 'PAID', amountDue: 0 },
  { id: 'sale-2', date: new Date(new Date().setDate(new Date().getDate() - 2)), items: [
      { productId: 'prod-2', variantId: 'var-2a', name: 'Milk', variantName: '1 Gallon', quantity: 2, sellingPrice: 4, costPrice: 2.5 }
  ], total: 8, branchId: 'branch-2', customerId: 'cust-walkin', payments: [{ method: 'Cash', amount: 10 }], change: 2, staffId: 'staff-2', status: 'PAID', amountDue: 0 },
  { id: 'sale-3', date: new Date(new Date().setDate(new Date().getDate() - 35)), items: [
      { productId: 'prod-3', variantId: 'var-3a', name: 'T-Shirt', variantName: 'Medium', quantity: 5, sellingPrice: 25, costPrice: 10 }
  ], total: 125, branchId: 'branch-1', customerId: 'cust-1', payments: [], change: 0, staffId: 'staff-1', status: 'UNPAID', amountDue: 125 },
];

const stockLogs: StockLog[] = [
    { id: 'log-1', date: new Date(new Date().setDate(new Date().getDate() - 1)), productId: 'prod-1', variantId: 'var-1a', productName: 'Laptop', variantName: '13-inch', action: 'SALE', quantity: -1, branchId: 'branch-1' },
];

const subscriptionPlans: SubscriptionPlan[] = [
    { id: 'plan-basic', name: 'Basic', price: 29, priceYearly: 290, features: ['1 Branch', '2 Staff Accounts', 'Basic Reporting'], description: 'Perfect for new businesses getting started.', recommended: false },
    { id: 'plan-pro', name: 'Pro', price: 79, priceYearly: 790, features: ['5 Branches', '10 Staff Accounts', 'Advanced Reporting', 'Logistics Management'], description: 'For growing businesses expanding their operations.', recommended: true },
    { id: 'plan-enterprise', name: 'Enterprise', price: 199, priceYearly: 1990, features: ['Unlimited Branches', 'Unlimited Staff', 'All Features Included', 'Dedicated Support'], description: 'For large-scale businesses with complex needs.', recommended: false },
];

const tenant1: Tenant = {
    id: 'tenant-123',
    businessName: 'Innovate Creations',
    ownerName: 'Demo Tenant',
    email: 'tenant@flowpay.com',
    username: 'tenant',
    companyAddress: '123 Innovation Drive, Tech City',
    companyPhone: '(555) 123-4567',
    companyLogoUrl: 'https://tailwindui.com/img/logos/mark.svg?color=cyan&shade=500',
    status: 'TRIAL',
    planId: 'plan-pro',
    joinDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    trialEndDate: new Date(new Date().setDate(new Date().getDate() + 9)),
    currency: 'NGN',
    language: 'en',
    timezone: 'Africa/Lagos',
    isVerified: true,
    billingCycle: 'monthly',
    automations: { generateEODReport: true, sendLowStockAlerts: false, sendCreditLimitAlerts: false },
    logisticsConfig: { activeTrackerProviderId: 'teltonika' },
    lastKnownLocation: { lat: 37.7749, lng: -122.4194, timestamp: new Date() }
};

const tenants: Tenant[] = [ tenant1 ];

const adminUsers: AdminUser[] = [
    { id: 'admin-super', name: 'Super Admin', email: 'super@flowpay.com', username: