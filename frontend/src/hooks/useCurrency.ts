import { useState, useEffect } from 'react';

export function useCurrency() {
  const [currency, setCurrencyState] = useState('USD');

  useEffect(() => {
    const saved = localStorage.getItem('erp_currency');
    if (saved) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('erp_currency', newCurrency);
  };

  const symbol = currency === 'INR' ? '₹' : '$';

  return { currency, setCurrency, symbol };
}
