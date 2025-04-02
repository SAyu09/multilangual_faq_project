import jwt from 'jsonwebtoken';
import { asyncHandler } from "../../../utlis/acyncHandler.js";
import { ApiError } from '../../../utlis/apiError.js';
import {User} from '../../../models/User.js';

/**
 * @desc    Middleware to verify JWT token and attach user to request object
 * @throws  {ApiError} - If token is missing, invalid, or user is not found
 */
export const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication token is missing or malformed');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new ApiError(401, 'User not found or token invalid');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});

/**
 * @desc    Middleware to check if the authenticated user has an admin role
 * @throws  {ApiError} - If user is not an admin
 */
export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Access denied. Admin privileges required');
  }
  next();
});
