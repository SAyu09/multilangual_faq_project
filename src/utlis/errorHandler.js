/**
 * Global Error Handler Middleware for Express.js
 * This will capture all errors and send consistent error responses.
 */

import { logger } from './logger.js'; // Importing a logger utility (can be customized)

export const errorHandler = (err, req, res, next) => {
  // Log the error details (can be customized as per your logging needs)
  logger.error({
    message: err.message || 'Internal Server Error',
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Set default status code
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types (custom errors)
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request for validation errors
    message = 'Invalid data provided';
  }

  if (err.name === 'CastError') {
    statusCode = 400; // Bad Request for invalid ObjectId
    message = 'Resource not found';
  }

  // For unauthorized access (e.g., JWT errors)
  if (err.name === 'UnauthorizedError') {
    statusCode = 401; // Unauthorized
    message = 'Invalid or missing authentication token';
  }

  // For rate-limiting errors
  if (err.message === 'Rate limit exceeded') {
    statusCode = 429; // Too Many Requests
    message = 'Too many requests, please try again later';
  }

  // Send consistent JSON response for errors
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'production' ? null : err.stack, // Stack trace shown only in development
  });
};
