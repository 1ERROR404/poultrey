import fs from 'fs';
import pg from 'pg';
const { Pool } = pg;

// Create a connection pool using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function exportData() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database. Exporting data...');
    
    // Get a list of all tables
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const tables = tableRes.rows.map(row => row.table_name);
    console.log('Found tables:', tables);
    
    let exportData = {};
    
    // Export data from each table
    for (const table of tables) {
      console.log(`Exporting data from table: ${table}`);
      const res = await client.query(`SELECT * FROM "${table}"`);
      exportData[table] = res.rows;
    }
    
    // Write data to JSON file
    fs.writeFileSync('database_export.json', JSON.stringify(exportData, null, 2));
    console.log('Data exported successfully to database_export.json');
    
    // Generate SQL to recreate data in any PostgreSQL or MySQL
    let sqlContent = '';
    
    for (const table of tables) {
      const rows = exportData[table];
      
      if (rows.length === 0) continue;
      
      console.log(`Generating SQL for table: ${table} (${rows.length} rows)`);
      
      for (const row of rows) {
        const columns = Object.keys(row);
        const values = columns.map(col => {
          const val = row[col];
          if (val === null) return 'NULL';
          if (typeof val === 'number') return val;
          if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
          if (val instanceof Date) return `'${val.toISOString()}'`;
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        
        sqlContent += `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
      }
      
      sqlContent += '\n';
    }
    
    fs.writeFileSync('database_export.sql', sqlContent);
    console.log('SQL export generated in database_export.sql');
    
  } catch (err) {
    console.error('Error exporting data:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

exportData().catch(err => {
  console.error('Unhandled error:', err);
});