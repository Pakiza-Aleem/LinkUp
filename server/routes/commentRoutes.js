const express = require('express');
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Mounted at /api/posts/:postId/comments
const postCommentsRouter = express.Router({ mergeParams: true });
postCommentsRouter.get('/', protect, getComments);
postCommentsRouter.post('/', protect, addComment);

// Mounted at /api/comments
const commentRouter = express.Router();
commentRouter.delete('/:id', protect, deleteComment);

module.exports = { postCommentsRouter, commentRouter };
