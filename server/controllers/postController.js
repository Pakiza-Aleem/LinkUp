const Post = require('../models/Post');
const Comment = require('../models/Comment');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { fileUrl } = require('../middleware/uploadMiddleware');

const AUTHOR_FIELDS = 'name username profileImage';
const PAGE_SIZE = 10;
const MAX_IMAGES = 5;

// We do not store a comment counter on the post (that would duplicate data).
// Instead we count comments for the posts we are about to send.
const addCommentCounts = async (posts) => {
  if (posts.length === 0) return posts;

  const counts = await Comment.aggregate([
    { $match: { post: { $in: posts.map((p) => p._id) } } },
    { $group: { _id: '$post', count: { $sum: 1 } } },
  ]);
  const countByPost = new Map(counts.map((c) => [c._id.toString(), c.count]));

  return posts.map((post) => ({ ...post, commentsCount: countByPost.get(post._id.toString()) || 0 }));
};

// Runs a paginated query and returns { posts, page, hasMore }.
// We ask for one extra post: if it exists, there is another page.
const getPage = async (filter, req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const found = await Post.find(filter)
    .sort({ createdAt: -1 }) // newest first
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE + 1)
    .populate('author', AUTHOR_FIELDS)
    .lean();

  const hasMore = found.length > PAGE_SIZE;
  const posts = await addCommentCounts(found.slice(0, PAGE_SIZE));
  return { posts, page, hasMore };
};

// POST /api/posts
// Sent as multipart/form-data (route: uploadPostImages.array('images', 5)) so the
// text content and up to 5 image files arrive together.
const createPost = asyncHandler(async (req, res) => {
  const content = (req.body.content || '').trim();
  const files = req.files || [];
  const images = files.map((file) => fileUrl(req, 'posts', file.filename));

  if (!content && images.length === 0) throw new AppError('Write something or add a photo first', 400);
  if (content.length > 1000) throw new AppError('Post cannot be longer than 1000 characters', 400);
  if (images.length > MAX_IMAGES) throw new AppError(`You can add up to ${MAX_IMAGES} images`, 400);

  const post = await Post.create({ author: req.user._id, content, images });
  await post.populate('author', AUTHOR_FIELDS);

  res.status(201).json({ ...post.toObject(), commentsCount: 0 });
});

// GET /api/posts/feed -> my posts + posts from people I follow.
// A brand-new account follows nobody, so on page 1 we fall back to recent posts
// from everyone (marked as "suggested") instead of showing an empty feed.
const getFeed = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const hasFollows = req.user.following.length > 0;
  const filter = hasFollows ? { author: { $in: [req.user._id, ...req.user.following] } } : {};

  const result = await getPage(filter, req);
  result.suggested = page === 1 && !hasFollows;
  res.json(result);
});

// GET /api/posts/explore -> recent posts from everyone
const getExplorePosts = asyncHandler(async (req, res) => {
  res.json(await getPage({}, req));
});

// GET /api/posts/user/:userId -> posts written by one user
const getUserPosts = asyncHandler(async (req, res) => {
  res.json(await getPage({ author: req.params.userId }, req));
});

// GET /api/posts/:id
const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', AUTHOR_FIELDS).lean();
  if (!post) throw new AppError('Post not found', 404);
  const [withCount] = await addCommentCounts([post]);
  res.json(withCount);
});

// DELETE /api/posts/:id  (only the author)
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);

  // Authorization check: the backend decides, not the frontend.
  if (!post.author.equals(req.user._id)) {
    throw new AppError('You can only delete your own posts', 403);
  }

  await Comment.deleteMany({ post: post._id }); // remove its comments too
  await post.deleteOne();
  res.json({ postId: post._id });
});

// POST /api/posts/:id/like
const likePost = asyncHandler(async (req, res) => {
  // $addToSet guarantees a user can like a post only once.
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  ).select('likes');
  if (!post) throw new AppError('Post not found', 404);
  res.json({ postId: post._id, likes: post.likes });
});

// DELETE /api/posts/:id/like
const unlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true }
  ).select('likes');
  if (!post) throw new AppError('Post not found', 404);
  res.json({ postId: post._id, likes: post.likes });
});

module.exports = { createPost, getFeed, getExplorePosts, getUserPosts, getPost, deletePost, likePost, unlikePost };
