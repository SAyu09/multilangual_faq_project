// Importing necessary packages
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { userRoutes } from './api/v1/routes/user.routes.js';  // Import routes
import { faqRoutes } from './api/v1/faq/faq.routes.js';        // Import FAQ routes
import { errorHandler } from './api/v1/middleware/errorHandler.js';  // Import custom error handler
import { requestLogger } from './api/v1/middleware/requestLogger.js'; // Import custom request logger

// Initialize the app
const app = express();

// Load environment variables
dotenv.config();

// MongoDB Connection Setup
const connectDB = async () => {
  try {
    // MongoDB URI from environment variables
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/multilingual_faq';
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed', err);
    process.exit(1); // Exit the process if connection fails
  }
};

// Middleware Setup
app.use(requestLogger);  // Log incoming requests
app.use(express.json());  // Parse incoming JSON requests

// Routes Setup
app.use('/api/v1/user', userRoutes);  // User routes
app.use('/api/v1/faq', faqRoutes);    // FAQ routes

// Global Error Handler Middleware
app.use(errorHandler);

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start the server and connect to DB
const startServer = async () => {
  // First, establish MongoDB connection
  await connectDB();

  // Start Express server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

// Start the server
startServer();
