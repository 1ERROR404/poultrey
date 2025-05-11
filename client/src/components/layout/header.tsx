import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/contexts/currency-context";
import { useCart } from "@/contexts/cart-context";
import { useCartAnimation } from "@/contexts/cart-animation-context";
import { LanguageDropdown } from "@/components/language-dropdown";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { UserMenu } from "@/components/user/user-menu";
import SearchBar from "@/components/layout/search-bar";
import { ShoppingCart, Menu, ChevronDown, Search, Globe, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollToSection } from "@/lib/scrollToSection";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";
import { FaWhatsapp } from "react-icons/fa";
import poultryGearLogo from "@/assets/poultry-gear-logo.png";

export default function Header() {
  const { t, language, isRtl, setLanguage } = useLanguage();
  const { totalItems } = useCart();
  const { triggerAddToCartAnimation } = useCartAnimation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileProductsDropdown, setShowMobileProductsDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [location] = useLocation();
  // Ref for the cart icon (for animation target)
  const cartIconRef = useRef<HTMLAnchorElement>(null);

  // Make cart position available for animation
  useEffect(() => {
    // Expose the cart icon position for access by other components
    if (cartIconRef.current) {
      // Add data attributes for the cart icon position
      const rect = cartIconRef.current.getBoundingClientRect();
      document.documentElement.style.setProperty('--cart-icon-x', `${rect.x + (rect.width / 2)}px`);
      document.documentElement.style.setProperty('--cart-icon-y', `${rect.y + (rect.height / 2)}px`);
    }
  }, [cartIconRef.current, isMobileMenuOpen, showMobileSearch]);
  
  // Add global click handler to close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    
    const handleOutsideClick = (e: MouseEvent) => {
      // Check if the click was outside the mobile menu and not on the menu button itself
      const target = e.target as HTMLElement;
      const mobileMenu = document.getElementById('mobile-menu');
      const menuButton = document.getElementById('mobile-menu-button');
      
      if (mobileMenu && 
          !mobileMenu.contains(target) && 
          menuButton && 
          !menuButton.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };
    
    // Add event listener when menu is open
    document.addEventListener('click', handleOutsideClick);
    
    // Clean up event listener when component unmounts or menu closes
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isMobileMenuOpen]);
  
  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    staleTime: 60 * 1000, // 1 minute
  });

  // Handle the contact link click
  const handleContactClick = (e: React.MouseEvent) => {
    // If we're already on the about page
    if (location === '/about') {
      e.preventDefault();
      scrollToSection('contact');
    }
    // Always close the mobile menu
    setIsMobileMenuOpen(false);
  };
  
  // Handle the about us link click
  const handleAboutClick = (e: React.MouseEvent) => {
    // If we're already on the about page
    if (location === '/about') {
      e.preventDefault();
      // Scroll to absolute top of page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    // Always close the mobile menu
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* WhatsApp Contact Bar */}
      <div className="bg-green-600 text-white py-2">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-center">
            <a 
              href={`https://wa.me/94954004`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-white hover:text-green-100 transition-colors"
              aria-label="WhatsApp Contact"
              dir="ltr" 
            >
              <FaWhatsapp className="h-5 w-5 mr-2" />
              <span className="text-sm sm:text-base font-medium">+94954004</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Main Header */}
      <div className="bg-white">
        <div className="container mx-auto px-2 sm:px-4">
          <div className={cn(
            "flex items-center justify-between h-14 sm:h-16",
            isRtl && "flex-row-reverse"
          )}>
            {/* Logo - always in LTR direction regardless of language */}
            <Link href="/" className="flex items-center">
              <div className="flex items-center" dir="ltr">
                <img 
                  src={poultryGearLogo} 
                  alt="Poultry Gear Logo" 
                  className="h-16 sm:h-20 mr-1" 
                />
                <h1 className="text-lg sm:text-xl font-bold flex items-center">
                  {/* Always keep logo text in English */}
                  <span className="text-primary text-xl sm:text-2xl font-bold" style={{ color: "#2c5e2d" }}>Poultry</span>
                  <span className="mx-px">&nbsp;</span>
                  <span className="text-amber-500 text-xl sm:text-2xl font-bold">Gear</span>
                </h1>
              </div>
            </Link>

            {/* Main Navigation */}
            <nav className={cn(
              "hidden md:flex items-center space-x-5 lg:space-x-8 ml-4 lg:ml-8",
              isRtl && "flex-row-reverse space-x-reverse space-x-5 lg:space-x-8 mr-4 lg:mr-8 ml-0"
            )}>
              {isRtl ? (
                // Arabic UI order
                <>
                  <Link 
                    href="/about#contact" 
                    className={cn(
                      "text-black hover:text-gray-700 font-medium text-sm lg:text-base px-0.5 py-1",
                      isRtl && "text-right"
                    )}
                    onClick={handleContactClick}
                  >
                    {language === "ar" ? "اتصل بنا" : "Contact"}
                  </Link>
                  
                  <Link 
                    href="/about" 
                    className={cn(
                      "text-black hover:text-gray-700 font-medium text-sm lg:text-base px-0.5 py-1",
                      isRtl && "text-right"
                    )}
                    onClick={handleAboutClick}
                  >
                    {language === "ar" ? "من نحن" : "About Us"}
                  </Link>
                  
                  {/* Products Dropdown */}
                  <div className="relative group">
                    <Link 
                      href="/products"
                      className={cn(
                        "flex items-center text-black hover:text-gray-700 group-hover:text-gray-700 font-medium text-sm lg:text-base px-0.5 py-1",
                        isRtl && "flex-row-reverse text-right"
                      )}
                    >
                      {language === "ar" ? "المنتجات" : "Products"} 
                      <ChevronDown className={cn("h-4 w-4 transition-transform group-hover:rotate-180", isRtl ? "mr-1" : "ml-1")} />
                    </Link>
                    
                    <div className={cn(
                      "absolute mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0",
                      isRtl ? "right-0 text-right" : "left-0"
                    )}>
                      <div className="py-1">
                        {categories.map((category) => (
                          <Link 
                            key={category.id}
                            href={`/categories/${category.slug}`} 
                            className={cn(
                              "block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-green-700 text-sm",
                              isRtl && "text-right"
                            )}
                          >
                            {language === "ar" ? category.nameAr : category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href="/" 
                    className={cn(
                      "text-black hover:text-gray-700 font-medium text-sm lg:text-base px-0.5 py-1",
                      isRtl && "text-right"
                    )}
                  >
                    {language === "ar" ? "الرئيسية" : "Home"}
                  </Link>
                </>
              ) : (
                // English UI order
                <>
                  <Link 
                    href="/" 
                    className="text-black hover:text-gray-700 font-medium text-sm lg:text-base px-0.5 py-1"
                  >
                    {language === "ar" ? "الرئيسية" : "Home"}
                  </Link>
                  
                  {/* Products Dropdown */}
                  <div className="relative group">
                    <Link 
                      href="/products"
                      className="flex items-center text-black hover:text-gray-700 group-hover:text-gray-700 font-medium text-sm lg:text-base px-0.5 py-1"
                    >
                      {language === "ar" ? "المنتجات" : "Products"} 
                      <ChevronDown className="h-4 w-4 ml-1 transition-transform group-hover:rotate-180" />
                    </Link>
                    
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                      <div className="py-1">
                        {categories.map((category) => (
                          <Link 
                            key={category.id}
                            href={`/categories/${category.slug}`} 
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-green-700 text-sm"
                          >
                            {language === "ar" ? category.nameAr : category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href="/about" 
                    className="text-black hover:text-gray-700 font-medium text-sm lg:text-base px-0.5 py-1"
                    onClick={handleAboutClick}
                  >
                    {language === "ar" ? "من نحن" : "About Us"}
                  </Link>
                  <Link 
                    href="/about#contact" 
                    className="text-black hover:text-gray-700 font-medium text-sm lg:text-base px-0.5 py-1"
                    onClick={handleContactClick}
                  >
                    {language === "ar" ? "اتصل بنا" : "Contact"}
                  </Link>
                </>
              )}
            </nav>

            {/* Right-side tools */}
            <div className={cn(
              "flex items-center space-x-3 sm:space-x-5",
              isRtl && "flex-row-reverse space-x-reverse space-x-3 sm:space-x-5"
            )}>
              {/* Language Dropdown */}
              <div className="hidden md:block mr-1">
                <LanguageDropdown />
              </div>
              
              {/* Currency Switcher */}
              <div className="hidden md:block">
                <CurrencySwitcher />
              </div>
              
              {/* Search trigger */}
              <div className="hidden md:flex relative">
                <SearchBar 
                  fullWidth={false} 
                  placeholder={language === "ar" ? "البحث..." : "Search..."} 
                />
              </div>
              
              {/* User Menu - Visible on all devices */}
              <div>
                <UserMenu />
              </div>
              
              {/* Cart */}
              <Link 
                ref={cartIconRef}
                href="/cart" 
                className="text-gray-700 hover:text-green-700 transition-colors relative"
                aria-label="Shopping cart"
                id="cart-icon"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
              
              {/* Mobile search button */}
              <button 
                className="md:hidden text-gray-700 hover:text-green-700 transition-colors ml-2"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              
              {/* Mobile menu trigger */}
              <button 
                id="mobile-menu-button"
                className="md:hidden text-gray-700 hover:text-green-700 transition-colors ml-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Mobile search */}
          {showMobileSearch && (
            <div className="md:hidden pb-2 pt-1">
              <SearchBar 
                fullWidth={true} 
                placeholder={language === "ar" ? "البحث..." : "Search..."} 
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-200 bg-white shadow-md">
          <div className="container mx-auto px-4">
            <div className={cn(
              "py-2 space-y-1",
              isRtl && "text-right"
            )}>
              {/* Always use same English UI order regardless of language */}
              <Link 
                href="/" 
                className={cn(
                  "block py-2.5 text-black font-medium text-sm",
                  isRtl && "text-right w-full"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {language === "ar" ? "الرئيسية" : "Home"}
              </Link>
              <button 
                className={cn(
                  "flex items-center justify-between w-full py-2.5 text-black font-medium text-sm",
                  isRtl && "flex-row-reverse"
                )}
                onClick={() => {
                  setShowMobileProductsDropdown(!showMobileProductsDropdown);
                  // Don't close menu when toggling the dropdown, let user see the categories
                }}
              >
                <span className={isRtl ? "text-right w-full" : ""}>
                  {language === "ar" ? "المنتجات" : "Products"}
                </span>
                <ChevronDown className={`h-4 w-4 transform ${showMobileProductsDropdown ? 'rotate-180' : ''} transition-transform`} />
              </button>
              
              {showMobileProductsDropdown && (
                <div className={cn(
                  "py-1 space-y-1.5",
                  isRtl 
                    ? "border-r-2 border-gray-200 mr-2 pr-4 text-right" 
                    : "border-l-2 border-gray-200 ml-2 pl-4"
                )}>
                  {categories.map((category) => (
                    <Link 
                      key={category.id}
                      href={`/categories/${category.slug}`} 
                      className={cn(
                        "block py-1.5 text-gray-700 text-sm",
                        isRtl && "text-right"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {language === "ar" ? category.nameAr : category.name}
                    </Link>
                  ))}
                </div>
              )}
              
              <Link 
                href="/about" 
                className={cn(
                  "block py-2.5 text-black font-medium text-sm",
                  isRtl && "text-right w-full"
                )}
                onClick={handleAboutClick}
              >
                {language === "ar" ? "من نحن" : "About Us"}
              </Link>
              <Link 
                href="/about#contact" 
                className={cn(
                  "block py-2.5 text-black font-medium text-sm",
                  isRtl && "text-right w-full"
                )}
                onClick={handleContactClick}
              >
                {language === "ar" ? "اتصل بنا" : "Contact"}
              </Link>
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex flex-col space-y-3">
                  {/* WhatsApp Contact removed from mobile menu */}
                  
                  {/* Mobile account links removed */}
                  <div className="py-2">
                    <LanguageDropdown 
                      showText={true} 
                      onLanguageChange={() => {
                        // Delay closing the menu to allow language change to take effect
                        setTimeout(() => setIsMobileMenuOpen(false), 100);
                      }} 
                    />
                  </div>
                  <div className="py-2">
                    <CurrencySwitcher 
                      onCurrencyChange={() => {
                        // Delay closing the menu to allow currency change to take effect
                        setTimeout(() => setIsMobileMenuOpen(false), 100);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}