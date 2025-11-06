
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
  }
};

export const useTranslation = () => {
  const { currentLanguage, setCurrentLanguage, systemSettings } = useAppContext();

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || key;
  };
  
  const availableLanguages = useMemo(() => {
    return systemSettings.languages.filter(lang => lang.enabled);
  }, [systemSettings.languages]);

  return { t, currentLanguage, changeLanguage: setCurrentLanguage, availableLanguages };
};
