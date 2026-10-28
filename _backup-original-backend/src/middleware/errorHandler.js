function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error.';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((item) => item.message).join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID.';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with this value already exists.';
  } else if (err instanceof SyntaxError && Object.prototype.hasOwnProperty.call(err, 'body')) {
    statusCode = 400;
    message = 'Invalid JSON body.';
  }

  const response = { success: false, message };
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) response.stack = err.stack;
  res.status(statusCode).json(response);
}

module.exports = errorHandler;
