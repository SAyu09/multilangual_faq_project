
import express from 'express';
import mongoose from 'mongoose';
import { errorHandler } from './api/v1/middleware/errorHandler.js';
import { userRoutes } from './api/v1/routes/user.routes.js';
import { faqRoutes } from './api/v1/faq/faq.routes.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// MongoDB connection setup
const connectToDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/multilingual_faq';
    await mongoose.connect(mongoURI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);  // Exit the process with failure
  }
};

// Middleware to parse JSON data
app.use(express.json());

// Setup Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/faq', faqRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Start the server and connect to the database
const startServer = async () => {
  try {
    await connectToDatabase();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting the server:', err);
  }
};

startServer();

export { app, connectToDatabase, startServer };  
