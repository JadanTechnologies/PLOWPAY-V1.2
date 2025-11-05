import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { Product, Sale, AppContextType, ProductVariant, Branch } from '../types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

const mockBranches: Branch[] = [
    { id: 'branch-1', name: 'Downtown' },
    { id: 'branch-2', name: 'Uptown' },
    { id: 'branch-3', name: 'Westside' },
    { id: 'branch-4', name: 'Eastside' },
];

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

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [sales] = useState<Sale[]>(mockSales);
    const [branches] = useState<Branch[]>(mockBranches);

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
    
    const adjustStock = useCallback((productId: string, variantId: string, branchId: string, newStock: number) => {
        setProducts(prevProducts => {
            return prevProducts.map(product => {
                if (product.id === productId) {
                    const newVariants = product.variants.map(variant => {
                        if (variant.id === variantId) {
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
    }, []);

    const transferStock = useCallback((productId: string, variantId: string, fromBranchId: string, toBranchId: string, quantity: number) => {
        setProducts(prevProducts => {
            return prevProducts.map(p => {
                if (p.id === productId) {
                    return {
                        ...p,
                        variants: p.variants.map(v => {
                            if (v.id === variantId) {
                                const fromStock = v.stockByBranch[fromBranchId] ?? 0;
                                const toStock = v.stockByBranch[toBranchId] ?? 0;
                                
                                if (fromStock >= quantity) {
                                    const newStockByBranch = {
                                        ...v.stockByBranch,
                                        [fromBranchId]: fromStock - quantity,
                                        [toBranchId]: toStock + quantity,
                                    };
                                    return { ...v, stockByBranch: newStockByBranch };
                                }
                            }
                            return v;
                        })
                    };
                }
                return p;
            });
        });
    }, []);

    const value = {
        products,
        sales,
        branches,
        getMetric,
        adjustStock,
        transferStock,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};