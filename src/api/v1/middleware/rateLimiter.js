import { MongoClient } from 'mongodb';

// MongoDB setup (replace with your connection details)
const client = new MongoClient(process.env.MONGO_URI);  // Assuming .env is configured for MONGO_URI

const RATE_LIMIT_WINDOW = 60 * 1000;  // 1 minute window for rate limiting
const MAX_REQUESTS = 10;  // Max requests allowed in the window

/**
 * Rate limiter middleware
 * - Tracks requests in a MongoDB collection
 * - Rejects requests that exceed the rate limit
 */
export const rateLimiter = async (req, res, next) => {
  try {
    const db = client.db('rate_limit_db');  // Use appropriate DB name
    const collection = db.collection('requests');  // Store requests in a "requests" collection
    
    const userIp = req.ip;  // You can also use headers or user identifiers
    const now = Date.now();

    // Remove requests that are outside of the rate limit window
    await collection.deleteMany({
      timestamp: { $lt: now - RATE_LIMIT_WINDOW }
    });

    // Count the number of requests the user has made in the current window
    const requestCount = await collection.countDocuments({
      ip: userIp,
      timestamp: { $gte: now - RATE_LIMIT_WINDOW }
    });

    // If the user exceeds the max requests within the time window, deny the request
    if (requestCount >= MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.'
      });
    }

    // Otherwise, log the request (store the timestamp of the request)
    await collection.insertOne({
      ip: userIp,
      timestamp: now
    });

    next();  // Allow the request to continue

  } catch (error) {
    console.error('Error in rate limiter middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while applying rate limit.'
    });
  }
};
