const User = require('../models/User');
const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isObjectIdString, escapeRegex } = require('../utils/helpers');
const { fileUrl } = require('../middleware/uploadMiddleware');

const PUBLIC_FIELDS = 'name username profileImage bio'; // safe fields for lists

// Profile URLs use usernames (/profile/anna) but the API also accepts ids.
const findUserByIdOrUsername = async (param) => {
  const user = isObjectIdString(param)
    ? await User.findById(param)
    : await User.findOne({ username: param.toLowerCase() });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

// GET /api/users/:id  (id or username)
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await findUserByIdOrUsername(req.params.id);
  const postsCount = await Post.countDocuments({ author: user._id });

  res.json({
    _id: user._id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
    postsCount,
    followersCount: user.followers.length,
    followingCount: user.following.length,
    isFollowing: user.followers.some((id) => id.equals(req.user._id)),
  });
});

// PUT /api/users/profile
// Sent as multipart/form-data (route: uploadAvatar.single('profileImage')) so a new
// picture can be uploaded at the same time as the text fields.
const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { name, username, bio, removeProfileImage } = req.body;

  if (name !== undefined) {
    if (name.trim().length < 2) throw new AppError('Name must be at least 2 characters', 400);
    user.name = name.trim();
  }

  if (username !== undefined) {
    const newUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(newUsername)) {
      throw new AppError('Username must be 3-20 characters: letters, numbers or underscores', 400);
    }
    if (newUsername !== user.username) {
      const taken = await User.findOne({ username: newUsername });
      if (taken) throw new AppError('That username is already taken', 409);
      user.username = newUsername;
    }
  }

  if (bio !== undefined) {
    if (bio.length > 160) throw new AppError('Bio cannot be longer than 160 characters', 400);
    user.bio = bio.trim();
  }

  // A newly uploaded file always wins; otherwise "removeProfileImage" clears the picture.
  if (req.file) {
    user.profileImage = fileUrl(req, 'avatars', req.file.filename);
  } else if (removeProfileImage === 'true') {
    user.profileImage = '';
  }

  await user.save();
  res.json({ user });
});

// GET /api/users/search?q=text  -> search by name or username
const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ users: [] });

  const regex = new RegExp(escapeRegex(q), 'i'); // case-insensitive "contains"
  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [{ name: regex }, { username: regex }],
  })
    .select(PUBLIC_FIELDS)
    .limit(20);

  res.json({ users });
});

// GET /api/users/suggestions -> random people the user does not follow yet
const getSuggestions = asyncHandler(async (req, res) => {
  const excluded = [req.user._id, ...req.user.following];
  const users = await User.aggregate([
    { $match: { _id: { $nin: excluded } } },
    { $sample: { size: 5 } },
    { $project: { name: 1, username: 1, profileImage: 1, bio: 1 } },
  ]);
  res.json({ users });
});

// POST /api/users/:id/follow
const followUser = asyncHandler(async (req, res) => {
  const me = req.user;
  const target = await User.findById(req.params.id);

  if (!target) throw new AppError('User not found', 404);
  if (target._id.equals(me._id)) throw new AppError('You cannot follow yourself', 400);

  // $addToSet never adds the same id twice, so double-clicking is harmless.
  await User.updateOne({ _id: me._id }, { $addToSet: { following: target._id } });
  const updatedTarget = await User.findByIdAndUpdate(
    target._id,
    { $addToSet: { followers: me._id } },
    { new: true }
  ).select('followers');
  const updatedMe = await User.findById(me._id).select('following');

  res.json({
    targetId: target._id,
    currentUserId: me._id,
    followersCount: updatedTarget.followers.length,
    followingCount: updatedMe.following.length,
  });
});

// DELETE /api/users/:id/follow
const unfollowUser = asyncHandler(async (req, res) => {
  const me = req.user;
  const target = await User.findById(req.params.id);

  if (!target) throw new AppError('User not found', 404);
  if (target._id.equals(me._id)) throw new AppError('You cannot unfollow yourself', 400);

  await User.updateOne({ _id: me._id }, { $pull: { following: target._id } });
  const updatedTarget = await User.findByIdAndUpdate(
    target._id,
    { $pull: { followers: me._id } },
    { new: true }
  ).select('followers');
  const updatedMe = await User.findById(me._id).select('following');

  res.json({
    targetId: target._id,
    currentUserId: me._id,
    followersCount: updatedTarget.followers.length,
    followingCount: updatedMe.following.length,
  });
});

// GET /api/users/:id/followers
const getFollowers = asyncHandler(async (req, res) => {
  const user = await findUserByIdOrUsername(req.params.id);
  await user.populate({ path: 'followers', select: PUBLIC_FIELDS });
  res.json({
    user: { _id: user._id, name: user.name, username: user.username },
    users: user.followers,
  });
});

// GET /api/users/:id/following
const getFollowing = asyncHandler(async (req, res) => {
  const user = await findUserByIdOrUsername(req.params.id);
  await user.populate({ path: 'following', select: PUBLIC_FIELDS });
  res.json({
    user: { _id: user._id, name: user.name, username: user.username },
    users: user.following,
  });
});

module.exports = {
  getUserProfile,
  updateProfile,
  searchUsers,
  getSuggestions,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
