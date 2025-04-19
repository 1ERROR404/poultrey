import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ShoppingBag, 
  ChevronLeft, 
  Package, 
  Truck, 
  Check, 
  Clock, 
  CalendarDays, 
  ArrowRight,
  Info,
  Printer,
  HelpCircle,
  MapPin,
  Phone,
  User,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  product: {
    id: number;
    name: string;
    price: string;
    imageUrl: string | null;
    slug?: string;
    description?: string;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export default function OrderDetailsPage() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const [, params] = useRoute<{ id: string }>('/account/orders/:id');
  const orderId = params?.id ? parseInt(params.id) : 0;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!orderId) {
      setError(t("order_not_found"));
      setLoading(false);
      return;
    }
    
    // Fetch specific order details with product information
    fetch(`/api/user/orders/${orderId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(t("failed_to_fetch_order"));
        }
        return response.json();
      })
      .then(orderData => {
        setOrder(orderData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching order:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [orderId, t]);

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "processing":
        return <Package className="h-3 w-3" />;
      case "shipped":
        return <Truck className="h-3 w-3" />;
      case "delivered":
        return <Check className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">{t("pending")}</Badge>;
      case "processing":
        return <Badge variant="secondary">{t("processing")}</Badge>;
      case "shipped":
        return <Badge variant="default">{t("shipped")}</Badge>;
      case "delivered":
        return <Badge className="bg-green-500 hover:bg-green-600">{t("delivered")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-primary"></div>
          <p className="text-xs text-muted-foreground">{t("loading_order")}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-3 max-w-full px-2">
        <div>
          <h2 className="text-base font-bold tracking-tight">{t("order_details")}</h2>
          <p className="text-xs text-muted-foreground">
            {t("view_your_order_details")}
          </p>
        </div>
        
        <Separator className="my-2" />
        
        <Card className="shadow-sm overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-4 px-3">
            <div className="rounded-full bg-destructive/10 p-1.5 mb-2">
              <ShoppingBag className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="text-sm font-medium text-center mb-1">
              {error || t("order_not_found")}
            </h3>
            <p className="text-xs text-muted-foreground text-center mb-3">
              {t("please_try_again_later")}
            </p>
            <Button asChild size="sm" className="h-7 text-xs">
              <Link href="/account/orders">
                <ChevronLeft className={cn("h-3 w-3 mr-1", isRtl && "transform rotate-180")} />
                {t("back_to_orders")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate the progress percentage based on the order status
  const getOrderProgress = (status: string): number => {
    switch (status) {
      case "pending": return 25;
      case "processing": return 50;
      case "shipped": return 75;
      case "delivered": return 100;
      default: return 0;
    }
  };
  
  // Format date nicely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPP"); // e.g., April 13, 2025
    } catch (error) {
      return new Date(dateString).toLocaleDateString();
    }
  };
  
  // Format time nicely
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "p"); // e.g., 4:30 PM
    } catch (error) {
      return new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
  };
  
  return (
    <div className="space-y-4 sm:space-y-6 max-w-full px-3 sm:px-4 pb-6">
      {/* Header with enhanced styling */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-background to-muted p-3 sm:p-4 rounded-lg border">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight flex items-center">
            <span className="text-primary mr-1.5">{t("order")}</span> 
            <span className="truncate max-w-[150px] sm:max-w-none">#{order.orderNumber}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 ml-1.5">
                    <Printer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{t("print_order")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <p className="text-sm text-muted-foreground flex flex-wrap items-center mt-1">
            <CalendarDays className="h-3.5 w-3.5 mr-1 shrink-0" />
            <span className="whitespace-nowrap">{t("placed_on")} {formatDate(order.createdAt)}</span>
            <span className="mx-1.5">•</span>
            <span className="whitespace-nowrap">{formatTime(order.createdAt)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0 mt-2 sm:mt-0">
          {getStatusBadge(order.status)}
          <Button asChild variant="outline" size="sm" className="h-8 text-sm w-full sm:w-auto">
            <Link href="/account/orders">
              <ChevronLeft className={cn("h-3.5 w-3.5 mr-1.5", isRtl && "transform rotate-180")} />
              {t("back_to_orders")}
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Order Progress */}
      <Card className="border shadow-sm">
        <CardContent className="p-3 sm:p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">{t("order_progress")}</span>
            <span className="text-sm text-muted-foreground">{getOrderProgress(order.status)}%</span>
          </div>
          <Progress value={getOrderProgress(order.status)} className="h-2.5" />
          
          <div className="flex justify-between mt-3 text-[10px] sm:text-xs text-muted-foreground">
            {/* Progress stages with responsive sizing */}
            <div className="flex flex-col items-center max-w-[65px] sm:max-w-none">
              <div className={cn("rounded-full p-1 sm:p-1.5", 
                order.status ? "bg-primary/20" : "bg-muted")}>
                <ShoppingBag className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", 
                  order.status ? "text-primary" : "text-muted-foreground")} />
              </div>
              <span className="mt-1 text-center font-medium">{t("placed")}</span>
            </div>
            <div className="flex flex-col items-center max-w-[65px] sm:max-w-none">
              <div className={cn("rounded-full p-1 sm:p-1.5", 
                (order.status === "processing" || order.status === "shipped" || order.status === "delivered") 
                  ? "bg-primary/20" : "bg-muted")}>
                <Package className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", 
                  (order.status === "processing" || order.status === "shipped" || order.status === "delivered") 
                    ? "text-primary" : "text-muted-foreground")} />
              </div>
              <span className="mt-1 text-center font-medium">{t("processing")}</span>
            </div>
            <div className="flex flex-col items-center max-w-[65px] sm:max-w-none">
              <div className={cn("rounded-full p-1 sm:p-1.5", 
                (order.status === "shipped" || order.status === "delivered") 
                  ? "bg-primary/20" : "bg-muted")}>
                <Truck className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", 
                  (order.status === "shipped" || order.status === "delivered") 
                    ? "text-primary" : "text-muted-foreground")} />
              </div>
              <span className="mt-1 text-center font-medium">{t("shipped")}</span>
            </div>
            <div className="flex flex-col items-center max-w-[65px] sm:max-w-none">
              <div className={cn("rounded-full p-1 sm:p-1.5", 
                order.status === "delivered" ? "bg-green-500/20" : "bg-muted")}>
                <Check className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", 
                  order.status === "delivered" ? "text-green-500" : "text-muted-foreground")} />
              </div>
              <span className="mt-1 text-center font-medium">{t("delivered")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="md:col-span-2 space-y-4">
          {/* Order Items Card with enhanced styling */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="p-4 pb-2 bg-muted/30">
              <CardTitle className="text-sm sm:text-base font-medium flex flex-wrap items-center gap-2">
                <ShoppingBag className="h-4 w-4 mr-1 shrink-0" />
                <span className="shrink-0">{t("order_items")}</span>
                <Badge className="ml-auto sm:ml-2 bg-primary/20 text-primary hover:bg-primary/30 text-xs">
                  {order.items.length} {order.items.length === 1 ? t("item_singular") : t("items_plural")}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="space-y-3 pt-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 py-3 border-b last:border-0 last:pb-0 hover:bg-muted/10 rounded-sm p-2">
                    <div className="flex gap-3 min-w-0 flex-1">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-md flex items-center justify-center shrink-0 border overflow-hidden">
                        {item.product?.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name || item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm sm:text-base truncate mb-1">
                          {item.product?.name || item.productName}
                        </h4>
                        <Link 
                          href={item.product?.slug ? `/products/${item.product.slug}` : '#'} 
                          className={cn(
                            "text-xs text-primary/80 hover:text-primary inline-block mb-2",
                            !item.product?.slug && "pointer-events-none opacity-50"
                          )}
                        >
                          {t("view_product")}
                        </Link>
                        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs sm:text-sm text-muted-foreground mt-1">
                          <span className="inline-flex items-center">
                            <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {t("quantity")}: <span className="font-medium ml-1">{item.quantity}</span>
                          </span>
                          <span className="inline-flex items-center">
                            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {t("unit_price")}: <span className="font-medium ml-1">
                              {item.unitPrice || item.product?.price || item.productPrice || 'N/A'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex items-center">
                      <div className="font-medium text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                        {item.subtotal || (
                          item.productPrice && typeof item.productPrice === 'string' 
                            ? (parseFloat(item.productPrice.replace(/[^\d.-]/g, '')) || 0) * item.quantity 
                            : item.quantity
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          

        </div>
        
        <div className="md:space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 md:grid-cols-1">
          {/* Order Summary Card with enhanced styling */}
          <Card className="overflow-hidden shadow-sm mb-4 sm:mb-0">
            <CardHeader className="p-4 pb-2 bg-muted/30">
              <CardTitle className="text-sm sm:text-base font-medium flex flex-wrap items-center gap-2">
                <CreditCard className="h-4 w-4 mr-1 shrink-0" />
                <span className="shrink-0">{t("order_summary")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-2">
              <div className="space-y-3">

                {/* Items count */}
                <div className="flex justify-between text-xs sm:text-sm items-center">
                  <span>{t("items")}</span>
                  <span className="font-medium">
                    {order.items.reduce((count, item) => count + item.quantity, 0)}
                  </span>
                </div>

                {/* Shipping info */}
                <div className="flex justify-between text-xs sm:text-sm items-center">
                  <span>{t("shipping")}</span>
                  <Badge variant="outline" className="text-xs h-5 sm:h-6">
                    {t("free")}
                  </Badge>
                </div>

                {/* Payment method */}
                <div className="flex justify-between text-xs sm:text-sm items-center">
                  <span>{t("payment")}</span>
                  <span className="text-muted-foreground text-xs capitalize">
                    {t("cash_on_delivery")}
                  </span>
                </div>

                <Separator className="my-3" />
                
                {/* Total with price */}
                <div className="flex justify-between font-medium items-center">
                  <span className="text-xs sm:text-sm">{t("total")}</span>
                  <span className="text-sm sm:text-base text-primary font-semibold">
                    {order.total}
                    <span className="text-muted-foreground ml-1.5 text-xs">
                      ({order.items.reduce((total, item) => {
                        const itemTotal = parseFloat(item.subtotal || '0');
                        return total + (isNaN(itemTotal) ? 0 : itemTotal);
                      }, 0).toFixed(2)})
                    </span>
                  </span>
                </div>
                
                {/* Order date */}
                <div className="text-xs text-muted-foreground mt-2">
                  <CalendarDays className="h-3.5 w-3.5 inline-block mr-1.5" />
                  {formatDate(order.createdAt)}
                </div>
              </div>
            </CardContent>
          </Card>
          

        </div>
      </div>
    </div>
  );
}