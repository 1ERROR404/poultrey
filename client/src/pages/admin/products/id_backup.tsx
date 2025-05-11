import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Package,
  Save,
  Trash,
  Image as ImageIcon,
  Plus,
  X,
  UploadCloud,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { SectionHeader } from "@/components/admin/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define schema for form validation
const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  nameAr: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  descriptionAr: z.string().optional(),
  price: z.string().refine(val => !isNaN(parseFloat(val)), {
    message: "Price must be a valid number",
  }),
  originalPrice: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid URL for the image"),
  additionalImages: z.array(z.string().url("Please enter valid URLs")).optional().default([]),
  videoUrl: z.string().url("Please enter a valid video URL").optional().nullable(),
  descriptionImages: z.array(z.string().url("Please enter valid URLs")).optional().default([]),
  specificationImages: z.array(z.string().url("Please enter valid URLs")).optional().default([]),
  categoryId: z.string().min(1, "Please select a category"),
  sku: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  warrantyInfo: z.string().optional(),
  features: z.array(z.string()).optional().default([]),
  specs: z.record(z.string(), z.string()).optional().default({}),
  tags: z.array(z.string()).optional().default([]),
  quantity: z.number().optional().default(0),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
  badge: z.string().optional(),
  badgeAr: z.string().optional(),
  ratings: z.number().min(0).max(5).optional().default(4),
  reviewCount: z.number().optional().default(0),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductForm() {
  const [location, navigate] = useLocation();
  const [, params] = useLocation<{ id: string }>();
  const isNewProduct = location === "/admin/products/new";
  const isEditMode = !isNewProduct && !!params.id;
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/categories");
      return await response.json();
    },
  });

  // Fetch product if in edit mode
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: [`/api/admin/products/${params.id}`],
    queryFn: async () => {
      if (!isEditMode) return null;
      const response = await apiRequest("GET", `/api/admin/products/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return await response.json();
    },
    enabled: isEditMode,
    staleTime: 0, // Don't use cached data
  });

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      price: "",
      originalPrice: "",
      imageUrl: "",
      additionalImages: [],
      videoUrl: "",
      descriptionImages: [],
      specificationImages: [],
      categoryId: "",
      sku: "",
      weight: "",
      dimensions: "",
      warrantyInfo: "",
      features: [],
      specs: {},
      tags: [],
      quantity: 0,
      metaTitle: "",
      metaDescription: "",
      featured: false,
      inStock: true,
      badge: "",
      badgeAr: "",
      ratings: 4,
      reviewCount: 0,
      slug: "",
    },
  });

  // Populate form with product data if in edit mode
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        nameAr: product.nameAr || "",
        description: product.description || "",
        descriptionAr: product.descriptionAr || "",
        price: typeof product.price === 'number' ? product.price.toString() : product.price.replace(/[^0-9.]/g, ''),
        originalPrice: product.originalPrice ? (typeof product.originalPrice === 'number' ? product.originalPrice.toString() : product.originalPrice.replace(/[^0-9.]/g, '')) : "",
        imageUrl: product.imageUrl || "",
        additionalImages: product.additionalImages || [],
        videoUrl: product.videoUrl || "",
        descriptionImages: product.descriptionImages || [],
        specificationImages: product.specificationImages || [],
        categoryId: product.categoryId?.toString() || "",
        sku: product.sku || "",
        weight: product.weight || "",
        dimensions: product.dimensions || "",
        warrantyInfo: product.warrantyInfo || "",
        features: product.features || [],
        specs: product.specs || {},
        tags: product.tags || [],
        quantity: product.quantity || 0,
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        featured: product.featured || false,
        inStock: product.inStock !== false, // Default to true if not specified
        badge: product.badge || "",
        badgeAr: product.badgeAr || "",
        ratings: product.ratings || 4,
        reviewCount: product.reviewCount || 0,
        slug: product.slug || "",
      });
      
      console.log("Product loaded:", product);
    }
  }, [product, form]);

  // Create or update product mutation
  const mutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Format the data
      const formattedData = {
        ...data,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
        categoryId: parseInt(data.categoryId),
      };

      // Send to API
      if (isEditMode) {
        const response = await apiRequest("PATCH", `/api/admin/products/${params.id}`, formattedData);
        return await response.json();
      } else {
        const response = await apiRequest("POST", "/api/admin/products", formattedData);
        return await response.json();
      }
    },
    onSuccess: () => {
      // Invalidate queries to refetch product list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      
      // Invalidate the specific product query if we're editing
      if (isEditMode && params.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/products/${params.id}`] });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      toast({
        title: `Product ${isEditMode ? "updated" : "created"} successfully`,
        description: `The product has been ${isEditMode ? "updated" : "created"}.`,
      });
      
      // Redirect back to products list
      navigate("/admin/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/admin/products/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      });
      navigate("/admin/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    mutation.mutate(data);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const generateSlug = () => {
    const name = form.getValues("name");
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
      
      form.setValue("slug", slug);
    }
  };

  const isLoading = categoriesLoading || productLoading || mutation.isPending || deleteMutation.isPending;

  return (
    <AdminLayout>
      <SectionHeader
        title={isEditMode ? "Edit Product" : "Add Product"}
        description={isEditMode ? "Update product information" : "Add a new product to your store"}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/products")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
            {isEditMode && (
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the product from your store.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        }
      />

      <div className="space-y-6">
        {!isEditMode && (
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-green-100">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Ready to add a new product?</h3>
                  <p className="text-sm text-muted-foreground">
                    Fill in the product details below to add it to your store inventory. 
                    All fields marked with * are required.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Product Images
                    </CardTitle>
                    <CardDescription>
                      Main product images displayed on the product page
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Main Product Image</FormLabel>
                              <Tabs defaultValue="url" className="w-full mb-2">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="url">Image URL</TabsTrigger>
                                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                                </TabsList>
                                <TabsContent value="url" className="pt-4">
                                  <FormControl>
                                    <Input 
                                      placeholder="https://example.com/product-image.jpg" 
                                      {...field} 
                                    />
                                  </FormControl>
                                </TabsContent>
                                <TabsContent value="upload" className="pt-4">
                                  <div 
                                    className="border border-dashed border-muted-foreground/50 rounded-md p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => {
                                      // Programmatically click the hidden file input
                                      document.getElementById('fileUpload')?.click();
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      e.currentTarget.classList.add('bg-muted/50');
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      e.currentTarget.classList.remove('bg-muted/50');
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      e.currentTarget.classList.remove('bg-muted/50');
                                      
                                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                        // Get the file input element
                                        const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
                                        if (fileInput) {
                                          // Set the files on the input element
                                          // This will trigger the onChange handler
                                          const dataTransfer = new DataTransfer();
                                          dataTransfer.items.add(e.dataTransfer.files[0]);
                                          fileInput.files = dataTransfer.files;
                                          
                                          // Manually trigger the onChange event
                                          const event = new Event('change', { bubbles: true });
                                          fileInput.dispatchEvent(event);
                                        }
                                      }
                                    }}
                                  >
                                    <div className="flex flex-col items-center gap-2">
                                      <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                      <p className="text-sm text-muted-foreground">
                                        Drag and drop image or click to browse
                                      </p>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent double clicking
                                          document.getElementById('fileUpload')?.click();
                                        }}
                                      >
                                        Select File
                                      </Button>
                                      <p className="text-xs text-muted-foreground">
                                        Max file size: 5MB
                                      </p>
                                    </div>
                                    <input 
                                      type="file" 
                                      id="fileUpload"
                                      className="hidden" 
                                      accept="image/*"
                                      onChange={async (e) => {
                                        if (!e.target.files || e.target.files.length === 0) {
                                          return;
                                        }
                                        
                                        const file = e.target.files[0];
                                        
                                        // Create FormData
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        formData.append('isPrimary', 'true'); // Set as primary image
                                        
                                        try {
                                          // Make sure we have a product ID (for edit mode)
                                          if (params.id && params.id !== 'new') {
                                            const response = await fetch(`/api/admin/products/${params.id}/images/upload`, {
                                              method: 'POST',
                                              body: formData,
                                              credentials: 'include',
                                            });
                                            
                                            if (!response.ok) {
                                              throw new Error('Failed to upload image');
                                            }
                                            
                                            const result = await response.json();
                                            
                                            // Update the form with the new image URL
                                            form.setValue('imageUrl', result.url);
                                            
                                            toast({
                                              title: "Image uploaded",
                                              description: "The image has been uploaded successfully.",
                                              variant: "default"
                                            });
                                          } else {
                                            // For new products, use a temporary URL
                                            const tempUrl = URL.createObjectURL(file);
                                            form.setValue('imageUrl', tempUrl);
                                            
                                            // Store the file to be uploaded when the product is created
                                            // We'll handle this when submitting the form
                                            toast({
                                              title: "Image selected",
                                              description: "The image will be uploaded when you save the product.",
                                              variant: "default"
                                            });
                                          }
                                        } catch (error) {
                                          console.error('Error uploading image:', error);
                                          toast({
                                            title: "Upload failed",
                                            description: error instanceof Error ? error.message : "Failed to upload image",
                                            variant: "destructive"
                                          });
                                        }
                                      }}
                                    />
                                  </div>
                                </TabsContent>
                              </Tabs>
                              <FormDescription>
                                This is the primary image shown on product cards and pages
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {form.watch("imageUrl") && (
                          <div className="mt-4">
                            <div className="border rounded-md overflow-hidden bg-white p-2">
                              <img 
                                src={form.getValues("imageUrl")} 
                                alt="Product preview" 
                                className="max-h-[300px] object-contain mx-auto"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/300x300?text=Image+Not+Found";
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <FormLabel>Additional Images</FormLabel>
                          <div className="bg-muted/50 p-4 rounded-md space-y-4">
                            {form.watch("additionalImages")?.map((imageUrl, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={imageUrl}
                                    onChange={(e) => {
                                      const newImages = [...form.getValues("additionalImages")];
                                      newImages[index] = e.target.value;
                                      form.setValue("additionalImages", newImages);
                                    }}
                                    placeholder="https://example.com/image.jpg"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const newImages = form.getValues("additionalImages").filter((_, i) => i !== index);
                                      form.setValue("additionalImages", newImages);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                {imageUrl && (
                                  <div className="border rounded-md overflow-hidden bg-white p-1">
                                    <img 
                                      src={imageUrl} 
                                      alt={`Additional preview ${index + 1}`} 
                                      className="h-[80px] object-contain mx-auto"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://placehold.co/300x150?text=Image+Not+Found";
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentImages = form.getValues("additionalImages") || [];
                                form.setValue("additionalImages", [...currentImages, ""]);
                              }}
                              className="mt-2"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Image
                            </Button>
                          </div>
                          <FormDescription>
                            These images are shown in the product gallery
                          </FormDescription>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Essential product details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={field.value ? field.value : "Enter product name"} 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input 
                                  placeholder={field.value ? field.value : "product-slug"} 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={generateSlug}
                                className="flex-shrink-0"
                              >
                                Generate
                              </Button>
                            </div>
                            <FormDescription>
                              Used in URLs: /products/your-slug
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nameAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Arabic Product Name</FormLabel>
                            <FormControl>
                              <Input 
                                dir="rtl" 
                                placeholder={field.value ? field.value : "اسم المنتج"} 
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Leave empty to use English name for Arabic visitors
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="badge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Badge (English)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={field.value ? field.value : "e.g., New, Sale, Best Seller"} 
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Special badge shown on product cards
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="badgeAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Badge (Arabic)</FormLabel>
                          <FormControl>
                            <Input 
                              dir="rtl" 
                              placeholder={field.value ? field.value : "جديد، خصم، الأكثر مبيعًا"} 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Special badge shown on product cards in Arabic
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="text" 
                                placeholder={field.value ? field.value : "0.00"} 
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Price ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="text" 
                                placeholder={field.value ? field.value : "0.00 (optional)"} 
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Used to show discounts
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={
                                    categories?.find(cat => cat.id.toString() === field.value)?.name || "Select category"
                                  } />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories && categories.map((category: any) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      Inventory & Status
                    </CardTitle>
                    <CardDescription>
                      Manage product availability
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="inStock"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Availability
                              </FormLabel>
                              <FormDescription>
                                Mark if the product is in stock
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Featured Product
                              </FormLabel>
                              <FormDescription>
                                Show on homepage and featured sections
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder={field.value ? field.value.toString() : "Available units"}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Number of units available in stock
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ratings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Rating (0-5)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0} 
                                max={5} 
                                step={0.5} 
                                placeholder="4.5" 
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              Average product rating shown on product pages
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="reviewCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Reviews</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0} 
                                placeholder="0" 
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              Number of reviews displayed on product page
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isEditMode ? "Product Description" : "Product Content & Features"}
                    </CardTitle>
                    <CardDescription>
                      {isEditMode 
                        ? "Detailed product information shown on the product page" 
                        : "Add comprehensive descriptions and features for your new product"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-medium mb-3">English Content</h3>
                      <div className="space-y-5">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Main Description (English)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={field.value ? field.value : "Detailed product description"}
                                  className="min-h-[250px] text-base"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                This is the main product description shown on the product details page. HTML formatting is supported for rich content.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="border-t border-muted pt-5 mt-5">
                          <h4 className="text-base font-medium mb-3">Product Features</h4>
                          <div className="space-y-2 mb-5">
                            <FormLabel>Key Features</FormLabel>
                            <div className="bg-muted/50 p-4 rounded-md space-y-2">
                              {form.watch("features")?.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    value={feature}
                                    onChange={(e) => {
                                      const newFeatures = [...form.getValues("features")];
                                      newFeatures[index] = e.target.value;
                                      form.setValue("features", newFeatures);
                                    }}
                                    placeholder={`Feature ${index + 1}`}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const newFeatures = form.getValues("features").filter((_, i) => i !== index);
                                      form.setValue("features", newFeatures);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentFeatures = form.getValues("features") || [];
                                  form.setValue("features", [...currentFeatures, ""]);
                                }}
                                className="mt-2"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Feature
                              </Button>
                            </div>
                            <FormDescription>
                              Key benefits listed as bullet points on the product page
                            </FormDescription>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                          <div className="space-y-2">
                            <FormLabel>Description Images</FormLabel>
                            <div className="bg-muted/50 p-4 rounded-md space-y-4">
                              {form.watch("descriptionImages")?.map((imageUrl, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={imageUrl}
                                      onChange={(e) => {
                                        const newImages = [...form.getValues("descriptionImages")];
                                        newImages[index] = e.target.value;
                                        form.setValue("descriptionImages", newImages);
                                      }}
                                      placeholder="https://example.com/image.jpg"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const newImages = form.getValues("descriptionImages").filter((_, i) => i !== index);
                                        form.setValue("descriptionImages", newImages);
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  {imageUrl && (
                                    <div className="border rounded-md overflow-hidden">
                                      <img 
                                        src={imageUrl} 
                                        alt={`Description image ${index + 1}`} 
                                        className="h-[100px] object-contain mx-auto"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "https://placehold.co/300x150?text=Image+Not+Found";
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentImages = form.getValues("descriptionImages") || [];
                                  form.setValue("descriptionImages", [...currentImages, ""]);
                                }}
                                className="mt-2"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Description Image
                              </Button>
                            </div>
                            <FormDescription>
                              These images will be displayed within the product description section
                            </FormDescription>
                          </div>
                          
                          <div className="space-y-2">
                            <FormLabel>Product Video</FormLabel>
                            <FormField
                              control={form.control}
                              name="videoUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input 
                                      placeholder="https://youtube.com/watch?v=example" 
                                      {...field} 
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Add a YouTube or Vimeo video URL to display in the product description
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {form.watch("videoUrl") && (
                              <div className="mt-2 p-2 bg-muted/30 rounded-md">
                                <p className="text-sm text-muted-foreground">Video preview:</p>
                                <div className="mt-1 text-sm text-blue-600 break-all">
                                  {form.watch("videoUrl")}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <h3 className="text-lg font-medium mb-3">Arabic Content</h3>
                      <div className="space-y-5">
                        <FormField
                          control={form.control}
                          name="descriptionAr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Arabic Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  dir="rtl"
                                  placeholder={field.value ? field.value : "وصف المنتج التفصيلي"}
                                  className="min-h-[200px] text-base"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                Arabic version of the product description. Leave empty to use English for Arabic visitors.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="border-t border-muted pt-5 mt-5">
                          <h4 className="text-base font-medium mb-3">Arabic Features</h4>
                          <div className="space-y-2">
                            <FormLabel>Key Features (Arabic)</FormLabel>
                            <div className="bg-muted/50 p-4 rounded-md space-y-2">
                              {form.watch("featuresAr")?.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    dir="rtl"
                                    value={feature}
                                    onChange={(e) => {
                                      const newFeatures = [...form.getValues("featuresAr") || []];
                                      newFeatures[index] = e.target.value;
                                      form.setValue("featuresAr", newFeatures);
                                    }}
                                    placeholder="الميزة"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const newFeatures = form.getValues("featuresAr")?.filter((_, i) => i !== index) || [];
                                      form.setValue("featuresAr", newFeatures);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentFeatures = form.getValues("featuresAr") || [];
                                  form.setValue("featuresAr", [...currentFeatures, ""]);
                                }}
                                className="mt-2"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                إضافة ميزة
                              </Button>
                            </div>
                            <FormDescription>
                              Arabic version of key features. Leave empty to use English features for Arabic visitors.
                            </FormDescription>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Product Information</CardTitle>
                    <CardDescription>Tags and categorization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <FormLabel>Product Tags</FormLabel>
                      <div className="bg-muted/50 p-4 rounded-md space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {form.watch("tags")?.map((tag, index) => (
                            <div key={index} className="flex items-center bg-primary/10 rounded-full px-3 py-1">
                              <span className="text-sm mr-1">{tag}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0"
                                onClick={() => {
                                  const newTags = form.getValues("tags").filter((_, i) => i !== index);
                                  form.setValue("tags", newTags);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="new-tag"
                            placeholder="Add a tag"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.currentTarget as HTMLInputElement;
                                const value = input.value.trim();
                                if (value) {
                                  const currentTags = form.getValues("tags") || [];
                                  form.setValue("tags", [...currentTags, value]);
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('new-tag') as HTMLInputElement;
                              const value = input.value.trim();
                              if (value) {
                                const currentTags = form.getValues("tags") || [];
                                form.setValue("tags", [...currentTags, value]);
                                input.value = '';
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      <FormDescription>
                        Tags help with product search and filtering
                      </FormDescription>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Specifications</CardTitle>
                    <CardDescription>Technical details and features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={field.value ? field.value : "Product SKU"} 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Stock Keeping Unit for inventory management
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={field.value ? field.value : "e.g., 5.2 kg"} 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dimensions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dimensions</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={field.value ? field.value : "e.g., 20 × 30 × 40 cm"} 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="warrantyInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warranty Information</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={field.value ? field.value : "Warranty details"}
                                className="min-h-[100px]"
                                value={field.value || ""}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Details about product warranty, return policy, etc.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="warrantyInfoAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warranty Information (Arabic)</FormLabel>
                            <FormControl>
                              <Textarea
                                dir="rtl"
                                placeholder={field.value ? field.value : "معلومات الضمان"}
                                className="min-h-[100px]"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Arabic version of warranty information
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Specification Images</FormLabel>
                      <div className="bg-muted/50 p-4 rounded-md space-y-4">
                        {form.watch("specificationImages")?.map((imageUrl, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                value={imageUrl}
                                onChange={(e) => {
                                  const newImages = [...form.getValues("specificationImages")];
                                  newImages[index] = e.target.value;
                                  form.setValue("specificationImages", newImages);
                                }}
                                placeholder="https://example.com/image.jpg"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newImages = form.getValues("specificationImages").filter((_, i) => i !== index);
                                  form.setValue("specificationImages", newImages);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {imageUrl && (
                              <div className="border rounded-md overflow-hidden bg-white p-1">
                                <img 
                                  src={imageUrl} 
                                  alt={`Specification image ${index + 1}`} 
                                  className="h-[100px] object-contain mx-auto"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://placehold.co/300x150?text=Image+Not+Found";
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentImages = form.getValues("specificationImages") || [];
                            form.setValue("specificationImages", [...currentImages, ""]);
                          }}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Specification Image
                        </Button>
                      </div>
                      <FormDescription>
                        Images shown in the specifications section
                      </FormDescription>
                    </div>
                    
                    <div className="border-b pb-6 mb-6">
                      <h3 className="text-base font-medium mb-3">English Specifications</h3>
                      <div className="space-y-2">
                        <FormLabel>Product Specifications</FormLabel>
                        <div className="bg-muted/50 p-4 rounded-md space-y-2">
                          {Object.entries(form.watch("specs") || {}).map(([key, value], index) => (
                            <div key={index} className="grid grid-cols-2 gap-2">
                              <Input
                                value={key}
                                onChange={(e) => {
                                  const newSpecs = { ...form.getValues("specs") };
                                  const oldValue = newSpecs[key];
                                  delete newSpecs[key];
                                  newSpecs[e.target.value] = oldValue;
                                  form.setValue("specs", newSpecs);
                                }}
                                placeholder="Specification name"
                              />
                              <div className="flex items-center gap-2">
                                <Input
                                  value={value}
                                  onChange={(e) => {
                                    const newSpecs = { ...form.getValues("specs") };
                                    newSpecs[key] = e.target.value;
                                    form.setValue("specs", newSpecs);
                                  }}
                                  placeholder="Specification value"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newSpecs = { ...form.getValues("specs") };
                                    delete newSpecs[key];
                                    form.setValue("specs", newSpecs);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentSpecs = form.getValues("specs") || {};
                              form.setValue("specs", {
                                ...currentSpecs,
                                "": "",
                              });
                            }}
                            className="mt-2"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Specification
                          </Button>
                        </div>
                        <FormDescription>
                          Add technical specifications (name-value pairs)
                        </FormDescription>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-base font-medium mb-3">Arabic Specifications</h3>
                      <FormLabel>Product Specifications (Arabic)</FormLabel>
                      <div className="bg-muted/50 p-4 rounded-md space-y-2" dir="rtl">
                        {Object.entries(form.watch("specsAr") || {}).map(([key, value], index) => (
                          <div key={index} className="grid grid-cols-2 gap-2">
                            <Input
                              dir="rtl"
                              value={key}
                              onChange={(e) => {
                                const newSpecs = { ...form.getValues("specsAr") || {} };
                                const oldValue = newSpecs[key];
                                delete newSpecs[key];
                                newSpecs[e.target.value] = oldValue;
                                form.setValue("specsAr", newSpecs);
                              }}
                              placeholder="اسم المواصفات"
                            />
                            <div className="flex items-center gap-2">
                              <Input
                                dir="rtl"
                                value={value}
                                onChange={(e) => {
                                  const newSpecs = { ...form.getValues("specsAr") || {} };
                                  newSpecs[key] = e.target.value;
                                  form.setValue("specsAr", newSpecs);
                                }}
                                placeholder="قيمة المواصفات"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newSpecs = { ...form.getValues("specsAr") || {} };
                                  delete newSpecs[key];
                                  form.setValue("specsAr", newSpecs);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentSpecs = form.getValues("specsAr") || {};
                            form.setValue("specsAr", {
                              ...currentSpecs,
                              "": "",
                            });
                          }}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          إضافة مواصفات
                        </Button>
                      </div>
                      <FormDescription>
                        Arabic version of technical specifications. Leave empty to use English for Arabic visitors.
                      </FormDescription>
                    </div>
                    
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Details</CardTitle>
                    <CardDescription>Stock and availability</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder={field.value ? field.value.toString() : "Available units"}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Number of units available in stock
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Search Engine Optimization</CardTitle>
                    <CardDescription>Improve product visibility in search results</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-b pb-6 mb-6">
                      <h3 className="text-base font-medium mb-3">English SEO</h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="metaTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={field.value ? field.value : "Custom page title for search engines"} 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                Leave empty to use product name
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="metaDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder={field.value ? field.value : "Brief description for search results (150-160 characters recommended)"}
                                  className="min-h-[100px]"
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                Leave empty to use beginning of product description
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-3">Arabic SEO</h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="metaTitleAr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Title (Arabic)</FormLabel>
                              <FormControl>
                                <Input 
                                  dir="rtl"
                                  placeholder="عنوان الصفحة لمحركات البحث" 
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                Leave empty to use Arabic product name
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="metaDescriptionAr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Description (Arabic)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  dir="rtl"
                                  placeholder={field.value ? field.value : "وصف مختصر لمحركات البحث (يوصى بـ 150-160 حرفًا)"}
                                  className="min-h-[100px]"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                Leave empty to use beginning of Arabic product description
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-muted/50 p-4 rounded-md">
                        <h4 className="text-sm font-medium mb-2">English Search Preview</h4>
                        <div className="space-y-1 text-muted-foreground">
                          <p className="text-blue-600 text-lg font-medium">
                            {form.watch("metaTitle") || form.watch("name") || "Product Title"}
                          </p>
                          <p className="text-green-700 text-sm">
                            {window.location.origin}/products/{form.watch("slug") || "product-slug"}
                          </p>
                          <p className="text-sm">
                            {form.watch("metaDescription") || 
                              (form.watch("description") ? 
                                (form.watch("description").length > 160 ? 
                                  form.watch("description").substring(0, 157) + "..." : 
                                  form.watch("description")) : 
                                "Product description preview will appear here...")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-md" dir="rtl">
                        <h4 className="text-sm font-medium mb-2">معاينة البحث العربي</h4>
                        <div className="space-y-1 text-muted-foreground">
                          <p className="text-blue-600 text-lg font-medium">
                            {form.watch("metaTitleAr") || form.watch("nameAr") || "عنوان المنتج"}
                          </p>
                          <p className="text-green-700 text-sm">
                            {window.location.origin}/products/{form.watch("slug") || "product-slug"}
                          </p>
                          <p className="text-sm">
                            {form.watch("metaDescriptionAr") || 
                              (form.watch("descriptionAr") ? 
                                (form.watch("descriptionAr").length > 160 ? 
                                  form.watch("descriptionAr").substring(0, 157) + "..." : 
                                  form.watch("descriptionAr")) : 
                                "ستظهر هنا معاينة وصف المنتج...")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end gap-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => navigate("/admin/products")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                    {isEditMode ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <Save className="mr-2 h-4 w-4" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {isEditMode ? "Update Product" : "Add Product"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}