import { useState, useCallback } from 'react';

const FIXED_RATE = 83.5; // INR per USD, update as needed

interface ConversionResult {
  usd: number;
  inr: number;
  rate: number;
  loading: boolean;
  error: string | null;
  convert: (usdAmount: number) => Promise<number>;
}

export const useCurrencyConverter = (initialUsd: number = 0): ConversionResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(async (usdAmount: number): Promise<number> => {
    if (usdAmount <= 0) throw new Error('Amount must be positive');

    setLoading(true);
    setError(null);
    try {
      // Fixed rate for reliability; could fetch from API
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      // const data = await response.json();
      // const rate = data.rates.INR;
      const rate = FIXED_RATE;
      return usdAmount * rate;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const inr = initialUsd * FIXED_RATE;

  return {
    usd: initialUsd,
    inr,
    rate: FIXED_RATE,
    loading,
    error,
    convert, // async function for dynamic conversions
  };
};

