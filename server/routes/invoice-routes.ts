import { Router } from 'express';
import { storage } from '../storage';
import { generateInvoiceHtml } from '../utils/invoice-generator';
import fs from 'fs';
import path from 'path';

const router = Router();

// Directory to store edited invoices
const EDITED_INVOICES_DIR = path.join(process.cwd(), 'temp_extract', 'edited_invoices');

// Create directory if it doesn't exist
try {
  if (!fs.existsSync(EDITED_INVOICES_DIR)) {
    fs.mkdirSync(EDITED_INVOICES_DIR, { recursive: true });
    console.log('Created edited invoices directory:', EDITED_INVOICES_DIR);
  }
} catch (err) {
  console.error('Error creating edited invoices directory:', err);
}

// Public route for accessing invoices without authentication
router.get('/invoices/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    console.log("Public invoice route hit for order ID:", orderId);
    
    // Fetch the order
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      console.error("Order not found:", orderId);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log("Order found, fetching items...");
    
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
    
    // Get user data (if available)
    const user = await storage.getUser(order.userId);
    
    // Get shipping address
    const shippingAddress = order.shippingAddressId
      ? await storage.getAddressById(order.shippingAddressId)
      : null;
    
    // Get billing address
    const billingAddress = order.billingAddressId
      ? await storage.getAddressById(order.billingAddressId)
      : null;
    
    // Prepare full order data
    const fullOrderData = {
      ...order,
      items: itemsWithProducts,
      user,
      shippingAddress,
      billingAddress
    };
    
    // Generate invoice HTML
    const invoiceHtml = generateInvoiceHtml({ order: fullOrderData });
    
    // Set content type and send
    res.setHeader('Content-Type', 'text/html');
    return res.send(invoiceHtml);
    
  } catch (error) {
    console.error("Error generating public invoice:", error);
    return res.status(500).json({ 
      message: "Failed to generate invoice", 
      error: String(error) 
    });
  }
});

// Endpoint to save edited invoice HTML
router.post('/invoices/:id/save', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    // Basic validation of request body
    if (!req.body || !req.body.htmlContent) {
      return res.status(400).json({ message: 'Missing HTML content in request' });
    }
    
    console.log(`Saving edited invoice for order ID: ${orderId}`);
    
    // First, check if the order exists
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fileName = `invoice_${orderId}_${timestamp}.html`;
    const filePath = path.join(EDITED_INVOICES_DIR, fileName);
    
    // Write the edited HTML to the file
    fs.writeFileSync(filePath, req.body.htmlContent);
    
    // Optional: Update an order field to indicate it has edited versions
    // await storage.updateOrderEdits(orderId, filePath);
    
    console.log(`Saved edited invoice to ${filePath}`);
    
    return res.status(200).json({ 
      message: 'Invoice saved successfully',
      filePath: filePath
    });
    
  } catch (error) {
    console.error("Error saving edited invoice:", error);
    return res.status(500).json({ 
      message: "Failed to save invoice", 
      error: String(error)
    });
  }
});

// To support getting an edited invoice if available
router.get('/invoices/:id/edited', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    // Check if edited versions exist
    const pattern = `invoice_${orderId}_*.html`;
    const files = fs.readdirSync(EDITED_INVOICES_DIR)
      .filter(file => file.startsWith(`invoice_${orderId}_`) && file.endsWith('.html'))
      .sort() // Sort by filename (which includes timestamp)
      .reverse(); // Get the most recent one

    if (files.length === 0) {
      return res.status(404).json({ message: 'No edited invoice found' });
    }
    
    // Return the most recent edited version
    const filePath = path.join(EDITED_INVOICES_DIR, files[0]);
    const content = fs.readFileSync(filePath, 'utf8');
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(content);
    
  } catch (error) {
    console.error("Error retrieving edited invoice:", error);
    return res.status(500).json({ 
      message: "Failed to retrieve edited invoice", 
      error: String(error)
    });
  }
});

export const invoiceRouter = router;