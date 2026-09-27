// Wraps an async controller so any thrown error is passed to Express's
// error middleware. This saves us from writing try/catch in every controller.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
