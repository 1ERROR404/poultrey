import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Clock,
  CreditCard,
  BarChart3,
  PieChart as PieChartIcon,
  Share2,
  CircleUser,
  Layers,
  Settings,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { SectionHeader } from "@/components/admin/section-header";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Mock data for demonstration
const overviewData = {
  salesTotal: "$12,345.00",
  salesDelta: 12,
  ordersTotal: "123",
  ordersDelta: 8,
  customersTotal: "1,234",
  customersDelta: 15,
  productsTotal: "45",
  productsDelta: -3,
};

const salesData = [
  { name: "Jan", total: 1200 },
  { name: "Feb", total: 1600 },
  { name: "Mar", total: 1900 },
  { name: "Apr", total: 2200 },
  { name: "May", total: 2500 },
  { name: "Jun", total: 2100 },
  { name: "Jul", total: 2400 },
  { name: "Aug", total: 2800 },
  { name: "Sep", total: 3200 },
  { name: "Oct", total: 3500 },
  { name: "Nov", total: 3800 },
  { name: "Dec", total: 4200 },
];

const recentOrdersData = [
  {
    id: 1,
    orderNumber: "ORD-2023-1001",
    customer: "Mohammed Ali",
    status: "processing",
    total: "$249.99",
    date: "2025-04-09T14:30:00Z",
  },
  {
    id: 2,
    orderNumber: "ORD-2023-1002",
    customer: "Sara Ahmed",
    status: "shipped",
    total: "$89.50",
    date: "2025-04-08T10:15:00Z",
  },
  {
    id: 3,
    orderNumber: "ORD-2023-1003",
    customer: "John Doe",
    status: "delivered",
    total: "$125.75",
    date: "2025-04-07T16:45:00Z",
  },
  {
    id: 4,
    orderNumber: "ORD-2023-1004",
    customer: "Fatima Hassan",
    status: "pending",
    total: "$349.99",
    date: "2025-04-06T09:20:00Z",
  },
  {
    id: 5,
    orderNumber: "ORD-2023-1005",
    customer: "David Smith",
    status: "cancelled",
    total: "$72.50",
    date: "2025-04-05T13:10:00Z",
  },
];

const topProductsData = [
  { name: "Automatic Chicken Feeder", value: 35 },
  { name: "Premium Watering System", value: 25 },
  { name: "Portable Chicken Coop", value: 20 },
  { name: "Heated Water Bowl", value: 15 },
  { name: "Other", value: 5 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const topCustomersData = [
  {
    id: 1,
    name: "Mohammed Ali",
    email: "mohammed.ali@example.com",
    orders: 12,
    spent: "$1,245.50",
    lastOrder: "2025-04-09T14:30:00Z",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    email: "sara.ahmed@example.com",
    orders: 8,
    spent: "$945.75",
    lastOrder: "2025-04-08T10:15:00Z",
  },
  {
    id: 3,
    name: "John Doe",
    email: "john.doe@example.com",
    orders: 6,
    spent: "$725.25",
    lastOrder: "2025-04-07T16:45:00Z",
  },
];

export default function AdminDashboard() {
  // Fetch real dashboard data from the API
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/dashboard");
      const result = await response.json();
      
      // Format data for the dashboard
      return {
        overview: {
          salesTotal: formatCurrency(result.revenue.total),
          salesDelta: 0, // Will implement delta tracking in the future
          ordersTotal: result.counts.orders.toString(),
          ordersDelta: 0,
          customersTotal: result.counts.users.toString(),
          customersDelta: 0,
          productsTotal: result.counts.products.toString(),
          productsDelta: 0,
        },
        salesData: result.revenue.monthly.map((item: any) => ({
          name: item.month.split('-')[1], // Extract month from YYYY-MM
          total: parseFloat(item.revenue || 0)
        })),
        recentOrders: result.recentOrders || [],
        topProducts: result.lowStockProducts || [],
        topCustomers: [],
      };
    }
  });

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; }> = {
      pending: { variant: "outline" },
      processing: { variant: "secondary" },
      shipped: { variant: "default" },
      delivered: { variant: "default" },
      cancelled: { variant: "destructive" },
    };

    return <Badge variant={statusStyles[status]?.variant || "outline"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SectionHeader
        title="Dashboard"
        description="Overview of your store's performance"
      />

      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={data?.overview.salesTotal || "$0.00"}
            delta={data?.overview.salesDelta}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatCard
            title="Orders"
            value={data?.overview.ordersTotal || "0"}
            delta={data?.overview.ordersDelta}
            icon={<ShoppingCart className="h-4 w-4" />}
          />
          <StatCard
            title="Customers"
            value={data?.overview.customersTotal || "0"}
            delta={data?.overview.customersDelta}
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Products"
            value={data?.overview.productsTotal || "0"}
            delta={data?.overview.productsDelta}
            icon={<Package className="h-4 w-4" />}
          />
        </div>

        {/* Charts */}
        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sales">
              <BarChart3 className="h-4 w-4 mr-2" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="products">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="customers">
              <Share2 className="h-4 w-4 mr-2" />
              Distribution
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>Monthly revenue for the current year</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] w-full px-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.salesData || []}>
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value: any) => [`$${value}`, "Revenue"]}
                        cursor={{ opacity: 0.1 }}
                      />
                      <CartesianGrid vertical={false} stroke="#f5f5f5" />
                      <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Sales distribution by product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.topProducts.map((product: any) => ({
                          name: product.name,
                          value: product.stock || 0
                        })) || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }: { name: string, percent: number }) => 
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {data?.topProducts.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${value}%`, "Percentage"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution</CardTitle>
                <CardDescription>Analysis of customer base by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" name="UAE" stroke="#8884d8" />
                      <Line type="monotone" dataKey={d => d.total * 0.6} name="Saudi Arabia" stroke="#82ca9d" />
                      <Line type="monotone" dataKey={d => d.total * 0.3} name="Other GCC" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Orders & Top Customers */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base font-medium">Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/admin/orders">View all</a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentOrders?.slice(0, 4).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.user ? order.user.username : 'Guest'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-medium">{formatCurrency(parseFloat(order.totalAmount))}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base font-medium">Top Customers</CardTitle>
                <CardDescription>Your best customers by revenue</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/admin/customers">View all</a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.topCustomers && data.topCustomers.length > 0 ? (
                  data.topCustomers.map((customer: any) => (
                    <div key={customer.id} className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {customer.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-medium">{customer.spent}</p>
                        <p className="text-xs text-muted-foreground">{customer.orders} orders</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No customer data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 gap-2" asChild>
                <a href="/admin/products/new">
                  <Package className="h-6 w-6" />
                  <span>Add Product</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 gap-2" asChild>
                <a href="/admin/orders">
                  <ShoppingCart className="h-6 w-6" />
                  <span>Process Orders</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 gap-2" asChild>
                <a href="/admin/categories">
                  <Layers className="h-6 w-6" />
                  <span>Manage Categories</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 gap-2" asChild>
                <a href="/admin/reports">
                  <TrendingUp className="h-6 w-6" />
                  <span>View Reports</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 gap-2" asChild>
                <a href="/admin/users">
                  <CircleUser className="h-6 w-6" />
                  <span>User Management</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 gap-2" asChild>
                <a href="/admin/settings">
                  <Settings className="h-6 w-6" />
                  <span>Store Settings</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}