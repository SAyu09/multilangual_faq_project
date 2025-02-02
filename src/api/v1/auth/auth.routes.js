import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
} from './auth.controller.js';
import {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from './auth.validator.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', validateRegistration, registerUser);

router.post('/login', validateLogin, loginUser);

router.post('/logout', authMiddleware, logoutUser);

router.post('/refresh-token', refreshAccessToken);

router.post('/forgot-password', validateForgotPassword, forgotPassword);

router.post('/reset-password', validateResetPassword, resetPassword);

export const authRoutes = router;
