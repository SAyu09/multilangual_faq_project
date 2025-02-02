// config/cache.js
import { createClient } from 'redis';
import { logger } from './logger.js'; // Import logger utility

const {
  REDIS_HOST = '127.0.0.1',
  REDIS_PORT = 6379,
  REDIS_PASSWORD,
} = process.env;

// Redis connection options
const redisOptions = {
  socket: {
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
  },
  password: REDIS_PASSWORD || undefined, // Use undefined if no password
};

// Create Redis client
export const redisClient = createClient(redisOptions);

/**
 * Connects to Redis.
 * @returns {Promise<void>}
 */
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('✅ Redis connection established.');
  } catch (error) {
    logger.error(`❌ Redis connection failed: ${error.message}`);
    process.exit(1); // Exit process on failure
  }
};

/**
 * Disconnects from Redis.
 * @returns {Promise<void>}
 */
export const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.disconnect();
      logger.info('✅ Redis disconnected successfully.');
    } else {
      logger.warn('⚠️ Redis is already disconnected.');
    }
  } catch (error) {
    logger.error(`❌ Redis disconnection error: ${error.message}`);
  }
};

// Redis event handlers
redisClient.on('connect', () => logger.info('✅ Redis connected.'));
redisClient.on('error', (error) => logger.error(`❌ Redis error: ${error.message}`));
redisClient.on('end', () => logger.warn('⚠️ Redis disconnected.'));

// Handle process termination signals gracefully
const handleShutdown = async (signal) => {
  logger.warn(`⚠️ Received ${signal}, closing Redis connection...`);
  await disconnectRedis();
  process.exitCode = 0; // Set exit code but allow cleanup
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
