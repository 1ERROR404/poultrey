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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the form schema
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSettings() {
  const { user, updateProfileMutation } = useAuth();
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  // Setup form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user.username,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      profileImageUrl: user.profileImageUrl || "",
    },
  });

  // Handle form submission
  async function onSubmit(values: ProfileFormValues) {
    // Filter out unchanged values and email/username which cannot be changed
    const updatedValues: Record<string, string> = {};
    
    if (values.firstName !== user.firstName) {
      updatedValues.firstName = values.firstName || "";
    }
    
    if (values.lastName !== user.lastName) {
      updatedValues.lastName = values.lastName || "";
    }
    
    if (values.phoneNumber !== user.phoneNumber) {
      updatedValues.phoneNumber = values.phoneNumber || "";
    }
    
    if (values.profileImageUrl !== user.profileImageUrl) {
      updatedValues.profileImageUrl = values.profileImageUrl || "";
    }
    
    // Only make the API call if there are changes
    if (Object.keys(updatedValues).length > 0) {
      await updateProfileMutation.mutateAsync(updatedValues);
    }
    
    setIsEditing(false);
  }

  // Get initials from user's name for avatar fallback
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    
    return user.username[0].toUpperCase();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t("profile_settings")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("manage_your_profile_information")}
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-4 sm:space-y-6">
        <div className={cn(
          "flex flex-col sm:flex-row items-center gap-4 sm:gap-6",
          isRtl ? "sm:space-x-reverse" : ""
        )}>
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
            {user.profileImageUrl ? (
              <AvatarImage src={user.profileImageUrl} alt={user.username} />
            ) : null}
            <AvatarFallback className="text-xl sm:text-2xl">{getInitials()}</AvatarFallback>
          </Avatar>
          
          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-medium">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.username}
            </h3>
            <p className="text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg">{t("personal_information")}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t("update_your_personal_details")}
                </CardDescription>
              </div>
              
              {!isEditing && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full sm:w-auto h-9 text-sm font-medium"
                  onClick={() => setIsEditing(true)}
                >
                  {t("edit")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 py-2 sm:px-6 sm:py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium">{t("first_name")}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t("first_name")} 
                            {...field}
                            disabled={!isEditing}
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium">{t("last_name")}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t("last_name")} 
                            {...field}
                            disabled={!isEditing}
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">{t("email")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@example.com" 
                          {...field}
                          disabled={true} // Email cannot be changed
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">{t("username")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("username")} 
                          {...field}
                          disabled={true} // Username cannot be changed
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                

                
                <FormField
                  control={form.control}
                  name="profileImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">{t("profile_image_url")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/avatar.jpg" 
                          {...field}
                          disabled={!isEditing}
                          className="h-10" 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {isEditing && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end sm:space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      disabled={updateProfileMutation.isPending}
                      className="w-full sm:w-auto h-10 text-sm font-medium"
                    >
                      {t("cancel")}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="w-full sm:w-auto h-10 text-sm font-medium"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("saving")}
                        </>
                      ) : (
                        t("save_changes")
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}