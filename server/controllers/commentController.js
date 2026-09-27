const Post = require('../models/Post');
const Comment = require('../models/Comment');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const AUTHOR_FIELDS = 'name username profileImage';

// GET /api/posts/:postId/comments  (oldest first, like a conversation)
const getComments = asyncHandler(async (req, res) => {
  const postExists = await Post.exists({ _id: req.params.postId });
  if (!postExists) throw new AppError('Post not found', 404);

  const comments = await Comment.find({ post: req.params.postId })
    .sort({ createdAt: 1 })
    .populate('author', AUTHOR_FIELDS)
    .lean();

  res.json({ comments });
});

// POST /api/posts/:postId/comments   body: { text }
const addComment = asyncHandler(async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) throw new AppError('Comment cannot be empty', 400);
  if (text.length > 500) throw new AppError('Comment cannot be longer than 500 characters', 400);

  const postExists = await Post.exists({ _id: req.params.postId });
  if (!postExists) throw new AppError('Post not found', 404);

  const comment = await Comment.create({ post: req.params.postId, author: req.user._id, text });
  await comment.populate('author', AUTHOR_FIELDS);

  res.status(201).json({ comment });
});

// DELETE /api/comments/:id  (only the comment's author)
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new AppError('Comment not found', 404);

  if (!comment.author.equals(req.user._id)) {
    throw new AppError('You can only delete your own comments', 403);
  }

  await comment.deleteOne();
  res.json({ commentId: comment._id, postId: comment.post });
});

module.exports = { getComments, addComment, deleteComment };
