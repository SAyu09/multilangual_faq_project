import mongoose from 'mongoose';
import logger from './logger.js';

const { MONGO_URI, MONGO_DB_NAME, NODE_ENV } = process.env;

mongoose.set('strictQuery', false); 
mongoose.set('bufferCommands', true); 

const connectionOptions = {
  dbName: MONGO_DB_NAME || 'multilingual_faq_db',
  autoIndex: NODE_ENV !== 'production',
  maxPoolSize: 15, 
  minPoolSize: 2, 
  serverSelectionTimeoutMS: 8000, 
  socketTimeoutMS: 60000, 
  retryWrites: true, 
  w: 'majority',
};

// Connect to MongoDB with retry logic
export const connectDB = async () => {
  if (!MONGO_URI) throw new Error('MongoDB URI is missing in environment variables.');

  const MAX_RETRIES = 5;
  const RETRY_DELAY = 4000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(MONGO_URI, connectionOptions);
      logger.info(`✅ MongoDB connected to database: ${mongoose.connection.db.databaseName}`);
      return;
    } catch (error) {
      logger.error(`Connection attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);
      if (attempt === MAX_RETRIES) {
        logger.error('🔥 Critical: Failed to connect to MongoDB after maximum retries');
        process.exit(1);
      }
      logger.info(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
};

// Disconnect from MongoDB gracefully
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) { // 0 = disconnected
    try {
      await mongoose.disconnect();
      logger.info('✅ MongoDB connection closed gracefully');
    } catch (error) {
      logger.error(`❌ Failed to close MongoDB connection: ${error.message}`);
      throw error;
    }
  }
};

// MongoDB connection event listeners
mongoose.connection.on('connecting', () => logger.info('🔃 Establishing MongoDB connection...'));
mongoose.connection.on('connected', () => logger.info('✅ MongoDB connection established'));
mongoose.connection.on('disconnected', () => logger.warn('⚠️ MongoDB connection lost'));
mongoose.connection.on('reconnected', () => logger.info('♻️ MongoDB connection reestablished'));
mongoose.connection.on('error', (error) => logger.error(`❌ MongoDB connection error: ${error.message}`));

// Handle process termination signals
const shutdownHandler = async (signal) => {
  logger.warn(`⚠️ Received ${signal}, closing MongoDB connection...`);
  await disconnectDB();
  process.exit(0);
};

process.on('SIGINT', () => shutdownHandler('SIGINT'));
process.on('SIGTERM', () => shutdownHandler('SIGTERM'));

// Handle uncaught MongoDB exceptions
process.on('uncaughtException', async (error) => {
  if (error.message.includes('Mongo')) {
    logger.error('🚨 Uncaught MongoDB exception:', error);
    await disconnectDB();
    process.exit(1);
  }
});