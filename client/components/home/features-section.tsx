import { useLanguage } from "@/hooks/use-language";
import { Shield, Truck, Clock, BarChart4, Leaf, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  id: number;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
}

export default function FeaturesSection() {
  const { t, isRtl, language } = useLanguage();
  
  const features: Feature[] = [
    {
      id: 1,
      titleKey: "high_quality_materials",
      descriptionKey: "high_quality_materials_desc",
      icon: <Shield className="h-10 w-10 text-primary-600" />
    },
    {
      id: 2,
      titleKey: "fast_shipping",
      descriptionKey: "fast_shipping_desc",
      icon: <Truck className="h-10 w-10 text-primary-600" />
    },
    {
      id: 3,
      titleKey: "extended_warranty",
      descriptionKey: "extended_warranty_desc",
      icon: <Clock className="h-10 w-10 text-primary-600" />
    },
    {
      id: 4,
      titleKey: "improved_efficiency",
      descriptionKey: "improved_efficiency_desc",
      icon: <BarChart4 className="h-10 w-10 text-primary-600" />
    },
    {
      id: 5,
      titleKey: "eco_friendly",
      descriptionKey: "eco_friendly_desc",
      icon: <Leaf className="h-10 w-10 text-primary-600" />
    },
    {
      id: 6,
      titleKey: "award_winning",
      descriptionKey: "award_winning_desc",
      icon: <Award className="h-10 w-10 text-primary-600" />
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading text-gray-900">
            {language === "ar" ? (
              <>لماذا تختار <span><span className="text-primary text-3xl md:text-4xl font-bold" style={{ color: "#2c5e2d" }}>بولتري</span><span className="mx-px">&nbsp;</span><span className="text-amber-500 text-3xl md:text-4xl font-bold">جير</span></span></>
            ) : (
              <>Why Choose <span><span className="text-primary text-3xl md:text-4xl font-bold" style={{ color: "#2c5e2d" }}>Poultry</span><span className="mx-px">&nbsp;</span><span className="text-amber-500 text-3xl md:text-4xl font-bold">Gear</span></span></>
            )}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {language === "ar" 
              ? "تم تصميم منتجاتنا مع مراعاة رفاهية الحيوان وإنتاجية المزرعة"
              : "Our products are designed with both animal welfare and farm productivity in mind"
            }
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className={cn(
                "bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100",
                "md:text-left", // Default left align on medium screens and up
                isRtl ? "text-right" : "text-center", // Center text on mobile, right-align for Arabic
              )}
            >
              <div className={cn(
                "mb-4 bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center",
                "md:mx-0", // No margin on medium screens and up
                isRtl ? "mr-auto md:mr-auto" : "mx-auto", // Center on mobile, right-align for Arabic
              )}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{t(feature.titleKey)}</h3>
              <p className="text-gray-600">{t(feature.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}