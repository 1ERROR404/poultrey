import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '@/lib/quill-image-resize';
import { CURRENCIES } from '@/contexts/currency-context';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, ArrowLeft, Save, X, Plus, Image as ImageIcon, Check, Star, Trash2, AlertTriangle, Upload } from 'lucide-react';
import AdminLayout from '@/components/admin/admin-layout';
import { SectionHeader } from '@/components/admin/section-header';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Form validation schema
const productSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters' }),
  nameAr: z.string().optional(),
  slug: z.string().min(3, { message: 'Slug must be at least 3 characters' })
    .refine(val => /^[a-z0-9-]+$/.test(val), { 
      message: 'Slug can only contain lowercase letters, numbers, and hyphens' 
    }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  descriptionAr: z.string().optional(),
  price: z.string().refine(val => !isNaN(parseFloat(val)), { message: 'Price must be a valid number' }),
  originalPrice: z.string().optional().refine(val => !val || !isNaN(parseFloat(val)), { 
    message: 'Original price must be a valid number' 
  }),
  categoryId: z.string().min(1, { message: 'Please select a category' }),
  imageUrl: z.string().optional(),
  sku: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
  published: z.boolean().default(true) // Add published field with default true
});

type ProductFormValues = z.infer<typeof productSchema>;

// Define product image interface
interface ProductImage {
  id: number;
  productId: number;
  url: string;
  isPrimary: boolean;
  alt: string;
  displayOrder: number;
  createdAt?: string;
}

