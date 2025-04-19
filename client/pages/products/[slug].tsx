import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/contexts/currency-context";
import { useCart } from "@/contexts/cart-context";
import { useCartAnimation } from "@/contexts/cart-animation-context";
import { useStockNotification } from "@/contexts/stock-notification-context";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import SocialShare from "@/components/social/social-share";
import ProductBadge from "@/components/ui/product-badge";
import RelatedProducts from "@/components/products/related-products";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  ShoppingCart, 
  Check, 
  Share2, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Plus, 
  Minus,
  ChevronRight,
  ChevronLeft,
  Zap,
  Heart,
  Info,
  ThumbsUp,
  Calendar,
  User,
  MessageSquare,
  Send,
  ChevronDown,
  Play,
  Video,
  X,
  Maximize2,
  ZoomIn,
  Bell
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Product, Category } from "@shared/schema";
import { Helmet } from "react-helmet";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductImage {
  id: number;
  url: string;
}

export default function ProductDetailPage() {
  const { t, language, isRtl } = useLanguage();
  const { formatCurrency } = useCurrency();
  const { addToCart } = useCart();
  const { triggerAddToCartAnimation } = useCartAnimation();
  const { openModal } = useStockNotification();
  const [match, params] = useRoute("/products/:slug");
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);
  const [, navigate] = useLocation();
  const slug = params?.slug || "";
  
  // Use our scroll to top hook - this will automatically scroll to top when the product changes
  useScrollToTop();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlistAdded, setIsWishlistAdded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [descriptionImages, setDescriptionImages] = useState<string[]>([]);
  const [specificationImages, setSpecificationImages] = useState<string[]>([]);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Product images array
  const [productImages, setProductImages] = useState<ProductImage[]>([
    { id: 1, url: '' }, // Main image (will be replaced with product.imageUrl)
  ]);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${slug}`],
  });
  
  const { data: category } = useQuery<Category>({
    queryKey: [`/api/categories/${product?.categoryId}`],
    enabled: !!product?.categoryId,
  });

  // Calculate discount percentage if product has originalPrice
  const discountPercentage = product?.originalPrice 
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100) 
    : 0;

  // Handle image zooming
  const handleImageZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageContainerRef.current) return;
    
    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate mouse position relative to the container (0 to 1)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Move the background image based on mouse position
    container.style.transformOrigin = `${x * 100}% ${y * 100}%`;
  };

  // Handle adding the product to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    
    // Pass the full product object and quantity
    addToCart(product, quantity);
    
    // Get the add to cart button position for animation using our ref
    if (addToCartButtonRef.current) {
      const buttonRect = addToCartButtonRef.current.getBoundingClientRect();
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
    
    // Show "Added!" feedback temporarily, then redirect to cart
    setTimeout(() => {
      setIsAddingToCart(false);
      // Navigate to cart page
      navigate('/cart');
      // Scroll to top of page after redirect
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  // Update product images and media once product is loaded
  useEffect(() => {
    if (product) {
      // Check if this is the Automatic Coop Door product
      const isAutomaticCoopDoor = product.slug === "automatic-coop-door";
      
      // Set main and additional images
      const images = [{ id: 1, url: product.imageUrl }];
      
      // Add any additional images if they exist
      if (product.additionalImages && product.additionalImages.length > 0) {
        product.additionalImages.forEach((url, index) => {
          images.push({ id: index + 2, url });
        });
      }
      // No placeholder images - only show real images
      
      setProductImages(images);
      
      // Set video URL if available and it's not the Automatic Coop Door product
      if (product.videoUrl && !isAutomaticCoopDoor) {
        setVideoUrl(product.videoUrl);
      } else {
        setVideoUrl("");
      }
      
      // Always ensure showVideo is false for Automatic Coop Door product
      if (isAutomaticCoopDoor) {
        setShowVideo(false);
      }
      
      // Set description and specification images if available
      if (product.descriptionImages && product.descriptionImages.length > 0) {
        setDescriptionImages(product.descriptionImages);
      }
      
      if (product.specificationImages && product.specificationImages.length > 0) {
        setSpecificationImages(product.specificationImages);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="py-8 bg-white">
        <div className="container mx-auto px-4">
          {/* Breadcrumb skeleton */}
          <div className="mb-8 flex items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4 mx-2 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 mx-2 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-8">
              <div>
                <Skeleton className="w-full aspect-square rounded-xl" />
                <div className="flex mt-4 space-x-2">
                  <Skeleton className="w-20 h-20 rounded-md" />
                  <Skeleton className="w-20 h-20 rounded-md" />
                  <Skeleton className="w-20 h-20 rounded-md" />
                </div>
              </div>
              <div>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-5 w-1/4 mb-6" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <div className="flex space-x-4 mb-6">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-10 w-full mb-6" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Product Not Found</h1>
          <p className="mb-6 text-gray-600">The product you are looking for does not exist or has been removed.</p>
          <Button asChild variant="default" className="bg-primary-600 hover:bg-primary-700">
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const productName = language === "ar" && product.nameAr ? product.nameAr : product.name;
  const productDescription = language === "ar" && product.descriptionAr ? product.descriptionAr : product.description;
  const badgeType = language === "ar" && product.badgeAr ? product.badgeAr : product.badge;
  const categoryName = language === "ar" && category?.nameAr ? category.nameAr : category?.name;

  // Special handling for Automatic Coop Door product
  const isAutomaticCoopDoor = slug === "automatic-coop-door";
  
  // Simple function to open fullscreen
  const openFullscreen = () => {
    setIsZoomed(false); // Reset zoom first
    setIsFullscreen(true);
  };

  return (
    <>
      <Helmet>
        <title>{productName} - Poultry Gear</title>
        <meta name="description" content={productDescription} />
        <meta property="og:title" content={`${productName} - Poultry Gear`} />
        <meta property="og:description" content={productDescription} />
        <meta property="og:image" content={product.imageUrl} />
        <link rel="canonical" href={`https://poultrygear.com/products/${slug}`} />
      </Helmet>
      
      {/* Breadcrumb navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className={cn(
            "flex items-center text-sm text-gray-600",
            isRtl && "flex-row-reverse"
          )}>
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight className={cn("h-4 w-4 mx-2", isRtl && "rotate-180")} />
            <Link href="/products" className="hover:text-primary-600 transition-colors">
              Products
            </Link>
            {category && (
              <>
                <ChevronRight className={cn("h-4 w-4 mx-2", isRtl && "rotate-180")} />
                <Link href={`/categories/${category.slug}`} className="hover:text-primary-600 transition-colors">
                  {categoryName}
                </Link>
              </>
            )}
            <ChevronRight className={cn("h-4 w-4 mx-2", isRtl && "rotate-180")} />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{productName}</span>
          </div>
        </div>
      </div>
      
      <div className="py-4 sm:py-8 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8 sm:mb-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 p-4 sm:p-6 lg:p-8">
              {/* Product Images */}
              <div className="product-images">
                {/* Main product image or video */}
                {showVideo && videoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 mb-4">
                    <div className="w-full aspect-square">
                      <video 
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        className="w-full h-full object-contain p-4"
                        poster={product.imageUrl}
                      />
                    </div>
                    <button 
                      onClick={() => setShowVideo(false)}
                      className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full"
                      aria-label="Close video"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    ref={imageContainerRef}
                    className={cn(
                      "relative rounded-xl overflow-hidden border border-gray-200 mb-4",
                      isAutomaticCoopDoor 
                        ? "cursor-default" 
                        : (isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"),
                      isZoomed && "overflow-hidden"
                    )}
                    onClick={(e) => {                      
                      // Only zoom if it's a direct click on the container, not any child elements
                      // except img elements which should also trigger zoom
                      const target = e.target as HTMLElement;
                      const isImage = target instanceof HTMLImageElement;
                      const isDirectContainer = target === e.currentTarget;
                      
                      if (isDirectContainer || isImage) {
                        setIsZoomed(!isZoomed);
                      }
                    }}
                    onMouseMove={handleImageZoom}
                    onMouseLeave={() => isZoomed && setIsZoomed(false)}
                  >
                    <div className={cn(
                      "w-full aspect-square transition-transform duration-200 relative",
                      isZoomed && "scale-150"
                    )}>
                      <img 
                        src={productImages[activeImage]?.url || product.imageUrl} 
                        alt={productName}
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                    
                    {/* Controls and badges */}
                    <div className="absolute top-3 left-3 z-10 flex space-x-2">
                      {badgeType && <ProductBadge type={badgeType} />}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsWishlistAdded(!isWishlistAdded);
                              }} 
                              className={cn(
                                "p-2 bg-white rounded-full shadow-md transition-all hover:shadow-lg",
                                isWishlistAdded ? "text-red-500" : "text-gray-400"
                              )}
                              aria-label="Add to wishlist"
                            >
                              <Heart className="h-5 w-5" fill={isWishlistAdded ? "currentColor" : "none"} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add to wishlist</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {/* Fullscreen button */}
                    <div className="absolute top-3 right-3 z-20 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default action
                          e.stopPropagation(); // Stop the container's click event
                          openFullscreen(); // Use our safe function that works consistently
                        }}
                        className="p-2 bg-white/80 rounded-full shadow-md transition-all hover:shadow-lg text-gray-700 hover:bg-white"
                        aria-label="View fullscreen"
                      >
                        <Maximize2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* Zoom hint */}
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md flex items-center">
                      <div className="mr-1">
                        {isZoomed ? <ChevronLeft className="h-3 w-3" /> : <ZoomIn className="h-3 w-3" />}
                      </div>
                      {isZoomed ? "Click to reset" : "Click to zoom"}
                    </div>
                    
                    {/* Discount badge */}
                    {discountPercentage > 0 && (
                      <div className="absolute bottom-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                        {discountPercentage}% OFF
                      </div>
                    )}
                  </div>
                )}
                
                {/* Image thumbnails and video button */}
                <div className="relative">
                  <div className="overflow-x-auto pb-2 hide-scrollbar">
                    <div className="flex gap-2 justify-center">
                      {productImages.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => {
                            setActiveImage(idx);
                            setShowVideo(false);
                          }}
                          className={cn(
                            "border-2 rounded-md overflow-hidden w-16 h-16 flex-shrink-0 transition-all",
                            activeImage === idx && !showVideo ? "border-green-600" : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <img 
                            src={img.url || product.imageUrl} 
                            alt={`Product view ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                      
                      {/* Video thumbnail button - hide for Automatic Coop Door */}
                      {videoUrl && !isAutomaticCoopDoor && (
                        <button
                          onClick={() => setShowVideo(true)}
                          className={cn(
                            "border-2 rounded-md overflow-hidden w-16 h-16 flex-shrink-0 transition-all relative",
                            showVideo ? "border-green-600" : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <img 
                            src={product.imageUrl} 
                            alt="Product video"
                            className="w-full h-full object-cover opacity-70"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-8 w-8 text-white" fill="white" />
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Thumbnail navigation arrows */}
                  {productImages.length > 4 && (
                    <>
                      <button 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-gray-200 text-gray-600 hover:text-primary-600"
                        onClick={() => {
                          // Would implement scroll logic here in a real app
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button 
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-gray-200 text-gray-600 hover:text-primary-600"
                        onClick={() => {
                          // Would implement scroll logic here in a real app
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Product Details */}
              <div className={cn(
                "product-details flex flex-col",
                isRtl && "text-right"
              )}>
                {/* Header with name and ratings */}
                <div>
                  <div className="flex items-center text-xs text-primary-600 font-medium mb-2">
                    <span>{categoryName}</span>
                    <span className="mx-2">•</span>
                    {product.inStock ? (
                      <span className="text-green-600 flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        In Stock
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        Out of Stock
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {productName}
                  </h1>
                  
                  {/* Reviews and ratings section removed */}
                </div>
                
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-primary-600 mr-2">
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {discountPercentage > 0 && (
                    <p className="text-red-600 text-sm font-medium mt-1">
                      You save: {formatCurrency((parseFloat(product.originalPrice) - parseFloat(product.price)).toString())} ({discountPercentage}%)
                    </p>
                  )}
                </div>
                
                {/* Short description */}
                <div className="mb-6" dir={isRtl ? "rtl" : "ltr"}>
                  <div className="text-gray-700 leading-relaxed product-summary">
                    {/* Extract plain text for the summary by removing HTML tags */}
                    {productDescription.replace(/<[^>]*>/g, '').split('.')[0] + '.'}
                  </div>
                </div>
                
                {/* Quantity selector and buttons */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center mb-6">
                    <div className={cn(
                      "flex items-center border border-gray-300 rounded-md",
                      !product.inStock && "opacity-50"
                    )}>
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 focus:outline-none"
                        aria-label="Decrease quantity"
                        disabled={!product.inStock}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 py-2 text-gray-900 border-x border-gray-300 min-w-[40px] text-center">
                        {quantity}
                      </span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 focus:outline-none"
                        aria-label="Increase quantity"
                        disabled={!product.inStock}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full">
                    {product.inStock ? (
                      <Button 
                        ref={addToCartButtonRef}
                        className="bg-green-700 hover:bg-green-800 text-white add-to-cart-button w-full"
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                      >
                        {isAddingToCart ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Added!
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                        onClick={() => openModal(product.id, productName)}
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Notify Me When Available
                      </Button>
                    )}
                  </div>
                  
                  {/* Social Share Component */}
                  <div className="mt-4 flex justify-center">
                    <SocialShare 
                      url={window.location.href}
                      title={productName}
                      description={productDescription.replace(/<[^>]*>/g, '')}
                      imageUrl={product.imageUrl}
                      showLabel={true}
                      variant="outline"
                      className="w-full"
                    />
                  </div>
                </div>
                

              </div>
            </div>
            
            {/* Product Information Section */}
            <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 border-t border-gray-200 pt-4 sm:pt-6">
              {/* Tabs Navigation */}
              <div className="sticky top-0 bg-white z-10 pb-2">
                <div className="w-full mb-2 sm:mb-0">
                  <h2 className="text-lg font-semibold">Description</h2>
                </div>
              </div>
              
              {/* Combined Content */}
              <div id="product-content" className="pt-6 pb-2" dir={isRtl ? "rtl" : "ltr"}>
                <div className="prose max-w-none text-gray-700">
                  <div 
                    className="mb-4 leading-relaxed product-description" 
                    dangerouslySetInnerHTML={{ __html: productDescription }}
                  />
                  
                  {/* Description Images */}
                  {descriptionImages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-4 sm:my-6 mx-auto text-center">
                      {descriptionImages.map((img, index) => (
                        <div 
                          key={index} 
                          className="rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer mx-auto w-full flex justify-center"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Find the index of this image in productImages or use first image
                            setActiveImage(0);
                            openFullscreen();
                          }}
                        >
                          <img 
                            src={img} 
                            alt={`${productName} - Image ${index + 1}`}
                            className="w-auto h-auto max-w-full object-contain"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="h-8 w-8 text-white drop-shadow-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Only show description */}
                  {/* All additional content has been removed, keeping only the main description */}
                </div>
              </div>
            </div>
          </div>
          
          {/* Related/Featured Products */}
          <div className="mb-12">
            <RelatedProducts 
              currentProductId={product.id}
              currentProductCategoryId={product.categoryId}
              limit={4}
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Image Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
        >
          <DialogTitle className="sr-only">
            Fullscreen Image of {productName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            View full-size image of {productName}. Click outside or press ESC to close.
          </DialogDescription>
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={productImages[activeImage]?.url || product.imageUrl} 
              alt={productName}
              className="max-w-full max-h-[85vh] object-contain"
            />
            
            <DialogClose className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
              <X className="h-6 w-6" />
            </DialogClose>

            <div className="absolute bottom-4 left-0 right-0">
              <div className="flex gap-2 justify-center px-4 overflow-x-auto pb-2 hide-scrollbar">
                {productImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      setActiveImage(idx);
                    }}
                    className={cn(
                      "border-2 rounded-md overflow-hidden w-16 h-16 flex-shrink-0 transition-all",
                      activeImage === idx ? "border-green-600" : "border-gray-700 hover:border-gray-500"
                    )}
                  >
                    <img 
                      src={img.url || product.imageUrl} 
                      alt={`Product view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}