// config/settings.js
import { config } from 'dotenv';
import logger from './logger.js';

// Load environment variables from .env file
config();

// Required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

/**
 * Application settings
 */
export const settings = {
  // Server settings
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // MongoDB settings
  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME || 'multilingual_faq_db',

  // JWT settings
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',

  // Redis settings
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: Number(process.env.REDIS_PORT) || 6379,
  redisPassword: process.env.REDIS_PASSWORD || '',

  // Rate limiting settings
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // Default: 15 minutes
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100, // Default: 100 requests per window

  // Logging settings
  logLevel: process.env.LOG_LEVEL || 'info',

  // External API settings (e.g., translation service)
  translationApiKey: process.env.TRANSLATION_API_KEY || '',
  translationApiUrl: process.env.TRANSLATION_API_URL || 'https://translation.googleapis.com/language/translate/v2',
};

// Log non-sensitive settings on startup
logger.info(`✅ Application settings loaded: 
  - Environment: ${settings.nodeEnv}
  - Server Port: ${settings.port}
  - MongoDB: ${settings.mongoDbName}
  - Redis: ${settings.redisHost}:${settings.redisPort}
  - Rate Limit: ${settings.rateLimitMax} requests/${settings.rateLimitWindowMs / 60000} min
  - Logging Level: ${settings.logLevel}
  - Translation API: ${settings.translationApiUrl}`
);
