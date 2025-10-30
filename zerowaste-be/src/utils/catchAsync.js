/**
 * HOF (Higher-Order Function) to wrap async Express route handlers.
 * It catches any errors (including Mongoose validation errors) and passes them 
 * to the global error handler middleware via the 'next' function.
 */
const catchAsync = fn => {
    return (req, res, next) => {
      // .catch(next) is shorthand for .catch(err => next(err))
      fn(req, res, next).catch(next);
    };
  };
  
  export default catchAsync;