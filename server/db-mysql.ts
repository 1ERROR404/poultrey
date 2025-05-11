import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

// MySQL pool for GoDaddy hosting
export const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Note: You'll need to adapt your storage.ts to work with MySQL
// This is just the connection layer