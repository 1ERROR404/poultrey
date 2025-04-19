import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";

export const notificationRouter = Router();

const stockNotificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  productId: z.number().int().positive("Product ID must be a positive integer"),
});

// Route to subscribe to stock notifications
notificationRouter.post("/stock-notifications", async (req, res) => {
  try {
    // Validate request body
    const result = stockNotificationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: result.error.format() 
      });
    }

    const { email, productId } = result.data;

    // Check if product exists
    const product = await storage.getProductById(productId);
    if (!product) {
      return res.status(404).json({ 
        message: "Product not found" 
      });
    }

    // Store the notification request
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