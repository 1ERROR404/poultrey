import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const { t, language, isRtl } = useLanguage();

  return (
    <section className="relative h-[280px] sm:h-[400px] md:h-[500px]" 
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%', 
        backgroundRepeat: 'no-repeat'
      }}>
      <div className="absolute inset-0 bg-green-900/60"></div>
      <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
        <div className="max-w-full sm:max-w-2xl text-white w-full text-center px-2">
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 md:mb-4 text-white">
            {language === "ar" ? "معدات تربية دواجن متميزة" : "Premium Poultry Farming Equipment"}
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-2 sm:mb-3 md:mb-6 text-white/90 leading-relaxed max-w-[95%] sm:max-w-[90%] mx-auto">
            {language === "ar" 
              ? "استكشف مجموعتنا من المنتجات المصممة للكفاءة والجودة."
              : "Explore our products designed for efficiency and quality."
            }
          </p>
          
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <Link 
              href="/products" 
              className="bg-green-700 hover:bg-green-800 text-white px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded text-xs sm:text-sm font-medium"
            >
              {t("shop_now")}
            </Link>
            <Link 
              href="/about"
              className="bg-transparent border border-white text-white hover:bg-white/10 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded text-xs sm:text-sm font-medium"
            >
              {t("about_us")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
