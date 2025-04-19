import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronRight, Layers, Store, ArrowRight, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const { language, isRtl, t } = useLanguage();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>{language === "ar" ? "الفئات - مستلزمات الدواجن" : "Categories - Poultry Gear"}</title>
        <meta name="description" content={language === "ar" ? "تصفح مجموعة منتجاتنا حسب الفئة. منتجات عالية الجودة لتربية الدواجن." : "Browse our product range by category. High-quality poultry farming equipment."} />
        <meta property="og:title" content={language === "ar" ? "الفئات - مستلزمات الدواجن" : "Categories - Poultry Gear"} />
        <meta property="og:description" content={language === "ar" ? "تصفح مجموعة منتجاتنا حسب الفئة." : "Browse our product range by category."} />
        <link rel="canonical" href="https://poultrygear.com/categories" />
      </Helmet>
      
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
            <span className="text-gray-900 font-medium">
              {language === "ar" ? "الفئات" : "Categories"}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Page heading */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === "ar" ? "تصفح حسب الفئة" : "Browse by Category"}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {language === "ar" 
                ? "تصفح مجموعة منتجاتنا المصنفة للعثور على احتياجات مزرعة الدواجن الخاصة بك."
                : "Browse our categorized product range to find your poultry farm needs."
              }
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="relative rounded-xl shadow-md overflow-hidden aspect-square">
                  <Skeleton className="w-full h-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categories?.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/categories/${category.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {category.imageUrl ? (
                        <img 
                          src={category.imageUrl} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          alt={language === "ar" && category.nameAr ? category.nameAr : category.name} 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-primary-100">
                          <Layers className="h-16 w-16 text-primary-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-70"></div>
                    </div>
                    <div className={cn(
                      "p-5",
                      isRtl && "text-right"
                    )}>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                        {language === "ar" && category.nameAr ? category.nameAr : category.name}
                      </h3>
                      <p className="text-gray-600 mt-2 mb-4 text-sm line-clamp-2" dir={isRtl ? "rtl" : "ltr"}>
                        {language === "ar" && category.descriptionAr 
                          ? category.descriptionAr 
                          : category.description || (language === "ar" 
                            ? `تصفح منتجات ${category.nameAr || category.name} عالية الجودة لدينا.` 
                            : `Browse our high-quality ${category.name} products.`)
                        }
                      </p>
                      <div className={cn(
                        "flex items-center text-primary-600 font-medium group-hover:text-primary-500",
                        isRtl ? "flex-row-reverse justify-end" : "justify-start"
                      )}>
                        <span>{language === "ar" ? "تصفح المنتجات" : "Browse Products"}</span>
                        {isRtl ? (
                          <ArrowLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        ) : (
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              <Link 
                href="/products"
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-primary-100">
                  <div className="relative aspect-[4/3] overflow-hidden bg-primary-50">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Layers className="h-20 w-20 text-primary-400" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-500/30 via-primary-300/20 to-transparent transition-opacity duration-300 group-hover:opacity-70"></div>
                  </div>
                  <div className={cn(
                    "p-5",
                    isRtl && "text-right"
                  )}>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300 text-center">
                      {language === "ar" ? "استكشف جميع المنتجات" : "Explore All Products"}
                    </h3>
                    <p className="text-gray-600 mt-2 mb-4 text-sm text-center">
                      {language === "ar" 
                        ? "تصفح المجموعة الكاملة من منتجاتنا في مكان واحد."
                        : "Browse our complete range of products in one place."
                      }
                    </p>
                    <div className="flex items-center justify-center text-primary-600 font-medium group-hover:text-primary-500">
                      <span>{language === "ar" ? "جميع المنتجات" : "All Products"}</span>
                      {isRtl ? (
                        <ArrowLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                      ) : (
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}