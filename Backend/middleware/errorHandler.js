// This middleware catches errors from async handlers or next(err)
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params
  });

  const statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    message = 'Validation failed: ' + err.message;
  } else if (err.code === 'ECONNREFUSED') {
    message = 'Database connection failed';
  } else if (err.code === '23505') { // PostgreSQL unique violation
    message = 'Duplicate entry detected';
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
