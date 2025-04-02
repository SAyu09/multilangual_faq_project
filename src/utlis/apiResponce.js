 /**
 * Utility functions for standardized API responses.
 * 
 * @module utils/apiResponse
 */

/**
 * Generates a successful response format.
 * 
 * @param {object} data - The response data.
 * @param {string} message - The success message.
 * @param {number} statusCode - The HTTP status code (defaults to 200).
 * @returns {object} - The formatted response object.
 */
export const ApiResponse = (data = {}, message = "Request successful", statusCode = 200) => {
    return {
      status: "success",
      message,
      data,
      statusCode,
    };
  };
  
  /**
   * Generates an error response format.
   * 
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code (defaults to 400).
   * @param {object} error - The error details (optional).
   * @returns {object} - The formatted error response object.
   */
  export const errorResponse = (message = "An error occurred", statusCode = 400, error = null) => {
    return {
      status: "error",
      message,
      error,
      statusCode,
    };
  };
  
  /**
   * Generates a validation error response format.
   * 
   * @param {object} errors - Validation errors (usually in key-value format).
   * @param {number} statusCode - The HTTP status code (defaults to 422).
   * @returns {object} - The formatted validation error response object.
   */
  export const validationErrorResponse = (errors, statusCode = 422) => {
    return {
      status: "error",
      message: "Validation failed",
      errors,
      statusCode,
    };
  };
  
  /**
   * Generates a not found error response format.
   * 
   * @param {string} message - The error message (defaults to "Resource not found").
   * @param {number} statusCode - The HTTP status code (defaults to 404).
   * @returns {object} - The formatted not found error response object.
   */
  export const notFoundResponse = (message = "Resource not found", statusCode = 404) => {
    return {
      status: "error",
      message,
      statusCode,
    };
  };
  
  /**
   * Generates a server error response format.
   * 
   * @param {string} message - The error message (defaults to "Internal server error").
   * @param {number} statusCode - The HTTP status code (defaults to 500).
   * @returns {object} - The formatted server error response object.
   */
  export const serverErrorResponse = (message = "Internal server error", statusCode = 500) => {
    return {
      status: "error",
      message,
      statusCode,
    };
  };
  