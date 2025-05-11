import { useLanguage } from "@/hooks/use-language";

export default function BrandsSection() {
  const { t } = useLanguage();
  
  // Brand logos (these would typically be imported from your assets)
  const brands = [
    {
      id: 1,
      name: "AgriFarm",
      logo: "https://placehold.co/200x80/e2e8f0/64748b?text=AgriFarm&font=montserrat"
    },
    {
      id: 2,
      name: "PoultryTech",
      logo: "https://placehold.co/200x80/e2e8f0/64748b?text=PoultryTech&font=montserrat"
    },
    {
      id: 3,
      name: "FarmSolutions",
      logo: "https://placehold.co/200x80/e2e8f0/64748b?text=FarmSolutions&font=montserrat"
    },
    {
      id: 4,
      name: "EcoFarm",
      logo: "https://placehold.co/200x80/e2e8f0/64748b?text=EcoFarm&font=montserrat"
    },
    {
      id: 5,
      name: "AgriInnovate",
      logo: "https://placehold.co/200x80/e2e8f0/64748b?text=AgriInnovate&font=montserrat"
    },
    {
      id: 6,
      name: "FarmTech",
      logo: "https://placehold.co/200x80/e2e8f0/64748b?text=FarmTech&font=montserrat"
    }
  ];

  return (
    <section className="py-12 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-700">
            Trusted By Industry Leaders
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {brands.map((brand) => (
            <div key={brand.id} className="grayscale hover:grayscale-0 transition-all duration-300">
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="h-12 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}