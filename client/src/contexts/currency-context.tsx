import React, { createContext, useState, useContext, useEffect } from "react";
import { FlagIconCode } from "react-flag-kit";

type Currency = {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number; // Exchange rate relative to USD
  countryCode?: FlagIconCode; // Country code for flag display
};

export const CURRENCIES: Record<string, Currency> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    exchangeRate: 1,
    countryCode: "US",
  },
  AED: {
    code: "AED",
    symbol: "د.إ",
    name: "UAE Dirham",
    exchangeRate: 3.67,
    countryCode: "AE",
  },
  OMR: {
    code: "OMR",
    symbol: "",
    name: "Omani Rial",
    exchangeRate: 0.38,
    countryCode: "OM",
  },
  KWD: {
    code: "KWD",
    symbol: "د.ك",
    name: "Kuwaiti Dinar",
    exchangeRate: 0.31,
    countryCode: "KW",
  },
  SAR: {
    code: "SAR",
    symbol: "ر.س",
    name: "Saudi Riyal",
    exchangeRate: 3.75,
    countryCode: "SA",
  },
};

// Currency codes mapped to regions
const REGION_CURRENCIES: Record<string, string> = {
  AE: "AED", // UAE
  OM: "OMR", // Oman
  US: "USD", // United States
  KW: "KWD", // Kuwait
  SA: "SAR", // Saudi Arabia
};

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: string | number) => string;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES.USD,
  setCurrency: () => {},
  formatCurrency: () => "",
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to OMR currency for all users
  const [currency, setCurrency] = useState<Currency>(CURRENCIES.OMR);

  // No need to detect region, we're showing OMR by default
  useEffect(() => {
    // Default to OMR for all users
    setCurrency(CURRENCIES.OMR);
  }, []);

  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    
    // If showing OMR prices, display without conversion
    if (currency.code === 'OMR') {
      return `${numAmount.toFixed(2)} OMR`;
    }
    
    // For other currencies, we need to convert from OMR to the target currency
    // First convert from OMR to USD (divide by OMR rate), then to target currency (multiply by target rate)
    const omrToUsd = numAmount / CURRENCIES.OMR.exchangeRate;
    const convertedAmount = omrToUsd * currency.exchangeRate;

    // Get the current language from the HTML tag
    const currentLang = document.documentElement.lang || 'en';
    const isArabic = currentLang === 'ar';
    
    // Check if we need to replace Arabic symbols with code for non-Arabic UI
    const useCode = !isArabic && ['OMR', 'AED', 'KWD', 'SAR'].includes(currency.code);
    
    if (useCode) {
      return `${convertedAmount.toFixed(2)} ${currency.code}`;
    } else {
      return `${convertedAmount.toFixed(2)}${currency.symbol}`;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);