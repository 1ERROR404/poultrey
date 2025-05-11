import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the form schema for password change
const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SettingsPage() {
  const { user, changePasswordMutation, logoutMutation } = useAuth();
  const { t } = useTranslation();
  const { isRtl } = useLanguage();

  if (!user) return null;

  // Setup password change form
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle password change form submission
  async function onSubmit(values: PasswordFormValues) {
    await changePasswordMutation.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    
    // Reset the form
    form.reset();
  }

  // Handle logout from all devices (placeholder)
  const handleLogoutAllDevices = async () => {
    // In a real implementation, this would call a special API endpoint
    // For now, just log the user out of the current session
    await logoutMutation.mutateAsync();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("account_settings")}</h2>
        <p className="text-muted-foreground">
          {t("manage_your_account_security")}
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-8">
        {/* Password Change Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t("change_password")}</CardTitle>
            <CardDescription>{t("update_your_password")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("current_password")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("new_password")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("confirm_password")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("updating")}
                      </>
                    ) : (
                      t("update_password")
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Session Security Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t("session_security")}</CardTitle>
            <CardDescription>{t("manage_your_active_sessions")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {t("last_login")}: {user.lastLoginAt 
                  ? new Date(user.lastLoginAt).toLocaleString() 
                  : t("never")}
              </div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  {t("logout_all_devices")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("logout_all_devices")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("logout_all_devices_confirmation")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogoutAllDevices}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
        
        {/* Account Deactivation/Deletion Section */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">{t("delete_account")}</CardTitle>
            <CardDescription>{t("permanently_delete_your_account")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t("delete_account_warning")}
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  {t("delete_account")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("are_you_absolutely_sure")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("delete_account_confirmation")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}