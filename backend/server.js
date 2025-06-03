const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');
const { User, Store, Rating } = require('./models');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const testRoutes = require('./routes/testRoutes'); // Import test routes

// Import controllers
const ratingController = require('./controllers/ratingController');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log requests in development mode only
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Root route
app.get('/', (req, res) => {
  res.send('Roxiller Rating API is running');
});

// Root endpoint
app.get('/ping', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/test', testRoutes); // Register test routes without /api prefix

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  console.error('Server error:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

// Create default admin user if not exists
const createDefaultAdmin = async () => {
  try {
    console.log('Checking if admin user exists...');
    const adminExists = await User.findOne({ where: { email: 'admin@roxiller.com' } });
    
    if (!adminExists) {
      console.log('Admin user does not exist, creating...');
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      
      // Create admin user directly with raw SQL to bypass model validations
      // which might be causing the issue
      await sequelize.query(`
        INSERT INTO "Users" ("name", "email", "password", "address", "role", "createdAt", "updatedAt")
        VALUES ('Admin User', 'admin@roxiller.com', :password, 'Admin Address', 'admin', NOW(), NOW())
        ON CONFLICT ("email") DO NOTHING
      `, {
        replacements: { password: hashedPassword },
        type: sequelize.QueryTypes.INSERT
      });
      
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
    console.error('Full error:', error);
  }
};

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Test database connection
    console.log('Connecting to PostgreSQL database...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('Failed to connect to database. Please check your PostgreSQL configuration.');
      console.error('Make sure PostgreSQL is running and the database credentials are correct.');
      return process.exit(1);
    }
    
    console.log('Successfully connected to PostgreSQL database');
    
    // Sync database models (force: false in production)
    console.log('Syncing database models...');
    await sequelize.sync({ force: process.env.NODE_ENV !== 'production' });
    console.log('Database synchronized');
    
    // Always create the default admin user
    await createDefaultAdmin();
    
    // Start server
    startServer();
  } catch (error) {
    console.error('Error initializing app:', error);
    process.exit(1);
  }
};



// Start the server
const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`\n===== Server running on port ${PORT} =====`);
    
    // Print available API endpoints
    console.log('\nAPI Endpoints:');
    console.log('- GET /api/stores - Get all stores');
    console.log('- POST /api/ratings - Submit a rating');
    console.log('- GET /api/ratings/user - Get user ratings');
    console.log('- POST /api/auth/register - Register a new user');
    console.log('- POST /api/auth/login - Login a user');
    console.log('- GET /api/auth/me - Get current user (requires auth)');
    console.log('- PUT /api/auth/update-password - Update password (requires auth)');
  });
  
  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', error);
  });
  
  return server;
};

// Error handling middleware - must be after routes
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start the application
initializeApp();
