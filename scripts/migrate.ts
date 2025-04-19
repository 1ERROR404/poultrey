import { sql } from 'drizzle-orm';
import { db, pool } from '../server/db';

async function main() {
  console.log('Adding email column to users table...');
  
  try {
    // Check if email column already exists
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email'
    `);

    if (result.rows.length === 0) {
      // Add email column
      await db.execute(sql`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT
      `);
      console.log('Email column added successfully!');
    } else {
      console.log('Email column already exists. No changes needed.');
    }
  } catch (error) {
    console.error('Error executing migration:', error);
  } finally {
    await pool.end();
  }
}

main();