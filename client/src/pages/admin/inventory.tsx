import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Search, AlertTriangle, Boxes, Package, ArrowUpDown, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import AdminLayout from "@/components/admin/admin-layout";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Types
interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  inStock: boolean;
}

interface InventoryLevel {
  id: number;
  productId: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number | null;
  lastUpdated: string;
}

interface InventoryTransaction {
  id: number;
  productId: number;
  quantity: number;
  type: string;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
}

interface ProductWithInventory extends Product {
  inventoryLevel: InventoryLevel | null;
}

// Schemas for forms
const transactionSchema = z.object({
  productId: z.number({ required_error: "Please select a product" }),
  quantity: z.number({ required_error: "Please enter a quantity" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be positive"),
  type: z.enum(["add", "remove", "adjustment"], { required_error: "Please select a transaction type" }),
  notes: z.string().optional(),
});

type TransactionValues = z.infer<typeof transactionSchema>;

// Main component
const InventoryPage: React.FC = () => {
  const { toast } = useToast();
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithInventory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("inventory");

  // Load low stock products
  const { data: lowStockProducts, isLoading: isLoadingLowStock } = useQuery<ProductWithInventory[]>({
    queryKey: ["/api/admin/inventory/low-stock"],
    refetchOnWindowFocus: false,
  });

  // Load all products with inventory
  const { data: allProducts, isLoading: isLoadingAll } = useQuery<ProductWithInventory[]>({
    queryKey: ["/api/admin/inventory/products"],
    refetchOnWindowFocus: false,
  });

  // Load recent transactions
  const { data: recentTransactions, isLoading: isLoadingTransactions } = useQuery<InventoryTransaction[]>({
    queryKey: ["/api/admin/inventory/recent-transactions"],
    refetchOnWindowFocus: false,
  });

  // Setup form for adding transaction
  const transactionForm = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      productId: 0,
      quantity: 1,
      type: "add",
      notes: "",
    },
  });

  // Filter products based on search query
  const filteredProducts = React.useMemo(() => {
    if (!allProducts) return [];
    if (!searchQuery.trim()) return allProducts;
    
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allProducts, searchQuery]);

  // Handle submitting the transaction form
  const handleTransactionSubmit = async (values: TransactionValues) => {
    try {
      // For "remove" operations, convert quantity to negative
      const finalQuantity = values.type === "remove" ? -Math.abs(values.quantity) : values.quantity;
      
      await apiRequest("POST", "/api/admin/inventory/transaction", {
        ...values,
        quantity: finalQuantity
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory/low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory/recent-transactions"] });
      
      toast({
        title: "Inventory Updated",
        description: "The inventory transaction has been recorded successfully.",
      });
      
      setIsTransactionDialogOpen(false);
      transactionForm.reset();
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast({
        title: "Error",
        description: "There was a problem updating the inventory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProductSelect = (product: ProductWithInventory) => {
    setSelectedProduct(product);
    transactionForm.setValue("productId", product.id);
    setIsTransactionDialogOpen(true);
  };

  // Function to show the stock status
  const getStockStatus = (product: ProductWithInventory) => {
    const level = product.inventoryLevel;
    const quantity = level?.quantity ?? product.quantity;
    const minLevel = level?.minStockLevel ?? 5;
    
    if (quantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (quantity <= minLevel) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">In Stock</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">
            Manage your product inventory, track stock levels, and record transactions.
          </p>
        </div>
        <Button onClick={() => setIsTransactionDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </div>

      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory" className="space-y-4">
            <div className="flex items-center py-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>
                  Manage inventory levels for all products.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Min Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingAll ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Loading inventory data...
                        </TableCell>
                      </TableRow>
                    ) : filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          {searchQuery ? "No products matching your search" : "No products found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.sku || "N/A"}</TableCell>
                          <TableCell>{product.inventoryLevel?.quantity ?? product.quantity}</TableCell>
                          <TableCell>{product.inventoryLevel?.minStockLevel ?? 5}</TableCell>
                          <TableCell>{getStockStatus(product)}</TableCell>
                          <TableCell>
                            {product.inventoryLevel?.lastUpdated 
                              ? new Date(product.inventoryLevel.lastUpdated).toLocaleString()
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProductSelect(product)}
                            >
                              <ArrowUpDown className="h-4 w-4 mr-1" /> Adjust
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="low-stock">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Products</CardTitle>
                <CardDescription>
                  Products with inventory levels below minimum threshold.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Min Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingLowStock ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Loading low stock products...
                        </TableCell>
                      </TableRow>
                    ) : lowStockProducts?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-center">
                            <Boxes className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">No low stock products</p>
                            <p className="text-sm text-muted-foreground">
                              All your products have adequate inventory levels.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      lowStockProducts?.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.inventoryLevel?.quantity ?? product.quantity}</TableCell>
                          <TableCell>{product.inventoryLevel?.minStockLevel ?? 5}</TableCell>
                          <TableCell>{getStockStatus(product)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProductSelect(product)}
                            >
                              <PlusCircle className="h-4 w-4 mr-1" /> Add Stock
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Inventory Transactions</CardTitle>
                <CardDescription>
                  History of recent stock level changes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTransactions ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Loading transaction history...
                        </TableCell>
                      </TableRow>
                    ) : recentTransactions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-center">
                            <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">No transaction history</p>
                            <p className="text-sm text-muted-foreground">
                              Start managing your inventory to see transactions.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentTransactions?.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>{transaction.productId}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.quantity > 0 ? "outline" : "destructive"} 
                              className={transaction.quantity > 0 ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                              {transaction.type || (transaction.quantity > 0 ? "Add" : "Remove")}
                            </Badge>
                          </TableCell>
                          <TableCell>{Math.abs(transaction.quantity)}</TableCell>
                          <TableCell>{transaction.createdBy || "System"}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {transaction.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Inventory Transaction</DialogTitle>
            <DialogDescription>
              {selectedProduct 
                ? `Update inventory for ${selectedProduct.name}`
                : "Add or remove stock for a product."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...transactionForm}>
            <form onSubmit={transactionForm.handleSubmit(handleTransactionSubmit)} className="space-y-4 pt-4">
              {!selectedProduct && (
                <FormField
                  control={transactionForm.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allProducts?.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={transactionForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="add">Add Stock</SelectItem>
                        <SelectItem value="remove">Remove Stock</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transactionForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the quantity to add or remove.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transactionForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Reason for this transaction" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsTransactionDialogOpen(false);
                  setSelectedProduct(null);
                  transactionForm.reset();
                }}>
                  Cancel
                </Button>
                <Button type="submit">Save Transaction</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default InventoryPage;