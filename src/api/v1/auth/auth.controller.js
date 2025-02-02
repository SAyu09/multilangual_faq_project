import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../../../utils/tokenUtils.js';
import { sendEmail } from '../../../utils/emailUtils.js';

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password with a generated salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user instance
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    // Generate JWT tokens
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // Respond with success status and the access token
    return res.status(201).json({
      message: 'User registered successfully',
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate the provided password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Respond with success and the access token
    return res.status(200).json({
      message: 'User logged in successfully',
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const logoutUser = async (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken');

    // Respond with success
    return res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    // Verify the refresh token using the secret
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded?.userId) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generate a new access token
    const accessToken = generateAccessToken(decoded.userId);

    // Respond with the new access token
    return res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid refresh token', error: error.message });
  }
};

/**
 * @desc    Forgot password - Sends a password reset email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a password reset token valid for 1 hour
    const resetToken = jwt.sign({ userId: user._id }, process.env.RESET_TOKEN_SECRET, {
      expiresIn: '1h',
    });

    // Save the reset token to the user's document
    user.resetToken = resetToken;
    await user.save();

    // Construct the password reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Send the reset token via email
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });

    // Respond with success
    return res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the reset token using the secret
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);

    // Find the user by ID and matching reset token
    const user = await User.findOne({ _id: decoded.userId, resetToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password and remove the reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    await user.save();

    // Respond with success
    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
