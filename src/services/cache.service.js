import Redis from 'ioredis';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';  
import { FAQ } from '../models/faq.js';      

// Redis configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  db: 0, // Default Redis DB
  keyPrefix: 'faq:', // Prefix for FAQ-related keys
});

// Cache Service
export const cacheService = {
  /**
   * Get FAQ data from cache or fallback to MongoDB.
   * @param {string} faqId - FAQ identifier
   * @returns {Object} - FAQ data
   */
  async getFAQ(faqId) {
    try {
      // Check if FAQ data is in Redis cache
      const cacheData = await redis.get(faqId);
      if (cacheData) {
        logger.info(`Cache hit for FAQ ID: ${faqId}`);
        return JSON.parse(cacheData);  // Return cached data if available
      }

      logger.info(`Cache miss for FAQ ID: ${faqId}`);
      
      // Fallback to MongoDB if not in cache
      const faq = await FAQ.findById(faqId);
      if (!faq) {
        throw new Error('FAQ not found');
      }

      // Cache the result in Redis for subsequent requests (expire in 1 hour)
      await redis.setex(faqId, 3600, JSON.stringify(faq)); // Cache for 1 hour

      return faq;
    } catch (err) {
      logger.error(`Error fetching FAQ ID ${faqId}: ${err.message}`);
      throw err;
    }
  },

  /**
   * Set FAQ data in cache and MongoDB.
   * @param {Object} faqData - The FAQ data to save
   * @returns {Object} - The saved FAQ data
   */
  async setFAQ(faqData) {
    try {
      // Save FAQ to MongoDB
      const faq = new FAQ(faqData);
      await faq.save();

      // Cache the FAQ in Redis (expire in 1 hour)
      await redis.setex(faq._id.toString(), 3600, JSON.stringify(faq));

      logger.info(`FAQ data cached for ID: ${faq._id}`);
      return faq;
    } catch (err) {
      logger.error(`Error saving FAQ: ${err.message}`);
      throw err;
    }
  },

  /**
   * Delete FAQ from cache and MongoDB.
   * @param {string} faqId - FAQ identifier
   */
  async deleteFAQ(faqId) {
    try {
      // Delete from MongoDB
      await FAQ.findByIdAndDelete(faqId);

      // Remove from Redis cache
      await redis.del(faqId);

      logger.info(`FAQ data deleted for ID: ${faqId}`);
    } catch (err) {
      logger.error(`Error deleting FAQ ID ${faqId}: ${err.message}`);
      throw err;
    }
  },

  /**
   * Clear all FAQ cache (useful for cache invalidation).
   */
  async clearCache() {
    try {
      // Use Redis keys with the 'faq:' prefix to delete all FAQs from cache
      const keys = await redis.keys('faq:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info('All FAQ cache cleared.');
      } else {
        logger.info('No FAQ cache to clear.');
      }
    } catch (err) {
      logger.error(`Error clearing FAQ cache: ${err.message}`);
      throw err;
    }
  },
};
