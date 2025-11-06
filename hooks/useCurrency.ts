

import { useAppContext } from './useAppContext';
import { Currency } from '../types';

export const useCurrency = () => {
  const { systemSettings, currentCurrency } = useAppContext();

  const formatCurrency = (value: number) => {
    const currency: Currency | undefined = systemSettings.currencies.find(c => c.code === currentCurrency);
    const symbol = currency ? currency.symbol : '$';

    return `${symbol}${value.toFixed(2)}`;
  };

  return { formatCurrency };
};