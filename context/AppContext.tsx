
import React, { createContext, useState, ReactNode } from 'react';
import { Product, Sale, AppContextType, ProductVariant } from '../types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

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
                variants: variants[category as keyof typeof variants].map((variant, index) => ({
                    id: `var-${productId}-${index}`,
                    name: variant.name,
                    price: variant.price,
                    sku: `${name.substring(0,3).toUpperCase()}-${index}`,
                    stock: Math.floor(Math.random() * 100)
                }))
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
            branch: ['Downtown', 'Uptown'][Math.floor(Math.random() * 2)],
            customer: ['John Doe', 'Jane Smith', 'Walk-in'][Math.floor(Math.random() * 3)]
        });
    }
    return sales.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const mockProducts = generateMockProducts();
const mockSales = generateMockSales(mockProducts);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products] = useState<Product[]>(mockProducts);
    const [sales] = useState<Sale[]>(mockSales);

    const getMetric = (metric: 'totalRevenue' | 'salesVolume' | 'newCustomers' | 'activeBranches') => {
        switch (metric) {
            case 'totalRevenue':
                return sales.reduce((acc, sale) => acc + sale.total, 0);
            case 'salesVolume':
                return sales.length;
            case 'newCustomers':
                return 32; // mock
            case 'activeBranches':
                return 4; // mock
        }
    };

    const value = {
        products,
        sales,
        getMetric,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
