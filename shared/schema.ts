import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, json, jsonb, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(), // user, admin
  defaultShippingAddressId: integer("default_shipping_address_id").references(() => addresses.id),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    email: true,
    password: true,
    role: true
  })
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
    email: z.string().email("Please enter a valid email address").optional(),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User Addresses
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  addressLine1: text("addressLine1").notNull(),
  addressLine2: text("addressLine2"),
  city: text("city").notNull(),
  state: text("state"),
  postalCode: text("postalCode"),
  country: text("country").notNull(),
  phone: text("phone"),
  isDefault: boolean("isDefault").default(false),
  label: text("label"), // e.g., "Home", "Work"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  // removed updatedAt as it doesn't exist in the database
});

export const insertAddressSchema = createInsertSchema(addresses)
  .omit({ id: true, createdAt: true });

export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addresses.$inferSelect;

// User Payment Methods
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // credit_card, paypal, etc.
  provider: text("provider"), // visa, mastercard, etc.
  lastFour: text("lastFour"), // Last 4 digits of card
  expiryMonth: text("expiryMonth"),
  expiryYear: text("expiryYear"),
  isDefault: boolean("isDefault").default(false),
  // Store tokenized payment info securely
  paymentToken: text("paymentToken"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id), // Using snake_case column names
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  totalAmount: text("total_amount").notNull(),
  currency: text("currency").default("USD").notNull(),
  shippingAddressId: integer("shipping_address_id"),
  billingAddressId: integer("billing_address_id"),
  paymentMethodId: integer("payment_method_id"),
  paymentStatus: text("payment_status").default("pending").notNull(), // pending, processing, paid, refunded, failed
  shippingMethod: text("shipping_method"),
  shippingCost: text("shipping_cost").default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unit_price").notNull(),
  subtotal: text("subtotal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("nameAr"),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  imageUrl: text("imageUrl"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  nameAr: true,
  slug: true,
  description: true,
  descriptionAr: true,
  imageUrl: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("nameAr"),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr"),
  price: text("price").notNull(), // Using text to preserve exact decimal format
  originalPrice: text("originalPrice"), // For discounted products
  categoryId: integer("categoryId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  additionalImages: text("additionalimages").array(), // Store URLs of additional images - lowercase to match actual column name
  videoUrl: text("videourl"), // URL for product video - lowercase to match actual column name
  specificationImages: text("specificationimages").array(), // Images for specifications section - lowercase to match actual column name
  descriptionImages: text("descriptionimages").array(), // Images for description section - lowercase to match actual column name
  published: boolean("published").default(false), // Whether the product is visible on the website
  
  // Detailed description sections
  keyFeatures: text("keyfeatures"), // Key features highlight box
  keyFeaturesTitle: text("keyfeaturestitle").default("Key Features"), // Custom title for key features
  keyBenefits: text("keybenefits"), // Key benefits bullet points
  keyBenefitsTitle: text("keybenefitstitle").default("Key Benefits"), // Custom title for key benefits
  useCasesTitle: text("usecasestitle").default("Use Cases"), // Custom title for use cases section
  useCaseCommercial: text("usecasecommercial"), // Commercial use case description
  useCaseCommercialTitle: text("usecasecommercialtitle").default("Commercial Farms"), // Custom title for commercial use case
  useCaseBackyard: text("usecasebackyard"), // Backyard use case description
  useCaseBackyardTitle: text("usecasebackyardtitle").default("Backyard Coops"), // Custom title for backyard use case
  maintenanceTips: text("maintenancetips"), // Maintenance tips numbered list
  maintenanceTipsTitle: text("maintenancetipstitle").default("Maintenance Tips"), // Custom title for maintenance tips
  
  // Arabic description sections
  keyFeaturesAr: text("keyfeaturesar"), // Arabic key features
  keyFeaturesTitleAr: text("keyfeaturestitlear").default("الميزات الرئيسية"), // Arabic custom title for key features
  keyBenefitsAr: text("keybenefitsar"), // Arabic key benefits
  keyBenefitsTitleAr: text("keybenefitstitlear").default("الفوائد الرئيسية"), // Arabic custom title for key benefits
  useCasesTitleAr: text("usecasestitlear").default("حالات الاستخدام"), // Arabic custom title for use cases section
  useCaseCommercialAr: text("usecasecommercialar"), // Arabic commercial use case
  useCaseCommercialTitleAr: text("usecasecommercialtitlear").default("المزارع التجارية"), // Arabic custom title for commercial use case
  useCaseBackyardAr: text("usecasebackyardar"), // Arabic backyard use case
  useCaseBackyardTitleAr: text("usecasebackyardtitlear").default("أقفاص الفناء الخلفي"), // Arabic custom title for backyard use case
  maintenanceTipsAr: text("maintenancetipsar"), // Arabic maintenance tips
  maintenanceTipsTitleAr: text("maintenancetipstitlear").default("نصائح الصيانة"), // Arabic custom title for maintenance tips

  // Regular product fields
  sku: text("sku"), // Stock Keeping Unit
  weight: text("weight"), // Product weight (e.g. "2.5 kg")
  dimensions: text("dimensions"), // Product dimensions (e.g. "30 x 20 x 15 cm")
  warrantyInfo: text("warrantyinfo"), // Warranty information - lowercase to match actual column name
  features: jsonb("features"), // Array of product features
  specs: jsonb("specs"), // Product specifications as key-value pairs
  tags: text("tags").array(), // Product tags for filtering and search
  quantity: integer("quantity").default(0), // Stock quantity
  metaTitle: text("metatitle"), // SEO meta title - lowercase to match actual column name
  metaDescription: text("metadescription"), // SEO meta description - lowercase to match actual column name
  featured: boolean("featured").default(false),
  inStock: boolean("inStock").default(true),
  // Published is already defined above
  badge: text("badge"),
  badgeAr: text("badgeAr"),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  nameAr: true,
  slug: true,
  description: true,
  descriptionAr: true,
  price: true,
  originalPrice: true,
  categoryId: true,
  imageUrl: true,
  additionalImages: true,
  videoUrl: true,
  specificationImages: true,
  descriptionImages: true,
  // Detailed description sections
  keyFeatures: true,
  keyFeaturesTitle: true,
  keyBenefits: true,
  keyBenefitsTitle: true,
  useCasesTitle: true,
  useCaseCommercial: true,
  useCaseCommercialTitle: true,
  useCaseBackyard: true,
  useCaseBackyardTitle: true,
  maintenanceTips: true,
  maintenanceTipsTitle: true,
  // Arabic description sections
  keyFeaturesAr: true,
  keyFeaturesTitleAr: true,
  keyBenefitsAr: true,
  keyBenefitsTitleAr: true,
  useCasesTitleAr: true,
  useCaseCommercialAr: true,
  useCaseCommercialTitleAr: true,
  useCaseBackyardAr: true,
  useCaseBackyardTitleAr: true,
  maintenanceTipsAr: true,
  maintenanceTipsTitleAr: true,
  // Regular product fields
  sku: true,
  weight: true,
  dimensions: true,
  warrantyInfo: true,
  features: true,
  specs: true,
  tags: true,
  quantity: true,
  metaTitle: true,
  metaDescription: true,
  featured: true,    // Allow the featured flag in form submissions
  inStock: true,    // Allow the inStock flag in form submissions
  published: true,   // Allow the published flag in form submissions
  badge: true,
  badgeAr: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Waitlist schema (for newsletter signup)
export const waitlistEntries = pgTable("waitlist_entries", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  agreedToMarketing: boolean("agreed_to_marketing").default(false),
  createdAt: text("created_at").notNull(),
});

export const insertWaitlistSchema = createInsertSchema(waitlistEntries).pick({
  email: true,
  name: true,
  agreedToMarketing: true,
  createdAt: true,
});

export type InsertWaitlistEntry = z.infer<typeof insertWaitlistSchema>;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;

// Contact schema
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertContactSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
  createdAt: true,
});

