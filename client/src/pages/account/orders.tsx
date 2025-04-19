import { Link } from "wouter";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ChevronRight, Package, Truck, Check, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getQueryFn } from "@/lib/queryClient";

// Define the Order and OrderItem types
interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  product: {
    id: number;
    name: string;
    price: string;
    imageUrl: string;
    [key: string]: any;
  };
}

interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  currency: string;
  paymentStatus: string;
  shippingMethod?: string;
  shippingCost?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  
  // Query to fetch orders from the server
  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    queryFn: getQueryFn({ on401: 'returnNull' })
  });

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <Check className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{t("my_orders")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("view_and_track_your_orders")}
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-3">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="rounded-full bg-muted p-2 mb-3">
                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium text-center mb-2">
                {t("no_orders_yet")}
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                {t("no_orders_message")}
              </p>
              <Button asChild size="sm">
                <Link href="/products">
                  {t("start_shopping")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-2 px-4 py-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <CardTitle className="text-sm">
                        {t("order")} #{order.orderNumber}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 py-3">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <div className="text-xs font-medium">{t("items")}: {order.items?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">
                          {t("total")}: {parseFloat(order.totalAmount).toFixed(2)} {order.currency}
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs px-3">
                        <Link href={`/account/orders/${order.id}`}>
                          <span>{t("view_order")}</span>
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="text-xs font-medium mb-2">{t("status_updates")}</div>
                      <div className={cn(
                        "flex justify-between text-xs",
                        isRtl && "flex-row-reverse"
                      )}>
                        <div className="flex items-center text-muted-foreground">
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{t(order.status)}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(order.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}