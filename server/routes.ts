import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWaitlistSchema, insertContactSchema, type Product } from "@shared/schema";
import { setupAuth } from "./auth";
import { setupUserRoutes } from "./routes/user-routes";
import { setupAdminRoutes } from "./routes/admin-routes";
import inventoryRoutes from "./routes/inventory-routes";
import { notificationRouter } from "./routes/notification-routes";
import { registerAddressRoutes } from "./routes/address-routes";
import { invoiceRouter } from "./routes/invoice-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication - must be done first
  const { isAuthenticated, isAdmin } = setupAuth(app);
  
  // Set up user management routes
  app.use("/api/user", setupUserRoutes(isAuthenticated));
  
  // Set up admin routes
  app.use("/api/admin", setupAdminRoutes(isAdmin));
  
  // Set up inventory routes
  app.use(inventoryRoutes);
  
  // Set up stock notification routes
  app.use("/api", notificationRouter);
  
  // Register address routes
  registerAddressRoutes(app);
  
  // Register public invoice routes
  app.use("/api", invoiceRouter);
  
  // Cart routes - all require authentication
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const cartItems = await storage.getUserCartItems(req.user!.id);
      
      // Fetch complete product data for each cart item
      const cartItemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json(cartItemsWithProducts);
    } catch (error) {
      console.error("Error fetching user cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  
  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      
      // Verify product exists
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const cartItem = await storage.addCartItem({
        userId: req.user!.id,
        productId,
        quantity
      });
      
      // Return the cart item with product details
      res.status(201).json({
        ...cartItem,
        product
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  
  app.put("/api/cart/:productId", isAuthenticated, async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
      
      const updatedCartItem = await storage.updateCartItemQuantity(
        req.user!.id,
        parseInt(productId),
        quantity
      );
      
      // Return the updated cart item with product details
      const product = await storage.getProductById(updatedCartItem.productId);
      res.json({
        ...updatedCartItem,
        product
      });
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  
  app.delete("/api/cart/:productId", isAuthenticated, async (req, res) => {
    try {
      const { productId } = req.params;
      const removed = await storage.removeCartItem(req.user!.id, parseInt(productId));
      
      if (!removed) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });
  
  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      await storage.clearUserCart(req.user!.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  
  // Removing original checkout endpoint - replaced by universal checkout below that supports both 
  // guest and authenticated checkout
  
  // Order routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      // Get user's orders
      const orders = await storage.getOrdersByUserId(req.user!.id);
      
      // For each order, get its items
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItemsByOrderId(order.id);
          
          // For each item, get product details
          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const product = await storage.getProductById(item.productId);
              return {
                ...item,
                product: product || { name: "Product no longer available" }
              };
            })
          );
          
          return {
            ...order,
            items: itemsWithProducts
          };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  // Get a specific order
  app.get("/api/orders/:orderId", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the order belongs to the authenticated user
      if (order.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get order items
      const items = await storage.getOrderItemsByOrderId(order.id);
      
      // For each item, get product details
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return {
            ...item,
            product: product || { name: "Product no longer available" }
          };
        })
      );
      
      res.json({
        ...order,
        items: itemsWithProducts
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  // Categories endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Products endpoints
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, search, featured } = req.query;
      
      // For non-admin routes, always filter out unpublished products
      const includeUnpublished = false;
      
      if (search && typeof search === "string") {
        const products = await storage.searchProducts(search, includeUnpublished);
        return res.json(products);
      }
      
      if (categoryId && typeof categoryId === "string") {
        const categoryIdNum = parseInt(categoryId, 10);
        if (isNaN(categoryIdNum)) {
          return res.status(400).json({ message: "Invalid category ID" });
        }
        const products = await storage.getProductsByCategory(categoryIdNum, includeUnpublished);
        return res.json(products);
      }
      
      if (featured === "true") {
        const featuredProducts = await storage.getFeaturedProducts(includeUnpublished);
        return res.json(featuredProducts);
      }
      
      const products = await storage.getProducts(includeUnpublished);
      
      // Make sure the new fields have proper default values
      const normalizedProducts = products.map(product => {
        return {
          ...product,
          additionalImages: product.additionalImages || [],
          specs: product.specs || {},
          features: product.features || [],
          tags: product.tags || [],
          sku: product.sku || '',
          weight: product.weight || '',
          dimensions: product.dimensions || '',
          warrantyInfo: product.warrantyInfo || '',
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
        };
      });
      
      res.json(normalizedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      // For non-admin routes, always filter out unpublished products
      const includeUnpublished = false;
      
      const product = await storage.getProductBySlug(req.params.slug, includeUnpublished);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get all product images from the product_images table
      const productImages = await storage.getProductImages(product.id);
      
      // Create an array of image URLs for additionalImages
      // Skip the primary image as it's already included in imageUrl
      const additionalImagesUrls = productImages
        .filter(img => !img.isPrimary)
        .map(img => img.url);
      
      // Make sure the new fields have proper default values for individual product
      const normalizedProduct = {
        ...product,
        additionalImages: additionalImagesUrls,
        specs: product.specs || {},
        features: product.features || [],
        tags: product.tags || [],
        sku: product.sku || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        warrantyInfo: product.warrantyInfo || '',
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
      };
      
      res.json(normalizedProduct);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  
  // Delete product by slug
  app.delete("/api/products/:slug", async (req, res) => {
    try {
      const isDeleted = await storage.deleteProductBySlug(req.params.slug);
      if (!isDeleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Waitlist (newsletter signup)
  app.post("/api/waitlist", async (req, res) => {
    try {
      const parseResult = insertWaitlistSchema.safeParse({
        ...req.body,
        createdAt: new Date().toISOString(),
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid waitlist entry data", 
          errors: parseResult.error.errors 
        });
      }
      
      const entry = await storage.createWaitlistEntry(parseResult.data);
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create waitlist entry" });
    }
  });

  // Contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const parseResult = insertContactSchema.safeParse({
        ...req.body,
        createdAt: new Date().toISOString(),
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid contact message data", 
          errors: parseResult.error.errors 
        });
      }
      
      const message = await storage.createContactMessage(parseResult.data);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit contact message" });
    }
  });
  
  // Update product media
  app.patch("/api/products/:id/media", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const { videoUrl, additionalImages, descriptionImages, specificationImages } = req.body;
      
      // Validate media data
      if (videoUrl && typeof videoUrl !== "string") {
        return res.status(400).json({ message: "Invalid video URL" });
      }
      
      if (additionalImages && !Array.isArray(additionalImages)) {
        return res.status(400).json({ message: "Invalid additional images" });
      }
      
      if (descriptionImages && !Array.isArray(descriptionImages)) {
        return res.status(400).json({ message: "Invalid description images" });
      }
      
      if (specificationImages && !Array.isArray(specificationImages)) {
        return res.status(400).json({ message: "Invalid specification images" });
      }
      
      const updatedProduct = await storage.updateProductMedia(id, {
        videoUrl,
        additionalImages,
        descriptionImages,
        specificationImages
      });
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product media" });
    }
  });
  
  // Update product details
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Extract product data from request body
      const {
        name, nameAr, description, descriptionAr, price, originalPrice,
        categoryId, imageUrl, featured, inStock, badge, badgeAr
      } = req.body;
      
      // Create update data object
      const updateData: Partial<Omit<Product, 'id'>> = {};
      
      // Only include fields that are provided in the request
      if (name !== undefined) updateData.name = name;
      if (nameAr !== undefined) updateData.nameAr = nameAr;
      if (description !== undefined) updateData.description = description;
      if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr;
      if (price !== undefined) updateData.price = price;
      if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (featured !== undefined) updateData.featured = featured;
      if (inStock !== undefined) updateData.inStock = inStock;
      if (badge !== undefined) updateData.badge = badge;
      if (badgeAr !== undefined) updateData.badgeAr = badgeAr;
      
      const updatedProduct = await storage.updateProduct(id, updateData);
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product details" });
    }
  });
  
  // Reset database (for development purposes only)
  app.post("/api/reset-database", async (req, res) => {
    try {
      // Drop all existing tables and recreate them
      await storage.seedInitialData();
      res.json({ message: "Database reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset database" });
    }
  });

  // Checkout route to create orders directly with items - no authentication required for guest checkout
  app.post("/api/checkout", async (req, res) => {
    try {
      // Log entire request body for debugging
      console.log("Checkout request body:", JSON.stringify(req.body));
      
      const { 
        userId,
        items, 
        shippingMethod, 
        shippingCost, 
        paymentMethod,
        status = "pending",
        paymentStatus = "pending",
        totalAmount,
        currency = "USD",
        notes,
        shippingAddress
      } = req.body;
      
      // Check authentication status
      let effectiveUserId;
      
      if (req.isAuthenticated()) {
        // Use authenticated user's ID
        effectiveUserId = req.user!.id;
      } else if (userId && userId > 0) {
        // Use the provided userId if it's valid
        effectiveUserId = userId;
      } else {
        // For guest checkout, use ID 1 which is typically the admin/system user
        // This is a temporary solution - a better approach would be to make userId nullable in the schema
        // or create a dedicated "guest" user in the system
        effectiveUserId = 1; // Using admin user as fallback for guest checkout
      }
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }
      
      // Generate order number (ORD-YYYYMMDD-XXXX format)
      const date = new Date();
      const datePart = date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0');
      const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
      const orderNumber = `ORD-${datePart}-${randomPart}`;
      
      // Create the order - enforce column length restrictions
      // Logging pre-truncated values
      console.log("Pre-truncation values:", {
        currency,
        totalAmount,
        paymentStatus,
        shippingMethod,
        shippingCost
      });
      
      // Handle currency object - extract currency code if it's an object, otherwise use the string value
      let currencyCode = 'USD';
      if (currency) {
        if (typeof currency === 'object' && currency.code) {
          currencyCode = currency.code;
        } else if (typeof currency === 'string') {
          currencyCode = currency;
        }
      }
      
      // Process shipping address if provided
      let shippingAddressId = null;
      if (shippingAddress) {
        try {
          console.log("Processing shipping address:", shippingAddress);
          
          // Create shipping address in database - for now we're not storing this
          // This could be implemented later if needed
          // const address = await storage.createAddress({...});
          // shippingAddressId = address.id;
        } catch (error) {
          console.error("Error creating shipping address:", error);
          // Continue with order creation even if address creation fails
        }
      }
      
      // Constructing order data with explicit null values for nullable fields and strict length enforcement
      const orderData = {
        userId: effectiveUserId,
        orderNumber: orderNumber.substring(0, 50),
        status: status ? status.substring(0, 20) : 'pending',
        totalAmount: totalAmount ? totalAmount.substring(0, 20) : '0',
        currency: currencyCode.substring(0, 3), // Most currency codes are 3 chars
        paymentStatus: paymentStatus ? paymentStatus.substring(0, 20) : 'pending',
        shippingMethod: shippingMethod ? shippingMethod.substring(0, 50) : null,
        shippingCost: shippingCost ? shippingCost.substring(0, 20) : '0',
        notes: notes ? notes.substring(0, 1000) : null,
        // References to related entities
        shippingAddressId: shippingAddressId,
        billingAddressId: null,
        paymentMethodId: null
      };
      
      console.log("Creating order with data:", orderData);
      
      // Create the order with the prepared data
      const order = await storage.createOrder(orderData);
      
      // Create order items in database with length constraints
      const orderItems = await Promise.all(
        items.map(item => 
          storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.substring(0, 20),
            subtotal: item.subtotal.substring(0, 20)
          })
        )
      );
      
      // Clear the user's cart if they're logged in
      if (req.isAuthenticated()) {
        // Get all cart items
        const cartItems = await storage.getUserCartItems(req.user!.id);
        
        // Delete each cart item individually
        for (const item of cartItems) {
          await storage.removeCartItem(req.user!.id, item.productId);
        }
      }
      
      res.status(201).json({ ...order, items: orderItems });
    } catch (error: any) {
      console.error("Error processing checkout:", error);
      let errorMessage = "Failed to process checkout";
      
      if (error.code === '22001') {
        errorMessage = "One of the input values is too long for the database. Please try again with shorter values.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      res.status(500).json({ 
        message: "Failed to process checkout", 
        error: errorMessage 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
