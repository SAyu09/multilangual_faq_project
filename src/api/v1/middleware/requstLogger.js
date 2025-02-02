import { format } from 'winston';
import winston from 'winston';
import Log from '../models/Log.js';
import mongoose from 'mongoose';

// Create a custom format for logging (optional)
const customFormat = format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Set up Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    customFormat
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: 'logs/combined.log' }) // Log to a file
  ],
});

// Request logger middleware
export const requestLogger = async (req, res, next) => {
  const start = Date.now();

  // Proceed with request handling
  res.on('finish', async () => {
    const responseTime = Date.now() - start;

    // Log the request to the console (you can log more detailed info if needed)
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`);

    // Save the log to MongoDB
    try {
      await Log.create({
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        responseTime,
      });
    } catch (err) {
      logger.error('Error saving log to MongoDB: ' + err.message);
    }
  });

  // Continue processing the request
  next();
};
