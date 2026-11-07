/**
 * Safe Centralized Error Handling Middleware
 * Prevents leaking stack traces, environment details, or internal server paths in production.
 */
export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';
  const statusCode = err.statusCode || err.status || 500;

  // Log full error internally for debugging
  console.error(`[Error] ${req.method} ${req.path} -> status ${statusCode}:`, err.message);
  if (isDev && err.stack) {
    console.error(err.stack);
  }

  // Safe client response
  res.status(statusCode).json({
    error: err.name || 'ServerError',
    message: statusCode === 500 && !isDev 
      ? 'An unexpected internal server error occurred. Please try again later.'
      : err.message,
    ...(isDev ? { stack: err.stack } : {})
  });
}

/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'NotFound',
    message: `API endpoint '${req.method} ${req.originalUrl}' does not exist.`
  });
}
