import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageDropdownProps {
  showText?: boolean;
  onLanguageChange?: () => void;
}

export function LanguageDropdown({ showText = false, onLanguageChange }: LanguageDropdownProps) {
  const { language, setLanguage, isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Define available languages
  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "ar", name: "Arabic", nativeName: "العربية" }
  ];

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = (e: React.MouseEvent) => {
    // Prevent event from bubbling up to parent elements
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Handle language selection
  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode as "en" | "ar");
    setIsOpen(false);
    
    // Call the callback if provided
    if (onLanguageChange) {
      onLanguageChange();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className={cn(
          "flex items-center text-gray-600 hover:text-green-700 transition-colors",
          isRtl && showText && "flex-row-reverse"
        )}
        aria-label="Change language"
      >
        <Globe className="h-5 w-5" />
        {showText && (
          <span className={cn("text-sm font-medium", isRtl ? "mr-1.5" : "ml-1.5")}>
            {language === "en" ? "English" : "العربية"}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={cn(
          "absolute mt-2 py-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-20",
          isRtl ? "right-0 text-right" : "left-0"
        )}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={(e) => {
                e.stopPropagation();
                handleLanguageSelect(lang.code);
              }}
              className={cn(
                "flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100",
                isRtl && "flex-row-reverse text-right",
                language === lang.code ? "text-green-700 font-medium" : "text-gray-700"
              )}
            >
              {language === lang.code && (
                <Check className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
              )}
              {language === lang.code ? (
                <span className={cn(isRtl ? "mr-2" : "ml-2", "flex-1")}>{lang.nativeName}</span>
              ) : (
                <span className="flex-1">{lang.nativeName}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}