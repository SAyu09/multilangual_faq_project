export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err); // Log the error for debugging

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined, 
  });
};