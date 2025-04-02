import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // To hash passwords before saving
import validator from 'validator'; // To validate email format

// Define the User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [50, 'Username cannot be longer than 50 characters'],
      unique: true, // Ensure uniqueness for username
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      validate: [validator.isEmail, 'Please enter a valid email address'], // Email validation
      unique: true, // Ensure uniqueness for email
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'], // Allow only specific roles
      default: 'user', // Default role is 'user'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'], // Example status options
      default: 'active', // Default status is 'active'
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Pre-save hook to hash the password before saving to the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash the password if it's modified or new

  // Hash the password with 10 rounds of salting
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare provided password with the stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
