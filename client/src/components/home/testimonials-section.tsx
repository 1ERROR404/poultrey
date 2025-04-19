import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  content: string;
  rating: number;
  image: string;
}

export default function TestimonialsSection() {
  const { t, isRtl } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Poultry Farmer",
      location: "Texas, USA",
      content: "The automatic feeders I purchased from Poultry Gear have been a game-changer for my operation. They're durable, reliable, and have significantly reduced feed waste. My chickens are healthier, and I'm saving time and money!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      role: "Farm Manager",
      location: "California, USA",
      content: "I've been in the poultry business for over 15 years and have tried many equipment suppliers. Poultry Gear stands out for quality, durability, and excellent customer service. Their waterers have improved our efficiency by 30%.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Emily Chen",
      role: "Backyard Chicken Keeper",
      location: "Oregon, USA",
      content: "As a hobbyist with just a few chickens, I appreciate how Poultry Gear offers solutions for small-scale operations too. The coop equipment is easy to install and my chickens love it. Great value for the price!",
      rating: 4,
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=200&h=200&auto=format&fit=crop"
    }
  ];

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="py-16 bg-primary-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading text-gray-900">
            What Our <span className="text-primary-600">Customers</span> Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - see what our customers have to say about our products and service
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="md:col-span-1 bg-primary-600 p-8 flex flex-col justify-center items-center text-white">
                <img 
                  src={testimonials[activeIndex].image} 
                  alt={testimonials[activeIndex].name}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover mb-4"
                />
                <h3 className="font-bold text-xl mb-1">{testimonials[activeIndex].name}</h3>
                <p className="text-primary-100 text-sm mb-2">{testimonials[activeIndex].role}</p>
                <p className="text-primary-200 text-sm">{testimonials[activeIndex].location}</p>
                
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-5 w-5" 
                      fill={i < testimonials[activeIndex].rating ? "#ffffff" : "none"}
                      color="#ffffff"
                    />
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-2 p-8 flex flex-col justify-center">
                <div className="mb-6">
                  <svg className="h-12 w-12 text-primary-200 mb-4" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"/>
                  </svg>
                  <p className="text-gray-700 text-lg italic leading-relaxed">
                    {testimonials[activeIndex].content}
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-auto">
                  <div className="flex space-x-1">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={cn(
                          "w-3 h-3 rounded-full transition-colors duration-300",
                          index === activeIndex ? "bg-primary-600" : "bg-gray-300"
                        )}
                        aria-label={`Go to testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={prevTestimonial}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextTestimonial}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                      aria-label="Next testimonial"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-primary-200 rounded-full opacity-50"></div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-200 rounded-full opacity-30"></div>
        </div>
      </div>
    </section>
  );
}