import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import ProductCard from "@/components/products/product-card";
import { Product, Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronRight, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  Filter, 
  RefreshCw,
  ShoppingCart,
  Star
} from "lucide-react";
import ProductBadge from "@/components/ui/product-badge";
import { Helmet } from "react-helmet";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProductsPage() {
  const { t, language, isRtl } = useLanguage();
  const [searchParams] = useLocation();
  const params = new URLSearchParams(searchParams);
  const searchQuery = params.get("search");
  const categoryId = params.get("category");

  const [sortBy, setSortBy] = useState("default");
  const [view, setView] = useState("grid");
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: [
      '/api/products', 
      searchQuery ? `search=${searchQuery}` : '', 
      categoryId ? `categoryId=${categoryId}` : ''
    ],
  });
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Price range options
  const priceRanges = [
    { id: 'under-50', label: 'Under $50' },
    { id: '50-100', label: '$50 - $100' },
    { id: '100-150', label: '$100 - $150' },
    { id: 'over-150', label: 'Over $150' }
  ];
  
  // Availability options
  const availabilityOptions = [
    { id: 'in-stock', label: 'In Stock' },
    { id: 'featured', label: 'Featured' },
    { id: 'sale', label: 'On Sale' }
  ];

  const togglePriceRange = (id: string) => {
    setPriceRange(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const toggleAvailability = (id: string) => {
    setAvailability(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Sort products
  const sortedProducts = products ? [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "name-asc":
        return language === "ar" && a.nameAr && b.nameAr
          ? a.nameAr.localeCompare(b.nameAr)
          : a.name.localeCompare(b.name);
      case "name-desc":
        return language === "ar" && a.nameAr && b.nameAr
          ? b.nameAr.localeCompare(a.nameAr)
          : b.name.localeCompare(a.name);
      default:
        return 0;
    }
  }) : [];

  // Filter products (basic implementation)
  const filteredProducts = sortedProducts;

  return (
    <>
      <Helmet>
        <title>
          {searchQuery 
            ? `${searchQuery} - Poultry Gear Search Results` 
            : "All Products - Poultry Gear"}
        </title>
        <meta 
          name="description" 
          content={searchQuery 
            ? `Search results for ${searchQuery} - Find the best poultry farming equipment` 
            : "Browse our complete catalog of high-quality poultry farming equipment. Free shipping on orders over $100."}
        />
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
            {searchQuery && (
              <>
                <ChevronRight className={cn("h-4 w-4 mx-2", isRtl && "rotate-180")} />
                <span className="text-gray-900 font-medium">Search: {searchQuery}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {searchQuery 
                ? `Search Results for "${searchQuery}"` 
                : "All Products"
              }
            </h1>
            <p className="text-gray-600">
              {searchQuery
                ? `Showing products matching your search for "${searchQuery}"`
                : "Browse our complete collection of high-quality poultry farming equipment"
              }
            </p>
          </div>
          
          {/* Mobile filter button (visible on small screens) */}
          <div className="lg:hidden mb-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filters - desktop or when expanded on mobile */}
            <div className={cn(
              "w-full lg:w-1/4 transition-all",
              !showMobileFilters && "hidden lg:block"
            )}>
              <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-32">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg text-gray-900">Filters</h2>
                  <Button variant="ghost" className="h-8 px-2 text-gray-500" onClick={() => {
                    setPriceRange([]);
                    setAvailability([]);
                  }}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
                
                {/* Category filter */}
                <div className="border-b border-gray-200 pb-5 mb-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                  <ul className="space-y-2">
                    {categories?.map(category => (
                      <li key={category.id}>
                        <Link 
                          href={`/categories/${category.slug}`}
                          className="text-gray-700 hover:text-primary-600 flex items-center"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                          {language === "ar" && category.nameAr ? category.nameAr : category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Price range filter */}
                <div className="border-b border-gray-200 pb-5 mb-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {priceRanges.map(range => (
                      <div key={range.id} className="flex items-center">
                        <Checkbox 
                          id={`price-${range.id}`} 
                          checked={priceRange.includes(range.id)} 
                          onCheckedChange={() => togglePriceRange(range.id)}
                          className="border-gray-300"
                        />
                        <label 
                          htmlFor={`price-${range.id}`}
                          className="ml-2 text-gray-700 text-sm"
                        >
                          {range.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Availability filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Availability</h3>
                  <div className="space-y-2">
                    {availabilityOptions.map(option => (
                      <div key={option.id} className="flex items-center">
                        <Checkbox 
                          id={`availability-${option.id}`} 
                          checked={availability.includes(option.id)} 
                          onCheckedChange={() => toggleAvailability(option.id)}
                          className="border-gray-300"
                        />
                        <label 
                          htmlFor={`availability-${option.id}`}
                          className="ml-2 text-gray-700 text-sm"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product list */}
            <div className="w-full lg:w-3/4">
              {/* Sort and view options */}
              <div className="flex flex-wrap justify-between items-center bg-gray-50 p-3 rounded-lg mb-6">
                <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                  <SlidersHorizontal className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 font-medium mr-2">Sort:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-8 w-[180px] text-sm bg-white border-gray-200">
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="name-asc">Name: A to Z</SelectItem>
                      <SelectItem value="name-desc">Name: Z to A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-3">View:</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={view === "grid" ? "bg-white text-primary-600" : "text-gray-400"}
                    onClick={() => setView("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={view === "list" ? "bg-white text-primary-600" : "text-gray-400"}
                    onClick={() => setView("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[...Array(9)].map((_, i) => (
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
              ) : error ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="text-red-500 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
                  <p className="text-gray-600 mb-6">We encountered a problem while loading the products. Please try again.</p>
                  <Button onClick={() => window.location.reload()} className="bg-primary-600 hover:bg-primary-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="text-gray-400 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-gray-600 mb-6">We couldn't find any products matching your criteria.</p>
                  <Button asChild className="bg-primary-600 hover:bg-primary-700">
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>
              ) : view === "grid" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  <div className="mt-8 text-center text-gray-500">
                    Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-6">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-1 relative">
                            <Link href={`/products/${product.slug}`}>
                              <img 
                                src={product.imageUrl} 
                                alt={language === "ar" && product.nameAr ? product.nameAr : product.name}
                                className="w-full h-40 md:h-full object-contain p-4" 
                              />
                            </Link>
                            {product.badge && <ProductBadge type={product.badge} />}
                          </div>
                          <div className="md:col-span-3 p-4 pt-0 md:pt-4 flex flex-col">
                            <div>
                              <Link href={`/products/${product.slug}`} className="inline-block">
                                <h3 className="font-bold text-gray-900 hover:text-primary-600 transition-colors mb-2">
                                  {language === "ar" && product.nameAr ? product.nameAr : product.name}
                                </h3>
                              </Link>
                              <div className="flex mb-2">
                                {[1, 2, 3, 4, 5].map((_, index) => (
                                  <Star 
                                    key={index} 
                                    className="h-4 w-4" 
                                    fill={index < 4 ? "#FFA41C" : "#E5E7EB"}
                                    color={index < 4 ? "#FFA41C" : "#E5E7EB"}
                                  />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">(24)</span>
                              </div>
                              <p className="text-gray-600 mb-4 line-clamp-2">
                                {language === "ar" && product.descriptionAr ? product.descriptionAr : product.description}
                              </p>
                            </div>
                            <div className="mt-auto flex flex-wrap justify-between items-center">
                              <div>
                                <span className="text-lg font-bold text-primary-600">${product.price}</span>
                                {product.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
                                )}
                              </div>
                              <div className="flex gap-2 mt-4 md:mt-0">
                                <Button className="h-9 bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200">
                                  <ShoppingCart className="h-4 w-4 mr-1" />
                                  Add to Cart
                                </Button>
                                <Button variant="outline" className="h-9 border-gray-300">
                                  <Link href={`/products/${product.slug}`}>View Details</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 text-center text-gray-500">
                    Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
