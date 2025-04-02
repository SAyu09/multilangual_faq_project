import Joi from 'joi';

/**
 * Validation schema for user registration.
 */
export const validateRegistration = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .trim()
    .required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers.',
      'string.min': 'Username must be at least {#limit} characters long.',
      'string.max': 'Username cannot exceed {#limit} characters.',
      'string.empty': 'Username is required.',
      'any.required': 'Username is required.',
    }),

  email: Joi.string()
    .email()
    .trim()
    .required()
    .messages({
      'string.email': 'Enter a valid email address.',
      'string.empty': 'Email is required.',
      'any.required': 'Email is required.',
    }),

  password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$'))
    .required()
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.',
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match.',
      'string.empty': 'Confirm password is required.',
      'any.required': 'Confirm password is required.',
    }),
});

/**
 * Validation schema for user login.
 */
export const validateLogin = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .required()
    .messages({
      'string.email': 'Enter a valid email address.',
      'string.empty': 'Email is required.',
      'any.required': 'Email is required.',
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.',
    }),
});

/**
 * Validation schema for refreshing access tokens.
 */
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Refresh token is required.',
      'any.required': 'Refresh token is required.',
    }),
});

/**
 * Validation schema for resetting passwords.
 */
export const validateForgotPassword = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .required()
    .messages({
      'string.email': 'Enter a valid email address.',
      'string.empty': 'Email is required.',
      'any.required': 'Email is required.',
    }),
});

/**
 * Validation schema for updating passwords.
 */
export const validateResetPassword = Joi.object({
  oldPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Old password is required.',
      'any.required': 'Old password is required.',
    }),

  newPassword: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$'))
    .required()
    .messages({
      'string.pattern.base': 'New password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.',
      'string.empty': 'New password is required.',
      'any.required': 'New password is required.',
    }),

  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match.',
      'string.empty': 'Confirm new password is required.',
      'any.required': 'Confirm new password is required.',
    }),
});
