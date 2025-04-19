import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  UserPlus,
  Mail,
  MapPin,
  ShoppingBag,
  DollarSign,
  Calendar,
  Filter,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import AdminLayout from "@/components/admin/admin-layout";
import { useTranslation } from "@/hooks/use-translation";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

// Define the customer type
interface Customer {
  id: number;
  username: string;
  email: string | null;
  role: string;
  totalOrders: number;
  totalSpent: string;
  lastOrder: string | null;
  defaultShippingAddressId: number | null;
}

export default function CustomersPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [currentTab, setCurrentTab] = useState("all");
  const pageSize = 10;
  
  // Fetch customers data
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/admin/customers'],
    queryFn: getQueryFn({ on401: 'throw' })
  });
  
  // Filter customers based on search query and role
  const filteredCustomers = customers.filter((customer) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = 
        customer.username.toLowerCase().includes(query) ||
        (customer.email && customer.email.toLowerCase().includes(query));
      
      if (!matches) return false;
    }
    
    // Role filter
    if (filterRole !== "all" && customer.role !== filterRole) {
      return false;
    }
    
    // Tab filter
    if (currentTab === "high-value" && parseFloat(customer.totalSpent) < 100) {
      return false;
    }
    
    if (currentTab === "no-orders" && customer.totalOrders > 0) {
      return false;
    }
    
    return true;
  });
  
  // Sort customers by username
  const sortedCustomers = [...filteredCustomers].sort((a, b) => 
    a.username.localeCompare(b.username)
  );
  
  // Paginate customers
  const totalPages = Math.ceil(sortedCustomers.length / pageSize);
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // Calculate stats
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce(
    (sum, customer) => sum + parseFloat(customer.totalSpent || "0"), 
    0
  );
  const averageSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const customersWithOrders = customers.filter(c => c.totalOrders > 0).length;
  const conversionRate = totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0;
  
  // Handle pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };
  
  // Generate initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent pb-1">{t("customers_management")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("manage_and_track_your_customer_base")}
          </p>
        </div>
        
        {/* Customer Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2 bg-gradient-to-br from-primary/20 to-primary/5">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                {t("total_customers")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary/90">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                {t("registered_users")}
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2 bg-gradient-to-br from-primary/20 to-primary/5">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                {t("customers_with_orders")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary/90">{customersWithOrders}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <span className="font-medium">{conversionRate.toFixed(1)}%</span> 
                <span className="ml-1">{t("conversion_rate")}</span>
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2 bg-gradient-to-br from-primary/20 to-primary/5">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                {t("average_spend")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary/90">{formatCurrency(averageSpent)}</div>
              <p className="text-xs text-muted-foreground">
                {t("per_customer")}
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2 bg-gradient-to-br from-primary/20 to-primary/5">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {t("lifetime_value")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary/90">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {t("total_customer_spend")}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Customer List */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-br from-primary/10 to-transparent">
            <CardTitle className="text-xl flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              {t("customers")}
            </CardTitle>
            <CardDescription>
              {t("view_and_manage_all_registered_customers")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <TabsList className="h-9 w-full sm:w-auto bg-primary/5 rounded-lg p-1">
                    <TabsTrigger value="all" className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-white">
                      {t("all_customers")}
                    </TabsTrigger>
                    <TabsTrigger value="high-value" className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-white">
                      {t("high_value")}
                    </TabsTrigger>
                    <TabsTrigger value="no-orders" className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-white">
                      {t("no_orders")}
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-auto">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-primary/70" />
                      <Input
                        type="search"
                        placeholder={t("search_customers")}
                        className="w-full rounded-lg border-primary/20 pl-8 md:w-[200px] lg:w-[300px] focus-visible:ring-primary/30"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="w-auto border-primary/20 focus:ring-primary/30">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-primary/70" />
                          <span className="hidden md:inline">{t("role")}: </span>
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("all_roles")}</SelectItem>
                        <SelectItem value="admin">{t("admin")}</SelectItem>
                        <SelectItem value="user">{t("user")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <ScrollArea className="rounded-md border border-primary/10 shadow-sm">
                  <Table>
                    <TableHeader className="bg-primary/5">
                      <TableRow className="hover:bg-primary/5">
                        <TableHead className="font-semibold">{t("customer")}</TableHead>
                        <TableHead className="font-semibold">{t("email")}</TableHead>
                        <TableHead className="hidden md:table-cell font-semibold">{t("role")}</TableHead>
                        <TableHead className="hidden md:table-cell font-semibold">{t("orders")}</TableHead>
                        <TableHead className="text-right font-semibold">{t("total_spent")}</TableHead>
                        <TableHead className="hidden lg:table-cell font-semibold">{t("last_order")}</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        // Loading skeleton
                        Array(5).fill(0).map((_, i) => (
                          <TableRow key={`skeleton-${i}`} className="hover:bg-primary/5">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-10" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                            <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                          </TableRow>
                        ))
                      ) : paginatedCustomers.length > 0 ? (
                        // Actual customer data
                        paginatedCustomers.map((customer) => (
                          <TableRow key={customer.id} className="hover:bg-primary/5 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border-2 border-primary/10">
                                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                                    {getInitials(customer.username)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-primary/90">{customer.username}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {customer.email ? (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3.5 w-3.5 text-primary/60" />
                                  <span>{customer.email}</span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs italic">Not provided</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant={customer.role === "admin" ? "default" : "outline"} className={customer.role === "admin" ? "bg-primary hover:bg-primary/90" : ""}>
                                {customer.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1">
                                <ShoppingBag className="h-3.5 w-3.5 text-primary/60" />
                                <span>{customer.totalOrders}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                {formatCurrency(customer.totalSpent)}
                              </span>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-primary/60" />
                                <span>{formatDate(customer.lastOrder)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10">
                                    <MoreHorizontal className="h-4 w-4 text-primary/70" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-primary/20 shadow-md">
                                  <DropdownMenuItem asChild className="focus:bg-primary/5 focus:text-primary">
                                    <a href={`/admin/customers/${customer.id}`} className="flex items-center">
                                      <ExternalLink className="mr-2 h-4 w-4 text-primary/70" /> {t("view_details")}
                                    </a>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        // No results
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            {searchQuery ? (
                              <div className="text-muted-foreground flex flex-col items-center gap-2">
                                <Search className="h-8 w-8 text-muted-foreground/50" />
                                {t("no_customers_match_search")}
                              </div>
                            ) : (
                              <div className="text-muted-foreground flex flex-col items-center gap-2">
                                <UserPlus className="h-8 w-8 text-muted-foreground/50" />
                                {t("no_customers_available")}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between py-6 mt-4 border-t border-primary/10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1 text-primary/70" />
                      <span>{t("previous")}</span>
                    </Button>
                    
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/5 rounded-lg">
                      <span className="text-sm text-muted-foreground">{t("page")}</span>
                      <span className="font-medium text-primary mx-1">{currentPage}</span>
                      <span className="text-sm text-muted-foreground">{t("of")}</span>
                      <span className="font-medium text-primary ml-1">{totalPages}</span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                    >
                      <span>{t("next")}</span>
                      <ChevronRight className="h-4 w-4 ml-1 text-primary/70" />
                    </Button>
                  </div>
                )}
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}