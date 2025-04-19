// List of countries with English and Arabic names
export interface Country {
  code: string;
  name: string;
  nameAr: string;
}

export const countries: Country[] = [
  { code: "AE", name: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة" },
  { code: "SA", name: "Saudi Arabia", nameAr: "المملكة العربية السعودية" },
  { code: "KW", name: "Kuwait", nameAr: "الكويت" },
  { code: "QA", name: "Qatar", nameAr: "قطر" },
  { code: "BH", name: "Bahrain", nameAr: "البحرين" },
  { code: "OM", name: "Oman", nameAr: "عمان" },
  { code: "EG", name: "Egypt", nameAr: "مصر" },
  { code: "JO", name: "Jordan", nameAr: "الأردن" },
  { code: "LB", name: "Lebanon", nameAr: "لبنان" },
  { code: "IQ", name: "Iraq", nameAr: "العراق" },
  { code: "YE", name: "Yemen", nameAr: "اليمن" },
  { code: "PS", name: "Palestine", nameAr: "فلسطين" },
  { code: "SY", name: "Syria", nameAr: "سوريا" },
  { code: "SD", name: "Sudan", nameAr: "السودان" },
  { code: "LY", name: "Libya", nameAr: "ليبيا" },
  { code: "MA", name: "Morocco", nameAr: "المغرب" },
  { code: "TN", name: "Tunisia", nameAr: "تونس" },
  { code: "DZ", name: "Algeria", nameAr: "الجزائر" },
  { code: "US", name: "United States", nameAr: "الولايات المتحدة الأمريكية" },
  { code: "CA", name: "Canada", nameAr: "كندا" },
  { code: "GB", name: "United Kingdom", nameAr: "المملكة المتحدة" },
  { code: "FR", name: "France", nameAr: "فرنسا" },
  { code: "DE", name: "Germany", nameAr: "ألمانيا" },
  { code: "IT", name: "Italy", nameAr: "إيطاليا" },
  { code: "ES", name: "Spain", nameAr: "إسبانيا" },
  { code: "AU", name: "Australia", nameAr: "أستراليا" },
  { code: "NZ", name: "New Zealand", nameAr: "نيوزيلندا" },
  { code: "JP", name: "Japan", nameAr: "اليابان" },
  { code: "CN", name: "China", nameAr: "الصين" },
  { code: "IN", name: "India", nameAr: "الهند" },
  { code: "BR", name: "Brazil", nameAr: "البرازيل" },
  { code: "RU", name: "Russia", nameAr: "روسيا" },
  { code: "ZA", name: "South Africa", nameAr: "جنوب أفريقيا" },
  { code: "TR", name: "Turkey", nameAr: "تركيا" },
  { code: "PK", name: "Pakistan", nameAr: "باكستان" },
  { code: "ID", name: "Indonesia", nameAr: "إندونيسيا" },
  { code: "MY", name: "Malaysia", nameAr: "ماليزيا" },
  { code: "SG", name: "Singapore", nameAr: "سنغافورة" },
  { code: "TH", name: "Thailand", nameAr: "تايلاند" },
  { code: "PH", name: "Philippines", nameAr: "الفلبين" },
  { code: "VN", name: "Vietnam", nameAr: "فيتنام" },
  { code: "KR", name: "South Korea", nameAr: "كوريا الجنوبية" },
  { code: "MX", name: "Mexico", nameAr: "المكسيك" },
  { code: "AR", name: "Argentina", nameAr: "الأرجنتين" },
  { code: "CL", name: "Chile", nameAr: "تشيلي" },
  { code: "CO", name: "Colombia", nameAr: "كولومبيا" },
  { code: "PE", name: "Peru", nameAr: "بيرو" },
  { code: "SE", name: "Sweden", nameAr: "السويد" },
  { code: "NO", name: "Norway", nameAr: "النرويج" },
  { code: "FI", name: "Finland", nameAr: "فنلندا" },
  { code: "DK", name: "Denmark", nameAr: "الدنمارك" },
  { code: "IE", name: "Ireland", nameAr: "أيرلندا" },
  { code: "CH", name: "Switzerland", nameAr: "سويسرا" },
  { code: "NL", name: "Netherlands", nameAr: "هولندا" },
  { code: "BE", name: "Belgium", nameAr: "بلجيكا" },
  { code: "AT", name: "Austria", nameAr: "النمسا" },
  { code: "PT", name: "Portugal", nameAr: "البرتغال" },
  { code: "GR", name: "Greece", nameAr: "اليونان" },
];

/**
 * Gets the country name based on the country code and current language
 * @param code The country code
 * @param isArabic Whether the app is currently in Arabic mode
 * @returns The country name in the appropriate language
 */
export const getCountryName = (code: string, isArabic: boolean): string => {
  const country = countries.find(c => c.code === code);
  if (!country) return code;
  return isArabic ? country.nameAr : country.name;
};

export default countries;