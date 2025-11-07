import { useAppContext } from './useAppContext';
import { allCurrencies } from '../utils/data';

export const useCurrency = () => {
  const { currentCurrency } = useAppContext();

  const formatCurrency = (value: number) => {
    const currency = allCurrencies.find(c => c.code === currentCurrency);
    const symbol = currency ? currency.symbol : '$';

    return `${symbol}${value.toFixed(2)}`;
  };

  return { formatCurrency };
};
