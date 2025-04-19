import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/currency-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ProductCard from "./product-card";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

export default function FeaturedProducts() {
  const { t, language, isRtl } = useLanguage();
  const { formatCurrency } = useCurrency();
  const { scrollToTop } = useScrollToTop();
  
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products?featured=true'],
  });

  if (error) {
    return (
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            Error loading featured products. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  // Get badge text based on language
  const getBadgeText = (badge: string) => {
    if (badge === 'new') return language === "ar" ? t("new") : "NEW";
    if (badge === 'sale') return language === "ar" ? t("sale_badge") : "SALE";
    if (badge === 'best seller') return language === "ar" ? t("bestseller") : "BESTSELLER";
    return badge;
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-8 px-2 sm:px-0 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 text-gray-900">{t("featured_products")}</h2>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            {language === "ar" 
              ? "استكشف مجموعتنا من معدات تربية الدواجن عالية الجودة المصممة لتحسين الكفاءة والإنتاجية."
              : "Explore our selection of high-quality poultry farming equipment designed to improve efficiency and productivity."
            }
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 overflow-hidden">
                <Skeleton className="w-full h-44 sm:h-52 md:h-64" />
                <div className="p-3 sm:p-4">
                  <Skeleton className="h-4 w-16 sm:w-24 mb-2" />
                  <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
                    <Skeleton className="h-8 sm:h-10 w-8 sm:w-10 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {products?.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link 
            href="/products" 
            onClick={scrollToTop}
            className="inline-block bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded text-sm font-medium transition-colors"
          >
            {t("view_all")}
          </Link>
        </div>
      </div>
    </section>
  );
}
