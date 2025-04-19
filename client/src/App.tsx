import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/language-context";
import { CurrencyProvider } from "@/contexts/currency-context";
import { CartProvider } from "@/contexts/cart-context";
import { CartAnimationProvider } from "@/contexts/cart-animation-context";
import { StockNotificationProvider } from "@/contexts/stock-notification-context";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { GuestOrAuthRoute } from "@/lib/guest-or-auth-route";
import { lazy, Suspense } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { StockNotificationModal } from "@/components/products/stock-notification-modal";
import WhatsAppButton from "@/components/shared/whatsapp-button";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductsPage from "@/pages/products";
import ProductDetailPage from "@/pages/products/[slug]";
import CategoriesPage from "@/pages/categories";
import CategoryPage from "@/pages/categories/[slug]";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import AboutPage from "@/pages/about";
import AuthPage from "@/pages/auth-page";

// Lazy-loaded components
const LazyAccountPage = lazy(() => import("@/pages/account"));
const LazyOrderDetailsPage = lazy(() => import("@/pages/account/order-details"));
const LazyAddressesPage = lazy(() => import("@/pages/account/addresses"));
const LazyInvoicePage = lazy(() => import("@/pages/invoice/[id]"));
const LazyAdminDashboard = lazy(() => import("@/pages/admin"));
const LazyAdminProducts = lazy(() => import("@/pages/admin/products"));
const LazyAdminProductForm = lazy(() => import("@/pages/admin/products/product-form"));
const LazyAdminProductEdit = lazy(() => import("@/pages/admin/products/[id]"));
const LazyAdminCategories = lazy(() => import("@/pages/admin/categories"));
const LazyAdminOrders = lazy(() => import("@/pages/admin/orders"));
const LazyAdminOrderDetails = lazy(() => import("@/pages/admin/orders/[id]"));
const LazyAdminInventory = lazy(() => import("@/pages/admin/inventory"));
const LazyAdminCustomers = lazy(() => import("@/pages/admin/customers"));
const LazyAdminCustomerDetails = lazy(() => import("@/pages/admin/customers/[id]"));

// Wrapper component for lazy-loaded components
const AccountPageWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyAccountPage />
  </Suspense>
);

// Admin page wrappers
const AdminDashboardWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyAdminDashboard />
  </Suspense>
);

const AdminProductsWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyAdminProducts />
  </Suspense>
);

const AdminCategoriesWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyAdminCategories />
  </Suspense>
);

const AdminOrdersWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyAdminOrders />
  </Suspense>
);

const AdminProductFormWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyAdminProductForm />
  </Suspense>
);

const AdminProductEditWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyAdminProductEdit />
  </Suspense>
);

const AdminInventoryWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyAdminInventory />
  </Suspense>
);

const AdminOrderDetailsWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyAdminOrderDetails />
  </Suspense>
);

const OrderDetailsWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyOrderDetailsPage />
  </Suspense>
);

const AdminCustomersWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyAdminCustomers />
  </Suspense>
);

const AdminCustomerDetailsWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyAdminCustomerDetails />
  </Suspense>
);

const AddressesWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyAddressesPage />
  </Suspense>
);

// Invoice page wrapper
const InvoicePageWrapper = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <LazyInvoicePage />
  </Suspense>
);

// Admin route component with role check
function AdminRoute({ component: Component, path }: { component: React.ComponentType, path: string }) {
  return (
    <ProtectedRoute
      path={path}
      component={Component}
      requireRole="admin"
    />
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  // Don't show header/footer in admin pages
  if (location.startsWith("/admin")) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <StockNotificationModal />
      <WhatsAppButton />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:slug" component={ProductDetailPage} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/categories/:slug" component={CategoryPage} />
      <Route path="/cart" component={CartPage} />
      <GuestOrAuthRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/account" component={AccountPageWrapper} />
      <ProtectedRoute path="/account/orders/:id" component={OrderDetailsWrapper} />
      <ProtectedRoute path="/account/addresses" component={AddressesWrapper} />
      <ProtectedRoute path="/account/:path*" component={AccountPageWrapper} />
      <ProtectedRoute path="/invoice/:id" component={InvoicePageWrapper} />
      <Route path="/about" component={AboutPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Routes */}
      <AdminRoute path="/admin" component={AdminDashboardWrapper} />
      <AdminRoute path="/admin/products/new" component={AdminProductEditWrapper} />
      <AdminRoute path="/admin/products/:slug" component={AdminProductFormWrapper} />
      <AdminRoute path="/admin/products" component={AdminProductsWrapper} />
      <AdminRoute path="/admin/categories" component={AdminCategoriesWrapper} />
      <AdminRoute path="/admin/inventory" component={AdminInventoryWrapper} />
      <AdminRoute path="/admin/orders/:id" component={AdminOrderDetailsWrapper} />
      <AdminRoute path="/admin/orders" component={AdminOrdersWrapper} />
      <AdminRoute path="/admin/customers/:id" component={AdminCustomerDetailsWrapper} />
      <AdminRoute path="/admin/customers" component={AdminCustomersWrapper} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <CartAnimationProvider>
                <StockNotificationProvider>
                  <MainLayout>
                    <Router />
                  </MainLayout>
                  <Toaster />
                </StockNotificationProvider>
              </CartAnimationProvider>
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
