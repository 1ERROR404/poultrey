import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertAddressSchema, insertPaymentMethodSchema } from '@shared/schema';

// Create the router
const router = Router();

// Set up middleware for checking authentication
export function setupUserRoutes(isAuthenticated: (req: any, res: any, next: any) => void) {
  // ---------- ADDRESS ENDPOINTS ----------
  
  // Get all addresses for the authenticated user
  router.get('/addresses', isAuthenticated, async (req, res) => {
    try {
      const addresses = await storage.getAddressesByUserId(req.user.id);
      res.json(addresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      res.status(500).json({ message: 'Failed to fetch addresses' });
    }
  });
  
  // Get a specific address
  router.get('/addresses/:id', isAuthenticated, async (req, res) => {
    try {
      const address = await storage.getAddressById(parseInt(req.params.id));
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }
      
      // Make sure the address belongs to the authenticated user
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(address);
    } catch (error) {
      console.error('Error fetching address:', error);
      res.status(500).json({ message: 'Failed to fetch address' });
    }
  });
  
  // Create a new address
  router.post('/addresses', isAuthenticated, async (req, res) => {
    try {
      // Validate the request body
      const validationResult = insertAddressSchema.safeParse({
        ...req.body,
        userId: req.user.id
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid address data',
          errors: validationResult.error.format() 
        });
      }
      
      const address = await storage.createAddress(validationResult.data);
      res.status(201).json(address);
    } catch (error) {
      console.error('Error creating address:', error);
      res.status(500).json({ message: 'Failed to create address' });
    }
  });
  
  // Update an address
  router.patch('/addresses/:id', isAuthenticated, async (req, res) => {
    try {
      const addressId = parseInt(req.params.id);
      const address = await storage.getAddressById(addressId);
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }
      
      // Make sure the address belongs to the authenticated user
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Validate allowed update fields
      const allowedFields = ['addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country', 'isDefault', 'label'];
      const updateData: Record<string, any> = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      const updatedAddress = await storage.updateAddress(addressId, updateData);
      res.json(updatedAddress);
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ message: 'Failed to update address' });
    }
  });
  
  // Delete an address
  router.delete('/addresses/:id', isAuthenticated, async (req, res) => {
    try {
      const addressId = parseInt(req.params.id);
      const address = await storage.getAddressById(addressId);
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }
      
      // Make sure the address belongs to the authenticated user
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      await storage.deleteAddress(addressId);
      res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({ message: 'Failed to delete address' });
    }
  });
  
  // Set an address as default
  router.post('/addresses/:id/default', isAuthenticated, async (req, res) => {
    try {
      const addressId = parseInt(req.params.id);
      const address = await storage.getAddressById(addressId);
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }
      
      // Make sure the address belongs to the authenticated user
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      await storage.setDefaultAddress(req.user.id, addressId);
      res.status(200).json({ message: 'Default address updated successfully' });
    } catch (error) {
      console.error('Error setting default address:', error);
      res.status(500).json({ message: 'Failed to set default address' });
    }
  });
  
  // ---------- PAYMENT METHOD ENDPOINTS ----------
  
  // Get all payment methods for the authenticated user
  router.get('/payment-methods', isAuthenticated, async (req, res) => {
    try {
      const paymentMethods = await storage.getPaymentMethodsByUserId(req.user.id);
      res.json(paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ message: 'Failed to fetch payment methods' });
    }
  });
  
  // Get a specific payment method
  router.get('/payment-methods/:id', isAuthenticated, async (req, res) => {
    try {
      const paymentMethod = await storage.getPaymentMethodById(parseInt(req.params.id));
      
      if (!paymentMethod) {
        return res.status(404).json({ message: 'Payment method not found' });
      }
      
      // Make sure the payment method belongs to the authenticated user
      if (paymentMethod.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(paymentMethod);
    } catch (error) {
      console.error('Error fetching payment method:', error);
      res.status(500).json({ message: 'Failed to fetch payment method' });
    }
  });
  
  // Create a new payment method
  router.post('/payment-methods', isAuthenticated, async (req, res) => {
    try {
      // Validate the request body
      const validationResult = insertPaymentMethodSchema.safeParse({
        ...req.body,
        userId: req.user.id
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid payment method data',
          errors: validationResult.error.format() 
        });
      }
      
      const paymentMethod = await storage.createPaymentMethod(validationResult.data);
      res.status(201).json(paymentMethod);
    } catch (error) {
      console.error('Error creating payment method:', error);
      res.status(500).json({ message: 'Failed to create payment method' });
    }
  });
  
  // Update a payment method
  router.patch('/payment-methods/:id', isAuthenticated, async (req, res) => {
    try {
      const paymentMethodId = parseInt(req.params.id);
      const paymentMethod = await storage.getPaymentMethodById(paymentMethodId);
      
      if (!paymentMethod) {
        return res.status(404).json({ message: 'Payment method not found' });
      }
      
      // Make sure the payment method belongs to the authenticated user
      if (paymentMethod.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Validate allowed update fields
      const allowedFields = ['isDefault', 'expiryMonth', 'expiryYear', 'paymentToken'];
      const updateData: Record<string, any> = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      const updatedPaymentMethod = await storage.updatePaymentMethod(paymentMethodId, updateData);
      res.json(updatedPaymentMethod);
    } catch (error) {
      console.error('Error updating payment method:', error);
      res.status(500).json({ message: 'Failed to update payment method' });
    }
  });
  
  // Delete a payment method
  router.delete('/payment-methods/:id', isAuthenticated, async (req, res) => {
    try {
      const paymentMethodId = parseInt(req.params.id);
      const paymentMethod = await storage.getPaymentMethodById(paymentMethodId);
      
      if (!paymentMethod) {
        return res.status(404).json({ message: 'Payment method not found' });
      }
      
      // Make sure the payment method belongs to the authenticated user
      if (paymentMethod.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      await storage.deletePaymentMethod(paymentMethodId);
      res.status(200).json({ message: 'Payment method deleted successfully' });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      res.status(500).json({ message: 'Failed to delete payment method' });
    }
  });
  
  // Set a payment method as default
  router.post('/payment-methods/:id/default', isAuthenticated, async (req, res) => {
    try {
      const paymentMethodId = parseInt(req.params.id);
      const paymentMethod = await storage.getPaymentMethodById(paymentMethodId);
      
      if (!paymentMethod) {
        return res.status(404).json({ message: 'Payment method not found' });
      }
      
      // Make sure the payment method belongs to the authenticated user
      if (paymentMethod.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      await storage.setDefaultPaymentMethod(req.user.id, paymentMethodId);
      res.status(200).json({ message: 'Default payment method updated successfully' });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      res.status(500).json({ message: 'Failed to set default payment method' });
    }
  });
  
  // ---------- ORDER ENDPOINTS ----------
  
  // Get all orders for the authenticated user
  router.get('/orders', isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrdersByUserId(req.user.id);
      
      // Fetch order items with product details for each order and include them in the response
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItemsByOrderId(order.id);
          
          // Include product details for each order item
          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const product = await storage.getProductById(item.productId);
              return {
                ...item,
                product: product || {
                  id: item.productId,
                  name: 'Unknown Product',
                  price: item.unitPrice,
                  imageUrl: null,
                  slug: ''
                }
              };
            })
          );
          
          return { ...order, items: itemsWithProducts };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });
  
  // Get a specific order with items and product details
  router.get('/orders/:id', isAuthenticated, async (req, res) => {
    try {
      console.log("User order detail route hit for order ID:", req.params.id);
      console.log("Authenticated user:", req.user?.id);
      
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        console.log("Order not found:", orderId);
        return res.status(404).json({ message: 'Order not found' });
      }
      
      console.log("Found order:", order.id, "Order number:", order.orderNumber, "User ID:", order.userId);
      
      // Make sure the order belongs to the authenticated user
      if (order.userId !== req.user!.id) {
        console.log("Access denied - user doesn't match:", req.user?.id, "vs", order.userId);
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Fetch order items
      const items = await storage.getOrderItemsByOrderId(orderId);
      console.log("Order items count:", items.length);
      
      // Fetch product details for each order item
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          console.log("Product for item", item.id, ":", product ? product.id : "not found");
          
          return {
            ...item,
            product: product || {
              id: item.productId,
              name: 'Unknown Product',
              price: item.unitPrice,
              imageUrl: null,
              slug: ''
            }
          };
        })
      );
      
      // Fetch user information for this order
      const user = await storage.getUser(order.userId);
      console.log("User information for order:", user ? `ID: ${user.id}, Username: ${user.username}, Role: ${user.role}` : "User not found");
      
      const responseData = {
        ...order,
        items: itemsWithProducts,
        user: user || undefined
      };
      
      console.log("Sending response with items count:", responseData.items.length);
      console.log("First item details:", responseData.items.length > 0 ? JSON.stringify(responseData.items[0]) : "No items");
      
      res.json(responseData);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: 'Failed to fetch order' });
    }
  });
  
  // Generate an invoice for a specific order
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
      
      // Make sure users can only see their own orders
      if (!req.user || order.userId !== req.user.id) {
        console.error("Access denied - User ID mismatch:", req.user?.id, "vs order user:", order.userId);
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get user
      const user = await storage.getUser(order.userId);
      console.log("User for order:", user ? user.id : "not found");
      
      // Get order items
      const items = await storage.getOrderItemsByOrderId(order.id);
      console.log("Order items count:", items.length);
      
      // Get shipping and billing addresses if they exist
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
      
      // For each item, get product info
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
      
      // Create a standalone HTML document for the invoice that doesn't depend on any external resources
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
                <p><strong>${user?.username || 'Customer'}</strong></p>
                ${billingAddress ? `
                <p>${billingAddress.firstName} ${billingAddress.lastName}</p>
                <p>${billingAddress.addressLine1}</p>
                ${billingAddress.addressLine2 ? `<p>${billingAddress.addressLine2}</p>` : ''}
                <p>${billingAddress.city}, ${billingAddress.state} ${billingAddress.postalCode}</p>
                <p>${billingAddress.country}</p>
                <p>Phone: ${billingAddress.phone}</p>
                ` : ''}
              </div>
              
              <div class="invoice-info-box">
                <h3>Ship To:</h3>
                ${shippingAddress ? `
                <p>${shippingAddress.firstName} ${shippingAddress.lastName}</p>
                <p>${shippingAddress.addressLine1}</p>
                ${shippingAddress.addressLine2 ? `<p>${shippingAddress.addressLine2}</p>` : ''}
                <p>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}</p>
                <p>${shippingAddress.country}</p>
                <p>Phone: ${shippingAddress.phone}</p>
                ` : ''}
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
                  <td>${parseFloat(String(item.unitPrice || item.product.price || 0)).toFixed(2)} ${order.currency || 'OMR'}</td>
                  <td class="text-right">${(parseFloat(String(item.unitPrice || item.product.price || 0)) * item.quantity).toFixed(2)} ${order.currency || 'OMR'}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="invoice-total">
              <table>
                <tr>
                  <td>Subtotal:</td>
                  <td class="text-right">${parseFloat(String(order.subtotal || 0)).toFixed(2)} ${order.currency || 'OMR'}</td>
                </tr>
                <tr>
                  <td>Shipping:</td>
                  <td class="text-right">${parseFloat(String(order.shippingCost || 0)).toFixed(2)} ${order.currency || 'OMR'}</td>
                </tr>
                ${order.discount ? `
                <tr>
                  <td>Discount:</td>
                  <td class="text-right">-${parseFloat(String(order.discount)).toFixed(2)} ${order.currency || 'OMR'}</td>
                </tr>
                ` : ''}
                <tr>
                  <td>Total:</td>
                  <td class="text-right">${parseFloat(String(order.totalAmount)).toFixed(2)} ${order.currency || 'OMR'}</td>
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
      
      // Set content type to HTML and disable caching
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Send the HTML response
      return res.send(invoiceHtml);
    } catch (error) {
      console.error("Error generating invoice:", error);
      return res.status(500).json({ message: "Failed to generate invoice", error: String(error) });
    }
  });

  return router;
}