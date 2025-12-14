/**
 * Express Application Configuration
 * * Centralizes middleware, route mounting, and global error handling.
 * * Designed to be stateless and testable.
 */

const express = require('express');

// Route Imports
const authRoutes = require('./routes/auth');
const sweetRoutes = require('./routes/sweets'); // Note: Matched your filename 'sweet.js'
const cartRoutes = require('./routes/cart');   // The new Cart functionality

const app = express();

// =============================================================================
// 1. Global Middleware
// =============================================================================

// Parse incoming JSON payloads
app.use(express.json());
// Parse URL-encoded data (useful for standard HTML forms)
app.use(express.urlencoded({ extended: true }));

// Professional CORS Configuration
// Allows your frontend (React) to communicate securely with this backend
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.CORS_ORIGIN, 
    'http://localhost:3000', 
    'http://localhost:5173' // Common Vite/React port
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true'); // Allow cookies if needed later

  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// =============================================================================
// 2. Route Mounting
// =============================================================================

// Health Check / Metadata Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'active',
    system: process.env.APP_NAME || 'Sweet Shop Management System',
    version: process.env.API_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      sweets: '/api/sweets',
      cart: '/api/cart'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes); // Mounts 'sweet.js' to '/api/sweets'
app.use('/api/cart', cartRoutes);    // Mounts 'cart.js' to '/api/cart'

// =============================================================================
// 3. Centralized Error Handling (The "Safety Net")
// =============================================================================

// 404 Handler - Catches any request that doesn't match a route above
app.use((req, res, next) => {
  const error = new Error('Resource not found');
  error.status = 404;
  next(error);
});

// Global Error Handler - Catches all errors thrown in routes
app.use((err, req, res, next) => {
  // Log the error for the developer (you) to see in the terminal
  console.error(`❌ [Error] ${err.message}`);

  // Send a clean JSON response to the user
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
      // Only show stack trace in development for debugging
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

module.exports = app;