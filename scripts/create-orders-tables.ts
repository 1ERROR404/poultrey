import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createOrdersTables() {
  try {
    console.log("Creating orders and order_items tables...");
    
    // Create orders table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        total_amount VARCHAR(20) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        shipping_method VARCHAR(50),
        shipping_cost VARCHAR(20),
        shipping_address_id INTEGER,
        billing_address_id INTEGER,
        payment_method_id INTEGER,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create order_items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price VARCHAR(20) NOT NULL,
        subtotal VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("Orders tables created successfully!");
  } catch (error) {
    console.error("Error creating orders tables:", error);
  } finally {
    process.exit(0);
  }
}

createOrdersTables();