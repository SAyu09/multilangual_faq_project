import Joi from 'joi';

/**
 * Validate if the provided email is valid
 * @param {string} email - Email address to validate
 * @returns {Joi.ValidationResult} - Joi validation result
 */
export const validateEmail = (email) => {
  const emailSchema = Joi.string().email().required();
  return emailSchema.validate(email);
};

/**
 * Validate if the provided password meets the complexity requirements
 * @param {string} password - Password to validate
 * @returns {Joi.ValidationResult} - Joi validation result
 */
export const validatePassword = (password) => {
  const passwordSchema = Joi.string()
    .min(8) // Minimum length of 8 characters
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')) // Only alphanumeric characters allowed
    .required();
  return passwordSchema.validate(password);
};

/**
 * Validate if a string is a non-empty valid name
 * @param {string} name - Name to validate
 * @returns {Joi.ValidationResult} - Joi validation result
 */
export const validateName = (name) => {
  const nameSchema = Joi.string().min(3).max(30).required();
  return nameSchema.validate(name);
};

/**
 * Validate if a number is a valid positive integer
 * @param {number} number - Number to validate
 * @returns {Joi.ValidationResult} - Joi validation result
 */
export const validateNumber = (number) => {
  const numberSchema = Joi.number().integer().positive().required();
  return numberSchema.validate(number);
};

/**
 * Validate if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {Joi.ValidationResult} - Joi validation result
 */
export const validateUrl = (url) => {
  const urlSchema = Joi.string().uri().required();
  return urlSchema.validate(url);
};

/**
 * Validate if a request body is valid (based on given Joi schema)
 * @param {object} data - Data to validate
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @returns {Joi.ValidationResult} - Joi validation result
 */
export const validateBody = (data, schema) => {
  return schema.validate(data);
};

/**
 * Example schema for validating a user registration form
 * @param {object} data - Data to validate (e.g., { name, email, password })
 * @returns {Joi.ValidationResult} - Joi validation result
 */
export const validateUserRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });
  return validateBody(data, schema);
};

/**
 * Example schema for validating user login
 * @param {object} data - Data to validate (e.g., { email, password })
 * @returns {Joi.ValidationResult} - Joi validation result
 */
export const validateUserLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });
  return validateBody(data, schema);
};
