import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { CURRENCIES } from '@/contexts/currency-context';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChevronDown,
  Search,
  Package,
  Truck,
  Check,
  Clock,
  MoreHorizontal,
  Eye,
  ArrowUp,
  DollarSign,
  Inbox,
  AlertTriangle
} from "lucide-react";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/admin-layout";

// Define the Order interface
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
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export default function AdminOrdersPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  
  // Query to fetch all orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    queryFn: getQueryFn({ on401: 'returnNull' })
  });
  
  // Mutation to update order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest(
        'PATCH',
        `/api/admin/orders/${id}/status`,
        { status }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
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
    mutationFn: async ({ id, paymentStatus }: { id: number; paymentStatus: string }) => {
      const res = await apiRequest(
        'PATCH',
        `/api/admin/orders/${id}/payment-status`,
        { paymentStatus }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: t("order_updated"),
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
  
  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t("pending")}</Badge>;
      case "processing":
        return <Badge variant="secondary" className="flex items-center gap-1"><Package className="h-3 w-3" /> {t("processing")}</Badge>;
      case "shipped":
        return <Badge variant="default" className="flex items-center gap-1"><Truck className="h-3 w-3" /> {t("shipped")}</Badge>;
      case "delivered":
        return <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> {t("delivered")}</Badge>;
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
  
  // Filter orders by status and search query
  const filteredOrders = orders.filter(order => {
    // First filter by tab selection
    if (currentTab === "recent") {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Last 7 days
      if (new Date(order.createdAt) < cutoffDate) {
        return false;
      }
    } else if (currentTab === "pending" && order.status !== "pending") {
      return false;
    } else if (currentTab === "processing" && order.status !== "processing") {
      return false;
    } else if (currentTab === "shipped" && order.status !== "shipped") {
      return false;
    } else if (currentTab === "delivered" && order.status !== "delivered") {
      return false;
    }
    
    // Then filter by status dropdown if selected
    if (statusFilter && order.status !== statusFilter) {
      return false;
    }
    
    // Finally, filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.user?.username.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Sort orders by creation date (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Calculate total sales
  const totalSales = orders
    .filter(order => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  
  // Calculate pending orders count
  const pendingOrdersCount = orders.filter(order => order.status === "pending").length;
  
  // Calculate processing orders count
  const processingOrdersCount = orders.filter(order => order.status === "processing").length;
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("orders_management")}</h2>
          <p className="text-muted-foreground">
            {t("manage_and_track_customer_orders")}
          </p>
        </div>
        
        {/* Order Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                {t("total_sales")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                ر.ع {(totalSales * CURRENCIES.OMR.exchangeRate).toFixed(2)} (OMR)
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("from")} {orders.length} {t("orders")}
              </p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="pb-2 bg-gradient-to-br from-amber-100 to-amber-50">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                {t("pending_orders")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold flex items-center">
                {pendingOrdersCount}
                {pendingOrdersCount > 0 && (
                  <Badge variant="outline" className="ml-2 text-amber-500 border-amber-500">
                    {t("action_needed")}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("need_processing")}
              </p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="pb-2 bg-gradient-to-br from-blue-100 to-blue-50">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                {t("processing_orders")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {processingOrdersCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("awaiting_shipment")}
              </p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="pb-2 bg-gradient-to-br from-green-100 to-green-50">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-green-500" />
                {t("order_conversion")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === "delivered").length > 0 
                 ? Math.round((orders.filter(o => o.paymentStatus === "paid").length / orders.length) * 100) 
                 : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("payment_success_rate")}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Orders List */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-0">
            <CardTitle>{t("orders")}</CardTitle>
            <CardDescription>
              {t("view_and_manage_all_customer_orders")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <TabsList className="h-9 w-full sm:w-auto">
                    <TabsTrigger value="all" className="text-xs">{t("all_orders")}</TabsTrigger>
                    <TabsTrigger value="recent" className="text-xs">{t("recent")}</TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs">{t("pending")}</TabsTrigger>
                    <TabsTrigger value="processing" className="text-xs">{t("processing")}</TabsTrigger>
                    <TabsTrigger value="shipped" className="text-xs">{t("shipped")}</TabsTrigger>
                    <TabsTrigger value="delivered" className="text-xs">{t("delivered")}</TabsTrigger>
                  </TabsList>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t("search_orders")}
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <Select 
                      value={statusFilter || "all"} 
                      onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder={t("filter_by_status")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">{t("all_statuses")}</SelectItem>
                          <SelectItem value="pending">{t("pending")}</SelectItem>
                          <SelectItem value="processing">{t("processing")}</SelectItem>
                          <SelectItem value="shipped">{t("shipped")}</SelectItem>
                          <SelectItem value="delivered">{t("delivered")}</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="rounded-md border overflow-hidden overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">{t("order")}</TableHead>
                        <TableHead className="whitespace-nowrap">{t("customer")}</TableHead>
                        <TableHead className="whitespace-nowrap">{t("date")}</TableHead>
                        <TableHead className="whitespace-nowrap">{t("status")}</TableHead>
                        <TableHead className="whitespace-nowrap">{t("payment")}</TableHead>
                        <TableHead className="text-right whitespace-nowrap">{t("amount")}</TableHead>
                        <TableHead className="w-14"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : sortedOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center text-center">
                              <Inbox className="h-8 w-8 text-muted-foreground mb-2" />
                              <h3 className="font-medium text-base">{t("no_orders_found")}</h3>
                              <p className="text-sm text-muted-foreground">
                                {searchQuery || statusFilter
                                  ? t("try_adjusting_your_filters")
                                  : t("orders_will_appear_here")
                                }
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedOrders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                                <div className="font-medium">#{order.orderNumber}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {order.items.length} {t("items")}
                                </div>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {order.user?.username?.substring(0, 2).toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{order.user?.username || t("user")}</div>
                                  <div className="text-xs text-muted-foreground">{order.user?.email || ""}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(order.createdAt), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 p-0">
                                    <div className="flex items-center">
                                      {getStatusBadge(order.status)}
                                      <ChevronDown className="ml-1 h-4 w-4" />
                                    </div>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: "pending" })}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    {t("pending")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: "processing" })}>
                                    <Package className="mr-2 h-4 w-4" />
                                    {t("processing")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: "shipped" })}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    {t("shipped")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: "delivered" })}>
                                    <Check className="mr-2 h-4 w-4" />
                                    {t("delivered")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 p-0">
                                    <div className="flex items-center">
                                      {getPaymentStatusBadge(order.paymentStatus)}
                                      <ChevronDown className="ml-1 h-4 w-4" />
                                    </div>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem onClick={() => updatePaymentStatusMutation.mutate({ id: order.id, paymentStatus: "pending" })}>
                                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                                    {t("pending")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updatePaymentStatusMutation.mutate({ id: order.id, paymentStatus: "processing" })}>
                                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                                    {t("processing")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updatePaymentStatusMutation.mutate({ id: order.id, paymentStatus: "paid" })}>
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    {t("paid")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updatePaymentStatusMutation.mutate({ id: order.id, paymentStatus: "refunded" })}>
                                    <ArrowUp className="mr-2 h-4 w-4 text-red-500" />
                                    {t("refunded")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            <TableCell className="text-right font-medium whitespace-nowrap">
                              ر.ع {parseFloat(order.totalAmount) * CURRENCIES.OMR.exchangeRate} (OMR)
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/orders/${order.id}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      {t("view_details")}
                                    </Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Tabs>
            </div>
          </CardContent>
          
          {sortedOrders.length > 0 && (
            <CardFooter className="flex justify-between pt-0 pb-6 px-6">
              <div className="text-sm text-muted-foreground">
                {t("showing")} <span className="font-medium">{sortedOrders.length}</span> {t("of")} <span className="font-medium">{orders.length}</span> {t("orders")}
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}