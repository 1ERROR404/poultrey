import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  waitlistEntries, type WaitlistEntry, type InsertWaitlistEntry,
  contactMessages, type ContactMessage, type InsertContactMessage,
  addresses, type Address, type InsertAddress,
  paymentMethods, type PaymentMethod, type InsertPaymentMethod,
  orders, type Order, type InsertOrder, 
  orderItems, type OrderItem, type InsertOrderItem,
  productImages, type ProductImage, type InsertProductImage,
  inventoryTransactions, type InventoryTransaction, type InsertInventoryTransaction,
  inventoryLevels, type InventoryLevel, type InsertInventoryLevel,
  stockNotifications, type StockNotification, type InsertStockNotification,
  cartItems, type CartItem, type InsertCartItem
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<Omit<User, 'id' | 'password'>>): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<User>;
  updateUserDefaultShippingAddress(userId: number, addressId: number | null): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUserCount(): Promise<number>;
  getUserStatsByMonth(months: number): Promise<{ month: string, count: number }[]>;
  deleteUser(id: number): Promise<boolean>;
  
  // Cart methods
  getUserCartItems(userId: number): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(userId: number, productId: number, quantity: number): Promise<CartItem>;
  removeCartItem(userId: number, productId: number): Promise<boolean>;
  clearUserCart(userId: number): Promise<boolean>;
  
  // User Address methods
  getAddressesByUserId(userId: number): Promise<Address[]>;
  getAddressById(id: number): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, addressData: Partial<Omit<Address, 'id' | 'userId'>>): Promise<Address>;
  deleteAddress(id: number): Promise<boolean>;
  setDefaultAddress(userId: number, addressId: number): Promise<boolean>;
  
  // Order methods
  createOrder(orderData: InsertOrder): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getOrderCount(): Promise<number>;
  getRecentOrders(limit: number): Promise<Order[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]>;
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<Order>;
  updateOrderNotes(id: number, notes: string): Promise<Order>;
  getTotalRevenue(): Promise<string>;
  getMonthlyRevenue(months: number): Promise<{ month: string, revenue: string }[]>;
  
  // Payment Method methods
  getPaymentMethodsByUserId(userId: number): Promise<PaymentMethod[]>;
  getPaymentMethodById(id: number): Promise<PaymentMethod | undefined>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, data: Partial<Omit<PaymentMethod, 'id' | 'userId'>>): Promise<PaymentMethod>;
  deletePaymentMethod(id: number): Promise<boolean>;
  setDefaultPaymentMethod(userId: number, paymentMethodId: number): Promise<boolean>;
  

  
  // Removed duplicate methods - already declared in Order methods section
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, categoryData: Partial<Omit<Category, 'id'>>): Promise<Category>;
  deleteCategory(id: number): Promise<boolean>;
  getCategoryCount(): Promise<number>;
  getCategoryProductCount(categoryId: number): Promise<number>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  searchProducts(query: string): Promise<Product[]>;
  updateProductMedia(id: number, mediaData: {
    videoUrl?: string;
    additionalImages?: string[];
    descriptionImages?: string[];
    specificationImages?: string[];
  }): Promise<Product>;
  updateProduct(id: number, productData: Partial<Omit<Product, 'id'>>): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
  deleteProductBySlug(slug: string): Promise<boolean>;
  getProductCount(): Promise<number>;
  getLowStockProducts(limit: number): Promise<Product[]>;
  
  // Product Image methods
  getProductImages(productId: number): Promise<ProductImage[]>;
  getProductImageById(imageId: number): Promise<ProductImage | undefined>;
  addProductImage(image: InsertProductImage): Promise<ProductImage>;
  updateProductImage(imageId: number, data: Partial<Omit<ProductImage, 'id' | 'productId' | 'createdAt'>>): Promise<ProductImage>;
  updateProductImagePrimary(productId: number, primaryImageId: number | null): Promise<void>;
  deleteProductImage(imageId: number): Promise<boolean>;
  
  // Waitlist methods
  createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry>;
  getWaitlistEntries(): Promise<WaitlistEntry[]>;
  getAllWaitlistEntries(): Promise<WaitlistEntry[]>;
  getWaitlistEntryById(id: number): Promise<WaitlistEntry | undefined>;
  deleteWaitlistEntry(id: number): Promise<boolean>;
  
  // Contact methods
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  getContactMessageById(id: number): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<boolean>;
  getRecentContactMessages(limit: number): Promise<ContactMessage[]>;
  
  // Inventory methods
  createInventoryLevel(inventoryLevel: InsertInventoryLevel): Promise<InventoryLevel>;
  getInventoryLevelByProductId(productId: number): Promise<InventoryLevel | undefined>;
  updateInventoryLevel(productId: number, data: Partial<Omit<InventoryLevel, 'id' | 'productId' | 'lastUpdated'>>): Promise<InventoryLevel>;
  addInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
  getInventoryTransactionsByProductId(productId: number): Promise<InventoryTransaction[]>;
  getRecentInventoryTransactions(limit: number): Promise<InventoryTransaction[]>;
  getLowStockProducts(limit: number): Promise<Product[]>;
  
  // Stock notification methods
  addStockNotification(email: string, productId: number): Promise<StockNotification>;
  getStockNotifications(productId: number): Promise<StockNotification[]>;
  updateStockNotificationStatus(id: number, isNotified: boolean): Promise<StockNotification>;
  deleteStockNotification(id: number): Promise<boolean>;
  
  // Database seed methods
  seedInitialData(): Promise<void>;
}

