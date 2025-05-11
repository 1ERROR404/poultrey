import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

interface PageTitleProps {
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export function PageTitle({ 
  title, 
  description, 
  centered = true, 
  className 
}: PageTitleProps) {
  const { isRtl } = useLanguage();
  
  return (
    <div className="bg-green-50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className={cn(
          "w-full max-w-4xl mx-auto", 
          centered ? "text-center" : isRtl ? "text-right" : "text-left",
          className
        )}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}