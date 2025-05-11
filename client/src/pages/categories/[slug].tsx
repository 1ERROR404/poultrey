import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import ProductCard from "@/components/products/product-card";
import { Category, Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FilterX, SlidersHorizontal, LayoutGrid, List, ChevronRight, Check, ArrowUpDown, ArrowDownUp } from "lucide-react";
import { Helmet } from "react-helmet";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CategoryPage() {
  const { language, isRtl, t } = useLanguage();
  const [match, params] = useRoute("/categories/:slug");
  const slug = params?.slug || "";
  
  // Sort and filter states
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [priceRange, setPriceRange] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  // Filter open states
  const [sortOpen, setSortOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const { data: category, isLoading: isCategoryLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${slug}`],
  });

  const { data: rawProducts, isLoading: isProductsLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products', category?.id ? `categoryId=${category.id}` : ''],
    queryFn: async ({ queryKey }) => {
      const categoryParam = category?.id ? `?categoryId=${category.id}` : '';
      const response = await fetch(`/api/products${categoryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
    enabled: !!category?.id,
  });

  const { data: allCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Sort and filter products
  const products = rawProducts ? [...rawProducts].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = language === "ar" && a.nameAr ? a.nameAr : a.name;
      const nameB = language === "ar" && b.nameAr ? b.nameAr : b.name;
      return sortOrder === 'asc' 
        ? nameA.localeCompare(nameB) 
        : nameB.localeCompare(nameA);
    } else if (sortBy === 'price') {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    } else if (sortBy === 'featured') {
      return sortOrder === 'asc' 
        ? (a.featured === b.featured ? 0 : a.featured ? -1 : 1)
        : (a.featured === b.featured ? 0 : a.featured ? 1 : -1);
    }
    return 0;
  }).filter(product => {
    // Apply price filter if set
    if (priceRange) {
      const price = parseFloat(product.price);
      return price >= priceRange[0] && price <= priceRange[1];
    }
    return true;
  }) : null;

  const isLoading = isCategoryLoading || isProductsLoading;

  if (error || (!isLoading && !category)) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Category Not Found</h1>
          <p className="mb-6 text-gray-600">The category you are looking for does not exist or has been removed.</p>
          <Button asChild variant="default" className="bg-primary-600 hover:bg-primary-700">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const categoryName = language === "ar" && category?.nameAr ? category.nameAr : category?.name;
  const categoryDescription = language === "ar" && category?.descriptionAr ? category.descriptionAr : category?.description;

  return (
    <>
      {category && (
        <Helmet>
          <title>{categoryName} - Poultry Gear</title>
          <meta name="description" content={categoryDescription || `Shop our range of ${categoryName} products. High-quality poultry farming equipment with free shipping on orders over $100.`} />
          <meta property="og:title" content={`${categoryName} - Poultry Gear`} />
          <meta property="og:description" content={categoryDescription || `Shop our range of ${categoryName} products.`} />
          <link rel="canonical" href={`https://poultrygear.com/categories/${slug}`} />
        </Helmet>
      )}
      
      {/* Breadcrumb navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className={cn(
            "flex items-center text-sm text-gray-600",
            isRtl && "flex-row-reverse"
          )}>
            <Link href="/" className="hover:text-primary-600 transition-colors">
              {language === "ar" ? "الرئيسية" : "Home"}
            </Link>
            <ChevronRight className={cn("h-4 w-4 mx-2", isRtl && "rotate-180")} />
            <Link href="/categories" className="hover:text-primary-600 transition-colors">
              {language === "ar" ? "الفئات" : "Categories"}
            </Link>
            {category && (
              <>
                <ChevronRight className={cn("h-4 w-4 mx-2", isRtl && "rotate-180")} />
                <span className="text-gray-900 font-medium">{categoryName}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <>
              <div className="mb-12">
                <Skeleton className="h-12 w-2/3 md:w-1/3 mb-4" />
                <Skeleton className="h-6 w-full md:w-2/3 mb-8" />
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <Skeleton className="w-full h-64" />
                    <div className="p-4">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-10 w-10 rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-32">
                    <div className="p-4 bg-primary-50 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900">{language === "ar" ? "الفئات" : "Categories"}</h3>
                    </div>
                    
                    <div className="p-4">
                      <ul className="space-y-2">
                        {allCategories?.map((cat) => (
                          <li key={cat.id}>
                            <Link 
                              href={`/categories/${cat.slug}`} 
                              className={cn(
                                "flex items-center py-2 px-2 rounded-md transition-colors",
                                cat.slug === slug 
                                  ? "bg-primary-50 text-primary-600 font-medium" 
                                  : "text-gray-700 hover:bg-gray-50"
                              )}
                            >
                              <span className={cn(
                                "w-2 h-2 rounded-full",
                                isRtl ? "ml-2" : "mr-2",
                                cat.slug === slug ? "bg-primary-500" : "bg-gray-300"
                              )}></span>
                              {language === "ar" && cat.nameAr ? cat.nameAr : cat.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Main content */}
                <div className="lg:col-span-3 order-1 lg:order-2">
                  {/* Category header with image */}
                  <div className="relative rounded-xl overflow-hidden shadow-md mb-8">
                    <img 
                      src={category.imageUrl} 
                      alt={categoryName} 
                      className="w-full h-56 md:h-72 object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h1 className="text-3xl md:text-4xl font-bold mb-2">{categoryName}</h1>
                      <p className="text-white/80 max-w-2xl" dir={isRtl ? "rtl" : "ltr"}>
                        {categoryDescription}
                      </p>
                    </div>
                  </div>
                  
                  {/* Filters bar */}
                  <div className="flex flex-wrap items-center justify-between bg-gray-50 rounded-lg p-3 mb-6">
                    <div className={cn(
                      "flex items-center mb-2 sm:mb-0",
                      isRtl ? "space-x-reverse space-x-2" : "space-x-2"
                    )}>
                      <SlidersHorizontal className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700 font-medium">
                        {language === "ar" ? "تصفية:" : "Filter:"}
                      </span>
                      <Popover open={sortOpen} onOpenChange={setSortOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="text-sm">
                            {language === "ar" ? "ترتيب حسب" : "Sort By"} 
                            <ChevronRight className={cn("h-4 w-4", isRtl ? "mr-1 rotate-180" : "ml-1")} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-0" align="start">
                          <div className="p-2 border-b border-gray-100">
                            <h4 className="font-medium text-sm text-gray-700">
                              {language === "ar" ? "ترتيب حسب" : "Sort By"}
                            </h4>
                          </div>
                          <div className="p-2">
                            <button
                              onClick={() => {
                                setSortBy('name');
                                setSortOpen(false);
                              }}
                              className={cn(
                                "flex items-center w-full px-2 py-1.5 text-sm rounded-md",
                                sortBy === 'name' ? "bg-primary-50 text-primary-600" : "hover:bg-gray-50"
                              )}
                            >
                              {sortBy === 'name' && <Check className="h-4 w-4 mr-2" />}
                              <span className={sortBy === 'name' ? "" : "ml-6"}>
                                {language === "ar" ? "الاسم" : "Name"}
                              </span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setSortBy('price');
                                setSortOpen(false);
                              }}
                              className={cn(
                                "flex items-center w-full px-2 py-1.5 text-sm rounded-md",
                                sortBy === 'price' ? "bg-primary-50 text-primary-600" : "hover:bg-gray-50"
                              )}
                            >
                              {sortBy === 'price' && <Check className="h-4 w-4 mr-2" />}
                              <span className={sortBy === 'price' ? "" : "ml-6"}>
                                {language === "ar" ? "السعر" : "Price"}
                              </span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setSortBy('featured');
                                setSortOpen(false);
                              }}
                              className={cn(
                                "flex items-center w-full px-2 py-1.5 text-sm rounded-md",
                                sortBy === 'featured' ? "bg-primary-50 text-primary-600" : "hover:bg-gray-50"
                              )}
                            >
                              {sortBy === 'featured' && <Check className="h-4 w-4 mr-2" />}
                              <span className={sortBy === 'featured' ? "" : "ml-6"}>
                                {language === "ar" ? "المميز" : "Featured"}
                              </span>
                            </button>
                          </div>
                          
                          <div className="border-t border-gray-100 p-2">
                            <div className="flex items-center justify-between px-2 py-1.5">
                              <span className="text-sm text-gray-700">
                                {language === "ar" ? "الترتيب" : "Order"}:
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                              >
                                {sortOrder === 'asc' ? (
                                  <ArrowUpDown className="h-4 w-4" />
                                ) : (
                                  <ArrowDownUp className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      <Popover open={priceOpen} onOpenChange={setPriceOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="text-sm">
                            {language === "ar" ? "السعر" : "Price"} 
                            <ChevronRight className={cn("h-4 w-4", isRtl ? "mr-1 rotate-180" : "ml-1")} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-0" align="start">
                          <div className="p-2 border-b border-gray-100">
                            <h4 className="font-medium text-sm text-gray-700">
                              {language === "ar" ? "تصفية حسب السعر" : "Filter by Price"}
                            </h4>
                          </div>
                          <div className="p-3">
                            <div className="space-y-3">
                              <button
                                onClick={() => {
                                  setPriceRange(null);
                                  setPriceOpen(false);
                                }}
                                className={cn(
                                  "flex items-center w-full px-2 py-1.5 text-sm rounded-md",
                                  priceRange === null ? "bg-primary-50 text-primary-600" : "hover:bg-gray-50"
                                )}
                              >
                                {priceRange === null && <Check className="h-4 w-4 mr-2" />}
                                <span className={priceRange === null ? "" : "ml-6"}>
                                  {language === "ar" ? "الكل" : "All"}
                                </span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  setPriceRange([0, 50]);
                                  setPriceOpen(false);
                                }}
                                className={cn(
                                  "flex items-center w-full px-2 py-1.5 text-sm rounded-md",
                                  priceRange && priceRange[0] === 0 && priceRange[1] === 50 ? "bg-primary-50 text-primary-600" : "hover:bg-gray-50"
                                )}
                              >
                                {priceRange && priceRange[0] === 0 && priceRange[1] === 50 && <Check className="h-4 w-4 mr-2" />}
                                <span className={priceRange && priceRange[0] === 0 && priceRange[1] === 50 ? "" : "ml-6"}>
                                  {language === "ar" ? "أقل من $50" : "Under $50"}
                                </span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  setPriceRange([50, 100]);
                                  setPriceOpen(false);
                                }}
                                className={cn(
                                  "flex items-center w-full px-2 py-1.5 text-sm rounded-md",
                                  priceRange && priceRange[0] === 50 && priceRange[1] === 100 ? "bg-primary-50 text-primary-600" : "hover:bg-gray-50"
                                )}
                              >
                                {priceRange && priceRange[0] === 50 && priceRange[1] === 100 && <Check className="h-4 w-4 mr-2" />}
                                <span className={priceRange && priceRange[0] === 50 && priceRange[1] === 100 ? "" : "ml-6"}>
                                  $50 - $100
                                </span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  setPriceRange([100, 500]);
                                  setPriceOpen(false);
                                }}
                                className={cn(
                                  "flex items-center w-full px-2 py-1.5 text-sm rounded-md",
                                  priceRange && priceRange[0] === 100 && priceRange[1] === 500 ? "bg-primary-50 text-primary-600" : "hover:bg-gray-50"
                                )}
                              >
                                {priceRange && priceRange[0] === 100 && priceRange[1] === 500 && <Check className="h-4 w-4 mr-2" />}
                                <span className={priceRange && priceRange[0] === 100 && priceRange[1] === 500 ? "" : "ml-6"}>
                                  {language === "ar" ? "أكثر من $100" : "Over $100"}
                                </span>
                              </button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className={cn(
                      "flex items-center", 
                      isRtl ? "flex-row-reverse" : ""
                    )}>
                      <span className={cn("text-gray-500 text-sm", isRtl ? "ml-3" : "mr-3")}>
                        {language === "ar" ? "عرض:" : "View:"}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(viewMode === 'grid' ? "bg-white text-primary-600" : "text-gray-500")}
                        onClick={() => setViewMode('grid')}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={cn(viewMode === 'list' ? "bg-white text-primary-600" : "text-gray-500")}
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Products display (grid or list) */}
                  {products && products.length > 0 ? (
                    <>
                      <div className="mb-5">
                        <h2 className={cn(
                          "text-2xl font-bold text-gray-900",
                          isRtl && "flex flex-row-reverse items-center"
                        )}>
                          {language === "ar" 
                            ? `منتجات ${categoryName}`
                            : `${categoryName} Products`
                          }
                          <span className={cn(
                            "text-lg font-normal text-gray-500",
                            isRtl ? "ml-0 mr-2" : "ml-2"
                          )}>
                            ({products.length})
                          </span>
                        </h2>
                      </div>
                      
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                          {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {products.map((product) => (
                            <div 
                              key={product.id} 
                              className="flex flex-col md:flex-row border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="w-full md:w-1/3 h-60 overflow-hidden">
                                <img 
                                  src={product.imageUrl} 
                                  alt={language === "ar" && product.nameAr ? product.nameAr : product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-5 flex flex-col justify-between w-full md:w-2/3">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {language === "ar" && product.nameAr ? product.nameAr : product.name}
                                  </h3>
                                  <p className="text-gray-600 mb-4 line-clamp-2" dir={isRtl ? "rtl" : "ltr"}>
                                    {language === "ar" && product.descriptionAr ? product.descriptionAr : product.description}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                  <div className="flex items-center">
                                    <span className="text-lg font-bold text-primary-600">
                                      {product.price}
                                    </span>
                                    {product.originalPrice && (
                                      <span className="text-sm text-gray-500 line-through ml-2">
                                        {product.originalPrice}
                                      </span>
                                    )}
                                  </div>
                                  <Button asChild variant="default" size="sm" className="bg-primary-600 hover:bg-primary-700">
                                    <Link href={`/products/${product.slug}`}>
                                      {language === "ar" ? "عرض المنتج" : "View Product"}
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Result count */}
                      <div className="mt-8 text-center text-gray-500">
                        {language === "ar" 
                          ? `عرض ${products.length} ${products.length === 1 ? 'منتج' : 'منتجات'}`
                          : `Showing ${products.length} ${products.length === 1 ? 'product' : 'products'}`
                        }
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                      <FilterX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {language === "ar" ? "لم يتم العثور على منتجات" : "No Products Found"}
                      </h3>
                      <p className="text-gray-600 mb-6" dir={isRtl ? "rtl" : "ltr"}>
                        {language === "ar" 
                          ? `لا توجد منتجات متاحة في فئة "${categoryName}" في الوقت الحالي.`
                          : `There are no products available in the "${categoryName}" category at the moment.`
                        }
                      </p>
                      <Button asChild variant="default" className="bg-primary-600 hover:bg-primary-700">
                        <Link href="/products">
                          {language === "ar" ? "تصفح جميع المنتجات" : "Browse All Products"}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
