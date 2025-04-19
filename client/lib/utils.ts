import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Language } from "@/contexts/language-context";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Moved to currency-context.tsx
export function formatPrice(price: string | number) {
  return `$${Number(price).toFixed(2)}`;
}

export function getLanguageFromUrl(): Language | null {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (lang === 'ar' || lang === 'en') {
    return lang;
  }
  return null;
}

export function setLanguageInUrl(lang: Language) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.history.replaceState({}, '', url);
}

// Get the currency from URL (used for sharing links)
export function getCurrencyFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('currency');
}

// Set currency in URL (for link sharing)
export function setCurrencyInUrl(currencyCode: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('currency', currencyCode);
  window.history.replaceState({}, '', url);
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
