import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../api/v1/models/User.js';

// Secret key for JWT signing (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Function to register a new user
export const registerUser = async (userData) => {
  const { name, email, password } = userData;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    // Save the new user to the database
    await newUser.save();

    // Return the user (excluding the password)
    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to log in a user
export const loginUser = async (email, password) => {
  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare the entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Return the token and user info
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to verify a JWT token
export const verifyToken = (token) => {
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Function to get a user by ID (for user info after login)
export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
