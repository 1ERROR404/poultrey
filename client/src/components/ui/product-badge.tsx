import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductBadgeProps {
  type: string;
  className?: string;
}

export default function ProductBadge({ type, className }: ProductBadgeProps) {
  // Define badge styles based on type
  const getBadgeStyles = () => {
    switch (type.toLowerCase()) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'sale':
      case 'discount':
        return 'bg-yellow-500 text-white';
      case 'bestseller':
        return 'bg-blue-100 text-blue-800';
      case 'limited':
        return 'bg-purple-100 text-purple-800';
      case 'out of stock':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge 
      className={cn(
        "uppercase font-semibold text-xs px-2 py-1",
        getBadgeStyles(),
        className
      )}
    >
      {type}
    </Badge>
  );
}