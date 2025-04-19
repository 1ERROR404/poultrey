import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { 
  Facebook, 
  Instagram,  
  Mail,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import poultryGearLogo from "@/assets/poultry-gear-logo.png";

export default function Footer() {
  const { t, language, isRtl } = useLanguage();

  return (
    <footer className="mt-6 sm:mt-10 bg-black text-white">
      {/* Main footer */}
      <div className="border-t border-gray-800 pt-6 sm:pt-10 pb-4">
        <div className="container mx-auto px-3 sm:px-4">
          <div className={cn(
            "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8",
            isRtl && "text-right"
          )}>
            {/* Logo and Info */}
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <div className="mb-3 sm:mb-4">
                <Link href="/" className="flex items-center">
                  <div className="flex items-center" dir="ltr">
                    <img 
                      src={poultryGearLogo} 
                      alt="Poultry Gear Logo" 
                      className="h-16 mr-1 filter invert brightness-0" 
                    />
                    <span className="text-lg sm:text-xl font-bold flex items-center">
                      <span className="text-primary text-xl sm:text-2xl font-bold" style={{ color: "#2c5e2d" }}>Poultry</span>
                      <span className="mx-px">&nbsp;</span>
                      <span className="text-amber-500 text-xl sm:text-2xl font-bold">Gear</span>
                    </span>
                  </div>
                </Link>
              </div>
              <p className="text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm">
                {language === "ar" 
                  ? "معدات تربية دواجن متميزة للمزارعين التجاريين ومزارعي الفناء الخلفي."
                  : "Premium poultry farming equipment for commercial and backyard farmers."
                }
              </p>
              <div className="space-y-1 sm:space-y-2">
                <div className={cn(
                  "flex items-center text-xs sm:text-sm text-gray-400",
                  isRtl && "flex-row-reverse"
                )}>
                  <MapPin className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500", isRtl ? "ml-1.5 sm:ml-2" : "mr-1.5 sm:mr-2")} />
                  <span>123 Poultry Ave, Farmville CA</span>
                </div>
                <div className={cn(
                  "flex items-center text-xs sm:text-sm text-gray-400",
                  isRtl && "flex-row-reverse"
                )}>
                  <Mail className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500", isRtl ? "ml-1.5 sm:ml-2" : "mr-1.5 sm:mr-2")} />
                  <a href="mailto:info@poultrygear.com" className="hover:text-green-500">
                    info@poultrygear.com
                  </a>
                </div>
              </div>
              <div className={cn(
                "mt-3 sm:mt-4 flex",
                isRtl ? "space-x-reverse space-x-3" : "space-x-3"
              )}>
                <a href="#" className="text-gray-400 hover:text-green-500">
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-500">
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </div>
            </div>
            
            {/* Shop Categories */}
            <div>
              <h3 className="font-semibold text-white mb-2 sm:mb-4 text-xs sm:text-sm uppercase">{t("shop")}</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <Link href="/categories/feeders" className="text-gray-400 hover:text-green-500 text-xs sm:text-sm">
                    {language === "ar" ? "معالف" : "Feeders"}
                  </Link>
                </li>
                <li>
                  <Link href="/categories/waterers" className="text-gray-400 hover:text-green-500 text-xs sm:text-sm">
                    {language === "ar" ? "مساقي" : "Waterers"}
                  </Link>
                </li>
                <li>
                  <Link href="/categories/coop-equipment" className="text-gray-400 hover:text-green-500 text-xs sm:text-sm">
                    {language === "ar" ? "معدات العشة" : "Coop Equipment"}
                  </Link>
                </li>
                <li>
                  <Link href="/categories/health-care" className="text-gray-400 hover:text-green-500 text-xs sm:text-sm">
                    {language === "ar" ? "الصحة والرعاية" : "Health & Care"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h3 className="font-semibold text-white mb-2 sm:mb-4 text-xs sm:text-sm uppercase">{t("help")}</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-green-500 text-xs sm:text-sm">
                    {t("faq")}
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-gray-400 hover:text-green-500 text-xs sm:text-sm">
                    {t("shipping")}
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-gray-400 hover:text-green-500 text-xs sm:text-sm">
                    {t("returns")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-green-500 text-xs sm:text-sm">
                    {t("contact_us")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h3 className="font-semibold text-white mb-2 sm:mb-4 text-xs sm:text-sm uppercase">{t("about")}</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-green-500 text-xs sm:text-sm">
                    {t("about_us")}
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-green-500 text-xs sm:text-sm">
                    {t("blog")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-green-500 text-xs sm:text-sm">
                    {t("privacy_policy")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-green-500 text-xs sm:text-sm">
                    {t("terms")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-gray-700 pt-3 sm:pt-4 mt-3 sm:mt-4">
            <p className={cn(
              "text-gray-400 text-xs sm:text-xs",
              isRtl ? "text-right" : "text-center"
            )}>
              {t("copyright").replace("2023", new Date().getFullYear().toString())}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
