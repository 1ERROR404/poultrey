import { useLocation, Link } from "wouter";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  User, Settings, Home, ShoppingBag, MapPin, CreditCard, 
  Package, ChevronRight, LogOut, Menu, X
} from "lucide-react";

import Profile from "./profile";
import Addresses from "./addresses";
import PaymentMethods from "./payment-methods";
import Orders from "./orders";
import AccountSettings from "./settings";

export default function AccountPage() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  
  if (!user) return null;
  
  // Get the current tab from the path, default to "profile"
  const getCurrentTab = () => {
    const path = location.split("/")[2];
    if (!path) return "profile";
    
    switch (path) {
      case "orders":
        return "orders";
      case "addresses":
        return "addresses";
      case "settings":
        return "settings";
      default:
        return "profile";
    }
  };
  
  const currentTab = getCurrentTab();
  
  const handleTabChange = (value: string) => {
    if (value === currentTab) return;
    
    switch (value) {
      case "profile":
        navigate("/account");
        break;
      default:
        navigate(`/account/${value}`);
        break;
    }
  };
  
  return (
    <div className="container px-3 py-4 sm:px-4 sm:py-6 mx-auto max-w-5xl">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t("my_account")}</h1>
      
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        
        {/* Mobile Tabs for Fast Navigation */}
        <div className="md:hidden w-full mb-4">
          <Tabs defaultValue={currentTab} onValueChange={handleTabChange}>
            <TabsList className="w-full bg-muted/50 p-1 h-14">
              <TabsTrigger value="profile" className="flex-1 h-full flex items-center justify-center space-y-1 flex-col py-1 px-1">
                <User className="h-5 w-5" />
                <span className="text-xs">{t("my_account")}</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex-1 h-full flex items-center justify-center space-y-1 flex-col py-1 px-1">
                <ShoppingBag className="h-5 w-5" />
                <span className="text-xs">{t("my_orders")}</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex-1 h-full flex items-center justify-center space-y-1 flex-col py-1 px-1">
                <MapPin className="h-5 w-5" />
                <span className="text-xs">{t("addresses")}</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 h-full flex items-center justify-center space-y-1 flex-col py-1 px-1">
                <Settings className="h-5 w-5" />
                <span className="text-xs">{t("account_settings")}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="pt-4">
              <Profile />
            </TabsContent>
            <TabsContent value="orders" className="pt-4">
              <Orders />
            </TabsContent>
            <TabsContent value="addresses" className="pt-4">
              <Addresses />
            </TabsContent>
            <TabsContent value="settings" className="pt-4">
              <AccountSettings />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-56 shrink-0">
          <div className="bg-card rounded-lg border shadow-sm p-4 mb-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">
                  {user.username}
                </div>
                <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {user.email || t("no_email")}
                </div>
              </div>
            </div>
            
            <nav className="space-y-1">
              <Link 
                href="/account"
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                  currentTab === "profile" 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-muted"
                )}
              >
                <User className={cn(
                  "h-4 w-4",
                  isRtl ? "ml-2" : "mr-2"
                )} />
                <span>{t("my_account")}</span>
              </Link>
              
              <Link 
                href="/account/orders"
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                  currentTab === "orders" 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-muted"
                )}
              >
                <ShoppingBag className={cn(
                  "h-4 w-4",
                  isRtl ? "ml-2" : "mr-2"
                )} />
                <span>{t("my_orders")}</span>
              </Link>
              
              <Link 
                href="/account/addresses"
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                  currentTab === "addresses" 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-muted"
                )}
              >
                <MapPin className={cn(
                  "h-4 w-4",
                  isRtl ? "ml-2" : "mr-2"
                )} />
                <span>{t("addresses")}</span>
              </Link>
              
              <Link 
                href="/account/settings"
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                  currentTab === "settings" 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-muted"
                )}
              >
                <Settings className={cn(
                  "h-4 w-4",
                  isRtl ? "ml-2" : "mr-2"
                )} />
                <span>{t("account_settings")}</span>
              </Link>
              
              <button 
                className="w-full flex items-center px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className={cn(
                  "h-4 w-4",
                  isRtl ? "ml-2" : "mr-2"
                )} />
                <span>{t("logout")}</span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-card rounded-lg border shadow-sm p-3 sm:p-5">
            {currentTab === "profile" && <Profile />}
            {currentTab === "orders" && <Orders />}
            {currentTab === "addresses" && <Addresses />}
            {currentTab === "settings" && <AccountSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}