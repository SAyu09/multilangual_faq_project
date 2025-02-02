export const asyncHandler = (fn) => {
    return (req, res, next) => {
      // Run the async function and pass any errors to the next middleware (error handler)
      fn(req, res, next).catch(next);
    };
  };