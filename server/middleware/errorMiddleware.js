const AppError = require('../utils/AppError');

// Runs when no route matched the request.
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// One central place that turns any error into a safe JSON response.
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message;

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join('. ');
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    message = `That ${field} is already taken`;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body is not valid JSON';
  } else if (err.name === 'MulterError') {
    status = 400;
    if (err.code === 'LIMIT_FILE_SIZE') message = 'That image is too large';
    else if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') message = 'Too many images';
    else message = 'The file could not be uploaded';
  } else if (!(err instanceof AppError)) {
    // Unknown error: log the details on the server, but never send them to the client.
    console.error(err);
    status = 500;
    message = 'Something went wrong on the server';
  }

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
