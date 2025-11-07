
import { useMemo } from 'react';
import { useAppContext } from './useAppContext';

const translations: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    pos: 'Point of Sale',
    inventory: 'Inventory',
    purchases: 'Purchases',
    logistics: 'Logistics',
    accounting: 'Accounting',
    reports: 'Reports',
    settings: 'Settings',
    totalRevenue: 'Total Revenue',
    creditManagement: 'Credit Management',
    consignment: 'Consignment',
    billing: 'Billing',
    checkout: 'Checkout',
    paymentGateways: 'Payment Gateways',
    transactions: 'Transactions',
    templates: 'Templates',
    maintenance: 'Maintenance',
    accessManagement: 'Access Management',
    profile: 'Profile',
    auditLogs: 'Audit Logs',
  },
  es: {
    dashboard: 'Tablero',
    pos: 'Punto de Venta',
    inventory: 'Inventario',
    purchases: 'Compras',
    logistics: 'Logística',
    accounting: 'Contabilidad',
    reports: 'Informes',
    settings: 'Ajustes',
    totalRevenue: 'Ingresos Totales',
    creditManagement: 'Gestión de Crédito',
    consignment: 'Consignación',
    billing: 'Facturación',
    checkout: 'Pagar',
    paymentGateways: 'Pasarelas de Pago',
    transactions: 'Transacciones',
    templates: 'Plantillas',
    maintenance: 'Mantenimiento',
    accessManagement: 'Gestión de Acceso',
    profile: 'Perfil',
    auditLogs: 'Registros de Auditoría',
  },
  fr: {
    dashboard: 'Tableau de Bord',
    pos: 'Point de Vente',
    inventory: 'Inventaire',
    purchases: 'Achats',
    logistics: 'Logistique',
    accounting: 'Comptabilité',
    reports: 'Rapports',
    settings: 'Paramètres',
    totalRevenue: 'Revenu Total',
    creditManagement: 'Gestion de Crédit',
    consignment: 'Consignation',
    billing: 'Facturation',
    checkout: 'Paiement',
    paymentGateways: 'Passerelles de Paiement',
    transactions: 'Transactions',
    templates: 'Modèles',
    maintenance: 'Maintenance',
    accessManagement: 'Gestion d\'accès',
    profile: 'Profil',
    auditLogs: 'Journaux d\'audit',
  }
};

export const useTranslation = () => {
  const { currentLanguage, setCurrentLanguage, systemSettings } = useAppContext();

  const t = (key: string): string => {
    const lowerKey = key.toLowerCase();
    return translations[currentLanguage]?.[lowerKey] || key;
  };
  
  const availableLanguages = useMemo(() => {
    return systemSettings.languages.filter(lang => lang.enabled);
  }, [systemSettings.languages]);

  return { t, currentLanguage, changeLanguage: setCurrentLanguage, availableLanguages };
};
