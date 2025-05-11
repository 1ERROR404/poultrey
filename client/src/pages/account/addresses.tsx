import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PencilIcon, PlusCircle, Trash2, MapPin } from "lucide-react";
import { countries, getCountryName } from "@/lib/countries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertAddressSchema } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Define the form schema
const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  addressLine1: z.string().min(1, { message: "Address is required" }),
  addressLine2: z.string().optional(),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, { message: "Country is required" }),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
  label: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Address = FormValues & {
  id: number;
  userId: number;
};

export default function Addresses() {
  const { t, isArabic } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Fetch user addresses
  const {
    data: addresses = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Address[]>({
    queryKey: ['/api/addresses'],
    enabled: !!user,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "AE", // Default to UAE
      phone: "",
      isDefault: false,
      label: "",
    }
  });

  // Set form values when editing an address
  useEffect(() => {
    if (editingAddress) {
      form.reset({
        firstName: editingAddress.firstName,
        lastName: editingAddress.lastName,
        addressLine1: editingAddress.addressLine1,
        addressLine2: editingAddress.addressLine2 || "",
        city: editingAddress.city,
        state: editingAddress.state || "",
        postalCode: editingAddress.postalCode || "",
        country: editingAddress.country,
        phone: editingAddress.phone || "",
        isDefault: editingAddress.isDefault,
        label: editingAddress.label || "",
      });
      setIsAddingNew(false);
    }
  }, [editingAddress, form]);

  // Reset form and editing state
  const resetForm = () => {
    form.reset();
    setEditingAddress(null);
    setIsAddingNew(false);
  };

  // Create a new address
  const createAddressMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/addresses", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("Address added"),
        description: t("Your address has been added successfully"),
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to add address"),
        variant: "destructive",
      });
    },
  });

  // Update an existing address
  const updateAddressMutation = useMutation({
    mutationFn: async (data: FormValues & { id: number }) => {
      const { id, ...addressData } = data;
      const res = await apiRequest("PATCH", `/api/addresses/${id}`, addressData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("Address updated"),
        description: t("Your address has been updated successfully"),
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to update address"),
        variant: "destructive",
      });
    },
  });

  // Delete an address
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/addresses/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("Address deleted"),
        description: t("Your address has been deleted successfully"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to delete address"),
        variant: "destructive",
      });
    },
  });

  // Set an address as default
  const setDefaultAddressMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/addresses/${id}/default`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("Default address set"),
        description: t("Your default shipping address has been updated"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to set default address"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (editingAddress) {
      updateAddressMutation.mutate({ ...data, id: editingAddress.id });
    } else {
      createAddressMutation.mutate(data);
    }
  };

  const handleAddNew = () => {
    form.reset();
    setEditingAddress(null);
    setIsAddingNew(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsAddingNew(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t("Are you sure you want to delete this address?"))) {
      deleteAddressMutation.mutate(id);
    }
  };

  const handleSetDefault = (id: number) => {
    setDefaultAddressMutation.mutate(id);
  };

  const isPending = createAddressMutation.isPending || updateAddressMutation.isPending || deleteAddressMutation.isPending;

  if (!user) {
    return (
      <div className="container py-8">
        <p>{t("Please log in to manage your addresses")}</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{t("Manage Your Addresses")}</h1>

      {/* Address List */}
      {!isAddingNew && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{t("Your Addresses")}</h2>
            <Button 
              onClick={handleAddNew} 
              className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("Add New Address")}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-red-500">{t("Error loading addresses")}</p>
          ) : addresses.length === 0 ? (
            <p className="text-muted-foreground py-4">
              {t("You don't have any saved addresses yet. Add your first address.")}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map((address) => (
                <Card key={address.id} className="p-0 relative overflow-hidden border-2 transition-all hover:shadow-md hover:border-primary/20">
                  {address.isDefault && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground py-1 px-3 rounded-bl-md text-xs font-medium">
                      {t("Default")}
                    </div>
                  )}
                  <div className="p-5">
                    <div className="mb-4 border-b pb-3">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-primary mr-2" />
                        <h3 className="font-bold text-lg">
                          {address.firstName} {address.lastName}
                          {address.label && <span className="ml-2 text-sm font-normal text-muted-foreground">({address.label})</span>}
                        </h3>
                      </div>
                    </div>
                    <div className="space-y-1 text-muted-foreground">
                      <p className="font-medium text-foreground">{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      <p>
                        {address.city}
                        {address.state && `, ${address.state}`}
                        {address.postalCode && ` ${address.postalCode}`}
                      </p>
                      <p>{getCountryName(address.country, isArabic)}</p>
                      {address.phone && (
                        <p className="flex items-center mt-2">
                          <span className="inline-block bg-gray-100 rounded-full p-1 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                          </span>
                          {address.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between bg-gray-50 p-3 border-t">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(address)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                        <PencilIcon className="h-4 w-4 mr-1" />
                        {t("Edit")}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(address.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t("Delete")}
                      </Button>
                    </div>
                    {!address.isDefault && (
                      <Button variant="ghost" size="sm" onClick={() => handleSetDefault(address.id)} className="text-primary hover:text-primary/80 hover:bg-primary/10">
                        {t("Set as Default")}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Address Form */}
      {isAddingNew && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">
                {editingAddress ? t("Edit Address") : t("Add New Address")}
              </h2>
            </div>
            <Button variant="outline" onClick={resetForm} className="border-gray-300 hover:bg-gray-100">
              {t("Cancel")}
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("First Name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Enter your first name")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Last Name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Enter your last name")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Address Line 1")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Street address, P.O. box")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Address Line 2")} ({t("Optional")})</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Apartment, suite, unit, building, floor, etc.")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("City")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Enter city")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("State/Province/Region")} ({t("Optional")})</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Enter state or province")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Postal Code")} ({t("Optional")})</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Enter postal code")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Country")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select a country")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country: { code: string, name: string, nameAr: string }) => (
                            <SelectItem key={country.code} value={country.code}>
                              {isArabic ? country.nameAr : country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Phone Number")} ({t("Optional")})</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Enter phone number")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Address Label")} ({t("Optional")})</FormLabel>
                      <FormControl>
                        <Input placeholder={t("e.g., Home, Work, Summer House")} {...field} />
                      </FormControl>
                      <FormDescription>
                        {t("A label to help you identify this address")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t("Set as default shipping address")}
                      </FormLabel>
                      <FormDescription>
                        {t("This address will be pre-selected during checkout")}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0 shadow-lg hover:shadow-xl transition-all duration-200 min-w-32"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingAddress ? t("Update Address") : t("Save Address")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}