const express = require('express');
const {
  createPost,
  getFeed,
  getExplorePosts,
  getUserPosts,
  getPost,
  deletePost,
  likePost,
  unlikePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { uploadPostImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', uploadPostImages.array('images', 5), createPost);
router.get('/feed', getFeed);
router.get('/explore', getExplorePosts);
router.get('/user/:userId', getUserPosts);

router.get('/:id', getPost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.delete('/:id/like', unlikePost);

module.exports = router;
