import { useState, useEffect } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

// WhatsApp phone number should be in international format without any symbols or spaces
const WHATSAPP_NUMBER = '96894954004'; // Oman number
const MESSAGE = 'Hello! I have a question about Poultry Gear products.'; // Default message

export default function WhatsAppButton() {
  const { language, isRtl } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Message based on language
  const message = language === 'ar' 
    ? 'مرحبا! لدي سؤال حول منتجات بولتري جير.' 
    : MESSAGE;
    
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // WhatsApp URL
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  // Add pulsing effect
  useEffect(() => {
    // Start animation immediately
    setIsAnimating(true);
    
    const animationInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 5000);
    
    // Show expanded version after 2 seconds on page load
    const expandTimeout = setTimeout(() => {
      setIsExpanded(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setIsExpanded(false), 5000);
    }, 2000);
    
    return () => {
      clearInterval(animationInterval);
      clearTimeout(expandTimeout);
    };
  }, []);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed ${isRtl ? 'left-4' : 'right-4'} bottom-6 z-50 flex items-center ${isAnimating ? 'animate-bounce' : ''}`}
      aria-label="Contact us on WhatsApp"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="relative group">
        {/* Pulsing effect */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25"></div>
        
        {/* Button and label */}
        <div className={`relative flex items-center ${isExpanded ? 'scale-110' : ''} transition-all duration-300`}>
          {/* WhatsApp icon */}
          <div className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-110 flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              className="h-6 w-6 fill-current"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          
          {/* Text label - for larger screens */}
          <div className={`
            bg-white text-green-600 font-medium rounded-r-full py-3 px-4 shadow-lg ml-2 
            border-2 border-green-500 hidden sm:flex items-center
            ${isExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 sm:opacity-100 sm:max-w-[200px]'}
            transition-all duration-300
          `}>
            <MessageCircle className="mr-2 h-5 w-5" />
            <span className="whitespace-nowrap">
              {language === 'ar' ? 'تواصل معنا واتساب' : 'Need help? Chat now!'}
            </span>
          </div>
          
          {/* Mobile label - shows below icon on small screens */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-green-600 text-xs font-medium py-1 px-2 rounded-full shadow-md border border-green-500 whitespace-nowrap sm:hidden">
            {language === 'ar' ? 'تواصل' : 'WhatsApp Chat'}
          </div>
        </div>
      </div>
    </a>
  );
}