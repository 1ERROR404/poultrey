import * as React from "react";
import { useLanguage } from "@/hooks/use-language";
import { LANGUAGES, Language } from "@/contexts/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    // Force reload the page to apply language changes fully
    // window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.values(LANGUAGES).map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={language === lang.code ? "bg-accent/50" : ""}
            onClick={() => handleLanguageChange(lang.code as Language)}
          >
            <div className="flex items-center">
              <span className={language === lang.code ? "font-bold" : ""}>
                {lang.nativeName}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}