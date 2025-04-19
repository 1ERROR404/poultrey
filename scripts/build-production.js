import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Set environment variables for production build
process.env.NODE_ENV = 'production';

console.log('🚀 Starting production build...');

// Create directories if they don't exist
const distDir = path.join(process.cwd(), 'dist');
const uploadDir = path.join(distDir, 'public', 'uploads');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Copy production config if it exists
const envProdPath = path.join(process.cwd(), '.env.production');
const envDistPath = path.join(distDir, '.env');

if (fs.existsSync(envProdPath)) {
  fs.copyFileSync(envProdPath, envDistPath);
  console.log('✅ Copied production environment variables');
}

try {
  // Build frontend with production config
  console.log('📦 Building frontend...');
  execSync('vite build --config vite.config.prod.ts', { stdio: 'inherit' });
  
  // Build backend
  console.log('📦 Building backend...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // Copy necessary files for production
  console.log('📂 Copying assets...');
  
  // Copy public uploads
  if (fs.existsSync(path.join(process.cwd(), 'public', 'uploads'))) {
    execSync(`cp -r ${path.join(process.cwd(), 'public', 'uploads')}/* ${uploadDir}`, { stdio: 'inherit' });
  }
  
  // Copy database export files
  if (fs.existsSync(path.join(process.cwd(), 'database_export.json'))) {
    fs.copyFileSync(
      path.join(process.cwd(), 'database_export.json'),
      path.join(distDir, 'database_export.json')
    );
  }
  
  if (fs.existsSync(path.join(process.cwd(), 'database_export.sql'))) {
    fs.copyFileSync(
      path.join(process.cwd(), 'database_export.sql'),
      path.join(distDir, 'database_export.sql')
    );
  }
  
  // Create a package.json for production
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  const prodPackage = {
    name: packageJson.name,
    version: packageJson.version,
    type: packageJson.type,
    scripts: {
      start: 'NODE_ENV=production node index.js'
    },
    dependencies: packageJson.dependencies
  };
  
  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(prodPackage, null, 2)
  );
  
  // Create an htaccess file for Apache
  const htaccessContent = `
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # If the request is for an existing file or directory, serve it directly
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # If the request starts with /api, route to the Node.js server
  RewriteRule ^api/(.*)$ http://localhost:8080/api/$1 [P,L]
  
  # Otherwise, route to index.html for the SPA
  RewriteRule ^ index.html [L]
</IfModule>
  `;
  
  fs.writeFileSync(
    path.join(distDir, 'public', '.htaccess'),
    htaccessContent
  );
  
  console.log('✅ Production build completed successfully!');
  console.log('📁 Your production-ready files are in the "dist" directory');
  console.log('');
  console.log('Instructions:');
  console.log('1. Upload the contents of dist/public to your GoDaddy public_html folder');
  console.log('2. Setup Node.js for the API or use a Node.js hosting service');
  console.log('3. Import database_export.sql to your MySQL database');
  console.log('4. Update the .env file with your production credentials');
  
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}