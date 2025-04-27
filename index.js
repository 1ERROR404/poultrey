var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";
import path5 from "path";
import fs4 from "fs";
import cors from "cors";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  addresses: () => addresses,
  addressesRelations: () => addressesRelations,
  cartItems: () => cartItems,
  cartItemsRelations: () => cartItemsRelations,
  categories: () => categories,
  categoriesRelations: () => categoriesRelations,
  contactMessages: () => contactMessages,
  insertAddressSchema: () => insertAddressSchema,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertContactSchema: () => insertContactSchema,
  insertInventoryLevelSchema: () => insertInventoryLevelSchema,
  insertInventoryTransactionSchema: () => insertInventoryTransactionSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPaymentMethodSchema: () => insertPaymentMethodSchema,
  insertProductImageSchema: () => insertProductImageSchema,
  insertProductSchema: () => insertProductSchema,
  insertStockNotificationSchema: () => insertStockNotificationSchema,
  insertUserSchema: () => insertUserSchema,
  insertWaitlistSchema: () => insertWaitlistSchema,
  inventoryLevels: () => inventoryLevels,
  inventoryLevelsRelations: () => inventoryLevelsRelations,
  inventoryTransactions: () => inventoryTransactions,
  inventoryTransactionsRelations: () => inventoryTransactionsRelations,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  paymentMethods: () => paymentMethods,
  paymentMethodsRelations: () => paymentMethodsRelations,
  productImages: () => productImages,
  productImagesRelations: () => productImagesRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  productsRelationsWithInventory: () => productsRelationsWithInventory,
  stockNotifications: () => stockNotifications,
  stockNotificationsRelations: () => stockNotificationsRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  waitlistEntries: () => waitlistEntries
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
  // user, admin
  defaultShippingAddressId: integer("default_shipping_address_id").references(() => addresses.id)
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address").optional()
});
var addresses = pgTable("addresses", {
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
  label: text("label"),
  // e.g., "Home", "Work"
  createdAt: timestamp("createdAt").defaultNow().notNull()
  // removed updatedAt as it doesn't exist in the database
});
var insertAddressSchema = createInsertSchema(addresses).omit({ id: true, createdAt: true });
var paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  // credit_card, paypal, etc.
  provider: text("provider"),
  // visa, mastercard, etc.
  lastFour: text("lastFour"),
  // Last 4 digits of card
  expiryMonth: text("expiryMonth"),
  expiryYear: text("expiryYear"),
  isDefault: boolean("isDefault").default(false),
  // Store tokenized payment info securely
  paymentToken: text("paymentToken"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({ id: true, createdAt: true, updatedAt: true });
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  // Using snake_case column names
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"),
  // pending, processing, shipped, delivered, cancelled
  totalAmount: text("total_amount").notNull(),
  currency: text("currency").default("USD").notNull(),
  shippingAddressId: integer("shipping_address_id"),
  billingAddressId: integer("billing_address_id"),
  paymentMethodId: integer("payment_method_id"),
  paymentStatus: text("payment_status").default("pending").notNull(),
  // pending, processing, paid, refunded, failed
  shippingMethod: text("shipping_method"),
  shippingCost: text("shipping_cost").default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unit_price").notNull(),
  subtotal: text("subtotal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true, updatedAt: true });
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("nameAr"),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  imageUrl: text("imageUrl")
});
var insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  nameAr: true,
  slug: true,
  description: true,
  descriptionAr: true,
  imageUrl: true
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("nameAr"),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr"),
  price: text("price").notNull(),
  // Using text to preserve exact decimal format
  originalPrice: text("originalPrice"),
  // For discounted products
  categoryId: integer("categoryId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  additionalImages: text("additionalimages").array(),
  // Store URLs of additional images - lowercase to match actual column name
  videoUrl: text("videourl"),
  // URL for product video - lowercase to match actual column name
  specificationImages: text("specificationimages").array(),
  // Images for specifications section - lowercase to match actual column name
  descriptionImages: text("descriptionimages").array(),
  // Images for description section - lowercase to match actual column name
  published: boolean("published").default(false),
  // Whether the product is visible on the website
  // Detailed description sections
  keyFeatures: text("keyfeatures"),
  // Key features highlight box
  keyFeaturesTitle: text("keyfeaturestitle").default("Key Features"),
  // Custom title for key features
  keyBenefits: text("keybenefits"),
  // Key benefits bullet points
  keyBenefitsTitle: text("keybenefitstitle").default("Key Benefits"),
  // Custom title for key benefits
  useCasesTitle: text("usecasestitle").default("Use Cases"),
  // Custom title for use cases section
  useCaseCommercial: text("usecasecommercial"),
  // Commercial use case description
  useCaseCommercialTitle: text("usecasecommercialtitle").default("Commercial Farms"),
  // Custom title for commercial use case
  useCaseBackyard: text("usecasebackyard"),
  // Backyard use case description
  useCaseBackyardTitle: text("usecasebackyardtitle").default("Backyard Coops"),
  // Custom title for backyard use case
  maintenanceTips: text("maintenancetips"),
  // Maintenance tips numbered list
  maintenanceTipsTitle: text("maintenancetipstitle").default("Maintenance Tips"),
  // Custom title for maintenance tips
  // Arabic description sections
  keyFeaturesAr: text("keyfeaturesar"),
  // Arabic key features
  keyFeaturesTitleAr: text("keyfeaturestitlear").default("\u0627\u0644\u0645\u064A\u0632\u0627\u062A \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629"),
  // Arabic custom title for key features
  keyBenefitsAr: text("keybenefitsar"),
  // Arabic key benefits
  keyBenefitsTitleAr: text("keybenefitstitlear").default("\u0627\u0644\u0641\u0648\u0627\u0626\u062F \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629"),
  // Arabic custom title for key benefits
  useCasesTitleAr: text("usecasestitlear").default("\u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645"),
  // Arabic custom title for use cases section
  useCaseCommercialAr: text("usecasecommercialar"),
  // Arabic commercial use case
  useCaseCommercialTitleAr: text("usecasecommercialtitlear").default("\u0627\u0644\u0645\u0632\u0627\u0631\u0639 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629"),
  // Arabic custom title for commercial use case
  useCaseBackyardAr: text("usecasebackyardar"),
  // Arabic backyard use case
  useCaseBackyardTitleAr: text("usecasebackyardtitlear").default("\u0623\u0642\u0641\u0627\u0635 \u0627\u0644\u0641\u0646\u0627\u0621 \u0627\u0644\u062E\u0644\u0641\u064A"),
  // Arabic custom title for backyard use case
  maintenanceTipsAr: text("maintenancetipsar"),
  // Arabic maintenance tips
  maintenanceTipsTitleAr: text("maintenancetipstitlear").default("\u0646\u0635\u0627\u0626\u062D \u0627\u0644\u0635\u064A\u0627\u0646\u0629"),
  // Arabic custom title for maintenance tips
  // Regular product fields
  sku: text("sku"),
  // Stock Keeping Unit
  weight: text("weight"),
  // Product weight (e.g. "2.5 kg")
  dimensions: text("dimensions"),
  // Product dimensions (e.g. "30 x 20 x 15 cm")
  warrantyInfo: text("warrantyinfo"),
  // Warranty information - lowercase to match actual column name
  features: jsonb("features"),
  // Array of product features
  specs: jsonb("specs"),
  // Product specifications as key-value pairs
  tags: text("tags").array(),
  // Product tags for filtering and search
  quantity: integer("quantity").default(0),
  // Stock quantity
  metaTitle: text("metatitle"),
  // SEO meta title - lowercase to match actual column name
  metaDescription: text("metadescription"),
  // SEO meta description - lowercase to match actual column name
  featured: boolean("featured").default(false),
  inStock: boolean("inStock").default(true),
  // Published is already defined above
  badge: text("badge"),
  badgeAr: text("badgeAr")
});
var insertProductSchema = createInsertSchema(products).pick({
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
  featured: true,
  // Allow the featured flag in form submissions
  inStock: true,
  // Allow the inStock flag in form submissions
  published: true,
  // Allow the published flag in form submissions
  badge: true,
  badgeAr: true
});
var waitlistEntries = pgTable("waitlist_entries", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  agreedToMarketing: boolean("agreed_to_marketing").default(false),
  createdAt: text("created_at").notNull()
});
var insertWaitlistSchema = createInsertSchema(waitlistEntries).pick({
  email: true,
  name: true,
  agreedToMarketing: true,
  createdAt: true
});
var contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull()
});
var insertContactSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
  createdAt: true
});
var productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  isPrimary: boolean("isPrimary").default(false),
  displayOrder: integer("displayOrder").default(0),
  alt: text("alt"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var insertProductImageSchema = createInsertSchema(productImages).omit({
  id: true,
  createdAt: true
});
var cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
}, (table) => {
  return {
    userProductUnique: unique().on(table.userId, table.productId)
  };
});
var insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products)
}));
var productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  images: many(productImages),
  cartItems: many(cartItems)
}));
var productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id]
  })
}));
var usersRelations = relations(users, ({ many, one }) => ({
  addresses: many(addresses),
  paymentMethods: many(paymentMethods),
  orders: many(orders),
  cartItems: many(cartItems),
  defaultShippingAddress: one(addresses, {
    fields: [users.defaultShippingAddressId],
    references: [addresses.id]
  })
}));
var addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id]
  })
}));
var paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id]
  })
}));
var ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id]
  }),
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id]
  }),
  paymentMethod: one(paymentMethods, {
    fields: [orders.paymentMethodId],
    references: [paymentMethods.id]
  }),
  items: many(orderItems)
}));
var orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}));
var cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id]
  })
}));
var inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  // Positive for stock in, negative for stock out
  type: text("type").notNull(),
  // purchase, sale, adjustment, return, etc.
  referenceId: text("referenceId"),
  // Order ID, PO number, etc. 
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: integer("createdBy").references(() => users.id)
});
var insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  createdAt: true
});
var inventoryLevels = pgTable("inventory_levels", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(0).notNull(),
  minStockLevel: integer("minStockLevel").default(5),
  // Alert threshold
  maxStockLevel: integer("maxStockLevel"),
  // Optional max stock level
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull()
}, (table) => {
  return {
    // Ensure one entry per product
    productIdUnique: unique("inventory_level_product_id_unique").on(table.productId)
  };
});
var insertInventoryLevelSchema = createInsertSchema(inventoryLevels).omit({
  id: true,
  lastUpdated: true
});
var inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
  product: one(products, {
    fields: [inventoryTransactions.productId],
    references: [products.id]
  }),
  user: one(users, {
    fields: [inventoryTransactions.createdBy],
    references: [users.id]
  })
}));
var inventoryLevelsRelations = relations(inventoryLevels, ({ one }) => ({
  product: one(products, {
    fields: [inventoryLevels.productId],
    references: [products.id]
  })
}));
var stockNotifications = pgTable("stock_notifications", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  isNotified: boolean("isNotified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  notifiedAt: timestamp("notifiedAt")
});
var insertStockNotificationSchema = createInsertSchema(stockNotifications).omit({
  id: true,
  isNotified: true,
  createdAt: true,
  notifiedAt: true
});
var stockNotificationsRelations = relations(stockNotifications, ({ one }) => ({
  product: one(products, {
    fields: [stockNotifications.productId],
    references: [products.id]
  })
}));
var productsRelationsWithInventory = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  images: many(productImages),
  inventoryTransactions: many(inventoryTransactions),
  inventoryLevel: one(inventoryLevels),
  stockNotifications: many(stockNotifications)
}));

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { desc, eq, and, or, ilike, sql, like, asc, not, isNull } from "drizzle-orm";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage-notifications.ts
import { eq as eq2, and as and2 } from "drizzle-orm";
async function addStockNotification(email, productId) {
  const existingNotifications = await db.select().from(stockNotifications).where(
    and2(
      eq2(stockNotifications.email, email),
      eq2(stockNotifications.productId, productId),
      eq2(stockNotifications.isNotified, false)
    )
  );
  if (existingNotifications.length > 0) {
    return existingNotifications[0];
  }
  const [notification] = await db.insert(stockNotifications).values({
    email,
    productId
  }).returning();
  return notification;
}
async function getStockNotifications(productId) {
  return db.select().from(stockNotifications).where(
    and2(
      eq2(stockNotifications.productId, productId),
      eq2(stockNotifications.isNotified, false)
    )
  );
}
async function updateStockNotificationStatus(id, isNotified) {
  const [notification] = await db.update(stockNotifications).set({
    isNotified,
    ...isNotified ? { notifiedAt: /* @__PURE__ */ new Date() } : {}
  }).where(eq2(stockNotifications.id, id)).returning();
  return notification;
}
async function deleteStockNotification(id) {
  const [notification] = await db.delete(stockNotifications).where(eq2(stockNotifications.id, id)).returning();
  return !!notification;
}

