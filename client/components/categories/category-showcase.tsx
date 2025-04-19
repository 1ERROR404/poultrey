import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CategoryShowcase() {
  const { t, language, isRtl } = useLanguage();
  
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const getCategoryDescription = (category: Category) => {
    const key = `${category.slug}_description`;
    return t(key);
  };

  if (error) {
    return (
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            Error loading categories. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-8 sm:mb-12 px-2 sm:px-0 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 font-heading text-gray-900">
            {language === "ar" ? (
              <><span className="text-primary-600">الفئات</span> تسوق حسب</>
            ) : (
              <>Shop By <span className="text-primary-600">Category</span></>
            )}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            {language === "ar" 
              ? "تصفح مجموعتنا الواسعة من معدات تربية الدواجن عالية الجودة المصنفة حسب الفئة"
              : "Browse our wide selection of high-quality poultry farming equipment organized by category"
            }
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative rounded-xl shadow-md overflow-hidden aspect-square">
                <Skeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories?.map((category) => (
              <Link 
                key={category.id} 
                href={`/categories/${category.slug}`}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={category.imageUrl || ''} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt={language === "ar" && category.nameAr ? category.nameAr : category.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-70"></div>
                  </div>
                  <div className={cn(
                    "p-5",
                    isRtl && "text-right"
                  )}>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                      {language === "ar" && category.nameAr ? category.nameAr : category.name}
                    </h3>
                    <p className="text-gray-600 mt-2 mb-4 text-sm line-clamp-2">
                      {getCategoryDescription(category)}
                    </p>
                    <div className={cn(
                      "flex items-center text-primary-600 font-medium group-hover:text-primary-500",
                      isRtl ? "flex-row-reverse justify-end" : "justify-start"
                    )}>
                      <span>{language === "ar" ? "تصفح المنتجات" : "Browse Products"}</span>
                      <ArrowIcon className={cn(
                        "h-4 w-4 transition-transform", 
                        isRtl 
                          ? "mr-1 group-hover:-translate-x-1" 
                          : "ml-1 group-hover:translate-x-1"
                      )} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link 
            href="/categories" 
            className={cn(
              "inline-flex items-center justify-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium px-8 py-3 rounded-md transition-colors border border-primary-200",
              isRtl && "flex-row-reverse"
            )}
          >
            {language === "ar" ? "عرض جميع الفئات" : "View All Categories"}
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
