import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";

// Validate environment variables before loading config
if (!process.env.VITE_API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL environment variable');
}

// Path configuration
const PROJECT_ROOT = path.resolve(__dirname, '..'); // Move up from client directory
const CLIENT_SRC = path.join(PROJECT_ROOT, 'client/src');
const SHARED_DIR = path.join(PROJECT_ROOT, 'shared');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'attached_assets');

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    themePlugin({
      themePath: path.join(CLIENT_SRC, 'theme.json'),
    }),
  ],

  // Environment configuration
  envDir: PROJECT_ROOT,
  envPrefix: 'VITE_',

  // Path resolution
  resolve: {
    alias: {
      '@': CLIENT_SRC,
      '@shared': SHARED_DIR,
      '@assets': ASSETS_DIR,
      '@server': path.join(PROJECT_ROOT, 'server'),
    },
  },

  // Build configuration
  build: {
    outDir: path.join(PROJECT_ROOT, 'dist/public'),
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Optimization settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.info', 'console.debug'],
      },
      format: {
        comments: false,
      },
    },

    // Advanced chunking
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@radix-ui')) return 'radix';
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('lodash')) return 'lodash';
            return 'vendor';
          }
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/chunks/[name]-[hash].js',
        assetFileNames: 'assets/media/[name]-[hash][extname]',
      },
    },
  },

  // Development server
  server: {
    port: 3000,
    strictPort: true,
    open: '/setup',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // Preview configuration
  preview: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL,
        changeOrigin: true,
      },
    },
  },
});