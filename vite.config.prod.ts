import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";

// Get current directory using Node.js standard
const rootDir = path.resolve(__dirname);
const clientDir = path.join(rootDir, "client");
const sharedDir = path.join(rootDir, "shared");
const assetsDir = path.join(rootDir, "attached_assets");

export default defineConfig({
  plugins: [
    react(),
    themePlugin({
      // Add theme plugin configuration if needed
    }),
  ],
  // Use proper environment variable handling
  envDir: rootDir,
  envPrefix: "VITE_",
  
  resolve: {
    alias: {
      "@": path.join(clientDir, "src"),
      "@shared": sharedDir,
      "@assets": assetsDir,
      // Add any other necessary aliases
    },
  },
  
  // Explicit base path for deployment
  base: process.env.NODE_ENV === "production" ? "/" : "/",
  
  build: {
    outDir: path.join(rootDir, "dist/public"),
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== "production",
    
    // Improved optimization
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },

    // Better chunking strategy
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("react")) return "vendor-react";
            return "vendor";
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },

  // Server configuration for development
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Preview configuration
  preview: {
    port: 3000,
    strictPort: true,
  },
});