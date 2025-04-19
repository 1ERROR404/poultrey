import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Layers,
  Boxes,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
// Use a simple text logo instead of an image to avoid import issues
const logoPath = null;

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isMobile?: boolean;
}

const NavItem = ({ href, label, icon, isActive, isMobile = false }: NavItemProps) => {
  if (isMobile) {
    return (
      <SheetClose>
        <Link href={href}>
          <Button
            variant={isActive ? "default" : "ghost"}
            className={`w-full justify-start ${isActive ? "" : "hover:bg-primary/10 hover:text-primary"}`}
          >
            {icon}
            <span className="ml-2">{label}</span>
            {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
          </Button>
        </Link>
      </SheetClose>
    );
  }
  
  return (
    <Link href={href}>
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start ${isActive ? "" : "hover:bg-primary/10 hover:text-primary"}`}
      >
        {icon}
        <span className="ml-2">{label}</span>
        {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
      </Button>
    </Link>
  );
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      isActive: location === "/admin"
    },
    {
      href: "/admin/products",
      label: "Products",
      icon: <Package className="h-4 w-4" />,
      isActive: location === "/admin/products"
    },
    {
      href: "/admin/categories",
      label: "Categories",
      icon: <Layers className="h-4 w-4" />,
      isActive: location === "/admin/categories"
    },
    {
      href: "/admin/inventory",
      label: "Inventory",
      icon: <Boxes className="h-4 w-4" />,
      isActive: location === "/admin/inventory"
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: <ShoppingCart className="h-4 w-4" />,
      isActive: location === "/admin/orders"
    },
    {
      href: "/admin/customers",
      label: "Customers",
      icon: <Users className="h-4 w-4" />,
      isActive: location === "/admin/customers"
    },
    {
      href: "/admin/pages",
      label: "Pages",
      icon: <FileText className="h-4 w-4" />,
      isActive: location === "/admin/pages"
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      isActive: location === "/admin/settings"
    }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-card">
        <div className="p-6">
          <Link href="/admin">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
                PG
              </div>
              <span className="text-xl font-bold">Admin Panel</span>
            </div>
          </Link>
        </div>
        <Separator />
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>
        </ScrollArea>
        <Separator />
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-card border-b p-4 flex items-center justify-between">
        <Link href="/admin">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-xs">
              PG
            </div>
            <span className="font-bold">Poultry Gear Admin</span>
          </div>
        </Link>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="p-6 border-b">
              <SheetTitle>Admin Panel</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <nav className="space-y-1 p-4">
                {navItems.map((item) => (
                  <NavItem key={item.href} {...item} isMobile={true} />
                ))}
              </nav>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
              <SheetClose asChild>
                <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-8">
        <div className="lg:p-8 pt-20 lg:pt-8 px-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;