export type InsertContactMessage = z.infer<typeof insertContactSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Product Images
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  isPrimary: boolean("isPrimary").default(false),
  displayOrder: integer("displayOrder").default(0),
  alt: text("alt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const insertProductImageSchema = createInsertSchema(productImages).omit({
  id: true,
  createdAt: true,
});

export type InsertProductImage = z.infer<typeof insertProductImageSchema>;
export type ProductImage = typeof productImages.$inferSelect;

// User Cart Items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => {
  return {
    userProductUnique: unique().on(table.userId, table.productId),
  };
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// Order schema is defined somewhere else in the file, avoiding duplicate definitions

// Define relations after all tables have been created
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  cartItems: many(cartItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

// User relations
export const usersRelations = relations(users, ({ many, one }) => ({
  addresses: many(addresses),
  paymentMethods: many(paymentMethods),
  orders: many(orders),
  cartItems: many(cartItems),
  defaultShippingAddress: one(addresses, {
    fields: [users.defaultShippingAddressId],
    references: [addresses.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [orders.paymentMethodId],
    references: [paymentMethods.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// Inventory Transactions
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(), // Positive for stock in, negative for stock out
  type: text("type").notNull(), // purchase, sale, adjustment, return, etc.
  referenceId: text("referenceId"), // Order ID, PO number, etc. 
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: integer("createdBy").references(() => users.id),
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;

// Inventory Levels (current stock)
export const inventoryLevels = pgTable("inventory_levels", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(0).notNull(),
  minStockLevel: integer("minStockLevel").default(5), // Alert threshold
  maxStockLevel: integer("maxStockLevel"), // Optional max stock level
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
}, (table) => {
  return {
    // Ensure one entry per product
    productIdUnique: unique("inventory_level_product_id_unique").on(table.productId),
  };
});

export const insertInventoryLevelSchema = createInsertSchema(inventoryLevels).omit({
  id: true,
  lastUpdated: true,
});

export type InsertInventoryLevel = z.infer<typeof insertInventoryLevelSchema>;
export type InventoryLevel = typeof inventoryLevels.$inferSelect;

// Inventory Relations
export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
  product: one(products, {
    fields: [inventoryTransactions.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [inventoryTransactions.createdBy],
    references: [users.id],
  }),
}));

export const inventoryLevelsRelations = relations(inventoryLevels, ({ one }) => ({
  product: one(products, {
    fields: [inventoryLevels.productId],
    references: [products.id],
  }),
}));

// Stock notifications table
export const stockNotifications = pgTable("stock_notifications", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  isNotified: boolean("isNotified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  notifiedAt: timestamp("notifiedAt"),
});

export const insertStockNotificationSchema = createInsertSchema(stockNotifications).omit({
  id: true,
  isNotified: true,
  createdAt: true,
  notifiedAt: true,
});

export type InsertStockNotification = z.infer<typeof insertStockNotificationSchema>;
export type StockNotification = typeof stockNotifications.$inferSelect;

// Stock Notification Relations
export const stockNotificationsRelations = relations(stockNotifications, ({ one }) => ({
  product: one(products, {
    fields: [stockNotifications.productId],
    references: [products.id],
  }),
}));

// Update product relations to include inventory and stock notifications
export const productsRelationsWithInventory = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  inventoryTransactions: many(inventoryTransactions),
  inventoryLevel: one(inventoryLevels),
  stockNotifications: many(stockNotifications),
}));
