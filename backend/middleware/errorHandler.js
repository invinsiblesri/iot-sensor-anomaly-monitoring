/**
 * Central Error Handling Middleware
 * Converts application and database errors into standard semantic HTTP responses.
 */

const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error: Invalid input parameters';
    errors = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }

  // Handle Mongoose Cast Error (e.g. malformed ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for parameter '${err.path}': ${err.value}`;
  }

  // Handle Mongo Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyPattern || {})[0] || 'field';
    const duplicatedValue = err.keyValue ? err.keyValue[duplicatedField] : '';
    message = `Duplicate Conflict: Record with ${duplicatedField} '${duplicatedValue}' already exists.`;
  }

  // Handle JSON Syntax Error in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload received in request body.';
  }

  // Handle MongoDB Connection Timeout / Unavailable
  if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
    statusCode = 503;
    message = 'Database Service Unavailable: Connection to MongoDB timed out. Please verify MongoDB cluster status.';
  }

  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error('[UNHANDLED SERVER ERROR]', err);
  }

  return sendError(res, message, statusCode, errors);
};

module.exports = errorHandler;
