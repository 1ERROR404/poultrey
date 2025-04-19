import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  waitlistEntries, type WaitlistEntry, type InsertWaitlistEntry,
  contactMessages, type ContactMessage, type InsertContactMessage
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Waitlist methods
  createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry>;
  getWaitlistEntries(): Promise<WaitlistEntry[]>;
  
  // Contact methods
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private waitlistEntries: Map<number, WaitlistEntry>;
  private contactMessages: Map<number, ContactMessage>;
  
  private userCurrentId: number;
  private categoryCurrentId: number;
  private productCurrentId: number;
  private waitlistCurrentId: number;
  private contactMessageCurrentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.waitlistEntries = new Map();
    this.contactMessages = new Map();
    
    this.userCurrentId = 1;
    this.categoryCurrentId = 1;
    this.productCurrentId = 1;
    this.waitlistCurrentId = 1;
    this.contactMessageCurrentId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      nameAr: insertCategory.nameAr || null,
      description: insertCategory.description || null,
      descriptionAr: insertCategory.descriptionAr || null,
      imageUrl: insertCategory.imageUrl || null
    };
    this.categories.set(id, category);
    return category;
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug,
    );
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId,
    );
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.featured,
    );
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      nameAr: insertProduct.nameAr || null,
      descriptionAr: insertProduct.descriptionAr || null,
      featured: insertProduct.featured ?? false,
      inStock: insertProduct.inStock ?? true,
      badge: insertProduct.badge || null,
      badgeAr: insertProduct.badgeAr || null
    };
    this.products.set(id, product);
    return product;
  }
  
  // Waitlist methods
  async createWaitlistEntry(insertEntry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const id = this.waitlistCurrentId++;
    const entry: WaitlistEntry = { 
      ...insertEntry, 
      id,
      agreedToMarketing: insertEntry.agreedToMarketing ?? false 
    };
    this.waitlistEntries.set(id, entry);
    return entry;
  }
  
  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    return Array.from(this.waitlistEntries.values());
  }
  
  // Contact methods
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageCurrentId++;
    const message: ContactMessage = { ...insertMessage, id };
    this.contactMessages.set(id, message);
    return message;
  }
  
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }
  
  // Initialize with sample data
  private initializeData() {
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
    
    categories.forEach(category => this.createCategory(category));
    
    // Create products
    const products: InsertProduct[] = [
      {
        name: "Automatic Chicken Feeder",
        nameAr: "معلفة دجاج أوتوماتيكية",
        slug: "automatic-chicken-feeder",
        description: "High-capacity, weather-resistant chicken feeder with innovative anti-waste design.",
        descriptionAr: "معلفة دجاج ذات سعة عالية، مقاومة للعوامل الجوية مع تصميم مبتكر مانع للهدر.",
        price: "89.99",
        categoryId: 1, // Feeders
        imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: true,
        inStock: true,
        badge: "new",
        badgeAr: "جديد",
      },
      {
        name: "Premium Watering System",
        nameAr: "نظام سقي متميز",
        slug: "premium-watering-system",
        description: "Complete watering solution with nipple drinkers. Keeps water clean and prevents spillage.",
        descriptionAr: "حل متكامل للسقي مع حلمات شرب. يحافظ على نظافة المياه ويمنع الانسكاب.",
        price: "64.99",
        categoryId: 2, // Waterers
        imageUrl: "https://images.unsplash.com/photo-1629385918123-8872c6d907ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: true,
        inStock: true,
        badge: null,
        badgeAr: null,
      },
      {
        name: "Deluxe Nesting Boxes (Set of 4)",
        nameAr: "صناديق تعشيش فاخرة (مجموعة من 4)",
        slug: "deluxe-nesting-boxes",
        description: "Comfortable, easy-to-clean nesting boxes with roll-away egg collection system.",
        descriptionAr: "صناديق تعشيش مريحة سهلة التنظيف مع نظام تجميع البيض المتدحرج.",
        price: "129.99",
        categoryId: 3, // Coop Equipment
        imageUrl: "https://images.unsplash.com/photo-1534187886889-1e764382e8cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: true,
        inStock: true,
        badge: "bestseller",
        badgeAr: "الأكثر مبيعاً",
      },
      {
        name: "Portable Chicken Coop",
        nameAr: "عشة دجاج متنقلة",
        slug: "portable-chicken-coop",
        description: "Easy-to-move coop with predator-proof design. Perfect for small to medium flocks.",
        descriptionAr: "عشة سهلة النقل بتصميم مضاد للحيوانات المفترسة. مثالية للقطعان الصغيرة والمتوسطة.",
        price: "349.99",
        categoryId: 3, // Coop Equipment
        imageUrl: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: true,
        inStock: true,
        badge: null,
        badgeAr: null,
      },
      {
        name: "Poultry Health Kit",
        nameAr: "طقم صحة الدواجن",
        slug: "poultry-health-kit",
        description: "Complete kit with essential supplements and medications for maintaining flock health.",
        descriptionAr: "طقم متكامل مع المكملات الغذائية والأدوية الضرورية للحفاظ على صحة القطيع.",
        price: "49.99",
        categoryId: 4, // Health & Care
        imageUrl: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: false,
        inStock: true,
        badge: null,
        badgeAr: null,
      },
      {
        name: "Automatic Coop Door",
        nameAr: "باب العشة الأوتوماتيكي",
        slug: "automatic-coop-door",
        description: "Programmable door that opens and closes automatically. Keeps predators out and chickens safe.",
        descriptionAr: "باب قابل للبرمجة يفتح ويغلق تلقائياً. يبقي الحيوانات المفترسة بالخارج والدجاج آمناً.",
        price: "159.99",
        categoryId: 3, // Coop Equipment
        imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: false,
        inStock: true,
        badge: null,
        badgeAr: null,
      },
      {
        name: "Hanging Feeder (10lb capacity)",
        nameAr: "معلفة معلقة (سعة 10 رطل)",
        slug: "hanging-feeder",
        description: "Durable hanging feeder that reduces feed waste and contamination.",
        descriptionAr: "معلفة معلقة متينة تقلل من هدر العلف والتلوث.",
        price: "34.99",
        categoryId: 1, // Feeders
        imageUrl: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: false,
        inStock: true,
        badge: null,
        badgeAr: null,
      },
      {
        name: "Gravity Waterer (5 gallon)",
        nameAr: "مسقاة جاذبية (5 جالون)",
        slug: "gravity-waterer",
        description: "Large capacity gravity waterer that keeps chickens hydrated for days without refilling.",
        descriptionAr: "مسقاة جاذبية كبيرة السعة تحافظ على ترطيب الدجاج لأيام بدون إعادة ملء.",
        price: "42.99",
        categoryId: 2, // Waterers
        imageUrl: "https://images.unsplash.com/photo-1533070931057-1d300322ee67?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        featured: false,
        inStock: true,
        badge: null,
        badgeAr: null,
      }
    ];
    
    products.forEach(product => this.createProduct(product));
  }
}

export const storage = new MemStorage();
