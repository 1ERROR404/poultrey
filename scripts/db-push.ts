import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { storage } from "../server/storage";

// Get the database connection string from environment variable
const connectionString = process.env.DATABASE_URL as string;

// Run migrations and seed initial data
async function main() {
  try {
    console.log("Connecting to database...");
    
    // Create a temporary Postgres client for migrations
    const migrationClient = postgres(connectionString, { max: 1 });
    const db = drizzle(migrationClient);
    
    console.log("Running database migrations...");
    await migrate(db, { migrationsFolder: "./migrations" });
    
    console.log("Migrations completed successfully!");
    
    // Seed the database with initial data
    console.log("Checking if database needs initial data...");
    await storage.seedInitialData();
    
    console.log("Database setup completed successfully!");
    
    // Close the connection
    await migrationClient.end();
    process.exit(0);
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

main();