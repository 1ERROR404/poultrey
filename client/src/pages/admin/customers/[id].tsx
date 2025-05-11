import React, { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Mail,
  MapPin,
  ShoppingBag,
  Calendar,
  ChevronLeft,
  Phone,
  CreditCard,
  Shield,
  ClipboardList,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define types
interface CustomerDetails {
  id: number;
  username: string;
  email: string | null;
  role: string;
  defaultShippingAddressId: number | null;
  totalOrders: number;
  totalSpent: string;
  lastOrder: string | null;
  orders: Order[];
  addresses: Address[];
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  paymentStatus: string;
  currency: string;
}

interface Address {
  id: number;
  userId: number;
  fullName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefault: boolean;
}

export default function CustomerDetailsPage() {
  // Hook declarations - Put all hooks together at the top
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const customerId = parseInt(params.id);
  const [currentTab, setCurrentTab] = useState("overview");
  
  // Customer edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<{
    username: string;
    email: string | null;
    role: string;
  } | null>(null);
  
  // Address dialog state
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // All mutation hooks must be declared at the top level, before any conditionals
  // Mutation for updating customer
  const updateCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PATCH', `/api/admin/customers/${customerId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/customers', customerId] });
      toast({
        title: t("customer_updated"),
        description: t("customer_updated_successfully"),
      });
      setEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("update_failed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for adding address
  const addAddressMutation = useMutation({
    mutationFn: async (data: any) => {
      // Remove createdAt and id to prevent issues
      const { createdAt, ...addressData } = data;
      const res = await apiRequest('POST', `/api/admin/customers/${customerId}/addresses`, addressData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/customers', customerId] });
      toast({
        title: t("address_added"),
        description: t("address_added_successfully"),
      });
      setAddressDialogOpen(false);
      setEditingAddress(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("add_failed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating address
  const updateAddressMutation = useMutation({
    mutationFn: async ({ addressId, data }: { addressId: number, data: any }) => {
      // Remove createdAt and id from the data to prevent issues
      const { createdAt, id, ...addressData } = data;
      const res = await apiRequest('PATCH', `/api/admin/customers/${customerId}/addresses/${addressId}`, addressData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/customers', customerId] });
      toast({
        title: t("address_updated"),
        description: t("address_updated_successfully"),
      });
      setAddressDialogOpen(false);
      setEditingAddress(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("update_failed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for deleting address
  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: number) => {
      await apiRequest('DELETE', `/api/admin/customers/${customerId}/addresses/${addressId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/customers', customerId] });
      toast({
        title: t("address_deleted"),
        description: t("address_deleted_successfully"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("delete_failed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Fetch user auth status first
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const res = await fetch('/api/user', { credentials: 'include' });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error('Failed to fetch user');
      return await res.json();
    },
  });

  // Fetch customer details
  const { data: customer, isLoading, error } = useQuery<CustomerDetails>({
    queryKey: ['/api/admin/customers', customerId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/customers/${customerId}`, { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error('Failed to fetch customer details');
      }
      return await res.json();
    },
    enabled: !isNaN(customerId) && !!user,
    retry: 3,
    retryDelay: 1000,
  });
  
  // Helper functions for safely accessing potentially undefined data
  const safeOrders = (customer: CustomerDetails | undefined) => {
    return customer?.orders || [];
  };
  
  const safeAddresses = (customer: CustomerDetails | undefined) => {
    return customer?.addresses || [];
  };
  
  // Helper for safely checking orders length
  const hasOrders = (customer: CustomerDetails | undefined) => {
    return safeOrders(customer).length > 0;
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }
  
  if (error || !customer) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h2 className="text-2xl font-bold mb-4">{t("customer_not_found")}</h2>
          <p className="text-muted-foreground mb-6">
            {t("customer_not_found_message")}
          </p>
          <Button asChild>
            <a href="/admin/customers">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t("back_to_customers")}
            </a>
          </Button>
        </div>
      </AdminLayout>
    );
  }
  
  const formatCurrency = (value: string | number, currency: string = "USD") => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };
  
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };
  
  // Generate initials from username
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'; // Default initial if name is not available
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get address by ID
  const getAddressById = (id: number | null) => {
    if (!id || !customer?.addresses) return null;
    return safeAddresses(customer).find(addr => addr.id === id) || null;
  };
  
  // Get default shipping address
  const defaultAddress = getAddressById(customer.defaultShippingAddressId);
  
  // Countries list for dropdown
  const countries = [
    "United Arab Emirates",
    "Oman",
    "Saudi Arabia",
    "Kuwait",
    "Qatar",
    "Bahrain",
    "United States",
    "United Kingdom"
  ];
  
  // Handle opening edit customer dialog
  const handleEditCustomer = () => {
    setEditingCustomer({
      username: customer.username,
      email: customer.email,
      role: customer.role,
    });
    setEditDialogOpen(true);
  };
  
  // Handle opening add/edit address dialog
  const handleAddressDialog = (address: Address | null = null) => {
    setEditingAddress(address);
    setAddressDialogOpen(true);
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back button and header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="outline" size="sm" asChild className="mb-2">
              <a href="/admin/customers">
                <ChevronLeft className="mr-2 h-4 w-4" />
                {t("back_to_customers")}
              </a>
            </Button>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(customer.username)}
                </AvatarFallback>
              </Avatar>
              {customer.username}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground mt-1">
              <Badge 
                variant={customer.role === "admin" ? "default" : "outline"}
                className="bg-gradient-to-r from-primary/80 to-primary font-medium"
              >
                {customer.role}
              </Badge>
              {customer.email && (
                <span className="text-sm flex items-center gap-1 bg-secondary/30 px-2 py-1 rounded-md">
                  <Mail className="h-3 w-3" />
                  {customer.email}
                </span>
              )}
              <span className="text-sm flex items-center gap-1 bg-secondary/30 px-2 py-1 rounded-md">
                <Calendar className="h-3 w-3" />
                {t("customer_id")}: #{customer.id}
              </span>
            </div>
          </div>
        </div>
        
        {/* Customer Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                {t("orders_placed")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customer.totalOrders}</div>
              {customer.lastOrder && (
                <p className="text-xs text-muted-foreground">
                  {t("last_order")}: {formatDate(customer.lastOrder)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {t("total_spent")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(customer.totalSpent)}</div>
              <p className="text-xs text-muted-foreground">
                {t("lifetime_value")}
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t("customer_since")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customer.orders && customer.orders.length > 0 
                  ? formatDate(customer.orders[customer.orders.length - 1].createdAt) 
                  : t("no_orders")}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("account_age")}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for different sections */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
            <TabsTrigger value="orders">{t("orders")}</TabsTrigger>
            <TabsTrigger value="addresses">{t("addresses")}</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Customer Information */}
              <Card>
                <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{t("customer_information")}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={handleEditCustomer} className="h-8 px-2">
                      <Edit className="h-4 w-4 mr-1" />
                      {t("edit")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{t("username")}</p>
                      <p className="text-sm text-muted-foreground">{customer.username}</p>
                    </div>
                  </div>
                  {customer.email && (
                    <div className="flex items-start space-x-4">
                      <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{t("email")}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-4">
                    <ShoppingBag className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{t("total_orders")}</p>
                      <p className="text-sm text-muted-foreground">{customer.totalOrders}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{t("total_spent")}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(customer.totalSpent)}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{t("registered_date")}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.createdAt ? formatDate(customer.createdAt) : t("not_available")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{t("account_status")}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {t("active")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Default Shipping Address */}
              <Card>
                <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t("default_shipping_address")}
                    </CardTitle>
                    {defaultAddress ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAddressDialog(defaultAddress)} 
                        className="h-8 px-2"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {t("edit")}
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAddressDialog(null)} 
                        className="h-8 px-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t("add")}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {defaultAddress ? (
                    <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20 shadow-sm">
                      <div className="space-y-3">
                        <div className="flex items-center border-b border-secondary/20 pb-2">
                          <User className="h-4 w-4 text-primary mr-2" />
                          <p className="text-sm font-medium">
                            {defaultAddress.firstName && defaultAddress.lastName 
                              ? `${defaultAddress.firstName} ${defaultAddress.lastName}`
                              : defaultAddress.fullName || t("name_not_provided")}
                          </p>
                          <Badge variant="outline" className="ml-auto bg-primary/5 text-primary text-xs">
                            {t("default")}
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1 pl-1">
                          <p>{defaultAddress.addressLine1}</p>
                          {defaultAddress.addressLine2 && <p>{defaultAddress.addressLine2}</p>}
                          <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}</p>
                          <p className="font-medium">{defaultAddress.country}</p>
                        </div>
                        <div className="flex items-center border-t border-secondary/20 pt-2 mt-2">
                          <Phone className="h-4 w-4 text-primary mr-2" />
                          <p className="text-sm">{defaultAddress.phone || defaultAddress.phoneNumber || t("no_phone")}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-secondary/5 rounded-lg border border-dashed border-secondary/20">
                      <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-sm font-medium">{t("no_default_address")}</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                        {t("no_default_address_message")}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4" 
                        onClick={() => handleAddressDialog(null)}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        {t("add_address")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Orders */}
            <Card>
              <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  {t("recent_orders")}
                </CardTitle>
                <CardDescription>
                  {t("most_recent_orders_from_this_customer")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasOrders(customer) ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("order_number")}</TableHead>
                        <TableHead>{t("date")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead>{t("payment")}</TableHead>
                        <TableHead className="text-right">{t("total")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeOrders(customer).slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            <a href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                              #{order.orderNumber}
                            </a>
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                order.status === "delivered" ? "default" :
                                order.status === "cancelled" ? "destructive" :
                                "outline"
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                order.paymentStatus === "paid" ? "default" :
                                order.paymentStatus === "failed" ? "destructive" :
                                "outline"
                              }
                            >
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(order.totalAmount, order.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-sm font-medium">{t("no_orders_yet")}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("customer_has_not_placed_any_orders")}
                    </p>
                  </div>
                )}
              </CardContent>
              {safeOrders(customer).length > 5 && (
                <CardFooter className="justify-center">
                  <Button variant="outline" size="sm" onClick={() => setCurrentTab("orders")}>
                    {t("view_all_orders")}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  {t("order_history")}
                </CardTitle>
                <CardDescription>
                  {t("complete_order_history_for_this_customer")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {safeOrders(customer).length > 0 ? (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("order_number")}</TableHead>
                          <TableHead>{t("date")}</TableHead>
                          <TableHead>{t("status")}</TableHead>
                          <TableHead>{t("payment")}</TableHead>
                          <TableHead className="text-right">{t("total")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {safeOrders(customer).map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              <a href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                                #{order.orderNumber}
                              </a>
                            </TableCell>
                            <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  order.status === "delivered" ? "default" :
                                  order.status === "cancelled" ? "destructive" :
                                  "outline"
                                }
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  order.paymentStatus === "paid" ? "default" :
                                  order.paymentStatus === "failed" ? "destructive" :
                                  "outline"
                                }
                              >
                                {order.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(order.totalAmount, order.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-6">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-sm font-medium">{t("no_orders_yet")}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("customer_has_not_placed_any_orders")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-4">
            <Card>
              <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t("saved_addresses")}
                    </CardTitle>
                    <CardDescription>
                      {t("customer_shipping_and_billing_addresses")}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAddressDialog(null)}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t("add_new_address")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {safeAddresses(customer).length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {safeAddresses(customer).map((address) => (
                      <Card key={address.id} className={`overflow-hidden transition-all hover:shadow-md ${
                        address.id === customer.defaultShippingAddressId
                          ? "border-primary/50 shadow-md bg-primary/5"
                          : "hover:border-primary/30"
                      }`}>
                        <CardHeader className="pb-2 bg-gradient-to-r from-secondary/10 to-transparent">
                          <CardTitle className="text-base flex justify-between items-center">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3 text-primary" />
                              {address.firstName && address.lastName 
                                ? `${address.firstName} ${address.lastName}`
                                : address.fullName || t("name_not_provided")}
                            </span>
                            {address.id === customer.defaultShippingAddressId && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                {t("default")}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {address.phone || address.phoneNumber || t("no_phone")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                          <div className="flex gap-1 items-start">
                            <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground" />
                            <div>
                              <p>{address.addressLine1}</p>
                              {address.addressLine2 && <p>{address.addressLine2}</p>}
                              <p>{address.city}, {address.state} {address.postalCode}</p>
                              <p className="font-medium">{address.country}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="justify-end gap-2 pt-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleAddressDialog(address)}
                            className="h-7 px-2 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            {t("edit")}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              if (confirm(t("confirm_delete_address"))) {
                                deleteAddressMutation.mutate(address.id);
                              }
                            }}
                            className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            {t("delete")}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-sm font-medium">{t("no_saved_addresses")}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("customer_has_not_saved_any_addresses")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("edit_customer")}</DialogTitle>
            <DialogDescription>
              {t("update_customer_information")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                value={editingCustomer?.username || ""}
                onChange={(e) => 
                  setEditingCustomer(prev => prev ? { ...prev, username: e.target.value } : null)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email_address")}</Label>
              <Input
                id="email"
                type="email"
                value={editingCustomer?.email || ""}
                onChange={(e) => 
                  setEditingCustomer(prev => prev ? { ...prev, email: e.target.value } : null)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t("role")}</Label>
              <Select
                value={editingCustomer?.role || "customer"}
                onValueChange={(value) => 
                  setEditingCustomer(prev => prev ? { ...prev, role: value } : null)
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder={t("select_role")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t("admin")}</SelectItem>
                  <SelectItem value="customer">{t("customer")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button 
              type="submit" 
              onClick={() => {
                if (editingCustomer) {
                  updateCustomerMutation.mutate(editingCustomer);
                }
              }}
              disabled={updateCustomerMutation.isPending}
            >
              {updateCustomerMutation.isPending ? (
                <><span className="mr-2">{t("saving")}</span><span className="animate-spin">⟳</span></>
              ) : (
                <>{t("save_changes")}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? t("edit_address") : t("add_new_address")}
            </DialogTitle>
            <DialogDescription>
              {editingAddress ? t("update_shipping_address") : t("add_new_shipping_address")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t("first_name")}</Label>
                <Input
                  id="firstName"
                  value={editingAddress?.firstName || editingAddress?.fullName?.split(' ')[0] || ""}
                  onChange={(e) => 
                    setEditingAddress(prev => prev ? 
                      { ...prev, firstName: e.target.value } : 
                      { 
                        id: 0, 
                        userId: customerId, 
                        firstName: e.target.value,
                        lastName: "",
                        addressLine1: "",
                        addressLine2: "",
                        city: "",
                        state: "",
                        postalCode: "",
                        country: countries[0],
                        phone: "",
                        isDefault: false
                      }
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastName">{t("last_name")}</Label>
                <Input
                  id="lastName"
                  value={editingAddress?.lastName || editingAddress?.fullName?.split(' ').slice(1).join(' ') || ""}
                  onChange={(e) => 
                    setEditingAddress(prev => prev ? { ...prev, lastName: e.target.value } : null)
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="phone">{t("phone_number")}</Label>
                <Input
                  id="phone"
                  value={editingAddress?.phone || editingAddress?.phoneNumber || ""}
                  onChange={(e) => 
                    setEditingAddress(prev => prev ? { 
                      ...prev, 
                      phone: e.target.value,
                      // Also set phoneNumber for backward compatibility
                      phoneNumber: e.target.value 
                    } : null)
                  }
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="addressLine1">{t("address_line_1")}</Label>
              <Input
                id="addressLine1"
                value={editingAddress?.addressLine1 || ""}
                onChange={(e) => 
                  setEditingAddress(prev => prev ? { ...prev, addressLine1: e.target.value } : null)
                }
              />
            </div>
            
            <div>
              <Label htmlFor="addressLine2">{t("address_line_2")} ({t("optional")})</Label>
              <Input
                id="addressLine2"
                value={editingAddress?.addressLine2 || ""}
                onChange={(e) => 
                  setEditingAddress(prev => prev ? { ...prev, addressLine2: e.target.value } : null)
                }
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">{t("city")}</Label>
                <Input
                  id="city"
                  value={editingAddress?.city || ""}
                  onChange={(e) => 
                    setEditingAddress(prev => prev ? { ...prev, city: e.target.value } : null)
                  }
                />
              </div>
              <div>
                <Label htmlFor="state">{t("state_province")}</Label>
                <Input
                  id="state"
                  value={editingAddress?.state || ""}
                  onChange={(e) => 
                    setEditingAddress(prev => prev ? { ...prev, state: e.target.value } : null)
                  }
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">{t("postal_code")}</Label>
                <Input
                  id="postalCode"
                  value={editingAddress?.postalCode || ""}
                  onChange={(e) => 
                    setEditingAddress(prev => prev ? { ...prev, postalCode: e.target.value } : null)
                  }
                />
              </div>
              <div>
                <Label htmlFor="country">{t("country")}</Label>
                <Select
                  value={editingAddress?.country || countries[0]}
                  onValueChange={(value) => 
                    setEditingAddress(prev => prev ? { ...prev, country: value } : null)
                  }
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder={t("select_country")} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isDefault" 
                checked={editingAddress?.isDefault || false}
                onCheckedChange={(checked) => 
                  setEditingAddress(prev => prev ? { ...prev, isDefault: checked } : null)
                }
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                {t("set_as_default_address")}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setAddressDialogOpen(false);
              setEditingAddress(null);
            }}>
              {t("cancel")}
            </Button>
            <Button 
              type="submit" 
              onClick={() => {
                if (editingAddress) {
                  if (editingAddress.id) {
                    // Update existing address
                    updateAddressMutation.mutate({
                      addressId: editingAddress.id,
                      data: editingAddress
                    });
                  } else {
                    // Create new address
                    addAddressMutation.mutate(editingAddress);
                  }
                }
              }}
              disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
            >
              {addAddressMutation.isPending || updateAddressMutation.isPending ? (
                <><span className="mr-2">{t("saving")}</span><span className="animate-spin">⟳</span></>
              ) : editingAddress?.id ? (
                <>{t("update_address")}</>
              ) : (
                <>{t("add_address")}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}