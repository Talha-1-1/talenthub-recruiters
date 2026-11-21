const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');
const { getUserProfile } = require('./controllers/authController');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB().catch((err) => {
  console.warn('[MongoDB] Warning: Initial connection failed. Ensure MongoDB is running or configure MONGO_URI.');
});

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TalentHub Recruiters API is running smoothly',
    documentation: '/api/docs',
    version: '1.0.0',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'TalentHub Recruiters Support Chat API',
  });
});

// Authentication routes (/api/auth/register, /api/auth/login, /api/auth/profile)
app.use('/api/auth', authRoutes);

// Direct protected profile route matching mentor specification (/api/profile)
app.get('/api/profile', protect, getUserProfile);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 TalentHub Recruiters Server started!`);
  console.log(`📡 Port: ${PORT} | Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Endpoints:`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - GET  http://localhost:${PORT}/api/profile (Protected)`);
  console.log(`   - GET  http://localhost:${PORT}/api/auth/profile (Protected)`);
  console.log(`=================================================`);
});

module.exports = { app, server };