// Product Images Management Component
const ProductImagesManager = ({ 
  productId, 
  onSetPrimaryImage 
}: { 
  productId: number; 
  onSetPrimaryImage: (url: string) => void;
}) => {
  const { toast } = useToast();
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ProductImage | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch product images
  const { 
    data: images = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: [`/api/admin/products/${productId}/images`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/products/${productId}/images`);
      if (!response.ok) {
        throw new Error('Failed to fetch product images');
      }
      return await response.json();
    },
    enabled: !!productId
  });

  // Add image mutation
  const addImageMutation = useMutation({
    mutationFn: async (imageData: { url: string; alt: string; isPrimary: boolean }) => {
      const response = await apiRequest('POST', `/api/admin/products/${productId}/images`, imageData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add image');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Image Added',
        description: 'The image has been successfully added to the product.',
      });
      setNewImageUrl('');
      setNewImageAlt('');
      setIsAddingImage(false);
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add image. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Set primary image mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await apiRequest('PATCH', `/api/admin/products/images/${imageId}`, { 
        isPrimary: true 
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to set primary image');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('🖼️ Primary image updated successfully:', data);
      
      // Force invalidation for all product queries to ensure the update is seen everywhere
      console.log('🧹 Purging all product data from cache after primary image update...');
      
      // Remove all product queries to force refetch of data
      queryClient.removeQueries({ queryKey: ['/api/admin/products'] });
      queryClient.removeQueries({ queryKey: ['/api/products'] });
      
      // Also invalidate any specific product queries
      if (productId) {
        queryClient.removeQueries({ queryKey: [`/api/admin/products/${productId}`] });
        queryClient.removeQueries({ queryKey: [`/api/products/${productId}`] });
      }
      
      // Invalidate by pattern to catch any nested queries
      queryClient.removeQueries({ 
        predicate: (query) => {
          const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
          return typeof queryKey === 'string' && 
                (queryKey.startsWith('/api/admin/products') || 
                 queryKey.startsWith('/api/products'));
        }
      });
      
      toast({
        title: 'Primary Image Updated',
        description: 'The primary product image has been updated.',
      });
      
      // Update the main product imageUrl via callback
      onSetPrimaryImage(data.url);
      
      // Also refresh the current images list
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to set primary image. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/products/images/${imageId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete image');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('🗑️ Image deleted successfully:', data);
      
      // Force invalidation for all product queries to ensure the update is seen everywhere
      console.log('🧹 Purging all product data from cache after image deletion...');
      
      // Remove all product queries to force refetch of data
      queryClient.removeQueries({ queryKey: ['/api/admin/products'] });
      queryClient.removeQueries({ queryKey: ['/api/products'] });
      
      // Also invalidate any specific product queries
      if (productId) {
        queryClient.removeQueries({ queryKey: [`/api/admin/products/${productId}`] });
        queryClient.removeQueries({ queryKey: [`/api/products/${productId}`] });
      }
      
      // Invalidate by pattern to catch any nested queries
      queryClient.removeQueries({ 
        predicate: (query) => {
          const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
          return typeof queryKey === 'string' && 
                (queryKey.startsWith('/api/admin/products') || 
                 queryKey.startsWith('/api/products'));
        }
      });
      
      toast({
        title: 'Image Deleted',
        description: 'The image has been successfully removed.',
      });
      setImageToDelete(null);
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete image. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleAddImage = () => {
    if (!newImageUrl) {
      toast({
        title: 'Missing URL',
        description: 'Please enter a valid image URL.',
        variant: 'destructive',
      });
      return;
    }

    addImageMutation.mutate({
      url: newImageUrl,
      alt: newImageAlt || '',
      isPrimary: images.length === 0 // If first image, set as primary
    });
  };
  
  const handleUploadImage = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select an image file to upload.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('alt', newImageAlt || '');
      const isPrimary = images.length === 0;
      formData.append('isPrimary', String(isPrimary)); // If first image, set as primary
      
      console.log('Uploading file:', selectedFile.name, 'Size:', selectedFile.size, 'Type:', selectedFile.type);
      console.log('Upload endpoint:', `/api/admin/products/${productId}/images/upload`);
      console.log('Is Primary:', isPrimary);
      
      const response = await fetch(`/api/admin/products/${productId}/images/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }
      
      const result = await response.json();
      console.log('Upload result:', result);
      
      toast({
        title: 'Image Uploaded',
        description: 'The image has been successfully uploaded and added to the product.',
      });
      
      setSelectedFile(null);
      setNewImageAlt('');
      setIsAddingImage(false);
      
      // If it's being set as the primary image, we need extensive cache invalidation
      if (isPrimary) {
        console.log('🖼️ Primary image uploaded:', result.url);
        console.log('🧹 Purging all product data from cache after primary image upload...');
        
        // Force invalidation for all product queries to ensure the update is seen everywhere
        queryClient.removeQueries({ queryKey: ['/api/admin/products'] });
        queryClient.removeQueries({ queryKey: ['/api/products'] });
        
        // Also invalidate any specific product queries
        if (productId) {
          queryClient.removeQueries({ queryKey: [`/api/admin/products/${productId}`] });
          queryClient.removeQueries({ queryKey: [`/api/products/${productId}`] });
        }
        
        // Invalidate by pattern to catch any nested queries
        queryClient.removeQueries({ 
          predicate: (query) => {
            const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
            return typeof queryKey === 'string' && 
                  (queryKey.startsWith('/api/admin/products') || 
                   queryKey.startsWith('/api/products'));
          }
        });
        
        // If it's the first image, set it as the main product image in the form
        onSetPrimaryImage(result.url);
      }
      
      // Always refresh the current images list
      refetch();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = (image: ProductImage) => {
    if (!image.isPrimary) {
      setPrimaryMutation.mutate(image.id);
    }
  };

  const confirmDeleteImage = (image: ProductImage) => {
    setImageToDelete(image);
  };

  const handleDeleteImage = () => {
    if (imageToDelete) {
      deleteImageMutation.mutate(imageToDelete.id);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center justify-between">
        <span>Product Images</span>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => setIsAddingImage(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </h3>

      {/* Image Grid */}
      {isLoading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center p-6 border border-dashed rounded-lg">
          <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No images yet. Add product images to enhance your listing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image: ProductImage) => (
            <div 
              key={image.id} 
              className={cn(
                "relative border rounded-md overflow-hidden group",
                image.isPrimary && "ring-2 ring-primary"
              )}
            >
              <img 
                src={image.url} 
                alt={image.alt || "Product image"} 
                className="w-full h-32 object-cover"
                onError={(e) => {
                  console.log('Image loading error:', image.url);
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/600x400?text=Image+Error';
                }}
              />
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {image.isPrimary && (
                  <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Primary
                  </Badge>
                )}
                <div className="flex space-x-2">
                  {!image.isPrimary && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSetPrimary(image)}
                            disabled={setPrimaryMutation.isPending}
                          >
                            {setPrimaryMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Set as primary image</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmDeleteImage(image)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete image</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {image.alt && (
                  <p className="text-xs text-white/80 mt-2 px-2 text-center truncate max-w-full">
                    {image.alt}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Image Dialog */}
      <Dialog open={isAddingImage} onOpenChange={setIsAddingImage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product Image</DialogTitle>
            <DialogDescription>
              Upload an image from your computer or enter an image URL.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="url">Image URL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <FormLabel htmlFor="imageFile">Select Image File</FormLabel>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          setSelectedFile(files[0]);
                        }
                      }}
                    />
                    <label htmlFor="imageFile" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        {selectedFile ? (
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                        ) : (
                          <>
                            <p className="text-sm font-medium">Click to select an image</p>
                            <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
                
                {selectedFile && (
                  <div className="border rounded-md overflow-hidden mt-4">
                    <img 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Preview" 
                      className="w-full h-40 object-contain"
                    />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <FormLabel htmlFor="imageUrl">Image URL</FormLabel>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                </div>
                
                {newImageUrl && (
                  <div className="border rounded-md overflow-hidden mt-4">
                    <img 
                      src={newImageUrl} 
                      alt="Preview" 
                      className="w-full h-40 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="space-y-2">
              <FormLabel htmlFor="imageAlt">Alt Text (Optional)</FormLabel>
              <Input
                id="imageAlt"
                placeholder="Brief description of the image"
                value={newImageAlt}
                onChange={(e) => setNewImageAlt(e.target.value)}
              />
              <FormDescription>
                Helps with accessibility and SEO.
              </FormDescription>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddingImage(false);
                setSelectedFile(null);
                setNewImageUrl('');
                setNewImageAlt('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={selectedFile ? handleUploadImage : handleAddImage}
              disabled={(addImageMutation.isPending || isUploading) || (!selectedFile && !newImageUrl)}
            >
              {(addImageMutation.isPending || isUploading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Image
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {imageToDelete && (
            <div className="border rounded-md overflow-hidden my-4">
              <img 
                src={imageToDelete.url} 
                alt={imageToDelete.alt || "Product image"} 
                className="w-full h-40 object-contain"
              />
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteImage}
              disabled={deleteImageMutation.isPending}
            >
              {deleteImageMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Image
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function ProductForm() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = slug !== 'new';
  const [productId, setProductId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get product data if editing
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: [`/api/admin/products/${slug}`],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/admin/products/${slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product data. Please try again.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    enabled: isEditing && slug !== 'new', // Only run the query for existing products
  });

  // Get categories for the dropdown
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/categories');
      return await response.json();
    },
  });

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      slug: '',
      description: '',
      descriptionAr: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      imageUrl: '',
      sku: '',
      weight: '',
      dimensions: '',
      featured: false,
      inStock: true,
      published: true
    },
  });

  // Update form and set productId when product data loads
  useEffect(() => {
    if (product && isEditing) {
      form.reset({
        name: product.name || '',
        nameAr: product.nameAr || '',
        slug: product.slug || '',
        description: product.description || '',
        descriptionAr: product.descriptionAr || '',
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        categoryId: product.categoryId?.toString() || '',
        imageUrl: product.imageUrl || '',
        sku: product.sku || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        featured: product.featured || false,
        inStock: product.inStock !== undefined ? product.inStock : true,
        published: product.published !== undefined ? product.published : true
      });
      
      // Set the productId for the image manager
      setProductId(product.id);
    }
  }, [product, form, isEditing]);
  
  // Handle setting a new primary image URL
  const handleSetPrimaryImage = (url: string) => {
    form.setValue('imageUrl', url);
  };

  // Create or update product mutation
  const mutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Log form data being submitted
      console.log('Product form submit data:', data);
      
      const payload = {
        ...data,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
        categoryId: parseInt(data.categoryId),
        published: data.published !== undefined ? data.published : true, // Ensure published is explicitly set
      };
      
      console.log('Submitting product payload:', payload);
      
      if (isEditing) {
        console.log(`Updating product ${product?.id}`);
        const response = await apiRequest('PATCH', `/api/admin/products/${product?.id}`, payload);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to update product:', errorText);
          const error = errorText ? JSON.parse(errorText) : {};
          throw new Error(error.message || 'Failed to update product');
        }
        const result = await response.json();
        console.log('Product updated successfully:', result);
        return result;
      } else {
        console.log('Creating new product');
        const response = await apiRequest('POST', '/api/admin/products', payload);
        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to create product:', errorText);
          try {
            const error = errorText ? JSON.parse(errorText) : {};
            throw new Error(error.message || 'Failed to create product');
          } catch (e) {
            throw new Error('Failed to create product: ' + errorText);
          }
        }
        const result = await response.json();
        console.log('Product created successfully:', result);
        return result;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 MUTATION SUCCESS! Data received:', data);
      console.log('⏱️ Success time:', new Date().toISOString());
      
      // Reset the submitting state
      setIsSubmitting(false);
      
      toast({
        title: isEditing ? 'Product Updated' : 'Product Created',
        description: isEditing ? 'The product has been successfully updated.' : 'The product has been successfully created.',
      });
      
      // For new products, set the product ID
      if (!isEditing && data?.id) {
        setProductId(data.id);
        console.log('✅ New product ID set:', data.id);
      }
      
      // Force invalidation to refetch all product-related data
      console.log('🔄 Invalidating queries...');
      
      // Remove queries to force refetch the data - more reliable than invalidate
      queryClient.removeQueries({ queryKey: ['/api/admin/products'] });
      queryClient.removeQueries({ queryKey: ['/api/products'] });
      
      // Invalidate specific product queries
      if (data?.slug) {
        console.log('🔄 Invalidating specific slug queries for:', data.slug);
        queryClient.invalidateQueries({ queryKey: [`/api/products/${data.slug}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/admin/products/${data.slug}`] });
      }
      
      if (isEditing && slug) {
        console.log('🔄 Invalidating edited product queries for:', slug);
        queryClient.invalidateQueries({ queryKey: [`/api/admin/products/${slug}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/products/${slug}`] });
      }
      
      console.log('🚀 CRITICAL: Starting navigation to admin products page...');
      
      // ===== MOST RELIABLE NAVIGATION APPROACH =====
      // Create a visible emergency redirect button first in case all automatic redirects fail
      console.log('📢 Creating emergency visible redirect button');
      const emergencyButton = document.createElement('button');
      emergencyButton.innerText = 'CLICK HERE TO RETURN TO PRODUCTS LIST';
      emergencyButton.style.position = 'fixed';
      emergencyButton.style.top = '10px';
      emergencyButton.style.left = '10px';
      emergencyButton.style.zIndex = '99999';
      emergencyButton.style.padding = '10px';
      emergencyButton.style.backgroundColor = 'red';
      emergencyButton.style.color = 'white';
      emergencyButton.style.fontWeight = 'bold';
      emergencyButton.style.borderRadius = '5px';
      emergencyButton.style.cursor = 'pointer';
      emergencyButton.onclick = () => { window.location.href = '/admin/products'; };
      document.body.appendChild(emergencyButton);
      
      // Now try automatic redirects in sequence with small delays between them
      console.log('⏱️ Trying window.location.replace immediately');
      window.location.replace('/admin/products');
      
      // Fallback 1: Direct location change (after 200ms)
      setTimeout(() => {
        console.log('⏱️ Fallback 1: Trying window.location.href');
        window.location.href = '/admin/products';
      }, 200);
      
      // Fallback 2: Create and click a link (after 400ms)
      setTimeout(() => {
        console.log('⏱️ Fallback 2: Creating and clicking a link');
        const link = document.createElement('a');
        link.href = '/admin/products';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 400);
      
      // Fallback 3: Use wouter navigate (after 600ms)
      setTimeout(() => {
        console.log('⏱️ Fallback 3: Using wouter navigate');
        navigate('/admin/products');
      }, 600);
      
      // Fallback 4: History API (after 800ms)
      setTimeout(() => {
        console.log('⏱️ Fallback 4: Using History API');
        window.history.pushState({}, '', '/admin/products');
        window.history.go();
      }, 800);
    },
    onError: (error: Error) => {
      console.error('Form submission error:', error);
      
      // Reset the submitting state
      setIsSubmitting(false);
      
      // Check for form errors
      const formErrors = form.formState.errors;
      if (Object.keys(formErrors).length > 0) {
        console.log('Form validation errors:', formErrors);
        
        // Get the first field with an error
        const firstErrorField = Object.keys(formErrors)[0];
        
        // Scroll to the field with an error
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          console.log(`Scrolled to error field: ${firstErrorField}`);
        }
      }
      
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    console.log('🚀 FORM SUBMIT: Starting product form submission with values:', values);
    console.log('⏱️ Form submit time:', new Date().toISOString());
    
    // Document current page state
    console.log('📍 Current path when submitting:', window.location.pathname);
    console.log('📍 Is editing mode:', isEditing);
    
    // Explicitly ensure published is set
    if (values.published === undefined) {
      values.published = true;
      console.log('🔧 Setting published to true (was undefined)');
    }
    
    // Make sure form-related flags are explicitly set as booleans
    values.published = !!values.published;
    values.featured = !!values.featured;
    values.inStock = values.inStock !== undefined ? !!values.inStock : true;
    
    console.log('📝 Final submission values:', {
      ...values,
      published: values.published,
      featured: values.featured,
      inStock: values.inStock
    });
    
    // Set loading state to provide visual feedback
    setIsSubmitting(true);
    
    try {
      // Submit the form
      console.log('📤 Calling mutation.mutate()...');
      mutation.mutate(values);
    } catch (error) {
      console.error('❌ Error during form mutation:', error);
      setIsSubmitting(false);
      
      toast({
        title: 'Error',
        description: 'Something went wrong with form submission. Please try again.',
        variant: 'destructive',
      });
    }
    
    console.log('✅ Form submission process initiated');
  };

  if (isLoadingProduct && isEditing) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading product...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SectionHeader
        title={isEditing ? 'Edit Product' : 'Create Product'}
        description={isEditing ? 'Update product information' : 'Add a new product to your store'}
        actions={
          <Button variant="outline" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        }
      />



      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - First Column (spans 2 columns on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name (English)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Automatic Chicken Feeder" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="nameAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name (Arabic)</FormLabel>
                            <FormControl>
                              <Input dir="rtl" className="text-right" placeholder="e.g. معلف الدجاج الآلي" {...field} />
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
                            <FormControl>
                              <Input placeholder="e.g. automatic-chicken-feeder" {...field} />
                            </FormControl>
                            <FormDescription>
                              Used for the product URL. Only lowercase letters, numbers, and hyphens.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (OMR - ر.ع)</FormLabel>
                              <FormControl>
                                <Input type="text" placeholder="e.g. 49.99" {...field} />
                              </FormControl>
                              <FormDescription>
                                Price in base USD will be converted to OMR (ر.ع {parseFloat(field.value || "0") * CURRENCIES.OMR.exchangeRate})
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
                                <Input type="text" placeholder="e.g. 59.99" {...field} />
                              </FormControl>
                              <FormDescription>
                                Original price in OMR: {field.value ? `ر.ع ${parseFloat(field.value) * CURRENCIES.OMR.exchangeRate}` : "N/A"} (for showing discounted prices)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* English Description */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">English Description</h3>
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Main Description</FormLabel>
                            <FormControl>
                              <ReactQuill
                                theme="snow"
                                className="auto-expand-editor"
                                modules={{
                                  toolbar: [
                                    [{ 'header': [1, 2, 3, false] }],
                                    ['bold', 'italic', 'underline', 'strike'],
                                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                    [{ 'color': [] }, { 'background': [] }],
                                    ['link', 'image'],
                                    ['clean']
                                  ],
                                  imageResize: {
                                    modules: ['Resize']
                                  }
                                }}
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormDescription>
                              Format your description with styling, lists, links, and even images for better product presentation.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    {/* Arabic Description */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-right">وصف المنتج (العربية)</h3>
                      
                      <FormField
                        control={form.control}
                        name="descriptionAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block text-right">الوصف الرئيسي</FormLabel>
                            <FormControl>
                              <div dir="rtl">
                                <ReactQuill
                                  theme="snow"
                                  modules={{
                                    toolbar: [
                                      [{ 'header': [1, 2, 3, false] }],
                                      ['bold', 'italic', 'underline', 'strike'],
                                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                      [{ 'color': [] }, { 'background': [] }],
                                      ['link', 'image'],
                                      ['clean']
                                    ],
                                    imageResize: {
                                      modules: ['Resize']
                                    }
                                  }}
                                  value={field.value || ''}
                                  onChange={field.onChange}
                                  style={{ direction: 'rtl' }}
                                  className="text-right auto-expand-editor"
                                />
                              </div>
                            </FormControl>
                            <FormDescription className="text-right">
                              نسق وصفك بأنماط، قوائم، روابط وحتى صور لعرض أفضل للمنتج.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar - Second Column */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingCategories ? (
                                <div className="flex items-center justify-center py-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="ml-2">Loading...</span>
                                </div>
                              ) : categories && categories.length > 0 ? (
                                categories.map((category: any) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name} {category.nameAr && `(${category.nameAr})`}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-categories" disabled>
                                  No categories available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
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
                            <Input placeholder="e.g. PG-FEEDER-001" {...field} />
                          </FormControl>
                          <FormDescription>Stock Keeping Unit (product code)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 2.5 kg" {...field} />
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
                              <Input placeholder="e.g. 30 x 20 x 15 cm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Featured Product</FormLabel>
                            <FormDescription>
                              Display this product on the home page
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="inStock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>In Stock</FormLabel>
                            <FormDescription>
                              Is this product currently available?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Published</FormLabel>
                            <FormDescription>
                              Show this product on the website
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Image Management - Only shown when editing a product or after creating one */}
              {productId && (
                <Card>
                  <CardContent className="pt-6">
                    <ProductImagesManager 
                      productId={productId} 
                      onSetPrimaryImage={handleSetPrimaryImage} 
                    />
                  </CardContent>
                </Card>
              )}
              
              <div className="sticky top-4 space-y-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                  onClick={() => {
                    console.log('✅ Submit button clicked');
                    // Log current time to match with server logs
                    console.log('⏱️ Click time:', new Date().toISOString());
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? 'Update & Publish' : 'Save & Publish'}
                    </>
                  )}
                </Button>
                
                {/* Debug Button - Direct Navigation */}
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    console.log('🧪 TEST: Direct navigation triggered');
                    window.location.href = '/admin/products';
                  }}
                >
                  Test Redirect
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}