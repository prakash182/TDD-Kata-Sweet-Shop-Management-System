/**
 * Server Entry Point
 * * Orchestrates database connections, environment configuration, 
 * data seeding for development, and server initialization.
 */

// Core Dependencies
require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Application Modules
const app = require('./app');
const Sweet = require('./models/Sweet');
const User = require('./models/User');

// Route Configurations
// Ensure you have created routes/cart.js as discussed previously
const cartRoutes = require('./routes/cart'); 
const sweetRoutes = require('./routes/sweets'); // Assuming you have this separate or in app.js
const authRoutes = require('./routes/auth');   // Assuming you have this separate or in app.js

// Configuration Constants
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

// -----------------------------------------------------------------------------
// Helper: AI Image Generator
// -----------------------------------------------------------------------------
const generateAIImageURL = (productName) => {
  const prompt = encodeURIComponent(`${productName} sweet candy confectionery food photography high quality`);
  // Random seed ensures variety in generated imagery
  const seed = Math.floor(Math.random() * 1000); 
  return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&seed=${seed}`;
};

// -----------------------------------------------------------------------------
// Mock Data Configuration
// -----------------------------------------------------------------------------
const sampleSweets = [
  { 
    name: 'Chocolate Truffle', 
    category: 'chocolate', 
    price: 249, 
    quantity: 50,
    image: generateAIImageURL('Chocolate Truffle'),
    description: 'Rich, decadent chocolate truffles with a smooth ganache center'
  },
  { 
    name: 'Strawberry Gummy Bears', 
    category: 'gummy', 
    price: 120, 
    quantity: 100,
    image: generateAIImageURL('Strawberry Gummy Bears'),
    description: 'Chewy strawberry-flavored gummy bears bursting with fruity goodness'
  },
  { 
    name: 'Vanilla Lollipop', 
    category: 'lollipop', 
    price: 80, 
    quantity: 75,
    image: generateAIImageURL('Vanilla Lollipop'),
    description: 'Classic vanilla-flavored lollipops with a creamy, smooth taste'
  },
  { 
    name: 'Mint Hard Candy', 
    category: 'hard candy', 
    price: 165, 
    quantity: 60,
    image: generateAIImageURL('Mint Hard Candy'),
    description: 'Refreshing mint hard candies with a cool, invigorating flavor'
  },
  { 
    name: 'Rainbow Candy Canes', 
    category: 'candy', 
    price: 289, 
    quantity: 40,
    image: generateAIImageURL('Rainbow Candy Canes'),
    description: 'Colorful striped candy canes with multiple fruity flavors'
  },
  { 
    name: 'Dark Chocolate Bar', 
    category: 'chocolate', 
    price: 415, 
    quantity: 30,
    image: generateAIImageURL('Dark Chocolate Bar'),
    description: 'Premium dark chocolate bar with 70% cocoa content'
  },
  { 
    name: 'Sour Gummy Worms', 
    category: 'gummy', 
    price: 205, 
    quantity: 80,
    image: generateAIImageURL('Sour Gummy Worms'),
    description: 'Tangy sour gummy worms with a perfect balance of sweet and sour'
  },
  { 
    name: 'Caramel Lollipop', 
    category: 'lollipop', 
    price: 105, 
    quantity: 65,
    image: generateAIImageURL('Caramel Lollipop'),
    description: 'Golden caramel lollipops with a rich, buttery flavor'
  },
  { 
    name: 'Assorted Macarons', 
    category: 'chocolate', 
    price: 499, 
    quantity: 25,
    image: generateAIImageURL('Assorted Macarons'),
    description: 'Delicate French macarons in assorted flavors and colors'
  },
  { 
    name: 'Cotton Candy', 
    category: 'candy', 
    price: 330, 
    quantity: 20,
    image: generateAIImageURL('Cotton Candy'),
    description: 'Fluffy, melt-in-your-mouth spun sugar cotton candy'
  },
  { 
    name: 'Rainbow Gummy Rings', 
    category: 'gummy', 
    price: 148, 
    quantity: 90,
    image: generateAIImageURL('Rainbow Gummy Rings'),
    description: 'Colorful gummy rings with fruity flavors in every bite'
  },
  { 
    name: 'Peppermint Humbugs', 
    category: 'hard candy', 
    price: 190, 
    quantity: 70,
    image: generateAIImageURL('Peppermint Humbugs'),
    description: 'Traditional striped peppermint hard candies with intense mint flavor'
  }
];

// -----------------------------------------------------------------------------
// Database Initialization
// -----------------------------------------------------------------------------
const initializeDatabaseConnection = async () => {
  if (process.env.MONGODB_URI) {
    console.log(`📊 [Database] Connecting to configured remote MongoDB...`);
    return process.env.MONGODB_URI;
  }
  
  // Fallback to In-Memory DB for seamless local development
  console.log('🔧 [Database] Spawning in-memory MongoDB instance...');
  const mongod = await MongoMemoryServer.create();
  return mongod.getUri();
};

/**
 * Populates the database with initial data.
 * IMPORTANT: This operation wipes existing data. 
 * It is restricted to non-production environments for safety.
 */
const seedDatabase = async () => {
  // Safety Check: Prevent data loss in production
  if (NODE_ENV === 'production') {
    console.log('🛡️  [Seeding] Skipped in production environment.');
    return;
  }

  try {
    // Clean slate
    await Sweet.deleteMany({});
    await User.deleteMany({});
    
    // Populate Inventory
    await Sweet.insertMany(sampleSweets);
    
    // Provision Default Access Control
    const adminUser = {
      name: process.env.ADMIN_NAME || 'System Admin',
      email: process.env.ADMIN_EMAIL || 'admin@royalsweet.com',
      password: process.env.ADMIN_PASSWORD || 'admin123', // Note: Ensure User model hashes this
      role: 'admin'
    };

    const regularUser = {
      name: process.env.USER_NAME || 'Prakash Prajapat',
      email: process.env.USER_EMAIL || 'user@royalsweet.com',
      password: process.env.USER_PASSWORD || 'user123',
      role: 'user'
    };

    await User.create(adminUser);
    await User.create(regularUser);
    
    console.log(`✅ [Seeding] Successfully hydrated database with ${sampleSweets.length} items and 2 users.`);
    
  } catch (error) {
    console.error('❌ [Seeding] Failed to seed database:', error.message);
    throw error; // Re-throw to halt startup if critical seeding fails
  }
};

// -----------------------------------------------------------------------------
// Server Lifecycle Management
// -----------------------------------------------------------------------------
const startServer = async () => {
  try {
    const mongoUri = await initializeDatabaseConnection();
    
    // Connect with standard production options
    await mongoose.connect(mongoUri);
    console.log('✅ [Database] Connection established.');
    
    await seedDatabase();

    // Register Cart Routes (Make sure this matches your file structure)
    // If these are not in app.js, you can mount them here:
    app.use('/api/cart', cartRoutes); 

    const server = app.listen(PORT, () => {
      // Professional Startup Dashboard
      console.log('\n==================================================');
      console.log(`🚀 ${process.env.APP_NAME || 'ROYAL SWEET MANAGEMENT SYSTEM'}`);
      console.log('==================================================');
      console.log(`STATUS:    Online`);
      console.log(`VERSION:   ${process.env.API_VERSION || '1.0.0'}`);
      console.log(`PORT:      ${PORT}`);
      console.log(`ENV:       ${NODE_ENV.toUpperCase()}`);
      console.log('--------------------------------------------------');
      console.log(`📡 API:    http://${HOST}:${PORT}`);
      console.log(`🛒 Cart:   http://${HOST}:${PORT}/api/cart`);
      console.log('--------------------------------------------------');
      console.log(`🔑 ADMIN:  ${process.env.ADMIN_EMAIL || 'admin@royalsweet.com'}`);
      console.log(`👤 USER:   ${process.env.USER_EMAIL || 'user@royalsweet.com'}`);
      console.log('==================================================\n');
    });

    // Graceful Shutdown Handler
    process.on('SIGINT', async () => {
      console.log('\n🛑 [System] Shutting down...');
      await mongoose.connection.close();
      server.close(() => {
        console.log('✅ [System] Server closed.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ [System] Critical startup failure:', error);
    process.exit(1);
  }
};

// Execute
startServer();