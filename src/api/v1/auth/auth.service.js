import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User.js';
import { config } from '../../config/settings.js';
import { sendEmail } from '../../utils/email.js';
import { AppError } from '../../utils/errorHandler.js';

/**
 * Generate access and refresh tokens for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Object} - An object containing accessToken and refreshToken.
 */
const generateTokens = (userId) => {
  return {
    accessToken: jwt.sign({ id: userId }, config.jwt.accessTokenSecret, {
      expiresIn: config.jwt.accessTokenExpiry,
    }),
    refreshToken: jwt.sign({ id: userId }, config.jwt.refreshTokenSecret, {
      expiresIn: config.jwt.refreshTokenExpiry,
    }),
  };
};

/**
 * Save refresh token to the user's record in the database.
 * @param {string} userId - The ID of the user.
 * @param {string} refreshToken - The refresh token to save.
 */
const saveRefreshToken = async (userId, refreshToken) => {
  await User.findByIdAndUpdate(userId, { refreshToken }, { new: true });
};

/**
 * Hash a given password.
 * @param {string} password - The plain text password.
 * @returns {Promise<string>} - The hashed password.
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password with a hashed password.
 * @param {string} password - The plain text password.
 * @param {string} hashedPassword - The hashed password.
 * @returns {Promise<boolean>} - True if passwords match, false otherwise.
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Register a new user.
 * @param {Object} userData - User data containing email, password, and name.
 * @returns {Promise<Object>} - The created user, accessToken, and refreshToken.
 */
export const registerUser = async ({ email, password, name }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('User already exists', 400);

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ name, email, password: hashedPassword });

  const { accessToken, refreshToken } = generateTokens(user._id);
  await saveRefreshToken(user._id, refreshToken);

  return { user, accessToken, refreshToken };
};

/**
 * Authenticate a user and return tokens.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} - The authenticated user, accessToken, and refreshToken.
 */
export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  await saveRefreshToken(user._id, refreshToken);

  return { user, accessToken, refreshToken };
};

/**
 * Logout user by removing the refresh token.
 * @param {string} userId - The user's ID.
 */
export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

/**
 * Refresh an access token using a refresh token.
 * @param {string} refreshToken - The refresh token.
 * @returns {Promise<Object>} - A new accessToken.
 */
export const refreshAccessToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, config.jwt.refreshTokenSecret);

  const user = await User.findOne({ _id: decoded.id, refreshToken });
  if (!user) throw new AppError('Invalid refresh token', 401);

  return {
    accessToken: jwt.sign({ id: user._id }, config.jwt.accessTokenSecret, {
      expiresIn: config.jwt.accessTokenExpiry,
    }),
  };
};

/**
 * Send a password reset email to the user.
 * @param {string} email - The user's email.
 * @returns {Promise<Object>} - Success message.
 */
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('User not found', 404);

  const resetToken = jwt.sign({ id: user._id }, config.jwt.resetTokenSecret, {
    expiresIn: config.jwt.resetTokenExpiry,
  });

  user.resetPasswordToken = resetToken;
  await user.save();

  const resetUrl = `${config.app.clientUrl}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    text: `Click the link to reset your password: ${resetUrl}`,
  });

  return { message: 'Password reset email sent' };
};

/**
 * Reset user password.
 * @param {string} token - The password reset token.
 * @param {string} newPassword - The new password.
 * @returns {Promise<Object>} - Success message.
 */
export const resetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, config.jwt.resetTokenSecret);

  const user = await User.findOne({
    _id: decoded.id,
    resetPasswordToken: token,
  });
  if (!user) throw new AppError('Invalid or expired token', 401);

  user.password = await hashPassword(newPassword);
  user.resetPasswordToken = null;
  await user.save();

  return { message: 'Password reset successful' };
};
