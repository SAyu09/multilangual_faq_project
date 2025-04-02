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
export const cache = createClient(redisOptions);

/**
 * Connects to Redis.
 * @returns {Promise<void>}
 */
export const connectRedis = async () => {
  try {
    global.redisClient = await createClient({
      password: process.env.REDIS_PASSWORD_PROD,
      socket: {
        host: process.env.REDIS_HOST_PROD,
        port: process.env.REDIS_PORT_PROD,
      },
    });
    global.redisClient.connect();
    // Event listener for successful connection
    global.redisClient.on("connect", () => {
      console.log("Connected to Redis");
    });
    // Event listener for connection error
    global.redisClient.on("error", (err) => {
      console.error("Error connecting to Redis:", err);
    });

    // Event listener for when the connection is closed
    global.redisClient.on("end", () => {
      console.log("Connection to Redis closed");
    });
  } catch (error) {
    console.error(error);
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
