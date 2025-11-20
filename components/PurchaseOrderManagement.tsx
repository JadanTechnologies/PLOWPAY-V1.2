import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { PurchaseOrder, PurchaseOrderItem } from '../../types';
import Icon from './icons/index.tsx';
import { useCurrency } from '../../hooks/useCurrency';

const PurchaseOrderManagement: React.FC = () => {
    const { purchaseOrders, suppliers, branches, products, addPurchaseOrder, updatePurchaseOrderStatus, setNotification } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [isModalOpen, setModalOpen] = useState(false);

    const initialFormState = {
        supplierId: suppliers[0]?.id || '',
        destinationBranchId: branches[0]?.id || '',
        items: [{ variantId: '', quantity: 1, cost: 0 }] as Omit<PurchaseOrderItem, 'variantName' | 'product