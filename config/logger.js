// config/logger.js
import winston from 'winston';
import { NODE_ENV } from './settings.js'; // Import environment settings

const { combine, timestamp, printf, colorize, align, uncolorize } = winston.format;

// Define log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Define logger format based on environment
const loggerFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  align(),
  NODE_ENV === 'development' ? colorize() : uncolorize(),
  logFormat
);

// Create logger instance
export const logger = winston.createLogger({
  level: NODE_ENV === 'development' ? 'debug' : 'info',
  format: loggerFormat,
  transports: [
    new winston.transports.Console(),

    new winston.transports.File({
      filename: 'logs/app.log',
      level: 'info',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),

    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB file size limit
      maxFiles: 5, // Keep up to 5 error log files
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// Stream for HTTP request logging (e.g., with Morgan)
export const logStream = {
  write: (message) => logger.info(message.trim()),
};
