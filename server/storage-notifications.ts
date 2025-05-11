import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { stockNotifications, type StockNotification } from "@shared/schema";

// Stock Notification methods
export async function addStockNotification(email: string, productId: number): Promise<StockNotification> {
  // Check if notification already exists for this email and product
  const existingNotifications = await db.select()
    .from(stockNotifications)
    .where(
      and(
        eq(stockNotifications.email, email),
        eq(stockNotifications.productId, productId),
        eq(stockNotifications.isNotified, false)
      )
    );
  
  // If a notification already exists, return it
  if (existingNotifications.length > 0) {
    return existingNotifications[0];
  }
  
  // Create new notification
  const [notification] = await db.insert(stockNotifications)
    .values({
      email,
      productId,
    })
    .returning();
    
  return notification;
}

export async function getStockNotifications(productId: number): Promise<StockNotification[]> {
  return db.select()
    .from(stockNotifications)
    .where(
      and(
        eq(stockNotifications.productId, productId),
        eq(stockNotifications.isNotified, false)
      )
    );
}

export async function updateStockNotificationStatus(id: number, isNotified: boolean): Promise<StockNotification> {
  const [notification] = await db.update(stockNotifications)
    .set({ 
      isNotified,
      ...(isNotified ? { notifiedAt: new Date() } : {})
    })
    .where(eq(stockNotifications.id, id))
    .returning();
    
  return notification;
}

export async function deleteStockNotification(id: number): Promise<boolean> {
  const [notification] = await db.delete(stockNotifications)
    .where(eq(stockNotifications.id, id))
    .returning();
    
  return !!notification;
}