import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/contexts/currency-context";
import { useCart } from "@/contexts/cart-context";
import { useCartAnimation } from "@/contexts/cart-animation-context";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { cn } from "@/lib/utils";
import { Product } from "@shared/schema";
import { ShoppingCart, Heart, Eye } from "lucide-react";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { language, isRtl, t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const { addToCart } = useCart();
  const { triggerAddToCartAnimation } = useCartAnimation();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimatingButton, setIsAnimatingButton] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { scrollToTop } = useScrollToTop();
  const [_, setLocation] = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const productName = language === "ar" && product.nameAr ? product.nameAr : product.name;
  const badgeType = language === "ar" && product.badgeAr ? product.badgeAr : product.badge;
  
  // For badge display
  const getBadgeText = (badge: string) => {
    if (badge === 'new') return language === "ar" ? t("new") : "NEW";
    if (badge === 'sale') return language === "ar" ? t("sale_badge") : "SALE";
    if (badge === 'best seller') return language === "ar" ? t("bestseller") : "BESTSELLER";
    return badge;
  };

  // Add entry animation when card is in viewport
  useEffect(() => {
    if (!cardRef.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('card-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(cardRef.current);
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // Handle add to cart button click
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Visual feedback animation on button
    setIsAnimatingButton(true);
    setTimeout(() => setIsAnimatingButton(false), 500);
    
    // Add to cart
    addToCart(product, 1);
    
    // Get button position for animation
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const startX = buttonRect.x + buttonRect.width / 2;
      const startY = buttonRect.y + buttonRect.height / 2;
      
      // Get cart position from CSS variables
      const cartX = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cart-icon-x') || '0');
      const cartY = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cart-icon-y') || '0');
      
      // Trigger animation
      triggerAddToCartAnimation(
        product.imageUrl,
        { x: startX, y: startY },
        { x: cartX, y: cartY }
      );
    }
    
    // After animation is complete, navigate to cart page
    setTimeout(() => {
      setLocation('/cart');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  // Handle view product details
  const handleViewProduct = () => {
    setLocation(`/products/${product.slug}`);
    scrollToTop();
  };

  return (
    <div 
      ref={cardRef}
      className={cn(
        "group bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative flex flex-col h-[380px]",
        "opacity-0 translate-y-4 card-entry-animation", // Initial state for entry animation
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge */}
      {badgeType && (
        <div className={cn(
          "absolute top-3 z-10 transition-transform duration-300 transform",
          isRtl ? "right-3 origin-right" : "left-3 origin-left",
          isHovered ? "scale-110" : ""
        )}>
          <span className={cn(
            "inline-block font-medium text-xs px-2 py-1 rounded-full shadow-sm",
            isRtl ? "text-right" : "uppercase",
            badgeType === 'new' ? 'bg-green-100 text-green-800' : 
            badgeType === 'sale' ? 'bg-yellow-400 text-white' : 
            badgeType === 'best seller' ? 'bg-yellow-400 text-white' : 
            'bg-gray-100 text-gray-800'
          )}>
            {getBadgeText(badgeType)}
          </span>
        </div>
      )}
      
      {/* Quick Action Buttons */}
      <div className={cn(
        "absolute top-3 z-20 flex flex-col gap-2 transition-all duration-300",
        isRtl ? "left-3" : "right-3",
        isHovered ? "opacity-100 translate-x-0" : isRtl ? "opacity-0 translate-x-4" : "opacity-0 -translate-x-4"
      )}>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleViewProduct();
          }}
          className="bg-white text-green-700 hover:bg-green-700 hover:text-white rounded-full p-2 shadow-md transition-colors duration-200"
          aria-label="Quick view"
          title={t("quick_view")}
        >
          <Eye className="h-4 w-4" />
        </button>
        <button 
          className="bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-full p-2 shadow-md transition-colors duration-200"
          aria-label="Add to wishlist"
          title={t("add_to_wishlist")}
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>
      
      {/* Product Image */}
      <Link 
        href={`/products/${product.slug}`} 
        onClick={scrollToTop}
        className="block overflow-hidden"
      >
        <div className="relative overflow-hidden p-4 w-full flex items-center justify-center h-48 bg-gray-50/50">
          {/* Subtle spotlight effect on hover */}
          <div className={cn(
            "absolute inset-0 bg-radial-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          )}></div>
          
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <img 
            src={product.imageUrl}
            className={cn(
              "max-w-full max-h-full object-contain transition-all duration-500",
              isHovered ? "scale-110 rotate-1" : "scale-100"
            )}
            alt={productName}
          />
        </div>
      </Link>
      
      {/* Product Details */}
      <div className="p-4 border-t border-gray-100 flex flex-col flex-grow">
        <h3 className="font-medium text-sm sm:text-base mb-3 text-center h-11 flex items-center justify-center">
          <Link 
            href={`/products/${product.slug}`} 
            onClick={scrollToTop}
            className={cn(
              "hover:text-green-700 line-clamp-2 min-w-[150px] text-center px-2 transition-colors duration-300",
              isHovered ? "text-green-700" : "text-gray-800"
            )}
          >
            {productName}
          </Link>
        </h3>
        
        {/* Price */}
        <div className="mb-4 text-center h-8 flex items-center justify-center">
          {product.originalPrice && product.originalPrice !== product.price ? (
            <div className="flex flex-wrap items-center justify-center">
              <span className={cn(
                "text-gray-400 line-through text-xs sm:text-sm",
                isRtl ? "ml-1 sm:ml-2" : "mr-1 sm:mr-2"
              )}>
                {formatCurrency(product.originalPrice)}
              </span>
              <span className={cn(
                "text-green-700 font-bold text-sm sm:text-base",
                isHovered ? "animate-pulse" : ""
              )}>
                {formatCurrency(product.price)}
              </span>
            </div>
          ) : (
            <span className={cn(
              "text-green-700 font-bold text-sm sm:text-base transition-all duration-300",
              isHovered ? "scale-110" : ""
            )}>
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
        
        {/* Action Button */}
        <button 
          ref={buttonRef}
          onClick={handleAddToCart}
          className={cn(
            "inline-flex items-center justify-center w-full text-white py-2 sm:py-2.5 rounded-lg text-xs font-medium transition-all duration-300 mt-auto relative overflow-hidden",
            isRtl && "flex-row-reverse",
            isAnimatingButton 
              ? "bg-green-900" 
              : isHovered 
                ? "bg-gradient-to-r from-green-700 to-green-600 shadow-md transform scale-[1.02]" 
                : "bg-gradient-to-r from-green-700 to-green-600"
          )}
        >
          {/* Button shine effect on hover */}
          <span className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full",
            isHovered ? "animate-shine" : "hidden"
          )}></span>
          
          <ShoppingCart className={cn(
            "h-4 w-4 transition-transform duration-300",
            isHovered ? "animate-wiggle" : ""
          )} />
          <span className={cn(
            "transition-all duration-300 font-semibold",
            isRtl ? "mr-2" : "ml-2"
          )}>
            {t("add_to_cart")}
          </span>
        </button>
      </div>
      
      {/* In stock status overlay - only shown when out of stock */}
      {!product.inStock && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 px-4 py-2 rounded-md text-red-600 font-medium transform -rotate-3">
            {t("out_of_stock")}
          </div>
        </div>
      )}
    </div>
  );
}
