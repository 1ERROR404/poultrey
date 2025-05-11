import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useTranslation } from "@/hooks/use-translation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, User, LogOut, Settings, ShoppingBag, CreditCard, Home } from "lucide-react";

export function UserMenu() {
  const { t } = useTranslation();
  const { user, isLoading, logoutMutation } = useAuth();

  // Get initials from user's name for avatar fallback
  const getInitials = () => {
    if (!user) return "";
    
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    
    if (user.username) {
      return user.username[0].toUpperCase();
    }
    
    return "";
  };
  
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Show loading state
  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  // User is not logged in - show login/register button
  if (!user) {
    return (
      <Button asChild variant="ghost" className="p-0 sm:p-2 h-9 w-9 sm:h-auto sm:w-auto rounded-full sm:rounded-md">
        <Link href="/auth">
          <User className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">{t("login_register")}</span>
        </Link>
      </Button>
    );
  }

  // User is logged in - show user menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9">
            {user.profileImageUrl ? (
              <AvatarImage src={user.profileImageUrl} alt={user.username} />
            ) : null}
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <User className="h-4 w-4 mr-2" />
              <span>{t("my_account")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/orders">
              <ShoppingBag className="h-4 w-4 mr-2" />
              <span>{t("my_orders")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/settings">
              <Settings className="h-4 w-4 mr-2" />
              <span>{t("account_settings")}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          <span>{t("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}