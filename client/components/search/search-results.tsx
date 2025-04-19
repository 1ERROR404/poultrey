import { useLanguage } from "@/hooks/use-language";
import { useSearch } from "@/hooks/use-search";
import { useCurrency } from "@/contexts/currency-context";
import { Link, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { truncateText } from "@/lib/utils";
import { Product } from "@shared/schema";

interface SearchResultsProps {
  results: Product[];
  isSearching: boolean;
  closeResults: () => void;
}

export default function SearchResults({ results, isSearching, closeResults }: SearchResultsProps) {
  const { t, language } = useLanguage();
  const { formatCurrency } = useCurrency();
  const [, navigate] = useLocation();
  const { query, getProductName } = useSearch();

  const handleResultClick = (slug: string) => {
    navigate(`/products/${slug}`);
    closeResults();
  };

  const handleViewAllClick = () => {
    navigate(`/products?search=${encodeURIComponent(query)}`);
    closeResults();
  };

  return (
    <div className="search-dropdown absolute w-full bg-white border border-neutral-200 rounded-md shadow-lg z-50 mt-1">
      {isSearching ? (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500 mr-2" />
          <span>Searching...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="search-no-results p-3 text-center text-neutral-600">
          {t("no_products_found")}
        </div>
      ) : (
        <>
          {results.slice(0, 5).map((product) => (
            <div
              key={product.id}
              className="flex items-center p-3 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
              onClick={() => handleResultClick(product.slug)}
            >
              <img
                src={product.imageUrl}
                className="w-16 h-16 object-cover rounded"
                alt={getProductName(product)}
              />
              <div className="ml-3">
                <div className="font-medium">{getProductName(product)}</div>
                <div className="text-accent-500 font-semibold">{formatCurrency(product.price)}</div>
              </div>
            </div>
          ))}
          <div
            className="p-3 text-center text-primary-500 font-medium hover:bg-neutral-50 cursor-pointer"
            onClick={handleViewAllClick}
          >
            {t("see_all_results")}
          </div>
        </>
      )}
    </div>
  );
}
