import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/hooks/use-language';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/currency-context';

type SearchBarProps = {
  className?: string;
  fullWidth?: boolean;
  placeholder?: string;
  onSearch?: (query: string) => void;
};

export default function SearchBar({ className, fullWidth = false, placeholder, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, language, isRtl } = useLanguage();
  const { formatCurrency } = useCurrency();
  const [, navigate] = useLocation();

  // Fetch all products for search
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Filter products based on search query
  const filteredProducts = query.length >= 2 
    ? products.filter(product => {
        const searchQuery = query.toLowerCase();
        
        if (language === 'ar') {
          // When in Arabic mode, check Arabic fields first, then English
          return (
            (product.nameAr && product.nameAr.toLowerCase().includes(searchQuery)) ||
            (product.descriptionAr && product.descriptionAr.toLowerCase().includes(searchQuery)) ||
            product.name.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery)
          );
        } else {
          // When in English mode, check English fields
          return (
            product.name.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery)
          );
        }
      }).slice(0, 5) // Limit to 5 results
    : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(value.length >= 2);
    setFocusedIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim().length >= 2) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      }
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowDropdown(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filteredProducts.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % (filteredProducts.length + 1)); // +1 for "See all results"
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + filteredProducts.length + 1) % (filteredProducts.length + 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredProducts.length) {
          navigate(`/products/${filteredProducts[focusedIndex].slug}`);
          setShowDropdown(false);
        } else if (focusedIndex === filteredProducts.length) {
          // "See all results" option
          navigate(`/products?search=${encodeURIComponent(query.trim())}`);
          setShowDropdown(false);
        } else if (query.trim().length >= 2) {
          navigate(`/products?search=${encodeURIComponent(query.trim())}`);
          setShowDropdown(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) && 
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={cn(
      "relative", 
      fullWidth ? "w-full" : "w-[180px] sm:w-64 md:w-80",
      className
    )}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || (language === 'ar' ? 'البحث...' : 'Search...')}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          className={cn(
            "border border-gray-300 rounded h-8 sm:h-9 text-xs sm:text-sm bg-white",
            isRtl 
              ? "text-right pl-7 sm:pl-9 pr-3" 
              : "pr-7 sm:pr-9"
          )}
        />
        
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "absolute text-gray-500 hover:text-gray-700",
              isRtl ? "left-7 sm:left-8" : "right-7 sm:right-8"
            )}
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        ) : null}
        
        <Button 
          type="submit" 
          variant="ghost" 
          size="icon" 
          className={cn(
            "absolute text-gray-700 hover:text-green-700 p-0 bg-transparent",
            isRtl ? "left-1 sm:left-2" : "right-1 sm:right-2"
          )}
        >
          <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </form>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden w-full max-h-[300px] sm:max-h-[400px] overflow-y-auto",
            isRtl && "text-right"
          )}
        >
          {filteredProducts.length === 0 ? (
            <div className="text-center p-2 sm:p-3 text-gray-500 text-xs sm:text-sm">
              {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
            </div>
          ) : (
            <>
              {filteredProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={cn(
                    "flex items-center p-2 sm:p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors",
                    isRtl && "flex-row-reverse", 
                    focusedIndex === index && "bg-gray-50"
                  )}
                  onClick={() => setShowDropdown(false)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 shrink-0",
                    isRtl ? "ml-2 sm:ml-3" : "mr-2 sm:mr-3"
                  )}>
                    <img
                      src={product.imageUrl}
                      alt={language === 'ar' && product.nameAr ? product.nameAr : product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">
                      {language === 'ar' && product.nameAr ? product.nameAr : product.name}
                    </p>
                    <p className="text-primary-600 font-medium text-xs sm:text-sm">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </Link>
              ))}

              <Link
                href={`/products?search=${encodeURIComponent(query.trim())}`}
                className={cn(
                  "block p-2 sm:p-3 text-center text-primary-600 font-medium text-xs sm:text-sm bg-gray-50 hover:bg-gray-100 transition-colors",
                  focusedIndex === filteredProducts.length && "bg-gray-100"
                )}
                onClick={() => setShowDropdown(false)}
                onMouseEnter={() => setFocusedIndex(filteredProducts.length)}
              >
                {language === 'ar' ? 'مشاهدة كل النتائج' : 'See all results'}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}