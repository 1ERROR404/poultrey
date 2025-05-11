# PoultryGear Deployment Guide for GoDaddy Hosting

This guide will help you deploy your PoultryGear e-commerce platform to GoDaddy hosting with the domain poultrygear.com.

## Preparation

1. **Build the Application**

   ```bash
   # Run the production build script
   node scripts/build-production.js
   ```

   This will create a `dist` folder with all production-ready files.

2. **Export the Database**

   The database has already been exported to:
   - `database_export.json` - Full data export in JSON format
   - `database_export.sql` - SQL insert statements for all data
   - `mysql_schema.sql` - MySQL-compatible schema creation script

## Option 1: Full-Stack Deployment (If GoDaddy Supports Node.js)

### Step 1: Set Up MySQL Database

1. Log in to your GoDaddy hosting account
2. Access cPanel
3. Find and open "MySQL Databases"
4. Create a new database named "poultrygear"
5. Create a new database user
6. Add the user to the database with all permissions
7. Note down the database credentials

### Step 2: Import Database Schema and Data

1. In cPanel, open phpMyAdmin
2. Select your new database
3. Go to the "Import" tab
4. Upload and execute `mysql_schema.sql` first
5. Then upload and execute `database_export.sql`

### Step 3: Update Environment Variables

1. Edit the `.env` file in the `dist` folder:
   ```
   NODE_ENV=production
   PORT=8080
   DB_HOST=localhost
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=poultrygear
   SESSION_SECRET=a_secure_random_string
   ```

### Step 4: Upload Files

**If using File Manager:**
1. In cPanel, open File Manager
2. Navigate to the root directory of your website (usually `public_html`)
3. Upload all files from the `dist/public` folder
4. Create a new folder outside `public_html` (e.g., `nodejs`)
5. Upload all other files from the `dist` folder to this directory

**If using FTP:**
1. Connect to your hosting using an FTP client like FileZilla
2. Upload all files from `dist/public` to `public_html`
3. Create a folder outside `public_html` and upload remaining files from `dist`

### Step 5: Configure Node.js (if supported)

1. In cPanel, look for "Setup Node.js App"
2. Configure with:
   - Application Path: The path to your nodejs folder
   - Application URL: https://poultrygear.com
   - Application Startup File: index.js
   - Node.js Version: Select the latest available
   - Set environment variables from your .env file

3. Start the Application

## Option 2: Split Deployment (If GoDaddy Doesn't Support Node.js)

### Step 1: Set Up Static Frontend

1. Upload all files from `dist/public` to your GoDaddy `public_html` folder
2. Ensure the `.htaccess` file is included

### Step 2: Set Up API Backend on a Node.js Hosting Service

1. Choose a Node.js hosting service (Heroku, Render, Railway, etc.)
2. Upload the backend files from `dist` (excluding the `public` folder)
3. Set up environment variables to connect to your GoDaddy MySQL database
4. Update CORS settings to allow requests from your domain:

   ```javascript
   app.use(cors({
     origin: 'https://poultrygear.com',
     credentials: true
   }));
   ```

5. Update the `VITE_API_BASE_URL` in your frontend to point to your API service

## Post-Deployment Tasks

### Step 1: Test Your Site

1. Visit https://poultrygear.com
2. Test the following functionality:
   - Home page loads correctly
   - Product browsing works
   - Product details display properly
   - User registration and login
   - Shopping cart functionality
   - Checkout process
   - Admin panel at https://poultrygear.com/admin

### Step 2: Set Up SSL Certificate

1. In cPanel, locate SSL/TLS options
2. Install a Let's Encrypt certificate or use GoDaddy's SSL certificate

### Step 3: Set Up Redirects

Ensure all traffic is redirected to HTTPS by adding this to your `.htaccess`:

```
# Redirect to HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Troubleshooting Common Issues

### Database Connection Problems

- Verify your database credentials
- Check if your MySQL server allows remote connections (for split deployment)
- Ensure your database user has the correct permissions

### 404 Errors on Routes

- Check if the `.htaccess` file is properly uploaded and enabled
- Ensure mod_rewrite is enabled on your Apache server

### API Not Working

- Check CORS settings if using a separate API host
- Verify the API URLs in the frontend are correct
- Check the Node.js server logs for errors

### Missing Images or Assets

- Ensure all files from `public/uploads` were copied correctly
- Check file permissions (should be 644 for files, 755 for directories)

## Maintenance

### Updating the Site

1. Make changes locally
2. Test thoroughly
3. Run the build script
4. Upload the updated files to your hosting

### Backing Up

1. Regularly back up your database using cPanel's backup tools
2. Download copies of all uploaded files

## Support

If you encounter issues with this deployment, please refer to:
- GoDaddy's hosting documentation
- Node.js hosting service documentation
- Your application source code in Replit