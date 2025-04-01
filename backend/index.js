const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const db = require('./database');

// Import routes
const authRoutes = require('./routes/auth');
const locationsRoutes = require('./routes/locations');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/', locationsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, async () => {
  try {
    // Test database connection - this is critical
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      console.error('Database connection failed - this is a critical error');
      process.exit(1);
    }
    
    // Pre-load locations data into cache
    console.log('Pre-loading locations data into cache...');
    await locationsRoutes.loadLocationsCache();
    console.log('Locations cache loaded successfully');
    
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Failed to start server properly:', error);
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await db.close();
  process.exit(0);
});