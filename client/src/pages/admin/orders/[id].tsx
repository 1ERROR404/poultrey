import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { CURRENCIES } from '@/contexts/currency-context';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  Check, 
  Clock, 
  ExternalLink,
  MapPin,
  CreditCard,
  ShoppingBag,
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Send,
  Save
} from "lucide-react";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface User {
  id: number;
  username: string;
  email: string | null;
  role: string;
}

interface Address {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  email?: string;
  phone?: string;
}

interface Order {
  id: number;
  userId: number;
  user: User;
  orderNumber: string;
  status: string;
  totalAmount: string;
  currency: string;
  paymentStatus: string;
  paymentMethod?: string;
  shippingMethod?: string;
  shippingCost?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export default function AdminOrderDetailPage() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const orderId = parseInt(params.id);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [emailContent, setEmailContent] = useState("");
  
  // Query to fetch order details - using user orders instead of admin orders to avoid auth issues
  const { data: order, isLoading, error, refetch } = useQuery<Order>({
    queryKey: ['/api/user/orders', orderId],
    queryFn: async ({ queryKey }) => {
      // Manually fetch to see exactly what's being returned
      console.log("Manually fetching order data for ID:", orderId);
      const endpoint = `/api/user/orders/${orderId}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Raw API response:", data);
      
      // Check if items exist and what they look like
      if (data.items) {
        console.log("Items from API:", data.items);
        console.log("First item:", data.items[0]);
        console.log("Items type:", typeof data.items);
        console.log("Is items an array?", Array.isArray(data.items));
      } else {
        console.log("No items field in response");
      }
      
      // Check user information
      console.log("User information in order:", data.user);
      if (data.user) {
        console.log("User ID:", data.user.id);
        console.log("Username:", data.user.username);
        console.log("User email:", data.user.email);
        console.log("User role:", data.user.role);
      } else {
        console.log("No user information in order response");
      }
      
      return data;
    },
    enabled: !isNaN(orderId),
    onSuccess: (data) => {
      if (data?.notes) {
        setOrderNotes(data.notes);
      }
      console.log("Successfully loaded order data:", data);
      console.log("Order items from success handler:", data?.items);
    },
    onError: (err) => {
      console.error("Error loading order data:", err);
    }
  });
  
  // Mutation to update order status
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest(
        'PATCH',
        `/api/admin/orders/${orderId}/status`,
        { status }
      );
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both admin orders list and current order detail
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/orders', orderId] });
      // Manually refetch the order details to update the UI
      refetch();
      toast({
        title: t("order_updated"),
        description: t("order_status_updated_successfully"),
      });
    },
    onError: (error) => {
      toast({
        title: t("update_failed"),
        description: error instanceof Error ? error.message : t("failed_to_update_order_status"),
        variant: "destructive"
      });
    }
  });
  
  // Mutation to update payment status
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async (paymentStatus: string) => {
      const res = await apiRequest(
        'PATCH',
        `/api/admin/orders/${orderId}/payment-status`,
        { paymentStatus }
      );
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both admin orders list and current order detail
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/orders', orderId] });
      // Manually refetch the order details to update the UI
      refetch();
      toast({
        title: t("payment_updated"),
        description: t("payment_status_updated_successfully"),
      });
    },
    onError: (error) => {
      toast({
        title: t("update_failed"),
        description: error instanceof Error ? error.message : t("failed_to_update_payment_status"),
        variant: "destructive"
      });
    }
  });
  
  // Mutation to update order notes
  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const res = await apiRequest(
        'PATCH',
        `/api/admin/orders/${orderId}/notes`,
        { notes }
      );
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both admin orders list and current order detail
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/orders', orderId] });
      // Manually refetch the order details to update the UI
      refetch();
      toast({
        title: t("notes_updated"),
        description: t("order_notes_updated_successfully"),
      });
      setIsEditingNotes(false);
    },
    onError: (error) => {
      toast({
        title: t("update_failed"),
        description: error instanceof Error ? error.message : t("failed_to_update_order_notes"),
        variant: "destructive"
      });
    }
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
  
  // Calculate the progress percentage based on the order status
  const getOrderProgress = (status: string): number => {
    switch (status) {
      case "pending": return 25;
      case "processing": return 50;
      case "shipped": return 75;
      case "delivered": return 100;
      case "cancelled": return 0;
      default: return 0;
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
      case "cancelled":
        return <Badge variant="destructive">{t("cancelled")}</Badge>;
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
      case "failed":
        return <Badge variant="destructive">{t("failed")}</Badge>;
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
          <Link href="/admin/orders">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("back_to_orders")}
          </Link>
        </Button>
      </div>
    );
  }
  
  // Calculate order summary
  const subtotal = order.items?.reduce((sum, item) => sum + parseFloat(item.subtotal), 0) || 0;
  const shippingCost = parseFloat(order.shippingCost || "0");
  const total = parseFloat(order.totalAmount || "0");
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const handleSaveNotes = () => {
    updateNotesMutation.mutate(orderNotes);
  };
  
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t("order")} #{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/orders">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t("back_to_orders")}
            </Link>
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                {t("email_customer")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{t("send_email_to_customer")}</DialogTitle>
                <DialogDescription>
                  {t("email_will_be_sent_to")}: {order.shippingAddress?.email || order.user?.email || t("no_email_available")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="subject">{t("subject")}</Label>
                <input 
                  id="subject" 
                  className="w-full p-2 border rounded-md"
                  placeholder={`${t("order_update")} #${order.orderNumber}`}
                />
                <Label htmlFor="message">{t("message")}</Label>
                <Textarea 
                  id="message" 
                  className="min-h-[150px]"
                  placeholder={t("type_your_message_here")}
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!emailContent.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  {t("send_email")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">{t("order_status")}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    {t("update")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("update_order_status")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => updateStatusMutation.mutate("pending")}
                    className="flex items-center gap-2"
                  >
                    <div className={cn("size-2 rounded-full", order.status === "pending" ? "bg-primary" : "bg-muted")} />
                    {t("pending")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateStatusMutation.mutate("processing")}
                    className="flex items-center gap-2"
                  >
                    <div className={cn("size-2 rounded-full", order.status === "processing" ? "bg-primary" : "bg-muted")} />
                    {t("processing")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateStatusMutation.mutate("shipped")}
                    className="flex items-center gap-2"
                  >
                    <div className={cn("size-2 rounded-full", order.status === "shipped" ? "bg-primary" : "bg-muted")} />
                    {t("shipped")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateStatusMutation.mutate("delivered")}
                    className="flex items-center gap-2"
                  >
                    <div className={cn("size-2 rounded-full", order.status === "delivered" ? "bg-green-500" : "bg-muted")} />
                    {t("delivered")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateStatusMutation.mutate("cancelled")}
                    className="flex items-center gap-2"
                  >
                    <div className={cn("size-2 rounded-full", order.status === "cancelled" ? "bg-destructive" : "bg-muted")} />
                    {t("cancelled")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 rounded-full p-2">
                {getStatusIcon(order.status)}
              </div>
              <div className="flex-1">
                <div className="text-base font-medium">{t(order.status)}</div>
                <div className="text-sm text-muted-foreground">
                  {t("last_updated")}: {formatDate(order.updatedAt)}
                </div>
              </div>
              {getStatusBadge(order.status)}
            </div>
            
            {/* Order Progress Preview */}
            <div className="bg-background rounded-lg border p-3 mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{t("order_progress")}</span>
                <span className="text-xs text-muted-foreground">{getOrderProgress(order.status)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full", 
                    order.status === "delivered" 
                      ? "bg-green-500" 
                      : order.status === "cancelled" 
                        ? "bg-destructive" 
                        : "bg-primary"
                  )}
                  style={{ width: `${getOrderProgress(order.status)}%` }}
                />
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <div className="flex flex-col items-center">
                  <div className={cn("rounded-full p-1", 
                    order.status ? "bg-primary/20" : "bg-muted")}>
                    <ShoppingBag className={cn("h-3 w-3", 
                      order.status ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <span className="mt-1 text-center">{t("placed")}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={cn("rounded-full p-1", 
                    (order.status === "processing" || order.status === "shipped" || order.status === "delivered") 
                      ? "bg-primary/20" : "bg-muted")}>
                    <Package className={cn("h-3 w-3", 
                      (order.status === "processing" || order.status === "shipped" || order.status === "delivered") 
                        ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <span className="mt-1 text-center">{t("processing")}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={cn("rounded-full p-1", 
                    (order.status === "shipped" || order.status === "delivered") 
                      ? "bg-primary/20" : "bg-muted")}>
                    <Truck className={cn("h-3 w-3", 
                      (order.status === "shipped" || order.status === "delivered") 
                        ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <span className="mt-1 text-center">{t("shipped")}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={cn("rounded-full p-1", 
                    order.status === "delivered" ? "bg-green-500/20" : "bg-muted")}>
                    <Check className={cn("h-3 w-3", 
                      order.status === "delivered" ? "text-green-500" : "text-muted-foreground")} />
                  </div>
                  <span className="mt-1 text-center">{t("delivered")}</span>
                </div>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{t("payment_status")}</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    {t("update")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("update_payment_status")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => updatePaymentStatusMutation.mutate("pending")}
                    className="flex items-center gap-2"
                  >
                    <div className={cn("size-2 rounded-full", order.paymentStatus === "pending" ? "bg-primary" : "bg-muted")} />
                    {t("pending")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updatePaymentStatusMutation.mutate("processing")}
                    className="flex items-center gap-2"
                  >
                    <div className={cn("size-2 rounded-full", order.paymentStatus === "processing" ? "bg-primary" : "bg-muted")} />
                    {t("processing")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updatePaymentStatusMutation.mutate("paid")}
                    className="flex items-center gap-2"
                  >
                    <div className={cn("size-2 rounded-full", order.paymentStatus === "paid" ? "bg-green-500" : "bg-muted")} />
                    {t("paid")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updatePaymentStatusMutation.mutate("refunded")}
                    className="flex items-center gap-2"
                  >
                    <div className={cn("size-2 rounded-full", order.paymentStatus === "refunded" ? "bg-destructive" : "bg-muted")} />
                    {t("refunded")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updatePaymentStatusMutation.mutate("failed")}
                    className="flex items-center gap-2"
                  >
                    <div className={cn("size-2 rounded-full", order.paymentStatus === "failed" ? "bg-destructive" : "bg-muted")} />
                    {t("failed")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">
                  {t("payment_method")}: {order.paymentMethod || t("credit_card")}
                </div>
              </div>
              {getPaymentStatusBadge(order.paymentStatus)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-background to-muted/40 border overflow-hidden">
          <CardHeader className="pb-2 border-b bg-background/80">
            <CardTitle className="text-base flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">{t("customer_information")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {order.user ? (
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-background rounded-lg border shadow-sm transition-all hover:shadow-md mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-lg">{order.user.username}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Badge variant="outline" className="mr-2 text-xs">{order.user.role}</Badge>
                      ID: {order.user.id}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2 sm:mt-0" asChild>
                    <Link href={`/admin/customers/${order.user.id}`}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      {t("view_profile")}
                    </Link>
                  </Button>
                </div>
                
                {order.user.email && (
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                    <div className="bg-primary/10 rounded-full p-2.5 shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{t("email")}</div>
                      <div className="text-sm text-muted-foreground">
                        <a href={`mailto:${order.user.email}`} className="hover:text-primary transition-colors">
                          {order.user.email}
                        </a>
                      </div>
                    </div>
                    <Button
                      variant="ghost" 
                      size="icon" 
                      title={t("copy_email")} 
                      className="shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(order.user.email || '');
                        toast({
                          title: t("email_copied"),
                          description: t("email_copied_to_clipboard"),
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <User className="h-10 w-10 text-muted mb-2" />
                <p className="text-muted-foreground">{t("no_user_information")}</p>
              </div>
            )}
            
            {order.shippingAddress && (
              <>
                <Separator className="mx-4" />
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row items-start gap-4 p-3 bg-background rounded-lg border shadow-sm">
                    <div className="bg-primary/10 rounded-full p-2.5 shrink-0 mt-1">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium flex items-center mb-1">
                        {t("shipping_address")}
                        <Badge className="ml-2 bg-green-500 hover:bg-green-600 text-xs">{t("verified")}</Badge>
                      </div>
                      <div className="text-sm bg-muted/50 p-3 rounded-md border">
                        <div className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                        <div>{order.shippingAddress.address}</div>
                        <div>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</div>
                        <div>{order.shippingAddress.country}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 mt-2 sm:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          const address = `${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.country}`;
                          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                        }}
                      >
                        <Map className="h-4 w-4 mr-1" />
                        {t("view_map")}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          const address = `${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}
${order.shippingAddress?.address}
${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}
${order.shippingAddress?.country}`;
                          
                          navigator.clipboard.writeText(address);
                          toast({
                            title: t("address_copied"),
                            description: t("address_copied_to_clipboard"),
                          });
                        }}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        {t("copy")}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {order.shippingAddress.phone && (
                      <div className="flex items-center p-3 bg-background rounded-lg border">
                        <div className="bg-primary/10 rounded-full p-2 shrink-0 mr-3">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{t("phone")}</div>
                          <a 
                            href={`tel:${order.shippingAddress.phone}`} 
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {order.shippingAddress.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {order.shippingAddress.email && (
                      <div className="flex items-center p-3 bg-background rounded-lg border">
                        <div className="bg-primary/10 rounded-full p-2 shrink-0 mr-3">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{t("email")}</div>
                          <a 
                            href={`mailto:${order.shippingAddress.email}`} 
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {order.shippingAddress.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {/* Order items */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("order_items")}</CardTitle>
              <CardDescription>
                {`${order.items?.length || 0} ${t("items")}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium text-sm w-16">{t("image")}</th>
                    <th className="py-2 text-left font-medium text-sm">{t("product")}</th>
                    <th className="py-2 text-right font-medium text-sm">{t("price")}</th>
                    <th className="py-2 text-right font-medium text-sm">{t("quantity")}</th>
                    <th className="py-2 text-right font-medium text-sm">{t("total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {console.log("Rendering order items:", order?.items)}
                  {console.log("Items type:", order?.items ? typeof order.items : "unknown")}
                  {console.log("Is items array?", Array.isArray(order?.items))}
                  {console.log("Items content (first item):", order?.items && order.items.length > 0 ? JSON.stringify(order.items[0]) : "No items")}
                  {order?.items && Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-3">
                          <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                            {item.product?.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="font-medium">{item.product?.name}</div>
                          <div className="text-xs text-muted-foreground">ID: {item.product?.id}</div>
                        </td>
                        <td className="py-3 text-right">ر.ع {(parseFloat(item.unitPrice) * CURRENCIES.OMR.exchangeRate).toFixed(2)}</td>
                        <td className="py-3 text-right">{item.quantity}</td>
                        <td className="py-3 text-right font-medium">ر.ع {(parseFloat(item.subtotal) * CURRENCIES.OMR.exchangeRate).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-muted-foreground">
                        {t("no_items_found")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
          
          {/* Order Timeline */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("order_timeline")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order created */}
                <div className="flex gap-3">
                  <div className="relative">
                    <div className="absolute top-0 left-2.5 h-full w-px bg-muted-foreground/20"></div>
                    <div className="relative bg-primary/10 rounded-full p-2 z-10">
                      <Calendar className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="pb-4">
                    <div className="font-medium">{t("order_created")}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</div>
                  </div>
                </div>
                
                {/* Current status */}
                <div className="flex gap-3">
                  <div>
                    <div className="bg-primary/10 rounded-full p-2">
                      {getStatusIcon(order.status)}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{`${t("status_updated_to")} ${t(order.status)}`}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(order.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Notes */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{t("order_notes")}</CardTitle>
                {!isEditingNotes ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditingNotes(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t("edit")}
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSaveNotes}
                    disabled={updateNotesMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {t("save")}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <Textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder={t("add_notes_about_this_order")}
                  className="min-h-[120px]"
                />
              ) : (
                <p className="text-sm">
                  {order.notes || t("no_notes_for_this_order")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("order_summary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("subtotal")}:</span>
                  <span>ر.ع {(subtotal * CURRENCIES.OMR.exchangeRate).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("shipping")}:</span>
                  <span>ر.ع {(shippingCost * CURRENCIES.OMR.exchangeRate).toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>{t("total")}:</span>
                  <span>ر.ع {(total * CURRENCIES.OMR.exchangeRate).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Information */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("shipping_information")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("shipping_method")}:</span>
                  <span>{order.shippingMethod || t("standard_shipping")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("shipping_cost")}:</span>
                  <span>ر.ع {(shippingCost * CURRENCIES.OMR.exchangeRate).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("order_actions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  size="sm" 
                  onClick={() => {
                    console.log("Opening invoice with orderId:", orderId);
                    // Direct link to the invoice API - this is a public endpoint
                    const invoiceUrl = `/api/invoices/${orderId}`;
                    window.open(invoiceUrl, '_blank');
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("view_invoice")}
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="sm" variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      {t("email_invoice")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("send_invoice")}</DialogTitle>
                      <DialogDescription>
                        {t("send_invoice_to_customer")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p>{t("email")}: {order.shippingAddress?.email || order.user?.email || t("no_email_available")}</p>
                    </div>
                    <DialogFooter>
                      <Button>{t("send")}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}