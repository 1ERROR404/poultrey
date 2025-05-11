import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";

interface RelatedProductsProps {
  currentProductId: number;
  currentProductCategoryId?: number;
  limit?: number;
}

export default function RelatedProducts({ 
  currentProductId, 
  currentProductCategoryId,
  limit = 4 
}: RelatedProductsProps) {
  const { t } = useLanguage();
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  
  // Fetch all products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  useEffect(() => {
    if (products && products.length > 0) {
      // Filter out the current product
      const filteredProducts = products.filter(p => p.id !== currentProductId);
      
      // If we have products to work with
      if (filteredProducts.length > 0) {
        let selectedProducts: Product[] = [];
        
        // First try to get same category products if category is provided
        if (currentProductCategoryId) {
          const sameCategoryProducts = filteredProducts.filter(
            p => p.categoryId === currentProductCategoryId
          );
          
          // If we have at least one product in the same category, use it
          if (sameCategoryProducts.length > 0) {
            // Prioritize products from the same category
            selectedProducts = [...sameCategoryProducts];
          }
        }
        
        // If we don't have enough products yet, add random ones until we reach the limit
        if (selectedProducts.length < limit) {
          // Shuffle the remaining products that aren't in the selectedProducts already
          const remainingProducts = filteredProducts.filter(
            p => !selectedProducts.includes(p)
          );
          
          const shuffled = [...remainingProducts].sort(() => 0.5 - Math.random());
          
          // Take as many as needed to reach the limit
          const additional = shuffled.slice(0, limit - selectedProducts.length);
          selectedProducts = [...selectedProducts, ...additional];
        }
        
        // If we have more than the limit, trim down to limit
        setRandomProducts(selectedProducts.slice(0, limit));
      }
    }
  }, [products, currentProductId, currentProductCategoryId, limit]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">{t("you_might_also_like")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <Skeleton className="h-52 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2 mb-4" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Only render if we have products to show
  if (!randomProducts || randomProducts.length === 0) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">{t("you_might_also_like")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {randomProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}