import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { CURRENCIES } from '@/contexts/currency-context';
import {
  ArrowLeft,
  Package,
  Save,
  Trash,
  Image as ImageIcon,
  Plus,
  X,
  UploadCloud,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Unlink,
  Image,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { SectionHeader } from "@/components/admin/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
  published: z.boolean().default(false),
  badge: z.string().optional(),
  badgeAr: z.string().optional(),

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
      published: false,
      badge: "",
      badgeAr: "",
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
        // Convert price from base to OMR for the form
        price: typeof product.price === 'number' 
          ? (product.price * CURRENCIES.OMR.exchangeRate).toFixed(2)
          : (parseFloat(product.price.replace(/[^0-9.]/g, '')) * CURRENCIES.OMR.exchangeRate).toFixed(2),
        // Convert original price from base to OMR for the form
        originalPrice: product.originalPrice 
          ? (typeof product.originalPrice === 'number' 
              ? (product.originalPrice * CURRENCIES.OMR.exchangeRate).toFixed(2)
              : (parseFloat(product.originalPrice.replace(/[^0-9.]/g, '')) * CURRENCIES.OMR.exchangeRate).toFixed(2))
          : "",
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
        published: product.published || false,
        badge: product.badge || "",
        badgeAr: product.badgeAr || "",
        slug: product.slug || "",
      });
      
      console.log("Product loaded:", product);
    }
  }, [product, form]);

  // Create or update product mutation
  const mutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Format the data and convert OMR prices back to base prices for storage
      const formattedData = {
        ...data,
        // Convert from OMR to base price
        price: parseFloat(data.price) / CURRENCIES.OMR.exchangeRate,
        originalPrice: data.originalPrice 
          ? parseFloat(data.originalPrice) / CURRENCIES.OMR.exchangeRate 
          : undefined,
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
    onSuccess: (result) => {
      console.log('🎉 MUTATION SUCCESS: Product was successfully saved', result);
      
      // Log more information for debugging
      console.log('⏱️ Mutation success time:', new Date().toISOString());
      
      // Force complete cache purge for all products
      console.log('🧹 Purging all product data from cache...');
      queryClient.removeQueries({ queryKey: ["/api/admin/products"] });
      queryClient.removeQueries({ queryKey: ["/api/products"] });
      
      // Also purge by prefix to catch any potential nested queries
      queryClient.removeQueries({ predicate: (query) => {
        const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
        return typeof queryKey === 'string' && 
              (queryKey.startsWith('/api/admin/products') || 
               queryKey.startsWith('/api/products'));
      }});
      
      // Show success message
      toast({
        title: `Product ${isEditMode ? "updated" : "created"} successfully`,
        description: `The product has been ${isEditMode ? "updated" : "created"}.`,
      });
      
      console.log('🔄 Attempting to redirect to products list...');
      
      // Use a multi-step approach to ensure navigation happens
      // 1. First try using the router
      navigate("/admin/products");
      
      // 2. Then try immediate direct navigation
      window.location.href = "/admin/products";
      
      // 3. As a final fallback, force page reload after a short delay
      setTimeout(() => {
        console.log('⏱️ Fallback navigation: forcing page reload');
        window.location.reload();
      }, 500);
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
      console.log('🗑️ DELETION SUCCESS: Product was successfully deleted');
      
      // Force complete cache purge for all products
      console.log('🧹 Purging all product data from cache after deletion...');
      queryClient.removeQueries({ queryKey: ["/api/admin/products"] });
      queryClient.removeQueries({ queryKey: ["/api/products"] });
      
      // Also purge by prefix to catch any potential nested queries
      queryClient.removeQueries({ predicate: (query) => {
        const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
        return typeof queryKey === 'string' && 
              (queryKey.startsWith('/api/admin/products') || 
               queryKey.startsWith('/api/products'));
      }});
      
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      });
      
      console.log('🔄 Attempting to redirect to products list after deletion...');
      
      // Try multiple navigation methods
      navigate("/admin/products");
      window.location.href = "/admin/products";
      
      // Force reload as a last resort
      setTimeout(() => {
        console.log('⏱️ Fallback navigation: forcing page reload after deletion');
        window.location.reload();
      }, 500);
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
              {/* Product Images */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Product Images
                  </CardTitle>
                  <CardDescription>
                    Upload multiple images and select which one should be the primary image
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <h3 className="text-sm font-medium">Upload Images</h3>
                      <div 
                        className="border border-dashed border-muted-foreground/50 rounded-md p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => {
                          document.getElementById('multiFileUpload')?.click();
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
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('bg-muted/50');
                          
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            // Handle file upload logic here
                            const file = e.dataTransfer.files[0];
                            
                            // Create FormData
                            const formData = new FormData();
                            formData.append('file', file);
                            // This will be a new image, not primary by default
                            const isPrimary = !form.getValues("imageUrl");
                            formData.append('isPrimary', isPrimary ? 'true' : 'false');
                            
                            try {
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
                                
                                // If this is the primary image or we don't have one yet
                                if (isPrimary) {
                                  form.setValue('imageUrl', result.url);
                                } else {
                                  // Add to additional images
                                  const currentImages = form.getValues("additionalImages") || [];
                                  form.setValue("additionalImages", [...currentImages, result.url]);
                                }
                                
                                toast({
                                  title: "Image uploaded",
                                  description: "The image has been uploaded successfully.",
                                  variant: "default"
                                });
                              } else {
                                // For new products, use a temporary URL
                                const tempUrl = URL.createObjectURL(file);
                                
                                if (isPrimary) {
                                  form.setValue('imageUrl', tempUrl);
                                } else {
                                  const currentImages = form.getValues("additionalImages") || [];
                                  form.setValue("additionalImages", [...currentImages, tempUrl]);
                                }
                                
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
                              document.getElementById('multiFileUpload')?.click();
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
                          id="multiFileUpload"
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
                            
                            // This will be a new image, not primary by default unless we have no primary image
                            const isPrimary = !form.getValues("imageUrl");
                            formData.append('isPrimary', isPrimary ? 'true' : 'false');
                            
                            try {
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
                                
                                // If this is the primary image or we don't have one yet
                                if (isPrimary) {
                                  form.setValue('imageUrl', result.url);
                                } else {
                                  // Add to additional images
                                  const currentImages = form.getValues("additionalImages") || [];
                                  form.setValue("additionalImages", [...currentImages, result.url]);
                                }
                                
                                toast({
                                  title: "Image uploaded",
                                  description: "The image has been uploaded successfully.",
                                  variant: "default"
                                });
                              } else {
                                // For new products, use a temporary URL
                                const tempUrl = URL.createObjectURL(file);
                                
                                if (isPrimary) {
                                  form.setValue('imageUrl', tempUrl);
                                } else {
                                  const currentImages = form.getValues("additionalImages") || [];
                                  form.setValue("additionalImages", [...currentImages, tempUrl]);
                                }
                                
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
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Product Images</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {/* Primary Image */}
                        {form.watch("imageUrl") && (
                          <div className="relative group border-2 border-primary rounded-md p-1 bg-primary/5">
                            <div className="relative aspect-square overflow-hidden bg-white">
                              <img 
                                src={form.getValues("imageUrl")} 
                                alt="Primary product image" 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/300x300?text=Image+Not+Found";
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1">
                                  <Button 
                                    variant="destructive" 
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    type="button"
                                    onClick={() => {
                                      if (form.getValues("additionalImages")?.length > 0) {
                                        // If there are additional images, promote the first one to primary
                                        const additionalImages = [...form.getValues("additionalImages")];
                                        const newPrimary = additionalImages.shift();
                                        form.setValue("imageUrl", newPrimary);
                                        form.setValue("additionalImages", additionalImages);
                                      } else {
                                        // Otherwise, just clear the primary image
                                        form.setValue("imageUrl", "");
                                      }
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
                              Primary
                            </div>
                            <FormControl>
                              <Input 
                                className="mt-2 text-xs"
                                placeholder="Image URL"
                                value={form.getValues("imageUrl")}
                                onChange={(e) => form.setValue("imageUrl", e.target.value)}
                              />
                            </FormControl>
                          </div>
                        )}
                        
                        {/* Additional Images */}
                        {form.watch("additionalImages")?.map((imageUrl, index) => (
                          <div key={index} className="relative group border border-muted rounded-md p-1">
                            <div className="relative aspect-square overflow-hidden bg-white">
                              <img 
                                src={imageUrl} 
                                alt={`Product image ${index + 1}`} 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/300x300?text=Image+Not+Found";
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1">
                                  <Button 
                                    variant="secondary" 
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-white/90"
                                    type="button"
                                    onClick={() => {
                                      // Make this the primary image
                                      const currentPrimary = form.getValues("imageUrl");
                                      const additionalImages = [...form.getValues("additionalImages")];
                                      
                                      // Swap the images
                                      form.setValue("imageUrl", imageUrl);
                                      additionalImages.splice(index, 1);
                                      
                                      // If we had a primary image before, move it to additional
                                      if (currentPrimary) {
                                        additionalImages.push(currentPrimary);
                                      }
                                      
                                      form.setValue("additionalImages", additionalImages);
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    type="button"
                                    onClick={() => {
                                      const newImages = form.getValues("additionalImages").filter((_, i) => i !== index);
                                      form.setValue("additionalImages", newImages);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <FormControl>
                              <Input 
                                className="mt-2 text-xs"
                                placeholder="Image URL"
                                value={imageUrl}
                                onChange={(e) => {
                                  const newImages = [...form.getValues("additionalImages")];
                                  newImages[index] = e.target.value;
                                  form.setValue("additionalImages", newImages);
                                }}
                              />
                            </FormControl>
                          </div>
                        ))}
                        
                        {/* Add Image URL Button */}
                        <div
                          className="border border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors aspect-square"
                          onClick={() => {
                            // If no primary image, add it there, otherwise add to additional
                            if (!form.getValues("imageUrl")) {
                              form.setValue("imageUrl", "");
                            } else {
                              const currentImages = form.getValues("additionalImages") || [];
                              form.setValue("additionalImages", [...currentImages, ""]);
                            }
                          }}
                        >
                          <div className="flex flex-col items-center gap-1 text-muted-foreground">
                            <Plus className="h-6 w-6" />
                            <span className="text-xs">Add Image URL</span>
                          </div>
                        </div>
                      </div>
                      <FormDescription>
                        Upload or enter URLs for product images. Set any image as primary by clicking the star icon.
                      </FormDescription>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Basic Information */}
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
                          <FormLabel>Price (OMR - ر.ع)</FormLabel>
                          <FormControl>
                            <Input 
                              type="text" 
                              placeholder="0.00" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter price in OMR currency (ر.ع)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price (OMR - ر.ع) (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="text" 
                              placeholder="0.00 (optional)" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter original price in OMR currency (ر.ع) - used to show discounts
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
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category: any) => (
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


                  
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Description</FormLabel>
                          <Card className="overflow-hidden border-0 shadow-sm">
                            <CardHeader className="bg-muted/40 p-2">
                              <div className="flex flex-wrap items-center gap-1 text-sm">
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={() => {
                                    const editor = document.querySelector('.description-editor .ql-editor');
                                    if (editor) {
                                      const selection = window.getSelection();
                                      if (selection && selection.toString()) {
                                        const range = selection.getRangeAt(0);
                                        const selectedText = selection.toString();
                                        const format = document.createElement('strong');
                                        format.textContent = selectedText;
                                        range.deleteContents();
                                        range.insertNode(format);
                                        form.setValue('description', (document.querySelector('.description-editor .ql-editor') as HTMLElement).innerHTML);
                                      }
                                    }
                                  }}
                                >
                                  <Bold className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <Italic className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <Underline className="h-4 w-4" />
                                </Button>
                                <Separator orientation="vertical" className="mx-1 h-6" />
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <AlignLeft className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <AlignCenter className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <AlignRight className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <AlignJustify className="h-4 w-4" />
                                </Button>
                                <Separator orientation="vertical" className="mx-1 h-6" />
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <List className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <ListOrdered className="h-4 w-4" />
                                </Button>
                                <Separator orientation="vertical" className="mx-1 h-6" />
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <Link className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <Image className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-0">
                              <FormControl>
                                <ReactQuill
                                  className="description-editor auto-expand-editor"
                                  theme="snow"
                                  placeholder="Enter product description with rich formatting"
                                  modules={{
                                    toolbar: {
                                      container: [
                                        [{ header: [1, 2, 3, 4, 5, 6, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ list: 'ordered' }, { list: 'bullet' }],
                                        [{ indent: '-1' }, { indent: '+1' }],
                                        [{ align: [] }],
                                        ['link', 'image'],
                                        [{ color: [] }, { background: [] }],
                                        ['clean']
                                      ],
                                    },
                                  }}
                                  value={field.value || ''}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                            </CardContent>
                          </Card>
                          <FormDescription>
                            Create a detailed description with rich formatting options
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="descriptionAr"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Arabic Description</FormLabel>
                          <Card className="overflow-hidden border-0 shadow-sm">
                            <CardHeader className="bg-muted/40 p-2">
                              <div className="flex flex-wrap items-center justify-end gap-1 text-sm" dir="rtl">
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                >
                                  <Bold className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <Italic className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <Underline className="h-4 w-4" />
                                </Button>
                                <Separator orientation="vertical" className="mx-1 h-6" />
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <AlignRight className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <AlignCenter className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <AlignLeft className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <AlignJustify className="h-4 w-4" />
                                </Button>
                                <Separator orientation="vertical" className="mx-1 h-6" />
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <List className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <ListOrdered className="h-4 w-4" />
                                </Button>
                                <Separator orientation="vertical" className="mx-1 h-6" />
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <Link className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <Image className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-0">
                              <FormControl>
                                <ReactQuill
                                  theme="snow"
                                  className="auto-expand-editor"
                                  placeholder="أدخل وصف المنتج مع تنسيق غني"
                                  modules={{
                                    toolbar: {
                                      container: [
                                        [{ header: [1, 2, 3, 4, 5, 6, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ list: 'ordered' }, { list: 'bullet' }],
                                        [{ indent: '-1' }, { indent: '+1' }],
                                        [{ align: [] }],
                                        ['link', 'image'],
                                        [{ color: [] }, { background: [] }],
                                        ['clean']
                                      ],
                                    },
                                  }}
                                  value={field.value || ''}
                                  onChange={field.onChange}
                                  style={{ direction: 'rtl', textAlign: 'right' }}
                                />
                              </FormControl>
                            </CardContent>
                          </Card>
                          <FormDescription>
                            Arabic description of the product with rich formatting
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Inventory Details */}
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
                              placeholder="0" 
                              {...field}
                              value={field.value || 0}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value >= 0) {
                                  field.onChange(value);
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Number of items in stock
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <FormField
                      control={form.control}
                      name="inStock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>In Stock</FormLabel>
                            <FormDescription>
                              Show the product as in stock, even if quantity is 0
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-4 bg-amber-50 border-amber-200">
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-lg font-medium">Publication Status</FormLabel>
                            <FormDescription className="text-base">
                              {field.value 
                                ? "Product is published and visible to customers" 
                                : "Product is saved as a draft and hidden from customers"}
                            </FormDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${field.value ? 'text-green-600' : 'text-amber-600'}`}>
                              {field.value ? 'Published' : 'Draft'}
                            </span>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className={field.value ? 'bg-green-500 data-[state=checked]:bg-green-500' : ''}
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured Product</FormLabel>
                            <FormDescription>
                              Show this product in featured sections of the store
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SEO Card - Only shown in edit mode */}
              {isEditMode && (
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Settings</CardTitle>
                    <CardDescription>Search engine optimization settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={field.value ? field.value : "Product meta title for SEO"} 
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Title shown in search engines. Leave empty to use product name.
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
                                placeholder="Short description of the product for search engines" 
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Short description shown in search results. Leave empty to use first 160 characters of description.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="border rounded-lg p-4 bg-muted/20">
                        <h3 className="font-medium mb-2">Search Preview (English)</h3>
                        <div className="mb-1">
                          <p className="text-blue-600 font-medium">
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
                                "Search result description will appear here...")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {/* Status indicator */}
              <div className="flex items-center gap-2 py-2 px-4 rounded-md bg-muted/30">
                <div className={`w-3 h-3 rounded-full ${form.watch("published") ? "bg-green-500" : "bg-amber-500"}`}></div>
                <span className="text-sm font-medium">
                  Status: {form.watch("published") ? "Published" : "Draft"}
                </span>
                <div className="flex-1"></div>
                <div className="text-sm text-muted-foreground">
                  {form.watch("published") 
                    ? "This product is visible to customers" 
                    : "This product is saved as draft and not visible to customers"}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => navigate("/admin/products")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                
                {/* Save as draft button */}
                <Button 
                  type="button" 
                  variant="secondary"
                  disabled={isLoading}
                  onClick={() => {
                    // Set product as unpublished draft
                    form.setValue("published", false);
                    
                    // Submit the form
                    setTimeout(() => {
                      form.handleSubmit(onSubmit)();
                      
                      // Add a more reliable redirect after form submission
                      // This helps ensure navigation happens, especially when creating new products
                      setTimeout(() => {
                        console.log('Attempting fallback redirect to product list...');
                        navigate('/admin/products');
                        
                        // As a last resort, use direct window location
                        setTimeout(() => {
                          window.location.href = '/admin/products';
                        }, 500);
                      }, 1000);
                    }, 10);
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>
                
                {/* Save and publish button */}
                <Button 
                  type="button" 
                  disabled={isLoading}
                  onClick={() => {
                    // Set product as published
                    form.setValue("published", true);
                    
                    // Submit the form
                    setTimeout(() => {
                      form.handleSubmit(onSubmit)();

                      // Add a more reliable redirect after form submission
                      // This helps ensure navigation happens, especially when creating new products
                      setTimeout(() => {
                        console.log('Attempting fallback redirect to product list...');
                        navigate('/admin/products');
                        
                        // As a last resort, use direct window location
                        setTimeout(() => {
                          window.location.href = '/admin/products';
                        }, 500);
                      }, 1000);
                    }, 10);
                  }}
                >
                  <Package className="mr-2 h-4 w-4" />
                  {isLoading ? "Publishing..." : "Save & Publish"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}