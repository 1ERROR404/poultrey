import { createContext, useState, useEffect, ReactNode } from 'react';
import { getLanguageFromUrl, setLanguageInUrl } from '@/lib/utils';

export type Language = 'en' | 'ar';

// Language names for display in the switcher
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  isRtl: false,
});

interface LanguageProviderProps {
  children: ReactNode;
}

// Get browser language preference
const getBrowserLanguage = (): Language => {
  try {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    if (langCode === 'ar') {
      return 'ar';
    }
    
    return 'en'; // Default to English
  } catch (error) {
    return 'en'; // Fallback to English
  }
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Try to get language from URL, then browser settings
  const getInitialLanguage = (): Language => {
    const urlLanguage = getLanguageFromUrl();
    if (urlLanguage) return urlLanguage;
    
    return getBrowserLanguage();
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage());
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const isRtl = language === 'ar';

  // Load translations
  useEffect(() => {
    import('@/lib/translations').then((module) => {
      setTranslations(module.default);
    });
  }, []);

  // Set language in URL and update document attributes
  useEffect(() => {
    setLanguageInUrl(language);
    
    // Update HTML attributes
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    
    // Add RTL class to body if needed
    if (isRtl) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language, isRtl]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function
  const t = (key: string): string => {
    if (!translations[language]) return key;
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}
