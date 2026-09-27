const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Protects a route: the request must contain "Authorization: Bearer <token>".
// On success the logged-in user is available as req.user.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Not authorized, please log in', 401);
  }

  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError('Your session is invalid or has expired, please log in again', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('This account no longer exists', 401);

  req.user = user;
  next();
});

module.exports = { protect };