import { db, pool, eq, ilike, or, and, sql, not, isNull } from "./db";
import { 
  addStockNotification as addStockNotificationImpl,
  getStockNotifications as getStockNotificationsImpl,
  updateStockNotificationStatus as updateStockNotificationStatusImpl,
  deleteStockNotification as deleteStockNotificationImpl
} from "./storage-notifications";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
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
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
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
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
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
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        role: users.role,
        defaultShippingAddressId: users.defaultShippingAddressId
      });
      return user as User;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }
  
  async updateUser(id: number, userData: Partial<Omit<User, 'id' | 'password'>>): Promise<User> {
    try {
      const [updatedUser] = await db.update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          role: users.role,
          defaultShippingAddressId: users.defaultShippingAddressId
        });
        
      return updatedUser as User;
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  }
  
  async updateUserPassword(id: number, password: string): Promise<User> {
    try {
      const [updatedUser] = await db.update(users)
        .set({ password })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          role: users.role,
          defaultShippingAddressId: users.defaultShippingAddressId
        });
        
      return updatedUser as User;
    } catch (error) {
      console.error("Error in updateUserPassword:", error);
      throw error;
    }
  }
  
  // Address methods
  async getAddressesByUserId(userId: number): Promise<Address[]> {
    // Explicitly select all fields we need to avoid references to non-existent columns
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
    })
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(sql`${addresses.isDefault} DESC, ${addresses.createdAt} DESC`);
  }
  
  async getAddressById(id: number): Promise<Address | undefined> {
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
    })
    .from(addresses)
    .where(eq(addresses.id, id));
      
    return address;
  }
  
  async createAddress(address: InsertAddress): Promise<Address> {
    // If this is marked as default, unset any existing default addresses for this user
    if (address.isDefault) {
      await db.update(addresses)
        .set({ isDefault: false })
        .where(and(
          eq(addresses.userId, address.userId),
          eq(addresses.isDefault, true)
        ));
    }
    
    const result = await db.insert(addresses)
      .values(address)
      .returning({
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
  
  async updateAddress(id: number, addressData: Partial<Omit<Address, 'id' | 'userId'>>): Promise<Address> {
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
    })
    .from(addresses)
    .where(eq(addresses.id, id));
      
    if (!address) {
      throw new Error('Address not found');
    }
    
    // If setting this as default, unset any existing default addresses
    if (addressData.isDefault) {
      await db.update(addresses)
        .set({ isDefault: false })
        .where(and(
          eq(addresses.userId, address.userId),
          eq(addresses.isDefault, true),
          not(eq(addresses.id, id))
        ));
    }
    
    // Removed updatedAt since the column doesn't exist yet in the database
    const dataWithTimestamp = {
      ...addressData
    };
    
    const result = await db.update(addresses)
      .set(dataWithTimestamp)
      .where(eq(addresses.id, id))
      .returning({
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
  
  async deleteAddress(id: number): Promise<boolean> {
    const [address] = await db.delete(addresses)
      .where(eq(addresses.id, id))
      .returning();
      
    return !!address;
  }
  
  async setDefaultAddress(userId: number, addressId: number): Promise<boolean> {
    // First, set all user's addresses to non-default
    await db.update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, userId));
      
    // Then set the selected address as default
    const [updatedAddress] = await db.update(addresses)
      .set({ isDefault: true })
      .where(and(
        eq(addresses.id, addressId),
        eq(addresses.userId, userId)
      ))
      .returning();
      
    // Also update the user's defaultShippingAddressId
    if (updatedAddress) {
      await db.update(users)
        .set({ defaultShippingAddressId: addressId })
        .where(eq(users.id, userId));
    }
      
    return !!updatedAddress;
  }
  
  // Payment Method methods
  async getPaymentMethodsByUserId(userId: number): Promise<PaymentMethod[]> {
    return db.select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId))
      .orderBy(sql`${paymentMethods.isDefault} DESC, ${paymentMethods.createdAt} DESC`);
  }
  
  async getPaymentMethodById(id: number): Promise<PaymentMethod | undefined> {
    const [paymentMethod] = await db.select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id));
      
    return paymentMethod;
  }
  
  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    // If this is marked as default, unset any existing default payment methods
    if (method.isDefault) {
      await db.update(paymentMethods)
        .set({ isDefault: false })
        .where(and(
          eq(paymentMethods.userId, method.userId),
          eq(paymentMethods.isDefault, true)
        ));
    }
    
    const [newMethod] = await db.insert(paymentMethods)
      .values(method)
      .returning();
      
    return newMethod;
  }
  
  async updatePaymentMethod(id: number, data: Partial<Omit<PaymentMethod, 'id' | 'userId'>>): Promise<PaymentMethod> {
    const [method] = await db.select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id));
      
    if (!method) {
      throw new Error('Payment method not found');
    }
    
    // If setting this as default, unset any existing default payment methods
    if (data.isDefault) {
      await db.update(paymentMethods)
        .set({ isDefault: false })
        .where(and(
          eq(paymentMethods.userId, method.userId),
          eq(paymentMethods.isDefault, true),
          not(eq(paymentMethods.id, id))
        ));
    }
    
    const dataWithTimestamp = {
      ...data,
      updatedAt: new Date()
    };
    
    const [updatedMethod] = await db.update(paymentMethods)
      .set(dataWithTimestamp)
      .where(eq(paymentMethods.id, id))
      .returning();
      
    return updatedMethod;
  }
  
  async deletePaymentMethod(id: number): Promise<boolean> {
    const [method] = await db.delete(paymentMethods)
      .where(eq(paymentMethods.id, id))
      .returning();
      
    return !!method;
  }
  
  async setDefaultPaymentMethod(userId: number, paymentMethodId: number): Promise<boolean> {
    // First, set all user's payment methods to non-default
    await db.update(paymentMethods)
      .set({ isDefault: false })
      .where(eq(paymentMethods.userId, userId));
      
    // Then set the selected payment method as default
    const [updatedMethod] = await db.update(paymentMethods)
      .set({ isDefault: true })
      .where(and(
        eq(paymentMethods.id, paymentMethodId),
        eq(paymentMethods.userId, userId)
      ))
      .returning();
      
    return !!updatedMethod;
  }
  
  // Order methods
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    // Using the correct column name 'user_id' from the database schema
    return db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(sql`${orders.createdAt} DESC`);
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select()
      .from(orders)
      .where(eq(orders.id, id));
      
    return order;
  }
  
  async getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber));
      
    return order;
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    // Log order data to diagnose issues
    console.log("Creating order with data:", JSON.stringify(order));
    
    try {
      const [newOrder] = await db.insert(orders)
        .values(order)
        .returning();
      return newOrder;
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error;
    }
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db.update(orders)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
      
    return updatedOrder;
  }
  
  async updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<Order> {
    const [updatedOrder] = await db.update(orders)
      .set({ 
        paymentStatus,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
      
    return updatedOrder;
  }
  
  async updateOrderNotes(id: number, notes: string): Promise<Order> {
    const [updatedOrder] = await db.update(orders)
      .set({ 
        notes,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
      
    return updatedOrder;
  }
  
  // Additional Order methods
  async getAllOrders(): Promise<Order[]> {
    return db.select()
      .from(orders)
      .orderBy(sql`${orders.createdAt} DESC`);
  }
  
  async getOrderCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(orders);
    return Number(result[0].count);
  }
  
  async getRecentOrders(limit: number): Promise<Order[]> {
    return db.select()
      .from(orders)
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(limit);
  }
  
  async getTotalRevenue(): Promise<string> {
    const result = await db.select({
      totalRevenue: sql`SUM(CAST(${orders.totalAmount} AS DECIMAL))`
    }).from(orders).where(eq(orders.paymentStatus, "paid"));
    
    return result[0].totalRevenue?.toString() || "0";
  }
  
  async getMonthlyRevenue(months: number): Promise<{ month: string, revenue: string }[]> {
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - months);
    
    const result = await db.select({
      month: sql`to_char(${orders.createdAt}, 'YYYY-MM')`,
      revenue: sql`SUM(CAST(${orders.totalAmount} AS DECIMAL))`
    })
    .from(orders)
    .where(and(
      sql`${orders.createdAt} >= ${pastDate.toISOString()}`,
      eq(orders.paymentStatus, "paid")
    ))
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`);
    
    return result.map(item => ({
      month: item.month as string,
      revenue: item.revenue?.toString() || "0"
    }));
  }
  
  // Order Item methods
  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return db.select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems)
      .values(orderItem)
      .returning();
      
    return newOrderItem;
  }
  
  async createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]> {
    if (items.length === 0) return [];
    
    const insertedItems = await db.insert(orderItems)
      .values(items)
      .returning();
      
    return insertedItems;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }
  
  // Product methods
  async getProducts(includeUnpublished: boolean = false): Promise<Product[]> {
    if (includeUnpublished) {
      return db.select().from(products);
    } else {
      return db.select().from(products).where(eq(products.published, true));
    }
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async getProductBySlug(slug: string, includeUnpublished: boolean = false): Promise<Product | undefined> {
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
  
  async getProductsByCategory(categoryId: number, includeUnpublished: boolean = false): Promise<Product[]> {
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
  
  async getFeaturedProducts(includeUnpublished: boolean = false): Promise<Product[]> {
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
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    console.log("Creating product with data:", insertProduct);

    // Ensure the published field is set to true if not provided
    if (insertProduct.published === undefined) {
      insertProduct.published = true;
      console.log("Setting published value to true (was undefined)");
    }

    const [product] = await db.insert(products).values(insertProduct).returning();
    console.log("Product created successfully:", product);
    return product;
  }
  
  async searchProducts(query: string, includeUnpublished: boolean = false): Promise<Product[]> {
    query = query.toLowerCase().trim();
    if (!query) return [];
    
    const conditions = [
      or(
        ilike(products.name, `%${query}%`),
        ilike(products.nameAr || '', `%${query}%`),
        ilike(products.description, `%${query}%`),
        ilike(products.descriptionAr || '', `%${query}%`)
      )
    ];
    
    if (!includeUnpublished) {
      conditions.push(eq(products.published, true));
    }
    
    return db.select().from(products).where(and(...conditions));
  }
  
  async updateProductMedia(id: number, mediaData: {
    videoUrl?: string;
    additionalImages?: string[];
    descriptionImages?: string[];
    specificationImages?: string[];
  }): Promise<Product> {
    const [updatedProduct] = await db.update(products)
      .set(mediaData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }
  
  async updateProduct(id: number, productData: Partial<Omit<Product, 'id'>>): Promise<Product> {
    const [updatedProduct] = await db.update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const [deletedProduct] = await db.delete(products)
      .where(eq(products.id, id))
      .returning();
    return !!deletedProduct;
  }
  
  async deleteProductBySlug(slug: string): Promise<boolean> {
    const product = await this.getProductBySlug(slug);
    if (!product) return false;
    return this.deleteProduct(product.id);
  }
  
  // Waitlist methods
  async createWaitlistEntry(insertEntry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const [entry] = await db.insert(waitlistEntries).values(insertEntry).returning();
    return entry;
  }
  
  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    return db.select().from(waitlistEntries);
  }
  
  // Contact methods
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db.insert(contactMessages).values(insertMessage).returning();
    return message;
  }
  
  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages);
  }
  
  // Admin methods - Users
  
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(users);
    return Number(result[0].count);
  }
  
  async updateUserDefaultShippingAddress(userId: number, addressId: number | null): Promise<User> {
    try {
      const [updatedUser] = await db.update(users)
        .set({ defaultShippingAddressId: addressId })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          role: users.role,
          defaultShippingAddressId: users.defaultShippingAddressId
        });
        
      return updatedUser as User;
    } catch (error) {
      console.error("Error in updateUserDefaultShippingAddress:", error);
      throw error;
    }
  }
  
  async getUserStatsByMonth(months: number): Promise<{ month: string, count: number }[]> {
    // Since we don't have createdAt, return simpler mock data for demonstration
    return [
      { month: "2025-03", count: 5 },
      { month: "2025-04", count: 8 }
    ];
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const [user] = await db.delete(users)
      .where(eq(users.id, id))
      .returning();
      
    return !!user;
  }
  
  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        role: users.role,
        defaultShippingAddressId: users.defaultShippingAddressId
      })
      .from(users)
      .orderBy(users.username);
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return [];
    }
  }
  
  // Cart methods
  async getUserCartItems(userId: number): Promise<CartItem[]> {
    return db.select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId))
      .orderBy(cartItems.createdAt);
  }
  
  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    try {
      // Check if the item already exists in the cart
      const [existingItem] = await db.select()
        .from(cartItems)
        .where(and(
          eq(cartItems.userId, item.userId),
          eq(cartItems.productId, item.productId)
        ));
      
      if (existingItem) {
        // Update the quantity instead of creating a new item
        return this.updateCartItemQuantity(
          item.userId, 
          item.productId, 
          existingItem.quantity + (item.quantity || 1)
        );
      }
      
      // Create new cart item
      const [newCartItem] = await db.insert(cartItems)
        .values(item)
        .returning();
        
      return newCartItem;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }
  
  async updateCartItemQuantity(userId: number, productId: number, quantity: number): Promise<CartItem> {
    if (quantity <= 0) {
      await this.removeCartItem(userId, productId);
      throw new Error('Item removed from cart due to zero or negative quantity');
    }
    
    const [updatedItem] = await db.update(cartItems)
      .set({ 
        quantity
      })
      .where(and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId)
      ))
      .returning();
      
    if (!updatedItem) {
      throw new Error('Cart item not found');
    }
    
    return updatedItem;
  }
  
  async removeCartItem(userId: number, productId: number): Promise<boolean> {
    const [removedItem] = await db.delete(cartItems)
      .where(and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId)
      ))
      .returning();
      
    return !!removedItem;
  }
  
  async clearUserCart(userId: number): Promise<boolean> {
    const result = await db.delete(cartItems)
      .where(eq(cartItems.userId, userId))
      .returning();
      
    return result.length > 0;
  }
  
  // Admin methods - Categories
  async updateCategory(id: number, categoryData: Partial<Omit<Category, 'id'>>): Promise<Category> {
    const [updatedCategory] = await db.update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
      
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    const [category] = await db.delete(categories)
      .where(eq(categories.id, id))
      .returning();
      
    return !!category;
  }
  
  async getCategoryCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(categories);
    return Number(result[0].count);
  }
  
  async getCategoryProductCount(categoryId: number): Promise<number> {
    const result = await db.select({ count: sql`count(*)` })
      .from(products)
      .where(eq(products.categoryId, categoryId));
      
    return Number(result[0].count);
  }
  
  // Admin methods - Products
  async getProductCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(products);
    return Number(result[0].count);
  }
  
  // The getLowStockProducts implementation is moved to line 898
  
  // Stock Notification methods
  async addStockNotification(email: string, productId: number): Promise<StockNotification> {
    return addStockNotificationImpl(email, productId);
  }

  async getStockNotifications(productId: number): Promise<StockNotification[]> {
    return getStockNotificationsImpl(productId);
  }

  async updateStockNotificationStatus(id: number, isNotified: boolean): Promise<StockNotification> {
    return updateStockNotificationStatusImpl(id, isNotified);
  }

  async deleteStockNotification(id: number): Promise<boolean> {
    return deleteStockNotificationImpl(id);
  }
  
  // Product Image methods
  async getProductImages(productId: number): Promise<ProductImage[]> {
    return db.select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(productImages.displayOrder);
  }
  
  async getProductImageById(imageId: number): Promise<ProductImage | undefined> {
    const [image] = await db.select()
      .from(productImages)
      .where(eq(productImages.id, imageId));
    return image;
  }
  
  async addProductImage(image: InsertProductImage): Promise<ProductImage> {
    const [newImage] = await db.insert(productImages)
      .values(image)
      .returning();
    return newImage;
  }
  
  async updateProductImage(
    imageId: number, 
    data: Partial<Omit<ProductImage, 'id' | 'productId' | 'createdAt'>>
  ): Promise<ProductImage> {
    const [updatedImage] = await db.update(productImages)
      .set(data)
      .where(eq(productImages.id, imageId))
      .returning();
    return updatedImage;
  }
  
  async updateProductImagePrimary(productId: number, primaryImageId: number | null): Promise<void> {
    // First set all images of this product to not be primary
    await db.update(productImages)
      .set({ isPrimary: false })
      .where(eq(productImages.productId, productId));
    
    // If a primaryImageId is provided, set that one to be primary
    if (primaryImageId !== null) {
      await db.update(productImages)
        .set({ isPrimary: true })
        .where(and(
          eq(productImages.id, primaryImageId),
          eq(productImages.productId, productId)
        ));
    }
  }
  
  async deleteProductImage(imageId: number): Promise<boolean> {
    const [deletedImage] = await db.delete(productImages)
      .where(eq(productImages.id, imageId))
      .returning();
    return !!deletedImage;
  }
  
  // Admin methods - Orders
  // Methods implemented in "Additional Order methods" section
  
  // Admin methods - Contact Messages
  async getAllContactMessages(): Promise<ContactMessage[]> {
    return db.select()
      .from(contactMessages)
      .orderBy(sql`${contactMessages.createdAt} DESC`);
  }
  
  async getContactMessageById(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select()
      .from(contactMessages)
      .where(eq(contactMessages.id, id));
      
    return message;
  }
  
  async deleteContactMessage(id: number): Promise<boolean> {
    const [message] = await db.delete(contactMessages)
      .where(eq(contactMessages.id, id))
      .returning();
      
    return !!message;
  }
  
  async getRecentContactMessages(limit: number): Promise<ContactMessage[]> {
    return db.select()
      .from(contactMessages)
      .orderBy(sql`${contactMessages.createdAt} DESC`)
      .limit(limit);
  }
  
  // Admin methods - Waitlist
  async getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
    return db.select()
      .from(waitlistEntries)
      .orderBy(sql`${waitlistEntries.createdAt} DESC`);
  }
  
  async getWaitlistEntryById(id: number): Promise<WaitlistEntry | undefined> {
    const [entry] = await db.select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.id, id));
      
    return entry;
  }
  
  async deleteWaitlistEntry(id: number): Promise<boolean> {
    const [entry] = await db.delete(waitlistEntries)
      .where(eq(waitlistEntries.id, id))
      .returning();
      
    return !!entry;
  }
  
  // Inventory methods implementation
  async createInventoryLevel(level: InsertInventoryLevel): Promise<InventoryLevel> {
    const [inventoryLevel] = await db.insert(inventoryLevels)
      .values(level)
      .returning();
      
    return inventoryLevel;
  }
  
  async getInventoryLevelByProductId(productId: number): Promise<InventoryLevel | undefined> {
    const [inventoryLevel] = await db.select()
      .from(inventoryLevels)
      .where(eq(inventoryLevels.productId, productId));
      
    return inventoryLevel;
  }
  
  async updateInventoryLevel(productId: number, data: Partial<Omit<InventoryLevel, 'id' | 'productId' | 'lastUpdated'>>): Promise<InventoryLevel> {
    const existing = await this.getInventoryLevelByProductId(productId);
    
    if (existing) {
      // Update existing inventory level
      const [updated] = await db.update(inventoryLevels)
        .set({
          ...data,
          lastUpdated: new Date()
        })
        .where(eq(inventoryLevels.productId, productId))
        .returning();
        
      return updated;
    } else {
      // Create new inventory level if it doesn't exist
      return this.createInventoryLevel({
        productId,
        quantity: data.quantity || 0,
        minStockLevel: data.minStockLevel || 5,
        maxStockLevel: data.maxStockLevel,
      });
    }
  }
  
  async addInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    // Add the transaction
    const [newTransaction] = await db.insert(inventoryTransactions)
      .values(transaction)
      .returning();
    
    // Update inventory level based on the transaction  
    const currentLevel = await this.getInventoryLevelByProductId(transaction.productId);
    const newQuantity = (currentLevel?.quantity || 0) + transaction.quantity;
    
    await this.updateInventoryLevel(transaction.productId, {
      quantity: newQuantity
    });
    
    // Also update the product's quantity field for backward compatibility
    await db.update(products)
      .set({ quantity: newQuantity, inStock: newQuantity > 0 })
      .where(eq(products.id, transaction.productId));
    
    return newTransaction;
  }
  
  async getInventoryTransactionsByProductId(productId: number): Promise<InventoryTransaction[]> {
    return db.select()
      .from(inventoryTransactions)
      .where(eq(inventoryTransactions.productId, productId))
      .orderBy(sql`${inventoryTransactions.createdAt} DESC`);
  }
  
  async getRecentInventoryTransactions(limit: number): Promise<InventoryTransaction[]> {
    return db.select()
      .from(inventoryTransactions)
      .orderBy(sql`${inventoryTransactions.createdAt} DESC`)
      .limit(limit);
  }
  
  async getLowStockProducts(limit: number): Promise<Product[]> {
    // Join products with inventory levels to find products with low stock
    const result = await db.select({
      product: products
    })
    .from(products)
    .leftJoin(inventoryLevels, eq(products.id, inventoryLevels.productId))
    .where(
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
    )
    .orderBy(sql`COALESCE(${inventoryLevels.quantity}, ${products.quantity})`)
    .limit(limit);
    
    // Return just the product data
    return result.map(row => row.product);
  }
  
  // Seed database with initial data if needed
  async seedInitialData(): Promise<void> {
    console.log("Seeding database with initial data...");
    
    // Create categories
    const categories: InsertCategory[] = [
      {
        name: "Feeders",
        nameAr: "معالف",
        slug: "feeders",
        description: "Automatic and manual feeding solutions for all flock sizes.",
        descriptionAr: "حلول تغذية أوتوماتيكية ويدوية لجميع أحجام قطعان الدواجن.",
        imageUrl: "https://images.unsplash.com/photo-1598715685267-0f45367d8071?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      },
      {
        name: "Waterers",
        nameAr: "مساقي",
        slug: "waterers",
        description: "Clean, efficient watering systems with advanced nipple technology.",
        descriptionAr: "أنظمة شرب نظيفة وفعالة مع تقنية حلمات متطورة.",
        imageUrl: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      },
      {
        name: "Coop Equipment",
        nameAr: "معدات العشة",
        slug: "coop-equipment",
        description: "Everything you need for a comfortable, secure chicken coop.",
        descriptionAr: "كل ما تحتاجه لعشة دجاج مريحة وآمنة.",
        imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      },
      {
        name: "Health & Care",
        nameAr: "الصحة والرعاية",
        slug: "health-care",
        description: "Products to maintain flock health and hygiene.",
        descriptionAr: "منتجات للحفاظ على صحة ونظافة قطيع الدواجن.",
        imageUrl: "https://images.unsplash.com/photo-1567450121326-28da3695ef35?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      }
    ];
    
    // Insert categories and store their IDs
    const categoryMap = new Map<string, number>();
    
    for (const category of categories) {
      const created = await this.createCategory(category);
      categoryMap.set(category.slug, created.id);
    }
    
    // Create products
    const products: InsertProduct[] = [
      {
        name: "Automatic Chicken Feeder",
        nameAr: "معلفة دجاج أوتوماتيكية",
        slug: "automatic-chicken-feeder",
        description: "High-capacity, weather-resistant chicken feeder with innovative anti-waste design.",
        descriptionAr: "معلفة دجاج ذات سعة عالية، مقاومة للعوامل الجوية مع تصميم مبتكر مانع للهدر.",
        price: "89.99",
        categoryId: categoryMap.get("feeders") as number,
        imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: true,
        inStock: true,
        badge: "new",
        badgeAr: "جديد",
        published: true,
      },
      {
        name: "Premium Watering System",
        nameAr: "نظام سقي متميز",
        slug: "premium-watering-system",
        description: "Complete watering solution with nipple drinkers. Keeps water clean and prevents spillage.",
        descriptionAr: "حل متكامل للسقي مع حلمات شرب. يحافظ على نظافة المياه ويمنع الانسكاب.",
        price: "64.99",
        categoryId: categoryMap.get("waterers") as number,
        imageUrl: "https://images.unsplash.com/photo-1629385918123-8872c6d907ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: true,
        inStock: true,
        badge: null,
        badgeAr: null,
        published: true,
      },
      {
        name: "Deluxe Nesting Boxes (Set of 4)",
        nameAr: "صناديق تعشيش فاخرة (مجموعة من 4)",
        slug: "deluxe-nesting-boxes",
        description: "Comfortable, easy-to-clean nesting boxes with roll-away egg collection system.",
        descriptionAr: "صناديق تعشيش مريحة سهلة التنظيف مع نظام تجميع البيض المتدحرج.",
        price: "129.99",
        categoryId: categoryMap.get("coop-equipment") as number,
        imageUrl: "https://images.unsplash.com/photo-1534187886889-1e764382e8cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: true,
        inStock: true,
        badge: "bestseller",
        badgeAr: "الأكثر مبيعاً",
        published: true,
      },
      {
        name: "Portable Chicken Coop",
        nameAr: "عشة دجاج متنقلة",
        slug: "portable-chicken-coop",
        description: "Easy-to-move coop with predator-proof design. Perfect for small to medium flocks.",
        descriptionAr: "عشة سهلة النقل بتصميم مضاد للحيوانات المفترسة. مثالية للقطعان الصغيرة والمتوسطة.",
        price: "349.99",
        categoryId: categoryMap.get("coop-equipment") as number,
        imageUrl: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: true,
        inStock: true,
        badge: null,
        badgeAr: null,
        published: true,
      },
      {
        name: "Poultry Health Kit",
        nameAr: "طقم صحة الدواجن",
        slug: "poultry-health-kit",
        description: "Complete kit with essential supplements and medications for maintaining flock health.",
        descriptionAr: "طقم متكامل مع المكملات الغذائية والأدوية الضرورية للحفاظ على صحة القطيع.",
        price: "49.99",
        categoryId: categoryMap.get("health-care") as number,
        imageUrl: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: false,
        inStock: true,
        badge: null,
        badgeAr: null,
        published: true,
      },
      {
        name: "Automatic Coop Door",
        nameAr: "باب العشة الأوتوماتيكي",
        slug: "automatic-coop-door",
        description: "Programmable door that opens and closes automatically. Keeps predators out and chickens safe.",
        descriptionAr: "باب قابل للبرمجة يفتح ويغلق تلقائياً. يبقي الحيوانات المفترسة بالخارج والدجاج آمناً.",
        price: "159.99",
        categoryId: 3, // Fixed to match the correct category ID
        imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: false,
        inStock: true,
        badge: null,
        badgeAr: null,
        published: true,
      },
      {
        name: "Hanging Feeder (10lb capacity)",
        nameAr: "معلفة معلقة (سعة 10 رطل)",
        slug: "hanging-feeder",
        description: "Durable hanging feeder that reduces feed waste and contamination.",
        descriptionAr: "معلفة معلقة متينة تقلل من هدر العلف والتلوث.",
        price: "34.99",
        categoryId: categoryMap.get("feeders") as number,
        imageUrl: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: false,
        inStock: true,
        badge: null,
        badgeAr: null,
        published: true,
      },
      {
        name: "Gravity Waterer (5 gallon)",
        nameAr: "مسقاة جاذبية (5 جالون)",
        slug: "gravity-waterer",
        description: "Large capacity gravity waterer that keeps chickens hydrated for days without refilling.",
        descriptionAr: "مسقاة جاذبية كبيرة السعة تحافظ على ترطيب الدجاج لأيام بدون إعادة ملء.",
        price: "42.99",
        categoryId: categoryMap.get("waterers") as number,
        imageUrl: "https://images.unsplash.com/photo-1533070931057-1d300322ee67?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: false,
        inStock: true,
        badge: null,
        badgeAr: null,
        published: true,
      }
    ];
    
    // Insert all products
    for (const product of products) {
      await this.createProduct(product);
    }
    
    // Create inventory tables if they don't exist yet
    try {
      // Create inventory levels for existing products
      for (const product of products) {
        const productData = await this.getProductBySlug(product.slug);
        if (productData) {
          const inventoryLevel = await this.getInventoryLevelByProductId(productData.id);
          if (!inventoryLevel) {
            // Initial inventory level for each product
            await this.createInventoryLevel({
              productId: productData.id,
              quantity: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
              minStockLevel: 5,
              maxStockLevel: 100,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error setting up inventory tables:", error);
    }
    
    console.log("Database seeded successfully!");
  }
}

export const storage = new DatabaseStorage();
