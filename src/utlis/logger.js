import winston from 'winston';

// Define custom formats for logging
const logFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
  return `${timestamp} ${level}: ${message} ${
    Object.keys(meta).length ? `\nMeta: ${JSON.stringify(meta, null, 2)}` : ''
  }`;
});

// Create the logger instance
export const logger = winston.createLogger({
  level: 'info',  // Default log level
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),  // Include error stack in logs
    winston.format.splat(),  // Supports string interpolation
    logFormat
  ),
  transports: [
    // Console log transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colorize console output
        winston.format.simple()
      ),
    }),
    // File log transport
    new winston.transports.File({
      filename: 'logs/app.log',
      level: 'info', // Log all levels info and above to file
    }),
    // Error logs file transport (only logs error level logs)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error', // Log only error level logs to the error file
    })
  ]
});

// Optional: To log errors as well in MongoDB (requires additional setup for MongoDB transport)
// If needed, uncomment the following code and set up MongoDB transport
// import { MongoDB } from 'winston-mongodb';
// transports.push(
//   new MongoDB({
//     db: 'mongodb://localhost:27017/your-db-name',
//     collection: 'logs',
//     level: 'info', // Log info and above in MongoDB
//     options: { useUnifiedTopology: true },
//   })
// );

// Example log message
logger.info('Logger initialized and ready to log messages');
