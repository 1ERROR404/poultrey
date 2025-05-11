import { PageTitle } from "@/components/ui/page-title";
import { useLanguage } from "@/hooks/use-language";
import { ArrowRight, Award, Clock, MapPin, Phone, Mail, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { scrollToSection } from "@/lib/scrollToSection";

export default function AboutPage() {
  const { t, language, isRtl } = useLanguage();

  const features = [
    {
      id: 1,
      icon: <Award className="h-8 w-8 text-green-700" />,
      title: language === "ar" ? "جودة متميزة" : "Premium Quality",
      description: language === "ar" 
        ? "نقدم منتجات عالية الجودة تم اختبارها بدقة للتأكد من المتانة والأداء"
        : "We offer high-quality products that have been rigorously tested for durability and performance"
    },
    {
      id: 2,
      icon: <Clock className="h-8 w-8 text-green-700" />,
      title: language === "ar" ? "خبرة واسعة" : "Years of Experience",
      description: language === "ar"
        ? "بخبرة أكثر من 15 عامًا في مجال الدواجن، نقدم معدات موثوقة ومبتكرة"
        : "With over 15 years in the poultry industry, we provide reliable and innovative equipment"
    }
  ];

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // Function to handle scroll to contact
  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection('contact');
  };

  return (
    <div className="bg-white" id="about-top">
      <PageTitle 
        title={language === "ar" ? "معلومات عنا" : "About Us"} 
        description={language === "ar" 
          ? "تعرف على بولتري جير وكيف بدأنا" 
          : "Learn about Poultry Gear and how we started"
        }
      />

      {/* Company Story Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className={cn(isRtl && "order-2")}>
              <div className="relative rounded-xl overflow-hidden h-60 sm:h-80 md:h-96">
                <img
                  src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt={language === "ar" ? "مزرعة الدواجن" : "Poultry Farm"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className={cn(
              "flex flex-col",
              isRtl && "order-1 text-right"
            )}>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
                {language === "ar" ? "قصتنا" : "Our Story"}
              </h2>
              <p className="text-gray-600 mb-4">
                {language === "ar"
                  ? "تأسست بولتري جير في عام 2005 بهدف بسيط: توفير معدات تربية دواجن عالية الجودة للمزارعين في جميع أنحاء العالم. بدأنا كشركة صغيرة في دبي، الإمارات العربية المتحدة، بخط إنتاج واحد فقط من أنظمة التغذية."
                  : "Poultry Gear was established in 2005 with a simple goal: to provide high-quality poultry farming equipment to farmers worldwide. We started as a small company in Dubai, UAE with just a single production line of feeding systems."}
              </p>
              <p className="text-gray-600 mb-6">
                {language === "ar"
                  ? "اليوم، نحن فخورون بتوفير مجموعة كاملة من حلول تربية الدواجن المبتكرة التي تساعد المزارعين على تحسين الإنتاجية مع الحفاظ على صحة الدواجن ورفاهيتها. نحن نخدم آلاف العملاء في أكثر من 30 دولة."
                  : "Today, we are proud to offer a complete range of innovative poultry farming solutions that help farmers improve productivity while maintaining poultry health and welfare. We serve thousands of customers in over 30 countries."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {features.map((feature) => (
                  <div key={feature.id} className="flex flex-col">
                    <div className={cn(
                      "flex items-center mb-3 text-gray-900",
                      isRtl && "flex-row-reverse justify-end"
                    )}>
                      <div className="bg-green-50 p-2 rounded-full mr-3">
                        {feature.icon}
                      </div>
                      <h3 className="font-bold">{feature.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-12 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
              {language === "ar" ? "مهمتنا وقيمنا" : "Our Mission & Values"}
            </h2>
            <p className="text-gray-600">
              {language === "ar"
                ? "نحن ملتزمون بتوفير منتجات عالية الجودة تعزز إنتاجية مزارع الدواجن وصحة الطيور"
                : "We are committed to providing high-quality products that enhance poultry farm productivity and bird health"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className={cn(
                "text-xl font-bold mb-3 text-green-800",
                isRtl && "text-right"
              )}>
                {language === "ar" ? "الابتكار" : "Innovation"}
              </h3>
              <p className={cn(
                "text-gray-600",
                isRtl && "text-right"
              )}>
                {language === "ar"
                  ? "نسعى باستمرار لتطوير منتجات جديدة ومبتكرة تلبي احتياجات السوق المتغيرة."
                  : "We continuously strive to develop new and innovative products that meet changing market needs."}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className={cn(
                "text-xl font-bold mb-3 text-green-800",
                isRtl && "text-right"
              )}>
                {language === "ar" ? "الاستدامة" : "Sustainability"}
              </h3>
              <p className={cn(
                "text-gray-600",
                isRtl && "text-right"
              )}>
                {language === "ar"
                  ? "نحن ملتزمون بممارسات الإنتاج المستدامة وتقليل أثرنا البيئي."
                  : "We are committed to sustainable production practices and reducing our environmental footprint."}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className={cn(
                "text-xl font-bold mb-3 text-green-800",
                isRtl && "text-right"
              )}>
                {language === "ar" ? "خدمة العملاء" : "Customer Service"}
              </h3>
              <p className={cn(
                "text-gray-600",
                isRtl && "text-right"
              )}>
                {language === "ar"
                  ? "نحن نوفر دعمًا استثنائيًا للعملاء ونسعى جاهدين لتجاوز التوقعات."
                  : "We provide exceptional customer support and strive to exceed expectations."}
              </p>
            </div>
          </div>
          
          {/* Contact link at the end of Values section */}
          <div className="text-center mt-8">
            <button
              onClick={handleContactClick}
              className={cn(
                "inline-flex items-center justify-center gap-2 text-green-700 hover:text-green-800 font-medium underline",
                isRtl && "flex-row-reverse"
              )}
            >
              {language === "ar" ? "هل لديك أسئلة؟ تواصل معنا" : "Have questions? Get in touch with us"}
              <ArrowIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 bg-white border-t-4 border-green-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className={cn(
              "text-2xl sm:text-3xl font-bold mb-6 text-gray-900",
              isRtl ? "text-right" : "text-center"
            )}>
              {language === "ar" ? "تواصل معنا" : "Contact Us"}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={cn(
                "flex flex-col",
                isRtl && "text-right"
              )}>
                <p className="text-gray-600 mb-6">
                  {language === "ar"
                    ? "لديك أسئلة أو استفسارات؟ نحن هنا للمساعدة. اتصل بنا اليوم وسيكون فريقنا الودود سعيدًا بالمساعدة."
                    : "Have questions or inquiries? We're here to help. Contact us today and our friendly team will be happy to assist."}
                </p>
                
                <div className="space-y-4">
                  <div className={cn(
                    "flex items-center text-gray-600",
                    isRtl && "flex-row-reverse justify-end"
                  )}>
                    <MapPin className={cn("h-5 w-5 text-green-700", isRtl ? "ml-3" : "mr-3")} />
                    <span>
                      {language === "ar"
                        ? "شارع الشيخ زايد، دبي، الإمارات العربية المتحدة"
                        : "Sheikh Zayed Road, Dubai, UAE"}
                    </span>
                  </div>
                  
                  <div className={cn(
                    "flex items-center text-gray-600",
                    isRtl && "flex-row-reverse justify-end"
                  )}>
                    <Phone className={cn("h-5 w-5 text-green-700", isRtl ? "ml-3" : "mr-3")} />
                    <span>+971 4 123 4567</span>
                  </div>
                  
                  <div className={cn(
                    "flex items-center text-gray-600",
                    isRtl && "flex-row-reverse justify-end"
                  )}>
                    <Mail className={cn("h-5 w-5 text-green-700", isRtl ? "ml-3" : "mr-3")} />
                    <span>info@poultrygear.com</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-xl">
                <div className="aspect-w-16 aspect-h-9 h-64 rounded-lg overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.8918678975906!2d55.3159536!3d25.2318962!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5ccf30bc53c7%3A0x9b9ad5fe4d66a2e2!2sSheikh%20Zayed%20Rd%20-%20Dubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2sus!4v1598523536329!5m2!1sen!2sus" 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    aria-hidden="false" 
                    tabIndex={0}
                    title="map"
                    className="w-full h-full rounded-lg"
                  ></iframe>
                </div>
              </div>
            </div>
            
            <div className="mt-10 text-center">
              <Link 
                href="/products" 
                className={cn(
                  "inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-md transition-colors",
                  isRtl && "flex-row-reverse"
                )}
              >
                {language === "ar" ? "تصفح منتجاتنا" : "Browse Our Products"}
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}