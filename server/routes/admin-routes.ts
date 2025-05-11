import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertProductSchema, insertCategorySchema } from '@shared/schema';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { setupAdminOrdersRoutes } from './admin-orders';

// Setup multer for file uploads
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    
    // Determine prefix based on the endpoint (product or category)
    const prefix = req.originalUrl.includes('/categories') ? 'category-' : 'product-';
    cb(null, prefix + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage1,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Create the router
const router = Router();

// Set up middleware for checking admin authentication
export function setupAdminRoutes(isAdmin: (req: any, res: any, next: any) => void) {
  // --------- DASHBOARD DATA ---------
  router.get('/dashboard', isAdmin, async (req, res) => {
    try {
      // Get counts of various entities
      const [
        totalProducts, 
        totalUsers, 
        totalOrders, 
        totalCategories,
        recentOrders,
        lowStockProducts,
        contactMessages,
        userStats
      ] = await Promise.all([
        storage.getProductCount(),
        storage.getUserCount(),
        storage.getOrderCount(),
        storage.getCategoryCount(),
        storage.getRecentOrders(5), // Get 5 most recent orders
        storage.getLowStockProducts(5), // Get 5 products with low stock
        storage.getRecentContactMessages(5), // Get 5 most recent contact messages
        storage.getUserStatsByMonth(6) // Get user registration stats for last 6 months
      ]);

      // Calculate revenue
      const totalRevenue = await storage.getTotalRevenue();
      const monthlyRevenue = await storage.getMonthlyRevenue(6); // Last 6 months

      res.json({
        counts: {
          products: totalProducts,
          users: totalUsers,
          orders: totalOrders,
          categories: totalCategories
        },
        recentOrders,
        lowStockProducts,
        contactMessages,
        userStats,
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  });

  // --------- USER MANAGEMENT ---------
  
  // Get all users
  router.get('/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove sensitive data like passwords
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });
  
  // Get a specific user
  router.get('/users/:id', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove sensitive data
      const { password, ...safeUser } = user;
      
      // Get associated data
      const [addresses, paymentMethods, orders] = await Promise.all([
        storage.getAddressesByUserId(userId),
        storage.getPaymentMethodsByUserId(userId),
        storage.getOrdersByUserId(userId)
      ]);
      
      res.json({
        ...safeUser,
        addresses,
        paymentMethods,
        orders
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });
  
  // Update user
  router.patch('/users/:id', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Validate allowed update fields
      const allowedFields = [
        'firstName', 'lastName', 'email', 'phoneNumber', 
        'profileImageUrl', 'role', 'username'
      ];
      
      const updateData: Record<string, any> = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      // If email is changed, verify it's not already taken
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await storage.getUserByEmail(updateData.email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
      
      // If username is changed, verify it's not already taken
      if (updateData.username && updateData.username !== user.username) {
        const existingUser = await storage.getUserByUsername(updateData.username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: 'Username already taken' });
        }
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Remove sensitive data
      const { password, ...safeUser } = updatedUser;
      
      res.json(safeUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });
  
  // Delete user
  router.delete('/users/:id', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't allow deleting your own account
      if (req.user && userId === req.user.id) {
        return res.status(400).json({ message: 'You cannot delete your own account' });
      }
      
      await storage.deleteUser(userId);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // --------- PRODUCT MANAGEMENT ---------
  
  // Get all products (with more details than the public endpoint)
  router.get('/products', isAdmin, async (req, res) => {
    try {
      console.log('🔍 ADMIN: Fetching all products with force refresh...');
      
      // Force refresh of products by using a direct database query
      // For admin routes, include unpublished (draft) products
      const includeUnpublished = true;
      
      // Log total product count before fetching details (for debugging)
      const productCount = await storage.getProductCount();
      console.log('📊 ADMIN: Total product count in database:', productCount);
      
      // Fetch all products with debug info
      const products = await storage.getProducts(includeUnpublished);
      console.log('📋 ADMIN: Product IDs fetched:', products.map(p => p.id).join(', '));
      
      // Fetch categories to include category names
      const categories = await storage.getCategories();
      const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
      
      const productsWithDetails = products.map(product => ({
        ...product,
        categoryName: categoryMap.get(product.categoryId)?.name || 'Unknown',
        categoryNameAr: categoryMap.get(product.categoryId)?.nameAr || 'غير معروف'
      }));
      
      // Add no-cache headers to force browser refresh
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      console.log('✅ ADMIN: Sending products response with', productsWithDetails.length, 'products');
      res.json(productsWithDetails);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  });
  
  // Create new product
  router.post('/products', isAdmin, async (req, res) => {
    console.log('------- PRODUCT CREATION START -------');
    console.log('REQUEST BODY:', req.body);
    try {
      // Generate slug from name if not provided
      if (!req.body.slug && req.body.name) {
        req.body.slug = req.body.name
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
        console.log('Generated slug:', req.body.slug);
      }
      
      // Validate the request body
      const validationResult = insertProductSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        console.log('VALIDATION ERROR:', validationResult.error.format());
        return res.status(400).json({ 
          message: 'Invalid product data',
          errors: validationResult.error.format() 
        });
      }
      
      console.log('VALIDATION SUCCESS. Validated data:', JSON.stringify(validationResult.data, null, 2));
      
      // Check if category exists
      const category = await storage.getCategoryById(validationResult.data.categoryId);
      if (!category) {
        console.log('CATEGORY NOT FOUND:', validationResult.data.categoryId);
        return res.status(400).json({ message: 'Category does not exist' });
      }
      
      console.log('CATEGORY EXISTS:', category.name);
      
      // Check if slug is unique
      const existingProduct = await storage.getProductBySlug(validationResult.data.slug);
      if (existingProduct) {
        console.log('SLUG ALREADY EXISTS:', validationResult.data.slug);
        return res.status(400).json({ message: 'Product with this slug already exists' });
      }
      
      console.log('SLUG IS UNIQUE:', validationResult.data.slug);
      
      // Ensure published field is set to true if not provided
      if (validationResult.data.published === undefined) {
        console.log('PUBLISHED NOT PROVIDED. Setting to true.');
        validationResult.data.published = true;
      } else {
        console.log('PUBLISHED PROVIDED:', validationResult.data.published);
      }
      
      console.log('CREATING PRODUCT WITH DATA:', JSON.stringify({
        ...validationResult.data,
      }, null, 2));
      
      const product = await storage.createProduct(validationResult.data);
      console.log('PRODUCT CREATED SUCCESSFULLY:', JSON.stringify(product, null, 2));
      
      // Let's verify the product exists in the database
      const verifyProduct = await storage.getProductById(product.id);
      console.log('VERIFICATION - Product in database:', verifyProduct ? 'YES' : 'NO');
      if (verifyProduct) {
        console.log('VERIFICATION - Published status:', verifyProduct.published);
      }
      
      // Let's check if it appears in public product list
      const publicProducts = await storage.getProducts(false); // false = only published
      console.log('VERIFICATION - Total public products:', publicProducts.length);
      console.log('VERIFICATION - New product in public list:', 
        publicProducts.some(p => p.id === product.id) ? 'YES' : 'NO');
      
      // Get current product count for verification
      const afterProductCount = await storage.getProductCount();
      console.log('VERIFICATION - Total product count after creation:', afterProductCount);
      
      // Important: Add no-cache headers to force browser to get fresh data on next request
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      // Return the new product
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Failed to create product' });
    }
  });
  
  // Get a specific product (by ID or slug)
  router.get('/products/:idOrSlug', isAdmin, async (req, res) => {
    try {
      const idOrSlug = req.params.idOrSlug;
      let product;
      
      // For admin routes, include unpublished (draft) products
      const includeUnpublished = true;
      
      // Try to parse as ID first
      const productId = parseInt(idOrSlug);
      if (!isNaN(productId)) {
        product = await storage.getProductById(productId);
      } else {
        // If not a valid ID, try as slug
        product = await storage.getProductBySlug(idOrSlug, includeUnpublished);
      }
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Get category details
      const category = await storage.getCategoryById(product.categoryId);
      
      res.json({
        ...product,
        category
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Failed to fetch product' });
    }
  });
  
  // Update product
  router.patch('/products/:id', isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Check if slug is being updated and is unique
      if (req.body.slug && req.body.slug !== product.slug) {
        const existingProduct = await storage.getProductBySlug(req.body.slug);
        if (existingProduct && existingProduct.id !== productId) {
          return res.status(400).json({ message: 'Product with this slug already exists' });
        }
      }
      
      // Check if category exists if being updated
      if (req.body.categoryId) {
        const category = await storage.getCategoryById(req.body.categoryId);
        if (!category) {
          return res.status(400).json({ message: 'Category does not exist' });
        }
      }
      
      // Log the update request
      console.log('Updating product:', productId, 'with data:', {
        ...req.body,
        published: req.body.published
      });
      
      const updatedProduct = await storage.updateProduct(productId, req.body);
      console.log('Product updated successfully:', updatedProduct);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Failed to update product' });
    }
  });
  
  // Delete product
  router.delete('/products/:id', isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      await storage.deleteProduct(productId);
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  });
  
  // --------- PRODUCT IMAGES MANAGEMENT ---------
  
  // Get all images for a product
  router.get('/products/:id/images', isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const images = await storage.getProductImages(productId);
      res.json(images);
    } catch (error) {
      console.error('Error fetching product images:', error);
      res.status(500).json({ message: 'Failed to fetch product images' });
    }
  });
  
  // Add a new image to a product
  router.post('/products/:id/images', isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const { url, isPrimary, alt } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: 'Valid URL is required' });
      }
      
      // If setting as primary, update all other images to not be primary
      if (isPrimary) {
        await storage.updateProductImagePrimary(productId, null);
        
        // Also update the main product image URL
        await storage.updateProduct(productId, { imageUrl: url });
      }
      
      const newImage = await storage.addProductImage({
        productId,
        url,
        isPrimary: !!isPrimary,
        alt: alt || '',
        displayOrder: 0 // Will be ordered later
      });
      
      res.status(201).json(newImage);
    } catch (error) {
      console.error('Error adding product image:', error);
      res.status(500).json({ message: 'Failed to add product image' });
    }
  });
  
  // Update a product image
  router.patch('/products/images/:imageId', isAdmin, async (req, res) => {
    try {
      const imageId = parseInt(req.params.imageId);
      const image = await storage.getProductImageById(imageId);
      
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }
      
      const { url, isPrimary, alt, displayOrder } = req.body;
      const updateData: any = {};
      
      if (url !== undefined) updateData.url = url;
      if (alt !== undefined) updateData.alt = alt;
      if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
      
      // Handle primary flag specially
      if (isPrimary !== undefined) {
        updateData.isPrimary = isPrimary;
        
        if (isPrimary) {
          // Update all other images for this product to not be primary
          await storage.updateProductImagePrimary(image.productId, imageId);
          
          // Also update the main product image URL if setting as primary
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
      console.error('Error updating product image:', error);
      res.status(500).json({ message: 'Failed to update product image' });
    }
  });
  
  // Delete a product image
  router.delete('/products/images/:imageId', isAdmin, async (req, res) => {
    try {
      const imageId = parseInt(req.params.imageId);
      const image = await storage.getProductImageById(imageId);
      
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }
      
      // If deleting the primary image, need to update the main product image
      if (image.isPrimary) {
        // Try to find another image to make primary
        const otherImages = await storage.getProductImages(image.productId);
        const nextImage = otherImages.find(img => img.id !== imageId);
        
        if (nextImage) {
          // Make the next image primary
          await storage.updateProductImage(nextImage.id, { isPrimary: true });
          await storage.updateProduct(image.productId, { imageUrl: nextImage.url });
        } else {
          // No other images, set a placeholder
          await storage.updateProduct(image.productId, { 
            imageUrl: 'https://placehold.co/600x400?text=No+Image' 
          });
        }
      }
      
      await storage.deleteProductImage(imageId);
      res.status(200).json({ message: 'Product image deleted successfully' });
    } catch (error) {
      console.error('Error deleting product image:', error);
      res.status(500).json({ message: 'Failed to delete product image' });
    }
  });
  
  // Upload an image file for a product
  router.post('/products/:id/images/upload', isAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Get file details
      const file = req.file;
      
      // Create a public URL for the uploaded file
      const fileUrl = `/uploads/${file.filename}`;
      
      // Determine if this should be the primary image
      const isPrimary = req.body.isPrimary === 'true' || req.body.isPrimary === true;
      
      // Get the alt text if provided
      const alt = req.body.alt || '';
      
      // If setting as primary, update all other images to not be primary
      if (isPrimary) {
        await storage.updateProductImagePrimary(productId, null);
        
        // Also update the main product image URL
        await storage.updateProduct(productId, { imageUrl: fileUrl });
      }
      
      // Add the image to the database
      const newImage = await storage.addProductImage({
        productId,
        url: fileUrl,
        isPrimary: isPrimary,
        alt: alt,
        displayOrder: 0 // Will be ordered later
      });
      
      res.status(201).json(newImage);
    } catch (error) {
      console.error('Error uploading product image:', error);
      
      // Check if the error is from multer
      if (error instanceof Error) {
        if (error.message === 'Only image files are allowed') {
          return res.status(400).json({ message: error.message });
        }
      }
      
      res.status(500).json({ message: 'Failed to upload product image' });
    }
  });

  // Reorder product images
  router.post('/products/:id/images/reorder', isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const { imageIds } = req.body;
      
      if (!Array.isArray(imageIds)) {
        return res.status(400).json({ message: 'Valid imageIds array is required' });
      }
      
      // Update display order for each image
      const updates = imageIds.map((id, index) => 
        storage.updateProductImage(parseInt(id), { displayOrder: index })
      );
      
      await Promise.all(updates);
      
      const updatedImages = await storage.getProductImages(productId);
      res.json(updatedImages);
    } catch (error) {
      console.error('Error reordering product images:', error);
      res.status(500).json({ message: 'Failed to reorder product images' });
    }
  });

  // --------- CATEGORY MANAGEMENT ---------
  
  // Get all categories
  // Category image upload endpoint
  router.post('/categories/upload', isAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Get the URL path for the uploaded file
      const filePath = `/uploads/${req.file.filename}`;
      
      // Return the URL for the uploaded file
      res.json({ 
        url: filePath,
        filename: req.file.filename,
        originalname: req.file.originalname
      });
    } catch (error) {
      console.error('Error uploading category image:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  router.get('/categories', isAdmin, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      
      // Count products in each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const productCount = await storage.getCategoryProductCount(category.id);
          return {
            ...category,
            productCount
          };
        })
      );
      
      res.json(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });
  
  // Create new category
  router.post('/categories', isAdmin, async (req, res) => {
    try {
      // Generate slug from name if not provided
      if (!req.body.slug && req.body.name) {
        req.body.slug = req.body.name
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }
      
      // Validate the request body
      const validationResult = insertCategorySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid category data',
          errors: validationResult.error.format() 
        });
      }
      
      // Check if slug is unique
      const existingCategory = await storage.getCategoryBySlug(validationResult.data.slug);
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this slug already exists' });
      }
      
      const category = await storage.createCategory(validationResult.data);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Failed to create category' });
    }
  });
  
  // Get a specific category
  router.get('/categories/:id', isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategoryById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Get products in this category - for admin routes, include unpublished products
      const includeUnpublished = true;
      const products = await storage.getProductsByCategory(categoryId, includeUnpublished);
      
      res.json({
        ...category,
        products
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ message: 'Failed to fetch category' });
    }
  });
  
  // Update category
  router.patch('/categories/:id', isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategoryById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Check if slug is being updated and is unique
      if (req.body.slug && req.body.slug !== category.slug) {
        const existingCategory = await storage.getCategoryBySlug(req.body.slug);
        if (existingCategory && existingCategory.id !== categoryId) {
          return res.status(400).json({ message: 'Category with this slug already exists' });
        }
      }
      
      const updatedCategory = await storage.updateCategory(categoryId, req.body);
      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: 'Failed to update category' });
    }
  });
  
  // Delete category
  router.delete('/categories/:id', isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategoryById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Check if category has products - including unpublished
      const includeUnpublished = true; 
      const products = await storage.getProductsByCategory(categoryId, includeUnpublished);
      if (products.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete category with products. Please move or delete the products first.' 
        });
      }
      
      await storage.deleteCategory(categoryId);
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Failed to delete category' });
    }
  });

  // Get all contact messages
  router.get('/contact-messages', isAdmin, async (req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      res.status(500).json({ message: 'Failed to fetch contact messages' });
    }
  });
  
  // Get a specific contact message
  router.get('/contact-messages/:id', isAdmin, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getContactMessageById(messageId);
      
      if (!message) {
        return res.status(404).json({ message: 'Contact message not found' });
      }
      
      res.json(message);
    } catch (error) {
      console.error('Error fetching contact message:', error);
      res.status(500).json({ message: 'Failed to fetch contact message' });
    }
  });
  
  // Delete a contact message
  router.delete('/contact-messages/:id', isAdmin, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getContactMessageById(messageId);
      
      if (!message) {
        return res.status(404).json({ message: 'Contact message not found' });
      }
      
      await storage.deleteContactMessage(messageId);
      res.status(200).json({ message: 'Contact message deleted successfully' });
    } catch (error) {
      console.error('Error deleting contact message:', error);
      res.status(500).json({ message: 'Failed to delete contact message' });
    }
  });
  
  // --------- WAITLIST ENTRIES ---------
  
  // Get all waitlist entries
  router.get('/waitlist-entries', isAdmin, async (req, res) => {
    try {
      const entries = await storage.getAllWaitlistEntries();
      res.json(entries);
    } catch (error) {
      console.error('Error fetching waitlist entries:', error);
      res.status(500).json({ message: 'Failed to fetch waitlist entries' });
    }
  });
  
  // Delete a waitlist entry
  router.delete('/waitlist-entries/:id', isAdmin, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getWaitlistEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: 'Waitlist entry not found' });
      }
      
      await storage.deleteWaitlistEntry(entryId);
      res.status(200).json({ message: 'Waitlist entry deleted successfully' });
    } catch (error) {
      console.error('Error deleting waitlist entry:', error);
      res.status(500).json({ message: 'Failed to delete waitlist entry' });
    }
  });

  // --------- CUSTOMER MANAGEMENT ---------
  
  // Get all customers (users)
  router.get('/customers', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // For each user, calculate total orders and total spent
      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          const orders = await storage.getOrdersByUserId(user.id);
          const totalSpent = orders.reduce((total, order) => {
            return total + parseFloat(order.totalAmount || '0');
          }, 0);
          
          return {
            ...user,
            totalOrders: orders.length,
            totalSpent: totalSpent.toFixed(2),
            lastOrder: orders.length > 0 ? orders[0].createdAt : null
          };
        })
      );
      
      res.json(usersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ message: 'Failed to fetch customers' });
    }
  });
  
  // Get a specific customer by ID
  router.get('/customers/:id', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Get orders for this customer
      const orders = await storage.getOrdersByUserId(userId);
      
      // Get addresses for this customer
      const addresses = await storage.getAddressesByUserId(userId);
      
      // Calculate total spent
      const totalSpent = orders.reduce((total, order) => {
        return total + parseFloat(order.totalAmount || '0');
      }, 0);
      
      const customerData = {
        ...user,
        totalOrders: orders.length,
        totalSpent: totalSpent.toFixed(2),
        lastOrder: orders.length > 0 ? orders[0].createdAt : null,
        orders,
        addresses
      };
      
      res.json(customerData);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      res.status(500).json({ message: 'Failed to fetch customer details' });
    }
  });
  
  // Update a customer
  router.patch('/customers/:id', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Fields that can be updated by admin
      const allowedFields = [
        'username', 'email', 'firstName', 'lastName', 
        'phoneNumber', 'role', 'defaultShippingAddressId'
      ];
      
      const updateData: Record<string, any> = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      // Update the user
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Clean user object to return (remove password)
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(500).json({ message: 'Failed to update customer' });
    }
  });
  
  // --------- ADDRESS MANAGEMENT ---------

  // Add address for a customer
  router.post('/customers/:id/addresses', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Create the address
      const newAddress = await storage.createAddress({
        ...req.body,
        userId
      });
      
      // If this is the first address or isDefault is true, set it as default
      const addresses = await storage.getAddressesByUserId(userId);
      if (addresses.length === 1 || req.body.isDefault) {
        await storage.updateUser(userId, { 
          defaultShippingAddressId: newAddress.id 
        });
      }
      
      res.status(201).json(newAddress);
    } catch (error) {
      console.error('Error creating address:', error);
      res.status(500).json({ message: 'Failed to create address' });
    }
  });
  
  // Update address for a customer
  router.patch('/customers/:userId/addresses/:addressId', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const addressId = parseInt(req.params.addressId);
      
      const address = await storage.getAddressById(addressId);
      
      if (!address || address.userId !== userId) {
        return res.status(404).json({ message: 'Address not found' });
      }
      
      // Update the address
      const updatedAddress = await storage.updateAddress(addressId, req.body);
      
      // If marked as default, update user's default shipping address
      if (req.body.isDefault) {
        await storage.updateUser(userId, { defaultShippingAddressId: addressId });
      }
      
      res.json(updatedAddress);
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ message: 'Failed to update address' });
    }
  });
  
  // Delete address
  router.delete('/customers/:userId/addresses/:addressId', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const addressId = parseInt(req.params.addressId);
      
      const address = await storage.getAddressById(addressId);
      
      if (!address || address.userId !== userId) {
        return res.status(404).json({ message: 'Address not found' });
      }
      
      // If this is the default address, clear the default
      const user = await storage.getUser(userId);
      if (user && user.defaultShippingAddressId === addressId) {
        await storage.updateUser(userId, { defaultShippingAddressId: null });
      }
      
      // Delete the address
      await storage.deleteAddress(addressId);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({ message: 'Failed to delete address' });
    }
  });

  // --------- ORDER MANAGEMENT ---------
  
  // Register order management routes
  const orderRoutes = setupAdminOrdersRoutes(isAdmin);
  router.use('/orders', orderRoutes);

  return router;
}