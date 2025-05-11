import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Layers,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  Filter,
  Package,
  ArrowUpDown,
  AlertCircle,
  X,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { SectionHeader } from "@/components/admin/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

// Mock category type
interface Category {
  id: number;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  descriptionAr?: string;
  imageUrl?: string;
  productCount: number;
}

const CategoryForm = ({ 
  category,
  isOpen,
  onClose,
  onSave
}: { 
  category?: Category, 
  isOpen: boolean,
  onClose: () => void,
  onSave: (data: any) => void
}) => {
  const { toast } = useToast();
  
  // Initialize form data state
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    slug: "",
    description: "",
    descriptionAr: "",
    imageUrl: ""
  });

  // Update form data when category changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: category?.name || "",
        nameAr: category?.nameAr || "",
        slug: category?.slug || "",
        description: category?.description || "",
        descriptionAr: category?.descriptionAr || "",
        imageUrl: category?.imageUrl || ""
      });
    }
  }, [category, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Auto-generate slug from name only if it's a new category or user hasn't modified the slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const currentSlug = formData.slug;
    const nameBasedSlug = name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
    
    // Only auto-update slug if it's empty or hasn't been manually edited
    const shouldUpdateSlug = !currentSlug || 
      (category?.name && 
       category.slug === currentSlug && 
       category.name !== name);
    
    setFormData(prev => ({
      ...prev,
      name,
      slug: shouldUpdateSlug ? nameBasedSlug : prev.slug
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
          <DialogDescription>
            {category 
              ? "Update the category details below." 
              : "Fill in the details to create a new category."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nameAr" className="text-right">
                Name (Arabic)
              </Label>
              <Input
                id="nameAr"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleChange}
                className="col-span-3"
                dir="rtl"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                Slug
              </Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descriptionAr" className="text-right">
                Description (Arabic)
              </Label>
              <Input
                id="descriptionAr"
                name="descriptionAr"
                value={formData.descriptionAr}
                onChange={handleChange}
                className="col-span-3"
                dir="rtl"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">
                Image
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      document.getElementById('categoryImageUpload')?.click();
                    }}
                  >
                    {formData.imageUrl ? 'Change Image' : 'Upload Image'}
                  </Button>
                </div>
                
                {formData.imageUrl && (
                  <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                    <img 
                      src={formData.imageUrl}
                      alt="Category preview"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <input 
                  type="file" 
                  id="categoryImageUpload"
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
                    
                    try {
                      const response = await fetch('/api/admin/categories/upload', {
                        method: 'POST',
                        body: formData,
                        credentials: 'include',
                      });
                      
                      if (!response.ok) {
                        throw new Error('Failed to upload image');
                      }
                      
                      const result = await response.json();
                      
                      // Update the form with the new image URL
                      setFormData(prev => ({ ...prev, imageUrl: result.url }));
                    } catch (error) {
                      console.error('Error uploading image:', error);
                      toast({
                        title: "Upload Failed",
                        description: "There was an error uploading the image.",
                        variant: "destructive"
                      });
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function CategoriesManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch categories from the API
  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ["/api/admin/categories", searchQuery],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      
      // Filter by search query if provided
      if (searchQuery) {
        return data.filter((category: Category) => 
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      return data;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Refetch is triggered automatically due to search query in queryKey
    queryClient.invalidateQueries({ queryKey: ["/api/admin/categories", searchQuery] });
  };

  const handleAddNew = () => {
    setSelectedCategory(undefined);
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/categories", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create category");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Category Created",
        description: `${data.name} has been created successfully.`,
      });
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating the category.",
        variant: "destructive",
      });
    }
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/categories/${id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update category");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Category Updated",
        description: `${data.name} has been updated successfully.`,
      });
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the category.",
        variant: "destructive",
      });
    }
  });

  const handleSaveCategory = (data: any) => {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/categories/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete category");
      }
      return await response.json();
    },
    onSuccess: (_, variables) => {
      const categoryName = selectedCategory?.name || "Category";
      toast({
        title: "Category Deleted",
        description: `${categoryName} has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setSelectedCategory(undefined);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the category.",
        variant: "destructive",
      });
    }
  });

  const confirmDelete = () => {
    if (!selectedCategory) return;
    deleteMutation.mutate(selectedCategory.id);
  };

  return (
    <AdminLayout>
      <SectionHeader
        title="Categories Management"
        description="Manage your product categories"
        actions={
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Sort by
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-2">Loading categories...</span>
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category: Category) => (
              <Card key={category.id} className="overflow-hidden">
                <div className="relative h-40 w-full">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                      <Layers className="h-12 w-12 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(category)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <a href={`/admin/products?category=${category.id}`}>
                            <Package className="mr-2 h-4 w-4" />
                            View Products
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-medium text-lg">{category.name}</h3>
                    {category.nameAr && (
                      <p className="text-sm text-muted-foreground" dir="rtl">{category.nameAr}</p>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{category.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-muted-foreground">{category.slug}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No categories found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No categories match your search criteria or you haven't added any categories yet.
            </p>
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Category
            </Button>
          </div>
        )}
      </div>

      {/* Category Form Dialog */}
      <CategoryForm
        category={selectedCategory}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveCategory}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              {selectedCategory?.productCount && selectedCategory.productCount > 0 && (
                <div className="mt-2 text-amber-500">
                  Warning: This category contains {selectedCategory.productCount} products. 
                  Deleting it may affect those products.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="flex items-start space-x-4 py-4">
              {selectedCategory.imageUrl ? (
                <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={selectedCategory.imageUrl} 
                    alt={selectedCategory.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <Layers className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="font-medium">{selectedCategory.name}</h3>
                {selectedCategory.nameAr && (
                  <p className="text-sm text-muted-foreground" dir="rtl">{selectedCategory.nameAr}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">Slug: {selectedCategory.slug}</p>
              </div>
            </div>
          )}
          <Separator />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}