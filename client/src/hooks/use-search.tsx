import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/hooks/use-language';
import { Product } from '@shared/schema';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(value.length >= 2);
  };

  const handleInputFocus = () => {
    if (query.length >= 2) {
      setShowResults(true);
    }
  };

  const closeResults = () => {
    setShowResults(false);
  };

  const getProductName = (product: Product) => {
    return language === 'ar' && product.nameAr ? product.nameAr : product.name;
  };

  const getProductDescription = (product: Product) => {
    return language === 'ar' && product.descriptionAr ? product.descriptionAr : product.description;
  };

  return {
    query,
    results,
    isSearching,
    showResults,
    handleInputChange,
    handleInputFocus,
    closeResults,
    getProductName,
    getProductDescription
  };
}
