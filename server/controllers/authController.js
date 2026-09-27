const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken, isValidEmail } = require('../utils/helpers');
const { fileUrl } = require('../middleware/uploadMiddleware');

// POST /api/auth/register
// Sent as multipart/form-data so an optional avatar file can travel with it
// (route: uploadAvatar.single('profileImage'), see authRoutes.js).
const register = asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim();
  const username = (req.body.username || '').trim().toLowerCase();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const profileImage = req.file ? fileUrl(req, 'avatars', req.file.filename) : '';

  // 1. Validate the input
  if (!name || !username || !email || !password) {
    throw new AppError('Name, username, email and password are required', 400);
  }
  if (name.length < 2) throw new AppError('Name must be at least 2 characters', 400);
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    throw new AppError('Username must be 3-20 characters: letters, numbers or underscores', 400);
  }
  if (!isValidEmail(email)) throw new AppError('Please enter a valid email address', 400);
  if (password.length < 6) throw new AppError('Password must be at least 6 characters', 400);

  // 2. Make sure email and username are unique
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    if (existing.email === email) throw new AppError('An account with this email already exists', 409);
    throw new AppError('That username is already taken', 409);
  }

  // 3. Create the user (the password is hashed in the User model)
  const user = await User.create({ name, username, email, password, profileImage });

  res.status(201).json({ token: generateToken(user._id), user });
});

// POST /api/auth/login   body: { identifier, password }  (identifier = email or username)
const login = asyncHandler(async (req, res) => {
  const identifier = (req.body.identifier || req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!identifier || !password) {
    throw new AppError('Please enter your email or username and your password', 400);
  }

  // The password field is hidden by default, so we ask for it explicitly.
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select('+password');

  // Same message for "no user" and "wrong password" so attackers learn nothing.
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email/username or password', 401);
  }

  res.json({ token: generateToken(user._id), user });
});

// GET /api/auth/me  -> the currently logged-in user
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, getMe };
