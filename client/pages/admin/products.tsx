import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import {
  Package,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  Filter,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Eye,
  Copy,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CURRENCIES } from "@/contexts/currency-context";

// Product type definition
type Product = {
  id: number;
  name: string;
  nameAr?: string;
  price: string;
  originalPrice?: string;
  categoryName: string;
  categoryNameAr?: string;
  imageUrl: string;
  featured: boolean;
  inStock: boolean;
  published: boolean;
  slug?: string;
  categoryId?: number;
  description?: string;
  descriptionAr?: string;
};

export default function ProductsManagement() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  // Fetch products with a stable query key
  const { data: products, isLoading, refetch } = useQuery<Product[]>({
    queryKey: ["/api/admin/products", searchQuery], // Keep a stable query key
    queryFn: async () => {
      console.log('🔍 ADMIN: Fetching all products...');
      
      // Add cache-busting parameter to URL
      const url = searchQuery 
        ? `/api/admin/products?search=${encodeURIComponent(searchQuery)}`
        : `/api/admin/products`;
        
      const response = await apiRequest("GET", url);
      
      const data = await response.json();
      console.log(`📊 ADMIN: Total product count in database: ${data.length}`);
      
      if (data.length > 0) {
        console.log(`📋 ADMIN: Product IDs fetched: ${data.map((p: any) => p.id).join(', ')}`);
      }
      
      return data;
    },
    staleTime: 0, // Consider data immediately stale
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true // Refetch when window regains focus
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refetch when searchQuery changes
    // because it's part of the queryKey
    queryClient.removeQueries({ queryKey: ["/api/admin/products", searchQuery] }); // Completely remove from cache
    refetch(); // Immediately refetch the data
  };
  
  // Only refetch on mount, not continuously
  useEffect(() => {
    console.log('Products page mounted, triggering one-time refetch');
    refetch();
  }, []);

  const handleEditProduct = (product: Product) => {
    // Navigate to edit page
    navigate(`/admin/products/${product.slug || product.id}`);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      // Delete the product via the API
      const response = await apiRequest("DELETE", `/api/admin/products/${selectedProduct.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      
      toast({
        title: "Product Deleted",
        description: `${selectedProduct.name} has been deleted successfully.`,
      });
      
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      
      // Completely remove queries from cache to force fresh data fetch
      queryClient.removeQueries({ queryKey: ["/api/admin/products"] });
      queryClient.removeQueries({ queryKey: ["/api/products"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleProductStock = async (product: Product) => {
    try {
      // Update the product stock status via API
      const response = await apiRequest("PATCH", `/api/admin/products/${product.id}`, {
        inStock: !product.inStock
      });
      
      if (!response.ok) {
        throw new Error("Failed to update product stock status");
      }
      
      toast({
        title: "Stock Status Updated",
        description: `${product.name} is now ${!product.inStock ? "in stock" : "out of stock"}.`,
      });
      
      // Refetch products
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product stock status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleProductPublished = async (product: Product) => {
    try {
      // Update the product published status via API
      const response = await apiRequest("PATCH", `/api/admin/products/${product.id}`, {
        published: !product.published
      });
      
      if (!response.ok) {
        throw new Error("Failed to update product publish status");
      }
      
      toast({
        title: !product.published ? "Product Published" : "Product Unpublished",
        description: !product.published 
          ? `${product.name} is now visible to customers.` 
          : `${product.name} has been saved as a draft and is hidden from customers.`,
      });
      
      // Refetch products
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product publish status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const viewProductDetails = (product: Product) => {
    // Navigate to the product view page in a new tab
    window.open(`/products/${product.slug || product.id}`, '_blank');
  };
  
  // Duplicate product mutation
  const duplicateMutation = useMutation({
    mutationFn: async (product: Product) => {
      console.log('🔄 Starting product duplication for:', product.name);
      
      // Create a new product based on the selected one
      const duplicatedData = {
        name: `Copy of ${product.name}`,
        nameAr: product.nameAr,
        description: product.description || '',
        descriptionAr: product.descriptionAr || '',
        // Pass the price directly without conversion
        price: product.price,
        // Pass the original price directly without conversion
        originalPrice: product.originalPrice,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        inStock: product.inStock,
        featured: product.featured,
        published: false, // Always start as draft
        // Generate a new slug based on the copied name
        slug: `copy-of-${product.slug || product.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`
      };
      
      console.log('📝 Duplicated product data:', duplicatedData);
      
      // Send to API
      const response = await apiRequest("POST", "/api/admin/products", duplicatedData);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create duplicate: ${errorText}`);
      }
      return await response.json();
    },
    onSuccess: (result) => {
      console.log('✅ Product successfully duplicated:', result);
      
      // Completely remove all product-related queries from cache
      queryClient.removeQueries({ predicate: (query) => {
        const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
        return typeof queryKey === 'string' && 
              (queryKey.startsWith('/api/admin/products') || 
               queryKey.startsWith('/api/products'));
      }});
      
      // Show success message
      toast({
        title: "Product Duplicated",
        description: `A new draft copy named "${result.name}" has been created.`,
      });
      
      // Refresh the product list
      refetch();
    },
    onError: (error) => {
      console.error('❌ Failed to duplicate product:', error);
      toast({
        title: "Duplication Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const duplicateProduct = (product: Product) => {
    duplicateMutation.mutate(product);
  };

  // We're now using real data from the API instead of mock data

  return (
    <AdminLayout>
      <SectionHeader
        title="Products Management"
        description="Manage your store's products"
        actions={
          <Button 
            onClick={() => {
              console.log('🚀 Add Product button clicked - navigating to new product form');
              // Use direct page navigation for better reliability
              window.location.href = "/admin/products/new";
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
                <DropdownMenuItem>Price (Low to High)</DropdownMenuItem>
                <DropdownMenuItem>Price (High to Low)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Featured</DropdownMenuItem>
                <DropdownMenuItem>In Stock</DropdownMenuItem>
                <DropdownMenuItem>Out of Stock</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <span className="ml-2">Loading products...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products && products.length > 0 ? (
                products.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md overflow-hidden">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      {product.nameAr && (
                        <div className="text-sm text-muted-foreground">{product.nameAr}</div>
                      )}
                      {product.featured && (
                        <Badge variant="outline" className="mt-1">Featured</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>{product.categoryName}</div>
                      {product.categoryNameAr && (
                        <div className="text-sm text-muted-foreground">{product.categoryNameAr}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {product.inStock ? (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Out of Stock
                          </Badge>
                        )}
                        
                        {!product.published && (
                          <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">
                            Draft
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {`ر.ع ${parseFloat(product.price)} (OMR)`}
                      </div>
                      {product.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          {`ر.ع ${parseFloat(product.originalPrice)} (OMR)`}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(product)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleProductStock(product)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {product.inStock ? "Mark as Out of Stock" : "Mark as In Stock"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleProductPublished(product)}>
                            {product.published ? (
                              <>
                                <Eye className="mr-2 h-4 w-4 text-amber-500" />
                                Unpublish (Save as Draft)
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4 text-green-500" />
                                Publish Product
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => viewProductDetails(product)}>
                            <Package className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => duplicateProduct(product)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="flex items-center space-x-4 py-4">
              <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{selectedProduct.name}</h3>
                {selectedProduct.nameAr && (
                  <p className="text-sm text-muted-foreground">{selectedProduct.nameAr}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedProduct.categoryName} • ر.ع {parseFloat(selectedProduct.price)} (OMR)
                </p>
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