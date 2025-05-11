import { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useSearch } from "@/hooks/use-search";
import { Input } from "@/components/ui/input";
import SearchResults from "@/components/search/search-results";

export default function SearchBar() {
  const { t, isRtl } = useLanguage();
  const {
    query,
    results,
    isSearching,
    showResults,
    handleInputChange,
    handleInputFocus,
    closeResults,
  } = useSearch();
  
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        closeResults();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeResults]);

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder={t("search_placeholder")}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className={`w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 ${
            isRtl ? "text-right pr-4 pl-10" : "text-left pl-4 pr-10"
          }`}
        />
        <Search 
          className={`h-5 w-5 absolute top-1/2 transform -translate-y-1/2 text-neutral-400 ${
            isRtl ? "left-3" : "right-3"
          }`} 
        />
      </div>
      
      {showResults && (
        <SearchResults 
          results={results} 
          isSearching={isSearching} 
          closeResults={closeResults}
        />
      )}
    </div>
  );
}