// server/storage.ts
var DatabaseStorage = class {
  // User methods
  async getUser(id) {
    try {
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        role: users.role,
        defaultShippingAddressId: users.defaultShippingAddressId
      }).from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error in getUser:", error);
      return void 0;
    }
  }
  async getUserByUsername(username) {
    try {
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        role: users.role,
        defaultShippingAddressId: users.defaultShippingAddressId
      }).from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      return void 0;
    }
  }
  async getUserByEmail(email) {
    try {
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        role: users.role,
        defaultShippingAddressId: users.defaultShippingAddressId
      }).from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("Error in getUserByEmail:", error);
      return void 0;
    }
  }
  async createUser(insertUser) {
    try {
      const [user] = await db.insert(users).values(insertUser).returning({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        role: users.role,
        defaultShippingAddressId: users.defaultShippingAddressId
      });
      return user;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }
  async updateUser(id, userData) {
    try {
      const [updatedUser] = await db.update(users).set(userData).where(eq(users.id, id)).returning({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        role: users.role,
        defaultShippingAddressId: users.defaultShippingAddressId
      });
      return updatedUser;
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  }
  async updateUserPassword(id, password) {
    try {
      const [updatedUser] = await db.update(users).set({ password }).where(eq(users.id, id)).returning({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        role: users.role,
        defaultShippingAddressId: users.defaultShippingAddressId
      });
      return updatedUser;
    } catch (error) {
      console.error("Error in updateUserPassword:", error);
      throw error;
    }
  }
  // Address methods
  async getAddressesByUserId(userId) {
    return db.select({
      id: addresses.id,
      userId: addresses.userId,
      firstName: addresses.firstName,
      lastName: addresses.lastName,
      addressLine1: addresses.addressLine1,
      addressLine2: addresses.addressLine2,
      city: addresses.city,
      state: addresses.state,
      postalCode: addresses.postalCode,
      country: addresses.country,
      phone: addresses.phone,
      label: addresses.label,
      isDefault: addresses.isDefault,
      createdAt: addresses.createdAt
    }).from(addresses).where(eq(addresses.userId, userId)).orderBy(sql`${addresses.isDefault} DESC, ${addresses.createdAt} DESC`);
  }
  async getAddressById(id) {
    const [address] = await db.select({
      id: addresses.id,
      userId: addresses.userId,
      firstName: addresses.firstName,
      lastName: addresses.lastName,
      addressLine1: addresses.addressLine1,
      addressLine2: addresses.addressLine2,
      city: addresses.city,
      state: addresses.state,
      postalCode: addresses.postalCode,
      country: addresses.country,
      phone: addresses.phone,
      label: addresses.label,
      isDefault: addresses.isDefault,
      createdAt: addresses.createdAt
    }).from(addresses).where(eq(addresses.id, id));
    return address;
  }
  async createAddress(address) {
    if (address.isDefault) {
      await db.update(addresses).set({ isDefault: false }).where(and(
        eq(addresses.userId, address.userId),
        eq(addresses.isDefault, true)
      ));
    }
    const result = await db.insert(addresses).values(address).returning({
      id: addresses.id,
      userId: addresses.userId,
      firstName: addresses.firstName,
      lastName: addresses.lastName,
      addressLine1: addresses.addressLine1,
      addressLine2: addresses.addressLine2,
      city: addresses.city,
      state: addresses.state,
      postalCode: addresses.postalCode,
      country: addresses.country,
      phone: addresses.phone,
      label: addresses.label,
      isDefault: addresses.isDefault,
      createdAt: addresses.createdAt
    });
    const newAddress = result[0];
    return newAddress;
  }
  async updateAddress(id, addressData) {
    const [address] = await db.select({
      id: addresses.id,
      userId: addresses.userId,
      firstName: addresses.firstName,
      lastName: addresses.lastName,
      addressLine1: addresses.addressLine1,
      addressLine2: addresses.addressLine2,
      city: addresses.city,
      state: addresses.state,
      postalCode: addresses.postalCode,
      country: addresses.country,
      phone: addresses.phone,
      label: addresses.label,
      isDefault: addresses.isDefault,
      createdAt: addresses.createdAt
    }).from(addresses).where(eq(addresses.id, id));
    if (!address) {
      throw new Error("Address not found");
    }
    if (addressData.isDefault) {
      await db.update(addresses).set({ isDefault: false }).where(and(
        eq(addresses.userId, address.userId),
        eq(addresses.isDefault, true),
        not(eq(addresses.id, id))
      ));
    }
    const dataWithTimestamp = {
      ...addressData
    };
    const result = await db.update(addresses).set(dataWithTimestamp).where(eq(addresses.id, id)).returning({
      id: addresses.id,
      userId: addresses.userId,
      firstName: addresses.firstName,
      lastName: addresses.lastName,
      addressLine1: addresses.addressLine1,
      addressLine2: addresses.addressLine2,
      city: addresses.city,
      state: addresses.state,
      postalCode: addresses.postalCode,
      country: addresses.country,
      phone: addresses.phone,
      label: addresses.label,
      isDefault: addresses.isDefault,
      createdAt: addresses.createdAt
    });
    const updatedAddress = result[0];
    return updatedAddress;
  }
  async deleteAddress(id) {
    const [address] = await db.delete(addresses).where(eq(addresses.id, id)).returning();
    return !!address;
  }
  async setDefaultAddress(userId, addressId) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
    const [updatedAddress] = await db.update(addresses).set({ isDefault: true }).where(and(
      eq(addresses.id, addressId),
      eq(addresses.userId, userId)
    )).returning();
    if (updatedAddress) {
      await db.update(users).set({ defaultShippingAddressId: addressId }).where(eq(users.id, userId));
    }
    return !!updatedAddress;
  }
  // Payment Method methods
  async getPaymentMethodsByUserId(userId) {
    return db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId)).orderBy(sql`${paymentMethods.isDefault} DESC, ${paymentMethods.createdAt} DESC`);
  }
  async getPaymentMethodById(id) {
    const [paymentMethod] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return paymentMethod;
  }
  async createPaymentMethod(method) {
    if (method.isDefault) {
      await db.update(paymentMethods).set({ isDefault: false }).where(and(
        eq(paymentMethods.userId, method.userId),
        eq(paymentMethods.isDefault, true)
      ));
    }
    const [newMethod] = await db.insert(paymentMethods).values(method).returning();
    return newMethod;
  }
  async updatePaymentMethod(id, data) {
    const [method] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    if (!method) {
      throw new Error("Payment method not found");
    }
    if (data.isDefault) {
      await db.update(paymentMethods).set({ isDefault: false }).where(and(
        eq(paymentMethods.userId, method.userId),
        eq(paymentMethods.isDefault, true),
        not(eq(paymentMethods.id, id))
      ));
    }
    const dataWithTimestamp = {
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    };
    const [updatedMethod] = await db.update(paymentMethods).set(dataWithTimestamp).where(eq(paymentMethods.id, id)).returning();
    return updatedMethod;
  }
  async deletePaymentMethod(id) {
    const [method] = await db.delete(paymentMethods).where(eq(paymentMethods.id, id)).returning();
    return !!method;
  }
  async setDefaultPaymentMethod(userId, paymentMethodId) {
    await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, userId));
    const [updatedMethod] = await db.update(paymentMethods).set({ isDefault: true }).where(and(
      eq(paymentMethods.id, paymentMethodId),
      eq(paymentMethods.userId, userId)
    )).returning();
    return !!updatedMethod;
  }
  // Order methods
  async getOrdersByUserId(userId) {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(sql`${orders.createdAt} DESC`);
  }
  async getOrderById(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  async getOrderByOrderNumber(orderNumber) {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }
  async createOrder(order) {
    console.log("Creating order with data:", JSON.stringify(order));
    try {
      const [newOrder] = await db.insert(orders).values(order).returning();
      return newOrder;
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error;
    }
  }
  async updateOrderStatus(id, status) {
    const [updatedOrder] = await db.update(orders).set({
      status,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(orders.id, id)).returning();
    return updatedOrder;
  }
  async updateOrderPaymentStatus(id, paymentStatus) {
    const [updatedOrder] = await db.update(orders).set({
      paymentStatus,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(orders.id, id)).returning();
    return updatedOrder;
  }
  async updateOrderNotes(id, notes) {
    const [updatedOrder] = await db.update(orders).set({
      notes,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(orders.id, id)).returning();
    return updatedOrder;
  }
  // Additional Order methods
  async getAllOrders() {
    return db.select().from(orders).orderBy(sql`${orders.createdAt} DESC`);
  }
  async getOrderCount() {
    const result = await db.select({ count: sql`count(*)` }).from(orders);
    return Number(result[0].count);
  }
  async getRecentOrders(limit) {
    return db.select().from(orders).orderBy(sql`${orders.createdAt} DESC`).limit(limit);
  }
  async getTotalRevenue() {
    const result = await db.select({
      totalRevenue: sql`SUM(CAST(${orders.totalAmount} AS DECIMAL))`
    }).from(orders).where(eq(orders.paymentStatus, "paid"));
    return result[0].totalRevenue?.toString() || "0";
  }
  async getMonthlyRevenue(months) {
    const pastDate = /* @__PURE__ */ new Date();
    pastDate.setMonth(pastDate.getMonth() - months);
    const result = await db.select({
      month: sql`to_char(${orders.createdAt}, 'YYYY-MM')`,
      revenue: sql`SUM(CAST(${orders.totalAmount} AS DECIMAL))`
    }).from(orders).where(and(
      sql`${orders.createdAt} >= ${pastDate.toISOString()}`,
      eq(orders.paymentStatus, "paid")
    )).groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`).orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`);
    return result.map((item) => ({
      month: item.month,
      revenue: item.revenue?.toString() || "0"
    }));
  }
  // Order Item methods
  async getOrderItemsByOrderId(orderId) {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  async createOrderItem(orderItem) {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }
  async createOrderItems(items) {
    if (items.length === 0) return [];
    const insertedItems = await db.insert(orderItems).values(items).returning();
    return insertedItems;
  }
  // Category methods
  async getCategories() {
    return db.select().from(categories);
  }
  async getCategoryById(id) {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  async getCategoryBySlug(slug) {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }
  async createCategory(insertCategory) {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }
  // Product methods
  async getProducts(includeUnpublished = false) {
    if (includeUnpublished) {
      return db.select().from(products);
    } else {
      return db.select().from(products).where(eq(products.published, true));
    }
  }
  async getProductById(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  async getProductBySlug(slug, includeUnpublished = false) {
    if (includeUnpublished) {
      const [product] = await db.select().from(products).where(eq(products.slug, slug));
      return product;
    } else {
      const [product] = await db.select().from(products).where(
        and(
          eq(products.slug, slug),
          eq(products.published, true)
        )
      );
      return product;
    }
  }
  async getProductsByCategory(categoryId, includeUnpublished = false) {
    if (includeUnpublished) {
      return db.select().from(products).where(eq(products.categoryId, categoryId));
    } else {
      return db.select().from(products).where(
        and(
          eq(products.categoryId, categoryId),
          eq(products.published, true)
        )
      );
    }
  }
  async getFeaturedProducts(includeUnpublished = false) {
    if (includeUnpublished) {
      return db.select().from(products).where(eq(products.featured, true));
    } else {
      return db.select().from(products).where(
        and(
          eq(products.featured, true),
          eq(products.published, true)
        )
      );
    }
  }
  async createProduct(insertProduct) {
    console.log("Creating product with data:", insertProduct);
    if (insertProduct.published === void 0) {
      insertProduct.published = true;
      console.log("Setting published value to true (was undefined)");
    }
    const [product] = await db.insert(products).values(insertProduct).returning();
    console.log("Product created successfully:", product);
    return product;
  }
  async searchProducts(query, includeUnpublished = false) {
    query = query.toLowerCase().trim();
    if (!query) return [];
    const conditions = [
      or(
        ilike(products.name, `%${query}%`),
        ilike(products.nameAr || "", `%${query}%`),
        ilike(products.description, `%${query}%`),
        ilike(products.descriptionAr || "", `%${query}%`)
      )
    ];
    if (!includeUnpublished) {
      conditions.push(eq(products.published, true));
    }
    return db.select().from(products).where(and(...conditions));
  }
  async updateProductMedia(id, mediaData) {
    const [updatedProduct] = await db.update(products).set(mediaData).where(eq(products.id, id)).returning();
    return updatedProduct;
  }
  async updateProduct(id, productData) {
    const [updatedProduct] = await db.update(products).set(productData).where(eq(products.id, id)).returning();
    return updatedProduct;
  }
  async deleteProduct(id) {
    const [deletedProduct] = await db.delete(products).where(eq(products.id, id)).returning();
    return !!deletedProduct;
  }
  async deleteProductBySlug(slug) {
    const product = await this.getProductBySlug(slug);
    if (!product) return false;
    return this.deleteProduct(product.id);
  }
  // Waitlist methods
  async createWaitlistEntry(insertEntry) {
    const [entry] = await db.insert(waitlistEntries).values(insertEntry).returning();
    return entry;
  }
  async getWaitlistEntries() {
    return db.select().from(waitlistEntries);
  }
  // Contact methods
  async createContactMessage(insertMessage) {
    const [message] = await db.insert(contactMessages).values(insertMessage).returning();
    return message;
  }
  async getContactMessages() {
    return db.select().from(contactMessages);
  }
  // Admin methods - Users
  async getUserCount() {
    const result = await db.select({ count: sql`count(*)` }).from(users);
    return Number(result[0].count);
  }
  async updateUserDefaultShippingAddress(userId, addressId) {
    try {
      const [updatedUser] = await db.update(users).set({ defaultShippingAddressId: addressId }).where(eq(users.id, userId)).returning({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        role: users.role,
        defaultShippingAddressId: users.defaultShippingAddressId
      });
      return updatedUser;
    } catch (error) {
      console.error("Error in updateUserDefaultShippingAddress:", error);
      throw error;
    }
  }
  async getUserStatsByMonth(months) {
    return [
      { month: "2025-03", count: 5 },
      { month: "2025-04", count: 8 }
    ];
  }
  async deleteUser(id) {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning();
    return !!user;
  }
  async getAllUsers() {
    try {
      return await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        role: users.role,
        defaultShippingAddressId: users.defaultShippingAddressId
      }).from(users).orderBy(users.username);
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return [];
    }
  }
  // Cart methods
  async getUserCartItems(userId) {
    return db.select().from(cartItems).where(eq(cartItems.userId, userId)).orderBy(cartItems.createdAt);
  }
  async addCartItem(item) {
    try {
      const [existingItem] = await db.select().from(cartItems).where(and(
        eq(cartItems.userId, item.userId),
        eq(cartItems.productId, item.productId)
      ));
      if (existingItem) {
        return this.updateCartItemQuantity(
          item.userId,
          item.productId,
          existingItem.quantity + (item.quantity || 1)
        );
      }
      const [newCartItem] = await db.insert(cartItems).values(item).returning();
      return newCartItem;
    } catch (error) {
      console.error("Error adding item to cart:", error);
      throw error;
    }
  }
  async updateCartItemQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      await this.removeCartItem(userId, productId);
      throw new Error("Item removed from cart due to zero or negative quantity");
    }
    const [updatedItem] = await db.update(cartItems).set({
      quantity
    }).where(and(
      eq(cartItems.userId, userId),
      eq(cartItems.productId, productId)
    )).returning();
    if (!updatedItem) {
      throw new Error("Cart item not found");
    }
    return updatedItem;
  }
  async removeCartItem(userId, productId) {
    const [removedItem] = await db.delete(cartItems).where(and(
      eq(cartItems.userId, userId),
      eq(cartItems.productId, productId)
    )).returning();
    return !!removedItem;
  }
  async clearUserCart(userId) {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId)).returning();
    return result.length > 0;
  }
  // Admin methods - Categories
  async updateCategory(id, categoryData) {
    const [updatedCategory] = await db.update(categories).set(categoryData).where(eq(categories.id, id)).returning();
    return updatedCategory;
  }
  async deleteCategory(id) {
    const [category] = await db.delete(categories).where(eq(categories.id, id)).returning();
    return !!category;
  }
  async getCategoryCount() {
    const result = await db.select({ count: sql`count(*)` }).from(categories);
    return Number(result[0].count);
  }
  async getCategoryProductCount(categoryId) {
    const result = await db.select({ count: sql`count(*)` }).from(products).where(eq(products.categoryId, categoryId));
    return Number(result[0].count);
  }
  // Admin methods - Products
  async getProductCount() {
    const result = await db.select({ count: sql`count(*)` }).from(products);
    return Number(result[0].count);
  }
  // The getLowStockProducts implementation is moved to line 898
  // Stock Notification methods
  async addStockNotification(email, productId) {
    return addStockNotification(email, productId);
  }
  async getStockNotifications(productId) {
    return getStockNotifications(productId);
  }
  async updateStockNotificationStatus(id, isNotified) {
    return updateStockNotificationStatus(id, isNotified);
  }
  async deleteStockNotification(id) {
    return deleteStockNotification(id);
  }
  // Product Image methods
  async getProductImages(productId) {
    return db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(productImages.displayOrder);
  }
  async getProductImageById(imageId) {
    const [image] = await db.select().from(productImages).where(eq(productImages.id, imageId));
    return image;
  }
  async addProductImage(image) {
    const [newImage] = await db.insert(productImages).values(image).returning();
    return newImage;
  }
  async updateProductImage(imageId, data) {
    const [updatedImage] = await db.update(productImages).set(data).where(eq(productImages.id, imageId)).returning();
    return updatedImage;
  }
  async updateProductImagePrimary(productId, primaryImageId) {
    await db.update(productImages).set({ isPrimary: false }).where(eq(productImages.productId, productId));
    if (primaryImageId !== null) {
      await db.update(productImages).set({ isPrimary: true }).where(and(
        eq(productImages.id, primaryImageId),
        eq(productImages.productId, productId)
      ));
    }
  }
  async deleteProductImage(imageId) {
    const [deletedImage] = await db.delete(productImages).where(eq(productImages.id, imageId)).returning();
    return !!deletedImage;
  }
  // Admin methods - Orders
  // Methods implemented in "Additional Order methods" section
  // Admin methods - Contact Messages
  async getAllContactMessages() {
    return db.select().from(contactMessages).orderBy(sql`${contactMessages.createdAt} DESC`);
  }
  async getContactMessageById(id) {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }
  async deleteContactMessage(id) {
    const [message] = await db.delete(contactMessages).where(eq(contactMessages.id, id)).returning();
    return !!message;
  }
  async getRecentContactMessages(limit) {
    return db.select().from(contactMessages).orderBy(sql`${contactMessages.createdAt} DESC`).limit(limit);
  }
  // Admin methods - Waitlist
  async getAllWaitlistEntries() {
    return db.select().from(waitlistEntries).orderBy(sql`${waitlistEntries.createdAt} DESC`);
  }
  async getWaitlistEntryById(id) {
    const [entry] = await db.select().from(waitlistEntries).where(eq(waitlistEntries.id, id));
    return entry;
  }
  async deleteWaitlistEntry(id) {
    const [entry] = await db.delete(waitlistEntries).where(eq(waitlistEntries.id, id)).returning();
    return !!entry;
  }
  // Inventory methods implementation
  async createInventoryLevel(level) {
    const [inventoryLevel] = await db.insert(inventoryLevels).values(level).returning();
    return inventoryLevel;
  }
  async getInventoryLevelByProductId(productId) {
    const [inventoryLevel] = await db.select().from(inventoryLevels).where(eq(inventoryLevels.productId, productId));
    return inventoryLevel;
  }
  async updateInventoryLevel(productId, data) {
    const existing = await this.getInventoryLevelByProductId(productId);
    if (existing) {
      const [updated] = await db.update(inventoryLevels).set({
        ...data,
        lastUpdated: /* @__PURE__ */ new Date()
      }).where(eq(inventoryLevels.productId, productId)).returning();
      return updated;
    } else {
      return this.createInventoryLevel({
        productId,
        quantity: data.quantity || 0,
        minStockLevel: data.minStockLevel || 5,
        maxStockLevel: data.maxStockLevel
      });
    }
  }
  async addInventoryTransaction(transaction) {
    const [newTransaction] = await db.insert(inventoryTransactions).values(transaction).returning();
    const currentLevel = await this.getInventoryLevelByProductId(transaction.productId);
    const newQuantity = (currentLevel?.quantity || 0) + transaction.quantity;
    await this.updateInventoryLevel(transaction.productId, {
      quantity: newQuantity
    });
    await db.update(products).set({ quantity: newQuantity, inStock: newQuantity > 0 }).where(eq(products.id, transaction.productId));
    return newTransaction;
  }
  async getInventoryTransactionsByProductId(productId) {
    return db.select().from(inventoryTransactions).where(eq(inventoryTransactions.productId, productId)).orderBy(sql`${inventoryTransactions.createdAt} DESC`);
  }
  async getRecentInventoryTransactions(limit) {
    return db.select().from(inventoryTransactions).orderBy(sql`${inventoryTransactions.createdAt} DESC`).limit(limit);
  }
  async getLowStockProducts(limit) {
    const result = await db.select({
      product: products
    }).from(products).leftJoin(inventoryLevels, eq(products.id, inventoryLevels.productId)).where(
      or(
        // Products with inventory levels below min stock
        and(
          not(isNull(inventoryLevels.quantity)),
          sql`${inventoryLevels.quantity} <= ${inventoryLevels.minStockLevel}`
        ),
        // Or products with low quantity (for backward compatibility)
        and(
          isNull(inventoryLevels.id),
          sql`${products.quantity} <= 5`
        )
      )
    ).orderBy(sql`COALESCE(${inventoryLevels.quantity}, ${products.quantity})`).limit(limit);
    return result.map((row) => row.product);
  }
  // Seed database with initial data if needed
  async seedInitialData() {
    console.log("Seeding database with initial data...");
    const categories2 = [
      {
        name: "Feeders",
        nameAr: "\u0645\u0639\u0627\u0644\u0641",
        slug: "feeders",
        description: "Automatic and manual feeding solutions for all flock sizes.",
        descriptionAr: "\u062D\u0644\u0648\u0644 \u062A\u063A\u0630\u064A\u0629 \u0623\u0648\u062A\u0648\u0645\u0627\u062A\u064A\u0643\u064A\u0629 \u0648\u064A\u062F\u0648\u064A\u0629 \u0644\u062C\u0645\u064A\u0639 \u0623\u062D\u062C\u0627\u0645 \u0642\u0637\u0639\u0627\u0646 \u0627\u0644\u062F\u0648\u0627\u062C\u0646.",
        imageUrl: "https://images.unsplash.com/photo-1598715685267-0f45367d8071?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
      },
      {
        name: "Waterers",
        nameAr: "\u0645\u0633\u0627\u0642\u064A",
        slug: "waterers",
        description: "Clean, efficient watering systems with advanced nipple technology.",
        descriptionAr: "\u0623\u0646\u0638\u0645\u0629 \u0634\u0631\u0628 \u0646\u0638\u064A\u0641\u0629 \u0648\u0641\u0639\u0627\u0644\u0629 \u0645\u0639 \u062A\u0642\u0646\u064A\u0629 \u062D\u0644\u0645\u0627\u062A \u0645\u062A\u0637\u0648\u0631\u0629.",
        imageUrl: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
      },
      {
        name: "Coop Equipment",
        nameAr: "\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0639\u0634\u0629",
        slug: "coop-equipment",
        description: "Everything you need for a comfortable, secure chicken coop.",
        descriptionAr: "\u0643\u0644 \u0645\u0627 \u062A\u062D\u062A\u0627\u062C\u0647 \u0644\u0639\u0634\u0629 \u062F\u062C\u0627\u062C \u0645\u0631\u064A\u062D\u0629 \u0648\u0622\u0645\u0646\u0629.",
        imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
      },
      {
        name: "Health & Care",
        nameAr: "\u0627\u0644\u0635\u062D\u0629 \u0648\u0627\u0644\u0631\u0639\u0627\u064A\u0629",
        slug: "health-care",
        description: "Products to maintain flock health and hygiene.",
        descriptionAr: "\u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0635\u062D\u0629 \u0648\u0646\u0638\u0627\u0641\u0629 \u0642\u0637\u064A\u0639 \u0627\u0644\u062F\u0648\u0627\u062C\u0646.",
        imageUrl: "https://images.unsplash.com/photo-1567450121326-28da3695ef35?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
      }
    ];
    const categoryMap = /* @__PURE__ */ new Map();
    for (const category of categories2) {
      const created = await this.createCategory(category);
      categoryMap.set(category.slug, created.id);
    }
    const products2 = [
      {
        name: "Automatic Chicken Feeder",
        nameAr: "\u0645\u0639\u0644\u0641\u0629 \u062F\u062C\u0627\u062C \u0623\u0648\u062A\u0648\u0645\u0627\u062A\u064A\u0643\u064A\u0629",
        slug: "automatic-chicken-feeder",
        description: "High-capacity, weather-resistant chicken feeder with innovative anti-waste design.",
        descriptionAr: "\u0645\u0639\u0644\u0641\u0629 \u062F\u062C\u0627\u062C \u0630\u0627\u062A \u0633\u0639\u0629 \u0639\u0627\u0644\u064A\u0629\u060C \u0645\u0642\u0627\u0648\u0645\u0629 \u0644\u0644\u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u062C\u0648\u064A\u0629 \u0645\u0639 \u062A\u0635\u0645\u064A\u0645 \u0645\u0628\u062A\u0643\u0631 \u0645\u0627\u0646\u0639 \u0644\u0644\u0647\u062F\u0631.",
        price: "89.99",
        categoryId: categoryMap.get("feeders"),
        imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: true,
        inStock: true,
        badge: "new",
        badgeAr: "\u062C\u062F\u064A\u062F",
        published: true
      },
      {
        name: "Premium Watering System",
        nameAr: "\u0646\u0638\u0627\u0645 \u0633\u0642\u064A \u0645\u062A\u0645\u064A\u0632",
        slug: "premium-watering-system",
        description: "Complete watering solution with nipple drinkers. Keeps water clean and prevents spillage.",
        descriptionAr: "\u062D\u0644 \u0645\u062A\u0643\u0627\u0645\u0644 \u0644\u0644\u0633\u0642\u064A \u0645\u0639 \u062D\u0644\u0645\u0627\u062A \u0634\u0631\u0628. \u064A\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0646\u0638\u0627\u0641\u0629 \u0627\u0644\u0645\u064A\u0627\u0647 \u0648\u064A\u0645\u0646\u0639 \u0627\u0644\u0627\u0646\u0633\u0643\u0627\u0628.",
        price: "64.99",
        categoryId: categoryMap.get("waterers"),
        imageUrl: "https://images.unsplash.com/photo-1629385918123-8872c6d907ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: true,
        inStock: true,
        badge: null,
        badgeAr: null,
        published: true
      },
      {
        name: "Deluxe Nesting Boxes (Set of 4)",
        nameAr: "\u0635\u0646\u0627\u062F\u064A\u0642 \u062A\u0639\u0634\u064A\u0634 \u0641\u0627\u062E\u0631\u0629 (\u0645\u062C\u0645\u0648\u0639\u0629 \u0645\u0646 4)",
        slug: "deluxe-nesting-boxes",
        description: "Comfortable, easy-to-clean nesting boxes with roll-away egg collection system.",
        descriptionAr: "\u0635\u0646\u0627\u062F\u064A\u0642 \u062A\u0639\u0634\u064A\u0634 \u0645\u0631\u064A\u062D\u0629 \u0633\u0647\u0644\u0629 \u0627\u0644\u062A\u0646\u0638\u064A\u0641 \u0645\u0639 \u0646\u0638\u0627\u0645 \u062A\u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u064A\u0636 \u0627\u0644\u0645\u062A\u062F\u062D\u0631\u062C.",
        price: "129.99",
        categoryId: categoryMap.get("coop-equipment"),
        imageUrl: "https://images.unsplash.com/photo-1534187886889-1e764382e8cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: true,
        inStock: true,
        badge: "bestseller",
        badgeAr: "\u0627\u0644\u0623\u0643\u062B\u0631 \u0645\u0628\u064A\u0639\u0627\u064B",
        published: true
      },
      {
        name: "Portable Chicken Coop",
        nameAr: "\u0639\u0634\u0629 \u062F\u062C\u0627\u062C \u0645\u062A\u0646\u0642\u0644\u0629",
        slug: "portable-chicken-coop",
        description: "Easy-to-move coop with predator-proof design. Perfect for small to medium flocks.",
        descriptionAr: "\u0639\u0634\u0629 \u0633\u0647\u0644\u0629 \u0627\u0644\u0646\u0642\u0644 \u0628\u062A\u0635\u0645\u064A\u0645 \u0645\u0636\u0627\u062F \u0644\u0644\u062D\u064A\u0648\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0641\u062A\u0631\u0633\u0629. \u0645\u062B\u0627\u0644\u064A\u0629 \u0644\u0644\u0642\u0637\u0639\u0627\u0646 \u0627\u0644\u0635\u063A\u064A\u0631\u0629 \u0648\u0627\u0644\u0645\u062A\u0648\u0633\u0637\u0629.",
        price: "349.99",
        categoryId: categoryMap.get("coop-equipment"),
        imageUrl: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: true,
        inStock: true,
        badge: null,
        badgeAr: null,
        published: true
      },
      {
        name: "Poultry Health Kit",
        nameAr: "\u0637\u0642\u0645 \u0635\u062D\u0629 \u0627\u0644\u062F\u0648\u0627\u062C\u0646",
        slug: "poultry-health-kit",
        description: "Complete kit with essential supplements and medications for maintaining flock health.",
        descriptionAr: "\u0637\u0642\u0645 \u0645\u062A\u0643\u0627\u0645\u0644 \u0645\u0639 \u0627\u0644\u0645\u0643\u0645\u0644\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0648\u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0627\u0644\u0636\u0631\u0648\u0631\u064A\u0629 \u0644\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0635\u062D\u0629 \u0627\u0644\u0642\u0637\u064A\u0639.",
        price: "49.99",
        categoryId: categoryMap.get("health-care"),
        imageUrl: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: false,
        inStock: true,
        badge: null,
        badgeAr: null,
        published: true
      },
      {
        name: "Automatic Coop Door",
        nameAr: "\u0628\u0627\u0628 \u0627\u0644\u0639\u0634\u0629 \u0627\u0644\u0623\u0648\u062A\u0648\u0645\u0627\u062A\u064A\u0643\u064A",
        slug: "automatic-coop-door",
        description: "Programmable door that opens and closes automatically. Keeps predators out and chickens safe.",
        descriptionAr: "\u0628\u0627\u0628 \u0642\u0627\u0628\u0644 \u0644\u0644\u0628\u0631\u0645\u062C\u0629 \u064A\u0641\u062A\u062D \u0648\u064A\u063A\u0644\u0642 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B. \u064A\u0628\u0642\u064A \u0627\u0644\u062D\u064A\u0648\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0641\u062A\u0631\u0633\u0629 \u0628\u0627\u0644\u062E\u0627\u0631\u062C \u0648\u0627\u0644\u062F\u062C\u0627\u062C \u0622\u0645\u0646\u0627\u064B.",
        price: "159.99",
        categoryId: 3,
        // Fixed to match the correct category ID
        imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: false,
        inStock: true,
        badge: null,
        badgeAr: null,
        published: true
      },
      {
        name: "Hanging Feeder (10lb capacity)",
        nameAr: "\u0645\u0639\u0644\u0641\u0629 \u0645\u0639\u0644\u0642\u0629 (\u0633\u0639\u0629 10 \u0631\u0637\u0644)",
        slug: "hanging-feeder",
        description: "Durable hanging feeder that reduces feed waste and contamination.",
        descriptionAr: "\u0645\u0639\u0644\u0641\u0629 \u0645\u0639\u0644\u0642\u0629 \u0645\u062A\u064A\u0646\u0629 \u062A\u0642\u0644\u0644 \u0645\u0646 \u0647\u062F\u0631 \u0627\u0644\u0639\u0644\u0641 \u0648\u0627\u0644\u062A\u0644\u0648\u062B.",
        price: "34.99",
        categoryId: categoryMap.get("feeders"),
        imageUrl: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: false,
        inStock: true,
        badge: null,
        badgeAr: null,
        published: true
      },
      {
        name: "Gravity Waterer (5 gallon)",
        nameAr: "\u0645\u0633\u0642\u0627\u0629 \u062C\u0627\u0630\u0628\u064A\u0629 (5 \u062C\u0627\u0644\u0648\u0646)",
        slug: "gravity-waterer",
        description: "Large capacity gravity waterer that keeps chickens hydrated for days without refilling.",
        descriptionAr: "\u0645\u0633\u0642\u0627\u0629 \u062C\u0627\u0630\u0628\u064A\u0629 \u0643\u0628\u064A\u0631\u0629 \u0627\u0644\u0633\u0639\u0629 \u062A\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u062A\u0631\u0637\u064A\u0628 \u0627\u0644\u062F\u062C\u0627\u062C \u0644\u0623\u064A\u0627\u0645 \u0628\u062F\u0648\u0646 \u0625\u0639\u0627\u062F\u0629 \u0645\u0644\u0621.",
        price: "42.99",
        categoryId: categoryMap.get("waterers"),
        imageUrl: "https://images.unsplash.com/photo-1533070931057-1d300322ee67?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: false,
        inStock: true,
        badge: null,
        badgeAr: null,
        published: true
      }
    ];
    for (const product of products2) {
      await this.createProduct(product);
    }
    try {
      for (const product of products2) {
        const productData = await this.getProductBySlug(product.slug);
        if (productData) {
          const inventoryLevel = await this.getInventoryLevelByProductId(productData.id);
          if (!inventoryLevel) {
            await this.createInventoryLevel({
              productId: productData.id,
              quantity: Math.floor(Math.random() * 50) + 10,
              // Random stock between 10-60
              minStockLevel: 5,
              maxStockLevel: 100
            });
          }
        }
      }
    } catch (error) {
      console.error("Error setting up inventory tables:", error);
    }
    console.log("Database seeded successfully!");
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import connectPg from "connect-pg-simple";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const PostgresSessionStore = connectPg(session);
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "poultry-gear-session-secret",
    // Use a proper secret in production
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // Use secure cookies in production
      sameSite: "lax"
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        // Use username field, but it can contain either username or email
        passwordField: "password"
      },
      async (username, password, done) => {
        try {
          let user = await storage.getUserByUsername(username);
          if (!user && username.includes("@")) {
            user = await storage.getUserByEmail(username);
          }
          if (!user || !await comparePasswords(password, user.password)) {
            return done(null, false, { message: "Invalid username/email or password" });
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const user = await storage.createUser({
        username: req.body.username,
        email: req.body.email,
        // Save the email if provided
        password: await hashPassword(req.body.password),
        role: req.body.role || "user"
      });
      const { password, ...userWithoutPassword } = user;
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  app2.patch("/api/user/profile", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const allowedFields = [
        "firstName",
        "lastName",
        "phoneNumber",
        "profileImageUrl"
      ];
      const updateData = {};
      for (const field of allowedFields) {
        if (req.body[field] !== void 0) {
          updateData[field] = req.body[field];
        }
      }
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/user/change-password", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user || !await comparePasswords(currentPassword, user.password)) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const hashedNewPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(req.user.id, hashedNewPassword);
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  });
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };
  const isAdmin2 = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Access denied" });
  };
  return { isAuthenticated, isAdmin: isAdmin2 };
}

