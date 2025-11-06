
import { useAppContext } from './useAppContext';
import { Currency } from '../types';

export const useCurrency = () => {
  const { systemSettings, currentTenant } = useAppContext();

  const formatCurrency = (value: number) => {
    const tenantCurrencyCode = currentTenant?.currency;
    const defaultCurrencyCode = systemSettings.defaultCurrency;
    
    const currencyCode = tenantCurrencyCode || defaultCurrencyCode;

    const currency: Currency | undefined = systemSettings.currencies.find(c => c.code === currencyCode);
    const symbol = currency ? currency.symbol : '$';

    return `${symbol}${value.toFixed(2)}`;
  };

  return { formatCurrency };
};
