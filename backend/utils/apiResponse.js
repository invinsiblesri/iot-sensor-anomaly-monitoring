/**
 * Standardized API Response Formatter
 * Ensures predictable, structured JSON responses across all REST endpoints.
 */

/**
 * Format and send a successful HTTP response
 * @param {Object} res - Express response object
 * @param {Object|Array} data - Data payload to return
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Optional human-readable message
 * @param {Object} meta - Optional pagination or metadata
 */
const sendSuccess = (res, data = null, statusCode = 200, message = 'Success', meta = null) => {
  const response = {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString()
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Format and send an error HTTP response
 * @param {Object} res - Express response object
 * @param {string} message - Error description
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {Object|Array} errors - Optional field-level error details
 */
const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    statusCode,
    error: message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError
};
