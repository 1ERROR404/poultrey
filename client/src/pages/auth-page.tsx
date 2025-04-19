import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
// Language settings
import { useEffect as useEffectOriginal } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { loginMutation, registerMutation, user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  // Get language from document attributes - a simplified approach
  const [language, setLanguage] = useState<string>(() => {
    // Check if we're in a browser environment
    if (typeof document !== 'undefined') {
      return document.documentElement.dir === 'rtl' ? 'ar' : 'en';
    }
    return 'en';
  });
  
  // Define translation function with Arabic support
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        // Login translations
        login: "Login",
        welcome_back: "Welcome Back",
        enter_credentials_to_access: "Enter your credentials to access your account",
        username: "Username or Email",
        enter_username: "Enter your username or email",
        password: "Password",
        enter_password: "Enter your password",
        remember_me: "Remember me",
        logging_in: "Logging in",
        dont_have_account: "Don't have an account?",
        
        // Register translations
        register: "Register",
        create_account: "Create Account",
        enter_details_to_create: "Enter your details to create a new account",
        choose_username: "Choose a username",
        email: "Email",
        enter_email: "Enter your email",
        choose_password: "Choose a password",
        confirm_password: "Confirm Password",
        i_agree: "I agree to the",
        terms_and_conditions: "Terms and Conditions",
        registering: "Registering",
        already_have_account: "Already have an account?",
        
        // Hero section
        shop_premium_poultry_equipment: "Shop Premium Poultry Equipment",
        auth_hero_description: "Get access to high-quality, durable equipment for your poultry farming needs",
        quality_products: "Quality Products",
        quality_products_desc: "All products tested for durability and effectiveness",
        fast_shipping: "Fast Shipping",
        fast_shipping_desc: "Quick delivery to all major locations",
        expert_support: "Expert Support",
        expert_support_desc: "Our team is available to help with any questions",
        
        // Demo button
        create_admin_user: "Create Admin User (Demo Only)"
      },
      ar: {
        // Login translations
        login: "تسجيل الدخول",
        welcome_back: "مرحباً بعودتك",
        enter_credentials_to_access: "أدخل بيانات اعتماد للوصول إلى حسابك",
        username: "اسم المستخدم أو البريد الإلكتروني",
        enter_username: "أدخل اسم المستخدم أو البريد الإلكتروني",
        password: "كلمة المرور",
        enter_password: "أدخل كلمة المرور",
        remember_me: "تذكرني",
        logging_in: "جاري تسجيل الدخول",
        dont_have_account: "ليس لديك حساب؟",
        
        // Register translations
        register: "تسجيل",
        create_account: "إنشاء حساب",
        enter_details_to_create: "أدخل التفاصيل الخاصة بك لإنشاء حساب جديد",
        choose_username: "اختر اسم مستخدم",
        email: "البريد الإلكتروني",
        enter_email: "أدخل بريدك الإلكتروني",
        choose_password: "اختر كلمة مرور",
        confirm_password: "تأكيد كلمة المرور",
        i_agree: "أوافق على",
        terms_and_conditions: "الشروط والأحكام",
        registering: "جاري التسجيل",
        already_have_account: "لديك حساب بالفعل؟",
        
        // Hero section
        shop_premium_poultry_equipment: "تسوق معدات دواجن عالية الجودة",
        auth_hero_description: "احصل على معدات عالية الجودة ومتينة لاحتياجات مزرعة الدواجن الخاصة بك",
        quality_products: "منتجات عالية الجودة",
        quality_products_desc: "تم اختبار جميع المنتجات للتأكد من متانتها وفعاليتها",
        fast_shipping: "شحن سريع",
        fast_shipping_desc: "توصيل سريع لجميع المواقع الرئيسية",
        expert_support: "دعم خبير",
        expert_support_desc: "فريقنا متاح للمساعدة في أي أسئلة",
        
        // Demo button
        create_admin_user: "إنشاء حساب مدير (للعرض فقط)"
      }
    };
    
    const currentLang = language === "ar" ? "ar" : "en";
    return translations[currentLang][key] || key;
  };

  // Initialize forms regardless of login state
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });
  
  // Handle redirect if already logged in - but AFTER all hooks are called
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Update document direction when language changes
  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
      document.body.classList.remove('rtl');
    }
  }, [language]);

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      username: data.username,
      email: data.email,
      password: data.password,
      role: "user", // Default role for new registrations
    });
  };

  // For demo purposes - create admin user
  const createAdminUser = () => {
    registerMutation.mutate({
      username: "admin",
      password: "admin123",
      role: "admin", // Admin role
    }, {
      onSuccess: () => {
        toast({
          title: "Admin account created",
          description: "Username: admin, Password: admin123",
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Auth Form Side */}
      <div className="flex-1 flex flex-col p-6 md:p-10 md:justify-center">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold">Poultry Gear</span>
              </div>
            </Link>
            
            {/* Language Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="text-sm"
            >
              {language === 'en' ? 'العربية' : 'English'}
            </Button>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">{t("login")}</TabsTrigger>
              <TabsTrigger value="register">{t("register")}</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-bold">{t("welcome_back")}</h1>
                  <p className="text-muted-foreground">
                    {t("enter_credentials_to_access")}
                  </p>
                </div>

                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("username")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("enter_username")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("password")}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder={t("enter_password")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t("remember_me")}</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? `${t("logging_in")}...` : t("login")}
                    </Button>
                  </form>
                </Form>

                <div className="text-center">
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={() => setActiveTab("register")}
                  >
                    {t("dont_have_account")}
                  </Button>
                  
                  {/* Hidden button for creating admin */}
                  <Button
                    variant="link"
                    type="button"
                    className="text-xs text-muted-foreground opacity-50 hover:opacity-100 mt-4"
                    onClick={createAdminUser}
                  >
                    {t("create_admin_user")}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-bold">{t("create_account")}</h1>
                  <p className="text-muted-foreground">
                    {t("enter_details_to_create")}
                  </p>
                </div>

                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("username")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("choose_username")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("email")}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t("enter_email")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("password")}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder={t("choose_password")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("confirm_password")}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder={t("confirm_password")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {t("i_agree")} <Link href="/terms" className="text-primary underline">{t("terms_and_conditions")}</Link>
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? `${t("registering")}...` : t("register")}
                    </Button>
                  </form>
                </Form>

                <div className="text-center">
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={() => setActiveTab("login")}
                  >
                    {t("already_have_account")}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Side */}
      <div className="flex-1 hidden md:flex bg-muted p-10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {t("shop_premium_poultry_equipment")}
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              {t("auth_hero_description")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                ✓
              </div>
              <div>
                <h3 className="font-medium">{t("quality_products")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("quality_products_desc")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                ✓
              </div>
              <div>
                <h3 className="font-medium">{t("fast_shipping")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("fast_shipping_desc")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                ✓
              </div>
              <div>
                <h3 className="font-medium">{t("expert_support")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("expert_support_desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background for the hero side */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted z-0" />
        <div className="absolute -bottom-48 -right-48 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </div>
    </div>
  );
}