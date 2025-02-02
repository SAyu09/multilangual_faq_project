import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { errorHandler } from './src/api/v1/middleware/errorHandler.js';
import { faqRoutes } from './src/api/v1/faq/faq.routes.js';
import { authRoutes } from './src/api/v1/auth/auth.routes.js';
import { logger } from './src/utils/logger.js'; // Assuming logger.js is set up for better logging

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// Middlewares
app.use(cors());  // Enable CORS
app.use(express.json());  // Middleware to parse JSON bodies

// Routes
app.use('/api/v1/faq', faqRoutes);  // FAQ related routes
app.use('/api/v1/auth', authRoutes);  // Authentication related routes

// Global error handler middleware
app.use(errorHandler);

// Health check route (optional but useful for monitoring)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Server start
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Graceful shutdown handling
const shutdown = (signal) => {
  logger.info(`${signal} received: Closing HTTP server...`);
  server.close(() => {
    logger.info('HTTP server closed');
    // Here you can also disconnect DB, Redis, etc.
    process.exit(0);
  });

  // Force close server after 10 seconds
  setTimeout(() => {
    logger.error('Force shutdown: Server did not close gracefully in time');
    process.exit(1);
  }, 10000);
};

// Handle termination signals for graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

