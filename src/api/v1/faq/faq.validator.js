import { body, param, validationResult } from 'express-validator';

/**
 * @desc    Validation rules for creating an FAQ
 * @returns {Array} - Array of validation rules
 */
export const validateCreateFAQ = [
  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question is required')
    .isLength({ max: 500 })
    .withMessage('Question must be less than 500 characters'),

  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required')
    .isLength({ max: 2000 })
    .withMessage('Answer must be less than 2000 characters'),

  body('language')
    .trim()
    .notEmpty()
    .withMessage('Language is required')
    .isLength({ max: 50 })
    .withMessage('Language must be less than 50 characters'),
];

/**
 * @desc    Validation rules for updating an FAQ
 * @returns {Array} - Array of validation rules
 */
export const validateUpdateFAQ = [
  param('id')
    .notEmpty()
    .withMessage('FAQ ID is required')
    .isMongoId()
    .withMessage('Invalid FAQ ID'),

  body('question')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Question cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Question must be less than 500 characters'),

  body('answer')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Answer cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Answer must be less than 2000 characters'),

  body('language')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Language cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Language must be less than 50 characters'),
];

/**
 * @desc    Middleware to handle validation errors
 * @param   {Object} req - Request object
 * @param   {Object} res - Response object
 * @param   {Function} next - Next middleware function
 * @returns {Object} - JSON response with validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }

  next();
};