// server/routes/user-routes.ts
import { Router } from "express";
var router = Router();
function setupUserRoutes(isAuthenticated) {
  router.get("/addresses", isAuthenticated, async (req, res) => {
    try {
      const addresses2 = await storage.getAddressesByUserId(req.user.id);
      res.json(addresses2);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });
  router.get("/addresses/:id", isAuthenticated, async (req, res) => {
    try {
      const address = await storage.getAddressById(parseInt(req.params.id));
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(address);
    } catch (error) {
      console.error("Error fetching address:", error);
      res.status(500).json({ message: "Failed to fetch address" });
    }
  });
  router.post("/addresses", isAuthenticated, async (req, res) => {
    try {
      const validationResult = insertAddressSchema.safeParse({
        ...req.body,
        userId: req.user.id
      });
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid address data",
          errors: validationResult.error.format()
        });
      }
      const address = await storage.createAddress(validationResult.data);
      res.status(201).json(address);
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(500).json({ message: "Failed to create address" });
    }
  });
  router.patch("/addresses/:id", isAuthenticated, async (req, res) => {
    try {
      const addressId = parseInt(req.params.id);
      const address = await storage.getAddressById(addressId);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const allowedFields = ["addressLine1", "addressLine2", "city", "state", "postalCode", "country", "isDefault", "label"];
      const updateData = {};
      for (const field of allowedFields) {
        if (req.body[field] !== void 0) {
          updateData[field] = req.body[field];
        }
      }
      const updatedAddress = await storage.updateAddress(addressId, updateData);
      res.json(updatedAddress);
    } catch (error) {
      console.error("Error updating address:", error);
      res.status(500).json({ message: "Failed to update address" });
    }
  });
  router.delete("/addresses/:id", isAuthenticated, async (req, res) => {
    try {
      const addressId = parseInt(req.params.id);
      const address = await storage.getAddressById(addressId);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteAddress(addressId);
      res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
      console.error("Error deleting address:", error);
      res.status(500).json({ message: "Failed to delete address" });
    }
  });
  router.post("/addresses/:id/default", isAuthenticated, async (req, res) => {
    try {
      const addressId = parseInt(req.params.id);
      const address = await storage.getAddressById(addressId);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.setDefaultAddress(req.user.id, addressId);
      res.status(200).json({ message: "Default address updated successfully" });
    } catch (error) {
      console.error("Error setting default address:", error);
      res.status(500).json({ message: "Failed to set default address" });
    }
  });
  router.get("/payment-methods", isAuthenticated, async (req, res) => {
    try {
      const paymentMethods2 = await storage.getPaymentMethodsByUserId(req.user.id);
      res.json(paymentMethods2);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });
  router.get("/payment-methods/:id", isAuthenticated, async (req, res) => {
    try {
      const paymentMethod = await storage.getPaymentMethodById(parseInt(req.params.id));
      if (!paymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      if (paymentMethod.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(paymentMethod);
    } catch (error) {
      console.error("Error fetching payment method:", error);
      res.status(500).json({ message: "Failed to fetch payment method" });
    }
  });
  router.post("/payment-methods", isAuthenticated, async (req, res) => {
    try {
      const validationResult = insertPaymentMethodSchema.safeParse({
        ...req.body,
        userId: req.user.id
      });
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid payment method data",
          errors: validationResult.error.format()
        });
      }
      const paymentMethod = await storage.createPaymentMethod(validationResult.data);
      res.status(201).json(paymentMethod);
    } catch (error) {
      console.error("Error creating payment method:", error);
      res.status(500).json({ message: "Failed to create payment method" });
    }
  });
  router.patch("/payment-methods/:id", isAuthenticated, async (req, res) => {
    try {
      const paymentMethodId = parseInt(req.params.id);
      const paymentMethod = await storage.getPaymentMethodById(paymentMethodId);
      if (!paymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      if (paymentMethod.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const allowedFields = ["isDefault", "expiryMonth", "expiryYear", "paymentToken"];
      const updateData = {};
      for (const field of allowedFields) {
        if (req.body[field] !== void 0) {
          updateData[field] = req.body[field];
        }
      }
      const updatedPaymentMethod = await storage.updatePaymentMethod(paymentMethodId, updateData);
      res.json(updatedPaymentMethod);
    } catch (error) {
      console.error("Error updating payment method:", error);
      res.status(500).json({ message: "Failed to update payment method" });
    }
  });
  router.delete("/payment-methods/:id", isAuthenticated, async (req, res) => {
    try {
      const paymentMethodId = parseInt(req.params.id);
      const paymentMethod = await storage.getPaymentMethodById(paymentMethodId);
      if (!paymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      if (paymentMethod.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deletePaymentMethod(paymentMethodId);
      res.status(200).json({ message: "Payment method deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      res.status(500).json({ message: "Failed to delete payment method" });
    }
  });
  router.post("/payment-methods/:id/default", isAuthenticated, async (req, res) => {
    try {
      const paymentMethodId = parseInt(req.params.id);
      const paymentMethod = await storage.getPaymentMethodById(paymentMethodId);
      if (!paymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      if (paymentMethod.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.setDefaultPaymentMethod(req.user.id, paymentMethodId);
      res.status(200).json({ message: "Default payment method updated successfully" });
    } catch (error) {
      console.error("Error setting default payment method:", error);
      res.status(500).json({ message: "Failed to set default payment method" });
    }
  });
  router.get("/orders", isAuthenticated, async (req, res) => {
    try {
      const orders2 = await storage.getOrdersByUserId(req.user.id);
      const ordersWithItems = await Promise.all(
        orders2.map(async (order) => {
          const items = await storage.getOrderItemsByOrderId(order.id);
          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const product = await storage.getProductById(item.productId);
              return {
                ...item,
                product: product || {
                  id: item.productId,
                  name: "Unknown Product",
                  price: item.unitPrice,
                  imageUrl: null,
                  slug: ""
                }
              };
            })
          );
          return { ...order, items: itemsWithProducts };
        })
      );
      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  router.get("/orders/:id", isAuthenticated, async (req, res) => {
    try {
      console.log("User order detail route hit for order ID:", req.params.id);
      console.log("Authenticated user:", req.user?.id);
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId);
      if (!order) {
        console.log("Order not found:", orderId);
        return res.status(404).json({ message: "Order not found" });
      }
      console.log("Found order:", order.id, "Order number:", order.orderNumber, "User ID:", order.userId);
      if (order.userId !== req.user.id) {
        console.log("Access denied - user doesn't match:", req.user?.id, "vs", order.userId);
        return res.status(403).json({ message: "Access denied" });
      }
      const items = await storage.getOrderItemsByOrderId(orderId);
      console.log("Order items count:", items.length);
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          console.log("Product for item", item.id, ":", product ? product.id : "not found");
          return {
            ...item,
            product: product || {
              id: item.productId,
              name: "Unknown Product",
              price: item.unitPrice,
              imageUrl: null,
              slug: ""
            }
          };
        })
      );
      const user = await storage.getUser(order.userId);
      console.log("User information for order:", user ? `ID: ${user.id}, Username: ${user.username}, Role: ${user.role}` : "User not found");
      const responseData = {
        ...order,
        items: itemsWithProducts,
        user: user || void 0
      };
      console.log("Sending response with items count:", responseData.items.length);
      console.log("First item details:", responseData.items.length > 0 ? JSON.stringify(responseData.items[0]) : "No items");
      res.json(responseData);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  router.get("/orders/:id/invoice", isAuthenticated, async (req, res) => {
    try {
      console.log("User invoice route hit for order ID:", req.params.id);
      console.log("Authenticated user:", req.user?.id);
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        console.error("Invalid order ID format:", req.params.id);
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const order = await storage.getOrderById(orderId);
      if (!order) {
        console.error("Order not found with ID:", orderId);
        return res.status(404).json({ message: "Order not found" });
      }
      console.log("Found order:", order.id, "Order number:", order.orderNumber, "User ID:", order.userId);
      if (!req.user || order.userId !== req.user.id) {
        console.error("Access denied - User ID mismatch:", req.user?.id, "vs order user:", order.userId);
        return res.status(403).json({ message: "Access denied" });
      }
      const user = await storage.getUser(order.userId);
      console.log("User for order:", user ? user.id : "not found");
      const items = await storage.getOrderItemsByOrderId(order.id);
      console.log("Order items count:", items.length);
      let shippingAddress = null;
      let billingAddress = null;
      if (order.shippingAddressId) {
        shippingAddress = await storage.getAddressById(order.shippingAddressId);
        console.log("Shipping address found:", !!shippingAddress);
      }
      if (order.billingAddressId) {
        billingAddress = await storage.getAddressById(order.billingAddressId);
        console.log("Billing address found:", !!billingAddress);
      }
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return {
            ...item,
            product: product || { name: "Product no longer available" }
          };
        })
      );
      console.log("Generating invoice HTML...");
      const invoiceHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${order.orderNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #eee;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid #eee;
            }
            .invoice-header h1 {
              color: #2c5e2d;
              margin: 0;
            }
            .invoice-header p {
              margin: 5px 0;
            }
            .company-details {
              margin-bottom: 20px;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .invoice-info-box {
              width: 48%;
            }
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .invoice-table th {
              background-color: #f5f5f5;
              padding: 10px;
              text-align: left;
              border-bottom: 2px solid #ddd;
            }
            .invoice-table td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            .invoice-total {
              text-align: right;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
            .invoice-total table {
              width: 300px;
              margin-left: auto;
            }
            .invoice-total table td {
              padding: 5px 0;
            }
            .invoice-total table tr:last-child {
              font-weight: bold;
              font-size: 1.2em;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #777;
              font-size: 0.9em;
            }
            @media print {
              body {
                padding: 0;
              }
              .invoice-container {
                box-shadow: none;
                border: none;
              }
              .print-button {
                display: none;
              }
            }
            .print-button {
              background-color: #2c5e2d;
              color: white;
              border: none;
              padding: 10px 20px;
              cursor: pointer;
              font-size: 1em;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .text-right {
              text-align: right;
            }
            .primary-color {
              color: #2c5e2d;
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">Print Invoice</button>
          
          <div class="invoice-container">
            <div class="invoice-header">
              <h1>Invoice</h1>
              <p><strong>#${order.orderNumber}</strong></p>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div class="company-details">
              <h2 class="primary-color">Poultry Gear</h2>
              <p>Muscat, Oman</p>
              <p>Email: info@poultrygear.com</p>
              <p>Phone: +968 9495 4004</p>
            </div>
            
            <div class="invoice-info">
              <div class="invoice-info-box">
                <h3>Bill To:</h3>
                <p><strong>${user?.username || "Customer"}</strong></p>
                ${billingAddress ? `
                <p>${billingAddress.firstName} ${billingAddress.lastName}</p>
                <p>${billingAddress.addressLine1}</p>
                ${billingAddress.addressLine2 ? `<p>${billingAddress.addressLine2}</p>` : ""}
                <p>${billingAddress.city}, ${billingAddress.state} ${billingAddress.postalCode}</p>
                <p>${billingAddress.country}</p>
                <p>Phone: ${billingAddress.phone}</p>
                ` : ""}
              </div>
              
              <div class="invoice-info-box">
                <h3>Ship To:</h3>
                ${shippingAddress ? `
                <p>${shippingAddress.firstName} ${shippingAddress.lastName}</p>
                <p>${shippingAddress.addressLine1}</p>
                ${shippingAddress.addressLine2 ? `<p>${shippingAddress.addressLine2}</p>` : ""}
                <p>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}</p>
                <p>${shippingAddress.country}</p>
                <p>Phone: ${shippingAddress.phone}</p>
                ` : ""}
              </div>
            </div>
            
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsWithProducts.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.product.name}</td>
                  <td>${item.quantity}</td>
                  <td>${parseFloat(String(item.unitPrice || item.product.price || 0)).toFixed(2)} ${order.currency || "OMR"}</td>
                  <td class="text-right">${(parseFloat(String(item.unitPrice || item.product.price || 0)) * item.quantity).toFixed(2)} ${order.currency || "OMR"}</td>
                </tr>
                `).join("")}
              </tbody>
            </table>
            
            <div class="invoice-total">
              <table>
                <tr>
                  <td>Subtotal:</td>
                  <td class="text-right">${parseFloat(String(order.subtotal || 0)).toFixed(2)} ${order.currency || "OMR"}</td>
                </tr>
                <tr>
                  <td>Shipping:</td>
                  <td class="text-right">${parseFloat(String(order.shippingCost || 0)).toFixed(2)} ${order.currency || "OMR"}</td>
                </tr>
                ${order.discount ? `
                <tr>
                  <td>Discount:</td>
                  <td class="text-right">-${parseFloat(String(order.discount)).toFixed(2)} ${order.currency || "OMR"}</td>
                </tr>
                ` : ""}
                <tr>
                  <td>Total:</td>
                  <td class="text-right">${parseFloat(String(order.totalAmount)).toFixed(2)} ${order.currency || "OMR"}</td>
                </tr>
              </table>
            </div>
            
            <div class="footer">
              <p>Thank you for your business with Poultry Gear!</p>
              <p>For any questions regarding this invoice, please contact us at info@poultrygear.com</p>
            </div>
          </div>
          
          <script>
            // Auto-print after page loads
            window.onload = function() {
              // Uncomment the line below to automatically print
              // window.print();
            };
          </script>
        </body>
        </html>
      `;
      console.log("Invoice HTML generated, length:", invoiceHtml.length);
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      return res.send(invoiceHtml);
    } catch (error) {
      console.error("Error generating invoice:", error);
      return res.status(500).json({ message: "Failed to generate invoice", error: String(error) });
    }
  });
  return router;
}

// server/routes/admin-routes.ts
import { Router as Router2 } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// server/routes/admin-orders.ts
import express from "express";
function setupAdminOrdersRoutes(isAdmin2) {
  const router5 = express.Router();
  router5.get("/", isAdmin2, async (req, res) => {
    try {
      const orders2 = await storage.getAllOrders();
      const enhancedOrders = await Promise.all(
        orders2.map(async (order) => {
          const user = await storage.getUser(order.userId);
          const items = await storage.getOrderItemsByOrderId(order.id);
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
            user,
            items: itemsWithProducts
          };
        })
      );
      res.json(enhancedOrders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  router5.get("/:id", isAdmin2, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const user = await storage.getUser(order.userId);
      const items = await storage.getOrderItemsByOrderId(order.id);
      let shippingAddress = null;
      let billingAddress = null;
      if (order.shippingAddressId) {
        shippingAddress = await storage.getAddressById(order.shippingAddressId);
      }
      if (order.billingAddressId) {
        billingAddress = await storage.getAddressById(order.billingAddressId);
      }
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return {
            ...item,
            product: product || { name: "Product no longer available" }
          };
        })
      );
      const enhancedOrder = {
        ...order,
        user,
        items: itemsWithProducts,
        shippingAddress,
        billingAddress
      };
      res.json(enhancedOrder);
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });
  router5.patch("/:id/status", isAdmin2, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status",
          validStatuses
        });
      }
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  router5.patch("/:id/payment-status", isAdmin2, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const { paymentStatus } = req.body;
      if (!paymentStatus) {
        return res.status(400).json({ message: "Payment status is required" });
      }
      const validPaymentStatuses = ["pending", "processing", "paid", "refunded", "failed"];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          message: "Invalid payment status",
          validPaymentStatuses
        });
      }
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const updatedOrder = await storage.updateOrderPaymentStatus(orderId, paymentStatus);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });
  router5.get("/stats/overview", isAdmin2, async (req, res) => {
    try {
      const orderCount = await storage.getOrderCount();
      const totalRevenue = await storage.getTotalRevenue();
      const monthlyRevenue = await storage.getMonthlyRevenue(6);
      const recentOrders = await storage.getRecentOrders(5);
      res.json({
        orderCount,
        totalRevenue,
        monthlyRevenue,
        recentOrders
      });
    } catch (error) {
      console.error("Error fetching order statistics:", error);
      res.status(500).json({ message: "Failed to fetch order statistics" });
    }
  });
  router5.patch("/:id/notes", isAdmin2, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const { notes } = req.body;
      if (notes === void 0) {
        return res.status(400).json({ message: "Notes field is required" });
      }
      const limitedNotes = notes.substring(0, 1e3);
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const updatedOrder = await storage.updateOrderNotes(orderId, limitedNotes);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order notes:", error);
      res.status(500).json({ message: "Failed to update order notes" });
    }
  });
  router5.get("/:id/invoice", isAdmin2, async (req, res) => {
    try {
      console.log("============================================");
      console.log("Admin invoice route hit for order ID:", req.params.id);
      console.log("User authenticated:", req.isAuthenticated());
      console.log("User role:", req.user?.role);
      console.log("============================================");
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        console.error("Invalid order ID format:", req.params.id);
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const order = await storage.getOrderById(orderId);
      if (!order) {
        console.error("Order not found with ID:", orderId);
        return res.status(404).json({ message: "Order not found" });
      }
      console.log("Found order:", order.id, "Order number:", order.orderNumber);
      const user = await storage.getUser(order.userId);
      console.log("User for order:", user ? user.id : "not found");
      const items = await storage.getOrderItemsByOrderId(order.id);
      console.log("Order items count:", items.length);
      let shippingAddress = null;
      let billingAddress = null;
      if (order.shippingAddressId) {
        shippingAddress = await storage.getAddressById(order.shippingAddressId);
        console.log("Shipping address found:", !!shippingAddress);
      }
      if (order.billingAddressId) {
        billingAddress = await storage.getAddressById(order.billingAddressId);
        console.log("Billing address found:", !!billingAddress);
      }
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return {
            ...item,
            product: product || { name: "Product no longer available" }
          };
        })
      );
      console.log("Generating invoice HTML...");
      const invoiceHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${order.orderNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #eee;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid #eee;
            }
            .invoice-header h1 {
              color: #2c5e2d;
              margin: 0;
            }
            .invoice-header p {
              margin: 5px 0;
            }
            .company-details {
              margin-bottom: 20px;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .invoice-info-box {
              width: 48%;
            }
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .invoice-table th {
              background-color: #f5f5f5;
              padding: 10px;
              text-align: left;
              border-bottom: 2px solid #ddd;
            }
            .invoice-table td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            .invoice-total {
              text-align: right;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
            .invoice-total table {
              width: 300px;
              margin-left: auto;
            }
            .invoice-total table td {
              padding: 5px 0;
            }
            .invoice-total table tr:last-child {
              font-weight: bold;
              font-size: 1.2em;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #777;
              font-size: 0.9em;
            }
            @media print {
              body {
                padding: 0;
              }
              .invoice-container {
                box-shadow: none;
                border: none;
              }
              .print-button {
                display: none;
              }
            }
            .print-button {
              background-color: #2c5e2d;
              color: white;
              border: none;
              padding: 10px 20px;
              cursor: pointer;
              font-size: 1em;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .text-right {
              text-align: right;
            }
            .primary-color {
              color: #2c5e2d;
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">Print Invoice</button>
          
          <div class="invoice-container">
            <div class="invoice-header">
              <h1>Invoice</h1>
              <p><strong>#${order.orderNumber}</strong></p>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div class="company-details">
              <h2 class="primary-color">Poultry Gear</h2>
              <p>Muscat, Oman</p>
              <p>Email: info@poultrygear.com</p>
              <p>Phone: +968 9495 4004</p>
            </div>
            
            <div class="invoice-info">
              <div class="invoice-info-box">
                <h3>Bill To:</h3>
                <p><strong>${user?.username || "Customer"}</strong></p>
                ${billingAddress ? `
                <p>${billingAddress.firstName} ${billingAddress.lastName}</p>
                <p>${billingAddress.addressLine1}</p>
                ${billingAddress.addressLine2 ? `<p>${billingAddress.addressLine2}</p>` : ""}
                <p>${billingAddress.city}, ${billingAddress.state} ${billingAddress.postalCode}</p>
                <p>${billingAddress.country}</p>
                <p>Phone: ${billingAddress.phone}</p>
                ` : ""}
              </div>
              
              <div class="invoice-info-box">
                <h3>Ship To:</h3>
                ${shippingAddress ? `
                <p>${shippingAddress.firstName} ${shippingAddress.lastName}</p>
                <p>${shippingAddress.addressLine1}</p>
                ${shippingAddress.addressLine2 ? `<p>${shippingAddress.addressLine2}</p>` : ""}
                <p>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}</p>
                <p>${shippingAddress.country}</p>
                <p>Phone: ${shippingAddress.phone}</p>
                ` : ""}
              </div>
            </div>
            
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsWithProducts.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.product.name}</td>
                  <td>${item.quantity}</td>
                  <td>${parseFloat(String(item.unitPrice || item.product.price || 0)).toFixed(2)} ${order.currency || "OMR"}</td>
                  <td class="text-right">${(parseFloat(String(item.unitPrice || item.product.price || 0)) * item.quantity).toFixed(2)} ${order.currency || "OMR"}</td>
                </tr>
                `).join("")}
              </tbody>
            </table>
            
            <div class="invoice-total">
              <table>
                <tr>
                  <td>Subtotal:</td>
                  <td class="text-right">${parseFloat(String(order.subtotal || 0)).toFixed(2)} ${order.currency || "OMR"}</td>
                </tr>
                <tr>
                  <td>Shipping:</td>
                  <td class="text-right">${parseFloat(String(order.shippingCost || 0)).toFixed(2)} ${order.currency || "OMR"}</td>
                </tr>
                ${order.discount ? `
                <tr>
                  <td>Discount:</td>
                  <td class="text-right">-${parseFloat(String(order.discount)).toFixed(2)} ${order.currency || "OMR"}</td>
                </tr>
                ` : ""}
                <tr>
                  <td>Total:</td>
                  <td class="text-right">${parseFloat(String(order.totalAmount)).toFixed(2)} ${order.currency || "OMR"}</td>
                </tr>
              </table>
            </div>
            
            <div class="footer">
              <p>Thank you for your business with Poultry Gear!</p>
              <p>For any questions regarding this invoice, please contact us at info@poultrygear.com</p>
            </div>
          </div>
          
          <script>
            // Auto-print after page loads
            window.onload = function() {
              // Uncomment the line below to automatically print
              // window.print();
            };
          </script>
        </body>
        </html>
      `;
      console.log("Invoice HTML generated, length:", invoiceHtml.length);
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      return res.send(invoiceHtml);
    } catch (error) {
      console.error("Error generating invoice:", error);
      return res.status(500).json({ message: "Failed to generate invoice", error: String(error) });
    }
  });
  return router5;
}

