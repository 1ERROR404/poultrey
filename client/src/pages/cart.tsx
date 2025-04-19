import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/contexts/cart-context';
import { useLanguage } from '@/hooks/use-language';
import { useCurrency } from '@/contexts/currency-context';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { AnimatedPrice } from '@/components/cart/animated-price';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const { t, language, isRtl } = useLanguage();
  const { formatCurrency, currency } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);

  const [_, navigate] = useLocation();
  
  const handleCheckout = () => {
    // Redirect to the checkout page
    setIsLoading(true);
    // Small delay to show loading state
    setTimeout(() => {
      // Use wouter's navigate which preserves language context
      navigate('/checkout');
    }, 500);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
          {t('cart')}
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 text-center">
          <div className="flex flex-col items-center justify-center py-6 sm:py-10">
            <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {t('cart_empty')}
            </h2>
            <p className="text-gray-600 mb-5 sm:mb-6 max-w-md text-sm sm:text-base">
              {t('cart_empty_message')}
            </p>
            <Link href="/products">
              <Button className="bg-green-700 hover:bg-green-800 text-sm sm:text-base py-2 sm:py-2.5">
                {t('continue_shopping')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          {t('cart')}
        </h1>
        <button
          onClick={clearCart}
          className={`text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium flex items-center ${isRtl ? 'flex-row-reverse' : ''}`}
        >
          <Trash2 className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRtl ? 'mr-0 ml-1' : 'mr-1'}`} />
          {t('clear_cart')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            {/* Cart Header (only show on desktop) */}
            <div className={`hidden md:flex justify-between px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={`flex ${isRtl ? 'justify-end' : ''} ${isRtl ? 'w-1/3' : 'w-2/3'}`}>
                <span>{t('product')}</span>
              </div>
              <div className={`flex ${isRtl ? 'flex-row-reverse justify-between w-2/3 pl-24' : 'justify-around w-1/3'}`}>
                <span>{t('price')}</span>
                <span>{t('quantity')}</span>
                <span>{t('total')}</span>
              </div>
            </div>
            
            {items.map((item) => (
              <div 
                key={item.product.id} 
                className="p-4 sm:p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <div className={cn(
                  "flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center",
                  isRtl && "sm:flex-row-reverse"
                )}>
                  <div className={`flex items-center ${isRtl ? 'justify-end sm:w-1/3' : 'sm:w-2/3'}`}>
                    {/* Product Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center bg-white rounded border border-gray-100">
                      <img
                        src={item.product.imageUrl}
                        alt={language === 'ar' && item.product.nameAr ? item.product.nameAr : item.product.name}
                        className="w-full h-full object-contain rounded p-1"
                        style={{ aspectRatio: '1/1', objectFit: 'contain' }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className={cn(
                      "flex-1 min-w-0", 
                      isRtl ? "mr-4 text-right" : "ml-4"
                    )}>
                      <Link href={`/products/${item.product.slug}`}>
                        <h3 className="font-medium text-gray-900 hover:text-green-700 text-sm sm:text-base">
                          {language === 'ar' && item.product.nameAr 
                            ? item.product.nameAr 
                            : item.product.name}
                        </h3>
                      </Link>
                      
                      {/* Mobile Price (visible only on mobile) */}
                      <div className="flex flex-col sm:hidden mt-1">
                        <div className="text-primary-600 font-medium text-sm">
                          <AnimatedPrice value={item.product.price} fontSize="small" />
                        </div>
                        {item.quantity > 1 && (
                          <div className={`text-gray-500 text-xs ${isRtl ? 'text-right' : ''}`}>
                            {isRtl ? (
                              <>
                                <AnimatedPrice value={(parseFloat(item.product.price) * item.quantity).toString()} fontSize="small" /> = {parseFloat(item.product.price).toFixed(2)} {currency.code} × {item.quantity}
                              </>
                            ) : (
                              <>
                                {item.quantity} × {parseFloat(item.product.price).toFixed(2)} {currency.code} = <AnimatedPrice value={(parseFloat(item.product.price) * item.quantity).toString()} fontSize="small" />
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Price, Quantity & Total (visible only on desktop) */}
                  <div className={`hidden sm:flex items-center ${isRtl ? 'flex-row-reverse justify-between w-2/3' : 'justify-between sm:w-1/3'}`}>
                    {/* Unit Price */}
                    <div className="text-gray-700 text-sm font-medium">
                      <AnimatedPrice value={item.product.price} fontSize="small" />
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 focus:outline-none text-gray-600 hover:text-gray-800"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-2 py-1 min-w-[2rem] text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 focus:outline-none text-gray-600 hover:text-gray-800"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Total Price */}
                    <div className="text-gray-900 font-semibold text-sm">
                      <AnimatedPrice value={(parseFloat(item.product.price) * item.quantity).toString()} fontSize="small" />
                    </div>
                  </div>
                  
                  {/* Mobile Quantity Controls (visible only on mobile) */}
                  <div className={cn(
                    "flex sm:hidden items-center justify-between",
                    isRtl ? "flex-row-reverse" : ""
                  )}>
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1.5 focus:outline-none text-gray-600 hover:text-gray-800"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-2 py-1 min-w-[2rem] text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1.5 focus:outline-none text-gray-600 hover:text-gray-800"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Desktop Remove Button (positioned absolutely in the corner for cleaner layout) */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className={cn(
                      "hidden sm:block absolute p-2 text-gray-400 hover:text-red-600 transition-colors",
                      isRtl ? "left-2 top-2" : "right-2 top-2"
                    )}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link href="/products" className={cn(
            "flex items-center text-green-700 hover:text-green-800 font-medium",
            isRtl && "flex-row-reverse"
          )}>
            <ArrowLeft className={cn("h-4 w-4", isRtl ? "ml-1 rotate-180" : "mr-1")} />
            {t('continue_shopping')}
          </Link>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
            {/* Order Summary Header */}
            <div className={`bg-gray-50 px-4 py-3 border-b border-gray-200 ${isRtl ? 'text-right' : ''}`}>
              <h2 className="text-lg font-bold text-gray-900">{t('order_summary')}</h2>
            </div>
            
            <div className="p-4 md:p-6">
              {/* Items Count */}
              <div className={`text-sm text-gray-600 mb-4 ${isRtl ? 'text-right' : ''}`}>
                {items.length} {items.length === 1 ? t('item_singular') : t('items_plural')}
              </div>
              
              <div className="space-y-3 mb-6">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">{t('subtotal')}</span>
                  <AnimatedPrice value={subtotal} fontSize="small" />
                </div>
                
                {/* Shipping */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">{t('shipping')}</span>
                  <span className="font-medium text-sm sm:text-base">{t('calculated_at_checkout')}</span>
                </div>
                
                {/* Divider */}
                <Separator className="my-3" />
                
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base sm:text-lg">{t('total')}</span>
                  <AnimatedPrice value={subtotal} fontSize="large" highlight={true} />
                </div>
              </div>
              
              {/* Checkout Button */}
              <Button 
                className="w-full bg-green-700 hover:bg-green-800 py-5 text-sm sm:text-base"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className={`${isRtl ? 'ml-2' : 'mr-2'} h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin`}></span>
                    {t('processing')}
                  </span>
                ) : (
                  t('proceed_to_checkout')
                )}
              </Button>
              
              {/* Security Message */}
              <div className="mt-4 text-xs text-gray-500 text-center">
                <div className={`flex items-center justify-center mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <ShieldCheck className={`h-3.5 w-3.5 text-green-700 ${isRtl ? 'ml-1' : 'mr-1'}`} />
                  {t('secure_checkout_message')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}