import express from 'express';
import mongoose from 'mongoose';
import { errorHandler } from './src/api/v1/middleware/errorHandler.js';
import { faqRoutes } from './src/api/v1/faq/faq.routes.js';
import "./config.js";


const app = express();

// Middleware to parse JSON data
app.use(express.json());

// Setup Routes
app.use('/api/v1/faq', faqRoutes);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global Error Handler Middleware (must be last)
app.use(errorHandler);

// Start the server and connect to the database
const startServer = async () => {
  try {
    await connectToDatabase();

    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

    // Graceful Shutdown Handling
    const shutdown = (signal) => {
      console.log(`⚠️ ${signal} received: Closing server...`);

      server.close(() => {
        console.log("🛑 HTTP server closed");
        mongoose.connection.close(false, () => {
          console.log("✅ MongoDB disconnected");
          process.exit(0);
        });
      });

      setTimeout(() => {
        console.error("❌ Force shutdown: Server did not close gracefully in time");
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    console.error("❌ Server startup error:", err);
    process.exit(1);
  }
};

// Handle uncaught exceptions & promise rejections
process.on('uncaughtException', (err) => {
  console.error("🚨 Uncaught Exception:", err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error("🚨 Unhandled Promise Rejection:", err);
  process.exit(1);
});

startServer();

export { app,startServer };