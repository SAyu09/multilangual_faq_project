// // Importing necessary packages
// import express from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import { userRoutes } from './api/v1/routes/user.routes.js';  // Import user routes
// import { faqRoutes } from './api/v1/faq/faq.routes.js';      // Import FAQ routes
// import { errorHandler } from './api/v1/middleware/errorHandler.js';  // Import custom error handler
// import { requestLogger } from './api/v1/middleware/requestLogger.js'; // Import request logger

// // Load environment variables
// dotenv.config();

// const app = express();

// // MongoDB Connection Setup
// const connectDB = async () => {
//   try {
//     const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/multilingual_faq';
//     console.log("🔄 Connecting to MongoDB...");
    
//     await mongoose.connect(mongoURI);
//     console.log("✅ MongoDB connected successfully");
//   } catch (err) {
//     console.error("❌ MongoDB connection failed", err);
//     process.exit(1);
//   }
// };

// // Middleware Setup
// app.use(requestLogger);  // Log incoming requests
// app.use(express.json());  // Parse incoming JSON requests

// // Routes Setup
// app.use('/api/v1/user', userRoutes);  // User routes
// app.use('/api/v1/faq', faqRoutes);    // FAQ routes

// // 404 Not Found Handler
// app.use((req, res, next) => {
//   res.status(404).json({ success: false, message: 'Endpoint not found' });
// });

// // Global Error Handler Middleware (must be last)
// app.use(errorHandler);

// // Start the server and connect to DB
// const startServer = async () => {
//   try {
//     await connectDB(); // Ensure DB connection before starting server

//     const PORT = process.env.PORT || 3000;
//     const server = app.listen(PORT, () => {
//       console.log(`🚀 Server is running on port ${PORT}`);
//     });

//     // Graceful Shutdown Handling
//     const shutdown = (signal) => {
//       console.log(`⚠️ ${signal} received: Closing HTTP server...`);
      
//       server.close(() => {
//         console.log("🛑 HTTP server closed");
//         mongoose.connection.close(false, () => {
//           console.log("✅ MongoDB disconnected");
//           process.exit(0);
//         });
//       });

//       // Force shutdown after 10 seconds
//       setTimeout(() => {
//         console.error("❌ Force shutdown: Server did not close gracefully in time");
//         process.exit(1);
//       }, 10000);
//     };

//     process.on('SIGTERM', shutdown);
//     process.on('SIGINT', shutdown);

//   } catch (err) {
//     console.error("❌ Server startup error:", err);
//   }
// };

// // Handle uncaught exceptions & promise rejections
// process.on('uncaughtException', (err) => {
//   console.error("🚨 Uncaught Exception:", err);
//   process.exit(1);
// });

// process.on('unhandledRejection', (err) => {
//   console.error("🚨 Unhandled Promise Rejection:", err);
//   process.exit(1);
// });

// startServer();

// export { app, connectDB, startServer };