import express from "express";
import { storage } from "../storage";

export function setupAdminOrdersRoutes(isAdmin: express.RequestHandler) {
  const router = express.Router();
  
  // Get all orders with user information
  router.get("/", isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      
      // Enhance orders with user information and items
      const enhancedOrders = await Promise.all(
        orders.map(async (order) => {
          // Get user info
          const user = await storage.getUser(order.userId);
          
          // Get order items
          const items = await storage.getOrderItemsByOrderId(order.id);
          
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
  
  // Get a specific order with details
  router.get("/:id", isAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get user
      const user = await storage.getUser(order.userId);
      
      // Get order items
      const items = await storage.getOrderItemsByOrderId(order.id);
      
      // Get shipping and billing addresses if they exist
      let shippingAddress = null;
      let billingAddress = null;
      
      if (order.shippingAddressId) {
        shippingAddress = await storage.getAddressById(order.shippingAddressId);
      }
      
      if (order.billingAddressId) {
        billingAddress = await storage.getAddressById(order.billingAddressId);
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
  
  // Update order status
  router.patch("/:id/status", isAdmin, async (req, res) => {
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
  
  // Update payment status
  router.patch("/:id/payment-status", isAdmin, async (req, res) => {
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
  
  // Get order statistics
  router.get("/stats/overview", isAdmin, async (req, res) => {
    try {
      const orderCount = await storage.getOrderCount();
      const totalRevenue = await storage.getTotalRevenue();
      const monthlyRevenue = await storage.getMonthlyRevenue(6); // Last 6 months
      const recentOrders = await storage.getRecentOrders(5); // Latest 5 orders
      
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
  
  // Update order notes
  router.patch("/:id/notes", isAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const { notes } = req.body;
      if (notes === undefined) {
        return res.status(400).json({ message: "Notes field is required" });
      }
      
      // Limit notes length for database - most notes columns can hold a few thousand characters
      const limitedNotes = notes.substring(0, 1000);
      
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
  
  // Generate an invoice for a specific order
  router.get("/:id/invoice", isAdmin, async (req, res) => {
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