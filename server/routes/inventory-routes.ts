import express from "express";
import { storage } from "../storage";
import { db } from "../db";
import { 
  insertInventoryTransactionSchema,
  InsertInventoryTransaction 
} from "@shared/schema";

// Auth middleware inline definition
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Admin access required" });
};

const router = express.Router();

// Get all products with inventory levels
router.get("/api/admin/inventory/products", isAdmin, async (req, res) => {
  try {
    // Get all products with their inventory levels
    const products = await storage.getProducts(true); // Include unpublished products for admin view
    
    // For each product, fetch its inventory level
    const productsWithInventory = await Promise.all(
      products.map(async (product) => {
        const inventoryLevel = await storage.getInventoryLevelByProductId(product.id);
        return {
          ...product,
          inventoryLevel
        };
      })
    );
    
    res.json(productsWithInventory);
  } catch (error) {
    console.error("Error fetching products with inventory:", error);
    res.status(500).json({ message: "Error fetching inventory data" });
  }
});

// Get low stock products
router.get("/api/admin/inventory/low-stock", isAdmin, async (req, res) => {
  try {
    const lowStockProducts = await storage.getLowStockProducts(20);
    
    // For each product, fetch its inventory level
    const lowStockWithInventory = await Promise.all(
      lowStockProducts.map(async (product) => {
        const inventoryLevel = await storage.getInventoryLevelByProductId(product.id);
        return {
          ...product,
          inventoryLevel
        };
      })
    );
    
    res.json(lowStockWithInventory);
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    res.status(500).json({ message: "Error fetching low stock products" });
  }
});

// Get recent inventory transactions
router.get("/api/admin/inventory/recent-transactions", isAdmin, async (req, res) => {
  try {
    const recentTransactions = await storage.getRecentInventoryTransactions(50);
    res.json(recentTransactions);
  } catch (error) {
    console.error("Error fetching inventory transactions:", error);
    res.status(500).json({ message: "Error fetching inventory transactions" });
  }
});

// Get inventory transactions for a specific product
router.get("/api/admin/inventory/transactions/:productId", isAdmin, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const transactions = await storage.getInventoryTransactionsByProductId(productId);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching product inventory transactions:", error);
    res.status(500).json({ message: "Error fetching product inventory transactions" });
  }
});

// Add a new inventory transaction
router.post("/api/admin/inventory/transaction", isAdmin, async (req, res) => {
  try {
    // Validate the request body
    const transactionData = insertInventoryTransactionSchema.parse({
      productId: req.body.productId,
      quantity: req.body.quantity,
      type: req.body.type || (req.body.quantity > 0 ? "add" : "remove"),
      notes: req.body.notes || null,
      createdBy: req.user?.username || null
    });
    
    // Add the transaction and update inventory levels
    const transaction = await storage.addInventoryTransaction(transactionData);
    
    res.status(201).json(transaction);
  } catch (error: any) {
    console.error("Error creating inventory transaction:", error);
    if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError" && 'errors' in error) {
      return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
    }
    res.status(500).json({ message: "Error updating inventory" });
  }
});

export default router;