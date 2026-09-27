// A small Error class that also carries an HTTP status code.
// Controllers do:  throw new AppError('User not found', 404)
// and the error middleware turns it into a clean JSON response.
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks it as a "safe to show" error
  }
}

module.exports = AppError;
