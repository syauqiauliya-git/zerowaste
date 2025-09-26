// src/utils/AppError.js

class AppError extends Error {
    /**
     * Creates an instance of a custom operational error.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code (e.g., 404, 400, 500).
     */
    constructor(message, statusCode) {
      // Calling parent constructor of Error class
      super(message);
  
      this.statusCode = statusCode;
      // Determine the status string ('fail' for 4xx, 'error' for 5xx)
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  
      // Mark as an operational error that we can safely send to the client
      this.isOperational = true;
  
      // Capture stack trace to pinpoint where the error occurred
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export default AppError;