// server/routes/admin-routes.ts
var uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var storage1 = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const prefix = req.originalUrl.includes("/categories") ? "category-" : "product-";
    cb(null, prefix + uniqueSuffix + ext);
  }
});
var upload = multer({
  storage: storage1,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  }
});
var router2 = Router2();
function setupAdminRoutes(isAdmin2) {
  router2.get("/dashboard", isAdmin2, async (req, res) => {
    try {
      const [
        totalProducts,
        totalUsers,
        totalOrders,
        totalCategories,
        recentOrders,
        lowStockProducts,
        contactMessages2,
        userStats
      ] = await Promise.all([
        storage.getProductCount(),
        storage.getUserCount(),
        storage.getOrderCount(),
        storage.getCategoryCount(),
        storage.getRecentOrders(5),
        // Get 5 most recent orders
        storage.getLowStockProducts(5),
        // Get 5 products with low stock
        storage.getRecentContactMessages(5),
        // Get 5 most recent contact messages
        storage.getUserStatsByMonth(6)
        // Get user registration stats for last 6 months
      ]);
      const totalRevenue = await storage.getTotalRevenue();
      const monthlyRevenue = await storage.getMonthlyRevenue(6);
      res.json({
        counts: {
          products: totalProducts,
          users: totalUsers,
          orders: totalOrders,
          categories: totalCategories
        },
        recentOrders,
        lowStockProducts,
        contactMessages: contactMessages2,
        userStats,
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  router2.get("/users", isAdmin2, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const safeUsers = users2.map((user) => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  router2.get("/users/:id", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...safeUser } = user;
      const [addresses2, paymentMethods2, orders2] = await Promise.all([
        storage.getAddressesByUserId(userId),
        storage.getPaymentMethodsByUserId(userId),
        storage.getOrdersByUserId(userId)
      ]);
      res.json({
        ...safeUser,
        addresses: addresses2,
        paymentMethods: paymentMethods2,
        orders: orders2
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  router2.patch("/users/:id", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const allowedFields = [
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "profileImageUrl",
        "role",
        "username"
      ];
      const updateData = {};
      for (const field of allowedFields) {
        if (req.body[field] !== void 0) {
          updateData[field] = req.body[field];
        }
      }
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await storage.getUserByEmail(updateData.email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }
      if (updateData.username && updateData.username !== user.username) {
        const existingUser = await storage.getUserByUsername(updateData.username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Username already taken" });
        }
      }
      const updatedUser = await storage.updateUser(userId, updateData);
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  router2.delete("/users/:id", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (req.user && userId === req.user.id) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      await storage.deleteUser(userId);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  router2.get("/products", isAdmin2, async (req, res) => {
    try {
      console.log("\u{1F50D} ADMIN: Fetching all products with force refresh...");
      const includeUnpublished = true;
      const productCount = await storage.getProductCount();
      console.log("\u{1F4CA} ADMIN: Total product count in database:", productCount);
      const products2 = await storage.getProducts(includeUnpublished);
      console.log("\u{1F4CB} ADMIN: Product IDs fetched:", products2.map((p) => p.id).join(", "));
      const categories2 = await storage.getCategories();
      const categoryMap = new Map(categories2.map((cat) => [cat.id, cat]));
      const productsWithDetails = products2.map((product) => ({
        ...product,
        categoryName: categoryMap.get(product.categoryId)?.name || "Unknown",
        categoryNameAr: categoryMap.get(product.categoryId)?.nameAr || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"
      }));
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
      console.log("\u2705 ADMIN: Sending products response with", productsWithDetails.length, "products");
      res.json(productsWithDetails);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  router2.post("/products", isAdmin2, async (req, res) => {
    console.log("------- PRODUCT CREATION START -------");
    console.log("REQUEST BODY:", req.body);
    try {
      if (!req.body.slug && req.body.name) {
        req.body.slug = req.body.name.toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, "-");
        console.log("Generated slug:", req.body.slug);
      }
      const validationResult = insertProductSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.log("VALIDATION ERROR:", validationResult.error.format());
        return res.status(400).json({
          message: "Invalid product data",
          errors: validationResult.error.format()
        });
      }
      console.log("VALIDATION SUCCESS. Validated data:", JSON.stringify(validationResult.data, null, 2));
      const category = await storage.getCategoryById(validationResult.data.categoryId);
      if (!category) {
        console.log("CATEGORY NOT FOUND:", validationResult.data.categoryId);
        return res.status(400).json({ message: "Category does not exist" });
      }
      console.log("CATEGORY EXISTS:", category.name);
      const existingProduct = await storage.getProductBySlug(validationResult.data.slug);
      if (existingProduct) {
        console.log("SLUG ALREADY EXISTS:", validationResult.data.slug);
        return res.status(400).json({ message: "Product with this slug already exists" });
      }
      console.log("SLUG IS UNIQUE:", validationResult.data.slug);
      if (validationResult.data.published === void 0) {
        console.log("PUBLISHED NOT PROVIDED. Setting to true.");
        validationResult.data.published = true;
      } else {
        console.log("PUBLISHED PROVIDED:", validationResult.data.published);
      }
      console.log("CREATING PRODUCT WITH DATA:", JSON.stringify({
        ...validationResult.data
      }, null, 2));
      const product = await storage.createProduct(validationResult.data);
      console.log("PRODUCT CREATED SUCCESSFULLY:", JSON.stringify(product, null, 2));
      const verifyProduct = await storage.getProductById(product.id);
      console.log("VERIFICATION - Product in database:", verifyProduct ? "YES" : "NO");
      if (verifyProduct) {
        console.log("VERIFICATION - Published status:", verifyProduct.published);
      }
      const publicProducts = await storage.getProducts(false);
      console.log("VERIFICATION - Total public products:", publicProducts.length);
      console.log(
        "VERIFICATION - New product in public list:",
        publicProducts.some((p) => p.id === product.id) ? "YES" : "NO"
      );
      const afterProductCount = await storage.getProductCount();
      console.log("VERIFICATION - Total product count after creation:", afterProductCount);
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  router2.get("/products/:idOrSlug", isAdmin2, async (req, res) => {
    try {
      const idOrSlug = req.params.idOrSlug;
      let product;
      const includeUnpublished = true;
      const productId = parseInt(idOrSlug);
      if (!isNaN(productId)) {
        product = await storage.getProductById(productId);
      } else {
        product = await storage.getProductBySlug(idOrSlug, includeUnpublished);
      }
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const category = await storage.getCategoryById(product.categoryId);
      res.json({
        ...product,
        category
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  router2.patch("/products/:id", isAdmin2, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (req.body.slug && req.body.slug !== product.slug) {
        const existingProduct = await storage.getProductBySlug(req.body.slug);
        if (existingProduct && existingProduct.id !== productId) {
          return res.status(400).json({ message: "Product with this slug already exists" });
        }
      }
      if (req.body.categoryId) {
        const category = await storage.getCategoryById(req.body.categoryId);
        if (!category) {
          return res.status(400).json({ message: "Category does not exist" });
        }
      }
      console.log("Updating product:", productId, "with data:", {
        ...req.body,
        published: req.body.published
      });
      const updatedProduct = await storage.updateProduct(productId, req.body);
      console.log("Product updated successfully:", updatedProduct);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  router2.delete("/products/:id", isAdmin2, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      await storage.deleteProduct(productId);
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  router2.get("/products/:id/images", isAdmin2, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const images = await storage.getProductImages(productId);
      res.json(images);
    } catch (error) {
      console.error("Error fetching product images:", error);
      res.status(500).json({ message: "Failed to fetch product images" });
    }
  });
  router2.post("/products/:id/images", isAdmin2, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const { url, isPrimary, alt } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ message: "Valid URL is required" });
      }
      if (isPrimary) {
        await storage.updateProductImagePrimary(productId, null);
        await storage.updateProduct(productId, { imageUrl: url });
      }
      const newImage = await storage.addProductImage({
        productId,
        url,
        isPrimary: !!isPrimary,
        alt: alt || "",
        displayOrder: 0
        // Will be ordered later
      });
      res.status(201).json(newImage);
    } catch (error) {
      console.error("Error adding product image:", error);
      res.status(500).json({ message: "Failed to add product image" });
    }
  });
  router2.patch("/products/images/:imageId", isAdmin2, async (req, res) => {
    try {
      const imageId = parseInt(req.params.imageId);
      const image = await storage.getProductImageById(imageId);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      const { url, isPrimary, alt, displayOrder } = req.body;
      const updateData = {};
      if (url !== void 0) updateData.url = url;
      if (alt !== void 0) updateData.alt = alt;
      if (displayOrder !== void 0) updateData.displayOrder = displayOrder;
      if (isPrimary !== void 0) {
        updateData.isPrimary = isPrimary;
        if (isPrimary) {
          await storage.updateProductImagePrimary(image.productId, imageId);
          if (url) {
            await storage.updateProduct(image.productId, { imageUrl: url });
          } else {
            await storage.updateProduct(image.productId, { imageUrl: image.url });
          }
        }
      }
      const updatedImage = await storage.updateProductImage(imageId, updateData);
      res.json(updatedImage);
    } catch (error) {
      console.error("Error updating product image:", error);
      res.status(500).json({ message: "Failed to update product image" });
    }
  });
  router2.delete("/products/images/:imageId", isAdmin2, async (req, res) => {
    try {
      const imageId = parseInt(req.params.imageId);
      const image = await storage.getProductImageById(imageId);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      if (image.isPrimary) {
        const otherImages = await storage.getProductImages(image.productId);
        const nextImage = otherImages.find((img) => img.id !== imageId);
        if (nextImage) {
          await storage.updateProductImage(nextImage.id, { isPrimary: true });
          await storage.updateProduct(image.productId, { imageUrl: nextImage.url });
        } else {
          await storage.updateProduct(image.productId, {
            imageUrl: "https://placehold.co/600x400?text=No+Image"
          });
        }
      }
      await storage.deleteProductImage(imageId);
      res.status(200).json({ message: "Product image deleted successfully" });
    } catch (error) {
      console.error("Error deleting product image:", error);
      res.status(500).json({ message: "Failed to delete product image" });
    }
  });
  router2.post("/products/:id/images/upload", isAdmin2, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const file = req.file;
      const fileUrl = `/uploads/${file.filename}`;
      const isPrimary = req.body.isPrimary === "true" || req.body.isPrimary === true;
      const alt = req.body.alt || "";
      if (isPrimary) {
        await storage.updateProductImagePrimary(productId, null);
        await storage.updateProduct(productId, { imageUrl: fileUrl });
      }
      const newImage = await storage.addProductImage({
        productId,
        url: fileUrl,
        isPrimary,
        alt,
        displayOrder: 0
        // Will be ordered later
      });
      res.status(201).json(newImage);
    } catch (error) {
      console.error("Error uploading product image:", error);
      if (error instanceof Error) {
        if (error.message === "Only image files are allowed") {
          return res.status(400).json({ message: error.message });
        }
      }
      res.status(500).json({ message: "Failed to upload product image" });
    }
  });
  router2.post("/products/:id/images/reorder", isAdmin2, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const { imageIds } = req.body;
      if (!Array.isArray(imageIds)) {
        return res.status(400).json({ message: "Valid imageIds array is required" });
      }
      const updates = imageIds.map(
        (id, index) => storage.updateProductImage(parseInt(id), { displayOrder: index })
      );
      await Promise.all(updates);
      const updatedImages = await storage.getProductImages(productId);
      res.json(updatedImages);
    } catch (error) {
      console.error("Error reordering product images:", error);
      res.status(500).json({ message: "Failed to reorder product images" });
    }
  });
  router2.post("/categories/upload", isAdmin2, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const filePath = `/uploads/${req.file.filename}`;
      res.json({
        url: filePath,
        filename: req.file.filename,
        originalname: req.file.originalname
      });
    } catch (error) {
      console.error("Error uploading category image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });
  router2.get("/categories", isAdmin2, async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      const categoriesWithCounts = await Promise.all(
        categories2.map(async (category) => {
          const productCount = await storage.getCategoryProductCount(category.id);
          return {
            ...category,
            productCount
          };
        })
      );
      res.json(categoriesWithCounts);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  router2.post("/categories", isAdmin2, async (req, res) => {
    try {
      if (!req.body.slug && req.body.name) {
        req.body.slug = req.body.name.toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, "-");
      }
      const validationResult = insertCategorySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid category data",
          errors: validationResult.error.format()
        });
      }
      const existingCategory = await storage.getCategoryBySlug(validationResult.data.slug);
      if (existingCategory) {
        return res.status(400).json({ message: "Category with this slug already exists" });
      }
      const category = await storage.createCategory(validationResult.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  router2.get("/categories/:id", isAdmin2, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const includeUnpublished = true;
      const products2 = await storage.getProductsByCategory(categoryId, includeUnpublished);
      res.json({
        ...category,
        products: products2
      });
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  router2.patch("/categories/:id", isAdmin2, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      if (req.body.slug && req.body.slug !== category.slug) {
        const existingCategory = await storage.getCategoryBySlug(req.body.slug);
        if (existingCategory && existingCategory.id !== categoryId) {
          return res.status(400).json({ message: "Category with this slug already exists" });
        }
      }
      const updatedCategory = await storage.updateCategory(categoryId, req.body);
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  router2.delete("/categories/:id", isAdmin2, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const includeUnpublished = true;
      const products2 = await storage.getProductsByCategory(categoryId, includeUnpublished);
      if (products2.length > 0) {
        return res.status(400).json({
          message: "Cannot delete category with products. Please move or delete the products first."
        });
      }
      await storage.deleteCategory(categoryId);
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  router2.get("/contact-messages", isAdmin2, async (req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });
  router2.get("/contact-messages/:id", isAdmin2, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getContactMessageById(messageId);
      if (!message) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      res.json(message);
    } catch (error) {
      console.error("Error fetching contact message:", error);
      res.status(500).json({ message: "Failed to fetch contact message" });
    }
  });
  router2.delete("/contact-messages/:id", isAdmin2, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getContactMessageById(messageId);
      if (!message) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      await storage.deleteContactMessage(messageId);
      res.status(200).json({ message: "Contact message deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Failed to delete contact message" });
    }
  });
  router2.get("/waitlist-entries", isAdmin2, async (req, res) => {
    try {
      const entries = await storage.getAllWaitlistEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching waitlist entries:", error);
      res.status(500).json({ message: "Failed to fetch waitlist entries" });
    }
  });
  router2.delete("/waitlist-entries/:id", isAdmin2, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getWaitlistEntryById(entryId);
      if (!entry) {
        return res.status(404).json({ message: "Waitlist entry not found" });
      }
      await storage.deleteWaitlistEntry(entryId);
      res.status(200).json({ message: "Waitlist entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting waitlist entry:", error);
      res.status(500).json({ message: "Failed to delete waitlist entry" });
    }
  });
  router2.get("/customers", isAdmin2, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const usersWithStats = await Promise.all(
        users2.map(async (user) => {
          const orders2 = await storage.getOrdersByUserId(user.id);
          const totalSpent = orders2.reduce((total, order) => {
            return total + parseFloat(order.totalAmount || "0");
          }, 0);
          return {
            ...user,
            totalOrders: orders2.length,
            totalSpent: totalSpent.toFixed(2),
            lastOrder: orders2.length > 0 ? orders2[0].createdAt : null
          };
        })
      );
      res.json(usersWithStats);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  router2.get("/customers/:id", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Customer not found" });
      }
      const orders2 = await storage.getOrdersByUserId(userId);
      const addresses2 = await storage.getAddressesByUserId(userId);
      const totalSpent = orders2.reduce((total, order) => {
        return total + parseFloat(order.totalAmount || "0");
      }, 0);
      const customerData = {
        ...user,
        totalOrders: orders2.length,
        totalSpent: totalSpent.toFixed(2),
        lastOrder: orders2.length > 0 ? orders2[0].createdAt : null,
        orders: orders2,
        addresses: addresses2
      };
      res.json(customerData);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      res.status(500).json({ message: "Failed to fetch customer details" });
    }
  });
  router2.patch("/customers/:id", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Customer not found" });
      }
      const allowedFields = [
        "username",
        "email",
        "firstName",
        "lastName",
        "phoneNumber",
        "role",
        "defaultShippingAddressId"
      ];
      const updateData = {};
      for (const field of allowedFields) {
        if (req.body[field] !== void 0) {
          updateData[field] = req.body[field];
        }
      }
      const updatedUser = await storage.updateUser(userId, updateData);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });
  router2.post("/customers/:id/addresses", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Customer not found" });
      }
      const newAddress = await storage.createAddress({
        ...req.body,
        userId
      });
      const addresses2 = await storage.getAddressesByUserId(userId);
      if (addresses2.length === 1 || req.body.isDefault) {
        await storage.updateUser(userId, {
          defaultShippingAddressId: newAddress.id
        });
      }
      res.status(201).json(newAddress);
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(500).json({ message: "Failed to create address" });
    }
  });
  router2.patch("/customers/:userId/addresses/:addressId", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const addressId = parseInt(req.params.addressId);
      const address = await storage.getAddressById(addressId);
      if (!address || address.userId !== userId) {
        return res.status(404).json({ message: "Address not found" });
      }
      const updatedAddress = await storage.updateAddress(addressId, req.body);
      if (req.body.isDefault) {
        await storage.updateUser(userId, { defaultShippingAddressId: addressId });
      }
      res.json(updatedAddress);
    } catch (error) {
      console.error("Error updating address:", error);
      res.status(500).json({ message: "Failed to update address" });
    }
  });
  router2.delete("/customers/:userId/addresses/:addressId", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const addressId = parseInt(req.params.addressId);
      const address = await storage.getAddressById(addressId);
      if (!address || address.userId !== userId) {
        return res.status(404).json({ message: "Address not found" });
      }
      const user = await storage.getUser(userId);
      if (user && user.defaultShippingAddressId === addressId) {
        await storage.updateUser(userId, { defaultShippingAddressId: null });
      }
      await storage.deleteAddress(addressId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting address:", error);
      res.status(500).json({ message: "Failed to delete address" });
    }
  });
  const orderRoutes = setupAdminOrdersRoutes(isAdmin2);
  router2.use("/orders", orderRoutes);
  return router2;
}

// server/routes/inventory-routes.ts
import express2 from "express";
var isAdmin = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Admin access required" });
};
var router3 = express2.Router();
router3.get("/api/admin/inventory/products", isAdmin, async (req, res) => {
  try {
    const products2 = await storage.getProducts(true);
    const productsWithInventory = await Promise.all(
      products2.map(async (product) => {
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
router3.get("/api/admin/inventory/low-stock", isAdmin, async (req, res) => {
  try {
    const lowStockProducts = await storage.getLowStockProducts(20);
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
router3.get("/api/admin/inventory/recent-transactions", isAdmin, async (req, res) => {
  try {
    const recentTransactions = await storage.getRecentInventoryTransactions(50);
    res.json(recentTransactions);
  } catch (error) {
    console.error("Error fetching inventory transactions:", error);
    res.status(500).json({ message: "Error fetching inventory transactions" });
  }
});
router3.get("/api/admin/inventory/transactions/:productId", isAdmin, async (req, res) => {
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
router3.post("/api/admin/inventory/transaction", isAdmin, async (req, res) => {
  try {
    const transactionData = insertInventoryTransactionSchema.parse({
      productId: req.body.productId,
      quantity: req.body.quantity,
      type: req.body.type || (req.body.quantity > 0 ? "add" : "remove"),
      notes: req.body.notes || null,
      createdBy: req.user?.username || null
    });
    const transaction = await storage.addInventoryTransaction(transactionData);
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error creating inventory transaction:", error);
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError" && "errors" in error) {
      return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
    }
    res.status(500).json({ message: "Error updating inventory" });
  }
});
var inventory_routes_default = router3;

// server/routes/notification-routes.ts
import { Router as Router3 } from "express";
import { z as z2 } from "zod";
var notificationRouter = Router3();
var stockNotificationSchema = z2.object({
  email: z2.string().email("Invalid email address"),
  productId: z2.number().int().positive("Product ID must be a positive integer")
});
notificationRouter.post("/stock-notifications", async (req, res) => {
  try {
    const result = stockNotificationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.format()
      });
    }
    const { email, productId } = result.data;
    const product = await storage.getProductById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }
    const notification = await storage.addStockNotification(email, productId);
    return res.status(200).json({
      message: "Successfully subscribed to stock notifications",
      notification
    });
  } catch (error) {
    console.error("Error creating stock notification:", error);
    return res.status(500).json({
      message: "Error creating notification"
    });
  }
});

// server/middleware/zod-middleware.ts
import { z as z3 } from "zod";
function validateBody(schema) {
  return (req, res, next) => {
    try {
      const data = schema.parse(req.body);
      req.body = data;
      next();
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.format()
        });
      }
      return res.status(500).json({ error: "Internal server error during validation" });
    }
  };
}

// server/routes/address-routes.ts
function registerAddressRoutes(app2) {
  app2.get("/api/addresses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const addresses2 = await storage.getAddressesByUserId(req.user.id);
      res.json(addresses2);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });
  app2.get("/api/addresses/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }
    try {
      const address = await storage.getAddressById(addressId);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to access this address" });
      }
      res.json(address);
    } catch (error) {
      console.error("Error fetching address:", error);
      res.status(500).json({ message: "Failed to fetch address" });
    }
  });
  app2.post("/api/addresses", validateBody(insertAddressSchema.omit({ userId: true })), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const addressData = {
        ...req.body,
        userId: req.user.id
      };
      const existingAddresses = await storage.getAddressesByUserId(req.user.id);
      const isFirstAddress = existingAddresses.length === 0;
      if (isFirstAddress || addressData.isDefault) {
        addressData.isDefault = true;
      }
      const newAddress = await storage.createAddress(addressData);
      if (newAddress.isDefault) {
        await storage.setDefaultAddress(req.user.id, newAddress.id);
      }
      res.status(201).json(newAddress);
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(500).json({ message: "Failed to create address" });
    }
  });
  app2.patch("/api/addresses/:id", validateBody(insertAddressSchema.omit({ userId: true }).partial()), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }
    try {
      const address = await storage.getAddressById(addressId);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to update this address" });
      }
      const updatedAddress = await storage.updateAddress(addressId, req.body);
      if (req.body.isDefault === true) {
        await storage.setDefaultAddress(req.user.id, addressId);
      }
      res.json(updatedAddress);
    } catch (error) {
      console.error("Error updating address:", error);
      res.status(500).json({ message: "Failed to update address" });
    }
  });
  app2.delete("/api/addresses/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }
    try {
      const address = await storage.getAddressById(addressId);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to delete this address" });
      }
      await storage.deleteAddress(addressId);
      if (address.isDefault) {
        const remainingAddresses = await storage.getAddressesByUserId(req.user.id);
        if (remainingAddresses.length > 0) {
          await storage.setDefaultAddress(req.user.id, remainingAddresses[0].id);
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting address:", error);
      res.status(500).json({ message: "Failed to delete address" });
    }
  });
  app2.post("/api/addresses/:id/default", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }
    try {
      const address = await storage.getAddressById(addressId);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to modify this address" });
      }
      await storage.setDefaultAddress(req.user.id, addressId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default address:", error);
      res.status(500).json({ message: "Failed to set default address" });
    }
  });
}

