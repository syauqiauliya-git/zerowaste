// src/middleware/errorHandler.js

/**
 * Sends a detailed error response in development environment.
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  };
  
  /**
   * Sends a minimal error response in production environment to avoid leaking internal details.
   */
  const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // Programming or other unknown error: don't leak error details
    } else {
      // 1) Log error to console for monitoring/debugging
      console.error('ERROR 💥', err);
  
      // 2) Send generic message
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  };
  
  /**
   * Global error handling middleware.
   * NOTE: Express recognizes this as an error handler by its four arguments.
   */
  const globalErrorHandler = (err, req, res, next) => {
    // Default status code and message for unhandled errors
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    if (process.env.NODE_ENV === 'development') {
      sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
      // Shallow copy the error object
      let error = { ...err, message: err.message };
  
      // Placeholder for future database-specific error handling (e.g., Mongoose errors)
  
      sendErrorProd(error, res);
    }
  };
  
  export default globalErrorHandler;