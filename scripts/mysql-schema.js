import fs from 'fs';
import path from 'path';

// Read the JSON schema exported earlier
const dbExportPath = path.join(process.cwd(), 'database_export.json');

if (!fs.existsSync(dbExportPath)) {
  console.error('Error: database_export.json not found. Run the export script first.');
  process.exit(1);
}

const exportData = JSON.parse(fs.readFileSync(dbExportPath, 'utf8'));
const tables = Object.keys(exportData);

// Generate MySQL schema
let mysqlSchema = '';

// Helper to convert PostgreSQL data types to MySQL
const convertDataType = (pgType, columnName) => {
  if (pgType.includes('varchar')) return 'VARCHAR(255)';
  if (pgType.includes('text')) return 'TEXT';
  if (pgType.includes('int')) return 'INT';
  if (pgType.includes('json')) return 'JSON';
  if (pgType.includes('boolean')) return 'BOOLEAN';
  if (pgType.includes('timestamp')) return 'TIMESTAMP';
  if (pgType.includes('date')) return 'DATE';
  if (pgType.includes('serial')) return 'INT AUTO_INCREMENT';
  if (pgType.includes('decimal')) return 'DECIMAL(10,2)';
  
  // Default
  console.warn(`Warning: Unknown type ${pgType} for column ${columnName}, using TEXT as default`);
  return 'TEXT';
};

// Generate schema for each table
for (const table of tables) {
  const rows = exportData[table];
  if (rows.length === 0) continue;
  
  // Get a sample row to determine column structure
  const sample = rows[0];
  const columns = Object.keys(sample);
  
  mysqlSchema += `CREATE TABLE IF NOT EXISTS \`${table}\` (\n`;
  
  // Add columns
  const columnDefs = columns.map(column => {
    // Infer type from data
    let type = 'TEXT';
    const value = sample[column];
    
    if (value === null) {
      // For null values, we'll need to guess based on column name
      if (column === 'id') type = 'INT AUTO_INCREMENT';
      else if (column.endsWith('Id')) type = 'INT';
      else if (column.includes('date') || column.includes('Date')) type = 'TIMESTAMP';
      else type = 'TEXT';
    } else {
      // Infer from value type
      if (typeof value === 'number') {
        if (Number.isInteger(value)) type = column === 'id' ? 'INT AUTO_INCREMENT' : 'INT';
        else type = 'DECIMAL(10,2)';
      }
      else if (typeof value === 'boolean') type = 'BOOLEAN';
      else if (typeof value === 'string') {
        if (value.length > 255) type = 'TEXT';
        else type = 'VARCHAR(255)';
      }
      else if (value instanceof Date) type = 'TIMESTAMP';
    }
    
    // Determine if it's primary key
    const isPrimary = column === 'id';
    const isNullable = !isPrimary;
    
    return `  \`${column}\` ${type}${isNullable ? '' : ' NOT NULL'}`;
  });
  
  // Add primary key
  if (columns.includes('id')) {
    columnDefs.push('  PRIMARY KEY (`id`)');
  }
  
  mysqlSchema += columnDefs.join(',\n');
  mysqlSchema += '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n';
}

// Write the schema to a file
fs.writeFileSync(
  path.join(process.cwd(), 'mysql_schema.sql'),
  mysqlSchema
);

console.log('✅ MySQL schema generated successfully in mysql_schema.sql');