// server/routes/invoice-routes.ts
import { Router as Router4 } from "express";

// server/utils/invoice-generator.ts
function generateInvoiceHtml({ order }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD"
    }).format(parseFloat(amount.toString()));
  };
  const subtotal = order.items.reduce((sum, item) => {
    return sum + parseFloat(item.subtotal);
  }, 0);
  const shippingCost = parseFloat(order.shippingCost || 0);
  const totalAmount = parseFloat(order.totalAmount);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice #${order.orderNumber}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 30px;
          color: #333;
          background-color: #f9f9f9;
        }
        .invoice-container {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          padding: 40px;
          max-width: 210mm;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }
        .invoice-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #2c5e2d, #f59e0b);
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          padding-bottom: 30px;
          border-bottom: 2px solid #f0f0f0;
          margin-bottom: 30px;
        }
        .logo-container {
          display: flex;
          flex-direction: column;
        }
        .logo {
          font-size: 36px;
          font-weight: 800;
          color: #2c5e2d;
          letter-spacing: -0.5px;
          position: relative;
          display: inline-block;
        }
        .logo span {
          color: #f59e0b;
          font-weight: 800;
        }
        .logo::after {
          content: "";
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 30px;
          height: 3px;
          background-color: #f59e0b;
          border-radius: 3px;
        }
        .company-details {
          font-size: 13px;
          color: #666;
          margin-top: 12px;
          line-height: 1.5;
        }
        .invoice-title {
          text-align: right;
        }
        .invoice-title h1 {
          margin: 0;
          font-size: 44px;
          font-weight: 800;
          background: linear-gradient(135deg, #2c5e2d, #4b9950);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          position: relative;
          display: inline-block;
        }
        .invoice-title h1:after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to right, #2c5e2d, #f59e0b);
          border-radius: 4px;
        }
        .invoice-title p {
          margin: 8px 0;
          font-size: 15px;
          color: #555;
        }
        .invoice-info {
          background-color: #f8fafd;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 35px;
          display: flex;
          justify-content: space-between;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
          border: 1px solid #f0f0f0;
        }
        .invoice-info-item {
          flex: 1;
          padding: 0 15px;
          position: relative;
        }
        .invoice-info-item:not(:last-child)::after {
          content: "";
          position: absolute;
          top: 15%;
          right: 0;
          height: 70%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, #e0e0e0, transparent);
        }
        .invoice-info-item h4 {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          font-weight: 600;
        }
        .invoice-info-item p {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #333;
        }
        .invoice-info-item p.status-paid {
          color: #2c5e2d;
          position: relative;
          display: inline-block;
          padding-left: 18px;
        }
        .invoice-info-item p.status-paid::before {
          content: "\u2713";
          position: absolute;
          left: 0;
          top: 0;
          font-weight: bold;
          color: #2c5e2d;
        }
        .invoice-info-item p.status-pending {
          color: #f59e0b;
          position: relative;
          display: inline-block;
          padding-left: 18px;
        }
        .invoice-info-item p.status-pending::before {
          content: "\u23F1";
          position: absolute;
          left: 0;
          top: 0;
          font-weight: bold;
          color: #f59e0b;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .invoice-details .left, .invoice-details .right {
          width: 48%;
        }
        .invoice-details h3 {
          margin-top: 0;
          font-size: 16px;
          color: #2c5e2d;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        .detail-group {
          margin-bottom: 4px;
        }
        .detail-label {
          font-size: 12px;
          color: #666;
        }
        .detail-value {
          font-size: 14px;
          font-weight: 500;
        }
        .addresses {
          margin-bottom: 40px;
        }
        .addresses .shipping {
          width: 100%;
          padding: 25px;
          border-radius: 10px;
          background-color: #f8fafd;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
          border: 1px solid #f0f0f0;
          position: relative;
          overflow: hidden;
        }
        .addresses .shipping::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 100%;
          background: #2c5e2d;
          opacity: 0.7;
        }
        .addresses h3 {
          margin-top: 0;
          font-size: 16px;
          font-weight: 700;
          color: #2c5e2d;
          padding-bottom: 10px;
          margin-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
        }
        .addresses h3::before {
          content: "\u{1F4CD}";
          margin-right: 8px;
          font-size: 18px;
        }
        .address-line {
          margin-bottom: 6px;
          font-size: 14px;
          line-height: 1.4;
        }
        .address-line:first-of-type {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 8px;
        }
        .address-unavailable {
          font-style: italic;
          border-left: 3px solid #f59e0b;
          padding-left: 8px;
          margin: 5px 0;
          background-color: rgba(245, 158, 11, 0.08);
          border-radius: 0 4px 4px 0;
          padding: 6px 10px 6px 10px;
        }
        .address-warning {
          color: #d97706;
          display: flex;
          align-items: center;
          font-weight: 500;
        }
        .warning-icon {
          margin-right: 6px;
          font-style: normal;
        }
        .address-action {
          margin-top: 5px;
          margin-bottom: 10px;
        }
        .address-suggestion {
          color: #2c5e2d;
          font-size: 13px;
          font-style: italic;
          padding-left: 20px;
          position: relative;
        }
        .address-suggestion::before {
          content: "\u2192";
          position: absolute;
          left: 5px;
          top: 0;
          color: #2c5e2d;
          font-weight: bold;
        }
        .text-amber-500 {
          color: #f59e0b;
        }
        .invoice-items {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 40px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
          border: 1px solid #f0f0f0;
        }
        .invoice-items th {
          background: linear-gradient(to right, #f8fafb, #f1f5f7);
          padding: 15px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          color: #444;
          border-bottom: 1px solid #e9ecef;
          position: relative;
        }
        .invoice-items th:first-child {
          border-top-left-radius: 10px;
        }
        .invoice-items th:last-child {
          border-top-right-radius: 10px;
        }
        .invoice-items td {
          padding: 16px 15px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
          vertical-align: top;
        }
        .invoice-items tr:last-child td {
          border-bottom: none;
        }
        .invoice-items .item-name {
          font-weight: 600;
          color: #333;
        }
        .invoice-items .item-id {
          color: #777;
          font-size: 12px;
          margin-top: 3px;
        }
        .invoice-items tr:hover {
          background-color: #f8fafd;
        }
        .invoice-items tbody tr:last-child td:first-child {
          border-bottom-left-radius: 10px;
        }
        .invoice-items tbody tr:last-child td:last-child {
          border-bottom-right-radius: 10px;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .invoice-totals {
          width: 350px;
          margin-left: auto;
          margin-bottom: 40px;
          padding: 20px;
          border-radius: 10px;
          background-color: #f8fafd;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
          border: 1px solid #f0f0f0;
        }
        .invoice-totals table {
          width: 100%;
          border-collapse: collapse;
        }
        .invoice-totals th {
          text-align: left;
          padding: 10px 0;
          font-weight: 500;
          font-size: 14px;
          color: #444;
        }
        .invoice-totals td {
          text-align: right;
          padding: 10px 0;
          font-size: 14px;
          font-weight: 500;
        }
        .invoice-totals tr.divider td, .invoice-totals tr.divider th {
          border-top: 1px solid #e5e8eb;
          padding-top: 15px;
        }
        .invoice-totals .total {
          margin-top: 10px;
          border-top: 2px solid #e0e0e0;
        }
        .invoice-totals .total th {
          font-size: 16px;
          font-weight: 700;
          color: #2c5e2d;
          padding-top: 15px;
        }
        .invoice-totals .total td {
          font-weight: 700;
          font-size: 18px;
          color: #2c5e2d;
          padding-top: 15px;
          position: relative;
        }
        .invoice-totals .total td::after {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(to right, transparent, #2c5e2d, transparent);
          opacity: 0.3;
          border-radius: 3px;
        }
        .invoice-notes {
          margin-top: 40px;
          padding: 20px;
          border-radius: 10px;
          background-color: #f8fafd;
          font-size: 14px;
          border: 1px solid #f0f0f0;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
          position: relative;
          overflow: hidden;
        }
        .invoice-notes::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 5px;
          background-color: #f59e0b;
          opacity: 0.7;
        }
        .invoice-notes h3 {
          margin-top: 0;
          font-size: 16px;
          font-weight: 700;
          color: #2c5e2d;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
        }
        .invoice-notes h3::before {
          content: "\u{1F4DD}";
          margin-right: 8px;
          font-size: 18px;
        }
        .note-item {
          display: flex;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #eee;
        }
        .note-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .note-label {
          font-weight: 600;
          width: 150px;
          flex-shrink: 0;
          color: #444;
        }
        .note-value {
          color: #555;
          flex: 1;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 13px;
          line-height: 1.5;
        }
        .print-button {
          margin-top: 30px;
          text-align: center;
        }
        .print-button button {
          background: linear-gradient(to right, #2c5e2d, #38793a);
          color: white;
          border: none;
          padding: 12px 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(44, 94, 45, 0.25);
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .print-button button::before {
          content: "\u{1F5A8}\uFE0F";
          margin-right: 8px;
          font-size: 18px;
        }
        .print-button button:hover {
          background: linear-gradient(to right, #224a24, #2c5e2d);
          box-shadow: 0 5px 8px rgba(44, 94, 45, 0.3);
          transform: translateY(-1px);
        }
        @media print {
          body {
            padding: 0;
            background-color: white;
          }
          .invoice-container {
            box-shadow: none;
            padding: 20px;
            max-width: none;
          }
          .print-button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="logo-container">
            <div class="logo">
              Poultry<span>Gear</span>
            </div>
            <div class="company-details">
              123 Poultry Lane, Chicken City, PC 12345<br>
              VAT ID: PG123456789 | Registration: 987654321
            </div>
          </div>
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <p>Invoice #: <strong>${order.orderNumber}</strong></p>
            <p>Date: <strong>${formatDate(order.createdAt)}</strong></p>
          </div>
        </div>
        
        <div class="invoice-info">
          <div class="invoice-info-item">
            <h4>Order Status</h4>
            <p>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
          </div>
          <div class="invoice-info-item">
            <h4>Payment Status</h4>
            <p class="${order.paymentStatus === "paid" ? "status-paid" : "status-pending"}">
              ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </p>
          </div>
          <div class="invoice-info-item">
            <h4>Payment Method</h4>
            <p>${(order.paymentMethod || "Not specified").charAt(0).toUpperCase() + (order.paymentMethod || "Not specified").slice(1)}</p>
          </div>
          <div class="invoice-info-item">
            <h4>Currency</h4>
            <p>${order.currency}</p>
          </div>
        </div>
        
        <div class="invoice-details">
          <div class="left">
            <h3>From</h3>
            <div class="detail-group">
              <div class="detail-label">Company</div>
              <div class="detail-value">PoultryGear Co.</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Address</div>
              <div class="detail-value">123 Poultry Lane</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">City, Zip</div>
              <div class="detail-value">Chicken City, PC 12345</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Email</div>
              <div class="detail-value">info@poultrygear.com</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Phone</div>
              <div class="detail-value">(123) 456-7890</div>
            </div>
          </div>
          <div class="right">
            <h3>Customer</h3>
            <div class="detail-group">
              <div class="detail-label">Name</div>
              <div class="detail-value">
                ${order.shippingAddress?.firstName && order.shippingAddress?.lastName ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : order.user?.username || "Guest"}
              </div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Customer ID</div>
              <div class="detail-value">
                ${order.userId ? `<span style="color: #2c5e2d; font-weight: 500;">${order.user?.username || ""}</span> (ID: ${order.userId})` : '<span style="color: #f59e0b;">Guest</span>'}
              </div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Email</div>
              <div class="detail-value">
                ${order.shippingAddress?.email || order.user?.email || "Not provided"}
              </div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Phone</div>
              <div class="detail-value">
                ${order.shippingAddress?.phone || "Not provided"}
              </div>
            </div>
          </div>
        </div>
        
        <div class="addresses">
          <div class="shipping">
            <h3>Shipping Address</h3>
            ${order.shippingAddress ? `
              <div class="address-line">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</div>
              <div class="address-line">${order.shippingAddress.address}</div>
              <div class="address-line">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</div>
              <div class="address-line">${order.shippingAddress.country}</div>
              ${order.shippingAddress.phone ? `<div class="address-line">Phone: ${order.shippingAddress.phone}</div>` : ""}
            ` : order.user ? `
              <div class="address-line"><strong>${order.user.username || "Customer"}</strong></div>
              <div class="address-line address-unavailable">
                <span class="address-warning"><i class="warning-icon">\u26A0\uFE0F</i> No shipping address provided</span>
              </div>
              <div class="address-line address-action">
                <span class="address-suggestion">Please add shipping address during checkout for faster delivery</span>
              </div>
              ${order.user.email ? `<div class="address-line"><strong>Email:</strong> ${order.user.email}</div>` : ""}
            ` : `
              <div class="address-line"><strong>Guest Order</strong></div>
              <div class="address-line address-unavailable">
                <span class="address-warning"><i class="warning-icon">\u26A0\uFE0F</i> No shipping address provided</span>
              </div>
              <div class="address-line address-action">
                <span class="address-suggestion">Please register and add shipping address for future orders</span>
              </div>
            `}
          </div>
        </div>
        
        <table class="invoice-items">
          <thead>
            <tr>
              <th width="5%">#</th>
              <th width="45%">Description</th>
              <th width="15%" class="text-center">Quantity</th>
              <th width="15%" class="text-right">Price</th>
              <th width="20%" class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>
                  <div class="item-name">${item.product?.name || "Product no longer available"}</div>
                  ${item.product?.id ? `<div class="item-id">Product ID: ${item.product.id}</div>` : ""}
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.unitPrice, order.currency)}</td>
                <td class="text-right">${formatCurrency(item.subtotal, order.currency)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        
        <div class="invoice-totals">
          <table>
            <tr>
              <th>Subtotal</th>
              <td>${formatCurrency(subtotal, order.currency)}</td>
            </tr>
            <tr>
              <th>Shipping</th>
              <td>${formatCurrency(shippingCost, order.currency)}</td>
            </tr>
            ${parseFloat(shippingCost.toString()) > 0 ? `
            <tr class="divider">
              <th>Tax</th>
              <td>${formatCurrency("0", order.currency)}</td>
            </tr>
            ` : ""}
            <tr class="total">
              <th>Total</th>
              <td>${formatCurrency(totalAmount, order.currency)}</td>
            </tr>
          </table>
        </div>
        
        <div class="invoice-notes">
          <h3>Additional Information</h3>
          <div class="note-item">
            <div class="note-label">Payment Status:</div>
            <div class="note-value">${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</div>
          </div>
          <div class="note-item">
            <div class="note-label">Shipping Method:</div>
            <div class="note-value">${order.shippingMethod || "Standard Shipping"}</div>
          </div>
          ${order.notes ? `
          <div class="note-item">
            <div class="note-label">Notes:</div>
            <div class="note-value">${order.notes}</div>
          </div>
          ` : ""}
        </div>
        
        <div class="footer">
          Thank you for your business with PoultryGear!<br>
          For any inquiries, please contact our customer service at support@poultrygear.com
        </div>
        
        <div class="print-button">
          <button onclick="window.print()">Print Invoice</button>
        </div>
      </div>
      
      <script>
        // Auto-print when the page loads
        window.onload = function() {
          // Uncomment the line below to automatically trigger printing when opened
          // window.print();
          
          // Make all text elements editable when in edit mode
          document.addEventListener('DOMContentLoaded', function() {
            // Check if parent page has put us in edit mode
            if (window.parent && window.parent.document.querySelector('.edit-mode')) {
              const editableElements = document.querySelectorAll('.invoice-container *:not(script):not(style)');
              editableElements.forEach(el => {
                if (el.children.length === 0 || el.tagName === 'TD' || el.tagName === 'TH' || 
                    el.classList.contains('detail-value') || el.classList.contains('note-value') || 
                    el.classList.contains('address-line')) {
                  el.setAttribute('contenteditable', 'true');
                }
              });
            }
          });
        };
      </script>
    </body>
    </html>
  `;
}

// server/routes/invoice-routes.ts
import fs2 from "fs";
import path2 from "path";
var router4 = Router4();
var EDITED_INVOICES_DIR = path2.join(process.cwd(), "temp_extract", "edited_invoices");
try {
  if (!fs2.existsSync(EDITED_INVOICES_DIR)) {
    fs2.mkdirSync(EDITED_INVOICES_DIR, { recursive: true });
    console.log("Created edited invoices directory:", EDITED_INVOICES_DIR);
  }
} catch (err) {
  console.error("Error creating edited invoices directory:", err);
}
router4.get("/invoices/:id", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    console.log("Public invoice route hit for order ID:", orderId);
    const order = await storage.getOrderById(orderId);
    if (!order) {
      console.error("Order not found:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }
    console.log("Order found, fetching items...");
    const items = await storage.getOrderItemsByOrderId(order.id);
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        return {
          ...item,
          product: product || { name: "Product no longer available" }
        };
      })
    );
    const user = await storage.getUser(order.userId);
    const shippingAddress = order.shippingAddressId ? await storage.getAddressById(order.shippingAddressId) : null;
    const billingAddress = order.billingAddressId ? await storage.getAddressById(order.billingAddressId) : null;
    const fullOrderData = {
      ...order,
      items: itemsWithProducts,
      user,
      shippingAddress,
      billingAddress
    };
    const invoiceHtml = generateInvoiceHtml({ order: fullOrderData });
    res.setHeader("Content-Type", "text/html");
    return res.send(invoiceHtml);
  } catch (error) {
    console.error("Error generating public invoice:", error);
    return res.status(500).json({
      message: "Failed to generate invoice",
      error: String(error)
    });
  }
});
router4.post("/invoices/:id/save", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    if (!req.body || !req.body.htmlContent) {
      return res.status(400).json({ message: "Missing HTML content in request" });
    }
    console.log(`Saving edited invoice for order ID: ${orderId}`);
    const order = await storage.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/:/g, "-");
    const fileName = `invoice_${orderId}_${timestamp2}.html`;
    const filePath = path2.join(EDITED_INVOICES_DIR, fileName);
    fs2.writeFileSync(filePath, req.body.htmlContent);
    console.log(`Saved edited invoice to ${filePath}`);
    return res.status(200).json({
      message: "Invoice saved successfully",
      filePath
    });
  } catch (error) {
    console.error("Error saving edited invoice:", error);
    return res.status(500).json({
      message: "Failed to save invoice",
      error: String(error)
    });
  }
});
router4.get("/invoices/:id/edited", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    const pattern = `invoice_${orderId}_*.html`;
    const files = fs2.readdirSync(EDITED_INVOICES_DIR).filter((file) => file.startsWith(`invoice_${orderId}_`) && file.endsWith(".html")).sort().reverse();
    if (files.length === 0) {
      return res.status(404).json({ message: "No edited invoice found" });
    }
    const filePath = path2.join(EDITED_INVOICES_DIR, files[0]);
    const content = fs2.readFileSync(filePath, "utf8");
    res.setHeader("Content-Type", "text/html");
    return res.send(content);
  } catch (error) {
    console.error("Error retrieving edited invoice:", error);
    return res.status(500).json({
      message: "Failed to retrieve edited invoice",
      error: String(error)
    });
  }
});
var invoiceRouter = router4;

// server/routes.ts
async function registerRoutes(app2) {
  const { isAuthenticated, isAdmin: isAdmin2 } = setupAuth(app2);
  app2.use("/api/user", setupUserRoutes(isAuthenticated));
  app2.use("/api/admin", setupAdminRoutes(isAdmin2));
  app2.use(inventory_routes_default);
  app2.use("/api", notificationRouter);
  registerAddressRoutes(app2);
  app2.use("/api", invoiceRouter);
  app2.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const cartItems2 = await storage.getUserCartItems(req.user.id);
      const cartItemsWithProducts = await Promise.all(
        cartItems2.map(async (item) => {
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
  app2.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const cartItem = await storage.addCartItem({
        userId: req.user.id,
        productId,
        quantity
      });
      res.status(201).json({
        ...cartItem,
        product
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  app2.put("/api/cart/:productId", isAuthenticated, async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
      const updatedCartItem = await storage.updateCartItemQuantity(
        req.user.id,
        parseInt(productId),
        quantity
      );
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
  app2.delete("/api/cart/:productId", isAuthenticated, async (req, res) => {
    try {
      const { productId } = req.params;
      const removed = await storage.removeCartItem(req.user.id, parseInt(productId));
      if (!removed) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });
  app2.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      await storage.clearUserCart(req.user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  app2.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders2 = await storage.getOrdersByUserId(req.user.id);
      const ordersWithItems = await Promise.all(
        orders2.map(async (order) => {
          const items = await storage.getOrderItemsByOrderId(order.id);
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
  app2.get("/api/orders/:orderId", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const items = await storage.getOrderItemsByOrderId(order.id);
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
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/categories/:slug", async (req, res) => {
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
  app2.get("/api/products", async (req, res) => {
    try {
      const { categoryId, search, featured } = req.query;
      const includeUnpublished = false;
      if (search && typeof search === "string") {
        const products3 = await storage.searchProducts(search, includeUnpublished);
        return res.json(products3);
      }
      if (categoryId && typeof categoryId === "string") {
        const categoryIdNum = parseInt(categoryId, 10);
        if (isNaN(categoryIdNum)) {
          return res.status(400).json({ message: "Invalid category ID" });
        }
        const products3 = await storage.getProductsByCategory(categoryIdNum, includeUnpublished);
        return res.json(products3);
      }
      if (featured === "true") {
        const featuredProducts = await storage.getFeaturedProducts(includeUnpublished);
        return res.json(featuredProducts);
      }
      const products2 = await storage.getProducts(includeUnpublished);
      const normalizedProducts = products2.map((product) => {
        return {
          ...product,
          additionalImages: product.additionalImages || [],
          specs: product.specs || {},
          features: product.features || [],
          tags: product.tags || [],
          sku: product.sku || "",
          weight: product.weight || "",
          dimensions: product.dimensions || "",
          warrantyInfo: product.warrantyInfo || "",
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || ""
        };
      });
      res.json(normalizedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:slug", async (req, res) => {
    try {
      const includeUnpublished = false;
      const product = await storage.getProductBySlug(req.params.slug, includeUnpublished);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const productImages2 = await storage.getProductImages(product.id);
      const additionalImagesUrls = productImages2.filter((img) => !img.isPrimary).map((img) => img.url);
      const normalizedProduct = {
        ...product,
        additionalImages: additionalImagesUrls,
        specs: product.specs || {},
        features: product.features || [],
        tags: product.tags || [],
        sku: product.sku || "",
        weight: product.weight || "",
        dimensions: product.dimensions || "",
        warrantyInfo: product.warrantyInfo || "",
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || ""
      };
      res.json(normalizedProduct);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  app2.delete("/api/products/:slug", async (req, res) => {
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
  app2.post("/api/waitlist", async (req, res) => {
    try {
      const parseResult = insertWaitlistSchema.safeParse({
        ...req.body,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
  app2.post("/api/contact", async (req, res) => {
    try {
      const parseResult = insertContactSchema.safeParse({
        ...req.body,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
  app2.patch("/api/products/:id/media", async (req, res) => {
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
  app2.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const {
        name,
        nameAr,
        description,
        descriptionAr,
        price,
        originalPrice,
        categoryId,
        imageUrl,
        featured,
        inStock,
        badge,
        badgeAr
      } = req.body;
      const updateData = {};
      if (name !== void 0) updateData.name = name;
      if (nameAr !== void 0) updateData.nameAr = nameAr;
      if (description !== void 0) updateData.description = description;
      if (descriptionAr !== void 0) updateData.descriptionAr = descriptionAr;
      if (price !== void 0) updateData.price = price;
      if (originalPrice !== void 0) updateData.originalPrice = originalPrice;
      if (categoryId !== void 0) updateData.categoryId = categoryId;
      if (imageUrl !== void 0) updateData.imageUrl = imageUrl;
      if (featured !== void 0) updateData.featured = featured;
      if (inStock !== void 0) updateData.inStock = inStock;
      if (badge !== void 0) updateData.badge = badge;
      if (badgeAr !== void 0) updateData.badgeAr = badgeAr;
      const updatedProduct = await storage.updateProduct(id, updateData);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product details" });
    }
  });
  app2.post("/api/reset-database", async (req, res) => {
    try {
      await storage.seedInitialData();
      res.json({ message: "Database reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset database" });
    }
  });
  app2.post("/api/checkout", async (req, res) => {
    try {
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
      let effectiveUserId;
      if (req.isAuthenticated()) {
        effectiveUserId = req.user.id;
      } else if (userId && userId > 0) {
        effectiveUserId = userId;
      } else {
        effectiveUserId = 1;
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }
      const date = /* @__PURE__ */ new Date();
      const datePart = date.getFullYear().toString() + (date.getMonth() + 1).toString().padStart(2, "0") + date.getDate().toString().padStart(2, "0");
      const randomPart = Math.floor(1e3 + Math.random() * 9e3).toString();
      const orderNumber = `ORD-${datePart}-${randomPart}`;
      console.log("Pre-truncation values:", {
        currency,
        totalAmount,
        paymentStatus,
        shippingMethod,
        shippingCost
      });
      let currencyCode = "USD";
      if (currency) {
        if (typeof currency === "object" && currency.code) {
          currencyCode = currency.code;
        } else if (typeof currency === "string") {
          currencyCode = currency;
        }
      }
      let shippingAddressId = null;
      if (shippingAddress) {
        try {
          console.log("Processing shipping address:", shippingAddress);
        } catch (error) {
          console.error("Error creating shipping address:", error);
        }
      }
      const orderData = {
        userId: effectiveUserId,
        orderNumber: orderNumber.substring(0, 50),
        status: status ? status.substring(0, 20) : "pending",
        totalAmount: totalAmount ? totalAmount.substring(0, 20) : "0",
        currency: currencyCode.substring(0, 3),
        // Most currency codes are 3 chars
        paymentStatus: paymentStatus ? paymentStatus.substring(0, 20) : "pending",
        shippingMethod: shippingMethod ? shippingMethod.substring(0, 50) : null,
        shippingCost: shippingCost ? shippingCost.substring(0, 20) : "0",
        notes: notes ? notes.substring(0, 1e3) : null,
        // References to related entities
        shippingAddressId,
        billingAddressId: null,
        paymentMethodId: null
      };
      console.log("Creating order with data:", orderData);
      const order = await storage.createOrder(orderData);
      const orderItems2 = await Promise.all(
        items.map(
          (item) => storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.substring(0, 20),
            subtotal: item.subtotal.substring(0, 20)
          })
        )
      );
      if (req.isAuthenticated()) {
        const cartItems2 = await storage.getUserCartItems(req.user.id);
        for (const item of cartItems2) {
          await storage.removeCartItem(req.user.id, item.productId);
        }
      }
      res.status(201).json({ ...order, items: orderItems2 });
    } catch (error) {
      console.error("Error processing checkout:", error);
      let errorMessage = "Failed to process checkout";
      if (error.code === "22001") {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express3 from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express3.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express();

// Add CORS configuration
app.use(cors({
  origin: 'https://poultrygear.com',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var publicDir = path5.join(process.cwd(), "public");
var uploadsDir2 = path5.join(publicDir, "uploads");
if (!fs4.existsSync(uploadsDir2)) {
  fs4.mkdirSync(uploadsDir2, { recursive: true });
}
app.use(express.static(publicDir));
console.log("Serving static files from:", publicDir);
console.log("Upload directory:", uploadsDir2);
app.use((req, res, next) => {
  const start = Date.now();
  const path6 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path6.startsWith("/api")) {
      let logLine = `${req.method} ${path6} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    await storage.seedInitialData();
    log("Database initialized successfully.");
  } catch (error) {
    log("Error initializing database:", error);
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
