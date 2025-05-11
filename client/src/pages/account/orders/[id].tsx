import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  Check, 
  Clock, 
  ExternalLink,
  MapPin,
  CreditCard,
  ShoppingBag
} from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

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
    slug: string;
    [key: string]: any;
  };
}

interface Address {
  id: number;
  userId: number;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
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
  shippingAddressId?: number;
  billingAddressId?: number;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const params = useParams<{ id: string }>();
  const orderId = parseInt(params.id);
  
  // Query to fetch order details
  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['/api/orders', orderId],
    queryFn: getQueryFn(),
    enabled: !isNaN(orderId)
  });
  
  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "processing":
        return <Package className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <Check className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
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
  
  // Function to get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">{t("pending")}</Badge>;
      case "processing":
        return <Badge variant="secondary">{t("processing")}</Badge>;
      case "paid":
        return <Badge className="bg-green-500 hover:bg-green-600">{t("paid")}</Badge>;
      case "refunded":
        return <Badge variant="destructive">{t("refunded")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="text-center py-10">
        <h2 className="text-lg font-semibold mb-2">{t("order_not_found")}</h2>
        <p className="text-muted-foreground mb-4">{t("order_not_found_message")}</p>
        <Button asChild>
          <Link href="/account/orders">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("back_to_orders")}
          </Link>
        </Button>
      </div>
    );
  }
  
  // Calculate order summary
  const subtotal = order.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  const shippingCost = parseFloat(order.shippingCost || "0");
  const total = parseFloat(order.totalAmount);
  
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t("order")} #{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/account/orders">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("back_to_orders")}
          </Link>
        </Button>
      </div>
      
      <Separator />
      
      <div className="grid md:grid-cols-3 gap-5">
        {/* Order status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("order_status")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              {getStatusIcon(order.status)}
              <div className="flex-1">
                <div className="font-medium">{t(order.status)}</div>
                <div className="text-xs text-muted-foreground">
                  {t("last_updated")}: {new Date(order.updatedAt).toLocaleDateString()}
                </div>
              </div>
              {getStatusBadge(order.status)}
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <div className="flex-1">
                <div className="font-medium">{t("payment")}</div>
                <div className="text-xs text-muted-foreground">
                  {t("payment_method")}: {t("credit_card")}
                </div>
              </div>
              {getPaymentStatusBadge(order.paymentStatus)}
            </div>
          </CardContent>
        </Card>
        
        {/* Shipping info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("shipping_info")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 mt-0.5" />
              <div>
                <div className="font-medium">{t("shipping_address")}</div>
                <div className="text-sm text-muted-foreground">
                  {order.shippingAddress ? (
                    <>
                      <div>{order.shippingAddress.name}</div>
                      <div>{order.shippingAddress.street}</div>
                      <div>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</div>
                      <div>{order.shippingAddress.country}</div>
                    </>
                  ) : (
                    <div className="italic">{t("no_shipping_address")}</div>
                  )}
                </div>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              <div>
                <div className="font-medium">{t("shipping_method")}</div>
                <div className="text-sm text-muted-foreground">
                  {order.shippingMethod || t("standard_shipping")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Order summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("order_summary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("subtotal")}:</span>
                <span>{subtotal.toFixed(2)} {order.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("shipping")}:</span>
                <span>{shippingCost.toFixed(2)} {order.currency}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>{t("total")}:</span>
                <span>{total.toFixed(2)} {order.currency}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Order items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("order_items")}</CardTitle>
          <CardDescription>
            {t("items_count", { count: order.items.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="relative w-20 h-20 bg-muted rounded overflow-hidden">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <h4 className="font-medium text-base">
                      {item.product.name}
                    </h4>
                    <div className="text-sm font-medium">
                      {parseFloat(item.subtotal).toFixed(2)} {order.currency}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    <span>{parseFloat(item.unitPrice).toFixed(2)} {order.currency}</span>
                    <span className="mx-1">×</span>
                    <span>{item.quantity}</span>
                  </div>
                  <Button asChild variant="link" size="sm" className="p-0 h-auto text-sm">
                    <Link href={`/products/${item.product.slug}`}>
                      {t("view_product")}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Notes */}
      {order.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("order_notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}